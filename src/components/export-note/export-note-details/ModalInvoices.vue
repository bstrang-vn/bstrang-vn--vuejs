<template>
	<a-modal v-model:visible="visibleModal" title="Invoices" @ok="() => {}" style="top: 20px" width="600px">
		<div>
			<div class="flex justify-between">
				<div class="flex flex-col items-center">
					<p>Da liễu thẩm mỹ</p>
					<p>MEDI</p>
				</div>
				<div class="flex flex-col items-center">
					<p>Bác sĩ Bùi Trang</p>
					<p>0968.100.994</p>
				</div>
			</div>
		</div>
		<div class="flex justify-center font-bold text-xl my-5">HÓA ĐƠN</div>
		<div class="flex items-center mb-4">
			<div class="w-20 flex-none">Khách hàng</div>
			<div class="w-4 flex-none">:</div>
			<div>{{ exportNote.customer?.customerName }}</div>
		</div>

		<div class="wrapper mb-4">
			<table>
				<thead>
					<th>Tên Hàng</th>
					<th>ĐV</th>
					<th>SL</th>
					<th>Đơn giá</th>
					<th>T.Tiền</th>
				</thead>
				<tbody>
					<template v-for="({ goodsName, unit, batchList }, stockIndex) in stockList" :key="stockIndex">
						<tr
							v-for="({ quantity, expectedPrice, actualPrice }, batchID, batchIndex) in batchList"
							:key="batchIndex"
						>
							<td>{{ goodsName }}</td>
							<td class="text-center">{{ unit }}</td>
							<td class="text-right text-lg text-bold">{{ quantity }}</td>
							<td class="text-right">
								<p>{{ formatNumber(actualPrice) }}</p>
								<p
									v-if="expectedPrice !== actualPrice"
									class="text-xs line-through italic text-yellow-500"
								>
									{{ formatNumber(expectedPrice) }}
								</p>
							</td>
							<td class="text-right">{{ formatNumber(quantity * actualPrice) }}</td>
						</tr>
					</template>
					<tr class="text-right">
						<td colspan="4">Tổng tiền</td>
						<td>{{ formatNumber(exportNote.finance?.revenue) }}</td>
					</tr>
					<tr class="text-right">
						<td colspan="4">Ship</td>
						<td>{{ formatNumber(exportNote.finance?.buyerPaysShip) }}</td>
					</tr>
					<tr class="text-right">
						<td colspan="4">KH cần trả</td>
						<td>{{ formatNumber(exportNote.finance?.revenue + exportNote.finance?.buyerPaysShip) }}</td>
					</tr>
					<tr>
						<td class="text-right">Ngân hàng</td>
						<td colspan="4">VietinBank</td>
					</tr>
					<tr>
						<td class="text-right">STK</td>
						<td colspan="4" class="font-bold text-lg text-red-700">109.869.634.541</td>
					</tr>
					<tr>
						<td class="text-right">Chủ TK</td>
						<td colspan="4">Bùi Thị Trang</td>
					</tr>
				</tbody>
			</table>
		</div>
		<div class="flex justify-end">Ngày tạo đơn: {{ formatDateTime(exportNote.createdAt) }}</div>
	</a-modal>
</template>

<script>
import { ref } from 'vue'
import { goodsArray } from '@/firebase/useWarehouse'
import { MyFormatDateTime, MyFormatNumber } from '@/utils/convert'

export default {
	props: ['exportNote'],
	setup(props) {
		return {
			visibleModal: ref(false),
		}
	},
	computed: {
		stockList() {
			return Object.entries(this.exportNote.stockOut || {})
				.map(([goodsID, batchList]) => {
					const findGoods = goodsArray.find(goods => goods.goodsID === goodsID)
					return {
						goodsID,
						goodsName: findGoods.goodsName,
						unit: findGoods.unit,
						batchList,
					}
				})
				.sort((a, b) => {
					if (a.goodsName > b.goodsName) return 1
					if (a.goodsName < b.goodsName) return -1
					return 0
				})
		},
	},
	methods: {
		openModal() {
			this.visibleModal = true
		},
		formatDateTime(str) {
			return MyFormatDateTime(str, 'DD/MM/YYYY')
		},
		formatNumber(number) {
			return MyFormatNumber(number, 3)
		},
	},
}
</script>
