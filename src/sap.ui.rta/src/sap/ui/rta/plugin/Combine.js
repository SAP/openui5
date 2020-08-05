/*!
 * ${copyright}
 */

sap.ui.define([
	"sap/ui/rta/plugin/Plugin",
	"sap/ui/rta/Utils",
	"sap/ui/dt/Util"
], function(
	Plugin,
	Utils,
	DtUtil
) {
	"use strict";

	/**
	 * Constructor for a new Combine Plugin.
	 *
	 * @class
	 * @extends sap.ui.rta.plugin.Plugin
	 * @author SAP SE
	 * @version ${version}
	 * @constructor
	 * @private
	 * @since 1.46
	 * @alias sap.ui.rta.plugin.Combine
	 * @experimental Since 1.46. This class is experimental and provides only limited functionality. Also the API might be changed in future.
	 */
	var Combine = Plugin.extend("sap.ui.rta.plugin.Combine", /** @lends sap.ui.rta.plugin.Combine.prototype */ {
		metadata: {
			library: "sap.ui.rta",
			properties: {},
			associations: {},
			events: {}
		}
	});

	/**
	 * Check if the given overlay is editable.
	 * @param {sap.ui.dt.ElementOverlay} oOverlay - Overlay to be checked for editable
	 * @returns {Promise.<boolean>|boolean} <code>true</code> when editable wrapped in a promise.
	 * @private
	 */
	Combine.prototype._isEditable = function (oOverlay) {
		var oCombineAction = this.getAction(oOverlay);
		if (!oOverlay.isRoot() && oCombineAction && oCombineAction.changeType && oCombineAction.changeOnRelevantContainer) {
			var oRelevantContainer = oOverlay.getRelevantContainer();
			return this.hasChangeHandler(oCombineAction.changeType, oRelevantContainer)
				.then(function(bHasChangeHandler) {
					return bHasChangeHandler &&
						this.hasStableId(oOverlay) &&
						this._checkRelevantContainerStableID(oCombineAction, oOverlay);
				}.bind(this));
		}
		return false;
	};

	Combine.prototype._checkForSameRelevantContainer = function(aElementOverlays) {
		var aRelevantContainer = [];
		for (var i = 0, n = aElementOverlays.length; i < n; i++) {
			aRelevantContainer[i] = aElementOverlays[i].getRelevantContainer();
			var oCombineAction = this.getAction(aElementOverlays[i]);
			if (!oCombineAction || !oCombineAction.changeType) {
				return false;
			}
			if (i > 0) {
				if ((aRelevantContainer[0] !== aRelevantContainer[i])
					|| (this.getAction(aElementOverlays[0]).changeType !== oCombineAction.changeType)) {
					return false;
				}
			}
		}
		return true;
	};

	/**
	 * Checks the binding compatibility of all given elements. Absolute binding will not be considered
	 *
	 * @param {sap.ui.core.Element[]|sap.ui.core.Component[]} aControls - Array of controls to be checked for binding compatibility
	 * @param {sap.ui.model.Model} oModel - Model for filtering irrelevant binding paths
	 * @return {boolean} <code>true</code> when the controls have compatible bindings.
	 */
	Combine.prototype._checkBindingCompatibilityOfControls = function(aControls, oModel) {
		return aControls.every(function(oSource) {
			return aControls.every(function(oTarget) {
				return oSource !== oTarget ? Utils.checkSourceTargetBindingCompatibility(oSource, oTarget, oModel) : true;
			});
		});
	};

	/**
	 * Checks if Combine is available for oOverlay
	 * @param {sap.ui.dt.ElementOverlay[]} aElementOverlays - Target overlays
	 * @return {boolean} true if available
	 * @public
	 */
	Combine.prototype.isAvailable = function (aElementOverlays) {
		if (aElementOverlays.length <= 1) {
			return false;
		}

		return (
			aElementOverlays.every(function (oElementOverlay) {
				return this._isEditableByPlugin(oElementOverlay);
			}, this)
			&& this._checkForSameRelevantContainer(aElementOverlays)
		);
	};

	/**
	 * Checks if Combine is enabled for oOverlay
	 * @param {sap.ui.dt.ElementOverlay[]} aElementOverlays - Target overlays
	 * @return {boolean} true if enabled
	 * @public
	 */
	Combine.prototype.isEnabled = function (aElementOverlays) {
		// check that at least 2 fields can be combined
		if (!this.isAvailable(aElementOverlays) || aElementOverlays.length <= 1) {
			return false;
		}

		var aControls = aElementOverlays.map(function (oElementOverlay) {
			return oElementOverlay.getElement();
		});

		// check that each specified element has an enabled action
		var bActionCheck = aElementOverlays.every(function(oElementOverlay) {
			var oAction = this.getAction(oElementOverlay);
			if (!oAction) {
				return false;
			}

			// when isEnabled is not defined the default is true
			if (typeof oAction.isEnabled !== "undefined") {
				if (typeof oAction.isEnabled === "function") {
					return oAction.isEnabled(aControls);
				}
				return oAction.isEnabled;
			}

			return true;
		}, this);

		if (bActionCheck) {
			// check if all the target elements have the same binding context
			var oDefaultModel = aControls[0] && aControls[0].getModel();
			return this._checkBindingCompatibilityOfControls(aControls, oDefaultModel);
		}

		return bActionCheck;
	};

	/**
	 * @param {sap.ui.dt.ElementOverlay[]} aElementOverlays - specified overlays
	 * @param {sap.ui.core.Element} oCombineElement - element where the combine was triggered
	 * @returns {promise} Promise
	 */
	Combine.prototype.handleCombine = function(aElementOverlays, oCombineElement) {
		var oCombineElementOverlay;
		var aElements = aElementOverlays.map(function (oElementOverlay) {
			if (oElementOverlay.getElement().getId() === oCombineElement.getId()) {
				oCombineElementOverlay = oElementOverlay;
			}
			return oElementOverlay.getElement();
		});
		var oDesignTimeMetadata = oCombineElementOverlay.getDesignTimeMetadata();
		var sVariantManagementReference = this.getVariantManagementReference(oCombineElementOverlay);

		return this.getCommandFactory().getCommandFor(
			oCombineElement,
			"combine",
			{
				source : oCombineElement,
				combineElements : aElements
			},
			oDesignTimeMetadata,
			sVariantManagementReference
		)

		.then(function(oCombineCommand) {
			this.fireElementModified({
				command : oCombineCommand
			});
		}.bind(this))

		.catch(function(oMessage) {
			throw DtUtil.createError("Combine#handleCombine", oMessage, "sap.ui.rta");
		});
	};

	/**
	 * Retrieve the context menu item for the action.
	 * @param  {sap.ui.dt.ElementOverlay[]} aElementOverlays - Overlays for which actions are requested
	 * @return {object[]} - returns array containing the items with required data
	 */
	Combine.prototype.getMenuItems = function (aElementOverlays) {
		return this._getMenuItems(
			aElementOverlays,
			{
				pluginId: "CTX_GROUP_FIELDS",
				rank: 90,
				icon: "sap-icon://combine"
			}
		);
	};

	/**
	 * Get the name of the action related to this plugin.
	 * @return {string} Returns the action name
	 */
	Combine.prototype.getActionName = function() {
		return "combine";
	};

	/**
	 * Trigger the plugin execution.
	 * @param {sap.ui.dt.ElementOverlay[]} aElementOverlays - Target overlays
	 * @param {object} mPropertyBag - Property bag
	 * @param {sap.ui.core.Element} mPropertyBag.contextElement - Element where combine was triggered
	 */
	Combine.prototype.handler = function (aElementOverlays, mPropertyBag) {
		this.handleCombine(aElementOverlays, mPropertyBag.contextElement);
	};

	return Combine;
});
