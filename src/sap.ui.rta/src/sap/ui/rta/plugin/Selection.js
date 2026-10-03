/*!
 * ${copyright}
 */

sap.ui.define([
	"sap/ui/core/Element",
	"sap/ui/dt/OverlayRegistry",
	"sap/ui/dt/OverlayUtil",
	"sap/ui/events/KeyCodes",
	"sap/ui/rta/plugin/Plugin",
	"sap/ui/rta/Utils"
], function(
	Element,
	OverlayRegistry,
	OverlayUtil,
	KeyCodes,
	Plugin,
	Utils
) {
	"use strict";

	/**
	 * Constructor for a new Selection plugin.
	 *
	 * @param {string} [sId] id for the new object, generated automatically if no id is given
	 * @param {object} [mSettings] initial settings for the new object
	 * @class The Selection plugin allows you to select or focus overlays with mouse or keyboard and navigate to others.
	 * @extends sap.ui.rta.plugin.Plugin
	 * @author SAP SE
	 * @version ${version}
	 * @constructor
	 * @private
	 * @since 1.34
	 * @alias sap.ui.rta.plugin.Selection
	 */
	const Selection = Plugin.extend("sap.ui.rta.plugin.Selection", {
		metadata: {
			library: "sap.ui.rta",
			properties: {
				multiSelectionRequiredPlugins: {
					type: "string[]"
				}
			},
			associations: {},
			events: {
				elementEditableChange: {
					parameters: {
						editable: {
							type: "boolean"
						}
					}
				}
			}
		}
	});

	function preventEventDefaultAndPropagation(oEvent) {
		oEvent.preventDefault();
		oEvent.stopPropagation();
	}

	function hasSharedMultiSelectionPlugins(aElementOverlays, aMultiSelectionRequiredPlugins) {
		let aSharedMultiSelectionPlugins = aMultiSelectionRequiredPlugins.slice();

		aElementOverlays.forEach(function(oElementOverlay) {
			aSharedMultiSelectionPlugins = aSharedMultiSelectionPlugins.filter(function(sPlugin) {
				return oElementOverlay.getEditableByPlugins()[sPlugin];
			});
		});

		return aSharedMultiSelectionPlugins.length > 0;
	}

	function hasSharedRelevantContainer(aElementOverlays) {
		return aElementOverlays.every(function(oElementOverlay) {
			return oElementOverlay.getRelevantContainer() === aElementOverlays[0].getRelevantContainer();
		});
	}

	function hasSameParent(aElementOverlays) {
		return aElementOverlays.every(function(oElementOverlay) {
			return oElementOverlay.getParentElementOverlay() === aElementOverlays[0].getParentElementOverlay();
		});
	}

	function isOfSameType(aElementOverlays) {
		return aElementOverlays.every(function(oElementOverlay) {
			return oElementOverlay.getElement().getMetadata().getName() === aElementOverlays[0].getElement().getMetadata().getName();
		});
	}

	Selection.prototype.init = function(...aArgs) {
		this._multiSelectionValidator = this._multiSelectionValidator.bind(this);
		Plugin.prototype.init.apply(this, aArgs);
	};

	/**
	 * @param {sap.ui.dt.ElementOverlay} oOverlay - Overlay to be checked for developer mode
	 * @param {sap.ui.dt.DesignTimeMetadata} oDesignTimeMetadata - Design Time Metadata of the element
	 * @returns {boolean} <code>true</code> if it's in developer mode
	 * @private
	 */
	Selection.prototype._checkDeveloperMode = function(oOverlay, oDesignTimeMetadata) {
		if (oDesignTimeMetadata) {
			const bDeveloperMode = this.getCommandFactory().getFlexSettings().developerMode;
			if (bDeveloperMode && this.hasStableId(oOverlay)) {
				oOverlay.setEditable(true);
				oOverlay.setSelectable(true);
				this.fireElementEditableChange({
					editable: true
				});
				return true;
			}
		}
		return false;
	};

	/**
	 * Register an overlay
	 *
	 * @param {sap.ui.dt.Overlay} oOverlay - Overlay object
	 * @override
	 */
	Selection.prototype.registerElementOverlay = function(oOverlay) {
		const oDesignTimeMetadata = oOverlay.getDesignTimeMetadata();
		if (
			!oDesignTimeMetadata.markedAsNotAdaptable() &&
			!this._checkDeveloperMode(oOverlay, oDesignTimeMetadata)
		) {
			oOverlay.attachEditableChange(this._onEditableChange, this);
			this._adaptSelectable(oOverlay);
		}

		oOverlay.attachBrowserEvent("click", this._selectOverlay, this);
		oOverlay.attachBrowserEvent("contextmenu", this._selectOverlay, this);
		oOverlay.attachBrowserEvent("keydown", this._onKeyDown, this);
		oOverlay.attachBrowserEvent("mouseover", this._onMouseover, this);
		oOverlay.attachBrowserEvent("mouseleave", this._onMouseleave, this);
	};

	Selection.prototype._onEditableChange = function(oEvent) {
		const oOverlay = oEvent.getSource();
		this._adaptSelectable(oOverlay);
	};

	Selection.prototype._adaptSelectable = function(oOverlay) {
		const bSelectable = oOverlay.getEditable();
		if (oOverlay.getSelectable() !== bSelectable) {
			oOverlay.setSelectable(bSelectable);
			if (!bSelectable) {
				this._removePreviousHover();
			}
			this.fireElementEditableChange({
				editable: bSelectable
			});
		}
	};

	/**
	 * Additionally to super->deregisterOverlay this method detaches the browser events
	 *
	 * @param {sap.ui.dt.Overlay} oOverlay - Overlay object
	 * @override
	 */
	Selection.prototype.deregisterElementOverlay = function(oOverlay) {
		oOverlay.detachBrowserEvent("click", this._selectOverlay, this);
		oOverlay.detachBrowserEvent("contextmenu", this._selectOverlay, this);
		oOverlay.detachBrowserEvent("keydown", this._onKeyDown, this);
		oOverlay.detachBrowserEvent("mouseover", this._onMouseover, this);
		oOverlay.detachBrowserEvent("mouseleave", this._onMouseleave, this);
		oOverlay.detachEditableChange(this._onEditableChange, this);
	};

	Selection.prototype._setFocusOnOverlay = function(oOverlay, oEvent) {
		if (oOverlay.getSelectable()) {
			oOverlay.focus();
			oEvent.stopPropagation();
		}
	};

	/**
	 * Returns the focused overlay
	 *
	 * @returns {sap.ui.dt.ElementOverlay} Overlay object
	 * @private
	 */
	Selection.prototype._getFocusedOverlay = function() {
		if (document.activeElement) {
			const oElement = Element.getElementById(document.activeElement.id);
			if (oElement?.isA("sap.ui.dt.ElementOverlay")) {
				return oElement;
			}
		}
		return undefined;
	};

	/**
	 * Handle keydown event
	 *
	 * @param {sap.ui.base.Event} oEvent - Event object
	 * @private
	 */
	Selection.prototype._onKeyDown = function(oEvent) {
		const oOverlay = this._getFocusedOverlay();
		const bOverlayAndNoShiftAlt = oOverlay && oEvent.shiftKey === false && oEvent.altKey === false;
		switch (oEvent.keyCode) {
			case KeyCodes.ENTER:
				this._selectOverlay(oEvent);
				break;
			case KeyCodes.ARROW_UP:
				if (bOverlayAndNoShiftAlt) {
					const oParentOverlay = Utils.getFocusableParentOverlay(oOverlay);
					this._setFocusOnOverlay(oParentOverlay, oEvent);
					oEvent.preventDefault();
				}
				break;
			case KeyCodes.ARROW_DOWN:
				if (bOverlayAndNoShiftAlt) {
					const oFirstChildOverlay = Utils.getFirstFocusableDescendantOverlay(oOverlay);
					this._setFocusOnOverlay(oFirstChildOverlay, oEvent);
					oEvent.preventDefault();
				}
				break;
			case KeyCodes.ARROW_LEFT:
				if (bOverlayAndNoShiftAlt) {
					const oPrevSiblingOverlay = Utils.getPreviousFocusableSiblingOverlay(oOverlay);
					this._setFocusOnOverlay(oPrevSiblingOverlay, oEvent);
					oEvent.preventDefault();
				}
				break;
			case KeyCodes.ARROW_RIGHT:
				if (bOverlayAndNoShiftAlt) {
					const oNextSiblingOverlay = Utils.getNextFocusableSiblingOverlay(oOverlay);
					this._setFocusOnOverlay(oNextSiblingOverlay, oEvent);
					oEvent.preventDefault();
				}
				break;
			case KeyCodes.ESCAPE:
				if (oOverlay) {
					this._deselectOverlays();
				}
				break;
			default:
				break;
		}
	};

	/**
	 * Deselect all selected Overlays
	 *
	 * @private
	 */
	Selection.prototype._deselectOverlays = function() {
		this.getDesignTime().getSelectionManager().reset();
	};

	Selection.prototype._selectOverlay = function(oEvent) {
		const oOverlay = OverlayRegistry.getOverlay(oEvent.currentTarget.id);
		const oSelectionManager = this.getDesignTime().getSelectionManager();
		const bMultipleOverlaysSelected = oSelectionManager.get().length > 1;
		const bMultiSelection = oEvent.metaKey || oEvent.ctrlKey || oEvent.shiftKey;
		const bContextMenu = oEvent.type === "contextmenu";

		if (oOverlay?.getSelectable()) {
			if (oOverlay.isSelected()) {
				// don't deselect on right click!
				if (!bContextMenu) {
					if (!bMultiSelection && bMultipleOverlaysSelected) {
						// if the overlay is already selected and the user left clicks on it we deselect all other overlays
						oSelectionManager.set([oOverlay]);
					} else {
						oSelectionManager.remove(oOverlay);
					}
				}
			} else if (bMultiSelection) {
				oSelectionManager.add(oOverlay);
			} else {
				oSelectionManager.set(oOverlay);
			}

			preventEventDefaultAndPropagation(oEvent);
		} else if (oOverlay?.isRoot()) {
			preventEventDefaultAndPropagation(oEvent);
		}
	};

	/**
	 * Handle mouseover event
	 * @param  {sap.ui.base.Event} oEvent - Event object
	 * @private
	 */
	Selection.prototype._onMouseover = function(oEvent) {
		const oOverlay = OverlayRegistry.getOverlay(oEvent.currentTarget.id);
		// due to some timing issues the mouseover event callback can be triggered during drag&drop
		if (this.getDesignTime()?.getBusyPlugins().length) {
			// Propagation should be stopped at the root overlay to prevent the selection of the underlying elements
			if (oOverlay.isRoot()) {
				preventEventDefaultAndPropagation(oEvent);
			}
		} else if (oOverlay.isSelectable()) {
			// The "mouseleave" event is not always fired before the next "mouseover" (e.g. while a
			// context menu is open and the mouse moves back onto an overlay). Release the parent held
			// by the previously hovered overlay first, otherwise the still non-movable parent would be
			// skipped when determining the first movable parent below and could never be reset again.
			if (this._oHoverTarget) {
				OverlayUtil.setFirstParentMovable(this._oHoverTarget, true);
			}
			OverlayUtil.setFirstParentMovable(oOverlay, false);
			if (oOverlay !== this._oHoverTarget) {
				this._removePreviousHover();
				this._oHoverTarget = oOverlay;
				this.getDesignTime().getSelectionManager().addHover(oOverlay);
			}
			preventEventDefaultAndPropagation(oEvent);
		}
	};

	/**
	 * Handle mouseleave event
	 * @param  {sap.ui.base.Event} oEvent - Event object
	 * @private
	 */
	Selection.prototype._onMouseleave = function(oEvent) {
		const oOverlay = OverlayRegistry.getOverlay(oEvent.currentTarget.id);
		if (oOverlay.isSelectable()) {
			OverlayUtil.setFirstParentMovable(oOverlay, true);
			this._removePreviousHover();
			preventEventDefaultAndPropagation(oEvent);
		}
	};

	/**
	 * Remove Previous Hover
	 * @private
	 */
	Selection.prototype._removePreviousHover = function() {
		if (this._oHoverTarget) {
			this.getDesignTime().getSelectionManager().removeHover(this._oHoverTarget);
			delete this._oHoverTarget;
		}
	};

	/**
	 * @override
	 */
	Selection.prototype.setDesignTime = function(...aArgs) {
		// detach from listener from old DesignTime instance
		if (this.getDesignTime()) {
			this.getDesignTime().getSelectionManager().removeValidator(this._multiSelectionValidator);
		}

		// set new DesignTime instance in parent class
		Plugin.prototype.setDesignTime.apply(this, aArgs);

		// attach listener back to the new DesignTime instance
		if (this.getDesignTime()) {
			this.getDesignTime().getSelectionManager().addValidator(this._multiSelectionValidator);
		}
	};

	Selection.prototype._multiSelectionValidator = function(aElementOverlays) {
		return (
			aElementOverlays.length === 1
			|| (
				hasSharedMultiSelectionPlugins(aElementOverlays, this.getMultiSelectionRequiredPlugins())
				&& hasSharedRelevantContainer(aElementOverlays)
				&& (
					hasSameParent(aElementOverlays)
					|| isOfSameType(aElementOverlays)
				)
			)
		);
	};

	return Selection;
});