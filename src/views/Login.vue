<template>
	<a-card style="max-width: 600px; margin: 50px auto">
		<a-divider style="font-size: 1.5rem">Sign in</a-divider>
		<a-form
			:model="formState"
			:rules="rules"
			v-bind="{ labelCol: { span: 4 } }"
			@finish="startLogin"
			class="mt-10"
		>
			<a-form-item has-feedback name="email">
				<a-input
					v-model:value="formState.email"
					placeholder="Email"
					:autocomplete="autocomplete === true ? 'email' : 'off'"
				>
					<template #prefix><MailOutlined style="color: rgba(0, 0, 0, 0.25)" /></template>
				</a-input>
			</a-form-item>
			<a-form-item has-feedback name="password">
				<a-input-password
					v-model:value="formState.password"
					placeholder="Password"
					:autocomplete="autocomplete === true ? 'new-password' : 'off'"
				>
					<template #prefix><LockOutlined style="color: rgba(0, 0, 0, 0.25)" /></template>
				</a-input-password>
			</a-form-item>
			<a-form-item>
				<a-checkbox v-model:checked="autocomplete">Remember me</a-checkbox>
			</a-form-item>
			<a-form-item>
				<a-button
					:disabled="signInLoading"
					block
					type="primary"
					html-type="submit"
					class="mt-4"
				>
					Login
					<a-spin v-if="signInLoading" style="margin-left: 1rem" />
				</a-button>
			</a-form-item>
			{{ signInFailedMessage }}
		</a-form>
		<a-space direction="vertical" style="float: right">
			<router-link to="/forgot-password">
				<a-typography-link href="">Forgot Password</a-typography-link>
			</router-link>
			<router-link to="/register">
				<a-typography-link href="">Create an account</a-typography-link>
			</router-link>
		</a-space>
	</a-card>
</template>

<script>
import { reactive, ref } from 'vue'
import { MailOutlined, LockOutlined } from '@ant-design/icons-vue'
import { checkEmail, checkPassword } from '@/utils/form-antd-rules'
import { login } from '@/firebase/useAuth'

export default {
	components: {
		MailOutlined,
		LockOutlined,
	},
	setup() {
		const formState = reactive({
			email: '',
			password: '',
		})

		const rules = {
			email: [{ required: true, validator: checkEmail, trigger: 'change' }],
			password: [{ required: true, validator: checkPassword, trigger: 'change' }],
		}
		return {
			formState,
			rules,
			login,
			autocomplete: ref(true),
			signInLoading: ref(false),
			signInFailedMessage: ref(''),
		}
	},
	methods: {
		async startLogin() {
			try {
				this.signInLoading = true
				await login(this.formState.email, this.formState.password)
				this.$router.push({ name: 'Dashboard', params: {} })
			} catch (error) {
				console.log(error)
				this.signInFailedMessage = error.message
			} finally {
				this.signInLoading = false
			}
		},
	},
}
</script>
