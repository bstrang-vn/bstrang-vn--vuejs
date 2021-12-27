<template>
	<h1 class="title-content">Danh sách nhà cung cấp</h1>
	<div class="flex justify-between mb-2">
		<div class="input-text">
			<input :value="searchText" @input="handleSearchText" type="text" placeholder="Search..." />
		</div>
		<a-button type="primary" @click="$refs.modalCreateModifyProvider.openModal()">
			<template #icon>
				<PlusOutlined />
			</template>
			Add Provider
		</a-button>
	</div>
	<ModalCreateModifyProvider ref="modalCreateModifyProvider" />
	<table class="table">
		<thead>
			<th>#</th>
			<th>Name</th>
			<th>Phone</th>
			<th>Adress</th>
		</thead>
		<tbody>
			<tr v-if="providerFilter.length === 0">
				<td colspan="5" style="text-align:center">No data available in table</td>
			</tr>
			<tr
				v-for="(provider, index) in providerFilter"
				:key="index"
				@dblclick="$router.push({ name: 'Provider Details', params: { id: provider.providerID } })"
			>
				<td>{{ index + 1 }}</td>
				<td>{{ provider.providerName }}</td>
				<td>{{ provider.phone }}</td>
				<td>{{ provider.address }}</td>
			</tr>
		</tbody>
	</table>

	<div class="mt-4">
		<a-button @click="$router.push({ name: 'Dashboard', params: {} })">Back</a-button>
	</div>
</template>

<script>
import { ref } from 'vue'
import { PlusOutlined } from '@ant-design/icons-vue'
import { providerArray } from '@/firebase/useProvider'
import ModalCreateModifyProvider from '@/components/common/ModalCreateModifyProvider.vue'
import { MySearch } from '@/utils/convert'

export default {
	components: { ModalCreateModifyProvider, PlusOutlined },
	setup() {
		return {
			providerArray,
			searchText: ref(''),
		}
	},
	computed: {
		providerFilter() {
			return this.providerArray
				.filter(provider => MySearch(provider.providerName, this.searchText))
				.sort((a, b) => {
					if (a.providerName > b.providerName) return 1
					if (a.providerName < b.providerName) return -1
					return 0
				})
		},
	},
	methods: {
		handleSearchText(e) {
			this.searchText = e.target.value
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
