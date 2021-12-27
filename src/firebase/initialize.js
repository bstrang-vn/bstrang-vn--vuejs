import { initializeApp } from 'firebase/app'

const firebaseConfig = {
	apiKey: 'AIzaSyA0Bp0iHNdtSLNe-Jnr9pXIohl_MuvoMfs',
	authDomain: 'bstrang-vn.firebaseapp.com',
	projectId: 'bstrang-vn',
	storageBucket: 'bstrang-vn.appspot.com',
	messagingSenderId: '195870625919',
	appId: '1:195870625919:web:e76a190a0c1f03639d6f4a',
	measurementId: 'G-7JZXHCLFCR',
}

// const firebaseConfig = {
// 	apiKey: 'AIzaSyDp5Zzm6ZTYkvS-WWCpzUrF0l2HjMXPyCQ',
// 	authDomain: 'dam-linh.firebaseapp.com',
// 	projectId: 'dam-linh',
// 	storageBucket: 'dam-linh.appspot.com',
// 	messagingSenderId: '452625321012',
// 	appId: '1:452625321012:web:12434172db077312f74e61',
// 	measurementId: 'G-GVTV9K604Z',
// }

// const firebaseConfig = {
// 	apiKey: 'AIzaSyAXv7vbXmPtucMsaMuRemXO8oxNO45281Y',
// 	authDomain: 'bstrang-53f55.firebaseapp.com',
// 	projectId: 'bstrang-53f55',
// 	storageBucket: 'bstrang-53f55.appspot.com',
// 	messagingSenderId: '954001770435',
// 	appId: '1:954001770435:web:2a2a5aaa8eb1f67cd19f76',
// 	measurementId: 'G-KXKL3TWZD1',
// }

const firebaseInit = initializeApp(firebaseConfig)

export default firebaseInit
