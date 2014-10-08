// runs QUnit tests in a browser using Selenium WebDriver
module.exports = function(grunt, config) {

	var browsers = grunt.option('browsers');
	if (!browsers) {
		browsers = [ 'chrome' ]; // default
	} else {
		browsers = browsers.split(',');
	}

	var selenium_qunit = {
		options: {
			browsers: browsers,
			reportsDir: 'target/surefire-reports'
		}
	};

	return selenium_qunit;
};
