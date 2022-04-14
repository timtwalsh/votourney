import _, {toNumber} from "lodash";
import './style.scss'
import React from "react";

const platform_map = require("./platform_data.json");
const genre_map = require("./genre_data.json");

const SearchResultView = (props) => {
    const getFullYear = (secondsFromEpoch) => {
        if (secondsFromEpoch) {
            const date = new Date(1000 * secondsFromEpoch);
            return String(date.getFullYear());
        }
        return "----"
    }

    const getGenreNames = (genreIds) => {
        if (genreIds) {
            let genres = genreIds.map((id) => {
                return genre_map[id];
            });
            return genres.join(", ")
        }
        return "----";
    }

    const getPlatformNames = (platformIds) => {
        if (platformIds && platformIds.length > 0) {
            let platforms = platformIds.map((id) => {
                if (!_.isUndefined(platform_map[id])) {
                    return platform_map[id];
                }
            })
            const platformString = platforms.filter((el) => el != null).join(", ");
            if (platforms.length > 0) return platformString;
            return "PC"
        }
        return "Unknown"
    };

    return (
        <>
            {props.data.map((searchRowData, searchIndex) => {
                    return (
                        <div className={"search-result"} key={searchIndex}
                             onClick={() => props.handleSearchResultClick({
                                 name: searchRowData.name,
                                 genres: getGenreNames(searchRowData.genres),
                                 platforms: getPlatformNames(searchRowData.platforms),
                                 year: getFullYear(toNumber(searchRowData.first_release_date))
                             }, searchIndex)}>
                            <div className={"search-result-left"}>
                                <div className={"result_name"}>{searchRowData.name}</div>
                                <div
                                    className={"result_platforms" + searchIndex}>{searchRowData.platforms ? getPlatformNames(searchRowData.platforms) : "----"}</div>
                            </div>
                            <div className={"search-result-right"}>
                                <div
                                    className={"result_released"}>{searchRowData.first_release_date ? getFullYear(Number(searchRowData.first_release_date)) : "----"}</div>
                                <div
                                    className={"result_genres"}>{searchRowData.genres ? getGenreNames(searchRowData.genres) : "----"}</div>
                            </div>
                            {props.children}
                        </div>
                    )
                }
            )}
        </>
    )
}
export default SearchResultView;