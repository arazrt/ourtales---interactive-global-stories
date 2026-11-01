import { updateViewContent, showErrorMessage, showSuccessMessage, getMainContainer } from '../view/base-view';

export class BasePresenter {
  constructor() {
    this.main = getMainContainer();
  }

  render() {
    throw new Error('render() method must be implemented by child class');
  }

  updateView(content) {
    updateViewContent(this.main, content);
  }

  showError(message) {
    showErrorMessage(message);
  }

  showSuccess(message) {
    showSuccessMessage(message);
  }
} 