/* global QUnit */

sap.ui.define([
	"sap/ui/fl/apply/_internal/changes/descriptor/ui5/ChangeModel",
	"sap/ui/fl/apply/_internal/flexObjects/AppDescriptorChange"
], function(
	ChangeModel,
	AppDescriptorChange
) {
	"use strict";

	QUnit.module("applyChange", {
		beforeEach() {
			this.oManifest1 = {
				"sap.ui5": {
					models: {
						model1: {
							type: "someType",
							dataSource: "someDataSource",
							uri: "someUri",
							preload: "somePreload",
							settings: {
								settings1: "someSettings1",
								settings2: {
									settings21: "someSettings21"
								},
								settings3: "someSettings3",
								settings4: "someSettings4"
							}
						}
					}
				}
			};

			this.oManifest2 = {
				"sap.ui5": {
					models: {
						model1: {
							type: "someType",
							dataSource: "someDataSource",
							uri: "someUri",
							preload: "somePreload",
							settings: {
								settings1: "someSettings1",
								settings2: "someSettings2"
							}
						}
					}
				}
			};

			this.oManifestWithThreeComplexPath = {
				"sap.ui5": {
					models: {
						model1: {
							type: "someType",
							dataSource: "someDataSource",
							uri: "someUri",
							preload: "somePreload",
							settings: {
								"Company/Name/End": {
									"To/Value/End": {
										value: "oldValue",
										format: "plain"
									},
									required: true
								}
							}
						}
					}
				}
			};

			this.oChangeUPSERT = new AppDescriptorChange({
				flexObjectMetadata: {
					changeType: "appdescr_ui5_changeModel"
				},
				content: {
					modelId: "model1",
					entityPropertyChange:
						{
							propertyPath: "settings/settings1",
							operation: "UPSERT",
							propertyValue: "UPSERTSettings1"
						}
				}
			});
		}
	}, function() {
		QUnit.test("when calling '_applyChange' with several changes in array for path settings/*", function(assert) {
			const oChangeArray = new AppDescriptorChange({
				flexObjectMetadata: {
					changeType: "appdescr_ui5_changeModel"
				},
				content: {
					modelId: "model1",
					entityPropertyChange: [
						{
							propertyPath: "settings/settings1",
							operation: "UPDATE",
							propertyValue: "UPDATESettings1"
						},
						{
							propertyPath: "settings/settings2/settings21",
							operation: "UPSERT",
							propertyValue: "UPSERTSettings21"
						},
						{
							propertyPath: "settings/settings5",
							operation: "UPSERT",
							propertyValue: "UPSERTSettings5"
						},
						{
							propertyPath: "settings/settings6",
							operation: "INSERT",
							propertyValue: "INSERTSettings6"
						},
						{
							propertyPath: "settings/settings3",
							operation: "DELETE"
						}
					]
				}
			});
			const oNewManifest = ChangeModel.applyChange(this.oManifest1, oChangeArray);
			assert.deepEqual(oNewManifest["sap.ui5"].models, {
				model1: {
					dataSource: "someDataSource",
					preload: "somePreload",
					settings: {
						settings1: "UPDATESettings1",
						settings2: {
							settings21: "UPSERTSettings21"
						},
						settings4: "someSettings4",
						settings5: "UPSERTSettings5",
						settings6: "INSERTSettings6"
					},
					type: "someType",
					uri: "someUri"
				}
			}, "model is updated correctly");
		});

		QUnit.test("when calling '_applyChange' with singe UPSERT change for path settings/*", function(assert) {
			const oNewManifest = ChangeModel.applyChange(this.oManifest2, this.oChangeUPSERT);
			assert.deepEqual(oNewManifest["sap.ui5"].models, {
				model1: {
					dataSource: "someDataSource",
					preload: "somePreload",
					settings: {
					  settings1: "UPSERTSettings1",
					  settings2: "someSettings2"
					},
					type: "someType",
					uri: "someUri"
				}
			}, "model is updated correctly");
		});

		QUnit.test("when calling '_applyChange' with singe INSERT change for path settings/*", function(assert) {
			const oChangeUPSERT = new AppDescriptorChange({
				flexObjectMetadata: {
					changeType: "appdescr_ui5_changeModel"
				},
				content: {
					modelId: "model1",
					entityPropertyChange:
						{
							propertyPath: "settings/settings3",
							operation: "INSERT",
							propertyValue: "INSERTSettings3"
						}
				}
			});
			const oNewManifest = ChangeModel.applyChange(this.oManifest2, oChangeUPSERT);
			assert.deepEqual(oNewManifest["sap.ui5"].models, {
				model1: {
					dataSource: "someDataSource",
					preload: "somePreload",
					settings: {
					  settings1: "someSettings1",
					  settings2: "someSettings2",
					  settings3: "INSERTSettings3"
					},
					type: "someType",
					uri: "someUri"
				}
			}, "model is updated correctly");
		});

		QUnit.test("when calling '_applyChange' with singe UPDATE change for path settings/*", function(assert) {
			const oChangeUPSERT = new AppDescriptorChange({
				flexObjectMetadata: {
					changeType: "appdescr_ui5_changeModel"
				},
				content: {
					modelId: "model1",
					entityPropertyChange:
						{
							propertyPath: "settings/settings2",
							operation: "UPDATE",
							propertyValue: "UPDATESettings2"
						}
				}
			});
			const oNewManifest = ChangeModel.applyChange(this.oManifest2, oChangeUPSERT);
			assert.deepEqual(oNewManifest["sap.ui5"].models, {
				model1: {
					dataSource: "someDataSource",
					preload: "somePreload",
					settings: {
					  settings1: "someSettings1",
					  settings2: "UPDATESettings2"
					},
					type: "someType",
					uri: "someUri"
				}
			}, "model is updated correctly");
		});

		QUnit.test("when calling '_applyChange' with singe DELETE change for path settings/*", function(assert) {
			const oChangeUPSERT = new AppDescriptorChange({
				flexObjectMetadata: {
					changeType: "appdescr_ui5_changeModel"
				},
				content: {
					modelId: "model1",
					entityPropertyChange:
						{
							propertyPath: "settings/settings2",
							operation: "DELETE"
						}
				}
			});
			const oNewManifest = ChangeModel.applyChange(this.oManifest2, oChangeUPSERT);
			assert.deepEqual(oNewManifest["sap.ui5"].models, {
				model1: {
					dataSource: "someDataSource",
					preload: "somePreload",
					settings: {
					  settings1: "someSettings1"
					},
					type: "someType",
					uri: "someUri"
				}
			}, "model is updated correctly");
		});

		QUnit.test("when calling '_applyChange' property path in not supported", function(assert) {
			const oChangeInsertNotAllowedPath = new AppDescriptorChange({
				flexObjectMetadata: {
					changeType: "appdescr_ui5_changeModel"
				},
				content: {
					modelId: "model1",
					entityPropertyChange:
						{
							propertyPath: "test",
							operation: "INSERT",
							propertyValue: "notAllowedPath"
						}
				}
			});
			assert.throws(function() {
				ChangeModel.applyChange(this.oManifest2, oChangeInsertNotAllowedPath);
			}, Error("Changing test is not supported. The supported 'propertyPath' is: settings/*"),
			"throws an error that chaning the property path is not supported");
		});

		QUnit.test("when calling '_applyChange' by inserting property which already exist", function(assert) {
			const oChangeInsertAlreadyExistingProperty = new AppDescriptorChange({
				flexObjectMetadata: {
					changeType: "appdescr_ui5_changeModel"
				},
				content: {
					modelId: "model1",
					entityPropertyChange:
						{
							propertyPath: "settings/settings1",
							operation: "INSERT",
							propertyValue: "test"
						}
				}
			});

			assert.throws(function() {
				ChangeModel.applyChange(this.oManifest1, oChangeInsertAlreadyExistingProperty);
			}, Error("Path has already a value. 'INSERT' operation is not appropriate."),
			"throws an error that the inserting property is already existing");
		});

		QUnit.test("when calling '_applyChange' with not existing parameter to delete", function(assert) {
			const oChangeDeleteNotExistingProperty = new AppDescriptorChange({
				flexObjectMetadata: {
					changeType: "appdescr_ui5_changeModel"
				},
				content: {
					modelId: "model1",
					entityPropertyChange:
						{
							propertyPath: "settings/notExistingProperty",
							operation: "DELETE"
						}
				}
			});
			const oNewManifest = ChangeModel.applyChange(this.oManifest2, oChangeDeleteNotExistingProperty);
			assert.deepEqual(oNewManifest, this.oManifest2, "property is not deleted");
		});

		QUnit.test("when calling '_applyChange' with invalid DELETE property 'propertyValue'", function(assert) {
			const oChangeDeletePropertyInvalidFormat = new AppDescriptorChange({
				flexObjectMetadata: {
					changeType: "appdescr_ui5_changeModel"
				},
				content: {
					modelId: "model1",
					entityPropertyChange:
						{
							propertyPath: "parameters/id/required",
							operation: "DELETE",
							propertyValue: ""
						}
				}
			});

			assert.throws(function() {
				ChangeModel.applyChange(this.oManifest2, oChangeDeletePropertyInvalidFormat);
			}, Error("The property 'propertyValue' must not be provided in a 'DELETE' operation. Please remove 'propertyValue'."),
			"throws an error that the propertyValue must not exist in DELETE opertation");
		});

		QUnit.test("when calling '_applyChange' with no models exists", function(assert) {
			const oManifestNoModelExist = {
				"sap.ui5": {
					models: { }
				}
			};
			assert.throws(function() {
				ChangeModel.applyChange(oManifestNoModelExist, this.oChangeUPSERT);
			}, Error("Nothing to update. Model with ID \"model1\" does not exist in the manifest.json."),
			"throws an error that modelId does not exist in manifest");
		});

		QUnit.test("when calling '_applyChange' with unsupported change", function(assert) {
			const oChangeUnsupportedChange = new AppDescriptorChange({
				flexObjectMetadata: {
					changeType: "appdescr_ui5_changeModel"
				},
				content: {
					modelId: "model1",
					entityPropertyChange:
						{
							propertyPath: "uri",
							operation: "UPSERT",
							propertyValue: "newURI"
						}
				}
			});

			assert.throws(function() {
				ChangeModel.applyChange(this.oManifest2, oChangeUnsupportedChange);
			}, Error("Changing uri is not supported. The supported 'propertyPath' is: settings/*"),
			"throws an error that chaning the property path is not supported");
		});

		QUnit.test("when calling '_applyChange' with unsupported change for gernic path", function(assert) {
			const oChangeGenericPathUnsupportedChange = new AppDescriptorChange({
				flexObjectMetadata: {
					changeType: "appdescr_ui5_changeModel"
				},
				content: {
					modelId: "model1",
					entityPropertyChange:
						{
							propertyPath: "setting/settings1",
							operation: "UPSERT",
							propertyValue: false
						}
				}
			});
			assert.throws(function() {
				ChangeModel.applyChange(this.oManifest2, oChangeGenericPathUnsupportedChange);
			}, Error("Changing setting/settings1 is not supported. The supported 'propertyPath' is: settings/*"),
			"throws an error that chaning the property path is not supported");
		});

		QUnit.test("when calling '_applyChange' with an unsupported operation", function(assert) {
			const oChangeUnsupportedOperation = new AppDescriptorChange({
				flexObjectMetadata: {
					changeType: "appdescr_ui5_changeModel"
				},
				content: {
					modelId: "model1",
					entityPropertyChange:
						{
							propertyPath: "settings/settings1",
							operation: "UNSUPPORTED",
							propertyValue: "unsupportedAction"
						}
				}
			});

			assert.throws(function() {
				ChangeModel.applyChange(this.oManifest2, oChangeUnsupportedOperation);
			}, Error("Operation UNSUPPORTED is not supported. The supported 'operation' is UPDATE|UPSERT|DELETE|INSERT"),
			"throws an error that the opertation is not supported");
		});

		QUnit.test("when calling '_applyChange' with wrong manifest", function(assert) {
			const oManifest = {
				"sap.ui5": {}
			};
			assert.throws(function() {
				ChangeModel.applyChange(oManifest, this.oChangeUPSERT);
			}, Error("sap.ui5/models section have not been found in manifest.json."),
			"throws an error that sap.ui5/models or sap.ui5/models/modelId does not exist");
		});

		QUnit.test("when calling '_applyChange' with no ID", function(assert) {
			const oChangeNoId = new AppDescriptorChange({
				flexObjectMetadata: {
					changeType: "appdescr_ui5_changeModel"
				},
				content: {
					modelId: "",
					entityPropertyChange:
						{
							propertyPath: "settings/settings3",
							operation: "INSERT",
							propertyValue: "someValue"
						}
				}
			});

			assert.throws(function() {
				ChangeModel.applyChange(this.oManifest2, oChangeNoId);
			}, Error("Mandatory \"modelId\" parameter is not provided."), "throws an error");
		});

		QUnit.test("when calling '_applyChange' with no changes", function(assert) {
			const oChangeNoChanges = new AppDescriptorChange({
				flexObjectMetadata: {
					changeType: "appdescr_ui5_changeModel"
				},
				content: {
					modelId: "model1",
					entityPropertyChange: ""
				}
			});

			assert.throws(function() {
				ChangeModel.applyChange(this.oManifest1, oChangeNoChanges);
			}, Error("Changes for \"model1\" are not provided."),
			"throws an error that there are not changes provied");
		});

		QUnit.test("when calling '_applyChange' with invalid change format", function(assert) {
			const oChangeInvalidFormat = new AppDescriptorChange({
				flexObjectMetadata: {
					changeType: "appdescr_ui5_changeModel"
				},
				content: {
					modelId: "model1",
					entityPropertyChange: [
						{
							propertyPath: "",
							operation: "",
							propertyValue: ""
						}
					]
				}
			});
			assert.throws(function() {
				ChangeModel.applyChange(this.oManifest1, oChangeInvalidFormat);
			}, Error("Invalid change format: The mandatory 'propertyPath' is not defined. Please define the mandatory property 'propertyPath'"),
			"throws an error that the mandatory parameter 'propertyPath' is missing");
		});

		QUnit.test("when calling '_applyChange' with UPDATE and no value in manifest", function(assert) {
			const oManifest = {
				"sap.ui5": {
					models: {
						model1: {
							type: "someType",
							dataSource: "someDataSource",
							uri: "someUri",
							preload: "somePreload",
							settings: {
								settings1: ""
							}
						}
					}
				}
			};

			const oChangeNoValue = new AppDescriptorChange({
				flexObjectMetadata: {
					changeType: "appdescr_ui5_changeModel"
				},
				content: {
					modelId: "model1",
					entityPropertyChange:
						{
							propertyPath: "settings/someSettings1",
							operation: "UPDATE",
							propertyValue: "UPDATEsomeSettings1"
						}
				}
			});
			assert.throws(function() {
				ChangeModel.applyChange(oManifest, oChangeNoValue);
			}, Error("Path does not contain a value. 'UPDATE' operation is not appropriate."), "throws an error");
		});

		QUnit.test("when calling '_applyChange' with single complex propertyPath", function(assert) {
			const oManifestComplexPropertyPath = {
				"sap.ui5": {
					models: {
						model1: {
							type: "someType",
							dataSource: "someDataSource",
							uri: "someUri",
							preload: "somePreload",
							settings: {
								"Company/Name": {
									value: {
										value: "oldValue",
										format: "plain"
									},
									required: true
								}
							}
						}
					}
				}
			};

			const oChangeComplexPopertyPathSingle = new AppDescriptorChange({
				flexObjectMetadata: {
					changeType: "appdescr_ui5_changeModel"
				},
				content: {
					modelId: "model1",
					entityPropertyChange:
						{
							propertyPath: "settings/Company\\/Name/value/value",
							operation: "UPSERT",
							propertyValue: "newValue"
						}
				}
			});
			const oNewManifest = ChangeModel.applyChange(oManifestComplexPropertyPath, oChangeComplexPopertyPathSingle);
			assert.equal(oNewManifest["sap.ui5"].models.model1.settings["Company/Name"].value.value, "newValue", "model is updated correctly");
		});

		QUnit.test("when calling '_applyChange' with two complex propertyPaths", function(assert) {
			const oManifest = {
				"sap.ui5": {
					models: {
						model1: {
							type: "someType",
							dataSource: "someDataSource",
							uri: "someUri",
							preload: "somePreload",
							settings: {
								"Company/Name": {
									"To/Value": {
										value: "oldValue",
										format: "plain"
									},
									required: true
								}
							}
						}
					}
				}
			};

			const oChangeComplexPopertyPath = new AppDescriptorChange({
				flexObjectMetadata: {
					changeType: "appdescr_ui5_changeModel"
				},
				content: {
					modelId: "model1",
					entityPropertyChange:
						{
							propertyPath: "settings/Company\\/Name/To\\/Value/value",
							operation: "UPSERT",
							propertyValue: "newValue"
						}
				}
			});

			const oNewManifest = ChangeModel.applyChange(oManifest, oChangeComplexPopertyPath);
			assert.equal(oNewManifest["sap.ui5"].models.model1.settings["Company/Name"]["To/Value"].value, "newValue", "model is updated correctly");
		});

		QUnit.test("when calling '_applyChange' with three complex propertyPaths", function(assert) {
			const oChangeMoreComplexPopertyPath = new AppDescriptorChange({
				flexObjectMetadata: {
					changeType: "appdescr_ui5_changeModel"
				},
				content: {
					modelId: "model1",
					entityPropertyChange:
						{
							propertyPath: "settings/Company\\/Name\\/End/To\\/Value\\/End/value",
							operation: "UPSERT",
							propertyValue: "newValue"
						}
				}
			});
			const oNewManifest = ChangeModel.applyChange(this.oManifestWithThreeComplexPath, oChangeMoreComplexPopertyPath);
			assert.equal(oNewManifest["sap.ui5"].models.model1.settings["Company/Name/End"]["To/Value/End"].value, "newValue", "model is updated correctly");
		});

		QUnit.test("when calling '_applyChange' DELETE with three complex propertyPaths", function(assert) {
			const oChangeArrayDeleteComplexPathProperties = new AppDescriptorChange({
				flexObjectMetadata: {
					changeType: "appdescr_ui5_changeModel"
				},
				content: {
					modelId: "model1",
					entityPropertyChange: [
						{
							propertyPath: "settings/Company\\/Name\\/End/To\\/Value\\/End/value",
							operation: "DELETE"
						},
						{
							propertyPath: "settings/Company\\/Name\\/End/To\\/Value\\/End",
							operation: "DELETE"
						}
					]
				}
			});

			const oNewManifest = ChangeModel.applyChange(this.oManifestWithThreeComplexPath, oChangeArrayDeleteComplexPathProperties);
			assert.deepEqual(oNewManifest["sap.ui5"].models.model1,
				{
					dataSource: "someDataSource",
					preload: "somePreload",
					settings: {
						"Company/Name/End": {
							required: true
						}
					},
					type: "someType",
					uri: "someUri"
				},
				"model is deleted correctly");
		});

		QUnit.test("when calling '_applyChange' INSERT with complex propertyPath", function(assert) {
			const oChangeInsertComplexPath = new AppDescriptorChange({
				flexObjectMetadata: {
					changeType: "appdescr_ui5_changeModel"
				},
				content: {
					modelId: "model1",
					entityPropertyChange:
						{
							propertyPath: "settings/Company\\/Name\\/End/To\\/Value\\/End/value",
							operation: "INSERT",
							propertyValue: "complexPathValue"
						}
				}
			});
			const oNewManifest = ChangeModel.applyChange(this.oManifest2, oChangeInsertComplexPath);
			assert.deepEqual(oNewManifest["sap.ui5"].models.model1,
				{
					dataSource: "someDataSource",
					preload: "somePreload",
					settings: {
						"Company/Name/End": {
							"To/Value/End": {
								value: "complexPathValue"
							}
						},
						settings1: "someSettings1",
						settings2: "someSettings2"
					},
					type: "someType",
					uri: "someUri"
				},
				"property is instered correctly");
		});

		QUnit.test("when calling '_applyChange' with unsupported propertyPath settingsSomething", function(assert) {
			const oChangeUnsuporrtedPropertyPath = new AppDescriptorChange({
				flexObjectMetadata: {
					changeType: "appdescr_ui5_changeModel"
				},
				content: {
					modelId: "model1",
					entityPropertyChange:
						{
							propertyPath: "settingsSomething",
							operation: "UPSERT",
							propertyValue: "UPSERTsettings"
						}
				}
			});
			assert.throws(function() {
				ChangeModel.applyChange(this.oManifest2, oChangeUnsuporrtedPropertyPath);
			}, Error("Changing settingsSomething is not supported. The supported 'propertyPath' is: settings/*"),
			"throws an error that the property path is not supported");
		});

		QUnit.test("when calling '_applyChange' with unsupported propertyPath settingsSomething/", function(assert) {
			const oChangeUnsuporrtedPropertyType = new AppDescriptorChange({
				flexObjectMetadata: {
					changeType: "appdescr_ui5_changeModel"
				},
				content: {
					modelId: "model1",
					entityPropertyChange:
						{
							propertyPath: "settingsSomething/",
							operation: "UPSERT",
							propertyValue: "UPSERTsettings"
						}
				}
			});
			assert.throws(function() {
				ChangeModel.applyChange(this.oManifest2, oChangeUnsuporrtedPropertyType);
			}, Error("Changing settingsSomething/ is not supported. The supported 'propertyPath' is: settings/*"),
			"throws an error that the property path is not supported");
		});

		QUnit.test("when calling '_applyChange' with unsupported property type", function(assert) {
			const oChangeUnsuporrtedPropertyType = new AppDescriptorChange({
				flexObjectMetadata: {
					changeType: "appdescr_ui5_changeModel"
				},
				content: {
					modelId: "model1",
					entityPropertyChange:
						{
							propertyPath: "settings",
							operation: "UPSERT",
							propertyValue: "UPSERTsettings"
						}
				}
			});
			assert.throws(function() {
				ChangeModel.applyChange(this.oManifest2, oChangeUnsuporrtedPropertyType);
			}, Error("The property 'settings' is type of 'string'. Supported type for property 'settings' is 'object'."),
			"throws an error that chaning the property type is not supported");
		});

		QUnit.test("when calling '_applyChange' trying to modify a model with type sap.ui.model.resource.ResourceModel", function(assert) {
			const oManifest = {
				"sap.ui5": {
					models: {
						model1: {
							dataSource: "someDataSource",
							uri: "someUri",
							preload: "somePreload",
							settings: {
								settings1: "someSettings1"
							}
						},
						modelOfTypeResourceModel: {
							type: "sap.ui.model.resource.ResourceModel",
							dataSource: "someDataSource",
							uri: "someUri",
							preload: "somePreload",
							settings: {
								settings1: "someSettings1"
							}
						},
						model3: {
							type: "someType",
							dataSource: "someDataSource",
							uri: "someUri",
							preload: "somePreload",
							settings: {
								settings1: "someSettings1"
							}
						}
					}
				}
			};

			const oChangeInsertComplexPath = new AppDescriptorChange({
				flexObjectMetadata: {
					changeType: "appdescr_ui5_changeModel"
				},
				content: {
					modelId: "modelOfTypeResourceModel",
					entityPropertyChange:
						{
							propertyPath: "settings/settings1",
							operation: "UPSERT",
							propertyValue: "UPSERTsettings1"
						}
				}
			});
			assert.throws(function() {
				ChangeModel.applyChange(oManifest, oChangeInsertComplexPath);
			}, Error("Model 'modelOfTypeResourceModel' is of type 'sap.ui.model.resource.ResourceModel'. Changing models of type 'sap.ui.model.resource.ResourceModel' are not supported."),
			"throws an error that chaning a model of type sap.ui.model.resource.ResourceModel are not supported");
		});
	});

	QUnit.done(function() {
		document.getElementById("qunit-fixture").style.display = "none";
	});
});
