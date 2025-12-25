export default class ImageApp {
  constructor(galleryManager) {
    this.galleryManager = galleryManager;
    this.dropZone = document.getElementById('drop-zone');
    this.fileInput = document.getElementById('file-input');
    this.errorMessage = document.getElementById('error-message');

    this.setupListeners();
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

  handleFiles(files) {
    this.errorMessage.textContent = '';

    for (let i = 0; i < files.length; i++) {
      const file = files[i];

      // Проверить, является ли файл изображением
      if (file.type.startsWith('image/')) {
        this.addImageFromFile(file);
      } else {
        this.showError('Файл не является изображением');
      }
    }
  }

  addImageFromFile(file) {
    // Создать URL для загруженного файла
    const imageUrl = URL.createObjectURL(file);

    // Использовать имя файла как название
    const imageName = file.name;

    // Добавить изображение в галерею
    this.galleryManager.addImage({
      name: imageName,
      url: imageUrl,
    });
  }

  showError(message) {
    this.errorMessage.textContent = message;
  }
}