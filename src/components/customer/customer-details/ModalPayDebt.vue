<template>
	<a-modal
		v-model:visible="visibleModal"
		:confirm-loading="confirmModalLoading"
		@ok="startPayDebt"
		:afterClose="refreshModal"
		title="Trả nợ"
		width="600px"
	>
		<div class="flex items-center mb-2">
			<div class="w-28 flex-none">Số tiền</div>
			<a-input
				:value="numberPayDebt"
				@update:value="changeNumberPayDebt"
				type="number"
				addon-after=".000 vnđ"
				class="flex-auto"
			/>
		</div>
		<div class="items-center mb-2">
			<div class="w-28 flex-none">Đơn hàng nợ</div>
			<div>
				<div v-for="(note, index) in noteListHasDebt" :key="index" class="mb-3">
					<a-checkbox
						:checked="!!noteListSelect.find(item => item.exportNoteID === note.exportNoteID)"
						@update:checked="changeCheckboxSelectDebt($event, note)"
					>
						<span class="inline-block w-10">
							{{ noteListSelect.find(item => item.exportNoteID === note.exportNoteID)?.debt }}
						</span>
						<span class="inline-block w-20">/{{ note.finance.debt }}</span>
						<span class="inline-block w-20">{{ formatDateTime(note.updatedAt) }}</span>
						<span>Tổng: {{ note.finance.revenue + note.finance.buyerPaysShip }}</span>
					</a-checkbox>
				</div>
			</div>
		</div>
	</a-modal>
</template>

<script>
import { ref } from 'vue'
import { message } from 'ant-design-vue'
import { addPayDebt } from '@/firebase/useCustomer'
import { exportNoteDebt } from '@/firebase/useExportNote'
import { MyFormatDateTime } from '@/utils/convert'

export default {
	setup() {
		return {
			visibleModal: ref(false),
			confirmModalLoading: ref(false),
			customer: ref({}),
			numberPayDebt: ref(0),
			noteListHasDebt: ref([]),
			noteListSelect: ref([]),
			exportNoteDebt,
		}
	},
	methods: {
		async openModal(customer) {
			const that = this
			this.visibleModal = true
			this.customer = customer
			this.noteListHasDebt = this.exportNoteDebt.filter(note => note.customer.customerID === customer.customerID)
			this.noteListHasDebt.forEach(note => {
				that.noteListSelect.push({
					exportNoteID: note.exportNoteID,
					debt: note.finance.debt,
				})
				this.numberPayDebt += note.finance.debt
			})
		},
		refreshModal() {
			this.customer = {}
			this.numberPayDebt = 0
			this.noteListSelect = []
			this.noteListHasDebt = []
		},
		changeCheckboxSelectDebt($event, note) {
			if ($event) {
				this.noteListSelect.push({
					exportNoteID: note.exportNoteID,
					debt: note.finance.debt,
				})
			} else {
				this.noteListSelect = this.noteListSelect.filter(item => item.exportNoteID !== note.exportNoteID)
			}
			this.numberPayDebt = this.noteListSelect.reduce((acc, item) => {
				acc += item.debt
				return acc
			}, 0)
		},
		changeNumberPayDebt($event) {
			let totalPay = Number($event)
			this.noteListSelect = []
			for (let i = this.noteListHasDebt.length - 1; i >= 0; i -= 1) {
				if (totalPay === 0) break
				const { exportNoteID, finance } = this.noteListHasDebt[i]
				const { debt } = finance
				if (totalPay > debt) {
					this.noteListSelect.push({ exportNoteID, debt })
					totalPay -= debt
				} else {
					this.noteListSelect.push({ exportNoteID, debt: totalPay })
					totalPay = 0
				}
			}
			this.numberPayDebt = Number($event) - totalPay
		},
		async startPayDebt() {
			this.confirmModalLoading = true
			try {
				await addPayDebt(this.customer.customerID, this.noteListSelect, this.numberPayDebt)
				message.success(`Trả nợ thành công: ${this.numberPayDebt}`, 2)
				this.visibleModal = false
			} catch (error) {
				console.error(error)
				message.error(error.toString(), 10)
			} finally {
				this.confirmModalLoading = false
			}
		},
		formatDateTime(time) {
			return MyFormatDateTime(time, 'DD/MM/YY')
		},
	},
}
</script>

<style></style>
