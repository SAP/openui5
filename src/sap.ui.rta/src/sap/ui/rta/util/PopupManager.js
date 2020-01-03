/*!
 * ${copyright}
 */

/* global Map */
sap.ui.define([
	"sap/ui/thirdparty/jquery",
	"sap/ui/base/ManagedObject",
	"sap/m/InstanceManager",
	"sap/ui/dt/Overlay",
	"sap/ui/fl/Utils",
	"sap/ui/core/Component",
	"sap/ui/core/ComponentContainer",
	"sap/ui/core/Element",
	"sap/ui/dt/util/ZIndexManager",
	"sap/m/Dialog",
	"sap/m/Popover",
	"sap/base/util/restricted/_curry"
],
function (
	jQuery,
	ManagedObject,
	InstanceManager,
	Overlay,
	flUtils,
	Component,
	ComponentContainer,
	Element,
	ZIndexManager,
	Dialog,
	Popover,
	_curry
) {
	"use strict";

	var FOCUS_EVENT_NAMES = {
		add: "_activateFocusHandle",
		remove: "_deactivateFocusHandle"
	};

	/**
	 * Constructor for a new sap.ui.rta.util.PopupManager
	 * @extends sap.ui.base.ManagedObject
	 * @author SAP SE
	 * @version ${version}
	 * @constructor
	 * @private
	 * @since 1.48
	 * @alias sap.ui.rta.util.PopupManager
	 * @experimental Since 1.48. This class is experimental and provides only limited functionality. Also the API might
	 *               be changed in future.
	 */
	var PopupManager = ManagedObject.extend("sap.ui.rta.util.PopupManager", {
		metadata : {
			properties : {
				rta:  "any"
			},
			associations : {
				/**
				 * To set the associated controls as an autoCloseArea for all Popover/Dialog open in RTA mode.
				 * Needs to be filled before the popup is open.
				 */
				autoCloseAreas : {type : "sap.ui.core.Control", multiple : true, singularName : "autoCloseArea"}
			},
			events : {
				open: {
					parameters : {
						oControl : {type : "sap.ui.core.Control"}
					}
				},
				close: {
					parameters : {
						oControl : {type : "sap.ui.core.Control"}
					}
				}
			},
			library : "sap.ui.rta"
		}
	});

	/**
	 * Creates Map for modal states
	 *
	 * @private
	 */
	PopupManager.prototype.init = function() {
		// create map for modal states
		this._oModalState = new Map();
		this._aPopupFilters = [this._isSupportedPopup.bind(this), this._isPopupAdaptable.bind(this)];
		this._aPopupFilters.forEach(function (fnFilter) {
			ZIndexManager.addPopupFilter(fnFilter);
		});
	};

	/**
	 * Checks if popups are open on the screen
	 * Overrides the AddDialogInstance/AddPopoverInstance and RemoveDialogInstance/RemovePopoverInstance methods for Instance Manager
	 * for dynamic overlay creation of popups.
	 *
	 * @private
	 */
	PopupManager.prototype._overrideInstanceFunctions = function() {
		//check open popups and create overlays while starting RTA
		this._applyPopupAttributes({
			method: this._createPopupOverlays,
			setModal: true,
			bringToTop: true
		});

		//override InstanceManager.AddDialogInstance() and InstanceManager.AddPopoverInstance()
		this._overrideAddPopupInstance();

		//override InstanceManager.RemoveDialogInstance()  and InstanceManager.RemovePopoverInstance()
		this._overrideRemovePopupInstance();
	};

	/**
	 * Retrieves all open popups which are supported.
	 * Thereafter the result is categorized into adaptable dialogs, adaptable popovers and all supported popup controls.
	 *
	 * @returns {object} Categorized object of supported popups
	 * @public
	 */
	PopupManager.prototype.getCategorizedOpenPopups = function() {
		var aOpenDialogs;
		var aOpenPopovers;

		// check if dialogs are already open when RTA is started
		aOpenDialogs = InstanceManager.getOpenDialogs();
		// separate adaptable dialogs from all supported dialogs
		var oCategorizedDialogs = this._getValidatedPopups(aOpenDialogs);

		// check if popovers are already open when RTA is started
		aOpenPopovers = InstanceManager.getOpenPopovers();
		// separate adaptable popovers from all supported popovers
		var oCategorizedPopovers = this._getValidatedPopups(aOpenPopovers);

		var oOpenPopups = {
			aDialogs: oCategorizedDialogs.relevant,
			aPopovers: oCategorizedPopovers.relevant,
			aAllSupportedPopups: oCategorizedDialogs.allSupported.concat(oCategorizedPopovers.allSupported)
		};
		return oOpenPopups;
	};

	/**
	 * Filters the passed array and returns an object containing list of adaptable popups and all supported popup controls (also includes non-adaptable popups).
	 *
	 * @param {sap.ui.core.Popup[]} aOpenPopups Specifies open popups
	 * @returns {object} Returns an object containing all adaptation relevant popups and all supported popup controls
	 * @private
	 */
	PopupManager.prototype._getValidatedPopups = function(aOpenPopups) {
		var aAllSupportedPopups = [];
		aOpenPopups = aOpenPopups.filter(function(oPopupElement) {
			if (this._isPopupAdaptable(oPopupElement)) {
				aAllSupportedPopups.push(oPopupElement);
				return true;
			} else if (oPopupElement instanceof Dialog) {
					// all modal type popups are supported for which modal property is later turned true, when in Adaptation mode
				aAllSupportedPopups.push(oPopupElement);
			}
		}.bind(this));

		return {
			relevant: aOpenPopups,
			allSupported: aAllSupportedPopups
		};
	};

	/**
	 * Check if app component is inside a popup
	 *
	 * @param {sap.ui.core.Control} oPopup popup element
	 * @returns {boolean} indicating if component is inside a popup
	 * @private
	 */
	PopupManager.prototype._isComponentInsidePopup = function(oPopup) {
		//check if root RTA component is directly inside a popupElement
		return jQuery.isArray(oPopup.getContent())
			? oPopup.getContent().some(
				function(oContent) {
					if (oContent instanceof ComponentContainer) {
						return this.oRtaRootAppComponent === this._getAppComponentForControl(Component.get(oContent.getComponent()));
					}
				}.bind(this))
			: false;
	};

	/**
	 * Check if the passed control is a supported popup
	 *
	 * @param {sap.ui.core.Control} oPopup popup element
	 * @returns {boolean} indicating if this type of popup element is supported
	 * @private
	 */
	PopupManager.prototype._isSupportedPopup = function(oPopup) {
		return (oPopup instanceof Dialog || oPopup instanceof Popover);
	};

	/**
	 * Overrides the setter function of property rta for dynamic overlay creation
	 *
	 * @param {sap.ui.rta.RuntimeAuthoring} oRta RuntimeAuthoring object
	 * @public
	 */
	PopupManager.prototype.setRta = function(oRta) {
		if (oRta && oRta._oDesignTime) {
			this.setProperty("rta", oRta);
			var oRootControl = oRta.getRootControlInstance();
			this.oRtaRootAppComponent = this._getAppComponentForControl(oRootControl);
			//listener for RTA mode change
			var fnModeChange = this._onModeChange.bind(this);
			oRta.attachModeChanged(fnModeChange);
			this._overrideInstanceFunctions();
		}
	};

	/**
	 * Attached to RTA mode change
	 * @param  {sap.ui.base.Event} oEvent The Event triggered by the mode change
	 */
	PopupManager.prototype._onModeChange = function(oEvent) {
		var sNewMode = oEvent.getParameters().mode;

		var fnApplyFocusAndSetModal = function (sMode, oPopover) {
			if (sMode === 'navigation') {
				// add focus handlers
				oPopover.oPopup[this._getFocusEventName("add")]();
			} else {
				// remove focus handler
				oPopover.oPopup[this._getFocusEventName("remove")]();
				// ensure the toolbar is visible
				if (this.getRta().getShowToolbars()) {
					this.getRta().getToolbar().bringToFront();
				}
			}
		};

		sNewMode === 'navigation'
			? this._applyPatchesToOpenPopups(_curry(fnApplyFocusAndSetModal)(sNewMode))
			: this._removePatchesToOpenPopups(_curry(fnApplyFocusAndSetModal)(sNewMode));
	};

	/**
	 * Apply focus events to all open popups and set focus on the first.
	 * @param {function} fnFocusEvent Function to apply to open popups
	 * @private
	 */
	PopupManager.prototype._applyPatchesToOpenPopups = function(fnEvent) {
		this._applyPopupAttributes({
			method: fnEvent,
			focus: true,
			setModal: false
		});
	};

	/**
	 * Remove focus events from all open popups.
	 * @param {function} fnFocusEvent Function to apply to open popups
	 * @private
	 */
	PopupManager.prototype._removePatchesToOpenPopups = function(fnEvent) {
		this._applyPopupAttributes({
			method: fnEvent,
			setModal: true
		});
	};

	/**
	 * Return the popup focus event name.
	 *
	 * @param {string} sOperation Operation name
	 * @returns {string} focus event name
	 * @private
	 */
	PopupManager.prototype._getFocusEventName = function(sOperation) {
		return FOCUS_EVENT_NAMES[sOperation];
	};

	/**
	 * Overrides the AddDialogInstance/AddPopoverInstance for Instance Manager for dynamic overlay creation.
	 *
	 * @private
	 */
	PopupManager.prototype._overrideAddPopupInstance = function() {
		//Dialog
		this._fnOriginalAddDialogInstance = InstanceManager.addDialogInstance;
		InstanceManager.addDialogInstance = this._overrideAddFunctions(this._fnOriginalAddDialogInstance);

		//Popover
		this._fnOriginalAddPopoverInstance = InstanceManager.addPopoverInstance;
		InstanceManager.addPopoverInstance = this._overrideAddFunctions(this._fnOriginalAddPopoverInstance);
	};

	/**
	 * Returns overridden function for AddDialogInstance/AddPopoverInstance of Instance Manager.
	 *
	 * @param {function} fnOriginalFunction original InstanceManager function
	 * @returns {function} overridden function
	 * @private
	 */
	PopupManager.prototype._overrideAddFunctions = function(fnOriginalFunction) {
		return function(oPopupElement) {
			var vOriginalReturn = fnOriginalFunction.apply(InstanceManager, arguments);
			if (this._isSupportedPopup(oPopupElement)) {
				if (this._isPopupAdaptable(oPopupElement)
					&& this.getRta()._oDesignTime) {
					oPopupElement.attachEventOnce("afterOpen", this._createPopupOverlays, this);
					//PopupManager internal method
					oPopupElement.attachEventOnce("afterOpen", this.fireOpen, this);
					this._setModal(true, oPopupElement);
				} else if (!(oPopupElement instanceof Popover)) {
					// for all popups which are non-adaptable and non-popovers
					this._setModal(true, oPopupElement);
				}
			}
			return vOriginalReturn;
		}.bind(this);
	};

	/**
	 * Sets or un-sets the passed popup element as a modal.
	 *
	 * @param {boolean} bSetModal - If the passed popup element is required to be set as modal
	 * @param {sap.ui.core.Control} oPopupElement - The popup element
	 *
	 * @private
	 */
	PopupManager.prototype._setModal = function (bSetModal, oPopupElement) {
		var bOriginalModalState = this._oModalState.get(oPopupElement.oPopup);
		if (typeof bOriginalModalState !== "boolean" && bSetModal && this.getRta().getMode() === 'adaptation') {
			this._oModalState.set(oPopupElement.oPopup, oPopupElement.oPopup.getModal());
			oPopupElement.oPopup.setModal(true);
		} else if (typeof bOriginalModalState === "boolean" && bSetModal === false) {
			oPopupElement.oPopup.setModal(bOriginalModalState);
			this._oModalState.delete(oPopupElement.oPopup);
		}
	};

	/**
	 * Applies the passed function to the relevant open popups.
	 *
	 * @param {function} fnPopupMethod specifies function to be applied
	 * @param {boolean} bFocus Set to true if the popup is in focus
	 * @private
	 */
	PopupManager.prototype._applyPopupAttributes = function(mPropertyBag) {
		//check if popups are open
		var oRelevantPopups = this.getCategorizedOpenPopups();

		["aDialogs", "aPopovers"].forEach(function(sKey) {
			if (oRelevantPopups[sKey].length > 0) {
				//set focus
				if (mPropertyBag.focus) {
					if (oRelevantPopups[sKey][0].oPopup.oContent) {
						oRelevantPopups[sKey][0].oPopup.oContent.focus();
					}
				}

				oRelevantPopups[sKey].forEach(function(oPopupElement) {
					//call passed method for all relevant popups
					mPropertyBag.method.call(this, oPopupElement);
				}.bind(this));
			}
		}.bind(this));

		//set modal for all popups
		oRelevantPopups.aAllSupportedPopups.forEach(this._setModal.bind(this, mPropertyBag.setModal));
	};

	/**
	 * Modifies browser events for passed popup element
	 *
	 * @param {sap.ui.core.Control} oPopupElement popup element for which browser events have to be modified
	 * @private
	 */
	PopupManager.prototype._applyPopupPatch = function(oPopupElement) {
		var oOverlayContainer = Overlay.getOverlayContainer();
		var oPopup = oPopupElement.oPopup;
		var aAutoCloseAreas = [
			oPopup.oContent.getDomRef(),
			oOverlayContainer.get(0)
		].concat(
			this.getAutoCloseAreas()
		);

		if (this.getRta().getShowToolbars()) {
			var oRtaToolbar = this.getRta().getToolbar();
			var bVisible = !!oRtaToolbar.getVisible();
			// Check if  RTA is not started -> toolbar is not visible
			if (!bVisible) {
				this.getRta().attachEventOnce("start", function() {
					aAutoCloseAreas.push(oRtaToolbar.getDomRef());
				});
			} else {
				aAutoCloseAreas.push(oRtaToolbar.getDomRef());
			}
		}
		//If clicked from toolbar or popup - autoClose is disabled
		oPopup.setAutoCloseAreas(aAutoCloseAreas);

		//cases when onAfterRendering is called after this function - app inside popup
		if (!this.fnOriginalPopupOnAfterRendering) {
			this.fnOriginalPopupOnAfterRendering = oPopup.onAfterRendering;
		}
		oPopup.onAfterRendering = function () {
			var vOriginalReturn = this.fnOriginalPopupOnAfterRendering.apply(oPopup, arguments);
			oPopup[this._getFocusEventName("remove")]();
			return vOriginalReturn;
		}.bind(this);

		//only remove focus event when in adaptation mode
		if (this.getRta().getMode() === 'adaptation') {
			oPopup[this._getFocusEventName("remove")]();
		}
	};

	/**
	 * Overrides the RemoveDialogInstance/RemovePopoverInstance methods for Instance Manager for dynamic overlay creation
	 *
	 * @private
	 */
	PopupManager.prototype._overrideRemovePopupInstance = function() {
		//Dialog
		this._fnOriginalRemoveDialogInstance = InstanceManager.removeDialogInstance;
		InstanceManager.removeDialogInstance = this._overrideRemoveFunctions(this._fnOriginalRemoveDialogInstance);

		//Popover
		this._fnOriginalRemovePopoverInstance = InstanceManager.removePopoverInstance;
		InstanceManager.removePopoverInstance = this._overrideRemoveFunctions(this._fnOriginalRemovePopoverInstance);
	};

	/**
	 * Returns overridden function for RemoveDialogInstance/RemovePopoverInstance of Instance Manager
	 *
	 * @param {function} fnOriginalFunction original InstanceManager function
	 * @returns {function} overridden function
	 * @private
	 */
	PopupManager.prototype._overrideRemoveFunctions = function(fnOriginalFunction) {
		return function(oPopupElement) {
			var vOriginalReturn = fnOriginalFunction.apply(InstanceManager, arguments);
			if (this._isSupportedPopup(oPopupElement)) {
				if (this._isPopupAdaptable(oPopupElement, false)
					&& this.getRta()._oDesignTime) {
					this.getRta()._oDesignTime.removeRootElement(oPopupElement);
				}
				// remove the Modal state from the map
				this._oModalState.delete(oPopupElement.oPopup);
				//PopupManager internal method
				this.fireClose(oPopupElement);
			}
			return vOriginalReturn;
		}.bind(this);
	};

	/**
	 * Returns the app component of the passed control is exists
	 *
	 * @param {sap.ui.core.Control} oControl Control object
	 * @returns {object|undefined} component object if exists
	 * @private
	 */
	PopupManager.prototype._getAppComponentForControl = function(oControl) {
		var oComponent;
		var oAppComponent;

		if (oControl instanceof Component) {
			oComponent = oControl;
		} else {
			oComponent = this._getComponentForControl(oControl);
		}

		if (oComponent) {
			oAppComponent = flUtils.getAppComponentForControl(oComponent);
		}
		return oAppComponent;
	};

	/**
	 * Returns the component of the passed control, navigating through control tree, except if parent is sap.ui.core.UIArea
	 *
	 * @param {sap.ui.core.Control} oControl Control object
	 * @returns {object|undefined} component object if exists
	 * @private
	 */
	PopupManager.prototype._getComponentForControl = function(oControl) {
		var oComponent;
		var oRootComponent;
		var oParentControl;
		if (oControl) {
			oComponent = Component.getOwnerComponentFor(oControl);
			if (
				!oComponent
				&& typeof oControl.getParent === "function"
				&& oControl.getParent() instanceof Element
			) {
				oParentControl = oControl.getParent();
			} else if (oComponent) {
				oParentControl = oComponent;
			}

			if (oParentControl) {
				oRootComponent = this._getComponentForControl(oParentControl);
			}
		}

		return oRootComponent || oComponent;
	};

	/**
	 * Create popup overlays
	 *
	 * @param {object} oEvent Browser Event or sap.ui.core.Control object
	 * @private
	 */
	PopupManager.prototype._createPopupOverlays = function(oEvent) {
		if (!oEvent) {
			return;
		}
		var oPopupElement = (oEvent instanceof Element) ? oEvent : oEvent.getSource();

		//when application is opened in a popup, rootElement should not be added more than once
		if (
			this.getRta()._oDesignTime.getRootElements().indexOf(oPopupElement.getId()) === -1
			&& !this._isComponentInsidePopup(oPopupElement)
		) {
			this.getRta()._oDesignTime.addRootElement(oPopupElement);
		}

		//detach for persistent popups with same id
		oPopupElement.detachAfterOpen(this._createPopupOverlays, this);

		this._applyPopupPatch(oPopupElement);
	};

	/**
	 * Restores the Instance Manager AddDialogInstance/AddPopoverInstance, RemoveDialogInstance/RemovePopoverInstance methods and default blur event for popups
	 *
	 * @private
	 */
	PopupManager.prototype._restoreInstanceFunctions = function() {
		//Dialog
		if (this._fnOriginalAddDialogInstance) {
			InstanceManager.addDialogInstance = this._fnOriginalAddDialogInstance;
		}
		if (this._fnOriginalRemoveDialogInstance) {
			InstanceManager.removeDialogInstance = this._fnOriginalRemoveDialogInstance;
		}

		//Popover
		if (this._fnOriginalAddPopoverInstance) {
			InstanceManager.addPopoverInstance = this._fnOriginalAddPopoverInstance;
		}
		if (this._fnOriginalRemovePopoverInstance) {
			InstanceManager.removePopoverInstance = this._fnOriginalRemovePopoverInstance;
		}

		this._applyPatchesToOpenPopups(this._removePopupPatch);
	};

	/**
	 * Restore default popup settings and give focus.
	 * @param {sap.ui.core.Control} oPopupElement Popup element to remove custom browser events and add default browser events
	 *
	 * @private
	 */
	PopupManager.prototype._removePopupPatch = function(oPopupElement) {
		var oPopup = oPopupElement.oPopup;
		oPopup[this._getFocusEventName("add")]();
		if (this.fnOriginalPopupOnAfterRendering) {
			oPopup.onAfterRendering = this.fnOriginalPopupOnAfterRendering;
		}
	};

	PopupManager.prototype._isPopupAdaptable = function(oPopupElement) {
		//For variantManagement manage dialog
		if (oPopupElement.isPopupAdaptationAllowed && !oPopupElement.isPopupAdaptationAllowed()) {
			return false;
		}

		var oPopupAppComponent = this._getAppComponentForControl(oPopupElement);

		return this.oRtaRootAppComponent === oPopupAppComponent || this._isComponentInsidePopup(oPopupElement);
	};

	/**
	 * Called after PopupManager instance is destroyed.
	 *
	 * @public
	 */
	PopupManager.prototype.exit = function() {
		this._restoreInstanceFunctions();
		delete this._oModalState;
		this._aPopupFilters.forEach(function (fnFilter) {
			ZIndexManager.removePopupFilter(fnFilter);
		});
	};

	return PopupManager;
});