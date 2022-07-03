export interface CameraOpt {
  audio: boolean;
  video: 'front' | 'rear';
}

export interface DisplayOpt {
  audio: boolean;
  framerate: '60' | '30' | '15' | '5';
  resolution: 'source' | '1080' | '720' | '480';
}

export function getCameraOpt(): CameraOpt | null {
  try {
    if (localStorage.getItem('cameraOpt') !== null)
      // @ts-ignore
      return JSON.parse(localStorage.getItem('cameraOpt'));
  } catch {
    return null;
  }
  return null;
}

export function setCameraOpt(opt: CameraOpt) {
  localStorage.setItem('cameraOpt', JSON.stringify(opt));
}

export function getDisplayOpt(): DisplayOpt | null {
  try {
    if (localStorage.getItem('displayOpt') !== null)
      // @ts-ignore
      return JSON.parse(localStorage.getItem('displayOpt'));
  } catch {
    return null;
  }
  return null;
}

export function setDisplayOpt(opt: DisplayOpt) {
  localStorage.setItem('displayOpt', JSON.stringify(opt));
}
