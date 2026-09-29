import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const data = await req.formData();
    const file = data.get("file") as File;
    if (!file) return NextResponse.json({ error: "No file" }, { status: 400 });

    const bytes = await file.arrayBuffer();
    const base64 = Buffer.from(bytes).toString("base64");
    const dataUri = "data:" + file.type + ";base64," + base64;

    const body = new URLSearchParams();
    body.append("file", dataUri);
    body.append("upload_preset", "adyots_upload");
    body.append("folder", "adyots-contestants");

    const res = await fetch(
      "https://api.cloudinary.com/v1_1/" + process.env.CLOUDINARY_CLOUD_NAME + "/image/upload",
      { method: "POST", body }
    );

    const result = await res.json();
    if (!res.ok) return NextResponse.json({ error: result.error?.message || "Upload failed" }, { status: 500 });

    return NextResponse.json({ url: result.secure_url });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "Upload failed" }, { status: 500 });
  }
}
