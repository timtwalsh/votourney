import {useEffect, useRef, useState} from "react";
import './style.scss'
import RoundSection from "../RoundView";
import {NavLink, useParams} from "react-router-dom";
import Cookies from "universal-cookie";
import * as React from "react";
import Navbar from "../NavBar";
import {toNumber} from "lodash";

const cookies = new Cookies();
const apiBaseAddress = process.env.REACT_APP_BASE_API_URL;


const BracketView = () => {
    const params = useParams();
    const bracketId = params?.bracketId;
    const isMounted = useRef();
    let roundView = toNumber(params?.roundId) || 2;
    let roundsDefault = {
        "0": [{
            name: 'None', desc: 'None', art: 'None', year: '1900', url: ''
        }]
    }
    const [rounds, setRounds] = useState(roundsDefault);
    const [currentRound, setCurrentRound] = useState(-1)
    const [admin, setAdmin] = useState('');
    const [isLoading, setIsLoading] = useState(true);

    const getBracketData = async (id) => {
        if (id) {
            let getBracketData = await fetch(`${apiBaseAddress}/bracket/${id}`, {
                method: "GET",
            })
            const data = await getBracketData.json();
            updateBracketData(data[0].bracket)
            if (data[0].admin === cookies.get('userId')) setAdmin(data[0].admin)
            const getStartingRound = await fetch(`${apiBaseAddress}/voting/round/${bracketId}`, {
                method: "GET",
            })
            const startingRound = await getStartingRound.text();
            setCurrentRound(String(startingRound))
        }
    };
    const updateBracketData = async (data) => {
        if (data) setRounds(data)
        if (roundView > 1) {
            setRounds(data.slice(roundView - 2))
        }
    }

    const handleNextRound = async () => {
        const getCurrentRound = await fetch(`${apiBaseAddress}/voting/round/${bracketId}`, {
            method: "GET",
        })
        const newRound = await getCurrentRound.json();
        const newRoundData = JSON.stringify({"round": newRound + 1})
        const setNextRound = await fetch(`${apiBaseAddress}/voting/round/${bracketId}`, {
            method: 'POST',
            headers: {
                'Accept': 'application/json', 'Content-Type': 'application/json'
            },
            body: newRoundData
        });
        const updatedRound = await setNextRound.text();
        setCurrentRound(String(updatedRound))
    }
    const tourneyNav = document.createElement("li");
    tourneyNav.className = "tourney-nav-items";
    const navButton = () => {
        return (<>
            <Navbar/>
            <div className="tournament-nav">
                <input
                    type="button"
                    value={currentRound === -1 ? "Start Tournament" : (currentRound === rounds.length - 1 ? "End Tournament" : "Next Round")}
                    className="btn btn-primary"
                    id="startRound"
                    onClick={() => {
                        handleNextRound()
                    }}
                />
            </div>
        </>)
    }

    // Keep the data up to date
    function timeout() {
        setTimeout(function () {
            getBracketData(bracketId);
            timeout();
        }, 30000);
    }

    useEffect(() => {
        if (!isMounted.current) {
            getBracketData(bracketId ? bracketId : "06f3884d-8b33-45d7-bb59-d9e187281845").then(() => setIsLoading(false))
            timeout();
            isMounted.current = true;
        } else {
            // do componentDidUpdate logic
        }
    });

    if (isLoading) {
        return (<div className="loading">
            <div></div>
        </div>)
    } else {
        return (<>
            {admin ? navButton() : ""}
            {roundView > 2 ? <>
                    <ul style="padding: 0">
                    <li className="nav-item">
                        <input
                            type="button"
                            value="◄ View Full Bracket"
                            className="btn btn-primary"
                            id="viewFullBracket"
                            onClick={() => {window.location.href = "/bracket/view/"+bracketId}}/>
                    </li>
                    </ul>
            </> : ""}
            <div className="tournament-bracket">
                {Object.keys(rounds).map((roundId, index) => <RoundSection
                    updateHook={updateBracketData}
                    bracketId={bracketId}
                    votingRound={currentRound}
                    roundOffset={roundView - 2}
                    roundId={String(toNumber(roundId) + toNumber(roundView - 2))}
                    roundData={rounds[index.toString()]}
                    key={index}
                />)}
            </div>
        </>)
    }

}
export default BracketView;