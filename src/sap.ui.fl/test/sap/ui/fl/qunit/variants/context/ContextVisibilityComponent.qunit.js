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
	"sap/ui/thirdparty/sinon-4"
], function(
	ContextVisibilityController,
	ContextVisibilityComponent,
	WriteStorage,
	RadioButton,
	MessageStrip,
	_merge,
	oCore,
	JSONModel,
	sinon
) {
	"use strict";

	var sandbox = sinon.createSandbox();


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
	});

	QUnit.done(function() {
		document.getElementById("qunit-fixture").style.display = "none";
	});
});