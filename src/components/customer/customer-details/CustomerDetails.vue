<template>
	<h1 class="title-content">Thông tin khách hàng</h1>
	<div class="flex justify-between">
		<div>
			<div class="flex">
				<div class="w-10">Tên</div>
				<div class="w-3">:</div>
				<div>{{ customer.customerName }}</div>
			</div>
			<div class="flex">
				<div class="w-10">SĐT</div>
				<div class="w-3">:</div>
				<div>{{ customer.phone }}</div>
			</div>
			<div class="flex">
				<div class="w-10">Đ/c</div>
				<div class="w-3">:</div>
				<div>{{ customer.address }}</div>
			</div>
			<div>
				<a-button @click="$refs.modalCustomerCreateModify.openModal(customer.customerID)">
					Edit
				</a-button>
				<ModalCustomerCreateModify ref="modalCustomerCreateModify" />
			</div>
		</div>
		<div>
			<div>NỢ</div>
			<div class="text-3xl">{{ customer.finance?.debt }}</div>
		</div>
		<div>
			<a-button type="primary" @click="$refs.modalPayDebt.openModal(customer)">
				Trả nợ
			</a-button>
			<ModalPayDebt ref="modalPayDebt" />
		</div>
	</div>
	<div class="mt-4 mb-1 font-bold">Danh sách đơn hàng</div>
	<div class="wrapper-table">
		<table class="table">
			<thead>
				<th>#</th>
				<th>Ngày</th>
				<th>T.Toán</th>
				<th>Tổng</th>
				<th>Nợ</th>
			</thead>
			<tbody class="text-right">
				<tr v-if="exportNoteList.length === 0">
					<td class="text-center" colspan="7">No data available in table</td>
				</tr>
				<tr
					v-for="(note, noteIndex) in exportNoteList"
					:key="noteIndex"
					@dblclick="redirectExportNoteDetails(note.exportNoteID)"
				>
					<td class="text-center">{{ noteIndex + 1 }}</td>
					<td>{{ formatDateTime(note.createdAt) }}</td>
					<td class="text-left">{{ note.payment?.method }}</td>
					<td>{{ note.finance.revenue + note.finance.buyerPaysShip }}</td>
					<td class="font-bold">
						{{ note.finance.debt }}
					</td>
				</tr>
			</tbody>
		</table>
	</div>
	<div class="mt-8 font-bold">Lịch sử trả nợ</div>
	<div class="wrapper-table mb-2">
		<table class="table">
			<thead>
				<th>#</th>
				<th>Thời gian</th>
				<th>Tiền trả</th>
			</thead>
			<tbody class="text-right">
				<tr v-if="payDebtHistory.length == 0">
					<td class="text-center" colspan="3">No data available in table</td>
				</tr>
				<tr v-for="(history, index) in payDebtHistory" :key="index">
					<td class="text-center">{{ index + 1 }}</td>
					<td>{{ formatDateTime(history.time) }}</td>
					<td>{{ history.money }}</td>
				</tr>
			</tbody>
		</table>
	</div>
	<div class="flex justify-between mt-4">
		<a-button @click="$router.go(-1)">Back</a-button>
		<a-button
			v-if="customer.exportNoteIDList?.length === 0"
			@click="confirmDeleteCustomer"
			:loading="loadingDeleteCustomer"
			type="dashed"
		>
			Delete
		</a-button>
	</div>
</template>

<script>
import { ref, createVNode } from 'vue'
import { useRoute } from 'vue-router'
import { Modal, message } from 'ant-design-vue'
import { ExclamationCircleOutlined } from '@ant-design/icons-vue'
import { startRealtimeCustomer, deleteCustomer } from '@/firebase/useCustomer'
import { getExportNoteList } from '@/firebase/useExportNote'
import ModalCustomerCreateModify from '@/components/common/ModalCreateModifyCustomer.vue'
import ModalPayDebt from '@/components/customer/customer-details/ModalPayDebt.vue'
import { MyFormatDateTime } from '@/utils/convert'

export default {
	components: { ModalCustomerCreateModify, ModalPayDebt },
	setup() {
		const route = useRoute()
		const realtimeCustomer = startRealtimeCustomer(route.params.id)
		return {
			customer: realtimeCustomer.data,
			realtimeCustomer,
			exportNoteList: ref([]),
			payDebtHistory: ref([]),
			loadingDeleteCustomer: ref(false),
		}
	},
	unmounted() {
		this.realtimeCustomer.unSubscribe()
	},
	watch: {
		'customer.exportNoteIDList': {
			async handler(after, before) {
				this.exportNoteList = (await getExportNoteList(after)).reverse()
			},
			deep: true,
		},
		'customer.finance.payDebtHistory': {
			async handler(after, before) {
				this.payDebtHistory = after.sort((a, b) => {
					if (a.time > b.time) return -1
					if (a.time < b.time) return 1
					return 0
				})
			},
			deep: true,
		},
	},
	methods: {
		async startDeleteCustomer() {
			this.loadingDeleteCustomer = true
			try {
				this.realtimeCustomer.unSubscribe()
				await deleteCustomer(this.customer.customerID)
				this.$router.push({ name: 'Customer List', params: {} })
				message.success('Delete customer success !!!', 2)
			} catch (error) {
				console.error(error)
				message.error(error.toString(), 10)
			} finally {
				this.loadingDeleteCustomer = false
			}
		},
		confirmDeleteCustomer() {
			if (this.customer.exportNoteIDList.length > 0) {
				this.$notification.open({
					message: 'Lỗi !!!',
					description: 'Đơn hàng của khách hàng này vẫn tồn tại. Không thể xóa khách hàng này',
					placement: 'topRight',
					duration: 5,
				})
				return
			}
			const that = this
			Modal.confirm({
				title: 'Confirm',
				icon: createVNode(ExclamationCircleOutlined),
				content: 'Bạn có chắc chắn muốn xóa khách hàng này ?',
				onOk() {
					that.startDeleteCustomer()
				},
			})
		},
		redirectExportNoteDetails(noteID) {
			this.$router.push({
				name: 'ExportNote Details',
				params: { id: noteID },
			})
		},
		formatDateTime(time) {
			return MyFormatDateTime(time, 'DD/MM/YY')
		},
	},
}
</script>
