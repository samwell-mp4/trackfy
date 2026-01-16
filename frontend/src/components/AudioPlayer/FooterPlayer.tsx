
import React, { useEffect, useRef, useState } from 'react';
import { useAudioPlayer } from '../../contexts/AudioPlayerContext';
import './FooterPlayer.css';

export const FooterPlayer: React.FC = () => {
    const { currentTrack, isPlaying, isMinimized, togglePlay, setIsMinimized, closePlayer, volume, setVolume } = useAudioPlayer();
    const audioRef = useRef<HTMLAudioElement>(null);
    const [currentTime, setCurrentTime] = useState(0);
    const [duration, setDuration] = useState(0);

    useEffect(() => {
        if (audioRef.current) {
            if (isPlaying) {
                audioRef.current.play().catch(e => console.error("Play error:", e));
            } else {
                audioRef.current.pause();
            }
        }
    }, [isPlaying, currentTrack]); // Update play state when track changes

    useEffect(() => {
        if (audioRef.current) {
            audioRef.current.volume = volume;
        }
    }, [volume]);

    if (!currentTrack) return null;

    const handleTimeUpdate = () => {
        if (audioRef.current) {
            setCurrentTime(audioRef.current.currentTime);
            setDuration(audioRef.current.duration || 0);
        }
    };

    const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
        const time = parseFloat(e.target.value);
        if (audioRef.current) {
            audioRef.current.currentTime = time;
            setCurrentTime(time);
        }
    };

    const formatTime = (time: number) => {
        if (isNaN(time)) return "0:00";
        const minutes = Math.floor(time / 60);
        const seconds = Math.floor(time % 60);
        return `${minutes}:${seconds.toString().padStart(2, '0')}`;
    };

    if (isMinimized) {
        return (
            <div className="footer-player minimized" onClick={() => setIsMinimized(false)}>
                <div className="minimized-content">
                    <img src={currentTrack.coverUrl || 'https://via.placeholder.com/40'} alt="cover" className="fp-cover" style={{ width: 32, height: 32 }} />
                    {isPlaying ? (
                        <div className="music-bars-animation">🎵</div> // Placeholder for animation
                    ) : (
                        <span>▶️</span>
                    )}
                </div>
            </div>
        );
    }

    return (
        <div className="footer-player">
            <audio
                ref={audioRef}
                src={currentTrack.url}
                onTimeUpdate={handleTimeUpdate}
                onEnded={() => togglePlay()} // Or next track
                onLoadedMetadata={(e) => setDuration(e.currentTarget.duration)}
            />

            <div className="player-content">
                {/* Track Info */}
                <div className="fp-track-info">
                    <img src={currentTrack.coverUrl || 'https://via.placeholder.com/48'} alt="Cover" className="fp-cover" />
                    <div className="fp-details">
                        <span className="fp-title">{currentTrack.title}</span>
                        <span className="fp-artist">{currentTrack.artist}</span>
                    </div>
                </div>

                {/* Controls */}
                <div className="fp-controls-section">
                    <div className="fp-controls">
                        <button className="fp-btn">⏮️</button>
                        <button className="fp-btn fp-play-btn" onClick={togglePlay}>
                            {isPlaying ? '⏸️' : '▶️'}
                        </button>
                        <button className="fp-btn">⏭️</button>
                    </div>
                    <div className="fp-progress-bar">
                        <span>{formatTime(currentTime)}</span>
                        <input
                            type="range"
                            min="0"
                            max={duration || 0}
                            value={currentTime}
                            onChange={handleSeek}
                            className="fp-slider"
                        />
                        <span>{formatTime(duration)}</span>
                    </div>
                </div>

                {/* Volume & Actions */}
                <div className="fp-volume-section">
                    <div className="fp-volume-controls">
                        <span>🔊</span>
                        <input
                            type="range"
                            min="0"
                            max="1"
                            step="0.01"
                            value={volume}
                            onChange={(e) => setVolume(parseFloat(e.target.value))}
                            style={{ width: '80px' }}
                        />
                    </div>
                    <button className="fp-minimize-btn" onClick={() => setIsMinimized(true)} title="Minimizar">
                        ⏬
                    </button>
                    <button className="fp-minimize-btn" onClick={closePlayer} title="Fechar">
                        ❌
                    </button>
                </div>
            </div>
        </div>
    );
};
