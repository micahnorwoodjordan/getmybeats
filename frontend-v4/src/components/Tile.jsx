import "./css/Tile.css";
import { Play, PlayFill } from "react-bootstrap-icons";


const Tile = ({ track }) => {
    const { title, producer, id, artwork } = track;
    return (
        <div
            className="tile-container"
            key={ id }
            style={{ backgroundImage: `url(${artwork})` }}
        >
            <h2>{ title }</h2>
            <h2>{ producer }</h2>
            <Play className="play-icon"/>
        </div>
    )
};

export default Tile;