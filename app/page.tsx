'use client'

import { useEffect, useState } from 'react'
import styles from "./page.module.css";
import { useDropdownToggle } from './menu/useDropdownToggle'
import { fetchSounds } from '../public/scripts/fetchSounds';
import { Sound } from '@/public/types/sound';

export default function Home() {
  useDropdownToggle('toggleInstruments', 'instrumentDropdown')

  const [sounds, setSounds] = useState<Sound[]>([])
  const [totalCount, setTotalCount] = useState(0)
  useEffect(() => {
    fetchSounds()
      .then(({ sounds, length }) => {
        setSounds(sounds)
        setTotalCount(length)
      })
      .catch(console.error)
  }, [])

  return (
    <div className={styles.page}>
      <main className={styles.main}>

        <div style={{ display: 'flex', flex: 1, width: '100%' }}>
          <div id="menuWrapper" className={styles.menuWrapper}>
            <div className={styles.section}>
              <div style={{ marginBottom: 16 }}>
                <input
                  id="categorySearchInput"
                  type="text"
                  placeholder="Search..."
                  className={styles.searchInput}
                />
              </div>

              <div className={styles.titleBar}>
                <h2 style={{ fontSize: '1.125rem', fontWeight: 600 }}>Selected Items</h2>
                <button id="categoryClearSelection" style={{ fontSize: '0.875rem' }}>Clear</button>
              </div>
            </div>

            <div id="menuContainer" className={`${styles.section} ${styles.menuContainer}`}>
              <div id="selectedItemsContainer" className={styles.selectedItemsContainer}></div>

              <div id="categoryBackButtonContainer" className={styles.backButtonContainer} style={{ display: 'none' }}>
                <button id="categoryBackButton" style={{ fontSize: '0.875rem' }}>← Back</button>
              </div>

              <div id="categoryMenuContainer" className={styles.categoryMenuContainer}></div>
            </div>

            <div id="menuSubmitDiv">
              <button id="menuSubmitButton" className={styles.submitButton}>
                Show Selected Tags
              </button>
            </div>

            <div className={styles.section}>
              <h3>Duration</h3>
              <div>
                <label htmlFor="minDuration">Min:</label>
                <input id="minDuration" name="minDuration" type="range" min="0" max="600" step="15" />
              </div>
              <div>
                <label htmlFor="maxDuration">Max:</label>
                <input id="maxDuration" name="maxDuration" type="range" min="0" max="600" step="15" />
              </div>
              <div id="durationOutput"></div>
            </div>

            <div className={styles.section}>
              <h3>Bpm</h3>
              <div>
                <input id="bpmSlider" name="bpmSlider" type="range" min="0" max="200" step="20" />
              </div>
              <div id="bpmOutput"></div>
            </div>
          </div>

          <div style={{ flex: 1, display: 'flex', width: '100%' }}>
            <div style={{ width: '100%' }}>
              <button id="toggleInstruments" className={styles.toggleInstruments} style={{ display: 'block', margin: '0 auto' }}>
                Instruments
              </button>

              <div id="instrumentDropdown" className={styles.instrumentDropdown}>
                <div id="instrumentList" className={styles.instrumentList}></div>
              </div>
            </div>

            <div style={{ flex: 1, width: '100%' }} id="soundList"></div>

            <div id="pagination" className={styles.pagination}></div>
          </div>
        </div>

      </main>
    </div>
  );
}
