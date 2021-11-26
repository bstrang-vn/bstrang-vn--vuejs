<template>
	<div class="flex">
		<div class="w-150px">Tên:</div>
		<div class="font-bold">{{ goods.goodsName }}</div>
	</div>
	<div class="flex">
		<div class="w-150px">Nhóm:</div>
		<div>{{ goods.group }}</div>
	</div>
	<div class="flex">
		<div class="w-150px">Đơn vị:</div>
		<div>{{ goods.unit }}</div>
	</div>
	<div class="flex">
		<div class="w-150px">Sỉ:</div>
		<div>{{ goods.wholesalePrice }}</div>
	</div>
	<div class="flex">
		<div class="w-150px">Lẻ:</div>
		<div>{{ goods.retailPrice }}</div>
	</div>
	<div class="mt-4 font-bold">Hiện có trong tủ:</div>
	<div class="wrapper-table">
		<table class="table">
			<thead>
				<th>#</th>
				<th class="w-1/4">HSD</th>
				<th class="w-1/4">Nhập</th>
				<th class="w-1/4">SL</th>
				<th class="w-1/4">Tổng</th>
			</thead>
			<tbody class="text-right">
				<tr v-for="({ quantity }, batch, batchIndex) in goods.stockAvail" :key="batchIndex">
					<td class="text-center">{{ batchIndex + 1 }}</td>
					<td>{{ formatDateTime(Number(batch.split('-')[0])) }}</td>
					<td>{{ batch.split('-')[1] }}</td>
					<td>{{ quantity }}</td>
					<td>{{ quantity * Number(batch.split('-')[1]) }}</td>
				</tr>
				<tr>
					<td colspan="3">Tổng</td>
					<td>{{ totalQuantity }}</td>
					<td>{{ totalPriceImport }}</td>
				</tr>
			</tbody>
		</table>
	</div>

	<div class="mt-4 font-bold">Lịch sử nhập thuốc:</div>
	<div class="wrapper-table">
		<table class="table">
			<thead>
				<th>#</th>
				<th class="w-1/6">Nguồn</th>
				<th class="w-1/6">Ngày</th>
				<th class="w-1/6">HSD</th>
				<th class="w-1/6">Nhập</th>
				<th class="w-1/6">SL</th>
				<th class="w-1/6">Tổng</th>
			</thead>
			<tbody class="text-right">
				<tr v-for="(note, noteID, noteIndex) in goods.importNoteList" :key="noteIndex">
					<td class="text-center">{{ noteIndex + 1 }}</td>
					<td class="text-left">{{ note.provider.providerName }}</td>
					<td>{{ formatDateTime(note.createdAt) }}</td>
					<td>
						<p
							v-for="({}, batch, batchIndex) in note.stockIn[goods.goodsID]"
							:key="batchIndex"
						>
							{{ formatDateTime(Number(batch.split('-')[0])) }}
						</p>
					</td>
					<td>
						<p
							v-for="({}, batch, batchIndex) in note.stockIn[goods.goodsID]"
							:key="batchIndex"
						>
							{{ batch.split('-')[1] }}
						</p>
					</td>
					<td>
						<p
							v-for="(stock, batch, batchIndex) in note.stockIn[goods.goodsID]"
							:key="batchIndex"
						>
							{{ stock.quantity }}
						</p>
					</td>
					<td>
						<p
							v-for="(stock, batch, batchIndex) in note.stockIn[goods.goodsID]"
							:key="batchIndex"
						>
							{{ stock.quantity * Number(batch.split('-')[1]) }}
						</p>
					</td>
				</tr>
			</tbody>
		</table>
	</div>

	<div class="mt-4 font-bold">Lịch sử xuất thuốc:</div>
	<div class="wrapper-table">
		<table class="table">
			<thead>
				<th>#</th>
				<th class="w-1/6">KH</th>
				<th class="w-1/6">Ngày</th>
				<th class="w-1/6">HSD</th>
				<th class="w-1/6">Bán</th>
				<th class="w-1/6">SL</th>
				<th class="w-1/6">Tổng</th>
			</thead>
			<tbody class="text-right">
				<tr
					v-for="(note, noteID, noteIndex) in goods.exportNoteList"
					:key="noteIndex"
					@click="showExportNoteDetails(noteID)"
				>
					<td class="text-center">{{ noteIndex + 1 }}</td>
					<td class="text-left">{{ note.customer.customerName }}</td>
					<td>{{ formatDateTime(note.createdAt) }}</td>
					<td>
						<p
							v-for="({}, batch, batchIndex) in note.stockOut[goods.goodsID]"
							:key="batchIndex"
						>
							{{ formatDateTime(Number(batch.split('-')[0])) }}
						</p>
					</td>
					<td>
						<p
							v-for="(stock, batch, batchIndex) in note.stockOut[goods.goodsID]"
							:key="batchIndex"
						>
							{{ stock.actualPrice }}
						</p>
					</td>
					<td>
						<p
							v-for="(stock, batch, batchIndex) in note.stockOut[goods.goodsID]"
							:key="batchIndex"
						>
							{{ stock.quantity }}
						</p>
					</td>
					<td>
						<p
							v-for="(stock, batch, batchIndex) in note.stockOut[goods.goodsID]"
							:key="batchIndex"
						>
							{{ stock.actualPrice * stock.quantity }}
						</p>
					</td>
				</tr>
			</tbody>
		</table>
	</div>
	<div class="flex justify-between mt-4">
		<a-button @click="$router.go(-1)">Back</a-button>
		<a-button @click="startDeleteGoods(goods.goodsID)" type="dashed">Delete</a-button>
	</div>
</template>

<script>
import { createVNode } from 'vue'
import { useRoute } from 'vue-router'
import { message, Modal } from 'ant-design-vue'
import { ExclamationCircleOutlined } from '@ant-design/icons-vue'
import { startRealtimeGoods, deleteGoods } from '@/firebase/useWarehouse'
import { MyFormatDateTime } from '@/utils/convert'

export default {
	setup() {
		const route = useRoute()
		const realtimeGoods = startRealtimeGoods(route.params.id)
		return {
			goods: realtimeGoods.data,
			realtimeGoods,
		}
	},
	unmounted() {
		this.realtimeGoods.unSubscribe()
	},
	computed: {
		totalQuantity() {
			return Object.values(this.goods?.stockAvail || {}).reduce(
				(acc, { quantity }) => acc + quantity,
				0,
			)
		},
		totalPriceImport() {
			return Object.entries(this.goods.stockAvail || {}).reduce(
				(acc, [batch, { quantity }]) => {
					const each = quantity * Number(batch.split('-')[1])
					return acc + each
				},
				0,
			)
		},
	},
	methods: {
		showExportNoteDetails(noteID) {
			this.$router.push({ name: 'ExportNote Details', params: { id: noteID } })
		},
		async startDeleteGoods(goodsID) {
			if (Object.keys(this.goods.stockAvail).length !== 0) {
				this.$notification.open({
					message: 'Lỗi !!!',
					description: 'Không thể xóa thuốc vẫn còn số lượng trong tủ',
					placement: 'topRight',
					duration: 2,
				})
				return
			}
			const that = this
			Modal.confirm({
				title: () => 'Bạn có chắc chắn muốn xóa?',
				icon: () => createVNode(ExclamationCircleOutlined),
				onOk() {
					const start = async () => {
						try {
							that.realtimeGoods.unSubscribe()
							await deleteGoods(goodsID)
							message.success('Xóa thuốc thành công !!!', 2)
							that.$router.push({ name: 'Goods List', params: {} })
						} catch (error) {
							message.error(error)
							console.error(error)
						}
					}
					start()
				},
			})
		},
		formatDateTime(time) {
			return MyFormatDateTime(time, 'MM/YY')
		},
	},
}
</script>

<style lang="scss" scoped>
.w-150px {
	width: 150px;
}
</style>
