'use client';

import styles from './Footer.module.css'

export default function Footer() {
  return (
    <footer className={styles.footer}>
      <div className={styles.wrapper}>
        <div className={styles.footerStart}>
          <div className={styles.justifyContent}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '16px' }}>
              <div>
                <img id="mainSoundImage" src="/images/logo.png" alt="">
                </img>
              </div>
              <div >
                <p id="mainSoundName">Sound Name</p>
                <div id="mainArtistsName">Artist Name</div>
              </div>
            </div>

            <div >
              <button id="musicBoxSkipBack">Back</button>

              <button id="musicBoxPlayPause">Play</button>

              <button id="musicBoxSkipForward">Forward</button>

              <button id="musicBoxRepeat">Repeat</button>

              <button id="openStemsOverlay">Stems</button>
            </div>
          </div>

        </div>

        <div className={styles.footerCenter}>
        <div id="music_box" style={{position: 'relative'}}>
                <div >
                    <div >
                        <div >
                            <p id="mainTime">0:00</p>
                            <span>/</span>
                            <p id="mainDuration">0:00</p>
                        </div>

                        <label>
                           Rate: <span id="mainRate"></span>
                        </label>
                        <label>
                            0.5x <input id="mainRateInput" type="range" min="0.5" max="2" step="0.5" value="1"/> 2x
                        </label>
                        <label>
                            Zoom: <input id="mainZoomInput" type="range" min="10" max="200" value="100"/>
                        </label>

                        <label>
                            <input id="mainLoopCheckbox" type="checkbox"/>
                            Loop Regions
                        </label>
                        <button id="mainClearRegions">Clear Regions</button>
                    </div>
                    <div id="mainHover"></div>
                </div>
            </div>
        </div>

        <div className={styles.footerEnd}>
        <div >
                <div id="soundOptionsToUser">
                    <button id="mainDownloadButton">D</button>

                    <button id="openPlaylistButton">
                        <i data-lucide="list-music" ></i>
                    </button>

                    <div id="mainFavDiv"></div>

                    <div id="mainStretchDiv"></div>

                    <div id="mainPlaylistDiv">
                        <button id="mainPlaylistBtn"></button>

                        <div 
                             id="mainPlaylistContainer" >
                            <div >
                                <div >
                                    <button id="mainCreatePlaylist">Create Playlist</button>
                                    <input type="text" id="mainPlaylistInput" placeholder="Search"></input>
                                  
                                </div>
                                <div >
                                    <button id="mainPlaylistCloseBtn">
                                        ×
                                    </button>
                                </div>
                            </div>

                            <div id="mainPlaylistResult" ></div>
                            <button id="mainAddToPlaylistBtn">Submit</button>
                        </div>
                    </div>
                </div>

                <input id="mainVolume" type="range" min="0" max="1" step="0.01" value="1"></input>
            </div>
        </div>

      </div>
    </footer>
  );
}
