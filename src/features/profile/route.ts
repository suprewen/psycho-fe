import App from '../common/component/App';
import { IRoute } from '@common/routeConfig';

const loader = (name: string) => async () => {
    const entrance = await import('./');
    return entrance[name];
};

const childRoutes: IRoute[] = [{
    path: '/profile',
    name: 'Profile',
    exact: true,
    redirect: '/profile/counseling'
}, {
    path: '/profile/:activeTab',
    name: 'Profile',
    loader: loader('Profile'),
    exact: true
}, {
    path: '/profile/counseling/:recordID',
    name: 'counseling detail',
    loader: loader('Detail')
},
{
    path: '/profile/counselChat/:recordID/:sID/:rID',
    name: 'counseling chatroom',
    loader: loader('Chat')
}]

export default {
    path: '/profile',
    name: '',
    component: App,
    childRoutes
};