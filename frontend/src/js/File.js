/**
 * Класс, представляющий файл
 */
export default class File {
  /**
   * Создает новую карточку
   * @param {Object} options - Параметры заявки
   * @param {string} options.id - идентификатор (уникальный в пределах системы)
   * @param {string} options.filename - имя файла
   * @param {string} options.path  - путь, по которому можно получить файл
   */
  constructor(options) {
    this.id = options.id;
    this.filename = options.filename;
    this.path = options.path;
  }
}
