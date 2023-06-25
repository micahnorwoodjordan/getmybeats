import React, { useState, useEffect, useRef } from 'react';
import AudioControls from './Controller';

const Player = ({ tracks }) => {
    // state
    const [trackIndex, setTrackIndex] = useState(0);
    const [trackProgress, setTrackProgress] = useState(0);
    const [isPlaying, setIsPlaying] = useState(false);
    const { title, artist, color, image, audioElement } = tracks[trackIndex];
    // references
    const audioRef = useRef(audioElement);
    const intervalRef = useRef();
    const isReady = useRef(false);
	const { duration } = audioRef.current;
    console.log(isReady, isPlaying)

    // hooks
    useEffect(() => {
        if (isPlaying) {
            audioRef.current.play();
        } else {
            audioRef.current.pause();
        }
    }, [isPlaying]);

    useEffect(() => {
        return () => {  // Pause and clean up on unmount
            audioRef.current.pause();
            clearInterval(intervalRef.current);
        }
    }, []);

    useEffect(() => {
        audioRef.current.pause();
        audioRef.current = audioElement;
        setTrackProgress(audioRef.current.currentTime);
        
        if (isReady.current) {
            audioRef.current.play();
            setIsPlaying(true);
            // startTimer();
        } else {
            isReady.current = true;  // Set the isReady ref as true for the next pass
        }
    }, [trackIndex]);


    // traversal methods
    const toPrevTrack = () => {
        if (trackIndex - 1 < 0) {
            setTrackIndex(tracks.length - 1);
        } else {
            setTrackIndex(trackIndex - 1);
        }
    }
      
    const toNextTrack = () => {
        if (trackIndex < tracks.length - 1) {
            setTrackIndex(trackIndex + 1);
        } else {
            setTrackIndex(0);
        }
    }

    return (
        <div className="audio-player">
            <div className="track-info">
                <img className="artwork" src={ image } alt={`track artwork for ${ title } by ${ artist }`}/>
                <h2 className="title">{ title }</h2>
                <h3 className="artist">{ artist }</h3>
                <AudioControls
                    isPlaying={ isPlaying }
                    onPrevClick={ toPrevTrack }
                    onNextClick={ toNextTrack }
                    onPlayPauseClick={ setIsPlaying }
                />
            </div>
        </div>
    );
}

export default Player;