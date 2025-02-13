import React, { useState, useEffect, useRef } from 'react';
import { getAllMessages } from '../services/allAPI';
import { socket } from '../App';

const ChatScreen = ({ selectedUser, onMessageSent }) => {
    const [messages, setMessages] = useState([]);
    const currentUser = JSON.parse(sessionStorage.getItem("user"));
    const messagesEndRef = useRef(null);

    useEffect(() => {
        if (selectedUser) getMessages();
    }, [selectedUser, onMessageSent]);

    useEffect(() => {
        socket.on("receive", (newMessage) => {
            if (newMessage.senderId === selectedUser._id || newMessage.recieverId === selectedUser._id) {
                newMessage.createdAt = Date.now()
                setMessages((prev) => [...prev, newMessage]); 
            }
        });

        return () => socket.off("receive"); 
    }, [selectedUser]);


    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const getMessages = async () => {
        try {
            const reqBody = {
                senderId: currentUser._id,
                recieverId: selectedUser._id, 
            };
            const result = await getAllMessages(reqBody);
            if (result.status === 200) {
                setMessages(result.data);
            } else {
                setMessages([]);
            }
        } catch (error) {
            console.log(error);
        }
    };

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    const formatTime = (timestamp) => {
        const date = new Date(timestamp);
        return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    };

    return (
        <div className="flex-1 overflow-y-auto bg-gray-200 p-4 rounded-lg">
            {messages.length > 0 ? (
                messages.map((msg, index) => {
                    const isSender = msg.senderId === currentUser._id;
                    return (
                        <div key={index} className={`flex mt-4 flex-col ${isSender ? 'items-end' : 'items-start'}`}>
                            <span className="text-xs text-gray-600 mb-1">
                                {isSender ? 'You' : selectedUser.username} 
                            </span>
                            <div className={`p-3 max-w-[60%] rounded-lg text-sm shadow-md 
                                ${isSender ? 'bg-blue-500 text-xl text-white rounded-br-none' : 'bg-gray-300 text-xl text-black rounded-bl-none'}`}>
                                {msg.message}
                            </div>
                            <span className="text-xs text-gray-500 mt-1">
                                {formatTime(msg.createdAt)} 
                            </span>
                        </div>
                    );
                })
            ) : (
                <p className="text-gray-500">Start your conversation...</p>
            )}
            <div ref={messagesEndRef}></div>
        </div>
    );
};

export default ChatScreen;
