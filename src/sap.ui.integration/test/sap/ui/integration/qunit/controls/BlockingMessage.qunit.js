/* global QUnit, sinon */

sap.ui.define([
	"sap/ui/core/Core",
	"sap/ui/integration/widgets/Card",
	"sap/ui/integration/controls/BlockingMessage",
	"sap/ui/integration/library",
	"sap/ui/integration/util/ErrorHandler",
	"sap/m/InstanceManager",
	"sap/m/IllustratedMessageType"
], function(
	Core,
	Card,
	BlockingMessage,
	library,
	ErrorHandler,
	InstanceManager,
	IllustratedMessageType
) {
	"use strict";

	var DOM_RENDER_LOCATION = "qunit-fixture";
	var CardBlockingMessageType = library.CardBlockingMessageType;

	QUnit.module("create method", {
		beforeEach: function () {
			this.oCard = new Card();
			this.oCard._oCardManifest = {
				getJson: function () {
					return {
						a: 5
					};
				},
				destroy: function () {

				}
			};
		},
		afterEach: function () {
			this.oCard.destroy();
		}
	});

	QUnit.test("Create message without details", function (assert) {
		// Act
		var mErrorInfo = {
				type: CardBlockingMessageType.Error,
				illustrationType: IllustratedMessageType.NoData,
				title: "Some Title",
				description: "Some Description"
			},
			oMessage = BlockingMessage.create(mErrorInfo, this.oCard),
			oIllustratedMessage;

		oMessage.placeAt(DOM_RENDER_LOCATION);
		Core.applyChanges();

		// Assert
		assert.ok(oMessage.isA("sap.ui.integration.controls.BlockingMessage"), "BlockingMessage is created");

		oIllustratedMessage = oMessage.getAggregation("_illustratedMessage");

		assert.strictEqual(oIllustratedMessage.getIllustrationType(), mErrorInfo.illustrationType, "Error message type is correct");
		assert.strictEqual(oIllustratedMessage.getTitle(), mErrorInfo.title, "Error message title is correct");
		assert.strictEqual(oIllustratedMessage.getDescription(), mErrorInfo.description, "Error message description is correct");
		assert.notOk(oIllustratedMessage.getAdditionalContent().length, "There is no additional content");

		// Clean up
		oMessage.destroy();
	});

	QUnit.test("Create message with details", function (assert) {
		// Act
		var done = assert.async(),
			oDebugStub = sinon.stub(undefined/*Configuration*/, "getDebug").returns(true),
			mErrorInfo = {
				type: BlockingMessage.Error,
				illustrationType: IllustratedMessageType.NoData,
				title: "Some Title",
				description: "Some Description",
				details: "Some Details"
			},
			oMessage = BlockingMessage.create(mErrorInfo, this.oCard),
			oIllustratedMessage,
			oButton,
			oDialog;

		oMessage.placeAt(DOM_RENDER_LOCATION);
		Core.applyChanges();

		// Assert
		assert.ok(oMessage.isA("sap.ui.integration.controls.BlockingMessage"), "BlockingMessage is created");

		oIllustratedMessage = oMessage.getAggregation("_illustratedMessage");
		oButton = oIllustratedMessage.getAdditionalContent()[0];

		assert.strictEqual(oIllustratedMessage.getIllustrationType(), mErrorInfo.illustrationType, "Error message type is correct");
		assert.strictEqual(oIllustratedMessage.getTitle(), mErrorInfo.title, "Error message title is correct");
		assert.strictEqual(oIllustratedMessage.getDescription(), mErrorInfo.description, "Error message description is correct");
		assert.strictEqual(oButton.getText(), this.oCard.getTranslatedText("CARD_BUTTON_SHOW_MORE"), "Details button is correctly created");

		oButton.firePress();

		oDialog = InstanceManager.getOpenDialogs()[0];

		assert.strictEqual(oDialog.getCustomHeader().getContentMiddle()[0].getText(), this.oCard.getTranslatedText("CARD_ERROR_DIALOG_TITLE"), "Dialog title is correct");
		assert.strictEqual(oDialog.getContent()[0].getText(), mErrorInfo.details, "Dialog content is correct");

		InstanceManager.closeAllDialogs(function () {
			// Clean up
			oMessage.destroy();
			oDebugStub.restore();
			done();
		});
	});

	QUnit.test("Create error message", function (assert) {
		// Act
		var done = assert.async(),
			oDebugStub = sinon.stub(undefined/*Configuration*/, "getDebug").returns(true),
			mErrorInfo = {
				illustrationType: IllustratedMessageType.NoData,
				title: "Some Title",
				description: "Some Description"
			},
			oMessage = BlockingMessage.create(ErrorHandler.configureErrorInfo(mErrorInfo, this.oCard), this.oCard),
			oIllustratedMessage,
			oButton,
			oDialog;

		oMessage.placeAt(DOM_RENDER_LOCATION);
		Core.applyChanges();

		// Assert
		assert.ok(oMessage.isA("sap.ui.integration.controls.BlockingMessage"), "BlockingMessage is created");

		oIllustratedMessage = oMessage.getAggregation("_illustratedMessage");
		oButton = oIllustratedMessage.getAdditionalContent()[0];

		assert.strictEqual(oIllustratedMessage.getIllustrationType(), mErrorInfo.illustrationType, "Error message type is correct");
		assert.strictEqual(oIllustratedMessage.getTitle(), mErrorInfo.title, "Error message title is correct");
		assert.strictEqual(oIllustratedMessage.getDescription(), mErrorInfo.description, "Error message description is correct");
		assert.strictEqual(oButton.getText(), this.oCard.getTranslatedText("CARD_BUTTON_SHOW_MORE"), "Details button is correctly created");

		oButton.firePress();

		oDialog = InstanceManager.getOpenDialogs()[0];

		assert.strictEqual(oDialog.getCustomHeader().getContentMiddle()[0].getText(), this.oCard.getTranslatedText("CARD_ERROR_DIALOG_TITLE"), "Dialog title is correct");
		assert.ok(oDialog.getContent()[0].getText().includes(this.oCard.getTranslatedText("CARD_MANIFEST")), "There should be default details provided for error messages");
		assert.ok(oDialog.getContent()[0].getText().includes(this.oCard.getTranslatedText("CARD_STACK_TRACE")), "There should be default details provided for error messages");
		assert.notOk(oMessage.getHttpResponse(), "There shouldn't be an HTTP response");

		InstanceManager.closeAllDialogs(function () {
			// Clean up
			oMessage.destroy();
			oDebugStub.restore();
			done();
		});
	});

	QUnit.test("Create data request error message", function (assert) {
		// Act
		var done = assert.async(),
			oDebugStub = sinon.stub(undefined/*Configuration*/, "getDebug").returns(true),
			mErrorInfo = {
				requestErrorParams: {
					message: "Description",
					settings: {
						a: "A",
						b: "B"
					},
					response: {
						status: "404",
						statusText: "Not Found",
						headers: new Headers({"Headers": "Test"})
					}
				},
				requestSettings: {
					a: "A",
					b: "B"
				}
			},
			oMessage = BlockingMessage.create(ErrorHandler.configureDataRequestErrorInfo(mErrorInfo, this.oCard), this.oCard),
			oIllustratedMessage,
			oButton,
			oDialog;

		oMessage.placeAt(DOM_RENDER_LOCATION);
		Core.applyChanges();

		// Assert
		assert.ok(oMessage.isA("sap.ui.integration.controls.BlockingMessage"), "BlockingMessage is created");

		oIllustratedMessage = oMessage.getAggregation("_illustratedMessage");
		oButton = oIllustratedMessage.getAdditionalContent()[0];

		assert.strictEqual(oIllustratedMessage.getIllustrationType(), IllustratedMessageType.ErrorScreen, "Error message type is correct");
		assert.strictEqual(oIllustratedMessage.getTitle(), mErrorInfo.requestErrorParams.response.status + " " + mErrorInfo.requestErrorParams.response.statusText, "Error message title is correct");
		assert.strictEqual(oIllustratedMessage.getDescription(), this.oCard.getTranslatedText("CARD_ERROR_REQUEST_DESCRIPTION"), "Error message description is correct");
		assert.strictEqual(oButton.getText(), this.oCard.getTranslatedText("CARD_BUTTON_SHOW_MORE"), "Details button is correctly created");
		assert.ok(oMessage.getHttpResponse(), "There should be an HTTP response");

		oButton.firePress();

		oDialog = InstanceManager.getOpenDialogs()[0];

		assert.strictEqual(oDialog.getCustomHeader().getContentMiddle()[0].getText(), this.oCard.getTranslatedText("CARD_ERROR_DIALOG_TITLE"), "Dialog title is correct");
		assert.ok(oDialog.getContent()[0], "Dialog content is created");

		InstanceManager.closeAllDialogs(function () {
			// Clean up
			oMessage.destroy();
			oDebugStub.restore();
			done();
		});
	});
});