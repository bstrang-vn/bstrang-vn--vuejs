<template>
	<h1 class="title-content">Đơn hàng trong tháng</h1>

	<div class="flex mb-2 mt-4">
		<div class="input-text">
			<input :value="searchText" @input="handleSearchText" type="text" placeholder="Search..." />
		</div>
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
					<th>Nợ</th>
					<th>Ngày</th>
				</tr>
			</thead>
			<tbody class="text-right">
				<tr v-if="exportNoteFilter.length === 0">
					<td colspan="10" class="text-center">No data available in table</td>
				</tr>
				<tr
					v-for="(note, noteIndex) in exportNoteFilter"
					:key="noteIndex"
					@dblclick="redirectExportNoteDetails(note.exportNoteID)"
					:style="note.status === 'Pending' ? 'color: blue; opacity: 0.7' : ''"
				>
					<td class="text-center">{{ exportNoteFilter.length - noteIndex }}</td>
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

	<div class="mt-4">
		<a-button @click="$router.push({ name: 'Dashboard', params: {} })">Back</a-button>
	</div>
</template>

<script>
import { ref } from 'vue'
import { exportNoteArray } from '@/firebase/useExportNote'
import { MyFormatDateTime, MySearch, MyFormatNumber } from '@/utils/convert'

export default {
	setup() {
		return {
			exportNoteArray,
			searchText: ref(''),
		}
	},
	computed: {
		exportNoteFilter() {
			return this.exportNoteArray.filter(note => {
				const searchOk = MySearch(note.customer.customerName, this.searchText)
				return searchOk
			})
		},
	},
	methods: {
		handleSearchText(e) {
			this.searchText = e.target.value
		},
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
