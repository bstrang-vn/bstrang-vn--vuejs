<template>
	<div class="flex items-center">
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
	<ExportNoteInvoices :exportNote="exportNote" ref="exportNoteInvoices" />
	<div class="flex justify-between mb-2">
		<a-button @click="$refs.exportNoteInvoices.openModal(exportNote)">Hóa Đơn</a-button>
		<a-button
			v-if="exportNote.status === 'Success'"
			@click="confirmRefundExportNote"
			:loading="loadingRefundExportNote"
			type="dashed"
		>
			Hoàn trả đơn hàng
		</a-button>
		<a-button
			v-if="exportNote.status === 'Pending'"
			@click="confirmDeleteExportNote"
			:loading="loadingDeleteExportNote"
			type="dashed"
		>
			Xóa đơn hàng
		</a-button>
	</div>

	<div class="mb-2">
		<ExportNoteTableGoods :exportNote="exportNote" />
	</div>

	<div class="flex justify-between">
		<a-button @click="$router.go(-1)">Back</a-button>
		<div v-if="exportNote.status === 'Pending'">
			<a-button
				@click="
					$router.push({
						name: 'ExportNote Create Modify',
						params: { id: exportNote.exportNoteID },
					})
				"
				danger
			>
				Sửa đơn hàng
			</a-button>
			<a-button
				@click="startProcessExportNote(exportNote.exportNoteID)"
				type="primary"
				class="ml-2"
			>
				Gửi hàng
			</a-button>
		</div>
		<div
			v-if="
				exportNote.status === 'Success' &&
					exportNote.payment?.alreadyPaid !== exportNote.finance?.revenue
			"
		>
			<a-button type="primary" @click="visiblePayDebt = true">
				Trả nợ
			</a-button>
			<a-modal
				v-model:visible="visiblePayDebt"
				@ok="startPayDebtExportNote"
				:confirm-loading="loadingPayDebt"
				title="Trả nợ"
			>
				<div class="flex items-center mb-2">
					<div class="w-100px flex-none">Số tiền</div>
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
import { goodsList } from '@/firebase/useWarehouse'
import ExportNoteTableGoods from '@/components/export-note/ExportNoteTableGoods.vue'
import ExportNoteInvoices from '@/components/export-note/export-note-details/ExportNoteInvoices.vue'
import { UTILS_EXPORTNOTES } from '@/utils/constants'

export default {
	components: { ExportNoteTableGoods, ExportNoteInvoices },
	setup() {
		const route = useRoute()
		const realtimeExportNote = startRealtimeExportNote(route.params.id)

		return {
			exportNote: realtimeExportNote.data,
			realtimeExportNote,
			goodsList,
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
			this.numberPayDebt =
				this.exportNote.finance?.revenue - this.exportNote.payment?.alreadyPaid
		},
	},
	methods: {
		async startProcessExportNote(exportNoteID) {
			this.loadingProcessExportNote = true
			try {
				await processExportNote(exportNoteID)
				message.success('Process export note success !!!', 2)
				// this.$router.push({ name: 'ExportNote List', params: {} })
			} catch (error) {
				console.error(error)
				message.error(error.toString(), 10)
			} finally {
				this.loadingProcessExportNote = false
			}
		},
		async startRefundExportNote(exportNoteID) {
			this.loadingRefundExportNote = true
			try {
				await refundExportNote(exportNoteID)
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
		async startDeleteExportNote(exportNoteID) {
			this.loadingDeleteExportNote = true
			try {
				await deleteExportNote(exportNoteID)
				message.success('Xóa đơn hàng thành công !!!', 2)
				this.$router.push({ name: 'ExportNote List', params: {} })
			} catch (error) {
				console.error(error)
				message.error(error.toString(), 10)
			} finally {
				this.loadingDeleteExportNote = false
			}
		},
		confirmRefundExportNote() {
			const that = this
			Modal.confirm({
				title: 'Confirm',
				icon: createVNode(ExclamationCircleOutlined),
				content: 'Bạn có chắc chắn muốn hoàn trả đơn hàng này ?',
				onOk() {
					that.startRefundExportNote(that.exportNote.exportNoteID)
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
					that.startDeleteExportNote(that.exportNote.exportNoteID)
				},
			})
		},
	},
}
</script>

<style lang="scss" scoped>
.w-100px {
	width: 100px;
}
</style>
