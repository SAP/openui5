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

function fnCreateModel(iModelVersion, sServiceUrl, aAnnotationUrls, mMetadataUrlParams) {
	var oModel;
	if (iModelVersion == 1) {
		oModel = new sap.ui.model.odata.ODataModel(sServiceUrl, {
			annotationURI : aAnnotationUrls,
			loadMetadataAsync: true,
			metadataUrlParams: mMetadataUrlParams
		});
	} else if (iModelVersion == 2) {
		oModel = new sap.ui.model.odata.v2.ODataModel(sServiceUrl, {
			annotationURI : aAnnotationUrls,
			metadataUrlParams: mMetadataUrlParams
		});
	} else {
		ok(false, "Unknown ODataModel version requested for test: " + iModelVersion);
	}
	return oModel;
}


jQuery.sap.require("sap.ui.model.odata.ODataModel");
function cleanOdataCache() {
	sap.ui.model.odata.ODataModel.mServiceData = {};
	sap.ui.model.odata.v2.ODataModel.mServiceData = {};
}

QUnit.config.testTimeout = 6000;

/* eslint-disable no-unused-vars */
function runODataAnnotationTests() {
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
		annotationsValid : "some",
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
		"Test 2014-12-08": {
			service          : "fakeService://testdata/odata/northwind/",
			annotations      : "fakeService://testdata/odata/2014-12-08-test.xml",
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
		}
	};


	// Add additional tests to stadard tests as well
	for (var sName in mAdditionalTestsServices) {
		var mTest = mAdditionalTestsServices[sName];
		mTest.name = sName;
		aServices.push(mTest);
	}

	var 
		sTestName, sServiceURI, mModelOptions, bServiceValid, bAnnotationsValid, sAnnotationsValid, bSharedMetadata,
		sTestType, fnTest, mService, oAnnotations, i;

	sap.ui.test.qunit.delayTestStart();

	module("Synchronous loading");

	fnTest = function(sServiceURI, mModelOptions, bServiceValid, sAnnotationsValid, bSharedMetadata) {
		return function() {
			if (!bSharedMetadata){
				cleanOdataCache();
			}
			var oModel = new sap.ui.model.odata.ODataModel(sServiceURI, mModelOptions);
			// Since this is synchronous, everything should be ready right now.

			var oMetadata = oModel.getServiceMetadata();
			var oAnnotations = oModel.getServiceAnnotations();

			if (bServiceValid) {
				if (sAnnotationsValid === "all" || sAnnotationsValid === "some") {
					// This should have worked.
					ok(oMetadata, "Metadata is available.");
					ok(Object.keys(oAnnotations).length > 0, "Annotations are available.");
				} else {
					// Service Metadata should be there, annotations should not be loaded
					ok(oMetadata, "Metadata is available.");
					ok(!oAnnotations || Object.keys(oAnnotations).length === 0, "Annotations are not available.");
				}
			} else {
				// Service is invalid, so both should not be there
				ok(!oMetadata, "Metadata is not available.");
				ok(!oAnnotations || Object.keys(oAnnotations).length === 0, "Metadata is not available.");
			}
		};
	};

	for (i = 0; i < aServices.length; ++i) {
		sServiceURI = aServices[i].service;
		mModelOptions = {
			annotationURI : aServices[i].annotations,
			json : true
		};
		bServiceValid     = aServices[i].serviceValid;
		sAnnotationsValid = aServices[i].annotationsValid;
		bAnnotationsValid = sAnnotationsValid === "all" || sAnnotationsValid === "some";
		bSharedMetadata = aServices[i].sharedMetadata;
		sTestName = aServices[i].name ? aServices[i].name : "";

		sTestType = 
			sTestName + " (" + 
			(bServiceValid ? "Valid Service" : "Broken Service") + "/" + 
			(bAnnotationsValid ? "Valid Annotations (" + sAnnotationsValid + ")" : "Broken Annotations") +
			(bSharedMetadata ?  "/Shared Metadata" : "") + 
			")";

		// Check synchronous loading
		mModelOptions.loadAnnotationsJoined = false;
		mModelOptions.loadMetadataAsync = false;
		mModelOptions.skipMetadataAnnotationParsing = true;

		// FIXME: test doesn't work in headless PhantomJS test cycle => commented out!
		//  ==> PhantomJS doesn't fail when loading malformed XML!
		if (!sap.ui.Device.browser.phantomJS || (bServiceValid && bAnnotationsValid)) {
			test(sTestType, fnTest(sServiceURI, mModelOptions, bServiceValid, sAnnotationsValid));
		}
	}

	module("Asynchronous loading");

	fnTest = function(sServiceURI, mModelOptions, bServiceValid, sAnnotationsValid, bSharedMetadata) {
		return function() {
			if (!bSharedMetadata){
				cleanOdataCache();
			}
			var oModel = new sap.ui.model.odata.ODataModel(sServiceURI, mModelOptions);

			var bMetadataLoaded = false;
			var bAnnotationsLoaded = false;

			var fnOnLoaded = function(sWhat) {

				switch (sWhat) {

					case "Metadata":
						ok(bMetadataLoaded, "Metadata loaded successfully");
						jQuery.sap.log.debug("check for metadata");
					break;

					case "Annotations":
						ok(bAnnotationsLoaded, "Annotations loaded successfully");
					break;

					case "Both":
						ok(bMetadataLoaded && bAnnotationsLoaded, "Check: Annotations and Metadata loaded");
						jQuery.sap.log.debug("check for both");
						start();
					break;

					case "MetadataFailed": 
						// Nothing should be loaded
						ok(!bServiceValid && !bAnnotationsLoaded, "Check: Invalid Service - Annotations and Metadata NOT loaded");
						jQuery.sap.log.debug("check for none");
						start();
					break;

					case "AnnotationsFailed":
						// Metadata should be loaded, but no annotations
						if (sAnnotationsValid === "none") {
						ok(bMetadataLoaded && !bAnnotationsLoaded, "Check: Invalid Annotations - Only Metadata loaded");
						} else {
							ok(bMetadataLoaded, "Check: Invalid Annotations - Metadata loaded");
						}
						jQuery.sap.log.debug("check for no annotations");
						oModel.destroy();
						start();
					break;

					default:
						throw "This is unexpected and should never happen...";

				}
			};

			/* eslint-disable new-cap */
			var metadataDfd = jQuery.Deferred();
			var annotationsDfd = jQuery.Deferred();
			/* eslint-enable new-cap */

			// Metadata must be loaded before annotations
			oModel.attachMetadataLoaded(function() {
				bMetadataLoaded = true;
				jQuery.sap.log.debug("metadata loaded is fired");
				fnOnLoaded("Metadata");
				metadataDfd.resolve();
			});

			oModel.attachAnnotationsLoaded(function() {
				bAnnotationsLoaded = true;
				jQuery.sap.log.debug("annotations loaded is fired");
				fnOnLoaded("Annotations");
				annotationsDfd.resolve();
			});

			oModel.attachMetadataFailed(function() {
				jQuery.sap.log.debug("metadata failed is fired");
				metadataDfd.reject();
			});

			if (bServiceValid && (sAnnotationsValid === "some" || sAnnotationsValid === "all")) {
				jQuery.when(metadataDfd, annotationsDfd).done(function(e){
						jQuery.sap.log.debug("both promises fulfilled");
						fnOnLoaded("Both");
					}).fail(function(e){
						jQuery.sap.log.debug("metadata promise failed");
						ok(false, 'Metadata promise rejected');
					}); 
			} else if (bServiceValid && (sAnnotationsValid === "none" || sAnnotationsValid === "metadata")){
				jQuery.when(metadataDfd).done(function(e){
					jQuery.sap.log.debug("metadata promise fulfilled");
					//make sure annotations really don't load an we're not just too quick
					window.setTimeout(function() {
						fnOnLoaded("AnnotationsFailed");
					}, 50);
				});
			} else if (!bServiceValid){
				jQuery.when(metadataDfd).fail(function(e){
					jQuery.sap.log.debug("metadata failed fulfilled");
					fnOnLoaded("MetadataFailed");
				});
			}
		};
	};

	for (i = 0; i < aServices.length; ++i) {

		mService = 	aServices[i];

		sServiceURI = mService.service;
		mModelOptions = {
			annotationURI : mService.annotations,
			json : true
		};
		bServiceValid     = mService.serviceValid;
		sAnnotationsValid = aServices[i].annotationsValid;
		bAnnotationsValid = sAnnotationsValid === "all" || sAnnotationsValid === "some";
		bSharedMetadata = mService.sharedMetadata;
		sTestName = aServices[i].name ? aServices[i].name : "";

		// Check asynchronous loading
		mModelOptions.loadAnnotationsJoined = false;
		mModelOptions.loadMetadataAsync = true;
		mModelOptions.skipMetadataAnnotationParsing = true;

		sTestType = 
			sTestName + " (" + 
			(bServiceValid ? "Valid Service" : "Broken Service") + "/" + 
			(bAnnotationsValid ? "Valid Annotations (" + sAnnotationsValid + ")" : "Broken Annotations") +
			(bSharedMetadata ?  "/Shared Metadata" : "") + 
			")";

		jQuery.sap.log.debug("testtype: " + sTestType);

		// FIXME: test doesn't work in headless PhantomJS test cycle => commented out!
		//  ==> PhantomJS doesn't fail when loading malformed XML!
		if (!sap.ui.Device.browser.phantomJS || (bServiceValid && bAnnotationsValid)) {
			asyncTest(
				"Asynchronous loading - " + sTestType,
				fnTest(sServiceURI, mModelOptions, bServiceValid, sAnnotationsValid)
			);
		}
	}

	module("V2: Asynchronous loading");

	fnTest = function(sServiceURI, mModelOptions, bServiceValid, sAnnotationsValid, bSharedMetadata) {
		return function() {
			if (!bSharedMetadata){
				sap.ui.model.odata.v2.ODataModel.mServiceData = {};
			}
			var oModel = new sap.ui.model.odata.v2.ODataModel(sServiceURI, mModelOptions);

			var bMetadataLoaded = false;
			var bAnnotationsLoaded = false;

			var fnOnLoaded = function(sWhat) {

				switch (sWhat) {

					case "Metadata":
						ok(bMetadataLoaded, "Metadata loaded successfully");
						jQuery.sap.log.debug("check for metadata");
					break;

					case "Annotations":
						ok(bAnnotationsLoaded, "Annotations loaded successfully");
					break;

					case "Both":
						ok(bMetadataLoaded && bAnnotationsLoaded, "Check: Annotations and Metadata loaded");
						jQuery.sap.log.debug("check for both");
						start();
					break;

					case "MetadataFailed": 
						// Nothing should be loaded
						ok(!bServiceValid && !bAnnotationsLoaded, "Check: Invalid Service - Annotations and Metadata NOT loaded");
						jQuery.sap.log.debug("check for none");
						start();
					break;

					case "AnnotationsFailed":
						// Metadata should be loaded, but no annotations
						if (sAnnotationsValid === "none") {
						ok(bMetadataLoaded && !bAnnotationsLoaded, "Check: Invalid Annotations - Only Metadata loaded");
						} else {
							ok(bMetadataLoaded, "Check: Invalid Annotations - Metadata loaded");
						}
						jQuery.sap.log.debug("check for no annotations");
						oModel.destroy();
						start();
					break;

					default:
						throw "This is unexpected and should never happen...";

				}
			};

			/* eslint-disable new-cap */
			var metadataDfd = jQuery.Deferred();
			var annotationsDfd = jQuery.Deferred();
			/* eslint-enable new-cap */

			// Metadata must be loaded before annotations
			oModel.attachMetadataLoaded(function() {
				bMetadataLoaded = true;
				jQuery.sap.log.debug("metadata loaded is fired");
				fnOnLoaded("Metadata");
				metadataDfd.resolve();
			});

			oModel.attachAnnotationsLoaded(function() {
				bAnnotationsLoaded = true;
				jQuery.sap.log.debug("annotations loaded is fired");
				fnOnLoaded("Annotations");
				annotationsDfd.resolve();
			});

			oModel.attachMetadataFailed(function() {
				jQuery.sap.log.debug("metadata failed is fired");
				metadataDfd.reject();
			});

			if (bServiceValid && (sAnnotationsValid === "some" || sAnnotationsValid === "all")) {
				jQuery.when(metadataDfd, annotationsDfd).done(function(e){
						jQuery.sap.log.debug("both promises fulfilled");
						fnOnLoaded("Both");
					}).fail(function(e){
						jQuery.sap.log.debug("metadata promise failed");
						ok(false, 'Metadata promise rejected');
					});
			} else if (bServiceValid && (sAnnotationsValid === "none" || sAnnotationsValid === "metadata")){
				jQuery.when(metadataDfd).done(function(e){
					jQuery.sap.log.debug("metadata promise fulfilled");
					//make sure annotations really don't load an we're not just too quick
					window.setTimeout(function() {
						fnOnLoaded("AnnotationsFailed");
					}, 50);
				});
			} else if (!bServiceValid){
				jQuery.when(metadataDfd).fail(function(e){
					jQuery.sap.log.debug("metadata failed fulfilled");
					fnOnLoaded("MetadataFailed");
				});
			}
		};
	};

	for (i = 0; i < aServices.length; ++i) {

		mService = 	aServices[i];

		sServiceURI = mService.service;
		mModelOptions = {
			annotationURI : mService.annotations,
			skipMetadataAnnotationParsing: true,
			json : true
		};
		bServiceValid     = mService.serviceValid;
		sAnnotationsValid = aServices[i].annotationsValid;
		bAnnotationsValid = sAnnotationsValid === "all" || sAnnotationsValid === "some";
		bSharedMetadata = mService.sharedMetadata;
		sTestName = aServices[i].name ? aServices[i].name : "";

		// Check asynchronous loading
		mModelOptions.loadAnnotationsJoined = false;
		mModelOptions.loadMetadataAsync = true;

		sTestType =
			sTestName + " (" +
			(bServiceValid ? "Valid Service" : "Broken Service") + "/" +
			(bAnnotationsValid ? "Valid Annotations (" + sAnnotationsValid + ")" : "Broken Annotations") +
			(bSharedMetadata ?  "/Shared Metadata" : "") +
			")";

		jQuery.sap.log.debug("testtype: " + sTestType);

		// FIXME: test doesn't work in headless PhantomJS test cycle => commented out!
		//  ==> PhantomJS doesn't fail when loading malformed XML!
		if (!sap.ui.Device.browser.phantomJS || (bServiceValid && bAnnotationsValid)) {
			asyncTest(
				"Asynchronous loading - " + sTestType,
				fnTest(sServiceURI, mModelOptions, bServiceValid, sAnnotationsValid)
			);
		}
	}


	module("Asynchronous loading (joined events)");

	fnTest = function(sServiceURI, mModelOptions, bServiceValid, sAnnotationsValid, bSharedMetadata) {
		return function() {
			if (!bSharedMetadata){
				cleanOdataCache();
			}
			var oModel = new sap.ui.model.odata.ODataModel(sServiceURI, mModelOptions);
			var that = this;
			var bMetadataLoaded = false;
			var bAnnotationsLoaded = false;
			var bInternalMetadataLoaded = false;

			var fnOnLoaded = function(sWhat) {

				switch (sWhat) {

					case "InternalMetadata":
						// ok(!bAnnotationsLoaded, "Internal metadata loaded before annotations");
					break;

					case "Metadata":
						ok(bMetadataLoaded, "Metadata loaded successfully");
						ok(bAnnotationsLoaded, "Metadata loaded after annotations");
					break;

					case "Both":
						ok(bMetadataLoaded && bAnnotationsLoaded, "Check: Annotations and Metadata loaded");
						jQuery.sap.log.debug("check for both");
						start();
					break;

					case "MetadataFailed": 
						// Nothing should be loaded
						ok(!bInternalMetadataLoaded && !bAnnotationsLoaded, "Check: Invalid Service - Annotations and Metadata NOT loaded");
						jQuery.sap.log.debug("check for none");
						start();
					break;

					case "AnnotationsFailed":
						if (sAnnotationsValid === "none") {
							ok(bInternalMetadataLoaded && !bAnnotationsLoaded, "Check: Invalid Annotations - Only Metadata loaded");
						} else {
							ok(bInternalMetadataLoaded, "Check: Invalid Annotations - Metadata loaded");
						}
						// Metadata should be loaded, but no annotations
						jQuery.sap.log.debug("check for no annotations");
						oModel.destroy();
						start();
					break;

					default:
						throw "This is unexpected and should never happen...";
				} 

			};

			/* eslint-disable new-cap */
			var metadataDfd = jQuery.Deferred();
			var internalMetadataDfd = jQuery.Deferred();
			/* eslint-enable new-cap */

			// Use internal metadata loaded event, because in case of joined loading, the real one
			// does not fire until Annotations are there
			if (oModel.oMetadata.getServiceMetadata()){
				bInternalMetadataLoaded = true;
				fnOnLoaded("InternalMetadata");
				internalMetadataDfd.resolve();
			} else {
				oModel.oMetadata.attachLoaded(function() {
					bInternalMetadataLoaded = true;
					fnOnLoaded("InternalMetadata");
					internalMetadataDfd.resolve();
				});
			}
			// Metadata must be loaded before annotations
			oModel.attachMetadataLoaded(function() {
				bMetadataLoaded = true;
				if (oModel.bLoadMetadataAsync && oModel.bLoadAnnotationsJoined){
					// Metadata loaded event is only fired after both metadata and annotations have been loaded successfully, so we can also set bAnnotationsloaded to true
					bAnnotationsLoaded = true;
				}
				fnOnLoaded("Metadata");
				metadataDfd.resolve();
			});

			oModel.attachMetadataFailed(function() {
				metadataDfd.reject();
			});
			oModel.attachAnnotationsLoaded(function() {
				bAnnotationsLoaded = true;
			});

			if (bServiceValid && (sAnnotationsValid === "some" || sAnnotationsValid === "all" || sAnnotationsValid === "metadata")){
				jQuery.when(metadataDfd).done(function(e){
					jQuery.sap.log.debug("metadata promise fulfilled");
					fnOnLoaded("Both");
				}).fail(function(e){
				jQuery.sap.log.debug("metadata promise failed");
				ok(false, 'Metadata promise rejected');
			});
		} else if (bServiceValid && sAnnotationsValid === "none"){
				//internal metadata needs to be sucessful prior to the failed annotations
				jQuery.when(internalMetadataDfd).done(function(){
					jQuery.sap.log.debug("metadata promise rejected");
					oModel.attachAnnotationsFailed(function(){fnOnLoaded("AnnotationsFailed");}, that);
				});
			} else if (!bServiceValid){
				jQuery.when(metadataDfd).fail(function(e){
					jQuery.sap.log.debug("metadata failed fulfilled");
					fnOnLoaded("MetadataFailed");
				});
			}
		};
	};

	for (i = 0; i < aServices.length; ++i) {
		mService = 	aServices[i];

		sServiceURI = mService.service;
		mModelOptions = {
			annotationURI : mService.annotations,
			json : true
		};
		bServiceValid     = mService.serviceValid;
		sAnnotationsValid = aServices[i].annotationsValid;
		bAnnotationsValid = sAnnotationsValid === "all" || sAnnotationsValid === "some";
		bSharedMetadata = mService.sharedMetadata;
		sTestName = aServices[i].name ? aServices[i].name : "";
	
		// Check asynchronous loading
		mModelOptions.loadAnnotationsJoined = true;
		mModelOptions.loadMetadataAsync = true;
		mModelOptions.skipMetadataAnnotationParsing = true;

		sTestType = 
			sTestName + " (" +
			(bServiceValid ? "Valid Service" : "Broken Service") + "/" +
			(bAnnotationsValid ? "Valid Annotations (" + sAnnotationsValid + ")" : "Broken Annotations") +
			(bSharedMetadata ?  "/Shared Metadata" : "") +
			")";

		// FIXME: test doesn't work in headless PhantomJS test cycle => commented out!
		//  ==> PhantomJS doesn't fail when loading malformed XML!
		if (!sap.ui.Device.browser.phantomJS || (bServiceValid && bAnnotationsValid)) {
			asyncTest(
				"Asynchronous loading (joined events) - " + sTestType,
				fnTest(sServiceURI, mModelOptions, bServiceValid, sAnnotationsValid)
			);
		}
	}


	module("V2: Asynchronous loading (joined events)");

	fnTest = function(sServiceURI, mModelOptions, bServiceValid, sAnnotationsValid, bSharedMetadata) {
		return function() {
			if (!bSharedMetadata){
				sap.ui.model.odata.v2.ODataModel.mServiceData = {};
			}
			var oModel = new sap.ui.model.odata.v2.ODataModel(sServiceURI, mModelOptions);
			var that = this;
			var bMetadataLoaded = false;
			var bAnnotationsLoaded = false;
			var bInternalMetadataLoaded = false;

			var fnOnLoaded = function(sWhat) {

				switch (sWhat) {

					case "InternalMetadata":
					//	ok(!bAnnotationsLoaded, "Internal metadata loaded before annotations");
					break;

					case "Metadata":
						ok(bMetadataLoaded, "Metadata loaded successfully");
						ok(bAnnotationsLoaded, "Metadata loaded after annotations");
					break;

					case "Both":
						ok(bMetadataLoaded && bAnnotationsLoaded, "Check: Annotations and Metadata loaded");
						jQuery.sap.log.debug("check for both");
						start();
					break;

					case "MetadataFailed": 
						// Nothing should be loaded
						ok(!bInternalMetadataLoaded && !bAnnotationsLoaded, "Check: Invalid Service - Annotations and Metadata NOT loaded");
						jQuery.sap.log.debug("check for none");
						start();
					break;

					case "AnnotationsFailed":
						if (sAnnotationsValid === "none") {
						ok(bInternalMetadataLoaded && !bAnnotationsLoaded, "Check: Invalid Annotations - Only Metadata loaded");
						} else {
							ok(bInternalMetadataLoaded, "Check: Invalid Annotations - Metadata loaded");
						}
						// Metadata should be loaded, but no annotations
						jQuery.sap.log.debug("check for no annotations");
						oModel.destroy();
						start();
					break;

					default:
						throw "This is unexpected and should never happen...";
				} 

			};

			/* eslint-disable new-cap */
			var metadataDfd = jQuery.Deferred();
			var internalMetadataDfd = jQuery.Deferred();
			/* eslint-enable new-cap */

			// Use internal metadata loaded event, because in case of joined loading, the real one
			// does not fire until Annotations are there
			if (oModel.oMetadata.getServiceMetadata()){
				bInternalMetadataLoaded = true;
				fnOnLoaded("InternalMetadata");
				internalMetadataDfd.resolve();
			} else {
				oModel.oMetadata.attachLoaded(function() {
					bInternalMetadataLoaded = true;
					fnOnLoaded("InternalMetadata");
					internalMetadataDfd.resolve();
				});
			}
			// Metadata must be loaded before annotations
			oModel.attachMetadataLoaded(function() {
				bMetadataLoaded = true;
				if (oModel.bLoadMetadataAsync && oModel.bLoadAnnotationsJoined){
					// Metadata loaded event is only fired after both metadata and annotations have been loaded successfully, so we can also set bAnnotationsloaded to true
					bAnnotationsLoaded = true;
				}
				fnOnLoaded("Metadata");
				metadataDfd.resolve();
			});

			oModel.attachMetadataFailed(function() {
				metadataDfd.reject();
			});
			oModel.attachAnnotationsLoaded(function() {
				bAnnotationsLoaded = true;
			});

			if (bServiceValid && (sAnnotationsValid === "some" || sAnnotationsValid === "all")){
				jQuery.when(metadataDfd).done(function(e){
					jQuery.sap.log.debug("metadata promise fulfilled");
					fnOnLoaded("Both");
				}).fail(function(e){
				jQuery.sap.log.debug("metadata promise failed");
				ok(false, 'Metadata promise rejected');
			}); 
		} else if (bServiceValid && sAnnotationsValid === "metadata") {
			jQuery.when(internalMetadataDfd).done(function(){
				fnOnLoaded("Both");
			});
		} else if (bServiceValid && sAnnotationsValid === "none"){
				//internal metadata needs to be sucessful prior to the failed annotations
				jQuery.when(internalMetadataDfd).done(function(){
					jQuery.sap.log.debug("metadata promise rejected");
					oModel.attachAnnotationsFailed(function(){fnOnLoaded("AnnotationsFailed");}, that);
				});
			} else if (!bServiceValid){
				jQuery.when(metadataDfd).fail(function(e){
					jQuery.sap.log.debug("metadata failed fulfilled");
					fnOnLoaded("MetadataFailed");
				});
			}
		};
	};

	for (i = 0; i < aServices.length; ++i) {
		mService = 	aServices[i];

		sServiceURI = mService.service;
		mModelOptions = {
			annotationURI : mService.annotations,
			skipMetadataAnnotationParsing: true,
			json : true
		};
		bServiceValid     = mService.serviceValid;
		sAnnotationsValid = aServices[i].annotationsValid;
		bAnnotationsValid = sAnnotationsValid === "all" || sAnnotationsValid === "some";
		bSharedMetadata = mService.sharedMetadata;
		sTestName = aServices[i].name ? aServices[i].name : "";
	
		// Check asynchronous loading
		mModelOptions.loadAnnotationsJoined = true;
		mModelOptions.loadMetadataAsync = true;


		sTestType = 
			sTestName + " (" +
			(bServiceValid ? "Valid Service" : "Broken Service") + "/" +
			(bAnnotationsValid ? "Valid Annotations (" + sAnnotationsValid + ")" : "Broken Annotations") +
			(bSharedMetadata ?  "/Shared Metadata" : "") +
			")";

		// FIXME: test doesn't work in headless PhantomJS test cycle => commented out!
		//  ==> PhantomJS doesn't fail when loading malformed XML!
		if (!sap.ui.Device.browser.phantomJS || (bServiceValid && bAnnotationsValid)) {
			asyncTest(
				"Asynchronous loading (joined events) - " + sTestType,
				fnTest(sServiceURI, mModelOptions, bServiceValid, sAnnotationsValid)
			);
		}
	}


	module("V1 only: Synchronous loading and MetaModel");
	
	var fnTestSynchronousLoading = function(mTest) {
		expect(5);
		var oModel = new sap.ui.model.odata.ODataModel(mTest.service, {
			annotationURI : mTest.annotations,
			skipMetadataAnnotationParsing: false,
			loadMetadataAsync: false
		});
		
		
		// Everything should be ready right now due to synchronous operation mode
		var oMetadata = oModel.getServiceMetadata();
		var oAnnotations = oModel.getServiceAnnotations();
		var oMetaModel = oModel.getMetaModel();
		
		ok(!!oMetadata, "Metadata is available.");
		ok(!!oAnnotations, "Annotations are available.");
		ok(!!oMetaModel, "MetaModel is available.");
		
		ok(oMetaModel.getProperty("/"), "Metamodel can be used");
		ok(oMetaModel.getODataEntityContainer(), "Metamodel can be used");
		
		oModel.destroy();
	};

	
	
	for (i = 0; i < aServices.length; ++i) {
		if (!aServices[i].serviceValid) {
			// Only test valid services
			continue;
		}
		
		
		sServiceURI = aServices[i].service;
		mModelOptions = {
			annotationURI : aServices[i].annotations,
			json : true
		};
		sAnnotationsValid = aServices[i].annotationsValid;
		bAnnotationsValid = sAnnotationsValid === "all" || sAnnotationsValid === "some";
		sTestName = aServices[i].name ? aServices[i].name : "";

		sTestType = 
			sTestName + " (" + 
			(bAnnotationsValid ? "Valid Annotations (" + sAnnotationsValid + ")" : "Broken Annotations") +
			(bSharedMetadata ?  "/Shared Metadata" : "") + 
			")";

		// Check synchronous loading
		mModelOptions.loadAnnotationsJoined = false;
		mModelOptions.loadMetadataAsync = false;
		mModelOptions.skipMetadataAnnotationParsing = true;

		var mTest = mAdditionalTestsServices["Joined Loading with automated $metadata parsing"];

		// FIXME: test doesn't work in headless PhantomJS test cycle => commented out!
		//  ==> PhantomJS doesn't fail when loading malformed XML!
		if (!sap.ui.Device.browser.phantomJS || (bServiceValid && bAnnotationsValid)) {
			test("V1 only: Synchronous Metadata loading and Metamodel - " + sTestType, fnTestSynchronousLoading.bind(this, aServices[i]));	
		}
	}


	module("Multiple Annotation Sources Merged");

	asyncTest("Asynchronous loading", function() {
		expect(12);
		var asyncStartsExpected = 2; // The number of asynchronous starts expected before the real start is triggered

		// Don't use metadata/annotation cache
		cleanOdataCache();
		var oModel1 = new sap.ui.model.odata.ODataModel(
			"fakeService://testdata/odata/northwind-annotated/", 
			{
				annotationURI : [
					"fakeService://testdata/odata/northwind-annotated/$metadata",
					"fakeService://testdata/odata/northwind-annotations-normal.xml"
				],
				json : true,
				loadAnnotationsJoined : false,
				loadMetadataAsync : false
			}
		);

		oAnnotations = oModel1.getServiceAnnotations();

		ok(oAnnotations.UnitTest["Test.FromAnnotations"][0].Value.Path === "Annotations", "Annotation from correct source (Annotations)");
		ok(oAnnotations.UnitTest["Test.FromMetadata"][0].Value.Path === "Metadata", "Annotation from correct source (Metadata)");
		ok(oAnnotations.UnitTest["Test.Merged"][0].Value.Path === "Annotations", "Annotation from correct source (Annotations)");

		// Don't use metadata/annotation cache
		cleanOdataCache();
		var oModel2 = new sap.ui.model.odata.ODataModel(
			"fakeService://testdata/odata/northwind-annotated/", 
			{
				annotationURI : [
					"fakeService://testdata/odata/northwind-annotations-normal.xml",
					"fakeService://testdata/odata/northwind-annotated/$metadata"
				],
				json : true,
				loadAnnotationsJoined : false,
				loadMetadataAsync : false
			}
		);

		oAnnotations = oModel2.getServiceAnnotations();

		ok(oAnnotations.UnitTest["Test.FromAnnotations"][0].Value.Path === "Annotations", "Annotation from correct source (Annotations)");
		ok(oAnnotations.UnitTest["Test.FromMetadata"][0].Value.Path === "Metadata", "Annotation from correct source (Metadata)");
		ok(oAnnotations.UnitTest["Test.Merged"][0].Value.Path === "Metadata", "Annotation from correct source (Metadata)");

		// Don't use metadata/annotation cache
		cleanOdataCache();
		var oModel3 = new sap.ui.model.odata.ODataModel(
			"fakeService://testdata/odata/northwind-annotated/", 
			{
				annotationURI : [
					"fakeService://testdata/odata/northwind-annotations-normal.xml",
					"fakeService://testdata/odata/northwind-annotated/$metadata"
				],
				json : true,
				loadAnnotationsJoined : false,
				loadMetadataAsync : true
			}
		);
		oModel3.attachAnnotationsLoaded(function() {
			var oAnnotations = oModel3.getServiceAnnotations();
			ok(oAnnotations.UnitTest["Test.FromAnnotations"][0].Value.Path === "Annotations", "Annotation from correct source (Annotations)");
			ok(oAnnotations.UnitTest["Test.FromMetadata"][0].Value.Path === "Metadata", "Annotation from correct source (Metadata)");
			ok(oAnnotations.UnitTest["Test.Merged"][0].Value.Path === "Metadata", "Annotation from correct source (Metadata)");
			asyncStart();
		});

		// Don't use metadata/annotation cache
		cleanOdataCache();
		var oModel4 = new sap.ui.model.odata.ODataModel(
			"fakeService://testdata/odata/northwind-annotated/", 
			{
				annotationURI : [
					"fakeService://testdata/odata/northwind-annotated/$metadata",
					"fakeService://testdata/odata/northwind-annotations-normal.xml"
				],
				json : true,
				loadAnnotationsJoined : false,
				loadMetadataAsync : true
			}
		);
		oModel4.attachAnnotationsLoaded(function() {
			var oAnnotations = oModel4.getServiceAnnotations();
			ok(oAnnotations.UnitTest["Test.FromAnnotations"][0].Value.Path === "Annotations", "Annotation from correct source (Annotations)");
			ok(oAnnotations.UnitTest["Test.FromMetadata"][0].Value.Path === "Metadata", "Annotation from correct source (Metadata)");
			ok(oAnnotations.UnitTest["Test.Merged"][0].Value.Path === "Annotations", "Annotation from correct source (Annotations)");
			asyncStart();
		});


		function asyncStart() {
			if (asyncStart.num === undefined) {
				asyncStart.num = 0;
			}

			if (++asyncStart.num >= asyncStartsExpected) {
				oModel1.destroy();
				oModel2.destroy();
				oModel3.destroy();
				oModel4.destroy();

				start();
			}
		}
	
	});

	module("V2: Multiple Annotation Sources Merged");

	asyncTest("Asynchronous loading", function() {
		expect(6);
		var asyncStartsExpected = 2; // The number of asynchronous starts expected before the real start is triggered

		var oModel3 = new sap.ui.model.odata.v2.ODataModel(
			"fakeService://testdata/odata/northwind-annotated/", 
			{
				annotationURI : [
					"fakeService://testdata/odata/northwind-annotations-normal.xml",
					"fakeService://testdata/odata/northwind-annotated/$metadata"
				],
				json : true,
				loadAnnotationsJoined : false,
				loadMetadataAsync : true
			}
		);
		oModel3.attachAnnotationsLoaded(function() {
			var oAnnotations = oModel3.getServiceAnnotations();
			ok(oAnnotations.UnitTest["Test.FromAnnotations"][0].Value.Path === "Annotations", "Annotation from correct source (Annotations)");
			ok(oAnnotations.UnitTest["Test.FromMetadata"][0].Value.Path === "Metadata", "Annotation from correct source (Metadata)");
			var sMerged = oAnnotations.UnitTest["Test.Merged"][0].Value.Path;
			ok(sMerged === "Metadata" || sMerged === "Annotations", "Merged annotations filled");
			asyncStart();
		});

		var oModel4 = new sap.ui.model.odata.v2.ODataModel(
			"fakeService://testdata/odata/northwind-annotated/", 
			{
				annotationURI : [
					"fakeService://testdata/odata/northwind-annotated/$metadata",
					"fakeService://testdata/odata/northwind-annotations-normal.xml"
				],
				json : true,
				loadAnnotationsJoined : false,
				loadMetadataAsync : true
			}
		);
		oModel4.attachAnnotationsLoaded(function() {
			var oAnnotations = oModel4.getServiceAnnotations();
			ok(oAnnotations.UnitTest["Test.FromAnnotations"][0].Value.Path === "Annotations", "Annotation from correct source (Annotations)");
			ok(oAnnotations.UnitTest["Test.FromMetadata"][0].Value.Path === "Metadata", "Annotation from correct source (Metadata)");
			var sMerged = oAnnotations.UnitTest["Test.Merged"][0].Value.Path;
			ok(sMerged === "Metadata" || sMerged === "Annotations", "Merged annotations filled");
			asyncStart();
		});


		function asyncStart() {
			if (asyncStart.num === undefined) {
				asyncStart.num = 0;
			}

			if (++asyncStart.num >= asyncStartsExpected) {
				oModel3.destroy();
				oModel4.destroy();

				start();
			}
		}

	});

	module("Additional tests for fixed bugs");


	test("Test 2014-12-08", function() {
		expect(12);

		var mTest = mAdditionalTestsServices["Test 2014-12-08"];
		var sServiceURI = mTest.service;
		var mModelOptions = {
			annotationURI : mTest.annotations,
			json : true,
			loadAnnotationsJoined: false,
			loadMetadataAsync: false
		};

		var oModel = new sap.ui.model.odata.ODataModel(sServiceURI, mModelOptions);
		var oMetadata = oModel.getServiceMetadata();
		var oAnnotations = oModel.getServiceAnnotations();

		ok(!!oMetadata, "Metadata is available.");
		ok(!!oAnnotations, "Annotations are available.");

		ok(
			!!oAnnotations
				["Test.2014-12-08"],
			"Test Annotations are available"
		);
		ok(
			!!oAnnotations
				["Test.2014-12-08"]
				["com.sap.vocabularies.UI.v1.Identification"],
			"Namespace exists"
		);
		ok(
			!!oAnnotations
				["Test.2014-12-08"]
				["com.sap.vocabularies.UI.v1.Identification"]
				[0],
			"Namespace has content"
		);


		var mNamespace = oAnnotations["Test.2014-12-08"]["com.sap.vocabularies.UI.v1.Identification"][0];

		ok(
			!!mNamespace
				["com.sap.vocabularies.UI.v1.Importance"],
			"Sub-namespace exists"
		);
		ok(
			!!mNamespace
				["com.sap.vocabularies.UI.v1.Importance"]
				["EnumMember"],
			"EnumMember exists"
		);
		equal(
			mNamespace
				["com.sap.vocabularies.UI.v1.Importance"]
				["EnumMember"],
			"com.sap.vocabularies.UI.v1.Priority/High",
			"EnumMember has correct value"
		);

		ok(!!mNamespace["RecordType"], "RecordType exists");
		equal(
			mNamespace["RecordType"],
			"com.sap.vocabularies.UI.v1.DataField",
			"RecordType has correct value"
		);

		ok(!!mNamespace["Value"], "Value exists");

		var mCorrectValue = {
			"Apply": {
				"Name" : "odata.concat",
				"Parameters" : [{
					"Type" : "Path",
					"Value" : "CompanyCodeTESet/ContactPerson"
				}, {
					"Type" : "String",
					"Value" : " ("
				}, {
					"Type" : "Path",
					"Value" : "CompanyCode"
				}, {
					"Type" : "String",
					"Value" : ")"
				}]
			}
		};

		deepEqual(mNamespace["Value"], mCorrectValue, "Value has correct value");

		oModel.destroy();
	});

	asyncTest("V2: Test 2014-12-08", function() {
		expect(12);

		var mTest = mAdditionalTestsServices["Test 2014-12-08"];
		var sServiceURI = mTest.service;
		var mModelOptions = {
			annotationURI : mTest.annotations,
			json : true,
			loadAnnotationsJoined: false,
			skipMetadataAnnotationParsing: true
		};

		var oModel = new sap.ui.model.odata.v2.ODataModel(sServiceURI, mModelOptions);
		
		oModel.attachAnnotationsLoaded(function() {
			var oMetadata = oModel.getServiceMetadata();
			var oAnnotations = oModel.getServiceAnnotations();

			ok(!!oMetadata, "Metadata is available.");
			ok(!!oAnnotations, "Annotations are available.");

			ok(
				!!oAnnotations
					["Test.2014-12-08"],
				"Test Annotations are available"
			);
			ok(
				!!oAnnotations
					["Test.2014-12-08"]
					["com.sap.vocabularies.UI.v1.Identification"],
				"Namespace exists"
			);
			ok(
				!!oAnnotations
					["Test.2014-12-08"]
					["com.sap.vocabularies.UI.v1.Identification"]
					[0],
				"Namespace has content"
			);


			var mNamespace = oAnnotations["Test.2014-12-08"]["com.sap.vocabularies.UI.v1.Identification"][0];

			ok(
				!!mNamespace
					["com.sap.vocabularies.UI.v1.Importance"],
				"Sub-namespace exists"
			);
			ok(
				!!mNamespace
					["com.sap.vocabularies.UI.v1.Importance"]
					["EnumMember"],
				"EnumMember exists"
			);
			equal(
				mNamespace
					["com.sap.vocabularies.UI.v1.Importance"]
					["EnumMember"],
				"com.sap.vocabularies.UI.v1.Priority/High",
				"EnumMember has correct value"
			);

			ok(!!mNamespace["RecordType"], "RecordType exists");
			equal(
				mNamespace["RecordType"],
				"com.sap.vocabularies.UI.v1.DataField",
				"RecordType has correct value"
			);

			ok(!!mNamespace["Value"], "Value exists");

			var mCorrectValue = {
				"Apply": {
					"Name" : "odata.concat",
					"Parameters" : [{
						"Type" : "Path",
						"Value" : "CompanyCodeTESet/ContactPerson"
					}, {
						"Type" : "String",
						"Value" : " ("
					}, {
						"Type" : "Path",
						"Value" : "CompanyCode"
					}, {
						"Type" : "String",
						"Value" : ")"
					}]
				}
			};

			deepEqual(mNamespace["Value"], mCorrectValue, "Value has correct value");
			
			oModel.destroy();
			start();
		});
	});


	test("Multiple Property Annotations", function() {
		expect(11);

		var mTest = mAdditionalTestsServices["Multiple Property Annotations"];
		var sServiceURI = mTest.service;
		var mModelOptions = {
			annotationURI : mTest.annotations,
			json : true,
			loadAnnotationsJoined: false,
			loadMetadataAsync: false
		};

		var oModel = new sap.ui.model.odata.ODataModel(sServiceURI, mModelOptions);
		var oMetadata = oModel.getServiceMetadata();
		var oAnnotations = oModel.getServiceAnnotations();

		ok(!!oMetadata, "Metadata is available.");
		ok(!!oAnnotations, "Annotations are available.");

		ok(!!oAnnotations["propertyAnnotations"], "PropertyAnnotations namespace exists");

		ok(
			!!oAnnotations["propertyAnnotations"]["MultiplePropertyAnnotations.Product"],
			"Target namespace inside PropertyAnnotations exists"
		);

		ok(
			!!oAnnotations["propertyAnnotations"]["MultiplePropertyAnnotations.Product"]["Price/Amount"],
			"Target values exist"
		);

		ok(
			!!oAnnotations
				["propertyAnnotations"]
				["MultiplePropertyAnnotations.Product"]
				["Price/Amount"]
				["CQP.ISOCurrency"],
			"Target value 1 exists"
		);

		ok(
			!!oAnnotations
				["propertyAnnotations"]
				["MultiplePropertyAnnotations.Product"]
				["Price/Amount"]
				["Common.Label"],
			"Target value 2 exists"
		);

		ok(
			!!oAnnotations
				["propertyAnnotations"]
				["MultiplePropertyAnnotations.Product"]
				["Price/Amount"]
				["CQP.ISOCurrency"]
				["Path"],
			"Target value 1 property exists"
		);

		ok(
			!!oAnnotations
				["propertyAnnotations"]
				["MultiplePropertyAnnotations.Product"]
				["Price/Amount"]
				["Common.Label"]
				["String"],
			"Target value 2 property exists"
		);

		equal(
			oAnnotations
				["propertyAnnotations"]
				["MultiplePropertyAnnotations.Product"]
				["Price/Amount"]
				["CQP.ISOCurrency"]
				["Path"],
			"Price/CurrencyCode",
			"Target value 1 property exists"
		);

		equal(
			oAnnotations
				["propertyAnnotations"]
				["MultiplePropertyAnnotations.Product"]
				["Price/Amount"]
				["Common.Label"]
				["String"],
			"Price",
			"Target value 2 property exists"
		);
		
		oModel.destroy();
	});


	asyncTest("V2: Multiple Property Annotations", function() {
		expect(11);

		var mTest = mAdditionalTestsServices["Multiple Property Annotations"];
		var sServiceURI = mTest.service;
		var mModelOptions = {
			annotationURI : mTest.annotations,
			json : true,
			loadAnnotationsJoined: false,
			skipMetadataAnnotationParsing: true
		};

		var oModel = new sap.ui.model.odata.v2.ODataModel(sServiceURI, mModelOptions);
		oModel.attachAnnotationsLoaded(function() {
			var oMetadata = oModel.getServiceMetadata();
			var oAnnotations = oModel.getServiceAnnotations();

			ok(!!oMetadata, "Metadata is available.");
			ok(!!oAnnotations, "Annotations are available.");

			ok(!!oAnnotations["propertyAnnotations"], "PropertyAnnotations namespace exists");

			ok(
				!!oAnnotations["propertyAnnotations"]["MultiplePropertyAnnotations.Product"],
				"Target namespace inside PropertyAnnotations exists"
			);

			ok(
				!!oAnnotations["propertyAnnotations"]["MultiplePropertyAnnotations.Product"]["Price/Amount"],
				"Target values exist"
			);

			ok(
				!!oAnnotations
					["propertyAnnotations"]
					["MultiplePropertyAnnotations.Product"]
					["Price/Amount"]
					["CQP.ISOCurrency"],
				"Target value 1 exists"
			);

			ok(
				!!oAnnotations
					["propertyAnnotations"]
					["MultiplePropertyAnnotations.Product"]
					["Price/Amount"]
					["Common.Label"],
				"Target value 2 exists"
			);

			ok(
				!!oAnnotations
					["propertyAnnotations"]
					["MultiplePropertyAnnotations.Product"]
					["Price/Amount"]
					["CQP.ISOCurrency"]
					["Path"],
				"Target value 1 property exists"
			);

			ok(
				!!oAnnotations
					["propertyAnnotations"]
					["MultiplePropertyAnnotations.Product"]
					["Price/Amount"]
					["Common.Label"]
					["String"],
				"Target value 2 property exists"
			);

			equal(
				oAnnotations
					["propertyAnnotations"]
					["MultiplePropertyAnnotations.Product"]
					["Price/Amount"]
					["CQP.ISOCurrency"]
					["Path"],
				"Price/CurrencyCode",
				"Target value 1 property exists"
			);

			equal(
				oAnnotations
					["propertyAnnotations"]
					["MultiplePropertyAnnotations.Product"]
					["Price/Amount"]
					["Common.Label"]
					["String"],
				"Price",
				"Target value 2 property exists"
			);
			
			oModel.destroy();
			start();
		});
	});


	test("Qualifiers in Property Annotations", function() {
		expect(8);

		var mTest = mAdditionalTestsServices["Property Annotation Qualifiers"];
		var sServiceURI = mTest.service;
		var mModelOptions = {
			annotationURI : mTest.annotations,
			json : true,
			loadAnnotationsJoined: false,
			loadMetadataAsync: false
		};

		var oModel = new sap.ui.model.odata.ODataModel(sServiceURI, mModelOptions);
		var oMetadata = oModel.getServiceMetadata();
		var oAnnotations = oModel.getServiceAnnotations();

		ok(!!oMetadata, "Metadata is available.");
		ok(!!oAnnotations, "Annotations are available.");

		ok(!!oAnnotations["propertyAnnotations"], "PropertyAnnotations namespace exists");

		ok(
			!!oAnnotations["propertyAnnotations"]["PropertyAnnotationQualifiers.Product"],
			"Target namespace inside PropertyAnnotations exists"
		);

		ok(
			!!oAnnotations
				["propertyAnnotations"]["PropertyAnnotationQualifiers.Product"]["Price/Amount"],
			"Target value exists"
		);

		ok(
			!!oAnnotations
				["propertyAnnotations"]
				["PropertyAnnotationQualifiers.Product"]
				["Price/Amount"]
				["CQP.ISOCurrency#Amount1"],
			"Target value with Qualifier exists"
		);

		ok(
			!!oAnnotations
				["propertyAnnotations"]
				["PropertyAnnotationQualifiers.Product"]
				["Price/Amount"]
				["CQP.ISOCurrency#Amount1"]
				["Path"],
			"Target value with Qualifier value exists"
		);

		equal(
			oAnnotations
				["propertyAnnotations"]
				["PropertyAnnotationQualifiers.Product"]
				["Price/Amount"]
				["CQP.ISOCurrency#Amount1"]
				["Path"],
			"Price/CurrencyCode",
			"Target value with Qualifier value has correct content"
		);

		oModel.destroy();

	});

	asyncTest("V2: Qualifiers in Property Annotations", function() {
		expect(8);

		var mTest = mAdditionalTestsServices["Property Annotation Qualifiers"];
		var sServiceURI = mTest.service;
		var mModelOptions = {
			annotationURI : mTest.annotations,
			json : true,
			loadAnnotationsJoined: false,
			loadMetadataAsync: false,
			skipMetadataAnnotationParsing: true
		};

		var oModel = new sap.ui.model.odata.v2.ODataModel(sServiceURI, mModelOptions);
		oModel.attachAnnotationsLoaded(function() {
			var oMetadata = oModel.getServiceMetadata();
			var oAnnotations = oModel.getServiceAnnotations();

			ok(!!oMetadata, "Metadata is available.");
			ok(!!oAnnotations, "Annotations are available.");

			ok(!!oAnnotations["propertyAnnotations"], "PropertyAnnotations namespace exists");

			ok(
				!!oAnnotations["propertyAnnotations"]["PropertyAnnotationQualifiers.Product"],
				"Target namespace inside PropertyAnnotations exists"
			);

			ok(
				!!oAnnotations
					["propertyAnnotations"]["PropertyAnnotationQualifiers.Product"]["Price/Amount"],
				"Target value exists"
			);

			ok(
				!!oAnnotations
					["propertyAnnotations"]
					["PropertyAnnotationQualifiers.Product"]
					["Price/Amount"]
					["CQP.ISOCurrency#Amount1"],
				"Target value with Qualifier exists"
			);

			ok(
				!!oAnnotations
					["propertyAnnotations"]
					["PropertyAnnotationQualifiers.Product"]
					["Price/Amount"]
					["CQP.ISOCurrency#Amount1"]
					["Path"],
				"Target value with Qualifier value exists"
			);

			equal(
				oAnnotations
					["propertyAnnotations"]
					["PropertyAnnotationQualifiers.Product"]
					["Price/Amount"]
					["CQP.ISOCurrency#Amount1"]
					["Path"],
				"Price/CurrencyCode",
				"Target value with Qualifier value has correct content"
			);
			oModel.destroy();
			start();
		});
	});


	test("Other Property Values", function() {
		expect(8);

		var mTest = mAdditionalTestsServices["Other Property Values"];
		var sServiceURI = mTest.service;
		var mModelOptions = {
			annotationURI : mTest.annotations,
			json : true,
			loadAnnotationsJoined: false,
			loadMetadataAsync: false
		};

		var oModel = new sap.ui.model.odata.ODataModel(sServiceURI, mModelOptions);
		var oMetadata = oModel.getServiceMetadata();
		var oAnnotations = oModel.getServiceAnnotations();

		ok(!!oMetadata, "Metadata is available.");
		ok(!!oAnnotations, "Annotations are available.");

		ok(!!oAnnotations["propertyAnnotations"], "PropertyAnnotations namespace exists");

		ok(
			!!oAnnotations["propertyAnnotations"]["OtherPropertyValues.Product"],
			"Target namespace inside PropertyAnnotations exists"
		);

		ok(
			!!oAnnotations
				["propertyAnnotations"]["OtherPropertyValues.Product"]["Price/Amount"],
			"Target value exists"
		);

		ok(
			!!oAnnotations
				["propertyAnnotations"]
				["OtherPropertyValues.Product"]
				["Price/Amount"]
				["CQP.ISOCurrency#Amount2"],
			"Target value with Qualifier exists"
		);

		ok(
			!!oAnnotations
				["propertyAnnotations"]
				["OtherPropertyValues.Product"]
				["Price/Amount"]
				["CQP.ISOCurrency#Amount2"]
				["String"],
			"Target value with Qualifier value exists"
		);

		equal(
			oAnnotations
				["propertyAnnotations"]
				["OtherPropertyValues.Product"]
				["Price/Amount"]
				["CQP.ISOCurrency#Amount2"]
				["String"],
			"EUR",
			"Target value with Qualifier value has correct content"
		);
	});

	asyncTest("V2: Other Property Values", function() {
		expect(8);

		var mTest = mAdditionalTestsServices["Other Property Values"];
		var sServiceURI = mTest.service;
		var mModelOptions = {
			annotationURI : mTest.annotations,
			json : true,
			loadAnnotationsJoined: false,
			skipMetadataAnnotationParsing: true
		};

		var oModel = new sap.ui.model.odata.v2.ODataModel(sServiceURI, mModelOptions);
		oModel.attachAnnotationsLoaded(function() {
			var oMetadata = oModel.getServiceMetadata();
			var oAnnotations = oModel.getServiceAnnotations();

			ok(!!oMetadata, "Metadata is available.");
			ok(!!oAnnotations, "Annotations are available.");

			ok(!!oAnnotations["propertyAnnotations"], "PropertyAnnotations namespace exists");

			ok(
				!!oAnnotations["propertyAnnotations"]["OtherPropertyValues.Product"],
				"Target namespace inside PropertyAnnotations exists"
			);

			ok(
				!!oAnnotations
					["propertyAnnotations"]["OtherPropertyValues.Product"]["Price/Amount"],
				"Target value exists"
			);

			ok(
				!!oAnnotations
					["propertyAnnotations"]
					["OtherPropertyValues.Product"]
					["Price/Amount"]
					["CQP.ISOCurrency#Amount2"],
				"Target value with Qualifier exists"
			);

			ok(
				!!oAnnotations
					["propertyAnnotations"]
					["OtherPropertyValues.Product"]
					["Price/Amount"]
					["CQP.ISOCurrency#Amount2"]
					["String"],
				"Target value with Qualifier value exists"
			);

			equal(
				oAnnotations
					["propertyAnnotations"]
					["OtherPropertyValues.Product"]
					["Price/Amount"]
					["CQP.ISOCurrency#Amount2"]
					["String"],
				"EUR",
				"Target value with Qualifier value has correct content"
			);
			oModel.destroy();
			start();
		});
	});


	test("Aliases in Namespaces", function() {
		expect(8);

		var mTest = mAdditionalTestsServices["Aliases in Namespaces"];
		var sServiceURI = mTest.service;
		var mModelOptions = {
			annotationURI : mTest.annotations,
			json : true,
			loadAnnotationsJoined: false,
			loadMetadataAsync: false,
			skipMetadataAnnotationParsing: true
		};

		var oModel = new sap.ui.model.odata.ODataModel(sServiceURI, mModelOptions);
		var oMetadata = oModel.getServiceMetadata();
		var oAnnotations = oModel.getServiceAnnotations();

		ok(!!oMetadata, "Metadata is available.");
		ok(!!oAnnotations, "Annotations are available.");

		ok(!!oAnnotations["propertyAnnotations"], "PropertyAnnotations namespace exists");

		ok(
			!!oAnnotations["propertyAnnotations"]["NamespaceAliases.PurchaseOrder"],
			"Target namespace inside PropertyAnnotations exists"
		);

		ok(
			!!oAnnotations
				["propertyAnnotations"]["NamespaceAliases.PurchaseOrder"]["GrossAmount"],
			"Target value exists"
		);

		ok(
			!!oAnnotations
				["propertyAnnotations"]
				["NamespaceAliases.PurchaseOrder"]
				["GrossAmount"]
				["com.sap.vocabularies.Common.v1.Label"],
			"Target value with correct alias replacement (none!) exists"
		);

		ok(
			!!oAnnotations
				["propertyAnnotations"]
				["NamespaceAliases.PurchaseOrder"]
				["GrossAmount"]
				["com.sap.vocabularies.Common.v1.Label"]
				["String"],
			"Target value with String value exists"
		);

		equal(
			oAnnotations
				["propertyAnnotations"]
				["NamespaceAliases.PurchaseOrder"]
				["GrossAmount"]
				["com.sap.vocabularies.Common.v1.Label"]
				["String"],
			"Gross Amount",
			"Target value String value has correct content"
		);
		oModel.destroy();
	});
	
	asyncTest("V2: Aliases in Namespaces", function() {
		expect(8);

		var mTest = mAdditionalTestsServices["Aliases in Namespaces"];
		var sServiceURI = mTest.service;
		var mModelOptions = {
			annotationURI : mTest.annotations,
			json : true,
			loadAnnotationsJoined: false,
			loadMetadataAsync: false,
			skipMetadataAnnotationParsing: true
		};

		var oModel = new sap.ui.model.odata.v2.ODataModel(sServiceURI, mModelOptions);
		oModel.attachAnnotationsLoaded(function() {
			var oMetadata = oModel.getServiceMetadata();
			var oAnnotations = oModel.getServiceAnnotations();

			ok(!!oMetadata, "Metadata is available.");
			ok(!!oAnnotations, "Annotations are available.");

			ok(!!oAnnotations["propertyAnnotations"], "PropertyAnnotations namespace exists");

			ok(
				!!oAnnotations["propertyAnnotations"]["NamespaceAliases.PurchaseOrder"],
				"Target namespace inside PropertyAnnotations exists"
			);

			ok(
				!!oAnnotations
					["propertyAnnotations"]["NamespaceAliases.PurchaseOrder"]["GrossAmount"],
				"Target value exists"
			);

			ok(
				!!oAnnotations
					["propertyAnnotations"]
					["NamespaceAliases.PurchaseOrder"]
					["GrossAmount"]
					["com.sap.vocabularies.Common.v1.Label"],
				"Target value with correct alias replacement (none!) exists"
			);

			ok(
				!!oAnnotations
					["propertyAnnotations"]
					["NamespaceAliases.PurchaseOrder"]
					["GrossAmount"]
					["com.sap.vocabularies.Common.v1.Label"]
					["String"],
				"Target value with String value exists"
			);

			equal(
				oAnnotations
					["propertyAnnotations"]
					["NamespaceAliases.PurchaseOrder"]
					["GrossAmount"]
					["com.sap.vocabularies.Common.v1.Label"]
					["String"],
				"Gross Amount",
				"Target value String value has correct content"
			);
			oModel.destroy();
			start();
		});
	});
	
	test("Namespaces in Other Property Values", function() {
		expect(22);

		var mTest = mAdditionalTestsServices["Namespaces in Other Property Values"];
		var sServiceURI = mTest.service;
		var mModelOptions = {
			annotationURI : mTest.annotations,
			json : true,
			loadAnnotationsJoined: false,
			loadMetadataAsync: false
		};

		var oModel = new sap.ui.model.odata.ODataModel(sServiceURI, mModelOptions);
		var oMetadata = oModel.getServiceMetadata();
		var oAnnotations = oModel.getServiceAnnotations();

		ok(!!oMetadata, "Metadata is available.");

		ok(!!oAnnotations, "Annotations are available.");

		ok(!!oAnnotations["propertyAnnotations"], "PropertyAnnotations namespace exists");

		ok(
			!!oAnnotations["propertyAnnotations"]["OtherPropertyValueAliases.Test"]["Value"],
			"Target value exists"
		);


		ok(
			!!oAnnotations
				["propertyAnnotations"]
				["OtherPropertyValueAliases.Test"]
				["Value"]
				["com.sap.vocabularies.UI.v1.Name"],
			"Target value's namespace has been correctly replaced"
		);
		ok(
			!!oAnnotations
				["propertyAnnotations"]
				["OtherPropertyValueAliases.Test"]
				["Value"]
				["com.sap.vocabularies.UI.v1.Name"]
				["EnumMember"],
			"Target value's child exists"
		);
		equal(
			oAnnotations
				["propertyAnnotations"]
				["OtherPropertyValueAliases.Test"]
				["Value"]
				["com.sap.vocabularies.UI.v1.Name"]
				["EnumMember"],
			"com.sap.vocabularies.UI.v1.Value",
			"Target value's namespace has been correctly replaced"
		);


		ok(
			!!oAnnotations
				["propertyAnnotations"]
				["OtherPropertyValueAliases.Test"]
				["Value"]
				["com.sap.vocabularies.Communication.v1.Name"],
			"Target value's namespace has been correctly replaced"
		);
		ok(
			!!oAnnotations
				["propertyAnnotations"]
				["OtherPropertyValueAliases.Test"]
				["Value"]
				["com.sap.vocabularies.Communication.v1.Name"]
				["EnumMember"],
			"Target value's child exists"
		);
		equal(
			oAnnotations
				["propertyAnnotations"]
				["OtherPropertyValueAliases.Test"]
				["Value"]
				["com.sap.vocabularies.Communication.v1.Name"]
				["EnumMember"],
			"com.sap.vocabularies.Communication.v1.Value",
			"Target value's namespace has been correctly replaced"
		);


		ok(
			!!oAnnotations
				["propertyAnnotations"]
				["OtherPropertyValueAliases.Test"]
				["Value"]
				["Org.OData.Measures.V1.Name"],
			"Target value's namespace has been correctly replaced"
		);
		ok(
			!!oAnnotations
				["propertyAnnotations"]
				["OtherPropertyValueAliases.Test"]
				["Value"]
				["Org.OData.Measures.V1.Name"]
				["EnumMember"],
			"Target value's child exists"
		);
		equal(
			oAnnotations
				["propertyAnnotations"]
				["OtherPropertyValueAliases.Test"]
				["Value"]
				["Org.OData.Measures.V1.Name"]
				["EnumMember"],
			"Org.OData.Measures.V1.Value",
			"Target value's namespace has been correctly replaced"
		);


		ok(
			!!oAnnotations
				["propertyAnnotations"]
				["OtherPropertyValueAliases.Test"]
				["Value"]
				["Org.OData.Measures.V1.Name"],
			"Target value's namespace has been correctly replaced"
		);
		ok(
			!!oAnnotations
				["propertyAnnotations"]
				["OtherPropertyValueAliases.Test"]
				["Value"]
				["Org.OData.Measures.V1.Name"]
				["EnumMember"],
			"Target value's child exists"
		);
		equal(
			oAnnotations
				["propertyAnnotations"]
				["OtherPropertyValueAliases.Test"]
				["Value"]
				["Org.OData.Measures.V1.Name"]
				["EnumMember"],
			"Org.OData.Measures.V1.Value",
			"Target value's namespace has been correctly replaced"
		);


		ok(
			!!oAnnotations
				["propertyAnnotations"]
				["OtherPropertyValueAliases.Test"]
				["Value"]
				["com.sap.vocabularies.Common.v1.Name"],
			"Target value's namespace has been correctly replaced"
		);
		ok(
			!!oAnnotations
				["propertyAnnotations"]
				["OtherPropertyValueAliases.Test"]
				["Value"]
				["com.sap.vocabularies.Common.v1.Name"]
				["EnumMember"],
			"Target value's child exists"
		);
		equal(
			oAnnotations
				["propertyAnnotations"]
				["OtherPropertyValueAliases.Test"]
				["Value"]
				["com.sap.vocabularies.Common.v1.Name"]
				["EnumMember"],
			"com.sap.vocabularies.Common.v1.Value",
			"Target value's namespace has been correctly replaced"
		);


		ok(
			!!oAnnotations
				["propertyAnnotations"]
				["OtherPropertyValueAliases.Test"]
				["Value"]
				["FTGEN_HB_TE.Name"],
			"Target value's namespace has been correctly replaced"
		);
		ok(
			!!oAnnotations
				["propertyAnnotations"]
				["OtherPropertyValueAliases.Test"]
				["Value"]
				["FTGEN_HB_TE.Name"]
				["EnumMember"],
			"Target value's child exists"
		);
		equal(
			oAnnotations
				["propertyAnnotations"]
				["OtherPropertyValueAliases.Test"]
				["Value"]
				["FTGEN_HB_TE.Name"]
				["EnumMember"],
			"FTGEN_HB_TE.Value",
			"Target value's namespace has been correctly replaced"
		);
		oModel.destroy();
	});
	
	asyncTest("V2: Namespaces in Other Property Values", function() {
		expect(22);

		var mTest = mAdditionalTestsServices["Namespaces in Other Property Values"];
		var sServiceURI = mTest.service;
		var mModelOptions = {
			annotationURI : mTest.annotations,
			json : true,
			loadAnnotationsJoined: false,
			skipMetadataAnnotationParsing: true
		};

		var oModel = new sap.ui.model.odata.v2.ODataModel(sServiceURI, mModelOptions);
		oModel.attachAnnotationsLoaded(function() {
			var oMetadata = oModel.getServiceMetadata();
			var oAnnotations = oModel.getServiceAnnotations();

			ok(!!oMetadata, "Metadata is available.");

			ok(!!oAnnotations, "Annotations are available.");

			ok(!!oAnnotations["propertyAnnotations"], "PropertyAnnotations namespace exists");
	
			ok(
				!!oAnnotations["propertyAnnotations"]["OtherPropertyValueAliases.Test"]["Value"],
				"Target value exists"
			);


			ok(
				!!oAnnotations
					["propertyAnnotations"]
					["OtherPropertyValueAliases.Test"]
					["Value"]
					["com.sap.vocabularies.UI.v1.Name"],
				"Target value's namespace has been correctly replaced"
			);
			ok(
				!!oAnnotations
					["propertyAnnotations"]
					["OtherPropertyValueAliases.Test"]
					["Value"]
					["com.sap.vocabularies.UI.v1.Name"]
					["EnumMember"],
				"Target value's child exists"
			);
			equal(
				oAnnotations
					["propertyAnnotations"]
					["OtherPropertyValueAliases.Test"]
					["Value"]
					["com.sap.vocabularies.UI.v1.Name"]
					["EnumMember"],
				"com.sap.vocabularies.UI.v1.Value",
				"Target value's namespace has been correctly replaced"
			);


			ok(
				!!oAnnotations
					["propertyAnnotations"]
					["OtherPropertyValueAliases.Test"]
					["Value"]
					["com.sap.vocabularies.Communication.v1.Name"],
				"Target value's namespace has been correctly replaced"
			);
			ok(
				!!oAnnotations
					["propertyAnnotations"]
					["OtherPropertyValueAliases.Test"]
					["Value"]
					["com.sap.vocabularies.Communication.v1.Name"]
					["EnumMember"],
				"Target value's child exists"
			);
			equal(
				oAnnotations
					["propertyAnnotations"]
					["OtherPropertyValueAliases.Test"]
					["Value"]
					["com.sap.vocabularies.Communication.v1.Name"]
					["EnumMember"],
				"com.sap.vocabularies.Communication.v1.Value",
				"Target value's namespace has been correctly replaced"
			);


			ok(
				!!oAnnotations
					["propertyAnnotations"]
					["OtherPropertyValueAliases.Test"]
					["Value"]
					["Org.OData.Measures.V1.Name"],
				"Target value's namespace has been correctly replaced"
			);
			ok(
				!!oAnnotations
					["propertyAnnotations"]
					["OtherPropertyValueAliases.Test"]
					["Value"]
					["Org.OData.Measures.V1.Name"]
					["EnumMember"],
				"Target value's child exists"
			);
			equal(
				oAnnotations
					["propertyAnnotations"]
					["OtherPropertyValueAliases.Test"]
					["Value"]
					["Org.OData.Measures.V1.Name"]
					["EnumMember"],
				"Org.OData.Measures.V1.Value",
				"Target value's namespace has been correctly replaced"
			);


			ok(
				!!oAnnotations
					["propertyAnnotations"]
					["OtherPropertyValueAliases.Test"]
					["Value"]
					["Org.OData.Measures.V1.Name"],
				"Target value's namespace has been correctly replaced"
			);
			ok(
				!!oAnnotations
					["propertyAnnotations"]
					["OtherPropertyValueAliases.Test"]
					["Value"]
					["Org.OData.Measures.V1.Name"]
					["EnumMember"],
				"Target value's child exists"
			);
			equal(
				oAnnotations
					["propertyAnnotations"]
					["OtherPropertyValueAliases.Test"]
					["Value"]
					["Org.OData.Measures.V1.Name"]
					["EnumMember"],
				"Org.OData.Measures.V1.Value",
				"Target value's namespace has been correctly replaced"
			);


			ok(
				!!oAnnotations
					["propertyAnnotations"]
					["OtherPropertyValueAliases.Test"]
					["Value"]
					["com.sap.vocabularies.Common.v1.Name"],
				"Target value's namespace has been correctly replaced"
			);
			ok(
				!!oAnnotations
					["propertyAnnotations"]
					["OtherPropertyValueAliases.Test"]
					["Value"]
					["com.sap.vocabularies.Common.v1.Name"]
					["EnumMember"],
				"Target value's child exists"
			);
			equal(
				oAnnotations
					["propertyAnnotations"]
					["OtherPropertyValueAliases.Test"]
					["Value"]
					["com.sap.vocabularies.Common.v1.Name"]
					["EnumMember"],
				"com.sap.vocabularies.Common.v1.Value",
				"Target value's namespace has been correctly replaced"
			);


			ok(
				!!oAnnotations
					["propertyAnnotations"]
					["OtherPropertyValueAliases.Test"]
					["Value"]
					["FTGEN_HB_TE.Name"],
				"Target value's namespace has been correctly replaced"
			);
			ok(
				!!oAnnotations
					["propertyAnnotations"]
					["OtherPropertyValueAliases.Test"]
					["Value"]
					["FTGEN_HB_TE.Name"]
					["EnumMember"],
				"Target value's child exists"
			);
			equal(
				oAnnotations
					["propertyAnnotations"]
					["OtherPropertyValueAliases.Test"]
					["Value"]
					["FTGEN_HB_TE.Name"]
					["EnumMember"],
				"FTGEN_HB_TE.Value",
				"Target value's namespace has been correctly replaced"
			);
			oModel.destroy();
			start();
		});
	});
	
	test("Text Properties", function() {
		expect(14);

		var mTest = mAdditionalTestsServices["Text Properties"];
		var sServiceURI = mTest.service;
		var mModelOptions = {
			annotationURI : mTest.annotations,
			json : true,
			loadAnnotationsJoined: false,
			loadMetadataAsync: false
		};

		var oModel = new sap.ui.model.odata.ODataModel(sServiceURI, mModelOptions);
		var oMetadata = oModel.getServiceMetadata();
		var oAnnotations = oModel.getServiceAnnotations();

		ok(!!oMetadata, "Metadata is available.");

		ok(!!oAnnotations, "Annotations are available.");

		ok(!!oAnnotations["propertyAnnotations"], "PropertyAnnotations group exists");
		
		ok(
			!!oAnnotations["propertyAnnotations"]["OtherPropertyValueAliases.Test"],
			"PropertyAnnotation definition exists"
		);
		
		ok(
			!!oAnnotations["propertyAnnotations"]["OtherPropertyValueAliases.Test"]["Value"],
			"PropertyAnnotation definition value exists"
		);
		
		ok(
			!!oAnnotations["propertyAnnotations"]["OtherPropertyValueAliases.Test"]["Value"]["com.sap.vocabularies.UI.v1.Name1"],
			"Name1 with replaced alias exists"
		);
		ok(
			!!oAnnotations["propertyAnnotations"]["OtherPropertyValueAliases.Test"]["Value"]["com.sap.vocabularies.UI.v1.Name2"],
			"Name2 with replaced alias exists"
		);
		ok(
			!!oAnnotations["propertyAnnotations"]["OtherPropertyValueAliases.Test"]["Value"]["com.sap.vocabularies.UI.v1.Name3"],
			"Name3 with replaced alias exists"
		);
		
		ok(
			!!oAnnotations["propertyAnnotations"]["OtherPropertyValueAliases.Test"]["Value"]["com.sap.vocabularies.UI.v1.Name1"]["EnumMember"],
			"Name1 with replaced alias exists and has EnumMember child node"
		);
		ok(
			!!oAnnotations["propertyAnnotations"]["OtherPropertyValueAliases.Test"]["Value"]["com.sap.vocabularies.UI.v1.Name2"]["String"],
			"Name2 with replaced alias exists and has String child node"
		);
		ok(
			!!oAnnotations["propertyAnnotations"]["OtherPropertyValueAliases.Test"]["Value"]["com.sap.vocabularies.UI.v1.Name3"]["Invalid"],
			"Name3 with replaced alias exists and has Invalid child node"
		);
		
		equals(
			oAnnotations["propertyAnnotations"]["OtherPropertyValueAliases.Test"]["Value"]["com.sap.vocabularies.UI.v1.Name1"]["EnumMember"],
			"com.sap.vocabularies.UI.v1.Value",
			"Name1 with replaced alias exists and has EnumMember child node that contains alias replaced tet with trimmed white-spaces"
		);
		equals(
			oAnnotations["propertyAnnotations"]["OtherPropertyValueAliases.Test"]["Value"]["com.sap.vocabularies.UI.v1.Name2"]["String"],
			"   test test   ",
			"Name2 with replaced alias exists and has String child node that contains the exact text inclunding white-spaces"
		);
		deepEqual(
			oAnnotations["propertyAnnotations"]["OtherPropertyValueAliases.Test"]["Value"]["com.sap.vocabularies.UI.v1.Name3"]["Invalid"],
			{},
			"Name3 with replaced alias exists and has Invalid child node that only contains an empy object"
		);
		oModel.destroy();
	});

	asyncTest("V2: Text Properties", function() {
		expect(14);
		
		var mTest = mAdditionalTestsServices["Text Properties"];
		var sServiceURI = mTest.service;
		var mModelOptions = {
			annotationURI : mTest.annotations,
			json : true,
			loadAnnotationsJoined: false,
			skipMetadataAnnotationParsing: true
		};

		var oModel = new sap.ui.model.odata.v2.ODataModel(sServiceURI, mModelOptions);
		oModel.attachAnnotationsLoaded(function() {
			var oMetadata = oModel.getServiceMetadata();
			var oAnnotations = oModel.getServiceAnnotations();

			ok(!!oMetadata, "Metadata is available.");

			ok(!!oAnnotations, "Annotations are available.");

			ok(!!oAnnotations["propertyAnnotations"], "PropertyAnnotations group exists");
			
			ok(
				!!oAnnotations["propertyAnnotations"]["OtherPropertyValueAliases.Test"],
				"PropertyAnnotation definition exists"
			);
			
			ok(
				!!oAnnotations["propertyAnnotations"]["OtherPropertyValueAliases.Test"]["Value"],
				"PropertyAnnotation definition value exists"
			);
			
			ok(
				!!oAnnotations["propertyAnnotations"]["OtherPropertyValueAliases.Test"]["Value"]["com.sap.vocabularies.UI.v1.Name1"],
				"Name1 with replaced alias exists"
			);
			ok(
				!!oAnnotations["propertyAnnotations"]["OtherPropertyValueAliases.Test"]["Value"]["com.sap.vocabularies.UI.v1.Name2"],
				"Name2 with replaced alias exists"
			);
			ok(
				!!oAnnotations["propertyAnnotations"]["OtherPropertyValueAliases.Test"]["Value"]["com.sap.vocabularies.UI.v1.Name3"],
				"Name3 with replaced alias exists"
			);
			
			ok(
				!!oAnnotations["propertyAnnotations"]["OtherPropertyValueAliases.Test"]["Value"]["com.sap.vocabularies.UI.v1.Name1"]["EnumMember"],
				"Name1 with replaced alias exists and has EnumMember child node"
			);
			ok(
				!!oAnnotations["propertyAnnotations"]["OtherPropertyValueAliases.Test"]["Value"]["com.sap.vocabularies.UI.v1.Name2"]["String"],
				"Name2 with replaced alias exists and has String child node"
			);
			ok(
				!!oAnnotations["propertyAnnotations"]["OtherPropertyValueAliases.Test"]["Value"]["com.sap.vocabularies.UI.v1.Name3"]["Invalid"],
				"Name3 with replaced alias exists and has Invalid child node"
			);

			equals(
				oAnnotations["propertyAnnotations"]["OtherPropertyValueAliases.Test"]["Value"]["com.sap.vocabularies.UI.v1.Name1"]["EnumMember"],
				"com.sap.vocabularies.UI.v1.Value",
				"Name1 with replaced alias exists and has EnumMember child node that contains alias replaced tet with trimmed white-spaces"
			);
			equals(
				oAnnotations["propertyAnnotations"]["OtherPropertyValueAliases.Test"]["Value"]["com.sap.vocabularies.UI.v1.Name2"]["String"],
				"   test test   ",
				"Name2 with replaced alias exists and has String child node that contains the exact text inclunding white-spaces"
			);
			deepEqual(
				oAnnotations["propertyAnnotations"]["OtherPropertyValueAliases.Test"]["Value"]["com.sap.vocabularies.UI.v1.Name3"]["Invalid"],
				{},
				"Name3 with replaced alias exists and has Invalid child node that only contains an empy object"
			);
			oModel.destroy();
			start();
		});
	});
	
	test("Entity Containers", function() {
		expect(30);

		var mTest = mAdditionalTestsServices["Entity Containers"];
		var sServiceURI = mTest.service;
		var mModelOptions = {
			annotationURI : mTest.annotations,
			json : true,
			loadAnnotationsJoined: false,
			loadMetadataAsync: false
		};

		var oModel = new sap.ui.model.odata.ODataModel(sServiceURI, mModelOptions);
		var oMetadata = oModel.getServiceMetadata();
		var oAnnotations = oModel.getServiceAnnotations();

		ok(!!oMetadata, "Metadata is available.");

		ok(!!oAnnotations, "Annotations are available.");

		
		ok(!!oAnnotations["EntityContainer"], "Entity container entry exists");
		
		ok(!!oAnnotations["EntityContainer"]["AIVS_NEW_BO_SRV.AIVS_NEW_BO_SRV_Entities"], "Entity container exists");
		
		ok(
			!!oAnnotations["EntityContainer"]["AIVS_NEW_BO_SRV.AIVS_NEW_BO_SRV_Entities"]
			["SalesOrder"],
			"Entity in container exists"
		);

		ok(
			!!oAnnotations["EntityContainer"]["AIVS_NEW_BO_SRV.AIVS_NEW_BO_SRV_Entities"]
			["SalesOrder"]
			["com.sap.vocabularies.Common.v1.DraftRoot"],
			"Sub Entity in container exists"
		);

		ok(
			!!oAnnotations["EntityContainer"]["AIVS_NEW_BO_SRV.AIVS_NEW_BO_SRV_Entities"]
			["SalesOrder"]
			["com.sap.vocabularies.Common.v1.DraftRoot"]
			["ActivationAction"],
			"Sub Entity value in container exists"
		);
		ok(
			!!oAnnotations["EntityContainer"]["AIVS_NEW_BO_SRV.AIVS_NEW_BO_SRV_Entities"]
			["SalesOrder"]
			["com.sap.vocabularies.Common.v1.DraftRoot"]
			["ActivationAction"]
			["String"],
			"Sub Entity value in container exists"
		);
		equal(
			oAnnotations["EntityContainer"]["AIVS_NEW_BO_SRV.AIVS_NEW_BO_SRV_Entities"]
			["SalesOrder"]
			["com.sap.vocabularies.Common.v1.DraftRoot"]
			["ActivationAction"]
			["String"],
			"AIVS_NEW_BO_SRV.AIVS_NEW_BO_SRV_Entities/Activate",
			"Sub Entity value in container exists"
		);
		
		ok(
			!!oAnnotations["EntityContainer"]["AIVS_NEW_BO_SRV.AIVS_NEW_BO_SRV_Entities"]
			["SalesOrder"]
			["com.sap.vocabularies.Common.v1.DraftRoot"]
			["EditAction"],
			"Sub Entity value in container exists"
		);
		ok(
			!!oAnnotations["EntityContainer"]["AIVS_NEW_BO_SRV.AIVS_NEW_BO_SRV_Entities"]
			["SalesOrder"]
			["com.sap.vocabularies.Common.v1.DraftRoot"]
			["EditAction"]
			["String"],
			"Sub Entity value in container exists"
		);
		equal(
			oAnnotations["EntityContainer"]["AIVS_NEW_BO_SRV.AIVS_NEW_BO_SRV_Entities"]
			["SalesOrder"]
			["com.sap.vocabularies.Common.v1.DraftRoot"]
			["EditAction"]
			["String"],
			"AIVS_NEW_BO_SRV.AIVS_NEW_BO_SRV_Entities/Edit",
			"Sub Entity value in container exists"
		);
		
		ok(
			!!oAnnotations["EntityContainer"]["AIVS_NEW_BO_SRV.AIVS_NEW_BO_SRV_Entities"]
			["SalesOrder"]
			["com.sap.vocabularies.Common.v1.DraftRoot"]
			["ValidationFunction"],
			"Sub Entity value in container exists"
		);
		ok(
			!!oAnnotations["EntityContainer"]["AIVS_NEW_BO_SRV.AIVS_NEW_BO_SRV_Entities"]
			["SalesOrder"]
			["com.sap.vocabularies.Common.v1.DraftRoot"]
			["ValidationFunction"]
			["String"],
			"Sub Entity value in container exists"
		);
		equal(
			oAnnotations["EntityContainer"]["AIVS_NEW_BO_SRV.AIVS_NEW_BO_SRV_Entities"]
			["SalesOrder"]
			["com.sap.vocabularies.Common.v1.DraftRoot"]
			["ValidationFunction"]
			["String"],
			"AIVS_NEW_BO_SRV.AIVS_NEW_BO_SRV_Entities/Validate",
			"Sub Entity value in container exists"
		);
		
		ok(
			!!oAnnotations["EntityContainer"]["AIVS_NEW_BO_SRV.AIVS_NEW_BO_SRV_Entities"]
			["SalesOrder"]
			["com.sap.vocabularies.Common.v1.DraftRoot"]
			["PreparationAction"],
			"Sub Entity value in container exists"
		);
		ok(
			!!oAnnotations["EntityContainer"]["AIVS_NEW_BO_SRV.AIVS_NEW_BO_SRV_Entities"]
			["SalesOrder"]
			["com.sap.vocabularies.Common.v1.DraftRoot"]
			["PreparationAction"]
			["String"],
			"Sub Entity value in container exists"
		);
		equal(
			oAnnotations["EntityContainer"]["AIVS_NEW_BO_SRV.AIVS_NEW_BO_SRV_Entities"]
			["SalesOrder"]
			["com.sap.vocabularies.Common.v1.DraftRoot"]
			["PreparationAction"]
			["String"],
			"AIVS_NEW_BO_SRV.AIVS_NEW_BO_SRV_Entities/Prepare",
			"Sub Entity value in container exists"
		);
		
		ok(
			!!oAnnotations["AIVS_NEW_BO_SRV.SalesOrderType"],
			"Entity in namespace exists"
		);
		ok(
			!!oAnnotations["AIVS_NEW_BO_SRV.SalesOrderType"]
			["com.sap.vocabularies.Common.v1.SemanticKey"],
			"Entity in namespace exists"
		);
		ok(
			!!oAnnotations["AIVS_NEW_BO_SRV.SalesOrderType"]
			["com.sap.vocabularies.Common.v1.SemanticKey"]
			[0],
			"Entity entries in namespace exists"
		);
		ok(
			!!oAnnotations["AIVS_NEW_BO_SRV.SalesOrderType"]
			["com.sap.vocabularies.Common.v1.SemanticKey"]
			[0]
			["PropertyPath"],
			"Property exists"
		);
		equal(
			oAnnotations["AIVS_NEW_BO_SRV.SalesOrderType"]
			["com.sap.vocabularies.Common.v1.SemanticKey"]
			[0]
			["PropertyPath"],
			"SalesOrderID",
			"Entity in namespace exists"
		);
		
		ok(
			!!oAnnotations["AIVS_NEW_BO_SRV.SalesOrderItemType"],
			"Entity in namespace exists"
		);
		ok(
			!!oAnnotations["AIVS_NEW_BO_SRV.SalesOrderItemType"]
			["com.sap.vocabularies.Common.v1.SemanticKey"],
			"Entity in namespace exists"
		);
		ok(
			!!oAnnotations["AIVS_NEW_BO_SRV.SalesOrderItemType"]
			["com.sap.vocabularies.Common.v1.SemanticKey"]
			[0],
			"Entity entries in namespace exists"
		);
		ok(
			!!oAnnotations["AIVS_NEW_BO_SRV.SalesOrderItemType"]
			["com.sap.vocabularies.Common.v1.SemanticKey"]
			[0]
			["PropertyPath"],
			"Property exists"
		);
		ok(
			!!oAnnotations["AIVS_NEW_BO_SRV.SalesOrderItemType"]
			["com.sap.vocabularies.Common.v1.SemanticKey"]
			[1]
			["PropertyPath"],
			"Property exists"
		);
		equal(
			oAnnotations["AIVS_NEW_BO_SRV.SalesOrderItemType"]
			["com.sap.vocabularies.Common.v1.SemanticKey"]
			[0]
			["PropertyPath"],
			"SalesOrderID",
			"Entity in namespace exists"
		);
		equal(
			oAnnotations["AIVS_NEW_BO_SRV.SalesOrderItemType"]
			["com.sap.vocabularies.Common.v1.SemanticKey"]
			[1]
			["PropertyPath"],
			"SalesOrderItemID",
			"Entity in namespace exists"
		);
		oModel.destroy();
	});

	asyncTest("V2: Entity Containers", function() {
		expect(30);

		var mTest = mAdditionalTestsServices["Entity Containers"];
		var sServiceURI = mTest.service;
		var mModelOptions = {
			annotationURI : mTest.annotations,
			json : true,
			loadAnnotationsJoined: true,
			skipMetadataAnnotationParsing: true
		};

		var oModel = new sap.ui.model.odata.v2.ODataModel(sServiceURI, mModelOptions);
		oModel.attachMetadataLoaded(function() {
			var oMetadata = oModel.getServiceMetadata();
			var oAnnotations = oModel.getServiceAnnotations();

			ok(!!oMetadata, "Metadata is available.");

			ok(!!oAnnotations, "Annotations are available.");

			
			ok(!!oAnnotations["EntityContainer"], "Entity container entry exists");
			
			ok(!!oAnnotations["EntityContainer"]["AIVS_NEW_BO_SRV.AIVS_NEW_BO_SRV_Entities"], "Entity container exists");
			
			ok(
				!!oAnnotations["EntityContainer"]["AIVS_NEW_BO_SRV.AIVS_NEW_BO_SRV_Entities"]
				["SalesOrder"],
				"Entity in container exists"
			);

			ok(
				!!oAnnotations["EntityContainer"]["AIVS_NEW_BO_SRV.AIVS_NEW_BO_SRV_Entities"]
				["SalesOrder"]
				["com.sap.vocabularies.Common.v1.DraftRoot"],
				"Sub Entity in container exists"
			);

			ok(
				!!oAnnotations["EntityContainer"]["AIVS_NEW_BO_SRV.AIVS_NEW_BO_SRV_Entities"]
				["SalesOrder"]
				["com.sap.vocabularies.Common.v1.DraftRoot"]
				["ActivationAction"],
				"Sub Entity value in container exists"
			);
			ok(
				!!oAnnotations["EntityContainer"]["AIVS_NEW_BO_SRV.AIVS_NEW_BO_SRV_Entities"]
				["SalesOrder"]
				["com.sap.vocabularies.Common.v1.DraftRoot"]
				["ActivationAction"]
				["String"],
				"Sub Entity value in container exists"
			);
			equal(
				oAnnotations["EntityContainer"]["AIVS_NEW_BO_SRV.AIVS_NEW_BO_SRV_Entities"]
				["SalesOrder"]
				["com.sap.vocabularies.Common.v1.DraftRoot"]
				["ActivationAction"]
				["String"],
				"AIVS_NEW_BO_SRV.AIVS_NEW_BO_SRV_Entities/Activate",
				"Sub Entity value in container exists"
			);
			
			ok(
				!!oAnnotations["EntityContainer"]["AIVS_NEW_BO_SRV.AIVS_NEW_BO_SRV_Entities"]
				["SalesOrder"]
				["com.sap.vocabularies.Common.v1.DraftRoot"]
				["EditAction"],
				"Sub Entity value in container exists"
			);
			ok(
				!!oAnnotations["EntityContainer"]["AIVS_NEW_BO_SRV.AIVS_NEW_BO_SRV_Entities"]
				["SalesOrder"]
				["com.sap.vocabularies.Common.v1.DraftRoot"]
				["EditAction"]
				["String"],
				"Sub Entity value in container exists"
			);
			equal(
				oAnnotations["EntityContainer"]["AIVS_NEW_BO_SRV.AIVS_NEW_BO_SRV_Entities"]
				["SalesOrder"]
				["com.sap.vocabularies.Common.v1.DraftRoot"]
				["EditAction"]
				["String"],
				"AIVS_NEW_BO_SRV.AIVS_NEW_BO_SRV_Entities/Edit",
				"Sub Entity value in container exists"
			);
			
			ok(
				!!oAnnotations["EntityContainer"]["AIVS_NEW_BO_SRV.AIVS_NEW_BO_SRV_Entities"]
				["SalesOrder"]
				["com.sap.vocabularies.Common.v1.DraftRoot"]
				["ValidationFunction"],
				"Sub Entity value in container exists"
			);
			ok(
				!!oAnnotations["EntityContainer"]["AIVS_NEW_BO_SRV.AIVS_NEW_BO_SRV_Entities"]
				["SalesOrder"]
				["com.sap.vocabularies.Common.v1.DraftRoot"]
				["ValidationFunction"]
				["String"],
				"Sub Entity value in container exists"
			);
			equal(
				oAnnotations["EntityContainer"]["AIVS_NEW_BO_SRV.AIVS_NEW_BO_SRV_Entities"]
				["SalesOrder"]
				["com.sap.vocabularies.Common.v1.DraftRoot"]
				["ValidationFunction"]
				["String"],
				"AIVS_NEW_BO_SRV.AIVS_NEW_BO_SRV_Entities/Validate",
				"Sub Entity value in container exists"
			);
			
			ok(
				!!oAnnotations["EntityContainer"]["AIVS_NEW_BO_SRV.AIVS_NEW_BO_SRV_Entities"]
				["SalesOrder"]
				["com.sap.vocabularies.Common.v1.DraftRoot"]
				["PreparationAction"],
				"Sub Entity value in container exists"
			);
			ok(
				!!oAnnotations["EntityContainer"]["AIVS_NEW_BO_SRV.AIVS_NEW_BO_SRV_Entities"]
				["SalesOrder"]
				["com.sap.vocabularies.Common.v1.DraftRoot"]
				["PreparationAction"]
				["String"],
				"Sub Entity value in container exists"
			);
			equal(
				oAnnotations["EntityContainer"]["AIVS_NEW_BO_SRV.AIVS_NEW_BO_SRV_Entities"]
				["SalesOrder"]
				["com.sap.vocabularies.Common.v1.DraftRoot"]
				["PreparationAction"]
				["String"],
				"AIVS_NEW_BO_SRV.AIVS_NEW_BO_SRV_Entities/Prepare",
				"Sub Entity value in container exists"
			);
			
			ok(
				!!oAnnotations["AIVS_NEW_BO_SRV.SalesOrderType"],
				"Entity in namespace exists"
			);
			ok(
				!!oAnnotations["AIVS_NEW_BO_SRV.SalesOrderType"]
				["com.sap.vocabularies.Common.v1.SemanticKey"],
				"Entity in namespace exists"
			);
			ok(
				!!oAnnotations["AIVS_NEW_BO_SRV.SalesOrderType"]
				["com.sap.vocabularies.Common.v1.SemanticKey"]
				[0],
				"Entity entries in namespace exists"
			);
			ok(
				!!oAnnotations["AIVS_NEW_BO_SRV.SalesOrderType"]
				["com.sap.vocabularies.Common.v1.SemanticKey"]
				[0]
				["PropertyPath"],
				"Property exists"
			);
			equal(
				oAnnotations["AIVS_NEW_BO_SRV.SalesOrderType"]
				["com.sap.vocabularies.Common.v1.SemanticKey"]
				[0]
				["PropertyPath"],
				"SalesOrderID",
				"Entity in namespace exists"
			);
			
			ok(
				!!oAnnotations["AIVS_NEW_BO_SRV.SalesOrderItemType"],
				"Entity in namespace exists"
			);
			ok(
				!!oAnnotations["AIVS_NEW_BO_SRV.SalesOrderItemType"]
				["com.sap.vocabularies.Common.v1.SemanticKey"],
				"Entity in namespace exists"
			);
			ok(
				!!oAnnotations["AIVS_NEW_BO_SRV.SalesOrderItemType"]
				["com.sap.vocabularies.Common.v1.SemanticKey"]
				[0],
				"Entity entries in namespace exists"
			);
			ok(
				!!oAnnotations["AIVS_NEW_BO_SRV.SalesOrderItemType"]
				["com.sap.vocabularies.Common.v1.SemanticKey"]
				[0]
				["PropertyPath"],
				"Property exists"
			);
			ok(
				!!oAnnotations["AIVS_NEW_BO_SRV.SalesOrderItemType"]
				["com.sap.vocabularies.Common.v1.SemanticKey"]
				[1]
				["PropertyPath"],
				"Property exists"
			);
			equal(
				oAnnotations["AIVS_NEW_BO_SRV.SalesOrderItemType"]
				["com.sap.vocabularies.Common.v1.SemanticKey"]
				[0]
				["PropertyPath"],
				"SalesOrderID",
				"Entity in namespace exists"
			);
			equal(
				oAnnotations["AIVS_NEW_BO_SRV.SalesOrderItemType"]
				["com.sap.vocabularies.Common.v1.SemanticKey"]
				[1]
				["PropertyPath"],
				"SalesOrderItemID",
				"Entity in namespace exists"
			);
			oModel.destroy();
			start();
		});
	});

	test("Simple Values", function() {
		expect(3);

		var mTest = mAdditionalTestsServices["Simple Values"];
		var sServiceURI = mTest.service;
		var mModelOptions = {
			annotationURI : mTest.annotations,
			json : true,
			loadAnnotationsJoined: false,
			loadMetadataAsync: false
		};

		var oModel = new sap.ui.model.odata.ODataModel(sServiceURI, mModelOptions);
		var oMetadata = oModel.getServiceMetadata();
		var oAnnotations = oModel.getServiceAnnotations();

		ok(!!oMetadata, "Metadata is available.");

		ok(!!oAnnotations, "Annotations are available.");
		
		deepEqual(
			oAnnotations["SimpleValues.Test"]["com.sap.vocabularies.UI.v1.Name1"],
			oAnnotations["SimpleValues.Test"]["com.sap.vocabularies.UI.v1.Name2"],
			"Simple value attributes have the meaning as child elements"
		);
		oModel.destroy();
		
	});

	asyncTest("V2: Simple Values", function() {
		expect(3);

		var mTest = mAdditionalTestsServices["Simple Values"];
		var sServiceURI = mTest.service;
		var mModelOptions = {
			annotationURI : mTest.annotations,
			json : true,
			loadAnnotationsJoined: true,
			skipMetadataAnnotationParsing: true
		};

		var oModel = new sap.ui.model.odata.v2.ODataModel(sServiceURI, mModelOptions);
		oModel.attachMetadataLoaded(function() {
			var oMetadata = oModel.getServiceMetadata();
			var oAnnotations = oModel.getServiceAnnotations();
			
			ok(!!oMetadata, "Metadata is available.");
			
			ok(!!oAnnotations, "Annotations are available.");
			
			deepEqual(
				oAnnotations["SimpleValues.Test"]["com.sap.vocabularies.UI.v1.Name1"],
				oAnnotations["SimpleValues.Test"]["com.sap.vocabularies.UI.v1.Name2"],
				"Simple value attributes have the meaning as child elements"
			);
			oModel.destroy();
			start();
		});
	});

	
	test("Collection with Namespace", function() {
		expect(6);

		var mTest = mAdditionalTestsServices["Collection with Namespace"];
		var sServiceURI = mTest.service;
		var mModelOptions = {
			annotationURI : mTest.annotations,
			json : true,
			loadAnnotationsJoined: false,
			loadMetadataAsync: false
		};

		var oModel = new sap.ui.model.odata.ODataModel(sServiceURI, mModelOptions);
		var oMetadata = oModel.getServiceMetadata();
		var oAnnotations = oModel.getServiceAnnotations();

		ok(!!oMetadata, "Metadata is available.");

		ok(!!oAnnotations, "Annotations are available.");


		ok(!!oAnnotations["propertyAnnotations"], "propertyAnnotations exists");
		ok(!!oAnnotations["propertyAnnotations"]["CollectionWithNamespace.Test"], "propertyAnnotations Entry exists");
		ok(!!oAnnotations["propertyAnnotations"]["CollectionWithNamespace.Test"]["Value"], "propertyAnnotations Entry Value exists");

		deepEqual(
			oAnnotations["propertyAnnotations"]["CollectionWithNamespace.Test"]["Value"]["UI.TestNS"],
			oAnnotations["propertyAnnotations"]["CollectionWithNamespace.Test"]["Value"]["UI.TestNoNS"],
			"Collection with and without namespace have the same values"
		);
		oModel.destroy();
	});

	asyncTest("V2: Collection with Namespace", function() {
		expect(6);

		var mTest = mAdditionalTestsServices["Collection with Namespace"];
		var sServiceURI = mTest.service;
		var mModelOptions = {
			annotationURI : mTest.annotations,
			json : true,
			loadAnnotationsJoined: true,
			skipMetadataAnnotationParsing: true
		};

		var oModel = new sap.ui.model.odata.v2.ODataModel(sServiceURI, mModelOptions);
		oModel.attachMetadataLoaded(function() {
			var oMetadata = oModel.getServiceMetadata();
			var oAnnotations = oModel.getServiceAnnotations();

			ok(!!oMetadata, "Metadata is available.");

			ok(!!oAnnotations, "Annotations are available.");


			ok(!!oAnnotations["propertyAnnotations"], "propertyAnnotations exists");
			ok(!!oAnnotations["propertyAnnotations"]["CollectionWithNamespace.Test"], "propertyAnnotations Entry exists");
			ok(!!oAnnotations["propertyAnnotations"]["CollectionWithNamespace.Test"]["Value"], "propertyAnnotations Entry Value exists");

			deepEqual(
				oAnnotations["propertyAnnotations"]["CollectionWithNamespace.Test"]["Value"]["UI.TestNS"],
				oAnnotations["propertyAnnotations"]["CollectionWithNamespace.Test"]["Value"]["UI.TestNoNS"],
				"Collection with and without namespace have the same values"
			);
			oModel.destroy();
			start();
		});
	});

	test("UrlRef", function() {
		expect(78);

		var mTest = mAdditionalTestsServices["UrlRef"];
		var sServiceURI = mTest.service;
		var mModelOptions = {
			annotationURI : mTest.annotations,
			json : true,
			loadAnnotationsJoined: false,
			loadMetadataAsync: false
		};

		var oModel = new sap.ui.model.odata.ODataModel(sServiceURI, mModelOptions);
		var oMetadata = oModel.getServiceMetadata();
		var oAnnotations = oModel.getServiceAnnotations();

		ok(!!oMetadata, "Metadata is available.");

		ok(!!oAnnotations, "Annotations are available.");

		ok(!!oAnnotations["UrlTest"], "Main entry exists");

		deepContains(
			oAnnotations["UrlTest"],
			{
				"com.sap.vocabularies.UI.v1.Identification": [{
					"Label": {
						"String": "ID"
					},
					"Value": {
						"Path": "BusinessPartnerID"
					},
					"RecordType": "com.sap.vocabularies.UI.v1.DataField"
				}, {
					"Label": {
						"String":"Address"
					},
					"Target": {
						"AnnotationPath": "@com.sap.vocabularies.Communication.v1.Address"
					},
					"RecordType": "com.sap.vocabularies.UI.v1.DataFieldForAnnotation"
				}, {
					"Label": {
						"String":"Link to"
					},
					"Value": {
						"String": "Google Maps"
					},
					"Url": {
						"UrlRef": {
							"Apply": {
								"Name": "odata.fillUriTemplate",
								"Parameters": [{
									"Type": "String",
									"Value": "https://www.google.de/maps/place/{street},{city}"
								}, {
									"Type": "LabeledElement",
									"Value": {
										"Apply": {
											"Name": "odata.uriEncode",
											"Parameters": [{
												"Type": "Path",
												"Value": "Address/Street"
											}]
										}
									},
									"Name": "street"
								}, {
									"Type": "LabeledElement",
									"Value": {
										"Apply": {
											"Name": "odata.uriEncode",
											"Parameters": [{
												"Type": "Path",
												"Value": "Address/City"
											}]
										}
									},
									"Name": "city"
								}]
							}
						}
					},
					"RecordType":"com.sap.vocabularies.UI.v1.DataFieldWithUrl"
				}]
			},
			"Correct values for UrlTest"
		);
		
		equal(oAnnotations["UrlTest"]["com.sap.vocabularies.UI.v1.Identification"][2]["Url"]["UrlRef"]["Apply"]["Parameters"][2]["Name"], "city", "Name is correctly set for labeled element");
		ok(!oAnnotations["UrlTest"]["com.sap.vocabularies.UI.v1.Identification"][2]["Url"]["UrlRef"]["Apply"]["Parameters"][2]["Value"]["Name"], "Name is not set for labeled element Value");
		
		oModel.destroy();
	});


	asyncTest("V2: UrlRef", function() {
		expect(78);

		var mTest = mAdditionalTestsServices["UrlRef"];
		var sServiceURI = mTest.service;
		var mModelOptions = {
			annotationURI : mTest.annotations,
			json : true,
			loadAnnotationsJoined: true,
			skipMetadataAnnotationParsing: true
		};

		var oModel = new sap.ui.model.odata.v2.ODataModel(sServiceURI, mModelOptions);
		oModel.attachMetadataLoaded(function() {
			var oMetadata = oModel.getServiceMetadata();
			var oAnnotations = oModel.getServiceAnnotations();

			ok(!!oMetadata, "Metadata is available.");

			ok(!!oAnnotations, "Annotations are available.");

			ok(!!oAnnotations["UrlTest"], "Main entry exists");

			deepContains(
				oAnnotations["UrlTest"],
				{
					"com.sap.vocabularies.UI.v1.Identification": [{
						"Label": {
							"String": "ID"
						},
						"Value": {
							"Path": "BusinessPartnerID"
						},
						"RecordType": "com.sap.vocabularies.UI.v1.DataField"
					}, {
						"Label": {
							"String":"Address"
						},
						"Target": {
							"AnnotationPath": "@com.sap.vocabularies.Communication.v1.Address"
						},
						"RecordType": "com.sap.vocabularies.UI.v1.DataFieldForAnnotation"
					}, {
						"Label": {
							"String":"Link to"
						},
						"Value": {
							"String": "Google Maps"
						},
						"Url": {
							"UrlRef": {
								"Apply": {
									"Name": "odata.fillUriTemplate",
									"Parameters": [{
										"Type": "String",
										"Value": "https://www.google.de/maps/place/{street},{city}"
									}, {
										"Type": "LabeledElement",
										"Value": {
											"Apply": {
												"Name": "odata.uriEncode",
												"Parameters": [{
													"Type": "Path",
													"Value": "Address/Street"
												}]
											}
										},
										"Name": "street"
									}, {
										"Type": "LabeledElement",
										"Value": {
											"Apply": {
												"Name": "odata.uriEncode",
												"Parameters": [{
													"Type": "Path",
													"Value": "Address/City"
												}]
											}
										},
										"Name": "city"
									}]
								}
							}
						},
						"RecordType":"com.sap.vocabularies.UI.v1.DataFieldWithUrl"
					}]
				},
				"Correct values for UrlTest"
			);
			
			equal(oAnnotations["UrlTest"]["com.sap.vocabularies.UI.v1.Identification"][2]["Url"]["UrlRef"]["Apply"]["Parameters"][2]["Name"], "city", "Name is correctly set for labeled element");
			ok(!oAnnotations["UrlTest"]["com.sap.vocabularies.UI.v1.Identification"][2]["Url"]["UrlRef"]["Apply"]["Parameters"][2]["Value"]["Name"], "Name is not set for labeled element Value");
			
			oModel.destroy();
			start();
		});
	});
	
	
	asyncTest("V2 only: Delayed Loading", function() {
		expect(22);

		var mTest = mAdditionalTestsServices["Delayed Loading"];
		var sServiceURI = mTest.service;
		var mModelOptions = {
			annotationURI : mTest.annotations[0],
			json : true,
			loadAnnotationsJoined: false,
			loadMetadataAsync: true,
			skipMetadataAnnotationParsing: true
		};

		var oModel = new sap.ui.model.odata.v2.ODataModel(sServiceURI, mModelOptions);
		
		var bFirstLoad = true;
		oModel.attachAnnotationsLoaded(function() {
			if (!bFirstLoad) {
				// Only run further tests if this is the first annotation loading...
				return;
			}
			bFirstLoad = false;
			
			var oMetadata = oModel.getServiceMetadata();
			var oAnnotations = oModel.getServiceAnnotations();
			
			ok(!!oMetadata, "Metadata is available.");
			ok(Object.keys(oAnnotations).length > 0, "Annotations are available...");
			
			ok(!!oAnnotations["internal.ui5.test.MultipleAnnotations"], "Annoation Namespace exists and Alias has been replaced");
			ok(!!oAnnotations["internal.ui5.test.MultipleAnnotations"]["internal.ui5.test.FromAll"], "FromFirst namespace exists");
			ok(!!oAnnotations["internal.ui5.test.MultipleAnnotations"]["internal.ui5.test.FromAll"]["String"], "FromFirst annotation exists");

			ok(!!oAnnotations["internal.ui5.test.MultipleAnnotations"]["internal.ui5.test.FromFirst"], "FromFirst namespace exists");
			ok(!!oAnnotations["internal.ui5.test.MultipleAnnotations"]["internal.ui5.test.FromFirst"]["String"], "FromFirst annotation exists");
			
			equal(oAnnotations["internal.ui5.test.MultipleAnnotations"]["internal.ui5.test.FromAll"]["String"], "First", "FromAll annotation filled from first source");
			equal(oAnnotations["internal.ui5.test.MultipleAnnotations"]["internal.ui5.test.FromFirst"]["String"], "First", "FromFirst annotation filled from first source");
			
			oModel.addAnnotationUrl(mTest.annotations[1]).then(function(mResults) {
				ok(mResults.annotations === oAnnotations, "Second Annotations loaded...");
				
				ok(!!oAnnotations["internal.ui5.test.MultipleAnnotations"]["internal.ui5.test.FromSecond"], "FromSecond namespace exists");
				ok(!!oAnnotations["internal.ui5.test.MultipleAnnotations"]["internal.ui5.test.FromSecond"]["String"], "FromSecond annotation exists");

				equal(oAnnotations["internal.ui5.test.MultipleAnnotations"]["internal.ui5.test.FromAll"]["String"], "Second", "FromAll annotation filled from second source");
				equal(oAnnotations["internal.ui5.test.MultipleAnnotations"]["internal.ui5.test.FromFirst"]["String"], "First", "FromFirst annotation filled from first source");
				equal(oAnnotations["internal.ui5.test.MultipleAnnotations"]["internal.ui5.test.FromSecond"]["String"], "Second", "FromFirst annotation filled from Second source");
				
				oModel.addAnnotationUrl(mTest.annotations[2]).then(function(mResults) {
					ok(mResults.annotations === oAnnotations, "Third Annotations loaded...");

					ok(!!oAnnotations["internal.ui5.test.MultipleAnnotations"]["internal.ui5.test.FromThird"], "FromThird namespace exists");
					ok(!!oAnnotations["internal.ui5.test.MultipleAnnotations"]["internal.ui5.test.FromThird"]["String"], "FromThird annotation exists");
	
					equal(oAnnotations["internal.ui5.test.MultipleAnnotations"]["internal.ui5.test.FromAll"]["String"], "Third", "FromAll annotation filled from second source");
					equal(oAnnotations["internal.ui5.test.MultipleAnnotations"]["internal.ui5.test.FromFirst"]["String"], "First", "FromFirst annotation filled from first source");
					equal(oAnnotations["internal.ui5.test.MultipleAnnotations"]["internal.ui5.test.FromSecond"]["String"], "Second", "FromFirst annotation filled from Second source");
					equal(oAnnotations["internal.ui5.test.MultipleAnnotations"]["internal.ui5.test.FromThird"]["String"], "Third", "FromFirst annotation filled from Second source");
					
					oModel.destroy();
					start();
					
				}).catch(function(mResults) {
					ok(false, "Third Annotations could not be loaded...")
				})	
			}).catch(function(mResults) {
				ok(false, "Second Annotations could not be loaded...")
			})
		});
	});
	
	asyncTest("V2 only: Delayed Parsing", function() {
		expect(26);

		var mTest = mAdditionalTestsServices["Delayed Loading"];
		var sServiceURI = mTest.service;
		var mModelOptions = {
			annotationURI : null,
			json : true,
			loadAnnotationsJoined: false,
			loadMetadataAsync: true,
			skipMetadataAnnotationParsing: true
		};

		// Don't use metadata/annotations cache
		cleanOdataCache();
		var oModel = new sap.ui.model.odata.v2.ODataModel(sServiceURI, mModelOptions);


		var sFirstAnnotations  = jQuery.sap.syncGet(mTest.annotations[0]).data;
		ok(sFirstAnnotations.indexOf("<?xml") === 0, "First annotation file data loaded");

		var sSecondAnnotations = jQuery.sap.syncGet(mTest.annotations[1]).data;
		ok(sSecondAnnotations.indexOf("<?xml") === 0, "Second annotation file data loaded");

		var sThirdAnnotations  = jQuery.sap.syncGet(mTest.annotations[2]).data;
		ok(sThirdAnnotations.indexOf("<?xml") === 0, "Third annotation file data loaded");
		
		
		// TODO: Change internal access from oModel.oMetadata to offial API when available...
		oModel.oMetadata.loaded().then(function() {
			var oMetadata = oModel.getServiceMetadata();
			var oAnnotations = oModel.getServiceAnnotations();
			
			ok(!!oMetadata, "Metadata is available.");
			ok(!oAnnotations, "Annotations are not available...");
			
			oModel.addAnnotationXML(sFirstAnnotations).then(function(mResults) {
				ok(!!mResults.annotations, "First Annotations loaded...");
				oAnnotations = oModel.getServiceAnnotations();
				
				ok(!!oAnnotations["internal.ui5.test.MultipleAnnotations"], "Annoation Namespace exists and Alias has been replaced");
				ok(!!oAnnotations["internal.ui5.test.MultipleAnnotations"]["internal.ui5.test.FromAll"], "FromFirst namespace exists");
				ok(!!oAnnotations["internal.ui5.test.MultipleAnnotations"]["internal.ui5.test.FromAll"]["String"], "FromFirst annotation exists");

				ok(!!oAnnotations["internal.ui5.test.MultipleAnnotations"]["internal.ui5.test.FromFirst"], "FromFirst namespace exists");
				ok(!!oAnnotations["internal.ui5.test.MultipleAnnotations"]["internal.ui5.test.FromFirst"]["String"], "FromFirst annotation exists");
				
				equal(oAnnotations["internal.ui5.test.MultipleAnnotations"]["internal.ui5.test.FromAll"]["String"], "First", "FromAll annotation filled from first source");
				equal(oAnnotations["internal.ui5.test.MultipleAnnotations"]["internal.ui5.test.FromFirst"]["String"], "First", "FromFirst annotation filled from first source");
				
				oModel.addAnnotationXML(sSecondAnnotations).then(function(mResults) {
					ok(!!mResults.annotations, "Second Annotations loaded...");
					oAnnotations = oModel.getServiceAnnotations();
					
					ok(!!oAnnotations["internal.ui5.test.MultipleAnnotations"]["internal.ui5.test.FromSecond"], "FromSecond namespace exists");
					ok(!!oAnnotations["internal.ui5.test.MultipleAnnotations"]["internal.ui5.test.FromSecond"]["String"], "FromSecond annotation exists");

					equal(oAnnotations["internal.ui5.test.MultipleAnnotations"]["internal.ui5.test.FromAll"]["String"], "Second", "FromAll annotation filled from second source");
					equal(oAnnotations["internal.ui5.test.MultipleAnnotations"]["internal.ui5.test.FromFirst"]["String"], "First", "FromFirst annotation filled from first source");
					equal(oAnnotations["internal.ui5.test.MultipleAnnotations"]["internal.ui5.test.FromSecond"]["String"], "Second", "FromFirst annotation filled from Second source");
					
					oModel.addAnnotationXML(sThirdAnnotations).then(function(mResults) {
						ok(!!mResults.annotations, "Third Annotations loaded...");
						oAnnotations = oModel.getServiceAnnotations();

						ok(!!oAnnotations["internal.ui5.test.MultipleAnnotations"]["internal.ui5.test.FromThird"], "FromThird namespace exists");
						ok(!!oAnnotations["internal.ui5.test.MultipleAnnotations"]["internal.ui5.test.FromThird"]["String"], "FromThird annotation exists");
		
						equal(oAnnotations["internal.ui5.test.MultipleAnnotations"]["internal.ui5.test.FromAll"]["String"], "Third", "FromAll annotation filled from second source");
						equal(oAnnotations["internal.ui5.test.MultipleAnnotations"]["internal.ui5.test.FromFirst"]["String"], "First", "FromFirst annotation filled from first source");
						equal(oAnnotations["internal.ui5.test.MultipleAnnotations"]["internal.ui5.test.FromSecond"]["String"], "Second", "FromFirst annotation filled from Second source");
						equal(oAnnotations["internal.ui5.test.MultipleAnnotations"]["internal.ui5.test.FromThird"]["String"], "Third", "FromFirst annotation filled from Second source");
						
						oModel.destroy();
						start();
						
					}).catch(function(mResults) {
						ok(false, "Third Annotations could not be parsed...")
						oModel.destroy();
						start();
					})	
				}).catch(function(mResults) {
					ok(false, "Second Annotations could not be parsed...")
					oModel.destroy();
					start();
				})
			}).catch(function(mResults) {
				ok(false, "First Annotations could not be parsed...")
				oModel.destroy();
				start();
			});
		}).catch(function() {
			ok(false, "Metadata could not be loaded...")
			oModel.destroy();
			start();
		});
	});


	
	test("Alias Replacement", function() {
		expect(11);

		var mTest = mAdditionalTestsServices["Alias Replacement"];
		var sServiceURI = mTest.service;
		var mModelOptions = {
			annotationURI : mTest.annotations,
			json : true,
			loadAnnotationsJoined: false,
			loadMetadataAsync: false
		};

		var oModel = new sap.ui.model.odata.ODataModel(sServiceURI, mModelOptions);
		var oMetadata = oModel.getServiceMetadata();
		var oAnnotations = oModel.getServiceAnnotations();

		ok(!!oMetadata, "Metadata is available.");

		ok(!!oAnnotations, "Annotations are available.");

		
		
		ok(!!oAnnotations["Test.AliasReplacement"], "Namespace is available.");
		ok(!!oAnnotations["Test.AliasReplacement"]["TestAnnotation"], "Annotation is available.");
		
		
		ok(!!oAnnotations["Test.AliasReplacement"]["TestAnnotation"]["NotReplaced"], "First Entry is available.");
		ok(!!oAnnotations["Test.AliasReplacement"]["TestAnnotation"]["NotReplaced"][0], "First Entry array is available.");
		ok(!!oAnnotations["Test.AliasReplacement"]["TestAnnotation"]["NotReplaced"][0]["AnnotationPath"], "First Entry value is available.");
		equal(oAnnotations["Test.AliasReplacement"]["TestAnnotation"]["NotReplaced"][0]["AnnotationPath"], "@internal.ui5.test.Value", "First Entry value is correct.");
		
		ok(!!oAnnotations["Test.AliasReplacement"]["TestAnnotation"]["Replaced"], "Second Entry is available.");
		ok(!!oAnnotations["Test.AliasReplacement"]["TestAnnotation"]["Replaced"]["AnnotationPath"], "Second Entry value is available.");
		equal(oAnnotations["Test.AliasReplacement"]["TestAnnotation"]["Replaced"]["AnnotationPath"], "@internal.ui5.test.Value", "Second Entry value is correct.");
		oModel.destroy();
	});
	
	
	
	test("DynamicExpressions", function() {
		expect(15);

		var mTest = mAdditionalTestsServices["DynamicExpressions"];
		var sServiceURI = mTest.service;
		var mModelOptions = {
			annotationURI : mTest.annotations,
			json : true,
			loadAnnotationsJoined: false,
			loadMetadataAsync: false
		};

		var oModel = new sap.ui.model.odata.ODataModel(sServiceURI, mModelOptions);
		var oMetadata = oModel.getServiceMetadata();
		var oAnnotations = oModel.getServiceAnnotations();

		ok(!!oMetadata, "Metadata is available.");
		ok(!!oAnnotations, "Annotations are available.");
		
		ok(!!oAnnotations["DynamicExpressions"], "Annotation target is available");
		ok(!!oAnnotations["DynamicExpressions"]["org.example.person.Gender"], "Annotation term is available");
		
		var mValue = oAnnotations["DynamicExpressions"]["org.example.person.Gender"];
		var mExpected = {
			"If" : [
				{ "Path": "IsFemale" },
				{ "String": "Female" },
				{ "String": "Male" }
			]
		};
		deepContains(mValue, mExpected, "Value is correct: DynamicExpressions/org.example.person.Gender");
		oModel.destroy();
	});

	test("DynamicExpressions 2", function() {
		expect(56);

		var mTest = mAdditionalTestsServices["DynamicExpressions2"];
		var sServiceURI = mTest.service;
		var mModelOptions = {
			annotationURI : mTest.annotations,
			json : true,
			loadAnnotationsJoined: false,
			loadMetadataAsync: false
		};

		var oModel = new sap.ui.model.odata.ODataModel(sServiceURI, mModelOptions);
		var oMetadata = oModel.getServiceMetadata();
		var oAnnotations = oModel.getServiceAnnotations();

		ok(!!oMetadata, "Metadata is available.");
		ok(!!oAnnotations, "Annotations are available.");
		
		ok(!!oAnnotations["DynamicExpressions2"], "Annotation target is available");
		ok(!!oAnnotations["DynamicExpressions2"]["com.sap.vocabularies.Test.v1.Data"], "Annotation term is available");
		ok(!!oAnnotations["DynamicExpressions2"]["com.sap.vocabularies.Test.v1.Data"]["Value"], "Annotation value is available");
		
		var mValue = oAnnotations["DynamicExpressions2"]["com.sap.vocabularies.Test.v1.Data"]["Value"];
		var mExpected = {
			"And": [{
				"Or":[{
					"Eq":[{
						"Lt":[{
							"Not":{
								"Path":"p1"
							}
						}, {
							"Path":"p2"
						}]
					}, {
						"Path":"p3"
					}]
				}, {
					"Gt": [{
						"Path":"p4"
					}, {
						"Path":"p5"
					}]
				}]
			}, {
				"Ne": [{
					"Ge":[{
						"Path":"p6"
					}, {
						"Path":"p7"
					}]
				}, {
					"Le":[{
						"Path":"p8"
					},{
						"Path":"p9"
					}]
				}]
			}]
		};
		
		deepContains(mValue, mExpected, "Value is correct: DynamicExpressions2/com.sap.vocabularies.Test.v1.Data/Value");
		
		oModel.destroy();
	});

	test("CollectionsWithSimpleValues", function() {
		expect(13);

		var mTest = mAdditionalTestsServices["CollectionsWithSimpleValues"];
		var sServiceURI = mTest.service;
		var mModelOptions = {
			annotationURI : mTest.annotations,
			json : true,
			loadAnnotationsJoined: false,
			loadMetadataAsync: false
		};

		var oModel = new sap.ui.model.odata.ODataModel(sServiceURI, mModelOptions);
		var oMetadata = oModel.getServiceMetadata();
		var oAnnotations = oModel.getServiceAnnotations();

		ok(!!oMetadata, "Metadata is available.");
		ok(!!oAnnotations, "Annotations are available.");
		
		ok(!!oAnnotations["CollectionsWithSimpleValues"], "Annotation target is available");
		ok(!!oAnnotations["CollectionsWithSimpleValues"]["com.sap.vocabularies.Test.v1.Data"], "Annotation term is available");

		var mValue = oAnnotations["CollectionsWithSimpleValues"]["com.sap.vocabularies.Test.v1.Data"];
		var mExpected = [
			{ "String": "String01" },
			{ "String": "String02" },
			{ "String": "String03" }
		];
		deepContains(mValue, mExpected, "Value is correct: CollectionsWithSimpleValues/com.sap.vocabularies.Test.v1.Data");
		oModel.destroy();
	});
	
	test("Multiple Simple Values", function() {
		expect(9);
		
		var mTest = mAdditionalTestsServices["Simple Values 2"];
		var sServiceURI = mTest.service;
		var mModelOptions = {
			annotationURI : mTest.annotations,
			json : true,
			loadAnnotationsJoined: false,
			loadMetadataAsync: false
		};

		var oModel = new sap.ui.model.odata.ODataModel(sServiceURI, mModelOptions);
		var oMetadata = oModel.getServiceMetadata();
		var oAnnotations = oModel.getServiceAnnotations();

		ok(!!oMetadata, "Metadata is available.");
		ok(!!oAnnotations, "Annotations are available.");
		
		deepContains(
			oAnnotations["SimpleValues"],
			{
				"com.sap.vocabularies.Test.v1.Data": {
					"String": "String03",
					"Path": "Path02",
					"Int": "4"
				}
			},
			"Multiple String values as array: SimpleValues"
		);
		oModel.destroy();
	});
	
	
	asyncTest("If in Apply", function() {
		expect(57);
		var mTest = mAdditionalTestsServices["If in Apply"];
		var sServiceURI = mTest.service;
		var mModelOptions = {
			annotationURI : mTest.annotations,
			skipMetadataAnnotationParsing: true
		};

		var oModel = new sap.ui.model.odata.v2.ODataModel(sServiceURI, mModelOptions);
		
		oModel.attachAnnotationsLoaded(function() {
			var oMetadata = oModel.getServiceMetadata();
			var oAnnotations = oModel.getServiceAnnotations();
	
			ok(!!oMetadata, "Metadata is available.");
			ok(!!oAnnotations, "Annotations are available.");
			
			deepContains(
				oAnnotations["IfInApply"],
				{
					"com.sap.vocabularies.Test.v1.Data": {
						"Value": {
							"Apply": {
								"Parameters": [{
									"Type": "If",
									"Value": [{
										"Eq": [
											{"Path":"Sex"},
											{"String":"M"}
										]
									}, {
										"String": "Mr. "
									}, {
										"If": [{
											"Eq": [{
												"Path": "Sex"
											}, {
												"String": "F"
											}]
										}, {
											"String": "Mrs. "
										}, {
											"String": ""
										}]
									}]
								}, {
									"Type": "Path",
									"Value": "FirstName"
								}, {
									"Type": "String",
									"Value": ""
								}, {
									"Type": "Path",
									"Value": "LastName"
								}]
							}
						}
					}
				},
				"IfInApply"
			);
			
			oModel.destroy();
			start();
		});
	});
	
	
	
	asyncTest("Other Elements in LabeledElement", function() {
		expect(97);
		var mTest = mAdditionalTestsServices["Other Elements in LabeledElement"];
		var sServiceURI = mTest.service;
		var mModelOptions = {
			annotationURI : mTest.annotations,
			skipMetadataAnnotationParsing: true
		};

		var oModel = new sap.ui.model.odata.v2.ODataModel(sServiceURI, mModelOptions);
		
		oModel.attachAnnotationsLoaded(function() {
			var oMetadata = oModel.getServiceMetadata();
			var oAnnotations = oModel.getServiceAnnotations();
	
			ok(!!oMetadata, "Metadata is available.");
			ok(!!oAnnotations, "Annotations are available.");
			
			deepContains(
				oAnnotations["LabeledElement"], 
				{
					"com.sap.vocabularies.Test.v1.Data": {
						"Url": {
							"UrlRef": {
								"Apply": {
									"Name": "odata.fillUriTemplate",
									"Parameters": [{
										"Type": "String",
										"Value":"#{Bool}/{Date}/{DateTimeOffset}/{Decimal}/{Float}/{Guid}/{Int}/{Path}/{String}/{TimeOfDay}"
									}, {
										"Type":"LabeledElement",
										"Name":"Bool",
										"Value": {
											"Bool": "true"
										}
									}, {
										"Type": "LabeledElement",
										"Name": "Date",
										"Value": {
											"Date": "2015-03-24"
										}
									}, {
										"Type": "LabeledElement",
										"Name": "DateTimeOffset",
										"Value": {
											"DateTimeOffset": "2015-03-24T14:03:27Z"
										}
									}, {
										"Type": "LabeledElement",
										"Name": "Decimal",
										"Value": {
											"Decimal": "-123456789012345678901234567890.1234567890"
										}
									}, {
										"Type": "LabeledElement",
										"Name": "Float",
										"Value": {
											"Float": "-7.4503e-36"
										}
									}, {
										"Type": "LabeledElement",
										"Name": "Guid",
										"Value": {
											"Guid": "0050568D-393C-1ED4-9D97-E65F0F3FCC23"
										}
									}, {
										"Type": "LabeledElement",
										"Name": "Int",
										"Value": {
											"Int": "9007199254740992"
										}
									}, {
										"Type": "LabeledElement",
										"Name": "Path",
										"Value": {
											"Path": "BusinessPartnerID"
										}
									}, {
										"Type": "LabeledElement",
										"Name": "String",
										"Value": {
											"String": "hello, world"
										}
									}, {
										"Type": "LabeledElement",
										"Name": "TimeOfDay",
										"Value": {
											"TimeOfDay": "13:57:06"
										}
									}]
								}
							}
						},
						"RecordType": "com.sap.vocabularies.Test.v1.Data.DataFieldWithUrl"
					},
				},
				"LabeledElement"
			);

			oModel.destroy();
			start();
		});
	});
	
	asyncTest("V2 only: Annotated Metadata - Automated Parsing", function() {
		expect(26);

		var mTestsDone = {
			"annotations": false,
			"metadata":    false,
			// "both":        false,
			"metamodel":   false
		};
		var fnAsyncStart = function(sWhat) {
			mTestsDone[sWhat] = true;
			
			var bAllDone = true;
			for (var sKey in mTestsDone) {
				if (mTestsDone[sKey] !== true) {
					bAllDone = false;
				}
			}
			
			if (bAllDone) {
				// Timeout to make sure no other tests are run due to faulty events
				oModel.destroy();
				oModel2.destroy();
				oModel3.destroy();
				oModel4.destroy();
				window.setTimeout(start, 500);
			}
		}

		var fnTestAnnotations = function(sTestType, oModel, sSource) {
			var oMetadata = oModel.getServiceMetadata();
			var oAnnotations = oModel.getServiceAnnotations();
			
			ok(!!oMetadata, "Metadata is available.");
			ok(!!oAnnotations, "Annotations are available.");
			
			ok(oAnnotations["UnitTest"], "Annotation namespace available");
			ok(oAnnotations["UnitTest"]["Test.From" + sSource],                                    "Annotation from correct source - " + sSource + " (2/5)");
			ok(oAnnotations["UnitTest"]["Test.From" + sSource][0],                                 "Annotation from correct source - " + sSource + " (3/5)");
			ok(oAnnotations["UnitTest"]["Test.From" + sSource][0]["Value"],                        "Annotation from correct source - " + sSource + " (4/5)");
			ok(oAnnotations["UnitTest"]["Test.From" + sSource][0]["Value"]["Path"] === sSource, "Annotation from correct source - " + sSource + " (5/5)");
			
			fnAsyncStart(sTestType);
		};
		
		var fnTestMetaModel = function(oModel, bV4AnnotationsAvailable, sV4AnnotationSource) {
			var sContainerName = oModel.getMetaModel().getProperty("/dataServices/schema/1/entityContainer/0/name");
			var sLabelString  = oModel.getMetaModel().getProperty("/dataServices/schema/0/entityType/0/property/0/com.sap.vocabularies.Common.v1.Label/String")
			var sSource = oModel.getMetaModel().getProperty("/dataServices/schema/0/entityType/0/property/0/annotationSource/String")

			equals(sContainerName, "NorthwindEntities", "EntityContainer \"NorthwindEntities\" available");
			equals(sLabelString, bV4AnnotationsAvailable ? "LabelString" : undefined, "LabelString for \"CategoryID\" is correct"); 
			equals(sSource, sV4AnnotationSource, "Correct annotation source");
		};
		
		
		var mTest = mAdditionalTestsServices["Annotated Metadata"];

		// Don't use metadata/annotations cache
		cleanOdataCache();
		var oModel = new sap.ui.model.odata.v2.ODataModel(mTest.service, {
			skipMetadataAnnotationParsing: false,
			loadAnnotationsJoined: true
		});
		
		// Don't use metadata/annotations cache
		cleanOdataCache();
		var oModel2 = new sap.ui.model.odata.v2.ODataModel(mTest.service, {
			annotationURI: "fakeService://testdata/odata/northwind-annotations-normal.xml",
			skipMetadataAnnotationParsing: true,
			loadAnnotationsJoined: true
		});
		
		// Don't use metadata/annotations cache
		cleanOdataCache();
		var oModel3 = new sap.ui.model.odata.v2.ODataModel(mTest.service, {
			annotationURI: null,
			skipMetadataAnnotationParsing: true,
			loadAnnotationsJoined: true
		});
		
		// Don't use metadata/annotations cache
		cleanOdataCache();
		var oModel4 = new sap.ui.model.odata.v2.ODataModel(mTest.service, {
			annotationURI: "fakeService://testdata/odata/northwind-annotations-normal.xml",
			skipMetadataAnnotationParsing: false,
			loadAnnotationsJoined: true
		});
		
		oModel.attachAnnotationsLoaded(fnTestAnnotations.bind(window, "metadata", oModel, "Metadata"));
		oModel2.attachAnnotationsLoaded(fnTestAnnotations.bind(window, "annotations", oModel2, "Annotations"));
		// No Test for oModel3, since no annotations are loaded
		oModel3.attachAnnotationsLoaded(function() {
			ok(false, "Annotation should not be loaded for this model");
		});
		
		// TODO: Currently the loaded event is fired twice in this case, so it first has the data from Metadata and only
		//       later the data from the annotations file is added. This test should be activated as soon as this 
		//       problem is solved.
		//       Don't forget to change mTestsDone and expect as well
		//oModel4.attachAnnotationsLoaded(fnTestAnnotations.bind(window, "both", oModel4, "Annotations"));
		
		// Check availability of data in ODataMetaModel
		Promise.all([oModel.getMetaModel().loaded(), oModel2.getMetaModel().loaded(), oModel3.getMetaModel().loaded(), oModel4.getMetaModel().loaded()]).then(function() {
			fnTestMetaModel(oModel, true, "Metadata");     // Annotations only from metadata document
			fnTestMetaModel(oModel2, true, "Annotations"); // Annotations only from separate annotation file
			fnTestMetaModel(oModel3, false);               // No annotations
			fnTestMetaModel(oModel4, true, "Annotations"); // Anotations from metadata and annotation file
			
			fnAsyncStart("metamodel");
		}, function() {
			ok(false, "ODataMetaModel loading failed");
		});
	});

	asyncTest("Apply in If", function() {
		expect(71);

		var mTest = mAdditionalTestsServices["Apply in If"];

		var oModel = new sap.ui.model.odata.ODataModel(mTest.service, {
			annotationURI : mTest.annotations,
		});
		

		oModel.attachAnnotationsLoaded(function() {
			var oMetadata = oModel.getServiceMetadata();
			var oAnnotations = oModel.getServiceAnnotations();
			
			ok(!!oMetadata, "Metadata is available.");
			ok(!!oAnnotations, "Annotations are available.");
			
			deepContains(
				oAnnotations["ApplyInIf"],			
				{
					"ui5.test.1": {
						"Value": { 
							"If": [{
								"Ne": [{
									"Path": "EmailAddress"
								}, {
									"Null": null
								}]
							}, {
								"Apply": {
									"Name": "odata.concat",
									"Parameters": [{
										"Type": "String", 
										"Value": "mailto:"
									}, {
										"Type": "Path",
										"Value": "EmailAddress"
									}]
								}
							}, {
								"Null": null
							}]
						},
						"RecordType": "Value"
					},
					"ui5.test.2": {
						"Url":{
							"UrlRef": {
								"If": [{
									"Ne": [{
										"Path":"EmailAddress"
									}, {
										"Null": null
									}]
								}, {
									"Apply": {
										"Name": "odata.concat",
										"Parameters": [{
											"Type":"String",
											"Value":"mailto:"
										}, {
											"Type":"Path",
											"Value":"EmailAddress"
										}]
									}
								}, {
									"Null": null
								}]
							}
						},
						"RecordType": "WithUrlRef"
					}
				},
				"Correct values in ApplyInIf"
			);
			
			oModel.destroy();
			start();
		});
	});

	asyncTest("V2: Apply in If", function() {
		expect(71);

		var mTest = mAdditionalTestsServices["Apply in If"];

		var oModel = new sap.ui.model.odata.v2.ODataModel(mTest.service, {
			annotationURI : mTest.annotations,
			skipMetadataAnnotationParsing: true,
		});
		

		oModel.attachAnnotationsLoaded(function() {
			var oMetadata = oModel.getServiceMetadata();
			var oAnnotations = oModel.getServiceAnnotations();
			
			ok(!!oMetadata, "Metadata is available.");
			ok(!!oAnnotations, "Annotations are available.");
			
			deepContains(
				oAnnotations["ApplyInIf"],			
				{
					"ui5.test.1": {
						"Value": { 
							"If": [{
								"Ne": [{
									"Path": "EmailAddress"
								}, {
									"Null": null
								}]
							}, {
								"Apply": {
									"Name": "odata.concat",
									"Parameters": [{
										"Type": "String", 
										"Value": "mailto:"
									}, {
										"Type": "Path",
										"Value": "EmailAddress"
									}]
								}
							}, {
								"Null": null
							}]
						},
						"RecordType": "Value"
					},
					"ui5.test.2": {
						"Url":{
							"UrlRef": {
								"If": [{
									"Ne": [{
										"Path":"EmailAddress"
									}, {
										"Null": null
									}]
								}, {
									"Apply": {
										"Name": "odata.concat",
										"Parameters": [{
											"Type":"String",
											"Value":"mailto:"
										}, {
											"Type":"Path",
											"Value":"EmailAddress"
										}]
									}
								}, {
									"Null": null
								}]
							}
						},
						"RecordType": "WithUrlRef"
					}
				},
				"Correct values in ApplyInIf"
			);
			
			oModel.destroy();
			start();
		});
	});
	
	
	
	asyncTest("V2: Joined Loading with automated $metadata parsing", function() {
		expect(16);

		var mTest = mAdditionalTestsServices["Joined Loading with automated $metadata parsing"];

		var oModel = new sap.ui.model.odata.v2.ODataModel(mTest.service, {
			annotationURI : mTest.annotations,
			skipMetadataAnnotationParsing: false,
			loadAnnotationsJoined: true
		});
		
		
		var oModel2 = new sap.ui.model.odata.v2.ODataModel(mTest.service, {
			annotationURI : mTest.annotations,
			skipMetadataAnnotationParsing: false,
			loadAnnotationsJoined: false
		});

		var iCount = 0;
		var fnTestAllAnnotations = function() {
			var oMetadata = oModel.getServiceMetadata();
			var oAnnotations = oModel.getServiceAnnotations();
			
			ok(!!oMetadata, "Metadata is available.");
			ok(!!oAnnotations, "Annotations are available.");
			
			equals(oAnnotations.UnitTest["Test.FromAnnotations"][0].Value.Path, "Annotations", "Annotation from correct source (Annotations)");
			equals(oAnnotations.UnitTest["Test.FromMetadata"][0].Value.Path, "Metadata", "Annotation from correct source (Metadata)");
			equals(oAnnotations.UnitTest["Test.Merged"][0].Value.Path, "Annotations", "Merged annotations filled");
			
			
			equal(oAnnotations["internal.ui5.test.MultipleAnnotations"]["internal.ui5.test.FromFirst"]["String"], "First", "FromFirst annotation filled from first source");
			equal(oAnnotations["internal.ui5.test.MultipleAnnotations"]["internal.ui5.test.FromSecond"]["String"], "Second", "FromFirst annotation filled from Second source");
			equal(oAnnotations["internal.ui5.test.MultipleAnnotations"]["internal.ui5.test.FromThird"]["String"], "Third", "FromFirst annotation filled from Second source");
			
			++iCount;
			if (iCount == 2) {
				// Make sure no additional events are fired afterwards
				oModel.destroy();
				oModel2.destroy();
				setTimeout(start, 500);
			} else if(iCount > 2) {
				ok(false, "Too many events have been fired");
			}
		}
		
		oModel.attachMetadataLoaded(fnTestAllAnnotations);
		oModel2.attachAnnotationsLoaded(fnTestAllAnnotations);
	});


	var fnTestAnnotationInRecord = function(iModelVersion) {
		expect(54);

		var mTest = mAdditionalTestsServices["Default Annotated Service"];
		var oModel = fnCreateModel(iModelVersion, mTest.service, mTest.annotations);

		oModel.attachAnnotationsLoaded(function() {
			var oMetadata = oModel.getServiceMetadata();
			var oAnnotations = oModel.getServiceAnnotations();
			
			ok(!!oMetadata, "Metadata is available.");
			ok(!!oAnnotations, "Annotations are available.");
			
			
			ok(!!oAnnotations["Test.AnnotationInRecord"], "Outer Annotations container exists");
			ok(!!oAnnotations["Test.AnnotationInRecord"]["Test.AnnotationInRecord.Case1"], "Outer Annotation exists");
			
			var mTestCase1 = oAnnotations["Test.AnnotationInRecord"]["Test.AnnotationInRecord.Case1"];
			
			deepContains(mTestCase1, {
				"Test.AnnotationInRecord.Case1.Record.SubAnnotation1": {
					"String": "SubAnnotation1"
				},
				"Label": {
					"String": "Label1"
				},
				"Test.AnnotationInRecord.Case1.Record.SubAnnotation2": {
					"If" : [{
						"Eq": [{
							"Path": "Condition" 
						}, {
							"Bool": "false"
						}]
					}, {
						"String": "ConditionalValue"
					}]
				},
				"RecordType": "Test.AnnotationInRecord.Case1.Record"
			}, "Case 1 Annotation has correct values");

			var mTestCase2 = oAnnotations["Test.AnnotationInRecord"]["Test.AnnotationInRecord.Case2"];
			
			deepContains(mTestCase2, {
				"Test.AnnotationInRecord.Case2.Record.SubAnnotation1": {
					"String": "SubAnnotation1"
				},
				"Label": {
					"String": "Annotation"
				},
				"Test.AnnotationInRecord.Case2.Record.SubAnnotation2": {
					"If" : [{
						"Eq": [{
							"Path": "Condition" 
						}, {
							"Bool": "false"
						}]
					}, {
						"String": "ConditionalValue"
					}]
				},
				"RecordType": "Test.AnnotationInRecord.Case2.Record"
			}, "Case 2 Annotation has correct values");
			
			var mTestCase3 = oAnnotations["Test.AnnotationInRecord"]["Test.AnnotationInRecord.Case3"];

			deepContains(mTestCase3, {
				"Null": null,
				"RecordType": "Test.AnnotationInRecord.Case3.Record"
			}, "Case 3 has correct values");

			oModel.destroy();
			start();
		});
	}
	
	asyncTest("V1: Annotation in Record", fnTestAnnotationInRecord.bind(this, 1));
	asyncTest("V2: Annotation in Record", fnTestAnnotationInRecord.bind(this, 2));
	
	
	
	
	var fnTestEmptyCollection = function(iModelVersion) {
		expect(15);

		var mTest = mAdditionalTestsServices["Empty collection"];
		var oModel = fnCreateModel(iModelVersion, mTest.service, mTest.annotations);

		oModel.attachAnnotationsLoaded(function() {
			var oMetadata = oModel.getServiceMetadata();
			var oAnnotations = oModel.getServiceAnnotations();
			
			ok(!!oMetadata, "Metadata is available.");
			ok(!!oAnnotations, "Annotations are available.");
			
			deepContains(
				oAnnotations["ui5.test.Annotation"],
				{
					"ui5.test.FilledCollection": [
							{"String":"THIS"},
							{"String":"IS"},
							{"String":"ODATA!"}
					],
					"ui5.test.EmptyCollection": []
				},
				"Collections are correctly parsed as arrays"
			);
			
			oModel.destroy();
			start();
		});
	};
	
	asyncTest("V1: Empty collection", fnTestEmptyCollection.bind(this, 1));
	asyncTest("V2: Empty collection", fnTestEmptyCollection.bind(this, 2));


	var fnTestEmptyCollection = function(iModelVersion) {
		expect(10);

		var mTest = mAdditionalTestsServices["Multiple Enums"];
		var oModel = fnCreateModel(iModelVersion, mTest.service, mTest.annotations);
		
		oModel.attachAnnotationsLoaded(function() {
			var oMetadata = oModel.getServiceMetadata();
			var oAnnotations = oModel.getServiceAnnotations();
			
			ok(!!oMetadata, "Metadata is available.");
			ok(!!oAnnotations, "Annotations are available.");
			
			deepContains(
				oAnnotations["ui5.test.Annotation"],
				{
					"ui5.test.SimpleEnum": {
						"Test": {
							"EnumMember" : "ui5.test.Value"
						}
					},
					"ui5.test.MultipleEnums": {
						"Test": {
							"EnumMember" : "ui5.test.Value1 ui5.test.Value2"
						}
					}
				},
				"Multiple Enums have their aliases correctly replaced"
			);
			
			oModel.destroy();
			start();
		});
	};
	
	asyncTest("V1: Multiple Enums", fnTestEmptyCollection.bind(this, 1));
	asyncTest("V2: Multiple Enums", fnTestEmptyCollection.bind(this, 2));
	

	
	var fnTestCachedValueLists = function(iModelVersion) {
		expect(49);

		var mTest = mAdditionalTestsServices["Cached Value Lists"];
		var oModel = fnCreateModel(iModelVersion, mTest.service, mTest.annotations);

		new Promise(function(fnResolve) {
			// Only react to annotationsLoaded once...
			oModel.attachAnnotationsLoaded(fnResolve);
		}).then(function() {
			var oMetadata = oModel.getServiceMetadata();
			var oAnnotations = oModel.getServiceAnnotations();
			
			ok(!!oMetadata, "Metadata is available.");
			ok(!!oAnnotations, "Annotations are available.");
			
			ok(true, "Annotations (Metadata) for Model 1 loaded.");

			deepContains(
				oAnnotations["ui5.test.Annotation"], 
				{ 
					"ui5.test.SimpleAnnotation": { 
						"String": "From Metadata"
					}
				},
				"Test Annotation available: ui5.test.Annotation"
			);
			
			oModel.addAnnotationUrl(mTest.service + "$metadata?sap-value-list=1").then(function(oParams) {
				var oAnnotations = oModel.getServiceAnnotations();

				ok(true, "Annotations (Value List 1) for Model 1 loaded.");

				deepContains(
					oAnnotations["ui5.test.Annotation"], 
					{ 
						"ui5.test.SimpleAnnotation": { 
							"String": "From Metadata"
						},
						"ui5.test.SimpleAnnotation-1": { 
							"String": "From Metadata"
						}
					},
					"Test Annotation available: ui5.test.Annotation"
				);

				oModel.addAnnotationUrl(mTest.service + "$metadata?sap-value-list=2").then(function(oParams) {
					var oAnnotations = oModel.getServiceAnnotations();

					ok(true, "Annotations (Value List 2) for Model 1 loaded.");

					deepContains(
						oAnnotations["ui5.test.Annotation"], 
						{ 
							"ui5.test.SimpleAnnotation": { 
								"String": "From Metadata"
							},
							"ui5.test.SimpleAnnotation-1": { 
								"String": "From Metadata"
							},
							"ui5.test.SimpleAnnotation-2": { 
								"String": "From Metadata"
							}
						},
						"Test Annotation available: ui5.test.Annotation"
					);
					
					oModel.addAnnotationUrl(mTest.service + "$metadata?sap-value-list=3").then(function(oParams) {
						var oAnnotations = oModel.getServiceAnnotations();
						
						ok(true, "Annotations (Value List 3) for Model 1 loaded.");
						
						deepContains(
							oAnnotations["ui5.test.Annotation"], 
							{ 
								"ui5.test.SimpleAnnotation": { 
									"String": "From Metadata"
								},
								"ui5.test.SimpleAnnotation-1": { 
									"String": "From Metadata"
								},
								"ui5.test.SimpleAnnotation-2": { 
									"String": "From Metadata"
								},
								"ui5.test.SimpleAnnotation-3": { 
									"String": "From Metadata"
								}
							},
							"Test Annotation available: ui5.test.Annotation"
						);
						
						// equal(oModel.getProperty("/#VL_CH_ANLA/BUKRS/@sap:label"), "Company Code", "Annotation EntityType loaded");
						// ok(oModel.getProperty("/#UpdatableItem/CompanyCode/@sap:label"), "Company Code");
						
						oModel.destroy();
						fnCachedModelTest();
					});
				});
			});
		});
		
		var fnCachedModelTest = function() {
			var oModel2 = fnCreateModel(iModelVersion, mTest.service, mTest.annotations);
			
			oModel2.attachAnnotationsLoaded(function() {
				// All annotations should be there from cache
				ok(true, "(Cached) Annotations for Model 2 loaded.");
				
				var oAnnotations = oModel2.getServiceAnnotations();
				
				deepContains(
					oAnnotations["ui5.test.Annotation"], 
					{ 
						"ui5.test.SimpleAnnotation": { 
							"String": "From Metadata"
						},
						"ui5.test.SimpleAnnotation-1": { 
							"String": "From Metadata"
						},
						"ui5.test.SimpleAnnotation-2": { 
							"String": "From Metadata"
						},
						"ui5.test.SimpleAnnotation-3": { 
							"String": "From Metadata"
						}
					},
					"Test Annotation available: ui5.test.Annotation"
				);

				oModel2.destroy();
				start();
			});
			
		};
		
	};

	asyncTest("V1: Cached Value Lists", fnTestCachedValueLists.bind(this, 1));
	asyncTest("V2: Cached Value Lists", fnTestCachedValueLists.bind(this, 2));


	var fnTestCachedMetadataValueLists = function(iModelVersion) {
		expect(14);
		
		var mTest = mAdditionalTestsServices["Cached Value Lists"];
		var sServiceUrl1 = mTest.service + "?sap-value-list=1";
		var sServiceUrl2 = mTest.service + "?sap-value-list=2";
		
		var oModel = fnCreateModel(iModelVersion, sServiceUrl1, mTest.annotations);
		oModel.attachAnnotationsLoaded(function() {
			// Model3 should now have the value-lists "1"
			ok(true, "Annotations for Model loaded.");
			
			var oAnnotations = oModel.getServiceAnnotations();

			deepContains(
				oAnnotations["ui5.test.Annotation"], 
				{ 
					"ui5.test.SimpleAnnotation": { 
						"String": "From Metadata"
					},
					"ui5.test.SimpleAnnotation-1": { 
						"String": "From Metadata"
					}
				},
				"Test Annotation available: ui5.test.Annotation"
			);
			
			
			var oModel2 = fnCreateModel(iModelVersion, sServiceUrl2, mTest.annotations);
			
			oModel2.attachAnnotationsLoaded(function() {
				// Model4 should now have the value lists "2"
				ok(true, "Annotations for Model 2 loaded.");
				
				var oAnnotations = oModel2.getServiceAnnotations();
				
				deepContains(
					oAnnotations["ui5.test.Annotation"], 
					{ 
						"ui5.test.SimpleAnnotation": { 
							"String": "From Metadata"
						},
						"ui5.test.SimpleAnnotation-2": { 
							"String": "From Metadata"
						}
					},
					"Test Annotation available: ui5.test.Annotation"
				);
				
				oModel.destroy();
				oModel2.destroy();
				start();
				
			});
			
		});
	};

	asyncTest("V1: Cached Value Lists with Service-URL-Parameters", fnTestCachedMetadataValueLists.bind(this, 1));
	asyncTest("V2: Cached Value Lists with Service-URL-Parameters", fnTestCachedMetadataValueLists.bind(this, 2));

	var fnTestCachedMetadataValueListsAdditionParameters = function(iModelVersion) {
		expect(14);
		
		var mTest = mAdditionalTestsServices["Cached Value Lists"];
		var mMetadataUrlParams1 = {
			"sap-value-list": "1"
		};
		var mMetadataUrlParams2 = {
			"sap-value-list": "2"
		};
		
		var oModel = fnCreateModel(iModelVersion, mTest.service, mTest.annotations, mMetadataUrlParams1);
		
		new Promise(function(fnResolve) {
			// Only react to annotationsLoaded once...
			oModel.attachAnnotationsLoaded(fnResolve);
		}).then(function() {
			// Model3 should now have the value-lists "1"
			ok(true, "Annotations for Model loaded.");
			
			var oAnnotations = oModel.getServiceAnnotations();

			deepContains(
				oAnnotations["ui5.test.Annotation"], 
				{ 
					"ui5.test.SimpleAnnotation": { 
						"String": "From Metadata"
					},
					"ui5.test.SimpleAnnotation-1": { 
						"String": "From Metadata"
					}
				},
				"Test Annotation available: ui5.test.Annotation"
			);
			
			
			var oModel2 = fnCreateModel(iModelVersion, mTest.service, mTest.annotations, mMetadataUrlParams2);
			
			oModel2.attachAnnotationsLoaded(function() {
				// Model4 should now have the value lists "2"
				ok(true, "Annotations for Model 2 loaded.");
				
				var oAnnotations = oModel2.getServiceAnnotations();
				
				deepContains(
					oAnnotations["ui5.test.Annotation"], 
					{ 
						"ui5.test.SimpleAnnotation": { 
							"String": "From Metadata"
						},
						"ui5.test.SimpleAnnotation-2": { 
							"String": "From Metadata"
						}
					},
					"Test Annotation available: ui5.test.Annotation"
				);
				
				oModel.destroy();
				oModel2.destroy();
				start();
				
			});
			
		});
	};

	asyncTest("V1: Cached Value Lists with additional Metadata Parameters", fnTestCachedMetadataValueListsAdditionParameters.bind(this, 1));
	asyncTest("V2: Cached Value Lists with additional Metadata Parameters", fnTestCachedMetadataValueListsAdditionParameters.bind(this, 2));


}
