// delete files/folders
module.exports = {
	'target.openui5': {
		dot: true,
		src: [ 'target/openui5/*' ]
	},
	'target.surefire-reports': {
		dot: true,
		src: [ 'target/surefire-reports/*' ]
	}
}
