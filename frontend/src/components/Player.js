import React, { useState, useEffect, useRef } from 'react';
import AudioControls from './Controller';

const Player = ({ tracks }) => {
    // state
    const [trackIndex, setTrackIndex] = useState(0);
    const [trackProgress, setTrackProgress] = useState(0);
    const [isPlaying, setIsPlaying] = useState(false);
    const { title, artist, color, image, audioSrc } = tracks[trackIndex];

    // references
    const audioRef = useRef(new Audio(audioSrc));
    const intervalRef = useRef();
    const isReady = useRef(false);
	const { duration } = audioRef.current;

    // handlers
    const toPrevTrack = () => {
        console.log('TODO go to prev');
      }
    
      const toNextTrack = () => {
        console.log('TODO go to next');
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