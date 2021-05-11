sap.ui.define([
	'./BaseController',
	'sap/m/ResponsivePopover',
	'sap/m/MessagePopover',
	'sap/m/ActionSheet',
	'sap/m/Button',
	'sap/m/Link',
	'sap/m/NotificationListItem',
	'sap/m/MessagePopoverItem',
	'sap/ui/core/CustomData',
	'sap/m/MessageToast',
	'sap/ui/Device',
	'sap/ui/core/syncStyleClass',
	'sap/m/library'
], function(
	BaseController,
	ResponsivePopover,
	MessagePopover,
	ActionSheet,
	Button,
	Link,
	NotificationListItem,
	MessagePopoverItem,
	CustomData,
	MessageToast,
	Device,
	syncStyleClass,
	mobileLibrary
) {
	"use strict";

	// shortcut for sap.m.PlacementType
	var PlacementType = mobileLibrary.PlacementType;

	// shortcut for sap.m.VerticalPlacementType
	var VerticalPlacementType = mobileLibrary.VerticalPlacementType;

	// shortcut for sap.m.ButtonType
	var ButtonType = mobileLibrary.ButtonType;

	return BaseController.extend("sap.ui.demo.toolpageapp.controller.App", {

		_bExpanded: true,

		onInit: function() {
			this.getView().addStyleClass(this.getOwnerComponent().getContentDensityClass());

			// if the app starts on desktop devices with small or meduim screen size, collaps the sid navigation
			if (Device.resize.width <= 1024) {
				this.onSideNavButtonPress();
			}

			Device.media.attachHandler(this._handleWindowResize, this);
			this.getRouter().attachRouteMatched(this.onRouteChange.bind(this));
		},

		onExit: function() {
			Device.media.detachHandler(this._handleWindowResize, this);
		},

		onRouteChange: function (oEvent) {
			this.getModel('side').setProperty('/selectedKey', oEvent.getParameter('name'));

			if (Device.system.phone) {
				this.onSideNavButtonPress();
			}
		},

		onUserNamePress: function(oEvent) {
			var oSource = oEvent.getSource();
			this.getModel("i18n").getResourceBundle().then(function(oBundle){
				// close message popover
				var oMessagePopover = this.byId("errorMessagePopover");
				if (oMessagePopover && oMessagePopover.isOpen()) {
					oMessagePopover.destroy();
				}
				var fnHandleUserMenuItemPress = function (oEvent) {
					this.getBundleText("clickHandlerMessage", [oEvent.getSource().getText()]).then(function(sClickHandlerMessage){
						MessageToast.show(sClickHandlerMessage);
					});
				}.bind(this);
				var oActionSheet = new ActionSheet(this.getView().createId("userMessageActionSheet"), {
					title: oBundle.getText("userHeaderTitle"),
					showCancelButton: false,
					buttons: [
						new Button({
							text: '{i18n>userAccountUserSettings}',
							type: ButtonType.Transparent,
							press: fnHandleUserMenuItemPress
						}),
						new Button({
							text: "{i18n>userAccountOnlineGuide}",
							type: ButtonType.Transparent,
							press: fnHandleUserMenuItemPress
						}),
						new Button({
							text: '{i18n>userAccountFeedback}',
							type: ButtonType.Transparent,
							press: fnHandleUserMenuItemPress
						}),
						new Button({
							text: '{i18n>userAccountHelp}',
							type: ButtonType.Transparent,
							press: fnHandleUserMenuItemPress
						}),
						new Button({
							text: '{i18n>userAccountLogout}',
							type: ButtonType.Transparent,
							press: fnHandleUserMenuItemPress
						})
					],
					afterClose: function () {
						oActionSheet.destroy();
					}
				});
				this.getView().addDependent(oActionSheet);
				// forward compact/cozy style into dialog
				syncStyleClass(this.getView().getController().getOwnerComponent().getContentDensityClass(), this.getView(), oActionSheet);
				oActionSheet.openBy(oSource);
			}.bind(this));
		},

		onSideNavButtonPress: function() {
			var oToolPage = this.byId("app");
			var bSideExpanded = oToolPage.getSideExpanded();
			this._setToggleButtonTooltip(bSideExpanded);
			oToolPage.setSideExpanded(!oToolPage.getSideExpanded());
		},

		_setToggleButtonTooltip : function(bSideExpanded) {
			var oToggleButton = this.byId('sideNavigationToggleButton');
			this.getBundleText(bSideExpanded ? "expandMenuButtonText" : "collpaseMenuButtonText").then(function(sTooltipText){
				oToggleButton.setTooltip(sTooltipText);
			});
		},

		// Errors Pressed
		onMessagePopoverPress: function (oEvent) {
			var oMessagePopoverButton = oEvent.getSource();
			if (!this.byId("errorMessagePopover")) {
				this.getModel("i18n").getResourceBundle().then(function(oBundle){
					var oMessagePopover = new MessagePopover(this.getView().createId("errorMessagePopover"), {
						placement: VerticalPlacementType.Bottom,
						items: {
							path: 'alerts>/alerts/errors',
							factory: this._createError.bind(this, oBundle)
						},
						afterClose: function () {
							oMessagePopover.destroy();
						}
					});
					this.byId("app").addDependent(oMessagePopover);
					// forward compact/cozy style into dialog
					syncStyleClass(this.getView().getController().getOwnerComponent().getContentDensityClass(), this.getView(), oMessagePopover);
					oMessagePopover.openBy(oMessagePopoverButton);
				}.bind(this));
			}
		},

		/**
		 * Event handler for the notification button
		 * @param {sap.ui.base.Event} oEvent the button press event
		 * @public
		 */
		onNotificationPress: function (oEvent) {
			var oSource = oEvent.getSource();
			this.getModel("i18n").getResourceBundle().then(function(oBundle){
				// close message popover
				var oMessagePopover = this.byId("errorMessagePopover");
				if (oMessagePopover && oMessagePopover.isOpen()) {
					oMessagePopover.destroy();
				}
				var oButton = new Button({
					text: oBundle.getText("notificationButtonText"),
					press: function (oEvent) {
						MessageToast.show(oBundle.getText("clickHandlerMessage", [oEvent.getSource().getText()]));
					}
				});
				var oNotificationPopover = new ResponsivePopover(this.getView().createId("notificationMessagePopover"), {
					title: oBundle.getText("notificationTitle"),
					contentWidth: "300px",
					endButton : oButton,
					placement: PlacementType.Bottom,
					content: {
						path: 'alerts>/alerts/notifications',
						factory: this._createNotification.bind(this)
					},
					afterClose: function () {
						oNotificationPopover.destroy();
					}
				});
				this.byId("app").addDependent(oNotificationPopover);
				// forward compact/cozy style into dialog
				syncStyleClass(this.getView().getController().getOwnerComponent().getContentDensityClass(), this.getView(), oNotificationPopover);
				oNotificationPopover.openBy(oSource);
			}.bind(this));
		},

		/**
		 * Factory function for the notification items
		 * @param {string} sId The id for the item
		 * @param {sap.ui.model.Context} oBindingContext The binding context for the item
		 * @returns {sap.m.NotificationListItem} The new notification list item
		 * @private
		 */
		_createNotification: function (sId, oBindingContext) {
			var oBindingObject = oBindingContext.getObject();
			var oNotificationItem = new NotificationListItem({
				title: oBindingObject.title,
				description: oBindingObject.description,
				priority: oBindingObject.priority,
				close: function (oEvent) {
					var sBindingPath = oEvent.getSource().getCustomData()[0].getValue();
					var sIndex = sBindingPath.split("/").pop();
					var aItems = oEvent.getSource().getModel("alerts").getProperty("/alerts/notifications");
					aItems.splice(sIndex, 1);
					oEvent.getSource().getModel("alerts").setProperty("/alerts/notifications", aItems);
					oEvent.getSource().getModel("alerts").updateBindings("/alerts/notifications");
					this.getBundleText("notificationMessageDeleted").then(function(sMessageText){
						MessageToast.show(sMessageText);
					});
				}.bind(this),
				datetime: oBindingObject.date,
				authorPicture: oBindingObject.icon,
				press: function () {
					this.getModel("i18n").getResourceBundle().then(function(oBundle){
						MessageToast.show(oBundle.getText("notificationItemClickedMessage", oBindingObject.title));
					});
				},
				customData : [
					new CustomData({
						key : "path",
						value : oBindingContext.getPath()
					})
				]
			});
			return oNotificationItem;
		},

		_createError: function (oBundle, sId, oBindingContext) {
			var oBindingObject = oBindingContext.getObject();
			var oLink = new Link("moreDetailsLink", {
				text: oBundle.getText("moreDetailsButtonText"),
				press: function(oEvent) {
					this.getBundleText("clickHandlerMessage", [oEvent.getSource().getText()]).then(function(sClickHandlerMessage){
						MessageToast.show(sClickHandlerMessage);
					});
				}.bind(this)
			});

			var oMessageItem = new MessagePopoverItem({
				title: oBindingObject.title,
				subtitle: oBindingObject.subTitle,
				description: oBindingObject.description,
				counter: oBindingObject.counter,
				link: oLink
			});
			return oMessageItem;
		},

		/**
		 * Returns a promises which resolves with the resource bundle value of the given key <code>sI18nKey</code>
		 *
		 * @public
		 * @param {string} sI18nKey The key
		 * @param {string[]} [aPlaceholderValues] The values which will repalce the placeholders in the i18n value
		 * @returns {Promise<string>} The promise
		 */
		getBundleText: function(sI18nKey, aPlaceholderValues){
			return this.getBundleTextByModel(sI18nKey, this.getModel("i18n"), aPlaceholderValues);
		},

		_handleWindowResize: function (oDevice) {
			if ((oDevice.name === "Tablet" && this._bExpanded) || oDevice.name === "Desktop") {
				this.onSideNavButtonPress();
				// set the _bExpanded to false on tablet devices
				// extending and collapsing of side navigation should be done when resizing from
				// desktop to tablet screen sizes)
				this._bExpanded = (oDevice.name === "Desktop");
			}
		}

	});
});