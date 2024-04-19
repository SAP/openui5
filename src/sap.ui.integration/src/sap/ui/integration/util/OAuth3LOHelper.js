/*!
 * ${copyright}
 */

sap.ui.define([], function () {
	"use strict";

	/**
	 * Map of consents and the cards that are waiting for them.
	 * @private
	 * @constant {Map<string, Set<Card>>}
	 */
	const mConsents = new Map();

	/**
	 * Utility class helping with OAuth 3LO flow handling.
	 *
	 * @author SAP SE
	 * @version ${version}
	 *
	 * @private
	 * @alias sap.ui.integration.util.OAuth3LOHelper
	 */
	const OAuth3LOHelper = { };

	/**
	 * Opens a new window with the consent URL.
	 * @param {string} sConsentUrl The URL to open in the consent window.
	 * @param {object} oPopupSettings The settings for the popup window.
	 */
	OAuth3LOHelper.openConsentWindow = function (sConsentUrl, oPopupSettings) {
		const iWidth = oPopupSettings?.width || 400;
		const iHeight = oPopupSettings?.height || 400;
		const iLeft = (screen.width / 2) - (iWidth / 2);
		const iTop = (screen.height / 2) - (iHeight / 2);

		const sWindowConfig = `noopener, noreferrer, popup, toolbar=no, location=no, directories=no, status=no, menubar=no, scrollbars=no, resizable=no, copyhistory=no, width=${iWidth}, height=${iHeight}, top=${iTop}, left=${iLeft}`;

		window.open(sConsentUrl, "_blank", sWindowConfig);
	};

	/**
	 * Checks if the consent is needed.
	 * @param {Response} oResponse The response object.
	 * @returns {boolean} Whether the consent is needed.
	 */
	OAuth3LOHelper.needsConsent = function (oResponse) {
		return oResponse.status === 502 && oResponse.headers.get("sap-3lo-flow");
	};

	/**
	 * Checks if there is an error in the OAuth 3LO flow.
	 * @param {Response} oResponse The response object.
	 * @returns {boolean} True if there is an error in the OAuth 3LO flow.
	 */
	OAuth3LOHelper.hasConsentError = function (oResponse) {
		if (!OAuth3LOHelper.needsConsent(oResponse)) {
			return false;
		}

		const oHeader = OAuth3LOHelper.readHeader(oResponse);
		return oHeader.status === "error";
	};

	/**
	 * Reads the header settings from the response.
	 * @param {Response} oResponse The response object.
	 * @returns {object} The header settings.
	 */
	OAuth3LOHelper.readHeader = function (oResponse) {
		let sHeader = oResponse.headers.get("sap-3lo-flow");

		if (!sHeader) {
			return null;
		}

		sHeader = atob(sHeader);

		return JSON.parse(sHeader);
	};

	/**
	 * Register the card to wait for the consent.
	 * @param {string} sConsentId The consent ID for which this card will be waiting.
	 * @param {Card} oCard The card that will be waiting for the consent.
	 */
	OAuth3LOHelper.registerCard = function (sConsentId, oCard) {
		let mCards = mConsents.get(sConsentId);

		if (!mCards) {
			mCards = new Set();
			mConsents.set(sConsentId, mCards);
		}

		mCards.add(oCard);
	};

	/**
	 * Unregister the card from the consent.
	 * @param {string} sConsentId The consent ID for which this card has received consent.
	 * @param {Card} oCard The card that has received the consent.
	 */
	OAuth3LOHelper.unregisterCard = function (sConsentId, oCard) {
		const mCards = mConsents.get(sConsentId);

		mCards?.delete(oCard);
	};

	/**
	 * Called when the consent is given.
	 * @param {string} sConsentId The consent ID for which this card has received consent.
	 */
	OAuth3LOHelper.handleConsent = function (sConsentId) {
		const mCards = mConsents.get(sConsentId);

		if (!mCards) {
			return;
		}

		for (const oCard of mCards) {
			oCard.refreshData();
		}

		mConsents.delete(sConsentId);
	};

	return OAuth3LOHelper;
});