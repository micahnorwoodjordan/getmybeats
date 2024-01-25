import "./css/SearchBox.css";


const SearchBox = ({ className, placeholder, onChangeHandler }) => (
    <input
        type="search"
        className={`search-box ${className }`}
        placeholder={ placeholder }
        onChange={ onChangeHandler }
    />
);

export default SearchBox;