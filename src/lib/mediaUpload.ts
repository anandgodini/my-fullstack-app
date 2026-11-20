import { createClient } from "@supabase/supabase-js";

const supabaseUrl =
  process.env.NEXT_PUBLIC_SUPABASE_URL ||
  "https://labquwxzzstgpskadvyw.supabase.co";

const supabaseKey =
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ||
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
  "sb_publishable_f5OE3HG9lClCY2c7HvkVJA_2mIZMkKE";

// Initialize Supabase only if both values are valid non-empty strings
export const supabase =
  supabaseUrl && supabaseKey && !supabaseUrl.includes("[YOUR")
    ? createClient(supabaseUrl, supabaseKey)
    : null;

/**
 * Compresses an image file in the browser using HTML5 Canvas.
 * Automatically resizes huge dimensions (>1920px) and outputs clean WebP.
 * Typically shrinks 5MB-15MB phone/camera photos down to 100KB-350KB.
 */
export async function compressImage(file: File): Promise<File> {
  // Only compress raster images; skip SVG and animated GIF
  if (
    !file.type.startsWith("image/") ||
    file.type === "image/svg+xml" ||
    file.type === "image/gif"
  ) {
    return file;
  }

  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        let width = img.width;
        let height = img.height;
        const maxDimension = 1920;

        if (width > maxDimension || height > maxDimension) {
          if (width > height) {
            height = Math.round((height * maxDimension) / width);
            width = maxDimension;
          } else {
            width = Math.round((width * maxDimension) / height);
            height = maxDimension;
          }
        }

        const canvas = document.createElement("canvas");
        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext("2d");
        if (!ctx) {
          return resolve(file);
        }

        ctx.drawImage(img, 0, 0, width, height);

        canvas.toBlob(
          (blob) => {
            if (!blob || blob.size >= file.size) {
              return resolve(file);
            }
            const cleanName =
              file.name.substring(0, file.name.lastIndexOf(".")) || file.name;
            const newFile = new File([blob], `${cleanName}.webp`, {
              type: "image/webp",
              lastModified: Date.now(),
            });
            resolve(newFile);
          },
          "image/webp",
          0.82
        );
      };
      img.onerror = () => resolve(file);
      img.src = e.target?.result as string;
    };
    reader.onerror = () => resolve(file);
    reader.readAsDataURL(file);
  });
}

/**
 * Converts a file to base64 Data URL.
 */
function fileToDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

/**
 * Universal upload function:
 * 1. Automatically compresses large images to eliminate Vercel 4.5MB payload limit.
 * 2. Attempts Supabase Storage upload if bucket is reachable.
 * 3. Falls back to embedded database storage (Base64 data URL), which is 100% persistent on Vercel and requires zero external cloud configuration.
 */
export async function uploadFiles(
  files: FileList | File[]
): Promise<{ success: boolean; message: string; data?: any[] }> {
  if (!files || files.length === 0) {
    return { success: false, message: "No files selected" };
  }

  const rawFiles = Array.from(files);
  const itemsToSave: Array<{
    fileName: string;
    fileUrl: string;
    mimeType: string;
    fileSize: number;
    title: string;
    altText: string;
  }> = [];

  for (const rawFile of rawFiles) {
    // 1. Client-side image compression
    const file = await compressImage(rawFile);

    // Enforce 4MB safety limit for non-image files
    if (file.size > 4 * 1024 * 1024) {
      return {
        success: false,
        message: `File "${file.name}" (${(file.size / (1024 * 1024)).toFixed(1)}MB) exceeds 4MB limit.`,
      };
    }

    const baseName =
      file.name.substring(0, file.name.lastIndexOf(".")) || file.name;
    const sanitizedTitle = baseName.replace(/[^a-zA-Z0-9_-]/g, " ");

    let uploadedUrl: string | null = null;

    // 2. Try Supabase Storage first if available
    if (supabase) {
      try {
        const ext = file.name.split(".").pop();
        const cleanName = baseName.replace(/[^a-zA-Z0-9_-]/g, "_");
        const filePath = `${Date.now()}-${cleanName}.${ext}`;

        const { data: uploadData, error: uploadError } = await supabase.storage
          .from("media")
          .upload(filePath, file, {
            cacheControl: "3600",
            upsert: false,
          });

        if (!uploadError && uploadData) {
          const { data: urlData } = supabase.storage
            .from("media")
            .getPublicUrl(uploadData.path);
          uploadedUrl = urlData.publicUrl;
        }
      } catch (e) {
        console.warn("Supabase Storage unavailable, falling back to database storage:", e);
      }
    }

    // 3. Fallback: Base64 Data URL (stored directly in PostgreSQL Media table)
    if (!uploadedUrl) {
      uploadedUrl = await fileToDataUrl(file);
    }

    itemsToSave.push({
      fileName: file.name,
      fileUrl: uploadedUrl,
      mimeType: file.type,
      fileSize: file.size,
      title: sanitizedTitle,
      altText: sanitizedTitle,
    });
  }

  // 4. Save metadata / records in PostgreSQL
  try {
    const res = await fetch("/api/admin/media", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(itemsToSave),
    });

    if (!res.ok) {
      const errText = await res.text();
      return {
        success: false,
        message: `Upload server error (${res.status}): ${errText.slice(0, 150)}`,
      };
    }

    const json = await res.json();
    return json;
  } catch (err: any) {
    return {
      success: false,
      message: err.message || "Failed to save media records",
    };
  }
}
