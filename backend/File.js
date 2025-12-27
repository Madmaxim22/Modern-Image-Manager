/**
 * Класс, представляющий файл
 */
module.exports = class File {
  /**
   * Создает новую карточку
   * @param {Object} options - Параметры заявки
   * @param {string} options.id - идентификатор (уникальный в пределах системы)
   * @param {string} options.originalname - имя файла
   * @param {string} options.filename - уникальное имя файла
   * @param {string} options.path  - путь, по которому можно получить файл http://localhost:3000/files/id
   * @param {Data} options.lastModifiedDate  - дата последней модификации 
   * @param {string} options.type  - дата последней модификации 
   * @param {string} options.size  - дата последней модификации 
   */
  constructor(options) {
    this.id = options.id;
    this.originalName = options.originalname;
    this.filename = options.filename;
    this.path = options.path;
    this.lastModifiedDate = options.lastModifiedDate;
    this.type = options.type;
    this.size = options.size;
  }
}
