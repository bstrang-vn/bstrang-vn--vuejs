export function registerDirective(app) {
	app.directive('click-outside', {
		beforeMount(el, binding, vnode) {
			el.clickOutsideEvent = event => {
				if (!(el === event.target || el.contains(event.target))) {
					binding.value(event, el)
				}
			}
			document.body.addEventListener('click', el.clickOutsideEvent)
		},
		unmounted(el) {
			document.body.removeEventListener('click', el.clickOutsideEvent)
		},
	})
}
