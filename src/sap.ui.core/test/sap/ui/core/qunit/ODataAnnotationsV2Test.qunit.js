/* global module start test asyncTest expect ok equal deepEqual */

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
		sTestType, fnTest, mService, i;

	sap.ui.test.qunit.delayTestStart();

	module("Asynchronous loading");

	fnTest = function(sServiceURI, mModelOptions, bServiceValid, bAnnotationsValid, bSharedMetadata) {
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
			ok(oAnnotations.UnitTest["Test.Merged"][0].Value.Path === "Metadata", "Annotation from correct source (Metadata)");
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
			ok(oAnnotations.UnitTest["Test.Merged"][0].Value.Path === "Annotations", "Annotation from correct source (Annotations)");
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


	asyncTest("Test 2014-12-08", function() {
		expect(12);

		var mTest = mAdditionalTestsServices["Test 2014-12-08"];
		var sServiceURI = mTest.service;
		var mModelOptions = {
			annotationURI : mTest.annotations,
			json : true,
			loadAnnotationsJoined: false
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
			start();
		});
	});


	asyncTest("Multiple Property Annotations", function() {
		expect(11);

		var mTest = mAdditionalTestsServices["Multiple Property Annotations"];
		var sServiceURI = mTest.service;
		var mModelOptions = {
			annotationURI : mTest.annotations,
			json : true,
			loadAnnotationsJoined: false,
			loadMetadataAsync: false
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
			start();
		});
	});


	asyncTest("Qualifiers in Property Annotations", function() {
		expect(8);

		var mTest = mAdditionalTestsServices["Property Annotation Qualifiers"];
		var sServiceURI = mTest.service;
		var mModelOptions = {
			annotationURI : mTest.annotations,
			json : true,
			loadAnnotationsJoined: false,
			loadMetadataAsync: false
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
			start();
		});
	});


	asyncTest("Other Property Values", function() {
		expect(8);

		var mTest = mAdditionalTestsServices["Other Property Values"];
		var sServiceURI = mTest.service;
		var mModelOptions = {
			annotationURI : mTest.annotations,
			json : true,
			loadAnnotationsJoined: false,
			loadMetadataAsync: false
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
			start();
		});
	});

	asyncTest("Aliases in Namespaces", function() {
		expect(8);

		var mTest = mAdditionalTestsServices["Aliases in Namespaces"];
		var sServiceURI = mTest.service;
		var mModelOptions = {
			annotationURI : mTest.annotations,
			json : true,
			loadAnnotationsJoined: false,
			loadMetadataAsync: false
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
			start();
		});
	});
	
	asyncTest("Namespaces in Other Property Values", function() {
		expect(22);

		var mTest = mAdditionalTestsServices["Namespaces in Other Property Values"];
		var sServiceURI = mTest.service;
		var mModelOptions = {
			annotationURI : mTest.annotations,
			json : true,
			loadAnnotationsJoined: false,
			loadMetadataAsync: false
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
}
