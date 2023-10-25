/*!
 * ${copyright}
 */
sap.ui.define([
	"sap/ui/core/Lib",
	"sap/ui/integration/util/BindingHelper",
	"sap/ui/integration/util/BindingResolver",
	"sap/ui/integration/util/Utils",
	"sap/m/IllustratedMessageType",
	"sap/m/IllustratedMessageSize",
	"sap/base/Log"
], function (
	Library,
	BindingHelper,
	BindingResolver,
	Utils,
	IllustratedMessageType,
	IllustratedMessageSize,
	Log
) {
	"use strict";

	/**
	 * Util class for preprocessing of card manifests.
	 * @namespace sap.ui.integration.util.ManifestResolver
	 * @since 1.97
	 * @experimental 1.97
	 * @private
	 * @ui5-restricted Mobile SDK
	 */
	var ManifestResolver = {};

	/**
	 * Resolves a card and returns its resolved manifest.
	 * @memberof sap.ui.integration.util.ManifestResolver
	 * @alias sap.ui.integration.util.ManifestResolver.resolveCard
	 * @param {sap.ui.integration.widgets.Card} oCard The card to resolve.
	 * @returns {Promise<object>} Promise which resolves with manifest with resolved bindings and translations or rejects with an error message if there is an error.
	 * @private
	 * @ui5-restricted Mobile SDK
	 */
	ManifestResolver.resolveCard = function (oCard) {
		oCard.startManifestProcessing();

		return ManifestResolver._awaitReadyEvent(oCard)
			.then(function () {
				return oCard.getModel("context").waitForPendingProperties();
			})
			.then(function () {
				return ManifestResolver._handleCardReady(oCard);
			})
			.catch(function (oError) {
				return ManifestResolver._handleCardSevereError(oCard, oError);
			});
	};

	/**
	 * Waits for the _ready event of the card
	 * @private
	 * @param {sap.ui.integration.widgets.Card} oCard The card.
	 * @returns {Promise} A promise which is resolved when the _ready event is fired.
	 */
	ManifestResolver._awaitReadyEvent = function (oCard) {
		if (oCard.isReady()) {
			return Promise.resolve(oCard);
		}

		return new Promise(function (resolve, reject) {
			oCard.attachEvent("_ready", function (e) {
				resolve(oCard);
			});
		});
	};

	/**
	 * Resolves the manifest when the card is ready.
	 * @private
	 * @param {sap.ui.integration.widgets.Card} oCard The card.
	 * @returns {Promise<object>} Resolved manifest.
	 */
	ManifestResolver._handleCardReady = function (oCard) {
		var oManifest = oCard.getManifestEntry("/"),
			aFilters = [],
			aErrors = oCard.getSevereErrors(),
			oContentMessage = oCard.getContentMessage();

		if (aErrors.length) {
			return Promise.reject(aErrors.join(" "));
		}

		try {
			// Prepare binding infos only once for all sections
			oManifest = BindingHelper.createBindingInfos(oManifest, oCard.getBindingNamespaces());

			if (oCard.getAggregation("_filterBar")) {
				aFilters =  oCard.getAggregation("_filterBar")._getFilters().map(function (oFilter) {
					return ["/sap.card/configuration/filters/" + oFilter.getKey(), oFilter];
				});
			}

			// Process card sections in order - nested sections with "data" have to be processed first
			aFilters.concat([
				["/sap.card/content", oCard.getCardContent()],
				["/sap.card/header", oCard.getCardHeader()],
				["/sap.card/footer", oCard.getCardFooter()],
				["/sap.card", oCard]
			]).filter(function (aPathAndContext) {
				return !!oCard.getManifestEntry(aPathAndContext[0]); // only resolve existing sections
			}).forEach(function (aPathAndContext) {
				var sManifestPath = aPathAndContext[0];
				var oContext = aPathAndContext[1];
				var oSubConfig;
				var sDataPath;

				if (oContentMessage && sManifestPath === "/sap.card/content") {
					oSubConfig = {
						message: oContentMessage
					};
				} else if (oContext.getStaticConfiguration) {
					oSubConfig = oContext.getStaticConfiguration(Utils.getNestedPropertyValue(oManifest, sManifestPath));
				} else {
					oSubConfig = Utils.getNestedPropertyValue(oManifest, sManifestPath);
				}

				if (oContext.extendStaticConfiguration) {
					oContext.extendStaticConfiguration(oSubConfig);
				}

				if (oSubConfig.data) {
					sDataPath = oSubConfig.data.path;
					delete oSubConfig.data;
				}

				// Resolve only binding infos which are left unresolved, we must not resolve sections twice.
				oSubConfig = BindingResolver.resolveValue(oSubConfig, oContext, sDataPath, true);
				Utils.setNestedPropertyValue(oManifest, sManifestPath, oSubConfig);
			});

			return Promise.resolve(JSON.parse(JSON.stringify(oManifest))); // remove undefined values
		} catch (ex) {
			return Promise.reject(ex);
		}
	};

	/**
	 * Resolves the manifest if there is a severe error. This function makes sure that we always return a manifest.
	 * @private
	 * @param {sap.ui.integration.widgets.Card} oCard The card.
	 * @param {object} oError The error which was caught.
	 * @returns {object} Resolved manifest.
	 */
	ManifestResolver._handleCardSevereError = function (oCard, oError) {
		var oManifest = oCard.getManifestEntry("/"),
			oResourceBundle = Library.getResourceBundleFor("sap.ui.integration");

		Log.error(oError, "sap.ui.integration.util.ManifestResolver");

		if (oManifest === null) {
			oManifest = {};
		}

		oManifest["sap.card"] = {
			content: {
				message: {
					type: "error",
					title: oResourceBundle.getText("CARD_ERROR_CONFIGURATION_TITLE"),
					description: oResourceBundle.getText("CARD_ERROR_CONFIGURATION_DESCRIPTION"),
					details: oError.toString(),
					illustrationType: IllustratedMessageType.SimpleError,
					illustrationSize: IllustratedMessageSize.Spot
				}
			}
		};

		return JSON.parse(JSON.stringify(oManifest)); // remove undefined values
	};

	return ManifestResolver;
});