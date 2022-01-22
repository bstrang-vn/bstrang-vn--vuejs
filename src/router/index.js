import { getAuth, onAuthStateChanged } from 'firebase/auth'
import { createRouter, createWebHistory } from 'vue-router'
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
		redirect: { name: 'Dashboard' },
	},
	{
		path: '/dashboard',
		meta: {
			breadcrumbName: 'Dashboard',
		},
		component: () => import(/* webpackChunkName: "dashboard" */ '../layouts/dashboard-layout/Dashboard.vue'),
		beforeEnter: requireAuth,
		children: dashboardChildren,
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
