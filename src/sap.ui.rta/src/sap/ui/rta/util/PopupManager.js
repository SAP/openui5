/*!
 * ${copyright}
 */
sap.ui.define(['jquery.sap.global',
		'sap/ui/base/ManagedObject',
		'sap/m/Dialog',
		'sap/m/Popover',
		'sap/m/InstanceManager',
		'sap/ui/core/Popup',
		'sap/ui/dt/OverlayRegistry',
		'sap/ui/fl/Utils',
		'sap/ui/core/Component'
	],
	function (jQuery,
	          ManagedObject,
	          Dialog,
	          Popover,
	          InstanceManager,
	          Popup,
	          OverlayRegistry,
	          flUtils,
	          Component
	) {
		"use strict";

		var FOCUS_EVENT_NAMES = {
			"add": "_addFocusEventListeners",
			"remove": "_removeFocusEventListeners"
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
		 * Checks if popups are open on the screen
		 * Overrides the AddDialogInstance/AddPopoverInstance and RemoveDialogInstance/RemovePopoverInstance methods for Instance Manager
		 * for dynamic overlay creation of popups.
		 *
		 * @private
		 */
		PopupManager.prototype._overrideInstanceFunctions = function() {

			//check open popups and create overlays while starting RTA
			this._applyPopupMethods(this._createPopupOverlays);

			//override InstanceManager.AddDialogInstance() and InstanceManager.AddPopoverInstance()
			this._overrideAddPopupInstance();

			//override InstanceManager.RemoveDialogInstance()  and InstanceManager.RemovePopoverInstance()
			this._overrideRemovePopupInstance();
		};

		/**
		 * Retrieve relevant open popups for dynamic overlay creation.
		 *
		 * @returns {Object} relevant open popups
		 * @public
		 */
		PopupManager.prototype.getRelevantPopups = function() {
			var aOpenDialogs, aOpenPopovers;

			//check if dialogs are already open when RTA is started
			aOpenDialogs = InstanceManager.getOpenDialogs();

			//check if popovers are already open when RTA is started
			aOpenPopovers = InstanceManager.getOpenPopovers();

			var oRelevantPopups = {
				aDialogs: this._getValidatedPopups(aOpenDialogs),
				aPopovers: this._getValidatedPopups(aOpenPopovers)
			};
			return oRelevantPopups;
		};

		/**
		 * Retrieve array of validated popups after component comparision - this.oRtaRootAppComponent.oContainer.getParent()
		 *
		 * @param {array} specifying open popups
		 * @returns {array|boolean} relevant popups or false
		 * @private
		 */
		PopupManager.prototype._getValidatedPopups = function(aOpenPopups) {
				aOpenPopups.forEach(function(oPopup, iIndex) {
					if (
						!this._isSupportedPopup(oPopup)
						|| (
							this.oRtaRootAppComponent !== this._getAppComponentForControl(oPopup)
							&& !this._isComponentInsidePopup(oPopup)
						)
					) {
						aOpenPopups.splice(iIndex, 1);
					}
				}.bind(this));

			return (aOpenPopups.length > 0) ? aOpenPopups : false;
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
			return oPopup.getContent().some(
				function(oContent) {
					if (oContent instanceof sap.ui.core.ComponentContainer) {
						return this.oRtaRootAppComponent === this._getAppComponentForControl(sap.ui.getCore().getComponent(oContent.getComponent()));
					}
				}.bind(this));
		};

		/**
		 * Check if the passed control is a supported popup
		 *
		 * @param {sap.ui.core.Control} oPopup popup element
		 * @returns {boolean} indicating if this type of popup element is supported
		 * @private
		 */
		PopupManager.prototype._isSupportedPopup = function(oPopup) {
			return (oPopup instanceof sap.m.Dialog || oPopup instanceof sap.m.Popover);
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
				var oRootControl = sap.ui.getCore().byId(oRta.getRootControl());
				this.oRtaRootAppComponent = this._getAppComponentForControl(oRootControl);
				this._overrideInstanceFunctions();

				//listener for RTA mode change
				var fnModeChange = this._onModeChange.bind(this);
				oRta.attachModeChanged(fnModeChange);
			}
		};

		/**
		 * Attached to RTA mode change
		 *
		 * @private
		 */
		PopupManager.prototype._onModeChange = function(oEvent) {
			var sFocusEvent, sNewMode = oEvent.getParameters().mode;

			var fnApplyFocusEvent = function (oPopover) {
				oPopover.oPopup[sFocusEvent]();
			};

			if (sNewMode === 'navigation') {
				sFocusEvent = this._getFocusEventName("add");
				this._applyFocusEventsToOpenPopups(fnApplyFocusEvent);
			} else {
				sFocusEvent = this._getFocusEventName("remove");
				this._removeFocusEventsFromOpenPopups(fnApplyFocusEvent);
			}
		};

		/**
		 * Apply focus events to all open popups and give focus to the first
		 *
		 * @private
		 */
		PopupManager.prototype._applyFocusEventsToOpenPopups = function(fnFocusEvent) {
			this._applyPopupMethods(fnFocusEvent, true);
		};

		/**
		 * Remove focus events from all open popups
		 *
		 * @private
		 */
		PopupManager.prototype._removeFocusEventsFromOpenPopups = function(fnFocusEvent) {
			this._applyPopupMethods(fnFocusEvent);
		};

		/**
		 * Return the popup focus event name
		 *
		 * @param {string} operation name
		 * @returns {string} focus event name
		 * @private
		 */
		PopupManager.prototype._getFocusEventName = function(sOperation) {
			return FOCUS_EVENT_NAMES[sOperation];
		};

		/**
		 * Overrides the AddDialogInstance/AddPopoverInstance for Instance Manager for dynamic overlay creation
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
		 * Returns overridden function for AddDialogInstance/AddPopoverInstance of Instance Manager
		 *
		 * @param {function} fnOriginalFunction original InstanceManager function
		 * @returns {function} overridden function
		 * @private
		 */
		PopupManager.prototype._overrideAddFunctions = function(fnOriginalFunction) {
			return function(oPopupElement) {
				var vOriginalReturn = fnOriginalFunction.apply(InstanceManager, arguments);
				if (
					this.getRta()._oDesignTime
					&&  this.oRtaRootAppComponent === this._getAppComponentForControl(oPopupElement)
					&&  this._isSupportedPopup(oPopupElement)
				) {
					oPopupElement.attachAfterOpen(this._createPopupOverlays, this);
					//PopupManager internal method
					this.fireOpen(oPopupElement);
				}
				return vOriginalReturn;
			}.bind(this);
		};

		/**
		 * Applies the passed function to the relevant open popups
		 *
		 * @param {function} fnPopupMethod specifies function to be applied
		 * @private
		 */
		PopupManager.prototype._applyPopupMethods = function(fnPopupMethod, bFocus) {
			//check if popups are open
			var oRelevantPopups = this.getRelevantPopups();

			//apply passed method to each open popup
			Object.keys(oRelevantPopups).forEach(function(sKey) {
				if (oRelevantPopups[sKey]) {
					if (bFocus) {
						jQuery.sap.focus(oRelevantPopups[sKey][0].oPopup.oContent);
					}
					oRelevantPopups[sKey].forEach(function(oPopupElement) {
						fnPopupMethod.call(this, oPopupElement);
					}.bind(this));
				}
			}.bind(this));
		};

		/**
		 * Modifies browser events for passed popup element
		 *
		 * @param {sap.ui.core.Control} oPopupElement popup element for which browser events have to be modified
		 * @private
		 */
		PopupManager.prototype._applyPopupPatch = function(oPopupElement) {
			var oPopup = oPopupElement.oPopup;

			//If clicked from toolbar or popup - autoClose is disabled
			oPopup.setAutoCloseAreas([this.getRta()._oToolsMenu.getDomRef(), oPopup.oContent.getDomRef()]);

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

				if (
					this.getRta()._oDesignTime
					&& this.oRtaRootAppComponent === this._getAppComponentForControl(oPopupElement)
					&& this._isSupportedPopup(oPopupElement)
				) {
					this.getRta()._oDesignTime.removeRootElement(oPopupElement);
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
			var oComponent, oAppComponent;

			if (oControl instanceof sap.ui.core.Component) {
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

			if (oControl) {
				oComponent = Component.getOwnerComponentFor(oControl);

				if (
					!oComponent
					&& typeof oControl.getParent === "function"
					&& !(oControl.getParent() instanceof sap.ui.core.UIArea)
				) {
					oControl = oControl.getParent();
					oComponent = this._getComponentForControl(oControl);
				}
			}

			return oComponent;
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
			var oPopupElement = (oEvent instanceof sap.ui.core.Control) ? oEvent : oEvent.getSource();

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

			this._applyPopupMethods(this._removePopupPatch);
		};

		/**
		 * Restore default popup settings and give focus
		 * @param {sap.ui.core.Control} oControl popup element to remove custom and add default browser events
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

		/**
		 * Called after PopupManager instance is destroyed.
		 *
		 * @public
		 */
		PopupManager.prototype.exit = function() {
			this._restoreInstanceFunctions();
		};

		return PopupManager;

	}, /* bExport= */ true);
