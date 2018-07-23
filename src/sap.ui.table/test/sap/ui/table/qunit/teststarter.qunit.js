/*global QUnit */

(function(){
	"use strict";

	var TESTPARAM = "testmodule";

	function initTestModule(oTestModule, oConfig) {
		if (oTestModule.loaderConfig) {
			sap.ui.loader.config(oTestModule.loaderConfig);
		}

		if (oTestModule.rtl) {
			sap.ui.getCore().getConfiguration().setRTL(true);
		}

		var aLibraryPromises = [];
		if (oTestModule.libs && oTestModule.libs.length) {
			for (var i = 0; i < oTestModule.libs.length; i++) {
				aLibraryPromises.push(sap.ui.getCore().loadLibrary(oTestModule.libs[i].trim(), {async : true}));
			}
		} else {
			aLibraryPromises.push(Promise.resolve());
		}

		return new Promise(function(resolve, reject) {
			sap.ui.getCore().attachInit(function() {
				var oExtendedBranchCoveragePromise;

				if (oTestModule.branchCoverage && oTestModule.extendedBranchCoverageConfig && window.blanket) {
					oExtendedBranchCoveragePromise = jQuery.sap.includeScript({url: sap.ui.require.toUrl("sap/ui/test/BranchTracking.js"), attributes: oTestModule.extendedBranchCoverageConfig});
				} else {
					oExtendedBranchCoveragePromise = Promise.resolve();
				}

				oExtendedBranchCoveragePromise.then(function() {
					Promise.all(aLibraryPromises).then(function(){
						sap.ui.require([oConfig.moduleNameTemplate.replace("{0}", oTestModule.module)], function() {
							var aLoadedModules = arguments;
							var oCore = sap.ui.getCore();

							if (oTestModule.waitForTheme && !oCore.isThemeApplied()) {
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
			});
		});
	}

	function normalizeConfig(oConfig) {
		var aTests = [];
		var aDefaultLibs = oConfig.baseLibs || [];

		for (var i = 0; i < oConfig.tests.length; i++) {
			var oTest = Object.assign({}, oConfig.defaults, oConfig.tests[i]);

			if (!oTest.module) {
				oTest.module = oTest.name;
			}

			oTest.fullname = oTest.group ? oTest.group + " - " + oTest.name : oTest.name;

			if (oTest.libs) {
				for (var j = 0; j < aDefaultLibs.length; j++) {
					if (oTest.libs.indexOf(aDefaultLibs[j]) < 0) {
						oTest.libs.push(aDefaultLibs[j]);
					}
				}
			}

			aTests.push(oTest);
		}

		oConfig.tests = aTests;

		return oConfig;
	}

	function findTestModule(oConfig, sTestModule) {
		var oTestModule = null;
		var aTestModules = oConfig.tests;
		if (sTestModule) {
			for (var i = 0; i < aTestModules.length; i++) {
				if (aTestModules[i].name === sTestModule) {
					oTestModule = aTestModules[i];
					break;
				}
			}
		}
		return oTestModule;
	}

	function initOverviewPage(oConfig) {
		var aTestModules = oConfig.tests;

		aTestModules.sort(function(a, b) {
			a = a.fullname.toUpperCase();
			b = b.fullname.toUpperCase();
			if (a < b) {
				return -1;
			} else if (a > b) {
				return 1;
			} else {
				return 0;
			}
		});

		var sLinkHTML = "<h1 id='qunit-header'>" + document.title + "</h1><ol id='qunit-tests'>";
		var sNameHTML;
		for (var i = 0; i < aTestModules.length; i++) {
			sNameHTML = "<span class='test-name'>" + aTestModules[i].name + "</span>";
			if (aTestModules[i].group) {
				sNameHTML = "<span style='margin-right:0.5rem;'>" + aTestModules[i].group + ":</span>" + sNameHTML;
			}
			sLinkHTML += "<li class='pass'><a class='module-name' style='color:#528CE0;font-weight:bold;' href='" + window.location.pathname + "?testmodule="
							+ aTestModules[i].name + "' target='_blank'>" + sNameHTML + "</a></li>";
		}
		sLinkHTML += "</li></ol>";

		jQuery(function(){
			jQuery("#qunit").append(sLinkHTML);
		});
	}

	function loadTestConfig(sSrc) {
		var oRequest = new XMLHttpRequest();
		oRequest.overrideMimeType("application/json");
		oRequest.open("GET", sSrc, true);

		return new Promise(function(resolve, reject) {
			oRequest.onreadystatechange = function () {
				if (oRequest.readyState == 4 && oRequest.status == "200") {
					var sJSON = oRequest.responseText || "";
					sJSON = sJSON.replace(/\/\*.*\*\//g, ""); /*Remove comments*/
					resolve(JSON.parse(sJSON));
				}
			};
			oRequest.send(null);
		});
	}

	function getTestModuleNameFromURL() {
		return new Promise(function(resolve, reject) {
			sap.ui.require([
				"sap/base/util/UriParameters"
			], function(UriParameters) {
				var sTestModule = (new UriParameters(window.location.href)).get(TESTPARAM);
				resolve(sTestModule);
			});
		});
	}



	var oScriptTag = document.getElementById("sap-ui-qunit-bootstrap");
	var sConfigSrc = null;
	if (oScriptTag) {
		sConfigSrc = oScriptTag.getAttribute("data-sap-ui-qunit-config");
	}

	if (!sConfigSrc) {
		return;
	}


	if (oScriptTag && oScriptTag.getAttribute("data-sap-ui-qunit-suite")) {
		// Starter Script is used to initialize a testsuite

		var sContextPath = "/" + window.location.pathname.split("/")[1];

		window.suite = function () {
			return new Promise(function(resolve, reject) {
				loadTestConfig(sConfigSrc).then(function(oConfig){
					var oSuite = new parent.jsUnitTestSuite();
					for (var i = 0; i < oConfig.tests.length; i++) {
						oSuite.addTestPage(sContextPath + "/test-resources/sap/ui/table/qunit/teststarter.qunit.html?testmodule=" + oConfig.tests[i].name);
					}
					resolve(oSuite);
				});
			});
		};

		var oScript = document.createElement("script");
		oScript.src = sContextPath + "/resources/sap/ui/qunit/qunit-redirect.js";
		oScript.type = "text/javascript";
		document.head.appendChild(oScript);

	} else {
		// Starter Script is used to show an test overview or run a single test

		if (!window.QUnit) {
			window.QUnit = {config: {}};
		}
		if (!window.QUnit.config) {
			window.QUnit.config = {};
		}
		window.QUnit.config.autostart = false;

		Promise.all([loadTestConfig(sConfigSrc), getTestModuleNameFromURL()]).then(function(aResult) {
			var oConfig = normalizeConfig(aResult[0]),
				oTestModule = findTestModule(oConfig, aResult[1]);

			var aRequires = [];
			if (!oTestModule) {
				aRequires.push("sap/ui/qunit/qunit-2-css"); /*Only load some CSS for the Overview page*/
			} else {
				if (oTestModule.qunitVersion === "2") {
					aRequires.push("sap/ui/thirdparty/qunit-2");
					aRequires.push("sap/ui/qunit/qunit-2-css");
				} else {
					aRequires.push("sap/ui/thirdparty/qunit");
					aRequires.push("sap/ui/qunit/qunit-css");
				}

				aRequires.push("sap/ui/qunit/qunit-junit");

				if (oTestModule.sinonVersion == "1") {
					aRequires.push("sap/ui/thirdparty/sinon");
					aRequires.push("sap/ui/thirdparty/sinon-qunit");
					aRequires.push("sap/ui/thirdparty/sinon-ie");
				} else if (oTestModule.sinonVersion == "4") {
					aRequires.push("sap/ui/thirdparty/sinon-4");
					aRequires.push("sap/ui/qunit/sinon-qunit-bridge");
				}

				aRequires.push("sap/ui/qunit/qunit-coverage");
			}

			/* Prepare body: Add QUnit DOM if missing, add CSS, ... */
			jQuery(function() {
				var $Body = jQuery("body");
				if (!jQuery("#qunit").length) {
					$Body.prepend("<div id='qunit'></div>");
				}
				if (!jQuery("#qunit-fixture").length) {
					$Body.prepend("<div id='qunit-fixture'></div>");
				}
				$Body.addClass("sapUiBody");
				$Body.addClass("sapUiSizeCozy");
				$Body.attr("role", "application");
			});

			sap.ui.require(aRequires, function() {
				window.QUnit.config.autostart = false;

				if (oTestModule) {

					if (window.blanket) {
						if (oTestModule.coverage && window.blanket) {
							window.blanket.options("sap-ui-cover-only", oTestModule.coverage);
						}

						if (oTestModule.branchCoverage && window.blanket) {
							window.blanket.options("branchTracking", true);
						}

						window.blanket.options("sap-ui-cover-never", "[/qunit/, sap/ui/thirdparty/]");
					}

					document.title = "QUnit tests for module '" + oTestModule.name + "' - " + oConfig.testSetName;

					initTestModule(oTestModule, oConfig).then(function() {
						if (oTestModule.autostart) {
							QUnit.start();
						}
					});

				} else {

					document.title = "Available Unit Tests - " + oConfig.testSetName;

					initOverviewPage(oConfig);

				}

			});

		});

	}

})();
