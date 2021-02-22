/*global QUnit*/

sap.ui.define([
	"sap/ui/fl/variants/context/Component",
	"sap/ui/fl/write/_internal/Storage",
	"sap/m/RadioButton",
	"sap/m/MessageStrip",
	"sap/base/util/restricted/_merge",
	"sap/ui/core/Core",
	"sap/ui/thirdparty/jquery",
	"sap/ui/thirdparty/sinon-4"
], function (
	ContextVisibilityComponent,
	WriteStorage,
	RadioButton,
	MessageStrip,
	_merge,
	oCore,
	jQuery,
	sinon
) {
	"use strict";

	var sandbox = sinon.sandbox.create();


	QUnit.module("Given a ContextVisibility component is given", {
		beforeEach: function() {
			this.oComp = new ContextVisibilityComponent("test");
			this.oComp.setSelectedContexts({role: []});
			sandbox.stub(WriteStorage, "loadContextDescriptions").resolves({});
		},
		afterEach: function () {
			sandbox.restore();
			this.oComp.destroy();
		}
	}, function() {
		QUnit.test("when getting selected contexts", function(assert) {
			assert.equal(this.oComp.getSelectedContexts().role.length, 0, "then selected contexts array is empty");
		});

		QUnit.test("when setting selected contexts", function(assert) {
			sandbox.stub(this.oComp, "getRootControl").returns({
				byId: function() {
					return new RadioButton();
				}
			});
			var aSelectedContexts = ["TEST1", "TEST2"];
			this.oComp.setSelectedContexts({role: aSelectedContexts });
			assert.equal(this.oComp.getSelectedContexts().role.length, 2, "then selected contexts array has two entries");
		});

		QUnit.test("when checking component state with selected restricted radio button and no selected roles", function(assert) {
			var oRestrictedRadioButton = new RadioButton({selected: true});
			sandbox.stub(this.oComp, "getRootControl").returns({
				byId: function(sId) {
					return sId === "restrictedRadioButton" ? oRestrictedRadioButton : new MessageStrip();
				}
			});
			assert.equal(this.oComp.hasErrorsAndShowErrorMessage(), true, "then component has errrors");
		});

		QUnit.test("when checking component state with selected public radio button and no selected roles", function(assert) {
			var oRestrictedRadioButton = new RadioButton();
			sandbox.stub(this.oComp, "getRootControl").returns({
				byId: function(sId) {
					return sId === "restrictedRadioButton" ? oRestrictedRadioButton : new MessageStrip();
				}
			});
			assert.equal(this.oComp.hasErrorsAndShowErrorMessage(), false, "then component has no errrors");
		});

		QUnit.test("when checking component state with selected restricted radio button and some selected roles", function(assert) {
			var oRestrictedRadioButton = new RadioButton({selected: true});
			sandbox.stub(this.oComp, "getRootControl").returns({
				byId: function(sId) {
					return sId === "restrictedRadioButton" ? oRestrictedRadioButton : new MessageStrip();
				}
			});
			this.oComp.setSelectedContexts({role: ["TEST1", "TEST2"]});
			assert.equal(this.oComp.hasErrorsAndShowErrorMessage(), false, "then component has no errrors");
		});
	});

	QUnit.done(function() {
		jQuery("#qunit-fixture").hide();
	});
});