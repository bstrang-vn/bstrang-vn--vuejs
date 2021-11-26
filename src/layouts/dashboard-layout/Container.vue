<template>
	<a-layout id="dashboard-layout">
		<a-layout-sider collapsible collapsedWidth="60" width="240" breakpoint="xl">
			<Sider />
		</a-layout-sider>
		<a-drawer
			v-model:visible="openSideDrawer"
			placement="left"
			width="240"
			:closable="false"
			wrapClassName="dashboard-side-drawer"
			:bodyStyle="{ padding: 0 }"
			:drawerStyle="{ backgroundColor: '#001529' }"
		>
			<Sider @handleShowDrawer="openSideDrawer = $event" />
		</a-drawer>
		<a-layout>
			<Header @handleShowDrawer="openSideDrawer = $event" />
			<Content>
				<slot></slot>
			</Content>
			<a-layout-footer>Footer</a-layout-footer>
		</a-layout>
	</a-layout>
</template>

<script>
import { ref } from 'vue'
import Header from '@/layouts/dashboard-layout/Header.vue'
import Sider from '@/layouts/dashboard-layout/Sider.vue'
import Content from '@/layouts/dashboard-layout/Content.vue'

export default {
	components: {
		Header,
		Sider,
		Content,
	},
	setup() {
		const openSideDrawer = ref(false)
		return {
			openSideDrawer,
		}
	},
}
</script>

<style lang="scss" scoped>
#dashboard-layout {
	min-height: 100vh;
	.ant-layout-sider {
		@media screen and (max-width: 768px) {
			display: none;
		}
	}
	.ant-layout-content {
		margin: 0.5rem;
		padding: 1rem;
		background-color: #fff;
	}
}

.dashboard-side-drawer {
	@media screen and (min-width: 768px) {
		display: none;
	}
}

.site-layout .site-layout-background {
	background: #fff;
}
</style>
