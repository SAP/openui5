/*global QUnit*/

sap.ui.define([
	"sap/ui/thirdparty/jquery",
	"sap/ui/thirdparty/sinon-4",
	"sap/ui/core/Control",
	"sap/ui/core/CustomData",
	"sap/ui/core/UIComponent",
	"sap/ui/core/util/reflection/JsControlTreeModifier",
	"sap/ui/fl/Change",
	"sap/ui/fl/apply/_internal/changes/FlexCustomData",
	"sap/ui/fl/Layer"
],
function (
	jQuery,
	sinon,
	Control,
	CustomData,
	UIComponent,
	JsControlTreeModifier,
	Change,
	FlexCustomData,
	Layer
) {
	"use strict";

	var sandbox = sinon.sandbox.create();

	var sAppliedKey = FlexCustomData.appliedChangesCustomDataKey;
	var sFailedJSKey = FlexCustomData.failedChangesCustomDataKeyJs;
	var sFailedXMLKey = FlexCustomData.failedChangesCustomDataKeyXml;
	var sNotApplicableKey = FlexCustomData.notApplicableChangesCustomDataKey;

	function getChangeContent(sFileName, sSelectorId) {
		return {
			fileType: "change",
			layer: Layer.CUSTOMER,
			fileName: sFileName || "a",
			namespace: "b",
			packageName: "c",
			changeType: "labelChange",
			creation: "",
			reference: "",
			selector: {
				id: sSelectorId || "abc123"
			},
			content: {
				something: "createNewVariant"
			}
		};
	}

	function getCustomData(oControl, sKey) {
		var oReturn;
		var aCustomData = oControl.getCustomData();
		aCustomData.some(function(oCustomData) {
			if (oCustomData.getKey() === sKey) {
				oReturn = oCustomData;
			}
		});
		return oReturn;
	}

	function createCustomDataKey(oChange, sIdentifier) {
		return FlexCustomData._getCustomDataKey(oChange, sIdentifier);
	}

	QUnit.module("Given a control with no flex custom data", {
		beforeEach: function () {
			this.oAppComponent = new UIComponent();
			this.oControl = new Control("control");
			this.oChange = new Change(getChangeContent("a1", "control"));
			this.mPropertyBag = {
				modifier: JsControlTreeModifier,
				appComponent: this.oAppComponent
			};
		},
		afterEach: function () {
			this.oAppComponent.destroy();
			this.oControl.destroy();
			sandbox.restore();
		}
	}, function() {
		QUnit.test("addAppliedCustomData", function (assert) {
			FlexCustomData.addAppliedCustomData(this.oControl, this.oChange, this.mPropertyBag, false);
			var oCustomData = getCustomData(this.oControl, createCustomDataKey(this.oChange, sAppliedKey));
			assert.ok(oCustomData, "the custom data was added");
			assert.equal(oCustomData.getValue(), "true", "the value is the standard 'true'");
		});

		QUnit.test("addAppliedCustomData with saving revertData", function (assert) {
			var oRevertData = {
				value: "revert"
			};
			this.oChange.setRevertData(oRevertData);
			FlexCustomData.addAppliedCustomData(this.oControl, this.oChange, this.mPropertyBag, true);
			var oCustomData = getCustomData(this.oControl, createCustomDataKey(this.oChange, sAppliedKey));
			assert.ok(oCustomData, "the custom data was added");
			assert.equal(oCustomData.getValue(), '\\{\"value\":\"revert\"\\}', "the value is the standard 'true'");
		});

		QUnit.test("addFailedCustomData", function (assert) {
			FlexCustomData.addFailedCustomData(this.oControl, this.oChange, this.mPropertyBag, "my.identifier");
			var oCustomData = getCustomData(this.oControl, "my.identifier.a1");
			assert.ok(oCustomData, "the custom data was added");
			assert.equal(oCustomData.getValue(), "true", "the value is 'true'");
		});

		QUnit.test("getCustomDataIdentifier", function(assert) {
			assert.equal(FlexCustomData.getCustomDataIdentifier(true), sAppliedKey, "the correct identifier is returned");
			assert.equal(FlexCustomData.getCustomDataIdentifier(false, false), sNotApplicableKey, "the correct identifier is returned");
			assert.equal(FlexCustomData.getCustomDataIdentifier(false, true, true), sFailedXMLKey, "the correct identifier is returned");
			assert.equal(FlexCustomData.getCustomDataIdentifier(false, true, false), sFailedJSKey, "the correct identifier is returned");
		});

		QUnit.test("hasChangeApplyFinishedCustomData", function(assert) {
			assert.notOk(FlexCustomData.hasChangeApplyFinishedCustomData(this.oControl, this.oChange, this.mPropertyBag.modifier), "the control has no flex custom data");
		});
	});

	QUnit.module("Given a control with flex custom data", {
		beforeEach: function () {
			this.oAppComponent = new UIComponent();
			this.oControl = new Control("control");
			this.oChange = new Change(getChangeContent("a1", "control"));
			this.oChange2 = new Change(getChangeContent("a2", "control"));
			this.oChange3 = new Change(getChangeContent("a3", "control"));
			this.oChange4 = new Change(getChangeContent("a4", "control"));
			this.oChangeNoValidCustomData = new Change(getChangeContent("a5", "control"));
			this.oChangeWithoutCustomData = new Change(getChangeContent("a6", "control"));

			var oCustomData = new CustomData({
				key: createCustomDataKey(this.oChange, sAppliedKey)
			});
			oCustomData.setValue(JSON.stringify({value: "revert"}));
			this.oControl.addCustomData(oCustomData);
			this.oControl.addCustomData(new CustomData({
				key: createCustomDataKey(this.oChange2, sNotApplicableKey),
				value: "true"
			}));
			this.oControl.addCustomData(new CustomData({
				key: createCustomDataKey(this.oChange3, sFailedXMLKey),
				value: "true"
			}));
			this.oControl.addCustomData(new CustomData({
				key: createCustomDataKey(this.oChange4, sFailedJSKey),
				value: "true"
			}));
			this.oControl.addCustomData(new CustomData({
				key: createCustomDataKey(this.oChangeNoValidCustomData, sFailedJSKey),
				value: ""
			}));

			this.mPropertyBag = {
				modifier: JsControlTreeModifier,
				appComponent: this.oAppComponent
			};
		},
		afterEach: function () {
			this.oAppComponent.destroy();
			this.oControl.destroy();
			sandbox.restore();
		}
	}, function() {
		QUnit.test("addAppliedCustomData", function(assert) {
			FlexCustomData.addAppliedCustomData(this.oControl, this.oChange, this.mPropertyBag, false);
			var oCustomData = getCustomData(this.oControl, createCustomDataKey(this.oChange, sAppliedKey));
			assert.equal(oCustomData.getValue(), "true", "the value got replaced");
		});

		QUnit.test("addAppliedCustomData with saving revert data", function(assert) {
			var oRevertData = {
				value: "revert2"
			};
			this.oChange.setRevertData(oRevertData);
			FlexCustomData.addAppliedCustomData(this.oControl, this.oChange, this.mPropertyBag, true);
			var oCustomData = getCustomData(this.oControl, createCustomDataKey(this.oChange, sAppliedKey));
			assert.equal(oCustomData.getValue(), '\\{\"value\":\"revert2\"\\}', "the value got replaced");
		});

		QUnit.test("getParsedRevertDataFromCustomData", function(assert) {
			var oParsedRevertData = FlexCustomData.getParsedRevertDataFromCustomData(this.oControl, this.oChange, this.mPropertyBag.modifier);
			assert.deepEqual(oParsedRevertData, {value: "revert"}, "the parsed data is correct");
		});

		QUnit.test("getParsedRevertDataFromCustomData without custom data", function(assert) {
			var oParsedRevertData = FlexCustomData.getParsedRevertDataFromCustomData(this.oControl5, this.oChange2, this.mPropertyBag.modifier);
			assert.notOk(oParsedRevertData, "the parsed data returns undefined");
		});

		QUnit.test("destroyAppliedCustomData", function(assert) {
			FlexCustomData.destroyAppliedCustomData(this.oControl, this.oChange, this.mPropertyBag.modifier);
			assert.notOk(getCustomData(this.oControl, createCustomDataKey(this.oChange, sAppliedKey)));
		});

		QUnit.test("hasChangeApplyFinishedCustomData", function(assert) {
			assert.notOk(FlexCustomData.hasChangeApplyFinishedCustomData(this.oControl, this.oChangeNoValidCustomData, this.mPropertyBag.modifier), "the control has NO applied flex custom data");
			assert.notOk(FlexCustomData.hasChangeApplyFinishedCustomData(this.oControl, this.oChangeWithoutCustomData, this.mPropertyBag.modifier), "the control has NO applied flex custom data");
			assert.ok(FlexCustomData.hasChangeApplyFinishedCustomData(this.oControl, this.oChange, this.mPropertyBag.modifier), "the control has applied flex custom data");
		});
	});

	QUnit.done(function() {
		jQuery("#qunit-fixture").hide();
	});
});