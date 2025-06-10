'use client'

import { audioPlayer } from "@/public/scripts/ts/audio_player/audio_player";
import { waveformPlayer } from "@/public/scripts/ts/audio_player/audio_player";
import styles from "../../page.module.css";
import "@/public/styles/public_artist_profile.css"
import { artistProfileContent } from "@/public/scripts/ts/public/artist_profile";
import { SoundList } from "@/public/scripts/newSoundList";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";

export default function PublicArtistProfile() {
  const params = useParams()

  const [artistID, setArtistID] = useState<string | null>(null)

  useEffect(() => {
    const artistID = params.artistID as string
    if (!artistID) return
    setArtistID(artistID)
  }, [params])

  waveformPlayer()
  audioPlayer()

  if (!artistID) return null

  artistProfileContent()

  return (
    <div className={styles.page}>
      <div className="profile-container">
        <img id="userBackgroundImage" className="background-image" src={undefined} alt="" />

        <div className="profile-info">
          <img id="userProfileImage" className="profile-image" src={undefined} alt="" />
          <h3 id="userName" className="username"></h3>
        </div>
      </div>

      <div className="content-area">
        <div className="content-inner">
          <div className="sound-list" id="soundList">
            <SoundList categoryTag={null} artistID={artistID} source={null} />
          </div>
          <div id="pagination" className="pagination"></div>
        </div>
      </div>
    </div>
  )
}
