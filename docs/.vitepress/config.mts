import { defineConfig } from "vitepress";

// https://vitepress.dev/reference/site-config
export default defineConfig({
  title: "Infobús web",
  description: "Página web del transporte público de Infobús",
  cleanUrls: true,
  base: "/infobus-web/",

  themeConfig: {
    // https://vitepress.dev/reference/default-theme-config
    nav: [
      { text: "Inicio", link: "/" },
      { text: "Proyecto", link: "/proyecto/" },
      { text: "Diseño", link: "/diseno/" },
      { text: "Desarrollo", link: "/desarrollo/" },
    ],

    sidebar: [
      {
        text: "Proyecto",
        items: [
          { text: "Acerca", link: "/proyecto/" },
          { text: "Glosario", link: "/proyecto/glosario/" },
        ],
      },
      {
        text: "Diseño",
        items: [
          { text: "Principios", link: "/diseno/" },
          { text: "Arquitectura", link: "/diseno/arquitectura/" },
          { text: "Mapa del sitio", link: "/diseno/sitio/" },
          { text: "Lenguaje de diseño", link: "/diseno/lenguaje/" },
          { text: "Interfaz del usuario", link: "/diseno/interfaz/" },
          { text: "Experiencia del usuario", link: "/diseno/experiencia/" },
          { text: "Panel de administración", link: "/diseno/admin/" },
        ],
      },
      {
        text: "Desarrollo",
        items: [
          { text: "Lineamientos", link: "/desarrollo/" },
          { text: "Infobús API", link: "/desarrollo/infobus/" },
          { text: "Configuración", link: "/desarrollo/configuración/" },
          { text: "Implementación", link: "/desarrollo/implementacion/" },
          { text: "Pruebas", link: "/desarrollo/pruebas/" },
          { text: "Guía de estilo", link: "/desarrollo/estilo/" },
        ],
      },
    ],

    socialLinks: [
      { icon: "github", link: "https://github.com/simovilab/infobus-web" },
    ],

    outlineTitle: "En esta página",
    lastUpdatedText: "Última actualización",
    darkModeSwitchLabel: "Apariencia",
    lightModeSwitchTitle: "Cambiar a modo claro",
    darkModeSwitchTitle: "Cambiar a modo oscuro",
    returnToTopLabel: "Volver arriba",
    docFooter: {
      prev: "Página anterior",
      next: "Página siguiente",
    },
    search: {
      placeholder: "Buscar",
    },
  },
});
