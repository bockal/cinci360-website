"use client";

import Link from "next/link";
import { useEffect, useRef } from "react";
import "./brand.css";

type LottieAnimation = {
  destroy: () => void;
  setSpeed: (speed: number) => void;
  setDirection: (direction: 1 | -1) => void;
  play: () => void;
  addEventListener: (event: "complete", handler: () => void) => void;
  removeEventListener: (event: "complete", handler: () => void) => void;
};

export default function AnimatedBrand() {
  const container = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    let cancelled = false;
    let animation: LottieAnimation | undefined;
    let direction: 1 | -1 = 1;

    const onComplete = () => {
      if (!animation) return;
      direction = direction === 1 ? -1 : 1;
      animation.setDirection(direction);
      animation.play();
    };

    import("lottie-web/build/player/lottie_light").then(module => {
      if (cancelled || !container.current) return;
      const lottie = (module.default ?? module) as unknown as {
        loadAnimation: (options: object) => LottieAnimation;
      };
      animation = lottie.loadAnimation({
        container: container.current,
        renderer: "svg",
        loop: false,
        autoplay: true,
        path: "/assets/lottie/tripod-mark.json",
      });
      animation.setSpeed(.9);
      animation.addEventListener("complete", onComplete);
    });

    return () => {
      cancelled = true;
      if (animation) animation.removeEventListener("complete", onComplete);
      animation?.destroy();
    };
  }, []);

  return <Link className="brand animated-brand" href="/" aria-label="Cinci360 home">
    <span>Cinci</span><strong>360</strong>
    <span className="brand-tripod"><span ref={container} className="lottie-player" aria-hidden="true" /></span>
  </Link>;
}
