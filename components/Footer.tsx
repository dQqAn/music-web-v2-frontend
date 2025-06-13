'use client';

import styles from '@/public/styles/footer.module.css'
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"

export default function Footer() {
  return (
    <footer className={styles.footer} style={{ position: 'fixed', bottom: 0, width: '100%' }}>
      <div className={styles.wrapper}>

        <div className={styles.footerStart}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '16px' }}>
            <div >
              <img id="mainSoundImage" src={undefined} alt="" />
            </div>
            <div >
              <p id="mainSoundName">Sound Name</p>
              <div id="mainArtistsName">Artist Name</div>
            </div>
          </div>

          <div style={{ display: 'flex', gap: 16 }}>
            <Button variant="secondary" id="musicBoxSkipBack">Back</Button>

            <Button variant="secondary" id="musicBoxPlayPause">Play</Button>

            <Button variant="secondary" id="musicBoxSkipForward">Forward</Button>

            <Button variant="secondary" id="musicBoxRepeat">Repeat</Button>

            <Button variant="secondary" id="openStemsOverlay">Stems</Button>
          </div>

        </div>

        <div className={styles.footerCenter}>
          <div id="music_box" style={{ position: 'relative' }}>
            <div >
              <div style={{ display: 'flex', gap: 16 }}>
                <div style={{ display: 'flex', gap: 4 }}>
                  <p id="mainTime">0:00</p>
                  <span>/</span>
                  <p id="mainDuration">0:00</p>
                </div>

                <label>
                  Rate: <span id="mainRate"></span>
                </label>
                <label>
                  0.5x <input id="mainRateInput" type="range" min="0.5" max="2" step="0.5" defaultValue="1" /> 2x
                </label>
                <label>
                  Zoom: <input id="mainZoomInput" type="range" min="10" max="200" defaultValue="100" />
                </label>

                <label>
                  <input id="mainLoopCheckbox" type="checkbox" />
                  Loop Regions
                </label>
                <Button variant="secondary" id="mainClearRegions">Clear Regions</Button>
              </div>
              <div id="mainHover"></div>
            </div>
          </div>
        </div>

        <div className={styles.footerEnd}>
          <div id="soundOptionsToUser" style={{ display: 'flex', gap: 16 }}>
            <Button variant="secondary" id="mainDownloadButton">D</Button>

            <div>
              <Button variant="secondary" id="openPlaylistButton">Queue</Button>

              <div id='mainQueueOverlay' style={{
                display: 'none',
                position: 'fixed',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                backgroundColor: 'rgba(0, 0, 0, 0.3)',
                backdropFilter: 'blur(4px)',
                zIndex: 999,
              }}>

                <div id="playlistOverlay" style={{ position: 'fixed', inset: 0, display: 'none', zIndex: 60 }}>
                  <div style={{
                    position: 'fixed',
                    top: '50%',
                    left: '50%',
                    width: '24rem',
                    transform: 'translate(-50%, -50%)',
                    borderRadius: '1rem',
                    padding: '1.5rem',
                    zIndex: 60,
                    backgroundColor: '#f5d0fe',
                    color: '#0a0a0a',
                  }}>
                    <Button variant="secondary" id="closePlaylistOverlay"
                      style={{
                        position: 'absolute',
                        top: '0.75rem',
                        right: '0.75rem',
                        zIndex: 60,
                        background: 'transparent',
                        border: 'none',
                        cursor: 'pointer',
                      }}>✕</Button>

                    <div id="playlistOverlayContent" style={{ zIndex: 60, width: '100%' }}></div>
                  </div>
                </div>
              </div>
            </div>

            <div id="mainFavDiv"></div>

            <div id="mainMenu"></div>

            <div id="mainPlaylistDiv">
              <Button variant="secondary" id="mainPlaylistBtn">Playlist</Button>

              <div id='mainPlaylistOverlay' style={{
                display: 'none',
                position: 'fixed',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                backgroundColor: 'rgba(0, 0, 0, 0.3)',
                backdropFilter: 'blur(4px)',
                zIndex: 999,
              }}>

                <div
                  id="mainPlaylistContainer"
                  style={{
                    display: 'none',
                    position: 'fixed',
                    top: '50%',
                    left: '50%',
                    transform: 'translate(-50%, -50%)',
                    border: '1px solid #ccc',
                    zIndex: 1000,
                    maxWidth: '90%',
                    maxHeight: '80%',
                    padding: '10px',
                    backgroundColor: 'white',
                    color: 'black'
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div >
                      <Button variant="secondary" id="mainCreatePlaylist">Create Playlist</Button>
                      <Input id="mainPlaylistInput" type="text" placeholder="Search" />

                    </div>
                    <div >
                      <Button variant="secondary" id="mainPlaylistCloseBtn">X</Button>
                    </div>
                  </div>

                  <div id="mainPlaylistResult" style={{ maxHeight: '100px', overflowY: 'auto' }}></div>
                  <Button variant="secondary" id="mainAddToPlaylistBtn" style={{ width: '100%' }}>Submit</Button>
                </div>

              </div>

            </div>
          </div>

          <input id="mainVolume" type="range" min="0" max="1" step="0.01" defaultValue="1" />
        </div>

      </div>
    </footer>
  );
}
