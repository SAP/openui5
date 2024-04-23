/*!
* ${copyright}
*/
sap.ui.define([
	"sap/ui/integration/Extension",
	"sap/ui/integration/util/OAuth3LOHelper",
	"sap/ui/integration/util/Utils",
	"sap/m/IllustratedMessageType",
	"sap/ui/integration/library",
	"sap/ui/core/library",
	"sap/m/library",
	"sap/base/Log"
	], function (Extension, OAuth3LOHelper, Utils, IllustratedMessageType, library, coreLibrary, mLibrary, Log) {
	"use strict";

	const AriaHasPopup = coreLibrary.aria.HasPopup;

	const CardBlockingMessageType = library.CardBlockingMessageType;

	const ButtonType = mLibrary.ButtonType;

	/**
	 * Extension for OAuth 3LO.
	 *
	 * @author SAP SE
	 * @version ${version}
	 *
	 * @private
	 * @since 1.124
	 * @alias sap.ui.integration.extensions.OAuth3LO
	 */
	const OAuth3LO = Extension.extend("sap.ui.integration.extensions.OAuth3LO");

	/**
	 * @override
	 */
	OAuth3LO.prototype.overrideBlockingMessage = function (oResponse) {
		if (!oResponse) {
			return null;
		}

		if (!OAuth3LOHelper.needsConsent(oResponse)) {
			return null;
		}

		if (OAuth3LOHelper.hasConsentError(oResponse)) {
			return this._createConsentErrorMessage(oResponse);
		}

		return this._createConsentMessage(oResponse);
	};

	/**
	 * @override
	 */
	OAuth3LO.prototype.fetch = async function (sResource, mOptions, mRequestSettings) {
		const oResponse = await Extension.prototype.fetch.apply(this, arguments);

		if (OAuth3LOHelper.needsConsent(oResponse)) {
			this._aPollingRequest = [sResource, mOptions, mRequestSettings];
		}

		return oResponse;
	};

	/**
	 * @override
	 */
	OAuth3LO.prototype.exit = function () {
		Extension.prototype.exit.apply(this, arguments);

		if (this._sConsentId) {
			OAuth3LOHelper.unregisterCard(this._sConsentId, this.getCard());
		}

		if (this._oPolling) {
			this._oPolling.stop();
			this._oPolling = null;
		}
	};

	/**
	 * Creates a consent message to show in the card.
	 * @private
	 * @param {Response} oResponse The response object.
	 * @returns	{object} The consent message.
	 */
	OAuth3LO.prototype._createConsentMessage = function (oResponse) {
		const oCard = this.getCard();
		const oHeader =	OAuth3LOHelper.readHeader(oResponse);

		this._sConsentId = oHeader.consent.id;
		OAuth3LOHelper.registerCard(this._sConsentId, oCard);

		const oUrl = new URL(oHeader.consent.url, window.location.href);
		return {
			type: CardBlockingMessageType.Information,
			illustrationType: IllustratedMessageType.Connection,
			title: oHeader.title || oCard.getTranslatedText("CARD_OAUTH3LO_FALLBACK_TITLE"),
			description: oHeader.description || oCard.getTranslatedText("CARD_OAUTH3LO_FALLBACK_DESCRIPTION", [oUrl.origin]),
			additionalContent: [
				{
					text: oHeader.buttonText || oCard.getTranslatedText("CARD_OAUTH3LO_FALLBACK_BUTTON_TEXT"),
					buttonType: ButtonType.Accept,
					ariaHasPopup: AriaHasPopup.Dialog,
					press: () => {
						this._triggerConsent(oHeader);
					}
				}
			]
		};
	};

	/**
	 * Creates an error message when the card received a consent related error.
	 * @private
	 * @param {Response} oResponse The response object.
	 * @returns	{object} The consent message.
	 */
	OAuth3LO.prototype._createConsentErrorMessage = function (oResponse) {
		const oCard = this.getCard();
		const oHeader =	OAuth3LOHelper.readHeader(oResponse);

		Log.error(oHeader.message, this);

		return {
			type: CardBlockingMessageType.Error,
			illustrationType: IllustratedMessageType.ErrorScreen,
			title: oCard.getTranslatedText("CARD_ERROR_CONFIGURATION_TITLE"),
			description: oCard.getTranslatedText("CARD_ERROR_CONFIGURATION_DESCRIPTION")
		};
	};

	/**
	 * Triggers the consent flow.
	 * @private
	 * @param {object} oHeader The header settings from the response.
	 * @returns {void}
	 */
	OAuth3LO.prototype._triggerConsent = function (oHeader) {
		const sConsentUrl = oHeader.consent.url;

		if (!sConsentUrl) {
			Log.error("Consent url for OAuth3LO is empty.", this);
			return;
		}

		OAuth3LOHelper.openConsentWindow(sConsentUrl, oHeader.popupWindow);

		window.addEventListener("focus", () => {
			this._startPolling(oHeader);
		}, { once: true });
	};

	/**
	 * Starts the polling for the consent.
	 * @param {object} oHeader The header settings from the response.
	 */
	OAuth3LO.prototype._startPolling = function (oHeader) {
		const oPollingSettings = oHeader.polling;

		if (this._oPolling) {
			this._oPolling.stop();
		}

		this._oPolling = Utils.polling(
			async () => {
				Log.info("Polling for 3LO consent.", this);

				const oResponse = await Extension.prototype.fetch.apply(this, this._aPollingRequest);

				if (OAuth3LOHelper.hasConsentError(oResponse)) {
					this.getCard().showBlockingMessage(this._createConsentErrorMessage(oResponse));
					return true;
				}

				if (OAuth3LOHelper.needsConsent(oResponse)) {
					// continue polling
					return false;
				}

				if (oResponse.ok) {
					OAuth3LOHelper.handleConsent(oHeader.consent.id);
				}

				return true;
			},
			oPollingSettings.frequency,
			oPollingSettings.maximum
		);
	};

	return OAuth3LO;
});
