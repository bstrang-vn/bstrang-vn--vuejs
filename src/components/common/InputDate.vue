<template>
	<div class="input-date-time">
		<a-input :value="refDay" @update:value="onInputDay" type="number" class="input-day" />
		<span class="dash">-</span>
		<a-input :value="refMonth" @update:value="onInputMonth" type="number" class="input-month" />
		<span class="dash">-</span>
		<a-input :value="refYear" @update:value="onInputYear" type="number" class="input-year" />
	</div>
</template>

<script>
import { ref } from 'vue'

export default {
	props: ['datetime'],
	setup() {
		return {
			refDay: ref(''),
			refMonth: ref(''),
			refYear: ref(''),
		}
	},
	updated() {
		if (Number.isNaN(this.datetime)) return
		const propTime = new Date(this.datetime)
		if (propTime.toString() === 'Invalid Date') {
			this.refDay = ''
			this.refMonth = ''
			this.refYear = ''
		} else {
			this.refDay = `0${propTime.getDate()}`.slice(-2)
			this.refMonth = `0${propTime.getMonth() + 1}`.slice(-2)
			this.refYear = propTime.getFullYear()
		}
	},
	methods: {
		onInputDay(e) {
			const d = Number(e) > 31 ? e.slice(-1) : e
			this.refDay = `0${d}`.slice(-2)
			this.emitParent()
		},
		onInputMonth(e) {
			const m = Number(e) > 12 ? e.slice(-1) : e
			this.refMonth = `0${m}`.slice(-2)
			this.emitParent()
		},
		onInputYear(e) {
			this.refYear = `20${e}`.slice(-4)
			this.emitParent()
		},
		emitParent() {
			if (!this.refDay || !this.refMonth || !this.refYear || this.refYear.length < 4) {
				this.$emit('update:datetime', NaN)
			} else {
				const getDate = new Date(`${this.refYear}-${this.refMonth}-${this.refDay}`)
				this.$emit('update:datetime', getDate.getTime())
			}
		},
	},
}
</script>

<style lang="scss" scoped>
/* Chrome, Safari, Edge, Opera : Remove arrows/spinner input number */
input::-webkit-outer-spin-button,
input::-webkit-inner-spin-button {
	-webkit-appearance: none;
	margin: 0;
}
/* Firefox Remove arrows/spinner input number */
input[type='number'] {
	-moz-appearance: textfield;
}

input {
	border: none;
	outline: none;
}

.input-date-time {
	display: flex;
	width: 160px;
	border: 1px solid #d9d9d9;
}
.input-day {
	width: 60px;
}
.input-month {
	width: 60px;
}
.input-year {
	width: 80px;
}
.dash {
	font-size: 18px;
}
</style>
