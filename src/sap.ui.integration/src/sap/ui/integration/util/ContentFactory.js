/*!
 * ${copyright}
 */
sap.ui.define([
	"./BaseFactory",
	"sap/base/Log",
	"sap/m/IllustratedMessageType",
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
	Log,
	IllustratedMessageType,
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
			sType = mConfig.cardType,
			oExtension = oCard.getAggregation("_extension");

		var Content = this.getClass(sType);

		if (!Content) {
			throw new Error(sType.toUpperCase() + " content type is not supported.");
		}

		var oContent = new Content({
			card: oCard
		});

		if (oContent instanceof AdaptiveContent) {
			oContent.setCardDataProvider(oCard._oDataProvider);
		}

		oContent.setServiceManager(mConfig.serviceManager);
		oContent.setDataProviderFactory(mConfig.dataProviderFactory);
		oContent.setIconFormatter(mConfig.iconFormatter);
		oContent.setActions(new CardActions({
			card: oCard
		}));
		oContent.setConfiguration(mConfig.contentManifest);
		oContent.setNoDataConfiguration(mConfig.noDataConfiguration);

		if (!(oContent instanceof AdaptiveContent)) {
			oContent.setDataConfiguration(mConfig.contentManifest.data);
		}

		oContent.setLoadDependenciesPromise(
			Promise.all([
				oContent.loadDependencies(mConfig.cardManifest),
				oExtension ? oExtension.loadDependencies() : Promise.resolve()
			]).then(function () {
				return true;
			}).catch(function (sError) {
				if (sError) {
					Log.error(sError, "sap.ui.integration.util.ContentFactory");
					oCard._handleError({
						type: IllustratedMessageType.ErrorScreen,
						title: oCard.getTranslatedText("CARD_DATA_LOAD_DEPENDENCIES_ERROR"),
						description: oCard.getTranslatedText("CARD_ERROR_REQUEST_DESCRIPTION"),
						details: sError
					});
				}
				return false;
			})
		);

		oContent.getLoadDependenciesPromise()
			.then(function (bLoadSuccessful) {
				if (bLoadSuccessful && !oContent.isDestroyed()) {
					oContent.applyConfiguration();
				}
			});

		return oContent;
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
