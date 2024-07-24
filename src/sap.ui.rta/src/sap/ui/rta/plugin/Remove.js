/*!
 * ${copyright}
 */

sap.ui.define([
	"sap/ui/rta/plugin/Plugin",
	"sap/ui/rta/Utils",
	"sap/ui/rta/command/CompositeCommand",
	"sap/ui/dt/OverlayRegistry",
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
	 */
	var Remove = Plugin.extend("sap.ui.rta.plugin.Remove", /** @lends sap.ui.rta.plugin.Remove.prototype */{
		metadata: {
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
	Remove.prototype.registerElementOverlay = function(...aArgs) {
		const [oOverlay] = aArgs;
		if (this.isEnabled([oOverlay])) {
			oOverlay.attachBrowserEvent("keydown", this._onKeyDown, this);
		}
		Plugin.prototype.registerElementOverlay.apply(this, aArgs);
	};

	/**
	 * @param {sap.ui.dt.ElementOverlay} oOverlay - Overlay to be checked for editable
	 * @return {Promise.<boolean>} <code>true</code> if it's editable wrapped in a promise.
	 * @private
	 */
	Remove.prototype._isEditable = function(oOverlay) {
		return this._checkChangeHandlerAndStableId(oOverlay);
	};

	/**
	 * Checks if remove is enabled for oOverlay
	 * @param {sap.ui.dt.ElementOverlay[]} aElementOverlays - Target overlays
	 * @return {boolean} true if enabled
	 * @public
	 */
	Remove.prototype.isEnabled = function(aElementOverlays) {
		var aResponsibleElementOverlays = aElementOverlays.map(function(oElementOverlay) {
			return this.getResponsibleElementOverlay(oElementOverlay);
		}.bind(this));
		var oElementOverlay = aResponsibleElementOverlays[0];
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
		return bIsEnabled && this._canBeRemovedFromAggregation(aResponsibleElementOverlays);
	};

	/**
	 * Checks if Overlay control has a valid parent and if it is
	 * not the last visible control in the aggregation
	 * The removal of the last element in the aggregation can
	 * be defined by the parameter 'removeLastElement' in the
	 * designtime of the aggregation
	 *
	 * @param  {sap.ui.dt.ElementOverlay[]} aElementOverlays - overlays to be removed
	 * @return {boolean} Returns true if the control can be removed
	 * @private
	 */
	Remove.prototype._canBeRemovedFromAggregation = function(aElementOverlays) {
		// Check if designtime allows removing last visible element
		var fnCheckDesignTimeSettings = function(oOverlay) {
			var oParentOverlay = oOverlay.getParentAggregationOverlay();
			if (oParentOverlay) {
				var oAction = this.getAction(oParentOverlay);
				return !!(oAction && oAction.removeLastElement);
			}
			return false;
		}.bind(this);

		var oOverlay = aElementOverlays[0];
		var oElement = oOverlay.getElement();
		var oParent = oElement.getParent();
		if (!oParent) {
			return false;
		}
		var aElements = oParent.getAggregation(oElement.sParentAggregationName);
		if (!Array.isArray(aElements)) {
			return true;
		}
		// check if selected Overlays are the last visible elements in aggregation
		var iNumberOfSelectedOverlays = aElementOverlays.length;
		var aInvisibleElements = aElements.filter(function(oElement) {
			var oElementOverlay = OverlayRegistry.getOverlay(oElement);
			return !(oElementOverlay && oElementOverlay.getElementVisibility());
		});
		var bIsLastVisibleElement = (aInvisibleElements.length + iNumberOfSelectedOverlays === aElements.length);
		if (bIsLastVisibleElement) {
			return fnCheckDesignTimeSettings(oOverlay);
		}
		return true;
	};

	/**
	 * @param  {sap.ui.dt.Overlay} oOverlay overlay object
	 * @return {string} Returns the confirmation text
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
	Remove.prototype.deregisterElementOverlay = function(...aArgs) {
		const [oOverlay] = aArgs;
		if (this.isEnabled([oOverlay])) {
			oOverlay.detachBrowserEvent("keydown", this._onKeyDown, this);
		}
		Plugin.prototype.deregisterElementOverlay.apply(this, aArgs);
	};

	/**
	 * Handle keydown event
	 *
	 * @param {sap.ui.base.Event} oEvent event object
	 * @private
	 */
	Remove.prototype._onKeyDown = function(oEvent) {
		if (oEvent.keyCode === KeyCodes.DELETE || oEvent.keyCode === KeyCodes.BACKSPACE) {
			oEvent.stopPropagation();
			this.removeElement();
		}
	};

	/**
	 * The selected (not the focused) element should be hidden!
	 * @param {sap.ui.dt.ElementOverlay[]} aElementOverlays - Target overlays
	 * @private
	 */
	Remove.prototype.removeElement = function(aElementOverlays) {
		var aTargetOverlays = aElementOverlays || this.getSelectedOverlays();

		aTargetOverlays = aTargetOverlays.filter(function(oElementOverlay) {
			return this.isEnabled([oElementOverlay]);
		}, this);

		if (aTargetOverlays.length > 0) {
			this.handler(aTargetOverlays);
		}
	};

	Remove.prototype._getRemoveCommand = function(oRemovedElement, oDesignTimeMetadata, sVariantManagementKey) {
		return this.getCommandFactory().getCommandFor(oRemovedElement, "Remove", {
			removedElement: oRemovedElement
		}, oDesignTimeMetadata, sVariantManagementKey);
	};

	Remove.prototype._fireElementModified = function(oCompositeCommand) {
		if (oCompositeCommand.getCommands().length) {
			this.fireElementModified({
				command: oCompositeCommand
			});
		}
	};

	Remove.prototype.handler = function(aElementOverlays) {
		var aPromises = [];
		var oCompositeCommand = new CompositeCommand();
		function fnSetFocus(oOverlay) {
			oOverlay.setSelected(true);
			setTimeout(function() {
				oOverlay.focus();
			}, 0);
		}

		var oNextOverlaySelection = Remove._getElementToFocus(aElementOverlays);

		aElementOverlays.forEach(function(oOverlay) {
			var oResponsibleElementOverlay = this.getResponsibleElementOverlay(oOverlay);
			var oRemovedElement = oResponsibleElementOverlay.getElement();
			var oDesignTimeMetadata = oResponsibleElementOverlay.getDesignTimeMetadata();
			var sVariantManagementReference = this.getVariantManagementReference(oResponsibleElementOverlay);
			var sConfirmationText = this._getConfirmationText(oResponsibleElementOverlay);

			aPromises.push(
				Promise.resolve()
				.then(function() {
					if (sConfirmationText) {
						return Utils.openRemoveConfirmationDialog(oRemovedElement, sConfirmationText);
					}
					return true;
				})
				.then(function(bConfirmed) {
					if (!bConfirmed) {
						throw Error("Cancelled");
					}

					return this._getRemoveCommand(oRemovedElement, oDesignTimeMetadata, sVariantManagementReference);
				}.bind(this))
				.then(function(oCommand) {
					oCompositeCommand.addCommand(oCommand);
				})
				.catch(function(oError) {
					if (oError && oError.message === "Cancelled") {
						if (aElementOverlays.length === 1) {
							oNextOverlaySelection = oOverlay;
						}
					} else {
						// rethrow error if a real error happened
						throw oError;
					}
				})
			);

			// deselect overlay before we remove to avoid unnecessary checks which could happen when multiple elements get removed at once
			oOverlay.setSelected(false);
		}, this);

		// since Promise.all is always asynchronous, we want to call it only if at least one promise exists
		if (aPromises.length) {
			return Promise.all(aPromises).then(function() {
				fnSetFocus(oNextOverlaySelection);
				this._fireElementModified(oCompositeCommand);
			}.bind(this))

			.catch(function(oError) {
				Log.error("Error during remove: ", oError);
			});
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
				oNextOverlaySelection = aCandidates.filter(function(oSibling) {
					return oSibling.getElement().getVisible();
				}).shift();
			}
		}
		oNextOverlaySelection ||= OverlayRegistry.getOverlay(aSelectedOverlays[0].getRelevantContainer());
		return oNextOverlaySelection;
	};

	/**
	 * Retrieve the context menu item for the action.
	 * @param {sap.ui.dt.ElementOverlay[]} aElementOverlays - Target overlays
	 * @return {object[]} - array of the items with required data
	 */
	Remove.prototype.getMenuItems = function(aElementOverlays) {
		return this._getMenuItems(aElementOverlays, {pluginId: "CTX_REMOVE", icon: "sap-icon://less"});
	};

	/**
	 * Get the name of the action related to this plugin.
	 * @return {string} Returns the action name
	 */
	Remove.prototype.getActionName = function() {
		return "remove";
	};

	return Remove;
});