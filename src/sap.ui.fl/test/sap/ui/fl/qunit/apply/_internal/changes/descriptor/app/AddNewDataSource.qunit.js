/* global QUnit */

sap.ui.define([
	"sap/ui/fl/apply/_internal/changes/descriptor/app/AddNewDataSource",
	"sap/ui/fl/apply/_internal/flexObjects/AppDescriptorChange",
	"sap/ui/fl/Layer"
],
function(
	AddNewDataSource,
	AppDescriptorChange,
	Layer
) {
	"use strict";

	QUnit.module("applyChange", {
		beforeEach() {
			this.oManifestDataSourcesEmpty = {
				"sap.app": {
					dataSources: {
					}
				}
			};

			this.oManifestWithExistingDataSources = {
				"sap.app": {
					dataSources: {
						"customer.equipment": {
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

			this.oManifestWithExistingDataSourcesAndAnnotations = {
				"sap.app": {
					dataSources: {
						"customer.equipment": {
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
						},
						existingInManifest: {
							uri: "/existingInManifest",
							type: "ODataAnnotation",
							settings: {
								localUri: "model/existingInManifest.xml"
							}
						}
					}
				}
			};
		}
	}, function() {
		QUnit.test("when calling '_applyChange' by adding new data source with more then two root properties", function(assert) {
			const oChange = new AppDescriptorChange({
				flexObjectMetadata: {
					changeType: "appdescr_app_addNewDataSource"
				},
				layer: Layer.CUSTOMER,
				content: {
					dataSource: {
						"customer.fancy_dataSource": {
							uri: "/sap/opu/odata/snce/PO_S_SRV;v=2/",
							type: "OData",
							settings: {
								odataVersion: "2.0"
							}
						}
					},
					otherRootProperty: {}
				}
			});

			assert.throws(function() {
				AddNewDataSource.applyChange(this.oManifestDataSourcesEmpty, oChange);
			}, Error("It is not allowed to add more than one object under change object 'content'."),
			"throws error that there are more then two root properties");
		});

		QUnit.test("when calling '_applyChange' by adding new data source with no content", function(assert) {
			const oChange = new AppDescriptorChange({
				flexObjectMetadata: {
					changeType: "appdescr_app_addNewDataSource"
				},
				layer: Layer.CUSTOMER,
				content: {	}
			});

			assert.throws(function() {
				AddNewDataSource.applyChange(this.oManifestDataSourcesEmpty, oChange);
			}, Error("The change object 'content' cannot be empty. Please provide the necessary property, as outlined in the change schema for 'appdescr_app_addNewDataSource'."),
			"throws error that there are no content");
		});

		QUnit.test("when calling '_applyChange' by adding new data source with wrong root property", function(assert) {
			const oChange = new AppDescriptorChange({
				flexObjectMetadata: {
					changeType: "appdescr_app_addNewDataSource"
				},
				layer: Layer.CUSTOMER,
				content: {
					notAcceptedRootProperty: {
						"customer.fancy_dataSource": {
							uri: "/sap/opu/odata/snce/PO_S_SRV;v=2/",
							type: "OData",
							settings: {
								odataVersion: "2.0"
							}
						}
					}
				}
			});

			assert.throws(function() {
				AddNewDataSource.applyChange(this.oManifestDataSourcesEmpty, oChange);
			}, Error("The provided property 'notAcceptedRootProperty' is not supported. Supported property for change 'appdescr_app_addNewDataSource' is 'dataSource'."),
			"throws error that there is no mandatory 'dataSource' property defined");
		});

		QUnit.test("when calling '_applyChange' by adding more then two data sources", function(assert) {
			const oChange = new AppDescriptorChange({
				flexObjectMetadata: {
					changeType: "appdescr_app_addNewDataSource"
				},
				layer: Layer.CUSTOMER,
				content: {
					dataSource: {
						"customer.fancy_dataSource": {
							uri: "/sap/opu/odata/snce/PO_S_SRV;v=2/",
							type: "OData"
						},
						"customer.fancy_dataSource2": {
							uri: "/sap/opu/odata/snce/PO_S_SRV;v=2/"
						},
						"customer.fancy_dataSource3": {
							uri: "/sap/opu/odata/snce/PO_S_SRV;v=2/"
						}
					}
				}
			});

			assert.throws(function() {
				AddNewDataSource.applyChange(this.oManifestDataSourcesEmpty, oChange);
			}, Error("It is not allowed to add more than two data sources to manifest."),
			"throws error that more then two data sources are not allowed to be added");
		});

		QUnit.test("when calling '_applyChange' by not adding a data source", function(assert) {
			const oChange = new AppDescriptorChange({
				flexObjectMetadata: {
					changeType: "appdescr_app_addNewDataSource"
				},
				layer: Layer.CUSTOMER,
				content: {
					dataSource: { }
				}
			});

			assert.throws(function() {
				AddNewDataSource.applyChange(this.oManifestDataSourcesEmpty, oChange);
			}, Error("There is no dataSource provided. Please provide an dataSource."),
			"throws error that no data source was added");
		});

		QUnit.test("when calling '_applyChange' by adding a dataSource with empty name", function(assert) {
			const oChange = new AppDescriptorChange({
				flexObjectMetadata: {
					changeType: "appdescr_app_addNewDataSource"
				},
				layer: Layer.CUSTOMER,
				content: {
					dataSource: {
						"": {
							uri: "/sap/opu/odata/snce/PO_S_SRV;v=2/",
							type: "OData"
						}
					}
				}
			});

			assert.throws(function() {
				AddNewDataSource.applyChange(this.oManifestDataSourcesEmpty, oChange);
			}, Error("The ID of your dataSource is empty."),
			"throws error that empty data source name is not allwoed");
		});

		QUnit.test("when calling '_applyChange' by adding a dataSource without mandatory property", function(assert) {
			const oChange = new AppDescriptorChange({
				flexObjectMetadata: {
					changeType: "appdescr_app_addNewDataSource"
				},
				layer: Layer.CUSTOMER,
				content: {
					dataSource: {
						"customer.fancy_dataSource": {
							type: "OData"
						}
					}
				}
			});

			assert.throws(function() {
				AddNewDataSource.applyChange(this.oManifestDataSourcesEmpty, oChange);
			}, Error("Mandatory property 'uri' is missing. Mandatory property is uri."),
			"throws error that mandatory parameter is missing");
		});

		QUnit.test("when calling '_applyChange' by adding two dataSources without one having mandatory property", function(assert) {
			const oChange = new AppDescriptorChange({
				flexObjectMetadata: {
					changeType: "appdescr_app_addNewDataSource"
				},
				layer: Layer.CUSTOMER,
				content: {
					dataSource: {
						"customer.fancy_dataSource": {
							uri: "/sap/opu/odata/snce/PO_S_SRV;v=2/",
							type: "OData"
						},
						"customer.fancy_annotation": {
							type: "ODataAnnotation"
						}
					}
				}
			});

			assert.throws(function() {
				AddNewDataSource.applyChange(this.oManifestDataSourcesEmpty, oChange);
			}, Error("Mandatory property 'uri' is missing. Mandatory property is uri."),
			"throws error that mandatory parameter is missing");
		});

		QUnit.test("when calling '_applyChange' by adding a dataSource which does not have supported properties", function(assert) {
			const oChange = new AppDescriptorChange({
				flexObjectMetadata: {
					changeType: "appdescr_app_addNewDataSource"
				},
				layer: Layer.CUSTOMER,
				content: {
					dataSource: {
						"customer.fancy_dataSource": {
							uri: "/sap/opu/odata/snce/PO_S_SRV;v=2/",
							notSupported: "notSupported",
							type: "OData"
						}
					}
				}
			});

			assert.throws(function() {
				AddNewDataSource.applyChange(this.oManifestDataSourcesEmpty, oChange);
			}, Error("Property notSupported is not supported. Supported properties are uri|type|settings|customType."),
			"throws error that property is not supported");
		});

		QUnit.test("when calling '_applyChange' by adding a dataSource with wrong parameter type", function(assert) {
			const oChange = new AppDescriptorChange({
				flexObjectMetadata: {
					changeType: "appdescr_app_addNewDataSource"
				},
				layer: Layer.CUSTOMER,
				content: {
					dataSource: {
						"customer.fancy_dataSource": {
							uri: "/sap/opu/odata/snce/PO_S_SRV;v=2/",
							type: 1
						}
					}
				}
			});

			assert.throws(function() {
				AddNewDataSource.applyChange(this.oManifestDataSourcesEmpty, oChange);
			}, Error("The property 'type' is type of 'number'. Supported type for property 'type' is 'string'"),
			"throws error that property is not having the correct type");
		});

		QUnit.test("when calling '_applyChange' by adding a dataSource which does not match to regex for type", function(assert) {
			const oChange = new AppDescriptorChange({
				flexObjectMetadata: {
					changeType: "appdescr_app_addNewDataSource"
				},
				layer: Layer.CUSTOMER,
				content: {
					dataSource: {
						"customer.fancy_dataSource": {
							uri: "/sap/opu/odata/snce/PO_S_SRV;v=2/",
							type: "NotSupportedType"
						}
					}
				}
			});

			assert.throws(function() {
				AddNewDataSource.applyChange(this.oManifestDataSourcesEmpty, oChange);
			}, Error("The property has disallowed values. Supported values for 'type' should adhere to regular expression /^(OData|ODataAnnotation|INA|XML|JSON|FHIR|WebSocket|http)$/."),
			"throws error that property is not matching to regex");
		});

		QUnit.test("when calling '_applyChange' by adding a dataSource which does not match to regex for custom", function(assert) {
			const oChange = new AppDescriptorChange({
				flexObjectMetadata: {
					changeType: "appdescr_app_addNewDataSource"
				},
				layer: Layer.CUSTOMER,
				content: {
					dataSource: {
						"customer.fancy_dataSource": {
							uri: "/sap/opu/odata/snce/PO_S_SRV;v=2/",
							customType: true
						}
					}
				}
			});

			assert.throws(function() {
				AddNewDataSource.applyChange(this.oManifestDataSourcesEmpty, oChange);
			}, Error("The property has disallowed values. Supported values for 'customType' should adhere to regular expression /^false$/."),
			"throws error that property is not matching to regex");
		});

		QUnit.test("when calling '_applyChange' by adding a dataSource without namspace layer", function(assert) {
			const oChange = new AppDescriptorChange({
				flexObjectMetadata: {
					changeType: "appdescr_app_addNewDataSource"
				},
				content: {
					dataSource: {
						"customer.fancy_dataSource": {
							uri: "/sap/opu/odata/snce/PO_S_SRV;v=2/",
							type: "OData"
						}
					}
				}
			});

			assert.throws(function() {
				AddNewDataSource.applyChange(this.oManifestDataSourcesEmpty, oChange);
			}, Error("Mandatory layer parameter is not provided."),
			"throws error that layer is missing in change content");
		});

		QUnit.test("when calling '_applyChange' by adding a dataSource with not existing layer", function(assert) {
			const oChange = new AppDescriptorChange({
				flexObjectMetadata: {
					changeType: "appdescr_app_addNewDataSource"
				},
				layer: "NotExisting",
				content: {
					dataSource: {
						"customer.fancy_dataSource": {
							uri: "/sap/opu/odata/snce/PO_S_SRV;v=2/",
							type: "OData"
						}
					}
				}
			});

			assert.throws(function() {
				AddNewDataSource.applyChange(this.oManifestDataSourcesEmpty, oChange);
			}, Error("Layer NotExisting not supported."),
			"throws error that provided layer is not supported");
		});

		QUnit.test("when calling '_applyChange' by adding a dataSource with not compliance layer", function(assert) {
			const oChange = new AppDescriptorChange({
				flexObjectMetadata: {
					changeType: "appdescr_app_addNewDataSource"
				},
				layer: Layer.PARTNER,
				content: {
					dataSource: {
						noPrefixDataSource: {
							uri: "/sap/opu/odata/snce/PO_S_SRV;v=2/",
							type: "OData"
						}
					}
				}
			});

			assert.throws(function() {
				AddNewDataSource.applyChange(this.oManifestDataSourcesEmpty, oChange);
			}, Error("Id noPrefixDataSource must start with partner."),
			"throws error that the data source must start with a specific prefix");
		});

		QUnit.test("when calling '_applyChange' by adding a dataSource with not compliance layer", function(assert) {
			const oChange = new AppDescriptorChange({
				flexObjectMetadata: {
					changeType: "appdescr_app_addNewDataSource"
				},
				layer: Layer.VENDOR,
				content: {
					dataSource: {
						"customer.fancy_dataSource": {
							uri: "/sap/opu/odata/snce/PO_S_SRV;v=2/",
							type: "OData"
						}
					}
				}
			});

			assert.throws(function() {
				AddNewDataSource.applyChange(this.oManifestDataSourcesEmpty, oChange);
			}, Error("Id customer.fancy_dataSource must not start with reserved customer."),
			"throws error that the data source must not start with a specific prefix");
		});

		QUnit.test("when calling '_applyChange' by adding a dataSources which already exist in manifest", function(assert) {
			const oChange = new AppDescriptorChange({
				flexObjectMetadata: {
					changeType: "appdescr_app_addNewDataSource"
				},
				layer: Layer.CUSTOMER,
				content: {
					dataSource: {
						"customer.equipment": {
							uri: "/sap/opu/odata/snce/PO_S_SRV;v=2/"
						}
					}
				}
			});

			assert.throws(function() {
				AddNewDataSource.applyChange(this.oManifestWithExistingDataSources, oChange);
			}, Error("There is already a dataSource 'customer.equipment' existing in the manifest."),
			"throws error that the data source must not start with a specific prefix");
		});

		QUnit.test("when calling '_applyChange' by adding a dataSources of type OData (default)", function(assert) {
			const oChange = new AppDescriptorChange({
				flexObjectMetadata: {
					changeType: "appdescr_app_addNewDataSource"
				},
				layer: Layer.CUSTOMER,
				content: {
					dataSource: {
						"customer.fancy_dataSource": {
							uri: "/sap/opu/odata/snce/PO_S_SRV;v=2/"
						}
					}
				}
			});

			const oNewManifest = AddNewDataSource.applyChange(this.oManifestDataSourcesEmpty, oChange);
			assert.equal(Object.keys(oNewManifest["sap.app"].dataSources).length, 1, "data source count is correctly");
			assert.deepEqual(oNewManifest["sap.app"].dataSources, {
				"customer.fancy_dataSource": {
					uri: "/sap/opu/odata/snce/PO_S_SRV;v=2/"
				}
			}, "data source is added correctly");
		});

		QUnit.test("when calling '_applyChange' by adding a dataSource of type OData", function(assert) {
			const oChange = new AppDescriptorChange({
				flexObjectMetadata: {
					changeType: "appdescr_app_addNewDataSource"
				},
				layer: Layer.CUSTOMER,
				content: {
					dataSource: {
						"customer.fancy_dataSource": {
							uri: "/sap/opu/odata/snce/PO_S_SRV;v=2/",
							type: "OData"
						}
					}
				}
			});

			const oNewManifest = AddNewDataSource.applyChange(this.oManifestWithExistingDataSources, oChange);
			assert.equal(Object.keys(oNewManifest["sap.app"].dataSources).length, 3, "data source count is correctly");
			assert.deepEqual(oNewManifest["sap.app"].dataSources, {
				"customer.fancy_dataSource": {
					uri: "/sap/opu/odata/snce/PO_S_SRV;v=2/",
					type: "OData"
				},
				"customer.equipment": {
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
			}, "data source is added correctly");
		});

		QUnit.test("when calling '_applyChange' by adding two dataSources one of type OData other one of type ODataAnnotation", function(assert) {
			const oChange = new AppDescriptorChange({
				flexObjectMetadata: {
					changeType: "appdescr_app_addNewDataSource"
				},
				layer: Layer.CUSTOMER,
				content: {
					dataSource: {
						"customer.fancy_dataSource": {
							uri: "/sap/opu/odata/snce/PO_S_SRV;v=2/",
							type: "OData",
							settings: {
								annotations: ["customer.fancy_annotation"]
							}
						},
						"customer.fancy_annotation": {
							uri: "/sap/bc/bsp/sap/BSCBN_ANF_EAM/BSCBN_EQUIPMENT_SRV.anno.XML",
							type: "ODataAnnotation"
						}
					}
				}
			});

			const oNewManifest = AddNewDataSource.applyChange(this.oManifestWithExistingDataSources, oChange);
			assert.equal(Object.keys(oNewManifest["sap.app"].dataSources).length, 4, "data source count is correctly");
			assert.deepEqual(oNewManifest["sap.app"].dataSources, {
				"customer.fancy_dataSource": {
					uri: "/sap/opu/odata/snce/PO_S_SRV;v=2/",
					type: "OData",
					settings: {
						annotations: ["customer.fancy_annotation"]
					}
				},
				"customer.fancy_annotation": {
					uri: "/sap/bc/bsp/sap/BSCBN_ANF_EAM/BSCBN_EQUIPMENT_SRV.anno.XML",
					type: "ODataAnnotation"
				},
				"customer.equipment": {
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
			}, "data source is added correctly");
		});

		QUnit.test("when calling '_applyChange' by adding two dataSources one of type http other one of type ODataAnnotation", function(assert) {
			const oChange = new AppDescriptorChange({
				flexObjectMetadata: {
					changeType: "appdescr_app_addNewDataSource"
				},
				layer: Layer.CUSTOMER,
				content: {
					dataSource: {
						"customer.fancy_dataSource": {
							uri: "/sap/opu/odata/snce/PO_S_SRV;v=2/",
							type: "http"
						},
						"customer.fancy_annotation": {
							uri: "/sap/bc/bsp/sap/BSCBN_ANF_EAM/BSCBN_EQUIPMENT_SRV.anno.XML",
							type: "ODataAnnotation"
						}
					}
				}
			});

			assert.throws(function() {
				AddNewDataSource.applyChange(this.oManifestWithExistingDataSources, oChange);
			}, Error("When adding two data sources it is only allwoed to add a data source with type 'OData' and the other one must be of type 'ODataAnnotation'."),
			"throws error that when adding two data source one of them needs to be of type OData and the other of type ODataAnnotation");
		});

		QUnit.test("when calling '_applyChange' by adding two dataSources one of type OData other one of type ODataAnnotation but without referenced by OData in the annotations array", function(assert) {
			const oChange = new AppDescriptorChange({
				flexObjectMetadata: {
					changeType: "appdescr_app_addNewDataSource"
				},
				layer: Layer.CUSTOMER,
				content: {
					dataSource: {
						"customer.fancy_dataSource": {
							uri: "/sap/opu/odata/snce/PO_S_SRV;v=2/"
						},
						"customer.fancy_annotation": {
							uri: "/sap/bc/bsp/sap/BSCBN_ANF_EAM/BSCBN_EQUIPMENT_SRV.anno.XML",
							type: "ODataAnnotation"
						}
					}
				}
			});

			assert.throws(function() {
				AddNewDataSource.applyChange(this.oManifestWithExistingDataSources, oChange);
			}, Error("Data source 'customer.fancy_dataSource' does not include annotation 'customer.fancy_annotation' under 'settings/annotations' array."),
			"throws error that the settings property is missing in the data source");
		});

		QUnit.test("when calling '_applyChange' by adding two dataSources one of type OData other one of type ODataAnnotation but property annotations does not exist", function(assert) {
			const oChange = new AppDescriptorChange({
				flexObjectMetadata: {
					changeType: "appdescr_app_addNewDataSource"
				},
				layer: Layer.CUSTOMER,
				content: {
					dataSource: {
						"customer.fancy_dataSource": {
							uri: "/sap/opu/odata/snce/PO_S_SRV;v=2/",
							settings: {}
						},
						"customer.fancy_annotation": {
							uri: "/sap/bc/bsp/sap/BSCBN_ANF_EAM/BSCBN_EQUIPMENT_SRV.anno.XML",
							type: "ODataAnnotation"
						}
					}
				}
			});

			assert.throws(function() {
				AddNewDataSource.applyChange(this.oManifestWithExistingDataSources, oChange);
			}, Error("Data source 'customer.fancy_dataSource' does not include annotation 'customer.fancy_annotation' under 'settings/annotations' array."),
			"throws error that the array property annotations is missing");
		});

		QUnit.test("when calling '_applyChange' by adding two dataSources one of type OData other one of type ODataAnnotation but property annotations is of wrong type", function(assert) {
			const oChange = new AppDescriptorChange({
				flexObjectMetadata: {
					changeType: "appdescr_app_addNewDataSource"
				},
				layer: Layer.CUSTOMER,
				content: {
					dataSource: {
						"customer.fancy_dataSource": {
							uri: "/sap/opu/odata/snce/PO_S_SRV;v=2/",
							settings: {
								annotations: {}
							}
						},
						"customer.fancy_annotation": {
							uri: "/sap/bc/bsp/sap/BSCBN_ANF_EAM/BSCBN_EQUIPMENT_SRV.anno.XML",
							type: "ODataAnnotation"
						}
					}
				}
			});

			assert.throws(function() {
				AddNewDataSource.applyChange(this.oManifestWithExistingDataSources, oChange);
			}, Error("Property 'annotations' must be of type 'array'."),
			"throws error that the array property annotations is of wrong type");
		});

		QUnit.test("when calling '_applyChange' by adding two dataSources one of type OData other one of type ODataAnnotation but with not existing annotation in the annotations array", function(assert) {
			const oChange = new AppDescriptorChange({
				flexObjectMetadata: {
					changeType: "appdescr_app_addNewDataSource"
				},
				layer: Layer.CUSTOMER,
				content: {
					dataSource: {
						"customer.fancy_dataSource": {
							uri: "/sap/opu/odata/snce/PO_S_SRV;v=2/",
							settings: {
								annotations: ["notExistingInChange"]
							 }
						},
						"customer.fancy_annotation": {
							uri: "/sap/bc/bsp/sap/BSCBN_ANF_EAM/BSCBN_EQUIPMENT_SRV.anno.XML",
							type: "ODataAnnotation"
						}
					}
				}
			});

			assert.throws(function() {
				AddNewDataSource.applyChange(this.oManifestWithExistingDataSources, oChange);
			}, Error("Data source 'customer.fancy_dataSource' does not include annotation 'customer.fancy_annotation' under 'settings/annotations' array."),
			"throws error that the annotation is not referenced by the data source");
		});

		QUnit.test("when calling '_applyChange' by adding two dataSources one of type OData (which has also more then one annotations) other one of type ODataAnnotation", function(assert) {
			const oChange = new AppDescriptorChange({
				flexObjectMetadata: {
					changeType: "appdescr_app_addNewDataSource"
				},
				layer: Layer.CUSTOMER,
				content: {
					dataSource: {
						"customer.fancy_dataSource": {
							uri: "/sap/opu/odata/snce/PO_S_SRV;v=2/",
							settings: {
								annotations: ["customer.fancy_annotation", "existingInManifest", "notExistingInManifestAndChange"]
							 }
						},
						"customer.fancy_annotation": {
							uri: "/sap/bc/bsp/sap/BSCBN_ANF_EAM/BSCBN_EQUIPMENT_SRV.anno.XML",
							type: "ODataAnnotation"
						}
					}
				}
			});

			assert.throws(function() {
				AddNewDataSource.applyChange(this.oManifestWithExistingDataSourcesAndAnnotations, oChange);
			}, Error("Referenced annotation 'notExistingInManifestAndChange' in the annotation array of data source 'customer.fancy_dataSource' does not exist in the manifest."),
			"throws error that the referenced annotation does not exists in the manifest");
		});

		QUnit.test("when calling '_applyChange' by adding two dataSources one of type OData other one of type ODataAnnotation", function(assert) {
			const oChange = new AppDescriptorChange({
				flexObjectMetadata: {
					changeType: "appdescr_app_addNewDataSource"
				},
				layer: Layer.CUSTOMER,
				content: {
					dataSource: {
						"customer.fancy_dataSource": {
							uri: "/sap/opu/odata/snce/PO_S_SRV;v=2/",
							settings: {
								annotations: ["customer.fancy_annotation"]
							 }
						},
						"customer.fancy_annotation": {
							uri: "/sap/bc/bsp/sap/BSCBN_ANF_EAM/BSCBN_EQUIPMENT_SRV.anno.XML",
							type: "ODataAnnotation"
						}
					}
				}
			});

			const oNewManifest = AddNewDataSource.applyChange(this.oManifestWithExistingDataSources, oChange);
			assert.equal(Object.keys(oNewManifest["sap.app"].dataSources).length, 4, "data source count is correctly");
			assert.deepEqual(oNewManifest["sap.app"].dataSources, {
				"customer.fancy_dataSource": {
					uri: "/sap/opu/odata/snce/PO_S_SRV;v=2/",
					settings: {
						annotations: ["customer.fancy_annotation"]
					 }
				},
				"customer.fancy_annotation": {
					uri: "/sap/bc/bsp/sap/BSCBN_ANF_EAM/BSCBN_EQUIPMENT_SRV.anno.XML",
					type: "ODataAnnotation"
				},
				"customer.equipment": {
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
			}, "data source is added correctly");
		});

		QUnit.test("when calling '_applyChange' by adding two dataSources one of type OData other one of type ODataAnnotation with reference to an existing annotations in manifest", function(assert) {
			const oChange = new AppDescriptorChange({
				flexObjectMetadata: {
					changeType: "appdescr_app_addNewDataSource"
				},
				layer: Layer.CUSTOMER,
				content: {
					dataSource: {
						"customer.fancy_dataSource": {
							uri: "/sap/opu/odata/snce/PO_S_SRV;v=2/",
							settings: {
								annotations: ["customer.fancy_annotation", "existingInManifest"]
							 }
						},
						"customer.fancy_annotation": {
							uri: "/sap/bc/bsp/sap/BSCBN_ANF_EAM/BSCBN_EQUIPMENT_SRV.anno.XML",
							type: "ODataAnnotation"
						}
					}
				}
			});

			const oNewManifest = AddNewDataSource.applyChange(this.oManifestWithExistingDataSourcesAndAnnotations, oChange);
			assert.equal(Object.keys(oNewManifest["sap.app"].dataSources).length, 5, "data source count is correctly");
			assert.deepEqual(oNewManifest["sap.app"].dataSources, {
				"customer.fancy_dataSource": {
					uri: "/sap/opu/odata/snce/PO_S_SRV;v=2/",
					settings: {
						annotations: ["customer.fancy_annotation", "existingInManifest"]
					 }
				},
				"customer.fancy_annotation": {
					uri: "/sap/bc/bsp/sap/BSCBN_ANF_EAM/BSCBN_EQUIPMENT_SRV.anno.XML",
					type: "ODataAnnotation"
				},
				"customer.equipment": {
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
				},
				existingInManifest: {
					uri: "/existingInManifest",
					type: "ODataAnnotation",
					settings: {
						localUri: "model/existingInManifest.xml"
					}
				}
			}, "data source is added correctly");
		});

		QUnit.test("when calling '_applyChange' by adding a dataSource of type OData with root key inbound", function(assert) {
			const oChange = new AppDescriptorChange({
				flexObjectMetadata: {
					changeType: "appdescr_app_addNewDataSource"
				},
				layer: Layer.CUSTOMER,
				content: {
					inbound: {
						"customer.fancy_dataSource": {
							uri: "/sap/opu/odata/snce/PO_S_SRV;v=2/",
							type: "OData"
						}
					}
				}
			});

			assert.throws(function() {
				AddNewDataSource.applyChange(this.oManifestWithExistingDataSources, oChange);
			}, Error("The provided property 'inbound' is not supported. Supported property for change 'appdescr_app_addNewDataSource' is 'dataSource'."),
			"throws error that the root key is wrong for the respective change type");
		});

		QUnit.test("when calling '_applyChange' by adding one dataSource with type OData with missing annotation", function(assert) {
			const oChange = new AppDescriptorChange({
				flexObjectMetadata: {
					changeType: "appdescr_app_addNewDataSource"
				},
				layer: Layer.CUSTOMER,
				content: {
					dataSource: {
						"customer.fancy_dataSource": {
							uri: "/sap/opu/odata/snce/PO_S_SRV;v=2/",
							settings: {
								annotations: ["doesNotExist"]
							 }
						}
					}
				}
			});

			assert.throws(function() {
				AddNewDataSource.applyChange(this.oManifestWithExistingDataSources, oChange);
			}, Error("Referenced annotation 'doesNotExist' in the annotation array of data source 'customer.fancy_dataSource' does not exist in the manifest."),
			"throws error that the referenced annotation does not exist");
		});

		QUnit.test("when calling '_applyChange' by adding one dataSource with type OData with wrong type", function(assert) {
			const oChange = new AppDescriptorChange({
				flexObjectMetadata: {
					changeType: "appdescr_app_addNewDataSource"
				},
				layer: Layer.CUSTOMER,
				content: {
					dataSource: {
						"customer.fancy_dataSource": {
							uri: "/sap/opu/odata/snce/PO_S_SRV;v=2/",
							settings: {
								annotations: { }
							 }
						}
					}
				}
			});

			assert.throws(function() {
				AddNewDataSource.applyChange(this.oManifestWithExistingDataSources, oChange);
			}, Error("Property 'annotations' must be of type 'array'."),
			"throws error that the annotations array is of wrong type");
		});

		QUnit.test("when calling '_applyChange' by adding one dataSource type http which contains annotations", function(assert) {
			const oChange = new AppDescriptorChange({
				flexObjectMetadata: {
					changeType: "appdescr_app_addNewDataSource"
				},
				layer: Layer.CUSTOMER,
				content: {
					dataSource: {
						"customer.fancy_dataSource": {
							uri: "/sap/opu/odata/snce/PO_S_SRV;v=2/",
							type: "http",
							settings: {
								annotations: ["existingInManifest"]
							 }
						}
					}
				}
			});

			assert.throws(function() {
				AddNewDataSource.applyChange(this.oManifestWithExistingDataSources, oChange);
			}, Error("Data source 'customer.fancy_dataSource' which is of type 'http' contains the annotations array. Only data sources with type 'OData' could contain the 'settings/annotations' array."),
			"throws error that the annotations array must exist in data base of type OData");
		});

		QUnit.test("when calling '_applyChange' by adding two dataSources one of type http which contains annotations other one of type ODataAnnotations", function(assert) {
			const oChange = new AppDescriptorChange({
				flexObjectMetadata: {
					changeType: "appdescr_app_addNewDataSource"
				},
				layer: Layer.CUSTOMER,
				content: {
					dataSource: {
						"customer.fancy_dataSource": {
							uri: "/sap/opu/odata/snce/PO_S_SRV;v=2/",
							type: "http",
							settings: {
								annotations: ["customer.fancy_annotation", "existingInManifest"]
							 }
						},
						"customer.fancy_annotation": {
							uri: "/sap/bc/bsp/sap/BSCBN_ANF_EAM/BSCBN_EQUIPMENT_SRV.anno.XML",
							type: "ODataAnnotation"
						}
					}
				}
			});

			assert.throws(function() {
				AddNewDataSource.applyChange(this.oManifestWithExistingDataSources, oChange);
			}, Error("Data source 'customer.fancy_dataSource' which is of type 'http' contains the annotations array. Only data sources with type 'OData' could contain the 'settings/annotations' array."),
			"throws error that the annotations array must exist in data base of type OData");
		});
	});

	QUnit.done(function() {
		document.getElementById("qunit-fixture").style.display = "none";
	});
});