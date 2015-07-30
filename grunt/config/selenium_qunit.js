// runs QUnit tests in a browser using Selenium WebDriver
module.exports = function(grunt, config) {

	var browsers = grunt.option('browsers');
	if (!browsers) {
		browsers = [ 'chrome' ]; // default
	} else {
		browsers = browsers.split(',');
	}

	return {
		run: {
			options: {
				browsers: browsers,
				contextPath: '/' + config.testsuite.name,
				reportsDir: 'target/surefire-reports'
			}
		}
	};
};
