<template>
	<a-modal
		v-model:visible="visibleModal"
		width="900px"
		:title="provider.providerID ? 'Update Provider' : 'Create New Provider'"
		:confirm-loading="confirmModalLoading"
		:afterClose="refreshModal"
		@ok="handleActionProviderOk"
	>
		<form>
			<div class="flex items-center mb-2">
				<div class="w-100px flex-none">Name</div>
				<a-input v-model:value="provider.providerName" class="flex-auto" />
			</div>
			<div class="flex items-center mb-2">
				<div class="w-100px flex-none">Phone</div>
				<a-input v-model:value="provider.phone" class="flex-auto" />
			</div>
			<div class="flex items-center mb-2">
				<div class="w-100px flex-none">Address</div>
				<a-input v-model:value="provider.address" class="flex-auto" />
			</div>
		</form>
	</a-modal>
</template>

<script>
import { ref } from 'vue'
import { getProvider, addProvider, updateProvider } from '@/firebase/useProvider'

export default {
	setup() {
		return {
			visibleModal: ref(false),
			confirmModalLoading: ref(false),
			provider: ref({ providerID: '', providerName: '', phone: '', address: '' }),
		}
	},
	methods: {
		async openModal(providerID) {
			this.visibleModal = true
			if (providerID) {
				const data = await getProvider(providerID)
				this.provider.providerID = data.providerID
				this.provider.providerName = data.providerName
				this.provider.phone = data.phone
				this.provider.address = data.address
			}
		},
		refreshModal() {
			this.provider.providerID = ''
			this.provider.providerName = ''
			this.provider.phone = ''
			this.provider.address = ''
			this.confirmModalLoading = false
		},
		async handleActionProviderOk() {
			this.confirmModalLoading = true
			const providerData = {
				providerName: this.provider.providerName,
				phone: this.provider.phone,
				address: this.provider.address,
			}
			try {
				if (!this.provider.providerID) {
					const provider = await addProvider(providerData)
					this.$emit('actionProvider', provider)
				} else {
					const provider = await updateProvider(this.provider.providerID, providerData)
					this.$emit('actionProvider', provider)
				}
				this.visibleModal = false
			} catch (error) {
				console.log(error)
			}
		},
	},
}
</script>

<style lang="scss" scoped>
.w-100px {
	width: 100px;
}
</style>
