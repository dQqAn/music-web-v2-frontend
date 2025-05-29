import * as realtimeBpm from 'realtime-bpm-analyzer';

/**
 * Dosyadan BPM tahmini yapar. BPM bulunamazsa 60 döner.
 * @param file Audio dosyası (wav, mp3, flac)
 * @returns Tahmini BPM (ör: 85, 120...), bulunamazsa 60
 */
export async function analyzeBPMFromFile(file: File): Promise<number> {
  const audioContext = new AudioContext();
  const arrayBuffer = await file.arrayBuffer();

  try {
    const audioBuffer = await audioContext.decodeAudioData(arrayBuffer);

    if (audioBuffer.duration < 1) {
      console.warn("Ses çok kısa.");
      return 60;
    }

    const topCandidates = await realtimeBpm.analyzeFullBuffer(audioBuffer);

    if (!topCandidates.length) {
      console.warn("BPM bulunamadı. Dosyayı kontrol et.");
      return 60;
    }

    const bpm = topCandidates[0].tempo;
    return bpm;
  } catch (error) {
    console.error("Ses analiz hatası:", error);
    return 60;
  }
}

/*const audioContext = new AudioContext();
                    const reader = new FileReader();
                    reader.addEventListener('load', () => {
                        if (!reader.result) return;

                        audioContext.decodeAudioData(reader.result as ArrayBuffer, async (audioBuffer) => {
                            if (audioBuffer.duration < 1) {
                                console.warn("Ses çok kısa.");
                                return;
                            }

                            realtimeBpm.analyzeFullBuffer(audioBuffer)
                                .then(topCandidates => {
                                    if (topCandidates.length === 0) {
                                        console.warn("BPM bulunamadı. Dosyayı kontrol et.");
                                        return;
                                    }

                                    const bpms = topCandidates.map(c => c.tempo);
                                    console.log('Tahmini BPM adayları:', bpms);
                                });
                        });
                    });
                    reader.readAsArrayBuffer(file);*/