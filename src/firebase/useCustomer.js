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
	runTransaction,
	increment,
	arrayUnion,
} from 'firebase/firestore'
import { reactive, ref } from 'vue'

const customerArray = reactive([])
const db = getFirestore()
const qr = query(collection(db, 'CUSTOMER'))

onSnapshot(qr, snapshot => {
	snapshot.docChanges().forEach(change => {
		const newCustomer = {
			customerID: change.doc.id,
			...change.doc.data(),
		}
		const customerIndex = customerArray.findIndex(item => item.customerID === change.doc.id)
		if (change.type === 'added') {
			customerArray.push(newCustomer)
		} else if (change.type === 'modified') {
			customerArray.splice(customerIndex, 1, newCustomer)
		} else if (change.type === 'removed') {
			customerArray.splice(customerIndex, 1)
		}
	})
})

const startRealtimeCustomer = customerID => {
	const data = ref({})
	const unSubscribe = onSnapshot(doc(db, 'CUSTOMER', customerID), async customerDoc => {
		if (!customerDoc.exists()) return
		data.value = {
			customerID,
			...customerDoc.data(),
		}
	})
	return { data, unSubscribe }
}

const getCustomer = async customerID => {
	const customerRef = doc(db, 'CUSTOMER', customerID)
	const customerSnap = await getDoc(customerRef)
	if (!customerSnap.exists()) return {}
	const { customerName, phone, address, finance, exportNoteIDList } = customerSnap.data()
	return {
		customerID,
		customerName,
		phone,
		address,
		finance,
		exportNoteIDList,
	}
}

const addCustomer = async data => {
	const customerRef = await addDoc(collection(db, 'CUSTOMER'), {
		customerName: data.customerName,
		phone: data.phone,
		address: data.address,
		finance: { debt: 0, payDebtHistory: [] },
		exportNoteIDList: [],

		createdAt: new Date().getTime(),
		updatedAt: new Date().getTime(),
		removedAt: 0,
	})

	const customer = await getCustomer(customerRef.id)
	return customer
}

const updateCustomer = async (customerID, customerData) => {
	const customerRef = doc(db, 'CUSTOMER', customerID)
	await updateDoc(customerRef, {
		customerName: customerData.customerName,
		phone: customerData.phone,
		address: customerData.address,

		updatedAt: new Date().getTime(),
	})

	const customer = await getCustomer(customerRef.id)
	return customer
}

const addPayDebt = async (customerID, listNoteDebt, numberPay) => {
	await runTransaction(db, async transaction => {
		listNoteDebt.forEach(({ exportNoteID, debt }) => {
			transaction.update(doc(db, 'EXPORTNOTE', exportNoteID), {
				'finance.debt': increment(0 - debt),
			})
		})
		transaction.update(doc(db, 'CUSTOMER', customerID), {
			'finance.debt': increment(0 - numberPay),
			'finance.payDebtHistory': arrayUnion({ time: new Date().getTime(), money: numberPay }),
		})
	})
}

const deleteCustomer = async customerID => {
	await deleteDoc(doc(db, 'CUSTOMER', customerID))
	return customerID
}

export {
	customerArray,
	startRealtimeCustomer,
	getCustomer,
	addCustomer,
	updateCustomer,
	addPayDebt,
	deleteCustomer,
}
