/* global QUnit */

sap.ui.define([
	"sap/ui/integration/widgets/Card",
	"sap/ui/qunit/QUnitUtils",
	"sap/ui/events/KeyCodes",
	"sap/ui/qunit/utils/nextUIUpdate",
	"qunit/testResources/nextCardReadyEvent",
	"qunit/testResources/nextCardDataReadyEvent",
	"../testResources/localService/oauth3lo/mockServer",
	"sap/ui/integration/util/Utils"
],
function (
	Card,
	QUnitUtils,
	KeyCodes,
	nextUIUpdate,
	nextCardReadyEvent,
	nextCardDataReadyEvent,
	OAuth3LOMockServer,
	Utils
) {
	"use strict";

	const DOM_RENDER_LOCATION = "qunit-fixture";

	const oManifestOAuth3LO = {
		"sap.app": {
			"id": "card.explorer.data.3lo.card",
			"type": "card"
		},
		"sap.card": {
			"type": "List",
			"extension": "module:sap/ui/integration/extensions/OAuth3LO",
			"data": {
				"request": {
					"url": "/getDataWithOAuth3LO/Products",
					"parameters": {
						"$format": "json"
					}
				}
			},
			"header": {
				"title": "Products"
			},
			"content": {
				"data": {
					"path": "/value"
				},
				"item": {
					"title": "{ProductName}"
				}
			}
		}
	};

	QUnit.module("OAuth 3LO", {
		beforeEach: function () {
			this.oMockServer = OAuth3LOMockServer.init();

			const oFakeWindow = { };
			this.fnWindowOpenStub = this.stub(window, "open").returns(oFakeWindow);
			this.fnWindowAddListenerStub = this.stub(window, "addEventListener", (sEvent, fnListener) => {
				if (sEvent === "focus") {
					this.fnWindowFocusListener = fnListener;
				}
			});

			this.fnPollingStub = this.stub(Utils, "polling", (fnRequest) => {
				this.pNextPollingRequest = fnRequest();
			});
		},
		afterEach: function () {
			this.oMockServer.stop();
			this.oMockServer.destroy();

			this.fnWindowOpenStub.restore();
			this.fnWindowAddListenerStub.restore();

			this.fnPollingStub.restore();
		}
	});

	QUnit.test("Full 3LO flow", async function (assert) {
		// Arrange
		const oCard = new Card({
			manifest: oManifestOAuth3LO,
			baseUrl: "test-resources/sap/ui/integration/qunit/testResources"
		});

		oCard.placeAt(DOM_RENDER_LOCATION);

		await nextCardReadyEvent(oCard);
		await nextUIUpdate();

		// Assert
		const oMessage = oCard.getBlockingMessage();

		assert.strictEqual(oMessage.title, "Authorization Required");
		assert.strictEqual(oMessage.description, "This application requires access to data from a third-party provider.");
		assert.strictEqual(oMessage.imageSrc, oCard.getBaseUrl() + "/test.svg");
		assert.strictEqual(oMessage.additionalContent.length, 1, "There is one item in additional content.");

		const oButton = oMessage.additionalContent[0];

		assert.ok(oButton.isA("sap.m.Button"), "There is a button in the message additional content.");
		assert.strictEqual(oButton.getText(), "Authorize and Connect", "The button text is correct");

		QUnitUtils.triggerKeydown(oButton.getDomRef(), KeyCodes.ENTER);

		assert.ok(this.fnWindowOpenStub.calledOnce, "Popup was opened.");
		assert.ok(this.fnWindowOpenStub.calledWith("/consent"), "Popup was opened with correct url.");

		// simulate consent given
		OAuth3LOMockServer.consentGiven = true;
		this.fnWindowFocusListener();
		await this.pNextPollingRequest;
		await nextCardDataReadyEvent(oCard);

		const oList = oCard.getCardContent().getInnerList();
		assert.strictEqual(oList.getItems().length, 5, "Card is refreshed and has 5 items after consent is given.");

		// Clean up
		oCard.destroy();
	});

	QUnit.test("Multiple cards", async function (assert) {
		// Arrange
		const oCard1 = new Card({
			manifest: oManifestOAuth3LO,
			baseUrl: "test-resources/sap/ui/integration/qunit/testResources"
		});
		const oCard2 = new Card({
			manifest: oManifestOAuth3LO,
			baseUrl: "test-resources/sap/ui/integration/qunit/testResources"
		});

		oCard1.placeAt(DOM_RENDER_LOCATION);
		oCard2.placeAt(DOM_RENDER_LOCATION);

		await nextCardReadyEvent(oCard1);
		await nextUIUpdate();

		// Act
		const oButton = oCard1.getBlockingMessage().additionalContent[0];
		QUnitUtils.triggerKeydown(oButton.getDomRef(), KeyCodes.ENTER);

		// simulate consent given
		OAuth3LOMockServer.consentGiven = true;
		this.fnWindowFocusListener();
		await this.pNextPollingRequest;
		await nextCardDataReadyEvent(oCard1);

		// Assert
		const oList1 = oCard1.getCardContent().getInnerList();
		assert.strictEqual(oList1.getItems().length, 5, "Card 1 is refreshed and has 5 items after consent is given.");
		const oList2 = oCard2.getCardContent().getInnerList();
		assert.strictEqual(oList2.getItems().length, 5, "Card 2 is refreshed and has 5 items after consent is given.");

		// Clean up
		oCard1.destroy();
		oCard2.destroy();
	});

	QUnit.test("With error", async function (assert) {
		// Arrange
		OAuth3LOMockServer.simulateError = true;

		const oCard = new Card({
			manifest: oManifestOAuth3LO,
			baseUrl: "test-resources/sap/ui/integration/qunit/testResources"
		});

		oCard.placeAt(DOM_RENDER_LOCATION);

		await nextCardReadyEvent(oCard);
		await nextUIUpdate();

		const oMessage = oCard.getBlockingMessage();

		// Assert
		assert.strictEqual(oMessage.type, "Error", "Card shows error if server returns 3lo header with error.");

		// Clean up
		oCard.destroy();
	});

	QUnit.test("Consent is not needed", async function (assert) {
		// Arrange
		OAuth3LOMockServer.consentGiven = true;

		const oCard = new Card({
			manifest: oManifestOAuth3LO,
			baseUrl: "test-resources/sap/ui/integration/qunit/testResources"
		});

		oCard.placeAt(DOM_RENDER_LOCATION);

		await nextCardReadyEvent(oCard);
		await nextUIUpdate();

		// Assert
		const oList = oCard.getCardContent().getInnerList();
		assert.strictEqual(oList.getItems().length, 5, "Card has 5 items, consent was not needed.");

		// Clean up
		oCard.destroy();
	});

	QUnit.test("Destroy before consent given", async function (assert) {
		// Arrange
		const oCard = new Card({
			manifest: oManifestOAuth3LO,
			baseUrl: "test-resources/sap/ui/integration/qunit/testResources"
		});

		oCard.placeAt(DOM_RENDER_LOCATION);

		await nextCardReadyEvent(oCard);
		await nextUIUpdate();

		// Act
		const oButton = oCard.getBlockingMessage().additionalContent[0];
		QUnitUtils.triggerKeydown(oButton.getDomRef(), KeyCodes.ENTER);

		oCard.destroy();

		// simulate continue polling
		await this.pNextPollingRequest;

		// Assert
		assert.ok(true, "No errors when card destroyed before consent given.");
	});
});