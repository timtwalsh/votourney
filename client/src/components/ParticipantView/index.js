import * as React from "react";
import './style.scss'
import {useState} from "react";
import TooltipView from "../TooltipView";

const ParticipantView = (props) => {
    const [displayTooltip, setDisplayTooltip] = useState(false)
    const handleClick = () => {
        if (props.participant.url)
            window.open(props.participant?.url);
    };
    if (props.participant)
        return (
        <div className="participant">
           <div className="participant-name" onClick={handleClick} onMouseEnter={() => {props.participant.name && setDisplayTooltip(true)}} onMouseLeave={() => setDisplayTooltip(false)}>
               {props.participant.name}{props.participant && displayTooltip ? <TooltipView participant={props.participant} /> : ""}</div>
            {props.children}
        </div>
    )
    else
        return (<></>)
}
export default ParticipantView
