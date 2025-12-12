// js/cloudinary.js
export const CLOUDINARY = {
  cloudName: "dd7dre9hd",
  unsignedPreset: "unsigned_upload",
  uploadUrl: (cloudName) => `https://api.cloudinary.com/v1_1/${cloudName}/upload`
};
