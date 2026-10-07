interface Env {
  NEXT_PUBLIC_MATTERPORT_SDK_KEY?: string;
}

export const onRequestGet: PagesFunction<Env> = async ({ env }) => {
  return new Response(
    JSON.stringify({ matterportSdkKey: env.NEXT_PUBLIC_MATTERPORT_SDK_KEY || "" }),
    {
      headers: {
        "content-type": "application/json; charset=utf-8",
        "cache-control": "no-store",
      },
    },
  );
};
