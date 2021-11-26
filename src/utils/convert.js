const convertVietToEng = string => {
	if (typeof string === 'string') {
		return string
			.normalize('NFD')
			.replace(/[\u0300-\u036f]/g, '')
			.replace(/đ/g, 'd')
			.replace(/Đ/g, 'D')
	}
	return ''
}

const MySearch = (string, filter, skip = 2) => {
	const key = convertVietToEng(filter)
	const stringConvert = convertVietToEng(string)
	let pattern = ''
	key.split('').forEach(item => {
		let text = item
		if (',./<>?;\':"[]{}!@#$%^&*()-_=+~`'.split('').includes(item)) {
			text = '\\' + item
		}
		pattern += `.{0,${skip}}${text}`
	})
	const regex = new RegExp(pattern, 'i')

	if (regex.test(stringConvert)) {
		return true
	}
	return false
}

const MyFormatDateTime = (time, string) => {
	const timer = new Date(time)
	if (timer.toString() === 'Invalid Date' || !string) return '-'

	const pattern = {
		YYYY: `${timer.getFullYear()}`,
		YY: `${timer.getFullYear()}`.slice(-2),
		MM: `0${timer.getMonth() + 1}`.slice(-2),
		DD: `0${timer.getDate()}`.slice(-2),
		HH: `0${timer.getHours()}`.slice(-2),
		mm: `0${timer.getMinutes()}`.slice(-2),
		ss: `0${timer.getSeconds()}`.slice(-2),
	}
	let result = string
	Object.entries(pattern).forEach(([key, value]) => {
		result = result.replace(key, value)
	})
	return result
}

const MyFormatNumber = (number, toFixed = 0) =>
	Number(number)
		.toFixed(toFixed)
		.toString()
		.replace(/(\d)(?=(\d{3})+(?!\d))/g, '$1.')

export { MySearch, MyFormatDateTime, MyFormatNumber }
