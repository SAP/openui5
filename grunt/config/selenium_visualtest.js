// runs visual tests in a browser using Selenium WebDriver
module.exports = function(grunt, config) {

	var browsers = grunt.option('browsers');

	var libs = grunt.option('libs');
	var specs = grunt.option('specs');

	var seleniumAddress = grunt.option('seleniumAddress');
	var seleniumHost = grunt.option('seleniumHost');
	var seleniumPort = grunt.option('seleniumPort');
	var useSeleniumJar = grunt.option('useSeleniumJar');
	var seleniumAddressProxy = grunt.option('seleniumAddressProxy');

	var take = grunt.option('take');
	var compare = grunt.option('compare');
	var update = grunt.option('update');

	var configArg = grunt.option('config');

	return {
		run: {
			options: {
				browsers: browsers,
				libs: libs,
				specs: specs,
				seleniumAddress: seleniumAddress,
				seleniumHost: seleniumHost,
				seleniumPort: seleniumPort,
				useSeleniumJar: useSeleniumJar,
				seleniumAddressProxy: seleniumAddressProxy,
				take: take,
				compare: compare,
				update: update,
				config: configArg
			}
		}
	};
};
