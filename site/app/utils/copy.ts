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
  horarios: {
    title: 'Horarios',
    hacia: 'Hacia Deportivas',
    desde: 'Desde Deportivas',
    sentidoHacia: 'Sentido Finca 1 → Finca 3',
    sentidoDesde: 'Sentido Finca 3 → Finca 1',
    route: 'Ruta',
    stop: 'Parada',
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
    pending: 'Mapa interactivo próximamente.'
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
