<template>
	<div class="flex justify-end mb-2">
		<a-button
			type="primary"
			@click="$router.push({ name: 'ExportNote Create Modify', params: {} })"
		>
			<template #icon>
				<PlusOutlined />
			</template>
			Tạo đơn hàng mới
		</a-button>
	</div>
	<div class="wrapper-table">
		<table class="table">
			<thead>
				<tr>
					<th>#</th>
					<th>KH</th>
					<th>Ship</th>
					<th>T.Toán</th>
					<th>Tổng</th>
					<th>Nợ</th>
					<th>Ngày</th>
				</tr>
			</thead>
			<tbody class="text-right">
				<tr v-if="Object.keys(exportNoteList).length === 0">
					<td colspan="10" class="text-center">No data available in table</td>
				</tr>
				<tr
					v-for="(note, noteID, noteIndex) in exportNoteList"
					:key="noteIndex"
					@click="$router.push({ name: 'ExportNote Details', params: { id: noteID } })"
					:style="note.status === 'Pending' ? 'opacity: 0.7' : ''"
				>
					<td class="text-center">{{ noteIndex + 1 }}</td>
					<td class="text-left">{{ note.customer?.customerName || '-' }}</td>
					<td>{{ note.shipping.unit }}</td>
					<td>{{ note.payment.method }}</td>
					<td>{{ note.finance.revenue }}</td>
					<td
						:style="note.finance.revenue > note.payment.alreadyPaid ? 'color: red' : ''"
					>
						{{ note.finance.revenue - note.payment.alreadyPaid }}
					</td>
					<td>{{ formatDateTime(note.createdAt) }}</td>
				</tr>
			</tbody>
		</table>
	</div>

	<div class="mt-4">
		<a-button @click="$router.push({ name: 'Dashboard', params: {} })">Back</a-button>
	</div>
</template>

<script>
import { PlusOutlined } from '@ant-design/icons-vue'
import { exportNoteList } from '@/firebase/useExportNote'
import { MyFormatDateTime } from '@/utils/convert'

export default {
	components: { PlusOutlined },
	setup() {
		return { exportNoteList }
	},
	methods: {
		formatDateTime(time) {
			return MyFormatDateTime(time, 'DD/MM/YY')
		},
	},
}
</script>

<style lang="scss" scoped>
.wrapper-table {
	overflow-x: scroll;
}
</style>
