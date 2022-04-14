import {useMemo, useState} from "react";
import * as React from "react";
import './style.scss'
import * as _ from 'lodash'
import InputSearch from "../InputSearch";
import Cookies from 'universal-cookie';

const cookies = new Cookies();

const apiBaseAddress = process.env.REACT_APP_BASE_API_URL;

const NewBracket = () => {
    const emptyRow = {name: '', genres: '', platforms: '', year: ''};
    const [rows, setRows] = useState([emptyRow]);
    const [isSearching, setIsSearching] = useState(false);
    const [isManual, setIsManual] = useState(false);
    const defaultSearchValue = '';
    const handleSelectResult = (data, row) => {
        setIsSearching(false)
        let rowData = [...rows];
        if (data.platforms == "") data.platforms = "PC or Mobile"
        rowData[row] = data;
        setRows(rowData);
    }

    const inputSearchProps = {
        isSearching,
        setIsSearching,
        setIsManual,
        handleSelectResult,
    }

    const handleChange = (i, event) => {
        if (!isManual) {
            _.assign(rows[i], event);
            setRows([...rows]);
        } else {
            // Manual Input override
        }
    }

    const addClick = () => {
        setRows([...rows, emptyRow]);
    }

    const handleSubmit = async () => {
        const response = await fetch(`${apiBaseAddress}/bracket`, {
            method: 'POST',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({"participants": rows, userId: cookies.get('userId')})
        });

        if (response.status >= 200 && response.status <= 201) {
            const id = await response.text();
            // alert(id);
            window.location.href = `/bracket/view/${id.replaceAll(`"`, ``)}`;
        } else
            alert(await response.text());
    };

    const handleDeleteRow = async (i) => {
        console.log(rows);
        const newRows = await _.filter(rows, (row, n) => n != i)
        console.log(newRows);
        setRows(newRows);
    }

    const inputRows = useMemo(() => rows.map((element, i) =>
        <div className="input-row">
            <InputSearch rowId={i + element.name} {...inputSearchProps}
                         searchValue={rows[i].name || defaultSearchValue}/>
            <input
                placeholder={'Genre'}
                className="form-control"
                id="genre"
                value={rows[i].genres}
                onChange={(e) => handleChange(i, {genre: e.target.value})}
            />
            <input
                placeholder={'Platform'}
                className="form-control"
                id="platform"
                value={rows[i].platforms}
                onChange={(e) => handleChange(i, {platform: e.target.value})}
            />
            <input
                placeholder={'Year'}
                className="form-control"
                id="year"
                value={rows[i].year}
                onChange={(e) => handleChange(i, {year: e.target.value})}
            />
            <input
                type="btn"
                value="×️"
                className="btn btn-primary"
                id="delete-row"
                onClick={() => {
                    handleDeleteRow(i)
                }}
            />
        </div>
    ), [rows])


    // This following section will display the form that takes the input from the user.
    return (
        <div className="wizard-canvas">
            <h1>Create a Bracket</h1>
            <div className="form-buttons">
                <input
                    type="btn"
                    value="Add row"
                    onClick={addClick}
                    className="btn btn-primary"
                />
                <input
                    type="btn"
                    value="Generate Bracket"
                    className="btn btn-primary"
                    onClick={handleSubmit}
                />
            </div>
            <div className="form-inputs">
                {inputRows}
            </div>
        </div>
    )
        ;
}
export default NewBracket;