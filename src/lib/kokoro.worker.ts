import { KokoroTTS } from 'kokoro-js';

let ttsInstance: Awaited<ReturnType<typeof KokoroTTS.from_pretrained>> | null = null;

self.addEventListener('message', async (e: MessageEvent) => {
  const { type, payload, id } = e.data;

  if (type === 'LOAD') {
    try {
      if (!ttsInstance) {
        ttsInstance = await KokoroTTS.from_pretrained('onnx-community/Kokoro-82M-v1.0-ONNX', {
          dtype: 'q8',
          device: 'wasm',
        });
      }
      self.postMessage({ type: 'LOAD_COMPLETE', id });
    } catch (err: unknown) {
      self.postMessage({ type: 'ERROR', id, error: (err as Error).message });
    }
  }

  if (type === 'GENERATE') {
    try {
      if (!ttsInstance) throw new Error("Model not loaded");
      const result = await ttsInstance.generate(payload.text, {
        voice: payload.voice
      });
      const audioData = result.audio; // Float32Array
      // We send the Float32Array and transfer its underlying ArrayBuffer to the main thread
      self.postMessage(
        { type: 'GENERATE_COMPLETE', id, result: { sampling_rate: result.sampling_rate, audio: audioData } },
        { transfer: [audioData.buffer] }
      );
    } catch (err: unknown) {
      self.postMessage({ type: 'ERROR', id, error: (err as Error).message });
    }
  }
});
