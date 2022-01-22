import {
	getFirestore,
	onSnapshot,
	collection,
	doc,
	getDoc,
	getDocs,
	setDoc,
	updateDoc,
	deleteDoc,
	query,
	where,
	orderBy,
	runTransaction,
	increment,
	arrayUnion,
	arrayRemove,
} from 'firebase/firestore'
import { reactive, ref } from 'vue'
import { MyFormatDateTime } from '@/utils/convert'

const db = getFirestore()
const statisticArray = reactive([])

onSnapshot(query(collection(db, 'STATISTICS')), snapshot => {
	snapshot.docChanges().forEach(change => {
		const newStatistic = {
			...change.doc.data(),
			statisticID: change.doc.id,
		}
		const statisticIndex = statisticArray.findIndex(item => item.statisticID === change.doc.id)
		if (change.type === 'added') {
			statisticArray.unshift(newStatistic)
		} else if (change.type === 'modified') {
			statisticArray.splice(statisticIndex, 1, newStatistic)
		} else if (change.type === 'removed') {
			statisticArray.splice(statisticIndex, 1)
		}
	})
})

const createStatisticMonth = async (date, data) => {
	const time = new Date(date)
	if (date.toString() === 'Invalid Date') {
		throw new Error('Invalid Date')
	}
    const startDate = new Date(time.getFullYear(), time.getMonth())
	const endDate = new Date(time.getFullYear(), time.getMonth() + 1)

	const exportNoteArray = []
	const exportNoteQuerry = query(
		collection(db, 'EXPORTNOTE'),
		where('createdAt', '>=', startDate.getTime()),
		where('createdAt', '<=', endDate.getTime()),
	)
	const exportNoteSnapshot = await getDocs(exportNoteQuerry)
	exportNoteSnapshot.forEach(snapshot => {
		exportNoteArray.push({
			exportNoteID: snapshot.id,
			...snapshot.data(),
		})
	})

	const revenue = exportNoteArray.reduce((acc, note) => {
		if (note.status === 'Success') {
			acc += note.finance.revenue
		}
		return acc
	}, 0)

	const profit = exportNoteArray.reduce((acc, note) => {
		if (note.status === 'Success') {
			acc += note.finance.profit
		}
		return acc
	}, 0)

	const cost = exportNoteArray.reduce((acc, note) => {
		if (note.status === 'Success') {
			const c = note.finance.revenue - note.finance.profit
			acc += c
		}
		return acc
	}, 0)

	const sellerPaysShip = exportNoteArray.reduce((acc, note) => {
		if (note.status === 'Success') {
			const ship = note.finance.sellerPaysShip || 0
			acc += ship
		}
		return acc
	}, 0)

	const buyerPaysShip = exportNoteArray.reduce((acc, note) => {
		if (note.status === 'Success') {
			const ship = note.finance.buyerPaysShip || 0
			acc += ship
		}
		return acc
	}, 0)

	await setDoc(doc(db, 'STATISTICS', MyFormatDateTime(time, 'YYYY-MM')), {
		revenue,
		profit,
		cost,
		sellerPaysShip,
		buyerPaysShip,
	})
}

export { statisticArray, createStatisticMonth }
