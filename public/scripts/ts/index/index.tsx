import { useEffect } from "react";
import {filterSounds} from "../menu/menu";

export function indexPageContent(){
    useEffect(() => {
        const div = document.getElementById('soundList')
    if (div) {
        filterSounds(1)
    }
    },[])
}