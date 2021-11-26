<template>
	<div class="flex justify-end mb-2">
		<a-button type="primary" @click="$refs.modalCustomerCreateModify.openModal()">
			<template #icon>
				<PlusOutlined />
			</template>
			Tạo khách hàng mới
		</a-button>
	</div>
	<ModalCustomerCreateModify ref="modalCustomerCreateModify" />
	<table class="table">
		<thead>
			<th>#</th>
			<th>Tên</th>
			<th>SĐT</th>
			<th>Địa chỉ</th>
			<th>Nợ</th>
		</thead>
		<tbody>
			<tr v-if="Object.keys(customerList).length === 0">
				<td colspan="5" class="text-center">No data available in table</td>
			</tr>
			<tr
				v-for="(customer, customerID, index) in customerList"
				:key="index"
				@click="$router.push({ name: 'Customer Details', params: { id: customerID } })"
			>
				<td class="text-center">{{ index + 1 }}</td>
				<td>{{ customer.customerName }}</td>
				<td>{{ customer.phone }}</td>
				<td>{{ customer.address }}</td>
				<td class="text-right">{{ customer.finance?.debt }}</td>
			</tr>
		</tbody>
	</table>

	<div class="mt-4">
		<a-button @click="$router.push({ name: 'Dashboard', params: {} })">Back</a-button>
	</div>
</template>

<script>
import { PlusOutlined } from '@ant-design/icons-vue'
import { customerList } from '@/firebase/useCustomer'
import ModalCustomerCreateModify from '@/components/common/ModalCustomerCreateModify.vue'

export default {
	components: { ModalCustomerCreateModify, PlusOutlined },
	setup() {
		return { customerList }
	},
}
</script>
