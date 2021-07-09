/*global QUnit, URI*/
sap.ui.define(["sap/ui/core/theming/Parameters"], function(Parameters) {
	"use strict";

	// needed to compare URLs so we are independent of a host
	var sBaseUri = new URI(sap.ui.require.toUrl("testdata/core"), document.baseURI).toString();

	// Checks for a request based on the performance API
	// Actual requests might not happen in a built scenario, so spying jQuer.ajax is not an option
	function checkLibraryParametersJsonRequestForLib(sLibNumber) {
		return window.performance.getEntriesByType("resource").filter(function (oResource) {
			return oResource.name.endsWith("themeParameters/lib" + sLibNumber + "/themes/sap_hcb/library-parameters.json");
		});
	}

	QUnit.module("CSS Variables - SYNC");

	QUnit.test("Parameters.get() - get all access with CSS Variables (lib already loaded)", function(assert) {
		// We load the library before accessing all parameters, this should produce a library-parameters.json request
		// since the CSS variables don't allow for easy access to all parameters at once.
		sap.ui.getCore().loadLibrary("testlibs.themeParameters.lib1variables");

		return new Promise(function(resolve) {
			var fnAssertThemeChanged = function() {
				sap.ui.getCore().detachThemeChanged(fnAssertThemeChanged);

				// retrieve all parameters
				var mParams = Parameters.get();

				// check for request to lib1variables/library-parameters.json
				assert.strictEqual(checkLibraryParametersJsonRequestForLib("1variables").length, 1, "library-parameters.json requested once for testlibs.themeParameters.lib1variables");

				// the mParams now must be filled with the content of the library-parameters.json (only "default" scope!)
				assert.equal(mParams["lib1_sample-variable"], "16px", "Parameter 'sample-variable' is correct.");
				assert.equal(mParams["lib1_with.dot:andcolon"], "24px", "Parameter 'with.dot:andcolon' is correct.");
				assert.equal(mParams["lib1_andcolon"], "14px", "Parameter 'andcolon' is correct.");
				assert.equal(mParams["lib1_foo"], "1rem", "Parameter 'foo' is correct.");

				assert.equal(mParams["lib1_paramWithRelativeUrlQuoted"], "url('" + sBaseUri + "/testdata/libraries/themeParameters/lib1variables/themes/sap_hcb/img/icons/relative_quoted.png')", "Parameter with URL is correctly resolved");
				assert.equal(mParams["lib1_paramWithRelativeUrlAutoEscaped"], "url('" + sBaseUri + "/testdata/libraries/themeParameters/lib1variables/themes/sap_hcb/img/icons/relative_auto-escaped.png')", "Parameter with URL is correctly resolved");

				assert.equal(mParams["lib1_paramWithAbsoluteUrlQuoted"], "url(\"http://somewhere.foo/img/icons/absolute_quoted.png\")", "Parameter with absolute URL is untouched.");
				assert.equal(mParams["lib1_paramWithAbsoluteUrlAutoEscaped"], "url(http://somewhere.foo/img/icons/absolute_auto-escaped.png)", "Parameter with absolute URL is untouched.");

				resolve();
			};
			sap.ui.getCore().attachThemeChanged(fnAssertThemeChanged);
		});
	});

	QUnit.test("Parameters.get() - get all access with CSS Variables (lib not loaded yet)", function(assert) {
		// This library was not loaded before, so we force the sync loading of the library-parameters.json
		sap.ui.getCore().loadLibrary("testlibs.themeParameters.lib2variables");

		var mParams = Parameters.get();

		// check for request to lib2variables/library-parameters.json
		assert.strictEqual(checkLibraryParametersJsonRequestForLib("2variables").length, 1, "library-parameters.json requested once for testlibs.themeParameters.lib2variables");

		// the mParams now must be filled with the content of the library-parameters.json (only "default" scope!)
		assert.equal(mParams["lib2_sample-variable"], "16px", "Parameter 'sample-variable' is correct.");
		assert.equal(mParams["lib2_with.dot:andcolon"], "24px", "Parameter 'with.dot:andcolon' is correct.");
		assert.equal(mParams["lib2_andcolon"], "14px", "Parameter 'andcolon' is correct.");
		assert.equal(mParams["lib2_foo"], "1rem", "Parameter 'foo' is correct.");

		assert.equal(mParams["lib2_paramWithRelativeUrlQuoted"], "url('" + sBaseUri + "/testdata/libraries/themeParameters/lib2variables/themes/sap_hcb/img/icons/relative_quoted.png')", "Parameter with URL is correctly resolved");
		assert.equal(mParams["lib2_paramWithRelativeUrlAutoEscaped"], "url('" + sBaseUri + "/testdata/libraries/themeParameters/lib2variables/themes/sap_hcb/img/icons/relative_auto-escaped.png')", "Parameter with URL is correctly resolved");

		assert.equal(mParams["lib2_paramWithAbsoluteUrlQuoted"], "url(\"http://somewhere.foo/img/icons/absolute_quoted.png\")", "Parameter with absolute URL is untouched.");
		assert.equal(mParams["lib2_paramWithAbsoluteUrlAutoEscaped"], "url(http://somewhere.foo/img/icons/absolute_auto-escaped.png)", "Parameter with absolute URL is untouched.");

	});
});
