import { SoundTouch } from "soundtouch-ts";
import audioBufferToWav from "audiobuffer-to-wav";

/**
 * Stretch or shrink an audio file to a fixed length.
 *
 * @param file              Input WAV/MP3/… (Browser File veya Blob)
 * @param targetSeconds     İstenen çıktı süresi
 * @returns                 “audio/wav” tipinde yeni File
 */
export async function stretchAudio(
  file: File,
  targetSeconds: number
): Promise<File> {
  // 1- decode ---------------------------------------------------------------
  const ctx = new AudioContext();
  const inputBuffer = await ctx.decodeAudioData(await file.arrayBuffer());

  // 2- tempo oranını hesapla -----------------------------------------------
  const tempo = inputBuffer.duration / targetSeconds; // <1 → yavaşlatır, >1 → hızlandırır

  const st = new SoundTouch(inputBuffer.sampleRate);
  st.tempo = tempo;

  // 3- bütün örnekleri SoundTouch’a gönder ----------------------------------
  const interleaved = asInterleaved(inputBuffer);
  st.inputBuffer.putSamples(interleaved);
  st.process(); // ilk işleme turu

  // 4- işlenmiş veriyi topla -------------------------------------------------
  const channels = inputBuffer.numberOfChannels;
  const estLength = Math.ceil((interleaved.length / tempo) + 4096);
  const receiver = new Float32Array(estLength);

  let received = 0;
  //const request = 4096;

  while (st.outputBuffer.frameCount > 0) {
    const availableFrames = st.outputBuffer.frameCount;
    const availableSamples = availableFrames * channels;
    const remaining = receiver.length - received;

    if (remaining <= 0) break;

    const writableSamples = Math.min(availableSamples, remaining);

    st.outputBuffer.receiveSamples(
      receiver.subarray(received, received + writableSamples),
      writableSamples / channels
    );

    received += writableSamples;
    st.process();
  }

  // 5- Float32Array → AudioBuffer → WAV -------------------------------------
  const stretched = asPlanar(receiver.subarray(0, received), inputBuffer.sampleRate, channels);
  const wavArrayBuffer = audioBufferToWav(stretched, { float32: false }); // 16-bit PCM
  const outName = file.name.replace(/\.[^.]+$/, "") + `_stretch_${targetSeconds}s.wav`;

  return new File([wavArrayBuffer], outName, { type: "audio/wav" });
}

/* ------------------------------------------------------------------------ */
/* helpers                                                                  */
/* ------------------------------------------------------------------------ */
function asInterleaved(ab: AudioBuffer): Float32Array {
  const ch = ab.numberOfChannels;
  const out = new Float32Array(ch * ab.length);
  for (let i = 0; i < ab.length; i++) {
    for (let c = 0; c < ch; c++) out[i * ch + c] = ab.getChannelData(c)[i];
  }
  return out;
}

function asPlanar(buf: Float32Array, rate: number, ch = 2): AudioBuffer {
  const len = Math.floor(buf.length / ch);
  const out = new AudioBuffer({ numberOfChannels: ch, length: len, sampleRate: rate });
  for (let c = 0; c < ch; c++) {
    const channel = out.getChannelData(c);
    for (let i = 0; i < len; i++) channel[i] = buf[i * ch + c];
  }
  return out;
}

/*const file = soundInput.files?.[0];
        const buffer = await file.arrayBuffer();
        const newFile = new File([buffer], "audio.wav", { type: file.type });
        const stretched = await stretchAudio(newFile, 60);
        console.log("stretched: ", stretched);
        const url = URL.createObjectURL(stretched);
        const a = document.createElement("a");
        a.href = url;
        a.download = stretched.name;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);*/
