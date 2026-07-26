export const getPremiumImageUrl = (url) => {
  // The user requested to serve the exact original image quality as uploaded.
  // Returning the raw Cloudinary URL bypasses any transformations and 
  // serves the exact byte-for-byte original file.
  return url;
};
