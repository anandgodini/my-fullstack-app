import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey =
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ||
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

export const supabase =
  supabaseUrl && supabaseKey ? createClient(supabaseUrl, supabaseKey) : null;

/**
 * Upload one or multiple files.
 * If Supabase is configured, uploads directly to Supabase Storage (bucket: 'media')
 * to bypass Vercel's 4.5MB serverless function body size limit.
 */
export async function uploadFiles(files: FileList | File[]): Promise<{ success: boolean; message: string; data?: any[] }> {
  if (!files || files.length === 0) {
    return { success: false, message: "No files selected" };
  }

  const fileArray = Array.from(files);

  // If Supabase Storage is configured in client
  if (supabase) {
    try {
      const uploadedRecords = [];

      for (const file of fileArray) {
        const ext = file.name.split(".").pop();
        const baseName = file.name.substring(0, file.name.lastIndexOf(".")).replace(/[^a-zA-Z0-9_-]/g, "_");
        const filePath = `${Date.now()}-${baseName}.${ext}`;

        const { data: uploadData, error: uploadError } = await supabase.storage
          .from("media")
          .upload(filePath, file, {
            cacheControl: "3600",
            upsert: false,
          });

        if (uploadError) {
          throw new Error(`Supabase Storage upload failed: ${uploadError.message}. Ensure the "media" bucket exists in your Supabase project.`);
        }

        const { data: urlData } = supabase.storage
          .from("media")
          .getPublicUrl(uploadData.path);

        uploadedRecords.push({
          fileName: file.name,
          fileUrl: urlData.publicUrl,
          mimeType: file.type,
          fileSize: file.size,
          title: baseName.replace(/_/g, " "),
          altText: baseName.replace(/_/g, " "),
        });
      }

      // Register uploaded files with our database
      const res = await fetch("/api/admin/media", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(uploadedRecords),
      });

      const json = await res.json();
      return json;
    } catch (err: any) {
      console.error("Direct Supabase upload error:", err);
      return { success: false, message: err.message || "Failed to upload to cloud storage" };
    }
  }

  // Fallback: Upload via Vercel API Route
  // Check if any file exceeds Vercel Serverless Function limit (~4.5MB)
  for (const file of fileArray) {
    if (file.size > 4 * 1024 * 1024) {
      return {
        success: false,
        message: `File "${file.name}" is ${(file.size / (1024 * 1024)).toFixed(1)}MB, which exceeds Vercel's 4.5MB serverless limit. Please add NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY to your Vercel Environment Variables.`,
      };
    }
  }

  const formData = new FormData();
  for (const file of fileArray) {
    formData.append("files", file);
  }

  try {
    const res = await fetch("/api/admin/media", {
      method: "POST",
      body: formData,
    });
    return await res.json();
  } catch (err: any) {
    return { success: false, message: err.message || "Network error uploading file" };
  }
}
