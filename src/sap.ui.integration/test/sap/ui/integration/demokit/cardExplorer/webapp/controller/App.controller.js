sap.ui.define([
		"sap/ui/demo/cardExplorer/controller/BaseController",
		"sap/ui/Device",
		"sap/base/Log",
		"sap/ui/core/routing/History",
		"../model/DocumentationNavigationModel",
		"../model/ExploreNavigationModel",
		"../model/IntegrateNavigationModel"
	], function (BaseController,
				 Device,
				 Log,
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
			 * @returns {string} The first url hash found in the history.
			 */
			_findPreviousRouteHash: function (vKey) {
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
							return sHistory;
						}
					}
				}

				return "";
			},

			onTabSelect: function (oEvent) {
				var oItem = oEvent.getParameter('item'),
					sTabKey = oItem.getKey(),
					sRouteHash;

				switch (sTabKey) {
					case "exploreSamples":
						sRouteHash = this._findPreviousRouteHash(["explore", "exploreOverview"]) || "explore/list";
						break;
					case "learnDetail":
						sRouteHash = this._findPreviousRouteHash("learn") || "learn/overview";
						break;
					case "integrate":
						sRouteHash = this._findPreviousRouteHash("integrate") || "integrate/overview";
						break;
					default:
						sRouteHash = null;
						Log.error("Tab was not recognized.");
						return;
				}

				this.navToRoute(sRouteHash);
			},

			/**
			 * Finds the target by the route's hash and navigates to it.
			 * @param {string} sRouteHash For example 'explore/list/numeric'.
			 */
			navToRoute: function (sRouteHash) {
				var aParts = sRouteHash.split("/");

				switch (aParts[0]) {
					case "explore":
						this.getRouter().navTo("exploreSamples", {
							key: aParts[1],
							subSampleKey: aParts[2]
						});
						break;
					case "exploreOverview":
						this.getRouter().navTo("exploreOverview", {
							key: aParts[1]
						});
						break;
					case "learn":
						this.getRouter().navTo("learnDetail", {
							group: aParts[1] || "overview",
							key:  aParts[2]
						});
						break;
					case "integrate":
						this.getRouter().navTo("integrate", {
							key: aParts[1]
						});
						break;
					default:
						this.getRouter().navTo(aParts[0]);
				}
			},
			onSideNavigationItemSelect: function (oEvent) {
				var oItem = oEvent.getParameter("item"),
					oItemConfig = this.getView().getModel().getProperty(oItem.getBindingContext().getPath()),
					sGroupKey,
					sTopicKey;
				if (oItem.getCustomData()[0].getKey() === "groupItem") {
					sGroupKey = oItemConfig.key;
					if (oItemConfig.target === "exploreOverview" || oItemConfig.target === "integrate"){
							sTopicKey = oItemConfig.key;
					}
				} else {
					sGroupKey = oItem.getParent().getKey();
					sTopicKey = oItemConfig.key;
				}
				if (oItemConfig.target) {
					this.getRouter().navTo(
						oItemConfig.target,
						{
							group: sGroupKey,
							key: sTopicKey
						}
					);
				} else {
					this.getRouter().navTo(oItemConfig.key);
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
				if (routeArgs["key"] || routeArgs["group"]) {
					sideNavigation.setSelectedKey(routeArgs["key"] || routeArgs["group"]);
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