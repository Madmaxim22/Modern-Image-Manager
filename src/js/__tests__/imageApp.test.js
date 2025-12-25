import ImageApp, { ImageValidator } from '../ImageApp';

// Мок для galleryManager
class MockGalleryManager {
  constructor() {
    this.images = [];
  }

  addImage(image) {
    this.images.push(image);
  }
}

describe('ImageValidator', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('validateImage', () => {
    it('должен возвращать true для валидного URL изображения', async () => {
      const mockImage = {
        onload: null,
        onerror: null,
        src: '',
      };

      window.Image = jest.fn(() => mockImage);

      const url = 'https://example.com/image.jpg';
      const validationPromise = ImageValidator.validateImage(url);

      // Имитируем успешную загрузку изображения
      mockImage.onload();

      const result = await validationPromise;
      expect(result).toBe(true);
      expect(window.Image).toHaveBeenCalled();
      expect(mockImage.src).toBe(url);
    });

    it('должен возвращать false для невалидного URL изображения', async () => {
      const mockImage = {
        onload: null,
        onerror: null,
        src: '',
      };

      window.Image = jest.fn(() => mockImage);

      const url = 'https://example.com/invalid.jpg';
      const validationPromise = ImageValidator.validateImage(url);

      // Имитируем ошибку загрузки изображения
      mockImage.onerror();

      const result = await validationPromise;
      expect(result).toBe(false);
      expect(window.Image).toHaveBeenCalled();
      expect(mockImage.src).toBe(url);
    });
  });
});

describe('ImageApp', () => {
  let galleryManager;
  let imageApp;
  let mockElements;

  beforeEach(() => {
    // Создаем мок-объекты для DOM элементов
    mockElements = {
      nameInput: {
        value: '', addEventListener: jest.fn()
      },
      urlInput: {
        value: '', addEventListener: jest.fn()
      },
      addButton: { addEventListener: jest.fn() },
      errorMessage: { textContent: '' },
      inputContainer: { addEventListener: jest.fn() },
    };

    // Мокаем методы document (jsdom уже предоставляет их)
    document.getElementById = jest.fn((id) => {
      const elements = {
        'image-name': mockElements.nameInput,
        'image-url': mockElements.urlInput,
        'add-btn': mockElements.addButton,
        'error-message': mockElements.errorMessage,
      };
      return elements[id];
    });

    document.querySelector = jest.fn(() => mockElements.inputContainer);

    galleryManager = new MockGalleryManager();
    imageApp = new ImageApp(galleryManager);

    // Мокаем ImageValidator для большинства тестов
    jest.spyOn(ImageValidator, 'validateImage').mockResolvedValue(true);
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe('constructor', () => {
    it('должен инициализировать свойства правильно', () => {
      expect(imageApp.galleryManager).toBe(galleryManager);
      expect(imageApp.nameInput).toBe(mockElements.nameInput);
      expect(imageApp.urlInput).toBe(mockElements.urlInput);
      expect(imageApp.addButton).toBe(mockElements.addButton);
      expect(imageApp.errorMessage).toBe(mockElements.errorMessage);
      expect(imageApp.inputContainer).toBe(mockElements.inputContainer);
    });

    it('должен настраивать обработчики событий', () => {
      expect(mockElements.addButton.addEventListener).toHaveBeenCalledWith(
        'click',
        expect.any(Function)
      );
      expect(mockElements.inputContainer.addEventListener).toHaveBeenCalledWith(
        'keydown',
        expect.any(Function)
      );
    });
  });

  describe('tryAddImage', () => {
    it('должен добавлять изображение когда имя и URL валидны', async () => {
      mockElements.nameInput.value = 'Test Image';
      mockElements.urlInput.value = 'https://example.com/image.jpg';

      await imageApp.tryAddImage();

      expect(galleryManager.images).toHaveLength(1);
      expect(galleryManager.images[0]).toEqual({
        name: 'Test Image',
        url: 'https://example.com/image.jpg',
      });
      expect(mockElements.nameInput.value).toBe('');
      expect(mockElements.urlInput.value).toBe('');
      expect(mockElements.errorMessage.textContent).toBe('');
    });

    it('должен показывать ошибку когда имя пустое', async () => {
      mockElements.nameInput.value = '';
      mockElements.urlInput.value = 'https://example.com/image.jpg';

      await imageApp.tryAddImage();

      expect(galleryManager.images).toHaveLength(0);
      expect(mockElements.errorMessage.textContent).toBe('Пожалуйста, заполните все поля');
    });

    it('должен показывать ошибку когда URL пустой', async () => {
      mockElements.nameInput.value = 'Test Image';
      mockElements.urlInput.value = '';

      await imageApp.tryAddImage();

      expect(galleryManager.images).toHaveLength(0);
      expect(mockElements.errorMessage.textContent).toBe('Пожалуйста, заполните все поля');
    });

    it('должен показывать ошибку когда оба поля пустые', async () => {
      mockElements.nameInput.value = '';
      mockElements.urlInput.value = '';

      await imageApp.tryAddImage();

      expect(galleryManager.images).toHaveLength(0);
      expect(mockElements.errorMessage.textContent).toBe('Пожалуйста, заполните все поля');
    });

    it('должен показывать ошибку когда валидация изображения не удалась', async () => {
      mockElements.nameInput.value = 'Test Image';
      mockElements.urlInput.value = 'https://example.com/invalid.jpg';

      ImageValidator.validateImage.mockResolvedValueOnce(false);

      await imageApp.tryAddImage();

      expect(galleryManager.images).toHaveLength(0);
      expect(mockElements.errorMessage.textContent).toBe('Неверный URL изображения');
    });

    it('должен обрезать пробелы в полях ввода', async () => {
      mockElements.nameInput.value = '  Test Image  ';
      mockElements.urlInput.value = '  https://example.com/image.jpg  ';

      await imageApp.tryAddImage();

      expect(galleryManager.images[0].name).toBe('Test Image');
      expect(galleryManager.images[0].url).toBe('https://example.com/image.jpg');
    });

    it('должен очищать сообщение об ошибке перед валидацией', async () => {
      // Сначала устанавливаем какое-то сообщение об ошибке
      mockElements.errorMessage.textContent = 'Previous error';
      mockElements.nameInput.value = 'Test Image';
      mockElements.urlInput.value = 'https://example.com/image.jpg';

      await imageApp.tryAddImage();

      expect(mockElements.errorMessage.textContent).toBe('');
    });
  });

  describe('showError', () => {
    it('должен устанавливать текст сообщения об ошибке', () => {
      const errorMessage = 'Test error message';
      imageApp.showError(errorMessage);

      expect(mockElements.errorMessage.textContent).toBe(errorMessage);
    });
  });

  describe('event listeners', () => {
    it('должен вызывать tryAddImage при клике на кнопку', () => {
      const clickHandler = mockElements.addButton.addEventListener.mock.calls
        .find(call => call[0] === 'click')[1];

      const tryAddImageSpy = jest.spyOn(imageApp, 'tryAddImage');

      clickHandler();

      expect(tryAddImageSpy).toHaveBeenCalled();
    });

    it('должен вызывать tryAddImage при нажатии Enter в контейнере ввода', () => {
      const keydownHandler = mockElements.inputContainer.addEventListener.mock.calls
        .find(call => call[0] === 'keydown')[1];

      const tryAddImageSpy = jest.spyOn(imageApp, 'tryAddImage');

      const enterEvent = { key: 'Enter' };
      keydownHandler(enterEvent);

      expect(tryAddImageSpy).toHaveBeenCalled();
    });

    it('не должен вызывать tryAddImage при нажатии других клавиш', () => {
      const keydownHandler = mockElements.inputContainer.addEventListener.mock.calls
        .find(call => call[0] === 'keydown')[1];

      const tryAddImageSpy = jest.spyOn(imageApp, 'tryAddImage');

      const otherKeyEvent = { key: 'a' };
      keydownHandler(otherKeyEvent);

      expect(tryAddImageSpy).not.toHaveBeenCalled();
    });
  });
});