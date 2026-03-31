import { NextRequest } from "next/server";

export const runtime = "nodejs";

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const imageFile = formData.get("image_file");

    if (!imageFile || !(imageFile instanceof File)) {
      return Response.json(
        { error: "请提供图片文件" },
        { status: 400 }
      );
    }

    const apiKey = process.env.REMOVE_BG_API_KEY;

    if (!apiKey) {
      return Response.json(
        { error: "API 未配置，请联系管理员" },
        { status: 500 }
      );
    }

    const removeBgFormData = new FormData();
    removeBgFormData.append("image_file", imageFile);
    removeBgFormData.append("size", "auto");

    const response = await fetch("https://api.remove.bg/v1.0/removebg", {
      method: "POST",
      headers: {
        "X-Api-Key": apiKey,
      },
      body: removeBgFormData,
    });

    if (!response.ok) {
      let errorMessage = "API 请求失败";
      try {
        const errorData = await response.json();
        if (errorData.errors?.[0]?.title) {
          errorMessage = errorData.errors[0].title;
        }
      } catch {
        // ignore parse error
      }
      return Response.json(
        { error: errorMessage },
        { status: response.status }
      );
    }

    const resultBuffer = await response.arrayBuffer();

    if (resultBuffer.byteLength === 0) {
      return Response.json(
        { error: "API 返回空结果" },
        { status: 502 }
      );
    }

    return new Response(resultBuffer, {
      status: 200,
      headers: {
        "Content-Type": "image/png",
        "Cache-Control": "no-cache",
      },
    });
  } catch (err) {
    console.error("Remove background error:", err);
    return Response.json(
      { error: "服务器内部错误" },
      { status: 500 }
    );
  }
}
