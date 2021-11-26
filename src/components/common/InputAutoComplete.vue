<template>
	<div v-click-outside="handleClickOutside" class="my-input-autocomplete">
		<input
			:value="searchText"
			@input="handleChangeInput"
			@keydown="handleKeydown"
			type="text"
			class="input-filter"
			placeholder="Search..."
		/>
		<div class="select-filter" v-if="isSearching">
			<div
				v-for="(item, key, index) in convertData"
				:key="index"
				:class="{ active: index == indexFocus, 'item-search': true }"
				@click.prevent="handleSelectItem(index)"
			>
				<slot name="each" :item="item" :key="key" :index="index">
					<div class="item-json">{{ index }} - {{ key }} - {{ JSON.stringify(item) }}</div>
				</slot>
			</div>
		</div>
	</div>
</template>

<script>
import { ref } from 'vue'

export default {
	props: {
		searchText: String,
		dataSource: {
			type: [Array, Object],
		},
		filterData: Function,
	},
	setup() {
		return {
			indexFocus: ref(-1),
			isSearching: ref(false),
		}
	},
	computed: {
		convertData() {
			return Object.assign(
				{},
				...Object.entries(this.dataSource)
					.filter(([key, value]) => this.filterData(value, this.searchText))
					.map(([key, value]) => ({ [key]: value })),
			)
		},
		dataLeng() {
			return Object.keys(this.convertData).length
		},
	},
	methods: {
		handleChangeInput(e) {
			this.$emit('update:searchText', e.target.value)
			this.$emit('searching', e.target.value)
			this.indexFocus = -1
			if (e.target.value) this.isSearching = true
			else this.isSearching = false
		},
		handleKeydown(e) {
			if (e.keyCode === 40) {
				this.indexFocus += 1
				if (this.indexFocus >= this.dataLeng) this.indexFocus = 0
			}
			if (e.keyCode === 38) {
				this.indexFocus -= 1
				if (this.indexFocus < 0) this.indexFocus = this.dataLeng - 1
			}
			if (e.keyCode === 13) {
				this.handleSelectItem(this.indexFocus)
			}
		},
		handleSelectItem(index) {
			this.indexFocus = -1
			const [key, value] = Object.entries(this.convertData)[index]
			this.$emit('selectItem', { value, key })
			this.closeSelectItem()
		},
		handleClickOutside() {
			this.indexFocus = -1
			this.closeSelectItem()
		},
		closeSelectItem() {
			this.$nextTick(() => {
				this.isSearching = false
			})
		},
	},
}
</script>

<style lang="scss">
.my-input-autocomplete {
	position: relative;
	width: 100%;

	.input-filter {
		position: relative;
		padding: 0.3rem 0.5rem;
		width: 100%;
		outline: none;
		border: 1px solid #d9d9d9;
		border-radius: 2px;
		&:hover {
			border-color: #40a9ff;
		}
		&:focus {
			border-color: #40a9ff;
			outline: none;
			box-shadow: 0 0 0 2px rgb(24 144 255 / 20%);
		}
	}
	.select-filter {
		position: absolute;
		z-index: 9;
		background-color: #fff;
		top: 100%;
		left: 0;
		right: 0;
		max-height: 500px;
		border: 1px solid #d4d4d4;
		box-shadow: 5px 5px 4px #aaaaaa;
		overflow-y: scroll;
		.item-search {
			padding: 0.5rem;
			cursor: pointer;
			border-bottom: 1px solid #d4d4d4;
			&.active {
				background-color: DodgerBlue;
				color: #fff;
			}
			&:hover {
				background-color: #e9e9e9;
			}
			.item-json {
				text-overflow: ellipsis;
				overflow: hidden;
				white-space: nowrap;
			}
		}
	}
}
</style>
