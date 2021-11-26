import {
	getFirestore,
	onSnapshot,
	collection,
	doc,
	getDoc,
	addDoc,
	updateDoc,
	deleteDoc,
	query,
} from 'firebase/firestore'
import { reactive, ref } from 'vue'

const goodsList = reactive({})
const db = getFirestore()

onSnapshot(query(collection(db, 'WAREHOUSE')), snapshot => {
	snapshot.docChanges().forEach(change => {
		if (change.type === 'added' || change.type === 'modified') {
			goodsList[change.doc.id] = change.doc.data()
		} else if (change.type === 'removed') {
			delete goodsList[change.doc.id]
		}
	})
})

const startRealtimeGoods = goodsID => {
	const data = ref({})
	const unSubscribe = onSnapshot(doc(db, 'WAREHOUSE', goodsID), async goodsDoc => {
		const { exportNoteIDList, importNoteIDList, ...goodsData } = goodsDoc.data()

		const getImportNoteList = importNoteIDList.map(noteID => getDoc(doc(db, 'IMPORTNOTE', noteID)))
		const getExportNoteList = exportNoteIDList.map(noteID => getDoc(doc(db, 'EXPORTNOTE', noteID)))

		const [importNoteSnapList, exportNoteSnapList] = [
			await Promise.all(getImportNoteList),
			await Promise.all(getExportNoteList),
		]
		const [importNoteList, exportNoteList] = [{}, {}]

		importNoteSnapList.forEach(noteSnap => {
			importNoteList[noteSnap.id] = noteSnap.data()
		})
		exportNoteSnapList.forEach(noteSnap => {
			exportNoteList[noteSnap.id] = noteSnap.data()
		})

		data.value = {
			goodsID,
			...goodsData,
			exportNoteList,
			importNoteList,
		}
	})
	return { data, unSubscribe }
}

const addGoods = async newData => {
	const { goodsName, group, unit, retailPrice, wholesalePrice } = newData
	const docRef = await addDoc(collection(db, 'WAREHOUSE'), {
		goodsName,
		group,
		unit,
		retailPrice,
		wholesalePrice,
		stockAvail: {},
		importNoteIDList: [],
		exportNoteIDList: [],

		createdAt: new Date().getTime(),
		updatedAt: new Date().getTime(),
		removedAt: 0,
	})

	const docSnap = await getDoc(docRef)
	return {
		goodsID: docSnap.id,
		...docSnap.data(),
	}
}

const updateGoods = async (id, { retailPrice, wholesalePrice }) => {
	const docRef = doc(db, 'WAREHOUSE', id)
	await updateDoc(docRef, {
		retailPrice,
		wholesalePrice,
		updatedAt: new Date().getTime(),
	})

	const docSnap = await getDoc(docRef)
	return {
		goodsID: docSnap.id,
		...docSnap.data(),
	}
}

const deleteGoods = async goodsID => {
	await deleteDoc(doc(db, 'WAREHOUSE', goodsID))
	return goodsID
}

export { goodsList, startRealtimeGoods, addGoods, updateGoods, deleteGoods }
