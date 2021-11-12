/*!
 * ${copyright}
 */
sap.ui.define([
	"sap/ui/integration/widgets/Card",
	"sap/ui/integration/util/BindingHelper",
	"sap/ui/integration/util/BindingResolver",
	"sap/ui/integration/util/Utils"
], function (
	Card,
	BindingHelper,
	BindingResolver,
	Utils
) {
	"use strict";

	/**
	 * Util class for preprocessing of card manifests.
	 * @namespace sap.ui.integration.ManifestResolver
	 * @since 1.97
	 * @experimental 1.97
	 * @private
	 * @ui5-restricted shell-toolkit
	 */
	var ManifestResolver = {};

	/**
	 * Resolves manifest.
	 * @memberof sap.ui.integration.ManifestResolver
	 * @alias sap.ui.integration.ManifestResolver.resolve
	 * @param {object} oManifest Card manifest
	 * @param {string} sBaseUrl The base URL of the card manifest
	 * @returns {Promise<string>} Stringified manifest without any bindings
	 * @private
	 * @ui5-restricted shell-toolkit
	 */
	ManifestResolver.resolve = function (oManifest, sBaseUrl) {
		var oCard = new Card({
			baseUrl: sBaseUrl,
			manifest: oManifest
		});

		oCard.startManifestProcessing();

		return ManifestResolver._awaitReadyEvent(oCard)
			.then(ManifestResolver._handleCardReady);
	};

	ManifestResolver._awaitReadyEvent = function (oCard) {
		return new Promise(function (resolve, reject) {
			oCard.attachEvent("_ready", function (e) {
				resolve(oCard);
			});
		});
	};

	ManifestResolver._handleCardReady = function (oCard) {
		var oManifest = oCard.getManifestEntry("/");
		var aFilters = [];

		if (oCard.getAggregation("_filterBar")) {
			aFilters =  oCard.getAggregation("_filterBar").getItems().map(function (oFilter) {
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

			if (oContext.getStaticConfiguration) {
				oSubConfig = oContext.getStaticConfiguration();
			} else {
				oSubConfig = Utils.getNestedPropertyValue(oManifest, sManifestPath);
			}

			if (oSubConfig.data) {
				var sDataPath = oSubConfig.data.path;
				delete oSubConfig.data;
				oSubConfig = BindingHelper.createBindingInfos(oSubConfig, oCard.getBindingNamespaces());
				oSubConfig = BindingResolver.resolveValue(oSubConfig, oContext, sDataPath);
			}

			Utils.setNestedPropertyValue(oManifest, sManifestPath, oSubConfig);
		});

		oCard.destroy();
		return JSON.stringify(oManifest);
	};

	return ManifestResolver;
});