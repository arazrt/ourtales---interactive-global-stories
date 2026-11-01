export function updateViewContent(container, content) {
  if (container) {
    container.innerHTML = content;
  }
}

export function showErrorMessage(message) {
  alert(message);
}

export function showSuccessMessage(message) {
  alert(message);
}

export function getMainContainer() {
  return document.getElementById('app');
}

export function navigateBack() {
  history.back();
}

export function navigateToHome() {
  location.hash = '#home';
}

export function logDebug(message, data = null) {
  if (data) {
    console.log(`[DEBUG] ${message}:`, data);
  } else {
    console.log(`[DEBUG] ${message}`);
  }
}

export function logError(message, error = null) {
  if (error) {
    console.error(`[ERROR] ${message}:`, error);
  } else {
    console.error(`[ERROR] ${message}`);
  }
} 