const S = {
  width: 28, height: 28, viewBox: '0 0 24 24',
  fill: 'none', stroke: '#534AB7', strokeWidth: 1.5,
  strokeLinecap: 'round', strokeLinejoin: 'round',
}

export const ICONS = {
  'cosa-sono-gli-etf': (
    <svg {...S}>
      <circle cx="10" cy="13" r="7"/>
      <line x1="7" y1="11" x2="13" y2="11"/>
      <line x1="7" y1="13" x2="13" y2="13"/>
      <line x1="7" y1="15" x2="13" y2="15"/>
      <line x1="15" y1="8" x2="21" y2="3"/>
      <polyline points="17,3 21,3 21,7"/>
    </svg>
  ),
  'cosa-sono-le-obbligazioni': (
    <svg {...S}>
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
      <polyline points="14,2 14,8 20,8"/>
      <circle cx="9.5" cy="11" r="1.2"/>
      <circle cx="14.5" cy="16" r="1.2"/>
      <line x1="8.5" y1="17" x2="15.5" y2="10"/>
    </svg>
  ),
  'etf-vs-obbligazioni': (
    <svg {...S}>
      <line x1="12" y1="3" x2="12" y2="20"/>
      <line x1="5" y1="8" x2="19" y2="8"/>
      <line x1="5" y1="8" x2="5" y2="13"/>
      <line x1="19" y1="8" x2="19" y2="13"/>
      <path d="M2 13 Q5 17 8 13"/>
      <path d="M16 13 Q19 17 22 13"/>
    </svg>
  ),
  'cosa-e-il-pac': (
    <svg {...S}>
      <rect x="2" y="3" width="14" height="14" rx="2"/>
      <line x1="7" y1="1" x2="7" y2="5"/>
      <line x1="12" y1="1" x2="12" y2="5"/>
      <line x1="2" y1="8" x2="16" y2="8"/>
      <path d="M22 11a6 6 0 1 1-6 6"/>
      <polyline points="20,14 16,17 20,20"/>
    </svg>
  ),
  'interesse-composto': (
    <svg {...S}>
      <line x1="3" y1="21" x2="3" y2="4"/>
      <line x1="3" y1="21" x2="22" y2="21"/>
      <polyline points="1,6 3,4 5,6"/>
      <path d="M4 20 C6 19 9 16 12 13 S17 7 21 4"/>
    </svg>
  ),
  'come-scegliere-un-broker': (
    <svg {...S}>
      <path d="M2 10 L12 2 L22 10"/>
      <line x1="2" y1="10" x2="22" y2="10"/>
      <line x1="2" y1="21" x2="22" y2="21"/>
      <line x1="6" y1="10" x2="6" y2="21"/>
      <line x1="12" y1="10" x2="12" y2="21"/>
      <line x1="18" y1="10" x2="18" y2="21"/>
    </svg>
  ),
  'come-ribilanciare': (
    <svg {...S}>
      <polyline points="23,4 23,10 17,10"/>
      <polyline points="1,20 1,14 7,14"/>
      <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10"/>
      <path d="M1 14l4.64 4.36A9 9 0 0 0 20.49 15"/>
    </svg>
  ),
  'tasse-etf-italia': (
    <svg {...S}>
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
      <polyline points="14,2 14,8 20,8"/>
      <line x1="8" y1="11" x2="16" y2="11"/>
      <line x1="8" y1="14" x2="11" y2="14"/>
      <polyline points="8,17 10.5,19.5 16,14"/>
    </svg>
  ),
}
