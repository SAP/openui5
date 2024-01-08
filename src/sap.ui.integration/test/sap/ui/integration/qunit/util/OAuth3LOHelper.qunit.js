/* global QUnit*/

sap.ui.define([
	"sap/ui/integration/util/OAuth3LOHelper"
], function (
	OAuth3LOHelper
) {
	"use strict";
	QUnit.config.reorder = false;

	const getResponse = (oHeaderForConsent) => {
		return new Response("", {
			status: 502,
			headers: new Headers({
				"sap-3lo-flow": btoa(JSON.stringify(oHeaderForConsent))
			})
		});
	};

	const oHeaderForConsent = {
		status: "ok",
		popupWindow: {
			height: "500",
			width: "400"
		},
		consent: {
			id: "Q1uO53KEQXO14-ae03lnd",
			url: "/consent"
		},
		polling: {
			frequency: 3000,
			maximum: 600000
		},
		buttonText: "Give Consent",
		title: "Your Consent is Needed",
		description: "This card accesses which needs consent."
	};

	const oResponseForConsent = getResponse(oHeaderForConsent);

	const oHeaderError = {
		status: "error",
		message: "Error message"
	};

	const oResponseError = getResponse(oHeaderError);

	const oResponseNoConsent = new Response("", { status: 200 });

	QUnit.module("OAuth3LOHelper");

	QUnit.test("Method openConsentWindow()", function (assert) {
		const oFakeWindow = { };
		const fnWindowOpenStub = this.stub(window, "open").returns(oFakeWindow);

		OAuth3LOHelper.openConsentWindow("/consent", { width: 100, height: 100 });

		assert.ok(fnWindowOpenStub.calledOnce, "Popup was opened.");

		const [sUrl, sTarget, sOptions] = fnWindowOpenStub.args[0];
		assert.strictEqual(sUrl, "/consent", "Popup was opened with correct URL.");
		assert.strictEqual(sTarget, "_blank", "Popup was opened with correct target.");

		assert.ok(sOptions.indexOf("popup") > -1, "The new window is a popup.");
		assert.ok(sOptions.indexOf("noopener") > -1, "Popup has noopener.");
		assert.ok(sOptions.indexOf("noreferrer") > -1, "Popup has noreferrer.");

		assert.ok(sOptions.indexOf("width=100") > -1, "Popup has correct width.");
		assert.ok(sOptions.indexOf("height=100") > -1, "Popup has correct height.");
	});

	QUnit.test("Method needsConsent()", function (assert) {
		assert.ok(OAuth3LOHelper.needsConsent(oResponseForConsent), "The consent is needed.");

		assert.ok(OAuth3LOHelper.needsConsent(oResponseError), "The consent is needed even if there is an error.");

		assert.notOk(OAuth3LOHelper.needsConsent(oResponseNoConsent), "Consent is not needed.");
	});

	QUnit.test("Method hasConsentError()", function (assert) {
		assert.ok(OAuth3LOHelper.hasConsentError(oResponseError), "There is error.");

		assert.notOk(OAuth3LOHelper.hasConsentError(oResponseForConsent),  "There is no error.");

		assert.notOk(OAuth3LOHelper.hasConsentError(oResponseNoConsent),  "There is no error when no consent needed.");
	});

	QUnit.test("Method readHeader()", function (assert) {
		const oHeader1 = OAuth3LOHelper.readHeader(oResponseForConsent);
		assert.deepEqual(oHeader1, oHeaderForConsent, "Header is read correctly.");

		const oHeader2 = OAuth3LOHelper.readHeader(oResponseError);
		assert.deepEqual(oHeader2, oHeaderError, "Header with error is read correctly.");

		const oHeader3 = OAuth3LOHelper.readHeader(oResponseNoConsent);
		assert.notOk(oHeader3, "No header when consent not needed.");
	});

	QUnit.test("Method registerCard(), unregisterCard() and handleConsent()", function (assert) {
		const sConsentId1 = "1";
		const sConsentId2 = "2";

		const oCard1 = { refreshData: this.spy() };
		const oCard2 = { refreshData: this.spy() };
		const oCard3 = { refreshData: this.spy() };
		const oCard4 = { refreshData: this.spy() };

		// register 3 cards for consent 1
		OAuth3LOHelper.registerCard(sConsentId1, oCard1);
		OAuth3LOHelper.registerCard(sConsentId1, oCard2);
		OAuth3LOHelper.registerCard(sConsentId1, oCard3);

		// unregister card 2 from consent 1
		OAuth3LOHelper.unregisterCard(sConsentId1, oCard2);

		// register card 4 for consent 2
		OAuth3LOHelper.registerCard(sConsentId2, oCard4);

		// simulate consent given
		OAuth3LOHelper.handleConsent(sConsentId1);

		assert.ok(oCard1.refreshData.calledOnce, "Data is refreshed for registered card 1.");
		assert.ok(oCard3.refreshData.calledOnce, "Data is refreshed for registered card 3.");

		assert.ok(oCard2.refreshData.notCalled, "Data is not refreshed for unregistered card 2.");
		assert.ok(oCard4.refreshData.notCalled, "Data is not refreshed for card 4 from different consent.");

		OAuth3LOHelper.unregisterCard(sConsentId2, oCard4);
		OAuth3LOHelper.handleConsent(sConsentId2);
		assert.ok(oCard4.refreshData.notCalled, "Data is not refreshed for card 4 which was unregistered.");
	});
});