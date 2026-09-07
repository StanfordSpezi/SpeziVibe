import React, {useEffect, useId, useRef, useState} from 'react';
import useBaseUrl from '@docusaurus/useBaseUrl';

export default function SpeziProjectCards({projects, compact = false, horizontal = false}) {
  const imageBase = useBaseUrl('/img/framework/');
  const galleryId = useId();
  const track = useRef(null);
  const [edges, setEdges] = useState({start: true, end: false});

  useEffect(() => {
    if (!horizontal || !track.current) return undefined;
    const element = track.current;
    const updateEdges = () => {
      const start = element.scrollLeft <= 1;
      const end = element.scrollLeft >= element.scrollWidth - element.clientWidth - 1;
      setEdges((previous) => previous.start === start && previous.end === end ? previous : {start, end});
    };
    updateEdges();
    element.addEventListener('scroll', updateEdges, {passive: true});
    window.addEventListener('resize', updateEdges);
    const observer = typeof ResizeObserver === 'undefined' ? null : new ResizeObserver(updateEdges);
    observer?.observe(element);
    if (element.firstElementChild) observer?.observe(element.firstElementChild);
    return () => {
      element.removeEventListener('scroll', updateEdges);
      window.removeEventListener('resize', updateEdges);
      observer?.disconnect();
    };
  }, [horizontal, projects.length]);

  const move = (direction) => {
    const element = track.current;
    if (!element) return;
    const cardWidth = element.firstElementChild?.getBoundingClientRect().width || element.clientWidth;
    const gap = parseFloat(window.getComputedStyle(element).columnGap) || 0;
    const max = Math.max(0, element.scrollWidth - element.clientWidth);
    const left = direction === 'start' ? 0 : direction === 'end' ? max
      : Math.max(0, Math.min(max, element.scrollLeft + direction * (cardWidth + gap)));
    element.scrollTo({left, behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth'});
  };

  const onKeyDown = (event) => {
    if (event.target !== event.currentTarget || event.altKey || event.ctrlKey || event.metaKey) return;
    const directions = {ArrowLeft: -1, ArrowRight: 1, Home: 'start', End: 'end'};
    if (Object.hasOwn(directions, event.key)) {
      event.preventDefault();
      move(directions[event.key]);
    }
  };

  return (
    <>
    {horizontal && (
      <div className="spezi-gallery-controls">
        <p>{projects.length} projects <span aria-hidden="true">·</span> Scroll to explore</p>
        <div className="spezi-gallery-buttons">
          <button type="button" aria-label="Scroll projects left" aria-controls={galleryId}
            disabled={edges.start} onClick={() => move(-1)}><span aria-hidden="true">←</span></button>
          <button type="button" aria-label="Scroll projects right" aria-controls={galleryId}
            disabled={edges.end} onClick={() => move(1)}><span aria-hidden="true">→</span></button>
        </div>
      </div>
    )}
    <div ref={track} id={galleryId}
      className={`spezi-app-grid${compact ? ' spezi-app-grid--compact' : ''}${horizontal ? ' spezi-app-grid--horizontal' : ''}`}
      role={horizontal ? 'region' : undefined} aria-label={horizontal ? 'Spezi project gallery' : undefined}
      tabIndex={horizontal ? 0 : undefined} onKeyDown={horizontal ? onKeyDown : undefined}>
      {projects.map((project) => (
        <article className="spezi-app" key={project.name}>
          <div className={`spezi-app-image spezi-app-image--${project.imageStyle || 'screen'}`}>
            {project.image ? (
              <img src={`${imageBase}${project.image}`} width={project.width} height={project.height}
                alt={project.alt} loading="lazy" decoding="async" />
            ) : project.imageStyle === 'integration' ? (
              <div className="spezi-integration-mark" aria-hidden="true"><span>one sec</span><span>+</span><span>Spezi</span></div>
            ) : (
              <div className="spezi-project-wordmark" aria-hidden="true">{project.shortName || project.name}</div>
            )}
          </div>
          <div className="spezi-app-copy">
            <p className="eyebrow">{project.label}</p>
            <h3>{compact && project.shortName ? project.shortName : project.name}</h3>
            <p>{compact && project.summary ? project.summary : project.description}</p>
            <a href={project.href} className="text-link">{project.linkLabel || `Explore ${project.name}`} <span aria-hidden="true">↗</span></a>
          </div>
        </article>
      ))}
    </div>
    </>
  );
}
