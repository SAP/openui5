module.exports = {
	ignores: [
		// the file is used by a test for testing the error case
		"test/sap/ui/core/qunit/mvc/testdata/HtmlOnRoot.view.xml",
		// the file is used to test the case where bootstrap parameters are
		// defined under the same name
		"test/sap/ui/core/qunit/base/Config_bootstrap.qunit.html"
	]
};
