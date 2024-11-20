import React, { useState, useEffect, useRef } from 'react';
import Webcam from 'react-webcam';
import { Stomp } from '@stomp/stompjs';
import SockJS from 'sockjs-client';
import { toast } from 'react-toastify';

const BarcodeScanner = ({ orderId, onSuccess}) => {
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
        if(jsonPayload === true) {
            toast.success('Thêm sản phẩm thành công!');
            onSuccess();
        }
    };

    const sendBarcodeImage = () => {
        const imageSrc = webcamRef.current.getScreenshot();
        
        if (imageSrc && stompClient && stompClient.connected) {
            const base64Image = imageSrc.split(',')[1];
            const data = {base64Image: base64Image, orderId: orderId};
            stompClient.send('/app/barcode', {}, JSON.stringify(data));
        
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
