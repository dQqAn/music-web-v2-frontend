'use client'

import { audioPlayer } from "@/public/scripts/ts/audio_player/audio_player";
import { waveformPlayer } from "@/public/scripts/ts/audio_player/audio_player";
import styles from "../../../page.module.css";
import "@/public/styles/artist_single_sound.css"
import "@/public/scripts/ts/artist_single_sound/artist_single_sound"
import { artistSingleSound } from "@/public/scripts/ts/artist_single_sound/artist_single_sound";

export default function Profile() {
  waveformPlayer()
  audioPlayer()

  artistSingleSound()
  
  return (
    <div className="page" style={{ marginBottom: '150px' }}>
      <div className="section">
        <div id="fileInfo" className="hidden">
          <p>File status: <span id="fileStatus"></span></p>
        </div>

        <form id="uploadForm" encType="multipart/form-data">
          <div className="form-group">
            <label>Select an image</label>
            <span id="selectedImageName"></span>
            <input required type="file" id="imageInput" name="imageFile" accept=".png, .jpg" />
          </div>

          <div className="form-group">
            <label>Select a sound</label>
            <span id="selectedSoundName"></span>
            <input required type="file" id="soundInput" name="soundFile" accept=".mp3, .wav" />
          </div>

          <div className="form-group">
            <label>Sound Name:</label>
            <input id="soundName" name="soundName" required type="text" />
          </div>

          <button type="submit">Upload Sound</button>
        </form>

        <div>
          <div id="artistSingleSoundBox" className="waveform-box"></div>
        </div>

        <div id="errorInfo" className="hidden">
          <p id="errorMessage"></p>
        </div>
      </div>

      <div className="section">
        <h3>Add artists with email</h3>
        <input id="artistSearchInput" type="text" placeholder="Artists..." />
        <button id="searchArtistButton">Search</button>
        <div id="artistSearchResults"></div>
      </div>

      <div className="section">
        <div className="form-group">
          <label>Select a stem</label>
          <span id="selectedStemName"></span>
          <input type="file" id="stemInput" name="stemFile" accept=".mp3, .wav" />
        </div>

        <div className="form-group">
          <p>Stem Name:</p>
          <input id="stemName" name="stemName" type="text" />
        </div>

        <button id="addStem">Add Stem</button>
        <div id="selectedStems"></div>
      </div>

      <div className="section">
        <div className="form-group">
          <p>Starting Time:</p>
          <input id="startingTime" name="startingTime" type="number" />
        </div>
        <div className="form-group">
          <p>Ending Time:</p>
          <input id="endingTime" name="endingTime" type="number" />
        </div>

        <button id="addLoop">Add</button>

        <div id="artistSelectedLoopsDiv">
          <h3>Selected Loops</h3>
          <div id="artistLoopList"></div>
        </div>
      </div>

      <div className="section" style={{ display: 'flex' }}>
        <div className="selector-section">
          <input id="categorySearchInput" type="text" placeholder="Search..." />

          <div className="selection-box">
            <h2>Selected Items</h2>
            <button id="categoryClearSelection">Clear</button>
          </div>

          <div id="categorySelectedItemsContainer"></div>

          <div id="categoryBackButtonContainer">
            <button id="categoryBackButton">← Back</button>
          </div>

          <div id="categoryMenuContainer"></div>
        </div>

        <div className="selector-section">
          <input id="instrumentSearchInput" type="text" placeholder="Search..." />

          <div className="selection-box">
            <h2>Selected Items</h2>
            <button id="instrumentClearSelection">Clear</button>
          </div>

          <div id="instrumentSelectedItemsContainer"></div>

          <div id="instrumentBackButtonContainer">
            <button id="instrumentBackButton">← Back</button>
          </div>

          <div id="instrumentMenuContainer"></div>
        </div>
      </div>
    </div>
  )
}

