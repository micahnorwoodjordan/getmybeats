import { useState, useEffect } from 'react';
import path from "path";

import './App.css';
import SearchBox from './components/SearchBox';
import TileList from './components/TileList';


const App = () => {
  const [searchText, setSearchText] = useState('');
  const [tracks, setTracks]  = useState([]);
  const [filteredTracks, setFilteredTracks] = useState(tracks);

  const onSearchChange = (event) => {
    const searchTextString = event.target.value.toLocaleLowerCase();
    setSearchText(searchTextString);
  }
  let songs = [];
  Array.from(document.getElementsByTagName("audio")).map((audioElement, idx) => {
    songs.push(
      {
        "title": path.basename(audioElement.src).replace(/\.(mp3|wav)$/, ""),
        "producer": "me",
        "artwork": document.getElementById(`image${audioElement.id}`).src,  // string interpolation corresponds EXACTLY to how the element id's are set on the django side
        "audioElement": audioElement,
        "id": idx
      }
    );
  })

  useEffect(() => {
    setTracks(songs)
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
      <h5 className='app-title'>getmybeats</h5>
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
