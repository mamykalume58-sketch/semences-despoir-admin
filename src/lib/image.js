// Compression + encodage base64 côté navigateur, partagé par tous les formulaires
// avec upload de photo (Projets, Actualités, Galerie...).
export const MAX_IMAGE_KB = 700; // marge sous la limite de 1 Mo par document Firestore

export function compressImageToBase64(file, maxWidth = 900, quality = 0.72) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        const scale = Math.min(1, maxWidth / img.width);
        const canvas = document.createElement('canvas');
        canvas.width = Math.round(img.width * scale);
        canvas.height = Math.round(img.height * scale);
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        resolve(canvas.toDataURL('image/jpeg', quality));
      };
      img.onerror = () => reject(new Error('Image illisible.'));
      img.src = event.target.result;
    };
    reader.onerror = () => reject(new Error('Lecture du fichier impossible.'));
    reader.readAsDataURL(file);
  });
}
