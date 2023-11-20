/*global QUnit */
sap.ui.define([
	"sap/ui/core/qunit/odata/data/ODataAnnotationsFakeService",
	"sap/ui/model/odata/ODataMetadata",
	"sap/ui/model/odata/v2/ODataAnnotations",
	"sap/ui/model/odata/v2/ODataModel",
	"sap/ui/thirdparty/jquery"
], function(
	fakeService,
	ODataMetadata,
	ODataAnnotations,
	ODataModel,
	jQuery
) {
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
		annotations      : "fakeService://testdata/odata/NOT_EXISTENT",
		serviceValid     : true,
		annotationsValid : "none"
	},{
		name             : "Invalid",
		service          : "fakeService://testdata/odata/NOT_EXISTENT/",
		annotations      : "fakeService://testdata/odata/NOT_EXISTENT",
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
		annotations      : "fakeService://testdata/odata/NOT_EXISTENT",
		serviceValid     : true,
		annotationsValid : "none",
		sharedMetadata   : true
	},{
		name             : "Invalid",
		service          : "fakeService://testdata/odata/NOT_EXISTENT/",
		annotations      : "fakeService://testdata/odata/NOT_EXISTENT",
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
		},
		"LastModified Header": {
			service          : "fakeService://testdata/odata/sapdata01/",
			annotations      : [
				"fakeService://testdata/odata/multiple-annotations-01.xml",
				"fakeService://testdata/odata/multiple-annotations-02.xml",
				"fakeService://testdata/odata/multiple-annotations-03.xml"
			],
			serviceValid     : true,
			annotationsValid : "all"
		},
		"NoLastModified Header": {
			service          : "fakeService://testdata/odata/sapdata02/",
			serviceValid     : true,
			annotationsValid : "all"
		},
		"ETag Header": {
			service          : "fakeService://testdata/odata/sapdata01/",
			annotations      : [
				"fakeService://testdata/odata/multiple-annotations-01.xml",
				"fakeService://testdata/odata/multiple-annotations-02.xml",
				"fakeService://testdata/odata/multiple-annotations-03.xml"
			],
			serviceValid     : true,
			annotationsValid : "all"
		},
		"No ETag Header": {
			service          : "fakeService://testdata/odata/sapdata02/",
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



	QUnit.module("Standard Tests for All Annotation Cases");

	var fnTestLoading = function(mService, assert) {
		var done = assert.async();

		var oMetadata = new ODataMetadata(mService.service + "$metadata", { asnc: true });

		var oAnnotationsLoader = new ODataAnnotations(oMetadata, {
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
			done();
		}

		pLoaded.then(function(aResults) {
			assert.equal(aResults.length, iNumAnnotations, "The right number of annotations were successfully loaded from sources");
			assert.equal(iLoaded, iNumAnnotations, "The right number of annotations were loaded including $metadata");

			if (mService.annotationsValid === "all") {
				var bNoErrors = (aResults.length === 0) || aResults.reduce(function(bLastResult, oResult) {
					if (!bLastResult) {
						return false;
					} else {
						return !(oResult instanceof Error);
					}
				}, true);
				assert.equal(bNoErrors, true, "No Errors in the results");
			}
			endTest();
		});

		pLoaded.catch(function(aResults) {
			assert.ok(false, "With a valid service at least the metadata should have been parsed for annotations successfully");
			endTest();
		});


	};


	for (var i = 0; i < aServices.length; ++i) {
		if (aServices[i].serviceValid && aServices[i].annotationsValid !== "some") {
			QUnit.test("External Annotation Loading - Service Case: " + aServices[i].name, fnTestLoading.bind(undefined, aServices[i]));
		}
	}


	var fnTestEventsAllSome = function(mService, bSkipMetadata, assert) {
		var done = assert.async();

		var oMetadata = new ODataMetadata(mService.service + "$metadata", { asnc: true });

		var oAnnotationsLoader = new ODataAnnotations(oMetadata, {
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
			iSuccesses++;
		});

		var iErrors = 0;
		oAnnotationsLoader.attachError(function(oEvent) {
			iErrors++;
		});


		var bSomeLoadedFired = false;
		oAnnotationsLoader.attachSomeLoaded(function(oEvent) {

			bSomeLoadedFired = true;
			var aResults = oEvent.getParameter("result");
			assert.ok(Array.isArray(aResults), "Result parameter contained an array of results");
			assert.equal(aResults.length, iAnnotations, "The correct number of Annotations was loaded");

			var iErrorsInResults = fnCountErrors(aResults);
			assert.ok(iErrorsInResults < iAnnotations, "The failed event parameter \"result\" should NOT contain ONLY Error objects");

			assert.equal(iErrorsInResults, iErrors, "The number of Errors in the Results is the same as the number of error-events that occurred");
			assert.equal(aResults.length - iErrorsInResults, iSuccesses, "The number of successfully parsed entries in the Results is the same as the number of success-events that occurred");
		});

		var bAllFailedFired = false;
		oAnnotationsLoader.attachAllFailed(function(oEvent) {

			bAllFailedFired = true;
			var aErrors = oEvent.getParameter("result");

			assert.ok(Array.isArray(aErrors), "Result parameter contained an array of errors");
			assert.equal(aErrors.length, iAnnotations, "The correct number of Annotations failed");

			var iErrorsInResults = fnCountErrors(aErrors);
			assert.equal(iErrorsInResults, iAnnotations, "The failed event parameter \"result\" should contain only Error objects");

			assert.equal(iErrorsInResults, iErrors, "The number of Errors in the Results is the same as the number of error-events that occurred");
			assert.equal(iSuccesses, 0, "No success events should have been fired");
		});


		var fnEndTest = function() {
			oMetadata.destroy();
			oAnnotationsLoader.destroy();
			done();
		};

		pLoaded.then(function() {
			assert.equal(bSomeLoadedFired, true, "Loaded event should have been fired");
			assert.equal(bAllFailedFired, false, "Failed event should NOT have been fired");
			fnEndTest();
		}).catch(function() {
			assert.equal(bSomeLoadedFired, false, "Loaded event should NOT have been fired");
			assert.equal(bAllFailedFired, true, "Failed event should have been fired");
			fnEndTest();
		});
	};


	for (var i = 0; i < aServices.length; ++i) {
		if (aServices[i].serviceValid) {
			// Test all valid services - parse metadata for annotations
			QUnit.test("Event (All/Some) Parameter Checks with Metadata - Service Case: " + aServices[i].name, fnTestEventsAllSome.bind(undefined, aServices[i], false));
		}
		if (aServices[i].serviceValid && aServices[i].annotations) {
			// Test all valid services - DO NOT parse metadata for annotations
			QUnit.test("Event (All/Some) Parameter Checks without Metadata - Service Case: " + aServices[i].name, fnTestEventsAllSome.bind(undefined, aServices[i], true));
		}
	}



	var fnTestEvents = function(mService, bSkipMetadata, assert) {
		var done = assert.async();

		var oMetadata = new ODataMetadata(mService.service + "$metadata", { asnc: true });

		var oAnnotationsLoader = new ODataAnnotations(oMetadata, {
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
			iSuccesses++;
		});

		var iErrors = 0;
		oAnnotationsLoader.attachError(function(oEvent) {
			iErrors++;
		});


		var bLoadedFired = false;
		oAnnotationsLoader.attachLoaded(function(oEvent) {

			bLoadedFired = true;
			var aResults = oEvent.getParameter("result");
			assert.ok(Array.isArray(aResults), "Result parameter contained an array of results");
			assert.equal(aResults.length, iAnnotations, "The correct number of Annotations was loaded");

			var iErrorsInResults = fnCountErrors(aResults);
			assert.equal(iErrorsInResults, 0, "The failed event parameter \"result\" should NOT contain ANY Error objects");

			assert.equal(iErrorsInResults, iErrors, "The number of Errors in the Results is the same as the number of error-events that occurred");
			assert.equal(aResults.length, iSuccesses, "The number of successfully parsed entries in the Results is the same as the number of success-events that occurred");
		});

		var bFailedFired = false;
		oAnnotationsLoader.attachFailed(function(oEvent) {

			bFailedFired = true;
			var aResults = oEvent.getParameter("result");

			assert.ok(Array.isArray(aResults), "Result parameter contained an array of errors");
			assert.equal(aResults.length, iAnnotations, "The correct number of Annotations failed");

			var iErrorsInResults = fnCountErrors(aResults);
			assert.ok(iErrorsInResults > 0, "The failed event parameter \"result\" should contain at least one Error object");

			assert.equal(iErrorsInResults, iErrors, "The number of Errors in the Results is the same as the number of error-events that occurred");
			assert.equal(iSuccesses, aResults.length - iErrorsInResults, "No success events should have been fired");
		});


		var fnEndTest = function() {
			oMetadata.destroy();
			oAnnotationsLoader.destroy();
			done();
		};

		pLoaded.catch(function() {}).then(function() {
			assert.ok(bLoadedFired !== bFailedFired, "Either loaded or failed shoud have been fired but not both");
			fnEndTest();
		});
	};

	for (var i = 0; i < aServices.length; ++i) {
		if (aServices[i].serviceValid) {
			// Test all valid services - parse metadata for annotations
			QUnit.test("Event Parameter Checks with Metadata - Service Case: " + aServices[i].name, fnTestEvents.bind(undefined, aServices[i], false));
		}
		if (aServices[i].serviceValid && aServices[i].annotations) {
			// Test all valid services - DO NOT parse metadata for annotations
			QUnit.test("Event Parameter Checks without Metadata - Service Case: " + aServices[i].name, fnTestEvents.bind(undefined, aServices[i], true));
		}
	}


	QUnit.module("v2.ODataModel Integration Test");

	var fnTestModelLoading = function(mService, assert) {
		var done = assert.async();

		// ODataModel.mSharedData = {server: {}, service: {}, meta: {}};
		var oModel = new ODataModel(mService.service, {
			annotationURI: mService.annotations,
			/* default: loadAnnotationsJoined: true, */
			skipMetadataAnnotationParsing: true
		});

		function endTest() {
			oModel.destroy();
			done();
		}

		var bAnnotationsLoaded = false;

		oModel.attachAnnotationsLoaded(function() {
			bAnnotationsLoaded = true;
			assert.ok(mService.serviceValid, "Service annotations loaded");
			assert.notEqual(mService.annotationsValid, "none", "Service annotations loaded");
		});

		oModel.attachMetadataLoaded(function() {
			assert.ok(mService.serviceValid, "Service metadata loaded");

			if (mService.annotationsValid === "none") {
				assert.equal(bAnnotationsLoaded, false, "No Annotations loaded");
			} else if (mService.annotationsValid === "metadata") {
				assert.equal(bAnnotationsLoaded, false, "No Annotations loaded");
			} else {
				assert.equal(bAnnotationsLoaded, true, "Annotations loaded");
			}

			endTest();
		});

		oModel.attachMetadataFailed(function() {
			assert.ok(!mService.serviceValid || mService.annotationsValid === "none", "Service metadata or annotations failed");
			endTest();
		});

	};

	for (var i = 0; i < aServices.length; ++i) {
		if (aServices[i].serviceValid && aServices[i].annotations ) {
			QUnit.test("Annotations - Service Case: " + aServices[i].name, fnTestModelLoading.bind(undefined, aServices[i]));
		}
	}



	var fnTestModelMetadataLoading = function(mService, assert) {
		var done = assert.async();

		// ODataModel.mSharedData = {server: {}, service: {}, meta: {}};
		var oModel = new ODataModel(mService.service, {
			annotationURI: mService.annotations,
			skipMetadataAnnotationParsing: false
		});

		function endTest() {
			oModel.destroy();
			done();
		}

		var bAnnotationsLoaded = false;

		oModel.attachAnnotationsLoaded(function() {
			bAnnotationsLoaded = true;
			assert.ok(mService.serviceValid, "Service annotations loaded");
		});

		oModel.attachMetadataLoaded(function() {
			assert.ok(mService.serviceValid, "Service metadata failed");
			assert.equal(bAnnotationsLoaded, true, "Annotations loaded");

			endTest();
		});

		oModel.attachMetadataFailed(function() {
			assert.ok(!mService.serviceValid, "Service metadata failed");
			endTest();
		});

	};

	for (var i = 0; i < aServices.length; ++i) {
		if (aServices[i].serviceValid) {
			QUnit.test("Annotations and metadata - Service Case: " + aServices[i].name, fnTestModelMetadataLoading.bind(undefined, aServices[i]));
		}
	}

	QUnit.module("Misc Test to increase test coverage");

	var fnTestMisc1 = function(assert) {
		var done = assert.async();

		var mService = mAdditionalTestsServices["LastModified Header"];

		var oModel = new ODataModel(mService.service, {
			annotationURI: mService.annotations,
			skipMetadataAnnotationParsing: false
		});

		// Instantiate without options argument - use defaults
		var oAnnotationsFromMetadata = new ODataAnnotations(oModel.oMetadata);

		assert.deepEqual(oAnnotationsFromMetadata.getData(), {});

		var oAnnotations = new ODataAnnotations(oModel.oMetadata, { skipMetadata: true });


		var fnEvent = function() {
			assert.ok(false, "Success/Error/Loaded handler should not be called for this instance");
		};
		oAnnotations.attachSuccess(fnEvent);
		oAnnotations.attachError(fnEvent);
		oAnnotations.attachLoaded(fnEvent);
		oAnnotations.attachFailed(fnEvent);


		// Add empty source
		oAnnotations.addSource().then(function() {
			// Add empty source as array
			oAnnotations.addSource([]).then(function() {
				oAnnotations.detachSuccess(fnEvent);
				oAnnotations.detachError(fnEvent);
				oAnnotations.detachLoaded(fnEvent);
				oAnnotations.detachFailed(fnEvent);

				// Add invalid source
				oAnnotations.addSource({
					type: "invalid"
				}).then(function() {
					assert.ok(false, "Adding invalid sources should not be successful");
				}).catch(function() {
					assert.ok(true, "Adding invalid sources should lead to an error");

					oAnnotations.addSource({
						type: "xml",
						xml: "I am not valid XML"
					}).then(function() {
						assert.ok(false, "Adding sources with invalid XML content should not be successful");
					}).catch(function() {
						assert.ok(true, "Adding sources with invalid XML content should lead to an error");

						oAnnotations.addSource({
							type: "xml",
							document: { invalid: "I ain't no XML document..." }
						}).then(function() {
							assert.ok(false, "Adding sources with invalid XML content should not be successful");
						}).catch(function() {
							assert.ok(true, "Adding sources with invalid XML documents should lead to an error");
							done();
						});
					});
				});
			});

		});
	};

	QUnit.test("Loading and accessing annotations", fnTestMisc1);
	/**
	 * @deprecated As of version 1.37.0
	 */
	QUnit.test("ODataAnnotations#getAnnotationsData is alias of ODataAnnotations#getData", function (assert) {
		assert.strictEqual(ODataAnnotations.prototype.getData, ODataAnnotations.prototype.getAnnotationsData);
	});


	QUnit.module("Annotation Test Cases for Bugfixes and Specification Changes");


	var fnTestLastModified = function(assert) {
		var done = assert.async();

		assert.expect(4);

		var mService = mAdditionalTestsServices["LastModified Header"];

		var oModel = new ODataModel(mService.service, {
			annotationURI: mService.annotations,
			skipMetadataAnnotationParsing: false
		});

		oModel.annotationsLoaded().then(function(aAnnotations) {
			var iLastModified = Date.UTC(1995, 10, 15, 4, 58, 8); // "Wed, 15 Nov 1995 04:58:08 GMT"

			assert.equal(Date.parse(aAnnotations[0].lastModified), iLastModified, "LastModified header exists for first annotation document");
			assert.equal(Date.parse(aAnnotations[1].lastModified), iLastModified, "LastModified header exists for second annotation document");
			assert.equal(Date.parse(aAnnotations[2].lastModified), iLastModified, "LastModified header exists for third annotation document");
			assert.equal(Date.parse(aAnnotations[3].lastModified), iLastModified, "LastModified header exists for fourth annotation document");

			done();
		});

	};

	QUnit.test("Access to lastModified header", fnTestLastModified);



	var fnTestNoLastModified = function(assert) {
		var mService = mAdditionalTestsServices["NoLastModified Header"];

		var oModel = new ODataModel(mService.service, {
			annotationURI: mService.annotations,
			skipMetadataAnnotationParsing: false
		});

		return oModel.annotationsLoaded().then(function(aAnnotations) {
			assert.notOk(aAnnotations[0].lastModified, "LastModified header does not exist for annotation document");
		});
	};

	QUnit.test("Access to lastModified header which is not set", fnTestNoLastModified);


	var fnTestETag = function(assert) {
		var done = assert.async();

		assert.expect(4);

		var mService = mAdditionalTestsServices["ETag Header"];

		var oModel = new ODataModel(mService.service, {
			annotationURI: mService.annotations,
			skipMetadataAnnotationParsing: false
		});

		oModel.annotationsLoaded().then(function(aAnnotations) {
			var iEtag = Date.UTC(1995, 10, 15, 4, 58, 8); // "Wed, 15 Nov 1995 04:58:08 GMT"

			assert.equal(Date.parse(aAnnotations[0].eTag), iEtag, "ETag header exists for first annotation document");
			assert.equal(Date.parse(aAnnotations[1].eTag), iEtag, "ETag header exists for second annotation document");
			assert.equal(Date.parse(aAnnotations[2].eTag), iEtag, "ETag header exists for third annotation document");
			assert.equal(Date.parse(aAnnotations[3].eTag), iEtag, "ETag header exists for fourth annotation document");

			done();
		});

	};

	QUnit.test("Access to ETag header", fnTestETag);



	var fnTestNoETag = function(assert) {
		var mService = mAdditionalTestsServices["No ETag Header"];

		var oModel = new ODataModel(mService.service, {
			annotationURI: mService.annotations,
			skipMetadataAnnotationParsing: false
		});

		return oModel.annotationsLoaded().then(function(aAnnotations) {
			assert.notOk(aAnnotations[0].eTag, "ETag header does not exist for annotation document");
		});
	};

	QUnit.test("Access to ETag header which is not set", fnTestNoETag);

	QUnit.module("sap-cancel-on-close header handling");

	var fnCheckHeader = function(bCancelOnClose, bExpectedValue){
		return function(assert){
			var done = assert.async();
			var mService = aServices[0];

			var oModel = new ODataModel(mService.service, {
				headers: {"sap-cancel-on-close": bCancelOnClose},
				annotationURI: mService.annotations,
				skipMetadataAnnotationParsing: false
			});

			assert.ok(oModel.getMetadata().isA("sap.ui.model.odata.v2.ODataModel"), "Model created");

			var check = function(event, jqXHR, ajaxOptions){
				jQuery(document).off("ajaxSuccess", check);
				assert.strictEqual(ajaxOptions.headers["sap-cancel-on-close"], bExpectedValue, "Header was set correctly.");
				done();
			};
			jQuery(document).on("ajaxSuccess", check);
		};
	};

	QUnit.test("Default true value", fnCheckHeader(undefined, true));
	QUnit.test("Set to false via model header parameter", fnCheckHeader(false, false));
	QUnit.test("Set to true via model header parameter", fnCheckHeader(true, true));
});