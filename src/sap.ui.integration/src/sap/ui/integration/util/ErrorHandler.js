/*!
 * ${copyright}
 */
sap.ui.define([
	"./Utils",
	"../library",
	"sap/m/IllustratedMessageType",
	"sap/ui/base/BindingParser"
], function (
	Utils,
	library,
	IllustratedMessageType,
	BindingParser
) {
	"use strict";

	var CardBlockingMessageType = library.CardBlockingMessageType;

	function formatJson(oJson) {
		return BindingParser.complexParser.escape(JSON.stringify(oJson, null, 4));
	}

	function formatRequest(oRequest) {
		if (oRequest.options) {
			oRequest.options.body = oRequest.body && oRequest.body.toString();
			oRequest.options.headers = Object.fromEntries(oRequest.options.headers);
		}

		return formatJson(oRequest);
	}

	/**
	 * Utility class for handling errors in the cards.
	 *
	 * @author SAP SE
	 * @version ${version}
	 *
	 * @private
	 * @ui5-restricted
	 * @alias sap.ui.integration.util.ErrorHandler
	 */
	var ErrorHandler = {};

	ErrorHandler.configureDataRequestErrorInfo = function (mErrorInfo, oCard) {
		var oResponse = mErrorInfo.requestErrorParams.response,
			sResponseText = mErrorInfo.requestErrorParams.responseText,
			sIllustrationType = IllustratedMessageType.ErrorScreen,
			sTitle = oResponse ? oResponse.status + " " + oResponse.statusText : oCard.getTranslatedText("CARD_ERROR_OCCURED"),
			sDescription = oResponse ? oCard.getTranslatedText("CARD_ERROR_REQUEST_DESCRIPTION") : mErrorInfo.requestErrorParams.message.toString(),
			requestSettings = mErrorInfo.requestSettings,
			sUrl = requestSettings.request ? requestSettings.request.url : "",
			sDetails = oCard.getTranslatedText("CARD_ERROR_REQUEST_DETAILS", [sUrl]);

		if (oResponse) {
			switch (oResponse.status) {
				case 0:
					switch (oResponse.statusText) {
						case "timeout":
							sIllustrationType = IllustratedMessageType.ReloadScreen;
							sTitle = "408 " + oCard.getTranslatedText("CARD_ERROR_REQUEST_TIMEOUT_TITLE");
							sDetails = oCard.getTranslatedText("CARD_ERROR_REQUEST_TIMEOUT_DETAILS", [sUrl]);
							break;
						default:
							sIllustrationType = IllustratedMessageType.PageNotFound;
							sTitle = "404 " + oCard.getTranslatedText("CARD_ERROR_REQUEST_NOTFOUND_TITLE");
							break;
					}
					break;
				case 404:
					sIllustrationType = IllustratedMessageType.PageNotFound;
					if (!oResponse.statusText) {
						sTitle = "404 " + oCard.getTranslatedText("CARD_ERROR_REQUEST_NOTFOUND_TITLE");
					}
					break;
				case 408:
					sIllustrationType = IllustratedMessageType.ReloadScreen;
					sDetails = oCard.getTranslatedText("CARD_ERROR_REQUEST_TIMEOUT_DETAILS", [sUrl]);
					break;
				case 401: // Unauthorized
				case 403: // Forbidden
				case 511: // Network Authentication Required
					sDescription = oCard.getTranslatedText("CARD_ERROR_REQUEST_ACCESS_DENIED_DESCRIPTION");
					break;
			}
		}

		sDetails = sTitle + "\n" +
			sDescription + "\n\n";

		if (oResponse) {
			sDetails += oCard.getTranslatedText("CARD_LOG_MSG") + "\n" +
				oResponse.statusText + "\n\n";
		}

		sDetails += oCard.getTranslatedText("CARD_REQUEST_SETTINGS") + "\n" +
			formatJson(requestSettings) + "\n\n";

		if (oResponse) {
			sDetails += oCard.getTranslatedText("CARD_REQUEST") + "\n" +
				formatRequest(mErrorInfo.requestErrorParams.settings) + "\n\n" +
				oCard.getTranslatedText("CARD_RESPONSE_HEADERS") + "\n" +
				formatJson(Object.fromEntries(oResponse.headers)) + "\n\n";
		}

		if (oResponse && sResponseText) {
			sDetails += oCard.getTranslatedText("CARD_RESPONSE") + "\n";

			if (Utils.isJson(sResponseText)) {
				sDetails += formatJson(JSON.parse(sResponseText));
			} else {
				sDetails += BindingParser.complexParser.escape(sResponseText);
			}

			sDetails += "\n\n";
		}

		sDetails += oCard.getTranslatedText("CARD_MANIFEST") + "\n" + formatJson(oCard._oCardManifest.getJson()) + "\n\n";

		sDetails += oCard.getTranslatedText("CARD_STACK_TRACE") + "\n" + new Error().stack;

		return {
			type: CardBlockingMessageType.Error,
			illustrationType: sIllustrationType,
			title: sTitle,
			description: sDescription,
			details: sDetails,
			httpResponse: oResponse
		};
	};

	ErrorHandler.configureErrorInfo = function (mErrorInfo, oCard) {
		var sDetails = oCard.getTranslatedText("CARD_MANIFEST") + "\n" + formatJson(oCard._oCardManifest.getJson()) + "\n\n" +
				oCard.getTranslatedText("CARD_STACK_TRACE") + "\n" + new Error().stack;

		return {
			type: CardBlockingMessageType.Error,
			illustrationType: mErrorInfo.illustrationType,
			title: mErrorInfo.title,
			description: mErrorInfo.description,
			details: sDetails
		};
	};

	return ErrorHandler;
});
