/*!
 * ${copyright}
 */

// Provides class sap.ui.rta.plugin.Remove.
sap.ui.define([
	'sap/ui/rta/plugin/Plugin',
	'sap/ui/rta/Utils',
	'sap/ui/rta/command/CompositeCommand',
	'sap/ui/dt/OverlayRegistry'
], function(
	Plugin,
	Utils,
	CompositeCommand,
	OverlayRegistry
){
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
	Remove.prototype.registerElementOverlay = function(oOverlay) {
		if (this.isEnabled(oOverlay)) {
			oOverlay.attachBrowserEvent("keydown", this._onKeyDown, this);
		}
		Plugin.prototype.registerElementOverlay.apply(this, arguments);
	};

	/**
	 * @param {sap.ui.dt.ElementOverlay} oOverlay overlay
	 * @returns {boolean} editable or not
	 * @private
	 */
	Remove.prototype._isEditable = function(oOverlay) {
		var bEditable = false;
		var oElement = oOverlay.getElement();

		var oRemoveAction = this.getAction(oOverlay);
		if (oRemoveAction && oRemoveAction.changeType) {
			if (oRemoveAction.changeOnRelevantContainer) {
				oElement = oOverlay.getRelevantContainer();
			}
			bEditable = this.hasChangeHandler(oRemoveAction.changeType, oElement);
		}

		if (bEditable) {
			return this.hasStableId(oOverlay);
		}

		return bEditable;
	};

	/**
	 * Checks if remove is enabled for oOverlay
	 *
	 * @param {sap.ui.dt.Overlay} oOverlay overlay object
	 * @return {boolean} true if enabled
	 * @public
	 */
	Remove.prototype.isEnabled = function(oOverlay) {
		var oAction = this.getAction(oOverlay);
		var bIsEnabled = false;
		if (!oAction) {
			return bIsEnabled;
		}

		if (typeof oAction.isEnabled !== "undefined") {
			if (typeof oAction.isEnabled === "function") {
				bIsEnabled = oAction.isEnabled(oOverlay.getElement());
			} else {
				bIsEnabled = oAction.isEnabled;
			}
		} else {
			bIsEnabled = true;
		}
		return bIsEnabled && this._canBeRemovedFromAggregation(oOverlay);
	};

	/**
	 * Checks if Overlay control has a valid parent and if it is
	 * not the last visible control in the aggregation
	 *
	 * @param  {sap.ui.dt.Overlay} oOverlay Overlay for the control
	 * @return {boolean} Returns true if the control can be removed
	 * @private
	 */
	Remove.prototype._canBeRemovedFromAggregation = function(oOverlay){
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
		var iNumberOfSelectedOverlays = this.getNumberOfSelectedOverlays() || 1;
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
		if (this.isEnabled(oOverlay)) {
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
		if (oEvent.keyCode === jQuery.sap.KeyCodes.DELETE) {
			oEvent.stopPropagation();
			this.removeElement();
		}
	};

	/**
	 * The selected (not the focused) element should be hidden!
	 * @param {array} aOverlays overlay array
	 * @private
	 */
	Remove.prototype.removeElement = function(aOverlays) {
		var aSelection;
		if (aOverlays){
			aSelection = aOverlays;
		} else {
			aSelection = this.getSelectedOverlays();
		}

		aSelection = aSelection.filter(this.isEnabled, this);

		if (aSelection.length > 0) {
			this.handler(aSelection);
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

	Remove.prototype.handler = function(aSelectedOverlays) {
		var aPromises = [];
		var oCompositeCommand = new CompositeCommand();
		var fnSetFocus = function (oOverlay) {
			oOverlay.setSelected(true);
			setTimeout(function() {
				oOverlay.focus();
			}, 0);
		};

		var oNextOverlaySelection = Remove._getElementToFocus(aSelectedOverlays);

		aSelectedOverlays.forEach(function(oOverlay) {
			var oCommand;
			var oRemovedElement = oOverlay.getElement();
			var oDesignTimeMetadata = oOverlay.getDesignTimeMetadata();
			var oRemoveAction = this.getAction(oOverlay);
			var sVariantManagementReference = this.getVariantManagementReference(oOverlay, oRemoveAction);
			var sConfirmationText = this._getConfirmationText(oOverlay);

			if (sConfirmationText) {
				aPromises.push(
					Utils.openRemoveConfirmationDialog(oRemovedElement, sConfirmationText)
					.then(function(bConfirmed) {
						if (bConfirmed) {
							oCommand = this._getRemoveCommand(oRemovedElement, oDesignTimeMetadata, sVariantManagementReference);
							oCompositeCommand.addCommand(oCommand);
						}
					}.bind(this))
				);
			} else {
				oCommand = this._getRemoveCommand(oRemovedElement, oDesignTimeMetadata, sVariantManagementReference);
				oCompositeCommand.addCommand(oCommand);
			}

			// deselect overlay before we remove to avoid unnecessary checks which could happen when multiple elements get removed at once
			oOverlay.setSelected(false);
		}, this);

		// since Promise.all is always asynchronous, we want to call it only if at least one promise exists
		if (aPromises.length) {
			Promise.all(aPromises).then(function() {
				this._fireElementModified(oCompositeCommand);
				fnSetFocus(oNextOverlaySelection);
			}.bind(this));
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
	 * @param  {sap.ui.dt.ElementOverlay} oOverlay Overlay for which the context menu was opened
	 * @return {object[]}          Returns array containing the items with required data
	 */
	Remove.prototype.getMenuItems = function(oOverlay){
		return this._getMenuItems(oOverlay, {pluginId : "CTX_REMOVE", rank : 60, icon : "sap-icon://hide"});
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
