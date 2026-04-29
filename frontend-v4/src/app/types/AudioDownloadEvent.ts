export type AudioDownloadEvent =
  | { type: 'loading'; isLoading: true }
  | { type: 'progress'; percent: number }
  | { type: 'complete'; data: ArrayBuffer }
  | { type: 'done'; isLoading: false }
  | { type: 'error'; error: any };
