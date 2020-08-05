/*global QUnit*/

sap.ui.define([
	"sap/m/Text",
	"sap/ui/core/util/reflection/JsControlTreeModifier",
	"sap/ui/core/Control",
	"sap/ui/fl/apply/_internal/changes/FlexCustomData",
	"sap/ui/fl/apply/_internal/changes/Utils",
	"sap/ui/fl/registry/ChangeHandlerRegistration",
	"sap/ui/fl/registry/ChangeRegistry",
	"sap/ui/fl/Change",
	"sap/ui/fl/Utils",
	"sap/ui/thirdparty/jquery",
	"sap/ui/thirdparty/sinon-4"
],
function (
	Text,
	JsControlTreeModifier,
	Control,
	FlexCustomData,
	ChangeUtils,
	ChangeHandlerRegistration,
	ChangeRegistry,
	Change,
	FlUtils,
	jQuery,
	sinon
) {
	"use strict";

	var sandbox = sinon.sandbox.create();

	QUnit.module("getControlIfTemplateAffected", {
		beforeEach: function () {
			this.oControl = new Control("controlId");
			this.oText = new Text("textId");
		},
		afterEach: function () {
			this.oControl.destroy();
			this.oText.destroy();
			sandbox.restore();
		}
	}, function() {
		QUnit.test("when calling 'getControlIfTemplateAffected' with a change containing the parameter boundAggregation", function (assert) {
			var oChange = new Change({
				content: {
					boundAggregation: true
				},
				dependentSelector: {
					originalSelector: "original"
				}
			});
			var mPropertyBag = {
				modifier: JsControlTreeModifier
			};
			sandbox.stub(JsControlTreeModifier, "bySelector").returns(this.oText);

			var mExpectedResult = {
				originalControl: this.oControl,
				control: this.oText,
				controlType: "sap.m.Text",
				bTemplateAffected: true
			};
			var mControl = ChangeUtils.getControlIfTemplateAffected(oChange, this.oControl, mPropertyBag);

			assert.deepEqual(mControl.originalControl, mExpectedResult.originalControl, "the parameter 'originalControl' is correct.");
			assert.deepEqual(mControl.control, mExpectedResult.control, "the parameter 'control' is correct.");
			assert.deepEqual(mControl.controlType, mExpectedResult.controlType, "the parameter 'controlType' is correct.");
			assert.deepEqual(mControl.bTemplateAffected, mExpectedResult.bTemplateAffected, "the parameter 'bTemplateAffected' is correct.");
		});

		QUnit.test("when calling 'getControlIfTemplateAffected' with a change without containing the parameter boundAggregation", function (assert) {
			var oChange = new Change({
				content: {}
			});
			var mPropertyBag = {
				modifier: JsControlTreeModifier
			};

			var mExpectedResult = {
				originalControl: this.oControl,
				control: this.oControl,
				controlType: "sap.ui.core.Control",
				bTemplateAffected: false
			};
			var mControl = ChangeUtils.getControlIfTemplateAffected(oChange, this.oControl, mPropertyBag);

			assert.deepEqual(mControl.originalControl, mExpectedResult.originalControl, "the parameter 'originalControl' is correct.");
			assert.deepEqual(mControl.control, mExpectedResult.control, "the parameter 'control' is correct.");
			assert.deepEqual(mControl.controlType, mExpectedResult.controlType, "the parameter 'controlType' is correct.");
			assert.deepEqual(mControl.bTemplateAffected, mExpectedResult.bTemplateAffected, "the parameter 'bTemplateAffected' is correct.");
		});

		QUnit.test("when calling 'getControlIfTemplateAffected' without a control and a change without containing the parameter boundAggregation", function (assert) {
			var oChange = new Change({
				content: {}
			});
			var mPropertyBag = {
				modifier: JsControlTreeModifier
			};

			var mExpectedResult = {
				originalControl: undefined,
				control: undefined,
				controlType: undefined,
				bTemplateAffected: false
			};
			var mControl = ChangeUtils.getControlIfTemplateAffected(oChange, undefined, mPropertyBag);

			assert.deepEqual(mControl.originalControl, mExpectedResult.originalControl, "the parameter 'originalControl' is correct.");
			assert.deepEqual(mControl.control, mExpectedResult.control, "the parameter 'control' is correct.");
			assert.deepEqual(mControl.controlType, mExpectedResult.controlType, "the parameter 'controlType' is correct.");
			assert.deepEqual(mControl.bTemplateAffected, mExpectedResult.bTemplateAffected, "the parameter 'bTemplateAffected' is correct.");
		});
	});

	QUnit.module("getChangeHandler", {
		beforeEach: function() {
			this.oChange = new Change({
				changeType: "type",
				layer: "layer"
			});
			this.oControl = new Control("control");
		},
		afterEach: function() {
			sandbox.restore();
			this.oControl.destroy();
		}
	}, function() {
		QUnit.test("when change handler is already loaded", function(assert) {
			assert.expect(5);
			sandbox.stub(ChangeHandlerRegistration, "isChangeHandlerRegistrationInProgress")
				.withArgs("library")
				.returns(false);
			sandbox.stub(ChangeRegistry, "getInstance").returns({
				getChangeHandler: function(sChangeType, sControlType, oControl, oModifier, sLayer) {
					assert.equal(sChangeType, "type", "the passed property 'sChangeType' is correct");
					assert.equal(sControlType, "sap.ui.core.Control", "the passed property 'sControlType' is correct");
					assert.equal(sLayer, "layer", "the passed property 'sLayer' is correct");
					return "changeHandler";
				},
				initSettings: function() {
					assert.ok(true, "the initSettings function was called");
				}
			});
			var mPropertyBag = {
				modifier: {
					getLibraryName: function() {return "library";}
				}
			};
			var mControl = {
				control: this.oControl,
				controlType: "sap.ui.core.Control"
			};
			return ChangeUtils.getChangeHandler(this.oChange, mControl, mPropertyBag).then(function(oChangeHandler) {
				assert.equal(oChangeHandler, "changeHandler", "the returned change handler is correct");
			});
		});

		QUnit.test("when change handler is not loaded yet and we have to wait for registration", function(assert) {
			assert.expect(6);
			sandbox.stub(ChangeHandlerRegistration, "isChangeHandlerRegistrationInProgress")
				.withArgs("library")
				.returns(true);
			sandbox.stub(ChangeHandlerRegistration, "waitForChangeHandlerRegistration")
				.withArgs("library")
				.callsFake(function() {
					assert.ok(true, "the waitForChangeHandlerRegistration function was called");
					return Promise.resolve();
				});
			sandbox.stub(ChangeRegistry, "getInstance").returns({
				getChangeHandler: function(sChangeType, sControlType, oControl, oModifier, sLayer) {
					assert.equal(sChangeType, "type", "the passed property 'sChangeType' is correct");
					assert.equal(sControlType, "sap.ui.core.Control", "the passed property 'sControlType' is correct");
					assert.equal(sLayer, "layer", "the passed property 'sLayer' is correct");
					return "changeHandler";
				},
				initSettings: function() {
					assert.ok(true, "the initSettings function was called");
				}
			});
			var mPropertyBag = {
				modifier: {
					getLibraryName: function() {return "library";}
				}
			};
			var mControl = {
				control: this.oControl,
				controlType: "sap.ui.core.Control"
			};
			return ChangeUtils.getChangeHandler(this.oChange, mControl, mPropertyBag).then(function(oChangeHandler) {
				assert.equal(oChangeHandler, "changeHandler", "the returned change handler is correct");
			});
		});
	});

	QUnit.module("checkIfDependencyIsStillValid", {
		beforeEach: function() {
			this.oChange = new Change({});
			sandbox.stub(FlUtils, "getChangeFromChangesMap").returns(this.oChange);
			this.oModifier = {
				bySelector: function() {}
			};
		},
		afterEach: function() {
			sandbox.restore();
		}
	}, function() {
		QUnit.test("with already applied change", function(assert) {
			sandbox.stub(FlexCustomData, "hasChangeApplyFinishedCustomData").returns(true);
			assert.equal(ChangeUtils.checkIfDependencyIsStillValid({}, this.oModifier, {}, ""), false, "the dependency is not valid anymore");
		});

		QUnit.test("with change currently being applied", function(assert) {
			sandbox.stub(FlexCustomData, "hasChangeApplyFinishedCustomData").returns(false);
			this.oChange.startApplying();
			assert.equal(ChangeUtils.checkIfDependencyIsStillValid({}, this.oModifier, {}, ""), false, "the dependency is not valid anymore");
		});

		QUnit.test("with change neither being applied not already applied", function(assert) {
			sandbox.stub(FlexCustomData, "hasChangeApplyFinishedCustomData").returns(false);
			assert.equal(ChangeUtils.checkIfDependencyIsStillValid({}, this.oModifier, {}, ""), true, "the dependency is still valid");
		});
	});

	QUnit.done(function() {
		jQuery("#qunit-fixture").hide();
	});
});
