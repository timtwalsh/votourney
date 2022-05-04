import {useMemo, useState} from "react";
import * as React from "react";
import './style.scss'
import * as _ from 'lodash'
import InputSearch from "../InputSearch";
import Cookies from 'universal-cookie';

const cookies = new Cookies();

const apiBaseAddress = process.env.REACT_APP_BASE_API_URL;

const NewBracket = () => {
    const emptyRow = {name: '', year: '', desc: '', art:'', url: ''};
    const [rows, setRows] = useState([emptyRow]);
    const [isSearching, setIsSearching] = useState(false);
    const defaultSearchValue = '';

    const handleSelectResult = async (data, row) => {
        setIsSearching(false)
        let rowData = [...rows];
        rowData[row] = data;
        await setRows(rowData);
    }

    const inputSearchProps = {
        isSearching,
        setIsSearching,
        handleSelectResult,
    }

    const handleChange = async (i, event) => {
        let rowData = [...rows];
        _.assign(rowData[i], event);
        await setRows(rowData);
    }

    const addClick = () => {
        setRows([...rows, _.cloneDeep(emptyRow)]);
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
            window.location.href = `/bracket/view/${id.replaceAll(`"`, ``)}`;
        } else
            alert(await response.text());
    };

    const handleDeleteRow = async (i) => {
        const newRows = await _.filter(rows, (row, n) => n !== i)
        setRows(newRows);
    }

    const inputRows = useMemo(() => rows.map((element, i) =>
        <div className="input-row">
            <InputSearch rowId={i + element.name} {...inputSearchProps}
                         searchValue={rows[i].name || defaultSearchValue}/>
            <input
                placeholder={'Description'}
                className="form-control"
                id="desc"
                value={rows[i].desc}
                onChange={(e) => handleChange(i, {desc: e.target.value})}
            />
            <input
                type="button"
                value="×"
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
                    type="button"
                    value="Add row"
                    onClick={addClick}
                    className="btn btn-primary"
                />
                <input
                    type="button"
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