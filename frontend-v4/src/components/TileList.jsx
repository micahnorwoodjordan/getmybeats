import "./css/TileList.css";
import Tile from "./Tile";


const TileList = ({ tracks }) => (
    <div className="tile-list">
        { tracks.map((track) => {
            return <Tile
                track={ track }
                key={ track.id }  // passing key so compiler shuts up
            />
        })}
    </div>
);

export default TileList;