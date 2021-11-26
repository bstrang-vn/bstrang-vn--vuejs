<template>
	<div class="flex items-center wrapper-input-search-provider">
		<div class="flex-auto relative">
			<InputAutoComplete
				:searchText="provider.providerName"
				:dataSource="providerList"
				:filterData="logicFilter"
				@searching="handleSearching"
				@selectItem="handleSelectItem"
				style="position: relative"
			>
				<template v-slot:each="{ item: { providerName, phone } }">
					<p class="provider-name">{{ providerName }}</p>
					<p class="provider-number">{{ phone }}</p>
				</template>
			</InputAutoComplete>
			<div class="absolute right-2 top-1/4">
				<CheckCircleOutlined v-if="provider.providerID" style="color: blue" />
				<CloseCircleOutlined v-else style="color: #f5222d" />
			</div>
		</div>
		<button @click="$refs.modalProviderCreateModify.openModal()" class="flex-none btn-new-provider">
			Tạo Mới
		</button>
		<ModalProviderCreateModify ref="modalProviderCreateModify" @actionProvider="handleActionProvider" />
	</div>
</template>

<script>
import { CheckCircleOutlined, CloseCircleOutlined } from '@ant-design/icons-vue'
import InputAutoComplete from '@/components/common/InputAutoComplete.vue'
import ModalProviderCreateModify from '@/components/common/ModalProviderCreateModify.vue'
import { providerList } from '@/firebase/useProvider'
import { MySearch } from '@/utils/convert'

export default {
	props: { provider: Object },
	components: { InputAutoComplete, ModalProviderCreateModify, CheckCircleOutlined, CloseCircleOutlined },
	setup() {
		return {
			providerList,
		}
	},
	methods: {
		logicFilter(item, key) {
			return MySearch(item.providerName, this.provider.providerName)
		},
		handleSearching(string) {
			this.$emit('update:provider', { providerID: '', providerName: string })
		},
		handleSelectItem({ key, value }) {
			this.$emit('update:provider', {
				providerID: key,
				providerName: value.providerName,
			})
		},
		handleActionProvider(provider) {
			this.$emit('update:provider', {
				providerID: provider.providerID,
				providerName: provider.providerName,
			})
		},
	},
}
</script>

<style lang="scss" scoped>
.wrapper-input-search-provider {
	.btn-new-provider {
		border: 1px solid #c9c9c9;
		padding: 0.4rem 0.8rem;
		border-radius: 2px;
	}
	.provider-name {
		font-weight: bold;
		margin: 0;
	}
	.provider-number {
		margin: 0;
	}
}
</style>
