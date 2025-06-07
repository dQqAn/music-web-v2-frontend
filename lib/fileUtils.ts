export async function sendRemoteFileRaw(file: File, savePath: string): Promise<boolean> {
  try {
    const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/database/saveFile/remote`, {
      method: 'POST',
      headers: {
        'Content-Type': file.type || 'application/octet-stream',
        'X-Filename': encodeURIComponent(file.name),
        'X-Path': encodeURIComponent(savePath),
      },
      body: file,
      credentials: 'include',
    });

    if (!response.ok) {
      console.warn('File upload failed:', response.statusText);
      return false;
    }

    const result = await response.json();
    return result.success === true;
  } catch (error) {
    console.error('Upload error:', error);
    return false;
  }
}

export async function sendLocalFileRaw(file: File, savePath: string): Promise<boolean> {
  try {
    const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/database/saveFile/local`, {
      method: 'POST',
      headers: {
        'Content-Type': file.type || 'application/octet-stream',
        'X-Filename': encodeURIComponent(file.name),
        'X-Path': encodeURIComponent(savePath),
      },
      body: file,
      credentials: 'include',
    });

    if (!response.ok) {
      console.warn('File upload failed:', response.statusText);
      return false;
    }

    const result = await response.json();
    return result.success === true;
  } catch (error) {
    console.error('Upload error:', error);
    return false;
  }
}

