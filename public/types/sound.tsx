export interface artistIDs {
  id: string
  name: string
}

export interface Sound {
  name: string
  artistIDs: artistIDs[]
  status: string
  categories: string[]
  moods: string[]
  instruments: string[]
  soundPath: string
  image1Path: string
  duration: number
  soundID: string
  bpm?: number
  id: number
}

export interface SoundListWithSize {
  sounds: Sound[]
  length: number
}

export interface SelectedSoundIds{
  soundIDs: string[]
}
