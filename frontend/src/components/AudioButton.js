import React from "react";
import { Button } from "react-bootstrap";
import { Play } from "react-bootstrap-icons";

function AudioButton(props) {
    const audio = props.srcAudioElement;
    const pauseOtherAudio = () => {
        window.globalAudioObjects.map((globalAudioElement) => {
            if (globalAudioElement !== audio) {
                globalAudioElement.pause();
            }
        });
    };
    const handlePlay = () => {
        pauseOtherAudio();
        if (audio.paused) {
            try {
                audio.play();
            } catch (err) {
                console.log(err);
            }
        } else {
            audio.pause();
        }
    };

    return (
        <div>
            <Play 
                className="playButton"
                size={ 60 }
                onClick={ handlePlay }
            ></Play>
        </div>
    );
}

export default AudioButton;
