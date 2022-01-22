<template>
	<div class="flex">
		<div class="input-text">
			<input v-model="monthText" placeholder="Search..." type="date" />
		</div>
		<a-button type="primary" @click="startStatisticMonth" :loading="buttonLoading">Tạo thống kê</a-button>
	</div>
	<div style="margin: 1rem">
		<a-button type="primary" @click="query" :loading="buttonLoading">Test Query</a-button>
	</div>
	<div style="margin: 1rem">
		<a-button type="primary" @click="updateDocument" :loading="buttonLoading">Update Document</a-button>
	</div>
	<div style="margin: 1rem">
		<a-button type="primary" @click="fakeData" :loading="buttonLoading">Fake Data</a-button>
	</div>
	<div style="margin: 1rem">
		<a-popconfirm title="Are you sure you want to reset Data?" ok-text="Yes" cancel-text="No" @confirm="clearData">
			<a-button type="primary" :loading="buttonLoading" danger>Clear Data</a-button>
		</a-popconfirm>
	</div>
</template>

<script>
import { ref } from 'vue'
import { clearAllData, createFakeData, testQuery, testUpdateDocument } from '@/firebase/useSettingData'
import { createStatisticMonth } from '@/firebase/useStatistics'
import { MyFormatDateTime } from '@/utils/convert'

export default {
	setup() {
		const today = MyFormatDateTime(new Date(), 'YYYY-MM-DD')
		return {
			monthText: ref(today),
			buttonLoading: ref(false),
		}
	},
	methods: {
		async startStatisticMonth() {
			this.buttonLoading = true
			await createStatisticMonth(this.monthText)
			this.buttonLoading = false
		},
		async clearData() {
			this.buttonLoading = true
			await clearAllData()
			this.buttonLoading = false
		},
		async fakeData() {
			this.buttonLoading = true
			await createFakeData()
			this.buttonLoading = false
		},
		async query() {
			this.buttonLoading = true
			await testQuery()
			this.buttonLoading = false
		},
		async updateDocument() {
			this.buttonLoading = true
			await testUpdateDocument('EXPORTNOTE', 'RE44UkXN1jcwLBYZgyVD')
			this.buttonLoading = false
		},
	},
}
</script>

<style></style>
