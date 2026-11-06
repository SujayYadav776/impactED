import createGlobe, { type Globe, type Marker } from 'cobe';
import { useEffect, useMemo, useRef, type CSSProperties, type PointerEvent } from 'react';
import { Article } from '../types';

interface GlobalPerspectiveGlobeProps {
  articles: Article[];
}

interface CountryPoint {
  name: string;
  latitude: number;
  longitude: number;
}

const COUNTRY_POINTS: Record<string, CountryPoint> = {
  'United States': { name: 'United States', latitude: 38, longitude: -97 },
  Canada: { name: 'Canada', latitude: 56, longitude: -106 },
  Mexico: { name: 'Mexico', latitude: 23, longitude: -102 },
  Brazil: { name: 'Brazil', latitude: -10, longitude: -52 },
  Argentina: { name: 'Argentina', latitude: -35, longitude: -64 },
  Colombia: { name: 'Colombia', latitude: 4, longitude: -74 },
  Chile: { name: 'Chile', latitude: -30, longitude: -71 },
  'United Kingdom': { name: 'United Kingdom', latitude: 54, longitude: -2 },
  Germany: { name: 'Germany', latitude: 51, longitude: 10 },
  France: { name: 'France', latitude: 47, longitude: 2 },
  Italy: { name: 'Italy', latitude: 42, longitude: 12 },
  Spain: { name: 'Spain', latitude: 40, longitude: -4 },
  Netherlands: { name: 'Netherlands', latitude: 52, longitude: 5 },
  Norway: { name: 'Norway', latitude: 62, longitude: 10 },
  Sweden: { name: 'Sweden', latitude: 60, longitude: 18 },
  Finland: { name: 'Finland', latitude: 64, longitude: 26 },
  India: { name: 'India', latitude: 22, longitude: 79 },
  Pakistan: { name: 'Pakistan', latitude: 30, longitude: 70 },
  Bangladesh: { name: 'Bangladesh', latitude: 24, longitude: 90 },
  Nepal: { name: 'Nepal', latitude: 28, longitude: 84 },
  China: { name: 'China', latitude: 35, longitude: 105 },
  Japan: { name: 'Japan', latitude: 36, longitude: 138 },
  Singapore: { name: 'Singapore', latitude: 1, longitude: 104 },
  Indonesia: { name: 'Indonesia', latitude: -2, longitude: 118 },
  'South Korea': { name: 'South Korea', latitude: 36, longitude: 128 },
  Kenya: { name: 'Kenya', latitude: 0, longitude: 38 },
  Ghana: { name: 'Ghana', latitude: 7, longitude: -2 },
  Nigeria: { name: 'Nigeria', latitude: 9, longitude: 8 },
  'South Africa': { name: 'South Africa', latitude: -30, longitude: 25 },
  Egypt: { name: 'Egypt', latitude: 27, longitude: 30 },
  Morocco: { name: 'Morocco', latitude: 32, longitude: -6 },
  Australia: { name: 'Australia', latitude: -25, longitude: 135 },
  'New Zealand': { name: 'New Zealand', latitude: -41, longitude: 174 },
};

const MARKER_IDS = ['country-0', 'country-1', 'country-2', 'country-3', 'country-4'];

export default function GlobalPerspectiveGlobe({ articles }: GlobalPerspectiveGlobeProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const globeRef = useRef<Globe | null>(null);
  const interactionRef = useRef({ dragging: false, lastX: 0, lastY: 0, phi: 0.1, theta: 0.25 });

  const countries = useMemo(() => {
    const counts = new Map<string, number>();
    articles
      .filter((article) => article.status === 'Published')
      .forEach((article) => {
        const country = article.authorCountry.trim();
        if (COUNTRY_POINTS[country]) counts.set(country, (counts.get(country) || 0) + 1);
      });

    return [...counts.entries()]
      .map(([name, count]) => ({ ...COUNTRY_POINTS[name], count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, MARKER_IDS.length);
  }, [articles]);

  const markers = useMemo<Marker[]>(
    () =>
      countries.map((country, index) => ({
        id: MARKER_IDS[index],
        location: [country.latitude, country.longitude],
        size: Math.min(0.1, 0.045 + country.count * 0.008),
        color: [0.76, 0.31, 0.18],
      })),
    [countries]
  );

  useEffect(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;

    let frameId = 0;
    let visible = true;
    let phi = interactionRef.current.phi;
    let theta = interactionRef.current.theta;

    const globe = createGlobe(canvas, {
      devicePixelRatio: Math.min(window.devicePixelRatio || 1, 2),
      width: 900,
      height: 900,
      phi,
      theta,
      dark: 0,
      diffuse: 1.35,
      mapSamples: 18000,
      mapBrightness: 5.2,
      mapBaseBrightness: 0.08,
      baseColor: [0.91, 0.86, 0.76],
      markerColor: [0.76, 0.31, 0.18],
      glowColor: [0.98, 0.91, 0.78],
      markers,
      arcs: countries.slice(0, 4).map((country) => ({
        from: [country.latitude, country.longitude],
        to: [20, 0],
        color: [0.72, 0.52, 0.34],
      })),
      arcColor: [0.72, 0.52, 0.34],
      arcWidth: 0.35,
      arcHeight: 0.22,
      markerElevation: 0.025,
      scale: 0.93,
      opacity: 0.96,
      offset: [0, 0],
    });
    globeRef.current = globe;

    const observer = new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting;
    });
    observer.observe(container);

    const render = () => {
      if (visible && !interactionRef.current.dragging) {
        phi += 0.0016;
        interactionRef.current.phi = phi;
      } else if (interactionRef.current.dragging) {
        phi = interactionRef.current.phi;
        theta = interactionRef.current.theta;
      }

      globe.update({ phi, theta });
      frameId = requestAnimationFrame(render);
    };
    frameId = requestAnimationFrame(render);

    return () => {
      cancelAnimationFrame(frameId);
      observer.disconnect();
      globe.destroy();
      globeRef.current = null;
    };
  }, [markers, countries]);

  const handlePointerDown = (event: PointerEvent<HTMLDivElement>) => {
    interactionRef.current.dragging = true;
    interactionRef.current.lastX = event.clientX;
    interactionRef.current.lastY = event.clientY;
    event.currentTarget.setPointerCapture(event.pointerId);
  };

  const handlePointerMove = (event: PointerEvent<HTMLDivElement>) => {
    if (!interactionRef.current.dragging) return;
    const deltaX = event.clientX - interactionRef.current.lastX;
    const deltaY = event.clientY - interactionRef.current.lastY;
    interactionRef.current.lastX = event.clientX;
    interactionRef.current.lastY = event.clientY;
    interactionRef.current.phi += deltaX * 0.006;
    interactionRef.current.theta = Math.max(
      -1.1,
      Math.min(1.1, interactionRef.current.theta + deltaY * 0.004)
    );
  };

  const handlePointerUp = (event: PointerEvent<HTMLDivElement>) => {
    interactionRef.current.dragging = false;
    if (event.currentTarget.hasPointerCapture(event.pointerId)) {
      event.currentTarget.releasePointerCapture(event.pointerId);
    }
  };

  return (
    <div className="relative mx-auto w-full max-w-[500px]">
      <div className="pointer-events-none absolute inset-[8%] rounded-full bg-[#c1502e]/15 blur-3xl dark:bg-[#e57554]/15" />
      <div className="pointer-events-none absolute inset-[14%] rounded-full bg-[#7a8b69]/10 blur-2xl" />

      <div
        ref={containerRef}
        className="relative aspect-square touch-pan-y cursor-grab active:cursor-grabbing"
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerCancel={handlePointerUp}
        aria-label="Interactive rotating globe of student publications. Drag to rotate."
      >
        <div className="pointer-events-none absolute inset-[4%] rounded-full border border-[#c1502e]/15 shadow-[inset_0_0_45px_rgba(193,80,46,0.08)]" />
        <canvas
          ref={canvasRef}
          aria-hidden="true"
          className="relative z-10 h-full w-full"
          style={{ width: '100%', height: '100%' }}
        />
        {countries.map((country, index) => {
          const markerId = MARKER_IDS[index];
          return (
            <div
              key={country.name}
              className="globe-country-label pointer-events-none absolute z-20 whitespace-nowrap rounded-full border border-[#e1d8c6] bg-[#faf7f2]/95 px-2 py-1 font-platform-sans text-[9px] font-extrabold tracking-wide text-[#3e3429] shadow-md dark:border-[#3b332b] dark:bg-[#211d18]/95 dark:text-[#f4ede2]"
              style={{
                positionAnchor: `--cobe-${markerId}`,
                left: 'anchor(center)',
                top: 'anchor(top)',
                opacity: `var(--cobe-visible-${markerId}, 0)`,
                transform: 'translate(-50%, -125%)',
                transition: 'opacity 180ms ease',
              } as CSSProperties}
            >
              {country.name} <span className="text-[#c1502e] dark:text-[#f1a184]">· {country.count}</span>
            </div>
          );
        })}
      </div>

      <div className="font-platform-sans mt-1 flex items-center justify-center gap-2 text-[10px] font-semibold uppercase tracking-[0.12em] text-[#7c7061] dark:text-[#c7bbaa]">
        <span className="h-2 w-2 animate-pulse rounded-full bg-[#7a8b69]" />
        Drag to explore · Live publication counts
      </div>
      {countries.length === 0 && (
        <p className="font-platform-sans mt-2 text-center text-xs text-[#7c7061] dark:text-[#c7bbaa]">
          Country markers will appear as student work is published.
        </p>
      )}
    </div>
  );
}
