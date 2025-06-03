import { parseBlob } from 'music-metadata';

export const getAudioDurationInSeconds = async (
    file: File | Blob,
): Promise<number> => {
    const { format } = await parseBlob(file);
    return format.duration ? Math.round(format.duration) : -1;
};
