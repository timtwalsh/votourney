import * as React from "react";
import './style.scss'
import {useMousePosition} from "./useMousePosition";

const TooltipView = (props) => {
    const {x, y} = useMousePosition();
    return (
        <div className="gameTooltip" style={{
            left: x + 10,
            top: y + 20,
            zIndex: 3}}>
            <div className="layout">
                <div className="name">{props.participant?.name}</div>
                <div className="details">{props.participant?.platforms}</div>
                <div className="details">{props.participant?.genres}</div>
                <div className="details">{props.participant?.year}</div>
            </div>
        </div>
    )
}
export default TooltipView
