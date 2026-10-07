/** Cloudflare Worker entry point for the vinext-starter template. */
import { handleImageOptimization, DEFAULT_DEVICE_SIZES, DEFAULT_IMAGE_SIZES } from "vinext/server/image-optimization";
import handler from "vinext/server/app-router-entry";

interface Env {
  ASSETS: Fetcher;
  OPENAI_API_KEY?: string;
  OPENAI_GBI_MODEL?: string;
  OPENAI_INVENTORY_MODEL?: string;
  NEXT_PUBLIC_MATTERPORT_SDK_KEY?: string;
  DB: D1Database;
  IMAGES: {
    input(stream: ReadableStream): {
      transform(options: Record<string, unknown>): {
        output(options: { format: string; quality: number }): Promise<{ response(): Response }>;
      };
    };
  };
}

interface ExecutionContext {
  waitUntil(promise: Promise<unknown>): void;
  passThroughOnException(): void;
}

// Image security config. SVG sources with .svg extension auto-skip the
// optimization endpoint on the client side (served directly, no proxy).
// To route SVGs through the optimizer (with security headers), set
// dangerouslyAllowSVG: true in next.config.js and uncomment below:
// const imageConfig: ImageConfig = { dangerouslyAllowSVG: true };

const worker = {
  async fetch(request: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
    const url = new URL(request.url);

    if (url.pathname === "/_vinext/image") {
      const allowedWidths = [...DEFAULT_DEVICE_SIZES, ...DEFAULT_IMAGE_SIZES];
      return handleImageOptimization(request, {
        fetchAsset: (path) => env.ASSETS.fetch(new Request(new URL(path, request.url))),
        transformImage: async (body, { width, format, quality }) => {
          const result = await env.IMAGES.input(body).transform(width > 0 ? { width } : {}).output({ format, quality });
          return result.response();
        },
      }, allowedWidths);
    }

    // Bridge Cloudflare bindings into process.env for vinext route handlers.
    // This keeps server secrets available at runtime and avoids relying on
    // build-time NEXT_PUBLIC injection for the Matterport SDK key.
    if (env.OPENAI_API_KEY) process.env.OPENAI_API_KEY = env.OPENAI_API_KEY;
    if (env.OPENAI_GBI_MODEL) process.env.OPENAI_GBI_MODEL = env.OPENAI_GBI_MODEL;
    if (env.OPENAI_INVENTORY_MODEL) process.env.OPENAI_INVENTORY_MODEL = env.OPENAI_INVENTORY_MODEL;
    if (env.NEXT_PUBLIC_MATTERPORT_SDK_KEY) {
      process.env.NEXT_PUBLIC_MATTERPORT_SDK_KEY = env.NEXT_PUBLIC_MATTERPORT_SDK_KEY;
    }

    return handler.fetch(request, env, ctx);
  },
};

export default worker;
