'use client'

import { audioPlayer } from "@/public/scripts/ts/audio_player/audio_player";
import { waveformPlayer } from "@/public/scripts/ts/audio_player/audio_player";
import styles from "../../page.module.css";

export default function Dashboard() {
    waveformPlayer()
    audioPlayer()
    return (
      <div className={styles.page}>
        <h1>Moderator Dashboard</h1>
      </div>
    )
  }
  