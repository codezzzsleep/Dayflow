const captureButton = document.getElementById('toggleCapture');
const markerButton = document.getElementById('addMarker');
const captureStatus = document.getElementById('captureStatus');
const liveThumbnail = document.getElementById('liveThumbnail');
const liveTitle = document.getElementById('liveTitle');
const liveSubtitle = document.getElementById('liveSubtitle');
const frameCount = document.getElementById('frameCount');
const markerCount = document.getElementById('markerCount');
const blockCount = document.getElementById('blockCount');
const timeline = document.getElementById('timeline');

const CAPTURE_INTERVAL_MS = 1000;
const BLOCK_INTERVAL_MS = 15 * 60 * 1000;

let captureHandle = null;
let selectedSourceId = null;
const frames = [];
const markers = [];

const formatTime = (timestamp) => new Date(timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

const summarizeBlock = (blockFrames) => {
  const first = blockFrames[0];
  const last = blockFrames[blockFrames.length - 1];
  const duration = Math.max(1, Math.round((last.capturedAt - first.capturedAt) / 1000));
  const intervalMinutes = Math.ceil(duration / 60);
  return {
    title: `${blockFrames.length} frames · ~${intervalMinutes} min` ,
    subtitle: `From ${formatTime(first.capturedAt)} to ${formatTime(last.capturedAt)} on ${first.sourceName}`,
    preview: last.dataUrl
  };
};

const groupFrames = () => {
  const groups = new Map();
  for (const frame of frames) {
    const bucket = Math.floor(frame.capturedAt / BLOCK_INTERVAL_MS);
    const key = `${bucket}`;
    if (!groups.has(key)) {
      groups.set(key, []);
    }
    groups.get(key).push(frame);
  }
  return Array.from(groups.entries())
    .sort((a, b) => Number(b[0]) - Number(a[0]))
    .map(([, blockFrames]) => summarizeBlock(blockFrames));
};

const renderMetrics = () => {
  frameCount.textContent = frames.length.toString();
  markerCount.textContent = markers.length.toString();
  blockCount.textContent = groupFrames().length.toString();
};

const renderTimeline = () => {
  const blocks = groupFrames();
  timeline.innerHTML = '';

  if (!blocks.length) {
    const empty = document.createElement('div');
    empty.className = 'empty-state';
    empty.textContent = 'Start capturing to build your first 15-minute block.';
    timeline.appendChild(empty);
    return;
  }

  for (const block of blocks) {
    const card = document.createElement('article');
    card.className = 'timeline-card';

    const preview = document.createElement('img');
    preview.src = block.preview;
    preview.alt = block.title;

    const text = document.createElement('div');
    const title = document.createElement('p');
    title.className = 'card-title';
    title.textContent = block.title;

    const subtitle = document.createElement('p');
    subtitle.className = 'card-subtitle';
    subtitle.textContent = block.subtitle;

    text.appendChild(title);
    text.appendChild(subtitle);
    card.appendChild(preview);
    card.appendChild(text);

    timeline.appendChild(card);
  }
};

const updateLiveView = (frame) => {
  if (!frame) {
    liveThumbnail.removeAttribute('src');
    liveTitle.textContent = 'Waiting to capture…';
    liveSubtitle.textContent = '';
    captureStatus.textContent = 'Idle';
    captureStatus.className = 'chip';
    return;
  }

  liveThumbnail.src = frame.dataUrl;
  liveTitle.textContent = `Screen: ${frame.sourceName}`;
  liveSubtitle.textContent = `Captured at ${formatTime(frame.capturedAt)}`;
  captureStatus.textContent = 'Recording';
  captureStatus.className = 'chip active';
};

const addMarker = () => {
  const now = Date.now();
  markers.push({ label: `Marker ${markers.length + 1}`, at: now });
  markerCount.textContent = markers.length.toString();
};

const captureOnce = async () => {
  try {
    const frame = await window.dayflow.captureFrame(selectedSourceId, { width: 960, height: 540 });
    selectedSourceId = frame.sourceId;
    frames.push(frame);
    updateLiveView(frame);
    renderMetrics();
    renderTimeline();
  } catch (error) {
    console.error(error);
    captureStatus.textContent = 'Permission required';
    captureStatus.className = 'chip warning';
    liveTitle.textContent = 'Unable to capture screen';
    liveSubtitle.textContent = 'Check OS permissions for screen recording.';
  }
};

const startCapture = () => {
  if (captureHandle) return;
  captureHandle = setInterval(captureOnce, CAPTURE_INTERVAL_MS);
  captureButton.textContent = 'Stop capture';
  captureButton.classList.add('danger');
};

const stopCapture = () => {
  if (!captureHandle) return;
  clearInterval(captureHandle);
  captureHandle = null;
  captureButton.textContent = 'Start capture';
  captureButton.classList.remove('danger');
  captureStatus.textContent = 'Paused';
  captureStatus.className = 'chip muted';
};

captureButton.addEventListener('click', () => {
  if (captureHandle) {
    stopCapture();
  } else {
    startCapture();
    captureOnce();
  }
});

markerButton.addEventListener('click', addMarker);

renderTimeline();
renderMetrics();
updateLiveView();
