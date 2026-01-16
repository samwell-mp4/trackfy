
import React, { createContext, useContext, useState } from 'react';

interface Track {
    id: string;
    url: string;
    title: string;
    artist: string;
    coverUrl?: string;
}

interface AudioPlayerContextType {
    currentTrack: Track | null;
    isPlaying: boolean;
    isMinimized: boolean;
    volume: number;
    playTrack: (track: Track) => void;
    togglePlay: () => void;
    setIsMinimized: (minimized: boolean) => void;
    setVolume: (volume: number) => void;
    closePlayer: () => void;
}

const AudioPlayerContext = createContext<AudioPlayerContextType | undefined>(undefined);

export const AudioPlayerProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [currentTrack, setCurrentTrack] = useState<Track | null>(null);
    const [isPlaying, setIsPlaying] = useState(false);
    const [isMinimized, setIsMinimized] = useState(false);
    const [volume, setVolume] = useState(1);

    const playTrack = (track: Track) => {
        setCurrentTrack(track);
        setIsPlaying(true);
        setIsMinimized(false);
    };

    const togglePlay = () => {
        setIsPlaying(prev => !prev);
    };

    const closePlayer = () => {
        setCurrentTrack(null);
        setIsPlaying(false);
    };

    return (
        <AudioPlayerContext.Provider value={{
            currentTrack,
            isPlaying,
            isMinimized,
            volume,
            playTrack,
            togglePlay,
            setIsMinimized,
            setVolume,
            closePlayer
        }}>
            {children}
        </AudioPlayerContext.Provider>
    );
};

export const useAudioPlayer = () => {
    const context = useContext(AudioPlayerContext);
    if (!context) {
        throw new Error('useAudioPlayer must be used within a AudioPlayerProvider');
    }
    return context;
};
