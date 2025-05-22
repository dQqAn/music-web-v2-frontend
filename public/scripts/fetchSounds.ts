import type { Sound, SoundListWithSize } from '../types/sound'

export async function fetchSounds(): Promise<SoundListWithSize> {
  const page = 1
  const res = await fetch(`http://127.0.0.1:8083/database/filterSounds?page=${page}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      categorySelectedTags: ["JAZZ"],
      instrumentSelectedTags: [],
      minDuration: null,
      maxDuration: null,
      bpm: null,
      artistID: null
    }),
    credentials: "include"
  })

  if (!res.ok) {
    throw new Error('Failed to fetch sounds')
  }

  const data: SoundListWithSize = await res.json()
  console.log(data.length)
  console.log(data.sounds)
  return data
}