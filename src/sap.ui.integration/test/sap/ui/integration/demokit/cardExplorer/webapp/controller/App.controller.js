sap.ui.define([
		"sap/ui/demo/cardExplorer/controller/BaseController",
		"sap/ui/model/json/JSONModel",
		"sap/ui/Device",
		"sap/ui/core/routing/History",
		"../model/DocumentationNavigationModel",
		"../model/ExploreNavigationModel",
		"../model/IntegrateNavigationModel"
	], function (BaseController,
				 JSONModel,
				 Device,
				 History,
				 documentationNavigationModel,
				 exploreNavigationModel,
				 integrateNavigationModel) {
		"use strict";

		return BaseController.extend("sap.ui.demo.cardExplorer.controller.App", {

			/**
			 * Called when the app is started.
			 */
			onInit : function () {
				this._setToggleButtonTooltip(!sap.ui.Device.system.desktop);

				// apply content density mode to root view
				this.getView().addStyleClass(this.getOwnerComponent().getContentDensityClass());

				this.getRouter().attachRouteMatched(this.onRouteChange.bind(this));

				Device.media.attachHandler(this.onDeviceSizeChange, this);
				this.onDeviceSizeChange();
			},

			onExit: function () {
				Device.media.detachHandler(this.onDeviceSizeChange, this);
			},

			/**
			 * @param {Array|string} vKey The key or keys to check in the history.
			 * @returns {string} The first subkey found in the history.
			 */
			_findPreviousSubkey: function (vKey) {
				var aKeys = [];
				var oHistory = History.getInstance();

				if (typeof vKey === "string") {
					aKeys[0] = vKey;
				} else {
					aKeys = vKey;
				}

				if (!oHistory.aHistory) {
					return "";
				}

				for (var i = oHistory.aHistory.length - 1; i >= 0; i--) {
					var sHistory = oHistory.aHistory[i];

					for (var k = 0; k < aKeys.length; k++) {
						var sKey = aKeys[k];

						if (sHistory.startsWith(sKey + "/")) {
							return sHistory.substring((sKey + "/").length, sHistory.length);
						}
					}
				}

				return "";
			},

			onTabSelect: function (oEvent) {
				var item = oEvent.getParameter('item'),
					key = item.getKey();

				// TODO implement in generic way
				switch (key) {
					case "exploreSamples":
						// there is no home page for exploreSamples, so navigate to first example
						this.getRouter().navTo("exploreSamples", {
							key: this._findPreviousSubkey(["explore", "exploreOverview"]) || "list"
						});
						return;
					case "learnDetail":
						this.getRouter().navTo("learnDetail", {
							key: this._findPreviousSubkey("learn") || "overview"
						});
						return;
					case "integrate":
						this.getRouter().navTo("integrate", {
							key: this._findPreviousSubkey("integrate") || "overview"
						});
						return;
					default:
						this.getRouter().navTo(key);
				}
			},

			onSideNavigationItemSelect: function (oEvent) {
				var item = oEvent.getParameter('item'),
					itemConfig = this.getView().getModel().getProperty(item.getBindingContext().getPath());

				if (itemConfig.target) {
					this.getRouter().navTo(
						itemConfig.target,
						{
							key: itemConfig.key
						}
					);
				} else {
					this.getRouter().navTo(itemConfig.key);
				}
			},

			onSideNavButtonPress : function() {
				var toolPage = this.byId('toolPage');
				var sideExpanded = toolPage.getSideExpanded();

				this._setToggleButtonTooltip(sideExpanded);

				toolPage.setSideExpanded(!toolPage.getSideExpanded());
			},

			onRouteChange: function (oEvent) {
				var routeConfig = oEvent.getParameter('config');
				var routeArgs = oEvent.getParameter("arguments");
				var routeName = routeConfig.name;
				var sideNavigation = this.getView().byId('sideNavigation');

				this.switchCurrentModelAndTab(routeName);

				if (routeArgs["key"]) {
					sideNavigation.setSelectedKey(routeArgs["key"]);
				} else if (routeConfig.name !== "default") {
					sideNavigation.setSelectedKey(routeConfig.name);
				} else {
					sideNavigation.setSelectedKey('overview');
				}
			},

			onDeviceSizeChange: function () {
				var toolPage = this.byId('toolPage'),
					sRangeName = Device.media.getCurrentRange("StdExt").name;

				switch (sRangeName) {
					case "Phone":
					case "Tablet":
						toolPage.setSideExpanded(false);
						break;
					case "Desktop":
						toolPage.setSideExpanded(true);
						break;
				}
			},

			_setToggleButtonTooltip : function(bLarge) {
				var toggleButton = this.byId('sideNavigationToggleButton');
				if (bLarge) {
					toggleButton.setTooltip('Large Size Navigation');
				} else {
					toggleButton.setTooltip('Small Size Navigation');
				}
			},

			navToHome: function () {
				window.open('../index.html', '_self');
			},

			switchCurrentModelAndTab: function (sRouteName) {
				var oIconTabHeader = this.getView().byId("iconTabHeader");
				var oModel;

				if (sRouteName.startsWith("explore")) {
					oModel = exploreNavigationModel;
					oIconTabHeader.setSelectedKey("exploreSamples");
				} else if (sRouteName.startsWith("integrate")) {
					oModel = integrateNavigationModel;
					oIconTabHeader.setSelectedKey("integrate");
				} else { // default is the Learn page
					oModel = documentationNavigationModel;
					oIconTabHeader.setSelectedKey("learnDetail");
				}

				this.setModel(oModel);
			}
		});
	}
);