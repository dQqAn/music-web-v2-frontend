import { parseFile } from 'music-metadata';

export const getAudioDurationInSeconds = async (
    file: string,
): Promise<number> => {
    const { format } = await parseFile(file);
    return format.duration ? Math.round(format.duration) : -1;
};
