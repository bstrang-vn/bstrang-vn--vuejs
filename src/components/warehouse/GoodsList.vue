<template>
	<div class="flex justify-end mb-2">
		<a-button type="primary" @click="openModalCreateGoods">
			<template #icon>
				<PlusOutlined />
			</template>
			Tạo Sản Phẩm Mới
		</a-button>
	</div>
	<ModalCreateGoods ref="modalCreateGoods" />
	<div class="wrapper-table">
		<table class="table">
			<thead>
				<th>#</th>
				<th style="width: 30%">Tên</th>
				<th style="width: 11%">HSD</th>
				<th style="width: 11%">Nhập</th>
				<th style="width: 11%">SL</th>
				<th style="width: 11%">Sỉ</th>
				<th style="width: 11%">Lẻ</th>
				<th style="width: 11%">Tổng</th>
			</thead>
			<tbody style="text-align: right">
				<tr v-if="Object.keys(goodsList).length === 0">
					<td colspan="8" style="text-align:center">No data available in table</td>
				</tr>
				<tr
					v-for="(goods, goodsID, goodsIndex) in goodsList"
					:key="goodsIndex"
					@click="openGoodsDetails(goodsID)"
				>
					<td style="text-align: center">{{ goodsIndex + 1 }}</td>
					<td style="text-align: left">{{ goods.goodsName }}</td>
					<td>
						<p v-for="({}, batch, batchIndex) in goods.stockAvail" :key="batchIndex">
							{{ formatDateTime(Number(batch.split('-')[0])) || '-' }}
						</p>
					</td>
					<td>
						<p v-for="({}, batch, batchIndex) in goods.stockAvail" :key="batchIndex">
							{{ batch.split('-')[1] || '-' }}
						</p>
					</td>
					<td class="font-bold">
						<p v-for="({ quantity }, batch, batchIndex) in goods.stockAvail" :key="batchIndex">
							{{ quantity || '-' }}
						</p>
					</td>
					<td>{{ goods.wholesalePrice }}</td>
					<td>{{ goods.retailPrice }}</td>
					<td>
						<p v-for="({ quantity }, batch, batchIndex) in goods.stockAvail" :key="batchIndex">
							{{ quantity * Number(batch.split('-')[1]) }}
						</p>
					</td>
				</tr>
			</tbody>
		</table>
	</div>

	<div class="flex justify-end mt-2">
		Tổng Tiền :
		<span class="font-bold">{{ formatNumber(warehouseValue) }}</span>
	</div>

	<div class="mt-4">
		<a-button @click="$router.push({ name: 'Dashboard', params: {} })">Back</a-button>
	</div>
</template>

<script>
import { PlusOutlined } from '@ant-design/icons-vue'
import { goodsList } from '@/firebase/useWarehouse'
import ModalCreateGoods from '@/components/common/ModalCreateGoods.vue'
import { MyFormatDateTime, MyFormatNumber } from '@/utils/convert'

export default {
	components: { PlusOutlined, ModalCreateGoods },
	setup() {
		return { goodsList }
	},
	computed: {
		warehouseValue() {
			return Object.values(this.goodsList).reduce((accGoods, goods) => {
				const eachGoods = Object.entries(goods.stockAvail).reduce((accStock, [batcch, { quantity }]) => {
					const eachStock = quantity * Number(batcch.split('-')[1])
					return accStock + eachStock
				}, 0)
				return accGoods + eachGoods
			}, 0)
		},
	},
	methods: {
		openModalCreateGoods() {
			this.$refs.modalCreateGoods.openModal()
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
.wrapper-table {
	overflow-x: scroll;
}
</style>
