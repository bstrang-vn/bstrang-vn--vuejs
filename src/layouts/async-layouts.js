import { defineAsyncComponent } from 'vue'

export function registerLayoutComponent(app) {
	app.component(
		'auth-layout',
		defineAsyncComponent(() => import('@/layouts/AuthLayout.vue')),
	)
	app.component(
		'default-layout',
		defineAsyncComponent(() => import('@/layouts/dashboard-layout/Container.vue')),
	)
}
