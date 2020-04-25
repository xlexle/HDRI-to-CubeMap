import { hadrEmmisiveWorker } from '../workers/hdrEmissive.worker';

// eslint-disable-next-line import/prefer-default-export
export const hdrConverterEmmisive = (
  width,
  height,
  rgbeBuffer = new Uint8Array(),
  fromBottom = true,
) => new Promise((resolve) => {
  const blobURL = URL.createObjectURL(new Blob(['(', hadrEmmisiveWorker.toString(), ')()'], { type: 'application/javascript' }));
  const worker = new Worker(blobURL);
  worker.postMessage({
    rgbeBuffer, width, height, fromBottom,
  });

  worker.addEventListener('message', (event) => {
    if (!event.data.progress) {
      URL.revokeObjectURL(blobURL);
      const header = '#?RADIANCE\n# Made with HDRI-to-Cubemap\nFORMAT=32-bit_rle_rgbe\n';
      const blankSpace = '\n';
      const Resolution = `-Y ${height} +X ${width}\n`;
      const text = header + blankSpace + Resolution;
      const blob = new Blob([text, event.data.binary], { type: 'octet/stream' });
      resolve(blob);
    }
  });
});
