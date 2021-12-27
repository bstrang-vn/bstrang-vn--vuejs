<template>
	<a-modal
		v-model:visible="visibleModal"
		width="900px"
		title="Tạo Sản Phẩm Mới"
		:confirm-loading="confirmModalLoading"
		:afterClose="refreshModal"
		@ok="handleModalGoodsOk"
	>
		<form>
			<div class="flex items-center mb-2">
				<div class="w-100px flex-none">Tên</div>
				<a-input v-model:value="goods.goodsName" class="flex-auto"></a-input>
			</div>
			<div class="flex items-center mb-2">
				<div class="w-100px flex-none">Nhóm</div>
				<a-select ref="select" v-model:value="goods.group" class="flex-auto">
					<a-select-option
						v-for="(group, index) in UTILS_GOODSTYPE.group"
						:key="index"
						:value="group"
					>
						{{ group }}
					</a-select-option>
				</a-select>
			</div>
			<div class="flex items-center mb-2">
				<div class="w-100px flex-none">Đơn vị</div>
				<a-select ref="select" v-model:value="goods.unit" class="flex-auto">
					<a-select-option
						v-for="(unit, index) in UTILS_GOODSTYPE.unit"
						:key="index"
						:value="unit"
					>
						{{ unit }}
					</a-select-option>
				</a-select>
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
import { goodsArray, addGoods, updateGoods } from '@/firebase/useWarehouse'
import { UTILS_GOODSTYPE } from '@/utils/constants'

export default {
	setup() {
		return {
			visibleModal: ref(false),
			confirmModalLoading: ref(false),
			goods: ref({
				goodsID: '',
				goodsName: '',
				group: '',
				unit: '',
				retailPrice: '',
				wholesalePrice: '',
			}),
			goodsArray,
			UTILS_GOODSTYPE,
		}
	},
	methods: {
		openModal(goodsID) {
			this.visibleModal = true
			if (goodsID) {
				const data = this.goodsArray.find(item => item.goodsID === goodsID)
				this.goods.goodsID = goodsID
				this.goods.goodsName = data.goodsName
				this.goods.group = data.group
				this.goods.unit = data.unit
				this.goods.retailPrice = data.retailPrice
				this.goods.wholesalePrice = data.wholesalePrice
			}
		},
		refreshModal() {
			this.goods.goodsID = ''
			this.goods.goodsName = ''
			this.goods.group = ''
			this.goods.unit = ''
			this.goods.retailPrice = ''
			this.goods.wholesalePrice = ''

			this.confirmModalLoading = false
		},
		async handleModalGoodsOk() {
			this.confirmModalLoading = true
			const goodsData = {
				goodsName: this.goods.goodsName,
				group: this.goods.group,
				unit: this.goods.unit,
				wholesalePrice: this.goods.wholesalePrice,
				retailPrice: this.goods.retailPrice,
			}
			try {
				if (!this.goods.goodsID) {
					const goods = await addGoods(goodsData)
					this.$emit('actionGoods', goods)
				} else {
					const goods = await updateGoods(this.goods.goodsID, goodsData)
					this.$emit('actionGoods', goods)
				}
				this.visibleModal = false
			} catch (error) {
				console.log(error)
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
