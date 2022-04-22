import * as React from "react";
import ParticipantView from "../ParticipantView"
import './style.scss'
import {useEffect, useState} from "react";
import Cookies from "universal-cookie";

const apiBaseAddress = process.env.REACT_APP_BASE_API_URL;

const cookies = new Cookies();

const MatchView = (props) => {
    const [vote, setVote] = useState(null);
    const emptyTeam = {name: "BYE", genres: "----", platforms: "----", year: 1900}
    //checkMyVote and setVote if I have voted.
    useEffect(() => {
        setVote(props.matchParticipants?.top.voters.includes(cookies.get('userId')) ? "top" : (props.matchParticipants?.bottom.voters.includes(cookies.get('userId')) ? "bottom" : null))
    }, [props.matchParticipants])
    const castVote = async (bracketId, roundId, matchId, vote) => {
        const voteData = {
            roundId: roundId,
            matchId: matchId,
            vote: vote,
            userId: cookies.get('userId')
        }
        const response = await fetch(`${apiBaseAddress}/voting/${bracketId}`, {
            method: 'POST',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(voteData)
        })
        const data = await response.json();
        setVote(vote);
        props.updateHook(data);
    };

    const voteForParticipant = (vote) => {
        if (props.votingRound === props.roundId) {
            castVote(props.bracketId, props.roundId, props.matchId, vote)
        }
    }
    return (
        <div className="match-section">
            <div className="participants">
                {props.matchParticipants && props.matchParticipants.top ? (
                    <ParticipantView
                        participant={props.matchParticipants ? props.matchParticipants.top.participant : emptyTeam}>
                        {props.votingRound === props.roundId && props.matchParticipants.top.participant.name === "" ? (<div className="participant-bye"/>) : (<>
                            <div className="participant-vote-button" onClick={() => voteForParticipant("top")}>
                                {vote != null || props.votingRound > props.roundId
                                    ? (<div
                                    className="participant-score">{props.matchParticipants ? props.matchParticipants.top.voters.length : 0}</div>) : (<>
                                    {props.votingRound === props.roundId ?
                                        <div className="participant-vote">🔷</div> : ""}</>)}
                                {vote === "top" ? <div className="participant-vote-indicator">🔷</div> : ""}
                            </div>
                        </>)}
                    </ParticipantView>
                ) : ""}
                {props.matchParticipants && props.matchParticipants.top.participant && props.matchParticipants.bottom.participant ? (
                    <div className="vs">vs</div>
                ) : ""}
                {props.matchParticipants && props.matchParticipants.bottom ? (
                    <ParticipantView
                        participant={props.matchParticipants ? props.matchParticipants.bottom.participant : emptyTeam}>
                        {props.votingRound === props.roundId && props.matchParticipants.bottom.participant.name === "" ? "" : (
                            <>
                                <div className="participant-vote-button" onClick={() => voteForParticipant("bottom")}>
                                    {vote != null || props.votingRound > props.roundId ? (<div
                                        className="participant-score">{props.matchParticipants ? props.matchParticipants.bottom.voters.length : 0}</div>) : (<>
                                        {props.votingRound === props.roundId ?
                                            <div className="participant-vote">🔷</div> : ""}</>)}
                                    {vote === "bottom" ? <div className="participant-vote-indicator">🔷</div> : ""}
                                </div>
                            </>)}
                    </ParticipantView>) : ""}
            </div>
        </div>
    )
}
export default MatchView
