/*!
 * ${copyright}
 */

sap.ui.define([
	"sap/ui/rta/plugin/Plugin",
	"sap/ui/dt/Util",
	"sap/ui/fl/Utils",
	"sap/ui/fl/apply/api/ExtensionPointRegistryAPI",
	"sap/ui/fl/apply/_internal/flexState/ManifestUtils",
	"sap/base/util/values",
	"sap/ui/base/DesignTime"
], function(
	Plugin,
	DtUtil,
	FlUtils,
	ExtensionPointRegistryAPI,
	ManifestUtils,
	values,
	DesignTime
) {
	"use strict";

	/**
	 * Callback function responsible for fragment handling.
	 *
	 * The fragment handling function needs to be provided from outside of key user adaptation. It is called during the execution of the
	 * plugin handler with the target overlay and a list of existing extension point information related to the target overlay. The main
	 * responsibility is to select an extension point from the list an create an XML fragment as an extension for it. After the fragment
	 * is created, the fragment handler needs to resolve the returned promise with the information of the selected extension point name,
	 * the path and the name of the created fragment. If no extension point selection is done into the fragment handler, an empty object
	 * needs to be returned.
	 *
	 * @typedef {function} sap.ui.rta.plugin.AddXMLAtExtensionPoint.fragmentHandler
	 * @since 1.78
	 * @param {sap.ui.fl.ElementOverlay} oOverlay - Target overlay for the extension by fragment change
	 * @param {object[]} aExtensionPointInfos - List of available extension point information for the target overlay
	 * @returns {Promise<{extensionPointName: string, fragmentPath: string, fragment: string}>} Object wrapped in a Promise containing values that are relevant for the <code>addXMLAtExtensionPoint</code> command

	/**
	 * Constructor for a new AddXMLAtExtensionPoint plugin.
	 * Adds the content of the XML fragment behind the ExtensionPoint which needs to be selected by the fragment handler.
	 * The fragment handler <code>{@link sap.ui.rta.plugin.AddXMLAtExtensionPoint.fragmentHandler FragmentHandler}</code>
	 * is a callback function that needs to be passed on instantiation of the plugin or alternatively into the
	 * propertyBag when the handler function is called.
	 *
	 * @class
	 * @extends sap.ui.rta.plugin.Plugin
	 * @author SAP SE
	 * @version ${version}
	 * @constructor
	 * @private
	 * @since 1.78
	 * @alias sap.ui.rta.plugin.AddXMLAtExtensionPoint
	 */
	var AddXMLAtExtensionPoint = Plugin
	.extend("sap.ui.rta.plugin.AddXMLAtExtensionPoint", /** @lends sap.ui.rta.plugin.AddXMLAtExtensionPoint.prototype */ {
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

	var FLEX_CHANGE_TYPE = "addXMLAtExtensionPoint";
	var APP_DESCRIPTOR_CHANGE_TYPE = "appdescr_ui5_setFlexExtensionPointEnabled";

	function getExtensionPointList(oElement) {
		var oElementId = oElement.getId();
		// determine a list of extension points for the given element. In case the element is a view
		// all extension points available for the view are returned
		var aExtensionPointInfo = ExtensionPointRegistryAPI.getExtensionPointInfoByParentId({parentId: oElementId});
		return aExtensionPointInfo.length
			? aExtensionPointInfo
			: values(ExtensionPointRegistryAPI.getExtensionPointInfoByViewId({viewId: oElementId}));
	}

	function hasExtensionPoints(oElement) {
		return getExtensionPointList(oElement).length > 0;
	}

	function isDesignMode() {
		return DesignTime.isDesignModeEnabled();
	}

	AddXMLAtExtensionPoint.prototype.bAppDescriptorCommandAlreadyAvailable = false;

	/**
	 * Check if the given overlay is editable. A stable ID is not required for this,
	 * as this is also not the case with the old extension points.
	 *
	 * @param {sap.ui.dt.ElementOverlay} oOverlay - Overlay to be checked for editable
	 * @returns {Promise.<boolean>} <code>true</code> when editable wrapped in a promise
	 * @private
	 */
	AddXMLAtExtensionPoint.prototype._isEditable = function(oOverlay) {
		if (isDesignMode()) {
			var oElement = oOverlay.getElement();
			return this.hasChangeHandler(FLEX_CHANGE_TYPE, oElement).then(function(bHasChangeHandler) {
				return bHasChangeHandler && hasExtensionPoints(oElement);
			});
		}
		return Promise.resolve(false);
	};

	/**
	 * Checks if AddXMLAtExtensionPoint is enabled for oOverlay
	 * @param {sap.ui.dt.ElementOverlay[]} aElementOverlays - Target overlays
	 * @returns {boolean} <code>true</code> if enabled
	 * @public
	 */
	AddXMLAtExtensionPoint.prototype.isEnabled = function(aElementOverlays) {
		return aElementOverlays.length === 1;
	};

	AddXMLAtExtensionPoint.prototype.isAvailable = function(aOverlays) {
		if (isDesignMode()) {
			var oElement = aOverlays[0].getElement();
			return hasExtensionPoints(oElement);
		}
		return false;
	};

	function handleAddXmlAtExtensionPointCommand(oElement, mExtensionData, oCompositeCommand) {
		var sExtensionPointName = mExtensionData.extensionPointName;
		var oView = FlUtils.getViewForControl(oElement);
		var mExtensionPointReference = {
			name: sExtensionPointName,
			view: oView
		};
		var mExtensionPointSettings = {
			fragment: mExtensionData.fragment,
			fragmentPath: mExtensionData.fragmentPath
		};

		return this.getCommandFactory().getCommandFor(
			mExtensionPointReference,
			FLEX_CHANGE_TYPE,
			mExtensionPointSettings
		)
		.then(function(oAddXmlAtExtensionPointCommand) {
			return oCompositeCommand.addCommand(oAddXmlAtExtensionPointCommand);
		});
	}

	function handleAppDescriptorChangeCommand(oElement, oCompositeCommand) {
		// without appDescriptor change when the FlexExtensionPointEnabled flag is already set
		var bFlexExtensionPointHandlingEnabled = ManifestUtils.isFlexExtensionPointHandlingEnabled(oElement);
		if (bFlexExtensionPointHandlingEnabled || this.bAppDescriptorCommandAlreadyAvailable) {
			return Promise.resolve();
		}

		var oComponent = FlUtils.getAppComponentForControl(oElement);
		var sReference = oComponent.getManifestEntry("sap.app").id;
		return this.getCommandFactory().getCommandFor(
			oElement,
			"appDescriptor",
			{
				reference: sReference,
				appComponent: oComponent,
				changeType: APP_DESCRIPTOR_CHANGE_TYPE,
				parameters: { flexExtensionPointEnabled: true },
				texts: {}
			}
		)
		.then(function(oAppDescriptorCommand) {
			this.bAppDescriptorCommandAlreadyAvailable = true;
			return oCompositeCommand.addCommand(oAppDescriptorCommand);
		}.bind(this));
	}

	function handleCompositeCommand(aElementOverlays, mExtensionData) {
		var oCompositeCommand;
		var oOverlay = aElementOverlays[0];
		var oElement = oOverlay.getElement();

		return this.getCommandFactory().getCommandFor(oElement, "composite")

		.then(function(_oCompositeCommand) {
			oCompositeCommand = _oCompositeCommand;
		})

		// Flex Change
		.then(function() {
			return handleAddXmlAtExtensionPointCommand.call(this, oElement, mExtensionData, oCompositeCommand);
		}.bind(this))

		// App Descriptor Change
		.then(function() {
			return handleAppDescriptorChangeCommand.call(this, oElement, oCompositeCommand);
		}.bind(this))

		.then(function() {
			return oCompositeCommand;
		});
	}

	/**
	 * Triggers the plugin execution.
	 * @param {sap.ui.dt.ElementOverlay[]} aElementOverlays - Target overlays
	 * @param {Object} mPropertyBag - Property bag
	 * @param {sap.ui.rta.plugin.AddXMLAtExtensionPoint.fragmentHandler} [mPropertyBag.fragmentHandler] - Handler function for fragment handling. The fragment handler is a callback function that needs to be passed here into the <code>propertyBag</code> or alternatively on instantiation of the plugin.
	 * @returns {Promise} Resolves when handler is executed successfully
	 */
	AddXMLAtExtensionPoint.prototype.handler = function(aElementOverlays, mPropertyBag) {
		return Promise.resolve()
		.then(function() {
			var fnFragmentHandler = mPropertyBag.fragmentHandler || this.getFragmentHandler();
			if (!fnFragmentHandler) {
				return Promise.reject("Fragment handler function is not available in the handler");
			}
			var oOverlay = aElementOverlays[0];
			var oElement = oOverlay.getElement();
			var aExtensionPointInfos = getExtensionPointList(oElement);
			return fnFragmentHandler(oOverlay, aExtensionPointInfos);
		}.bind(this))

		.then(function(mExtensionData) {
			if (!mExtensionData.extensionPointName || !(typeof mExtensionData.extensionPointName === "string")) {
				return Promise.reject("Extension point name is not selected!");
			}
			if (!mExtensionData.fragmentPath || !(typeof mExtensionData.fragmentPath === "string")) {
				return Promise.reject("Fragment path is not available");
			}
			return mExtensionData;
		})

		.then(function(mExtensionData) {
			return handleCompositeCommand.call(this, aElementOverlays, mExtensionData);
		}.bind(this))

		.then(function(oCompositeCommand) {
			this.fireElementModified({
				command: oCompositeCommand
			});
		}.bind(this))

		.catch(function(vError) {
			throw DtUtil.propagateError(
				vError,
				"AddXMLAtExtensionPoint#handler",
				"Error occurred in AddXMLAtExtensionPoint handler function",
				"sap.ui.rta"
			);
		});
	};

	/**
	 * Retrieves the context menu item for the action.
	 * @param {sap.ui.dt.ElementOverlay[]} aElementOverlays - Target overlays
	 * @returns {object[]} Array of the items with required data
	 */
	AddXMLAtExtensionPoint.prototype.getMenuItems = function(aElementOverlays) {
		return this._getMenuItems(aElementOverlays, {
			pluginId: "CTX_ADDXML_AT_EXTENSIONPOINT",
			icon: "sap-icon://add-equipment"
		});
	};

	/**
	 * Gets the name of the action related to this plugin.
	 * @returns {string} Action name
	 */
	AddXMLAtExtensionPoint.prototype.getActionName = function() {
		return "AddXMLAtExtensionPoint";
	};

	/**
	 * Retrieves the action data for addXMLAtExtensionPoint.
	 * @returns {object} Object with the action data
	 */
	AddXMLAtExtensionPoint.prototype.getAction = function() {
		return { changeType: FLEX_CHANGE_TYPE };
	};

	return AddXMLAtExtensionPoint;
});