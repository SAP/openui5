/* global module start test asyncTest expect ok equal deepEqual */


/**
 * Test-Function to be used in place of deepEquals which only tests for the existence of the given
 * values, not the absence of others.
 *
 * @param {object} oValue - The value to be tested
 * @param {object} oExpected - The value that is tested against, containing the structure expected inside oValue
 * @param {string} sMessage - Message prefix for every sub-test. The property names of the structure will be prepended to this string
 * @returns {void}
 */
function deepContains(oValue, oExpected, sMessage) {
	for (var sKey in oExpected) {

		if (Array.isArray(oExpected[sKey]) === Array.isArray(oValue[sKey])) {
			equals(typeof oValue[sKey], typeof oExpected[sKey], sMessage + "/" + sKey + " have same type");
		} else {
			ok(false, sMessage + "/" + sKey + " - one is an array, the other is not");
		}


		if (Array.isArray(oExpected[sKey]) && Array.isArray(oValue[sKey])) {
			equal(oValue[sKey].length, oExpected[sKey].length, sMessage + "/" + sKey + " length matches");
		}

		if (oExpected[sKey] !== null && typeof oExpected[sKey] === "object" && typeof oValue[sKey] === "object") {
			// Go deeper
			deepContains(oValue[sKey], oExpected[sKey], sMessage + "/" + sKey);
		} else {
			// Compare directly
			equal(oValue[sKey], oExpected[sKey], sMessage + "/" + sKey + " match");
		}
	}
}



jQuery.sap.require("sap.ui.model.odata.ODataMetadata");
jQuery.sap.require("sap.ui.model.odata.v2.ODataModel");
jQuery.sap.require("sap.ui.model.odata.v2.ODataAnnotations");


QUnit.config.testTimeout = 6000;

/* eslint-disable no-unused-vars */
function runODataAnnotationsV2Tests() {
/* eslint-enable no-unused-vars */
"use strict";

	var aServices = [{
		name             : "Northwind",
		service          : "fakeService://testdata/odata/northwind/",
		annotations      : "fakeService://testdata/odata/northwind-annotations-normal.xml",
		serviceValid     : true,
		annotationsValid : "all"
	}, {
		name             : "Northwind",
		service          : "fakeService://testdata/odata/northwind/",
		annotations      : "fakeService://testdata/odata/northwind-annotations-malformed.xml",
		serviceValid     : true,
		annotationsValid : "none"
	}, {
		name             : "Northwind",
		service          : "fakeService://testdata/odata/northwind/",
		annotations      : "fakeService://testdata/odata/NOT_EXISTANT",
		serviceValid     : true,
		annotationsValid : "none"
	},{
		name             : "Invalid",
		service          : "fakeService://testdata/odata/NOT_EXISTANT/",
		annotations      : "fakeService://testdata/odata/NOT_EXISTANT",
		serviceValid     : false,
		annotationsValid : "none"
	},{
		name             : "Complex EPM",
		service          : "fakeService://testdata/odata/northwind/",
		annotations      : "fakeService://testdata/odata/epm-annotations-complex.xml",
		serviceValid     : true,
		annotationsValid : "all"
	},{
		name             : "Northwind",
		service          : "fakeService://testdata/odata/northwind/",
		annotations      : "fakeService://testdata/odata/northwind-annotations-normal.xml",
		serviceValid     : true,
		annotationsValid : "all",
		sharedMetadata   : true
	}, {
		name             : "Northwind",
		service          : "fakeService://testdata/odata/northwind/",
		annotations      : "fakeService://testdata/odata/northwind-annotations-malformed.xml",
		serviceValid     : true,
		annotationsValid : "none",
		sharedMetadata   : true
	}, {
		name             : "Northwind",
		service          : "fakeService://testdata/odata/northwind/",
		annotations      : "fakeService://testdata/odata/NOT_EXISTANT",
		serviceValid     : true,
		annotationsValid : "none",
		sharedMetadata   : true
	},{
		name             : "Invalid",
		service          : "fakeService://testdata/odata/NOT_EXISTANT/",
		annotations      : "fakeService://testdata/odata/NOT_EXISTANT",
		serviceValid     : false,
		annotationsValid : "none",
		sharedMetadata   : true
	},{
		name             : "Northwind with annotated metadata",
		service          : "fakeService://testdata/odata/northwind-annotated/",
		annotations      : "fakeService://testdata/odata/northwind-annotated/$metadata",
		serviceValid     : true,
		annotationsValid : "all",
		sharedMetadata   : true
	},{
		name             : "Northwind with annotated metadata + annotations",
		service          : "fakeService://testdata/odata/northwind-annotated/",
		annotations      : [
			"fakeService://testdata/odata/northwind-annotated/$metadata",
			"fakeService://testdata/odata/northwind-annotations-normal.xml"
		],
		serviceValid     : true,
		annotationsValid : "all",
		sharedMetadata   : true
	},{
		name             : "Northwind with annotated metadata + annotations",
		service          : "fakeService://testdata/odata/northwind-annotated/",
		annotations      : [
			"fakeService://testdata/odata/northwind-annotated/$metadata",
			"fakeService://testdata/odata/northwind-annotations-malformed.xml"
		],
		serviceValid     : true,
		annotationsValid : "some",
		sharedMetadata   : true
	}];

	// Additional tests that have extra tests and should thus be referable by name. For this the name
	// of the test is not added as property of the test but as key in the map
	var mAdditionalTestsServices = {
		"Default Annotated Service": {
			service          : "fakeService://testdata/odata/northwind/",
			annotations      : "fakeService://testdata/odata/northwind-annotations-normal.xml",
			serviceValid     : true,
			annotationsValid : "all"
		},
		"Apply Function": {
			service          : "fakeService://testdata/odata/northwind/",
			annotations      : "fakeService://testdata/odata/apply-function-test.xml",
			serviceValid     : true,
			annotationsValid : "all"
		},
		"Multiple Property Annotations": {
			service          : "fakeService://testdata/odata/northwind/",
			annotations      : "fakeService://testdata/odata/multiple-property-annotations.xml",
			serviceValid     : true,
			annotationsValid : "all"
		},
		"Property Annotation Qualifiers": {
			service          : "fakeService://testdata/odata/northwind/",
			annotations      : "fakeService://testdata/odata/property-annotation-qualifiers.xml",
			serviceValid     : true,
			annotationsValid : "all"
		},
		"Other Property Values": {
			service          : "fakeService://testdata/odata/northwind/",
			annotations      : "fakeService://testdata/odata/other-property-values.xml",
			serviceValid     : true,
			annotationsValid : "all"
		},
		"Aliases in Namespaces": {
			service          : "fakeService://testdata/odata/northwind/",
			annotations      : "fakeService://testdata/odata/namespaces-aliases.xml",
			serviceValid     : true,
			annotationsValid : "all"
		},
		"Namespaces in Other Property Values": {
			service          : "fakeService://testdata/odata/northwind/",
			annotations      : "fakeService://testdata/odata/other-property-value-aliases.xml",
			serviceValid     : true,
			annotationsValid : "all"
		},
		"Text Properties" : {
			service          : "fakeService://testdata/odata/northwind/",
			annotations      : "fakeService://testdata/odata/other-property-textproperties.xml",
			serviceValid     : true,
			annotationsValid : "all"
		},
		"Entity Containers": {
			service          : "fakeService://testdata/odata/sapdata01/",
			annotations      : "fakeService://testdata/odata/sapdata01/$metadata",
			serviceValid     : true,
			annotationsValid : "all"
		},
		"Simple Values": {
			service          : "fakeService://testdata/odata/sapdata01/",
			annotations      : "fakeService://testdata/odata/simple-values.xml",
			serviceValid     : true,
			annotationsValid : "all"
		},
		"Collection with Namespace": {
			service          : "fakeService://testdata/odata/sapdata01/",
			annotations      : "fakeService://testdata/odata/collection-with-namespace.xml",
			serviceValid     : true,
			annotationsValid : "all"
		},
		"UrlRef": {
			service          : "fakeService://testdata/odata/sapdata01/",
			annotations      : "fakeService://testdata/odata/UrlRef.xml",
			serviceValid     : true,
			annotationsValid : "all"
		},
		"Delayed Loading": {
			service          : "fakeService://testdata/odata/sapdata01/",
			annotations      : [
				"fakeService://testdata/odata/multiple-annotations-01.xml",
				"fakeService://testdata/odata/multiple-annotations-02.xml",
				"fakeService://testdata/odata/multiple-annotations-03.xml"
			],
			serviceValid     : true,
			annotationsValid : "all"
		},
		"Alias Replacement": {
			service          : "fakeService://testdata/odata/sapdata01/",
			annotations      : "fakeService://testdata/odata/Aliases.xml",
			serviceValid     : true,
			annotationsValid : "all"
		},
		"DynamicExpressions": {
			service          : "fakeService://testdata/odata/sapdata01/",
			annotations      : "fakeService://testdata/odata/DynamicExpressions.xml",
			serviceValid     : true,
			annotationsValid : "all"
		},
		"DynamicExpressions2": {
			service          : "fakeService://testdata/odata/sapdata01/",
			annotations      : "fakeService://testdata/odata/DynamicExpressions2.xml",
			serviceValid     : true,
			annotationsValid : "all"
		},
		"CollectionsWithSimpleValues": {
			service          : "fakeService://testdata/odata/sapdata01/",
			annotations      : "fakeService://testdata/odata/collections-with-simple-values.xml",
			serviceValid     : true,
			annotationsValid : "all"
		},
		"Simple Values 2": {
			service          : "fakeService://testdata/odata/sapdata01/",
			annotations      : "fakeService://testdata/odata/simple-values-2.xml",
			serviceValid     : true,
			annotationsValid : "all"
		},
		"If in Apply": {
			service          : "fakeService://testdata/odata/sapdata01/",
			annotations      : "fakeService://testdata/odata/if-in-apply.xml",
			serviceValid     : true,
			annotationsValid : "all"
		},
		"Other Elements in LabeledElement": {
			service          : "fakeService://testdata/odata/sapdata01/",
			annotations      : "fakeService://testdata/odata/labeledelement-other-values.xml",
			serviceValid     : true,
			annotationsValid : "all"
		},
		"Annotated Metadata": {
			service          : "fakeService://testdata/odata/northwind-annotated/",
			annotations      : null,
			serviceValid     : true,
			annotationsValid : "metadata"
		},
		"Apply in If": {
			service          : "fakeService://testdata/odata/northwind/",
			annotations      : "fakeService://testdata/odata/apply-in-if.xml",
			serviceValid     : true,
			annotationsValid : "all"
		},
		"Joined Loading with automated $metadata parsing": {
			service          : "fakeService://testdata/odata/northwind-annotated/",
			annotations      : [
				"fakeService://testdata/odata/northwind-annotations-normal.xml",
				"fakeService://testdata/odata/multiple-annotations-01.xml",
				"fakeService://testdata/odata/multiple-annotations-02.xml",
				"fakeService://testdata/odata/multiple-annotations-03.xml"
			],
			serviceValid     : true,
			annotationsValid : "all"
		},
		"Empty collection": {
			service          : "fakeService://testdata/odata/northwind/",
			annotations      : "fakeService://testdata/odata/empty-collection.xml",
			serviceValid     : true,
			annotationsValid : "all"
		},
		"Multiple Enums": {
			service          : "fakeService://testdata/odata/northwind/",
			annotations      : "fakeService://testdata/odata/multiple-enums.xml",
			serviceValid     : true,
			annotationsValid : "all"
		},
		"Cached Value Lists": {
			service          : "fakeService://testdata/odata/valuelists/",
			annotations      : null,
			serviceValid     : true,
			annotationsValid : "metadata"
		},
		"Overwrite on Term Level": {
			service          : "fakeService://testdata/odata/valuelists/",
			annotations      : [
				"fakeService://testdata/odata/overwrite-on-term-level-1",
				"fakeService://testdata/odata/overwrite-on-term-level-2"
			],
			serviceValid     : true,
			annotationsValid : "all"
		}

	};

	// Add additional tests to stadard tests as well
	for (var sName in mAdditionalTestsServices) {
		var mTest = mAdditionalTestsServices[sName];
		mTest.name = sName;
		aServices.push(mTest);
	}


	module("Standard Tests for All Annotation Cases")

	var fnTestLoading = function(mService) {
		var oMetadata = new sap.ui.model.odata.ODataMetadata(mService.service + "$metadata", { asnc: true });

		var oAnnotationsLoader = new sap.ui.model.odata.v2.ODataAnnotations(oMetadata, {
			source: mService.annotations
		});
		var pLoaded = oAnnotationsLoader.loaded();

		var iNumAnnotations = 1; // One for $metadata
		if (Array.isArray(mService.annotations)) {
			iNumAnnotations += mService.annotations.length;
		} else if (mService.annotations) {
			iNumAnnotations++;
		}

		var iLoaded = 0;
		oAnnotationsLoader.attachSuccess(function() {
			iLoaded++;
		});
		oAnnotationsLoader.attachError(function() {
			iLoaded++;
		});

		function endTest() {
			oMetadata.destroy();
			oAnnotationsLoader.destroy();
			start();
		}

		pLoaded.then(function(aResults) {
			equal(aResults.length, iNumAnnotations, "The right number of annotations were successfully loaded from sources");
			equal(iLoaded, iNumAnnotations, "The right number of annotations were loaded including $metadata");

			if (mService.annotationsValid === "all") {
				var bNoErrors = (aResults.length === 0) || aResults.reduce(function(bLastResult, oResult) {
					if (!bLastResult) {
						return false;
					} else {
						return !(oResult instanceof Error);
					}
				}, true);
				equal(bNoErrors, true, "No Errors in the results");
			}
			endTest();
		});

		pLoaded.catch(function(aResults) {
			ok(false, "With a valid service at least the metadata should have been parsed for annotations successfully");
			endTest();
		});


	};


	for (var i = 0; i < aServices.length; ++i) {
		if (aServices[i].serviceValid && aServices[i].annotationsValid !== "some") {
			asyncTest("External Annotation Loading - Service Case: " + aServices[i].name, fnTestLoading.bind(undefined, aServices[i]));
		}
	}


	var fnTestEventsAllSome = function(mService, bSkipMetadata) {
		var oMetadata = new sap.ui.model.odata.ODataMetadata(mService.service + "$metadata", { asnc: true });

		var oAnnotationsLoader = new sap.ui.model.odata.v2.ODataAnnotations(oMetadata, {
			skipMetadata: bSkipMetadata,
			source: mService.annotations
		});
		var pLoaded = oAnnotationsLoader.loaded();

		var iAnnotations = bSkipMetadata ? 0 : 1;
		if (Array.isArray(mService.annotations)) {
			iAnnotations += mService.annotations.length;
		} else if (typeof mService.annotations === "string") {
			iAnnotations += 1;
		}

		var fnCountErrors = function(aArray) {
			return aArray.reduce(function(iErrors, oEntry) {
				if (oEntry instanceof Error) {
					return iErrors + 1;
				} else {
					return iErrors;
				}
			}, 0);
		};

		var iSuccesses = 0;
		oAnnotationsLoader.attachSuccess(function(oEvent) {
			var mResult = oEvent.getParameter("result");
			iSuccesses++;
		});

		var iErrors = 0;
		oAnnotationsLoader.attachError(function(oEvent) {
			var oError = oEvent.getParameter("result");
			iErrors++;
		});


		var bSomeLoadedFired = false;
		oAnnotationsLoader.attachSomeLoaded(function(oEvent) {
			var DEBUGservice = mService;

			bSomeLoadedFired = true;
			var aResults = oEvent.getParameter("result");
			ok(Array.isArray(aResults), "Result parameter contained an array of results");
			equals(aResults.length, iAnnotations, "The correct number of Annotations was loaded");

			var iErrorsInResults = fnCountErrors(aResults);
			ok(iErrorsInResults < iAnnotations, "The failed event parameter \"result\" should NOT contain ONLY Error objects");

			equals(iErrorsInResults, iErrors, "The number of Errors in the Results is the same as the number of error-events that occurred")
			equals(aResults.length - iErrorsInResults, iSuccesses, "The number of successfully parsed entries in the Results is the same as the number of success-events that occurred")
		});

		var bAllFailedFired = false;
		oAnnotationsLoader.attachAllFailed(function(oEvent) {
			var DEBUGservice = mService;

			bAllFailedFired = true;
			var aErrors = oEvent.getParameter("result");

			ok(Array.isArray(aErrors), "Result parameter contained an array of errors");
			equals(aErrors.length, iAnnotations, "The correct number of Annotations failed");

			var iErrorsInResults = fnCountErrors(aErrors);
			equals(iErrorsInResults, iAnnotations, "The failed event parameter \"result\" should contain only Error objects");

			equals(iErrorsInResults, iErrors, "The number of Errors in the Results is the same as the number of error-events that occurred")
			equals(iSuccesses, 0, "No success events should have been fired")
		});


		var fnEndTest = function() {
			oMetadata.destroy();
			oAnnotationsLoader.destroy();
			start()
		};

		pLoaded.then(function() {
			equals(bSomeLoadedFired, true, "Loaded event should have been fired");
			equals(bAllFailedFired, false, "Failed event should NOT have been fired");
			fnEndTest();
		}).catch(function() {
			equals(bSomeLoadedFired, false, "Loaded event should NOT have been fired");
			equals(bAllFailedFired, true, "Failed event should have been fired");
			fnEndTest();
		});
	};


	for (var i = 0; i < aServices.length; ++i) {
		if (aServices[i].serviceValid) {
			// Test all valid services - parse metadata for annotations
			asyncTest("Event (All/Some) Parameter Checks with Metadata - Service Case: " + aServices[i].name, fnTestEventsAllSome.bind(undefined, aServices[i], false));
		}
		if (aServices[i].serviceValid && aServices[i].annotations) {
			// Test all valid services - DO NOT parse metadata for annotations
			asyncTest("Event (All/Some) Parameter Checks without Metadata - Service Case: " + aServices[i].name, fnTestEventsAllSome.bind(undefined, aServices[i], true));
		}
	}



	var fnTestEvents = function(mService, bSkipMetadata) {
		var oMetadata = new sap.ui.model.odata.ODataMetadata(mService.service + "$metadata", { asnc: true });

		var oAnnotationsLoader = new sap.ui.model.odata.v2.ODataAnnotations(oMetadata, {
			skipMetadata: bSkipMetadata,
			source: mService.annotations
		});
		var pLoaded = oAnnotationsLoader.loaded();

		var iAnnotations = bSkipMetadata ? 0 : 1;
		if (Array.isArray(mService.annotations)) {
			iAnnotations += mService.annotations.length;
		} else if (typeof mService.annotations === "string") {
			iAnnotations += 1;
		}

		var fnCountErrors = function(aArray) {
			return aArray.reduce(function(iErrors, oEntry) {
				if (oEntry instanceof Error) {
					return iErrors + 1;
				} else {
					return iErrors;
				}
			}, 0);
		};

		var iSuccesses = 0;
		oAnnotationsLoader.attachSuccess(function(oEvent) {
			var mResult = oEvent.getParameter("result");
			iSuccesses++;
		});

		var iErrors = 0;
		oAnnotationsLoader.attachError(function(oEvent) {
			var oError = oEvent.getParameter("result");
			iErrors++;
		});


		var bLoadedFired = false;
		oAnnotationsLoader.attachLoaded(function(oEvent) {
			var DEBUGservice = mService;

			bLoadedFired = true;
			var aResults = oEvent.getParameter("result");
			ok(Array.isArray(aResults), "Result parameter contained an array of results");
			equals(aResults.length, iAnnotations, "The correct number of Annotations was loaded");

			var iErrorsInResults = fnCountErrors(aResults);
			equals(iErrorsInResults, 0, "The failed event parameter \"result\" should NOT contain ANY Error objects");

			equals(iErrorsInResults, iErrors, "The number of Errors in the Results is the same as the number of error-events that occurred")
			equals(aResults.length, iSuccesses, "The number of successfully parsed entries in the Results is the same as the number of success-events that occurred")
		});

		var bFailedFired = false;
		oAnnotationsLoader.attachFailed(function(oEvent) {
			var DEBUGservice = mService;

			bFailedFired = true;
			var aResults = oEvent.getParameter("result");

			ok(Array.isArray(aResults), "Result parameter contained an array of errors");
			equals(aResults.length, iAnnotations, "The correct number of Annotations failed");

			var iErrorsInResults = fnCountErrors(aResults);
			ok(iErrorsInResults > 0, "The failed event parameter \"result\" should contain at least one Error object");

			equals(iErrorsInResults, iErrors, "The number of Errors in the Results is the same as the number of error-events that occurred")
			equals(iSuccesses, aResults.length - iErrorsInResults, "No success events should have been fired")
		});


		var fnEndTest = function() {
			oMetadata.destroy();
			oAnnotationsLoader.destroy();
			start()
		};

		pLoaded.catch(function() {}).then(function() {
			ok(bLoadedFired !== bFailedFired, "Either loaded or failed shoud have been fired but not both");
			fnEndTest();
		});
	};

	for (var i = 0; i < aServices.length; ++i) {
		if (aServices[i].serviceValid) {
			// Test all valid services - parse metadata for annotations
			asyncTest("Event Parameter Checks with Metadata - Service Case: " + aServices[i].name, fnTestEvents.bind(undefined, aServices[i], false));
		}
		if (aServices[i].serviceValid && aServices[i].annotations) {
			// Test all valid services - DO NOT parse metadata for annotations
			asyncTest("Event Parameter Checks without Metadata - Service Case: " + aServices[i].name, fnTestEvents.bind(undefined, aServices[i], true));
		}
	}


	module("v2.ODataModel Integration Test")

	var fnTestModelLoading = function(mService) {
		// sap.ui.model.odata.v2.ODataModel.mServiceData = {};
		var oModel = new sap.ui.model.odata.v2.ODataModel(mService.service, {
			annotationURI: mService.annotations,
			/* default: loadAnnotationsJoined: true, */
			skipMetadataAnnotationParsing: true
		});

		function endTest() {
			oModel.destroy();
			start();
		}

		var bAnnotationsLoaded = false;
		var bMetadataLoaded = false;

		oModel.attachAnnotationsLoaded(function() {
			bAnnotationsLoaded = true;
			ok(mService.serviceValid, "Service annotations loaded");
			notEqual(mService.annotationsValid, "none", "Service annotations loaded");
		});

		oModel.attachMetadataLoaded(function() {
			bMetadataLoaded = true;
			ok(mService.serviceValid, "Service metadata loaded");

			if (mService.annotationsValid === "none") {
				equal(bAnnotationsLoaded, false, "No Annotations loaded")
			} else if (mService.annotationsValid === "metadata") {
				equal(bAnnotationsLoaded, false, "No Annotations loaded")
			} else {
				equal(bAnnotationsLoaded, true, "Annotations loaded")
			}

			endTest();
		});

		oModel.attachMetadataFailed(function() {
			ok(!mService.serviceValid || mService.annotationsValid === "none", "Service metadata or annotations failed");
			endTest();
		});

	};

	for (var i = 0; i < aServices.length; ++i) {
		if (aServices[i].serviceValid && aServices[i].annotations) {
			// FIXME: test doesn't work in headless PhantomJS test cycle => commented out!
			//  ==> PhantomJS doesn't fail when loading malformed XML!
			if (!sap.ui.Device.browser.phantomJS || (aServices[i].serviceValid && aServices[i].annotationsValid !== "none")) {
				asyncTest("Annotations - Service Case: " + aServices[i].name, fnTestModelLoading.bind(undefined, aServices[i]));
			}
		}
	}



	var fnTestModelMetadataLoading = function(mService) {
		// sap.ui.model.odata.v2.ODataModel.mServiceData = {};
		var oModel = new sap.ui.model.odata.v2.ODataModel(mService.service, {
			annotationURI: mService.annotations,
			skipMetadataAnnotationParsing: false
		});

		function endTest() {
			oModel.destroy();
			start();
		}

		var bAnnotationsLoaded = false;
		var bMetadataLoaded = false;

		oModel.attachAnnotationsLoaded(function() {
			bAnnotationsLoaded = true;
			ok(mService.serviceValid, "Service annotations loaded");
		});

		oModel.attachMetadataLoaded(function() {
			bMetadataLoaded = true;
			ok(mService.serviceValid, "Service metadata failed");
			equal(bAnnotationsLoaded, true, "Annotations loaded")

			endTest();
		});

		oModel.attachMetadataFailed(function() {
			ok(!mService.serviceValid, "Service metadata failed");
			endTest();
		});

	};

	for (var i = 0; i < aServices.length; ++i) {
		if (aServices[i].serviceValid) {
			asyncTest("Annotations and metadata - Service Case: " + aServices[i].name, fnTestModelMetadataLoading.bind(undefined, aServices[i]));
		}
	}


	module("Annotation Test Cases for Bugfixes and Specification Changes")





}
