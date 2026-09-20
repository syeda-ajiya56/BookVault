"use client";

import { useEffect, useRef, useState } from "react";

const vertexShaderSource = `
  attribute vec2 a_position;

  void main() {
    gl_Position = vec4(a_position, 0.0, 1.0);
  }
`;

function createShader(gl: WebGLRenderingContext, type: number, source: string) {
  const shader = gl.createShader(type);
  if (!shader) throw new Error("Could not create shader.");

  gl.shaderSource(shader, source);
  gl.compileShader(shader);

  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    const message = gl.getShaderInfoLog(shader) ?? "Shader compilation failed.";
    gl.deleteShader(shader);
    throw new Error(message);
  }

  return shader;
}

export default function ShaderHero() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [shaderError, setShaderError] = useState(false);

  useEffect(() => {
    if (!canvasRef.current) return;

    let animationFrame: number | null = null;
    let disposed = false;
    let reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const abortController = new AbortController();
    const motionQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    let cleanupWebgl = () => {};

    async function startShader() {
      try {
        const response = await fetch("/shaders/bookVaultHero.frag", { signal: abortController.signal });
        if (!response.ok) throw new Error("Could not load the hero shader.");
        const fragmentShaderSource = await response.text();
        if (disposed) return;
        const activeCanvas = canvasRef.current;
        if (!activeCanvas) return;
        const canvasTarget: HTMLCanvasElement = activeCanvas;

        const glContext = canvasTarget.getContext("webgl", { alpha: false, antialias: true });
        if (!glContext) throw new Error("WebGL is unavailable.");
        const gl = glContext;

        const vertexShader = createShader(gl, gl.VERTEX_SHADER, vertexShaderSource);
        const fragmentShader = createShader(gl, gl.FRAGMENT_SHADER, fragmentShaderSource);
        const program = gl.createProgram();
        const buffer = gl.createBuffer();
        if (!program || !buffer) throw new Error("Could not create WebGL resources.");

        gl.attachShader(program, vertexShader);
        gl.attachShader(program, fragmentShader);
        gl.linkProgram(program);
        gl.deleteShader(vertexShader);
        gl.deleteShader(fragmentShader);

        if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
          const message = gl.getProgramInfoLog(program) ?? "Shader linking failed.";
          gl.deleteProgram(program);
          gl.deleteBuffer(buffer);
          throw new Error(message);
        }

        const positionLocation = gl.getAttribLocation(program, "a_position");
        const timeLocation = gl.getUniformLocation(program, "u_time");
        const resolutionLocation = gl.getUniformLocation(program, "u_resolution");
        const mouseLocation = gl.getUniformLocation(program, "u_mouse");
        if (positionLocation < 0 || !timeLocation || !resolutionLocation || !mouseLocation) {
          gl.deleteProgram(program);
          gl.deleteBuffer(buffer);
          throw new Error("Shader uniforms are unavailable.");
        }

        gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 1, -1, -1, 1, -1, 1, 1, -1, 1, 1]), gl.STATIC_DRAW);
        gl.useProgram(program);
        gl.enableVertexAttribArray(positionLocation);
        gl.vertexAttribPointer(positionLocation, 2, gl.FLOAT, false, 0, 0);

        const mouse = { x: canvasTarget.width / 2, y: canvasTarget.height / 2 };

        // Cap the drawing buffer to avoid unnecessary high-resolution rendering.
        function resizeCanvas() {
          const rect = canvasTarget.getBoundingClientRect();
          const pixelRatio = Math.min(window.devicePixelRatio || 1, 2);
          canvasTarget.width = Math.max(1, Math.floor(rect.width * pixelRatio));
          canvasTarget.height = Math.max(1, Math.floor(rect.height * pixelRatio));
          gl.viewport(0, 0, canvasTarget.width, canvasTarget.height);
        }

        function updateMouse(event: PointerEvent) {
          if (reducedMotion) return;
          const rect = canvasTarget.getBoundingClientRect();
          mouse.x = ((event.clientX - rect.left) / rect.width) * canvasTarget.width;
          mouse.y = (1 - (event.clientY - rect.top) / rect.height) * canvasTarget.height;
        }

        function drawFrame(now: number) {
          gl.uniform1f(timeLocation, now * 0.001);
          gl.uniform2f(resolutionLocation, canvasTarget.width, canvasTarget.height);
          gl.uniform2f(mouseLocation, mouse.x, mouse.y);
          gl.drawArrays(gl.TRIANGLES, 0, 6);
        }

        // Keep at most one animation frame scheduled at a time.
        function stopAnimation() {
          if (animationFrame !== null) {
            window.cancelAnimationFrame(animationFrame);
            animationFrame = null;
          }
        }

        function render(now: number) {
          animationFrame = null;
          if (reducedMotion || document.visibilityState === "hidden") return;
          drawFrame(now);
          animationFrame = window.requestAnimationFrame(render);
        }

        function startAnimation() {
          if (reducedMotion || document.visibilityState === "hidden" || animationFrame !== null) return;
          animationFrame = window.requestAnimationFrame(render);
        }

        function handleVisibilityChange() {
          if (document.visibilityState === "hidden") {
            stopAnimation();
          } else if (!reducedMotion) {
            startAnimation();
          }
        }

        function handleMotionChange(event: MediaQueryListEvent) {
          reducedMotion = event.matches;
          if (reducedMotion) {
            stopAnimation();
            drawFrame(0);
          } else if (document.visibilityState === "visible") {
            startAnimation();
          }
        }

        function handleResize() {
          resizeCanvas();
          drawFrame(0);
        }

        window.addEventListener("resize", handleResize);
        window.addEventListener("pointermove", updateMouse);
        document.addEventListener("visibilitychange", handleVisibilityChange);
        motionQuery.addEventListener("change", handleMotionChange);
        resizeCanvas();
        drawFrame(0);
        startAnimation();

        cleanupWebgl = () => {
          window.removeEventListener("resize", handleResize);
          window.removeEventListener("pointermove", updateMouse);
          document.removeEventListener("visibilitychange", handleVisibilityChange);
          motionQuery.removeEventListener("change", handleMotionChange);
          stopAnimation();
          gl.disableVertexAttribArray(positionLocation);
          gl.deleteProgram(program);
          gl.deleteBuffer(buffer);
        };
      } catch (error) {
        if (!disposed && !(error instanceof DOMException && error.name === "AbortError")) {
          setShaderError(true);
        }
      }
    }

    void startShader();

    return () => {
      disposed = true;
      abortController.abort();
      cleanupWebgl();
    };
  }, []);

  return (
    <section className="relative isolate flex min-h-[min(78vh,760px)] items-end overflow-hidden rounded-card bg-primary px-6 py-12 text-primary-foreground sm:px-12 sm:py-16 lg:px-20 lg:py-20">
      {/* Canvas layer renders the fragment shader behind the content. */}
      <canvas
        aria-hidden="true"
        ref={canvasRef}
        className="pointer-events-none absolute inset-0 h-full w-full"
      />
      <div className="relative z-10 max-w-2xl space-y-5">
        {/* Content layer stays above the canvas for readable, accessible messaging. */}
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-accent-on-primary">BookVault</p>
        <h1 className="text-5xl leading-[1.05] tracking-tight sm:text-6xl">A reading life, well kept.</h1>
        <p className="max-w-xl text-lg leading-8 text-primary-foreground/80">
          Discover remarkable books and keep your next great story close.
        </p>
        {shaderError && <p className="text-sm text-primary-foreground/70">The animated background is unavailable, so the BookVault background remains active.</p>}
      </div>
    </section>
  );
}
