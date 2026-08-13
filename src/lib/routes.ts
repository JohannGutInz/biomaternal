export const APP_ROUTE = {
  app: {
    login: {
      index: "/app/login"
    },
    dashboard: {
      index: "/app/dashboard"
    },
    settings: {
      index: "/app/configuracion"
    },
    moderation: {
      index: "/app/moderacion"
    },
    models: {
      index: "/app/modelos",
      new: "/app/modelos/nuevo",
      edit: {
        id: (id: string) => `/app/modelos/${id}/editar`
      },
    },
    catalogs: {
      index: "/app/catalogs"
    },
    model: {
      profile: "/app/modelo/perfil"
    },
  },
  registration: {
    index: "/registro"
  },
  contact: {
    index: "/contacto"
  },
};
