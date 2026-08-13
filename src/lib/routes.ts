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
    verification: {
      index: "/app/verificacion"
    },
    specialists: {
      index: "/app/especialistas",
      new: "/app/especialistas/nuevo",
      edit: {
        id: (id: string) => `/app/especialistas/${id}/editar`
      },
    },
    catalogs: {
      index: "/app/catalogs"
    },
    specialist: {
      profile: "/app/especialista/perfil"
    },
    sucursales: {
      index: "/app/sucursales",
    },
    consultorios: {
      index: "/app/consultorios",
    },
    agenda: {
      index: "/app/agenda"
    },
    reservas: {
      index: "/app/reservas"
    },
    cobros: {
      index: "/app/cobros"
    },
  },
  registration: {
    index: "/registro"
  },
  contact: {
    index: "/contacto"
  },
};
