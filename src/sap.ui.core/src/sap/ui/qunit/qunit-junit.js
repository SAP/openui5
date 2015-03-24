/*!
 * ${copyright}
 */

/*global QUnit, URI*/// declare unusual global vars for JSLint/SAPUI5 validation
(function() {

	if (typeof QUnit !== "undefined") {

		//extract base URL from script to attach the qunit-reporter-junit script
		var sDocumentLocation = document.location.href.replace(/\?.*|#.*/g, ""),
				aScripts = document.getElementsByTagName("script"),
				sBaseUrl = null,
				sFullUrl = null;

		for (var i = 0; i < aScripts.length; i++) {
			var sSrc = aScripts[i].getAttribute("src");
			if (sSrc) {
				var aBaseUrl = sSrc.match(/(.*)qunit\/qunit-junit\.js$/i);
				if (aBaseUrl && aBaseUrl.length > 1) {
					sBaseUrl = aBaseUrl[1];
					break;
				}
			}
		}

		if (sBaseUrl === null) {
			if (jQuery && jQuery.sap &&  jQuery.sap.getModulePath) {
				sFullUrl = jQuery.sap.getModulePath("sap.ui.thirdparty.qunit-reporter-junit", ".js");
			} else {
				throw new Error("qunit-junit.js: The script tag seems to be malformed!");
			}
		} else {
			sFullUrl = sBaseUrl + "thirdparty/qunit-reporter-junit.js";
		}

		// test-page url/name as module prefix
		var sTestPageName = document.location.pathname.substr(1).replace(/\./g, "_").replace(/\//g, ".") + document.location.search.replace(/\./g, '_');

		// avoid . in module names to avoid displaying issues in Jenkins results
		var formatModuleName = function(sName) {
			return String(sName || 'default').replace(/\./g, "_");
		};

		// register QUnit event handler to manipulate module names for better reporting in Jenkins
		QUnit.moduleStart(function(oData) {
			oData.name = sTestPageName + "." + formatModuleName(oData.name);
		});
		QUnit.testStart(function(oData) {
			oData.module = sTestPageName + "." + formatModuleName(oData.module);
		});
		QUnit.log(function(data) {
			// manipulate data.message for failing tests with source info
			if (!data.result && data.source) {
				// save original error message (see QUnit.log below)
				data.___message = data.message;
				// add source info to message for detailed reporting
				data.message += '\n' + 'Source: ' + data.source;
			}
		});

		// load and execute qunit-reporter-junit script synchronously via XHR
		var req = new window.XMLHttpRequest();
		req.open('GET', sFullUrl, false);
		req.onreadystatechange = function(){
			if (req.readyState == 4) {
				// execute the loaded script
				var sScript = req.responseText;
				if (typeof window.URI !== "undefined") {
					sScript += "\n//# sourceURL=" + URI(sFullUrl).absoluteTo(sDocumentLocation);
				}
				window.eval(sScript);
			}
		};
		req.send(null);

		// this will be executed after the hooks from qunit-reporter-junit
		QUnit.log(function(data) {
			if (!data.result && data.source) {
				// restore original message to prevent adding the source info to the error message title (see qunit-reporter-junit)
				data.message = data.___message;
				data.___message = undefined;
			}
		});

		//callback to put results on window object
		QUnit.jUnitReport = function(oData) {

			window._$jUnitReport.results = oData.results;
			window._$jUnitReport.xml = oData.xml;

		};

		// store the information about executed tests
		QUnit.log(function(oDetails) {

			window._$jUnitReport.tests = window._$jUnitReport.tests || [];

			var sText = String(oDetails.message) || (oDetails.result ? "okay" : "failed");
			if (!oDetails.result) {
				if (oDetails.expected !== undefined) {
					sText += "\nExpected: " + oDetails.expected;
				}
				if (oDetails.actual !== undefined) {
					sText += "\nResult: " + oDetails.actual;
				}
				if (oDetails.expected !== undefined && oDetails.actual !== undefined) {
					sText += "\nDiff: " + oDetails.expected + " != " + oDetails.actual;
				}
				if (oDetails.source) {
					sText += "\nSource: " + oDetails.source;
				}
			}

			window._$jUnitReport.tests.push({
				module: oDetails.module,
				name: oDetails.name,
				text: sText,
				pass: oDetails.result
			});

		});

		// flag to identify JUnit reporting is active
		window._$jUnitReport = {};

	} else {
		throw new Error("qunit-junit.js: QUnit is not loaded yet!");
	}

})();
