/*!
 * ${copyright}
 */

sap.ui.define([
	"sap/ui/core/Core",
	"sap/ui/core/util/reflection/JsControlTreeModifier",
	"sap/ui/fl/write/api/ChangesWriteAPI"
], function(
	Core,
	JsControlTreeModifier,
	ChangesWriteAPI
) {
	"use strict";

	/**
	 * Service to register message event listeners for the communication with the
	 * Flex Support web extension.
	 *
	 * This is implemented as a service and not as part of the injected script because
	 * there is no easy way to retrieve the RuntimeAuthoring instance otherwise.
	 *
	 * @namespace
	 * @name sap.ui.rta.service.SupportTools
	 * @author SAP SE
	 * @experimental Since 1.106
	 * @since 1.106
	 * @version ${version}
	 * @private
	 * @ui5-restricted
	 */

	function getPluginChangeHandler(oPlugin, oElementOverlay, oRta) {
		var oAction = oPlugin.getAction(oElementOverlay);
		if (oAction && oAction.changeType) {
			var oElement = oAction.changeOnRelevantContainer
				? oElementOverlay.getRelevantContainer()
				: oElementOverlay.getElement();
			return ChangesWriteAPI.getChangeHandler({
				changeType: oAction.changeType,
				element: oElement,
				modifier: JsControlTreeModifier,
				layer: oRta.getLayer()
			})
				.then(function(oChangeHandler) {
					return oChangeHandler;
				})
				.catch(function() {
					return;
				});
		}
		return Promise.resolve(undefined);
	}

	function isPluginForSibling(sPluginName) {
		if (sPluginName.endsWith(".asSibling")) {
			return true;
		}
		if (sPluginName.endsWith(".asChild")) {
			return false;
		}
		return undefined;
	}

	function getPluginByName(oRta, sPluginName) {
		var bIsSibling = isPluginForSibling(sPluginName);
		var oAllPlugins = oRta.getPlugins();
		return Object.values(oAllPlugins).find(function(oPlugin) {
			var sName = oPlugin._retrievePluginName
				? oPlugin._retrievePluginName(bIsSibling)
				: oPlugin.getMetadata().getName();
			return sName === sPluginName;
		});
	}

	/*
	 * Returns information about an overlay, namely:
	 *  For every plugin that is part of the "editableByPlugins"
	 *  aggregation, we return the plugin name and the result for
	 *  isAvailable(). If the change handler can be determined, we
	 *  return this information, which enables a button allowing the
	 *  key user to print the change handler to the console.
	 *
	 * @method sap.ui.rta.service.SupportTools.getOverlayInfo
	 * @param {sap.ui.rta.RuntimeAuthoring} oRta - Instance of the RuntimeAuthoring class
	 * @param {object} mPayload - Property Bag
	 * @param {string} mPayload.overlayId
	 */
	function getOverlayInfo(oRta, mPayload) {
		var oOverlay = Core.byId(mPayload.overlayId);
		var oElement = oOverlay.getElement();

		return Promise.all(oOverlay.getEditableByPlugins().map(function(sPluginName) {
			var oInstance = getPluginByName(oRta, sPluginName);
			var bIsSibling = isPluginForSibling(sPluginName);

			return getPluginChangeHandler(oInstance, oOverlay, oRta)
				.then(function(oChangeHandler) {
					return {
						name: sPluginName,
						isAvailable: oInstance.isAvailable([oOverlay], bIsSibling),
						hasChangeHandler: !!oChangeHandler
					};
				});
		}))
			.then(function(aPlugins) {
				return {
					elementId: oElement.getId(),
					elementControlType: oElement.getMetadata().getName(),
					overlayId: oOverlay.getId(),
					plugins: aPlugins
				};
			});
	}

	function printChangeHandler(oRta, mPayload) {
		var oOverlay = Core.byId(mPayload.overlayId);
		var oPlugin = getPluginByName(oRta, mPayload.pluginName);
		getPluginChangeHandler(oPlugin, oOverlay, oRta)
			.then(console.log); // eslint-disable-line no-console
	}

	// List of supported handlers
	var mHandlers = {
		getOverlayInfo: {
			handler: getOverlayInfo,
			returnMessageType: "overlayInfo",
			id: "ui5FlexibilitySupport.submodules.overlayInfo"
		},
		printChangeHandler: {
			handler: printChangeHandler,
			id: "ui5FlexibilitySupport.submodules.overlayInfo"
		}
	};

	/*
	 * Event handler for the messages sent by the support extension.
	 *
	 * Messages are contained in oEvent.data - the following properties
	 * are sent:
	 *  - type: specifies, what action should be taken. Possible values:
	 *   - getOverlayInfo (request information about an overlay)
	 *   - printChangeHandler (a specified change handler object is to be printed to the console)
	 * - content: type-specific information, e.g. for getOverlayInfo, an 'overlayId' is provided
	 *
	 * @method sap.ui.rta.service.SupportTools.onMessageReceived
	 * @param {sap.ui.rta.RuntimeAuthoring} oRta - Instance of the RuntimeAuthoring class
	 * @param {object} oEvent - Event thrown by the browser on received message
	 */
	function onMessageReceived(oRta, oEvent) {
		if (oEvent.source !== window) {
			return;
		}

		var aHandler = Object.entries(mHandlers).find(function(aEntry) {
			return (
				aEntry[0] === oEvent.data.type
				&& aEntry[1].id === oEvent.data.id
			);
		});
		var mHandler = aHandler && aHandler[1];

		if (mHandler) {
			Promise.resolve(mHandler.handler(oRta, oEvent.data.content))
				.then(function(oResult) {
					if (mHandler.returnMessageType) {
						oEvent.source.postMessage({
							id: mHandler.id,
							type: mHandler.returnMessageType,
							content: oResult
						});
					}
				});
		}
	}

	return function(oRta) {
		var fnOnMessageReceivedBound = onMessageReceived.bind(null, oRta);
		window.addEventListener("message", fnOnMessageReceivedBound);

		return {
			destroy: function() {
				window.removeEventListener("message", fnOnMessageReceivedBound);
			}
		};
	};
});