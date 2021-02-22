/*global QUnit*/

sap.ui.define([
	"sap/ui/fl/variants/context/controller/ContextVisibility.controller",
	"sap/ui/fl/variants/context/Component",
	"sap/ui/fl/write/_internal/Storage",
	"sap/m/RadioButton",
	"sap/m/MessageStrip",
	"sap/base/util/restricted/_merge",
	"sap/ui/core/Core",
	"sap/ui/model/json/JSONModel",
	"sap/ui/thirdparty/jquery",
	"sap/ui/thirdparty/sinon-4"
], function (
	ContextVisibilityController,
	ContextVisibilityComponent,
	WriteStorage,
	RadioButton,
	MessageStrip,
	_merge,
	oCore,
	JSONModel,
	jQuery,
	sinon
) {
	"use strict";

	var sandbox = sinon.sandbox.create();

	function fnShowErrorMessageStubs(bIsSelected) {
		var oController = new ContextVisibilityController();
		sandbox.stub(this.oComp, "getRootControl").returns({
			byId: function(sId) {
				return sId === "restrictedRadioButton" ? new RadioButton({selected: bIsSelected}) : new MessageStrip();
			},
			getController: function() {
				oController.onInit();
				return oController;
			}
		});

		var fnResourceModelStub = {
			getResourceBundle: function() {
				return {
					getText: function() {}
				};
			}
		};

		sandbox.stub(oController, "getView").returns({
			getModel: function(sId) {
				return sId === "i18n" ? fnResourceModelStub : new JSONModel();
			},
			getId: function() {
				return "test";
			}
		});
		sandbox.stub(oController, "byId").returns({
			insertContent: function() {}
		});
	}


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
			var aSelectedContexts = ["TEST1", "TEST2"];
			this.oComp.setSelectedContexts({role: aSelectedContexts });
			assert.equal(this.oComp.getSelectedContexts().role.length, 2, "then selected contexts array has two entries");
		});

		QUnit.test("when checking component state with selected restricted radio button and no selected roles", function(assert) {
			fnShowErrorMessageStubs.call(this, true);
			assert.equal(this.oComp.hasErrorsAndShowErrorMessage(), true, "then component has errors");
			assert.equal(oCore.byId("test--noSelectedRolesError").getVisible(), true, "then error message stip is shown");
		});

		QUnit.test("when checking component state with selected public radio button and no selected roles", function(assert) {
			fnShowErrorMessageStubs.call(this);
			assert.equal(this.oComp.hasErrorsAndShowErrorMessage(), false, "then component has no errrors");
			assert.equal(oCore.byId("test--noSelectedRolesError"), undefined, "then error message stip is not shown");
		});

		QUnit.test("when checking component state with selected restricted radio button and some selected roles", function(assert) {
			fnShowErrorMessageStubs.call(this, true);
			this.oComp.setSelectedContexts({role: ["TEST1", "TEST2"]});
			assert.equal(this.oComp.hasErrorsAndShowErrorMessage(), false, "then component has no errrors");
			assert.equal(oCore.byId("test--noSelectedRolesError"), undefined, "then error message stip is not shown");
		});
	});

	QUnit.done(function() {
		jQuery("#qunit-fixture").hide();
	});
});