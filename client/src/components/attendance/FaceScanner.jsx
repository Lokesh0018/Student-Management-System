import React, { useState, useRef, useEffect, forwardRef, useImperativeHandle } from 'react';
import * as faceapi from '@vladmandic/face-api';
import toast from 'react-hot-toast';
import api from '../../utils/api';

const FaceScanner = forwardRef(({ classId, date, onStudentRecognized, controls }, ref) => {
    const [isModelsLoaded, setIsModelsLoaded] = useState(false);
    const [isCameraActive, setIsCameraActive] = useState(false);
    const [faceMatcher, setFaceMatcher] = useState(null);
    const [scannerState, setScannerState] = useState({ status: 'Idle', studentName: null, distance: null });
    const [labeledFaces, setLabeledFaces] = useState([]);
    
    const videoRef = useRef(null);
    const canvasRef = useRef(null);
    const scanLoopRef = useRef(null);
    const streamRef = useRef(null);
    
    // Refs for latest props and state to avoid stale closures in requestAnimationFrame
    const latestProps = useRef({ onStudentRecognized, faceMatcher, labeledFaces });
    useEffect(() => {
        latestProps.current = { onStudentRecognized, faceMatcher, labeledFaces };
    }, [onStudentRecognized, faceMatcher, labeledFaces]);

    const isCameraActiveRef = useRef(isCameraActive);
    useEffect(() => {
        isCameraActiveRef.current = isCameraActive;
    }, [isCameraActive]);
    
    // Configurable thresholds
    const FACE_MATCH_DISTANCE_THRESHOLD = 0.68; // Increased from 0.60 to account for WebGL float precision differences across different browsers/devices
    const REQUIRED_CONSECUTIVE_FRAMES = 3;
    const matchCounts = useRef({});

    useEffect(() => {
        const loadModels = async () => {
            try {
                const MODEL_URL = 'https://cdn.jsdelivr.net/npm/@vladmandic/face-api/model/';
                await Promise.all([
                    faceapi.nets.ssdMobilenetv1.loadFromUri(MODEL_URL),
                    faceapi.nets.faceLandmark68Net.loadFromUri(MODEL_URL),
                    faceapi.nets.faceRecognitionNet.loadFromUri(MODEL_URL)
                ]);
                setIsModelsLoaded(true);
            } catch (err) {
                console.error("Error loading models:", err);
                toast.error("Failed to load face recognition models");
            }
        };
        loadModels();
        
        return () => {
            stopCamera();
        };
    }, []);

    useEffect(() => {
        const fetchClassFaces = async () => {
            if (!classId) return;
            try {
                const res = await api.get(`/faces/class/${classId}`);
                if (res.data.success && res.data.data.length > 0) {
                    const labeledDescriptors = res.data.data.map(student => {
                        return new faceapi.LabeledFaceDescriptors(
                            String(student.student_id), // Label as string ID
                            [new Float32Array(student.descriptor)] // Descriptor array
                        );
                    });
                    
                    setLabeledFaces(res.data.data);
                    
                    if (labeledDescriptors.length > 0) {
                        const matcher = new faceapi.FaceMatcher(labeledDescriptors, FACE_MATCH_DISTANCE_THRESHOLD);
                        setFaceMatcher(matcher);
                    }
                }
            } catch (err) {
                console.error("Error fetching class faces:", err);
            }
        };
        fetchClassFaces();
    }, [classId]);

    const startCamera = async () => {
        if (!faceMatcher) {
            toast.error("No registered faces found for this class.");
            return;
        }
        
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ 
                video: { width: { ideal: 1280 }, height: { ideal: 720 }, facingMode: "user" } 
            });
            streamRef.current = stream;
            setIsCameraActive(true);
            setScannerState({ status: 'Camera active. Scanning...', studentName: null, distance: null });
            
            setTimeout(() => {
                if (videoRef.current) {
                    videoRef.current.srcObject = stream;
                    videoRef.current.onloadedmetadata = () => {
                        scanLoopRef.current = requestAnimationFrame(scanLoop);
                    };
                }
            }, 100);
        } catch (err) {
            console.error("Camera access error:", err);
            toast.error("Camera access denied or unavailable");
            setScannerState({ status: 'Camera Error', studentName: null, distance: null });
        }
    };

    const stopCamera = () => {
        if (scanLoopRef.current) {
            cancelAnimationFrame(scanLoopRef.current);
        }
        
        if (streamRef.current) {
            const tracks = streamRef.current.getTracks();
            tracks.forEach(track => track.stop());
            streamRef.current = null;
        }
        
        if (videoRef.current) {
            videoRef.current.srcObject = null;
        }
        
        if (canvasRef.current) {
            const ctx = canvasRef.current.getContext('2d');
            ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
        }
        
        setIsCameraActive(false);
        setScannerState({ status: 'Idle', studentName: null, distance: null });
        matchCounts.current = {}; // Reset counts
    };

    useImperativeHandle(ref, () => ({
        stopCamera
    }));

    const scanLoop = async () => {
        if (!videoRef.current || videoRef.current.paused || videoRef.current.ended) {
            return;
        }

        try {
            const detections = await faceapi.detectAllFaces(videoRef.current)
                .withFaceLandmarks()
                .withFaceDescriptors();

            if (canvasRef.current) {
                const displaySize = { 
                    width: videoRef.current.videoWidth, 
                    height: videoRef.current.videoHeight 
                };
                
                // Ensure canvas size matches video size
                if (canvasRef.current.width !== displaySize.width) {
                    faceapi.matchDimensions(canvasRef.current, displaySize);
                }
                
                const resizedDetections = faceapi.resizeResults(detections, displaySize);
                
                // Clear previous drawings
                const ctx = canvasRef.current.getContext('2d');
                ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);

                if (detections.length === 0) {
                    setScannerState({ status: 'Scanning... No face detected', studentName: null, distance: null });
                    matchCounts.current = {}; // Reset if no one is in frame
                } else {
                    const { faceMatcher: currentMatcher, labeledFaces: currentLabeled, onStudentRecognized: currentOnRecognized } = latestProps.current;
                    
                    if (!currentMatcher) return;

                    const results = resizedDetections.map(d => currentMatcher.findBestMatch(d.descriptor));
                    
                    results.forEach((result, i) => {
                        const box = resizedDetections[i].detection.box;
                        const studentDetails = currentLabeled.find(s => String(s.student_id) === result.label);
                        const displayName = studentDetails ? `${studentDetails.first_name} ${studentDetails.last_name}` : result.label;
                        
                        const boxLabel = result.label === 'unknown' ? `Unknown (${result.distance.toFixed(2)})` : `${displayName} (${result.distance.toFixed(2)})`;
                        const drawBox = new faceapi.draw.DrawBox(box, { label: boxLabel });
                        drawBox.draw(canvasRef.current);
                        
                        if (result.label !== 'unknown') {
                            const studentId = result.label;
                            const distance = result.distance.toFixed(2);
                            setScannerState({ status: 'Recognized', studentName: displayName, distance: distance });
                            
                            // Increment consecutive match count
                            matchCounts.current[studentId] = (matchCounts.current[studentId] || 0) + 1;
                            
                            if (matchCounts.current[studentId] >= REQUIRED_CONSECUTIVE_FRAMES) {
                                setScannerState({ status: 'Verified! Marking attendance...', studentName: displayName, distance: distance });
                                
                                if (studentDetails && currentOnRecognized) {
                                    currentOnRecognized(studentDetails);
                                    // Reset count so it doesn't spam
                                    matchCounts.current[studentId] = -100; // Delay before re-detecting
                                }
                            }
                        } else {
                            setScannerState({ status: 'Unknown face detected', studentName: null, distance: result.distance.toFixed(2) });
                        }
                    });
                }
            }
        } catch (error) {
            console.error("Scanning error:", error);
        }

        // Continue the loop
        if (isCameraActiveRef.current) {
            scanLoopRef.current = requestAnimationFrame(scanLoop);
        }
    };

    return (
        <div style={{ width: '100%' }}>
            {!isModelsLoaded ? (
                <div className="alert-banner">Loading Face Recognition Models...</div>
            ) : (
                <div style={{ 
                    display: 'flex', 
                    flexWrap: 'wrap',
                    gap: '20px', 
                    padding: '20px', 
                    backgroundColor: 'var(--surface)', 
                    borderRadius: '16px', 
                    border: '1px solid var(--border)',
                    width: '100%',
                    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05)'
                }}>
                    
                    {/* Left Column - Camera */}
                    <div style={{ flex: '1 1 60%', minWidth: '320px', display: 'flex', flexDirection: 'column' }}>
                        {isCameraActive ? (
                            <div style={{ 
                                position: 'relative', 
                                width: '100%', 
                                aspectRatio: '16/9',
                                backgroundColor: '#000', 
                                borderRadius: '12px', 
                                overflow: 'hidden',
                                boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)'
                            }}>
                                <video 
                                    ref={videoRef} 
                                    autoPlay 
                                    muted 
                                    playsInline 
                                    style={{ width: '100%', height: '100%', display: 'block', transform: 'scaleX(-1)' }}
                                />
                                <canvas 
                                    ref={canvasRef} 
                                    style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', transform: 'scaleX(-1)' }}
                                />
                            </div>
                        ) : (
                            <div style={{ 
                                width: '100%', 
                                aspectRatio: '16/9',
                                backgroundColor: 'var(--bg)', 
                                borderRadius: '12px', 
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                border: '2px dashed var(--border)'
                            }}>
                                <p style={{ color: 'var(--text-secondary)', fontWeight: '500' }}>Camera is off. Click "Start Face Scanner" to begin.</p>
                            </div>
                        )}
                    </div>

                    {/* Right Column - Controls */}
                    <div style={{ flex: '1 1 35%', minWidth: '280px', display: 'flex', flexDirection: 'column' }}>
                        
                        {/* Status Panel */}
                        <div style={{ 
                            backgroundColor: '#f0f9ff', 
                            padding: '16px', 
                            borderRadius: '12px',
                            border: '1px solid #bae6fd',
                            marginBottom: '20px'
                        }}>
                            <h4 style={{ margin: '0 0 12px 0', color: '#0284c7', fontSize: '0.9rem', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Scanner Status</h4>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                <div style={{ color: '#0369a1', fontWeight: '600', fontSize: '1rem' }}>
                                    {scannerState.status}
                                </div>
                                {scannerState.studentName && (
                                    <div style={{ color: '#0369a1', fontWeight: '600', fontSize: '0.95rem' }}>
                                        Student: {scannerState.studentName}
                                    </div>
                                )}
                                {scannerState.distance && (
                                    <div style={{ color: '#0369a1', fontWeight: '500', fontSize: '0.9rem' }}>
                                        Distance: {scannerState.distance}
                                    </div>
                                )}
                            </div>
                        </div>
                        
                        {/* Passed Controls (Class/Date Selectors) */}
                        <div style={{ marginBottom: '20px' }}>
                            {controls}
                        </div>
                        
                        {/* Start/Stop Button */}
                        <div style={{ marginTop: 'auto', paddingTop: '16px' }}>
                            {!isCameraActive ? (
                                <button type="button" className="btn-primary" onClick={startCamera} style={{ width: '100%', padding: '12px', fontSize: '1rem', borderRadius: '8px' }}>
                                    Start Face Scanner
                                </button>
                            ) : (
                                <button type="button" className="btn-secondary" onClick={stopCamera} style={{ width: '100%', padding: '12px', fontSize: '1rem', borderRadius: '8px', border: '1px solid var(--border)', backgroundColor: 'var(--bg)', color: 'var(--text-primary)' }}>
                                    Stop Scanner
                                </button>
                            )}
                        </div>
                        
                    </div>
                </div>
            )}
        </div>
    );
});

export default FaceScanner;
