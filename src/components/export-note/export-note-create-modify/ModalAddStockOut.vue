<template>
	<a-modal
		v-model:visible="visibleModal"
		:afterClose="refreshModal"
		@ok="handleModalStockOutOk"
		:ok-text="isEditMode ? 'Cập nhật hàng' : 'Thêm sản phẩm'"
		:title="isEditMode ? 'Cập nhật hàng' : 'Thêm sản phẩm'"
		style="top: 50px"
		width="600px"
	>
		<form>
			<div class="flex items-center mb-2">
				<div class="w-20 flex-none">Sản phẩm</div>
				<InputFilterStockOut
					v-model:searchText="goods.goodsName"
					:disabled="!!isEditMode"
					@selectItem="handleSelectGoods"
					@searching="handleSearching"
				/>
			</div>
			<div class="flex items-center mb-2">
				<div class="w-20 flex-none"></div>
				<div class="flex-auto">
					<div class="flex">
						<div class="w-10">HSD</div>
						<div class="w-4">:</div>
						{{ formatDateTime(goods.expiryDate) }}
					</div>
					<div class="flex">
						<div class="w-10">Tồn</div>
						<div class="w-4">:</div>
						{{ goods.quantity }}
					</div>
				</div>
			</div>
			<div class="flex items-center mb-2">
				<div class="w-20 flex-none">Số lượng</div>
				<a-input v-model:value.number="quantity" type="number" :addon-after="goods.unit" class="flex-auto" />
			</div>
			<div class="flex items-center mb-2">
				<div class="w-20 flex-none">Giá</div>
				<a-radio-group v-model:value="expectedPrice" class="flex-col">
					<div class="flex mb-1">
						<div class="w-16">Nhập</div>
						<a-radio :value="goods.costPrice">{{ goods.costPrice }}</a-radio>
					</div>
					<div class="flex mb-1">
						<div class="w-16">Sỉ</div>
						<a-radio :value="goods.wholesalePrice">{{ goods.wholesalePrice }}</a-radio>
					</div>
					<div class="flex">
						<div class="w-16">Lẻ</div>
						<a-radio :value="goods.retailPrice">{{ goods.retailPrice }}</a-radio>
					</div>
				</a-radio-group>
			</div>
			<div class="flex items-center mb-2">
				<div class="w-20 flex-none">Giảm giá</div>
				<a-input class="flex-auto" v-model:value.number="discount.number" type="number" />
				<a-select v-model:value="discount.type" style="font-size:16px">
					<a-select-option value="vnd">.000</a-select-option>
					<a-select-option value="percent">%</a-select-option>
				</a-select>
			</div>
			<div class="flex items-center mb-2">
				<div class="w-20 flex-none">Bán</div>
				<div>{{ formatNumber(actualPrice) }}</div>
			</div>
			<div class="flex items-center mb-2">
				<div class="w-20 flex-none">Tổng</div>
				<div>{{ formatNumber(totalPrice) }}</div>
			</div>
		</form>
	</a-modal>
</template>

<script>
import { ref } from 'vue'
import { message } from 'ant-design-vue'
import { MyFormatNumber, MyFormatDateTime } from '@/utils/convert'
import { goodsArray } from '@/firebase/useWarehouse'
import InputFilterStockOut from '@/components/export-note/export-note-create-modify/InputFilterStockOut.vue'

export default {
	components: { InputFilterStockOut },
	setup() {
		return {
			isEditMode: ref(''),
			visibleModal: ref(false),

			goods: ref({
				goodsID: '',
				goodsName: '',
				group: '-',
				unit: '-',
				retailPrice: '',
				wholesalePrice: '',
				expiryDate: '',
				quantity: '-',
				costPrice: '',
			}),

			expectedPrice: ref('-'),
			quantity: ref(''),
			discount: ref({
				number: '',
				type: 'vnd',
			}),
			goodsArray,
		}
	},
	computed: {
		actualPrice() {
			if (this.discount.type === 'vnd') {
				return this.expectedPrice - this.discount.number
			}
			return this.expectedPrice * (1 - this.discount.number / 100)
		},
		totalPrice() {
			return this.actualPrice * this.quantity
		},
	},
	methods: {
		setDataModal({ infoGoods, infoSell }) {
			this.goods.goodsID = infoGoods.goodsID || ''
			this.goods.goodsName = infoGoods.goodsName || ''
			this.goods.group = infoGoods.group || ''
			this.goods.unit = infoGoods.unit || ''
			this.goods.expiryDate = Number(infoGoods.expiryDate)
			this.goods.quantity = infoGoods.quantity || 0
			this.goods.costPrice = infoGoods.costPrice || 0
			this.goods.retailPrice = infoGoods.retailPrice || 0
			this.goods.wholesalePrice = infoGoods.wholesalePrice || 0

			this.expectedPrice = infoSell.expectedPrice || '-'
			this.quantity = infoSell.quantity || 0
			this.discount.number = infoSell.discount?.number || '0'
			this.discount.type = infoSell.discount?.type || 'vnd'
		},
		getGoodsByBatch(goodsID, expiryDate, costPrice) {
			const findGoods = this.goodsArray.find(item => item.goodsID === goodsID)
			const batch = `${expiryDate}-${costPrice}`
			return {
				goodsID,
				goodsName: findGoods.goodsName,
				group: findGoods.group,
				unit: findGoods.unit,
				expiryDate,
				costPrice,
				quantity: findGoods.stockAvail?.[batch]?.quantity || '',
				retailPrice: findGoods.retailPrice,
				wholesalePrice: findGoods.wholesalePrice,
			}
		},
		openModal({ infoGoods, infoSell, isEditMode } = {}) {
			this.visibleModal = true
			this.isEditMode = isEditMode || ''
			if (!infoGoods && !infoSell) return
			this.setDataModal({
				infoSell,
				infoGoods: this.getGoodsByBatch(infoGoods.goodsID, infoGoods.expiryDate, infoGoods.costPrice),
			})
		},
		refreshModal() {
			this.setDataModal({ infoGoods: {}, infoSell: {} })
		},
		handleSearching($event) {
			this.setDataModal({ infoGoods: { goodsName: $event }, infoSell: {} })
		},
		handleSelectGoods({ goodsID, expiryDate, costPrice } = {}) {
			const findGoods = this.goodsArray.find(item => item.goodsID === goodsID)
			this.setDataModal({
				infoGoods: this.getGoodsByBatch(goodsID, expiryDate, costPrice),
				infoSell: {
					expectedPrice: findGoods.retailPrice,
				},
			})
		},
		notify(noti) {
			this.$notification.open({
				message: 'Lỗi !!!',
				description: noti,
				placement: 'topRight',
				duration: 2,
			})
		},
		checkValidation() {
			if (!this.goods.goodsID) {
				this.notify('Bạn cần phải nhập tên sản phẩm !')
				return false
			}
			if (!this.quantity || this.quantity > this.goods.quantity) {
				this.notify(`Số lượng sản phẩm phải trong khoảng: từ 1 đến ${this.goods.quantity}`)
				return false
			}
			return true
		},
		handleModalStockOutOk() {
			if (!this.checkValidation()) return
			const stock = {
				goodsID: this.goods.goodsID,
				expiryDate: this.goods.expiryDate,
				costPrice: this.goods.costPrice,
				quantity: this.quantity,
				expectedPrice: this.expectedPrice,
				actualPrice: this.actualPrice,
			}
			this.$emit('actionStockOut', { isEditMode: this.isEditMode, stock })
			message.success(`Đã thêm ${this.goods.goodsName} với số lượng ${this.goods.quantity} vào phiếu`)
			this.visibleModal = false
		},

		formatDateTime(time) {
			return MyFormatDateTime(time, 'DD/MM/YY')
		},
		formatNumber(number) {
			return MyFormatNumber(number, 3)
		},
	},
}
</script>
