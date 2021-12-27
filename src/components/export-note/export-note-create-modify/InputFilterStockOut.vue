<template>
	<div class="w-full relative">
		<InputAutoComplete
			:searchText="searchText"
			:dataSource="convertGoodArray"
			:filterData="logicFilter"
			:disabled="disabled"
			@searching="handleSearching"
			@selectItem="handleSelectItem"
		>
			<template
				v-slot:each="{ item: { goodsName, unit, quantity, expiryDate, retailPrice } }"
			>
				<p class="font-bold m-0">{{ goodsName }}</p>
				<p class="m-0">
					{{ formatDateTime(Number(expiryDate)) }}
					- {{ formatNumber(retailPrice || 0) }}/{{ unit }} - {{ quantity }}
				</p>
			</template>
		</InputAutoComplete>
		<div class="absolute right-2 top-1/4">
			<CheckCircleOutlined v-if="goodsID" style="color: blue" />
			<CloseCircleOutlined v-else style="color: #f5222d" />
		</div>
	</div>
</template>

<script>
import { ref } from 'vue'
import { CheckCircleOutlined, CloseCircleOutlined } from '@ant-design/icons-vue'
import { goodsArray } from '@/firebase/useWarehouse'
import InputAutoComplete from '@/components/common/InputAutoComplete.vue'
import { MyFormatDateTime, MyFormatNumber, MySearch } from '@/utils/convert'

export default {
	props: {
		searchText: String,
		disabled: {
			type: Boolean,
			default() {
				return false
			},
		},
	},
	components: { InputAutoComplete, CheckCircleOutlined, CloseCircleOutlined },
	setup() {
		return { goodsArray, goodsID: ref('') }
	},
	computed: {
		convertGoodArray() {
			const data = []
			this.goodsArray.forEach(({ stockAvail, ...goodsData }) => {
				if (Object.keys(stockAvail).length === 0) data.push({ ...goodsData })
				else {
					Object.entries(stockAvail).forEach(([batch, q]) => {
						data.push({
							expiryDate: batch.split('-')[0],
							costPrice: batch.split('-')[1],
							quantity: q.quantity,
							...goodsData,
						})
					})
				}
			})
			data.sort((a, b) => {
				if (a.goodsName > b.goodsName) return 1
				if (a.goodsName < b.goodsName) return -1
				return 0
			})
			return data
		},
	},
	methods: {
		handleSearching(string) {
			this.$emit('update:searchText', string)
			this.$emit('searching', string)
			this.goodsID = ''
		},
		handleSelectItem({ key, value }) {
			this.$emit('update:searchText', value.goodsName)
			this.$emit('selectItem', {
				goodsID: value.goodsID,
				expiryDate: value.expiryDate,
				costPrice: value.costPrice,
			})
			this.goodsID = value.goodsID
		},
		logicFilter(item, key) {
			return MySearch(item.goodsName, this.searchText)
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
