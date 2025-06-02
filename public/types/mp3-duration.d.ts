declare module 'mp3-duration' {
    function getDuration(
      filePath: string | Buffer,
      cb: (err: Error | null, duration: number) => void
    ): void;
  
    function getDuration(
      filePath: string | Buffer
    ): Promise<number>;
  
    export = getDuration;
  }
  