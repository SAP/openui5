/* global QUnit, sinon*/

/*eslint max-nested-callbacks: [2, 5]*/

sap.ui.define([
	"sap/ui/mdc/FilterBar",
	"sap/ui/model/type/String",
	"sap/ui/core/Manifest",
	"sap/base/Log",
	"sap/ui/fl/Utils",
	"sap/ui/fl/variants/VariantManagement",
	"sap/ui/fl/variants/VariantModel",
	"sap/ui/fl/apply/api/ControlVariantApplyAPI",
	"sap/ui/fl/apply/_internal/flexState/controlVariants/VariantManagementState",
	"sap/ui/fl/apply/_internal/controlVariants/URLHandler",
	"sap/ui/fl/apply/_internal/flexState/FlexState",
	"sap/ui/fl/FlexControllerFactory",
	"sap/ui/mdc/util/TypeUtil"
], function (
	FilterBar,
	ModelString,
	Manifest,
	Log,
	FlUtils,
	VariantManagement,
	VariantModel,
	ControlVariantApplyAPI,
	VariantManagementState,
	URLHandler,
	FlexState,
	FlexControllerFactory,
	TypeUtil
) {
	"use strict";

var oVariantMap = {
		  "VMId": {
				"variantManagementChanges": {
				  "setDefault": [
					{
					  "fileName": "id_1589358940494_34_setDefault",
					  "fileType": "ctrl_variant_management_change",
					  "changeType": "setDefault",
					  "moduleName": "",
					  "reference": "sap.ui.mdc.sample.filterbar.sample1.Component",
					  "packageName": "$TMP",
					  "content": {
						"defaultVariant": "id_1589358930278_29"
					  },
					  "selector": {
						"id": "VMId",
						"idIsLocal": false
					  },
					  "layer": "USER",
					  "texts": {},
					  "namespace": "apps/sap.ui.mdc.sample.filterbar.sample1/changes/",
					  "projectId": "sap.ui.mdc.sample.filterbar.sample1",
					  "creation": "2020-05-13T08:35:40.526Z",
					  "originalLanguage": "EN",
					  "support": {
						"generator": "Change.createInitialFileContent",
						"service": "",
						"user": "",
						"sapui5Version": "1.78.0-SNAPSHOT",
						"sourceChangeFileName": "",
						"compositeCommand": ""
					  },
					  "oDataInformation": {},
					  "dependentSelector": {},
					  "validAppVersions": {
						"creation": "1.0.0",
						"from": "1.0.0"
					  },
					  "jsOnly": false,
					  "variantReference": "",
					  "appDescriptorChange": false
					},
					{
					  "fileName": "id_1589360653047_29_setDefault",
					  "fileType": "ctrl_variant_management_change",
					  "changeType": "setDefault",
					  "moduleName": "",
					  "reference": "sap.ui.mdc.sample.filterbar.sample1.Component",
					  "packageName": "$TMP",
					  "content": {
						"defaultVariant": "id_1589359343056_37"
					  },
					  "selector": {
						"id": "VMId",
						"idIsLocal": false
					  },
					  "layer": "USER",
					  "texts": {},
					  "namespace": "apps/sap.ui.mdc.sample.filterbar.sample1/changes/",
					  "projectId": "sap.ui.mdc.sample.filterbar.sample1",
					  "creation": "2020-05-13T09:04:13.081Z",
					  "originalLanguage": "EN",
					  "support": {
						"generator": "Change.createInitialFileContent",
						"service": "",
						"user": "",
						"sapui5Version": "1.78.0-SNAPSHOT",
						"sourceChangeFileName": "",
						"compositeCommand": ""
					  },
					  "oDataInformation": {},
					  "dependentSelector": {},
					  "validAppVersions": {
						"creation": "1.0.0",
						"from": "1.0.0"
					  },
					  "jsOnly": false,
					  "variantReference": "",
					  "appDescriptorChange": false
					},
					{
					  "fileName": "id_1589364271621_33_setDefault",
					  "fileType": "ctrl_variant_management_change",
					  "changeType": "setDefault",
					  "moduleName": "",
					  "reference": "sap.ui.mdc.sample.filterbar.sample1.Component",
					  "packageName": "$TMP",
					  "content": {
						"defaultVariant": "VMId"
					  },
					  "selector": {
						"id": "VMId",
						"idIsLocal": false
					  },
					  "layer": "USER",
					  "texts": {},
					  "namespace": "apps/sap.ui.mdc.sample.filterbar.sample1/changes/",
					  "projectId": "sap.ui.mdc.sample.filterbar.sample1",
					  "creation": "2020-05-13T10:04:31.647Z",
					  "originalLanguage": "EN",
					  "support": {
						"generator": "Change.createInitialFileContent",
						"service": "",
						"user": "",
						"sapui5Version": "1.78.0-SNAPSHOT",
						"sourceChangeFileName": "",
						"compositeCommand": ""
					  },
					  "oDataInformation": {},
					  "dependentSelector": {},
					  "validAppVersions": {
						"creation": "1.0.0",
						"from": "1.0.0"
					  },
					  "jsOnly": false,
					  "variantReference": "",
					  "appDescriptorChange": false
					}
				  ]
				},
				"variants": [
				  {
					"content": {
					  "fileName": "VMId",
					  "variantManagementReference": "VMId",
					  "content": {
						"title": "Standard",
						"favorite": true,
						"visible": true,
						"executeOnSelect": true
					  },
					  "support": {
						"user": "SAP"
					  }
					},
					"variantChanges": {
					  "setExecuteOnSelect": [
						{
						  "fileName": "id_1589364271571_32_setExecuteOnSelect",
						  "fileType": "ctrl_variant_change",
						  "changeType": "setExecuteOnSelect",
						  "moduleName": "",
						  "reference": "sap.ui.mdc.sample.filterbar.sample1.Component",
						  "packageName": "$TMP",
						  "content": {
							"executeOnSelect": true
						  },
						  "selector": {
							"id": "VMId",
							"idIsLocal": false
						  },
						  "layer": "USER",
						  "texts": {},
						  "namespace": "apps/sap.ui.mdc.sample.filterbar.sample1/changes/",
						  "projectId": "sap.ui.mdc.sample.filterbar.sample1",
						  "creation": "2020-05-13T10:04:31.646Z",
						  "originalLanguage": "EN",
						  "support": {
							"generator": "Change.createInitialFileContent",
							"service": "",
							"user": "",
							"sapui5Version": "1.78.0-SNAPSHOT",
							"sourceChangeFileName": "",
							"compositeCommand": ""
						  },
						  "oDataInformation": {},
						  "dependentSelector": {},
						  "validAppVersions": {
							"creation": "1.0.0",
							"from": "1.0.0"
						  },
						  "jsOnly": false,
						  "variantReference": "",
						  "appDescriptorChange": false
						}
					  ]
					},
					"controlChanges": []
				  },
				  {
					"content": {
					  "fileName": "id_1589358930278_29",
					  "fileType": "ctrl_variant",
					  "variantManagementReference": "VMId",
					  "variantReference": "VMId",
					  "reference": "sap.ui.mdc.sample.filterbar.sample1.Component",
					  "packageName": "$TMP",
					  "content": {
						"title": "Standard.1",
						"favorite": true,
						"visible": true,
						"executeOnSelect": true
					  },
					  "self": "apps/sap.ui.mdc.sample.filterbar.sample1/variants/id_1589358930278_29.ctrl_variant",
					  "layer": "USER",
					  "texts": {},
					  "namespace": "apps/sap.ui.mdc.sample.filterbar.sample1/variants/",
					  "creation": "2020-05-13T08:35:30.309Z",
					  "originalLanguage": "EN",
					  "conditions": {},
					  "support": {
						"generator": "Change.createInitialFileContent",
						"service": "",
						"user": "",
						"sapui5Version": "1.78.0-SNAPSHOT"
					  },
					  "validAppVersions": {}
					},
					"controlChanges": [
					  {
						"fileName": "id_1589436772046_35_addCondition",
						"fileType": "change",
						"changeType": "addCondition",
						"moduleName": "",
						"reference": "sap.ui.mdc.sample.filterbar.sample1.Component",
						"packageName": "$TMP",
						"content": {
						  "name": "Category",
						  "condition": {
							"operator": "EQ",
							"values": [
							  "sss"
							],
							"validated": "NotValidated"
						  }
						},
						"selector": {
						  "id": "IDView--testFilterBar",
						  "idIsLocal": true
						},
						"layer": "USER",
						"texts": {},
						"namespace": "apps/sap.ui.mdc.sample.filterbar.sample1/changes/",
						"projectId": "sap.ui.mdc.sample.filterbar.sample1",
						"creation": "2020-05-14T06:12:57.954Z",
						"originalLanguage": "EN",
						"support": {
						  "generator": "Change.createInitialFileContent",
						  "service": "",
						  "user": "",
						  "sapui5Version": "1.78.0-SNAPSHOT",
						  "sourceChangeFileName": "",
						  "compositeCommand": ""
						},
						"oDataInformation": {},
						"dependentSelector": {},
						"validAppVersions": {
						  "creation": "1.0.0",
						  "from": "1.0.0"
						},
						"jsOnly": false,
						"variantReference": "id_1589358930278_29",
						"appDescriptorChange": false
					  },
					  {
						"fileName": "id_1589436775460_36_addCondition",
						"fileType": "change",
						"changeType": "addCondition",
						"moduleName": "",
						"reference": "sap.ui.mdc.sample.filterbar.sample1.Component",
						"packageName": "$TMP",
						"content": {
						  "name": "Name",
						  "condition": {
							"operator": "EQ",
							"values": [
							  "one"
							],
							"validated": "NotValidated"
						  }
						},
						"selector": {
						  "id": "IDView--testFilterBar",
						  "idIsLocal": true
						},
						"layer": "USER",
						"texts": {},
						"namespace": "apps/sap.ui.mdc.sample.filterbar.sample1/changes/",
						"projectId": "sap.ui.mdc.sample.filterbar.sample1",
						"creation": "2020-05-14T06:12:57.955Z",
						"originalLanguage": "EN",
						"support": {
						  "generator": "Change.createInitialFileContent",
						  "service": "",
						  "user": "",
						  "sapui5Version": "1.78.0-SNAPSHOT",
						  "sourceChangeFileName": "",
						  "compositeCommand": ""
						},
						"oDataInformation": {},
						"dependentSelector": {},
						"validAppVersions": {
						  "creation": "1.0.0",
						  "from": "1.0.0"
						},
						"jsOnly": false,
						"variantReference": "id_1589358930278_29",
						"appDescriptorChange": false
					  }
					],
					"variantChanges": {
					  "setExecuteOnSelect": [
						{
						  "fileName": "id_1589358930285_30_setExecuteOnSelect",
						  "fileType": "ctrl_variant_change",
						  "changeType": "setExecuteOnSelect",
						  "moduleName": "",
						  "reference": "sap.ui.mdc.sample.filterbar.sample1.Component",
						  "packageName": "$TMP",
						  "content": {
							"executeOnSelect": true
						  },
						  "selector": {
							"id": "id_1589358930278_29",
							"idIsLocal": false
						  },
						  "layer": "USER",
						  "texts": {},
						  "namespace": "apps/sap.ui.mdc.sample.filterbar.sample1/changes/",
						  "projectId": "sap.ui.mdc.sample.filterbar.sample1",
						  "creation": "2020-05-13T08:35:30.310Z",
						  "originalLanguage": "EN",
						  "support": {
							"generator": "Change.createInitialFileContent",
							"service": "",
							"user": "",
							"sapui5Version": "1.78.0-SNAPSHOT",
							"sourceChangeFileName": "",
							"compositeCommand": ""
						  },
						  "oDataInformation": {},
						  "dependentSelector": {},
						  "validAppVersions": {
							"creation": "1.0.0",
							"from": "1.0.0"
						  },
						  "jsOnly": false,
						  "variantReference": "",
						  "appDescriptorChange": false
						}
					  ]
					}
				  },
				  {
					"content": {
					  "fileName": "id_1589359343056_37",
					  "fileType": "ctrl_variant",
					  "variantManagementReference": "VMId",
					  "variantReference": "VMId",
					  "reference": "sap.ui.mdc.sample.filterbar.sample1.Component",
					  "packageName": "$TMP",
					  "content": {
						"title": "Standard.1.1",
						"favorite": true,
						"visible": true,
						"executeOnSelect": false
					  },
					  "self": "apps/sap.ui.mdc.sample.filterbar.sample1/variants/id_1589359343056_37.ctrl_variant",
					  "layer": "USER",
					  "texts": {},
					  "namespace": "apps/sap.ui.mdc.sample.filterbar.sample1/variants/",
					  "creation": "2020-05-13T08:42:23.102Z",
					  "originalLanguage": "EN",
					  "conditions": {},
					  "support": {
						"generator": "Change.createInitialFileContent",
						"service": "",
						"user": "",
						"sapui5Version": "1.78.0-SNAPSHOT"
					  },
					  "validAppVersions": {}
					},
					"controlChanges": [
					  {
						"fileName": "id_1589359343056_38_addCondition",
						"fileType": "change",
						"changeType": "addCondition",
						"moduleName": "",
						"reference": "sap.ui.mdc.sample.filterbar.sample1.Component",
						"packageName": "$TMP",
						"content": {
						  "name": "Category",
						  "condition": {
							"operator": "EQ",
							"values": [
							  "111"
							],
							"validated": "NotValidated"
						  }
						},
						"selector": {
						  "id": "IDView--testFilterBar",
						  "idIsLocal": true
						},
						"layer": "USER",
						"texts": {},
						"namespace": "apps/sap.ui.mdc.sample.filterbar.sample1/changes/",
						"projectId": "sap.ui.mdc.sample.filterbar.sample1",
						"creation": "2020-05-13T08:42:23.103Z",
						"originalLanguage": "EN",
						"support": {
						  "generator": "Change.createInitialFileContent",
						  "service": "",
						  "user": "",
						  "sapui5Version": "1.78.0-SNAPSHOT",
						  "sourceChangeFileName": "id_1589359328880_33_addCondition",
						  "compositeCommand": ""
						},
						"oDataInformation": {},
						"dependentSelector": {},
						"validAppVersions": {
						  "creation": "1.0.0",
						  "from": "1.0.0"
						},
						"jsOnly": false,
						"variantReference": "id_1589359343056_37",
						"appDescriptorChange": false
					  },
					  {
						"fileName": "id_1589363538618_31_removeCondition",
						"fileType": "change",
						"changeType": "removeCondition",
						"moduleName": "",
						"reference": "sap.ui.mdc.sample.filterbar.sample1.Component",
						"packageName": "$TMP",
						"content": {
						  "name": "Category",
						  "condition": {
							"operator": "EQ",
							"values": [
							  "111"
							],
							"validated": "NotValidated"
						  }
						},
						"selector": {
						  "id": "IDView--testFilterBar",
						  "idIsLocal": true
						},
						"layer": "USER",
						"texts": {},
						"namespace": "apps/sap.ui.mdc.sample.filterbar.sample1/changes/",
						"projectId": "sap.ui.mdc.sample.filterbar.sample1",
						"creation": "2020-05-13T09:52:42.232Z",
						"originalLanguage": "EN",
						"support": {
						  "generator": "Change.createInitialFileContent",
						  "service": "",
						  "user": "",
						  "sapui5Version": "1.78.0-SNAPSHOT",
						  "sourceChangeFileName": "",
						  "compositeCommand": ""
						},
						"oDataInformation": {},
						"dependentSelector": {},
						"validAppVersions": {
						  "creation": "1.0.0",
						  "from": "1.0.0"
						},
						"jsOnly": false,
						"variantReference": "id_1589359343056_37",
						"appDescriptorChange": false
					  },
					  {
						"fileName": "id_1589363548834_32_addCondition",
						"fileType": "change",
						"changeType": "addCondition",
						"moduleName": "",
						"reference": "sap.ui.mdc.sample.filterbar.sample1.Component",
						"packageName": "$TMP",
						"content": {
						  "name": "Name",
						  "condition": {
							"operator": "EQ",
							"values": [
							  "name"
							],
							"validated": "NotValidated"
						  }
						},
						"selector": {
						  "id": "IDView--testFilterBar",
						  "idIsLocal": true
						},
						"layer": "USER",
						"texts": {},
						"namespace": "apps/sap.ui.mdc.sample.filterbar.sample1/changes/",
						"projectId": "sap.ui.mdc.sample.filterbar.sample1",
						"creation": "2020-05-13T09:52:42.233Z",
						"originalLanguage": "EN",
						"support": {
						  "generator": "Change.createInitialFileContent",
						  "service": "",
						  "user": "",
						  "sapui5Version": "1.78.0-SNAPSHOT",
						  "sourceChangeFileName": "",
						  "compositeCommand": ""
						},
						"oDataInformation": {},
						"dependentSelector": {},
						"validAppVersions": {
						  "creation": "1.0.0",
						  "from": "1.0.0"
						},
						"jsOnly": false,
						"variantReference": "id_1589359343056_37",
						"appDescriptorChange": false
					  }
					],
					"variantChanges": {
					  "setExecuteOnSelect": [
						{
						  "fileName": "id_1589359343065_39_setExecuteOnSelect",
						  "fileType": "ctrl_variant_change",
						  "changeType": "setExecuteOnSelect",
						  "moduleName": "",
						  "reference": "sap.ui.mdc.sample.filterbar.sample1.Component",
						  "packageName": "$TMP",
						  "content": {
							"executeOnSelect": true
						  },
						  "selector": {
							"id": "id_1589359343056_37",
							"idIsLocal": false
						  },
						  "layer": "USER",
						  "texts": {},
						  "namespace": "apps/sap.ui.mdc.sample.filterbar.sample1/changes/",
						  "projectId": "sap.ui.mdc.sample.filterbar.sample1",
						  "creation": "2020-05-13T08:42:23.104Z",
						  "originalLanguage": "EN",
						  "support": {
							"generator": "Change.createInitialFileContent",
							"service": "",
							"user": "",
							"sapui5Version": "1.78.0-SNAPSHOT",
							"sourceChangeFileName": "",
							"compositeCommand": ""
						  },
						  "oDataInformation": {},
						  "dependentSelector": {},
						  "validAppVersions": {
							"creation": "1.0.0",
							"from": "1.0.0"
						  },
						  "jsOnly": false,
						  "variantReference": "",
						  "appDescriptorChange": false
						}
					  ]
					}
				  }
				],
				"defaultVariant": "VMId"
			  }
			};

	QUnit.module("FilterBar", {
		beforeEach: function () {
		},
		afterEach: function () {
		}
	});

	QUnit.test("check assigned variantBackreference association", function (assert) {

		sinon.stub(ControlVariantApplyAPI, "attachVariantApplied");
		sinon.stub(ControlVariantApplyAPI, "detachVariantApplied");

		var oVM = new VariantManagement();
		var oFB = new FilterBar({
			variantBackreference: oVM.getId()
		});

		assert.ok(oFB._hasAssignedVariantManagement());

		oFB.destroy();
		oVM.destroy();

		assert.ok(ControlVariantApplyAPI.attachVariantApplied.calledOnce);
		assert.ok(ControlVariantApplyAPI.detachVariantApplied.calledOnce);

		ControlVariantApplyAPI.attachVariantApplied.restore();
		ControlVariantApplyAPI.detachVariantApplied.restore();
	});

	QUnit.test("check late assigned variant association", function (assert) {

		sinon.stub(ControlVariantApplyAPI, "attachVariantApplied");
		sinon.stub(ControlVariantApplyAPI, "detachVariantApplied");

		var oFB = new FilterBar();

		assert.ok(!oFB._hasAssignedVariantManagement());

		var oVM = new VariantManagement();
		oFB.setVariantBackreference(oVM);

		assert.ok(oFB._hasAssignedVariantManagement());

		oFB.destroy();
		oVM.destroy();

		assert.ok(ControlVariantApplyAPI.attachVariantApplied.calledOnce);
		assert.ok(ControlVariantApplyAPI.detachVariantApplied.calledOnce);

		ControlVariantApplyAPI.attachVariantApplied.restore();
		ControlVariantApplyAPI.detachVariantApplied.restore();
	});

	QUnit.test("check assigned variant association twice", function (assert) {

		sinon.stub(ControlVariantApplyAPI, "attachVariantApplied");
		sinon.stub(ControlVariantApplyAPI, "detachVariantApplied");

		var oVM = new VariantManagement();
		var oFB = new FilterBar({
			variantBackreference: oVM.getId()
		});

		assert.ok(oFB._hasAssignedVariantManagement());

		var oVM2 = new VariantManagement();

		sinon.stub(Log, "error");

		assert.ok(!Log.error.called);
		oFB.setVariantBackreference(oVM2);
		assert.ok(Log.error.calledOnce);

		Log.error.reset();

		assert.ok(oFB.getVariantBackreference(), oVM.getId());

		oVM2.destroy();
		oFB.destroy();
		oVM.destroy();

		assert.ok(ControlVariantApplyAPI.attachVariantApplied.calledOnce);
		assert.ok(ControlVariantApplyAPI.detachVariantApplied.calledOnce);

		ControlVariantApplyAPI.attachVariantApplied.restore();
		ControlVariantApplyAPI.detachVariantApplied.restore();
	});

	QUnit.test("check variant switch without waitForChanges on the FB", function (assert) {

		var oManifestObj = {
				"sap.app": {
					id: "Component",
					applicationVersion: {
						version: "1.2.3"
					}
				}
			};
		var oManifest = new Manifest(oManifestObj);

		var oComponent = {
				name: "Component",
				appVersion: "1.2.3",
				getId: function() {
					return "CompId";
				},
				getManifest: function() {
					return oManifest;
				},
				getLocalId: function() { return "VMId"; },
				getModel: function() {
					return oModel;
				}
		};

		sinon.stub(FlUtils, "getAppComponentForControl").returns(oComponent);
		sinon.stub(FlUtils, "getComponentClassName").returns(oComponent.name);
		sinon.stub(URLHandler, "attachHandlers");
		sinon.stub(FlexState, "getVariantsState").returns(oVariantMap);

		sinon.stub(ControlVariantApplyAPI, "detachVariantApplied");

		var oFlexController = FlexControllerFactory.createForControl(oComponent, oManifest);
		sinon.stub(oFlexController, "applyVariantChanges").returns(Promise.resolve());

		var oModel = new VariantModel({}, oFlexController, oComponent);


		var fResolveWaitForSwitch, oWaitForSwitchPromise = new Promise(function(resolve) {
			fResolveWaitForSwitch = resolve;
		});

		sinon.stub(sap.ui.mdc.FilterBar.prototype, "triggerSearch");

		var fOrigVariantSwitch = sap.ui.mdc.FilterBar.prototype._handleVariantSwitch;
		sap.ui.mdc.FilterBar.prototype._handleVariantSwitch = function(oVariant) {
			fOrigVariantSwitch.apply(oFB, arguments);

			fResolveWaitForSwitch();
		};

		sinon.stub(VariantManagementState, "waitForInitialVariantChanges").returns(Promise.resolve());

		// to suppress "manage" event listener in VariantModel
		sinon.stub(oModel, "_initializeManageVariantsEvents");
		oModel.fnManageClick = function() {};

		var oVM = new VariantManagement("VMId", {});
		oVM.setModel(oModel, FlUtils.VARIANT_MODEL_NAME);


		var done = assert.async();

		var aProperties = [{
				name: "Category",
				type: "Edm.String",
				typeConfig: TypeUtil.getTypeConfig("sap.ui.model.type.String"),
				visible: true
			},{
			name: "Name",
			type: "Edm.String",
			typeConfig: TypeUtil.getTypeConfig("sap.ui.model.type.String"),
			visible: true
		}];

		var oFB = new FilterBar({
			variantBackreference: oVM.getId(),
			delegate: { name: "test-resources/sap/ui/mdc/qunit/filterbar/UnitTestMetadataDelegate", payload: { modelName: undefined, collectionName: "test" } }

		});

		oFB._oMetadataAppliedPromise.then(function () {

			assert.ok(oFB.getControlDelegate());
			sinon.stub(oFB.getControlDelegate(), "fetchProperties").returns(Promise.resolve([aProperties]));

			oWaitForSwitchPromise.then(function() {

				assert.ok(sap.ui.mdc.FilterBar.prototype.triggerSearch.calledOnce);
				sap.ui.mdc.FilterBar.prototype.triggerSearch.resetHistory();

				// required, because it is set in rendering
				oModel._oVariantAppliedListeners["VMId"][oFB.getId()] = oFB._handleVariantSwitch.bind(oFB);

				ControlVariantApplyAPI.activateVariant({
					variantReference: "id_1589358930278_29"
				}).then(function() {

					assert.ok(sap.ui.mdc.FilterBar.prototype.triggerSearch.calledOnce);
					sap.ui.mdc.FilterBar.prototype.triggerSearch.resetHistory();

					ControlVariantApplyAPI.activateVariant({
						variantReference: "id_1589359343056_37"
					}).then(function() {
						assert.ok(!sap.ui.mdc.FilterBar.prototype.triggerSearch.called);

						oFB.destroy();
						oVM.destroy();
						oModel.destroy();

						sap.ui.mdc.FilterBar.prototype.triggerSearch.restore();
						sap.ui.mdc.FilterBar.prototype._handleVariantSwitch = fOrigVariantSwitch;
						FlUtils.getAppComponentForControl.restore();
						FlUtils.getComponentClassName.restore();
						URLHandler.attachHandlers.restore();
						FlexState.getVariantsState.restore();
						VariantManagementState.waitForInitialVariantChanges.restore();

						ControlVariantApplyAPI.detachVariantApplied.restore();

						done();
					});
				});
			});
		});
	});

});
