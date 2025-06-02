import { parseFile } from 'music-metadata';
import mp3Duration from 'mp3-duration';

export const getAudioDurationInSeconds = async (
    file: string,
): Promise<number> => {
    const { format } = await parseFile(file);
    return format.duration ? Math.round(format.duration) : -1;
};

export const getMp3DurationInSeconds = async (file: string) =>
    Math.round(await mp3Duration(file).catch(() => -1));
