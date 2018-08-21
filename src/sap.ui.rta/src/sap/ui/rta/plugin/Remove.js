/*!
 * ${copyright}
 */

sap.ui.define([
	'sap/ui/rta/plugin/Plugin',
	'sap/ui/rta/Utils',
	'sap/ui/rta/command/CompositeCommand',
	'sap/ui/dt/OverlayRegistry',
	"sap/ui/events/KeyCodes",
	"sap/base/Log"
], function(
	Plugin,
	Utils,
	CompositeCommand,
	OverlayRegistry,
	KeyCodes,
	Log
) {
	"use strict";

	/**
	 * Constructor for a new Remove Plugin.
	 *
	 * @param {string} [sId] id for the new object, generated automatically if no id is given
	 * @param {object} [mSettings] initial settings for the new object
	 * @class The Remove allows trigger remove operations on the overlay
	 * @extends sap.ui.rta.plugin.Plugin
	 * @author SAP SE
	 * @version ${version}
	 * @constructor
	 * @private
	 * @since 1.34
	 * @alias sap.ui.rta.plugin.Remove
	 * @experimental Since 1.34. This class is experimental and provides only limited functionality. Also the API might be changed in future.
	 */
	var Remove = Plugin.extend("sap.ui.rta.plugin.Remove", /** @lends sap.ui.rta.plugin.Remove.prototype */
	{
		metadata: {
			// ---- object ----

			// ---- control specific ----
			library: "sap.ui.rta",
			properties: {},
			associations: {},
			events: {}
		}
	});

	/**
	 * Register browser event for an overlay
	 *
	 * @param {sap.ui.dt.Overlay} oOverlay overlay object
	 * @override
	 */
	Remove.prototype.registerElementOverlay = function (oOverlay) {
		if (this.isEnabled([oOverlay])) {
			oOverlay.attachBrowserEvent("keydown", this._onKeyDown, this);
		}
		Plugin.prototype.registerElementOverlay.apply(this, arguments);
	};

	/**
	 * @param {sap.ui.dt.ElementOverlay} oOverlay overlay
	 * @returns {boolean} editable or not
	 * @private
	 */
	Remove.prototype._isEditable = function (oElementOverlay) {
		var bEditable = false;
		var oElement = oElementOverlay.getElement();

		var oRemoveAction = this.getAction(oElementOverlay);
		if (oRemoveAction && oRemoveAction.changeType) {
			if (oRemoveAction.changeOnRelevantContainer) {
				oElement = oElementOverlay.getRelevantContainer();
			}
			bEditable = this.hasChangeHandler(oRemoveAction.changeType, oElement) &&
						this._checkRelevantContainerStableID(oRemoveAction, oElementOverlay);
		}

		if (bEditable) {
			return this.hasStableId(oElementOverlay);
		}

		return bEditable;
	};

	/**
	 * Checks if remove is enabled for oOverlay
	 * @param {sap.ui.dt.ElementOverlay[]} aElementOverlays - Target overlays
	 * @return {boolean} true if enabled
	 * @public
	 */
	Remove.prototype.isEnabled = function (aElementOverlays) {
		var oElementOverlay = aElementOverlays[0];
		var oAction = this.getAction(oElementOverlay);
		var bIsEnabled = false;

		if (!oAction) {
			return bIsEnabled;
		}

		if (typeof oAction.isEnabled !== "undefined") {
			if (typeof oAction.isEnabled === "function") {
				bIsEnabled = oAction.isEnabled(oElementOverlay.getElement());
			} else {
				bIsEnabled = oAction.isEnabled;
			}
		} else {
			bIsEnabled = true;
		}
		return bIsEnabled && this._canBeRemovedFromAggregation(aElementOverlays);
	};

	/**
	 * Checks if Overlay control has a valid parent and if it is
	 * not the last visible control in the aggregation
	 *
	 * @param  {sap.ui.dt.ElementOverlay[]} aElementOverlays - overlays to be removed
	 * @return {boolean} Returns true if the control can be removed
	 * @private
	 */
	Remove.prototype._canBeRemovedFromAggregation = function(aElementOverlays){
		var oOverlay = aElementOverlays[0];
		var oElement = oOverlay.getElement();
		var oParent = oElement.getParent();
		if (!oParent){
			return false;
		}
		var aElements = oParent.getAggregation(oElement.sParentAggregationName);
		if (!Array.isArray(aElements)){
			return true;
		}
		if (aElements.length === 1){
			return false;
		}

		// Fallback to 1 if no overlay is selected
		var iNumberOfSelectedOverlays = aElementOverlays.length;
		var aInvisibleElements = aElements.filter(function(oElement){
			var oElementOverlay = OverlayRegistry.getOverlay(oElement);
			return !(oElementOverlay && oElementOverlay.getElementVisibility());
		});
		return !(aInvisibleElements.length === (aElements.length - iNumberOfSelectedOverlays));
	};

	/**
	 * @param  {sap.ui.dt.Overlay} oOverlay overlay object
	 * @return {String} Returns the confirmation text
	 * @private
	 */
	Remove.prototype._getConfirmationText = function(oOverlay) {
		var oAction = this.getAction(oOverlay);
		if (oAction && oAction.getConfirmationText) {
			return oAction.getConfirmationText(oOverlay.getElement());
		}
	};

	/**
	 * Detaches the browser events
	 *
	 * @param {sap.ui.dt.Overlay} oOverlay overlay object
	 * @override
	 */
	Remove.prototype.deregisterElementOverlay = function(oOverlay) {
		if (this.isEnabled([oOverlay])) {
			oOverlay.detachBrowserEvent("keydown", this._onKeyDown, this);
		}
		Plugin.prototype.deregisterElementOverlay.apply(this, arguments);
	};

	/**
	 * Handle keydown event
	 *
	 * @param {sap.ui.base.Event} oEvent event object
	 * @private
	 */
	Remove.prototype._onKeyDown = function(oEvent) {
		if (oEvent.keyCode === KeyCodes.DELETE) {
			oEvent.stopPropagation();
			this.removeElement();
		}
	};

	/**
	 * The selected (not the focused) element should be hidden!
	 * @param {sap.ui.dt.ElementOverlay[]} aElementOverlays - Target overlays
	 * @private
	 */
	Remove.prototype.removeElement = function (aElementOverlays) {
		var aTargetOverlays = aElementOverlays ? aElementOverlays : this.getSelectedOverlays();

		aTargetOverlays = aTargetOverlays.filter(function (oElementOverlay) {
			return this.isEnabled([oElementOverlay]);
		}, this);

		if (aTargetOverlays.length > 0) {
			this.handler(aTargetOverlays);
		}
	};

	Remove.prototype._getRemoveCommand = function(oRemovedElement, oDesignTimeMetadata, sVariantManagementKey) {
		return this.getCommandFactory().getCommandFor(oRemovedElement, "Remove", {
			removedElement : oRemovedElement
		}, oDesignTimeMetadata, sVariantManagementKey);
	};

	Remove.prototype._fireElementModified = function(oCompositeCommand) {
		if (oCompositeCommand.getCommands().length) {
			this.fireElementModified({
				"command" : oCompositeCommand
			});
		}
	};

	Remove.prototype.handler = function (aElementOverlays) {
		var aPromises = [];
		var oCompositeCommand = new CompositeCommand();
		var fnSetFocus = function (oOverlay) {
			oOverlay.setSelected(true);
			setTimeout(function() {
				oOverlay.focus();
			}, 0);
		};

		var oNextOverlaySelection = Remove._getElementToFocus(aElementOverlays);

		aElementOverlays.forEach(function(oOverlay) {
			var oPromise;
			var oRemovedElement = oOverlay.getElement();
			var oDesignTimeMetadata = oOverlay.getDesignTimeMetadata();
			var oRemoveAction = this.getAction(oOverlay);
			var sVariantManagementReference = this.getVariantManagementReference(oOverlay, oRemoveAction);
			var sConfirmationText = this._getConfirmationText(oOverlay);

			oPromise = Promise.resolve()

			.then(function() {
				if (sConfirmationText) {
					return Utils.openRemoveConfirmationDialog(oRemovedElement, sConfirmationText);
				}
				return true;
			})

			.then(function(bConfirmed) {
				if (bConfirmed) {
					return this._getRemoveCommand(oRemovedElement, oDesignTimeMetadata, sVariantManagementReference);
				}
				return undefined;
			}.bind(this))

			.then(function(oCommand) {
				if (oCommand) {
					oCompositeCommand.addCommand(oCommand);
				}
			});

			aPromises.push(oPromise);

			// deselect overlay before we remove to avoid unnecessary checks which could happen when multiple elements get removed at once
			oOverlay.setSelected(false);
		}, this);

		// since Promise.all is always asynchronous, we want to call it only if at least one promise exists
		if (aPromises.length) {
			Promise.all(aPromises).then(function() {
				this._fireElementModified(oCompositeCommand);
				fnSetFocus(oNextOverlaySelection);
			}.bind(this))

			.catch(function(oError) {
				Log.error("Error during remove: ", oError);
			});
		} else {
			this._fireElementModified(oCompositeCommand);
			fnSetFocus(oNextOverlaySelection);
		}
	};

	Remove._getElementToFocus = function(aSelectedOverlays) {
		// BCP: 1780366011
		// if one element is selected then we try to get next or previous sibling
		// considering already hidden siblings, if not succeed then select relevant container
		var oNextOverlaySelection;
		if (aSelectedOverlays.length === 1) {
			var oOverlay = aSelectedOverlays[0];
			var aSiblings = oOverlay.getParent().getAggregation(oOverlay.sParentAggregationName);
			if (aSiblings.length > 1) {
				var iOverlayPosition = aSiblings.indexOf(oOverlay);
				var aCandidates = aSiblings.slice(iOverlayPosition + 1);
				if (iOverlayPosition !== 0) {
					aCandidates = aCandidates.concat(
						aSiblings.slice(0, iOverlayPosition).reverse()
					);
				}
				oNextOverlaySelection = aCandidates.filter(function (oSibling) {
					return oSibling.getElement().getVisible();
				}).shift();
			}
		}
		if (!oNextOverlaySelection) {
			oNextOverlaySelection = OverlayRegistry.getOverlay(aSelectedOverlays[0].getRelevantContainer());
		}
		return oNextOverlaySelection;
	};

	/**
	 * Retrieve the context menu item for the action.
	 * @param {sap.ui.dt.ElementOverlay[]} aElementOverlays - Target overlays
	 * @return {object[]} - array of the items with required data
	 */
	Remove.prototype.getMenuItems = function (aElementOverlays) {
		return this._getMenuItems(aElementOverlays, {pluginId : "CTX_REMOVE", rank : 60, icon : "sap-icon://hide"});
	};

	/**
	 * Get the name of the action related to this plugin.
	 * @return {string} Returns the action name
	 */
	Remove.prototype.getActionName = function(){
		return "remove";
	};

	return Remove;
}, /* bExport= */true);