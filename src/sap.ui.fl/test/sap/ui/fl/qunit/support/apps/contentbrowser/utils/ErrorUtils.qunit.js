/*global QUnit*/

sap.ui.define([
	"sap/ui/fl/support/apps/contentbrowser/utils/ErrorUtils",
	"sap/ui/thirdparty/sinon-4",
	"sap/ui/model/json/JSONModel",
	"sap/ui/core/Component"
], function(
	ErrorUtils,
	sinon,
	JSONModel,
	Component
) {
	"use strict";

	var sandbox = sinon.createSandbox();

	QUnit.module("ErrorUtils", {
		afterEach: function() {
			ErrorUtils._masterComponent = undefined;
			ErrorUtils._messagesModel = undefined;
			sandbox.restore();
		}
	}, function() {
		QUnit.test("sets masterComponent and model", function(assert) {
			assert.equal(ErrorUtils._masterComponent, undefined, "component is initial not set");
			assert.equal(ErrorUtils._messagesModel, undefined, "model is initial not set");

			var oComponent = new Component();
			var oModel = new JSONModel([]);

			ErrorUtils.setMessagesModel(oComponent, oModel);

			assert.equal(ErrorUtils._masterComponent, oComponent, "component is set correct");
			assert.equal(ErrorUtils._messagesModel, oModel, "model is set correct");
		});

		QUnit.test("displays errors", function(assert) {
			// prepare test (only with a set model errors can be stored)
			var oComponent = new Component();
			var oModel = new JSONModel([]);
			ErrorUtils.setMessagesModel(oComponent, oModel);

			var sType = "Error";
			var sTitle = "Connection Lost!";
			var sDescription = "oops, this should never gonna happen!";

			ErrorUtils.displayError(sType, sTitle, sDescription);

			var errorData = oModel.getData();
			assert.equal(errorData.length, 1, "an error is stored");
			var storedError = errorData[0];
			assert.equal(storedError.type, sType, "the type was stored");
			assert.equal(storedError.title, sTitle, "the title was stored");
			assert.equal(storedError.description, sDescription, "the description was stored");
		});

		QUnit.test("opens the error popover", function(assert) {
			// prepare test (only with a set model errors can be stored)
			var oComponent = new Component();
			var oModel = new JSONModel([]);
			ErrorUtils.setMessagesModel(oComponent, oModel);
			var openByStub = sinon.stub(ErrorUtils._messagePopover, "openBy");

			ErrorUtils.handleMessagePopoverPress();

			assert.ok(openByStub.calledOnce, "popover is opened");
		});
	});

	QUnit.done(function() {
		document.getElementById("qunit-fixture").style.display = "none";
	});
});