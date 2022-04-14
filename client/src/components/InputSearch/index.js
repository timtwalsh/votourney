import * as React from "react";
import {useState} from "react"
import SearchResultView from "../SearchResultView";
import useBouncer from "../SearchResultView/useBouncer";

const apiBaseAddress = process.env.REACT_APP_BASE_API_URL;

const InputSearch = (props) => {
    const [searchValue, setSearchValue] = useState(props.searchValue);
    const [searchResponse, setSearchResponse] = useState()


    const handleSearchResultClick = (data) => {
        setSearchResponse(null);
        props.handleSelectResult(data, props.rowId)
        setSearchValue(data.name);
    }

    const requestGameData = async (searchText) => {
        if (searchText) {
            props.setIsSearching(true);
            console.log(apiBaseAddress)
            let response = await fetch(`${apiBaseAddress}/game/search/${searchText}`, {
                method: "GET",
            })
                .then((response) => response)
                .catch((error) => error);
            setSearchResponse(await response.json());
            props.setIsSearching(false);
        }
    };

    const debouncedRequestGameData = useBouncer(requestGameData, 1000)

    const handleNameChange = (newInput) => {
        if (!props.isSearching) {
            setSearchValue(newInput)
            debouncedRequestGameData(newInput);
        }
    }

    return (<div className="form-search-input">
        {props.isSearching ? (<div className={"loading"}>Loading</div>) : ""}
            <input
                placeholder={'Name'}
                className="form-control"
                id="name"
                value={searchValue}
                onChange={(e) => handleNameChange(e.target.value)}
            />

            <div className={"search-result-window"}>
                {searchResponse ? <>
                    <SearchResultView data={searchResponse} handleSearchResultClick={handleSearchResultClick}>
                    </SearchResultView>
                    <input
                        type="btn"
                        value="Name Only - Clear Search"
                        className="btn btn-primary search-result-close"
                        onClick={() => {
                            setSearchResponse(null);
                            props.setIsSearching(false);
                            props.setIsManual(true);
                        }}
                    />
                </> : ""}
            </div>
        </div>
        );
        }
        export default InputSearch;