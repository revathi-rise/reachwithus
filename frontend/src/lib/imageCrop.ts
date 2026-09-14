import { Area } from 'react-easy-crop';

const FEED_IMAGE_WIDTH = 1600;
const FEED_IMAGE_HEIGHT = 900;

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const image = new Image();
    image.onload = () => resolve(image);
    image.onerror = () => reject(new Error('The selected image could not be opened.'));
    image.src = src;
  });
}

/** Creates a 16:9 image that matches the public requirement-card frame. */
export async function createFeedImage(sourceUrl: string, crop: Area, originalName: string): Promise<File> {
  const image = await loadImage(sourceUrl);
  const canvas = document.createElement('canvas');
  canvas.width = FEED_IMAGE_WIDTH;
  canvas.height = FEED_IMAGE_HEIGHT;

  const context = canvas.getContext('2d');
  if (!context) throw new Error('Your browser could not prepare this image.');

  context.drawImage(
    image,
    crop.x,
    crop.y,
    crop.width,
    crop.height,
    0,
    0,
    FEED_IMAGE_WIDTH,
    FEED_IMAGE_HEIGHT,
  );

  const blob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, 'image/jpeg', 0.92));
  if (!blob) throw new Error('Your browser could not crop this image.');

  const filename = `${originalName.replace(/\.[^/.]+$/, '') || 'requirement-image'}-16x9.jpg`;
  return new File([blob], filename, { type: 'image/jpeg' });
}
