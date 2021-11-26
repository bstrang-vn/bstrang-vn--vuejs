<template>
    <a-card style="max-width: 600px; margin: 50px auto">
        <a-divider style="font-size: 1.5rem">Sign in</a-divider>
        <a-form
            class="form-auth"
            :model="formState"
            :rules="rules"
            v-bind="{ labelCol: { span: 4 } }"
            @finish="handleFinish"
            @finishFailed="handleFinishFailed"
        >
            <a-form-item has-feedback name="email">
                <a-input v-model:value="formState.email" placeholder="Email">
                    <template #prefix><MailOutlined style="color: rgba(0, 0, 0, 0.25)" /></template>
                </a-input>
            </a-form-item>
            <a-form-item has-feedback name="password">
                <a-input-password v-model:value="formState.password" placeholder="Password">
                    <template #prefix><LockOutlined style="color: rgba(0, 0, 0, 0.25)" /></template>
                </a-input-password>
            </a-form-item>
            <a-form-item>
                <a-checkbox v-model:checked="checkboxRemember">Remember me</a-checkbox>
            </a-form-item>
            <a-form-item>
                <a-button
                    :disabled="signPending"
                    block
                    class="button-submit"
                    type="primary"
                    html-type="submit"
                >
                    Login <a-spin v-if="signPending" style="margin-left: 1rem" />
                </a-button>
            </a-form-item>
            {{ signFailed }}
        </a-form>
        <a-space direction="vertical" style="float: right">
            <router-link to="/forgot-password">
                <a-typography-link href=""> Forgot Password </a-typography-link>
            </router-link>
            <router-link to="/register">
                <a-typography-link href=""> Create an account </a-typography-link>
            </router-link>
        </a-space>
    </a-card>
</template>

<script>
import { reactive, ref } from 'vue'
import { useRouter } from 'vue-router'
import { MailOutlined, LockOutlined } from '@ant-design/icons-vue'
import { checkEmail, checkPassword } from '@/utils/form-antd-rules'
import { login, signPending, signFailed } from '@/firebase/useAuth'

export default {
    components: {
        MailOutlined,
        LockOutlined,
    },
    setup() {
        const router = useRouter()
        const checkboxRemember = ref(false)
        const formState = reactive({
            email: '',
            password: '',
        })

        const handleFinish = async (values) => {
            await login(values.email, values.password)
            if (!signFailed.value) {
                router.push({ name: 'Dashboard', params: {} })
            }
        }

        const handleFinishFailed = (errors) => {
            console.log(errors)
        }
        const rules = {
            email: [{ required: true, validator: checkEmail, trigger: 'change' }],
            password: [{ required: true, validator: checkPassword, trigger: 'change' }],
        }
        return {
            formState,
            rules,
            checkboxRemember,
            handleFinish,
            handleFinishFailed,
            signPending,
            signFailed,
        }
    },
}
</script>

<style scoped>
.form-auth {
    margin-top: 2rem;
}
.button-submit {
    margin-top: 1rem;
}
</style>
