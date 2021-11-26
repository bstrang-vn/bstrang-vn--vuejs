<template>
	<div class="flex items-center wrapper-input-search-customer">
		<div class="flex-auto relative">
			<InputAutoComplete
				:searchText="customer.customerName"
				:dataSource="customerList"
				:filterData="logicFilter"
				@searching="handleSearching"
				@selectItem="handleSelectItem"
				style="position: relative"
			>
				<template v-slot:each="{ item: { customerName, phone } }">
					<p class="customer-name">{{ customerName }}</p>
					<p class="customer-number">{{ phone }}</p>
				</template>
			</InputAutoComplete>
			<div class="absolute right-2 top-1/4">
				<CheckCircleOutlined v-if="customer.customerID" style="color: blue" />
				<CloseCircleOutlined v-else style="color: #f5222d" />
			</div>
		</div>

		<button @click="$refs.modalCustomerCreateModify.openModal()" class="flex-none btn-new-customer">
			Tạo Mới
		</button>
		<ModalCustomerCreateModify ref="modalCustomerCreateModify" @actionCustomer="handleActionCustomer" />
	</div>
</template>

<script>
import { CheckCircleOutlined, CloseCircleOutlined } from '@ant-design/icons-vue'
import InputAutoComplete from '@/components/common/InputAutoComplete.vue'
import ModalCustomerCreateModify from '@/components/common/ModalCustomerCreateModify.vue'
import { customerList } from '@/firebase/useCustomer'
import { MySearch } from '@/utils/convert'

export default {
	props: { customer: Object },
	components: { InputAutoComplete, ModalCustomerCreateModify, CheckCircleOutlined, CloseCircleOutlined },
	setup() {
		return {
			customerList,
		}
	},

	methods: {
		logicFilter(item, key) {
			return MySearch(item.customerName, this.customer.customerName)
		},
		handleSearching(string) {
			this.$emit('update:customer', { customerID: '', customerName: string })
		},
		handleSelectItem({ value, key }) {
			this.$emit('update:customer', {
				customerID: key,
				customerName: value.customerName,
			})
		},
		handleActionCustomer(customer) {
			this.$emit('update:customer', {
				customerID: customer.customerID,
				customerName: customer.customerName,
			})
		},
	},
}
</script>

<style lang="scss" scoped>
.wrapper-input-search-customer {
	.btn-new-customer {
		border: 1px solid #c9c9c9;
		padding: 0.4rem 0.8rem;
		border-radius: 2px;
	}
	.customer-name {
		font-weight: bold;
		margin: 0;
	}
	.customer-number {
		margin: 0;
	}
}
</style>
