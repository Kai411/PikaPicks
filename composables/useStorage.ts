export const useStorage = () => {
  const config = useRuntimeConfig();

  const uploadImage = async (file: File): Promise<string> => {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("upload_preset", config.public.cloudinaryUploadPreset);
    formData.append("folder", "poketcg-auctions");

    const response = await fetch(
      `https://api.cloudinary.com/v1_1/${config.public.cloudinaryCloudName}/image/upload`,
      { method: "POST", body: formData },
    );

    if (!response.ok) {
      throw new Error("Failed to upload image");
    }

    const data = await response.json();
    return data.secure_url;
  };

  const uploadAuctionImages = async (files: File[]): Promise<string[]> => {
    const urls: string[] = [];
    for (const file of files) {
      const url = await uploadImage(file);
      urls.push(url);
    }
    return urls;
  };

  return { uploadImage, uploadAuctionImages };
};
