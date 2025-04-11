import axios from 'axios';

export async function download_files(files) {
  async function download_next(i) {
    if (i >= files.length) {
      return;
    }

    const file = files[i];

    try {
      const response = await axios.get(file.download, { responseType: 'blob' });

      //download the exact file
      const contentDisposition = response.headers['content-disposition'];
      const filenameMatch = contentDisposition && contentDisposition.match(/filename="(.+?)"/);
      const suggestedFilename = filenameMatch ? filenameMatch[1] : null;

      const blob = new Blob([response.data], { type: response.headers['content-type'] });

      const link = document.createElement('a');
      link.href = window.URL.createObjectURL(blob);
      link.download = suggestedFilename || file.filename || `file_${i + 1}`;

      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (error) {
      console.error(`Error downloading file ${file.filename}:`, error);
    }

    // Download the next file with a small timeout.
    setTimeout(() => download_next(i + 1), 500);
  }

  // Initiate the first download.
  download_next(0);
}