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
	          Utils,
	          Component
	) {
		"use strict";

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

			//check open popups before starting RTA
			this._applyPopupMethods(this._createPopupOverlays);

			//AddDialogInstance/AddPopoverInstance
			this._overrideAddPopupInstance();

			//RemoveDialogInstance/RemovePopoverInstance
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
			aOpenDialogs = aOpenPopovers = [];

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
			if (aOpenPopups.length > 0) {
				aOpenPopups.forEach(function(oPopup, iIndex) {
					if (
						!this._getSupportedPopup(oPopup)
						|| (
							this.oRtaRootAppComponent !== this._getAppComponentForControl(oPopup)
							&& !this._getComponentInsidePopup(oPopup)
						)
						) {
							aOpenPopups.splice(iIndex, 1);
						}
				}.bind(this));
			}
			return (aOpenPopups.length > 0) ? aOpenPopups : false;
		};

		/**
		 * Check if app component is inside a popup
		 *
		 * @param {sap.ui.core.Control} oPopup popup element
		 * @returns {boolean} indicating if component is inside a popup
		 * @private
		 */
		PopupManager.prototype._getComponentInsidePopup = function(oPopup) {
			//check if root RTA component is inside a popupElement
			return oPopup.getContent().some(
					function(oContent) {
						if (oContent.getMetadata().getName() === "sap.ui.core.ComponentContainer") {
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
		PopupManager.prototype._getSupportedPopup = function(oPopup) {
			return (oPopup instanceof sap.m.Dialog || oPopup instanceof sap.m.Popover);
		};

		/**
		 * Overrides the setter function of property rta for dynamic overlay creation.
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
			}
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
			var that = this;
			return function(oPopupElement) {
				var vOriginalReturn = fnOriginalFunction.apply(this, arguments);
				if (
					that.getRta()._oDesignTime
					&&  that.oRtaRootAppComponent === that._getAppComponentForControl(oPopupElement)
					&&  that._getSupportedPopup(oPopupElement)
				) {
					oPopupElement.attachAfterOpen(that._createPopupOverlays, that);
					//PopupManager internal method
					that.fireOpen(oPopupElement);
				}
				return vOriginalReturn;
			};
		};

		/**
		 * Applies the passed function to the relevant open popups
		 *
		 * @param {function} fnPopupMethod specifies function to be applied
		 * @private
		 */
		PopupManager.prototype._applyPopupMethods = function(fnPopupMethod) {
			//check if popups are open when closing RTA
			var oRelevantPopups = this.getRelevantPopups();

			Object.keys(oRelevantPopups).forEach(function(key) {
				if (oRelevantPopups[key]) {
					oRelevantPopups[key].forEach(function(oPopupElement) {
						fnPopupMethod.call(this, oPopupElement);
					}.bind(this));
				}
			}.bind(this));
		};

		/**
		 * Modifies browser events for passed popup element
		 *
		 * @param {sap.ui.core.Control} oPopupElement popup element for which browser events have to be modified
		 * @public
		 */
		PopupManager.prototype.modifyBrowserEvents = function(oPopupElement) {
				var oPopup = oPopupElement.oPopup;

				this.fnPopupOriginalAfterRendering = oPopup.onAfterRendering;
				var that = this;

				//cases when onAfterRendering is called after this function - app inside popup
				oPopup.onAfterRendering = function () {
					var vOriginalReturn = that.fnPopupOriginalAfterRendering.apply(this, arguments);
					that._removeDefaultBlurEvents.call(this);
					return vOriginalReturn;
				};

				this._removeDefaultBlurEvents.call(oPopup);

				//original autoClose
				oPopup._bOriginalAutoClose = oPopup.getAutoClose();
				this.fnBlurHandling = this._blurHandling.bind(oPopupElement, this.getRta());
				//Handling for Popover Blur Event
				if (oPopupElement instanceof sap.m.Popover) {
					oPopup.oContent.getDomRef().addEventListener("blur", this.fnBlurHandling, true);
				}
		};

		/**
		 * Removes default blur event from the popup element called on
		 *
		 * @private
		 */
		PopupManager.prototype._removeDefaultBlurEvents = function() {
			this.oContent.getDomRef().removeEventListener("blur", this.fEventHandler, true);
			this.oLastBlurredElement = new sap.ui.core.Control();
		};

		/**
		 * Custom blur browser event
		 *
		 * @param {sap.ui.rta.RuntimeAuthoring} oRta RuntimeAuthoring object
		 * @param {object} oEvent browser event
		 * @private
		 */
		PopupManager.prototype._blurHandling = function(oRta, oEvent) {
			//FIXME: Find a better way to override popover blur event
			this.oPopup.setAutoClose(false);
			//Adaptation Mode
			if (oRta.getMode() === 'adaptation') {
				return;
			}
			jQuery.sap.delayedCall(0, this, function() {
				//Clicked from Toolbar
				if (document.activeElement && jQuery.sap.containsOrEquals(oRta._oToolsMenu.getDomRef(), document.activeElement)) {
					jQuery.sap.focus(this.oPopup.oContent);
					return;
				}
				//Clicked from inside popover
				if (jQuery.sap.containsOrEquals(this.oPopup.oContent.getDomRef(), document.activeElement)) {
					return;
				}
				this.oPopup.close(0, "autocloseBlur");
			});
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
			var that = this;
			return function(oPopupElement) {
				var vOriginalReturn = fnOriginalFunction.apply(this, arguments);

				if (
					that.getRta()._oDesignTime
					&& that.oRtaRootAppComponent === that._getAppComponentForControl(oPopupElement)
					&& that._getSupportedPopup(oPopupElement)
				) {
					that.getRta()._oDesignTime.removeRootElement(oPopupElement);
					//PopupManager internal method
					that.fireClose(oPopupElement);
				}
				return vOriginalReturn;
			};
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
				oAppComponent = Utils.getAppComponentForControl(oComponent);
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
			var oComponent, i = 0;
			do {
				i++;
				oComponent = Component.getOwnerComponentFor(oControl);
				if (oComponent) {
					return oComponent;
				}
				if (
					oControl
					&& typeof oControl.getParent === "function"
				) {
					oControl = oControl.getParent();
				} else {
					return;
				}
			} while (
			oControl
			&& i < 100
			&& !(oControl instanceof sap.ui.core.UIArea));

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
				&& !this._getComponentInsidePopup(oPopupElement)
			) {
				this.getRta()._oDesignTime.addRootElement(oPopupElement);
			}

			//detach for persistent popups
			oPopupElement.detachAfterOpen(this._createPopupOverlays, this);

			this.modifyBrowserEvents(oPopupElement);
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

			this._applyPopupMethods(this._disablePopupSettings);
		};

		/**
		 * Restore default popup settings and give focus
		 * @param {sap.ui.core.Control} oControl popup element to remove custom and add default browser events
		 *
		 * @private
		 */
		PopupManager.prototype._disablePopupSettings = function(oPopupElement) {
			var oPopup = oPopupElement.oPopup;
			var vPopupElement = oPopup.oContent.getDomRef();
			if (this.fnPopupOriginalAfterRendering) {
				oPopup.onAfterRendering = this.fnPopupOriginalAfterRendering;
			}
			vPopupElement.removeEventListener("blur", this.fnBlurHandling, true);

			//autoClose set to default
			if (typeof oPopup._bOriginalAutoClose === "boolean") {
				oPopup.setAutoClose(oPopup._bOriginalAutoClose);
				delete oPopup._bOriginalAutoClose;
			}

			//default blur event handler
			vPopupElement.addEventListener("blur", oPopup.fEventHandler, true);
			oPopup.oLastBlurredElement = undefined;

			// /set focus back to popup
			jQuery.sap.focus(oPopup.oContent);
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
