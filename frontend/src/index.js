import './css/style.css';
import GalleryManager from './js/GalleryManager';
import ImageApp from './js/ImageApp';

const galleryManager = new GalleryManager(document.getElementById('gallery'));
new ImageApp(galleryManager);