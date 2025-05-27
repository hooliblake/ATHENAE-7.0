import React from 'react';

export const loadImage = (url) => {
  return new Promise((resolve, reject) => {
    if (!url) {
      reject(new Error("Image URL is null or undefined"));
      return;
    }
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => resolve(img);
    img.onerror = (err) => {
      console.error(`Failed to load image: ${url}`, err);
      reject(err);
    };
    img.src = url;
  });
};