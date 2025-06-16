'use client'

import styles from "./page.module.css";
import { newDropDownMenu, useUIInteractions } from '../public/scripts/ts/menu/menu';
import { audioPlayer, waveformPlayer } from '@/public/scripts/ts/audio_player/audio_player';
import { SoundList } from '@/public/scripts/newSoundList';
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar"
import { AppSidebar } from "@/components/app-sidebar"
import { useEffect, useRef } from "react";

export default function Home() {
  useUIInteractions()
  waveformPlayer()
  audioPlayer()

  const toggleInstrumentsButtonRef = useRef<HTMLButtonElement | null>(null);
  const instrumentDropdownRef = useRef<HTMLDivElement | null>(null);
  const instrumentListnRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (
      toggleInstrumentsButtonRef.current &&
      instrumentDropdownRef.current &&
      instrumentListnRef.current
    ) {
      newDropDownMenu(
        1,
        'instruments',
        toggleInstrumentsButtonRef.current,
        instrumentDropdownRef.current,
        instrumentListnRef.current
      );
    }
  }, []);

  return (
    <div className={styles.page}>
      <div style={{ display: 'flex', width: '100%' }}>

        <SidebarProvider style={{ zIndex: 10 }}>
          <AppSidebar />
          <SidebarTrigger />

          <div style={{ width: '100%' }}>
            <div style={{ width: '100%', marginBottom: '16px' }}>
              <button id="toggleInstruments" className={styles.toggleInstruments}
                style={{ display: 'block', margin: '0 auto' }} ref={toggleInstrumentsButtonRef}
              >
                Instruments
              </button>

              <div id="instrumentDropdown" className={styles.instrumentDropdown} ref={instrumentDropdownRef}>
                <div id="instrumentList" className={styles.instrumentList} ref={instrumentListnRef}></div>
              </div>
            </div>

            <div style={{ width: '100%' }} id="soundList">
              <SoundList categoryTag={null} artistID={null} source={null} />
            </div>

            <div id="pagination" className={styles.pagination}></div>
          </div>

        </SidebarProvider>

      </div>
    </div>
  );
}
