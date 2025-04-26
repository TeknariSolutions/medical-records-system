import { MenuItem } from './menu.model';

export const MENU: MenuItem[] = [
    {
        id: 1,
        label: 'MENUITEMS.MENU.TEXT',
        isTitle: true
    },
    {
        id: 2,
        label: 'MENUITEMS.DASHBOARDS.TEXT',
        icon: 'bx-home-circle',
        subItems: [
            {
                id: 3,
                label: 'MENUITEMS.DASHBOARDS.LIST.DEFAULT',
                link: '/dashboard',
                parentId: 2
            }
        ]
    },
    {
        id: 2,
        label: 'MENUITEMS.PARAMETRIZATION.TEXT',
        isTitle: true
    },
    {
        id: 2,
        label: 'MENUITEMS.PARAMETRIZATION.TEXT',
        icon: 'bx-home-circle',
        subItems: [
            {
                id: 3,
                label: 'MENUITEMS.PARAMETRIZATION.LIST.USERS',
                link: '/parametrization/users',
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

