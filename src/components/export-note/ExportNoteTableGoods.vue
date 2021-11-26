<template>
	<table>
		<thead>
			<th>#</th>
			<th>Tên SP</th>
			<th>HSD</th>
			<th>SL</th>
			<th>Bán</th>
			<th>Tổng</th>
			<th v-if="editable">Action</th>
		</thead>
		<tbody class="text-right">
			<template
				v-for="(batchList, goodsID, stockIndex) in exportNote.stockOut"
				:key="stockIndex"
			>
				<tr
					v-for="({ quantity, actualPrice, expectedPrice },
					batchKey,
					batchIndex) in batchList"
					:key="batchIndex"
				>
					<td
						class="text-center"
						v-if="batchIndex === 0"
						:rowspan="Object.keys(batchList).length"
					>
						{{ stockIndex + 1 }}
					</td>
					<td
						style="text-align: left"
						v-if="batchIndex === 0"
						:rowspan="Object.keys(batchList).length"
					>
						{{ goodsList[goodsID]?.goodsName }}
					</td>
					<td>{{ formatDateTime(Number(batchKey.split('-')[0])) }}</td>
					<td class="font-bold">{{ quantity }}</td>
					<td class="text-right">
						<p>{{ actualPrice }}</p>
						<p
							v-if="expectedPrice !== actualPrice"
							class="text-xs line-through italic text-yellow-500"
						>
							{{ expectedPrice }}
						</p>
					</td>
					<td>{{ quantity * actualPrice }}</td>
					<td v-if="editable">
						<div class="flex justify-between">
							<EditTwoTone
								@click="$emit('editStockOut', { goodsID, batchKey })"
								twoToneColor="orange"
								class="delete-row-goods"
							/>
							<DeleteTwoTone
								@click="removeItem(goodsID, batchKey)"
								twoToneColor="#f5222d"
							/>
						</div>
					</td>
				</tr>
			</template>
			<tr>
				<td colspan="5">
					Shipping ({{ exportNote.shipping?.unit }} -
					{{ exportNote.shipping?.whoPays }} pays)
				</td>
				<td>{{ exportNote.shipping?.cost }}</td>
				<td v-if="editable"></td>
			</tr>
			<tr style="font-weight:bold">
				<td colspan="5">Tổng đơn hàng</td>
				<td>{{ exportNote.finance?.revenue }}</td>
				<td v-if="editable"></td>
			</tr>
			<tr>
				<td colspan="5">KH đã trả ({{ exportNote.payment?.method }})</td>
				<td>{{ exportNote.payment?.alreadyPaid }}</td>
				<td v-if="editable"></td>
			</tr>
			<tr>
				<td colspan="5">
					KH còn thiếu
				</td>
				<td>
					{{ exportNote.finance?.revenue - exportNote.payment?.alreadyPaid }}
				</td>
				<td v-if="editable"></td>
			</tr>
		</tbody>
	</table>
</template>

<script>
import { createVNode } from 'vue'
import { EditTwoTone, DeleteTwoTone, ExclamationCircleOutlined } from '@ant-design/icons-vue'
import { Modal } from 'ant-design-vue'
import { goodsList } from '@/firebase/useWarehouse'
import { MyFormatDateTime } from '@/utils/convert'

export default {
	components: { EditTwoTone, DeleteTwoTone },
	props: {
		exportNote: Object,
		editable: Boolean,
	},
	setup() {
		return { goodsList }
	},
	methods: {
		removeItem(goodsID, batchKey) {
			const that = this
			Modal.confirm({
				title: 'Confirm',
				icon: createVNode(ExclamationCircleOutlined),
				content: 'Bạn có chắc chắn muốn xóa sản phẩm này ?',
				onOk() {
					that.$emit('removeStockOut', { goodsID, batchKey })
				},
			})
		},
		formatDateTime(time) {
			return MyFormatDateTime(time, 'MM/YY')
		},
	},
}
</script>
