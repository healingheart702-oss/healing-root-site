// js/cloudinary.js
export const CLOUDINARY = {
  cloudName: "dd7dre9hd",
  apiKey: "436638471543752",
  unsignedPreset: "unsigned_upload", // your unsigned preset
  uploadUrl: (cloudName) => `https://api.cloudinary.com/v1_1/${cloudName}/upload`
};
