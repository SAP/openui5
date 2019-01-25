/*!
 * ${copyright}
 */

/**
 * @namespace
 * @name sap.ui.core.support.usage
 * @public
 */

// Provides class sap.ui.core.support.usage.UsageAnalytics
sap.ui.define(['jquery.sap.global', '../../Element', '../../routing/Router'],
	function (jQuery, Element, Router) {
		"use strict";

		var EVENTS_BLACKLIST = ["modelContextChange", "beforeRendering", "afterRendering", "propertyChanged",
			"aggregationChanged", "componentCreated", "afterInit", "updateStarted", "updateFinished", "load", "scroll",
			"beforeGeometryChanged", "geometryChanged"];

		/**
		 * Usage Analytics routines. This class is meant for private usages. Apps are not supposed to used it.
		 * It is created for an experimental purpose.
		 * @class Experimental class for working with SAP Web Analytics.
		 * @alias sap.ui.core.support.UsageAnalytics
		 * @private
		 * @experimental Since 1.58
		 * @ui5-restricted
		 */
		var UsageAnalytics = {};

		/**
		 * Enables UsageAnalytics.
		 * This does not mean the tracking events is enabled. In order to track events, additional conditions must be met:
		 * - Apps should provide an instance of SAP Web Analytics (SWA) as global variable <code>swa</code>.
		 * - When obtaining a reference to SWA, apps should take care of user consent. The user consent is handled by SWA,
		 * in a collaboration of the apps.
		 * @private
		 */
		UsageAnalytics.enable = function () {
			Element._trackEvent = function (sEventId, oElement) {
				// Could be a wrapped in a web worker
				UsageAnalytics.trackEvent(sEventId, oElement);
			};
			Router._trackRouteMatched = function (sControlId, oRouter, mArguments) {
				UsageAnalytics.trackRouteMatched(Router.M_EVENTS.ROUTE_MATCHED, sControlId, oRouter, mArguments);
			};
		};

		/**
		 * Disables the UsageAnalytics.
		 * @private
		 */
		UsageAnalytics.disable = function () {
			if (Element._trackEvent) {
				delete Element._trackEvent;
			}
			if (Router._trackRouteMatched) {
				delete Router._trackRouteMatched;
			}
		};

		/**
		 * Tracks an UI5 event.
		 * This method should not be called directly, but rather upon event firing.
		 * @param {string} sEventId the name of the event
		 * @param {sap.ui.core.Element} oElement The event's target UI5 element
		 * @private
		 */
		UsageAnalytics.trackEvent = function (sEventId, oElement) {
			jQuery.sap.delayedCall(0, UsageAnalytics, "_trackEvent", [sEventId, new Date(), oElement]);
		};


		/**
		 * Tracks an UI5 Routing event.
		 * This method should not be called directly, but rather upon event firing.
		 * @param {string} sEventId the name of the event
		 * @param {string} sElementId the container control tis navigation is fired on
		 * @param {sap.ui.core.routing.Router} oRouter The underlying router
		 * @param {object} [mArguments] the arguments passed along with the event.
		 * @private
		 */
		UsageAnalytics.trackRouteMatched = function (sEventId, sElementId, oRouter, mArguments) {
			jQuery.sap.delayedCall(0, UsageAnalytics, "_trackRouteMatched", [sEventId, new Date(), sElementId, oRouter, mArguments]);
		};

		UsageAnalytics._trackEvent = function (sEventId, oTimeFired, oElement) {
			var oData = {};

			if (UsageAnalytics._isTrackable(sEventId, oElement)) {
				oData = {
					eventType: sEventId,
					elementId: oElement.getId(),
					elementType: oElement.getMetadata().getName(),
					timestamp: oTimeFired.getTime()
				};
				jQuery.sap.log.debug("UsageAnalytics: Track Event: " + JSON.stringify(oData));
				UsageAnalytics._saveToBackend(oData);
			}
		};

		UsageAnalytics._trackRouteMatched = function (sEventId, oTimeFired, sElementId, oRouter, mArguments) {
			var oData = {
				eventType: sEventId,
				elementId: sElementId,
				elementType: "sap.ui.core.routing.Router",
				timestamp: oTimeFired.getTime(),
				additionalAttributes: {
					routerInfo: oRouter.getURL(mArguments.name, mArguments.arguments),
					fullURL: window.location.href,
					hash: window.location.hash
				}
			};

			jQuery.sap.log.debug("UsageAnalytics: Track Route Matched: " + JSON.stringify(oData));
			UsageAnalytics._saveToBackend(oData);
		};


		UsageAnalytics._saveToBackend = function (oData) {
			var aArgs = [oData.timestamp, oData.eventType, oData.elementId, oData.elementType],
				sKey;

			if (oData.additionalAttributes) {
				for (sKey in oData.additionalAttributes) {
					aArgs.push(oData.additionalAttributes[sKey]);
				}
			}

			if (window.swa) {
				window.swa.trackCustomEvent.apply(window.swa, aArgs);
			} else {
				jQuery.sap.log.warning("UsageAnalytics; No SAP Web Analytics service is defined. Please provide a global" +
					" instance variable named <swa>");
			}
		};

		UsageAnalytics._isTrackable = function (sEventId, oElement) {
			return EVENTS_BLACKLIST.indexOf(sEventId) === -1 && UsageAnalytics._isPublicElementEvent(sEventId, oElement);
		};

		UsageAnalytics._isPublicElementEvent = function (sEventId, oElement) {
			return !!oElement.getMetadata().getEvent(sEventId);
		};


		return UsageAnalytics;
	}, /* bExport */ true);


