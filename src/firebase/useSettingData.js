import {
	getFirestore,
	collection,
	doc,
	getDoc,
	setDoc,
	updateDoc,
	getDocs,
	deleteDoc,
	query,
	where,
	limit,
	increment,
	deleteField,
} from 'firebase/firestore'
import { goodsArray } from '@/firebase/useWarehouse'
import { customerArray } from '@/firebase/useCustomer'
import { MyFormatDateTime } from '@/utils/convert'

const db = getFirestore()

const clearDataCollection = async COLECTTION_NAME => {
	const querySnapshot = await getDocs(collection(db, COLECTTION_NAME))
	querySnapshot.forEach(docSnap => {
		deleteDoc(docSnap.ref)
	})
}

const clearAllData = async () => {
	await Promise.all([
		clearDataCollection('CUSTOMER'),
		clearDataCollection('PROVIDER'),
		clearDataCollection('WAREHOUSE'),
		clearDataCollection('IMPORTNOTE'),
		clearDataCollection('EXPORTNOTE'),
	])
}

const createFakeData = async () => {
	const warehouseRefList = [doc(collection(db, 'WAREHOUSE')), doc(collection(db, 'WAREHOUSE'))]
	const importNoteRefList = [doc(collection(db, 'IMPORTNOTE')), doc(collection(db, 'IMPORTNOTE'))]
	const exportNoteRefList = [
		doc(collection(db, 'EXPORTNOTE')),
		doc(collection(db, 'EXPORTNOTE')),
		doc(collection(db, 'EXPORTNOTE')),
	]
	const providerRef = doc(collection(db, 'PROVIDER'))
	const customerRef = doc(collection(db, 'CUSTOMER'))

	const fakeWarehouse = [
		setDoc(warehouseRefList[0], {
			goodsName: 'Serum Obagi',
			group: 'Dưỡng Da',
			unit: 'Chai',
			retailPrice: 80,
			wholesalePrice: 70,
			stockAvail: {
				[`${new Date('2022-03-01').getTime()}-${50}`]: { quantity: 100 },
				[`${new Date('2023-11-11').getTime()}-${60}`]: { quantity: 100 },
			},
			importNoteIDList: [importNoteRefList[0].id, importNoteRefList[1].id],
			exportNoteIDList: [exportNoteRefList[0].id, exportNoteRefList[1].id, exportNoteRefList[2].id],
			createdAt: new Date('2021-08-09').getTime(),
			updatedAt: new Date().getTime(),
			removedAt: 0,
		}),
		setDoc(warehouseRefList[1], {
			goodsName: 'Demafort 600ml',
			group: 'Kem Chống Nắng',
			unit: 'Lọ',
			retailPrice: 550,
			wholesalePrice: 500,
			stockAvail: {
				[`${new Date('2022-06-03').getTime()}-${225}`]: { quantity: 100 },
				[`${new Date('2023-07-12').getTime()}-${250}`]: { quantity: 100 },
				[`${new Date('wrong !!').getTime()}-${200}`]: { quantity: 100 },
			},
			importNoteIDList: [importNoteRefList[0].id, importNoteRefList[1].id],
			exportNoteIDList: [exportNoteRefList[0].id, exportNoteRefList[1].id, exportNoteRefList[2].id],
			createdAt: new Date('2021-08-09').getTime(),
			updatedAt: new Date().getTime(),
			removedAt: 0,
		}),
	]

	const fakeProvider = setDoc(providerRef, {
		providerName: 'Ngô Nhật Dương',
		phone: '0988201219',
		address: 'số 8 - Thạch Bàn - Long Biên - Hag Nội',
		importNoteIDList: [importNoteRefList[0].id, importNoteRefList[1].id],
		createdAt: new Date('2019-12-20').getTime(),
		updatedAt: new Date().getTime(),
		removedAt: 0,
	})

	const fakeCustomer = setDoc(customerRef, {
		customerName: 'Phạm Hoàng Mai',
		phone: '0978156328',
		address: '04/12 Hàng Mã - Hoàn Kiếm - Hà Nội',
		finance: {
			debt: 13425,
			payDebtHistory: [
				{ time: new Date('2015-02-03').getTime(), money: 100 },
				{ time: new Date('2012-04-07').getTime(), money: 2000 },
			],
		},
		exportNoteIDList: [exportNoteRefList[0].id, exportNoteRefList[1].id, exportNoteRefList[2].id],
		createdAt: new Date('2015-02-03').getTime(),
		updatedAt: new Date().getTime(),
		removedAt: 0,
	})

	const fakeImportNote = [
		setDoc(importNoteRefList[0], {
			provider: {
				providerID: providerRef.id,
				providerName: 'Ngô Nhật Dương',
			},
			stockIn: {
				[warehouseRefList[0].id]: {
					[`${new Date('2022-03-01').getTime()}-${50}`]: { quantity: 10 },
					[`${new Date('2023-11-11').getTime()}-${60}`]: { quantity: 20 },
				},
				[warehouseRefList[1].id]: {
					[`${new Date('2023-07-12').getTime()}-${250}`]: { quantity: 1 },
					[`${new Date('wrong !!').getTime()}-${200}`]: { quantity: 3 },
				},
			},
			shipping: { cost: 30 },
			finance: { totalMoney: 120 },
			status: 'Success',
			createdAt: new Date('2019-12-20').getTime(),
			updatedAt: new Date().getTime(),
			removedAt: 0,
		}),
		setDoc(importNoteRefList[1], {
			provider: {
				providerID: providerRef.id,
				providerName: 'Ngô Nhật Dương',
			},
			stockIn: {
				[warehouseRefList[0].id]: {
					[`${new Date('2022-03-01').getTime()}-${50}`]: { quantity: 15 },
					[`${new Date('2023-11-11').getTime()}-${60}`]: { quantity: 1 },
				},
				[warehouseRefList[1].id]: {
					[`${new Date('2023-07-12').getTime()}-${250}`]: { quantity: 2 },
					[`${new Date('2022-06-03').getTime()}-${225}`]: { quantity: 10 },
				},
			},
			shipping: { cost: 30 },
			finance: { totalMoney: 120 },
			status: 'Success',
			createdAt: new Date('2008-10-04').getTime(),
			updatedAt: new Date().getTime(),
			removedAt: 0,
		}),
	]

	const fakeExportNote = [
		setDoc(exportNoteRefList[0], {
			customer: {
				customerName: 'Phạm Hoàng Mai',
				customerID: customerRef.id,
			},
			stockOut: {
				[warehouseRefList[0].id]: {
					[`${new Date('2022-03-01').getTime()}-${50}`]: {
						quantity: 20,
						expectedPrice: 80,
						actualPrice: 50,
					},
					[`${new Date('2024-05-07').getTime()}-${45}`]: {
						quantity: 50,
						expectedPrice: 70,
						actualPrice: 60,
					},
				},
				[warehouseRefList[1].id]: {
					[`${new Date('2023-07-12').getTime()}-${250}`]: {
						quantity: 10,
						expectedPrice: 550,
						actualPrice: 520,
					},
					[`${new Date('2021-11-05').getTime()}-${230}`]: {
						quantity: 5,
						expectedPrice: 500,
						actualPrice: 480,
					},
				},
			},
			shipping: {
				unit: 'Viettel Post' || 'Shoppee' || 'Giao Hàng Tiết Kiệm' || 'Ship Thường',
			},
			payment: {
				method: 'Bank Transfer' || 'COD',
			},
			finance: {
				revenue: 11600,
				profit: 1500,
				sellerPaysShip: 0,
				buyerPaysShip: 100,
				debt: 2100,
			},
			status: 'Success',
			createdAt: new Date('2009-12-01').getTime(),
			updatedAt: new Date().getTime(),
			removedAt: 0,
		}),
		setDoc(exportNoteRefList[1], {
			customer: {
				customerName: 'Phạm Hoàng Mai',
				customerID: customerRef.id,
			},
			stockOut: {
				[warehouseRefList[0].id]: {
					[`${new Date('2022-03-01').getTime()}-${50}`]: {
						quantity: 20,
						expectedPrice: 80,
						actualPrice: 75,
					},
					[`${new Date('2024-05-07').getTime()}-${55}`]: {
						quantity: 50,
						expectedPrice: 70,
						actualPrice: 50,
					},
				},
				[warehouseRefList[1].id]: {
					[`${new Date('2022-06-03').getTime()}-${225}`]: {
						quantity: 10,
						expectedPrice: 500,
						actualPrice: 425,
					},
					[`${new Date('2021-11-05').getTime()}-${240}`]: {
						quantity: 5,
						expectedPrice: 500,
						actualPrice: 415,
					},
				},
			},
			shipping: {
				unit: 'Viettel Post' || 'Shoppee' || 'Giao Hàng Tiết Kiệm' || 'Ship Thường',
			},
			payment: {
				method: 'Bank Transfer' || 'COD',
			},
			finance: {
				revenue: 10325,
				profit: 2000,
				sellerPaysShip: 20,
				buyerPaysShip: 0,
				debt: 1000,
			},
			status: 'Success',
			createdAt: new Date('2012-07-11').getTime(),
			updatedAt: new Date().getTime(),
			removedAt: 0,
		}),
		setDoc(exportNoteRefList[2], {
			customer: {
				customerName: 'Phạm Hoàng Mai',
				customerID: customerRef.id,
			},
			stockOut: {
				[warehouseRefList[0].id]: {
					[`${new Date('2022-03-01').getTime()}-${50}`]: {
						quantity: 20,
						expectedPrice: 80,
						actualPrice: 75,
					},
					[`${new Date('2024-05-07').getTime()}-${55}`]: {
						quantity: 50,
						expectedPrice: 70,
						actualPrice: 50,
					},
				},
				[warehouseRefList[1].id]: {
					[`${new Date('2022-06-03').getTime()}-${225}`]: {
						quantity: 10,
						expectedPrice: 500,
						actualPrice: 425,
					},
					[`${new Date('2021-11-05').getTime()}-${240}`]: {
						quantity: 5,
						expectedPrice: 500,
						actualPrice: 415,
					},
				},
			},
			shipping: {
				unit: 'Viettel Post' || 'Shoppee' || 'Giao Hàng Tiết Kiệm' || 'Ship Thường',
			},
			payment: {
				method: 'Bank Transfer' || 'COD',
			},
			finance: {
				revenue: 10325,
				profit: 2000,
				sellerPaysShip: 20,
				buyerPaysShip: 0,
				debt: 10325,
			},
			status: 'Success',
			createdAt: new Date('2012-07-11').getTime(),
			updatedAt: new Date().getTime(),
			removedAt: 0,
		}),
	]
	await Promise.all([...fakeWarehouse, fakeProvider, fakeCustomer, ...fakeImportNote, ...fakeExportNote])
}

const testQuery = async () => {
	const list = customerArray.map(customer =>
		updateDoc(doc(db, 'CUSTOMER', customer.customerID), {
			'finance.payDebt': deleteField(),
			payDebtHistory: deleteField(),
			'finance.payDebtHistory': [],
		}),
	)
	await Promise.all(list)
}

const testUpdateDocument = async (COLLECTION, id) => {
	await updateDoc(doc(db, COLLECTION, id), {
		aaa: increment(20),
		'aaa2.haha2.hehe2': increment(20),
		updatedAt: new Date().getTime(),
	})
}
export { clearAllData, createFakeData, testQuery, testUpdateDocument }
