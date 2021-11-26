module.exports = {
	root: true,
	env: {
		node: true,
	},
	extends: ['plugin:vue/vue3-essential', '@vue/airbnb'],
	parserOptions: {
		parser: 'babel-eslint',
	},
	rules: {
		'no-console': process.env.NODE_ENV === 'production' ? 'warn' : 'off',
		'no-debugger': process.env.NODE_ENV === 'production' ? 'warn' : 'off',
		indent: 0,                                          // thụt lề cái mẹ gì ý
		semi: 0,                                            // dấu ; ở cuối mỗi dòng
		'no-tabs': 0,                                       // không cho sử dụng tab
		'arrow-parens': 0,                                  // bắt buộc (a)=>{} thay vì a=>{}
        'max-len': 0,                                       // chiều dài 1 dòng tối đa 100
        'operator-linebreak': 0,                            // dấu || phải ở đầu dòng (đếch fix prettier theo được)
		'import/prefer-default-export': 0,                  // nếu export 1 biến thì mặc định phải là default
		'object-curly-newline': 0,                          // bắt khai báo object, các phần tử phải xuống dòng
		// 'prefer-promise-reject-errors': 1,
		'implicit-arrow-linebreak': 0,                      // Bắt phải xuống dòng a.b.c.d
		// 'vue/no-deprecated-slot-attribute': 0,              // Bắt lỗi khi sử dụng attribute "slot" trong vue
        'function-paren-newline': 0,                        // run() => dấu ) nếu bị xuống dòng sẽ lỗi
        'no-unused-vars': 0,                                // khai báo biến mà không sử dụng sẽ lỗi
        'no-param-reassign': 0,                             // sửa params của function sẽ lỗi
        'prefer-template': 0,                               // Bắt buộc dùng template string khi cộng chuỗi, vcc
	},
}
