export default class ImageApp {
  constructor(galleryManager) {
    this.galleryManager = galleryManager;
    this.nameInput = document.getElementById('image-name');
    this.urlInput = document.getElementById('image-url');
    this.addButton = document.getElementById('add-btn');
    this.errorMessage = document.getElementById('error-message');
    this.inputContainer = document.querySelector('.input-container');

    this.setupListeners();
  }

  setupListeners() {
    this.addButton.addEventListener('click', () => this.tryAddImage());
    this.inputContainer.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') {
        this.tryAddImage();
      }
    });
  }

  async tryAddImage() {
    const name = this.nameInput.value.trim();
    const url = this.urlInput.value.trim();

    this.errorMessage.textContent = '';

    if (!name || !url) {
      this.showError('Пожалуйста, заполните все поля');
      return;
    }

    const isValid = await ImageValidator.validateImage(url);
    if (isValid) {
      this.galleryManager.addImage({
        name, url
      });
      this.nameInput.value = '';
      this.urlInput.value = '';
    } else {
      this.showError('Неверный URL изображения');
    }
  }

  showError(message) {
    this.errorMessage.textContent = message;
  }
}

export class ImageValidator {
  static validateImage(url) {
    return new Promise((resolve) => {
      const img = new Image();
      img.onload = () => resolve(true);
      img.onerror = () => resolve(false);
      img.src = url;
    });
  }
}