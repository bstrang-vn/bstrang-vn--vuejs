<template>
	<h1 class="title-content">Đơn hàng chưa gửi</h1>
	<div class="flex mb-2">
		<a-button type="primary" @click="redirectExportNoteCreate">
			<template #icon>
				<PlusOutlined />
			</template>
			Tạo Mới
		</a-button>
	</div>
	<div>
		<table class="table">
			<thead>
				<tr>
					<th>#</th>
					<th>KH</th>
					<th>Ship</th>
					<th>T.Toán</th>
					<th>Tổng</th>
					<th>Ngày</th>
				</tr>
			</thead>
			<tbody class="text-right">
				<tr v-if="exportNotePending.length === 0">
					<td colspan="10" class="text-center">No data available in table</td>
				</tr>
				<tr
					v-for="(note, noteIndex) in exportNotePending"
					:key="noteIndex"
					@dblclick="redirectExportNoteDetails(note.exportNoteID)"
					:style="note.status === 'Pending' ? 'color: blue; opacity: 0.7' : ''"
				>
					<td class="text-center">{{ exportNotePending.length - noteIndex }}</td>
					<td class="text-left">{{ note.customer?.customerName || '-' }}</td>
					<td class="text-left">{{ note.shipping.unit }}</td>
					<td class="text-left">{{ note.payment.method }}</td>
					<td>{{ note.finance.revenue }}</td>
					<td>{{ formatDateTime(note.createdAt) }}</td>
				</tr>
			</tbody>
		</table>
	</div>
	<h1 class="title-content mt-10">Đơn hàng nợ</h1>
	<div>
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
				<tr v-if="exportNoteDebt.length === 0">
					<td colspan="10" class="text-center">No data available in table</td>
				</tr>
				<tr
					v-for="(note, noteIndex) in exportNoteDebt"
					:key="noteIndex"
					@dblclick="redirectExportNoteDetails(note.exportNoteID)"
					:style="note.status === 'Pending' ? 'color: blue; opacity: 0.7' : ''"
				>
					<td class="text-center">{{ exportNoteDebt.length - noteIndex }}</td>
					<td class="text-left">{{ note.customer?.customerName || '-' }}</td>
					<td class="text-left">{{ note.shipping.unit }}</td>
					<td class="text-left">{{ note.payment.method }}</td>
					<td>{{ note.finance.revenue }}</td>
					<td :style="(note.status === 'Success') & (note.finance.debt > 0) ? 'color: red' : ''">
						{{ note.finance.debt }}
					</td>
					<td>{{ formatDateTime(note.createdAt) }}</td>
				</tr>
			</tbody>
		</table>
	</div>
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
import { exportNotePending, exportNoteDebt } from '@/firebase/useExportNote'
import { MyFormatDateTime, MyFormatNumber } from '@/utils/convert'

export default {
	components: { PlusOutlined },
	setup() {
		return {
			exportNotePending,
			exportNoteDebt,
			searchText: ref(''),
		}
	},
	computed: {
		totalDebt() {
			return this.exportNoteDebt.reduce((acc, note) => acc + note.finance.debt, 0)
		},
	},
	methods: {
		redirectExportNoteCreate() {
			this.$router.push({
				name: 'ExportNote Create Modify',
				params: { mode: 'create' },
			})
		},
		redirectExportNoteDetails(noteID) {
			this.$router.push({
				name: 'ExportNote Details',
				params: { id: noteID },
			})
		},
		formatDateTime(time) {
			return MyFormatDateTime(time, 'DD/MM/YY')
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
