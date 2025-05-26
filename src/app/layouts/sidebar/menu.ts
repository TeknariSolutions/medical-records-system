import { MenuItem } from './menu.model';

export const MENU: MenuItem[] = [
    {
        id: 1,
        label: 'Menú',
        isTitle: true
    },
    {
        id: 2,
        label: 'Dashboard',
        icon: 'bx-home-circle',
        subItems: [
            {
                id: 3,
                label: 'Lista',
                link: '/dashboard',
                parentId: 2
            }
        ]
    },
    {
        id: 2,
        label: 'Parametrización',
        isTitle: true
    },
    {
        id: 2,
        label: 'Parametrización',
        icon: 'bx-home-circle',
        subItems: [
            {
                id: 3,
                label: 'Usuarios',
                link: '/parametrization/users',
                parentId: 2
            },
            {
                id: 3,
                label: 'Pacientes',
                link: '/parametrization/patients',
                parentId: 2
            }
        ]
    },
   /*  {
        id: 200,
        label: 'MENUITEMS.PARAMETRIZATION.TEXT',
        isTitle: true,
        subItems: [
            {
                id: 201,
                label: 'MENUITEMS.PARAMETRIZATION.LIST.USERS',
                link: '/parametrization/users',
                parentId: 202
            },
        ]
    }, */

];

