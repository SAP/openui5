/*!
 * ${copyright}
 */

sap.ui.define([
	'sap/ui/rta/plugin/Plugin',
	'sap/ui/rta/Utils',
	'sap/ui/fl/Utils',
	'sap/ui/dt/OverlayRegistry',
	"sap/ui/events/KeyCodes",
	"sap/ui/dt/Overlay",
	"sap/ui/dt/Util",
	"sap/ui/Device"
],
function (
	Plugin,
	Utils,
	FlexUtils,
	OverlayRegistry,
	KeyCodes,
	Overlay,
	DtUtil,
	Device
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
	 * @experimental Since 1.34. This class is experimental and provides only limited functionality. Also the API might be changed in future.
	 */
	var Selection = Plugin.extend("sap.ui.rta.plugin.Selection", {
		metadata: {
			library: "sap.ui.rta",
			properties: {
				multiSelectionRequiredPlugins : {
					type : "string[]"
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

	Selection.prototype.init = function () {
		this._multiSelectionValidator = this._multiSelectionValidator.bind(this);
		Plugin.prototype.init.apply(this, arguments);
	};

	/**
	 * @param {sap.ui.dt.ElementOverlay} oOverlay overlay to be checked for developer mode
	 * @returns {boolean} true if it's in developer mode
	 * @private
	 */
	Selection.prototype._checkDeveloperMode = function (oOverlay) {
		if (oOverlay.getDesignTimeMetadata()) {
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
	 * Register an overlay
	 *
	 * @param {sap.ui.dt.Overlay} oOverlay overlay object
	 * @override
	 */
	Selection.prototype.registerElementOverlay = function (oOverlay) {
		if (!this._checkDeveloperMode(oOverlay)) {
			oOverlay.attachEditableChange(this._onEditableChange, this);
			this._adaptSelectable(oOverlay);
		}

		oOverlay.attachBrowserEvent("click", this._selectOverlay, this);
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
			if (!bSelectable){
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
	 * @param {sap.ui.dt.Overlay} oOverlay overlay object
	 * @override
	 */
	Selection.prototype.deregisterElementOverlay = function(oOverlay) {
		oOverlay.detachBrowserEvent("click", this._selectOverlay, this);
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
	 * Handle keydown event
	 *
	 * @param {sap.ui.base.Event} oEvent event object
	 * @private
	 */
	Selection.prototype._onKeyDown = function(oEvent) {
		var oOverlay = Utils.getFocusedOverlay();
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
		}
	};

	Selection.prototype._selectOverlay = function (oEvent) {
		var oOverlay = OverlayRegistry.getOverlay(oEvent.currentTarget.id);
		var bMultiSelection = oEvent.metaKey || oEvent.ctrlKey;

		if (oOverlay && oOverlay.getSelectable()) {
			if (oOverlay.isSelected()) {
				this.getDesignTime().getSelectionManager().remove(oOverlay);
			} else {
				if (bMultiSelection) {
					this.getDesignTime().getSelectionManager().add(oOverlay);
				} else {
					this.getDesignTime().getSelectionManager().set(oOverlay);
				}
			}

			oEvent.preventDefault();
			oEvent.stopPropagation();
		}
	};

	/**
	 * Handle MouseDown event
	 *
	 * @param {sap.ui.base.Event} oEvent event object
	 * @private
	 */
	Selection.prototype._onMouseDown = function(oEvent) {
		// set focus after clicking, needed only for internet explorer
		if (Device.browser.name == "ie"){
			// when the EasyAdd Button is clicked, we don't want to focus/stopPropagation.
			// but when the OverlayScrollContainer is the target, we want it to behave like a click on an overlay
			var oTarget = OverlayRegistry.getOverlay(oEvent.target.id);
			var bTargetIsScrollContainer = jQuery(oEvent.target).hasClass("sapUiDtOverlayScrollContainer");
			var oOverlay = OverlayRegistry.getOverlay(oEvent.currentTarget.id);
			if (
				oOverlay
				&& (bTargetIsScrollContainer || oTarget instanceof Overlay)
			) {
				if (oOverlay.getSelectable()){
					oOverlay.focus();
					oEvent.stopPropagation();
				} else {
					oOverlay.getDomRef().blur();
				}
			}
		}
	};

	/**
	 * Handle mouseover event
	 * @param  {sap.ui.base.Event} oEvent event object
	 * @private
	 */
	Selection.prototype._onMouseover = function(oEvent) {
		var oOverlay = OverlayRegistry.getOverlay(oEvent.currentTarget.id);
		if (oOverlay.isSelectable()){
			if (oOverlay !== this._oHoverTarget) {
				this._removePreviousHover();
				this._oHoverTarget = oOverlay;
				oOverlay.addStyleClass("sapUiRtaOverlayHover");
			}
			oEvent.preventDefault();
			oEvent.stopPropagation();
		}
	};

	/**
	 * Handle mouseleave event
	 * @param  {sap.ui.base.Event} oEvent event object
	 * @private
	 */
	Selection.prototype._onMouseleave = function(oEvent) {
		var oOverlay = OverlayRegistry.getOverlay(oEvent.currentTarget.id);
		if (oOverlay.isSelectable()){
			this._removePreviousHover();
			oEvent.preventDefault();
			oEvent.stopPropagation();
		}
	};

	/**
	 * Remove Previous Hover
	 * @private
	 */
	Selection.prototype._removePreviousHover = function() {
		if (this._oHoverTarget) {
			this._oHoverTarget.removeStyleClass("sapUiRtaOverlayHover");
		}
		delete this._oHoverTarget;
	};

	/**
	 * @override
	 */
	Selection.prototype.setDesignTime = function(oDesignTime) {
		//detach from listener from old DesignTime instance
		if (this.getDesignTime()) {
			this.getDesignTime().getSelectionManager().removeValidator(this._multiSelectionValidator);
		}

		//set new DesignTime instance in parent class
		Plugin.prototype.setDesignTime.apply(this, arguments);

		//attach listener back to the new DesignTime instance
		if (this.getDesignTime()) {
			this.getDesignTime().getSelectionManager().addValidator(this._multiSelectionValidator);
		}
	};

	Selection.prototype._multiSelectionValidator = function (aElementOverlays) {
		return (
			aElementOverlays.length === 1
			|| (
				_hasSharedMultiSelectionPlugins(aElementOverlays, this.getMultiSelectionRequiredPlugins())
				&& _hasSharedRelevantContainer(aElementOverlays)
				&& (
					_hasSameParent(aElementOverlays)
					|| _isOfSameType(aElementOverlays)
				)
			)
		);
	};

	function _hasSharedMultiSelectionPlugins(aElementOverlays, aMultiSelectionRequiredPlugins) {
		var aSharedMultiSelectionPlugins = aMultiSelectionRequiredPlugins.slice();

		aElementOverlays.forEach(function (oElementOverlay) {
			aSharedMultiSelectionPlugins = DtUtil.intersection(aSharedMultiSelectionPlugins, oElementOverlay.getEditableByPlugins());
		});

		return aSharedMultiSelectionPlugins.length > 0;
	}

	function _hasSharedRelevantContainer(aElementOverlays) {
		return aElementOverlays.every(function (oElementOverlay) {
			return oElementOverlay.getRelevantContainer() === aElementOverlays[0].getRelevantContainer();
		});
	}

	function _hasSameParent(aElementOverlays) {
		return aElementOverlays.every(function(oElementOverlay) {
			return oElementOverlay.getParentElementOverlay() === aElementOverlays[0].getParentElementOverlay();
		});
	}

	function _isOfSameType(aElementOverlays) {
		return aElementOverlays.every(function (oElementOverlay) {
			return oElementOverlay.getElement().getMetadata().getName() === aElementOverlays[0].getElement().getMetadata().getName();
		});
	}

	return Selection;
}, /* bExport= */true);