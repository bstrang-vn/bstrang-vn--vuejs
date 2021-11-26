<template>
	<a-layout-content>
		<a-breadcrumb class="breadcrumb">
			<a-breadcrumb-item>
				<router-link to="/">
					<HomeOutlined />
				</router-link>
			</a-breadcrumb-item>
			<a-breadcrumb-item v-for="(rout, index) in matchedRouter.slice(0, -1)" :key="index">
				<router-link :to="rout.path">{{ rout.meta.breadcrumbName }}</router-link>
			</a-breadcrumb-item>
			<a-breadcrumb-item>{{ matchedRouter.at(-1)?.meta.breadcrumbName }}</a-breadcrumb-item>
		</a-breadcrumb>
		<slot></slot>
	</a-layout-content>
</template>

<script>
import { HomeOutlined } from '@ant-design/icons-vue'

export default {
	components: { HomeOutlined },
	computed: {
		matchedRouter() {
			return this.$router.currentRoute.value.matched
		},
	},
}
</script>

<style lang="scss" scoped>
.breadcrumb {
	margin-bottom: 1rem;
	padding-bottom: 0.5rem;
	border-bottom: 1px solid rgb(235, 237, 240);
}
</style>
