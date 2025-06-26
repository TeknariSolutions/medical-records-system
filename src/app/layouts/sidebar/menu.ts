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
  

];

