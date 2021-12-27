<template>
	<h1 class="title-content">Danh sách phiếu nhập hàng</h1>
	<div class="flex justify-between mb-2 items-center">
		<div class="input-text">
			<input :value="searchText" @input="handleSearchText" type="text" placeholder="Search..." />
		</div>
		<a-button type="primary" @click="redirectImportNoteCreate">
			<template #icon>
				<PlusOutlined />
			</template>
			Tạo Mới
		</a-button>
	</div>
	<div class="wrapper-table">
		<table class="table">
			<thead>
				<tr>
					<th rowspan="2">#</th>
					<th rowspan="2">Nguồn</th>
					<th colspan="2">Hàng Nhập</th>
					<th rowspan="2">Tổng</th>
					<th rowspan="2">Ngày</th>
				</tr>
				<tr>
					<th>Tên</th>
					<th>SL</th>
				</tr>
			</thead>
			<tbody style="text-align:right">
				<tr v-if="importNoteFilter.length === 0">
					<td colspan="10" style="text-align:center">No data available in table</td>
				</tr>
				<template v-for="(note, noteIndex) in importNoteFilter" :key="noteIndex">
					<tr
						v-for="(stock, goodsID, stockIndex) in note.stockIn"
						:key="stockIndex"
						@click="redirectImportNoteDetails(note.importNoteID)"
						:style="note.status === 'Pending' ? 'color: blue' : ''"
					>
						<td v-if="stockIndex === 0" :rowspan="Object.keys(note.stockIn).length">
							{{ importNoteFilter.length - noteIndex }}
						</td>
						<td v-if="stockIndex === 0" :rowspan="Object.keys(note.stockIn).length" style="text-align:left">
							{{ note.provider?.providerName || '-' }}
						</td>
						<td style="text-align:left">
							{{ goodsArray.find(item => item.goodsID === goodsID)?.goodsName || '-' }}
						</td>
						<td>
							<p v-for="({ quantity }, batch, index) in stock" :key="index">
								{{ quantity }}
							</p>
						</td>
						<td v-if="stockIndex === 0" :rowspan="Object.keys(note.stockIn).length">
							{{ note.finance?.totalMoney }}
						</td>
						<td v-if="stockIndex === 0" :rowspan="Object.keys(note.stockIn).length">
							{{ formatDateTime(note.createdAt) }}
						</td>
					</tr>
				</template>
			</tbody>
		</table>
	</div>

	<div class="mt-4">
		<a-button @click="$router.push({ name: 'Dashboard', params: {} })">Back</a-button>
	</div>
</template>

<script>
import { ref } from 'vue'
import { PlusOutlined } from '@ant-design/icons-vue'
import { importNoteArray } from '@/firebase/useImportNote'
import { goodsArray } from '@/firebase/useWarehouse'
import { MyFormatDateTime, MySearch } from '@/utils/convert'

export default {
	components: { PlusOutlined },
	setup() {
		return {
			goodsArray,
			importNoteArray,
			searchText: ref(''),
		}
	},
	computed: {
		importNoteFilter() {
			return this.importNoteArray.filter(note => MySearch(note.provider.providerName, this.searchText))
		},
	},
	methods: {
		handleSearchText(e) {
			this.searchText = e.target.value
		},
		redirectImportNoteCreate() {
			this.$router.push({
				name: 'ImportNote Create Modify',
				params: { mode: 'create' },
			})
		},
		redirectImportNoteDetails(noteID) {
			this.$router.push({
				name: 'ImportNote Details',
				params: { id: noteID },
			})
		},
		formatDateTime(time) {
			return MyFormatDateTime(time, 'DD/MM/YY')
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
