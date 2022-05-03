import * as React from "react";
import MatchView from "../MatchView";
import './style.scss';
import {toNumber} from "lodash";

const RoundSection = (props) => {
    let isActiveRound;
    if (props.votingRound == props.roundId) {
        isActiveRound = " voting";
    } else {
        isActiveRound = "";
    }

    return (
        <div className={"round" + isActiveRound}>
            <div className={"round-header" + isActiveRound}>
                <div
                    className="round-title voting"
                    onClick={() => {
                        window.location.href = "/bracket/view/" + props.bracketId + "/" + (toNumber(props.roundId) + 1)
                    }}
                >{"Round " + (toNumber(props.roundId) + 1)}</div>
            </div>

            <div className={"round-container" + isActiveRound}>
                {props.roundData.map((teams, index) => {
                    return <>
                        {props.roundId === "0" || props.roundId === String(props.totalRounds - 1) ? "" : ""}
                        <MatchView votingRound={props.votingRound}
                                   roundId={props.roundId}
                                   matchId={index} matchParticipants={teams} key={index}
                                   bracketId={props.bracketId}
                                   updateHook={props.updateHook}/>
                    </>;
                })}
            </div>
        </div>
    )
}
export default RoundSection
