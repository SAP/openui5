/*global QUnit */

(function(){
	"use strict";

	var TESTPARAM = "testmodule";
	var LIBRARY;

	function initTestModule(oConfig) {
		if (oConfig.coverage && window.blanket) {
			window.blanket.options("sap-ui-cover-only", oConfig.coverage);
		}

		if (oConfig.branchCoverage && window.blanket) {
			window.blanket.options("branchTracking", true);
		}

		if (oConfig.rtl) {
			sap.ui.getCore().getConfiguration().setRTL(true);
		}

		var aLibraryPromises = [];
		if (oConfig.libs && oConfig.libs.length) {
			for (var i = 0; i < oConfig.libs.length; i++) {
				aLibraryPromises.push(sap.ui.getCore().loadLibrary(oConfig.libs[i].trim(), {async : true}));
			}
		} else {
			aLibraryPromises.push(Promise.resolve());
		}

		var aRequires = [];
		if (oConfig.sinon) {
			aRequires.push("sap/ui/thirdparty/sinon");
			aRequires.push("sap/ui/thirdparty/sinon-qunit");
			aRequires.push("sap/ui/thirdparty/sinon-ie");
		}
		aRequires.push(LIBRARY + "/qunit/" + oConfig.module + ".qunit");

		return new Promise(function(resolve, reject) {
			Promise.all(aLibraryPromises).then(function(){
				sap.ui.require(aRequires, function() {
					var aLoadedModules = arguments;
					var oCore = sap.ui.getCore();

					if (oConfig.waitForTheme && !oCore.isThemeApplied()) {
						var fnStart = function() {
							oCore.detachThemeChanged(fnStart);
							resolve(aLoadedModules);
						};
						oCore.attachThemeChanged(fnStart);
					} else {
						resolve(aLoadedModules);
					}
				});
			});
		});
	}

	function getTestModules() {
		var aTests = [];
		var sDefaultLib = LIBRARY.replace(/[/]/g, ".");

		for (var i = 0; i < window._testConfig.tests.length; i++) {
			var oConfig = jQuery.extend({}, window._testConfig.defaults, window._testConfig.tests[i]);

			if (!oConfig.module) {
				oConfig.module = oConfig.name;
			}

			if (oConfig.libs && oConfig.libs.indexOf(sDefaultLib) < 0) {
				oConfig.libs.push(sDefaultLib);
			}

			aTests.push(oConfig);
		}

		return aTests;
	}

	function findTestModule(aTestModules, sTestModule) {
		var oTestModule = null;
		for (var i = 0; i < aTestModules.length; i++) {
			if (aTestModules[i].name === sTestModule) {
				oTestModule = aTestModules[i];
				break;
			}
		}
		return oTestModule;
	}

	function initOverviewPage(aTestModules) {
		aTestModules.sort(function(a, b) {
			var a = a.name.toUpperCase();
			var b = b.name.toUpperCase();
			if (a < b) {
				return -1;
			} else if (a > b) {
				return 1;
			} else {
				return 0;
			}
		});

		var sLinkHTML = "<h1 id='qunit-header'>" + document.title + "</h1><ol id='qunit-tests'>";
		for (var i = 0; i < aTestModules.length; i++) {
			sLinkHTML += "<li class='pass'><a class='module-name' style='color:#528CE0' href='" + window.location.pathname + "?testmodule=" + aTestModules[i].name + "' target='_blank'>" + aTestModules[i].name + "</a></li>";
		}
		sLinkHTML += "</li></ol>";

		jQuery(function(){
			jQuery("#qunit").append(sLinkHTML);
		});
	}


	QUnit.config.autostart = false;

	var oScriptTag = document.getElementById("sap-ui-qunit-bootstrap");
	if (oScriptTag) {
		LIBRARY = oScriptTag.getAttribute("data-sap-ui-lib");
	}

	if (!LIBRARY) {
		return;
	}

	sap.ui.getCore().attachInit(function() {

		sap.ui.require([
			"sap/base/util/UriParameters",
			LIBRARY + "/qunit/testsuite.qunit"
		], function(UriParameters, TestSuite) {

			var sTestModule = (new UriParameters(window.location.href)).get(TESTPARAM),
				aTestModules = getTestModules(),
				oTestModule = findTestModule(aTestModules, sTestModule);

			if (oTestModule) {

				document.title = "QUnit tests for module '" + oTestModule.name + "' of library '" + LIBRARY + "'";

				initTestModule(oTestModule).then(function() {
					if (oTestModule.autostart) {
						QUnit.start();
					}
				});

			} else {

				document.title = "Available Unit Tests for Library '" + LIBRARY + "'";

				initOverviewPage(aTestModules);

			}

		});

	});

})();
