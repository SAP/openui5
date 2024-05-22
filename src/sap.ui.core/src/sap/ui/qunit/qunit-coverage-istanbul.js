/*!
 * ${copyright}
 */
/* global QUnit */
(function() {
	"use strict";

	if (typeof QUnit === "undefined") {
		throw new Error("qunit-coverage-istanbul.js: QUnit is not loaded yet!");
	}

	// Functions taken from blanket.js - v1.1.5 (sap/ui/thirdparty/blanket.js)
	// BEGIN: Copy from blanket.js
	function normalizeBackslashes(str) {
		return str.replace(/\\/g, '/');
	}
	function matchPatternAttribute(filename,pattern){
		if (typeof pattern === 'string'){
			if (pattern.indexOf("[") === 0){
				//treat as array
				var pattenArr = pattern.slice(1,pattern.length - 1).split(",");
				return pattenArr.some(function(elem){
					return matchPatternAttribute(filename,normalizeBackslashes(elem.slice(1,-1)));
				});
			} else if ( pattern.indexOf("//") === 0){
				var ex = pattern.slice(2,pattern.lastIndexOf('/'));
				var mods = pattern.slice(pattern.lastIndexOf('/') + 1);
				var regex = new RegExp(ex,mods);
				return regex.test(filename);
			} else if (pattern.indexOf("#") === 0){
				return window[pattern.slice(1)].call(window,filename);
			} else {
				return filename.indexOf(normalizeBackslashes(pattern)) > -1;
			}
		} else if ( pattern instanceof Array ){
			return pattern.some(function(elem){
				return matchPatternAttribute(filename,elem);
			});
		} else if (pattern instanceof RegExp){
			return pattern.test(filename);
		} else if (typeof pattern === "function"){
			return pattern.call(window,filename);
		}
	}
	// END: Copy from blanket.js

	// set a hook for client-side coverage on window object
	window["sap-ui-qunit-coverage"] = "client";

	// client-side instrument filter options (data-attributes of qunit-coverage-istanbul script tag)
	var filters;
	var oScript = document.currentScript;
	function getFilters() {
		var sFilterAttr, sAntiFilterAttr;

		// Cache and only read once
		if (filters) {
			return filters;
		}

		if (oScript) {
			// Set custom client-side instrument filter (from script attributes)
			if (oScript.hasAttribute("data-sap-ui-cover-only")) {
				sFilterAttr = oScript.getAttribute("data-sap-ui-cover-only");
			}
			if (oScript.hasAttribute("data-sap-ui-cover-never")) {
				sAntiFilterAttr = oScript.getAttribute("data-sap-ui-cover-never");
			}
		}

		filters = {filter: sFilterAttr, antiFilter: sAntiFilterAttr};
		return filters;
	}

	function shouldBeInstrumented(sModuleName) {
		var appliedFilters = getFilters(),
			sFilterAttr = appliedFilters.filter,
			sAntiFilterAttr = appliedFilters.antiFilter;

		if (typeof sAntiFilterAttr !== "undefined" && matchPatternAttribute(sModuleName, sAntiFilterAttr)) {
			// NEVER INSTRUMENT (excluded)
			return false;
		} else if (typeof sFilterAttr === "undefined" || matchPatternAttribute(sModuleName, sFilterAttr)) {
			// INSTRUMENT (included)
			return true;
		} else {
			// DONT INSTRUMENT (not explicitly excluded / included)
			return false;
		}
	}

	function appendUrlParameter(sUrl) {
		var oUrl = new URL(sUrl, document.baseURI);
		oUrl.searchParams.set("instrument", "true");
		return oUrl.toString();
	}

	// Some of the reporting configurations could be set on the frontend
	// Take those configurations and parse them
	function getConfig() {
		if (!oScript) {
			return {};
		}

		var oConfig = {};
		var watermarkProps = ["statements", "functions", "branches", "lines"];
		watermarkProps.reduce(function(acc, prop) {
			if (oScript.hasAttribute("data-sap-ui-cover-watermarks-" + prop)) {
				acc["watermarks"] = acc["watermarks"] || {};
				acc["watermarks"][prop] = JSON.parse(oScript.getAttribute("data-sap-ui-cover-watermarks-" + prop));
			}
			return acc;
		}, oConfig);

		return oConfig;
	}

	// check for coverage being active or not
	if (QUnit.urlParams.coverage) {

		var fnSetAttributeOrig = HTMLScriptElement.prototype.setAttribute;
		HTMLScriptElement.prototype.setAttribute = function(sName, sValue) {
			if (sName === "data-sap-ui-module" && shouldBeInstrumented(sValue || "")) {
				this.src = appendUrlParameter(this.src);
			}
			fnSetAttributeOrig.apply(this, arguments);
		};

		var fnXhrOpenOrig = XMLHttpRequest.prototype.open;
		XMLHttpRequest.prototype.open = function(sMethod, sUrl) {
			if (
				globalThis.sap?.ui?.loader &&
				sUrl && sUrl.endsWith(".js") && shouldBeInstrumented(sap.ui.loader._.guessResourceName(sUrl) || "")
			) {
				arguments[1] = appendUrlParameter(sUrl);
			}
			fnXhrOpenOrig.apply(this, arguments);
		};

		// Build the layout
		QUnit.done(function () {
			// Do not try to create a report when the page is embed into an IFrame
			// The IFrame has the coverage data and could handle it on its own
			if (window.top !== window){
				return;
			}
			sap.ui.require(["sap/base/util/fetch", "sap/base/util/Version"], function (fetch, Version) {
				var oConfig = getConfig();
				var oWatermarks = oConfig.watermarks;

				fetch("/.ui5/coverage/ping", {
					method: "GET"
				})
				.then(function (pResponse) {
					return pResponse.json();
				})
				.then(function(oMiddlewareConfig){
					// As of version >= 1.1.0 @ui5/middleware-code-coverage supports more enhanced structure for
					// the request body. Directly sending the new coverage object will cause an error for older versions.
					var oMiddlewareVersion = new Version(oMiddlewareConfig.version);
					var bIsLegacyAPI = oMiddlewareVersion.compareTo("1.1.0") < 0;

					if (bIsLegacyAPI) {
						if (oWatermarks) {
							// eslint-disable-next-line no-console
							console.error(
								"Coverage option \"watermarks\" is provided, but the current version of " +
								"@ui5/middleware-code-coverage (" + oMiddlewareVersion.toString() + ") doesn't support it. " +
								"Please upgrade @ui5/middleware-code-coverage to v1.1.0 or higher."
							);
						}
						return window.top.__coverage__; // Backwards compatibility
					} else {
						return {
							coverage: window.top.__coverage__,
							watermarks: oWatermarks
						};
					}
				}).then(function (oRequestBody) {
					return fetch("/.ui5/coverage/report", {
						method: "POST",
						body: JSON.stringify(oRequestBody),
						headers: {
							"Content-Type": "application/json"
						}
					});
				})
				.then(function (pResponse) {
					return pResponse.json();
				})
				.then(function (oData) {
					var aReports = oData.availableReports;
					// eslint-disable-next-line max-nested-callbacks
					var oHTMLReport = aReports.filter(function (oCurReport) {
						// HTML is the only one that make sense and
						// provides understandable information
						return oCurReport.report === "html";
					})[0];

					if (!oHTMLReport) { // Do not render reports if HTML or lcov are not provided
						return;
					}

					var body = document.body;
					var oFrameEl = document.createElement("iframe");
					oFrameEl.src = "/.ui5/coverage/report/" + oHTMLReport.destination;
					oFrameEl.style.border = "none";
					oFrameEl.style.width = "100%";
					oFrameEl.style.height = "100vh";
					oFrameEl.sandbox = "allow-scripts";

					body.appendChild(oFrameEl);
				});
			});
		});
	}

	// add a QUnit configuration option in the Toolbar to enable/disable
	// client-side instrumentation (done manually because there might be a
	// case where the setup does not use _setupAndStart.js)
	var bHasCoverageCheckbox = QUnit.config.urlConfig.some(function (oConf) {
		return oConf.id === "coverage";
	});

	if (!bHasCoverageCheckbox) {
		QUnit.config.urlConfig.push({
			id: "coverage",
			label: "Enable coverage",
			tooltip: "Enable code coverage."
		});
	}
})();
