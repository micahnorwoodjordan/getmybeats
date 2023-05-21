import React from "react";

import useSound from 'use-sound';
import { useState } from "react";
import { Button } from "react-bootstrap";


function AudioButton (audioSrc) {
    const [soundActive, setSoundActive] = useState(false);
    const [play, { stop }] = useSound(
        audioSrc,
        { volume: 1.0 }
    );
  return (
      <Button
          onClick={() => {
              if (soundActive) {
                  stop();
                  setSoundActive(false);
              } else {
                  play();
                  setSoundActive(true);
              }
              console.log(soundActive);
          }}
      >
      </Button>
  )
}

export default AudioButton;