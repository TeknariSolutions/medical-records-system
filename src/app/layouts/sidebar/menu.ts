import { MenuItem } from './menu.model';

export const MENU: MenuItem[] = [
    {
        id: 1,
        label: 'Menú',
        isTitle: true
    },
    {
        id: 2,
        label: 'Parametrización',
        isTitle: true
    },
    {
        id: 2,
        label: 'Parametrización',
        icon: 'bx-cog',
        subItems: [
            {
                id: 3,
                label: 'Usuarios',
                link: '/parametrization/users',
                parentId: 2,
                roleAuthenticated: [1] 
            },
            {
                id: 3,
                label: 'Pacientes',
                link: '/parametrization/patients',
                parentId: 2
            },
        ]
    },
    {
        id: 3,
        label: 'Medicamentos',
        isTitle: true
    },
    {
        id: 2,
        label: 'Medicamentos',
        icon: 'bx-band-aid',
        subItems: [
            {
                id: 3,
                label: 'Listado de Medicamentos',
                link: '/medicines/list-medicines',
                parentId: 2,
                roleAuthenticated: [1]
            }
        ]

    },
      {
        id: 3,
        label: 'Codigos',
        isTitle: true
    },
     {
        id: 2,
        label: 'CIE10',
        icon: 'bx bx-book-content',
        subItems: [
            {
                id: 3,
                label: 'Códigos CIE10',
                link: '/codes/list-CIE10',
                parentId: 2,
                roleAuthenticated: [1]
            }
        ]

    },
  

];

