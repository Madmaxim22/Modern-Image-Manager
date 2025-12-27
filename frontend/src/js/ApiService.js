export default class ApiService {
  static baseUrl = 'http://localhost:7070';

  static async getImages() {
    try {
      const response = await fetch(`${this.baseUrl}/files`);

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error loading images from server:', error);
      throw error;
    }
  }

  static async uploadImage(file) {
    const formData = new FormData();
    const encodedName = encodeURIComponent(file.name);
    formData.append('file', file, encodedName);
    console.log(file);

    try {
      const response = await fetch(`${this.baseUrl}/files`, {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        // Получаем текст ошибки от сервера для более точной отладки
        const errorText = await response.text();
        throw new Error(
          `HTTP error! status: ${response.status}, message: ${errorText}`
        );
      }

      const result = await response.json();
      return result;
    } catch (error) {
      console.error('Error uploading file:', error);
      throw error;
    }
  }

  static async deleteImage(id) {
    try {
      const response = await fetch(`${this.baseUrl}/files/${id}`, { method: 'DELETE', });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return response;
    } catch (error) {
      console.error('Error deleting file:', error);
      throw error;
    }
  }
}
