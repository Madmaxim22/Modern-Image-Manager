import ApiService from './ApiService.js';
import File from './File.js';

export default class GalleryManager {
  constructor(galleryElement) {
    this.galleryElement = galleryElement;
  }

  addImage(imageData) {
    const { id, name, url } = imageData;

    const imageBlock = document.createElement('div');
    imageBlock.className = 'image-block';
    // Добавляем data-атрибут для хранения ID файла
    imageBlock.dataset.fileId = id;

    const img = document.createElement('img');
    img.src = url;
    img.alt = name || 'Изображение в галерее';

    const deleteBtn = document.createElement('button');
    deleteBtn.className = 'delete-btn';
    deleteBtn.innerHTML = '&times;';
    deleteBtn.onclick = async () => {
      await this.deleteImage(id);
      imageBlock.remove();
    };

    imageBlock.append(img, deleteBtn);
    this.galleryElement.append(imageBlock);
  }

  async deleteImage(id) {
    try {
      await ApiService.deleteImage(id);
    } catch (error) {
      console.error('Error deleting file:', error);
    }
  }
}
