<template>
	<a-modal
		v-model:visible="visibleModal"
		width="900px"
		title="Tạo Sản Phẩm Mới"
		:confirm-loading="confirmModalLoading"
		:afterClose="refreshModal"
		@ok="handleCreateGoodsOk"
	>
		<form>
			<div class="flex items-center mb-2">
				<div class="w-100px flex-none">Tên</div>
				<a-input v-model:value="newGoods.goodsName" class="flex-auto"></a-input>
			</div>
			<div class="flex items-center mb-2">
				<div class="w-100px flex-none">Nhóm</div>
				<a-select ref="select" v-model:value="newGoods.group" class="flex-auto">
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
				<a-select ref="select" v-model:value="newGoods.unit" class="flex-auto">
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
					v-model:value.number="newGoods.wholesalePrice"
					addon-after=".000 vnđ"
					type="number"
					class="flex-auto"
				></a-input>
			</div>
			<div class="flex items-center mb-2">
				<div class="w-100px flex-none">Giá Lẻ</div>
				<a-input
					v-model:value.number="newGoods.retailPrice"
					addon-after=".000 vnđ"
					type="number"
					class="flex-auto"
				></a-input>
			</div>
		</form>
	</a-modal>
</template>

<script>
import { ref, reactive } from 'vue'
import { addGoods } from '@/firebase/useWarehouse'
import { UTILS_GOODSTYPE } from '@/utils/constants'

export default {
	setup() {
		return {
			visibleModal: ref(false),
			confirmModalLoading: ref(false),
			newGoods: reactive({
				goodsName: '',
				group: '',
				unit: '',
				retailPrice: '',
				wholesalePrice: '',
			}),
			UTILS_GOODSTYPE,
		}
	},
	methods: {
		openModal() {
			this.visibleModal = true
		},
		refreshModal() {
			this.newGoods.goodsName = ''
			this.newGoods.group = ''
			this.newGoods.unit = ''
			this.newGoods.retailPrice = ''
			this.newGoods.wholesalePrice = ''

			this.confirmModalLoading = false
		},
		async handleCreateGoodsOk() {
			this.confirmModalLoading = true
			const newGoods = await addGoods({
				goodsName: this.newGoods.goodsName,
				group: this.newGoods.group,
				unit: this.newGoods.unit,
				retailPrice: this.newGoods.retailPrice,
				wholesalePrice: this.newGoods.wholesalePrice,
			})
			this.$emit('newGoodsCreated', newGoods)
			this.visibleModal = false
		},
	},
}
</script>

<style lang="scss" scoped>
.w-100px {
	width: 100px;
}
</style>
