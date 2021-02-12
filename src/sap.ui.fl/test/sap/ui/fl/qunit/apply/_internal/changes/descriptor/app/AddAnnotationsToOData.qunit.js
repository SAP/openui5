/*global QUnit*/

sap.ui.define([
	"sap/ui/fl/apply/_internal/changes/descriptor/app/AddAnnotationsToOData",
	"sap/ui/fl/Change",
	"sap/ui/thirdparty/jquery"
],
function (
	AddAnnotationsToOData,
	Change,
	jQuery
) {
	"use strict";

	var SIZE_AFTER_MERGE = "The size of the sap.app.dataSources is as expected after mergin.";
	var ADDED_ANNOTATION = "The sap.app dataSource {0} was added correctly.";
	var ALREADY_EXISTING = "The already existing sap.app dataSource {0} was not overridden or changed.";
	var ANNOTATIONS_ARRAY_ORDER = "annotations array order is correct.";

	function assertManifestOData(assert, oDataSources, isDefaultOData, sODataDataSource, isSettingsCreatedByMerge) {
		assert.strictEqual(oDataSources.hasOwnProperty(sODataDataSource), true, ALREADY_EXISTING.replace("{0}", "object equipment"));
		assert.strictEqual(oDataSources[sODataDataSource]["uri"], "/sap/opu/odata/snce/PO_S_SRV;v=2/", ALREADY_EXISTING.replace("{0}", "uri"));
		assert.strictEqual(oDataSources[sODataDataSource].hasOwnProperty("settings"), true, ALREADY_EXISTING.replace("{0}", ""));

		if (isDefaultOData) {
			assert.strictEqual(oDataSources[sODataDataSource]["type"], undefined);
		} else {
			assert.strictEqual(oDataSources[sODataDataSource]["type"], "OData", ALREADY_EXISTING.replace("{0}", "typ"));
		}

		if (!isSettingsCreatedByMerge) {
			assert.strictEqual(oDataSources[sODataDataSource]["settings"]["odataVersion"], "2.0", ALREADY_EXISTING.replace("{0}", "settings odataVersion"));
			assert.strictEqual(oDataSources[sODataDataSource]["settings"]["localUri"], "model/metadata.xml", ALREADY_EXISTING.replace("{0}", "settings localUri"));
			assert.strictEqual(oDataSources[sODataDataSource]["settings"]["maxAge"], 360, ALREADY_EXISTING.replace("{0}", "settings maxAge"));
		}
	}

	function assertAlreadyExistingAnnotationsInManifest(assert, oDataSources, aAlreadyExistedAnnotations) {
		aAlreadyExistedAnnotations.forEach(function(sAnnotation) {
			assert.strictEqual(oDataSources.hasOwnProperty(sAnnotation), true, ALREADY_EXISTING.replace("{0}", "object annotation"));
			assert.strictEqual(oDataSources[sAnnotation]["type"], "ODataAnnotation", ALREADY_EXISTING.replace("{0}", "type"));
			assert.strictEqual(oDataSources[sAnnotation]["uri"], "/" + sAnnotation, ALREADY_EXISTING.replace("{0}", "uri"));
			assert.strictEqual(oDataSources[sAnnotation].hasOwnProperty("settings"), true, ALREADY_EXISTING.replace("{0}", "object settings"));
			assert.strictEqual(oDataSources[sAnnotation]["settings"]["localUri"], "model/" + sAnnotation + ".xml", ALREADY_EXISTING.replace("{0}", "settings localUri"));
		});
	}

	function assertDataSourcesLengthAfterMergeAndNewAnnotations(assert, oDataSources, expectedLenght, aExpectedNewAnnotations) {
		assert.strictEqual(Object.keys(oDataSources).map(function(sDataSource) {return oDataSources[sDataSource];}).length, expectedLenght, SIZE_AFTER_MERGE);
		aExpectedNewAnnotations.forEach(function(sAnnotation) {
			assert.strictEqual(oDataSources.hasOwnProperty(sAnnotation), true, ADDED_ANNOTATION.replace("{0}", "object annotation"));
			assert.strictEqual(oDataSources[sAnnotation]["type"], "ODataAnnotation", ADDED_ANNOTATION.replace("{0}", "type"));
			assert.strictEqual(oDataSources[sAnnotation]["uri"], "/" + sAnnotation, ADDED_ANNOTATION.replace("{0}", "uri"));
		});
	}

	function assertAnnotationArray(assert, aAnnotationArray, aExpectedAnnotationsArray) {
		assert.deepEqual(aAnnotationArray, aExpectedAnnotationsArray, ANNOTATIONS_ARRAY_ORDER);
		assert.strictEqual(aAnnotationArray.length, aExpectedAnnotationsArray.length, "The anntations array has the correct length");
	}

	QUnit.module("applyChange", {
		beforeEach: function () {
			this.oManifest1 = {
				"sap.app": {
					dataSources: {
						equipment: {
							uri: "/sap/opu/odata/snce/PO_S_SRV;v=2/",
							type: "OData",
							settings: {
								odataVersion: "2.0",
								annotations: ["equipmentanno"],
								localUri: "model/metadata.xml",
								maxAge: 360
							 }
						},
						equipmentanno: {
							uri: "/equipmentanno",
							type: "ODataAnnotation",
							settings: {
								localUri: "model/equipmentanno.xml"
							}
						}
					}
				}
			};

			this.oManifest2 = {
				"sap.app": {
					dataSources: {
						equipment: {
							uri: "/sap/opu/odata/snce/PO_S_SRV;v=2/",
							type: "OData",
							settings: {
								odataVersion: "2.0",
								annotations: ["equipmentanno", "customer.existingAnnotation"],
								localUri: "model/metadata.xml",
								maxAge: 360
							 }
						},
						equipmentanno: {
							uri: "/equipmentanno",
							type: "ODataAnnotation",
							settings: {
								localUri: "model/equipmentanno.xml"
							}
						},
						"customer.existingAnnotation": {
							uri: "/customer.existingAnnotation",
							type: "ODataAnnotation",
							settings: {
								localUri: "model/customer.existingAnnotation.xml"
							}
						}
					}
				}
			};

			this.oManifestDataSourcesEmpty = {
				"sap.app": {
					dataSources: {
					}
				}
			};

			this.oChangeNotExistingDataSourceId = new Change({
				changeType: "appdescr_app_AddAnnotationsToOData",
				content: {
					dataSourceId: "notExistingODataDataSource",
					annotations: ["customer.notExistingAnnotation"],
					annotationsInsertPosition: "BEGINNING",
					dataSource: {
						"customer.notExistingAnnotation": {
							uri: "/sap/bc/bsp/sap/BSCBN_ANF_EAM/BSCBN_EQUIPMENT_SRV.anno.XML",
							type: "ODataAnnotation"
						}
					}
				}
			});

			this.oChangeNoDataSourceOrNotSupported = new Change({
				changeType: "appdescr_app_AddAnnotationsToOData",
				content: {
					dataSourceId: "equipment",
					annotations: ["annotations1", "annotations2", "notExistsInChangeDataSourceAndManifestOrNotSupportedType"],
					annotationsInsertPosition: "BEGINNING",
					dataSource: {
						annotations1: {
							uri: "/annotations1",
							type: "ODataAnnotation"
						},
						annotations2: {
							uri: "/annotations2",
							type: "ODataAnnotation"
						}
					}
				}
			});

			this.oChangeAddTwoAnnotationsBeginning = new Change({
				changeType: "appdescr_app_AddAnnotationsToOData",
				content: {
					dataSourceId: "equipment",
					annotations: ["annotation1", "annotation2"],
					annotationsInsertPosition: "BEGINNING",
					dataSource: {
						annotation1: {
							uri: "/annotation1",
							type: "ODataAnnotation"
						},
						annotation2: {
							uri: "/annotation2",
							type: "ODataAnnotation"
						}
					}
				}
			});

			this.oChangeAddOneAnnotationEnd = new Change({
				changeType: "appdescr_app_AddAnnotationsToOData",
				content: {
					dataSourceId: "equipment",
					annotations: ["annotation1"],
					annotationsInsertPosition: "END",
					dataSource: {
						annotation1: {
							uri: "/annotation1",
							type: "ODataAnnotation"
						}
					}
				}
			});

			this.oChangeAddTwoAnnotationsEnd = new Change({
				changeType: "appdescr_app_AddAnnotationsToOData",
				content: {
					dataSourceId: "equipment",
					annotations: ["annotation1", "annotation2"],
					annotationsInsertPosition: "END",
					dataSource: {
						annotation1: {
							uri: "/annotation1",
							type: "ODataAnnotation"
						},
						annotation2: {
							uri: "/annotation2",
							type: "ODataAnnotation"
						}
					}
				}
			});
		}
	}, function() {
		QUnit.test("when calling '_applyChange' by adding new annotation to OData with not defined 'dataSourceId' property => ERROR", function (assert) {
			var oChange = new Change({
				changeType: "appdescr_app_AddAnnotationsToOData",
				content: {
					annotations: ["customer.notExistingAnnotation"],
					annotationsInsertPosition: "BEGINNING",
					dataSource: {
						"customer.notExistingAnnotation": {
							uri: "/sap/bc/bsp/sap/BSCBN_ANF_EAM/BSCBN_EQUIPMENT_SRV.anno.XML",
							type: "ODataAnnotation"
						}
					}
				}
			});

			assert.throws(function() {
				AddAnnotationsToOData.applyChange(this.oManifestDataSourcesEmpty, oChange);
			}, Error("Invalid change format: The mandatory 'dataSourceId' is not defined. Please define the mandatory property 'dataSourceId' and refer it to an existing OData"),
			"throws error that there is no mandatory 'dataSourceId' property defined");
		});

		QUnit.test("when calling '_applyChange' by adding new annotation to an empty manifest (sap.app.dataSources) => ERROR", function (assert) {
			assert.throws(function() {
				AddAnnotationsToOData.applyChange(this.oManifestDataSourcesEmpty, this.oChangeNotExistingDataSourceId);
			}, Error("There are no dataSources in the manifest at all"),
			"throws error that there is no dataSource in the manifest at all");
		});

		QUnit.test("when calling '_applyChange' by adding new annotation to a not existing dataSourceId in manifest => ERROR", function (assert) {
			assert.throws(function() {
				AddAnnotationsToOData.applyChange(this.oManifest1, this.oChangeNotExistingDataSourceId);
			}, Error("There is no dataSource 'notExistingODataDataSource' existing in the manifest. You can only add annotations to already existing dataSources in the manifest"),
			"throws error that the specified dataSource is not existing in the manifest");
		});

		QUnit.test("when calling '_applyChange' by adding new annotation to existing dataSourceId in manifest but type is not correct => ERROR", function (assert) {
			var oManifest = {
				"sap.app": {
					dataSources: {
						notTypeODataDataSource: {
							uri: "/anyType",
							type: "AnyType",
							settings: {
								localUri: "model/data.anyType"
							 }
						}
					}
				}
			};

			var oChange = new Change({
				changeType: "appdescr_app_AddAnnotationsToOData",
				content: {
					dataSourceId: "notTypeODataDataSource",
					annotations: ["customer.annotation"],
					annotationsInsertPosition: "BEGINNING",
					dataSource: {
						"customer.annotation": {
							uri: "/sap/bc/bsp/sap/BSCBN_ANF_EAM/BSCBN_EQUIPMENT_SRV.anno.XML",
							type: "ODataAnnotation"
						}
					}
				}
			});

			assert.throws(function() {
				AddAnnotationsToOData.applyChange(oManifest, oChange);
			}, Error("The dataSource 'notTypeODataDataSource' is existing in the manifest but is not type of 'OData'. The type of the dataSource in the manifest is 'AnyType'"),
			"throws error that the dataSourceId exists but is not type of 'OData'");
		});

		QUnit.test("when calling '_applyChange' by adding new annotations to an existing OData without 'dataSource' object", function (assert) {
			var oChange = new Change({
				changeType: "appdescr_app_AddAnnotationsToOData",
				content: {
					dataSourceId: "equipment",
					annotations: ["annotations1", "/notSupportedType", "annotations2"],
					annotationsInsertPosition: "BEGINNING"
				}
			});

			assert.throws(function() {
				AddAnnotationsToOData.applyChange(this.oManifest1, oChange);
			}, Error("Invalid change format: The mandatory 'dataSource' object is not defined. Please define the mandatory 'dataSource' object"),
			"throws error that the 'dataSource' object is not defined");
		});

		QUnit.test("when calling '_applyChange' by adding new annotations to an existing OData with empty 'dataSource' object => ERROR", function (assert) {
			var oChange = new Change({
				changeType: "appdescr_app_AddAnnotationsToOData",
				content: {
					dataSourceId: "equipment",
					annotations: ["annotations1", "notSupportedType", "annotations2"],
					annotationsInsertPosition: "BEGINNING",
					dataSource: {}
				}
			});

			assert.throws(function() {
				AddAnnotationsToOData.applyChange(this.oManifest1, oChange);
			}, Error("The 'dataSource' object is empty"),
			"throws error that the 'dataSource' object is empty");
		});

		QUnit.test("when calling '_applyChange' by adding new annotations to an existing OData with dataSource object type not 'ODataAnnotation' => ERROR", function (assert) {
			var oChange = new Change({
				changeType: "appdescr_app_AddAnnotationsToOData",
				content: {
					dataSourceId: "equipment",
					annotations: ["annotations1", "annotations2", "annotationTypeNotSupported"],
					annotationsInsertPosition: "BEGINNING",
					dataSource: {
						annotations1: {
							uri: "/annotations1",
							type: "ODataAnnotation"
						},
						annotationTypeNotSupported: {
							uri: "/annotationTypeNotSupported",
							type: "NotTypeODataAnnotation"
						},
						annotations2: {
							uri: "/annotations2",
							type: "ODataAnnotation"
						}
					}
				}
			});

			assert.throws(function() {
				AddAnnotationsToOData.applyChange(this.oManifest1, oChange);
			}, Error("The dataSource annotation 'annotationTypeNotSupported' is type of 'NotTypeODataAnnotation'. Only dataSource annotations of type 'ODataAnnotation' is supported"),
			"throws error that the dataSource annotation is not type of 'ODataAnnotation'");
		});

		QUnit.test("when calling '_applyChange' by adding new annotations to an existing OData without 'annotations' array property => ERROR", function (assert) {
			var oChange = new Change({
				changeType: "appdescr_app_AddAnnotationsToOData",
				content: {
					dataSourceId: "equipment",
					annotationsInsertPosition: "BEGINNING",
					dataSource: {
						"customer.annotation": {
							uri: "/sap/bc/bsp/sap/BSCBN_ANF_EAM/BSCBN_EQUIPMENT_SRV.anno.XML",
							type: "ODataAnnotation"
						}
					}
				}
			});

			assert.throws(function() {
				AddAnnotationsToOData.applyChange(this.oManifest1, oChange);
			}, Error("Invalid change format: The mandatory 'annotations' array property is not defined. Please define the 'annotations' array property"),
			"throws error that the mandatory 'annotations' property is not defined");
		});

		QUnit.test("when calling '_applyChange' by adding new annotations to an existing OData with empty 'annotations' array property => ERROR", function (assert) {
			var oChange = new Change({
				changeType: "appdescr_app_AddAnnotationsToOData",
				content: {
					dataSourceId: "equipment",
					annotations: [],
					annotationsInsertPosition: "BEGINNING",
					dataSource: {
						"customer.annotation": {
							uri: "/sap/bc/bsp/sap/BSCBN_ANF_EAM/BSCBN_EQUIPMENT_SRV.anno.XML",
							type: "ODataAnnotation"
						}
					}
				}
			});

			assert.throws(function() {
				AddAnnotationsToOData.applyChange(this.oManifest1, oChange);
			}, Error("Invalid change format: The 'annotations' array property is empty"),
			"throws error that the 'annotations' property is empty");
		});

		QUnit.test("when calling '_applyChange' by adding new annotations to an existing OData without having the annotation in the 'annotations' array property => ERROR", function (assert) {
			var oChange = new Change({
				changeType: "appdescr_app_AddAnnotationsToOData",
				content: {
					dataSourceId: "equipment",
					annotations: ["annotations1", "annotations2"],
					annotationsInsertPosition: "BEGINNING",
					dataSource: {
						annotations1: {
							uri: "/annotations1",
							type: "ODataAnnotation"
						},
						notInAnnotationsArray: {
							uri: "/notInAnnotationsArray",
							type: "ODataAnnotation"
						},
						annotations2: {
							uri: "/annotations2",
							type: "ODataAnnotation"
						}
					}
				}
			});

			assert.throws(function() {
				AddAnnotationsToOData.applyChange(this.oManifest1, oChange);
			}, Error("The annotation 'notInAnnotationsArray' is not part of 'annotations' array property. Please add the annotation 'notInAnnotationsArray' in the 'annotations' array property"),
			"throws error that the an annotation is defined in 'dataSource' but not defined in the 'annotations' array property");
		});

		QUnit.test("when calling '_applyChange' by adding new annotations to an existing OData with not supported 'annotationsInsertPosition' => ERROR", function (assert) {
			var oChange = new Change({
				changeType: "appdescr_app_AddAnnotationsToOData",
				content: {
					dataSourceId: "equipment",
					annotations: ["annotations1", "annotations2"],
					annotationsInsertPosition: "NotSupportedInsertPosition",
					dataSource: {
						annotations1: {
							uri: "/annotations1",
							type: "ODataAnnotation"
						},
						annotations2: {
							uri: "/annotations2",
							type: "ODataAnnotation"
						}
					}
				}
			});

			assert.throws(function() {
				AddAnnotationsToOData.applyChange(this.oManifest1, oChange);
			}, Error("The defined insert position 'NotSupportedInsertPosition' is not supported. The supported insert positions are: BEGINNING|END"),
			"throws error that the defined 'annotationsInsertPosition' is not supported.");
		});

		QUnit.test("when calling '_applyChange' by adding new annotations to an existing OData with having an annotation in the 'annotations' array property which not exists in the change dataSource property and in the manifest => ERROR", function (assert) {
			assert.throws(function() {
				AddAnnotationsToOData.applyChange(this.oManifest1, this.oChangeNoDataSourceOrNotSupported);
			}, Error("The annotation 'notExistsInChangeDataSourceAndManifestOrNotSupportedType' is part of 'annotations' array property but does not exists in the change property 'dataSource' and in the manifest (or it is not type of 'ODataAnnotation' in the manifest)"),
			"throws error that an annotation which is defined in the annotations array does not exists in the change property 'dataSource' and in the manifest");
		});

		QUnit.test("when calling '_applyChange' by adding an existing annotation which is not of type 'ODataAnnotation' to an existing OData => ERROR", function (assert) {
			var oManifest = {
				"sap.app": {
					dataSources: {
						equipment: {
							uri: "/sap/opu/odata/snce/PO_S_SRV;v=2/",
							type: "OData",
							settings: {
								odataVersion: "2.0",
								annotations: ["equipmentanno"],
								localUri: "model/metadata.xml",
								maxAge: 360
							 }
						},
						equipmentanno: {
							uri: "/sap/bc/bsp/sap/BSCBN_ANF_EAM/BSCBN_EQUIPMENT_SRV.anno.XML",
							type: "ODataAnnotation",
							settings: {
								localUri: "model/annotations.xml"
							}
						},
						notSupportedTypeInManifest: {
							uri: "/sap/bc/bsp/sap/BSCBN_ANF_EAM/BSCBN_EQUIPMENT_SRV.anno.XML",
							type: "NotSupportedType",
							settings: {
								localUri: "model/annotations.xml"
							}
						}
					}
				}
			};

			assert.throws(function() {
				AddAnnotationsToOData.applyChange(oManifest, this.oChangeNoDataSourceOrNotSupported);
			}, Error("The annotation 'notExistsInChangeDataSourceAndManifestOrNotSupportedType' is part of 'annotations' array property but does not exists in the change property 'dataSource' and in the manifest (or it is not type of 'ODataAnnotation' in the manifest)"),
			"throws error that an annotation which is defined in the annotations array does exists in the manifest but is not of type 'ODataAnnotation'");
		});

		QUnit.test("when calling '_applyChange' by adding a single annotation to an existing OData at the beginning => SUCCESS", function (assert) {
			var oChange = new Change({
				changeType: "appdescr_app_AddAnnotationsToOData",
				content: {
					dataSourceId: "equipment",
					annotations: ["annotation1"],
					annotationsInsertPosition: "BEGINNING",
					dataSource: {
						annotation1: {
							uri: "/annotation1",
							type: "ODataAnnotation"
						}
					}
				}
			});

			var oNewManifest = AddAnnotationsToOData.applyChange(this.oManifest1, oChange);

			assertManifestOData(assert, oNewManifest["sap.app"]["dataSources"], false, "equipment", false);
			assertAlreadyExistingAnnotationsInManifest(assert, oNewManifest["sap.app"]["dataSources"], ["equipmentanno"]);
			assertDataSourcesLengthAfterMergeAndNewAnnotations(assert, oNewManifest["sap.app"]["dataSources"], 3, ["annotation1"]);
			assertAnnotationArray(assert, oNewManifest["sap.app"]["dataSources"]["equipment"]["settings"]["annotations"], ["annotation1", "equipmentanno"]);
		});

		QUnit.test("when calling '_applyChange' by adding a single annotation to an existing OData at the beginning without setting 'annotationsInsertPosition' (default: 'BEGINNING') => SUCCESS", function (assert) {
			var oChange = new Change({
				changeType: "appdescr_app_AddAnnotationsToOData",
				content: {
					dataSourceId: "equipment",
					annotations: ["annotation1"],
					dataSource: {
						annotation1: {
							uri: "/annotation1",
							type: "ODataAnnotation"
						}
					}
				}
			});

			var oNewManifest = AddAnnotationsToOData.applyChange(this.oManifest1, oChange);

			assertManifestOData(assert, oNewManifest["sap.app"]["dataSources"], false, "equipment", false);
			assertAlreadyExistingAnnotationsInManifest(assert, oNewManifest["sap.app"]["dataSources"], ["equipmentanno"]);
			assertDataSourcesLengthAfterMergeAndNewAnnotations(assert, oNewManifest["sap.app"]["dataSources"], 3, ["annotation1"]);
			assertAnnotationArray(assert, oNewManifest["sap.app"]["dataSources"]["equipment"]["settings"]["annotations"], ["annotation1", "equipmentanno"]);
		});

		QUnit.test("when calling '_applyChange' by adding a single annotation to an existing OData at the end => SUCCESS", function (assert) {
			var oNewManifest = AddAnnotationsToOData.applyChange(this.oManifest1, this.oChangeAddOneAnnotationEnd);

			assertManifestOData(assert, oNewManifest["sap.app"]["dataSources"], false, "equipment", false);
			assertAlreadyExistingAnnotationsInManifest(assert, oNewManifest["sap.app"]["dataSources"], ["equipmentanno"]);
			assertDataSourcesLengthAfterMergeAndNewAnnotations(assert, oNewManifest["sap.app"]["dataSources"], 3, ["annotation1"]);
			assertAnnotationArray(assert, oNewManifest["sap.app"]["dataSources"]["equipment"]["settings"]["annotations"], ["equipmentanno", "annotation1"]);
		});

		QUnit.test("when calling '_applyChange' by adding several annotations to an existing OData at the beginning => SUCCESS", function (assert) {
			var oNewManifest = AddAnnotationsToOData.applyChange(this.oManifest1, this.oChangeAddTwoAnnotationsBeginning);

			assertManifestOData(assert, oNewManifest["sap.app"]["dataSources"], false, "equipment", false);
			assertAlreadyExistingAnnotationsInManifest(assert, oNewManifest["sap.app"]["dataSources"], ["equipmentanno"]);
			assertDataSourcesLengthAfterMergeAndNewAnnotations(assert, oNewManifest["sap.app"]["dataSources"], 4, ["annotation1", "annotation2"]);
			assertAnnotationArray(assert, oNewManifest["sap.app"]["dataSources"]["equipment"]["settings"]["annotations"], ["annotation1", "annotation2", "equipmentanno"]);
		});

		QUnit.test("when calling '_applyChange' by adding several annotations to an existing OData at the beginning without setting 'annotationsInsertPosition' (default: 'BEGINNING') => SUCCESS", function (assert) {
			var oChange = new Change({
				changeType: "appdescr_app_AddAnnotationsToOData",
				content: {
					dataSourceId: "equipment",
					annotations: ["annotation1", "annotation2"],
					dataSource: {
						annotation1: {
							uri: "/annotation1",
							type: "ODataAnnotation"
						},
						annotation2: {
							uri: "/annotation2",
							type: "ODataAnnotation"
						}
					}
				}
			});

			var oNewManifest = AddAnnotationsToOData.applyChange(this.oManifest1, oChange);

			assertManifestOData(assert, oNewManifest["sap.app"]["dataSources"], false, "equipment", false);
			assertAlreadyExistingAnnotationsInManifest(assert, oNewManifest["sap.app"]["dataSources"], ["equipmentanno"]);
			assertDataSourcesLengthAfterMergeAndNewAnnotations(assert, oNewManifest["sap.app"]["dataSources"], 4, ["annotation1", "annotation2"]);
			assertAnnotationArray(assert, oNewManifest["sap.app"]["dataSources"]["equipment"]["settings"]["annotations"], ["annotation1", "annotation2", "equipmentanno"]);
		});

		QUnit.test("when calling '_applyChange' by adding several annotations to an existing OData at the end => SUCCESS", function (assert) {
			var oNewManifest = AddAnnotationsToOData.applyChange(this.oManifest1, this.oChangeAddTwoAnnotationsEnd);

			assertManifestOData(assert, oNewManifest["sap.app"]["dataSources"], false, "equipment", false);
			assertAlreadyExistingAnnotationsInManifest(assert, oNewManifest["sap.app"]["dataSources"], ["equipmentanno"]);
			assertDataSourcesLengthAfterMergeAndNewAnnotations(assert, oNewManifest["sap.app"]["dataSources"], 4, ["annotation1", "annotation2"]);
			assertAnnotationArray(assert, oNewManifest["sap.app"]["dataSources"]["equipment"]["settings"]["annotations"], ["equipmentanno", "annotation1", "annotation2"]);
		});

		QUnit.test("when calling '_applyChange' by adding several annotations to an existing OData and reference to an existing ODataAnnotation in the base desriptor at the end => SUCCESS", function (assert) {
			var oChange = new Change({
				changeType: "appdescr_app_AddAnnotationsToOData",
				content: {
					dataSourceId: "equipment",
					annotations: ["annotation1", "annotation2", "customer.existingAnnotation"],
					annotationsInsertPosition: "END",
					dataSource: {
						annotation1: {
							uri: "/annotation1",
							type: "ODataAnnotation"
						},
						annotation2: {
							uri: "/annotation2",
							type: "ODataAnnotation"
						}
					}
				}
			});

			var oNewManifest = AddAnnotationsToOData.applyChange(this.oManifest2, oChange);

			assertManifestOData(assert, oNewManifest["sap.app"]["dataSources"], false, "equipment", false);
			assertAlreadyExistingAnnotationsInManifest(assert, oNewManifest["sap.app"]["dataSources"], ["equipmentanno", "customer.existingAnnotation"]);
			assertDataSourcesLengthAfterMergeAndNewAnnotations(assert, oNewManifest["sap.app"]["dataSources"], 5, ["annotation1", "annotation2"]);
			assertAnnotationArray(assert, oNewManifest["sap.app"]["dataSources"]["equipment"]["settings"]["annotations"], ["equipmentanno", "annotation1", "annotation2", "customer.existingAnnotation"]);
		});

		QUnit.test("when calling '_applyChange' by adding several annotations to an existing OData and reference to an existing ODataAnnotation in the base desriptor at the beginning => SUCCESS", function (assert) {
			var oChange = new Change({
				changeType: "appdescr_app_AddAnnotationsToOData",
				content: {
					dataSourceId: "equipment",
					annotations: ["customer.existingAnnotation", "annotation1", "annotation2"],
					annotationsInsertPosition: "BEGINNING",
					dataSource: {
						annotation1: {
							uri: "/annotation1",
							type: "ODataAnnotation"
						},
						annotation2: {
							uri: "/annotation2",
							type: "ODataAnnotation"
						}
					}
				}
			});

			var oNewManifest = AddAnnotationsToOData.applyChange(this.oManifest2, oChange);

			assertManifestOData(assert, oNewManifest["sap.app"]["dataSources"], false, "equipment", false);
			assertAlreadyExistingAnnotationsInManifest(assert, oNewManifest["sap.app"]["dataSources"], ["equipmentanno", "customer.existingAnnotation"]);
			assertDataSourcesLengthAfterMergeAndNewAnnotations(assert, oNewManifest["sap.app"]["dataSources"], 5, ["annotation1", "annotation2"]);
			assertAnnotationArray(assert, oNewManifest["sap.app"]["dataSources"]["equipment"]["settings"]["annotations"], ["customer.existingAnnotation", "annotation1", "annotation2", "equipmentanno"]);
		});

		QUnit.test("when calling '_applyChange' by adding several annotations to an existing OData without having an 'annotations' property => SUCCESS", function (assert) {
			var oManifest = {
				"sap.app": {
					dataSources: {
						equipment: {
							uri: "/sap/opu/odata/snce/PO_S_SRV;v=2/",
							type: "OData",
							settings: {
								odataVersion: "2.0",
								localUri: "model/metadata.xml",
								maxAge: 360
							 }
						}
					}
				}
			};

			var oNewManifest = AddAnnotationsToOData.applyChange(oManifest, this.oChangeAddTwoAnnotationsBeginning);

			assertManifestOData(assert, oNewManifest["sap.app"]["dataSources"], false, "equipment", false);
			assertAlreadyExistingAnnotationsInManifest(assert, oNewManifest["sap.app"]["dataSources"], []);
			assertDataSourcesLengthAfterMergeAndNewAnnotations(assert, oNewManifest["sap.app"]["dataSources"], 3, ["annotation1", "annotation2"]);
			assertAnnotationArray(assert, oNewManifest["sap.app"]["dataSources"]["equipment"]["settings"]["annotations"], ["annotation1", "annotation2"]);
		});

		QUnit.test("when calling '_applyChange' by adding several annotations to an existing OData with empty 'annotations' property => SUCCESS", function (assert) {
			var oManifest = {
				"sap.app": {
					dataSources: {
						equipment: {
							uri: "/sap/opu/odata/snce/PO_S_SRV;v=2/",
							type: "OData",
							settings: {
								odataVersion: "2.0",
								annotations: [],
								localUri: "model/metadata.xml",
								maxAge: 360
							 }
						}
					}
				}
			};

			var oNewManifest = AddAnnotationsToOData.applyChange(oManifest, this.oChangeAddTwoAnnotationsEnd);

			assertManifestOData(assert, oNewManifest["sap.app"]["dataSources"], false, "equipment", false);
			assertAlreadyExistingAnnotationsInManifest(assert, oNewManifest["sap.app"]["dataSources"], []);
			assertDataSourcesLengthAfterMergeAndNewAnnotations(assert, oNewManifest["sap.app"]["dataSources"], 3, ["annotation1", "annotation2"]);
			assertAnnotationArray(assert, oNewManifest["sap.app"]["dataSources"]["equipment"]["settings"]["annotations"], ["annotation1", "annotation2"]);
		});

		QUnit.test("when calling '_applyChange' by adding an annotations to an existing OData. The existing OData in the manifest does not have 'type' property (default: OData) => SUCCESS", function (assert) {
			var oManifest = {
				"sap.app": {
					dataSources: {
						equipment: {
							uri: "/sap/opu/odata/snce/PO_S_SRV;v=2/",
							settings: {
								odataVersion: "2.0",
								annotations: ["equipmentanno"],
								localUri: "model/metadata.xml",
								maxAge: 360
							 }
						},
						equipmentanno: {
							uri: "/equipmentanno",
							type: "ODataAnnotation",
							settings: {
								localUri: "model/equipmentanno.xml"
							}
						}
					}
				}
			};

			var oNewManifest = AddAnnotationsToOData.applyChange(oManifest, this.oChangeAddOneAnnotationEnd);

			assertManifestOData(assert, oNewManifest["sap.app"]["dataSources"], true, "equipment", false);
			assertAlreadyExistingAnnotationsInManifest(assert, oNewManifest["sap.app"]["dataSources"], ["equipmentanno"]);
			assertDataSourcesLengthAfterMergeAndNewAnnotations(assert, oNewManifest["sap.app"]["dataSources"], 3, ["annotation1"]);
			assertAnnotationArray(assert, oNewManifest["sap.app"]["dataSources"]["equipment"]["settings"]["annotations"], ["equipmentanno", "annotation1"]);
		});

		QUnit.test("when calling '_applyChange' by adding new annotations to an existing OData without having 'settings' object and 'annotations' property => SUCCESS", function (assert) {
			var oManifest = {
				"sap.app": {
					dataSources: {
						equipment: {
							uri: "/sap/opu/odata/snce/PO_S_SRV;v=2/",
							type: "OData"
						}
					}
				}
			};

			var oNewManifest = AddAnnotationsToOData.applyChange(oManifest, this.oChangeAddTwoAnnotationsBeginning);

			assertManifestOData(assert, oNewManifest["sap.app"]["dataSources"], false, "equipment", true);
			assertAlreadyExistingAnnotationsInManifest(assert, oNewManifest["sap.app"]["dataSources"], []);
			assertDataSourcesLengthAfterMergeAndNewAnnotations(assert, oNewManifest["sap.app"]["dataSources"], 3, ["annotation1", "annotation2"]);
			assertAnnotationArray(assert, oNewManifest["sap.app"]["dataSources"]["equipment"]["settings"]["annotations"], ["annotation1", "annotation2"]);
		});
	});

	QUnit.done(function() {
		jQuery("#qunit-fixture").hide();
	});
});