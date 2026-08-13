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
      profile: "/app/especialista/perfil",
      agenda: "/app/especialista/agenda"
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
    clientes: {
      index: "/app/clientes",
      detail: (id: string) => `/app/clientes/${id}`
    },
    reservas: {
      index: "/app/reservas"
    },
    cobros: {
      index: "/app/cobros"
    },
    inbody: {
      index: "/app/inbody"
    },
    whatsapp: {
      index: "/app/agenda-whatsapp"
    },
    llamadas: {
      index: "/app/llamadas"
    },
    b2b: {
      index: "/app/prospectos-b2b"
    },
    reportes: {
      index: "/app/reportes"
    },
  },
  registration: {
    index: "/registro"
  },
  contact: {
    index: "/contacto"
  },
};
