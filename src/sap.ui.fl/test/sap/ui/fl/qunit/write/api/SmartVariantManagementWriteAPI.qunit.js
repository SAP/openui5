/* global QUnit */

sap.ui.define([
	"sap/ui/fl/ChangePersistence",
	"sap/ui/fl/ChangePersistenceFactory",
	"sap/ui/fl/DefaultVariant",
	"sap/ui/fl/StandardVariant",
	"sap/ui/fl/Utils",
	"sap/ui/fl/apply/api/SmartVariantManagementApplyAPI",
	"sap/ui/fl/write/api/SmartVariantManagementWriteAPI",
	"sap/ui/core/UIComponent",
	"sap/ui/core/Control",
	"sap/ui/thirdparty/sinon-4"
], function(
	ChangePersistence,
	ChangePersistenceFactory,
	DefaultVariant,
	StandardVariant,
	Utils,
	SmartVariantManagementApplyAPI,
	SmartVariantManagementWriteAPI,
	UIComponent,
	Control,
	sinon
) {
	"use strict";

	var sandbox = sinon.sandbox.create();

	QUnit.module("SmartVariantManagementWriteAPI", {
		before: function() {
			this.sFileName = "id_1561376510625_89_moveControls";
		},
		beforeEach : function() {
			this.oAppComponent = new UIComponent("AppComponent21");
			this.oControl = new Control("controlId1");
			sandbox.stub(Utils, "getAppComponentForControl").returns(this.oAppComponent);
		},
		afterEach: function() {
			if (this.oControl) {
				this.oControl.destroy();
			}
			this.oAppComponent.destroy();
			sandbox.restore();
		}
	}, function() {
		QUnit.test("When add() is called all arguments are passed correctly", function (assert) {
			sandbox.stub(SmartVariantManagementApplyAPI, "_getStableId").returns("sStableId");
			var sPersistencyKey = SmartVariantManagementApplyAPI._PERSISTENCY_KEY;
			var fnAddChangeStub = sandbox.stub();

			var mParameters = {
				type: "filterVariant",
				id: "abcId"
			};

			sandbox.stub(ChangePersistenceFactory, "getChangePersistenceForControl")
				.withArgs(this.oControl)
				.returns({
					addChangeForVariant: fnAddChangeStub
				});
			SmartVariantManagementWriteAPI.add({control: this.oControl, changeSpecificData: mParameters});

			assert.ok(fnAddChangeStub.calledWith(sPersistencyKey, "sStableId", mParameters));
		});

		QUnit.test("When save is called all arguments are passed correctly and the return flow is correct", function (assert) {
			sandbox.stub(SmartVariantManagementApplyAPI, "_getStableId").returns("sStableId");
			var oChange = {
				fileName: this.sFileName
			};

			var getChangePersistenceForControlStub = sandbox.stub(ChangePersistenceFactory, "getChangePersistenceForControl").withArgs(this.oControl).returns({
				saveAllChangesForVariant: function() {
					return Promise.resolve(["ok"]);
				},
				_mComponent: {
					appVersion: "test"
				}
			});

			sandbox.stub(SmartVariantManagementApplyAPI, "_getChangeMap")
				.withArgs(this.oControl)
				.returns(oChange);
			sandbox.stub(ChangePersistence.prototype, "saveAllChangesForVariant")
				.withArgs("sStableId")
				.returns("ok");

			return SmartVariantManagementWriteAPI.save({control: this.oControl}).then(function(aResponse) {
				assert.ok(getChangePersistenceForControlStub.calledWith(this.oControl));
				assert.equal(aResponse[0], ["ok"]);
			}.bind(this));
		});

		QUnit.test("When setDefaultVariantId is called all arguments are passed correctly and the return flow is correct - update Change", function (assert) {
			var sDefaultVariantId = "sDefaultVariantId";
			var oChange = {
				fileName: this.sFileName
			};
			var oChanges = {
				filterBar1: {
					id_1561376510625_89_moveControls: oChange
				}
			};
			sandbox.stub(SmartVariantManagementApplyAPI, "_getChangeMap")
				.withArgs(this.oControl)
				.returns(oChanges);
			sandbox.stub(DefaultVariant, "updateDefaultVariantId").returns(oChange);
			sandbox.stub(SmartVariantManagementApplyAPI, "_getStableId").returns("filterBar1");

			var oDefaultVariantChange = SmartVariantManagementWriteAPI.setDefaultVariantId({control: this.oControl, defaultVariantId: sDefaultVariantId});

			assert.deepEqual(oDefaultVariantChange, oChange);
		});

		QUnit.test("When setDefaultVariantId() is called all arguments are passed correctly and the return flow is correct - create new Change", function (assert) {
			var sDefaultVariantId = "sDefaultVariantId";
			var oChange = {
				fileName: this.sFileName,
				getId: function() {
					return "id";
				}
			};
			var oChanges = {
				filterBar1: {
					id_1561376510625_89_moveControls: oChange
				}
			};

			sandbox.stub(SmartVariantManagementApplyAPI, "_getChangeMap").withArgs(this.oControl).returns(oChanges);
			sandbox.stub(DefaultVariant, "updateDefaultVariantId").returns(undefined);
			sandbox.stub(DefaultVariant, "createChangeObject").returns(oChange);
			sandbox.stub(SmartVariantManagementApplyAPI, "_getStableId").returns("filterBar1");

			var oDefaultVariantChange = SmartVariantManagementWriteAPI.setDefaultVariantId({control: this.oControl, defaultVariantId: sDefaultVariantId});

			assert.deepEqual(oDefaultVariantChange, oChange);
		});

		QUnit.test("When setExecuteOnSelect() is called all arguments are passed correctly and the return flow is correct - create new Change", function (assert) {
			var bExecuteOnSelect = true;
			var oChange = {
				fileName: this.sFileName,
				getId: function() {
					return "id";
				}
			};
			var oChanges = {
				filterBar1: {
					id_1561376510625_89_moveControls: oChange
				}
			};

			sandbox.stub(ChangePersistenceFactory, "getChangePersistenceForControl")
				.withArgs(this.oControl)
				.returns({
					getComponentName: function () {
						return "sComponent";
					}
				});

			sandbox.stub(SmartVariantManagementApplyAPI, "_getChangeMap").withArgs(this.oControl).returns(oChanges);
			sandbox.stub(StandardVariant, "updateExecuteOnSelect").returns(undefined);
			sandbox.stub(StandardVariant, "createChangeObject").returns(oChange);
			sandbox.stub(SmartVariantManagementApplyAPI, "_getStableId").returns("filterBar1");

			var oDefaultVariantChange = SmartVariantManagementWriteAPI.setExecuteOnSelect({control: this.oControl, executeOnSelect: bExecuteOnSelect});

			assert.deepEqual(oDefaultVariantChange, oChange);
		});
	});

	QUnit.done(function () {
		jQuery('#qunit-fixture').hide();
	});
});