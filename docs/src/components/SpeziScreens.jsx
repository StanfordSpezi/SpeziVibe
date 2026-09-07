import React from 'react';
import useBaseUrl from '@docusaurus/useBaseUrl';
import {SPEZI_SCREENS} from '../data/speziFramework';

export default function SpeziScreens() {
  const imageBase = useBaseUrl('/img/framework/');
  return (
    <div className="spezi-screens">
      {SPEZI_SCREENS.map((screen) => (
        <figure key={screen.name}>
          <a href={screen.href}>
            <img src={`${imageBase}${screen.image}`} width={screen.width} height={screen.height}
              alt={screen.alt} loading="lazy" decoding="async" />
          </a>
          <figcaption><a href={screen.href}>{screen.name} <span aria-hidden="true">↗</span></a></figcaption>
        </figure>
      ))}
    </div>
  );
}
