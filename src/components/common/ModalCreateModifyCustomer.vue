<template>
	<a-modal
		v-model:visible="visibleModal"
		width="900px"
		:title="customer.customerID ? 'Update Customer' : 'Create New Customer'"
		:confirm-loading="confirmModalLoading"
		:afterClose="refreshModal"
		@ok="handleModalCustomerOk"
	>
		<form>
			<div class="flex items-center mb-2">
				<div class="w-20 flex-none">Name</div>
				<a-input v-model:value="customer.customerName" class="flex-auto" />
			</div>
			<div class="flex items-center mb-2">
				<div class="w-20 flex-none">Phone</div>
				<a-input v-model:value="customer.phone" class="flex-auto" />
			</div>
			<div class="flex items-center mb-2">
				<div class="w-20 flex-none">Address</div>
				<a-input v-model:value="customer.address" class="flex-auto" />
			</div>
		</form>
	</a-modal>
</template>

<script>
import { ref } from 'vue'
import { getCustomer, addCustomer, updateCustomer } from '@/firebase/useCustomer'

export default {
	setup() {
		return {
			visibleModal: ref(false),
			confirmModalLoading: ref(false),
			customer: ref({ customerID: '', customerName: '', phone: '', address: '' }),
		}
	},
	methods: {
		async openModal(customerID) {
			this.visibleModal = true
			if (customerID) {
				const data = await getCustomer(customerID)
				this.customer.customerID = data.customerID
				this.customer.customerName = data.customerName
				this.customer.phone = data.phone
				this.customer.address = data.address
			}
		},
		refreshModal() {
			this.customer.customerID = ''
			this.customer.customerName = ''
			this.customer.phone = ''
			this.customer.address = ''
			this.confirmModalLoading = false
		},
		async handleModalCustomerOk() {
			this.confirmModalLoading = true
			const customerData = {
				customerName: this.customer.customerName,
				phone: this.customer.phone,
				address: this.customer.address,
			}
			try {
				if (!this.customer.customerID) {
					const customer = await addCustomer(customerData)
					this.$emit('actionCustomer', customer)
				} else {
					const customer = await updateCustomer(this.customer.customerID, customerData)
					this.$emit('actionCustomer', customer)
				}
				this.visibleModal = false
			} catch (error) {
				console.log(error)
			}
		},
	},
}
</script>
