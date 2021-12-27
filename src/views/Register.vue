<template>
	<a-card style="max-width: 600px; margin: 50px auto">
		<a-divider style="font-size: 1.5rem">Sign up</a-divider>
		<a-form
			ref="formRef"
			:model="formState"
			:rules="rules"
			v-bind="{ labelCol: { span: 4 } }"
			@finish="startRegister"
			class="mt-10"
		>
			<a-form-item has-feedback name="email">
				<a-input v-model:value="formState.email" placeholder="Email" type="email">
					<template #prefix><MailOutlined style="color: rgba(0, 0, 0, 0.25)" /></template>
				</a-input>
			</a-form-item>
			<a-form-item has-feedback name="phone">
				<a-input v-model:value="formState.phone" placeholder="Phone" :maxlength="10">
					<template #prefix>
						<PhoneOutlined style="color: rgba(0, 0, 0, 0.25)" />
					</template>
				</a-input>
			</a-form-item>
			<a-form-item has-feedback name="password">
				<a-input-password v-model:value="formState.password" placeholder="Password">
					<template #prefix><LockOutlined style="color: rgba(0, 0, 0, 0.25)" /></template>
				</a-input-password>
			</a-form-item>
			<a-form-item has-feedback name="repeatPassword">
				<a-input-password
					v-model:value="formState.repeatPassword"
					placeholder="Repeat Password"
				>
					<template #prefix><LockOutlined style="color: rgba(0, 0, 0, 0.25)" /></template>
				</a-input-password>
			</a-form-item>
			<a-form-item has-feedback name="checkboxTerms">
				<a-checkbox v-model:checked="formState.checkboxTerms">
					I agree to the Terms and Conditions
				</a-checkbox>
			</a-form-item>
			<a-form-item>
				<a-button
					:disabled="registerLoading"
					block
					type="primary"
					html-type="submit"
					class="mt-4"
				>
					Register
					<a-spin v-if="registerLoading" style="margin-left: 1rem" />
				</a-button>
			</a-form-item>
			{{ resgiterFailMessage }}
		</a-form>
		<a-space direction="vertical" style="float: right">
			<router-link to="/login">
				<a-typography-link href="">Have an account</a-typography-link>
			</router-link>
		</a-space>
	</a-card>
</template>

<script>
import { reactive, ref } from 'vue'
import { MailOutlined, LockOutlined, PhoneOutlined } from '@ant-design/icons-vue'
import { checkEmail, checkPhone, checkCheckboxTerms } from '@/utils/form-antd-rules'
import { register } from '@/firebase/useAuth'

export default {
	components: {
		MailOutlined,
		LockOutlined,
		PhoneOutlined,
	},
	setup() {
		const formRef = ref()
		const formState = reactive({
			email: '',
			phone: '',
			password: '',
			repeatPassword: '',
			checkboxTerms: false,
		})

		const checkPassword = async (rule, value) => {
			if (!value) {
				return Promise.reject(new Error('Please input the password'))
			}
			if (value.length < 6) {
				return Promise.reject(new Error('Password must be at least 6 characters'))
			}
			if (formState.repeatPassword !== '') {
				formRef.value.validateFields('repeatPassword')
			}
			return Promise.resolve()
		}
		const checkRepeatPassword = async (rule, value) => {
			if (!value) {
				return Promise.reject(new Error('Please input the password again'))
			}
			if (value !== formState.password) {
				return Promise.reject(new Error('Two password fields must match'))
			}
			return Promise.resolve()
		}

		const rules = {
			email: [{ required: true, validator: checkEmail, trigger: 'change' }],
			phone: [{ required: true, validator: checkPhone, trigger: 'change' }],
			password: [{ required: true, validator: checkPassword, trigger: 'change' }],
			repeatPassword: [{ required: true, validator: checkRepeatPassword, trigger: 'change' }],
			checkboxTerms: [{ required: true, validator: checkCheckboxTerms, trigger: 'change' }],
		}
		return {
			formState,
			formRef,
			rules,
			registerLoading: ref(false),
			resgiterFailMessage: ref(''),
		}
	},
	methods: {
		async startRegister() {
			try {
				this.registerLoading = true
				await register(this.formState.email, this.formState.password)
				this.$router.push({ name: 'Dashboard', params: {} })
			} catch (error) {
				this.resgiterFailMessage = error.message
			} finally {
				this.registerLoading = false
			}
		},
	},
}
</script>
