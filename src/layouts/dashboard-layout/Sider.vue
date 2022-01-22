<template>
	<div class="logo" />
	<a-menu theme="dark" mode="inline" v-model:selectedKeys="selectedMenuKeys" @click="handleMenuClick">
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
		<a-sub-menu>
			<template #icon>
				<ScheduleOutlined />
			</template>
			<template #title>Đơn hàng</template>
			<a-menu-item key="ExportNote Pending">Đơn hàng xử lý</a-menu-item>
			<a-menu-item key="ExportNote List">Danh sách theo tháng</a-menu-item>
			<a-menu-item key="ExportNote Create Modify">Tạo đơn hàng mới</a-menu-item>
		</a-sub-menu>
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
	ScheduleOutlined,
	ApartmentOutlined,
	TeamOutlined,
} from '@ant-design/icons-vue'

export default {
	components: {
		AppstoreOutlined,
		ShopOutlined,
		ShoppingCartOutlined,
		ScheduleOutlined,
		ApartmentOutlined,
		TeamOutlined,
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
