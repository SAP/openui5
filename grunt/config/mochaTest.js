// configure mocha tests
module.exports = function() {
	return {
		test : {
			src: ['grunt/mochaTests/*_test.js', 'lib/cldr-openui5/test/*_test.js']
		}
	};
};