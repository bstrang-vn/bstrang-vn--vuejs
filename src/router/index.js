import { getAuth, onAuthStateChanged } from 'firebase/auth'
import { createRouter, createWebHistory } from 'vue-router'
import Home from '../views/Home.vue'
import dashboardChildren from './dashboard-router'

const auth = getAuth()
const requireAuth = (to, from, next) => {
	onAuthStateChanged(auth, user => {
		if (!user) next({ name: 'Login', params: {} })
		else next()
	})
}

const routes = [
	{
		path: '/',
		name: 'Home',
		component: Home,
	},
	{
		path: '/dashboard',
		name: 'Dashboard',
		meta: {
			breadcrumbName: 'Dashboard',
		},
		component: () => import(/* webpackChunkName: "dashboard" */ '../layouts/dashboard-layout/Dashboard.vue'),
		beforeEnter: requireAuth,
		children: dashboardChildren,
	},
	{
		path: '/store',
		name: 'Store',
		meta: {
			breadcrumbName: 'Store',
		},
		component: () => import(/* webpackChunkName: "dashboard" */ '../layouts/dashboard-layout/Dashboard.vue'),
	},
	{
		path: '/register',
		name: 'Register',
		meta: {
			layout: 'auth-layout',
		},
		component: () => import(/* webpackChunkName: "register" */ '../views/Register.vue'),
	},
	{
		path: '/login',
		name: 'Login',
		meta: {
			layout: 'auth-layout',
		},
		component: () => import(/* webpackChunkName: "login" */ '../views/Login.vue'),
	},
]

const router = createRouter({
	history: createWebHistory(process.env.BASE_URL),
	routes,
})

export { routes }
export default router
