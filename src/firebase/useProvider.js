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

const providerList = reactive({})
const db = getFirestore()
const qr = query(collection(db, 'PROVIDER'))

onSnapshot(qr, snapshot => {
	snapshot.docChanges().forEach(change => {
		if (change.type === 'added' || change.type === 'modified') {
			providerList[change.doc.id] = change.doc.data()
		} else if (change.type === 'removed') {
			delete providerList[change.doc.id]
		}
	})
})

const startRealtimeProvider = providerID => {
	const data = ref({})
	const unSubscribe = onSnapshot(doc(db, 'PROVIDER', providerID), async providerDoc => {
		if (!providerDoc.exists()) return
		const { importNoteIDList } = providerDoc.data()

		const getImportNoteList = importNoteIDList.map(noteID =>
			getDoc(doc(db, 'IMPORTNOTE', noteID)),
		)
		const importNoteSnapList = await Promise.all(getImportNoteList)

		const importNoteList = {}
		importNoteSnapList.forEach(noteSnap => {
			importNoteList[noteSnap.id] = noteSnap.data()
		})

		data.value = {
			providerID,
			...providerDoc.data(),
			importNoteList,
		}
	})
	return { data, unSubscribe }
}

const getProvider = async providerID => {
	const providerRef = doc(db, 'PROVIDER', providerID)
	const providerSnap = await getDoc(providerRef)
	if (!providerSnap.exists()) return {}
	const { providerName, phone, address, importNoteIDList } = providerSnap.data()
	return {
		providerID,
		providerName,
		phone,
		address,
		importNoteIDList,
	}
}

const addProvider = async data => {
	const providerRef = await addDoc(collection(db, 'PROVIDER'), {
		providerName: data.providerName,
		phone: data.phone,
		address: data.address,
		importNoteIDList: [],

		createdAt: new Date().getTime(),
		updatedAt: new Date().getTime(),
		removedAt: 0,
	})

	const provider = await getProvider(providerRef.id)
	return provider
}

const updateProvider = async (providerID, providerData) => {
	const providerRef = doc(db, 'PROVIDER', providerID)
	await updateDoc(providerRef, {
		providerName: providerData.providerName,
		phone: providerData.phone,
		address: providerData.address,

		updatedAt: new Date().getTime(),
	})

	const provider = await getProvider(providerRef.id)
	return provider
}

const deleteProvider = async providerID => {
	await deleteDoc(doc(db, 'PROVIDER', providerID))
	return providerID
}

export {
	providerList,
	startRealtimeProvider,
	addProvider,
	deleteProvider,
	updateProvider,
	getProvider,
}
