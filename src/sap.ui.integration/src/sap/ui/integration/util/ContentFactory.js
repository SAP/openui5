/*!
 * ${copyright}
 */
sap.ui.define([
	"./BindingHelper",
	"./CardActions",
	"sap/ui/base/Object",
	"sap/ui/integration/cards/AdaptiveContent",
	"sap/ui/integration/cards/AnalyticalContent",
	"sap/ui/integration/cards/AnalyticsCloudContent",
	"sap/ui/integration/cards/CalendarContent",
	"sap/ui/integration/cards/ComponentContent",
	"sap/ui/integration/cards/ListContent",
	"sap/ui/integration/cards/ObjectContent",
	"sap/ui/integration/cards/TableContent",
	"sap/ui/integration/cards/TimelineContent"
], function (
	BindingHelper,
	CardActions,
	BaseObject,
	AdaptiveContent,
	AnalyticalContent,
	AnalyticsCloudContent,
	CalendarContent,
	ComponentContent,
	ListContent,
	ObjectContent,
	TableContent,
	TimelineContent
) {
	"use strict";

	/**
	 * Constructor for a new <code>ContentFactory</code>.
	 *
	 * @class
	 *
	 * @extends sap.ui.base.Object
	 *
	 * @author SAP SE
	 * @version ${version}
	 *
	 * @constructor
	 * @private
	 * @alias sap.ui.integration.util.ContentFactory
	 */
	var ContentFactory = BaseObject.extend("sap.ui.integration.util.ContentFactory", {
		metadata: {
			library: "sap.ui.integration"
		},
		constructor: function (oCard) {
			BaseObject.call(this);

			this._oCard = oCard;
		}
	});

	ContentFactory.prototype.create = function (mConfig) {
		var oCard = this._oCard,
			sType = mConfig.cardType;

		return new Promise(function (resolve, reject) {
			var oContent = null;

			switch (sType.toLowerCase()) {
				case "adaptivecard":
					oContent = new AdaptiveContent(); break;
				case "analytical":
					oContent = new AnalyticalContent(); break;
				case "analyticscloud":
					oContent = new AnalyticsCloudContent(); break;
				case "calendar":
					oContent = new CalendarContent(); break;
				case "component":
					oContent = new ComponentContent(); break;
				case "list":
					oContent = new ListContent(); break;
				case "object":
					oContent = new ObjectContent(); break;
				case "table":
					oContent = new TableContent(); break;
				case "timeline":
					oContent = new TimelineContent(); break;
				default:
					reject(sType.toUpperCase() + " content type is not supported.");
			}

			oContent.loadDependencies(mConfig.contentManifest)
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

					if (sType.toLowerCase() !== "adaptivecard") {
						oContent.setConfiguration(BindingHelper.createBindingInfos(mConfig.contentManifest), sType);
					} else {
						oContent.setConfiguration(mConfig.contentManifest);
					}
					resolve(oContent);
				})
				.catch(function (sError) {
					reject(sError);
				});
		});
	};

	return ContentFactory;
});
