/*!
 * ${copyright}
 */

sap.ui.define([
	"sap/ui/base/ManagedObject",
	"sap/ui/dt/OverlayRegistry"
],
function(
	ManagedObject,
	OverlayRegistry
) {
	"use strict";

	/**
	 * Constructor for a new Plugin.
	 *
	 * @param {string} [sId] id for the new object, generated automatically if no id is given
	 * @param {object} [mSettings] initial settings for the new object
	 *
	 * @abstract
	 * @class
	 * The Plugin allows to handle the overlays and aggregation overlays from the DesignTime
	 * The Plugin should be overridden by the real plugin implementations, which define some actions through events attached to an overlays
	 * @extends sap.ui.base.ManagedObject
	 *
	 * @author SAP SE
	 * @version ${version}
	 *
	 * @constructor
	 * @private
	 * @since 1.30
	 * @alias sap.ui.dt.Plugin
	 * @experimental Since 1.30. This class is experimental and provides only limited functionality. Also the API might be changed in future.
	 */

	var Plugin = ManagedObject.extend("sap.ui.dt.Plugin", /** @lends sap.ui.dt.Plugin.prototype */ {
		metadata : {
			"abstract" : true,
			library : "sap.ui.dt",
			properties : {
				/**
				 * DesignTime where this plugin will be used
				 */
				designTime: { // its defined as a property because spa.ui.dt.designTime is a managed object and UI5 only allows associations for elements
					type : "object",
					multiple : false
				},
				busy: {
					type : "boolean",
					defaultValue : false
				}
			},
			events : {
				processingStatusChange : {
					parameters : {
						processing : {type : "boolean"}
					}
				}
			}
		}
	});

	Plugin.prototype._bProcessingCounter = 0;

	/**
	 * Called when the Plugin is initialized
	 * @protected
	 */
	Plugin.prototype.init = function() {};

	/**
	 * Called when the Plugin is destroyed
	 * @protected
	 */
	Plugin.prototype.exit = function() {
		this.setDesignTime(null);
	};

	/**
	 * Function is called initially for every overlay in the DesignTime and then when any new overlay is created inside of the DesignTime
	 * This function should be overridden by the plugins to handle the overlays (attach events and etc.)
	 * @function
	 * @name sap.ui.dt.Plugin.prototype.registerElementOverlay
	 * @param {sap.ui.dt.ElementOverlay} an oElementOverlay which should be registered
	 * @protected
	 */
	// Plugin.prototype.registerElementOverlay = function(oElementOverlay) {};

	/**
	 * Function is called for every overlay in the DesignTime when the Plugin is deactivated.
	 * This function should be overridden by the plugins to rollback the registration and cleanup attached event etc.
	 * @function
	 * @name sap.ui.dt.Plugin.prototype.deregisterElementOverlay
	 * @param {sap.ui.dt.ElementOverlay} an oElementOverlay which should be deregistered
	 * @protected
	 */
	// Plugin.prototype.deregisterElementOverlay = function(oElementOverlay) {};

	/**
	 * Function is called initially for every aggregation overlay in the DesignTime and then when any new aggregation overlay is created inside of the DesignTime
	 * This function should be overridden by the plugins to handle the aggregation overlays (attach events and etc.)
	 * @function
	 * @name sap.ui.dt.Plugin.prototype.registerAggregationOverlay
	 * @param {sap.ui.dt.AggregationOverlay} oAggregationOverlay which should be registered
	 * @protected
	 */
	// Plugin.prototype.registerAggregationOverlay = function(oAggregationOverlay) {};

	/**
	 * Function is called for every aggregation overlay in the DesignTime when the Plugin is deactivated.
	 * This function should be overridden by the plugins to rollback the registration and cleanup attached event etc.
	 * @function
	 * @name sap.ui.dt.Plugin.prototype.deregisterAggregationOverlay
	 * @param {sap.ui.dt.AggregationOverlay} oAggregationOverlay which should be deregistered
	 * @protected
	 */
	// Plugin.prototype.deregisterAggregationOverlay = function(oAggregationOverlay) {};

	/**
	 * Sets a DesignTime, where the plugin should be used. Automatically called by "addPlugin" into DesignTime
	 * @param {sap.ui.dt.DesignTime} oDesignTime to set
	 * @return {sap.ui.dt.Plugin} returns this
	 * @public
	 */
	Plugin.prototype.setDesignTime = function(oDesignTime) {
		var oOldDesignTime = this.getDesignTime();
		if (oOldDesignTime) {
			this._deregisterOverlays(oOldDesignTime);
		}

		this.setProperty("designTime", oDesignTime);

		if (oDesignTime) {
			this._registerOverlays(oDesignTime);
		}

		return this;
	};

	/**
	 * @param {sap.ui.dt.DesignTime} oDesignTime to register overlays for
	 * @private
	 */
	Plugin.prototype._registerOverlays = function(oDesignTime) {
		if (this.registerElementOverlay || this.registerAggregationOverlay) {
			var aElementOverlays = oDesignTime.getElementOverlays();
			this.setProcessingStatus(true);
			aElementOverlays.forEach(this.callElementOverlayRegistrationMethods.bind(this));
			this.setProcessingStatus(false);
		}
	};

	/**
	 * @param {sap.ui.dt.DesignTime} oDesignTime to register overlays for
	 * @private
	 */
	Plugin.prototype._deregisterOverlays = function(oDesignTime) {
		if (this.deregisterElementOverlay || this.deregisterAggregationOverlay) {
			var aOverlays = oDesignTime.getElementOverlays();
			aOverlays.forEach(this._callElementOverlayDeregestrationMethods.bind(this));
		}
	};

	/**
	 * @param {sap.ui.dt.Overlay} oElementOverlay to call registration methods for
	 * @protected
	 */
	Plugin.prototype.callAggregationOverlayRegistrationMethods = function(oElementOverlay) {
		if (this.registerAggregationOverlay) {
			var aAggregationOverlays = oElementOverlay.getAggregationOverlays();
			aAggregationOverlays.forEach(this.registerAggregationOverlay.bind(this));
		}
	};

	/**
	 * @param {sap.ui.dt.Overlay} oElementOverlay to call registration methods for
	 * @protected
	 */
	Plugin.prototype.callElementOverlayRegistrationMethods = function(oElementOverlay) {
		if (this.registerElementOverlay) {
			this.registerElementOverlay(oElementOverlay);
		}

		this.callAggregationOverlayRegistrationMethods(oElementOverlay);
	};

	/**
	 * @param {sap.ui.dt.ElementOverlay} oElementOverlay to callde registration methods for
	 * @private
	 */
	Plugin.prototype._callElementOverlayDeregestrationMethods = function(oElementOverlay) {
		if (this.deregisterElementOverlay) {
			this.deregisterElementOverlay(oElementOverlay);
		}

		if (this.deregisterAggregationOverlay) {
			var aAggregationOverlays = oElementOverlay.getAggregationOverlays();
			aAggregationOverlays.forEach(this.deregisterAggregationOverlay.bind(this));
		}
	};

	/**
	 * @param {sap.ui.baseEvent} oEvent event object
	 * @private
	 */
	Plugin.prototype._onElementOverlayCreated = function(oEvent) {
		var oOverlay = oEvent.getParameter("elementOverlay");

		this.callElementOverlayRegistrationMethods(oOverlay);
	};

	/**
	 * Called to retrieve a context menu item for the plugin.
	 * Needs to be overriden by extending plugins.
	 * @returns {array} Empty array
	 * @protected
	 */
	Plugin.prototype.getMenuItems = function () {
		return [];
	};

	/**
	 * Retrieve the action name related to the plugin
	 * Method to be overwritten by the different plugins
	 *
	 * @override
	 * @public
	 */
	Plugin.prototype.getActionName = function() {};

	/**
	 * Indicate if a plugin is currently busy
	 *
	 * @returns {boolean} Returns whether the plugin is currently busy
	 */
	Plugin.prototype.isBusy = Plugin.prototype.getBusy;

	/**
	 * @param {boolean} bProcessing - processing state to set
	 */
	Plugin.prototype.setProcessingStatus = function(bProcessing) {
		this._bProcessingCounter = bProcessing ? this._bProcessingCounter + 1 : this._bProcessingCounter - 1;
		if (
			(bProcessing === true && this._bProcessingCounter === 1)
			|| (bProcessing === false && this._bProcessingCounter === 0)
		) {
			this.fireProcessingStatusChange({
				processing: bProcessing
			});
		}
	};

	/**
	 * Retrieve the action data from the Designtime Metadata
	 * @param  {sap.ui.dt.ElementOverlay} oOverlay Overlay containing the Designtime Metadata
	 * @return {object}          Returns an object with the action data from the Designtime Metadata
	 */
	Plugin.prototype.getAction = function(oOverlay) {
		return oOverlay.getDesignTimeMetadata() ?
			oOverlay.getDesignTimeMetadata().getAction(this.getActionName(), oOverlay.getElement())
			: null;
	};

	/**
	 * Asks the Design Time which overlays are selected
	 *
	 * @return {sap.ui.dt.ElementOverlay[]} selected overlays
	 */
	Plugin.prototype.getSelectedOverlays = function() {
		return this.getDesignTime().getSelectionManager().get();
	};

	/**
	 * Retrieve the action text (for context menu item) from the Designtime Metadata
	 * @param  {sap.ui.dt.ElementOverlay} oOverlay Overlay containing the Designtime Metadata
	 * @param  {object} mAction The action data from the Designtime Metadata
	 * @param  {string} sPluginId The ID of the plugin
	 * @return {string}         Returns the text for the menu item
	 */
	Plugin.prototype.getActionText = function (oOverlay, mAction, sPluginId) {
		var vName = mAction.name;
		var oElement = oOverlay.getElement();
		if (vName) {
			if (typeof vName === "function") {
				return vName(oElement);
			}
			return oOverlay.getDesignTimeMetadata() ? oOverlay.getDesignTimeMetadata().getLibraryText(oElement, vName) : "";
		}
		return sap.ui.getCore().getLibraryResourceBundle('sap.ui.rta').getText(sPluginId);
	};

	/**
	 * Checks if the plugin is available for an overlay
	 * Method to be overwritten by the different plugins
	 * @param {sap.ui.dt.ElementOverlay[]} aElementOverlays - Overlays to be checked
	 * @returns {boolean} Returns false by default
	 */
	Plugin.prototype.isAvailable = function () {
		return false;
	};

	/**
	 * Executes the plugin action
	 * Method to be overwritten by the different plugins
	 * @param {sap.ui.dt.ElementOverlay[]} aElementOverlays - Target overlays
	 * @override
	 * @public
	 */
	Plugin.prototype.handler = function () {};

	/**
	 * Checks if the plugin is enabled for a set of overlays
	 * Method to be overwritten by the different plugins
	 * @param {sap.ui.dt.ElementOverlay[]} aElementOverlays - Target overlays
	 * @returns {boolean} Returns false by default
	 */
	Plugin.prototype.isEnabled = function () {
		return false;
	};

	/**
	 * Generic function to return the menu items for a context menu.
	 * The text for the item can be defined in the control Designtime Metadata;
	 * otherwise the default text is used.
	 * @param {sap.ui.dt.ElementOverlay[]} aElementOverlays - Target overlays
	 * @param {object} mPropertyBag Additional properties for the menu item
	 * @param {string} mPropertyBag.pluginId The ID of the plugin
	 * @param {number} mPropertyBag.rank The rank deciding the position of the action in the context menu
	 * @param {string} mPropertyBag.icon an icon for the Button inside the context menu
	 * @param {string} mPropertyBag.group A group for buttons which should be grouped together in the MiniMenu
	 * @return {object[]} Returns an array with the object containing the required data for a context menu item
	 */
	Plugin.prototype._getMenuItems = function (aElementOverlays, mPropertyBag) {
		var aResponsibleElementOverlays = aElementOverlays.map(function(oElementOverlay) {
			return this.getResponsibleElementOverlay(oElementOverlay);
		}.bind(this));
		var oElementOverlay = aResponsibleElementOverlays[0]; // by default we get menu items only for the first overlay
		var mAction = this.getAction(oElementOverlay);
		if (!mAction || !this.isAvailable(aResponsibleElementOverlays)) {
			return [];
		}

		return [{
			id: mPropertyBag.pluginId,
			text: this.getActionText(aResponsibleElementOverlays[0], mAction, mPropertyBag.pluginId),
			handler: this.handler.bind(this),
			enabled: this.isEnabled.bind(this),
			rank: mPropertyBag.rank,
			icon: mPropertyBag.icon,
			group: mPropertyBag.group
		}];
	};

	/**
	 * Generic function to retrieve the responsible element overlay
	 * from design time metadata of a source element overlay
	 *
	 * @param {sap.ui.dt.ElementOverlay} oElementOverlay - Source element overlay
	 * @return {sap.ui.dt.ElementOverlay} Returns the element overlay of the responsible element
	 */
	Plugin.prototype.getResponsibleElementOverlay = function(oElementOverlay) {
		var oElement = oElementOverlay.getElement();
		var oDesignTimeMetadata = oElementOverlay.getDesignTimeMetadata();
		if (oDesignTimeMetadata) {
			var oResponsibleElement = oDesignTimeMetadata.getResponsibleElement(oElement);
			if (oResponsibleElement) {
				try {
					return OverlayRegistry.getOverlay(oResponsibleElement);
				} catch (oError) {
					return oElementOverlay;
				}
			}
		}
		return oElementOverlay;
	};

	return Plugin;
});
