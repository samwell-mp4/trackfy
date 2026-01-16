import React from 'react';
import { motion } from 'framer-motion';
import './LoadingScreen.css';

export const LoadingScreen: React.FC = () => {
    return (
        <div className="loading-screen">
            <motion.div
                className="loading-logo-container"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5, ease: "easeOut" }}
            >
                <motion.img
                    src="/logo-dark.jpg"
                    alt="Trackfy"
                    className="loading-logo"
                    animate={{
                        filter: ["brightness(1)", "brightness(1.2)", "brightness(1)"]
                    }}
                    transition={{
                        duration: 2,
                        repeat: Infinity,
                        ease: "easeInOut"
                    }}
                />
                <div className="loading-bar-container">
                    <motion.div
                        className="loading-bar"
                        initial={{ width: "0%" }}
                        animate={{ width: "100%" }}
                        transition={{
                            duration: 1.5,
                            repeat: Infinity,
                            ease: "easeInOut"
                        }}
                    />
                </div>
            </motion.div>
        </div>
    );
};
