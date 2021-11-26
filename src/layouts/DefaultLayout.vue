<template>
    <a-layout id="dashboard-layout">
        <a-layout-sider v-model:collapsed="collapsed" :trigger="null" collapsible>
            <div class="logo" />
            <a-menu theme="dark" mode="inline" v-model:selectedKeys="selectedKeys">
                <a-menu-item key="1">
                    <user-outlined />
                    <span>nav 1</span>
                </a-menu-item>
                <a-menu-item key="2">
                    <video-camera-outlined />
                    <span>nav 2</span>
                </a-menu-item>
                <a-menu-item key="3">
                    <upload-outlined />
                    <span>nav 3</span>
                </a-menu-item>
            </a-menu>
        </a-layout-sider>
        <a-layout>
            <a-layout-header style="background: #fff; padding: 0">
                <menu-unfold-outlined
                    v-if="collapsed"
                    class="trigger"
                    @click="() => (collapsed = !collapsed)"
                />
                <menu-fold-outlined
                    v-else
                    class="trigger"
                    @click="() => (collapsed = !collapsed)"
                />
                <router-link to="/dashboard" custom v-slot="{ navigate }">
                    <a-button type="primary" @click="navigate">Dashboard</a-button>
                </router-link>
                <router-link to="/login" custom v-slot="{ navigate }">
                    <a-button type="primary" @click="navigate">Login</a-button>
                </router-link>
                <router-link to="/register" custom v-slot="{ navigate }">
                    <a-button type="primary" @click="navigate">Register</a-button>
                </router-link>
            </a-layout-header>
            <a-layout-content>
                <slot></slot>
            </a-layout-content>
            <a-layout-footer>Footer</a-layout-footer>
        </a-layout>
    </a-layout>
</template>

<script>
import { ref } from 'vue'
import {
    UserOutlined,
    VideoCameraOutlined,
    UploadOutlined,
    MenuUnfoldOutlined,
    MenuFoldOutlined,
} from '@ant-design/icons-vue'

export default {
    components: {
        UserOutlined,
        VideoCameraOutlined,
        UploadOutlined,
        MenuUnfoldOutlined,
        MenuFoldOutlined,
    },
    setup() {
        return {
            selectedKeys: ref(['1']),
            collapsed: ref(false),
        }
    },
}
</script>

<style>
#dashboard-layout {
    min-height: 100vh;
}
#dashboard-layout .trigger {
    font-size: 18px;
    line-height: 64px;
    padding: 0 24px;
    cursor: pointer;
    transition: color 0.3s;
}

#dashboard-layout .trigger:hover {
    color: #1890ff;
}

#dashboard-layout .logo {
    height: 32px;
    background: rgba(255, 255, 255, 0.3);
    margin: 16px;
}

.site-layout .site-layout-background {
    background: #fff;
}
</style>
