<template>
	<div class="flex justify-end mb-2">
		<a-button type="primary" @click="$refs.modalProviderCreateModify.openModal()">
			<template #icon>
				<PlusOutlined />
			</template>
			Add Provider
		</a-button>
	</div>
	<table class="table">
		<thead>
			<th>#</th>
			<th>Name</th>
			<th>Phone</th>
			<th>Adress</th>
		</thead>
		<tbody>
			<tr v-if="Object.keys(providerList).length === 0">
				<td colspan="5" style="text-align:center">No data available in table</td>
			</tr>
			<tr
				v-for="(provider, providerID, index) in providerList"
				:key="index"
				@click="$router.push({ name: 'Provider Details', params: { id: providerID } })"
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
import { PlusOutlined } from '@ant-design/icons-vue'
import { message } from 'ant-design-vue'
import { providerList, deleteProvider } from '@/firebase/useProvider'

export default {
	components: { PlusOutlined },
	setup() {
		return { providerList }
	},
	methods: {
		async startDeleteProvider(providerID) {
			try {
				await deleteProvider(providerID)
				message.success('Delete Provider success !!!', 2)
			} catch (error) {
				message.error(error.toString(), 10)
			}
		},
	},
}
</script>
