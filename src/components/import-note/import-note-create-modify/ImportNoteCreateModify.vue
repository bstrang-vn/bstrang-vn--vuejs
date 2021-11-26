<template>
	<div class="flex items-center mb-2">
		<div class="w-16 flex-none">Nguồn:</div>
		<InputSearchProvider v-model:provider="importNote.provider" class="flex-auto" />
	</div>
	<div class="wrapper-table mb-1">
		<ImportNoteTableGoods
			:importNote="importNote"
			:editable="true"
			@editStockIn="editStockIn"
			@removeStockIn="removeStockIn"
		/>
	</div>
	<div class="flex justify-end mb-4">
		<a-button @click="$refs.modalAddStockIn.openModal()">
			<template #icon>
				<PlusOutlined />
			</template>
			Thêm Sản Phẩm
		</a-button>
		<ModalAddStockIn ref="modalAddStockIn" @actionStockIn="actionStockIn" />
	</div>
	<div class="flex items-center mb-2">
		<div class="w-16 flex-none">Shipping:</div>
		<a-input
			v-model:value.number="importNote.shipping.cost"
			addon-after=".000 vnđ"
			type="number"
			class="flex-auto"
		></a-input>
	</div>

	<div class="flex justify-between mt-4">
		<a-button @click="$router.back()">
			Back
		</a-button>
		<div>
			<a-button
				v-if="!importNote.importNoteID"
				:loading="loadingActionImportNote"
				@click="startCreateImportNote"
				type="primary"
			>
				Tạo Phiếu Nhập Mới
			</a-button>
			<a-button
				v-if="importNote.importNoteID"
				@click="startUpdateImportNote"
				:loading="loadingActionImportNote"
				type="primary"
			>
				Cập Nhật Phiếu
			</a-button>
		</div>
	</div>
</template>

<script>
import { ref } from 'vue'
import { useRoute } from 'vue-router'
import { message } from 'ant-design-vue'
import { PlusOutlined } from '@ant-design/icons-vue'
import { goodsList } from '@/firebase/useWarehouse'
import {
	startRealtimeImportNote,
	addImportNotePending,
	updateImportNotePending,
} from '@/firebase/useImportNote'
import InputSearchProvider from '@/components/common/InputSearchProvider.vue'
import ImportNoteTableGoods from '@/components/import-note/ImportNoteTableGoods.vue'
import ModalAddStockIn from '@/components/import-note/import-note-create-modify/ModalAddStockIn.vue'
import { UTILS_IMPORTNOTES } from '@/utils/constants'

export default {
	components: {
		InputSearchProvider,
		ImportNoteTableGoods,
		ModalAddStockIn,
		PlusOutlined,
	},
	setup() {
		const route = useRoute()
		const realtimeImportNote = startRealtimeImportNote(route.params.id)
		return {
			goodsList,
			realtimeImportNote,
			importNote: realtimeImportNote.data,

			loadingActionImportNote: ref(false),
			UTILS_IMPORTNOTES,
		}
	},
	unmounted() {
		this.realtimeImportNote.unSubscribe()
	},
	computed: {
		totalMoney() {
			const tottalPrice = Object.values(this.importNote.stockIn).reduce((accGoods, goods) => {
				const eachGoods = Object.entries(goods).reduce((accDate, [batch, { quantity }]) => {
					const eachDate = quantity * Number(batch.split('-')[1])
					return accDate + eachDate
				}, 0)
				return accGoods + eachGoods
			}, 0)
			return tottalPrice + this.importNote.shipping.cost
		},
	},
	watch: {
		totalMoney(newValue) {
			this.importNote.finance.totalMoney = newValue
		},
	},
	methods: {
		editStockIn({ goodsID, batchKey }) {
			this.$refs.modalAddStockIn.openModal({
				infoGoods: {
					goodsID,
					expiryDate: Number(batchKey.split('-')[0]) || 'NaN',
					costPrice: Number(batchKey.split('-')[1]) || 'NaN',
					quantity: this.importNote.stockIn[goodsID][batchKey].quantity,

					goodsName: this.goodsList[goodsID].goodsName,
					group: this.goodsList[goodsID].group,
					retailPrice: this.goodsList[goodsID].retailPrice,
					wholesalePrice: this.goodsList[goodsID].wholesalePrice,
				},
				isEditMode: batchKey,
			})
		},
		removeStockIn({ goodsID, batchKey }) {
			delete this.importNote.stockIn[goodsID][batchKey]
		},
		actionStockIn({ isEditMode, actionStock }) {
			const { goodsID, expiryDate, costPrice, quantity } = actionStock
			if (isEditMode) delete this.importNote.stockIn[goodsID][isEditMode]

			if (!this.importNote.stockIn[goodsID]) this.importNote.stockIn[goodsID] = {}
			const batch = `${expiryDate}-${costPrice}`
			if (!this.importNote.stockIn[goodsID][batch]) {
				this.importNote.stockIn[goodsID][batch] = { quantity: 0 }
			}
			this.importNote.stockIn[goodsID][batch].quantity += quantity
		},

		notify(string) {
			this.$notification.open({
				message: 'Error !!!',
				description: string,
				placement: 'topRight',
				duration: 2,
			})
		},
		checkValidation() {
			if (!this.importNote.provider.providerID) {
				this.notify('Phiếu nhập hàng cần chọn nhà cung cấp cụ thể!')
				return false
			}
			if (Object.keys(this.importNote.stockIn).length === 0) {
				this.notify('Phiếu nhập hàng cần ít nhất 1 sản phẩm !')
				return false
			}
			return true
		},
		async startCreateImportNote() {
			if (!this.checkValidation()) return
			try {
				this.loadingActionImportNote = true
				const noteID = await addImportNotePending(this.importNote)
				message.success('Tạo phiếu nhập hàng thành công!!!', 2)
				this.$router.push({ name: 'ImportNote Details', params: { id: noteID } })
			} catch (error) {
				message.error(error.toString(), 10)
			} finally {
				this.loadingActionImportNote = false
			}
		},
		async startUpdateImportNote() {
			try {
				this.loadingActionImportNote = true
				const noteID = await updateImportNotePending(
					this.importNote.importNoteID,
					this.importNote,
				)
				message.success('Cập nhật phiếu nhập hàng thành công !!!', 2)
				this.$router.push({ name: 'ImportNote Details', params: { id: noteID } })
			} catch (error) {
				console.error(error)
				message.error(error.toString(), 10)
			} finally {
				this.loadingActionImportNote = false
			}
		},
	},
}
</script>
