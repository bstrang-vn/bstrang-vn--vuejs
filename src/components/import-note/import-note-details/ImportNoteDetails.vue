<template>
	<div class="flex items-center mb-2">
		<div class="flex-none w-20">Nguồn:</div>
		<div class="font-bold">{{ importNote.provider?.providerName }}</div>
	</div>
	<div class="flex items-center mb-2">
		<div class="flex-none w-20">Status:</div>
		<a-tag :color="importNote.status === 'Pending' ? 'orange' : '#87d068'">
			{{ importNote.status }}
		</a-tag>
	</div>
	<div class="flex justify-end mb-2">
		<a-button
			v-if="importNote.status === 'Pending'"
			@click="confirmDeleteImportNote"
			:loading="loadingDeleteImportNote"
			type="dashed"
		>
			Xóa phiếu
		</a-button>
		<a-button
			v-if="importNote.status === 'Success'"
			@click="confirmRefundImportNote"
			:loading="loadingRefundImportNote"
			type="dashed"
		>
			Hoàn trả phiếu
		</a-button>
	</div>
	<div class="wrapper-table mb-4">
		<ImportNoteTableGoods :importNote="importNote" />
	</div>
	<div class="flex justify-between mb-8">
		<div>
			<a-button @click="$router.back()">Back</a-button>
		</div>
		<div v-if="importNote.status === 'Pending'">
			<a-button
				@click="
					$router.push({
						name: 'ImportNote Create Modify',
						params: { id: importNote.importNoteID },
					})
				"
				danger
				class="ml-2"
			>
				Sửa phiếu
			</a-button>
			<a-button
				:loading="loadingProcessImportNote"
				@click="startProcessImportNote(importNote.importNoteID)"
				type="primary"
				class="ml-2"
			>
				Nhập thuốc
			</a-button>
		</div>
	</div>
</template>

<script>
import { ref, createVNode } from 'vue'
import { useRoute } from 'vue-router'
import { Modal, message } from 'ant-design-vue'
import { ExclamationCircleOutlined } from '@ant-design/icons-vue'
import {
	startRealtimeImportNote,
	deleteImportNote,
	refundImportNote,
	processImportNote,
} from '@/firebase/useImportNote'
import { goodsList } from '@/firebase/useWarehouse'
import ImportNoteTableGoods from '@/components/import-note/ImportNoteTableGoods.vue'

export default {
	components: { ImportNoteTableGoods },
	setup() {
		const route = useRoute()
		const realtimeImportNote = startRealtimeImportNote(route.params.id)

		return {
			importNote: realtimeImportNote.data,
			realtimeImportNote,
			goodsList,
			loadingProcessImportNote: ref(false),
			loadingRefundImportNote: ref(false),
			loadingDeleteImportNote: ref(false),
		}
	},
	unmounted() {
		this.realtimeImportNote.unSubscribe()
	},
	methods: {
		async startProcessImportNote(exportNoteID) {
			this.loadingProcessImportNote = true
			try {
				await processImportNote(exportNoteID)
				message.success('Process export note success !!!', 2)
				// this.$router.push({ name: 'ImportNote List', params: {} })
			} catch (error) {
				console.error(error)
				message.error(error.toString(), 10)
			} finally {
				this.loadingProcessImportNote = false
			}
		},
		async startRefundImportNote(exportNoteID) {
			this.loadingRefundImportNote = true
			try {
				await refundImportNote(exportNoteID)
				message.success('Hoàn trả hàng thành công !!!', 2)
			} catch (error) {
				console.error(error)
				message.error(error.toString(), 10)
			} finally {
				this.loadingRefundImportNote = false
			}
		},
		async startDeleteImportNote(exportNoteID) {
			this.loadingDeleteImportNote = true
			try {
				await deleteImportNote(exportNoteID)
				message.success('Delete export note success !!!', 2)
				this.$router.push({ name: 'ImportNote List', params: {} })
			} catch (error) {
				console.error(error)
				message.error(error.toString(), 10)
			} finally {
				this.loadingDeleteImportNote = false
			}
		},
		confirmDeleteImportNote() {
			const that = this
			Modal.confirm({
				title: 'Confirm',
				icon: createVNode(ExclamationCircleOutlined),
				content: 'Bạn có chắc chắn muốn xóa phiếu này ?',
				onOk() {
					that.startDeleteImportNote(that.importNote.importNoteID)
				},
			})
		},
		confirmRefundImportNote() {
			const that = this
			Modal.confirm({
				title: 'Confirm',
				icon: createVNode(ExclamationCircleOutlined),
				content: 'Bạn có chắc chắn muốn hoàn trả phiếu này ?',
				onOk() {
					that.startRefundImportNote(that.importNote.importNoteID)
				},
			})
		},
	},
}
</script>
