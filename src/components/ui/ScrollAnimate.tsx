"use client";

import { useEffect, useRef, ReactNode } from "react";

interface ScrollAnimateProps {
  children: ReactNode;
  className?: string;
  delay?: number; // Delay in milliseconds
}

export default function ScrollAnimate({
  children,
  className = "",
  delay = 0,
}: ScrollAnimateProps) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    if (typeof IntersectionObserver === "undefined") {
      el.classList.add("is-revealed");
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setTimeout(() => {
              entry.target.classList.add("is-revealed");
            }, delay);
            observer.unobserve(entry.target);
          }
        });
      },
      {
        threshold: 0.01,
        rootMargin: "100px 0px 100px 0px",
      }
    );

    observer.observe(el);

    // Mobile fallback timer to guarantee content visibility
    const fallbackTimer = setTimeout(() => {
      if (el) el.classList.add("is-revealed");
    }, 1000 + delay);

    return () => {
      clearTimeout(fallbackTimer);
      if (el) observer.unobserve(el);
    };
  }, [delay]);

  return (
    <div ref={ref} className={`reveal-on-scroll ${className}`}>
      {children}
    </div>
  );
}
