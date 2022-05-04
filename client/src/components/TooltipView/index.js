import * as React from "react";
import './style.scss'
import {useMousePosition} from "./useMousePosition";

const TooltipView = (props) => {
    let {x, y} = useMousePosition();
    const art = {
        "background": `#222 url('//images.igdb.com/igdb/image/upload/t_cover_big/${props.participant?.art}.png') no-repeat`,
        "background-position": "center",
        "background-size": "contain"
    };
    const horizontalStyle = (x >= window.innerWidth / 2) ? {right: window.innerWidth-x} : {left: x+20}
    const verticalStyle = (y >= window.innerHeight / 2) ? {bottom: window.innerHeight-y} : {top: y+0}

    return (
        <div className="gameTooltip" style={{...horizontalStyle, ...verticalStyle, zIndex: 3}}>
            <div className="layout">
                <div className="name">{`${props.participant?.name} (${props.participant?.year})`}</div>
                <div className="description">{props.participant?.desc}</div>
            </div>
            {art !== "none" ? (<>
                <div className="art" style={art}/>
            </>) : ""}
        </div>
    )
}
export default TooltipView
