import './firebase/initialize'
import { createApp } from 'vue'
import Antd from 'ant-design-vue'
import 'ant-design-vue/dist/antd.css'
import '@/assets/styles/tailwind.css'
import '@/assets/styles/global.scss'
import { registerLayoutComponent } from '@/layouts/async-layouts'
import { registerDirective } from '@/vue-config/directive'
import router from '@/router'
import App from '@/App.vue'

const app = createApp(App)
app.config.productionTip = false
registerLayoutComponent(app)
registerDirective(app)
app.use(Antd)
app.use(router)
app.mount('#app')
