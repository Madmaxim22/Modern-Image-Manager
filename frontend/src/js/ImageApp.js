import ApiService from './ApiService.js';
import File from './File.js';

export default class ImageApp {
  constructor(galleryManager) {
    this.galleryManager = galleryManager;
    this.dropZone = document.getElementById('drop-zone');
    this.fileInput = document.getElementById('file-input');
    this.errorMessage = document.getElementById('error-message');

    this.setupListeners();
    this.loadImagesFromServer();
  }

  setupListeners() {
    // Обработчик клика по зоне перетаскивания для открытия диалога выбора файлов
    this.dropZone.addEventListener('click', (e) => {
      // Проверяем, что клик не был по input или другому элементу, который не должен открывать диалог
      if (
        e.target === this.dropZone ||
        e.target === this.dropZone.querySelector('p')
      ) {
        this.fileInput.click();
      }
    });

    // Обработчик изменения файла через input
    this.fileInput.addEventListener('change', (e) => {
      this.handleFiles(e.target.files);
      e.target.value = ''; // Сбросить значение input для возможности загрузки одного и того же файла дважды
    });

    // Обработчики событий перетаскивания
    this.dropZone.addEventListener('dragover', (e) => {
      e.preventDefault();
      this.dropZone.classList.add('drag-over');
    });

    this.dropZone.addEventListener('dragleave', () => {
      this.dropZone.classList.remove('drag-over');
    });

    this.dropZone.addEventListener('drop', (e) => {
      e.preventDefault();
      this.dropZone.classList.remove('drag-over');
      this.handleFiles(e.dataTransfer.files);
    });
  }

  async loadImagesFromServer() {
    try {
      const files = await ApiService.getImages();

      // Загружаем изображения в галерею
      for (const file of files) {
        this.galleryManager.addImage({
          id: file.id,
          name: file.originalName || file.id,
          url: `${ApiService.baseUrl}/uploads/${
            file.filename || file.path.split('/').pop()
          }`,
        });
      }
    } catch (error) {
      console.error('Error loading images from server:', error);
    }
  }

  async handleFiles(files) {
    this.errorMessage.textContent = '';

    for (let i = 0; i < files.length; i++) {
      const file = files[i];

      // Проверить, является ли файл изображением
      if (file.type.startsWith('image/')) {
        await this.uploadFileToServer(file);
      } else {
        this.showError('Файл не является изображением');
      }
    }
  }

  async uploadFileToServer(file) {
    try {
      const fileData = await ApiService.uploadImage(file);
      // Добавляем изображение в галерею с серверным URL
      this.galleryManager.addImage({
        id: fileData.id,
        name: fileData.originalName || fileData.id,
        // Используем имя файла, сохраненное в поле filename, с fallback на имя из path
        url: `${ApiService.baseUrl}/uploads/${
          fileData.filename || fileData.path.split('/').pop()
        }`,
      });
    } catch (error) {
      console.error('Error uploading file:', error);
      this.showError('Ошибка при загрузке файла');
    }
  }

  showError(message) {
    this.errorMessage.textContent = message;
  }
}
