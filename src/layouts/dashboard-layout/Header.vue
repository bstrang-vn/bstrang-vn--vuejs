<template>
	<a-layout-header class="dashboard-header">
		<div class="flex items-center">
			<MenuUnfoldOutlined class="icon-menu-fold" @click="$emit('handleShowDrawer', true)" />
			<div class="font-bold text-base">
				<span class="menu-item">
					<router-link to="/dashboard">Dashboard</router-link>
				</span>
			</div>
		</div>
		<div>
			<a-dropdown v-if="getUser">
				<template #overlay>
					<a-menu @click="handleUserAction">
						<a-menu-item key="1">
							<UserOutlined />
							Setting
						</a-menu-item>
						<a-menu-item key="logout">
							<LogoutOutlined />
							Logout
						</a-menu-item>
					</a-menu>
				</template>
				<a-button>
					{{ getUser.email }}
					<UserOutlined />
				</a-button>
			</a-dropdown>
			<div v-else class="flex">
				<div class="mx-2">
					<router-link to="/register" custom v-slot="{ navigate }">
						<a-button type="primary" @click="navigate">Register</a-button>
					</router-link>
				</div>
				<div>
					<router-link to="/login" custom v-slot="{ navigate }">
						<a-button type="primary" @click="navigate">Login</a-button>
					</router-link>
				</div>
			</div>
		</div>
	</a-layout-header>
</template>

<script>
import { useRouter } from 'vue-router'
import { UserOutlined, MenuUnfoldOutlined, LogoutOutlined } from '@ant-design/icons-vue'
import { getUser, logout } from '@/firebase/useAuth'

export default {
	components: {
		UserOutlined,
		MenuUnfoldOutlined,
		LogoutOutlined,
	},
	setup() {
		const router = useRouter()
		const handleLogout = async () => {
			await logout()
			router.push({ name: 'Login', params: {} })
		}
		const handleUserAction = async e => {
			if (e.key === 'logout') {
				handleLogout()
			}
		}

		return { getUser, handleLogout, handleUserAction }
	},
}
</script>

<style lang="scss" scoped>
.dashboard-header {
	background: #fff;
	padding: 0 1rem 0 0;
	display: flex;
	justify-content: space-between;
	align-items: center;
}

.menu-item {
	padding: 0 1rem;
	border-right: 1px solid #cdcdcd;
}

.icon-menu-fold {
	font-size: 18px;
	padding: 0 1rem;
	cursor: pointer;
	transition: color 0.3s;
	&:hover {
		color: #1890ff;
	}
	@media screen and (min-width: 768px) {
		display: none;
	}
}
</style>
