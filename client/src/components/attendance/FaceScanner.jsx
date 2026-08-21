import React, { useState, useRef, useEffect } from 'react';
import * as faceapi from '@vladmandic/face-api';
import toast from 'react-hot-toast';
import api from '../../utils/api';

const FaceScanner = ({ classId, date, onStudentRecognized }) => {
    const [isModelsLoaded, setIsModelsLoaded] = useState(false);
    const [isCameraActive, setIsCameraActive] = useState(false);
    const [faceMatcher, setFaceMatcher] = useState(null);
    const [statusText, setStatusText] = useState('Idle');
    const [labeledFaces, setLabeledFaces] = useState([]);
    
    const videoRef = useRef(null);
    const canvasRef = useRef(null);
    const scanLoopRef = useRef(null);
    const streamRef = useRef(null);
    
    // Configurable thresholds
    const FACE_MATCH_DISTANCE_THRESHOLD = 0.60;
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
            setStatusText('Camera active. Scanning...');
            
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
            setStatusText('Camera Error');
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
        setStatusText('Idle');
        matchCounts.current = {}; // Reset counts
    };

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
                    setStatusText('Scanning... No face detected');
                    matchCounts.current = {}; // Reset if no one is in frame
                } else {
                    const results = resizedDetections.map(d => faceMatcher.findBestMatch(d.descriptor));
                    
                    results.forEach((result, i) => {
                        const box = resizedDetections[i].detection.box;
                        const drawBox = new faceapi.draw.DrawBox(box, { label: result.toString() });
                        drawBox.draw(canvasRef.current);
                        
                        if (result.label !== 'unknown') {
                            const studentId = result.label;
                            const distance = result.distance.toFixed(2);
                            setStatusText(`Possible match: ID ${studentId} (dist: ${distance})`);
                            
                            // Increment consecutive match count
                            matchCounts.current[studentId] = (matchCounts.current[studentId] || 0) + 1;
                            
                            if (matchCounts.current[studentId] >= REQUIRED_CONSECUTIVE_FRAMES) {
                                setStatusText(`Verified! Marking attendance...`);
                                
                                // Find student details for callback
                                const studentDetails = labeledFaces.find(s => String(s.student_id) === studentId);
                                
                                if (studentDetails) {
                                    onStudentRecognized(studentDetails);
                                    // Reset count so it doesn't spam
                                    matchCounts.current[studentId] = -100; // Delay before re-detecting
                                }
                            }
                        } else {
                            setStatusText(`Unknown face detected (dist: ${result.distance.toFixed(2)})`);
                        }
                    });
                }
            }
        } catch (error) {
            console.error("Scanning error:", error);
        }

        // Continue the loop
        if (isCameraActive) {
            scanLoopRef.current = requestAnimationFrame(scanLoop);
        }
    };

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', alignItems: 'center' }}>
            {!isModelsLoaded ? (
                <div className="alert-banner">Loading Face Recognition Models...</div>
            ) : (
                <>
                    <div style={{ marginBottom: '16px', fontWeight: 'bold' }}>
                        Status: <span style={{ color: 'var(--primary)' }}>{statusText}</span>
                    </div>
                    
                    <div style={{ display: 'flex', gap: '10px' }}>
                        {!isCameraActive ? (
                            <button type="button" className="btn-primary" onClick={startCamera}>
                                Start Scanner
                            </button>
                        ) : (
                            <button type="button" className="btn-secondary" onClick={stopCamera}>
                                Stop Scanner
                            </button>
                        )}
                    </div>
                    
                    {isCameraActive && (
                        <div style={{ position: 'relative', width: '100%', maxWidth: '640px', backgroundColor: '#000', borderRadius: '12px', overflow: 'hidden' }}>
                            <video 
                                ref={videoRef} 
                                autoPlay 
                                muted 
                                playsInline 
                                style={{ width: '100%', display: 'block' }}
                            />
                            <canvas 
                                ref={canvasRef} 
                                style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%' }}
                            />
                        </div>
                    )}
                </>
            )}
        </div>
    );
};

export default FaceScanner;
