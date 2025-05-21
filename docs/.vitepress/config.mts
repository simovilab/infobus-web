import { defineConfig } from 'vitepress'

// https://vitepress.dev/reference/site-config
export default defineConfig({
  title: "Infobús web",
  description: "Página web del transporte público de Infobús",
  cleanUrls: true,
  base: '/infobus-web/',

  themeConfig: {
    // https://vitepress.dev/reference/default-theme-config
    nav: [
      { text: 'Inicio', link: '/' },
      { text: 'Arquitectura', link: '/arquitectura/' },
      { text: 'Mapa del sitio', link: '/sitio/' },
      { text: 'Infobús API', link: '/infobus/' },
      { text: 'Configuración', link: '/configuracion/' },
      { text: 'Implementación', link: '/implementacion/' },
      { text: 'Desarrollo', link: '/desarrollo/' },
      { text: 'Guía de estilo', link: '/estilo/' },
      { text: 'Glosario', link: '/glosario/' }
    ],

    sidebar: [
      {
        text: 'Examples',
        items: [
          { text: 'Markdown Examples', link: '/markdown-examples' },
          { text: 'Runtime API Examples', link: '/api-examples' }
        ]
      }
    ],

    socialLinks: [
      { icon: 'github', link: 'https://github.com/vuejs/vitepress' }
    ]
  }
})
