const { contextBridge, desktopCapturer } = require('electron');

const captureFrame = async (preferredSourceId, thumbnailSize = { width: 1280, height: 720 }) => {
  const sources = await desktopCapturer.getSources({
    types: ['screen'],
    fetchWindowIcons: true,
    thumbnailSize
  });

  const source = sources.find((candidate) => candidate.id === preferredSourceId) || sources[0];

  if (!source) {
    throw new Error('No available screens to capture');
  }

  const dataUrl = source.thumbnail.toDataURL();
  return {
    sourceId: source.id,
    sourceName: source.name,
    capturedAt: Date.now(),
    dataUrl
  };
};

contextBridge.exposeInMainWorld('dayflow', {
  captureFrame
});
