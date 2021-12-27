<template>
	<h1 class="title-content">
		{{ $route.params.mode === 'create' ? 'Tạo đơn hàng' : '' }}
		{{ $route.params.mode === 'edit' ? 'Sửa đơn hàng' : '' }}
		{{ $route.params.mode === 'copy' ? 'Copy đơn hàng' : '' }}
	</h1>
	<div class="flex items-center mb-2">
		<div class="w-8 flex-none">KH :</div>
		<InputSearchCustomer v-model:customer="exportNote.customer" class="flex-auto" />
	</div>
	<div class="mb-1">
		<ExportNoteTableGoods
			:exportNote="exportNote"
			:editable="true"
			@editStockOut="editStockOut"
			@removeStockOut="removeStockOut"
		/>
	</div>
	<div class="flex justify-end mb-4">
		<a-button @click="$refs.modalAddStockOut.openModal()">
			<template #icon>
				<PlusOutlined />
			</template>
			Thêm sản phẩm
		</a-button>
		<ModalAddStockOut ref="modalAddStockOut" @actionStockOut="actionStockOut" />
	</div>
	<div class="flex items-center mb-4">
		<div class="w-10 flex-none">Ship</div>
		<a-radio-group v-model:value="whoPaysShip" class="flex-none">
			<a-radio value="sellerPaysShip">Seller</a-radio>
			<a-radio value="buyerPaysShip">Buyer</a-radio>
		</a-radio-group>
		<a-input v-model:value.number="shippingCost" type="number" addon-after=".000 vnđ" class="flex-auto"></a-input>
	</div>
	<div class="flex items-center mb-4">
		<div class="w-24 flex-none">Shipping Unit</div>
		<a-radio-group v-model:value="exportNote.shipping.unit" class="flex-auto">
			<a-radio v-for="(unit, index) in UTILS_EXPORTNOTES.shipping.units" :key="index" :value="unit">
				{{ unit }}
			</a-radio>
		</a-radio-group>
	</div>
	<div class="flex items-center mb-4">
		<div class="w-14 flex-none">KH trả</div>
		<a-button @click="alreadyPaid = exportNote.finance.revenue + exportNote.finance.buyerPaysShip">
			T.Toán hết
		</a-button>
		<a-input v-model:value="alreadyPaid" addon-after=".000 vnđ" type="number" class="flex-auto"></a-input>
	</div>
	<div class="flex items-center mb-4">
		<div class="w-24 flex-none">Hình thức</div>
		<a-radio-group v-model:value="exportNote.payment.method" class="flex-auto">
			<a-radio v-for="(method, index) in UTILS_EXPORTNOTES.payment.method" :key="index" :value="method">
				{{ method }}
			</a-radio>
		</a-radio-group>
	</div>
	<div class="flex items-center mb-4">
		<div class="w-24 flex-none">Ghi chú</div>
		<a-textarea v-model:value="exportNote.other" placeholder="..." :rows="1" />
	</div>
	<div class="flex justify-between">
		<a-button @click="$router.back()">
			Back
		</a-button>
		<div>
			<a-button
				v-if="!exportNote.exportNoteID"
				:loading="loadingActionExportNote"
				@click="startCreateExportNote"
				type="primary"
			>
				Tạo đơn hàng mới
			</a-button>
			<a-button
				v-if="exportNote.exportNoteID"
				@click="startUpdateExportNote"
				:loading="loadingActionExportNote"
				type="primary"
			>
				Cập nhật đơn hàng
			</a-button>
		</div>
	</div>
</template>

<script>
import { ref } from 'vue'
import { useRoute } from 'vue-router'
import { message } from 'ant-design-vue'
import { PlusOutlined } from '@ant-design/icons-vue'
import { getExportNoteById, addExportNotePending, updateExportNotePending } from '@/firebase/useExportNote'
import InputSearchCustomer from '@/components/common/InputSearchCustomer.vue'
import ExportNoteTableGoods from '@/components/export-note/ExportNoteTableGoods.vue'
import ModalAddStockOut from '@/components/export-note/export-note-create-modify/ModalAddStockOut.vue'
import { UTILS_EXPORTNOTES } from '@/utils/constants'

export default {
	components: {
		InputSearchCustomer,
		ModalAddStockOut,
		PlusOutlined,
		ExportNoteTableGoods,
	},
	setup() {
		const route = useRoute()
		const exportNote = ref({
			exportNoteID: '',
			customer: {
				customerID: '',
				customerName: '',
			},
			stockOut: {},
			shipping: { unit: '' },
			payment: { method: '' },
			finance: {
				revenue: 0,
				profit: 0,
				sellerPaysShip: 0,
				buyerPaysShip: 0,
				debt: 0,
			},
			other: '',
			status: '',
		})
		const whoPaysShip = ref('buyerPaysShip')
		const shippingCost = ref(0)
		const alreadyPaid = ref(0)

		if (route.params.id) {
			getExportNoteById(route.params.id)
				.then(res => {
					exportNote.value = res
					if (route.params.mode === 'copy') exportNote.value.exportNoteID = ''
					whoPaysShip.value = res.finance.buyerPaysShip ? 'buyerPaysShip' : 'sellerPaysShip'
					shippingCost.value = res.finance.sellerPaysShip || res.finance.buyerPaysShip
					alreadyPaid.value = res.finance.revenue + res.finance.buyerPaysShip - res.finance.debt
				})
				.catch(err => console.log(err))
		}
		return {
			exportNote,
			loadingActionExportNote: ref(false),
			UTILS_EXPORTNOTES,
			whoPaysShip,
			shippingCost,
			alreadyPaid,
		}
	},
	watch: {
		'exportNote.stockOut': {
			handler(after, before) {
				const totalCost = Object.values(after).reduce((accGoods, goods) => {
					const eachGoods = Object.entries(goods).reduce((accBatch, [batchKey, batch]) => {
						const eachDate = batch.quantity * Number(batchKey.split('-')[1])
						return accBatch + eachDate
					}, 0)
					return accGoods + eachGoods
				}, 0)
				const totalSell = Object.values(after).reduce((accGoods, goods) => {
					const eachGoods = Object.values(goods).reduce((accBatch, batch) => {
						const eachDate = batch.quantity * batch.actualPrice
						return accBatch + eachDate
					}, 0)
					return accGoods + eachGoods
				}, 0)
				this.exportNote.finance.revenue = totalSell
				this.exportNote.finance.profit = totalSell - totalCost
				this.exportNote.finance.debt =
					this.exportNote.finance.revenue + this.exportNote.finance.buyerPaysShip - this.alreadyPaid
			},
			deep: true,
		},
		shippingCost(after, before) {
			this.exportNote.finance[this.whoPaysShip] = after
			this.exportNote.finance.debt =
				this.exportNote.finance.revenue + this.exportNote.finance.buyerPaysShip - this.alreadyPaid
		},
		whoPaysShip(after, before) {
			this.exportNote.finance[before] = 0
			this.exportNote.finance[after] = this.shippingCost
			this.exportNote.finance.debt =
				this.exportNote.finance.revenue + this.exportNote.finance.buyerPaysShip - this.alreadyPaid
		},
		alreadyPaid(after, before) {
			this.exportNote.finance.debt =
				this.exportNote.finance.revenue + this.exportNote.finance.buyerPaysShip - after
		},
	},
	methods: {
		editStockOut({ goodsID, batchKey }) {
			const { expectedPrice, actualPrice, quantity } = this.exportNote.stockOut[goodsID][batchKey]
			const expiryDate = Number(batchKey.split('-')[0])
			const costPrice = Number(batchKey.split('-')[1])
			this.$refs.modalAddStockOut.openModal({
				infoGoods: { goodsID, expiryDate, costPrice },
				infoSell: {
					expectedPrice,
					quantity,
					actualPrice,
					discount: {
						number: expectedPrice - actualPrice,
						type: 'vnd',
					},
				},
				isEditMode: batchKey,
			})
		},
		removeStockOut({ goodsID, batchKey }) {
			delete this.exportNote.stockOut[goodsID][batchKey]
			if (Object.keys(this.exportNote.stockOut[goodsID]).length === 0) {
				delete this.exportNote.stockOut[goodsID][batchKey]
			}
		},
		actionStockOut({ isEditMode, stock }) {
			const { goodsID, expiryDate, quantity, costPrice, expectedPrice, actualPrice } = stock
			if (isEditMode) delete this.exportNote.stockOut[goodsID][isEditMode]

			if (!this.exportNote.stockOut[goodsID]) this.exportNote.stockOut[goodsID] = {}
			const batch = `${expiryDate}-${costPrice}`
			if (!this.exportNote.stockOut[goodsID][batch]) {
				this.exportNote.stockOut[goodsID][batch] = {}
			}
			this.exportNote.stockOut[goodsID][batch] = {
				quantity: (this.exportNote.stockOut[goodsID][batch].quantity || 0) + quantity,
				expectedPrice,
				actualPrice,
			}
		},

		notify(string) {
			this.$notification.open({
				message: 'Lỗi !!!',
				description: string,
				placement: 'topRight',
				duration: 2,
			})
		},
		checkValidation() {
			if (!this.exportNote.customer.customerID) {
				this.notify('Đơn hàng cần chọn khách hàng cụ thể !')
				return false
			}
			if (Object.keys(this.exportNote.stockOut).length === 0) {
				this.notify('Đơn hàng cần có ít nhất 1 sản phẩm !')
				return false
			}
			return true
		},
		async startCreateExportNote() {
			if (!this.checkValidation()) return
			try {
				this.loadingActionExportNote = true
				const noteID = await addExportNotePending(this.exportNote)
				message.success('Tạo đơn hàng thành công !!!', 2)
				this.$router.push({ name: 'ExportNote Details', params: { id: noteID } })
			} catch (error) {
				message.error(error.toString(), 10)
			} finally {
				this.loadingActionExportNote = false
			}
		},
		async startUpdateExportNote() {
			try {
				this.loadingActionExportNote = true
				const noteID = await updateExportNotePending(this.exportNote.exportNoteID, this.exportNote)
				message.success('Cập nhật đơn hàng thành công !!!', 2)
				this.$router.push({ name: 'ExportNote Details', params: { id: noteID } })
			} catch (error) {
				console.error(error)
				message.error(error.toString(), 10)
			} finally {
				this.loadingActionExportNote = false
			}
		},
	},
}
</script>
