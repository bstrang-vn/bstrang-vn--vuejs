const dashboardChildren = [
	{
		path: 'warehouse',
		name: 'Warehouse',
		meta: {
			breadcrumbName: 'Warehouse',
		},
		component: () => import('@/components/warehouse/Warehouse.vue'),
		children: [
			{
				path: '',
				name: 'Goods List',
				meta: {
					breadcrumbName: 'Goods List',
				},
				component: () => import('@/components/warehouse/GoodsList.vue'),
			},
			{
				path: 'details/:id',
				name: 'Goods Details',
				meta: {
					breadcrumbName: 'Details',
				},
				component: () => import('@/components/warehouse/GoodsDetails.vue'),
			},
		],
	},
	{
		path: 'customer',
		name: 'Customer',
		meta: {
			breadcrumbName: 'Customer',
		},
		component: () => import('@/components/customer/Customer.vue'),
		children: [
			{
				path: '',
				name: 'Customer List',
				meta: {
					breadcrumbName: 'List',
				},
				component: () => import('@/components/customer/CustomerList.vue'),
			},
			{
				path: 'details/:id',
				name: 'Customer Details',
				meta: {
					breadcrumbName: 'Details',
				},
				component: () => import('@/components/customer/CustomerDetails.vue'),
			},
		],
	},
	{
		path: 'provider',
		name: 'Provider',
		meta: {
			breadcrumbName: 'Provider',
		},
		component: () => import('@/components/provider/Provider.vue'),
		children: [
			{
				path: '',
				name: 'Provider List',
				meta: {
					breadcrumbName: 'List',
				},
				component: () => import('@/components/provider/ProviderList.vue'),
			},
			{
				path: 'details/:id',
				name: 'Provider Details',
				meta: {
					breadcrumbName: 'Details',
				},
				component: () => import('@/components/provider/ProviderDetails.vue'),
			},
		],
	},
	{
		path: 'import-note',
		name: 'ImportNote',
		meta: {
			breadcrumbName: 'ImportNote',
		},
		component: () => import('@/components/import-note/ImportNote.vue'),
		children: [
			{
				path: '',
				name: 'ImportNote List',
				meta: {
					breadcrumbName: 'List',
				},
				component: () => import('@/components/import-note/import-note-list/ImportNoteList.vue'),
			},
			{
				path: 'create-modify/:id?',
				meta: {
					breadcrumbName: 'Create Modify',
				},
				name: 'ImportNote Create Modify',
				component: () =>
					import('@/components/import-note/import-note-create-modify/ImportNoteCreateModify.vue'),
			},
			{
				path: 'details/:id',
				meta: {
					breadcrumbName: 'Details',
				},
				name: 'ImportNote Details',
				component: () => import('@/components/import-note/import-note-details/ImportNoteDetails.vue'),
			},
		],
	},
	{
		path: 'export-note',
		name: 'ExportNote',
		meta: {
			breadcrumbName: 'ExportNote',
		},
		component: () => import('@/components/export-note/ExportNote.vue'),
		children: [
			{
				path: '',
				name: 'ExportNote List',
				meta: {
					breadcrumbName: 'List',
				},
				component: () => import('@/components/export-note/export-note-list/ExportNoteList.vue'),
			},
			{
				path: 'create-modify/:id?',
				meta: {
					breadcrumbName: 'Create Modify',
				},
				name: 'ExportNote Create Modify',
				component: () =>
					import('@/components/export-note/export-note-create-modify/ExportNoteCreateModify.vue'),
			},
			{
				path: 'details/:id',
				meta: {
					breadcrumbName: 'Details',
				},
				name: 'ExportNote Details',
				component: () => import('@/components/export-note/export-note-details/ExportNoteDetails.vue'),
			},
		],
	},
	{
		path: 'statistics',
		name: 'Statistics',
		meta: {
			breadcrumbName: 'Statistics',
		},
		component: () => import('@/components/statistics/Statistics.vue'),
	},
	{
		path: 'setting',
		name: 'Setting',
		meta: {
			breadcrumbName: 'Setting',
		},
		component: () => import('@/components/setting/Setting.vue'),
	},
]

export default dashboardChildren
