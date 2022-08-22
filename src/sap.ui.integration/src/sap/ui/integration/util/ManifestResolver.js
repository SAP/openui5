/*!
 * ${copyright}
 */
sap.ui.define([
	"sap/ui/integration/util/BindingHelper",
	"sap/ui/integration/util/BindingResolver",
	"sap/ui/integration/util/Utils"
], function (
	BindingHelper,
	BindingResolver,
	Utils
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
	 * @returns {Promise<string>} Promise which resolves with stringified manifest with resolved bindings and translations or rejects with an error message if there is an error.
	 * @private
	 * @ui5-restricted Mobile SDK
	 */
	ManifestResolver.resolveCard = function (oCard) {
		oCard.startManifestProcessing();

		return ManifestResolver._awaitReadyEvent(oCard)
			.then(ManifestResolver._handleCardReady);
	};

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

	ManifestResolver._handleCardReady = function (oCard) {
		var oManifest = oCard.getManifestEntry("/");
		var aFilters = [];
		var aErrors = oCard.getFundamentalErrors();

		if (aErrors.length) {
			return Promise.reject(aErrors.join(" "));
		}

		try {
			if (oCard.getAggregation("_filterBar")) {
				aFilters =  oCard.getAggregation("_filterBar")._getFilters().map(function (oFilter) {
					return ["/sap.card/configuration/filters/" + oFilter.getKey(), oFilter];
				});
			}

			// Process card sections in order - nested sections with "data" have to be processed first
			aFilters.concat([
				["/sap.card/content", oCard.getCardContent()],
				["/sap.card/header", oCard.getCardHeader()],
				["/sap.card", oCard]
			]).filter(function (aPathAndContext) {
				return !!oCard.getManifestEntry(aPathAndContext[0]); // only resolve existing sections
			}).forEach(function (aPathAndContext) {
				var sManifestPath = aPathAndContext[0];
				var oContext = aPathAndContext[1];
				var oSubConfig;
				var sDataPath;

				if (oContext.getStaticConfiguration) {
					oSubConfig = oContext.getStaticConfiguration();
				} else if (oContext._oCardOriginalContent && oContext._oCardOriginalContent.getStaticConfiguration) {
					oSubConfig = oContext._oCardOriginalContent.getStaticConfiguration();
				} else {
					oSubConfig = Utils.getNestedPropertyValue(oManifest, sManifestPath);
				}

				if (oSubConfig.data) {
					sDataPath = oSubConfig.data.path;
					delete oSubConfig.data;
				}

				oSubConfig = BindingHelper.createBindingInfos(oSubConfig, oCard.getBindingNamespaces());
				oSubConfig = BindingResolver.resolveValue(oSubConfig, oContext, sDataPath);
				Utils.setNestedPropertyValue(oManifest, sManifestPath, oSubConfig);
			});

			return JSON.stringify(oManifest);
		} catch (ex) {
			return Promise.reject(ex);
		}
	};

	return ManifestResolver;
});