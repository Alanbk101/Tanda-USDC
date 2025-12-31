import { useEffect, useRef } from "react";
import p5 from "p5";

interface PaperEagle {
  x: number;
  y: number;
  size: number;
  speed: number;
  wingAngle: number;
  wingSpeed: number;
  rotation: number;
  opacity: number;
}

export function PaperEaglesBackground() {
  const containerRef = useRef<HTMLDivElement>(null);
  const p5InstanceRef = useRef<p5 | null>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    const sketch = (p: p5) => {
      const eagles: PaperEagle[] = [];
      const numEagles = 8;

      p.setup = () => {
        const canvas = p.createCanvas(
          containerRef.current!.offsetWidth,
          containerRef.current!.offsetHeight
        );
        canvas.style("display", "block");

        // Initialize eagles
        for (let i = 0; i < numEagles; i++) {
          eagles.push({
            x: p.random(p.width),
            y: p.random(p.height),
            size: p.random(20, 40),
            speed: p.random(0.5, 1.5),
            wingAngle: p.random(p.TWO_PI),
            wingSpeed: p.random(0.05, 0.12),
            rotation: p.random(-0.2, 0.2),
            opacity: p.random(40, 80),
          });
        }
      };

      p.draw = () => {
        p.clear();

        for (const eagle of eagles) {
          // Update position
          eagle.x += eagle.speed;
          eagle.y += p.sin(p.frameCount * 0.02 + eagle.wingAngle) * 0.3;
          eagle.wingAngle += eagle.wingSpeed;

          // Wrap around
          if (eagle.x > p.width + eagle.size * 2) {
            eagle.x = -eagle.size * 2;
            eagle.y = p.random(p.height);
          }

          // Draw paper eagle (origami style)
          p.push();
          p.translate(eagle.x, eagle.y);
          p.rotate(eagle.rotation + p.sin(p.frameCount * 0.03) * 0.1);

          const wingFlap = p.sin(eagle.wingAngle) * 0.4;

          // Body - main triangle
          p.noStroke();
          p.fill(255, 255, 255, eagle.opacity);

          // Left wing
          p.push();
          p.rotate(-wingFlap);
          p.beginShape();
          p.vertex(0, 0);
          p.vertex(-eagle.size * 1.2, -eagle.size * 0.3);
          p.vertex(-eagle.size * 0.4, eagle.size * 0.1);
          p.endShape(p.CLOSE);
          p.pop();

          // Right wing
          p.push();
          p.rotate(wingFlap);
          p.beginShape();
          p.vertex(0, 0);
          p.vertex(eagle.size * 1.2, -eagle.size * 0.3);
          p.vertex(eagle.size * 0.4, eagle.size * 0.1);
          p.endShape(p.CLOSE);
          p.pop();

          // Body center
          p.fill(245, 245, 245, eagle.opacity + 20);
          p.beginShape();
          p.vertex(-eagle.size * 0.3, 0);
          p.vertex(0, -eagle.size * 0.5);
          p.vertex(eagle.size * 0.3, 0);
          p.vertex(0, eagle.size * 0.6);
          p.endShape(p.CLOSE);

          // Head
          p.fill(255, 255, 255, eagle.opacity + 10);
          p.beginShape();
          p.vertex(0, -eagle.size * 0.5);
          p.vertex(-eagle.size * 0.15, -eagle.size * 0.3);
          p.vertex(0, -eagle.size * 0.7);
          p.vertex(eagle.size * 0.15, -eagle.size * 0.3);
          p.endShape(p.CLOSE);

          // Tail feathers
          p.fill(240, 240, 240, eagle.opacity);
          p.beginShape();
          p.vertex(-eagle.size * 0.2, eagle.size * 0.5);
          p.vertex(0, eagle.size * 0.6);
          p.vertex(0, eagle.size * 0.9);
          p.vertex(-eagle.size * 0.1, eagle.size * 0.7);
          p.endShape(p.CLOSE);

          p.beginShape();
          p.vertex(eagle.size * 0.2, eagle.size * 0.5);
          p.vertex(0, eagle.size * 0.6);
          p.vertex(0, eagle.size * 0.9);
          p.vertex(eagle.size * 0.1, eagle.size * 0.7);
          p.endShape(p.CLOSE);

          p.pop();
        }
      };

      p.windowResized = () => {
        if (containerRef.current) {
          p.resizeCanvas(
            containerRef.current.offsetWidth,
            containerRef.current.offsetHeight
          );
        }
      };
    };

    p5InstanceRef.current = new p5(sketch, containerRef.current);

    return () => {
      p5InstanceRef.current?.remove();
    };
  }, []);

  return (
    <div
      ref={containerRef}
      className="absolute inset-0 pointer-events-none overflow-hidden"
      style={{ zIndex: 0 }}
    />
  );
}
