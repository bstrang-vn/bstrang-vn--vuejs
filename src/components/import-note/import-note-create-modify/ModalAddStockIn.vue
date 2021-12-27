<template>
	<a-modal
		v-model:visible="visibleModal"
		:confirm-loading="confirmModalLoading"
		:afterClose="refreshModal"
		@ok="handleModalStockInOk"
		:ok-text="isEditMode ? 'Cập nhật Sản Phẩm' : 'Thêm sản phẩm'"
		:title="isEditMode ? 'Cập nhật Sản Phẩm' : 'Thêm sản phẩm'"
		style="top: 50px"
		width="600px"
	>
		<form>
			<div class="flex items-center mb-2">
				<div class="w-100px flex-none">Tên</div>
				<InputFilterStockIn
					v-model:searchText="goods.goodsName"
					@selectItem="handleSelectGoods"
					@searching="handleSearching"
					class="flex-auto"
				/>
			</div>
			<div class="flex items-center mb-2">
				<div class="w-100px flex-none">Nhóm</div>
				<a-select class="flex-auto" ref="select" v-model:value="goods.group" :disabled="goods.goodsID !== ''">
					<a-select-option v-for="(group, index) in UTILS_GOODSTYPE.group" :key="index" :value="group">
						{{ group }}
					</a-select-option>
				</a-select>
			</div>
			<div class="flex items-center mb-2">
				<div class="w-100px flex-none">Đơn vị</div>
				<a-select ref="select" v-model:value="goods.unit" :disabled="goods.goodsID !== ''" class="flex-auto">
					<a-select-option v-for="(unit, index) in UTILS_GOODSTYPE.unit" :key="index" :value="unit">
						{{ unit }}
					</a-select-option>
				</a-select>
			</div>
			<div class="flex items-center mb-2">
				<div class="w-100px flex-none">HSD</div>
				<InputDate v-model:datetime="goods.expiryDate" class="flex-auto" />
			</div>
			<div class="flex items-center mb-2">
				<div class="w-100px flex-none">Số lượng</div>
				<a-input v-model:value.number="goods.quantity" type="number" class="flex-auto"></a-input>
			</div>
			<div class="flex items-center mb-2">
				<div class="w-100px flex-none">Giá Nhập</div>
				<a-input
					v-model:value.number="goods.costPrice"
					addon-after=".000 vnđ"
					type="number"
					class="flex-auto"
				></a-input>
			</div>
			<div class="flex items-center mb-2">
				<div class="w-100px flex-none">Giá Sỉ</div>
				<a-input
					v-model:value.number="goods.wholesalePrice"
					addon-after=".000 vnđ"
					type="number"
					class="flex-auto"
				></a-input>
			</div>
			<div class="flex items-center mb-2">
				<div class="w-100px flex-none">Giá Lẻ</div>
				<a-input
					v-model:value.number="goods.retailPrice"
					addon-after=".000 vnđ"
					type="number"
					class="flex-auto"
				></a-input>
			</div>
		</form>
	</a-modal>
</template>

<script>
import { ref } from 'vue'
import { message } from 'ant-design-vue'
import { goodsArray, addGoods, updateGoods } from '@/firebase/useWarehouse'
import { UTILS_GOODSTYPE } from '@/utils/constants'
import InputDate from '@/components/common/InputDate.vue'
import InputFilterStockIn from '@/components/import-note/import-note-create-modify/InputFilterStockIn.vue'

export default {
	components: { InputDate, InputFilterStockIn },
	setup() {
		return {
			isEditMode: ref(''),
			goods: ref({
				goodsID: '',
				goodsName: '',
				group: 'Đặc Trị',
				unit: 'Hộp',
				expiryDate: 'NaN',
				quantity: '',
				costPrice: '',
				retailPrice: '',
				wholesalePrice: '',
			}),
			oldPrice: ref({
				costPrice: '',
				retailPrice: '',
				wholesalePrice: '',
			}),

			visibleModal: ref(false),
			confirmModalLoading: ref(false),
			goodsArray,
			UTILS_GOODSTYPE,
		}
	},
	methods: {
		setDataModal(data) {
			this.goods.goodsID = data.goodsID || ''
			this.goods.goodsName = data.goodsName || ''
			this.goods.group = data.group || 'Đặc Trị'
			this.goods.unit = data.unit || 'Hộp'
			this.goods.expiryDate = Number(data.expiryDate) || 'NaN'
			this.goods.quantity = data.quantity || 0
			this.goods.costPrice = data.costPrice || 0
			this.goods.retailPrice = data.retailPrice || 0
			this.goods.wholesalePrice = data.wholesalePrice || 0

			this.oldPrice.costPrice = this.goods.costPrice
			this.oldPrice.retailPrice = this.goods.retailPrice
			this.oldPrice.wholesalePrice = this.goods.wholesalePrice
		},
		openModal({ infoGoods, isEditMode } = {}) {
			this.visibleModal = true
			this.isEditMode = isEditMode || ''
			if (infoGoods) this.setDataModal(infoGoods)
		},
		refreshModal() {
			this.setDataModal({})
			this.confirmModalLoading = false
		},
		handleSearching($event) {
			this.goods.goodsID = ''
		},
		handleSelectGoods({ goodsID, expiryDate, costPrice } = {}) {
			const findGoods = this.goodsArray.find(item => item.goodsID === goodsID)
			const batch = `${expiryDate || 'NaN'}-${costPrice}`
			const selectGoods = {
				goodsID,
				goodsName: findGoods.goodsName,
				group: findGoods.group,
				unit: findGoods.unit,
				expiryDate: expiryDate || 'NaN',
				costPrice,
				quantity: findGoods.stockAvail?.[batch]?.quantity,
				retailPrice: findGoods.retailPrice,
				wholesalePrice: findGoods.wholesalePrice,
			}
			this.setDataModal(selectGoods)
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
			if (!this.goods.costPrice) {
				this.notify('Bạn phải điền giá nhập !')
				return false
			}
			return true
		},
		async addUpdateGoods() {
			if (!this.goods.goodsID) {
				const newGoodsData = {
					goodsName: this.goods.goodsName,
					group: this.goods.group,
					unit: this.goods.unit,
					costPrice: this.goods.costPrice,
					retailPrice: this.goods.retailPrice,
					wholesalePrice: this.goods.wholesalePrice,
				}
				const newGoods = await addGoods(newGoodsData)
				message.success(`Sản phẩm ${this.goods.goodsName} vừa được tạo`)
				this.goods.goodsID = newGoods.goodsID
			} else if (
				this.goods.costPrice !== this.oldPrice.costPrice ||
				this.goods.retailPrice !== this.oldPrice.retailPrice ||
				this.goods.wholesalePrice !== this.oldPrice.wholesalePrice
			) {
				await updateGoods(this.goods.goodsID, {
					costPrice: this.goods.costPrice,
					retailPrice: this.goods.retailPrice,
					wholesalePrice: this.goods.wholesalePrice,
				})
				message.success(
					`Đã cập nhật giá bán của ${this.goods.goodsName}. Giá nhập: ${this.goods.costPrice}, Giá bán sỉ: ${this.goods.wholesalePrice}, Giá bán lẻ: ${this.goods.retailPrice}`,
				)
			}
		},
		async handleModalStockInOk() {
			if (!this.checkValidation()) return
			this.confirmModalLoading = true
			try {
				await this.addUpdateGoods()
				if (this.goods.quantity > 0) {
					const actionStock = {
						goodsID: this.goods.goodsID,
						expiryDate: this.goods.expiryDate || 'NaN',
						costPrice: this.goods.costPrice,
						quantity: this.goods.quantity,
					}
					this.$emit('actionStockIn', { isEditMode: this.isEditMode, actionStock })
				}
				this.visibleModal = false
			} catch (error) {
				this.notify(error.toString())
			} finally {
				this.confirmModalLoading = false
			}
		},
	},
}
</script>

<style lang="scss" scoped>
.w-100px {
	width: 100px;
}
</style>
