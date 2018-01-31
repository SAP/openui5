/*!
 * ${copyright}
 */

/*global jQuery, QUnit, URI, blanket*/// declare unusual global vars for JSLint/SAPUI5 validation
(function() {
	"use strict";

	/*global jQuery, sap */

	if (typeof QUnit === "undefined") {
		throw new Error("qunit-coverage.js: QUnit is not loaded yet!");
	}

	// set a hook for client-side coverage on window object
	window["sap-ui-qunit-coverage"] = "client";

	// client-side instrument filter options (data-attributes of qunit-coverage script tag)
	var sFilterAttr, sAntiFilterAttr;

	// extract base URL from script to attach the qunit-coverage script
	var sDocumentLocation = document.location.href.replace(/\?.*|#.*/g, ""),
			aScripts = document.getElementsByTagName("script"),
			sBaseUrl = null,
			sFullUrl = null;

	for (var i = 0; i < aScripts.length; i++) {
		var oScript = aScripts[i];
		var sSrc = oScript.getAttribute("src");
		if (sSrc) {
			var aBaseUrl = sSrc.match(/(.*)qunit\/qunit-coverage\.js$/i);
			if (aBaseUrl && aBaseUrl.length > 1) {
				sBaseUrl = aBaseUrl[1];

				// Set custom client-side instrument filter (from script attributes)
				if (oScript.hasAttribute("data-sap-ui-cover-only")) {
					sFilterAttr = oScript.getAttribute("data-sap-ui-cover-only");
				}
				if (oScript.hasAttribute("data-sap-ui-cover-never")) {
					sAntiFilterAttr = oScript.getAttribute("data-sap-ui-cover-never");
				}

				break;
			}
		}
	}

	if (sBaseUrl === null) {
		if ( typeof sap === 'object' && sap.ui && sap.ui.require && sap.ui.require.toUrl ) {
			sFullUrl = sap.ui.require.toUrl("sap/ui/thirdparty/blanket.js");
		} else if (jQuery && jQuery.sap && jQuery.sap.getModulePath) {
			sFullUrl = jQuery.sap.getModulePath("sap.ui.thirdparty.blanket", ".js");
		} else {
			throw new Error("qunit-coverage.js: The script tag seems to be malformed!");
		}
	} else {
		sFullUrl = sBaseUrl + "thirdparty/blanket.js";
	}

	// check for coverage beeing active or not
	if (QUnit.urlParams.coverage) {

		var translate = function(sScript, sModuleName) {

			// avoid duplicate instrumentation on server and client-side
			if (sScript.indexOf("window['sap-ui-qunit-coverage'] = 'server';") === 0) {
				return sScript;
			}

			// manage includes and excludes with blanket utils
			// check for blanket option (set via JS) and fall back to attribute of qunit-coverage script tag
			var sFilter = blanket.options("sap-ui-cover-only") || sFilterAttr;
			var sAntiFilter = blanket.options("sap-ui-cover-never") || sAntiFilterAttr;

			if (typeof sAntiFilter !== "undefined" && blanket.utils.matchPatternAttribute(sModuleName, sAntiFilter)) {
				// NEVER INSTRUMENT (excluded)
			} else if (typeof sFilter === "undefined" || blanket.utils.matchPatternAttribute(sModuleName, sFilter)) {
				// INSTRUMENT (included)

				blanket.instrument({
					inputFile: sScript,
					inputFileName: sModuleName,
					instrumentCache: false
				}, function(sInstrumentedScript) {
					sScript = sInstrumentedScript;
				});

			} else {
				// DONT INSTRUMENT (not explicitly excluded / included)
			}

			return sScript;
		};

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

				// reset QUnit config => will be set by QUnitUtils!
				QUnit.config.autostart = true;

				// prevent QUnit.start() call in blanket
				blanket.options("existingRequireJS", true);

				if ( typeof sap === 'object' && sap.ui && sap.ui._ui5loader ) {
					sap.ui._ui5loader.translate = translate;
				} else if (jQuery && jQuery.sap) {
					jQuery.sap.require._hook = translate;
				} else {
					throw new Error("qunit-coverage.js: jQuery.sap.global is not loaded - require hook cannot be set!");
				}

			}
		};
		req.send(null);

	} else {

		// add a QUnit configuration option in the Toolbar to enable/disable
		// client-side instrumentation via blanket (done manually because in
		// this case blanket will not be loaded and executed)
		QUnit.config.urlConfig.push({
			id: "coverage",
			label: "Enable coverage",
			tooltip: "Enable code coverage."
		});

	}

})();
