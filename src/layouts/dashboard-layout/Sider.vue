<template>
	<div class="logo" />
	<a-menu
		theme="dark"
		mode="inline"
		v-model:selectedKeys="selectedMenuKeys"
		@click="handleMenuClick"
	>
		<a-menu-item key="Dashboard">
			<AppstoreOutlined />
			<span>Home</span>
		</a-menu-item>
		<a-menu-item key="Goods List">
			<ShopOutlined />
			<span>Kho Hàng</span>
		</a-menu-item>
		<a-menu-item key="ImportNote List">
			<ShoppingCartOutlined />
			<span>Phiếu Nhập Hàng</span>
		</a-menu-item>
		<a-menu-item key="ExportNote List">
			<FormOutlined />
			<span>Đơn Hàng</span>
		</a-menu-item>
		<a-menu-item key="Provider List">
			<ApartmentOutlined />
			<span>Nhà Cung Cấp</span>
		</a-menu-item>
		<a-menu-item key="Customer List">
			<TeamOutlined />
			<span>Khách Hàng</span>
		</a-menu-item>
	</a-menu>
</template>

<script>
import { ref } from 'vue'
import {
	AppstoreOutlined,
	ShopOutlined,
	ShoppingCartOutlined,
	FormOutlined,
	ApartmentOutlined,
	TeamOutlined,
	AreaChartOutlined,
} from '@ant-design/icons-vue'

export default {
	components: {
		AppstoreOutlined,
		ShopOutlined,
		ShoppingCartOutlined,
		FormOutlined,
		ApartmentOutlined,
		TeamOutlined,
		AreaChartOutlined,
	},
	setup() {
		return { selectedMenuKeys: ref(['']) }
	},
	emits: ['handleShowDrawer'],
	methods: {
		handleMenuClick(menu) {
			this.$router.push({ name: menu.key, params: {} })
			this.$emit('handleShowDrawer', false)
		},
	},
}
</script>

<style>
.logo {
	height: 32px;
	background: rgba(255, 255, 255, 0.3);
	margin: 16px;
}
</style>
