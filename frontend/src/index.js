import React from "react";
import ReactDOM from "react-dom/client";
import path from "path";

import "./index.css";
import megatron from "./public/static/megatron.jpeg"
import Player from "./components/Player";

let tracks = [];
Array.from(document.getElementsByTagName("audio")).map((audioElement) => {
  tracks.push(
    {
      "title": path.basename(audioElement.src).replace(/\.(mp3|wav)$/, ""),
      "artist": "me",
      "color": "green",
      "image": megatron,  // don't forget to handle this. should each song have art associated?
      "audioElement": audioElement
    }
  );
})

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <Player tracks={ tracks } />
  </React.StrictMode>
)
