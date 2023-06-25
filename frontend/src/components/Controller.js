import { ArrowLeftShort, ArrowRightShort, Play, Pause  } from "react-bootstrap-icons";

const AudioControls = ({ isPlaying, onPlayPauseClick, onPrevClick, onNextClick }) => (
    <div className="audio-controls">
        <button type="button" className="prev" aria-label="Previous" onClick={ onPrevClick }>
            <ArrowLeftShort />
        </button>
        {
        isPlaying ? (
            <button type="button" className="pause" onClick={ () => onPlayPauseClick(false) } aria-label="Pause">
                <Pause />
            </button>
        ) : (
            <button type="button" className="play" onClick={ () => onPlayPauseClick(true) } aria-label="Play">
                <Play />
            </button>
        )}
        <button type="button" className="next" aria-label="Next" onClick={ onNextClick }>
            <ArrowRightShort />
        </button>
    </div>

  )
  
  export default AudioControls;