<template>
	<h1 class="title-content">Danh sách khách hàng</h1>
	<div class="flex justify-between mb-2">
		<div class="input-text">
			<input :value="searchText" @input="handleSearchText" type="text" placeholder="Search..." />
		</div>
		<a-button type="primary" @click="$refs.modalCreateModifyCustomer.openModal()">
			<template #icon>
				<PlusOutlined />
			</template>
			Tạo khách hàng mới
		</a-button>
	</div>
	<ModalCreateModifyCustomer ref="modalCreateModifyCustomer" />
	<table class="table">
		<thead>
			<th>#</th>
			<th>Tên</th>
			<th>SĐT</th>
			<th>Địa chỉ</th>
			<th>Nợ</th>
		</thead>
		<tbody>
			<tr v-if="customerFilter.length === 0">
				<td colspan="5" class="text-center">No data available in table</td>
			</tr>
			<tr
				v-for="(customer, index) in customerFilter"
				:key="index"
				@dblclick="$router.push({ name: 'Customer Details', params: { id: customer.customerID } })"
			>
				<td class="text-center">{{ index + 1 }}</td>
				<td>{{ customer.customerName }}</td>
				<td>{{ customer.phone }}</td>
				<td>{{ customer.address }}</td>
				<td :style="customer.finance?.debt ? 'color: red' : ''" class="text-right">
					{{ customer.finance?.debt }}
				</td>
			</tr>
		</tbody>
	</table>
	<div class="flex justify-end mt-2">
		Tổng Nợ :
		<span class="font-bold">{{ formatNumber(totalDebt) }}</span>
	</div>
	<div class="mt-4">
		<a-button @click="$router.push({ name: 'Dashboard', params: {} })">Back</a-button>
	</div>
</template>

<script>
import { ref } from 'vue'
import { PlusOutlined } from '@ant-design/icons-vue'
import { customerArray } from '@/firebase/useCustomer'
import ModalCreateModifyCustomer from '@/components/common/ModalCreateModifyCustomer.vue'
import { MySearch, MyFormatNumber } from '@/utils/convert'

export default {
	components: { ModalCreateModifyCustomer, PlusOutlined },
	setup() {
		return {
			customerArray,
			searchText: ref(''),
		}
	},
	computed: {
		customerFilter() {
			return this.customerArray
				.filter(customer => MySearch(customer.customerName, this.searchText))
				.sort((a, b) => {
					if (a.customerName > b.customerName) return 1
					if (a.customerName < b.customerName) return -1
					return 0
				})
		},
		totalDebt() {
			return this.customerArray.reduce((acc, customer) => {
				const each = customer.finance?.debt || 0
				return acc + each
			}, 0)
		},
	},
	methods: {
		handleSearchText(e) {
			this.searchText = e.target.value
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
