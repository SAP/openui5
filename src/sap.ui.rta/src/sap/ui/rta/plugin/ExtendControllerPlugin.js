/*!
 * ${copyright}
 */

sap.ui.define([
	"sap/ui/dt/Util",
	"sap/ui/fl/Utils",
	"sap/ui/rta/plugin/Plugin",
	"sap/ui/rta/util/isReuseComponent",
	"sap/ui/rta/Utils"
], function(
	DtUtil,
	FlUtils,
	Plugin,
	isReuseComponent,
	RtaUtils
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

	/**
	 * Check if the given overlay should be editable.
	 *
	 * @param {sap.ui.dt.ElementOverlay} oOverlay - Overlay to be checked for editable
	 * @returns {Promise<boolean>} <code>true</code> when editable wrapped in a promise
	 * @private
	 */
	ExtendControllerPlugin.prototype._isEditable = async function(oOverlay) {
		const oComponent = FlUtils.getComponentForControl(oOverlay.getElement());
		const bIsS4HanaCloud = RtaUtils.isS4HanaCloud();
		if (
			bIsS4HanaCloud ||
			isReuseComponent(oComponent)
		) {
			return false;
		}
		const bHasChangeHandler = await this.hasChangeHandler(FLEX_CHANGE_TYPE, oOverlay.getElement());
		return bHasChangeHandler;
	};

	/**
	 * Checks if ExtendController is enabled for the given overlays
	 * @param {sap.ui.dt.ElementOverlay[]} aElementOverlays - Target overlays
	 * @returns {boolean} <code>true</code> if enabled
	 * @public
	 */
	ExtendControllerPlugin.prototype.isEnabled = function(aElementOverlays) {
		const bEnabled = aElementOverlays.length === 1;
		return bEnabled;
	};

	function handleExtendControllerCommand(mExtendControllerData, oElement) {
		const mExtendControllerSettings = {
			codeRef: mExtendControllerData.codeRef,
			viewId: mExtendControllerData.viewId
		};

		return this.getCommandFactory().getCommandFor(
			oElement,
			FLEX_CHANGE_TYPE,
			mExtendControllerSettings
		);
	}

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

			const oExtendControllerCommand = await handleExtendControllerCommand.call(
				this,
				mExtendControllerData,
				oElementOverlay.getElement()
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

	return ExtendControllerPlugin;
});