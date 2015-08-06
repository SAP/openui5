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
		equals(typeof oValue[sKey], typeof oExpected[sKey], sMessage + "/" + sKey + " have same type");

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
		annotationsValid : true
	}, {
		name             : "Northwind",
		service          : "fakeService://testdata/odata/northwind/",
		annotations      : "fakeService://testdata/odata/northwind-annotations-malformed.xml",
		serviceValid     : true,
		annotationsValid : false
	}, {
		name             : "Northwind",
		service          : "fakeService://testdata/odata/northwind/",
		annotations      : "fakeService://testdata/odata/NOT_EXISTANT",
		serviceValid     : true,
		annotationsValid : false
	},{
		name             : "Invalid",
		service          : "fakeService://testdata/odata/NOT_EXISTANT/",
		annotations      : "fakeService://testdata/odata/NOT_EXISTANT",
		serviceValid     : false,
		annotationsValid : false
	},{
		name             : "Complex EPM",
		service          : "fakeService://testdata/odata/northwind/",
		annotations      : "fakeService://testdata/odata/epm-annotations-complex.xml",
		serviceValid     : true,
		annotationsValid : true
	},{
		name             : "Northwind",
		service          : "fakeService://testdata/odata/northwind/",
		annotations      : "fakeService://testdata/odata/northwind-annotations-normal.xml",
		serviceValid     : true,
		annotationsValid : true,
		sharedMetadata   : true
	}, {
		name             : "Northwind",
		service          : "fakeService://testdata/odata/northwind/",
		annotations      : "fakeService://testdata/odata/northwind-annotations-malformed.xml",
		serviceValid     : true,
		annotationsValid : false,
		sharedMetadata   : true
	}, {
		name             : "Northwind",
		service          : "fakeService://testdata/odata/northwind/",
		annotations      : "fakeService://testdata/odata/NOT_EXISTANT",
		serviceValid     : true,
		annotationsValid : false,
		sharedMetadata   : true
	},{
		name             : "Invalid",
		service          : "fakeService://testdata/odata/NOT_EXISTANT/",
		annotations      : "fakeService://testdata/odata/NOT_EXISTANT",
		serviceValid     : false,
		annotationsValid : false,
		sharedMetadata   : true
	},{
		name             : "Northwind with annotated metadata",
		service          : "fakeService://testdata/odata/northwind-annotated/",
		annotations      : "fakeService://testdata/odata/northwind-annotated/$metadata",
		serviceValid     : true,
		annotationsValid : true,
		sharedMetadata   : true
	},{
		name             : "Northwind with annotated metadata + annotations",
		service          : "fakeService://testdata/odata/northwind-annotated/",
		annotations      : [ 
			"fakeService://testdata/odata/northwind-annotated/$metadata",
			"fakeService://testdata/odata/northwind-annotations-normal.xml"
		],
		serviceValid     : true,
		annotationsValid : true,
		sharedMetadata   : true
	},{
		name             : "Northwind with annotated metadata + annotations",
		service          : "fakeService://testdata/odata/northwind-annotated/",
		annotations      : [ 
			"fakeService://testdata/odata/northwind-annotated/$metadata",
			"fakeService://testdata/odata/northwind-annotations-malformed.xml"
		],
		serviceValid     : true,
		annotationsValid : false,
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
			annotationsValid : true
		},
		"Multiple Property Annotations": {
			service          : "fakeService://testdata/odata/northwind/",
			annotations      : "fakeService://testdata/odata/multiple-property-annotations.xml",
			serviceValid     : true,
			annotationsValid : true
		},
		"Property Annotation Qualifiers": {
			service          : "fakeService://testdata/odata/northwind/",
			annotations      : "fakeService://testdata/odata/property-annotation-qualifiers.xml",
			serviceValid     : true,
			annotationsValid : true
		},
		"Other Property Values": {
			service          : "fakeService://testdata/odata/northwind/",
			annotations      : "fakeService://testdata/odata/other-property-values.xml",
			serviceValid     : true,
			annotationsValid : true
		},
		"Aliases in Namespaces": {
			service          : "fakeService://testdata/odata/northwind/",
			annotations      : "fakeService://testdata/odata/namespaces-aliases.xml",
			serviceValid     : true,
			annotationsValid : true
		},
		"Namespaces in Other Property Values": {
			service          : "fakeService://testdata/odata/northwind/",
			annotations      : "fakeService://testdata/odata/other-property-value-aliases.xml",
			serviceValid     : true,
			annotationsValid : true
		},
		"Text Properties" : {
			service          : "fakeService://testdata/odata/northwind/",
			annotations      : "fakeService://testdata/odata/other-property-textproperties.xml",
			serviceValid     : true,
			annotationsValid : true
		},
		"Entity Containers": {
			service          : "fakeService://testdata/odata/sapdata01/",
			annotations      : "fakeService://testdata/odata/sapdata01/$metadata",
			serviceValid     : true,
			annotationsValid : true
		},
		"Simple Values": {
			service          : "fakeService://testdata/odata/sapdata01/",
			annotations      : "fakeService://testdata/odata/simple-values.xml",
			serviceValid     : true,
			annotationsValid : true
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
		"Apply Parameters": {
			service          : "fakeService://testdata/odata/sapdata01/",
			annotations      : "fakeService://testdata/odata/apply-parameters.xml",
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
		}
	};


	// Add additional tests to stadard tests as well
	for (var sName in mAdditionalTestsServices) {
		var mTest = mAdditionalTestsServices[sName];
		mTest.name = sName;
		aServices.push(mTest);
	}

	var 
		sTestName, sServiceURI, mModelOptions, bServiceValid, bAnnotationsValid, bSharedMetadata,
		sTestType, fnTest, mService, oAnnotations, i;

	sap.ui.test.qunit.delayTestStart();

	module("Synchronous loading");

	fnTest = function(sServiceURI, mModelOptions, bServiceValid, bAnnotationsValid, bSharedMetadata) {
		return function() {
			if (!bSharedMetadata){
				sap.ui.model.odata.ODataModel.mServiceData = {};
			}
			var oModel = new sap.ui.model.odata.ODataModel(sServiceURI, mModelOptions);
			// Since this is synchronous, everything should be ready right now.
			if (bServiceValid && bAnnotationsValid) {
				// This should have worked.
				ok(!!oModel.getServiceMetadata(), "Metadata is available.");
				ok(!!oModel.getServiceAnnotations(), "Annotations are available.");

			} else if (bServiceValid && !bAnnotationsValid) {
				// Service Metadata should be there, annotations should not be loaded
				ok(!!oModel.getServiceMetadata(), "Metadata is available.");
				ok(!oModel.getServiceAnnotations(), "Annotations are not available.");

			} else if (!bServiceValid) {
				// Service is invalid, so both should not be there
				ok(!oModel.getServiceMetadata(), "Metadata is available.");
				ok(!oModel.getServiceAnnotations(), "Annotations are not available.");
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
		bAnnotationsValid = aServices[i].annotationsValid;
		bSharedMetadata = aServices[i].sharedMetadata;
		sTestName = aServices[i].name ? aServices[i].name : "";

		sTestType = 
			sTestName + " (" + 
			(bServiceValid ? "Valid Service" : "Broken Service") + "/" + 
			(bAnnotationsValid ? "Valid Annotations" : "Broken Annotations") +
			(bSharedMetadata ?  "/Shared Metadata" : "") + 
			")";

		// Check synchronous loading
		mModelOptions.loadAnnotationsJoined = false;
		mModelOptions.loadMetadataAsync = false;

		test(sTestType, fnTest(sServiceURI, mModelOptions, bServiceValid, bAnnotationsValid));
	}

	module("Asynchronous loading");

	fnTest = function(sServiceURI, mModelOptions, bServiceValid, bAnnotationsValid, bSharedMetadata) {
		return function() {
			if (!bSharedMetadata){
				sap.ui.model.odata.ODataModel.mServiceData = {};
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
						ok(bMetadataLoaded && !bAnnotationsLoaded, "Check: Invalid Annotations - Only Metadata loaded");
						jQuery.sap.log.debug("check for no annotations");
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

			if (bServiceValid && bAnnotationsValid){
				jQuery.when(metadataDfd, annotationsDfd).done(function(e){
						jQuery.sap.log.debug("both promises fulfilled");
						fnOnLoaded("Both");
					}).fail(function(e){
						jQuery.sap.log.debug("metadata promise failed");
						ok(false, 'Metadata promise rejected');
					}); 
			} else if (bServiceValid && !bAnnotationsValid){
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
			this.clock.tick(50);
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
		bAnnotationsValid = mService.annotationsValid;
		bSharedMetadata = mService.sharedMetadata;
		sTestName = aServices[i].name ? aServices[i].name : "";

		// Check asynchronous loading
		mModelOptions.loadAnnotationsJoined = false;
		mModelOptions.loadMetadataAsync = true;
	
		sTestType = 
			sTestName + " (" + 
			(bServiceValid ? "Valid Service" : "Broken Service") + "/" + 
			(bAnnotationsValid ? "Valid Annotations" : "Broken Annotations") +
			(bSharedMetadata ?  "/Shared Metadata" : "") + 
			")";

		jQuery.sap.log.debug("testtype: " + sTestType);

		asyncTest(
			"Asynchronous loading - " + sTestType,
			fnTest(sServiceURI, mModelOptions, bServiceValid, bAnnotationsValid)
		);
	}


	module("Asynchronous loading (joined events)");

	fnTest = function(sServiceURI, mModelOptions, bServiceValid, bAnnotationsValid, bSharedMetadata) {
		return function() {
			if (!bSharedMetadata){
				sap.ui.model.odata.ODataModel.mServiceData = {};
			}
			var oModel = new sap.ui.model.odata.ODataModel(sServiceURI, mModelOptions);
			var that = this;
			var bMetadataLoaded = false;
			var bAnnotationsLoaded = false;
			var bInternalMetadataLoaded = false;

			var fnOnLoaded = function(sWhat) {

				switch (sWhat) {

					case "InternalMetadata":
						ok(!bAnnotationsLoaded, "Internal metadata loaded before annotations");
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
						// Metadata should be loaded, but no annotations
						ok(bInternalMetadataLoaded && !bAnnotationsLoaded, "Check: Invalid Annotations - Only Metadata loaded");
						jQuery.sap.log.debug("check for no annotations");
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

			if (bServiceValid && bAnnotationsValid){
				jQuery.when(metadataDfd).done(function(e){
					jQuery.sap.log.debug("metadata promise fulfilled");
					fnOnLoaded("Both");
				}).fail(function(e){
				jQuery.sap.log.debug("metadata promise failed");
				ok(false, 'Metadata promise rejected');
			}); 
			} else if (bServiceValid && !bAnnotationsValid){
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
			this.clock.tick(100);
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
		bAnnotationsValid = mService.annotationsValid;
		bSharedMetadata = mService.sharedMetadata;
		sTestName = aServices[i].name ? aServices[i].name : "";
	
		// Check asynchronous loading
		mModelOptions.loadAnnotationsJoined = true;
		mModelOptions.loadMetadataAsync = true;


		sTestType = 
			sTestName + " (" +
			(bServiceValid ? "Valid Service" : "Broken Service") + "/" +
			(bAnnotationsValid ? "Valid Annotations" : "Broken Annotations") +
			(bSharedMetadata ?  "/Shared Metadata" : "") +
			")";

		asyncTest(
			"Asynchronous loading (joined events) - " + sTestType,
			fnTest(sServiceURI, mModelOptions, bServiceValid, bAnnotationsValid)
		); 
	}


	module("Multiple Annotation Sources Merged");

	asyncTest("Asynchronous loading", function() {
		expect(12);
		var asyncStartsExpected = 2; // The number of asynchronous starts expected before the real start is triggered

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

	test("Aliases in Namespaces", function() {
		expect(8);

		var mTest = mAdditionalTestsServices["Aliases in Namespaces"];
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
	});

	test("DynamicExpressions", function() {
		expect(22);

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
	});

	test("DynamicExpressions 2", function() {
		expect(90);

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
		
		
		
	});

	test("CollectionsWithSimpleValues", function() {
		expect(19);

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
	});
	
	test("Multiple Simple Values", function() {
		expect(13);
		
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
	});
	
	
	asyncTest("If in Apply", function() {
		expect(93);
		var mTest = mAdditionalTestsServices["If in Apply"];
		var sServiceURI = mTest.service;
		var mModelOptions = {
			annotationURI : mTest.annotations,
			json : true
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
			
			start();
		});
	});
	
	
	asyncTest("Other Elements in LabeledElement", function() {
		expect(157);
		var mTest = mAdditionalTestsServices["Other Elements in LabeledElement"];
		var sServiceURI = mTest.service;
		var mModelOptions = {
			annotationURI : mTest.annotations,
			json : true
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

			start();
		});
	});
	
	
	asyncTest("Apply Parameters", function() {
		expect(51);
		var mTest = mAdditionalTestsServices["Apply Parameters"];
		var sServiceURI = mTest.service;
		var mModelOptions = {
			annotationURI : mTest.annotations,
			json : true
		};

		var oModel = new sap.ui.model.odata.v2.ODataModel(sServiceURI, mModelOptions);
		
		oModel.attachAnnotationsLoaded(function() {
			var oMetadata = oModel.getServiceMetadata();
			var oAnnotations = oModel.getServiceAnnotations();
	
			ok(!!oMetadata, "Metadata is available.");
			ok(!!oAnnotations, "Annotations are available.");
			
			deepContains(
				oAnnotations["CatalogService.Annotation"],
				{
					"UI.data": {
						"Path":"MediaType"
					},
					"UI.data2": {
						"Path":"MediaType2"
					},
					"UI.data3": {
						"Apply": {
							"Name": "odata.concat",
							"Parameters": [{
								"Type": "String",
								"Value": "Yes"
							}, {
								"Type": "String",
								"Value": "we"
							}, {
								"Type": "String",
								"Value": "can"
							}]
						}
					},
					"UI.meta": {
						"String":"text"
					}
				},
				"Apply in Dynamic expression is parsed correctly: CatalogService.Annotation"
			);
			
			start();
		});
	});

	
	var fnTestAnnotationInRecord = function(iModelVersion) {
		expect(85);

		var mTest = mAdditionalTestsServices["Default Annotated Service"];
		
		var oModel;
		if (iModelVersion == 1) {
			oModel = new sap.ui.model.odata.ODataModel(mTest.service, {
				annotationURI : mTest.annotations,
				loadMetadataAsync: true
			});
		} else if (iModelVersion == 2) {
			oModel = new sap.ui.model.odata.v2.ODataModel(mTest.service, {
				annotationURI : mTest.annotations,
			});
		} else {
			ok(false, "Unknown ODataModel version requested for test");
			return;
		}

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
				"Null": {},
				"RecordType": "Test.AnnotationInRecord.Case3.Record"
			}, "Case 3 has correct values");

			oModel.destroy();
			start();
		});
	}
	
	asyncTest("V1: Annotation in Record", fnTestAnnotationInRecord.bind(this, 1));
	asyncTest("V1: Annotation in Record", fnTestAnnotationInRecord.bind(this, 2));



	var fnTestEmptyCollection = function(iModelVersion) {
		expect(23);

		var clock = sinon.useFakeTimers();
		
		var mTest = mAdditionalTestsServices["Empty collection"];
		
		var oModel;
		if (iModelVersion == 1) {
			oModel = new sap.ui.model.odata.ODataModel(mTest.service, {
				annotationURI : mTest.annotations,
				bAsync: true
			});
		} else if (iModelVersion == 2) {
			oModel = new sap.ui.model.odata.v2.ODataModel(mTest.service, {
				annotationURI : mTest.annotations,
			});
		} else {
			ok(false, "Unknown ODataModel version requested for test");
			return;
		}

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
			
			start();
		});
		
		clock.tick(500);
	};
	
	asyncTest("V1: Empty collection", fnTestEmptyCollection.bind(this, 1));
	asyncTest("V2: Empty collection", fnTestEmptyCollection.bind(this, 2));



	var fnTestEmptyCollection = function(iModelVersion) {
		expect(16);

		var clock = sinon.useFakeTimers();
		var mTest = mAdditionalTestsServices["Multiple Enums"];
		
		var oModel;
		if (iModelVersion == 1) {
			oModel = new sap.ui.model.odata.ODataModel(mTest.service, {
				annotationURI : mTest.annotations,
				bAsync: true
			});
		} else if (iModelVersion == 2) {
			oModel = new sap.ui.model.odata.v2.ODataModel(mTest.service, {
				annotationURI : mTest.annotations,
			});
		} else {
			ok(false, "Unknown ODataModel version requested for test");
			return;
		}

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
			
			start();
		});
		
		clock.tick(500);
	};
	
	asyncTest("V1: Multiple Enums", fnTestEmptyCollection.bind(this, 1));
	asyncTest("V2: Multiple Enums", fnTestEmptyCollection.bind(this, 2));

}
