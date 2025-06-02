import { parseFile } from 'music-metadata';

const mp3Duration = require('mp3-duration') as (file: string | Buffer) => Promise<number>;

export const getAudioDurationInSeconds = async (
    file: string,
): Promise<number> => {
    const { format } = await parseFile(file);
    return format.duration ? Math.round(format.duration) : -1;
};

export const getMp3DurationInSeconds = async (file: string) =>
    Math.round(await mp3Duration(file).catch(() => -1));
