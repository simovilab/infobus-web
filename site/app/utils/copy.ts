// Copy institucional real, tomada de bucr-web (github.com/simovilab/bucr-web,
// index.html en main) en vez de texto inventado — mismo servicio, misma voz.
export const copy = {
  site: {
    title: 'bUCR',
    description: 'Bus interno de la Universidad de Costa Rica, Campus Rodrigo Facio.'
  },
  nav: [
    { label: 'Horarios', to: '#horarios' },
    { label: 'Tarifas', to: '#tarifas' },
    { label: 'Mapas', to: '#mapas' },
    { label: 'Paradas', to: '#paradas' }
  ],
  hero: {
    title: 'Pronto: nuevo sitio web',
    description: 'Estamos construyendo una experiencia de información en tiempo real para el bus interno de la UCR.'
  },
  // Shared by Horarios, Mapas, and Paradas — bUCR's schedule has two real
  // origins (Educación, Artes Plásticas), both ending at Odontología, so
  // "Hacia/Desde Deportivas" (which lumped both origins into one direction)
  // gave way to grouping by origin first, direction second — matching the
  // printed schedule's own convention (poster: "Facultad de Educación a
  // Facultad de Odontología" / "Escuela de Artes Plásticas a Facultad de
  // Odontología", each split into its own two directions).
  grupos: [
    {
      id: 'educacion',
      label: 'Facultad de Educación a Facultad de Odontología',
      sentidos: [
        { direction_id: 0 as const, label: 'Sentido Educación → Odontología' },
        { direction_id: 1 as const, label: 'Sentido Odontología → Educación' }
      ]
    },
    {
      id: 'artes',
      label: 'Escuela de Artes Plásticas a Facultad de Odontología',
      sentidos: [
        { direction_id: 0 as const, label: 'Sentido Artes Plásticas → Odontología' },
        { direction_id: 1 as const, label: 'Sentido Odontología → Artes Plásticas' }
      ]
    }
  ],
  horarios: {
    title: 'Horarios',
    route: 'Ruta',
    from: 'Desde',
    time: 'Hora',
    error: 'No fue posible cargar el horario. Intente de nuevo en unos minutos.',
    empty: 'No hay horarios disponibles en este momento.'
  },
  tarifas: {
    title: 'Tarifas',
    description: 'El bus interno de la Universidad de Costa Rica no tiene tarifa de uso.'
  },
  mapas: {
    title: 'Mapas',
    description: 'Trayectorias de cada ruta, en orden de parada.',
    // The dashed overlay only appears on the two sentidos that actually have
    // a milla variant (both "hacia Odontología" directions) — the hour comes
    // from that pattern's own real first departure, not hardcoded, so it
    // stays correct if the schedule ever shifts.
    millaNote: (hora: string) => `La línea punteada es el recorrido con la milla universitaria, activo desde las ${hora}.`,
    // Shown only on "Sentido Odontología → Educación" — that sentido's one
    // late-night trip ends at EDUFI instead, folded in as a footnote rather
    // than its own tab (same treatment the printed schedule gives it).
    edufiNote: (hora: string) => `El viaje de las ${hora} finaliza en la Escuela de Educación Física (EDUFI) en lugar de Educación.`
  },
  paradas: {
    title: 'Paradas',
    route: 'Ruta',
    name: 'Nombre',
    description: 'Descripción',
    empty: 'No hay paradas disponibles en este momento.'
  },
  footer: 'SIMOVILAB · Universidad de Costa Rica'
}
