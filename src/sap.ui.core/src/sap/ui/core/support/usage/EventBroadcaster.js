/*!
 * ${copyright}
 */

/**
 * @namespace
 * @name sap.ui.core.support.usage
 * @public
 */

// Provides class sap.ui.core.support.usage.EventBroadcaster
sap.ui.define(['sap/base/Log', '../../Component', '../../Element', '../../routing/Router'],
	function (Log, Component, Element, Router) {
		"use strict";

		var oEmpty = {},
			EVENTS_BLACKLIST = {
				"modelContextChange": oEmpty,
				"beforeRendering": oEmpty,
				"afterRendering": oEmpty,
				"propertyChanged": oEmpty,
				"aggregationChanged": oEmpty,
				"componentCreated": oEmpty,
				"afterInit": oEmpty,
				"updateStarted": oEmpty,
				"updateFinished": oEmpty,
				"load": oEmpty,
				"scroll": oEmpty,
				"beforeGeometryChanged": oEmpty,
				"geometryChanged": oEmpty
			};

		/**
		 * Event broadcaster. This class is meant for private usages. Apps are not supposed to used it.
		 * It is created for an experimental purpose.
		 * @class Broadcasts UI5 events via single native custom browser event. This way consumers have a generic mechanism
		 * for hooking into any UI5 event.
		 * Example consumer code:
		 * <pre>
		 *     window.addEventListener("UI5Event", function(oEvent) {
		 *
		 *     		// consumer coding, e.g. :
		 *     		// analyze event
		 *     		// store events - GDPR is responsibility of the consumer
		 *     		// or any other
		 *
		 *     		var oDetail = oEvent.detail;
		 *
		 *     		console.log("UI5 Event " 				+ oDetail.eventName
		 *     			+ " occurred at " 					+ new Date(oDetail.timestamp).toString()
		 *     			+ " for element " 					+ oDetail.targetId
		 *     			+ " of type "						+ oDetail.targetType
		 *     			+ ", which is part of component " 	+ oDetail.componentId
		 *     			+ " with version " 					+ oDetail.componentVersion
		 *     			+ " and additional parameters "		, oDetail.additionalAttributes);
		 *
		 *     });
		 * </pre>
		 * @see https://developer.mozilla.org/en-US/docs/Web/API/CustomEvent/CustomEvent)
		 * @alias sap.ui.core.support.usage.EventBroadcaster
		 * @private
		 * @experimental Since 1.58
		 * @ui5-restricted
		 */
		var EventBroadcaster = {};

		/**
		 * Starts broadcasting events. Consumers could stop broadcasting via
		 * {@link sap.ui.core.support.usage.EventBroadcaster#disable EventBroadcaster.disable}
		 * @public
		 */
		EventBroadcaster.enable = function () {
			Element._interceptEvent = function (sEventId, oElement, mParameters) {
				EventBroadcaster.broadcastEvent(sEventId, oElement, mParameters);
			};
			Router._interceptRouteMatched = function (sControlId, oRouter) {
				EventBroadcaster.broadcastRouteMatched(Router.M_EVENTS.ROUTE_MATCHED, sControlId, oRouter);
			};
		};

		/**
		 * Disables the EventBroadcaster.
		 * @public
		 */
		EventBroadcaster.disable = function () {
			if (Element._interceptEvent) {
				delete Element._interceptEvent;
			}
			if (Router._interceptRouteMatched) {
				delete Router._interceptRouteMatched;
			}
		};

		/**
		 * Broadcasts an UI5 event.
		 * This method should not be called directly, but rather upon event firing.
		 * @param {string} sEventId the name of the event
		 * @param {sap.ui.core.Element} oElement The event's target UI5 element
		 * @param {object} [mParameters] The parameters which complement the event
		 * @protected
		 */
		EventBroadcaster.broadcastEvent = function (sEventId, oElement, mParameters) {
			var oTimeFired = new Date();

			setTimeout(function() {
				var oData = {}, oComponentInfo;

				if (EventBroadcaster._shouldExpose(sEventId, oElement)) {
					oComponentInfo = EventBroadcaster._createOwnerComponentInfo(oElement);

					oData = {
						componentId: oComponentInfo.id,
						componentVersion: oComponentInfo.version,
						eventName: sEventId,
						targetId: oElement.getId(),
						targetType: oElement.getMetadata().getName(),
						timestamp: oTimeFired.getTime()
					};

					if (Log.isLoggable()) {
						Log.debug("EventBroadcaster: Broadcast Event: ", JSON.stringify(oData));
					}

					oData.additionalAttributes = mParameters; //parameters could include object/function, so we don't log them

					EventBroadcaster._dispatchCustomEvent(oData);
				}
			});
		};


		/**
		 * Broadcast an UI5 Routing event.
		 * This method should not be called directly, but rather upon event firing.
		 * @param {string} sEventId the name of the event
		 * @param {string} sElementId the container control tis navigation is fired on
		 * @param {sap.ui.core.routing.Router} oRouter The underlying router
		 * @protected
		 */
		EventBroadcaster.broadcastRouteMatched = function (sEventId, sElementId, oRouter) {
			var oTimeFired = new Date();

			setTimeout(function() {
				var oComponentInfo = EventBroadcaster._createOwnerComponentInfo(sap.ui.getCore().byId(sElementId)),
					oData = {
						componentId: oComponentInfo.id,
						componentVersion: oComponentInfo.version,
						eventName: sEventId,
						targetId: sElementId,
						targetType: "sap.ui.core.routing.Router",
						timestamp: oTimeFired.getTime(),
						additionalAttributes: {
							fullURL: document && document.baseURI,
							hash: oRouter.getHashChanger().getHash(),
							previousHash: EventBroadcaster._previousHash
						}
					};
				EventBroadcaster._previousHash = oData.additionalAttributes.hash;

				if (Log.isLoggable()) {
					Log.debug("EventBroadcaster: Broadcast Route Matched: ", JSON.stringify(oData));
				}

				EventBroadcaster._dispatchCustomEvent(oData);
			});
		};

		/**
		 * Dispatches UI5 event via generic browser custom event.
		 * @param {object} oData data that should be attached to the event
		 */
		EventBroadcaster._dispatchCustomEvent = function (oData) {
			var oCustomEvent = new window.CustomEvent("UI5Event", {
				detail:  oData
			});

			window.dispatchEvent(oCustomEvent);
		};

		EventBroadcaster._shouldExpose = function (sEventId, oElement) {
			return !EVENTS_BLACKLIST[sEventId] && EventBroadcaster._isPublicElementEvent(sEventId, oElement);
		};

		EventBroadcaster._isPublicElementEvent = function (sEventId, oElement) {
			return oElement.getMetadata().hasEvent(sEventId);
		};

		EventBroadcaster._createOwnerComponentInfo = function(oSrcElement) {
			var sId, sVersion,
				oComponent, oApp;

			if (oSrcElement) {

				while (oSrcElement && oSrcElement.getParent) {
					oComponent = Component.getOwnerComponentFor(oSrcElement);

					if (oComponent || oSrcElement.getMetadata().isA("sap.ui.core.Component")) {
						oComponent = oComponent || oSrcElement;
						oApp = oComponent.getManifestEntry("sap.app");
						sId = oApp && oApp.id || oComponent.getMetadata().getName();
						sVersion = oApp && oApp.applicationVersion && oApp.applicationVersion.version;
					}
					oSrcElement = oSrcElement.getParent();
				}
			}
			return {
				id: sId || "undetermined",
				version: sVersion || ""
			};
		};

		// CustomEvent polyfill for IE version 9 and higher
		function initCustomEvents() {
			if (typeof window.CustomEvent === "function") {
				return false;
			}

			function CustomEvent(event, params) {
				params = params || {
					bubbles: false,
					cancelable: false,
					detail: undefined
				};
				var evt = document.createEvent('CustomEvent');
				evt.initCustomEvent(event, params.bubbles, params.cancelable, params.detail);
				return evt;
			}
			CustomEvent.prototype = window.Event.prototype;
			window.CustomEvent = CustomEvent;
		}

		initCustomEvents();

		return EventBroadcaster;
	});


