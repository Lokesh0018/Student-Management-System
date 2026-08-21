import React, { useState, useRef, useEffect } from 'react';
import * as faceapi from '@vladmandic/face-api';
import toast from 'react-hot-toast';
import api from '../../utils/api';

const FaceRegistration = ({ studentId }) => {
    const [isModelsLoaded, setIsModelsLoaded] = useState(false);
    const [isCameraActive, setIsCameraActive] = useState(false);
    const [isRegistering, setIsRegistering] = useState(false);
    const videoRef = useRef(null);
    const streamRef = useRef(null);

    useEffect(() => {
        const loadModels = async () => {
            try {
                // Using jsdelivr CDN for face-api models via npm
                const MODEL_URL = 'https://cdn.jsdelivr.net/npm/@vladmandic/face-api/model/';
                await Promise.all([
                    faceapi.nets.ssdMobilenetv1.loadFromUri(MODEL_URL),
                    faceapi.nets.faceLandmark68Net.loadFromUri(MODEL_URL),
                    faceapi.nets.faceRecognitionNet.loadFromUri(MODEL_URL)
                ]);
                setIsModelsLoaded(true);
            } catch (err) {
                console.error("Error loading face models:", err);
                toast.error("Failed to load face recognition models");
            }
        };
        loadModels();
        
        return () => {
            stopCamera();
        };
    }, []);

    const startCamera = async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ 
                video: { width: { ideal: 1280 }, height: { ideal: 720 }, facingMode: "user" } 
            });
            streamRef.current = stream;
            setIsCameraActive(true);
            
            // Wait for react to render the video element
            setTimeout(() => {
                if (videoRef.current) {
                    videoRef.current.srcObject = stream;
                }
            }, 100);
        } catch (err) {
            console.error("Camera access error:", err);
            toast.error("Camera access denied or unavailable");
        }
    };

    const stopCamera = () => {
        if (streamRef.current) {
            const tracks = streamRef.current.getTracks();
            tracks.forEach(track => track.stop());
            streamRef.current = null;
        }
        if (videoRef.current) {
            videoRef.current.srcObject = null;
        }
        setIsCameraActive(false);
    };

    const captureAndRegister = async () => {
        if (!videoRef.current || !isModelsLoaded) return;
        setIsRegistering(true);
        
        try {
            toast.loading("Capturing multiple angles... Please look at the camera and turn slightly.", { id: 'capture-toast' });
            
            const descriptors = [];
            
            // Capture 5 frames over 2 seconds
            for (let i = 0; i < 5; i++) {
                const detection = await faceapi.detectSingleFace(videoRef.current)
                    .withFaceLandmarks()
                    .withFaceDescriptor();
                
                if (detection) {
                    descriptors.push(detection.descriptor);
                }
                
                if (i < 4) await new Promise(r => setTimeout(r, 400));
            }

            if (descriptors.length === 0) {
                toast.error("No face detected. Please ensure your face is clearly visible.", { id: 'capture-toast' });
                setIsRegistering(false);
                return;
            }

            // Average the descriptors for a much more robust baseline
            const averagedDescriptor = new Float32Array(128);
            for (let i = 0; i < 128; i++) {
                let sum = 0;
                for (let j = 0; j < descriptors.length; j++) {
                    sum += descriptors[j][i];
                }
                averagedDescriptor[i] = sum / descriptors.length;
            }

            const descriptorArray = Array.from(averagedDescriptor);

            const res = await api.post('/faces/register', {
                studentId,
                descriptor: descriptorArray
            });

            if (res.data.success) {
                toast.success(`Face registered successfully using ${descriptors.length} samples!`, { id: 'capture-toast' });
                stopCamera();
            }
        } catch (err) {
            console.error("Face registration error:", err);
            toast.error("Failed to register face.", { id: 'capture-toast' });
        } finally {
            setIsRegistering(false);
        }
    };

    return (
        <div className="form-section photo-upload-section mt-4" style={{ marginTop: '24px' }}>
            <h3 className="form-section-title">Face Recognition (Optional)</h3>
            <div className="form-group full-width">
                {!isModelsLoaded ? (
                    <p style={{ color: 'var(--text-secondary)' }}>Loading AI Models...</p>
                ) : (
                    <>
                        <div style={{ display: 'flex', gap: '10px', marginBottom: '16px' }}>
                            {!isCameraActive ? (
                                <button type="button" className="btn-secondary" onClick={startCamera}>
                                    Start Camera
                                </button>
                            ) : (
                                <button type="button" className="btn-secondary" onClick={stopCamera}>
                                    Stop Camera
                                </button>
                            )}
                        </div>

                        {isCameraActive && (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', alignItems: 'center' }}>
                                <div style={{ 
                                    width: '100%', 
                                    maxWidth: '400px', 
                                    borderRadius: '12px', 
                                    overflow: 'hidden',
                                    border: '2px solid var(--border)',
                                    backgroundColor: '#000'
                                }}>
                                    <video 
                                        ref={videoRef} 
                                        autoPlay 
                                        muted 
                                        playsInline 
                                        style={{ width: '100%', display: 'block' }} 
                                    />
                                </div>
                                <button 
                                    type="button" 
                                    className="btn-primary" 
                                    onClick={captureAndRegister}
                                    disabled={isRegistering}
                                    style={{ width: '100%', maxWidth: '400px' }}
                                >
                                    {isRegistering ? 'Processing...' : 'Capture & Register Face'}
                                </button>
                            </div>
                        )}
                    </>
                )}
            </div>
        </div>
    );
};

export default FaceRegistration;
