/*!
 * ${copyright}
 */

sap.ui.define([
	"sap/m/InstanceManager",
	"sap/ui/core/Element",
	"sap/ui/dt/OverlayRegistry",
	"sap/ui/dt/OverlayUtil",
	"sap/ui/events/KeyCodes",
	"sap/ui/rta/plugin/Plugin",
	"sap/ui/rta/Utils"
], function(
	InstanceManager,
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
	var Selection = Plugin.extend("sap.ui.rta.plugin.Selection", {
		metadata: {
			library: "sap.ui.rta",
			properties: {
				multiSelectionRequiredPlugins: {
					type: "string[]"
				},
				isActive: {
					type: "boolean",
					defaultValue: true
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
		var aSharedMultiSelectionPlugins = aMultiSelectionRequiredPlugins.slice();

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
	 * @returns {boolean} true if it's in developer mode
	 * @private
	 */
	Selection.prototype._checkDeveloperMode = function(oOverlay, oDesignTimeMetadata) {
		if (oDesignTimeMetadata) {
			var bDeveloperMode = this.getCommandFactory().getFlexSettings().developerMode;
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
	 * Sets the value of the isActive property.
	 * When set to false, de-select all overlays.
	 * @param {boolean} bValue - Value to be set
	 */
	Selection.prototype.setIsActive = function(bValue) {
		this.setProperty("isActive", bValue);
		if (bValue === false) {
			this._deselectOverlays();
		}
	};

	/**
	 * Register an overlay
	 *
	 * @param {sap.ui.dt.Overlay} oOverlay - Overlay object
	 * @override
	 */
	Selection.prototype.registerElementOverlay = function(oOverlay) {
		var oDesignTimeMetadata = oOverlay.getDesignTimeMetadata();
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
		oOverlay.attachBrowserEvent("mousedown", this._onMouseDown, this);
		oOverlay.attachBrowserEvent("mouseover", this._onMouseover, this);
		oOverlay.attachBrowserEvent("mouseleave", this._onMouseleave, this);
	};

	Selection.prototype._onEditableChange = function(oEvent) {
		var oOverlay = oEvent.getSource();
		this._adaptSelectable(oOverlay);
	};

	Selection.prototype._adaptSelectable = function(oOverlay) {
		var bSelectable = oOverlay.getEditable();
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
	 * Additionally to super->deregisterOverlay this method detatches the browser events
	 *
	 * @param {sap.ui.dt.Overlay} oOverlay - Overlay object
	 * @override
	 */
	Selection.prototype.deregisterElementOverlay = function(oOverlay) {
		oOverlay.detachBrowserEvent("click", this._selectOverlay, this);
		oOverlay.detachBrowserEvent("contextmenu", this._selectOverlay, this);
		oOverlay.detachBrowserEvent("keydown", this._onKeyDown, this);
		oOverlay.detachBrowserEvent("mousedown", this._onMouseDown, this);
		oOverlay.detachBrowserEvent("mouseover", this._onMouseover, this);
		oOverlay.detachBrowserEvent("mouseleave", this._onMouseleave, this);
		oOverlay.detachEditableChange(this._onEditableChange, this);
	};

	Selection.prototype._setFocusOnOverlay = function(oOverlay, oEvent) {
		if (oOverlay && oOverlay.getSelectable()) {
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
			var oElement = Element.getElementById(document.activeElement.id);
			if (oElement && oElement.isA("sap.ui.dt.ElementOverlay")) {
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
		if (!this.getIsActive()) {
			return;
		}
		var oOverlay = this._getFocusedOverlay();
		if (oEvent.keyCode === KeyCodes.ENTER) {
			this._selectOverlay(oEvent);
		} else if (oEvent.keyCode === KeyCodes.ARROW_UP && oEvent.shiftKey === false && oEvent.altKey === false) {
			if (oOverlay) {
				var oParentOverlay = Utils.getFocusableParentOverlay(oOverlay);
				this._setFocusOnOverlay(oParentOverlay, oEvent);
				oEvent.preventDefault();
			}
		} else if (oEvent.keyCode === KeyCodes.ARROW_DOWN && oEvent.shiftKey === false && oEvent.altKey === false) {
			if (oOverlay) {
				var oFirstChildOverlay = Utils.getFirstFocusableDescendantOverlay(oOverlay);
				this._setFocusOnOverlay(oFirstChildOverlay, oEvent);
				oEvent.preventDefault();
			}
		} else if (oEvent.keyCode === KeyCodes.ARROW_LEFT && oEvent.shiftKey === false && oEvent.altKey === false) {
			if (oOverlay) {
				var oPrevSiblingOverlay = Utils.getPreviousFocusableSiblingOverlay(oOverlay);
				this._setFocusOnOverlay(oPrevSiblingOverlay, oEvent);
				oEvent.preventDefault();
			}
		} else if (oEvent.keyCode === KeyCodes.ARROW_RIGHT && oEvent.shiftKey === false && oEvent.altKey === false) {
			if (oOverlay) {
				var oNextSiblingOverlay = Utils.getNextFocusableSiblingOverlay(oOverlay);
				this._setFocusOnOverlay(oNextSiblingOverlay, oEvent);
				oEvent.preventDefault();
			}
		} else if (oEvent.keyCode === KeyCodes.ESCAPE) {
			if (oOverlay) {
				this._deselectOverlays();
			}
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
		var oOverlay = OverlayRegistry.getOverlay(oEvent.currentTarget.id);
		if (!this.getIsActive()) {
			// Propagation should be stopped at the root overlay to prevent the selection of the underlying elements
			if (oOverlay.isRoot()) {
				preventEventDefaultAndPropagation(oEvent);
			}
			return;
		}
		var bMultiSelection = oEvent.metaKey || oEvent.ctrlKey || oEvent.shiftKey;
		var bContextMenu = oEvent.type === "contextmenu";

		if (oOverlay && oOverlay.getSelectable()) {
			if (oOverlay.isSelected()) {
				// don't deselect on right click!
				if (!bContextMenu) {
					this.getDesignTime().getSelectionManager().remove(oOverlay);
				}
			} else if (bMultiSelection) {
				this.getDesignTime().getSelectionManager().add(oOverlay);
			} else {
				this.getDesignTime().getSelectionManager().set(oOverlay);
			}

			preventEventDefaultAndPropagation(oEvent);
		} else if (oOverlay && oOverlay.isRoot()) {
			preventEventDefaultAndPropagation(oEvent);
		}
	};

	/**
	 * Handle MouseDown event
	 *
	 * @param {sap.ui.base.Event} oEvent - Event object
	 * @private
	 */
	Selection.prototype._onMouseDown = function(oEvent) {
		if (!this.getIsActive()) {
			// In Visualization Mode we must prevent MouseDown-Event for Overlays
			// We have to close open PopOvers from the ChangeVisualization because they
			// should close on MouseDown
			var oOverlay = OverlayRegistry.getOverlay(oEvent.currentTarget.id);
			// Propagation should be stopped at the root overlay to prevent the selection of the underlying elements
			if (oOverlay.isRoot()) {
				preventEventDefaultAndPropagation(oEvent);
			}
			InstanceManager.getOpenPopovers().forEach(function(oPopOver) {
				if (oPopOver._bOpenedByChangeIndicator) {
					oPopOver.close();
				}
			});
			return;
		}
	};

	/**
	 * Handle mouseover event
	 * @param  {sap.ui.base.Event} oEvent - Event object
	 * @private
	 */
	Selection.prototype._onMouseover = function(oEvent) {
		var oOverlay = OverlayRegistry.getOverlay(oEvent.currentTarget.id);
		// due to some timing issues the mouseover event callback can be triggered during drag&drop
		if (
			!this.getIsActive()
			|| (this.getDesignTime() && this.getDesignTime().getBusyPlugins().length)
		) {
			// Propagation should be stopped at the root overlay to prevent the selection of the underlying elements
			if (oOverlay.isRoot()) {
				preventEventDefaultAndPropagation(oEvent);
			}
			return;
		}
		if (oOverlay.isSelectable()) {
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
		var oOverlay = OverlayRegistry.getOverlay(oEvent.currentTarget.id);
		if (!this.getIsActive()) {
			// Propagation should be stopped at the root overlay to prevent the selection of the underlying elements
			if (oOverlay.isRoot()) {
				preventEventDefaultAndPropagation(oEvent);
			}
			return;
		}
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
		}
		delete this._oHoverTarget;
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