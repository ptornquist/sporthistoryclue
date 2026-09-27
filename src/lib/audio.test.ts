import { afterEach, describe, expect, it } from "vitest";
import {
  CORRECT_NOTES,
  HAPTIC_PATTERNS,
  isSoundEnabled,
  playCorrect,
  playIncorrect,
  playPhotoReveal,
  playTileUnlock,
  setSoundEnabled,
  triggerHaptic,
} from "./audio";

describe("arena audio", () => {
  const previousWindow = globalThis.window;

  afterEach(() => {
    if (previousWindow === undefined) {
      Reflect.deleteProperty(globalThis, "window");
    } else {
      globalThis.window = previousWindow;
    }
  });

  it("defaults sound on, remembers a mute, and keeps the haptic patterns", () => {
    expect(isSoundEnabled()).toBe(true);
    expect(HAPTIC_PATTERNS).toEqual({
      light: 15,
      medium: 35,
      success: [40, 60, 80],
      error: [60, 50, 60],
    });
    expect([...CORRECT_NOTES]).toEqual([523.25, 659.25, 783.99]);

    const store = new Map<string, string>();
    Object.assign(globalThis, {
      window: {
        localStorage: {
          getItem: (key: string) => store.get(key) ?? null,
          setItem: (key: string, value: string) => {
            store.set(key, value);
          },
        },
      },
    });

    expect(isSoundEnabled()).toBe(true);
    setSoundEnabled(false);
    expect(store.get("shc_sound_enabled")).toBe("false");
    expect(isSoundEnabled()).toBe(false);
    setSoundEnabled(true);
    expect(isSoundEnabled()).toBe(true);

    store.delete("shc_sound_enabled");
    store.set("shc_muted", "true");
    expect(isSoundEnabled()).toBe(false);

    expect(() => {
      playTileUnlock();
      playPhotoReveal();
      playCorrect();
      playIncorrect();
      triggerHaptic("light");
      triggerHaptic("medium");
      triggerHaptic("success");
      triggerHaptic("error");
    }).not.toThrow();
  });
});
