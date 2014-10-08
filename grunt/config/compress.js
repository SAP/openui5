// create zip archives
module.exports = {
	target: {
		options: {
			archive: 'target/openui5.zip'
		},
		files: [
			{
				expand: true,
				cwd: 'target/openui5',
				src: ['**']
			}
		]
	}
};
