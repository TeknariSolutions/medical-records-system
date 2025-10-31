import { MenuItem } from './menu.model';

export const MENU: MenuItem[] = [
    {
        id: 1,
        label: 'Menú',
        isTitle: true
    },
    {
        id: 2,
        label: 'Gestión Historia Clinica',
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
        id: 2,
        label: 'Medicamentos',
        icon: 'bx-band-aid',
        roleAuthenticated: [1,3],
        subItems: [
            {
                id: 3,
                label: 'Listado de Medicamentos',
                link: '/medicines/list-medicines',
                parentId: 2,
                roleAuthenticated: [1,3]
            }
        ]

    },
    
    {
        id: 2,
        label: 'Codigos CIE10',
        icon: 'bx bx-book-content',
        roleAuthenticated: [1,3],
        subItems: [
            {
                id: 3,
                label: 'Listado de Códigos',
                link: '/codes/list-CIE10',
                parentId: 2,
                roleAuthenticated: [1,3]
            }
        ]

    },

     {
        id: 3,
        label: 'CUPS',
        icon: 'bx bx-list-ul',
        roleAuthenticated: [1,3],
        subItems: [
            {
                id: 3,
                label: 'Listado de Códigos CUPS',
                link: '/cups/list-cups',
                parentId: 3,
                roleAuthenticated: [1,3]
            }
        ]

    },
  

];

