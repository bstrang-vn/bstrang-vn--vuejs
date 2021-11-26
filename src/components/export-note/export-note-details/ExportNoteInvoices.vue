<template>
	<a-modal
		v-model:visible="visibleModal"
		title="Invoices"
		@ok="() => {}"
		style="top: 20px"
		width="600px"
	>
		<div class="text-xs">
			<div class="flex justify-between">
				<div class="flex flex-col items-center italic">
					<p>Da liễu thẩm mỹ MEDI</p>
					<p>Bs Bùi Trang</p>
					<p>0968.100.994</p>
				</div>
				<div class="italic">
					<p class="flex items-center">
						<span class="w-16 flex-none">Ngân hàng</span>
						<span class="w-4 flex-none">:</span>
						<span>VietinBank</span>
					</p>
					<p class="flex items-center">
						<span class="w-16 flex-none">Chi nhánh</span>
						<span class="w-4 flex-none">:</span>
						<span>Bắc Hà Nội</span>
					</p>
					<p class="flex items-center">
						<span class="w-16 flex-none">Số TK</span>
						<span class="w-4 flex-none">:</span>
						<span class="font-bold">109.869.634.541</span>
					</p>
					<p class="flex items-center">
						<span class="w-16 flex-none">Chủ TK</span>
						<span class="w-4 flex-none">:</span>
						<span>Bùi Thị Trang</span>
					</p>
				</div>
			</div>
		</div>
		<div class="flex justify-center font-bold text-xl my-5">HÓA ĐƠN</div>
		<div class="flex items-center mb-4">
			<div class="w-20 flex-none">Khách hàng</div>
			<div class="w-4 flex-none">:</div>
			<div>{{ exportNote.customer.customerName }}</div>
		</div>

		<div class="wrapper mb-4">
			<table>
				<thead>
					<th>Tên Hàng</th>
					<th>Đ.Vị</th>
					<th>S.Lượng</th>
					<th>Đơn giá</th>
					<th>T.Tiền</th>
				</thead>
				<tbody>
					<template
						v-for="(batchList, goodsID, stockIndex) in exportNote.stockOut"
						:key="stockIndex"
					>
						<tr
							v-for="({ quantity, expectedPrice, actualPrice },
							batchID,
							batchIndex) in batchList"
							:key="batchIndex"
						>
							<td>{{ goodsList[goodsID].goodsName }}</td>
							<td class="text-center">{{ goodsList[goodsID].unit }}</td>
							<td class="text-right">{{ quantity }}</td>
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
						<td colspan="4">Ship</td>
						<td>{{ formatNumber(exportNote.shipping.cost) }}</td>
					</tr>
					<tr class="text-right">
						<td colspan="4">Tổng tiền</td>
						<td>{{ formatNumber(exportNote.finance.revenue) }}</td>
					</tr>
				</tbody>
			</table>
		</div>
		<div class="flex justify-end">Ngày tạo đơn: {{ formatDateTime(exportNote.updatedAt) }}</div>
	</a-modal>
</template>

<script>
import { ref } from 'vue'
import { goodsList } from '@/firebase/useWarehouse'
import { MyFormatDateTime, MyFormatNumber } from '@/utils/convert'

export default {
	props: ['exportNote'],
	setup(props) {
		return {
			goodsList,
			visibleModal: ref(false),
		}
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
