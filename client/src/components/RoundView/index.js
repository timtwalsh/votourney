import * as React from "react";
import MatchView from "../MatchView";
import './style.scss';
import {toNumber} from "lodash";

const RoundSection = (props) => {
    let roundClass;
    if (props.votingRound == props.roundId)
        roundClass = "round-header voting";
    else
        roundClass = "round-header";
    return (
        <div className="round">
            <div className={roundClass}>
                <div className="round-title">Round {toNumber(props.roundId) + 1}</div>
            </div>
            <div className="round-container">
                {props.roundData.map((teams, index) => {
                    return <MatchView votingRound={props.votingRound} roundId={props.roundId}
                                      matchId={index} matchParticipants={teams} key={index}
                                      bracketId={props.bracketId}
                                      updateHook={props.updateHook}/>;
                })}
            </div>
        </div>
    )
}
export default RoundSection
