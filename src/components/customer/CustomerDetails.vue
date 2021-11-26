<template>
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
			<a-button type="primary" @click="visiblePayDebt = true">
				Trả nợ
			</a-button>
			<a-modal
				v-model:visible="visiblePayDebt"
				@ok="startPayDebt"
				:confirm-loading="loadingPayDebt"
				title="Trả nợ"
			>
				<div class="flex items-center mb-2">
					<div class="w-20 flex-none">Số tiền</div>
					<a-input
						v-model:value.number="numberPayDebt"
						type="number"
						addon-after=".000 vnđ"
						class="flex-auto"
					/>
				</div>
			</a-modal>
		</div>
	</div>
	<div class="mt-4 mb-1 font-bold">Danh sách đơn hàng</div>
	<div class="wrapper-table">
		<table class="table">
			<thead>
				<th>#</th>
				<th>Ngày</th>
				<th>T.Toán</th>
				<th>Đã trả</th>
				<th>Tổng</th>
				<th>Nợ</th>
			</thead>
			<tbody class="text-right">
				<tr
					v-if="
						!customer.exportNoteList ||
							Object.keys(customer.exportNoteList).length === 0
					"
				>
					<td class="text-center" colspan="7">No data available in table</td>
				</tr>
				<tr
					v-for="(noteData, noteID, noteIndex) in customer.exportNoteList"
					:key="noteIndex"
					@click="$router.push({ name: 'ExportNote Details', params: { id: noteID } })"
				>
					<td class="text-center">{{ noteIndex + 1 }}</td>
					<td>{{ formatDateTime(noteData.createdAt) }}</td>
					<td class="text-left">{{ noteData.payment?.method }}</td>
					<td>{{ noteData.payment?.alreadyPaid }}</td>
					<td>{{ noteData.finance.revenue }}</td>
					<td class="font-bold">
						{{ noteData.finance.revenue - noteData.payment?.alreadyPaid }}
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
				<tr v-if="Object.keys(customer.finance?.payDebt || {}).length === 0">
					<td class="text-center" colspan="3">No data available in table</td>
				</tr>
				<tr v-for="(money, time, index) in customer.finance?.payDebt" :key="index">
					<td class="text-center">{{ index + 1 }}</td>
					<td>{{ formatDateTime(Number(time)) }}</td>
					<td>{{ money }}</td>
				</tr>
			</tbody>
		</table>
	</div>
	<div class="flex justify-between mt-4">
		<a-button @click="$router.go(-1)">Back</a-button>
		<a-button @click="confirmDeleteCustomer" :loading="loadingDeleteCustomer" type="dashed">
			Delete
		</a-button>
	</div>
</template>

<script>
import { ref, createVNode } from 'vue'
import { useRoute } from 'vue-router'
import { Modal, message } from 'ant-design-vue'
import { ExclamationCircleOutlined } from '@ant-design/icons-vue'
import { startRealtimeCustomer, addPayDebt, deleteCustomer } from '@/firebase/useCustomer'
import ModalCustomerCreateModify from '@/components/common/ModalCustomerCreateModify.vue'
import { MyFormatDateTime } from '@/utils/convert'

export default {
	components: { ModalCustomerCreateModify },
	setup() {
		const route = useRoute()
		const realtimeCustomer = startRealtimeCustomer(route.params.id)
		return {
			customer: realtimeCustomer.data,
			realtimeCustomer,
			numberPayDebt: ref(0),
			loadingPayDebt: ref(false),
			visiblePayDebt: ref(false),
			loadingDeleteCustomer: ref(false),
		}
	},
	unmounted() {
		this.realtimeCustomer.unSubscribe()
	},
	methods: {
		async startPayDebt() {
			this.loadingPayDebt = true
			try {
				await addPayDebt(this.customer.customerID, this.numberPayDebt)
				message.success(`Trả nợ thành công: ${this.numberPayDebt}`, 2)
				this.visiblePayDebt = false
			} catch (error) {
				console.error(error)
				message.error(error.toString(), 10)
			} finally {
				this.loadingPayDebt = false
			}
		},
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
					description:
						'Đơn hàng của khách hàng này vẫn tồn tại. Không thể xóa khách hàng này',
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
		formatDateTime(time) {
			return MyFormatDateTime(time, 'DD/MM/YY')
		},
	},
}
</script>
