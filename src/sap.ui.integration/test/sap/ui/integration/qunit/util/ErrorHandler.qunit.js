/* global QUnit */

sap.ui.define([
		"sap/ui/integration/widgets/Card",
		"sap/ui/integration/util/ErrorHandler",
		"sap/m/InstanceManager",
		"sap/m/IllustratedMessageType"],
	function (
		Card,
		ErrorHandler,
		InstanceManager,
		IllustratedMessageType) {
		"use strict";

		QUnit.module("getIllustratedMessage method", {
			beforeEach: function () {
				this.oCard = new Card();
				this.oErrorHandler = this.oCard._oErrorHandler;
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
			var oErrorHandler = this.oErrorHandler,
				mErrorInfo = {
					type: IllustratedMessageType.NoData,
					title: "Some Title",
					description: "Some Description"
				},
				oHBox,
				oIllustratedMessage;

			oHBox = oErrorHandler.getIllustratedMessage(mErrorInfo, {});

			// Assert
			assert.ok(oHBox.isA("sap.m.HBox"), "HBox is created");

			oIllustratedMessage = oHBox.getItems()[0];

			assert.strictEqual(oIllustratedMessage.getIllustrationType(), mErrorInfo.type, "Error message type is correct");
			assert.strictEqual(oIllustratedMessage.getTitle(), mErrorInfo.title, "Error message title is correct");
			assert.strictEqual(oIllustratedMessage.getDescription(), mErrorInfo.description, "Error message description is correct");
			assert.notOk(oIllustratedMessage.getAdditionalContent().length, "There is no additional content");
		});

		QUnit.test("Create message with details", function (assert) {
			// Act
			var oErrorHandler = this.oErrorHandler,
				mErrorInfo = {
					type: IllustratedMessageType.NoData,
					title: "Some Title",
					description: "Some Description",
					details: "Some Details"
				},
				oHBox,
				oIllustratedMessage,
				oButton,
				oDialog;

			oHBox = oErrorHandler.getIllustratedMessage(mErrorInfo, {});

			// Assert
			assert.ok(oHBox.isA("sap.m.HBox"), "HBox is created");

			oIllustratedMessage = oHBox.getItems()[0];
			oButton = oIllustratedMessage.getAdditionalContent()[0];

			assert.strictEqual(oIllustratedMessage.getIllustrationType(), mErrorInfo.type, "Error message type is correct");
			assert.strictEqual(oIllustratedMessage.getTitle(), mErrorInfo.title, "Error message title is correct");
			assert.strictEqual(oIllustratedMessage.getDescription(), mErrorInfo.description, "Error message description is correct");
			assert.strictEqual(oButton.getText(), this.oCard.getTranslatedText("CARD_BUTTON_SHOW_MORE"), "Details button is correctly created");

			oButton.firePress();

			oDialog = InstanceManager.getOpenDialogs()[0];

			assert.strictEqual(oDialog.getCustomHeader().getContentMiddle()[0].getText(), this.oCard.getTranslatedText("CARD_ERROR_DIALOG_TITLE"), "Dialog title is correct");
			assert.strictEqual(oDialog.getContent()[0].getText(), mErrorInfo.details, "Dialog content is correct");

			InstanceManager.closeAllDialogs();
		});

		QUnit.test("Create data request error message", function (assert) {
			// Act
			var oErrorHandler = this.oErrorHandler,
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
				oHBox,
				oIllustratedMessage,
				oButton,
				oDialog;

			oHBox = oErrorHandler.getIllustratedMessage(mErrorInfo, {});

			// Assert
			assert.ok(oHBox.isA("sap.m.HBox"), "HBox is created");

			oIllustratedMessage = oHBox.getItems()[0];
			oButton = oIllustratedMessage.getAdditionalContent()[0];

			assert.strictEqual(oIllustratedMessage.getIllustrationType(), IllustratedMessageType.ErrorScreen, "Error message type is correct");
			assert.strictEqual(oIllustratedMessage.getTitle(), mErrorInfo.requestErrorParams.response.status + " " + mErrorInfo.requestErrorParams.response.statusText, "Error message title is correct");
			assert.strictEqual(oIllustratedMessage.getDescription(), this.oCard.getTranslatedText("CARD_ERROR_REQUEST_DESCRIPTION"), "Error message description is correct");
			assert.strictEqual(oButton.getText(), this.oCard.getTranslatedText("CARD_BUTTON_SHOW_MORE"), "Details button is correctly created");

			oButton.firePress();

			oDialog = InstanceManager.getOpenDialogs()[0];

			assert.strictEqual(oDialog.getCustomHeader().getContentMiddle()[0].getText(), this.oCard.getTranslatedText("CARD_ERROR_DIALOG_TITLE"), "Dialog title is correct");
			assert.ok(oDialog.getContent()[0], "Dialog content is created");

			InstanceManager.closeAllDialogs();
		});
	});