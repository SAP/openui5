/*!
 * ${copyright}
 */

/*global jQuery, QUnit, URI, XMLHttpRequest, sap */// declare unusual global vars for JSLint/SAPUI5 validation
(function() {
	"use strict";

	if (typeof QUnit === "undefined") {
		throw new Error("qunit-junit.js: QUnit is not loaded yet!");
	}

	// any version < 2.0 activates legacy support
	// note that the strange negated condition properly handles NaN
	var bLegacySupport = !(parseFloat(QUnit.version) >= 2.0);

	// test-page url/name as module prefix
	var sTestPageName = document.location.pathname.substr(1).replace(/\./g, "_").replace(/\//g, ".") + document.location.search.replace(/\./g, '_');

	// avoid . in module names to avoid displaying issues in Jenkins results
	function formatModuleName(sName) {
		return String(sName || 'default').replace(/\./g, "_");
	}

	// HACK: insert our hook in front of QUnit's own hook so that we execute first
	QUnit.config.callbacks.begin.unshift(function() {
		// ensure proper structure of DOM
		var qunitNode = document.querySelector("#qunit");
		var qunitDetailNodes = document.querySelectorAll('#qunit-header,#qunit-banner,#qunit-userAgent,#qunit-testrunner-toolbar,#qunit-tests');
		var qunitFixtureNode = document.querySelector("#qunit-fixture");
		if ( qunitNode == null && qunitDetailNodes.length > 0 ) {
			// create a "qunit" section and place it before the existing detail DOM
			qunitNode = document.createElement('DIV');
			qunitNode.id = 'qunit';
			qunitDetailNodes[0].parentNode.insertBefore(qunitNode, qunitDetailNodes[0]);
			// move the existing DOM into the wrapper
			for ( var i = 0; i < qunitDetailNodes.length; i++) {
				qunitNode.appendChild(qunitDetailNodes[i]);
			}
		}
		if ( qunitFixtureNode == null ) {
			qunitFixtureNode = document.createElement('DIV');
			qunitFixtureNode.id = 'qunit-fixture';
			qunitNode.parentNode.insertBefore(qunitFixtureNode, qunitNode.nextSibling);
		}
	});

	// TODO: Remove deprecated code once all projects adapted
	if ( bLegacySupport ) {
		QUnit.equals = window.equals = window.equal;
		QUnit.raises = window.raises = window["throws"];
	}

	// register QUnit event handler to manipulate module names for better reporting in Jenkins
	QUnit.moduleStart(function(oData) {
		oData.name = sTestPageName + "." + formatModuleName(oData.name);
	});
	QUnit.testStart(function(oData) {
		oData.module = sTestPageName + "." + formatModuleName(oData.module);
		if ( bLegacySupport ) {
			window.assert = QUnit.config.current.assert;
		}
	});
	if ( bLegacySupport ) {
		QUnit.testDone(function(assert) {
			try {
				delete window.assert;
			} catch (ex) {
				// report that the cleanup of the window.assert compatibility object
				// failed because some script loaded via script tag defined an assert
				// function which finally causes the "delete window.assert" to fail
				if (!window._$cleanupFailed) {
					QUnit.test("A script loaded via script tag defines a global assert function!", function(assert) {
						assert.ok(QUnit.config.ignoreCleanupFailure, ex);
					});
					window._$cleanupFailed = true;
				}
			}
		});
	}

	// load and execute qunit-reporter-junit script synchronously via XHR
	if ( !QUnit.jUnitDone ) {
		//extract base URL from script to attach the qunit-reporter-junit script
		var sDocumentLocation = document.location.href.replace(/\?.*|#.*/g, ""),
			aScripts = document.getElementsByTagName("script"),
			sBaseUrl = null,
			sFullUrl = null,
			req;

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
			if ( typeof sap === 'object' && sap.ui && sap.ui.require && sap.ui.require.toUrl ) {
				sFullUrl = sap.ui.require.toUrl("sap/ui/thirdparty/qunit-reporter-junit.js");
			} else if (typeof jQuery !== 'undefined' && jQuery.sap && jQuery.sap.getResourcePath) {
				sFullUrl = jQuery.sap.getResourcePath("sap/ui/thirdparty/qunit-reporter-junit", ".js");
			} else {
				throw new Error("qunit-junit.js: The script tag seems to be malformed!");
			}
		} else {
			sFullUrl = sBaseUrl + "thirdparty/qunit-reporter-junit.js";
		}

		req = new XMLHttpRequest();
		req.open('GET', sFullUrl, false);
		req.onreadystatechange = function() {
			if (req.readyState == 4) {
				// execute the loaded script
				var sScript = req.responseText;
				if (typeof URI !== "undefined") {
					sScript += "\n//# sourceURL=" + URI(sFullUrl).absoluteTo(sDocumentLocation);
				}
				window.eval(sScript);
			}
		};
		req.send(null);
	}

	//callback to put results on window object
	QUnit.jUnitDone(function(oData) {

		window._$jUnitReport.results = oData.results;
		window._$jUnitReport.xml = oData.xml;

	});

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

})();
