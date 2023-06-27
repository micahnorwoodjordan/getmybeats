import React, { useState, useEffect, useRef } from 'react';

import AudioControls from './Controller';
import Backdrop from './Backdrop';


const Player = ({ tracks }) => {
    const windowBackgroundColor = require("randomcolor");
    
    // state
    const [trackIndex, setTrackIndex] = useState(0);
    const [trackProgress, setTrackProgress] = useState(0);
    const [isPlaying, setIsPlaying] = useState(false);
    const { title, artist, image, audioElement } = tracks[trackIndex];

    // references
    const audioRef = useRef(audioElement);
    const intervalRef = useRef();
    const isReady = useRef(false);
	const { duration } = audioRef.current;

    // slider styling
    const currentPercentage = duration ? `${(trackProgress / duration) * 100}%` : '0%';
    const trackStyling = `-webkit-gradient(linear, 0% 0%, 100% 0%, color-stop(${currentPercentage}, #fff), color-stop(${currentPercentage}, #777))`;
    console.log(isPlaying, isReady, trackIndex);

    // helpers
    const startTimer = () => {
        clearInterval(intervalRef.current);
        intervalRef.current = setInterval(() => {
            if (audioRef.current.ended) {
                    toNextTrack();
            } else {
                    setTrackProgress(audioRef.current.currentTime);
            }
        }, [1000]);
    }

    const onScrub = (value) => {
        clearInterval(intervalRef.current);  // Clear any timers already running
        audioRef.current.currentTime = value;
        setTrackProgress(audioRef.current.currentTime);
    }
    
    const onScrubEnd = () => {
      if (!isPlaying) {
        setIsPlaying(true);
      }
      startTimer();
    }

    // hooks
    useEffect(() => {
        if (isPlaying) {
            audioRef.current.play();
            startTimer();
        } else {
            audioRef.current.pause();
        }
    }, [isPlaying]);

    useEffect(() => {
        audioRef.current.pause();
        audioRef.current = audioElement;
        setTrackProgress(audioRef.current.currentTime);
        
        if (isReady.current) {
            audioRef.current.play();
            setIsPlaying(true);
            startTimer();
        } else {
            isReady.current = true;
        }
    }, [trackIndex]);

    useEffect(() => {
        return () => {  // Pause and clean up on unmount
            audioRef.current.pause();
            clearInterval(intervalRef.current);
        }
    }, []);

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
                <input
                    type="range" value={ trackProgress } step="1"  min="0" max={ duration ? duration : `${ duration }` } style={ { background: trackStyling } }
                    className="progress" onChange={ (e) => onScrub(e.target.value) } onMouseUp={ onScrubEnd } onKeyUp={ onScrubEnd }
                />
            </div>
            <Backdrop
                trackIndex={ trackIndex }
                activeColor={ windowBackgroundColor }
                isPlaying={ isPlaying }
            />
        </div>
    );
}

export default Player;