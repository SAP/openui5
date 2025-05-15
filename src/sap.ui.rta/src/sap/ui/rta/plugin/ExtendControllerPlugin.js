/*!
 * ${copyright}
 */

sap.ui.define([
	"sap/ui/core/Lib",
	"sap/ui/dt/Util",
	"sap/ui/fl/Utils",
	"sap/ui/rta/plugin/Plugin"
], function(
	Lib,
	DtUtil,
	Utils,
	Plugin
) {
	"use strict";

	/**
	 *
	 * @typedef {function} sap.ui.rta.plugin.ExtendController.handlerFunction
	 * @since 1.134
	 * @param {sap.ui.dt.ElementOverlay} oOverlay - Target overlay for where XML will be added

	/**
	 * Constructor for a new ExtendController plugin.
	 * The controller handler <code>{@link sap.ui.rta.plugin.ExtendController.handlerFunction HandlerFunction}</code>
	 * is a callback function that needs to be passed on instantiation of the plugin or alternatively into the
	 * propertyBag when the handler function is called.
	 *
	 * @class
	 * @extends sap.ui.rta.plugin.Plugin
	 * @author SAP SE
	 * @version ${version}
	 * @constructor
	 * @private
	 * @since 1.134
	 * @alias sap.ui.rta.plugin.ExtendControllerPlugin
	 */
	const ExtendControllerPlugin = Plugin
	.extend("sap.ui.rta.plugin.ExtendController", /** @lends sap.ui.rta.plugin.ExtendControllerPlugin.prototype */ {
		metadata: {
			library: "sap.ui.rta",
			properties: {
				handlerFunction: {
					type: "function"
				}
			},
			associations: {},
			events: {}
		}
	});

	const FLEX_CHANGE_TYPE = "codeExt";

	function isControlInAsyncView(oOverlay) {
		// Currently there is no better way to get this information. When this changes, this code must be adapted.
		return !!Utils.getViewForControl(oOverlay.getElement())?.oAsyncState;
	}

	/**
	 * Check if the given overlay should be editable.
	 *
	 * @param {sap.ui.dt.ElementOverlay} oOverlay - Overlay to be checked for editable
	 * @returns {Promise<boolean>} <code>true</code> when editable wrapped in a promise
	 * @private
	 */
	ExtendControllerPlugin.prototype._isEditable = function() {
		return Promise.resolve(true);
	};

	/**
	 * Checks if ExtendController is enabled for the given overlays
	 * @param {sap.ui.dt.ElementOverlay[]} aElementOverlays - Target overlays
	 * @returns {boolean} <code>true</code> if enabled
	 * @public
	 */
	ExtendControllerPlugin.prototype.isEnabled = function(aElementOverlays) {
		return aElementOverlays.length === 1
			&& !this.isInReuseComponentOnS4HanaCloud(aElementOverlays[0])
			&& isControlInAsyncView(aElementOverlays[0]);
	};

	/**
	 * Redefinition of getActionText to add special texts for the context menu
	 * @param  {sap.ui.dt.ElementOverlay} oOverlay Overlay containing the Designtime Metadata
	 * @param  {object} mAction The action data from the Designtime Metadata
	 * @param  {string} sPluginId The ID of the plugin
	 * @returns {string} Returns the text for the menu item
	 */
	ExtendControllerPlugin.prototype.getActionText = function(oOverlay, mAction, sPluginId) {
		const vName = mAction.name;
		const oElement = oOverlay.getElement();
		let sText;
		if (vName) {
			if (typeof vName === "function") {
				return vName(oElement);
			}
			sText = oOverlay.getDesignTimeMetadata() ? oOverlay.getDesignTimeMetadata().getLibraryText(oElement, vName) : "";
		} else {
			sText = Lib.getResourceBundleFor("sap.ui.rta").getText(sPluginId);
		}
		// The case where the control is in a reuse component on S4HanaCloud
		// is not enabled and has a special text in parenthesis on the context menu
		if (this.isInReuseComponentOnS4HanaCloud(oOverlay)) {
			sText += ` (${Lib.getResourceBundleFor("sap.ui.rta").getText("CTX_DISABLED_REUSE")})`;
		}
		// The case where the control is not in an async view
		// is not enabled and has a special text in parenthesis on the context menu
		if (!isControlInAsyncView(oOverlay)) {
			sText += ` (${Lib.getResourceBundleFor("sap.ui.rta").getText("CTX_DISABLED_NOT_ASYNC")})`;
		}
		return sText;
	};

	/**
	 * Triggers the plugin execution.
	 * @param {sap.ui.dt.ElementOverlay[]} aElementOverlays - Target overlays
	 * @param {Object} mPropertyBag - Property bag
	 * @param {sap.ui.rta.plugin.ExtentController.handlerFunction} [mPropertyBag.handlerFunction] - Handler function for controller handling. The controller handler is a callback function that needs to be passed here into the <code>propertyBag</code> or alternatively on instantiation of the plugin.
	 * @returns {Promise} Resolves when handler is executed successfully
	 */
	ExtendControllerPlugin.prototype.handler = async function(aElementOverlays, mPropertyBag) {
		try {
			const fnControllerHandler = mPropertyBag.handlerFunction || this.getHandlerFunction();
			if (!fnControllerHandler) {
				throw Error("Controller handler function is not available in the handler");
			}

			const oElementOverlay = aElementOverlays[0];

			const mExtendControllerData = await fnControllerHandler(oElementOverlay);

			const oExtendControllerCommand = await this.getCommandFactory().getCommandFor(
				oElementOverlay.getElement(),
				FLEX_CHANGE_TYPE,
				mExtendControllerData
			);

			this.fireElementModified({
				command: oExtendControllerCommand
			});
		} catch (vError) {
			throw DtUtil.propagateError(
				vError,
				"ExtentController#handler",
				"Error occurred in ExtentController handler function",
				"sap.ui.rta"
			);
		}
	};

	/**
	 * Retrieves the context menu item for the action.
	 * @param {sap.ui.dt.ElementOverlay[]} aElementOverlays - Target overlays
	 * @returns {object[]} Array of the items with required data
	 */
	ExtendControllerPlugin.prototype.getMenuItems = function(aElementOverlays) {
		return this._getMenuItems(aElementOverlays, {
			pluginId: "CTX_EXTEND_CONTROLLER",
			icon: "sap-icon://create-form"
		});
	};

	/**
	 * Gets the name of the action related to this plugin.
	 * @returns {string} Action name
	 */
	ExtendControllerPlugin.prototype.getActionName = function() {
		return "extendController";
	};

	/**
	 * Returns the action information when defined in the designtime metadata or an object with only the changeType.
	 * @param {sap.ui.dt.ElementOverlay} oOverlay - Overlay containing the Designtime Metadata
	 * @returns {object} Action information
	 */
	ExtendControllerPlugin.prototype.getAction = function(oOverlay) {
		const oAction = Plugin.prototype.getAction.apply(this, [oOverlay]);
		return oAction || { changeType: FLEX_CHANGE_TYPE };
	};

	return ExtendControllerPlugin;
});