const STORAGE_KEY = 'hwWarningDismissed';

function isSoftwareRendering() {
  const strictGl =
    document.createElement('canvas').getContext('webgl2', { failIfMajorPerformanceCaveat: true }) ||
    document.createElement('canvas').getContext('webgl', { failIfMajorPerformanceCaveat: true });

  const gl =
    document.createElement('canvas').getContext('webgl2') ||
    document.createElement('canvas').getContext('webgl');

  if (!gl || !strictGl) return true;

  const debugInfo = gl.getExtension('WEBGL_debug_renderer_info');
  if (!debugInfo) return false;

  const renderer = gl.getParameter(debugInfo.UNMASKED_RENDERER_WEBGL);
  return /swiftshader|llvmpipe|software|basic render driver|softpipe/i.test(renderer);
}

function wasDismissed() {
  try {
    return localStorage.getItem(STORAGE_KEY) === 'true';
  } catch {
    return false;
  }
}

function showWarning() {
  if (wasDismissed()) return;

  const banner = document.getElementById('hw-warning');
  const closeBtn = document.getElementById('hw-warning-close');
  if (!banner || !closeBtn) return;

  banner.classList.remove('hidden');

  closeBtn.addEventListener('click', () => {
    banner.classList.add('hidden');
    try {
      localStorage.setItem(STORAGE_KEY, 'true');
    } catch {
    }
  }, { once: true });
}

export function setupHardwareWarning(game) {
  
  if (isSoftwareRendering()) {
    showWarning();
    return;
  }

  setTimeout(() => {
    if (game.loop.actualFps < 30) {
      showWarning();
    }
  }, 5000);
}