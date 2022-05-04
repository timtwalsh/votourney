import { useState, useEffect } from "react";

export const useMousePosition = () => {
    const [position, setPosition] = useState({ x: -1000, y: -1000 }); // Render out of window initially
    useEffect(() => {
        const setFromEvent = (e) => setPosition({
            x: e.clientX,
            y: e.clientY
        });
        window.addEventListener("mousemove", setFromEvent);
        return () => {
            window.removeEventListener("mousemove", setFromEvent);
        };
    }, []);
    return position;
};