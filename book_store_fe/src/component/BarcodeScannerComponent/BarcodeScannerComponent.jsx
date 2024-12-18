import React, { useState, useEffect, useRef } from 'react';
import Webcam from 'react-webcam';
import { Stomp } from '@stomp/stompjs';
import SockJS from 'sockjs-client';
import { toast } from 'react-toastify';

const BarcodeScanner = ({ orderId, onSuccess }) => {
    const [stompClient, setStompClient] = useState(null);
    const webcamRef = useRef(null);

    useEffect(() => {
        let client = null;
        const connect = async () => {
            const sockJSFactory = () => new SockJS('http://localhost:8080/stream-barcode');
            client = Stomp.over(sockJSFactory);
            client.debug = () => {};
            client.connect(
                {},
                () => onConnected(client),
                () => console.log('Failed to connect to WebSocket server!'),
            );
        };
        connect();
        setStompClient(client);
        return () => {
            if (stompClient) {
                stompClient.disconnect();
            }
        };
    }, []);

    const onConnected = async (client) => {
        client.subscribe(`/stream/barcode`, onMessageReceived);
    };

    const onMessageReceived = async (payload) => {
        const jsonPayload = JSON.parse(payload.body);
        console.log('Received barcode result:', jsonPayload);
        if (jsonPayload) {
            if(jsonPayload.error){
                toast.error(jsonPayload.value);
                return;
            }else {
                toast.success(jsonPayload.value);
                onSuccess();
            }
        }
    };

    const sendBarcodeImage = () => {
        const imageSrc = webcamRef.current.getScreenshot();

        if (imageSrc && stompClient && stompClient.connected) {
            const img = new Image();
            img.src = imageSrc;

            img.onload = () => {
                const canvas = document.createElement('canvas');
                const ctx = canvas.getContext('2d');

                const maxWidth = 300;
                const scale = maxWidth / img.width;
                const newWidth = maxWidth;
                const newHeight = img.height * scale;

                canvas.width = newWidth;
                canvas.height = newHeight;
                ctx.drawImage(img, 0, 0, newWidth, newHeight);

                const resizedBase64Image = canvas.toDataURL('image/jpeg', 0.7);
                const base64Image = resizedBase64Image.split(',')[1];

                const data = { base64Image: base64Image, orderId: orderId };
                stompClient.send('/app/barcode', {}, JSON.stringify(data));
            };
        }
    };

    useEffect(() => {
        const interval = setInterval(() => {
            sendBarcodeImage();
        }, 2000);

        return () => clearInterval(interval);
    }, [stompClient]);

    return (
        <Webcam
            audio={false}
            ref={webcamRef}
            screenshotQuality={0.5}
            screenshotFormat="image/jpeg"
            width="100%"
            videoConstraints={{
                facingMode: 'environment',
            }}
            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
        />
    );
};

export default BarcodeScanner;
