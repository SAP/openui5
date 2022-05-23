/*!
 * ${copyright}
 */
sap.ui.define([
	"./BaseFactory",
	"sap/ui/integration/cards/actions/CardActions",
	"sap/ui/integration/cards/AdaptiveContent",
	"sap/ui/integration/cards/AnalyticalContent",
	"sap/ui/integration/cards/AnalyticsCloudContent",
	"sap/ui/integration/cards/CalendarContent",
	"sap/ui/integration/cards/ComponentContent",
	"sap/ui/integration/cards/ListContent",
	"sap/ui/integration/cards/ObjectContent",
	"sap/ui/integration/cards/TableContent",
	"sap/ui/integration/cards/TimelineContent",
	"sap/ui/integration/cards/WebPageContent"
], function (
	BaseFactory,
	CardActions,
	AdaptiveContent,
	AnalyticalContent,
	AnalyticsCloudContent,
	CalendarContent,
	ComponentContent,
	ListContent,
	ObjectContent,
	TableContent,
	TimelineContent,
	WebPageContent
) {
	"use strict";

	/**
	 * Constructor for a new <code>ContentFactory</code>.
	 *
	 * @class
	 *
	 * @extends sap.ui.integration.util.BaseFactory
	 *
	 * @author SAP SE
	 * @version ${version}
	 *
	 * @constructor
	 * @private
	 * @alias sap.ui.integration.util.ContentFactory
	 */
	var ContentFactory = BaseFactory.extend("sap.ui.integration.util.ContentFactory");

	ContentFactory.prototype.create = function (mConfig) {
		var oCard = this._oCard,
			sType = mConfig.cardType;

		return new Promise(function (resolve, reject) {
			var Content = this.getClass(sType);

			if (!Content) {
				reject(sType.toUpperCase() + " content type is not supported.");
				return;
			}

			var oContent = new Content();

			// Set the card ID as association to the content
			oContent.setCard(oCard);

			if (oContent instanceof AdaptiveContent) {
				oContent.setCardDataProvider(oCard._oDataProvider);
			}

			oContent.loadDependencies(mConfig.cardManifest)
				.then(function () {
					if ((mConfig.cardManifest && mConfig.cardManifest.isDestroyed()) ||
						(mConfig.dataProviderFactory && mConfig.dataProviderFactory.isDestroyed())) {
						// reject creating of the content if a new manifest is loaded meanwhile
						reject();
						return;
					}

					var oActions = new CardActions({
						card: oCard
					});

					oContent._sAppId = mConfig.appId;
					oContent.setServiceManager(mConfig.serviceManager);
					oContent.setDataProviderFactory(mConfig.dataProviderFactory);
					oContent.setIconFormatter(mConfig.iconFormatter);
					oContent.setActions(oActions);

					oCard.processDestinations(mConfig.contentManifest).then(function (mProcessedContentManifest) {
						oContent.setConfiguration(mProcessedContentManifest, sType);
						resolve(oContent);
					});
				})
				.catch(function (sError) {
					reject(sError);
				});
		}.bind(this));
	};

	/**
	 * Returns the class that represents the content of the given type.
	 * @param {string} sType The type.
	 * @returns {sap.ui.integration.cards.BaseContent} The corresponding class.
	 */
	ContentFactory.prototype.getClass = function (sType) {
		switch (sType.toLowerCase()) {
			case "adaptivecard":
				return AdaptiveContent;
			case "analytical":
				return AnalyticalContent;
			case "analyticscloud":
				return AnalyticsCloudContent;
			case "calendar":
				return CalendarContent;
			case "component":
				return ComponentContent;
			case "list":
				return ListContent;
			case "object":
				return ObjectContent;
			case "table":
				return TableContent;
			case "timeline":
				return TimelineContent;
			case "webpage":
				return WebPageContent;
			default:
				return null;
		}
	};

	return ContentFactory;
});
