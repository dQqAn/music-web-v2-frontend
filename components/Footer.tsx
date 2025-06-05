'use client';

import styles from '@/public/styles/footer.module.css'

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
            <button id="musicBoxSkipBack">Back</button>

            <button id="musicBoxPlayPause">Play</button>

            <button id="musicBoxSkipForward">Forward</button>

            <button id="musicBoxRepeat">Repeat</button>

            <button id="openStemsOverlay">Stems</button>
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
                <button id="mainClearRegions">Clear Regions</button>
              </div>
              <div id="mainHover"></div>
            </div>
          </div>
        </div>

        <div className={styles.footerEnd}>
          <div id="soundOptionsToUser" style={{ display: 'flex', gap: 16 }}>
            <button id="mainDownloadButton">D</button>

            <button id="openPlaylistButton">Queue</button>

            <div id="mainFavDiv"></div>

            <div id="mainStretchDiv"></div>

            <div id="mainPlaylistDiv">
              <button id="mainPlaylistBtn">Playlist</button>

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
                    overflowY: 'auto',
                    padding: '10px',
                    backgroundColor: 'white',
                    color: 'black'
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div >
                      <button id="mainCreatePlaylist">Create Playlist</button>
                      <input type="text" id="mainPlaylistInput" placeholder="Search"></input>

                    </div>
                    <div >
                      <button id="mainPlaylistCloseBtn">X</button>
                    </div>
                  </div>

                  <div id="mainPlaylistResult" style={{ height: '60px' }}></div>
                  <button id="mainAddToPlaylistBtn" style={{ width: '100%' }}>Submit</button>
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
