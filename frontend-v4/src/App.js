import { useState, useEffect } from 'react';

import './App.css';
import SearchBox from './components/SearchBox';
import TileList from './components/TileList';
import img from "./sky.png";


const App = () => {
  const [searchText, setSearchText] = useState('');
  const [tracks, setTracks]  = useState([]);
  const [filteredTracks, setFilteredTracks] = useState(tracks);

  const onSearchChange = (event) => {
    const searchTextString = event.target.value.toLocaleLowerCase();
    setSearchText(searchTextString);
  }

  useEffect(() => {
    setTracks(
      [
        {"title": "corportate", "producer": "me", "id": 1, "artwork": img},
        {"title": "there it goes", "producer": "me", "id": 2, "artwork": img},
        {"title": "nintendo dreams", "producer": "me", "id": 3, "artwork": img},
        {"title": "intro to everything", "producer": "me", "id": 4, "artwork": img},
        {"title": "johnny", "producer": "me", "id": 5, "artwork": img},
        {"title": "mental", "producer": "me", "id": 6, "artwork": img},
        {"title": "jb type beat", "producer": "me", "id": 7, "artwork": img},
        {"title": "princess peach", "producer": "me", "id": 8, "artwork": img},
        {"title": "seen", "producer": "me", "id": 9, "artwork": img},
        {"title": "felt", "producer": "me", "id": 10, "artwork": img},
        {"title": "needme", "producer": "me", "id": 11, "artwork": img},
        {"title": "long nights", "producer": "me", "id": 12, "artwork": img},
        {"title": "jan22_23", "producer": "me", "id": 13, "artwork": img},
        {"title": "indubitably", "producer": "me", "id": 14, "artwork": img},
        {"title": "i messed up", "producer": "me", "id": 15, "artwork": img},
        {"title": "evolve", "producer": "me", "id": 16, "artwork": img},
        {"title": "30 mins", "producer": "me", "id": 17, "artwork": img}
      ]
    )
    // only runs when the dependency value (an empty array in this case) changes
    // force execution by returning an array of objects from api call
    // fetch('https://jsonplaceholder.typicode.com/users')
    //   .then((response) => response.json())
    //   .then((songs) => setTracks(songs));
  }, []);

  useEffect(() => {
    const newFilteredTracks = tracks.filter((track) => {
      return track.title.toLocaleLowerCase().includes(searchText);
    });
    setFilteredTracks(newFilteredTracks);
  }, [tracks, searchText]);

  return (
    <div className='App'>
      <h6 className='app-title'>getmybeats</h6>
      <div className='content-container'>
        <SearchBox
            className="track-search-box"
            placeholder="search songs"
            onChangeHandler={ onSearchChange }
        />
        <TileList tracks={ filteredTracks }/>
      </div>
    </div>
  );
}

export default App;
