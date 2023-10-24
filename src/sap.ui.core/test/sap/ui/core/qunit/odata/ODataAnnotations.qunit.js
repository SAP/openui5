sap.ui.define([
	"sap/base/Log",
	"sap/base/i18n/Localization",
	"sap/ui/core/qunit/odata/data/ODataAnnotationsFakeService",
	"sap/ui/model/odata/ODataAnnotations",
	"sap/ui/model/odata/ODataModel",
	"sap/ui/model/odata/v2/ODataModel",
	"sap/ui/util/XMLHelper",
	"sap/ui/qunit/utils/nextUIUpdate"
], function(Log, Localization, fakeService, ODataAnnotations, V1ODataModel, V2ODataModel, XMLHelper, nextUIUpdate) {
	"use strict";

	/*global QUnit, sinon */
	/*eslint max-nested-callbacks: 0 */

	/**
	 * Test-Function to be used in place of deepEquals which only tests for the existence of the given
	 * values, not the absence of others.
	 *
	 * @param {object} assert - The QUnit assert object
	 * @param {object} oValue - The value to be tested
	 * @param {object} oExpected - The value that is tested against, containing the structure expected inside oValue
	 * @param {string} sMessage - Message prefix for every sub-test. The property names of the structure will be prepended to this string
	 */
	function deepContains(assert, oValue, oExpected, sMessage) {
		for (var sKey in oExpected) {

			if (!(sKey in oValue)) {
				assert.ok(false, "Expected property " + sMessage + "/" + sKey + " does not exist");
				continue;
			}

			if (Array.isArray(oExpected[sKey]) === Array.isArray(oValue[sKey])) {
				assert.equal(typeof oValue[sKey], typeof oExpected[sKey], sMessage + "/" + sKey + " have same type");
			} else {
				assert.ok(false, sMessage + "/" + sKey + " - one is an array, the other is not");
			}


			if (Array.isArray(oExpected[sKey]) && Array.isArray(oValue[sKey])) {
				assert.equal(oValue[sKey].length, oExpected[sKey].length, sMessage + "/" + sKey + " length matches (" + oExpected[sKey].length + ")");
			}

			if (oExpected[sKey] !== null && oExpected[sKey] !== undefined && typeof oExpected[sKey] === "object" && typeof oValue[sKey] === "object") {
				// Go deeper
				if (oValue[sKey] === null) {
					assert.ok(false, "Property " + sMessage + "/" + sKey + " is null");
				} else {
					deepContains(assert, oValue[sKey], oExpected[sKey], sMessage + "/" + sKey);
				}
			} else {
				// Compare directly
				assert.equal(oValue[sKey], oExpected[sKey], sMessage + "/" + sKey + " match (" + oExpected[sKey] + ")");
			}
		}
	}

	function fnCreateModel(assert, iModelVersion, sServiceUrl, aAnnotationUrls, mMetadataUrlParams) {
		var oModel, bUnknownModelVersion = true;
		/** @deprecated As of version 1.48.0, reason sap.ui.model.odata.ODataModel */
		if (iModelVersion == 1) {
			oModel = new V1ODataModel(sServiceUrl, {
				annotationURI : aAnnotationUrls,
				loadMetadataAsync: true,
				metadataUrlParams: mMetadataUrlParams
			});
			bUnknownModelVersion = false;
		}
		if (iModelVersion == 2) {
			oModel = new V2ODataModel(sServiceUrl, {
				annotationURI : aAnnotationUrls,
				metadataUrlParams: mMetadataUrlParams
			});
			bUnknownModelVersion = false;
		}
		if (bUnknownModelVersion){
			assert.ok(false, "Unknown ODataModel version requested for test: " + iModelVersion);
		}
		return oModel;
	}

	function cleanOdataCache() {
		/** @deprecated As of version 1.48.0, reason sap.ui.model.odata.ODataModel */
		V1ODataModel.mServiceData = {};
		V2ODataModel.mSharedData = {server: {}, service: {}, meta: {}};
	}

	QUnit.config.testTimeout = 6000;

	var aServices = [{
		name			 : "Northwind",
		service		  : "fakeService://testdata/odata/northwind/",
		annotations	  : "fakeService://testdata/odata/northwind-annotations-normal.xml",
		serviceValid	 : true,
		annotationsValid : "all"
	}, {
		name			 : "Northwind",
		service		  : "fakeService://testdata/odata/northwind/",
		annotations	  : "fakeService://testdata/odata/northwind-annotations-malformed.xml",
		serviceValid	 : true,
		annotationsValid : "none"
	}, {
		name			 : "Northwind",
		service		  : "fakeService://testdata/odata/northwind/",
		annotations	  : "fakeService://testdata/odata/NOT_EXISTENT",
		serviceValid	 : true,
		annotationsValid : "none"
	},{
		name			 : "Invalid",
		service		  : "fakeService://testdata/odata/NOT_EXISTENT/",
		annotations	  : "fakeService://testdata/odata/NOT_EXISTENT",
		serviceValid	 : false,
		annotationsValid : "none"
	},{
		name			 : "Complex EPM",
		service		  : "fakeService://testdata/odata/northwind/",
		annotations	  : "fakeService://testdata/odata/epm-annotations-complex.xml",
		serviceValid	 : true,
		annotationsValid : "all"
	},{
		name			 : "Northwind",
		service		  : "fakeService://testdata/odata/northwind/",
		annotations	  : "fakeService://testdata/odata/northwind-annotations-normal.xml",
		serviceValid	 : true,
		annotationsValid : "all",
		sharedMetadata   : true
	}, {
		name			 : "Northwind",
		service		  : "fakeService://testdata/odata/northwind/",
		annotations	  : "fakeService://testdata/odata/northwind-annotations-malformed.xml",
		serviceValid	 : true,
		annotationsValid : "none",
		sharedMetadata   : true
	}, {
		name			 : "Northwind",
		service		  : "fakeService://testdata/odata/northwind/",
		annotations	  : "fakeService://testdata/odata/NOT_EXISTENT",
		serviceValid	 : true,
		annotationsValid : "none",
		sharedMetadata   : true
	},{
		name			 : "Invalid",
		service		  : "fakeService://testdata/odata/NOT_EXISTENT/",
		annotations	  : "fakeService://testdata/odata/NOT_EXISTENT",
		serviceValid	 : false,
		annotationsValid : "none",
		sharedMetadata   : true
	},{
		name			 : "Northwind with annotated metadata",
		service		  : "fakeService://testdata/odata/northwind-annotated/",
		annotations	  : "fakeService://testdata/odata/northwind-annotated/$metadata",
		serviceValid	 : true,
		annotationsValid : "all",
		sharedMetadata   : true
	},{
		name			 : "Northwind with annotated metadata + annotations",
		service		  : "fakeService://testdata/odata/northwind-annotated/",
		annotations	  : [
			"fakeService://testdata/odata/northwind-annotated/$metadata",
			"fakeService://testdata/odata/northwind-annotations-normal.xml"
		],
		serviceValid	 : true,
		annotationsValid : "some",
		sharedMetadata   : true
	},{
		name			 : "Northwind with annotated metadata + annotations",
		service		  : "fakeService://testdata/odata/northwind-annotated/",
		annotations	  : [
			"fakeService://testdata/odata/northwind-annotated/$metadata",
			"fakeService://testdata/odata/northwind-annotations-malformed.xml"
		],
		serviceValid	 : true,
		annotationsValid : "some",
		sharedMetadata   : true
	}];

	// Additional tests that have extra tests and should thus be referable by name. For this the name
	// of the test is not added as property of the test but as key in the map
	var mAdditionalTestsServices = {
		"Default Annotated Service": {
			service		  : "fakeService://testdata/odata/northwind/",
			annotations	  : "fakeService://testdata/odata/northwind-annotations-normal.xml",
			serviceValid	 : true,
			annotationsValid : "all"
		},
		"Apply Function": {
			service		  : "fakeService://testdata/odata/northwind/",
			annotations	  : "fakeService://testdata/odata/apply-function-test.xml",
			serviceValid	 : true,
			annotationsValid : "all"
		},
		"Multiple Property Annotations": {
			service		  : "fakeService://testdata/odata/northwind/",
			annotations	  : "fakeService://testdata/odata/multiple-property-annotations.xml",
			serviceValid	 : true,
			annotationsValid : "all"
		},
		"Property Annotation Qualifiers": {
			service		  : "fakeService://testdata/odata/northwind/",
			annotations	  : "fakeService://testdata/odata/property-annotation-qualifiers.xml",
			serviceValid	 : true,
			annotationsValid : "all"
		},
		"Other Property Values": {
			service		  : "fakeService://testdata/odata/northwind/",
			annotations	  : "fakeService://testdata/odata/other-property-values.xml",
			serviceValid	 : true,
			annotationsValid : "all"
		},
		"Aliases in Namespaces": {
			service		  : "fakeService://testdata/odata/northwind/",
			annotations	  : "fakeService://testdata/odata/namespaces-aliases.xml",
			serviceValid	 : true,
			annotationsValid : "all"
		},
		"Namespaces in Other Property Values": {
			service		  : "fakeService://testdata/odata/northwind/",
			annotations	  : "fakeService://testdata/odata/other-property-value-aliases.xml",
			serviceValid	 : true,
			annotationsValid : "all"
		},
		"Text Properties" : {
			service		  : "fakeService://testdata/odata/northwind/",
			annotations	  : "fakeService://testdata/odata/other-property-textproperties.xml",
			serviceValid	 : true,
			annotationsValid : "all"
		},
		"Entity Containers": {
			service		  : "fakeService://testdata/odata/sapdata01/",
			annotations	  : "fakeService://testdata/odata/sapdata01/$metadata",
			serviceValid	 : true,
			annotationsValid : "all"
		},
		"Simple Values": {
			service		  : "fakeService://testdata/odata/sapdata01/",
			annotations	  : "fakeService://testdata/odata/simple-values.xml",
			serviceValid	 : true,
			annotationsValid : "all"
		},
		"Collection with Namespace": {
			service		  : "fakeService://testdata/odata/sapdata01/",
			annotations	  : "fakeService://testdata/odata/collection-with-namespace.xml",
			serviceValid	 : true,
			annotationsValid : "all"
		},
		"UrlRef": {
			service		  : "fakeService://testdata/odata/sapdata01/",
			annotations	  : "fakeService://testdata/odata/UrlRef.xml",
			serviceValid	 : true,
			annotationsValid : "all"
		},
		"Delayed Loading": {
			service		  : "fakeService://testdata/odata/sapdata01/",
			annotations	  : [
				"fakeService://testdata/odata/multiple-annotations-01.xml",
				"fakeService://testdata/odata/multiple-annotations-02.xml",
				"fakeService://testdata/odata/multiple-annotations-03.xml"
			],
			serviceValid	 : true,
			annotationsValid : "all"
		},
		"Alias Replacement": {
			service		  : "fakeService://testdata/odata/sapdata01/",
			annotations	  : "fakeService://testdata/odata/Aliases.xml",
			serviceValid	 : true,
			annotationsValid : "all"
		},
		"DynamicExpressions": {
			service		  : "fakeService://testdata/odata/sapdata01/",
			annotations	  : "fakeService://testdata/odata/DynamicExpressions.xml",
			serviceValid	 : true,
			annotationsValid : "all"
		},
		"DynamicExpressions2": {
			service		  : "fakeService://testdata/odata/sapdata01/",
			annotations	  : "fakeService://testdata/odata/DynamicExpressions2.xml",
			serviceValid	 : true,
			annotationsValid : "all"
		},
		"CollectionsWithSimpleValues": {
			service		  : "fakeService://testdata/odata/sapdata01/",
			annotations	  : "fakeService://testdata/odata/collections-with-simple-values.xml",
			serviceValid	 : true,
			annotationsValid : "all"
		},
		"Simple Values 2": {
			service		  : "fakeService://testdata/odata/sapdata01/",
			annotations	  : "fakeService://testdata/odata/simple-values-2.xml",
			serviceValid	 : true,
			annotationsValid : "all"
		},
		"If in Apply": {
			service		  : "fakeService://testdata/odata/sapdata01/",
			annotations	  : "fakeService://testdata/odata/if-in-apply.xml",
			serviceValid	 : true,
			annotationsValid : "all"
		},
		"Other Elements in LabeledElement": {
			service		  : "fakeService://testdata/odata/sapdata01/",
			annotations	  : "fakeService://testdata/odata/labeledelement-other-values.xml",
			serviceValid	 : true,
			annotationsValid : "all"
		},
		"Annotated Metadata": {
			service		  : "fakeService://testdata/odata/northwind-annotated/",
			annotations	  : null,
			serviceValid	 : true,
			annotationsValid : "metadata"
		},
		"Apply in If": {
			service		  : "fakeService://testdata/odata/northwind/",
			annotations	  : "fakeService://testdata/odata/apply-in-if.xml",
			serviceValid	 : true,
			annotationsValid : "all"
		},
		"Joined Loading with automated $metadata parsing": {
			service		  : "fakeService://testdata/odata/northwind-annotated/",
			annotations	  : [
				"fakeService://testdata/odata/northwind-annotations-normal.xml",
				"fakeService://testdata/odata/multiple-annotations-01.xml",
				"fakeService://testdata/odata/multiple-annotations-02.xml",
				"fakeService://testdata/odata/multiple-annotations-03.xml"
			],
			serviceValid	 : true,
			annotationsValid : "all"
		},
		"Empty collection": {
			service		  : "fakeService://testdata/odata/northwind/",
			annotations	  : "fakeService://testdata/odata/empty-collection.xml",
			serviceValid	 : true,
			annotationsValid : "all"
		},
		"Multiple Enums": {
			service		  : "fakeService://testdata/odata/northwind/",
			annotations	  : "fakeService://testdata/odata/multiple-enums.xml",
			serviceValid	 : true,
			annotationsValid : "all"
		},
		"Cached Value Lists": {
			service		  : "fakeService://testdata/odata/valuelists/",
			annotations	  : null,
			serviceValid	 : true,
			annotationsValid : "metadata"
		},
		"Overwrite on Term Level": {
			service		  : "fakeService://testdata/odata/valuelists/",
			annotations	  : [
				"fakeService://testdata/odata/overwrite-on-term-level-1",
				"fakeService://testdata/odata/overwrite-on-term-level-2"
			],
			serviceValid	 : true,
			annotationsValid : "all"
		},
		"EDMType for NavigationProperties": {
			service		  : "fakeService://testdata/odata/northwind/",
			annotations	  : [
				"fakeService://testdata/odata/edmtype-for-navigationproperties"
			],
			serviceValid	 : true,
			annotationsValid : "all"
		},
		"Nested Annotations": {
			service		  : "fakeService://testdata/odata/northwind/",
			annotations	  : [
				"fakeService://testdata/odata/nested-annotations"
			],
			serviceValid	 : true,
			annotationsValid : "all"
		}

	};

	var	mTest, sTestName, sServiceURI, mModelOptions, bServiceValid, bAnnotationsValid, sAnnotationsValid, bSharedMetadata,
		sTestType, fnTest, mService, oAnnotations, i;

	// Add additional tests to stadard tests as well
	for (var sName in mAdditionalTestsServices) {
		mTest = mAdditionalTestsServices[sName];
		mTest.name = sName;
		aServices.push(mTest);
	}

/** @deprecated As of version 1.48.0, reason sap.ui.model.odata.ODataModel */
(function() {
	QUnit.module("Synchronous loading");

	fnTest = function(sServiceURI, mModelOptions, bServiceValid, sAnnotationsValid, bSharedMetadata) {
		return function(assert) {
			if (!bSharedMetadata){
				cleanOdataCache();
			}
			var oModel = new V1ODataModel(sServiceURI, mModelOptions);
			// Since this is synchronous, everything should be ready right now.

			var oMetadata = oModel.getServiceMetadata();
			var oAnnotations = oModel.getServiceAnnotations();

			// private member used because oModel.annotationsLoaded() returns null
			oModel.pAnnotationsLoaded.catch(() => {/* avoid Uncaught (in promise) */});

			if (bServiceValid) {
				if (sAnnotationsValid === "all" || sAnnotationsValid === "some") {
					// This should have worked.
					assert.ok(oMetadata, "Metadata is available.");
					assert.ok(Object.keys(oAnnotations).length > 0, "Annotations are available.");
				} else {
					// Service Metadata should be there, annotations should not be loaded
					assert.ok(oMetadata, "Metadata is available.");
					assert.ok(!oAnnotations || Object.keys(oAnnotations).length === 0, "Annotations are not available.");
				}
			} else {
				// Service is invalid, so both should not be there
				assert.ok(!oMetadata, "Metadata is not available.");
				assert.ok(!oAnnotations || Object.keys(oAnnotations).length === 0, "Metadata is not available.");
			}
		};
	};

	for (i = 0; i < aServices.length; ++i) {
		sServiceURI = aServices[i].service;
		mModelOptions = {
			annotationURI : aServices[i].annotations,
			json : true
		};
		bServiceValid	 = aServices[i].serviceValid;
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

		QUnit.test(sTestType, fnTest(sServiceURI, mModelOptions, bServiceValid, sAnnotationsValid));
	}

	QUnit.module("Asynchronous loading");

	fnTest = function(sServiceURI, mModelOptions, bServiceValid, sAnnotationsValid, bSharedMetadata) {
		return function(assert) {
			if (!bSharedMetadata){
				cleanOdataCache();
			}
			var oModel = new V1ODataModel(sServiceURI, mModelOptions);

			var bMetadataLoaded = false;
			var bAnnotationsLoaded = false;

			var fnResolveMetadata, fnRejectMetadata, fnResolveAnnotations, fnRejectAnnotations,
				oAnnotationsPromise = new Promise(function (resolve, reject) {
					fnResolveAnnotations = resolve;
					fnRejectAnnotations = reject;
				}),
				oMetadataPromise = new Promise(function (resolve, reject) {
					fnResolveMetadata = resolve;
					fnRejectMetadata = reject;
				});

			// private member used because oModel.annotationsLoaded() returns null
			oModel.pAnnotationsLoaded.catch(() => {/* avoid Uncaught (in promise) */});

			// Metadata must be loaded before annotations
			oModel.attachMetadataLoaded(function() {
				bMetadataLoaded = true;
				Log.debug("metadata loaded is fired");
				assert.ok(bMetadataLoaded, "Metadata loaded successfully");
				Log.debug("check for metadata");
				fnResolveMetadata();
			});

			oModel.attachAnnotationsLoaded(function() {
				bAnnotationsLoaded = true;
				Log.debug("annotations loaded is fired");
				assert.ok(bAnnotationsLoaded, "Annotations loaded successfully");
				fnResolveAnnotations();
			});

			oModel.attachMetadataFailed(function() {
				Log.debug("metadata failed is fired");
				fnRejectMetadata();
			});

			oModel.attachAnnotationsFailed(function() {
				Log.debug("annotations failed is fired");
				fnRejectAnnotations();
			});

			if (bServiceValid && (sAnnotationsValid === "some" || sAnnotationsValid === "all")) {
				return Promise.all([oMetadataPromise, oAnnotationsPromise]).then(function () {
					Log.debug("both promises fulfilled");
					assert.ok(bMetadataLoaded && bAnnotationsLoaded,
						"Check: Annotations and Metadata loaded");
					Log.debug("check for both");
				}, function () {
					Log.debug("metadata promise failed");
					assert.ok(false, 'Metadata promise rejected');
				});
			} else if (bServiceValid && sAnnotationsValid === "none"){
				return Promise.all([
					oMetadataPromise.then(function () {
						Log.debug("metadata promise fulfilled");
					}),
					oAnnotationsPromise.then(function () {
						assert.ok(false);
					}, function () {
						assert.ok(bMetadataLoaded && !bAnnotationsLoaded,
							"Check: Invalid Annotations - Only Metadata loaded");
						Log.debug("check for no annotations");
						oModel.destroy();
					})
				]);
			} else if (bServiceValid && sAnnotationsValid === "metadata") {
				return oMetadataPromise.then(function () {
					Log.debug("metadata promise fulfilled");
					assert.ok(bMetadataLoaded, "Check: Invalid Annotations - Metadata loaded");
					Log.debug("check for no annotations");
					oModel.destroy();
				});
			} else if (!bServiceValid){
				return oMetadataPromise.then(function () {
					assert.ok(false);
				}, function () {
					Log.debug("metadata failed fulfilled");
					// Nothing should be loaded
					assert.ok(!bServiceValid && !bAnnotationsLoaded,
						"Check: Invalid Service - Annotations and Metadata NOT loaded");
					Log.debug("check for none");
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
		bServiceValid	 = mService.serviceValid;
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

		Log.debug("testtype: " + sTestType);

		QUnit.test(
			"Asynchronous loading - " + sTestType,
			fnTest(sServiceURI, mModelOptions, bServiceValid, sAnnotationsValid)
		);
	}
}());

	QUnit.module("V2: Asynchronous loading");

	fnTest = function(sServiceURI, mModelOptions, bServiceValid, sAnnotationsValid, bSharedMetadata) {
		return function(assert) {
			if (!bSharedMetadata){
				V2ODataModel.mSharedData = {server: {}, service: {}, meta: {}};
			}
			var oModel = new V2ODataModel(sServiceURI, mModelOptions);

			var bMetadataLoaded = false;
			var bAnnotationsLoaded = false;

			var fnResolveMetadata, fnRejectMetadata, fnResolveAnnotations, fnRejectAnnotations,
				oAnnotationsPromise = new Promise(function (resolve, reject) {
					fnResolveAnnotations = resolve;
					fnRejectAnnotations = reject;
				}),
				oMetadataPromise = new Promise(function (resolve, reject) {
					fnResolveMetadata = resolve;
					fnRejectMetadata = reject;
				});

			oModel.annotationsLoaded().catch(() => {/* avoid Uncaught (in promise) */});

			// Metadata must be loaded before annotations
			oModel.attachMetadataLoaded(function() {
				bMetadataLoaded = true;
				Log.debug("metadata loaded is fired");
				assert.ok(bMetadataLoaded, "Metadata loaded successfully");
				Log.debug("check for metadata");
				fnResolveMetadata();
			});

			oModel.attachAnnotationsLoaded(function() {
				bAnnotationsLoaded = true;
				Log.debug("annotations loaded is fired");
				assert.ok(bAnnotationsLoaded, "Annotations loaded successfully");
				fnResolveAnnotations();
			});

			oModel.attachMetadataFailed(function() {
				Log.debug("metadata failed is fired");
				fnRejectMetadata();
			});

			oModel.attachAnnotationsFailed(function() {
				Log.debug("annotations failed is fired");
				fnRejectAnnotations();
			});

			if (bServiceValid && (sAnnotationsValid === "some" || sAnnotationsValid === "all")) {
				return Promise.all([oMetadataPromise, oAnnotationsPromise]).then(function () {
					Log.debug("both promises fulfilled");
					assert.ok(bMetadataLoaded && bAnnotationsLoaded,
						"Check: Annotations and Metadata loaded");
					Log.debug("check for both");
				}, function () {
					Log.debug("metadata promise failed");
					assert.ok(false, 'Metadata promise rejected');
				});
			} else if (bServiceValid && sAnnotationsValid === "none"){
				return Promise.all([
					oMetadataPromise.then(function () {
						Log.debug("metadata promise fulfilled");
					}),
					oAnnotationsPromise.then(function () {
						assert.ok(false);
					}, function () {
						// Metadata should be loaded, but no annotations
						assert.ok(bMetadataLoaded && !bAnnotationsLoaded,
							"Check: Invalid Annotations - Only Metadata loaded");
						Log.debug("check for no annotations");
						oModel.destroy();
					})
				]);
			} else if (bServiceValid && sAnnotationsValid === "metadata") {
				return oMetadataPromise.then(function () {
					Log.debug("metadata promise fulfilled");
					assert.ok(bMetadataLoaded, "Check: Invalid Annotations - Metadata loaded");
					Log.debug("check for no annotations");
					oModel.destroy();
				});
			} else if (!bServiceValid){
				oAnnotationsPromise.catch(() => {/* avoid Uncaught (in promise) */});
				return oMetadataPromise.then(function () {
					assert.ok(false);
				}, function () {
					Log.debug("metadata failed fulfilled");
					// Nothing should be loaded
					assert.ok(!bServiceValid && !bAnnotationsLoaded,
						"Check: Invalid Service - Annotations and Metadata NOT loaded");
					Log.debug("check for none");
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
		bServiceValid	 = mService.serviceValid;
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

		Log.debug("testtype: " + sTestType);

		QUnit.test(
			"Asynchronous loading - " + sTestType,
			fnTest(sServiceURI, mModelOptions, bServiceValid, sAnnotationsValid)
		);
	}

/** @deprecated As of version 1.48.0, reason sap.ui.model.odata.ODataModel */
(function() {
	QUnit.module("Asynchronous loading (joined events)");

	fnTest = function(sServiceURI, mModelOptions, bServiceValid, sAnnotationsValid, bSharedMetadata) {
		return function(assert) {
			var done = assert.async();
			if (!bSharedMetadata){
				cleanOdataCache();
			}
			var oModel = new V1ODataModel(sServiceURI, mModelOptions);
			var that = this;
			var bMetadataLoaded = false;
			var bAnnotationsLoaded = false;
			var bInternalMetadataLoaded = false;

			var fnResolveMetadata, fnRejectMetadata, fnResolveInternalMetadata,
				oInternalMetadataPromise = new Promise(function (resolve) {
					fnResolveInternalMetadata = resolve;
				}),
				oMetadataPromise = new Promise(function (resolve, reject) {
					fnResolveMetadata = resolve;
					fnRejectMetadata = reject;
				});

			// private member used because oModel.annotationsLoaded() returns null
			oModel.pAnnotationsLoaded.catch(() => {/* avoid Uncaught (in promise) */});

			// Use internal metadata loaded event, because in case of joined loading, the real one
			// does not fire until Annotations are there
			if (oModel.oMetadata.getServiceMetadata()){
				bInternalMetadataLoaded = true;
				// assert.ok(!bAnnotationsLoaded, "Internal metadata loaded before annotations");
				fnResolveInternalMetadata();
			} else {
				oModel.oMetadata.attachLoaded(function() {
					bInternalMetadataLoaded = true;
					// assert.ok(!bAnnotationsLoaded, "Internal metadata loaded before annotations");
					fnResolveInternalMetadata();
				});
			}
			// Metadata must be loaded before annotations
			oModel.attachMetadataLoaded(function() {
				bMetadataLoaded = true;
				if (oModel.bLoadMetadataAsync && oModel.bLoadAnnotationsJoined){
					// Metadata loaded event is only fired after both metadata and annotations have been loaded successfully, so we can also set bAnnotationsloaded to true
					bAnnotationsLoaded = true;
				}
				assert.ok(bMetadataLoaded, "Metadata loaded successfully");
						assert.ok(bAnnotationsLoaded, "Metadata loaded after annotations");
				fnResolveMetadata();
			});

			oModel.attachMetadataFailed(function() {
				fnRejectMetadata();
			});
			oModel.attachAnnotationsLoaded(function() {
				bAnnotationsLoaded = true;
			});

			if (bServiceValid && (sAnnotationsValid === "some" || sAnnotationsValid === "all" || sAnnotationsValid === "metadata")){
				oMetadataPromise.then(function(e){
					Log.debug("metadata promise fulfilled");
					assert.ok(bMetadataLoaded && bAnnotationsLoaded,
						"Check: Annotations and Metadata loaded");
					Log.debug("check for both");
					done();
				}, function(e){
					Log.debug("metadata promise failed");
					assert.ok(false, 'Metadata promise rejected');
				});
			} else if (bServiceValid && sAnnotationsValid === "none"){
				//internal metadata needs to be sucessful prior to the failed annotations
				oInternalMetadataPromise.then(function(){
					Log.debug("metadata promise rejected");
					oModel.attachAnnotationsFailed(function(){
						if (sAnnotationsValid === "none") {
							assert.ok(bInternalMetadataLoaded && !bAnnotationsLoaded,
								"Check: Invalid Annotations - Only Metadata loaded");
						} else {
							assert.ok(bInternalMetadataLoaded,
								"Check: Invalid Annotations - Metadata loaded");
						}
						// Metadata should be loaded, but no annotations
						Log.debug("check for no annotations");
						oModel.destroy();
						done();
					}, that);
				});
			} else if (!bServiceValid){
				oMetadataPromise.catch(function(e){
					Log.debug("metadata failed fulfilled");
					// Nothing should be loaded
					assert.ok(!bInternalMetadataLoaded && !bAnnotationsLoaded,
						"Check: Invalid Service - Annotations and Metadata NOT loaded");
					Log.debug("check for none");
					done();
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
		bServiceValid	 = mService.serviceValid;
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

		QUnit.test(
			"Asynchronous loading (joined events) - " + sTestType,
			fnTest(sServiceURI, mModelOptions, bServiceValid, sAnnotationsValid)
		);
	}
}());

	QUnit.module("V2: Asynchronous loading (joined events)");

	fnTest = function(sServiceURI, mModelOptions, bServiceValid, sAnnotationsValid, bSharedMetadata) {
		return function(assert) {
			var done = assert.async();
			if (!bSharedMetadata){
				V2ODataModel.mSharedData = {server: {}, service: {}, meta: {}};
			}
			var oModel = new V2ODataModel(sServiceURI, mModelOptions);
			var that = this;
			var bMetadataLoaded = false;
			var bAnnotationsLoaded = false;
			var bInternalMetadataLoaded = false;

			var fnResolveMetadata, fnRejectMetadata, fnResolveInternalMetadata,
				oInternalMetadataPromise = new Promise(function (resolve) {
					fnResolveInternalMetadata = resolve;
				}),
				oMetadataPromise = new Promise(function (resolve, reject) {
					fnResolveMetadata = resolve;
					fnRejectMetadata = reject;
				});

			oModel.annotationsLoaded().catch(() => {/* avoid Uncaught (in promise) */});

			// Use internal metadata loaded event, because in case of joined loading, the real one
			// does not fire until Annotations are there
			if (oModel.oMetadata.getServiceMetadata()){
				bInternalMetadataLoaded = true;
				//	assert.ok(!bAnnotationsLoaded, "Internal metadata loaded before annotations");
				fnResolveInternalMetadata();
			} else {
				oModel.oMetadata.attachLoaded(function() {
					bInternalMetadataLoaded = true;
					//	assert.ok(!bAnnotationsLoaded, "Internal metadata loaded before annotations");
					fnResolveInternalMetadata();
				});
			}
			// Metadata must be loaded before annotations
			oModel.attachMetadataLoaded(function() {
				bMetadataLoaded = true;
				if (oModel.bLoadAnnotationsJoined){
					// Metadata loaded event is only fired after both metadata and annotations have been loaded successfully, so we can also set bAnnotationsloaded to true
					bAnnotationsLoaded = true;
				}
				assert.ok(bMetadataLoaded, "Metadata loaded successfully");
				assert.ok(bAnnotationsLoaded, "Metadata loaded after annotations");
				fnResolveMetadata();
			});

			oModel.attachMetadataFailed(function() {
				fnRejectMetadata();
			});
			oModel.attachAnnotationsLoaded(function() {
				bAnnotationsLoaded = true;
			});

			if (bServiceValid && (sAnnotationsValid === "some" || sAnnotationsValid === "all")){
				oMetadataPromise.then(function(e){
					Log.debug("metadata promise fulfilled");
					assert.ok(bMetadataLoaded && bAnnotationsLoaded,
						"Check: Annotations and Metadata loaded");
					Log.debug("check for both");
					done();
				}, function(e){
					Log.debug("metadata promise failed");
					assert.ok(false, 'Metadata promise rejected');
				});
		} else if (bServiceValid && sAnnotationsValid === "metadata") {
			oModel.metadataLoaded().then(function() {
				assert.ok(bMetadataLoaded && bAnnotationsLoaded,
					"Check: Annotations and Metadata loaded");
				Log.debug("check for both");
				done();
			});
		} else if (bServiceValid && sAnnotationsValid === "none"){
				//internal metadata needs to be sucessful prior to the failed annotations
				oInternalMetadataPromise.then(function(){
					Log.debug("metadata promise rejected");
					oModel.attachAnnotationsFailed(function(){
						if (sAnnotationsValid === "none") {
							assert.ok(bInternalMetadataLoaded && !bAnnotationsLoaded,
								"Check: Invalid Annotations - Only Metadata loaded");
						} else {
							assert.ok(bInternalMetadataLoaded,
								"Check: Invalid Annotations - Metadata loaded");
						}
						// Metadata should be loaded, but no annotations
						Log.debug("check for no annotations");
						oModel.destroy();
						done();
					}, that);
				});
			} else if (!bServiceValid){
				oMetadataPromise.catch(function(e){
					Log.debug("metadata failed fulfilled");
					// Nothing should be loaded
					assert.ok(!bInternalMetadataLoaded && !bAnnotationsLoaded,
						"Check: Invalid Service - Annotations and Metadata NOT loaded");
					Log.debug("check for none");
					done();
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
		bServiceValid	 = mService.serviceValid;
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

		QUnit.test(
			"Asynchronous loading (joined events) - " + sTestType,
			fnTest(sServiceURI, mModelOptions, bServiceValid, sAnnotationsValid));
	}

/** @deprecated As of version 1.48.0, reason sap.ui.model.odata.ODataModel */
(function() {
	QUnit.module("V1 only: Synchronous loading and MetaModel");

	var fnTestSynchronousLoading = function(mTest, assert) {
		assert.expect(5);
		var oModel = new V1ODataModel(mTest.service, {
			annotationURI : mTest.annotations,
			skipMetadataAnnotationParsing: false,
			loadMetadataAsync: false
		});

		// private member used because oModel.annotationsLoaded() returns null
		oModel.pAnnotationsLoaded.catch(() => {/* avoid Uncaught (in promise) */});

		// Everything should be ready right now due to synchronous operation mode
		var oMetadata = oModel.getServiceMetadata();
		var oAnnotations = oModel.getServiceAnnotations();
		var oMetaModel = oModel.getMetaModel();

		assert.ok(!!oMetadata, "Metadata is available.");
		assert.ok(!!oAnnotations, "Annotations are available.");
		assert.ok(!!oMetaModel, "MetaModel is available.");

		assert.ok(oMetaModel.getProperty("/"), "Metamodel can be used");
		assert.ok(oMetaModel.getODataEntityContainer(), "Metamodel can be used");

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

		QUnit.test("V1 only: Synchronous Metadata loading and Metamodel - " + sTestType, fnTestSynchronousLoading.bind(this, aServices[i]));
	}


	QUnit.module("Multiple Annotation Sources Merged");

	QUnit.test("Asynchronous loading", function(assert) {
		var done = assert.async();
		assert.expect(12);
//		var asyncStartsExpected = 2; // The number of asynchronous starts expected before the real start is triggered

		// Don't use metadata/annotation cache
		cleanOdataCache();
		var oModel1 = new V1ODataModel(
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

		assert.ok(oAnnotations.UnitTest["Test.FromAnnotations"][0].Value.Path === "Annotations", "Annotation from correct source (Annotations)");
		assert.ok(oAnnotations.UnitTest["Test.FromMetadata"][0].Value.Path === "Metadata", "Annotation from correct source (Metadata)");
		assert.ok(oAnnotations.UnitTest["Test.Merged"][0].Value.Path === "Annotations", "Annotation from correct source (Annotations)");

		// Don't use metadata/annotation cache
		cleanOdataCache();
		var oModel2 = new V1ODataModel(
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

		assert.ok(oAnnotations.UnitTest["Test.FromAnnotations"][0].Value.Path === "Annotations", "Annotation from correct source (Annotations)");
		assert.ok(oAnnotations.UnitTest["Test.FromMetadata"][0].Value.Path === "Metadata", "Annotation from correct source (Metadata)");
		assert.ok(oAnnotations.UnitTest["Test.Merged"][0].Value.Path === "Metadata", "Annotation from correct source (Metadata)");

		// Don't use metadata/annotation cache
		cleanOdataCache();
		var oModel3 = new V1ODataModel(
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
			assert.ok(oAnnotations.UnitTest["Test.FromAnnotations"][0].Value.Path === "Annotations", "Annotation from correct source (Annotations)");
			assert.ok(oAnnotations.UnitTest["Test.FromMetadata"][0].Value.Path === "Metadata", "Annotation from correct source (Metadata)");
			assert.ok(oAnnotations.UnitTest["Test.Merged"][0].Value.Path === "Metadata", "Annotation from correct source (Metadata)");
			startTest4();
		});

		function startTest4() {
			// Don't use metadata/annotation cache
			cleanOdataCache();
			var oModel4 = new V1ODataModel(
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
				assert.ok(oAnnotations.UnitTest["Test.FromAnnotations"][0].Value.Path === "Annotations", "Annotation from correct source (Annotations)");
				assert.ok(oAnnotations.UnitTest["Test.FromMetadata"][0].Value.Path === "Metadata", "Annotation from correct source (Metadata)");
				assert.ok(oAnnotations.UnitTest["Test.Merged"][0].Value.Path === "Annotations", "Annotation from correct source (Annotations)");

				oModel1.destroy();
				oModel2.destroy();
				oModel3.destroy();
				oModel4.destroy();
				done();
			});
		}
	});
}());

	QUnit.module("V2: Multiple Annotation Sources Merged");

	QUnit.test("Asynchronous loading", function(assert) {
		var done = assert.async();
		assert.expect(6);
		var asyncStartsExpected = 2; // The number of asynchronous starts expected before the real start is triggered

		var oModel3 = new V2ODataModel(
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
			assert.ok(oAnnotations.UnitTest["Test.FromAnnotations"][0].Value.Path === "Annotations", "Annotation from correct source (Annotations)");
			assert.ok(oAnnotations.UnitTest["Test.FromMetadata"][0].Value.Path === "Metadata", "Annotation from correct source (Metadata)");
			var sMerged = oAnnotations.UnitTest["Test.Merged"][0].Value.Path;
			assert.ok(sMerged === "Metadata" || sMerged === "Annotations", "Merged annotations filled");
			asyncStart(done);
		});

		var oModel4 = new V2ODataModel(
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
			assert.ok(oAnnotations.UnitTest["Test.FromAnnotations"][0].Value.Path === "Annotations", "Annotation from correct source (Annotations)");
			assert.ok(oAnnotations.UnitTest["Test.FromMetadata"][0].Value.Path === "Metadata", "Annotation from correct source (Metadata)");
			var sMerged = oAnnotations.UnitTest["Test.Merged"][0].Value.Path;
			assert.ok(sMerged === "Metadata" || sMerged === "Annotations", "Merged annotations filled");
			asyncStart(done);
		});


		function asyncStart(done) {
			if (asyncStart.num === undefined) {
				asyncStart.num = 0;
			}

			if (++asyncStart.num >= asyncStartsExpected) {
				oModel3.destroy();
				oModel4.destroy();

				done();
			}
		}

	});

	QUnit.module("Additional tests for fixed bugs");

	/** @deprecated As of version 1.66.0, reason sap.ui.model.odata.ODataAnnotations */
	QUnit.test("ODataAnnotations#getData", function (assert) {
		var oODataAnnotations = new ODataAnnotations({annotationData : "~annotationData"});

		assert.strictEqual(ODataAnnotations.prototype.getData, ODataAnnotations.prototype.getAnnotationsData);
		assert.strictEqual(oODataAnnotations.getData(), "~annotationData");
	});

	/** @deprecated As of version 1.48.0, reason sap.ui.model.odata.ODataModel */
	QUnit.test("Apply Function", function(assert) {
		assert.expect(12);

		var mTest = mAdditionalTestsServices["Apply Function"];
		var sServiceURI = mTest.service;
		var mModelOptions = {
			annotationURI : mTest.annotations,
			json : true,
			loadAnnotationsJoined: false,
			loadMetadataAsync: false
		};

		var oModel = new V1ODataModel(sServiceURI, mModelOptions);
		var oMetadata = oModel.getServiceMetadata();
		var oAnnotations = oModel.getServiceAnnotations();

		assert.ok(!!oMetadata, "Metadata is available.");
		assert.ok(!!oAnnotations, "Annotations are available.");

		assert.ok(
			!!oAnnotations
				["Test.2014-12-08"],
			"Test Annotations are available"
		);
		assert.ok(
			!!oAnnotations
				["Test.2014-12-08"]
				["com.sap.vocabularies.UI.v1.Identification"],
			"Namespace exists"
		);
		assert.ok(
			!!oAnnotations
				["Test.2014-12-08"]
				["com.sap.vocabularies.UI.v1.Identification"]
				[0],
			"Namespace has content"
		);


		var mNamespace = oAnnotations["Test.2014-12-08"]["com.sap.vocabularies.UI.v1.Identification"][0];

		assert.ok(
			!!mNamespace
				["com.sap.vocabularies.UI.v1.Importance"],
			"Sub-namespace exists"
		);
		assert.ok(
			!!mNamespace
				["com.sap.vocabularies.UI.v1.Importance"]
				["EnumMember"],
			"EnumMember exists"
		);
		assert.equal(
			mNamespace
				["com.sap.vocabularies.UI.v1.Importance"]
				["EnumMember"],
			"com.sap.vocabularies.UI.v1.Priority/High",
			"EnumMember has correct value"
		);

		assert.ok(!!mNamespace["RecordType"], "RecordType exists");
		assert.equal(
			mNamespace["RecordType"],
			"com.sap.vocabularies.UI.v1.DataField",
			"RecordType has correct value"
		);

		assert.ok(!!mNamespace["Value"], "Value exists");

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

		assert.deepEqual(mNamespace["Value"], mCorrectValue, "Value has correct value");

		oModel.destroy();
	});

	QUnit.test("V2: Apply Function", function(assert) {
		var done = assert.async();
		assert.expect(12);

		var mTest = mAdditionalTestsServices["Apply Function"];
		var sServiceURI = mTest.service;
		var mModelOptions = {
			annotationURI : mTest.annotations,
			json : true,
			loadAnnotationsJoined: false,
			skipMetadataAnnotationParsing: true
		};

		var oModel = new V2ODataModel(sServiceURI, mModelOptions);

		oModel.attachAnnotationsLoaded(function() {
			var oMetadata = oModel.getServiceMetadata();
			var oAnnotations = oModel.getServiceAnnotations();

			assert.ok(!!oMetadata, "Metadata is available.");
			assert.ok(!!oAnnotations, "Annotations are available.");

			assert.ok(
				!!oAnnotations
					["Test.2014-12-08"],
				"Test Annotations are available"
			);
			assert.ok(
				!!oAnnotations
					["Test.2014-12-08"]
					["com.sap.vocabularies.UI.v1.Identification"],
				"Namespace exists"
			);
			assert.ok(
				!!oAnnotations
					["Test.2014-12-08"]
					["com.sap.vocabularies.UI.v1.Identification"]
					[0],
				"Namespace has content"
			);


			var mNamespace = oAnnotations["Test.2014-12-08"]["com.sap.vocabularies.UI.v1.Identification"][0];

			assert.ok(
				!!mNamespace
					["com.sap.vocabularies.UI.v1.Importance"],
				"Sub-namespace exists"
			);
			assert.ok(
				!!mNamespace
					["com.sap.vocabularies.UI.v1.Importance"]
					["EnumMember"],
				"EnumMember exists"
			);
			assert.equal(
				mNamespace
					["com.sap.vocabularies.UI.v1.Importance"]
					["EnumMember"],
				"com.sap.vocabularies.UI.v1.Priority/High",
				"EnumMember has correct value"
			);

			assert.ok(!!mNamespace["RecordType"], "RecordType exists");
			assert.equal(
				mNamespace["RecordType"],
				"com.sap.vocabularies.UI.v1.DataField",
				"RecordType has correct value"
			);

			assert.ok(!!mNamespace["Value"], "Value exists");

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

			assert.deepEqual(mNamespace["Value"], mCorrectValue, "Value has correct value");

			oModel.destroy();
			done();
		});
	});

	/** @deprecated As of version 1.48.0, reason sap.ui.model.odata.ODataModel */
	QUnit.test("Multiple Property Annotations", function(assert) {
		assert.expect(11);

		var mTest = mAdditionalTestsServices["Multiple Property Annotations"];
		var sServiceURI = mTest.service;
		var mModelOptions = {
			annotationURI : mTest.annotations,
			json : true,
			loadAnnotationsJoined: false,
			loadMetadataAsync: false
		};

		var oModel = new V1ODataModel(sServiceURI, mModelOptions);
		var oMetadata = oModel.getServiceMetadata();
		var oAnnotations = oModel.getServiceAnnotations();

		assert.ok(!!oMetadata, "Metadata is available.");
		assert.ok(!!oAnnotations, "Annotations are available.");

		assert.ok(!!oAnnotations["propertyAnnotations"], "PropertyAnnotations namespace exists");

		assert.ok(
			!!oAnnotations["propertyAnnotations"]["MultiplePropertyAnnotations.Product"],
			"Target namespace inside PropertyAnnotations exists"
		);

		assert.ok(
			!!oAnnotations["propertyAnnotations"]["MultiplePropertyAnnotations.Product"]["Price/Amount"],
			"Target values exist"
		);

		assert.ok(
			!!oAnnotations
				["propertyAnnotations"]
				["MultiplePropertyAnnotations.Product"]
				["Price/Amount"]
				["CQP.ISOCurrency"],
			"Target value 1 exists"
		);

		assert.ok(
			!!oAnnotations
				["propertyAnnotations"]
				["MultiplePropertyAnnotations.Product"]
				["Price/Amount"]
				["Common.Label"],
			"Target value 2 exists"
		);

		assert.ok(
			!!oAnnotations
				["propertyAnnotations"]
				["MultiplePropertyAnnotations.Product"]
				["Price/Amount"]
				["CQP.ISOCurrency"]
				["Path"],
			"Target value 1 property exists"
		);

		assert.ok(
			!!oAnnotations
				["propertyAnnotations"]
				["MultiplePropertyAnnotations.Product"]
				["Price/Amount"]
				["Common.Label"]
				["String"],
			"Target value 2 property exists"
		);

		assert.equal(
			oAnnotations
				["propertyAnnotations"]
				["MultiplePropertyAnnotations.Product"]
				["Price/Amount"]
				["CQP.ISOCurrency"]
				["Path"],
			"Price/CurrencyCode",
			"Target value 1 property exists"
		);

		assert.equal(
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

	QUnit.test("V2: Multiple Property Annotations", function(assert) {
		var done = assert.async();
		assert.expect(11);

		var mTest = mAdditionalTestsServices["Multiple Property Annotations"];
		var sServiceURI = mTest.service;
		var mModelOptions = {
			annotationURI : mTest.annotations,
			json : true,
			loadAnnotationsJoined: false,
			skipMetadataAnnotationParsing: true
		};

		var oModel = new V2ODataModel(sServiceURI, mModelOptions);
		oModel.attachAnnotationsLoaded(function() {
			var oMetadata = oModel.getServiceMetadata();
			var oAnnotations = oModel.getServiceAnnotations();

			assert.ok(!!oMetadata, "Metadata is available.");
			assert.ok(!!oAnnotations, "Annotations are available.");

			assert.ok(!!oAnnotations["propertyAnnotations"], "PropertyAnnotations namespace exists");

			assert.ok(
				!!oAnnotations["propertyAnnotations"]["MultiplePropertyAnnotations.Product"],
				"Target namespace inside PropertyAnnotations exists"
			);

			assert.ok(
				!!oAnnotations["propertyAnnotations"]["MultiplePropertyAnnotations.Product"]["Price/Amount"],
				"Target values exist"
			);

			assert.ok(
				!!oAnnotations
					["propertyAnnotations"]
					["MultiplePropertyAnnotations.Product"]
					["Price/Amount"]
					["CQP.ISOCurrency"],
				"Target value 1 exists"
			);

			assert.ok(
				!!oAnnotations
					["propertyAnnotations"]
					["MultiplePropertyAnnotations.Product"]
					["Price/Amount"]
					["Common.Label"],
				"Target value 2 exists"
			);

			assert.ok(
				!!oAnnotations
					["propertyAnnotations"]
					["MultiplePropertyAnnotations.Product"]
					["Price/Amount"]
					["CQP.ISOCurrency"]
					["Path"],
				"Target value 1 property exists"
			);

			assert.ok(
				!!oAnnotations
					["propertyAnnotations"]
					["MultiplePropertyAnnotations.Product"]
					["Price/Amount"]
					["Common.Label"]
					["String"],
				"Target value 2 property exists"
			);

			assert.equal(
				oAnnotations
					["propertyAnnotations"]
					["MultiplePropertyAnnotations.Product"]
					["Price/Amount"]
					["CQP.ISOCurrency"]
					["Path"],
				"Price/CurrencyCode",
				"Target value 1 property exists"
			);

			assert.equal(
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
			done();
		});
	});

	/** @deprecated As of version 1.48.0, reason sap.ui.model.odata.ODataModel */
	QUnit.test("Qualifiers in Property Annotations", function(assert) {
		assert.expect(8);

		var mTest = mAdditionalTestsServices["Property Annotation Qualifiers"];
		var sServiceURI = mTest.service;
		var mModelOptions = {
			annotationURI : mTest.annotations,
			json : true,
			loadAnnotationsJoined: false,
			loadMetadataAsync: false
		};

		var oModel = new V1ODataModel(sServiceURI, mModelOptions);
		var oMetadata = oModel.getServiceMetadata();
		var oAnnotations = oModel.getServiceAnnotations();

		assert.ok(!!oMetadata, "Metadata is available.");
		assert.ok(!!oAnnotations, "Annotations are available.");

		assert.ok(!!oAnnotations["propertyAnnotations"], "PropertyAnnotations namespace exists");

		assert.ok(
			!!oAnnotations["propertyAnnotations"]["PropertyAnnotationQualifiers.Product"],
			"Target namespace inside PropertyAnnotations exists"
		);

		assert.ok(
			!!oAnnotations
				["propertyAnnotations"]["PropertyAnnotationQualifiers.Product"]["Price/Amount"],
			"Target value exists"
		);

		assert.ok(
			!!oAnnotations
				["propertyAnnotations"]
				["PropertyAnnotationQualifiers.Product"]
				["Price/Amount"]
				["CQP.ISOCurrency#Amount1"],
			"Target value with Qualifier exists"
		);

		assert.ok(
			!!oAnnotations
				["propertyAnnotations"]
				["PropertyAnnotationQualifiers.Product"]
				["Price/Amount"]
				["CQP.ISOCurrency#Amount1"]
				["Path"],
			"Target value with Qualifier value exists"
		);

		assert.equal(
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

	QUnit.test("V2: Qualifiers in Property Annotations", function(assert) {
		var done = assert.async();
		assert.expect(8);

		var mTest = mAdditionalTestsServices["Property Annotation Qualifiers"];
		var sServiceURI = mTest.service;
		var mModelOptions = {
			annotationURI : mTest.annotations,
			json : true,
			loadAnnotationsJoined: false,
			loadMetadataAsync: false,
			skipMetadataAnnotationParsing: true
		};

		var oModel = new V2ODataModel(sServiceURI, mModelOptions);
		oModel.attachAnnotationsLoaded(function() {
			var oMetadata = oModel.getServiceMetadata();
			var oAnnotations = oModel.getServiceAnnotations();

			assert.ok(!!oMetadata, "Metadata is available.");
			assert.ok(!!oAnnotations, "Annotations are available.");

			assert.ok(!!oAnnotations["propertyAnnotations"], "PropertyAnnotations namespace exists");

			assert.ok(
				!!oAnnotations["propertyAnnotations"]["PropertyAnnotationQualifiers.Product"],
				"Target namespace inside PropertyAnnotations exists"
			);

			assert.ok(
				!!oAnnotations
					["propertyAnnotations"]["PropertyAnnotationQualifiers.Product"]["Price/Amount"],
				"Target value exists"
			);

			assert.ok(
				!!oAnnotations
					["propertyAnnotations"]
					["PropertyAnnotationQualifiers.Product"]
					["Price/Amount"]
					["CQP.ISOCurrency#Amount1"],
				"Target value with Qualifier exists"
			);

			assert.ok(
				!!oAnnotations
					["propertyAnnotations"]
					["PropertyAnnotationQualifiers.Product"]
					["Price/Amount"]
					["CQP.ISOCurrency#Amount1"]
					["Path"],
				"Target value with Qualifier value exists"
			);

			assert.equal(
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
			done();
		});
	});

	/** @deprecated As of version 1.48.0, reason sap.ui.model.odata.ODataModel */
	QUnit.test("Other Property Values", function(assert) {
		assert.expect(8);

		var mTest = mAdditionalTestsServices["Other Property Values"];
		var sServiceURI = mTest.service;
		var mModelOptions = {
			annotationURI : mTest.annotations,
			json : true,
			loadAnnotationsJoined: false,
			loadMetadataAsync: false
		};

		var oModel = new V1ODataModel(sServiceURI, mModelOptions);
		var oMetadata = oModel.getServiceMetadata();
		var oAnnotations = oModel.getServiceAnnotations();

		assert.ok(!!oMetadata, "Metadata is available.");
		assert.ok(!!oAnnotations, "Annotations are available.");

		assert.ok(!!oAnnotations["propertyAnnotations"], "PropertyAnnotations namespace exists");

		assert.ok(
			!!oAnnotations["propertyAnnotations"]["OtherPropertyValues.Product"],
			"Target namespace inside PropertyAnnotations exists"
		);

		assert.ok(
			!!oAnnotations
				["propertyAnnotations"]["OtherPropertyValues.Product"]["Price/Amount"],
			"Target value exists"
		);

		assert.ok(
			!!oAnnotations
				["propertyAnnotations"]
				["OtherPropertyValues.Product"]
				["Price/Amount"]
				["CQP.ISOCurrency#Amount2"],
			"Target value with Qualifier exists"
		);

		assert.ok(
			!!oAnnotations
				["propertyAnnotations"]
				["OtherPropertyValues.Product"]
				["Price/Amount"]
				["CQP.ISOCurrency#Amount2"]
				["String"],
			"Target value with Qualifier value exists"
		);

		assert.equal(
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

	QUnit.test("V2: Other Property Values", function(assert) {
		var done = assert.async();
		assert.expect(8);

		var mTest = mAdditionalTestsServices["Other Property Values"];
		var sServiceURI = mTest.service;
		var mModelOptions = {
			annotationURI : mTest.annotations,
			json : true,
			loadAnnotationsJoined: false,
			skipMetadataAnnotationParsing: true
		};

		var oModel = new V2ODataModel(sServiceURI, mModelOptions);
		oModel.attachAnnotationsLoaded(function() {
			var oMetadata = oModel.getServiceMetadata();
			var oAnnotations = oModel.getServiceAnnotations();

			assert.ok(!!oMetadata, "Metadata is available.");
			assert.ok(!!oAnnotations, "Annotations are available.");

			assert.ok(!!oAnnotations["propertyAnnotations"], "PropertyAnnotations namespace exists");

			assert.ok(
				!!oAnnotations["propertyAnnotations"]["OtherPropertyValues.Product"],
				"Target namespace inside PropertyAnnotations exists"
			);

			assert.ok(
				!!oAnnotations
					["propertyAnnotations"]["OtherPropertyValues.Product"]["Price/Amount"],
				"Target value exists"
			);

			assert.ok(
				!!oAnnotations
					["propertyAnnotations"]
					["OtherPropertyValues.Product"]
					["Price/Amount"]
					["CQP.ISOCurrency#Amount2"],
				"Target value with Qualifier exists"
			);

			assert.ok(
				!!oAnnotations
					["propertyAnnotations"]
					["OtherPropertyValues.Product"]
					["Price/Amount"]
					["CQP.ISOCurrency#Amount2"]
					["String"],
				"Target value with Qualifier value exists"
			);

			assert.equal(
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
			done();
		});
	});

	/** @deprecated As of version 1.48.0, reason sap.ui.model.odata.ODataModel */
	QUnit.test("Aliases in Namespaces", function(assert) {
		assert.expect(8);

		var mTest = mAdditionalTestsServices["Aliases in Namespaces"];
		var sServiceURI = mTest.service;
		var mModelOptions = {
			annotationURI : mTest.annotations,
			json : true,
			loadAnnotationsJoined: false,
			loadMetadataAsync: false,
			skipMetadataAnnotationParsing: true
		};

		var oModel = new V1ODataModel(sServiceURI, mModelOptions);
		var oMetadata = oModel.getServiceMetadata();
		var oAnnotations = oModel.getServiceAnnotations();

		assert.ok(!!oMetadata, "Metadata is available.");
		assert.ok(!!oAnnotations, "Annotations are available.");

		assert.ok(!!oAnnotations["propertyAnnotations"], "PropertyAnnotations namespace exists");

		assert.ok(
			!!oAnnotations["propertyAnnotations"]["NamespaceAliases.PurchaseOrder"],
			"Target namespace inside PropertyAnnotations exists"
		);

		assert.ok(
			!!oAnnotations
				["propertyAnnotations"]["NamespaceAliases.PurchaseOrder"]["GrossAmount"],
			"Target value exists"
		);

		assert.ok(
			!!oAnnotations
				["propertyAnnotations"]
				["NamespaceAliases.PurchaseOrder"]
				["GrossAmount"]
				["com.sap.vocabularies.Common.v1.Label"],
			"Target value with correct alias replacement (none!) exists"
		);

		assert.ok(
			!!oAnnotations
				["propertyAnnotations"]
				["NamespaceAliases.PurchaseOrder"]
				["GrossAmount"]
				["com.sap.vocabularies.Common.v1.Label"]
				["String"],
			"Target value with String value exists"
		);

		assert.equal(
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

	QUnit.test("V2: Aliases in Namespaces", function(assert) {
		var done = assert.async();
		assert.expect(8);

		var mTest = mAdditionalTestsServices["Aliases in Namespaces"];
		var sServiceURI = mTest.service;
		var mModelOptions = {
			annotationURI : mTest.annotations,
			json : true,
			loadAnnotationsJoined: false,
			loadMetadataAsync: false,
			skipMetadataAnnotationParsing: true
		};

		var oModel = new V2ODataModel(sServiceURI, mModelOptions);
		oModel.attachAnnotationsLoaded(function() {
			var oMetadata = oModel.getServiceMetadata();
			var oAnnotations = oModel.getServiceAnnotations();

			assert.ok(!!oMetadata, "Metadata is available.");
			assert.ok(!!oAnnotations, "Annotations are available.");

			assert.ok(!!oAnnotations["propertyAnnotations"], "PropertyAnnotations namespace exists");

			assert.ok(
				!!oAnnotations["propertyAnnotations"]["NamespaceAliases.PurchaseOrder"],
				"Target namespace inside PropertyAnnotations exists"
			);

			assert.ok(
				!!oAnnotations
					["propertyAnnotations"]["NamespaceAliases.PurchaseOrder"]["GrossAmount"],
				"Target value exists"
			);

			assert.ok(
				!!oAnnotations
					["propertyAnnotations"]
					["NamespaceAliases.PurchaseOrder"]
					["GrossAmount"]
					["com.sap.vocabularies.Common.v1.Label"],
				"Target value with correct alias replacement (none!) exists"
			);

			assert.ok(
				!!oAnnotations
					["propertyAnnotations"]
					["NamespaceAliases.PurchaseOrder"]
					["GrossAmount"]
					["com.sap.vocabularies.Common.v1.Label"]
					["String"],
				"Target value with String value exists"
			);

			assert.equal(
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
			done();
		});
	});

	/** @deprecated As of version 1.48.0, reason sap.ui.model.odata.ODataModel */
	QUnit.test("Namespaces in Other Property Values", function(assert) {
		assert.expect(22);

		var mTest = mAdditionalTestsServices["Namespaces in Other Property Values"];
		var sServiceURI = mTest.service;
		var mModelOptions = {
			annotationURI : mTest.annotations,
			json : true,
			loadAnnotationsJoined: false,
			loadMetadataAsync: false
		};

		var oModel = new V1ODataModel(sServiceURI, mModelOptions);
		var oMetadata = oModel.getServiceMetadata();
		var oAnnotations = oModel.getServiceAnnotations();

		assert.ok(!!oMetadata, "Metadata is available.");

		assert.ok(!!oAnnotations, "Annotations are available.");

		assert.ok(!!oAnnotations["propertyAnnotations"], "PropertyAnnotations namespace exists");

		assert.ok(
			!!oAnnotations["propertyAnnotations"]["OtherPropertyValueAliases.Test"]["Value"],
			"Target value exists"
		);


		assert.ok(
			!!oAnnotations
				["propertyAnnotations"]
				["OtherPropertyValueAliases.Test"]
				["Value"]
				["com.sap.vocabularies.UI.v1.Name"],
			"Target value's namespace has been correctly replaced"
		);
		assert.ok(
			!!oAnnotations
				["propertyAnnotations"]
				["OtherPropertyValueAliases.Test"]
				["Value"]
				["com.sap.vocabularies.UI.v1.Name"]
				["EnumMember"],
			"Target value's child exists"
		);
		assert.equal(
			oAnnotations
				["propertyAnnotations"]
				["OtherPropertyValueAliases.Test"]
				["Value"]
				["com.sap.vocabularies.UI.v1.Name"]
				["EnumMember"],
			"com.sap.vocabularies.UI.v1.Value",
			"Target value's namespace has been correctly replaced"
		);


		assert.ok(
			!!oAnnotations
				["propertyAnnotations"]
				["OtherPropertyValueAliases.Test"]
				["Value"]
				["com.sap.vocabularies.Communication.v1.Name"],
			"Target value's namespace has been correctly replaced"
		);
		assert.ok(
			!!oAnnotations
				["propertyAnnotations"]
				["OtherPropertyValueAliases.Test"]
				["Value"]
				["com.sap.vocabularies.Communication.v1.Name"]
				["EnumMember"],
			"Target value's child exists"
		);
		assert.equal(
			oAnnotations
				["propertyAnnotations"]
				["OtherPropertyValueAliases.Test"]
				["Value"]
				["com.sap.vocabularies.Communication.v1.Name"]
				["EnumMember"],
			"com.sap.vocabularies.Communication.v1.Value",
			"Target value's namespace has been correctly replaced"
		);


		assert.ok(
			!!oAnnotations
				["propertyAnnotations"]
				["OtherPropertyValueAliases.Test"]
				["Value"]
				["Org.OData.Measures.V1.Name"],
			"Target value's namespace has been correctly replaced"
		);
		assert.ok(
			!!oAnnotations
				["propertyAnnotations"]
				["OtherPropertyValueAliases.Test"]
				["Value"]
				["Org.OData.Measures.V1.Name"]
				["EnumMember"],
			"Target value's child exists"
		);
		assert.equal(
			oAnnotations
				["propertyAnnotations"]
				["OtherPropertyValueAliases.Test"]
				["Value"]
				["Org.OData.Measures.V1.Name"]
				["EnumMember"],
			"Org.OData.Measures.V1.Value",
			"Target value's namespace has been correctly replaced"
		);


		assert.ok(
			!!oAnnotations
				["propertyAnnotations"]
				["OtherPropertyValueAliases.Test"]
				["Value"]
				["Org.OData.Measures.V1.Name"],
			"Target value's namespace has been correctly replaced"
		);
		assert.ok(
			!!oAnnotations
				["propertyAnnotations"]
				["OtherPropertyValueAliases.Test"]
				["Value"]
				["Org.OData.Measures.V1.Name"]
				["EnumMember"],
			"Target value's child exists"
		);
		assert.equal(
			oAnnotations
				["propertyAnnotations"]
				["OtherPropertyValueAliases.Test"]
				["Value"]
				["Org.OData.Measures.V1.Name"]
				["EnumMember"],
			"Org.OData.Measures.V1.Value",
			"Target value's namespace has been correctly replaced"
		);


		assert.ok(
			!!oAnnotations
				["propertyAnnotations"]
				["OtherPropertyValueAliases.Test"]
				["Value"]
				["com.sap.vocabularies.Common.v1.Name"],
			"Target value's namespace has been correctly replaced"
		);
		assert.ok(
			!!oAnnotations
				["propertyAnnotations"]
				["OtherPropertyValueAliases.Test"]
				["Value"]
				["com.sap.vocabularies.Common.v1.Name"]
				["EnumMember"],
			"Target value's child exists"
		);
		assert.equal(
			oAnnotations
				["propertyAnnotations"]
				["OtherPropertyValueAliases.Test"]
				["Value"]
				["com.sap.vocabularies.Common.v1.Name"]
				["EnumMember"],
			"com.sap.vocabularies.Common.v1.Value",
			"Target value's namespace has been correctly replaced"
		);


		assert.ok(
			!!oAnnotations
				["propertyAnnotations"]
				["OtherPropertyValueAliases.Test"]
				["Value"]
				["FTGEN_HB_TE.Name"],
			"Target value's namespace has been correctly replaced"
		);
		assert.ok(
			!!oAnnotations
				["propertyAnnotations"]
				["OtherPropertyValueAliases.Test"]
				["Value"]
				["FTGEN_HB_TE.Name"]
				["EnumMember"],
			"Target value's child exists"
		);
		assert.equal(
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

	QUnit.test("V2: Namespaces in Other Property Values", function(assert) {
		var done = assert.async();
		assert.expect(22);

		var mTest = mAdditionalTestsServices["Namespaces in Other Property Values"];
		var sServiceURI = mTest.service;
		var mModelOptions = {
			annotationURI : mTest.annotations,
			json : true,
			loadAnnotationsJoined: false,
			skipMetadataAnnotationParsing: true
		};

		var oModel = new V2ODataModel(sServiceURI, mModelOptions);
		oModel.attachAnnotationsLoaded(function() {
			var oMetadata = oModel.getServiceMetadata();
			var oAnnotations = oModel.getServiceAnnotations();

			assert.ok(!!oMetadata, "Metadata is available.");

			assert.ok(!!oAnnotations, "Annotations are available.");

			assert.ok(!!oAnnotations["propertyAnnotations"], "PropertyAnnotations namespace exists");

			assert.ok(
				!!oAnnotations["propertyAnnotations"]["OtherPropertyValueAliases.Test"]["Value"],
				"Target value exists"
			);


			assert.ok(
				!!oAnnotations
					["propertyAnnotations"]
					["OtherPropertyValueAliases.Test"]
					["Value"]
					["com.sap.vocabularies.UI.v1.Name"],
				"Target value's namespace has been correctly replaced"
			);
			assert.ok(
				!!oAnnotations
					["propertyAnnotations"]
					["OtherPropertyValueAliases.Test"]
					["Value"]
					["com.sap.vocabularies.UI.v1.Name"]
					["EnumMember"],
				"Target value's child exists"
			);
			assert.equal(
				oAnnotations
					["propertyAnnotations"]
					["OtherPropertyValueAliases.Test"]
					["Value"]
					["com.sap.vocabularies.UI.v1.Name"]
					["EnumMember"],
				"com.sap.vocabularies.UI.v1.Value",
				"Target value's namespace has been correctly replaced"
			);


			assert.ok(
				!!oAnnotations
					["propertyAnnotations"]
					["OtherPropertyValueAliases.Test"]
					["Value"]
					["com.sap.vocabularies.Communication.v1.Name"],
				"Target value's namespace has been correctly replaced"
			);
			assert.ok(
				!!oAnnotations
					["propertyAnnotations"]
					["OtherPropertyValueAliases.Test"]
					["Value"]
					["com.sap.vocabularies.Communication.v1.Name"]
					["EnumMember"],
				"Target value's child exists"
			);
			assert.equal(
				oAnnotations
					["propertyAnnotations"]
					["OtherPropertyValueAliases.Test"]
					["Value"]
					["com.sap.vocabularies.Communication.v1.Name"]
					["EnumMember"],
				"com.sap.vocabularies.Communication.v1.Value",
				"Target value's namespace has been correctly replaced"
			);


			assert.ok(
				!!oAnnotations
					["propertyAnnotations"]
					["OtherPropertyValueAliases.Test"]
					["Value"]
					["Org.OData.Measures.V1.Name"],
				"Target value's namespace has been correctly replaced"
			);
			assert.ok(
				!!oAnnotations
					["propertyAnnotations"]
					["OtherPropertyValueAliases.Test"]
					["Value"]
					["Org.OData.Measures.V1.Name"]
					["EnumMember"],
				"Target value's child exists"
			);
			assert.equal(
				oAnnotations
					["propertyAnnotations"]
					["OtherPropertyValueAliases.Test"]
					["Value"]
					["Org.OData.Measures.V1.Name"]
					["EnumMember"],
				"Org.OData.Measures.V1.Value",
				"Target value's namespace has been correctly replaced"
			);


			assert.ok(
				!!oAnnotations
					["propertyAnnotations"]
					["OtherPropertyValueAliases.Test"]
					["Value"]
					["Org.OData.Measures.V1.Name"],
				"Target value's namespace has been correctly replaced"
			);
			assert.ok(
				!!oAnnotations
					["propertyAnnotations"]
					["OtherPropertyValueAliases.Test"]
					["Value"]
					["Org.OData.Measures.V1.Name"]
					["EnumMember"],
				"Target value's child exists"
			);
			assert.equal(
				oAnnotations
					["propertyAnnotations"]
					["OtherPropertyValueAliases.Test"]
					["Value"]
					["Org.OData.Measures.V1.Name"]
					["EnumMember"],
				"Org.OData.Measures.V1.Value",
				"Target value's namespace has been correctly replaced"
			);


			assert.ok(
				!!oAnnotations
					["propertyAnnotations"]
					["OtherPropertyValueAliases.Test"]
					["Value"]
					["com.sap.vocabularies.Common.v1.Name"],
				"Target value's namespace has been correctly replaced"
			);
			assert.ok(
				!!oAnnotations
					["propertyAnnotations"]
					["OtherPropertyValueAliases.Test"]
					["Value"]
					["com.sap.vocabularies.Common.v1.Name"]
					["EnumMember"],
				"Target value's child exists"
			);
			assert.equal(
				oAnnotations
					["propertyAnnotations"]
					["OtherPropertyValueAliases.Test"]
					["Value"]
					["com.sap.vocabularies.Common.v1.Name"]
					["EnumMember"],
				"com.sap.vocabularies.Common.v1.Value",
				"Target value's namespace has been correctly replaced"
			);


			assert.ok(
				!!oAnnotations
					["propertyAnnotations"]
					["OtherPropertyValueAliases.Test"]
					["Value"]
					["FTGEN_HB_TE.Name"],
				"Target value's namespace has been correctly replaced"
			);
			assert.ok(
				!!oAnnotations
					["propertyAnnotations"]
					["OtherPropertyValueAliases.Test"]
					["Value"]
					["FTGEN_HB_TE.Name"]
					["EnumMember"],
				"Target value's child exists"
			);
			assert.equal(
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
			done();
		});
	});

	/** @deprecated As of version 1.48.0, reason sap.ui.model.odata.ODataModel */
	QUnit.test("Text Properties", function(assert) {
		assert.expect(14);

		var mTest = mAdditionalTestsServices["Text Properties"];
		var sServiceURI = mTest.service;
		var mModelOptions = {
			annotationURI : mTest.annotations,
			json : true,
			loadAnnotationsJoined: false,
			loadMetadataAsync: false
		};

		var oModel = new V1ODataModel(sServiceURI, mModelOptions);
		var oMetadata = oModel.getServiceMetadata();
		var oAnnotations = oModel.getServiceAnnotations();

		assert.ok(!!oMetadata, "Metadata is available.");

		assert.ok(!!oAnnotations, "Annotations are available.");

		assert.ok(!!oAnnotations["propertyAnnotations"], "PropertyAnnotations group exists");

		assert.ok(
			!!oAnnotations["propertyAnnotations"]["OtherPropertyValueAliases.Test"],
			"PropertyAnnotation definition exists"
		);

		assert.ok(
			!!oAnnotations["propertyAnnotations"]["OtherPropertyValueAliases.Test"]["Value"],
			"PropertyAnnotation definition value exists"
		);

		assert.ok(
			!!oAnnotations["propertyAnnotations"]["OtherPropertyValueAliases.Test"]["Value"]["com.sap.vocabularies.UI.v1.Name1"],
			"Name1 with replaced alias exists"
		);
		assert.ok(
			!!oAnnotations["propertyAnnotations"]["OtherPropertyValueAliases.Test"]["Value"]["com.sap.vocabularies.UI.v1.Name2"],
			"Name2 with replaced alias exists"
		);
		assert.ok(
			!!oAnnotations["propertyAnnotations"]["OtherPropertyValueAliases.Test"]["Value"]["com.sap.vocabularies.UI.v1.Name3"],
			"Name3 with replaced alias exists"
		);

		assert.ok(
			!!oAnnotations["propertyAnnotations"]["OtherPropertyValueAliases.Test"]["Value"]["com.sap.vocabularies.UI.v1.Name1"]["EnumMember"],
			"Name1 with replaced alias exists and has EnumMember child node"
		);
		assert.ok(
			!!oAnnotations["propertyAnnotations"]["OtherPropertyValueAliases.Test"]["Value"]["com.sap.vocabularies.UI.v1.Name2"]["String"],
			"Name2 with replaced alias exists and has String child node"
		);
		assert.ok(
			!!oAnnotations["propertyAnnotations"]["OtherPropertyValueAliases.Test"]["Value"]["com.sap.vocabularies.UI.v1.Name3"]["Invalid"],
			"Name3 with replaced alias exists and has Invalid child node"
		);

		assert.equal(
			oAnnotations["propertyAnnotations"]["OtherPropertyValueAliases.Test"]["Value"]["com.sap.vocabularies.UI.v1.Name1"]["EnumMember"],
			"com.sap.vocabularies.UI.v1.Value",
			"Name1 with replaced alias exists and has EnumMember child node that contains alias replaced tet with trimmed white-spaces"
		);
		assert.equal(
			oAnnotations["propertyAnnotations"]["OtherPropertyValueAliases.Test"]["Value"]["com.sap.vocabularies.UI.v1.Name2"]["String"],
			"   test test   ",
			"Name2 with replaced alias exists and has String child node that contains the exact text inclunding white-spaces"
		);
		assert.deepEqual(
			oAnnotations["propertyAnnotations"]["OtherPropertyValueAliases.Test"]["Value"]["com.sap.vocabularies.UI.v1.Name3"]["Invalid"],
			{},
			"Name3 with replaced alias exists and has Invalid child node that only contains an empy object"
		);
		oModel.destroy();
	});

	QUnit.test("V2: Text Properties", function(assert) {
		var done = assert.async();
		assert.expect(14);

		var mTest = mAdditionalTestsServices["Text Properties"];
		var sServiceURI = mTest.service;
		var mModelOptions = {
			annotationURI : mTest.annotations,
			json : true,
			loadAnnotationsJoined: false,
			skipMetadataAnnotationParsing: true
		};

		var oModel = new V2ODataModel(sServiceURI, mModelOptions);
		oModel.attachAnnotationsLoaded(function() {
			var oMetadata = oModel.getServiceMetadata();
			var oAnnotations = oModel.getServiceAnnotations();

			assert.ok(!!oMetadata, "Metadata is available.");

			assert.ok(!!oAnnotations, "Annotations are available.");

			assert.ok(!!oAnnotations["propertyAnnotations"], "PropertyAnnotations group exists");

			assert.ok(
				!!oAnnotations["propertyAnnotations"]["OtherPropertyValueAliases.Test"],
				"PropertyAnnotation definition exists"
			);

			assert.ok(
				!!oAnnotations["propertyAnnotations"]["OtherPropertyValueAliases.Test"]["Value"],
				"PropertyAnnotation definition value exists"
			);

			assert.ok(
				!!oAnnotations["propertyAnnotations"]["OtherPropertyValueAliases.Test"]["Value"]["com.sap.vocabularies.UI.v1.Name1"],
				"Name1 with replaced alias exists"
			);
			assert.ok(
				!!oAnnotations["propertyAnnotations"]["OtherPropertyValueAliases.Test"]["Value"]["com.sap.vocabularies.UI.v1.Name2"],
				"Name2 with replaced alias exists"
			);
			assert.ok(
				!!oAnnotations["propertyAnnotations"]["OtherPropertyValueAliases.Test"]["Value"]["com.sap.vocabularies.UI.v1.Name3"],
				"Name3 with replaced alias exists"
			);

			assert.ok(
				!!oAnnotations["propertyAnnotations"]["OtherPropertyValueAliases.Test"]["Value"]["com.sap.vocabularies.UI.v1.Name1"]["EnumMember"],
				"Name1 with replaced alias exists and has EnumMember child node"
			);
			assert.ok(
				!!oAnnotations["propertyAnnotations"]["OtherPropertyValueAliases.Test"]["Value"]["com.sap.vocabularies.UI.v1.Name2"]["String"],
				"Name2 with replaced alias exists and has String child node"
			);
			assert.ok(
				!!oAnnotations["propertyAnnotations"]["OtherPropertyValueAliases.Test"]["Value"]["com.sap.vocabularies.UI.v1.Name3"]["Invalid"],
				"Name3 with replaced alias exists and has Invalid child node"
			);

			assert.equal(
				oAnnotations["propertyAnnotations"]["OtherPropertyValueAliases.Test"]["Value"]["com.sap.vocabularies.UI.v1.Name1"]["EnumMember"],
				"com.sap.vocabularies.UI.v1.Value",
				"Name1 with replaced alias exists and has EnumMember child node that contains alias replaced tet with trimmed white-spaces"
			);
			assert.equal(
				oAnnotations["propertyAnnotations"]["OtherPropertyValueAliases.Test"]["Value"]["com.sap.vocabularies.UI.v1.Name2"]["String"],
				"   test test   ",
				"Name2 with replaced alias exists and has String child node that contains the exact text inclunding white-spaces"
			);
			assert.deepEqual(
				oAnnotations["propertyAnnotations"]["OtherPropertyValueAliases.Test"]["Value"]["com.sap.vocabularies.UI.v1.Name3"]["Invalid"],
				{},
				"Name3 with replaced alias exists and has Invalid child node that only contains an empy object"
			);
			oModel.destroy();
			done();
		});
	});

	/** @deprecated As of version 1.48.0, reason sap.ui.model.odata.ODataModel */
	QUnit.test("Entity Containers", function(assert) {
		assert.expect(30);

		var mTest = mAdditionalTestsServices["Entity Containers"];
		var sServiceURI = mTest.service;
		var mModelOptions = {
			annotationURI : mTest.annotations,
			json : true,
			loadAnnotationsJoined: false,
			loadMetadataAsync: false
		};

		var oModel = new V1ODataModel(sServiceURI, mModelOptions);
		var oMetadata = oModel.getServiceMetadata();
		var oAnnotations = oModel.getServiceAnnotations();

		assert.ok(!!oMetadata, "Metadata is available.");

		assert.ok(!!oAnnotations, "Annotations are available.");


		assert.ok(!!oAnnotations["EntityContainer"], "Entity container entry exists");

		assert.ok(!!oAnnotations["EntityContainer"]["AIVS_NEW_BO_SRV.AIVS_NEW_BO_SRV_Entities"], "Entity container exists");

		assert.ok(
			!!oAnnotations["EntityContainer"]["AIVS_NEW_BO_SRV.AIVS_NEW_BO_SRV_Entities"]
			["SalesOrder"],
			"Entity in container exists"
		);

		assert.ok(
			!!oAnnotations["EntityContainer"]["AIVS_NEW_BO_SRV.AIVS_NEW_BO_SRV_Entities"]
			["SalesOrder"]
			["com.sap.vocabularies.Common.v1.DraftRoot"],
			"Sub Entity in container exists"
		);

		assert.ok(
			!!oAnnotations["EntityContainer"]["AIVS_NEW_BO_SRV.AIVS_NEW_BO_SRV_Entities"]
			["SalesOrder"]
			["com.sap.vocabularies.Common.v1.DraftRoot"]
			["ActivationAction"],
			"Sub Entity value in container exists"
		);
		assert.ok(
			!!oAnnotations["EntityContainer"]["AIVS_NEW_BO_SRV.AIVS_NEW_BO_SRV_Entities"]
			["SalesOrder"]
			["com.sap.vocabularies.Common.v1.DraftRoot"]
			["ActivationAction"]
			["String"],
			"Sub Entity value in container exists"
		);
		assert.equal(
			oAnnotations["EntityContainer"]["AIVS_NEW_BO_SRV.AIVS_NEW_BO_SRV_Entities"]
			["SalesOrder"]
			["com.sap.vocabularies.Common.v1.DraftRoot"]
			["ActivationAction"]
			["String"],
			"AIVS_NEW_BO_SRV.AIVS_NEW_BO_SRV_Entities/Activate",
			"Sub Entity value in container exists"
		);

		assert.ok(
			!!oAnnotations["EntityContainer"]["AIVS_NEW_BO_SRV.AIVS_NEW_BO_SRV_Entities"]
			["SalesOrder"]
			["com.sap.vocabularies.Common.v1.DraftRoot"]
			["EditAction"],
			"Sub Entity value in container exists"
		);
		assert.ok(
			!!oAnnotations["EntityContainer"]["AIVS_NEW_BO_SRV.AIVS_NEW_BO_SRV_Entities"]
			["SalesOrder"]
			["com.sap.vocabularies.Common.v1.DraftRoot"]
			["EditAction"]
			["String"],
			"Sub Entity value in container exists"
		);
		assert.equal(
			oAnnotations["EntityContainer"]["AIVS_NEW_BO_SRV.AIVS_NEW_BO_SRV_Entities"]
			["SalesOrder"]
			["com.sap.vocabularies.Common.v1.DraftRoot"]
			["EditAction"]
			["String"],
			"AIVS_NEW_BO_SRV.AIVS_NEW_BO_SRV_Entities/Edit",
			"Sub Entity value in container exists"
		);

		assert.ok(
			!!oAnnotations["EntityContainer"]["AIVS_NEW_BO_SRV.AIVS_NEW_BO_SRV_Entities"]
			["SalesOrder"]
			["com.sap.vocabularies.Common.v1.DraftRoot"]
			["ValidationFunction"],
			"Sub Entity value in container exists"
		);
		assert.ok(
			!!oAnnotations["EntityContainer"]["AIVS_NEW_BO_SRV.AIVS_NEW_BO_SRV_Entities"]
			["SalesOrder"]
			["com.sap.vocabularies.Common.v1.DraftRoot"]
			["ValidationFunction"]
			["String"],
			"Sub Entity value in container exists"
		);
		assert.equal(
			oAnnotations["EntityContainer"]["AIVS_NEW_BO_SRV.AIVS_NEW_BO_SRV_Entities"]
			["SalesOrder"]
			["com.sap.vocabularies.Common.v1.DraftRoot"]
			["ValidationFunction"]
			["String"],
			"AIVS_NEW_BO_SRV.AIVS_NEW_BO_SRV_Entities/Validate",
			"Sub Entity value in container exists"
		);

		assert.ok(
			!!oAnnotations["EntityContainer"]["AIVS_NEW_BO_SRV.AIVS_NEW_BO_SRV_Entities"]
			["SalesOrder"]
			["com.sap.vocabularies.Common.v1.DraftRoot"]
			["PreparationAction"],
			"Sub Entity value in container exists"
		);
		assert.ok(
			!!oAnnotations["EntityContainer"]["AIVS_NEW_BO_SRV.AIVS_NEW_BO_SRV_Entities"]
			["SalesOrder"]
			["com.sap.vocabularies.Common.v1.DraftRoot"]
			["PreparationAction"]
			["String"],
			"Sub Entity value in container exists"
		);
		assert.equal(
			oAnnotations["EntityContainer"]["AIVS_NEW_BO_SRV.AIVS_NEW_BO_SRV_Entities"]
			["SalesOrder"]
			["com.sap.vocabularies.Common.v1.DraftRoot"]
			["PreparationAction"]
			["String"],
			"AIVS_NEW_BO_SRV.AIVS_NEW_BO_SRV_Entities/Prepare",
			"Sub Entity value in container exists"
		);

		assert.ok(
			!!oAnnotations["AIVS_NEW_BO_SRV.SalesOrderType"],
			"Entity in namespace exists"
		);
		assert.ok(
			!!oAnnotations["AIVS_NEW_BO_SRV.SalesOrderType"]
			["com.sap.vocabularies.Common.v1.SemanticKey"],
			"Entity in namespace exists"
		);
		assert.ok(
			!!oAnnotations["AIVS_NEW_BO_SRV.SalesOrderType"]
			["com.sap.vocabularies.Common.v1.SemanticKey"]
			[0],
			"Entity entries in namespace exists"
		);
		assert.ok(
			!!oAnnotations["AIVS_NEW_BO_SRV.SalesOrderType"]
			["com.sap.vocabularies.Common.v1.SemanticKey"]
			[0]
			["PropertyPath"],
			"Property exists"
		);
		assert.equal(
			oAnnotations["AIVS_NEW_BO_SRV.SalesOrderType"]
			["com.sap.vocabularies.Common.v1.SemanticKey"]
			[0]
			["PropertyPath"],
			"SalesOrderID",
			"Entity in namespace exists"
		);

		assert.ok(
			!!oAnnotations["AIVS_NEW_BO_SRV.SalesOrderItemType"],
			"Entity in namespace exists"
		);
		assert.ok(
			!!oAnnotations["AIVS_NEW_BO_SRV.SalesOrderItemType"]
			["com.sap.vocabularies.Common.v1.SemanticKey"],
			"Entity in namespace exists"
		);
		assert.ok(
			!!oAnnotations["AIVS_NEW_BO_SRV.SalesOrderItemType"]
			["com.sap.vocabularies.Common.v1.SemanticKey"]
			[0],
			"Entity entries in namespace exists"
		);
		assert.ok(
			!!oAnnotations["AIVS_NEW_BO_SRV.SalesOrderItemType"]
			["com.sap.vocabularies.Common.v1.SemanticKey"]
			[0]
			["PropertyPath"],
			"Property exists"
		);
		assert.ok(
			!!oAnnotations["AIVS_NEW_BO_SRV.SalesOrderItemType"]
			["com.sap.vocabularies.Common.v1.SemanticKey"]
			[1]
			["PropertyPath"],
			"Property exists"
		);
		assert.equal(
			oAnnotations["AIVS_NEW_BO_SRV.SalesOrderItemType"]
			["com.sap.vocabularies.Common.v1.SemanticKey"]
			[0]
			["PropertyPath"],
			"SalesOrderID",
			"Entity in namespace exists"
		);
		assert.equal(
			oAnnotations["AIVS_NEW_BO_SRV.SalesOrderItemType"]
			["com.sap.vocabularies.Common.v1.SemanticKey"]
			[1]
			["PropertyPath"],
			"SalesOrderItemID",
			"Entity in namespace exists"
		);
		oModel.destroy();
	});

	QUnit.test("V2: Entity Containers", function(assert) {
		var done = assert.async();
		assert.expect(30);

		var mTest = mAdditionalTestsServices["Entity Containers"];
		var sServiceURI = mTest.service;
		var mModelOptions = {
			annotationURI : mTest.annotations,
			json : true,
			loadAnnotationsJoined: true,
			skipMetadataAnnotationParsing: true
		};

		var oModel = new V2ODataModel(sServiceURI, mModelOptions);
		oModel.attachMetadataLoaded(function() {
			var oMetadata = oModel.getServiceMetadata();
			var oAnnotations = oModel.getServiceAnnotations();

			assert.ok(!!oMetadata, "Metadata is available.");

			assert.ok(!!oAnnotations, "Annotations are available.");


			assert.ok(!!oAnnotations["EntityContainer"], "Entity container entry exists");

			assert.ok(!!oAnnotations["EntityContainer"]["AIVS_NEW_BO_SRV.AIVS_NEW_BO_SRV_Entities"], "Entity container exists");

			assert.ok(
				!!oAnnotations["EntityContainer"]["AIVS_NEW_BO_SRV.AIVS_NEW_BO_SRV_Entities"]
				["SalesOrder"],
				"Entity in container exists"
			);

			assert.ok(
				!!oAnnotations["EntityContainer"]["AIVS_NEW_BO_SRV.AIVS_NEW_BO_SRV_Entities"]
				["SalesOrder"]
				["com.sap.vocabularies.Common.v1.DraftRoot"],
				"Sub Entity in container exists"
			);

			assert.ok(
				!!oAnnotations["EntityContainer"]["AIVS_NEW_BO_SRV.AIVS_NEW_BO_SRV_Entities"]
				["SalesOrder"]
				["com.sap.vocabularies.Common.v1.DraftRoot"]
				["ActivationAction"],
				"Sub Entity value in container exists"
			);
			assert.ok(
				!!oAnnotations["EntityContainer"]["AIVS_NEW_BO_SRV.AIVS_NEW_BO_SRV_Entities"]
				["SalesOrder"]
				["com.sap.vocabularies.Common.v1.DraftRoot"]
				["ActivationAction"]
				["String"],
				"Sub Entity value in container exists"
			);
			assert.equal(
				oAnnotations["EntityContainer"]["AIVS_NEW_BO_SRV.AIVS_NEW_BO_SRV_Entities"]
				["SalesOrder"]
				["com.sap.vocabularies.Common.v1.DraftRoot"]
				["ActivationAction"]
				["String"],
				"AIVS_NEW_BO_SRV.AIVS_NEW_BO_SRV_Entities/Activate",
				"Sub Entity value in container exists"
			);

			assert.ok(
				!!oAnnotations["EntityContainer"]["AIVS_NEW_BO_SRV.AIVS_NEW_BO_SRV_Entities"]
				["SalesOrder"]
				["com.sap.vocabularies.Common.v1.DraftRoot"]
				["EditAction"],
				"Sub Entity value in container exists"
			);
			assert.ok(
				!!oAnnotations["EntityContainer"]["AIVS_NEW_BO_SRV.AIVS_NEW_BO_SRV_Entities"]
				["SalesOrder"]
				["com.sap.vocabularies.Common.v1.DraftRoot"]
				["EditAction"]
				["String"],
				"Sub Entity value in container exists"
			);
			assert.equal(
				oAnnotations["EntityContainer"]["AIVS_NEW_BO_SRV.AIVS_NEW_BO_SRV_Entities"]
				["SalesOrder"]
				["com.sap.vocabularies.Common.v1.DraftRoot"]
				["EditAction"]
				["String"],
				"AIVS_NEW_BO_SRV.AIVS_NEW_BO_SRV_Entities/Edit",
				"Sub Entity value in container exists"
			);

			assert.ok(
				!!oAnnotations["EntityContainer"]["AIVS_NEW_BO_SRV.AIVS_NEW_BO_SRV_Entities"]
				["SalesOrder"]
				["com.sap.vocabularies.Common.v1.DraftRoot"]
				["ValidationFunction"],
				"Sub Entity value in container exists"
			);
			assert.ok(
				!!oAnnotations["EntityContainer"]["AIVS_NEW_BO_SRV.AIVS_NEW_BO_SRV_Entities"]
				["SalesOrder"]
				["com.sap.vocabularies.Common.v1.DraftRoot"]
				["ValidationFunction"]
				["String"],
				"Sub Entity value in container exists"
			);
			assert.equal(
				oAnnotations["EntityContainer"]["AIVS_NEW_BO_SRV.AIVS_NEW_BO_SRV_Entities"]
				["SalesOrder"]
				["com.sap.vocabularies.Common.v1.DraftRoot"]
				["ValidationFunction"]
				["String"],
				"AIVS_NEW_BO_SRV.AIVS_NEW_BO_SRV_Entities/Validate",
				"Sub Entity value in container exists"
			);

			assert.ok(
				!!oAnnotations["EntityContainer"]["AIVS_NEW_BO_SRV.AIVS_NEW_BO_SRV_Entities"]
				["SalesOrder"]
				["com.sap.vocabularies.Common.v1.DraftRoot"]
				["PreparationAction"],
				"Sub Entity value in container exists"
			);
			assert.ok(
				!!oAnnotations["EntityContainer"]["AIVS_NEW_BO_SRV.AIVS_NEW_BO_SRV_Entities"]
				["SalesOrder"]
				["com.sap.vocabularies.Common.v1.DraftRoot"]
				["PreparationAction"]
				["String"],
				"Sub Entity value in container exists"
			);
			assert.equal(
				oAnnotations["EntityContainer"]["AIVS_NEW_BO_SRV.AIVS_NEW_BO_SRV_Entities"]
				["SalesOrder"]
				["com.sap.vocabularies.Common.v1.DraftRoot"]
				["PreparationAction"]
				["String"],
				"AIVS_NEW_BO_SRV.AIVS_NEW_BO_SRV_Entities/Prepare",
				"Sub Entity value in container exists"
			);

			assert.ok(
				!!oAnnotations["AIVS_NEW_BO_SRV.SalesOrderType"],
				"Entity in namespace exists"
			);
			assert.ok(
				!!oAnnotations["AIVS_NEW_BO_SRV.SalesOrderType"]
				["com.sap.vocabularies.Common.v1.SemanticKey"],
				"Entity in namespace exists"
			);
			assert.ok(
				!!oAnnotations["AIVS_NEW_BO_SRV.SalesOrderType"]
				["com.sap.vocabularies.Common.v1.SemanticKey"]
				[0],
				"Entity entries in namespace exists"
			);
			assert.ok(
				!!oAnnotations["AIVS_NEW_BO_SRV.SalesOrderType"]
				["com.sap.vocabularies.Common.v1.SemanticKey"]
				[0]
				["PropertyPath"],
				"Property exists"
			);
			assert.equal(
				oAnnotations["AIVS_NEW_BO_SRV.SalesOrderType"]
				["com.sap.vocabularies.Common.v1.SemanticKey"]
				[0]
				["PropertyPath"],
				"SalesOrderID",
				"Entity in namespace exists"
			);

			assert.ok(
				!!oAnnotations["AIVS_NEW_BO_SRV.SalesOrderItemType"],
				"Entity in namespace exists"
			);
			assert.ok(
				!!oAnnotations["AIVS_NEW_BO_SRV.SalesOrderItemType"]
				["com.sap.vocabularies.Common.v1.SemanticKey"],
				"Entity in namespace exists"
			);
			assert.ok(
				!!oAnnotations["AIVS_NEW_BO_SRV.SalesOrderItemType"]
				["com.sap.vocabularies.Common.v1.SemanticKey"]
				[0],
				"Entity entries in namespace exists"
			);
			assert.ok(
				!!oAnnotations["AIVS_NEW_BO_SRV.SalesOrderItemType"]
				["com.sap.vocabularies.Common.v1.SemanticKey"]
				[0]
				["PropertyPath"],
				"Property exists"
			);
			assert.ok(
				!!oAnnotations["AIVS_NEW_BO_SRV.SalesOrderItemType"]
				["com.sap.vocabularies.Common.v1.SemanticKey"]
				[1]
				["PropertyPath"],
				"Property exists"
			);
			assert.equal(
				oAnnotations["AIVS_NEW_BO_SRV.SalesOrderItemType"]
				["com.sap.vocabularies.Common.v1.SemanticKey"]
				[0]
				["PropertyPath"],
				"SalesOrderID",
				"Entity in namespace exists"
			);
			assert.equal(
				oAnnotations["AIVS_NEW_BO_SRV.SalesOrderItemType"]
				["com.sap.vocabularies.Common.v1.SemanticKey"]
				[1]
				["PropertyPath"],
				"SalesOrderItemID",
				"Entity in namespace exists"
			);
			oModel.destroy();
			done();
		});
	});

	/** @deprecated As of version 1.48.0, reason sap.ui.model.odata.ODataModel */
	QUnit.test("Simple Values", function(assert) {
		assert.expect(3);

		var mTest = mAdditionalTestsServices["Simple Values"];
		var sServiceURI = mTest.service;
		var mModelOptions = {
			annotationURI : mTest.annotations,
			json : true,
			loadAnnotationsJoined: false,
			loadMetadataAsync: false
		};

		var oModel = new V1ODataModel(sServiceURI, mModelOptions);
		var oMetadata = oModel.getServiceMetadata();
		var oAnnotations = oModel.getServiceAnnotations();

		assert.ok(!!oMetadata, "Metadata is available.");

		assert.ok(!!oAnnotations, "Annotations are available.");

		assert.deepEqual(
			oAnnotations["SimpleValues.Test"]["com.sap.vocabularies.UI.v1.Name1"],
			oAnnotations["SimpleValues.Test"]["com.sap.vocabularies.UI.v1.Name2"],
			"Simple value attributes have the meaning as child elements"
		);
		oModel.destroy();

	});

	QUnit.test("V2: Simple Values", function(assert) {
		var done = assert.async();
		assert.expect(3);

		var mTest = mAdditionalTestsServices["Simple Values"];
		var sServiceURI = mTest.service;
		var mModelOptions = {
			annotationURI : mTest.annotations,
			json : true,
			loadAnnotationsJoined: true,
			skipMetadataAnnotationParsing: true
		};

		var oModel = new V2ODataModel(sServiceURI, mModelOptions);
		oModel.attachMetadataLoaded(function() {
			var oMetadata = oModel.getServiceMetadata();
			var oAnnotations = oModel.getServiceAnnotations();

			assert.ok(!!oMetadata, "Metadata is available.");

			assert.ok(!!oAnnotations, "Annotations are available.");

			assert.deepEqual(
				oAnnotations["SimpleValues.Test"]["com.sap.vocabularies.UI.v1.Name1"],
				oAnnotations["SimpleValues.Test"]["com.sap.vocabularies.UI.v1.Name2"],
				"Simple value attributes have the meaning as child elements"
			);
			oModel.destroy();
			done();
		});
	});

	/** @deprecated As of version 1.48.0, reason sap.ui.model.odata.ODataModel */
	QUnit.test("Collection with Namespace", function(assert) {
		assert.expect(6);

		var mTest = mAdditionalTestsServices["Collection with Namespace"];
		var sServiceURI = mTest.service;
		var mModelOptions = {
			annotationURI : mTest.annotations,
			json : true,
			loadAnnotationsJoined: false,
			loadMetadataAsync: false
		};

		var oModel = new V1ODataModel(sServiceURI, mModelOptions);
		var oMetadata = oModel.getServiceMetadata();
		var oAnnotations = oModel.getServiceAnnotations();

		assert.ok(!!oMetadata, "Metadata is available.");

		assert.ok(!!oAnnotations, "Annotations are available.");


		assert.ok(!!oAnnotations["propertyAnnotations"], "propertyAnnotations exists");
		assert.ok(!!oAnnotations["propertyAnnotations"]["CollectionWithNamespace.Test"], "propertyAnnotations Entry exists");
		assert.ok(!!oAnnotations["propertyAnnotations"]["CollectionWithNamespace.Test"]["Value"], "propertyAnnotations Entry Value exists");

		assert.deepEqual(
			oAnnotations["propertyAnnotations"]["CollectionWithNamespace.Test"]["Value"]["UI.TestNS"],
			oAnnotations["propertyAnnotations"]["CollectionWithNamespace.Test"]["Value"]["UI.TestNoNS"],
			"Collection with and without namespace have the same values"
		);
		oModel.destroy();
	});

	QUnit.test("V2: Collection with Namespace", function(assert) {
		var done = assert.async();
		assert.expect(6);

		var mTest = mAdditionalTestsServices["Collection with Namespace"];
		var sServiceURI = mTest.service;
		var mModelOptions = {
			annotationURI : mTest.annotations,
			json : true,
			loadAnnotationsJoined: true,
			skipMetadataAnnotationParsing: true
		};

		var oModel = new V2ODataModel(sServiceURI, mModelOptions);
		oModel.attachMetadataLoaded(function() {
			var oMetadata = oModel.getServiceMetadata();
			var oAnnotations = oModel.getServiceAnnotations();

			assert.ok(!!oMetadata, "Metadata is available.");

			assert.ok(!!oAnnotations, "Annotations are available.");


			assert.ok(!!oAnnotations["propertyAnnotations"], "propertyAnnotations exists");
			assert.ok(!!oAnnotations["propertyAnnotations"]["CollectionWithNamespace.Test"], "propertyAnnotations Entry exists");
			assert.ok(!!oAnnotations["propertyAnnotations"]["CollectionWithNamespace.Test"]["Value"], "propertyAnnotations Entry Value exists");

			assert.deepEqual(
				oAnnotations["propertyAnnotations"]["CollectionWithNamespace.Test"]["Value"]["UI.TestNS"],
				oAnnotations["propertyAnnotations"]["CollectionWithNamespace.Test"]["Value"]["UI.TestNoNS"],
				"Collection with and without namespace have the same values"
			);
			oModel.destroy();
			done();
		});
	});

	/** @deprecated As of version 1.48.0, reason sap.ui.model.odata.ODataModel */
	QUnit.test("UrlRef", function(assert) {
		assert.expect(78);

		var mTest = mAdditionalTestsServices["UrlRef"];
		var sServiceURI = mTest.service;
		var mModelOptions = {
			annotationURI : mTest.annotations,
			json : true,
			loadAnnotationsJoined: false,
			loadMetadataAsync: false
		};

		var oModel = new V1ODataModel(sServiceURI, mModelOptions);
		var oMetadata = oModel.getServiceMetadata();
		var oAnnotations = oModel.getServiceAnnotations();

		assert.ok(!!oMetadata, "Metadata is available.");

		assert.ok(!!oAnnotations, "Annotations are available.");

		assert.ok(!!oAnnotations["UrlTest"], "Main entry exists");

		deepContains(assert,
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

		assert.equal(oAnnotations["UrlTest"]["com.sap.vocabularies.UI.v1.Identification"][2]["Url"]["UrlRef"]["Apply"]["Parameters"][2]["Name"], "city", "Name is correctly set for labeled element");
		assert.ok(!oAnnotations["UrlTest"]["com.sap.vocabularies.UI.v1.Identification"][2]["Url"]["UrlRef"]["Apply"]["Parameters"][2]["Value"]["Name"], "Name is not set for labeled element Value");

		oModel.destroy();
	});


	QUnit.test("V2: UrlRef", function(assert) {
		var done = assert.async();
		assert.expect(78);

		var mTest = mAdditionalTestsServices["UrlRef"];
		var sServiceURI = mTest.service;
		var mModelOptions = {
			annotationURI : mTest.annotations,
			json : true,
			loadAnnotationsJoined: true,
			skipMetadataAnnotationParsing: true
		};

		var oModel = new V2ODataModel(sServiceURI, mModelOptions);
		oModel.attachMetadataLoaded(function() {
			var oMetadata = oModel.getServiceMetadata();
			var oAnnotations = oModel.getServiceAnnotations();

			assert.ok(!!oMetadata, "Metadata is available.");

			assert.ok(!!oAnnotations, "Annotations are available.");

			assert.ok(!!oAnnotations["UrlTest"], "Main entry exists");

			deepContains(assert,
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

			assert.equal(oAnnotations["UrlTest"]["com.sap.vocabularies.UI.v1.Identification"][2]["Url"]["UrlRef"]["Apply"]["Parameters"][2]["Name"], "city", "Name is correctly set for labeled element");
			assert.ok(!oAnnotations["UrlTest"]["com.sap.vocabularies.UI.v1.Identification"][2]["Url"]["UrlRef"]["Apply"]["Parameters"][2]["Value"]["Name"], "Name is not set for labeled element Value");

			oModel.destroy();
			done();
		});
	});


	QUnit.test("V2 only: Delayed Loading", function(assert) {
		var done = assert.async();
		assert.expect(22);

		var mTest = mAdditionalTestsServices["Delayed Loading"];
		var sServiceURI = mTest.service;
		var mModelOptions = {
			annotationURI : mTest.annotations[0],
			json : true,
			loadAnnotationsJoined: false,
			loadMetadataAsync: true,
			skipMetadataAnnotationParsing: true
		};

		var oModel = new V2ODataModel(sServiceURI, mModelOptions);

		var bFirstLoad = true;
		oModel.attachAnnotationsLoaded(function() {
			if (!bFirstLoad) {
				// Only run further tests if this is the first annotation loading...
				return;
			}
			bFirstLoad = false;

			var oMetadata = oModel.getServiceMetadata();
			var oAnnotations = oModel.getServiceAnnotations();

			assert.ok(!!oMetadata, "Metadata is available.");
			assert.ok(Object.keys(oAnnotations).length > 0, "Annotations are available...");

			assert.ok(!!oAnnotations["internal.ui5.test.MultipleAnnotations"], "Annoation Namespace exists and Alias has been replaced");
			assert.ok(!!oAnnotations["internal.ui5.test.MultipleAnnotations"]["internal.ui5.test.FromAll"], "FromFirst namespace exists");
			assert.ok(!!oAnnotations["internal.ui5.test.MultipleAnnotations"]["internal.ui5.test.FromAll"]["String"], "FromFirst annotation exists");

			assert.ok(!!oAnnotations["internal.ui5.test.MultipleAnnotations"]["internal.ui5.test.FromFirst"], "FromFirst namespace exists");
			assert.ok(!!oAnnotations["internal.ui5.test.MultipleAnnotations"]["internal.ui5.test.FromFirst"]["String"], "FromFirst annotation exists");

			assert.equal(oAnnotations["internal.ui5.test.MultipleAnnotations"]["internal.ui5.test.FromAll"]["String"], "First", "FromAll annotation filled from first source");
			assert.equal(oAnnotations["internal.ui5.test.MultipleAnnotations"]["internal.ui5.test.FromFirst"]["String"], "First", "FromFirst annotation filled from first source");

			oModel.addAnnotationUrl(mTest.annotations[1]).then(function(mResults) {
				assert.ok(mResults.annotations === oAnnotations, "Second Annotations loaded...");

				assert.ok(!!oAnnotations["internal.ui5.test.MultipleAnnotations"]["internal.ui5.test.FromSecond"], "FromSecond namespace exists");
				assert.ok(!!oAnnotations["internal.ui5.test.MultipleAnnotations"]["internal.ui5.test.FromSecond"]["String"], "FromSecond annotation exists");

				assert.equal(oAnnotations["internal.ui5.test.MultipleAnnotations"]["internal.ui5.test.FromAll"]["String"], "Second", "FromAll annotation filled from second source");
				assert.equal(oAnnotations["internal.ui5.test.MultipleAnnotations"]["internal.ui5.test.FromFirst"]["String"], "First", "FromFirst annotation filled from first source");
				assert.equal(oAnnotations["internal.ui5.test.MultipleAnnotations"]["internal.ui5.test.FromSecond"]["String"], "Second", "FromFirst annotation filled from Second source");

				oModel.addAnnotationUrl(mTest.annotations[2]).then(function(mResults) {
					assert.ok(mResults.annotations === oAnnotations, "Third Annotations loaded...");

					assert.ok(!!oAnnotations["internal.ui5.test.MultipleAnnotations"]["internal.ui5.test.FromThird"], "FromThird namespace exists");
					assert.ok(!!oAnnotations["internal.ui5.test.MultipleAnnotations"]["internal.ui5.test.FromThird"]["String"], "FromThird annotation exists");

					assert.equal(oAnnotations["internal.ui5.test.MultipleAnnotations"]["internal.ui5.test.FromAll"]["String"], "Third", "FromAll annotation filled from second source");
					assert.equal(oAnnotations["internal.ui5.test.MultipleAnnotations"]["internal.ui5.test.FromFirst"]["String"], "First", "FromFirst annotation filled from first source");
					assert.equal(oAnnotations["internal.ui5.test.MultipleAnnotations"]["internal.ui5.test.FromSecond"]["String"], "Second", "FromFirst annotation filled from Second source");
					assert.equal(oAnnotations["internal.ui5.test.MultipleAnnotations"]["internal.ui5.test.FromThird"]["String"], "Third", "FromFirst annotation filled from Second source");

					oModel.destroy();
					done();

				}).catch(function(mResults) {
					assert.ok(false, "Third Annotations could not be loaded...");
				});
			}).catch(function(mResults) {
				assert.ok(false, "Second Annotations could not be loaded...");
			});
		});
	});

	QUnit.test("V2 only: Delayed Parsing", function(assert) {
		var done = assert.async();
		assert.expect(26);

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
		var oModel = new V2ODataModel(sServiceURI, mModelOptions);


		var sFirstAnnotations  = fakeService.getAnnotationFromFakeUrl(mTest.annotations[0]);
		assert.ok(sFirstAnnotations.indexOf("<?xml") === 0, "First annotation file data loaded");

		var sSecondAnnotations = fakeService.getAnnotationFromFakeUrl(mTest.annotations[1]);
		assert.ok(sSecondAnnotations.indexOf("<?xml") === 0, "Second annotation file data loaded");

		var sThirdAnnotations  = fakeService.getAnnotationFromFakeUrl(mTest.annotations[2]);
		assert.ok(sThirdAnnotations.indexOf("<?xml") === 0, "Third annotation file data loaded");


		// TODO: Change internal access from oModel.oMetadata to offial API when available...
		oModel.oMetadata.loaded().then(function() {
			var oMetadata = oModel.getServiceMetadata();
			var oAnnotations = oModel.getServiceAnnotations();

			assert.ok(!!oMetadata, "Metadata is available.");
			assert.ok(!oAnnotations || Object.keys(oAnnotations).length === 0, "Annotations are not available...");

			oModel.addAnnotationXML(sFirstAnnotations).then(function(mResults) {
				assert.ok(!!mResults.annotations, "First Annotations loaded...");
				oAnnotations = oModel.getServiceAnnotations();

				assert.ok(!!oAnnotations["internal.ui5.test.MultipleAnnotations"], "Annoation Namespace exists and Alias has been replaced");
				assert.ok(!!oAnnotations["internal.ui5.test.MultipleAnnotations"]["internal.ui5.test.FromAll"], "FromFirst namespace exists");
				assert.ok(!!oAnnotations["internal.ui5.test.MultipleAnnotations"]["internal.ui5.test.FromAll"]["String"], "FromFirst annotation exists");

				assert.ok(!!oAnnotations["internal.ui5.test.MultipleAnnotations"]["internal.ui5.test.FromFirst"], "FromFirst namespace exists");
				assert.ok(!!oAnnotations["internal.ui5.test.MultipleAnnotations"]["internal.ui5.test.FromFirst"]["String"], "FromFirst annotation exists");

				assert.equal(oAnnotations["internal.ui5.test.MultipleAnnotations"]["internal.ui5.test.FromAll"]["String"], "First", "FromAll annotation filled from first source");
				assert.equal(oAnnotations["internal.ui5.test.MultipleAnnotations"]["internal.ui5.test.FromFirst"]["String"], "First", "FromFirst annotation filled from first source");

				oModel.addAnnotationXML(sSecondAnnotations).then(function(mResults) {
					assert.ok(!!mResults.annotations, "Second Annotations loaded...");
					oAnnotations = oModel.getServiceAnnotations();

					assert.ok(!!oAnnotations["internal.ui5.test.MultipleAnnotations"]["internal.ui5.test.FromSecond"], "FromSecond namespace exists");
					assert.ok(!!oAnnotations["internal.ui5.test.MultipleAnnotations"]["internal.ui5.test.FromSecond"]["String"], "FromSecond annotation exists");

					assert.equal(oAnnotations["internal.ui5.test.MultipleAnnotations"]["internal.ui5.test.FromAll"]["String"], "Second", "FromAll annotation filled from second source");
					assert.equal(oAnnotations["internal.ui5.test.MultipleAnnotations"]["internal.ui5.test.FromFirst"]["String"], "First", "FromFirst annotation filled from first source");
					assert.equal(oAnnotations["internal.ui5.test.MultipleAnnotations"]["internal.ui5.test.FromSecond"]["String"], "Second", "FromFirst annotation filled from Second source");

					oModel.addAnnotationXML(sThirdAnnotations).then(function(mResults) {
						assert.ok(!!mResults.annotations, "Third Annotations loaded...");
						oAnnotations = oModel.getServiceAnnotations();

						assert.ok(!!oAnnotations["internal.ui5.test.MultipleAnnotations"]["internal.ui5.test.FromThird"], "FromThird namespace exists");
						assert.ok(!!oAnnotations["internal.ui5.test.MultipleAnnotations"]["internal.ui5.test.FromThird"]["String"], "FromThird annotation exists");

						assert.equal(oAnnotations["internal.ui5.test.MultipleAnnotations"]["internal.ui5.test.FromAll"]["String"], "Third", "FromAll annotation filled from second source");
						assert.equal(oAnnotations["internal.ui5.test.MultipleAnnotations"]["internal.ui5.test.FromFirst"]["String"], "First", "FromFirst annotation filled from first source");
						assert.equal(oAnnotations["internal.ui5.test.MultipleAnnotations"]["internal.ui5.test.FromSecond"]["String"], "Second", "FromFirst annotation filled from Second source");
						assert.equal(oAnnotations["internal.ui5.test.MultipleAnnotations"]["internal.ui5.test.FromThird"]["String"], "Third", "FromFirst annotation filled from Second source");

						oModel.destroy();
						done();

					}).catch(function(mResults) {
						assert.ok(false, "Third Annotations could not be parsed...");
						oModel.destroy();
						done();
					});
				}).catch(function(mResults) {
					assert.ok(false, "Second Annotations could not be parsed...");
					oModel.destroy();
					done();
				});
			}).catch(function(mResults) {
				assert.ok(false, "First Annotations could not be parsed...");
				oModel.destroy();
				done();
			});
		}).catch(function() {
			assert.ok(false, "Metadata could not be loaded...");
			oModel.destroy();
			done();
		});
	});


	/** @deprecated As of version 1.48.0, reason sap.ui.model.odata.ODataModel */
	QUnit.test("Alias Replacement", function(assert) {
		assert.expect(13);

		var mTest = mAdditionalTestsServices["Alias Replacement"];
		var sServiceURI = mTest.service;
		var mModelOptions = {
			annotationURI : mTest.annotations,
			json : true,
			loadAnnotationsJoined: false,
			loadMetadataAsync: false
		};

		var oModel = new V1ODataModel(sServiceURI, mModelOptions);
		var oMetadata = oModel.getServiceMetadata();
		var oAnnotations = oModel.getServiceAnnotations();

		assert.ok(!!oMetadata, "Metadata is available.");

		assert.ok(!!oAnnotations, "Annotations are available.");



		assert.ok(!!oAnnotations["Test.AliasReplacement"], "Namespace is available.");
		assert.ok(!!oAnnotations["Test.AliasReplacement"]["TestAnnotation"], "Annotation is available.");


		assert.ok(!!oAnnotations["Test.AliasReplacement"]["TestAnnotation"]["NotReplaced"], "First Entry is available.");
		assert.ok(!!oAnnotations["Test.AliasReplacement"]["TestAnnotation"]["NotReplaced"][0], "First Entry array is available.");
		assert.ok(!!oAnnotations["Test.AliasReplacement"]["TestAnnotation"]["NotReplaced"][0]["AnnotationPath"], "First Entry value is available.");
		assert.equal(oAnnotations["Test.AliasReplacement"]["TestAnnotation"]["NotReplaced"][0]["AnnotationPath"], "@internal.ui5.test.Value", "First Entry value is correct.");
		assert.equal(oAnnotations["Test.AliasReplacement"]["TestAnnotation"]["NotReplaced"][1]
			["AnnotationPath"], "@internal.ui5.test.Value1");
		assert.equal(oAnnotations["Test.AliasReplacement"]["TestAnnotation"]["NotReplaced"][2]
			["AnnotationPath"], "@internal.ui5.test.Value2");

		assert.ok(!!oAnnotations["Test.AliasReplacement"]["TestAnnotation"]["Replaced"], "Second Entry is available.");
		assert.ok(!!oAnnotations["Test.AliasReplacement"]["TestAnnotation"]["Replaced"]["AnnotationPath"], "Second Entry value is available.");
		assert.equal(oAnnotations["Test.AliasReplacement"]["TestAnnotation"]["Replaced"]["AnnotationPath"], "@internal.ui5.test.Value", "Second Entry value is correct.");
		oModel.destroy();
	});


	/** @deprecated As of version 1.48.0, reason sap.ui.model.odata.ODataModel */
	QUnit.test("DynamicExpressions", function(assert) {
		assert.expect(15);

		var mTest = mAdditionalTestsServices["DynamicExpressions"];
		var sServiceURI = mTest.service;
		var mModelOptions = {
			annotationURI : mTest.annotations,
			json : true,
			loadAnnotationsJoined: false,
			loadMetadataAsync: false
		};

		var oModel = new V1ODataModel(sServiceURI, mModelOptions);
		var oMetadata = oModel.getServiceMetadata();
		var oAnnotations = oModel.getServiceAnnotations();

		assert.ok(!!oMetadata, "Metadata is available.");
		assert.ok(!!oAnnotations, "Annotations are available.");

		assert.ok(!!oAnnotations["DynamicExpressions"], "Annotation target is available");
		assert.ok(!!oAnnotations["DynamicExpressions"]["org.example.person.Gender"], "Annotation term is available");

		var mValue = oAnnotations["DynamicExpressions"]["org.example.person.Gender"];
		var mExpected = {
			"If" : [
				{ "Path": "IsFemale" },
				{ "String": "Female" },
				{ "String": "Male" }
			]
		};
		deepContains(assert, mValue, mExpected, "Value is correct: DynamicExpressions/org.example.person.Gender");
		oModel.destroy();
	});

	/** @deprecated As of version 1.48.0, reason sap.ui.model.odata.ODataModel */
	QUnit.test("DynamicExpressions 2", function(assert) {
		assert.expect(56);

		var mTest = mAdditionalTestsServices["DynamicExpressions2"];
		var sServiceURI = mTest.service;
		var mModelOptions = {
			annotationURI : mTest.annotations,
			json : true,
			loadAnnotationsJoined: false,
			loadMetadataAsync: false
		};

		var oModel = new V1ODataModel(sServiceURI, mModelOptions);
		var oMetadata = oModel.getServiceMetadata();
		var oAnnotations = oModel.getServiceAnnotations();

		assert.ok(!!oMetadata, "Metadata is available.");
		assert.ok(!!oAnnotations, "Annotations are available.");

		assert.ok(!!oAnnotations["DynamicExpressions2"], "Annotation target is available");
		assert.ok(!!oAnnotations["DynamicExpressions2"]["com.sap.vocabularies.Test.v1.Data"], "Annotation term is available");
		assert.ok(!!oAnnotations["DynamicExpressions2"]["com.sap.vocabularies.Test.v1.Data"]["Value"], "Annotation value is available");

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

		deepContains(assert, mValue, mExpected, "Value is correct: DynamicExpressions2/com.sap.vocabularies.Test.v1.Data/Value");

		oModel.destroy();
	});

	/** @deprecated As of version 1.48.0, reason sap.ui.model.odata.ODataModel */
	QUnit.test("CollectionsWithSimpleValues", function(assert) {
		assert.expect(13);

		var mTest = mAdditionalTestsServices["CollectionsWithSimpleValues"];
		var sServiceURI = mTest.service;
		var mModelOptions = {
			annotationURI : mTest.annotations,
			json : true,
			loadAnnotationsJoined: false,
			loadMetadataAsync: false
		};

		var oModel = new V1ODataModel(sServiceURI, mModelOptions);
		var oMetadata = oModel.getServiceMetadata();
		var oAnnotations = oModel.getServiceAnnotations();

		assert.ok(!!oMetadata, "Metadata is available.");
		assert.ok(!!oAnnotations, "Annotations are available.");

		assert.ok(!!oAnnotations["CollectionsWithSimpleValues"], "Annotation target is available");
		assert.ok(!!oAnnotations["CollectionsWithSimpleValues"]["com.sap.vocabularies.Test.v1.Data"], "Annotation term is available");

		var mValue = oAnnotations["CollectionsWithSimpleValues"]["com.sap.vocabularies.Test.v1.Data"];
		var mExpected = [
			{ "String": "String01" },
			{ "String": "String02" },
			{ "String": "String03" }
		];
		deepContains(assert, mValue, mExpected, "Value is correct: CollectionsWithSimpleValues/com.sap.vocabularies.Test.v1.Data");
		oModel.destroy();
	});

	/** @deprecated As of version 1.48.0, reason sap.ui.model.odata.ODataModel */
	QUnit.test("Multiple Simple Values", function(assert) {
		assert.expect(9);

		var mTest = mAdditionalTestsServices["Simple Values 2"];
		var sServiceURI = mTest.service;
		var mModelOptions = {
			annotationURI : mTest.annotations,
			json : true,
			loadAnnotationsJoined: false,
			loadMetadataAsync: false
		};

		var oModel = new V1ODataModel(sServiceURI, mModelOptions);
		var oMetadata = oModel.getServiceMetadata();
		var oAnnotations = oModel.getServiceAnnotations();

		assert.ok(!!oMetadata, "Metadata is available.");
		assert.ok(!!oAnnotations, "Annotations are available.");

		deepContains(assert,
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


	QUnit.test("If in Apply", function(assert) {
		var done = assert.async();
		assert.expect(57);
		var mTest = mAdditionalTestsServices["If in Apply"];
		var sServiceURI = mTest.service;
		var mModelOptions = {
			annotationURI : mTest.annotations,
			skipMetadataAnnotationParsing: true
		};

		var oModel = new V2ODataModel(sServiceURI, mModelOptions);

		oModel.attachAnnotationsLoaded(function() {
			var oMetadata = oModel.getServiceMetadata();
			var oAnnotations = oModel.getServiceAnnotations();

			assert.ok(!!oMetadata, "Metadata is available.");
			assert.ok(!!oAnnotations, "Annotations are available.");

			deepContains(assert,
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
			done();
		});
	});



	QUnit.test("Other Elements in LabeledElement", function(assert) {
		var done = assert.async();
		assert.expect(97);
		var mTest = mAdditionalTestsServices["Other Elements in LabeledElement"];
		var sServiceURI = mTest.service;
		var mModelOptions = {
			annotationURI : mTest.annotations,
			skipMetadataAnnotationParsing: true
		};

		var oModel = new V2ODataModel(sServiceURI, mModelOptions);

		oModel.attachAnnotationsLoaded(function() {
			var oMetadata = oModel.getServiceMetadata();
			var oAnnotations = oModel.getServiceAnnotations();

			assert.ok(!!oMetadata, "Metadata is available.");
			assert.ok(!!oAnnotations, "Annotations are available.");

			deepContains(assert,
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
					}
				},
				"LabeledElement"
			);

			oModel.destroy();
			done();
		});
	});

	QUnit.test("V2 only: Annotated Metadata - Automated Parsing", function(assert) {
		var done = assert.async();
		assert.expect(26);

		var mTestsDone = {
			"annotations": false,
			"metadata":	false,
			// "both":		false,
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
				window.setTimeout(done, 500);
			}
		};

		var fnTestAnnotations = function(sTestType, oModel, sSource) {
			var oMetadata = oModel.getServiceMetadata();
			var oAnnotations = oModel.getServiceAnnotations();

			assert.ok(!!oMetadata, "Metadata is available.");
			assert.ok(!!oAnnotations, "Annotations are available.");

			assert.ok(oAnnotations["UnitTest"], "Annotation namespace available");
			assert.ok(oAnnotations["UnitTest"]["Test.From" + sSource],									"Annotation from correct source - " + sSource + " (2/5)");
			assert.ok(oAnnotations["UnitTest"]["Test.From" + sSource][0],								 "Annotation from correct source - " + sSource + " (3/5)");
			assert.ok(oAnnotations["UnitTest"]["Test.From" + sSource][0]["Value"],						"Annotation from correct source - " + sSource + " (4/5)");
			assert.ok(oAnnotations["UnitTest"]["Test.From" + sSource][0]["Value"]["Path"] === sSource, "Annotation from correct source - " + sSource + " (5/5)");

			fnAsyncStart(sTestType);
		};

		var fnTestMetaModel = function(oModel, bV4AnnotationsAvailable, sV4AnnotationSource) {
			var sContainerName = oModel.getMetaModel().getProperty("/dataServices/schema/1/entityContainer/0/name");
			var sLabelString  = oModel.getMetaModel().getProperty("/dataServices/schema/0/entityType/0/property/0/com.sap.vocabularies.Common.v1.Label/String");
			var sSource = oModel.getMetaModel().getProperty("/dataServices/schema/0/entityType/0/property/0/annotationSource/String");

			assert.equal(sContainerName, "NorthwindEntities", "EntityContainer \"NorthwindEntities\" available");
			assert.equal(sLabelString, bV4AnnotationsAvailable ? "LabelString" : undefined, "LabelString for \"CategoryID\" is correct");
			assert.equal(sSource, sV4AnnotationSource, "Correct annotation source");
		};


		var mTest = mAdditionalTestsServices["Annotated Metadata"];

		// Don't use metadata/annotations cache
		cleanOdataCache();
		var oModel = new V2ODataModel(mTest.service, {
			skipMetadataAnnotationParsing: false,
			loadAnnotationsJoined: true
		});

		// Don't use metadata/annotations cache
		cleanOdataCache();
		var oModel2 = new V2ODataModel(mTest.service, {
			annotationURI: "fakeService://testdata/odata/northwind-annotations-normal.xml",
			skipMetadataAnnotationParsing: true,
			loadAnnotationsJoined: true
		});

		// Don't use metadata/annotations cache
		cleanOdataCache();
		var oModel3 = new V2ODataModel(mTest.service, {
			annotationURI: null,
			skipMetadataAnnotationParsing: true,
			loadAnnotationsJoined: true
		});

		// Don't use metadata/annotations cache
		cleanOdataCache();
		var oModel4 = new V2ODataModel(mTest.service, {
			annotationURI: "fakeService://testdata/odata/northwind-annotations-normal.xml",
			skipMetadataAnnotationParsing: false,
			loadAnnotationsJoined: true
		});

		oModel.attachAnnotationsLoaded(fnTestAnnotations.bind(window, "metadata", oModel, "Metadata"));
		oModel2.attachAnnotationsLoaded(fnTestAnnotations.bind(window, "annotations", oModel2, "Annotations"));
		// No Test for oModel3, since no annotations are loaded
		oModel3.attachAnnotationsLoaded(function() {
			assert.ok(false, "Annotation should not be loaded for this model");
		});

		// TODO: Currently the loaded event is fired twice in this case, so it first has the data from Metadata and only
		//	   later the data from the annotations file is added. This test should be activated as soon as this
		//	   problem is solved.
		//	   Don't forget to change mTestsDone and expect as well
		//oModel4.attachAnnotationsLoaded(fnTestAnnotations.bind(window, "both", oModel4, "Annotations"));

		// Check availability of data in ODataMetaModel
		Promise.all([oModel.getMetaModel().loaded(), oModel2.getMetaModel().loaded(), oModel3.getMetaModel().loaded(), oModel4.getMetaModel().loaded()]).then(function() {
			fnTestMetaModel(oModel, true, "Metadata");	 // Annotations only from metadata document
			fnTestMetaModel(oModel2, true, "Annotations"); // Annotations only from separate annotation file
			fnTestMetaModel(oModel3, false);               // No annotations
			fnTestMetaModel(oModel4, true, "Annotations"); // Anotations from metadata and annotation file

			fnAsyncStart("metamodel");
		}, function() {
			assert.ok(false, "ODataMetaModel loading failed");
		});
	});

	/** @deprecated As of version 1.48.0, reason sap.ui.model.odata.ODataModel */
	QUnit.test("Apply in If", function(assert) {
		var done = assert.async();
		assert.expect(71);

		var mTest = mAdditionalTestsServices["Apply in If"];

		var oModel = new V1ODataModel(mTest.service, {
			annotationURI : mTest.annotations
		});


		oModel.attachAnnotationsLoaded(function() {
			var oMetadata = oModel.getServiceMetadata();
			var oAnnotations = oModel.getServiceAnnotations();

			assert.ok(!!oMetadata, "Metadata is available.");
			assert.ok(!!oAnnotations, "Annotations are available.");

			deepContains(assert,
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
			done();
		});
	});

	QUnit.test("V2: Apply in If", function(assert) {
		var done = assert.async();
		assert.expect(71);

		var mTest = mAdditionalTestsServices["Apply in If"];

		var oModel = new V2ODataModel(mTest.service, {
			annotationURI : mTest.annotations,
			skipMetadataAnnotationParsing: true
		});


		oModel.attachAnnotationsLoaded(function() {
			var oMetadata = oModel.getServiceMetadata();
			var oAnnotations = oModel.getServiceAnnotations();

			assert.ok(!!oMetadata, "Metadata is available.");
			assert.ok(!!oAnnotations, "Annotations are available.");

			deepContains(assert,
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
			done();
		});
	});



	QUnit.test("V2: Joined Loading with automated $metadata parsing", function(assert) {
		var done = assert.async();
		assert.expect(16);

		var mTest = mAdditionalTestsServices["Joined Loading with automated $metadata parsing"];

		var oModel = new V2ODataModel(mTest.service, {
			annotationURI : mTest.annotations,
			skipMetadataAnnotationParsing: false,
			loadAnnotationsJoined: true
		});


		var oModel2 = new V2ODataModel(mTest.service, {
			annotationURI : mTest.annotations,
			skipMetadataAnnotationParsing: false,
			loadAnnotationsJoined: false
		});

		var iCount = 0;
		var fnTestAllAnnotations = function() {
			var oMetadata = oModel.getServiceMetadata();
			var oAnnotations = oModel.getServiceAnnotations();

			assert.ok(!!oMetadata, "Metadata is available.");
			assert.ok(!!oAnnotations, "Annotations are available.");

			assert.equal(oAnnotations.UnitTest["Test.FromAnnotations"][0].Value.Path, "Annotations", "Annotation from correct source (Annotations)");
			assert.equal(oAnnotations.UnitTest["Test.FromMetadata"][0].Value.Path, "Metadata", "Annotation from correct source (Metadata)");
			assert.equal(oAnnotations.UnitTest["Test.Merged"][0].Value.Path, "Annotations", "Merged annotations filled");


			assert.equal(oAnnotations["internal.ui5.test.MultipleAnnotations"]["internal.ui5.test.FromFirst"]["String"], "First", "FromFirst annotation filled from first source");
			assert.equal(oAnnotations["internal.ui5.test.MultipleAnnotations"]["internal.ui5.test.FromSecond"]["String"], "Second", "FromFirst annotation filled from Second source");
			assert.equal(oAnnotations["internal.ui5.test.MultipleAnnotations"]["internal.ui5.test.FromThird"]["String"], "Third", "FromFirst annotation filled from Second source");

			++iCount;
			if (iCount == 2) {
				// Make sure no additional events are fired afterwards
				oModel.destroy();
				oModel2.destroy();
				setTimeout(done, 500);
			} else if (iCount > 2) {
				assert.ok(false, "Too many events have been fired");
			}
		};

		oModel.attachMetadataLoaded(fnTestAllAnnotations);
		oModel2.attachAnnotationsLoaded(fnTestAllAnnotations);
	});


	var fnTestAnnotationInRecord = function(iModelVersion, assert) {
		var done = assert.async();
		assert.expect(54);

		var mTest = mAdditionalTestsServices["Default Annotated Service"];
		var oModel = fnCreateModel(assert, iModelVersion, mTest.service, mTest.annotations);

		oModel.attachAnnotationsLoaded(function() {
			var oMetadata = oModel.getServiceMetadata();
			var oAnnotations = oModel.getServiceAnnotations();

			assert.ok(!!oMetadata, "Metadata is available.");
			assert.ok(!!oAnnotations, "Annotations are available.");


			assert.ok(!!oAnnotations["Test.AnnotationInRecord"], "Outer Annotations container exists");
			assert.ok(!!oAnnotations["Test.AnnotationInRecord"]["Test.AnnotationInRecord.Case1"], "Outer Annotation exists");

			var mTestCase1 = oAnnotations["Test.AnnotationInRecord"]["Test.AnnotationInRecord.Case1"];

			deepContains(assert, mTestCase1, {
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

			deepContains(assert, mTestCase2, {
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

			deepContains(assert, mTestCase3, {
				"Null": null,
				"RecordType": "Test.AnnotationInRecord.Case3.Record"
			}, "Case 3 has correct values");

			oModel.destroy();
			done();
		});
	};

	/** @deprecated As of version 1.48.0, reason sap.ui.model.odata.ODataModel */
	QUnit.test("V1: Annotation in Record", fnTestAnnotationInRecord.bind(this, 1));
	QUnit.test("V2: Annotation in Record", fnTestAnnotationInRecord.bind(this, 2));




	var fnTestEmptyCollection = function(iModelVersion, assert) {
		var done = assert.async();
		assert.expect(15);

		var mTest = mAdditionalTestsServices["Empty collection"];
		var oModel = fnCreateModel(assert, iModelVersion, mTest.service, mTest.annotations);

		oModel.attachAnnotationsLoaded(function() {
			var oMetadata = oModel.getServiceMetadata();
			var oAnnotations = oModel.getServiceAnnotations();

			assert.ok(!!oMetadata, "Metadata is available.");
			assert.ok(!!oAnnotations, "Annotations are available.");

			deepContains(assert,
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
			done();
		});
	};

	/** @deprecated As of version 1.48.0, reason sap.ui.model.odata.ODataModel */
	QUnit.test("V1: Empty collection", fnTestEmptyCollection.bind(this, 1));
	QUnit.test("V2: Empty collection", fnTestEmptyCollection.bind(this, 2));


	var fnTestEmptyCollection = function(iModelVersion, assert) {
		var done = assert.async();
		assert.expect(10);

		var mTest = mAdditionalTestsServices["Multiple Enums"];
		var oModel = fnCreateModel(assert, iModelVersion, mTest.service, mTest.annotations);

		oModel.attachAnnotationsLoaded(function() {
			var oMetadata = oModel.getServiceMetadata();
			var oAnnotations = oModel.getServiceAnnotations();

			assert.ok(!!oMetadata, "Metadata is available.");
			assert.ok(!!oAnnotations, "Annotations are available.");

			deepContains(assert,
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
			done();
		});
	};

	/** @deprecated As of version 1.48.0, reason sap.ui.model.odata.ODataModel */
	QUnit.test("V1: Multiple Enums", fnTestEmptyCollection.bind(this, 1));
	QUnit.test("V2: Multiple Enums", fnTestEmptyCollection.bind(this, 2));



	var fnTestCachedValueLists = function(iModelVersion, assert) {
		var done = assert.async();
		assert.expect(40);

		var mTest = mAdditionalTestsServices["Cached Value Lists"];
		var oModel = fnCreateModel(assert, iModelVersion, mTest.service, mTest.annotations, {"testToken":"test"});

		new Promise(function(fnResolve) {
			// Only react to annotationsLoaded once...
			oModel.attachAnnotationsLoaded(fnResolve);
		}).then(function() {
			var oMetadata = oModel.getServiceMetadata();
			var oAnnotations = oModel.getServiceAnnotations();

			assert.ok(!!oMetadata, "Metadata is available.");
			assert.ok(!!oAnnotations, "Annotations are available.");

			assert.ok(true, "Annotations (Metadata) for Model 1 loaded.");

			deepContains(assert,
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

				assert.ok(true, "Annotations (Value List 1) for Model 1 loaded.");

				deepContains(assert,
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

					assert.ok(true, "Annotations (Value List 2) for Model 1 loaded.");

					deepContains(assert,
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

						assert.ok(true, "Annotations (Value List 3) for Model 1 loaded.");

						deepContains(assert,
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

						// assert.equal(oModel.getProperty("/#VL_CH_ANLA/BUKRS/@sap:label"), "Company Code", "Annotation EntityType loaded");
						// assert.ok(oModel.getProperty("/#UpdatableItem/CompanyCode/@sap:label"), "Company Code");

						oModel.destroy();
						fnCachedModelTest();
					});
				});
			});
		});

		var fnCachedModelTest = function() {
			var oModel2 = fnCreateModel(assert, iModelVersion, mTest.service, mTest.annotations);

			oModel2.attachAnnotationsLoaded(function() {
				// All annotations should be there from cache
				assert.ok(true, "(Cached) Annotations for Model 2 loaded.");

				var oAnnotations = oModel2.getServiceAnnotations();

				deepContains(assert,
					oAnnotations["ui5.test.Annotation"],
					{
						"ui5.test.SimpleAnnotation": {
							"String": "From Metadata"
						}
					},
					"Test Annotation available: ui5.test.Annotation"
				);

				oModel2.destroy();
				done();
			});

		};

	};

	/** @deprecated As of version 1.48.0, reason sap.ui.model.odata.ODataModel */
	QUnit.test("V1: Cached Value Lists", fnTestCachedValueLists.bind(this, 1));
	QUnit.test("V2: Cached Value Lists", fnTestCachedValueLists.bind(this, 2));


	var fnTestCachedMetadataValueLists = function(iModelVersion, assert) {
		var done = assert.async();
		assert.expect(14);

		var mTest = mAdditionalTestsServices["Cached Value Lists"];
		var sServiceUrl1 = mTest.service + "?sap-value-list=1";
		var sServiceUrl2 = mTest.service + "?sap-value-list=2";

		var oModel = fnCreateModel(assert, iModelVersion, sServiceUrl1, mTest.annotations);
		oModel.attachAnnotationsLoaded(function() {
			// Model3 should now have the value-lists "1"
			assert.ok(true, "Annotations for Model loaded.");

			var oAnnotations = oModel.getServiceAnnotations();

			deepContains(assert,
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


			var oModel2 = fnCreateModel(assert, iModelVersion, sServiceUrl2, mTest.annotations);

			oModel2.attachAnnotationsLoaded(function() {
				// Model4 should now have the value lists "2"
				assert.ok(true, "Annotations for Model 2 loaded.");

				var oAnnotations = oModel2.getServiceAnnotations();

				deepContains(assert,
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
				done();

			});

		});
	};

	/** @deprecated As of version 1.48.0, reason sap.ui.model.odata.ODataModel */
	QUnit.test("V1: Cached Value Lists with Service-URL-Parameters", fnTestCachedMetadataValueLists.bind(this, 1));
	QUnit.test("V2: Cached Value Lists with Service-URL-Parameters", fnTestCachedMetadataValueLists.bind(this, 2));

	var fnTestCachedMetadataValueListsAdditionParameters = function(iModelVersion, assert) {
		var done = assert.async();
		assert.expect(14);

		var mTest = mAdditionalTestsServices["Cached Value Lists"];
		var mMetadataUrlParams1 = {
			"sap-value-list": "1"
		};
		var mMetadataUrlParams2 = {
			"sap-value-list": "2"
		};

		var oModel = fnCreateModel(assert, iModelVersion, mTest.service, mTest.annotations, mMetadataUrlParams1);

		new Promise(function(fnResolve) {
			// Only react to annotationsLoaded once...
			oModel.attachAnnotationsLoaded(fnResolve);
		}).then(function() {
			// Model3 should now have the value-lists "1"
			assert.ok(true, "Annotations for Model loaded.");

			var oAnnotations = oModel.getServiceAnnotations();

			deepContains(assert,
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


			var oModel2 = fnCreateModel(assert, iModelVersion, mTest.service, mTest.annotations, mMetadataUrlParams2);

			oModel2.attachAnnotationsLoaded(function() {
				// Model4 should now have the value lists "2"
				assert.ok(true, "Annotations for Model 2 loaded.");

				var oAnnotations = oModel2.getServiceAnnotations();

				deepContains(assert,
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
				done();

			});

		});
	};

	/** @deprecated As of version 1.48.0, reason sap.ui.model.odata.ODataModel */
	QUnit.test("V1: Cached Value Lists with additional Metadata Parameters", fnTestCachedMetadataValueListsAdditionParameters.bind(this, 1));
	QUnit.test("V2: Cached Value Lists with additional Metadata Parameters", fnTestCachedMetadataValueListsAdditionParameters.bind(this, 2));



	var fnTestOverwritingOnTermLevel = function(iModelVersion, assert) {
		var done = assert.async();
		assert.expect(3);

		cleanOdataCache();
		var mTest = mAdditionalTestsServices["Overwrite on Term Level"];
		var oModel = fnCreateModel(assert, iModelVersion, mTest.service, mTest.annotations);


		oModel.attachAnnotationsLoaded(function() {
			var oAnnotations = oModel.getServiceAnnotations();

			// Not using deepContains, because we want to make sure that "ui5.test.OverwriteMe" has been replaced
			assert.deepEqual(
				oAnnotations["ui5.test.Annotation"],
				{
					"ui5.test.SimpleAnnotation": {
						"String": "From Metadata"
					},
					"ui5.test.OverwriteMe": {
						"From": {
							"String": "2"
						}
					},
					"ui5.test.DontOverwriteMe1": {
						"From": {
							"String": "1"
						}
					},
					"ui5.test.DontOverwriteMe2": {
						"From": {
							"String": "2"
						}
					}
				},
				"Correctly overwritten annotations: ui5.test.Annotation"
			);

			assert.deepEqual(
				oAnnotations.propertyAnnotations.Test.NorthwindEntities,
				{
					"ui5.test.OverwriteMe": {
						"From": {
							"String": "2"
						}
					},
					"ui5.test.DontOverwriteMe1": {
						"From": {
							"String": "1"
						}
					},
					"ui5.test.DontOverwriteMe2": {
						"From": {
							"String": "2"
						}
					}
				},
				"Correctly overwritten annotations: propertyAnnotations.Test.NorthwindEntities"
			);

			assert.deepEqual(
				oAnnotations.EntityContainer["ui5.test.NorthwindEntities"].X,
				{
					"ui5.test.OverwriteMe": {
						"From": {
							"String": "2"
						}
					},
					"ui5.test.DontOverwriteMe1": {
						"From": {
							"String": "1"
						}
					},
					"ui5.test.DontOverwriteMe2": {
						"From": {
							"String": "2"
						}
					}
				},
				"Correctly overwritten annotations: EntityContainer.ui5.test.NorthwindEntities"
			);

			oModel.destroy();
			done();
		});

	};

	/** @deprecated As of version 1.48.0, reason sap.ui.model.odata.ODataModel */
	QUnit.test("V1: Overwrite on Term Level", fnTestOverwritingOnTermLevel.bind(this, 1));
	QUnit.test("V2: Overwrite on Term Level", fnTestOverwritingOnTermLevel.bind(this, 2));



	var fnTestOverwritingOnTermLevel2 = function(iModelVersion, assert) {
		var done = assert.async();
		assert.expect(7);

		var mTest = mAdditionalTestsServices["Overwrite on Term Level"];
		var oModel = fnCreateModel(assert, iModelVersion, mTest.service);

		oModel.addAnnotationUrl(mTest.annotations[0]).then(function() {
			var oAnnotations = oModel.getServiceAnnotations();

			// Not using deepContains, because we want to make sure that "ui5.test.OverwriteMe" has been replaced
			assert.deepEqual(
				oAnnotations["ui5.test.Annotation"],
				{
					"ui5.test.SimpleAnnotation": {
						"String": "From Metadata"
					},
					"ui5.test.OverwriteMe": {
						"From": {
							"String": "1"
						},
						"Deleted": {
							"String": "1"
						}
					},
					"ui5.test.DontOverwriteMe1": {
						"From": {
							"String": "1"
						}
					}
				},
				"Correctly loaded annotations: ui5.test.Annotation"
			);

			assert.deepEqual(
				oAnnotations.propertyAnnotations.Test.NorthwindEntities,
				{
					"ui5.test.OverwriteMe": {
						"From": {
							"String": "1"
						},
						"Deleted": {
							"String": "1"
						}
					},
					"ui5.test.DontOverwriteMe1": {
						"From": {
							"String": "1"
						}
					}
				},
				"Correctly overwritten annotations: propertyAnnotations.Test.NorthwindEntities"
			);

			assert.deepEqual(
				oAnnotations.EntityContainer["ui5.test.NorthwindEntities"].X,
				{
					"ui5.test.OverwriteMe": {
						"From": {
							"String": "1"
						},
						"Deleted": {
							"String": "1"
						}
					},
					"ui5.test.DontOverwriteMe1": {
						"From": {
							"String": "1"
						}
					}
				},
				"Correctly overwritten annotations: EntityContainer.ui5.test.NorthwindEntities"
			);

			oModel.addAnnotationUrl(mTest.annotations[1]).then(function() {
				var oAnnotations = oModel.getServiceAnnotations();

				assert.deepEqual(
					oAnnotations["ui5.test.Annotation"],
					{
						"ui5.test.SimpleAnnotation": {
							"String": "From Metadata"
						},
						"ui5.test.OverwriteMe": {
							"From": {
								"String": "2"
							}
						},
						"ui5.test.DontOverwriteMe1": {
							"From": {
								"String": "1"
							}
						},
						"ui5.test.DontOverwriteMe2": {
							"From": {
								"String": "2"
							}
						}
					},
					"Correctly overwritten annotations: ui5.test.Annotation"
				);

				assert.deepEqual(
					oAnnotations.propertyAnnotations.Test.NorthwindEntities,
					{
						"ui5.test.OverwriteMe": {
							"From": {
								"String": "2"
							}
						},
						"ui5.test.DontOverwriteMe1": {
							"From": {
								"String": "1"
							}
						},
						"ui5.test.DontOverwriteMe2": {
							"From": {
								"String": "2"
							}
						}
					},
					"Correctly overwritten annotations: propertyAnnotations.Test.NorthwindEntities"
				);

				assert.deepEqual(
					oAnnotations.EntityContainer["ui5.test.NorthwindEntities"].X,
					{
						"ui5.test.OverwriteMe": {
							"From": {
								"String": "2"
							}
						},
						"ui5.test.DontOverwriteMe1": {
							"From": {
								"String": "1"
							}
						},
						"ui5.test.DontOverwriteMe2": {
							"From": {
								"String": "2"
							}
						}
					},
					"Correctly overwritten annotations: EntityContainer.ui5.test.NorthwindEntities"
				);

				assert.notOk("annotationsAtArrays" in oAnnotations, "avoid empty array");

				oModel.destroy();
				done();
			});
		});
	};

	/** @deprecated As of version 1.48.0, reason sap.ui.model.odata.ODataModel */
	QUnit.test("V1: Overwrite on Term Level 2", fnTestOverwritingOnTermLevel2.bind(this, 1));
	QUnit.test("V2: Overwrite on Term Level 2", fnTestOverwritingOnTermLevel2.bind(this, 2));

	var fnTestAceptHeader = function(iModelVersion, assert) {
		var done = assert.async();
		assert.expect(12);
		var oModel = fnCreateModel(assert, iModelVersion, "fakeService://testdata/odata/northwind/");
		var oModel2 = fnCreateModel(assert, iModelVersion, "fakeService://testdata/odata/northwind/");
		var oModel3 = fnCreateModel(assert, iModelVersion, "fakeService://testdata/odata/northwind/");

		Localization.setLanguage("en-US");
		oModel.addAnnotationUrl("fakeService://replay-headers").then(function() {
			var oAnnotations = oModel.getServiceAnnotations();
			assert.equal(oAnnotations["Replay.Headers"]["Accept-Language"]["String"], "en-US", "Accept-Language header set correctly");
			assert.equal(oAnnotations["Replay.Headers"]["X-Unfug"], undefined, "Custom header set correctly");

			oModel.setHeaders({
				"X-Unfug": "Rosinenbroetchen"
			});
			Localization.setLanguage("de");
			return oModel.addAnnotationUrl("fakeService://replay-headers");
		}).then(function() {
			var oAnnotations = oModel.getServiceAnnotations();
			assert.equal(oAnnotations["Replay.Headers"]["Accept-Language"]["String"], "de", "Accept-Language header set correctly");
			assert.equal(oAnnotations["Replay.Headers"]["X-Unfug"]["String"], "Rosinenbroetchen", "Custom header set correctly");

			oModel.setHeaders({
				"X-Unfug": "Quarkstrudel"
			});
			Localization.setLanguage("de-DE");
			return oModel.addAnnotationUrl("fakeService://replay-headers");
		}).then(function() {
			var oAnnotations = oModel.getServiceAnnotations();
			assert.equal(oAnnotations["Replay.Headers"]["Accept-Language"]["String"], "de-DE", "Accept-Language header set correctly");
			assert.equal(oAnnotations["Replay.Headers"]["X-Unfug"]["String"], "Quarkstrudel", "Custom header set correctly");

			// Annotations cannot be removed, just replaced by subsequent Annotation documents, so we need a new model to test the header replay...
			oModel2.setHeaders({
				"X-Unfug": "Quarkstrudel"
			});
			oModel2.setHeaders(null);
			Localization.setLanguage("fr");
			return oModel2.addAnnotationUrl("fakeService://replay-headers");
		}).then(function() {
			var oAnnotations = oModel2.getServiceAnnotations();
			assert.equal(oAnnotations["Replay.Headers"]["Accept-Language"]["String"], "fr", "Accept-Language header set correctly");
			assert.equal(oAnnotations["Replay.Headers"]["X-Unfug"], undefined, "Custom header removed correctly");

			oModel2.setHeaders({
				"X-Unfug": "Mohnschnecke"
			});
			Localization.setLanguage("de-DE");
			return oModel2.addAnnotationUrl("fakeService://replay-headers");
		}).then(function() {
			var oAnnotations = oModel2.getServiceAnnotations();
			assert.equal(oAnnotations["Replay.Headers"]["Accept-Language"]["String"], "de-DE", "Accept-Language header set correctly");
			assert.equal(oAnnotations["Replay.Headers"]["X-Unfug"]["String"], "Mohnschnecke", "Custom header set correctly");

			// Annotations cannot be removed, just replaced by subsequent Annotation documents, so we need a new model to test the header replay...
			oModel3.setHeaders({
				"X-Unfug": "Mohnschnecke"
			});
			oModel3.setHeaders({});
			Localization.setLanguage("en");
			return oModel3.addAnnotationUrl("fakeService://replay-headers");
		}).then(async function() {
			var oAnnotations = oModel3.getServiceAnnotations();
			assert.equal(oAnnotations["Replay.Headers"]["Accept-Language"]["String"], "en", "Accept-Language header set correctly");
			assert.equal(oAnnotations["Replay.Headers"]["X-Unfug"], undefined, "Custom header removed correctly");

			Localization.setLanguage("en-US");

			oModel.destroy();
			oModel2.destroy();
			oModel3.destroy();

			await nextUIUpdate();
			done();
		});
	};

	/** @deprecated As of version 1.48.0, reason sap.ui.model.odata.ODataModel */
	QUnit.test("V1: Send Accept-Language Header", fnTestAceptHeader.bind(this, 1));
	QUnit.test("V2: Send Accept-Language Header", fnTestAceptHeader.bind(this, 2));


	var fnTestEdmTypeForNavigationProperties = function(iModelVersion, assert) {
		var done = assert.async();
		cleanOdataCache();
		var mTest = mAdditionalTestsServices["EDMType for NavigationProperties"];
		var oModel = fnCreateModel(assert, iModelVersion, mTest.service);

		oModel.attachMetadataLoaded(function() {
			var oAnnotations = oModel.getServiceAnnotations();

			assert.equal(oAnnotations["NorthwindModel.Supplier"], undefined, "Annotations not loaded from service metadata");

			oModel.addAnnotationUrl(mTest.annotations[0]).then(function() {
				var oAnnotations = oModel.getServiceAnnotations();

				deepContains(assert, oAnnotations["NorthwindModel.Supplier"], {
					"com.sap.vocabularies.UI.v1.LineItem": [{
							"Label": {
								"String": "Product Supplier ID"
							},
							"Value": {
								"Path": "SupplierID"
							},
							"RecordType": "com.sap.vocabularies.UI.v1.DataField",
							"EdmType": "Edm.Int32"
						}, {
							"Label": {
								"String": "Product Supplier Name"
							},
							"Value": {
								"Path": "CompanyName"
							},
							"RecordType": "com.sap.vocabularies.UI.v1.DataField",
							"EdmType": "Edm.String"
						}, {
							"Label": {
								"String": "Product Supplier ID"
							},
							"Value": {
								"Path": "Products/ProductID"
							},
							"RecordType": "com.sap.vocabularies.UI.v1.DataField",
							"EdmType": "Edm.Int32"
					}]
				}, "Product EDM types are correctly set");

				deepContains(assert, oAnnotations["NorthwindModel.Product"], {
					"com.sap.vocabularies.UI.v1.LineItem": [{
							"Label": {
								"String": "Product ID"
							},
							"Value": {
								"Path": "ProductID"
							},
							"RecordType": "com.sap.vocabularies.UI.v1.DataField",
							"EdmType": "Edm.Int32"
						}, {
							"Label": {
								"String": "Product Name"
							},
							"Value": {
								"Path": "ProductName"
							},
							"RecordType": "com.sap.vocabularies.UI.v1.DataField",
							"EdmType": "Edm.String"
						}, {
							"Label": {
								"String": "Product Supplier ID"
							},
							"Value": {
								"Path": "Supplier/SupplierID"
							},
							"RecordType": "com.sap.vocabularies.UI.v1.DataField",
							"EdmType": "Edm.Int32"
						}, {
							"Label": {
								"String": "Product Supplier Name"
							},
							"Value": {
								"Path": "Supplier/CompanyName"
							},
							"RecordType": "com.sap.vocabularies.UI.v1.DataField",
							"EdmType": "Edm.String"
						}, {
							"Label": {
								"String": "Product Supplier ID"
							},
							"Value": {
								"Path": "Category/CategoryName"
							},
							"RecordType": "com.sap.vocabularies.UI.v1.DataField",
							"EdmType": "Edm.String"
					}]
				}, "Product EDM types are correctly set");

				oModel.destroy();
				done();
			});
		});
	};

	/** @deprecated As of version 1.48.0, reason sap.ui.model.odata.ODataModel */
	QUnit.test("V1: EDMType for NavigationProperties", fnTestEdmTypeForNavigationProperties.bind(this, 1));
	QUnit.test("V2: EDMType for NavigationProperties", fnTestEdmTypeForNavigationProperties.bind(this, 2));

	/**
	 * Checks that nested annotations work as expected.
	 *
	 * @param {object} assert - QUnit.assert instance
	 * @param {object} oAnnotations - map of all annotations
	 * @param {object} oExpectedProductAnnotations - expected annotations for NorthwindModel.Product
	 */
	function checkNestedAnnotations(assert, oAnnotations, oExpectedProductAnnotations) {
		// annotations at array values still present
		assert.deepEqual(
			oAnnotations["NorthwindModel.Product"]["com.sap.vocabularies.UI.v1.LineItem"]
				["com.sap.vocabularies.UI.v1.Criticality"],
			{"Path" : "Criticality"});
		assert.deepEqual(
			oAnnotations["NorthwindModel.Product"]["com.sap.vocabularies.UI.v1.LineItem#foo"]
				["com.sap.vocabularies.UI.v1.Criticality"],
			{"Path" : "Criticality"});
		assert.deepEqual(
			oAnnotations["NorthwindModel.Product"]["com.sap.vocabularies.UI.v1.LineItem#foo"]
				["com.sap.vocabularies.UI.v1.Criticality#bar"],
			{"Path" : "Criticality/bar"});
		assert.deepEqual(
			oAnnotations["NorthwindModel.Product"]["com.sap.vocabularies.UI.v1.Facets"][0]
				.Facets["com.sap.vocabularies.Common.v1.Label"],
			{"String" : "Supplier Identification"});
		assert.deepEqual(
			oAnnotations["NorthwindModel.Product"]["unittest.ui5.parentAnnotation"]
				["unittest.ui5.dynamicExpression3"]
				.If["com.sap.vocabularies.Common.v1.Label"],
			{"String" : "Who am I?"});
		assert.deepEqual(
			oAnnotations["NorthwindModel.Product"]["unittest.ui5.parentAnnotation"]
				["unittest.ui5.dynamicExpression6"].Apply.Parameters[0].Value
				["com.sap.vocabularies.Common.v1.Label"],
			{"String" : "Who am I?"});

		// annotations at array values can be restored later on!
		assert.deepEqual(oAnnotations.annotationsAtArrays, [
			["NorthwindModel.Product", "com.sap.vocabularies.UI.v1.LineItem",
				"com.sap.vocabularies.UI.v1.Criticality"],
			["NorthwindModel.Product", "com.sap.vocabularies.UI.v1.LineItem#foo",
				"com.sap.vocabularies.UI.v1.Criticality"],
			["NorthwindModel.Product", "com.sap.vocabularies.UI.v1.LineItem#foo",
				"com.sap.vocabularies.UI.v1.Criticality#bar"],
			["NorthwindModel.Product", "com.sap.vocabularies.UI.v1.Facets", 0, "Facets",
				"com.sap.vocabularies.Common.v1.Label"],
			["NorthwindModel.Product", "unittest.ui5.parentAnnotation",
				"unittest.ui5.dynamicExpression3", "If",
				"com.sap.vocabularies.Common.v1.Label"],
			["NorthwindModel.Product", "unittest.ui5.parentAnnotation",
				"unittest.ui5.dynamicExpression6", "Apply", "Parameters", 0, "Value",
				"com.sap.vocabularies.Common.v1.Label"],
			["NorthwindModel.Product", "com.sap.vocabularies.UI.v1.LineItem#inherited",
				"com.sap.vocabularies.UI.v1.Criticality"]
		]);

		assert.deepEqual(oAnnotations["NorthwindModel.Product"], oExpectedProductAnnotations);
		deepContains(assert, oAnnotations["NorthwindModel.Product"], oExpectedProductAnnotations,
			"NorthwindModel.Product");
	}

	var fnTestNestedAnnotations = function(iModelVersion, assert) {
		var done = assert.async();
		assert.expect(467);

		cleanOdataCache();
		var mTest = mAdditionalTestsServices["Nested Annotations"];
		var oModel = fnCreateModel(assert, iModelVersion, mTest.service);

		oModel.attachMetadataLoaded(function() {
			var oAnnotations = oModel.getServiceAnnotations();

			assert.equal(oAnnotations["NorthwindModel.Supplier"], undefined, "Annotations not loaded from service metadata");

			oModel.addAnnotationUrl(mTest.annotations[0]).then(function() {
				var AnnotationParser = sap.ui.require("sap/ui/model/odata/AnnotationParser"),
					oAnnotations = oModel.getServiceAnnotations(),
					oExpectedProductAnnotations = {
						"com.sap.vocabularies.UI.v1.LineItem" : [{
							"Label" : {
								"String" : "Business Partner"
							},
							"Value" : {
								"Path" : "BusinessPartnerID"
							},
							"RecordType" : "com.sap.vocabularies.UI.v1.DataField",
							"com.sap.vocabularies.UI.v1.Importance" : {
								"EnumMember" : "com.sap.vocabularies.UI.v1.ImportanceType/High"
							}
						}],
						"com.sap.vocabularies.UI.v1.LineItem@com.sap.vocabularies.UI.v1.Criticality" : {
							"Path" : "Criticality"
						},
						"com.sap.vocabularies.UI.v1.LineItem#foo" : [{
							"Label" : {
								"String" : "Business Partner"
							},
							"Value" : {
								"Path" : "BusinessPartnerID"
							},
							"RecordType" : "com.sap.vocabularies.UI.v1.DataField",
							"com.sap.vocabularies.UI.v1.Importance" : {
								"EnumMember" : "com.sap.vocabularies.UI.v1.ImportanceType/Medium"
							}
						}],
						"com.sap.vocabularies.UI.v1.LineItem#foo@com.sap.vocabularies.UI.v1.Criticality" : {
							"Path" : "Criticality"
						},
						"com.sap.vocabularies.UI.v1.LineItem#foo@com.sap.vocabularies.UI.v1.Criticality#bar" : {
							"Path" : "Criticality/bar"
						},
						"com.sap.vocabularies.UI.v1.Facets" : [{
							"Facets" : [{
								"Target" : {
									"AnnotationPath" : "Supplier/@com.sap.vocabularies.UI.v1.Identification"
								},
								"RecordType" : "com.sap.vocabularies.UI.v1.ReferenceFacet"
							}],
							"Facets@com.sap.vocabularies.Common.v1.Label" : {"String" : "Supplier Identification"},
							"RecordType" : "com.sap.vocabularies.UI.v1.CollectionFacet"
						}],
						"com.sap.vocabularies.Common.v1.Text": {
							"Term": {
								"Name": "TextArrangement",
								"Type": "com.sap.vocabularies.UI.v1.TextArrangementType",
								"AppliesTo": "Annotation EntityType",

								"Core.Description1": {
									"String": "Describes the arrangement of the property values and its text"
								},
								"Core.Description2": {
									"String": "If used for a single property the Common.Text annotation is annotated"
								}
							},
							"Path": "CategoryName"
						},
						"com.sap.vocabularies.Common.v1.Text#2": {
							"Path": "CategoryName",
							"com.sap.vocabularies.UI.v1.TextArrangement": {
								"EnumMember": "com.sap.vocabularies.UI.v1.TextArrangementType/TextLast"
							}
						},
						"unittest.ui5.parentAnnotation": {
							"unittest.ui5.constantExpressions": {
								"String": "Rosinenbroetchen",
								"Binary": "1100101",
								"Bool": "almost true",
								"Date": "2016-04-14",
								"DateTimeOffset": "2016-04-14T16:19:00.000-02:00",
								"Decimal": "3.14159",
								"Duration": "P11D23H59M59.999999999999S",
								"EnumMember": "unittest.ui5.enum/test1",
								"Float": "6.28318",
								"Guid": "21EC2020-3AEA-1069-A2DD-08002B30309D",
								"Int": "23",
								"TimeOfDay": "23:42:58"
							},
							"unittest.ui5.dynamicExpression1": {
								"Apply": {
									"Name": "odata.concat",
									"Parameters": [
										{
											"Type": "String",
											"Value": "***"
										},
										{
											"Type": "String",
											"Value": ", "
										},
										{
											"Type": "String",
											"Value": "Drugs "
										},
										{
											"Type": "String",
											"Value": " and "
										},
										{
											"Type": "String",
											"Value": "Rock 'n Roll"
										}
									]
								}
							},
							"unittest.ui5.dynamicExpression2": [
								{
									"String": "One"
								},
								{
									"String": "Two"
								},
								{
									"String": "Five"
								}
							],
							"unittest.ui5.dynamicExpression3": {
								"If": [
									{
										"Path": "IsFemale"
									},
									{
										"String": "Iron Man"
									},
									{
										"String": "Someone else"
									}
								],
								"If@com.sap.vocabularies.Common.v1.Label" : {
									"String" : "Who am I?"
								}
							},
							"unittest.ui5.dynamicExpression4": {
								"Null": null
							},
							"unittest.ui5.dynamicExpression5": {
								"GivenName": {
									"Path": "FirstName"
								},
								"Surname": {
									"Path": "LastName"
								},
								"Manager": {
									"Path": "DirectSupervisor"
								},
								"CostCenter": {
									"UrlRef": {
										"Apply": {
											"Name": "odata.fillUriTemplate",
											"Parameters": [
												{
													"Type": "String",
													"Value": "http://host/anotherservice/CostCenters('{ccid}')"
												},
												{
													"Type": "LabeledElement",
													"Value": {
														"Path": "CostCenterID"
													},
													"Name": "ccid"
												}
											]
										}
									}
								}
							},
							"unittest.ui5.dynamicExpression6": {
								"Apply": {
									"Name": "odata.concat",
									"Parameters": [{
										"Type": "If",
										"Value": [{
											"Path": "IsFemale"
										}, {
											"String": "Iron Man"
										}, {
											"String": "Someone else"
										}],
										"Value@com.sap.vocabularies.Common.v1.Label": {
											"String" : "Who am I?"
										}
									}]
								}
							}
						},
						"com.sap.vocabularies.Common.v1.Label#inherited": {
							"String": "Inheritance",
							"com.sap.vocabularies.Common.v1.Label": {
								"String": "No Inheritance"
							}
						},
						"com.sap.vocabularies.UI.v1.LineItem#inherited": [],
						"com.sap.vocabularies.UI.v1.LineItem#inherited@com.sap.vocabularies.UI.v1.Criticality": {
							"Path": "Criticality"
						}
					};

				checkNestedAnnotations(assert, oAnnotations, oExpectedProductAnnotations);

				// after deserialization from cache, everything must be as before
				oAnnotations = JSON.parse(JSON.stringify(oAnnotations));
				AnnotationParser.restoreAnnotationsAtArrays(oAnnotations);
				checkNestedAnnotations(assert, oAnnotations, oExpectedProductAnnotations);

				done();
			});
		});
	};

	/** @deprecated As of version 1.48.0, reason sap.ui.model.odata.ODataModel */
	QUnit.test("V1: Nested Annotations", fnTestNestedAnnotations.bind(this, 1));
	QUnit.test("V2: Nested Annotations", fnTestNestedAnnotations.bind(this, 2));

	//**********************************************************************************************
	var sNestedAnnotations = '\
<?xml version="1.0" encoding="utf-8"?>\
<edm:Edm xmlns:edm="http://docs.oasis-open.org/odata/ns/edm" xmlns:edmx="http://docs.oasis-open.org/odata/ns/edmx" Version="4.0">\
	<edmx:Reference Uri="/coco/vocabularies/UI.xml">\
		<edmx:Include Namespace="com.sap.vocabularies.UI.v1" Alias="UI" />\
	</edmx:Reference>\
	<edmx:Reference Uri="http://services.odata.org/Northwind/Northwind.svc/$metadata" >\
		<edmx:Include Namespace="NorthwindModel" Alias="self" />\
	</edmx:Reference>	\
	<edm:DataServices>\
		<Schema xmlns="http://docs.oasis-open.org/odata/ns/edm">\
			<Annotations Target="self.Product">\
				<Annotation Term="UI.LineItem">\
					<Collection>\
						<Record Type="UI.DataField">\
							<PropertyValue Property="Label" String="Business Partner"/>\
							<PropertyValue Property="Value" Path="BusinessPartnerID"/>\
							<Annotation Term="UI.Importance"\
								EnumMember="UI.ImportanceType/High"/>\
						</Record>\
					</Collection>\
					<Annotation Term="UI.Criticality" Path="Criticality"/>\
				</Annotation>\
				<Annotation Term="UI.LineItem" Qualifier="foo">\
					<Collection>\
						<Record Type="UI.DataField">\
							<PropertyValue Property="Label" String="Business Partner"/>\
							<PropertyValue Property="Value" Path="BusinessPartnerID"/>\
							<Annotation Term="UI.Importance"\
								EnumMember="UI.ImportanceType/Medium"/>\
						</Record>\
					</Collection>\
					<Annotation Term="UI.Criticality" Qualifier="bar" Path="Criticality"/>\
				</Annotation>\
				<Annotation Term="UI.Facets">\
					<Collection>\
						<Record Type="UI.CollectionFacet">\
							<PropertyValue Property="Facets">\
								<Collection>\
									<Record Type="UI.ReferenceFacet">\
										<PropertyValue Property="Target" AnnotationPath="Supplier/@UI.Identification" />\
									</Record>\
								</Collection>\
								<Annotation Term="com.sap.vocabularies.Common.v1.Label" String="Supplier Identification"/>\
							</PropertyValue>\
						</Record>\
					</Collection>\
				</Annotation>\
				<Annotation Term="unittest.ui5.parentAnnotation">\
					<Annotation Term="unittest.ui5.dynamicExpression3">\
						<If>\
							<Path>IsFemale</Path>\
							<String>Iron Man</String>\
							<String>Someone else</String>\
							<Annotation Term="com.sap.vocabularies.Common.v1.Label" String="Who am I?"/>\
						</If>\
					</Annotation>\
					<Annotation Term="unittest.ui5.dynamicExpression6">\
						<Apply Function="odata.concat">\
							<If>\
								<Path>IsFemale</Path>\
								<String>Iron Man</String>\
								<String>Someone else</String>\
								<Annotation Term="com.sap.vocabularies.Common.v1.Label" String="Who am I?"/>\
							</If>\
						</Apply>\
					</Annotation>\
				</Annotation>\
				<Annotation Term="UI.HeaderInfo">\
					<Record>\
						<PropertyValue Property="TypeName" String="Product" />\
						<PropertyValue Property="TypeNamePlural" String="Products" />\
						<PropertyValue Property="Title">\
							<Record>\
								<PropertyValue Property="Label" String="Product" />\
								<PropertyValue Property="Value" Path="ProductName" />\
								<Annotation Term="com.sap.vocabularies.Common.v1.Label" String="hello, world!"/>\
							</Record>\
						</PropertyValue>\
					</Record>\
				</Annotation>\
			</Annotations>\
			<Annotations Target="self.Supplier" Qualifier="foo">\
				<Annotation Term="UI.LineItem">\
					<Collection>\
						<Record Type="UI.DataField">\
							<PropertyValue Property="Label" String="Business Partner"/>\
							<PropertyValue Property="Value" Path="BusinessPartnerID"/>\
							<Annotation Term="UI.Importance"\
								EnumMember="UI.ImportanceType/High"/>\
						</Record>\
					</Collection>\
					<Annotation Term="UI.Criticality" Path="Criticality" Qualifier="bar"/>\
				</Annotation>\
			</Annotations>\
		</Schema>\
	</edm:DataServices>\
</edm:Edm>';

	/**
	 * Creates a DOM document from the given string.
	 *
	 * @param {object} assert the assertions
	 * @param {string} sContent the content
	 * @returns {Element} the DOM document's root element
	 */
	function xml(assert, sContent) {
		var oDocument;

		oDocument = XMLHelper.parse(sContent.replace(/>\s+</g, "><")); // avoid Text nodes!
		assert.strictEqual(oDocument.parseError.errorCode, 0, "XML parsed correctly");
		return oDocument.documentElement;
	}

	QUnit.module("Annotations@Arrays", {
		beforeEach : function (assert) {
			this.oDocumentElement = xml(assert, sNestedAnnotations);
			this.oProductElement = this.oDocumentElement // <edm:Edm>
				.childNodes[2] // <edm:DataServices>
				.childNodes[0] // <Schema>
				.childNodes[0]; // <Annotations Target="self.Product">
			this.oLineItemElement = this.oProductElement
				.childNodes[0] // <Annotation Term="UI.LineItem">
				.childNodes[1]; // <Annotation Term="UI.Criticality">
			this.oLineItemFooElement = this.oProductElement
				.childNodes[1] // <Annotation Term="UI.LineItem" Qualifier="foo">
				.childNodes[1]; // <Annotation Term="UI.Criticality" Qualifier="bar">
			this.oFacetElement = this.oProductElement
				.childNodes[2] // <Annotation Term="UI.Facets">
				.childNodes[0] // <Collection>
				.childNodes[0] // <Record Type="UI.CollectionFacet">
				.childNodes[0] // <PropertyValue Property="Facets">
				.childNodes[1]; // <Annotation Term="com.sap.vocabularies.Common.v1.Label">
			this.oIfElement = this.oProductElement
				.childNodes[3] // <Annotation Term="unittest.ui5.parentAnnotation">
				.childNodes[0] // <Annotation Term="unittest.ui5.dynamicExpression3">
				.childNodes[0] // <If>
				.childNodes[3]; // <Annotation Term="com.sap.vocabularies.Common.v1.Label">
			this.oIfInApplyElement = this.oProductElement
				.childNodes[3] // <Annotation Term="unittest.ui5.parentAnnotation">
				.childNodes[1] // <Annotation Term="unittest.ui5.dynamicExpression6">
				.childNodes[0] // <Apply>
				.childNodes[0] // <If>
				.childNodes[3]; // <Annotation Term="com.sap.vocabularies.Common.v1.Label">
			this.oHeaderInfoElement = this.oProductElement
				.childNodes[4] // <Annotation Term="UI.HeaderInfo">
				.childNodes[0] // <Record>
				.childNodes[2] // <PropertyValue Property="Title">
				.childNodes[0] // <Record>
				.childNodes[2]; // <Annotation Term="com.sap.vocabularies.Common.v1.Label">
			this.oSupplierElement = this.oDocumentElement // <edm:Edm>
				.childNodes[2] // <edm:DataServices>
				.childNodes[0] // <Schema>
				.childNodes[1]; // <Annotations Target="self.Supplier" Qualifier="foo">
			this.oSupplierLineItemElement = this.oSupplierElement
				.childNodes[0] // <Annotation Term="UI.LineItem">
				.childNodes[1]; // <Annotation Term="UI.Criticality" Qualifier="bar">
		}
	});

	//**********************************************************************************************
	QUnit.test("AnnotationParser.backupAnnotationAtArray: returns a path", function (assert) {
		var AnnotationParser = sap.ui.require("sap/ui/model/odata/AnnotationParser"),
			aSegments;

		AnnotationParser._parserData = {
			aliases : {
				UI : "com.sap.vocabularies.UI.v1",
				self : "NorthwindModel"
			},
			aliasesByLength : ["self", "UI"]
		};
		this.stub(AnnotationParser, "syncAnnotationsAtArrays");

		// code under test
		aSegments = AnnotationParser.backupAnnotationAtArray(this.oLineItemElement);

		assert.deepEqual(aSegments, ["NorthwindModel.Product",
			"com.sap.vocabularies.UI.v1.LineItem", "com.sap.vocabularies.UI.v1.Criticality"]);

		// code under test
		aSegments = AnnotationParser.backupAnnotationAtArray(this.oLineItemFooElement);

		assert.deepEqual(aSegments, ["NorthwindModel.Product",
			"com.sap.vocabularies.UI.v1.LineItem#foo",
			"com.sap.vocabularies.UI.v1.Criticality#bar"]);

		// code under test
		aSegments = AnnotationParser.backupAnnotationAtArray(this.oFacetElement);

		assert.deepEqual(aSegments, ["NorthwindModel.Product",
			"com.sap.vocabularies.UI.v1.Facets", 0, "Facets",
			"com.sap.vocabularies.Common.v1.Label"]);

		// code under test
		aSegments = AnnotationParser.backupAnnotationAtArray(this.oIfElement);

		assert.deepEqual(aSegments, ["NorthwindModel.Product",
			"unittest.ui5.parentAnnotation", "unittest.ui5.dynamicExpression3", "If",
			"com.sap.vocabularies.Common.v1.Label"]);

		// code under test
		aSegments = AnnotationParser.backupAnnotationAtArray(this.oIfInApplyElement);

		assert.deepEqual(aSegments, ["NorthwindModel.Product",
			"unittest.ui5.parentAnnotation", "unittest.ui5.dynamicExpression6", "Apply",
			"Parameters", 0, "Value", "com.sap.vocabularies.Common.v1.Label"]);

		// code under test
		aSegments = AnnotationParser.backupAnnotationAtArray(this.oHeaderInfoElement);

		assert.deepEqual(aSegments, ["NorthwindModel.Product",
			"com.sap.vocabularies.UI.v1.HeaderInfo", "Title",
			"com.sap.vocabularies.Common.v1.Label"]);

		// code under test
		aSegments = AnnotationParser.backupAnnotationAtArray(this.oSupplierLineItemElement);

		assert.deepEqual(aSegments, ["NorthwindModel.Supplier",
			"com.sap.vocabularies.UI.v1.LineItem#foo",
			// not sure if CSDL allows qualifier at indirect child of <Annotations Qualifier="...">,
			// support it nevertheless
			"com.sap.vocabularies.UI.v1.Criticality#bar"]);
	});

	//**********************************************************************************************
	QUnit.test("AnnotationParser.backupAnnotationAtArray: adds a sibling", function (assert) {
		var AnnotationParser = sap.ui.require("sap/ui/model/odata/AnnotationParser"),
			oCriticality = {"Path" : "Criticality"},
			aFacets = [{
				"Target" : {
					"AnnotationPath"
						: "Supplier/@com.sap.vocabularies.UI.v1.Identification"
				},
				"RecordType" : "com.sap.vocabularies.UI.v1.ReferenceFacet"
			}],
			oCollectionFacet = {
				"Facets" : aFacets,
				"RecordType" : "com.sap.vocabularies.UI.v1.CollectionFacet"
			},
			oLabel = {"String" : "Supplier Identification"},
			aLineItems = [{
				"Label" : {
					"String" : "Business Partner"
				},
				"Value" : {
					"Path" : "BusinessPartnerID"
				},
				"RecordType" : "com.sap.vocabularies.UI.v1.DataField",
				"com.sap.vocabularies.UI.v1.Importance" : {
					"EnumMember" : "com.sap.vocabularies.UI.v1.ImportanceType/High"
				}
			}],
			mProduct = {
				"com.sap.vocabularies.UI.v1.LineItem" : aLineItems,
				"com.sap.vocabularies.UI.v1.Facets" : [oCollectionFacet]
			},
			oAnnotations = {
				"NorthwindModel.Product" : mProduct
			};

		aLineItems["com.sap.vocabularies.UI.v1.Criticality"] = oCriticality;
		aFacets["com.sap.vocabularies.Common.v1.Label"] = oLabel;
		AnnotationParser._parserData = {
			aliases : {
				UI : "com.sap.vocabularies.UI.v1",
				self : "NorthwindModel"
			},
			aliasesByLength : ["self", "UI"],
			annotationsAtArrays : []
		};
		this.spy(AnnotationParser, "syncAnnotationsAtArrays");

		// code under test
		AnnotationParser.backupAnnotationAtArray(this.oLineItemElement, oAnnotations);

		assert.strictEqual(
			mProduct["com.sap.vocabularies.UI.v1.LineItem@com.sap.vocabularies.UI.v1.Criticality"],
			oCriticality);

		// code under test
		AnnotationParser.backupAnnotationAtArray(this.oFacetElement, oAnnotations);

		assert.strictEqual(
			oCollectionFacet["Facets@com.sap.vocabularies.Common.v1.Label"],
			oLabel);

		sinon.assert.alwaysCalledWith(AnnotationParser.syncAnnotationsAtArrays,
			sinon.match.object, sinon.match.array, true);
	});

	//**********************************************************************************************
	QUnit.test("AnnotationParser.restoreAnnotationsAtArrays", function (assert) {
		var AnnotationParser = sap.ui.require("sap/ui/model/odata/AnnotationParser"),
			oAnnotations = {
				"NorthwindModel.Product" : {
					"com.sap.vocabularies.UI.v1.LineItem" : [{
						"Label" : {
							"String" : "Business Partner"
						},
						"Value" : {
							"Path" : "BusinessPartnerID"
						},
						"RecordType" : "com.sap.vocabularies.UI.v1.DataField",
						"com.sap.vocabularies.UI.v1.Importance" : {
							"EnumMember" : "com.sap.vocabularies.UI.v1.ImportanceType/High"
						}
					}],
					"com.sap.vocabularies.UI.v1.LineItem@com.sap.vocabularies.UI.v1.Criticality" : {
						"Path" : "Criticality"
					},
					"com.sap.vocabularies.UI.v1.Facets" : [{
						"Facets" : [{
							"Target" : {
								"AnnotationPath"
									: "Supplier/@com.sap.vocabularies.UI.v1.Identification"
							},
							"RecordType" : "com.sap.vocabularies.UI.v1.ReferenceFacet"
						}],
						"Facets@com.sap.vocabularies.Common.v1.Label" : {
							"String" : "Supplier Identification"
						},
						"RecordType" : "com.sap.vocabularies.UI.v1.CollectionFacet"
					}]
				},
				annotationsAtArrays : [
					["NorthwindModel.Product", "com.sap.vocabularies.UI.v1.LineItem",
						"com.sap.vocabularies.UI.v1.Criticality"],
					// simulate a path that has been invalidated by AnnotationParser.merge
					["NorthwindModel.Product", "com.sap.vocabularies.UI.v1.Facets", 3, "Facets",
						"com.sap.vocabularies.Common.v1.Label"],
					["NorthwindModel.Product", "com.sap.vocabularies.UI.v1.Facets", 0, "Facets",
						"com.sap.vocabularies.Common.v1.Label"],
					// unrealistic example: do not modify non-arrays
					["NorthwindModel.Product", "com.sap.vocabularies.UI.v1.LineItem", 0, "Label",
						"com.sap.vocabularies.UI.v1.Criticality"],
					// unrealistic examples, just to be cautious
					["NorthwindModel.Product", "n/a", 0, "Facets",
						"com.sap.vocabularies.Common.v1.Label"],
					["NorthwindModel.Product", "com.sap.vocabularies.UI.v1.Facets", 0, "n/a",
						"com.sap.vocabularies.Common.v1.Label"],
					["NorthwindModel.Product", "com.sap.vocabularies.UI.v1.LineItem", 0, "Label",
						"String", "com.sap.vocabularies.UI.v1.Criticality"]
				]
			},
			aAnnotationsAtArrays = JSON.parse(JSON.stringify(oAnnotations.annotationsAtArrays));

		this.spy(AnnotationParser, "syncAnnotationsAtArrays");

		// code under test
		AnnotationParser.restoreAnnotationsAtArrays(oAnnotations);

		// annotations at array values now present
		assert.strictEqual(
			oAnnotations["NorthwindModel.Product"]
				["com.sap.vocabularies.UI.v1.LineItem"]["com.sap.vocabularies.UI.v1.Criticality"],
			oAnnotations["NorthwindModel.Product"]
				["com.sap.vocabularies.UI.v1.LineItem@com.sap.vocabularies.UI.v1.Criticality"]
		);
		assert.strictEqual(
			oAnnotations["NorthwindModel.Product"]["com.sap.vocabularies.UI.v1.Facets"][0]
				.Facets["com.sap.vocabularies.Common.v1.Label"],
			oAnnotations["NorthwindModel.Product"]["com.sap.vocabularies.UI.v1.Facets"][0]
				["Facets@com.sap.vocabularies.Common.v1.Label"]
		);

		assert.deepEqual(oAnnotations.annotationsAtArrays, aAnnotationsAtArrays,
			"annotationsAtArrays is unchanged");

		assert.notOk("Label@com.sap.vocabularies.UI.v1.Criticality" in oAnnotations
			["NorthwindModel.Product"]["com.sap.vocabularies.UI.v1.LineItem"][0],
			"do not modify non-arrays");
		assert.notOk("com.sap.vocabularies.UI.v1.Criticality" in oAnnotations
			["NorthwindModel.Product"]["com.sap.vocabularies.UI.v1.LineItem"][0].Label,
			"do not modify non-arrays");

		// code under test
		AnnotationParser.restoreAnnotationsAtArrays({/*no annotationsAtArrays!*/});

		sinon.assert.alwaysCalledWith(AnnotationParser.syncAnnotationsAtArrays,
			sinon.match.object, sinon.match.array);
	});

	//**********************************************************************************************
	QUnit.test("AnnotationParser.merge", function (assert) {
		var AnnotationParser = sap.ui.require("sap/ui/model/odata/AnnotationParser"),
			mSourceAnnotations1 = {
				annotationsAtArrays : [1, 2, 3]
			},
			mSourceAnnotations2 = {
				annotationsAtArrays : [4, 5, 6]
			},
			mTargetAnnotations = {};

		// code under test
		AnnotationParser.merge(mTargetAnnotations, {});

		assert.notOk("annotationsAtArrays" in mTargetAnnotations);

		// code under test
		AnnotationParser.merge(mTargetAnnotations, mSourceAnnotations1);

		assert.deepEqual(mTargetAnnotations.annotationsAtArrays, [1, 2, 3]);

		// code under test
		AnnotationParser.merge(mTargetAnnotations, {});
		AnnotationParser.merge(mTargetAnnotations, mSourceAnnotations2);

		assert.deepEqual(mTargetAnnotations.annotationsAtArrays, [1, 2, 3, 4, 5, 6]);
	});

	//**********************************************************************************************
	QUnit.test("AnnotationParser.syncAnnotationsAtArrays", function (assert) {
		var AnnotationParser = sap.ui.require("sap/ui/model/odata/AnnotationParser"),
			mAnnotations = {
				"NorthwindModel.Product" : {}
			},
			aSegments = ["NorthwindModel.Product", "com.sap.vocabularies.UI.v1.LineItem",
				"com.sap.vocabularies.UI.v1.Criticality"],
			Log = sap.ui.require("sap/base/Log");
		assert.ok(Log, "Log module should be loaded");
		this.mock(Log).expects("warning")
			.withExactArgs("Wrong path to annotation at array", sinon.match.same(aSegments),
				"sap.ui.model.odata.AnnotationParser");

		// code under test
		AnnotationParser.syncAnnotationsAtArrays(mAnnotations, aSegments, true);

		// code under test - expect no second warning
		AnnotationParser.syncAnnotationsAtArrays(mAnnotations, aSegments);

	});
});