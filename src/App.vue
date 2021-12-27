<template>
	<component :is="layout">
		<router-view />
	</component>
</template>

<script>
import { computed } from 'vue'
import { useRoute } from 'vue-router'

export default {
	setup() {
		const route = useRoute()
		return { layout: computed(() => route.meta.layout || 'default-layout') }
	},
}
</script>

<style lang="scss">
.ant-modal {
	max-width: calc(100vw - 16px);
}
.ant-form-item {
	margin-bottom: 0.5rem;
}
.ant-input,
.ant-select {
	font-size: 16px;
}

.title-content {
	text-transform: uppercase;
	font-size: 1.20rem;
	font-weight: bold;
	text-align: center;
	margin-bottom: 0.5rem;
}
</style>
