sap.ui.define([
		'sap/ui/demo/toolpageapp/controller/BaseController',
		'jquery.sap.global',
		'sap/ui/core/Fragment',
		'sap/ui/core/mvc/Controller',
		'sap/ui/model/json/JSONModel',
		'sap/m/ResponsivePopover',
		'sap/m/MessagePopover',
		'sap/m/ActionSheet',
		'sap/m/Button',
		'sap/m/Link',
		'sap/m/Bar',
		'sap/ui/layout/VerticalLayout',
		'sap/m/NotificationListItem',
		'sap/m/MessagePopoverItem',
		'sap/ui/core/CustomData',
		'sap/m/MessageToast',
		'sap/ui/Device'
	], function (BaseController,
		jQuery,
		Fragment,
		Controller,
		JSONModel,
		ResponsivePopover,
		MessagePopover,
		ActionSheet,
		Button,
		Link,
		Bar,
		VerticalLayout,
		NotificationListItem,
		MessagePopoverItem,
		CustomData,
		MessageToast,
		Device) {

		"use strict";

		return BaseController.extend("sap.ui.demo.toolpageapp.controller.App", {

			_bExpanded: true,

			onInit: function() {
				this.getView().addStyleClass(this.getOwnerComponent().getContentDensityClass());

				// if the app starts on desktop devices with small or meduim screen size, collaps the sid navigation
				if (Device.resize.width <= 1024) {
					this.onSideNavButtonPress();
				}
				Device.media.attachHandler(function (oDevice) {
					if ((oDevice.name === "Tablet" && this._bExpanded) || oDevice.name === "Desktop") {
						this.onSideNavButtonPress();
						// set the _bExpanded to false on tablet devices
						// extending and collapsing of side navigation should be done when resizing from
						// desktop to tablet screen sizes)
						this._bExpanded = (oDevice.name === "Desktop");
					}
				}.bind(this));
			},

			/**
			 * Convenience method for accessing the router.
			 * @public
			 * @param {sap.ui.base.Event} oEvent The item select event
			 */
			onItemSelect: function(oEvent) {
				var oItem = oEvent.getParameter('item');
				var sKey = oItem.getKey();
				// if you click on home, settings or statistics button, call the navTo function
				if ((sKey === "home" || sKey === "masterSettings" || sKey === "statistics")) {
					// if the device is phone, collaps the navigation side of the app to give more space
					if (Device.system.phone) {
						this.onSideNavButtonPress();
					}
					this.getRouter().navTo(sKey);
				} else {
					MessageToast.show(sKey);
				}
			},

			onUserNamePress: function(oEvent) {
				var oBundle = this.getModel("i18n").getResourceBundle();
				// close message popover
				var oMessagePopover = this.byId("errorMessagePopover");
				if (oMessagePopover && oMessagePopover.isOpen()) {
					oMessagePopover.destroy();
				}
				var fnHandleUserMenuItemPress = function (oEvent) {
					MessageToast.show(oEvent.getSource().getText() + " was pressed");
				};
				var oActionSheet = new ActionSheet(this.getView().createId("userMessageActionSheet"), {
					title: oBundle.getText("userHeaderTitle"),
					showCancelButton: false,
					buttons: [
						new Button({
							text: 'User Settings',
							type: sap.m.ButtonType.Transparent,
							press: fnHandleUserMenuItemPress
						}),
						new Button({
							text: "Online Guide",
							type: sap.m.ButtonType.Transparent,
							press: fnHandleUserMenuItemPress
						}),
						new Button({
							text: 'Feedback',
							type: sap.m.ButtonType.Transparent,
							press: fnHandleUserMenuItemPress
						}),
						new Button({
							text: 'Help',
							type: sap.m.ButtonType.Transparent,
							press: fnHandleUserMenuItemPress
						}),
						new Button({
							text: 'Logout',
							type: sap.m.ButtonType.Transparent,
							press: fnHandleUserMenuItemPress
						})
					],
					afterClose: function () {
						oActionSheet.destroy();
					}
				});
				// forward compact/cozy style into dialog
				jQuery.sap.syncStyleClass(this.getView().getController().getOwnerComponent().getContentDensityClass(), this.getView(), oActionSheet);
				oActionSheet.openBy(oEvent.getSource());
			},

			onSideNavButtonPress: function() {
				var oToolPage = this.byId("app");
				var bSideExpanded = oToolPage.getSideExpanded();
				this._setToggleButtonTooltip(bSideExpanded);
				oToolPage.setSideExpanded(!oToolPage.getSideExpanded());
			},

			_setToggleButtonTooltip : function(bSideExpanded) {
				var oToggleButton = this.byId('sideNavigationToggleButton');
				if (bSideExpanded) {
					oToggleButton.setTooltip('Large Size Navigation');
				} else {
					oToggleButton.setTooltip('Small Size Navigation');
				}
			},

			// Errors Pressed
			onMessagePopoverPress: function (oEvent) {
				if (!this.byId("errorMessagePopover")) {
					var oMessagePopover = new MessagePopover(this.getView().createId("errorMessagePopover"), {
						placement: sap.m.VerticalPlacementType.Bottom,
						items: {
							path: 'alerts>/alerts/errors',
							factory: this._createError
						},
						afterClose: function () {
							oMessagePopover.destroy();
						}
					});
					this.byId("app").addDependent(oMessagePopover);
					// forward compact/cozy style into dialog
					jQuery.sap.syncStyleClass(this.getView().getController().getOwnerComponent().getContentDensityClass(), this.getView(), oMessagePopover);
					oMessagePopover.openBy(oEvent.getSource());
				}
			},

			/**
			 * Event handler for the notification button
			 * @param {sap.ui.base.Event} oEvent the button press event
			 * @public
			 */
			onNotificationPress: function (oEvent) {
				var oBundle = this.getModel("i18n").getResourceBundle();
				// close message popover
				var oMessagePopover = this.byId("errorMessagePopover");
				if (oMessagePopover && oMessagePopover.isOpen()) {
					oMessagePopover.destroy();
				}
				var oButton = new Button({
					text: oBundle.getText("notificationButtonText"),
					press: function () {
						MessageToast.show("Show all Notifications was pressed");
					}
				});
				var oNotificationPopover = new ResponsivePopover(this.getView().createId("notificationMessagePopover"), {
					title: oBundle.getText("notificationTitle"),
					contentWidth: "300px",
					endButton : oButton,
					placement: sap.m.PlacementType.Bottom,
					content: {
						path: 'alerts>/alerts/notifications',
						factory: this._createNotification
					},
					afterClose: function () {
						oNotificationPopover.destroy();
					}
				});
				this.byId("app").addDependent(oNotificationPopover);
				// forward compact/cozy style into dialog
				jQuery.sap.syncStyleClass(this.getView().getController().getOwnerComponent().getContentDensityClass(), this.getView(), oNotificationPopover);
				oNotificationPopover.openBy(oEvent.getSource());
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
						sap.m.MessageToast.show("Notification has been deleted.");
					},
					datetime: oBindingObject.date,
					authorPicture: oBindingObject.icon,
					press: function () {
						var oBundle = this.getModel("i18n").getResourceBundle();
						MessageToast.show(oBundle.getText("notificationItemClickedMessage", oBindingObject.title));
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

			_createError: function (sId, oBindingContext) {
				var oBindingObject = oBindingContext.getObject();
				var oLink = new Link("moreDetailsLink", {
					text: "More Details",
					press: function() {
						MessageToast.show("More Details was pressed");
					}
				});
				var oMessageItem = new MessagePopoverItem({
					title: oBindingObject.title,
					subtitle: oBindingObject.subTitle,
					description: oBindingObject.description,
					counter: oBindingObject.counter,
					link: oLink
				});
				return oMessageItem;
			}

		});
	});

