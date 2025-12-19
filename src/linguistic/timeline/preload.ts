import PreloadPlugin from "@jspsych/plugin-preload";

export function createPreloadTimeline(assetPaths: any) {
  return {
    type: PreloadPlugin,
    images: assetPaths.images,
    audio: assetPaths.audio,
    video: assetPaths.video,
  };
}