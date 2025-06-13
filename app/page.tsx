'use client'

import styles from "./page.module.css";
import { useUIInteractions } from '../public/scripts/ts/menu/menu';
import { audioPlayer, waveformPlayer } from '@/public/scripts/ts/audio_player/audio_player';
import { SoundList } from '@/public/scripts/newSoundList';

export default function Home() {
  useUIInteractions()
  waveformPlayer()
  audioPlayer()

  return (
    <div className={styles.page}>
      <div style={{ display: 'flex', width: '100%' }}>

        <div style={{ width: '100%' }}>
          <div style={{ width: '100%' }}>
            <button id="toggleInstruments" className={styles.toggleInstruments} style={{ display: 'block', margin: '0 auto' }}>
              Instruments
            </button>

            <div id="instrumentDropdown" className={styles.instrumentDropdown}>
              <div id="instrumentList" className={styles.instrumentList}></div>
            </div>
          </div>

          <div style={{ width: '100%' }} id="soundList">
            <SoundList categoryTag={null} artistID={null} source={null} />
          </div>

          <div id="pagination" className={styles.pagination}></div>
        </div>
      </div>
    </div>
  );
}
