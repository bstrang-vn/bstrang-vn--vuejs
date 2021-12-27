<template>
	<h1 class="title-content">Kho hàng</h1>
	<div class="flex justify-between mb-2 items-center">
		<div class="input-text">
			<input :value="searchText" @input="handleSearchText" type="text" placeholder="Search..." />
		</div>
		<a-button type="primary" @click="openModalCreateModifyGoods">
			<template #icon>
				<PlusOutlined />
			</template>
			Tạo Mới
		</a-button>
	</div>
	<ModalCreateModifyGoods ref="modalCreateModifyGoods" />
	<div class="wrapper-table">
		<table class="table">
			<thead>
				<th>#</th>
				<th style="width: 40%">Tên</th>
				<th style="width: 11%">HSD</th>
				<th style="width: 11%">SL</th>
				<th style="width: 11%">Nhập</th>
				<th style="width: 11%">Sỉ</th>
				<th style="width: 11%">Lẻ</th>
			</thead>
			<tbody style="text-align: right">
				<tr v-if="goodsFilter.length === 0">
					<td colspan="8" style="text-align:center">No data available in table</td>
				</tr>
				<tr
					v-for="(goods, goodsIndex) in goodsFilter"
					:key="goodsIndex"
					@dblclick="openGoodsDetails(goods.goodsID)"
				>
					<td style="text-align: center">{{ goodsIndex + 1 }}</td>
					<td style="text-align: left">{{ goods.goodsName }}</td>
					<td>
						<p v-for="({}, batch, batchIndex) in goods.stockAvail" :key="batchIndex">
							{{ formatDateTime(Number(batch.split('-')[0])) || '-' }}
						</p>
					</td>
					<td class="font-bold">
						<p v-if="Object.keys(goods.stockAvail).length == 0" style="color: red">0</p>
						<p v-for="({ quantity }, batch, batchIndex) in goods.stockAvail" :key="batchIndex">
							{{ quantity || '-' }}
						</p>
					</td>
					<td>
						<p v-if="Object.keys(goods.stockAvail).length == 0">{{ goods.costPrice }}</p>
						<p v-for="({}, batch, batchIndex) in goods.stockAvail" :key="batchIndex">
							{{ batch.split('-')[1] || '-' }}
						</p>
					</td>

					<td>{{ goods.wholesalePrice }}</td>
					<td>{{ goods.retailPrice }}</td>
				</tr>
			</tbody>
		</table>
	</div>

	<div class="flex justify-end mt-2">
		Tổng Tiền :
		<span class="font-bold">{{ formatNumber(warehouseCost) }}</span>
	</div>

	<div class="mt-4">
		<a-button @click="$router.push({ name: 'Dashboard', params: {} })">Back</a-button>
	</div>
</template>

<script>
import { ref } from 'vue'
import { PlusOutlined } from '@ant-design/icons-vue'
import { goodsArray } from '@/firebase/useWarehouse'
import ModalCreateModifyGoods from '@/components/common/ModalCreateModifyGoods.vue'
import { MyFormatDateTime, MyFormatNumber, MySearch } from '@/utils/convert'

export default {
	components: { PlusOutlined, ModalCreateModifyGoods },
	setup() {
		return {
			goodsArray,
			searchText: ref(''),
		}
	},
	computed: {
		goodsFilter() {
			return this.goodsArray
				.filter(goods => MySearch(goods.goodsName, this.searchText))
				.sort((a, b) => {
					if (a.goodsName > b.goodsName) return 1
					if (a.goodsName < b.goodsName) return -1
					return 0
				})
		},
		warehouseCost() {
			return this.goodsArray.reduce((accGoods, goods) => {
				const eachGoods = Object.entries(goods.stockAvail).reduce((accStock, [batch, { quantity }]) => {
					const eachStock = quantity * Number(batch.split('-')[1])
					return accStock + eachStock
				}, 0)
				return accGoods + eachGoods
			}, 0)
		},
	},
	methods: {
		handleSearchText(e) {
			this.searchText = e.target.value
		},
		openModalCreateModifyGoods() {
			this.$refs.modalCreateModifyGoods.openModal()
		},
		openGoodsDetails(goodsID) {
			this.$router.push({ name: 'Goods Details', params: { id: goodsID } })
		},
		formatDateTime(str) {
			return MyFormatDateTime(str, 'MM/YY')
		},
		formatNumber(number) {
			return MyFormatNumber(number, 3)
		},
	},
}
</script>

<style lang="scss" scoped>
.input-text {
	width: 400px;
	max-width: 50%;
}
</style>
