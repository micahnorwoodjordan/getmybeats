import React from "react";
import {Button} from "react-bootstrap";


function AudioButton (props) {
    const audio = props.audioElement;

    const handlePlay = () => {
        if (audio.paused) {
            try {
                audio.play();
            } catch (err) {
                console.log(err);
            }
        } else {
            audio.pause();
        }
    }

  return (
      <Button onClick={handlePlay}></Button>
  )
}

export default AudioButton;