/*!
 * ${copyright}
 */

sap.ui.define([
	"sap/ui/dt/Util",
	"sap/ui/fl/Utils",
	"sap/ui/rta/Utils",
	"sap/ui/rta/plugin/Plugin",
	"sap/ui/rta/util/isReuseComponent"
], function(
	DtUtil,
	FlUtils,
	RtaUtils,
	Plugin,
	isReuseComponent
) {
	"use strict";

	/**
	 * Callback function responsible for fragment handling.
	 *
	 * The fragment handling function needs to be provided from outside of key user adaptation. It is called during the execution of the
	 * plugin handler with the target overlay.
	 *
	 * @typedef {function} sap.ui.rta.plugin.AddXML.fragmentHandler
	 * @since 1.134
	 * @param {sap.ui.dt.ElementOverlay} oOverlay - Target overlay for where XML will be added
	 * @param {string[]} aExcludedAggregation - Aggregations that should be excluded from the fragment handling
	 * @returns {Promise<{fragmentPath: string, fragment: string, targetAggregation: string, index: number}>} Object wrapped in a Promise containing values that are relevant for the <code>addXML</code> command

	/**
	 * Constructor for a new AddXML plugin.
	 * Adds the content of the XML fragment
	 * The fragment handler <code>{@link sap.ui.rta.plugin.AddXML.fragmentHandler FragmentHandler}</code>
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
	 * @alias sap.ui.rta.plugin.AddXMLPlugin
	 */
	const AddXML = Plugin.extend("sap.ui.rta.plugin.AddXML", /** @lends sap.ui.rta.plugin.AddXMLPlugin.prototype */ {
		metadata: {
			library: "sap.ui.rta",
			properties: {
				fragmentHandler: {
					type: "function"
				}
			},
			associations: {},
			events: {}
		}
	});

	const FLEX_CHANGE_TYPE = "addXML";

	/**
	 * Check if the given overlay is editable.
	 *
	 * @param {sap.ui.dt.ElementOverlay} oOverlay - Overlay to be checked for editable
	 * @returns {Promise<boolean>} <code>true</code> when editable wrapped in a promise
	 * @private
	 */
	AddXML.prototype._isEditable = async function(oOverlay) {
		// Action should be available by default
		const oAddXMLAction = this.getAction(oOverlay);
		const oComponent = FlUtils.getComponentForControl(oOverlay.getElement());
		const bIsS4HanaCloud = RtaUtils.isS4HanaCloud();
		if (
			oAddXMLAction === null ||
			!this.hasStableId(oOverlay) ||
			(bIsS4HanaCloud && isReuseComponent(oComponent))
		) {
			return Promise.resolve(false);
		}
		const bHasChangeHandler = await this.hasChangeHandler(FLEX_CHANGE_TYPE, oOverlay.getElement());
		return bHasChangeHandler;
	};

	/**
	 * Checks if AddXML is enabled for oOverlay
	 * @param {sap.ui.dt.ElementOverlay[]} aElementOverlays - Target overlays
	 * @returns {boolean} <code>true</code> if enabled
	 * @public
	 */
	AddXML.prototype.isEnabled = function(aElementOverlays) {
		const bEnabled = aElementOverlays.length === 1;
		return bEnabled;
	};

	function handleAddXmlCommand(mAddXmlData, oElement) {
		const mAddXmlSettings = {
			fragment: mAddXmlData.fragment,
			fragmentPath: mAddXmlData.fragmentPath,
			targetAggregation: mAddXmlData.targetAggregation,
			index: mAddXmlData.index

		};

		return this.getCommandFactory().getCommandFor(
			oElement,
			FLEX_CHANGE_TYPE,
			mAddXmlSettings
		);
	}

	/**
	 * Triggers the plugin execution.
	 * @param {sap.ui.dt.ElementOverlay[]} aElementOverlays - Target overlays
	 * @param {Object} mPropertyBag - Property bag
	 * @param {sap.ui.rta.plugin.AddXML.fragmentHandler} [mPropertyBag.fragmentHandler] - Handler function for fragment handling. The fragment handler is a callback function that needs to be passed here into the <code>propertyBag</code> or alternatively on instantiation of the plugin.
	 */
	AddXML.prototype.handler = async function(aElementOverlays, mPropertyBag) {
		try {
			const fnFragmentHandler = mPropertyBag.fragmentHandler || this.getFragmentHandler();
			if (!fnFragmentHandler) {
				throw Error("Fragment handler function is not available in the handler");
			}
			const oOverlay = aElementOverlays[0];

			const aExcludedAggregation = this.getAction(oOverlay)?.excludedAggregations || [];

			const mAddXmlData = await fnFragmentHandler(oOverlay, aExcludedAggregation);

			const oAddXmlCommand = await handleAddXmlCommand.call(this, mAddXmlData, oOverlay.getElement());
			this.fireElementModified({
				command: oAddXmlCommand
			});
		} catch (vError) {
			throw DtUtil.propagateError(
				vError,
				"AddXML#handler",
				"Error occurred in AddXML handler function",
				"sap.ui.rta"
			);
		}
	};

	/**
	 * Retrieves the context menu item for the action.
	 * @param {sap.ui.dt.ElementOverlay[]} aElementOverlays - Target overlays
	 * @returns {object[]} Array of the items with required data
	 */
	AddXML.prototype.getMenuItems = function(aElementOverlays) {
		return this._getMenuItems(aElementOverlays, {
			pluginId: "CTX_ADDXML",
			icon: "sap-icon://attachment-html"
		});
	};

	/**
	 * Gets the name of the action related to this plugin.
	 * @returns {string} Action name
	 */
	AddXML.prototype.getActionName = function() {
		return "addXML";
	};

	return AddXML;
});