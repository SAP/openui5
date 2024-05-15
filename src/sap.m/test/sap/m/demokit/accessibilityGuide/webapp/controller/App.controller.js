sap.ui.define([
	"sap/m/library",
	"sap/ui/demo/accessibilityGuide/controller/BaseController",
	"sap/ui/Device",
	"sap/base/Log",
	"sap/ui/core/routing/History",
	"../model/ExploreNavigationModel",
	"../model/OverviewNavigationModel",
	"../model/ExploreSettingsModel",
	"../model/HomeModel"
], function (
	mLibrary,
	BaseController,
	Device,
	Log,
	History,
	ExploreNavigationModel,
	OverviewNavigationModel,
	ExploreSettingsModel,
	HomeModel
) {
	"use strict";

	return BaseController.extend("sap.ui.demo.accessibilityGuide.controller.App", {

		/**
		 * Called when the app is started.
		 */
		onInit: function () {
			this._setToggleButtonTooltip(!Device.system.desktop);

			// apply content density mode to root view
			this.getView().addStyleClass(this.getOwnerComponent().getContentDensityClass());

			this.getRouter().attachRouteMatched(this.onRouteChange.bind(this));
			this.getRouter().attachBypassed(function () {
				this.navToRoute("overview/introduction");
			}, this);

			this.getView().setModel(ExploreSettingsModel, "settings");
			this.getView().setModel(HomeModel, "home");

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
				case "overview":
					sRouteHash = this._findPreviousRouteHash("overview") || "overview/introduction";
					break;
				case "exploreSamples":
					sRouteHash = this._findPreviousRouteHash(["explore", "exploreOverview"]) || "explore/dynamicPage";
					break;
				case "applicationDeveloper":
					sRouteHash = this._findPreviousRouteHash("applicationDeveloper") || "applicationDeveloper/topics";
					break;
				case "controlDeveloper":
					sRouteHash = this._findPreviousRouteHash("controlDeveloper") || "controlDeveloper/accAspects";
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
		 * @param {string} sRouteHash For example 'explore/landmark/semantic'.
		 */
		navToRoute: function (sRouteHash) {
			var aParts = sRouteHash.split("/");

			switch (aParts[0]) {
				case "overview":
					this.getRouter().navTo("overview", {
						topic: aParts[1],
						subTopic: aParts[2]
					});
					break;
				case "applicationDeveloper":
					this.getRouter().navTo("applicationDeveloper", {
						topic: aParts[1],
						subTopic: aParts[2]
					});
					break;
				case "controlDeveloper":
					this.getRouter().navTo("controlDeveloper", {
						topic: aParts[1],
						subTopic: aParts[2]
					});
					break;
				case "explore":
					this.getRouter().navTo("exploreSamples", {
						sample: aParts[1],
						subSample: aParts[2]
					});
					break;
				case "exploreOverview":
					this.getRouter().navTo("exploreOverview", {
						topic: aParts[1]
					});
					break;
				default:
					this.getRouter().navTo(aParts[0]);
			}
		},
		onSideNavigationItemSelect: function (oEvent) {
			var oItem = oEvent.getParameter("item"),
				oItemConfig = this.getView().getModel().getProperty(oItem.getBindingContext().getPath()),
				sRootKey,
				sChildKey;

			if (oItem.data("type") === "root") {
				sRootKey = oItemConfig.key;
			} else { // child
				sRootKey = oItem.getParent().getKey();
				sChildKey = oItemConfig.key;
			}

			if (oItemConfig.target === "exploreSamples") {
				this.getRouter().navTo(
					oItemConfig.target,
					{
						sample: sChildKey,
						subSample: undefined
					}
				);
			} else {
				this.getRouter().navTo(
					oItemConfig.target,
					{
						topic: sRootKey,
						subTopic: sChildKey
					}
				);
			}
		},

		onSideNavButtonPress: function () {
			var toolPage = this.byId('toolPage');
			var sideExpanded = toolPage.getSideExpanded();

			this._setToggleButtonTooltip(sideExpanded);

			toolPage.setSideExpanded(!toolPage.getSideExpanded());
		},

		onRouteChange: function (oEvent) {
			var oConfig = oEvent.getParameter("config"),
				oArgs = oEvent.getParameter("arguments"),
				sRouteName = oConfig.name,
				oSideNavigation = this.getView().byId("sideNavigation"),
				sKey = "overview";

			this.switchCurrentModelAndTab(sRouteName);

			if (oArgs.sample) {
				sKey = oArgs.sample;
			} else if (oArgs.topic) {
				sKey = oArgs.subTopic || oArgs.topic;
			} else if (sRouteName === "default") {
				sKey = "introduction";
			}

			oSideNavigation.setSelectedKey(sKey);
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

		_setToggleButtonTooltip: function (bLarge) {
			var toggleButton = this.byId('sideNavigationToggleButton');
			if (bLarge) {
				toggleButton.setTooltip('Large Size Navigation');
			} else {
				toggleButton.setTooltip('Small Size Navigation');
			}
		},

		navToHome: function () {
			mLibrary.URLHelper.redirect("../index.html");
		},

		switchCurrentModelAndTab: function (sRouteName) {
			var oIconTabHeader = this.getView().byId("iconTabHeader");
			var oModel;

			if (sRouteName.startsWith("explore")) {
				oModel = ExploreNavigationModel;
				oIconTabHeader.setSelectedKey("exploreSamples");
			} else { // default
				oModel = OverviewNavigationModel;
				oIconTabHeader.setSelectedKey("overview");
			}

			this.setModel(oModel);
		}
	});
});
