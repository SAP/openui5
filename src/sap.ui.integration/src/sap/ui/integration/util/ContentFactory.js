/*!
 * ${copyright}
 */
sap.ui.define([
	"sap/ui/core/Core",
	"sap/ui/base/Object",
	"sap/ui/integration/util/BindingHelper",
	"./CardActions"
], function (
	Core,
	BaseObject,
	BindingHelper,
	CardActions
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
			var fnCreateContentInstance = function (Content) {

				if ((mConfig.cardManifest && mConfig.cardManifest.isDestroyed()) ||
					(mConfig.dataProviderFactory && mConfig.dataProviderFactory.isDestroyed())) {
					// reject creating of the content if a new manifest is loaded meanwhile
					reject();
					return;
				}

				var oContent = new Content(),
					oActions = new CardActions({
						card: oCard
					});

				oContent._sAppId = mConfig.appId;
				oContent.setServiceManager(mConfig.serviceManager);
				oContent.setDataProviderFactory(mConfig.dataProviderFactory);
				oContent.setActions(oActions);

				if (sType.toLowerCase() !== "adaptivecard") {
					oContent.setConfiguration(BindingHelper.createBindingInfos(mConfig.contentManifest), sType);
				} else {
					oContent.setConfiguration(mConfig.contentManifest);
				}

				resolve(oContent);
			};

			try {
				switch (sType.toLowerCase()) {
					case "list":
						sap.ui.require(["sap/ui/integration/cards/ListContent"], fnCreateContentInstance);
						break;
					case "calendar":
						sap.ui.require(["sap/ui/integration/cards/CalendarContent"], fnCreateContentInstance);
						break;
					case "table":
						sap.ui.require(["sap/ui/integration/cards/TableContent"], fnCreateContentInstance);
						break;
					case "object":
						sap.ui.require(["sap/ui/integration/cards/ObjectContent"], fnCreateContentInstance);
						break;
					case "analytical":
						Core.loadLibrary("sap.viz", {
							async: true
						})
							.then(function () {
								sap.ui.require(["sap/ui/integration/cards/AnalyticalContent"], fnCreateContentInstance);
							})
							.catch(function () {
								reject("Analytical content type is not available with this distribution.");
							});
						break;
					case "analyticscloud":
						sap.ui.require(["sap/ui/integration/cards/AnalyticsCloudContent"], fnCreateContentInstance);
						break;
					case "timeline":
						Core.loadLibrary("sap.suite.ui.commons", {
							async: true
						})
							.then(function() {
								sap.ui.require(["sap/ui/integration/cards/TimelineContent"], fnCreateContentInstance);
							})
							.catch(function () {
								reject("Timeline content type is not available with this distribution.");
							});
						break;
					case "component":
						sap.ui.require(["sap/ui/integration/cards/ComponentContent"], fnCreateContentInstance);
						break;
					case "adaptivecard":
						sap.ui.require(["sap/ui/integration/cards/AdaptiveContent"], fnCreateContentInstance);
						break;
					default:
						reject(sType.toUpperCase() + " content type is not supported.");
				}
			} catch (sError) {
				reject(sError);
			}
		});
	};

	return ContentFactory;
});
