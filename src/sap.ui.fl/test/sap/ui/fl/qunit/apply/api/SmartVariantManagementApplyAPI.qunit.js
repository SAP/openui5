/* global QUnit */

sap.ui.define([
	"sap/ui/fl/ChangePersistence",
	"sap/ui/fl/ChangePersistenceFactory",
	"sap/ui/fl/StandardVariant",
	"sap/ui/fl/DefaultVariant",
	"sap/ui/fl/Layer",
	"sap/ui/fl/Utils",
	"sap/ui/fl/LayerUtils",
	"sap/ui/fl/apply/api/SmartVariantManagementApplyAPI",
	"sap/ui/fl/write/_internal/Storage",
	"sap/ui/core/UIComponent",
	"sap/ui/core/Control",
	"sap/ui/fl/registry/Settings",
	"sap/ui/fl/apply/_internal/flexState/FlexState",
	"sap/ui/thirdparty/sinon-4"
], function(
	ChangePersistence,
	ChangePersistenceFactory,
	StandardVariant,
	DefaultVariant,
	Layer,
	Utils,
	LayerUtils,
	SmartVariantManagementApplyAPI,
	Storage,
	UIComponent,
	Control,
	Settings,
	FlexState,
	sinon
) {
	"use strict";

	var sandbox = sinon.sandbox.create();

	QUnit.module("SmartVariantManagementApplyAPI", {
		beforeEach : function() {
			this.oAppComponent = new UIComponent("AppComponent21");
			sandbox.stub(Utils, "getAppComponentForControl").returns(this.oAppComponent);
			sandbox.stub(FlexState, "initialize").resolves();
		},
		afterEach: function() {
			if (this.oControl) {
				this.oControl.destroy();
			}
			this.oAppComponent.destroy();
			sandbox.restore();
		}
	}, function() {
		QUnit.test("Utils is loaded correctly", function (assert) {
			assert.ok(Utils);
		});

		QUnit.test("When loadChanges() is called all arguments are passed correctly", function (assert) {
			this.oControl = new Control("controlId1");

			sandbox.stub(Utils, "getSiteId").returns("sSiteId");
			sandbox.stub(Utils, "getAppDescriptor").returns("{}");
			sandbox.stub(SmartVariantManagementApplyAPI, "_getStableId").returns("sStableId");

			var fnStub = sandbox.stub();

			var mPropertyBag = {
				appDescriptor: "{}",
				siteId: "sSiteId",
				includeVariants: true
			};

			sandbox.stub(ChangePersistenceFactory, "getChangePersistenceForControl").withArgs(this.oControl).returns({
				getChangesForVariant: fnStub
			});
			return SmartVariantManagementApplyAPI.loadChanges({control: this.oControl})
				.then(function() {
					assert.ok(fnStub.calledWith("persistencyKey", "sStableId", mPropertyBag));
				});
		});

		QUnit.test("When loadChanges() is called all arguments are passed correctly and the return flow is correct", function (assert) {
			this.oControl = new Control("controlId1");

			sandbox.stub(Utils, "getSiteId").returns("sSiteId");
			sandbox.stub(Utils, "getAppDescriptor").returns("{}");

			var aChanges = [{
				__change0: {
					fileName: "id_1561376510625_89_moveControls",
					fileType: "fileType",
					changeType: "changeType",
					layer: Layer.USER,
					content: {}
				}
			}];

			var getChangePersistenceForControlStub = sandbox.stub(ChangePersistenceFactory, "getChangePersistenceForControl").withArgs(this.oControl).returns({
				getChangesForVariant: function() {
					return aChanges;
				}
			});

			return SmartVariantManagementApplyAPI.loadChanges({control: this.oControl})
				.then(function(aVariantChange) {
					assert.ok(getChangePersistenceForControlStub.calledWith(this.oControl));
					assert.equal(aVariantChange, aChanges);
				}.bind(this));
		});

		QUnit.test("When getChangeById() is called all arguments are passed correctly and the return flow is correct", function (assert) {
			this.oControl = new Control("controlId1");
			var sId = "__change0";
			var oChange = {
				fileName : "id_1561376510625_89_moveControls"
			};
			sandbox.stub(Utils, "getSiteId").returns("sSiteId");
			sandbox.stub(Utils, "getAppDescriptor").returns("{}");
			sandbox.stub(SmartVariantManagementApplyAPI, "_getStableId").returns("filterBar1");
			sandbox.stub(ChangePersistence.prototype, "getSmartVariantManagementChangeMap").returns(
				{
					filterBar1 : {
						__change0 : oChange
					}
				}
			);
			var oVariantChange = SmartVariantManagementApplyAPI.getChangeById({
				control: this.oControl,
				id: sId
			});

			assert.deepEqual(oVariantChange, oChange);
		});

		QUnit.test("When SmartVariantManagementApplyAPI is called it has the correct key", function (assert) {
			assert.equal(SmartVariantManagementApplyAPI._PERSISTENCY_KEY, "persistencyKey");
		});

		QUnit.test("When isVariantSharingEnabled() is called it calls the Settings instance and returns true", function (assert) {
			var oSetting = {
				isKeyUser: true,
				isAtoAvailable: true
			};

			sandbox.stub(Storage, "loadFeatures").returns(Promise.resolve(oSetting));

			assert.ok(Settings, "Settings loaded");
			var isVariantSharingEnabledSpy = sandbox.spy(SmartVariantManagementApplyAPI, "isVariantSharingEnabled");
			return SmartVariantManagementApplyAPI.isVariantSharingEnabled().then(function(bFlag) {
				assert.equal(bFlag, true);
				assert.equal(isVariantSharingEnabledSpy.callCount, 1, "called once");
			});
		});

		QUnit.test("When isApplicationVariant() is called", function (assert) {
			this.oControl = new Control("controlId1");

			//Utils.isApplicationVariant returns true
			var oStubUtilsIsApplicationVariant = sandbox.stub(Utils, "isApplicationVariant").withArgs(this.oControl).returns(true);
			assert.equal(SmartVariantManagementApplyAPI.isApplicationVariant({control: this.oControl}), true);

			//Utils.isApplicationVariant returns false, Utils.getComponentForControl return null
			oStubUtilsIsApplicationVariant.withArgs(this.oControl).returns(false);
			var oStubUtilsGetComponentForControl = sandbox.stub(Utils, "getComponentForControl").withArgs(this.oControl).returns(null);
			assert.equal(SmartVariantManagementApplyAPI.isApplicationVariant({control: this.oControl}), false);

			//Utils.isApplicationVariant returns false, Utils.getComponentForControl return empty object
			oStubUtilsGetComponentForControl.withArgs(this.oControl).returns({});
			assert.equal(SmartVariantManagementApplyAPI.isApplicationVariant({control: this.oControl}), false);

			//Utils.isApplicationVariant returns false, Utils.getComponentForControl return component but not appComponent
			oStubUtilsGetComponentForControl.withArgs(this.oControl).returns({getAppComponent : function() { return null;}});
			assert.equal(SmartVariantManagementApplyAPI.isApplicationVariant({control: this.oControl}), false);

			//Utils.isApplicationVariant returns false, Utils.getComponentForControl return component and appComponent
			oStubUtilsGetComponentForControl.withArgs(this.oControl).returns({getAppComponent : function() { return {};}});
			assert.equal(SmartVariantManagementApplyAPI.isApplicationVariant({control: this.oControl}), true);
		});

		QUnit.test("When isVendorLayer() is called it calls the corresponding Utils function", function (assert) {
			sandbox.stub(LayerUtils, "isVendorLayer").withArgs().returns(false);
			var bVendorLayer = SmartVariantManagementApplyAPI.isVendorLayer();

			assert.equal(bVendorLayer, false);
		});

		QUnit.test("When isVariantDownport() is called it calls the corresponding Utils function", function (assert) {
			sandbox.stub(LayerUtils, "getCurrentLayer").withArgs().returns('VENDOR');
			sandbox.stub(Utils, "isHotfixMode").withArgs().returns(true);
			var bVendorLayer = SmartVariantManagementApplyAPI.isVariantDownport();

			assert.equal(bVendorLayer, true);
		});

		QUnit.test("When getExecuteOnSelect() is called all arguments are passed correctly and the return flow is correct", function (assert) {
			this.oControl = new Control("controlId1");
			var oChange = {
				fileName : "id_1561376510625_89_moveControls"
			};
			var mChangeMap = {
				filterBar1 : {
					__change0 : oChange
				}
			};

			sandbox.stub(SmartVariantManagementApplyAPI, "_getStableId").returns("filterBar1");
			sandbox.stub(ChangePersistence.prototype, "getSmartVariantManagementChangeMap").returns(mChangeMap);
			sandbox.stub(StandardVariant, "getExecuteOnSelect").withArgs(mChangeMap["filterBar1"]).returns(true);
			var bExecuteOnSelect = SmartVariantManagementApplyAPI.getExecuteOnSelect({control: this.oControl});

			assert.equal(bExecuteOnSelect, true);
		});

		QUnit.test("When getDefaultVariantId() is called all arguments are passed correctly and the return flow is correct", function (assert) {
			this.oControl = new Control("controlId1");
			var oChange = {
				fileName : "id_1561376510625_89_moveControls"
			};
			var mChangeMap = {
				filterBar1 : {
					__change0 : oChange
				}
			};

			sandbox.stub(SmartVariantManagementApplyAPI, "_getStableId").returns("filterBar1");
			sandbox.stub(ChangePersistence.prototype, "getSmartVariantManagementChangeMap").returns(mChangeMap);
			sandbox.stub(DefaultVariant, "getDefaultVariantId").withArgs(mChangeMap["filterBar1"]).returns(true);
			var bDefaultVariantId = SmartVariantManagementApplyAPI.getDefaultVariantId({control: this.oControl});

			assert.equal(bDefaultVariantId, true);
		});

		QUnit.test("When _getStableId() is called it returns the stable id of the given control", function (assert) {
			var oSmartVariantManagementControl = {
				getPersistencyKey : function() {
					return "filterBar1";
				}
			};
			var sStableId = SmartVariantManagementApplyAPI._getStableId(oSmartVariantManagementControl);

			assert.equal(sStableId, "filterBar1");
		});

		QUnit.test("When getStableId() is called it returns an empty string", function (assert) {
			this.oControl = new Control("controlId1");
			var sStableId = SmartVariantManagementApplyAPI._getStableId(this.oControl);

			assert.equal(sStableId, "");
		});

		QUnit.test("When _getChangeMap() is called it returns a map of persistencyKey and belonging changes", function (assert) {
			var oSmartVariantManagementControl = {
				getPersistencyKey : function() {
					return "filterBar1";
				}
			};
			var oChange = {
				fileName : "id_1561376510625_89_moveControls"
			};
			var mChangeMap = {
				filterBar1: {
					__change0 : oChange
				}
			};
			sandbox.stub(ChangePersistenceFactory, "getChangePersistenceForControl").returns({
				getSmartVariantManagementChangeMap: function () {
					return mChangeMap;
				}
			});
			var mReturnedChangeMap = SmartVariantManagementApplyAPI._getChangeMap(oSmartVariantManagementControl);

			assert.equal(mChangeMap.filterBar1, mReturnedChangeMap);
		});
	});

	QUnit.done(function () {
		jQuery('#qunit-fixture').hide();
	});
});