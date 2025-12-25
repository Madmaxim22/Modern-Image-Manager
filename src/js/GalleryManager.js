export default class GalleryManager {
  constructor(galleryElement) {
    this.galleryElement = galleryElement;
  }

  addImage(imageData) {
    const { name, url } = imageData;

    const imageBlock = document.createElement('div');
    imageBlock.className = 'image-block';

    const img = document.createElement('img');
    img.src = url;
    img.alt = name;

    const deleteBtn = document.createElement('button');
    deleteBtn.className = 'delete-btn';
    deleteBtn.innerHTML = '&times;';
    deleteBtn.onclick = () => {
      imageBlock.remove();
    };

    imageBlock.append(img, deleteBtn);
    this.galleryElement.append(imageBlock);
  }
}