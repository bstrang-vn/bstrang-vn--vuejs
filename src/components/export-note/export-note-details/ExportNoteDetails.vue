<template>
	<h1 class="title-content">Thông tin đơn hàng</h1>
	<div class="flex items-center mb-2">
		<div class="flex-none w-20">Khách hàng</div>
		<div class="w-3">:</div>
		<div class="font-bold">{{ exportNote.customer?.customerName }}</div>
	</div>
	<div class="flex items-center mb-2">
		<div class="flex-none w-20">Status</div>
		<div class="w-3">:</div>
		<a-tag :color="exportNote.status === 'Pending' ? 'orange' : '#87d068'">
			{{ exportNote.status }}
		</a-tag>
	</div>
	<div class="flex items-center mb-2">
		<div class="flex-none w-20">Ngày</div>
		<div class="w-3">:</div>
		<div>{{ formatDateTime(exportNote.updatedAt) }}</div>
	</div>
	<div class="flex items-center mb-2">
		<div class="flex-none w-20">Ghi chú</div>
		<div class="w-3">:</div>
		<div>{{ exportNote.other }}</div>
	</div>
	<ModalInvoices :exportNote="exportNote" ref="modalInvoices" />
	<div class="flex mb-2">
		<a-button @click="$refs.modalInvoices.openModal(exportNote)" class="mr-auto">
			Hóa Đơn
		</a-button>
		<a-button
			v-if="exportNote.status === 'Success'"
			@click="confirmRefundExportNote"
			:loading="loadingRefundExportNote"
			type="dashed"
		>
			Hoàn trả
		</a-button>
		<div v-if="exportNote.status === 'Pending'" class="flex">
			<a-button @click="redirectExportNoteEdit" type="dashed" class="mr-2">Sửa</a-button>
			<a-button @click="confirmDeleteExportNote" :loading="loadingDeleteExportNote" type="dashed">
				Xóa
			</a-button>
		</div>
		<a-button @click="redirectExportNoteCopy" class="ml-2">Copy Đơn</a-button>
	</div>

	<div class="mb-2">
		<ExportNoteTableGoods :exportNote="exportNote" />
	</div>

	<div class="flex justify-between">
		<a-button @click="$router.go(-1)">Back</a-button>
		<div v-if="exportNote.status === 'Pending'" class="flex">
			<a-button @click="startProcessExportNote" type="primary" class="mr-2">
				Gửi Hàng
			</a-button>
		</div>
		<div v-if="exportNote.status === 'Success' && this.exportNote.finance?.debt > 0">
			<a-button type="primary" @click="visiblePayDebt = true">Trả nợ</a-button>
			<a-modal
				v-model:visible="visiblePayDebt"
				@ok="startPayDebtExportNote"
				:confirm-loading="loadingPayDebt"
				title="Trả nợ"
			>
				<div class="flex items-center mb-2">
					<div class="w-20 flex-none">Số tiền</div>
					<a-input
						v-model:value.number="numberPayDebt"
						type="number"
						addon-after=".000 vnđ"
						class="flex-auto"
					/>
				</div>
			</a-modal>
		</div>
	</div>
</template>

<script>
import { ref, createVNode } from 'vue'
import { useRoute } from 'vue-router'
import { Modal, message } from 'ant-design-vue'
import { ExclamationCircleOutlined } from '@ant-design/icons-vue'
import {
	startRealtimeExportNote,
	processExportNote,
	refundExportNote,
	payDebtExportNote,
	deleteExportNote,
} from '@/firebase/useExportNote'
import ExportNoteTableGoods from '@/components/export-note/ExportNoteTableGoods.vue'
import ModalInvoices from '@/components/export-note/export-note-details/ModalInvoices.vue'
import { UTILS_EXPORTNOTES } from '@/utils/constants'
import { MyFormatDateTime } from '@/utils/convert'

export default {
	components: { ExportNoteTableGoods, ModalInvoices },
	setup() {
		const route = useRoute()
		const realtimeExportNote = startRealtimeExportNote(route.params.id)
		const exportNote = realtimeExportNote.data

		return {
			exportNote,
			realtimeExportNote,
			visiblePayDebt: ref(false),
			numberPayDebt: ref(0),
			loadingProcessExportNote: ref(false),
			loadingRefundExportNote: ref(false),
			loadingDeleteExportNote: ref(false),
			loadingPayDebt: ref(false),
			UTILS_EXPORTNOTES,
		}
	},
	unmounted() {
		this.realtimeExportNote.unSubscribe()
	},
	watch: {
		exportNote() {
			this.numberPayDebt = this.exportNote.finance?.debt
		},
	},
	methods: {
		async startProcessExportNote() {
			this.loadingProcessExportNote = true
			try {
				await processExportNote(this.exportNote.exportNoteID)
				message.success('Process export note success !!!', 2)
				// this.$router.push({ name: 'ExportNote List', params: {} })
			} catch (error) {
				console.error(error)
				message.error(error.toString(), 10)
			} finally {
				this.loadingProcessExportNote = false
			}
		},
		async startRefundExportNote() {
			this.loadingRefundExportNote = true
			try {
				await refundExportNote(this.exportNote.exportNoteID)
				message.success('Refund export note success !!!', 2)
			} catch (error) {
				console.error(error)
				message.error(error.toString(), 10)
			} finally {
				this.loadingRefundExportNote = false
			}
		},
		async startPayDebtExportNote() {
			this.loadingPayDebt = true
			try {
				await payDebtExportNote(this.exportNote.exportNoteID, this.numberPayDebt)
				message.success(`Trả nợ đơn hàng thành công : ${this.numberPayDebt} !!!`, 2)
				this.visiblePayDebt = false
			} catch (error) {
				console.error(error)
				message.error(error.toString(), 10)
			} finally {
				this.loadingPayDebt = false
			}
		},
		async startDeleteExportNote() {
			this.loadingDeleteExportNote = true
			try {
				await deleteExportNote(this.exportNote.exportNoteID)
				message.success('Xóa đơn hàng thành công !!!', 2)
				this.$router.push({ name: 'ExportNote List', params: {} })
			} catch (error) {
				console.error(error)
				message.error(error.toString(), 10)
			} finally {
				this.loadingDeleteExportNote = false
			}
		},
		redirectExportNoteEdit() {
			this.$router.push({
				name: 'ExportNote Create Modify',
				params: { id: this.exportNote.exportNoteID, mode: 'edit' },
			})
		},
		redirectExportNoteCopy() {
			this.$router.push({
				name: 'ExportNote Create Modify',
				params: { id: this.exportNote.exportNoteID, mode: 'copy' },
			})
		},
		confirmRefundExportNote() {
			const that = this
			Modal.confirm({
				title: 'Confirm',
				icon: createVNode(ExclamationCircleOutlined),
				content: 'Bạn có chắc chắn muốn hoàn trả đơn hàng này ?',
				onOk() {
					that.startRefundExportNote()
				},
			})
		},
		confirmDeleteExportNote() {
			const that = this
			Modal.confirm({
				title: 'Confirm',
				icon: createVNode(ExclamationCircleOutlined),
				content: 'Bạn có chắc chắn muốn xóa đơn hàng này ?',
				onOk() {
					that.startDeleteExportNote()
				},
			})
		},
		formatDateTime(str) {
			return MyFormatDateTime(str, 'DD/MM/YYYY')
		},
	},
}
</script>
