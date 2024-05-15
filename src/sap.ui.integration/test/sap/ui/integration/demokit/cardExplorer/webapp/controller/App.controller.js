sap.ui.define([
	"sap/m/library",
	"sap/ui/demo/cardExplorer/controller/BaseController",
	"sap/ui/Device",
	"sap/base/Log",
	"sap/ui/core/routing/History",
	"sap/ui/core/Fragment",
	"../model/DocumentationNavigationModel",
	"../model/ExploreNavigationModel",
	"../model/IntegrateNavigationModel",
	"../model/OverviewNavigationModel",
	"../model/DesigntimeNavigationModel",
	"../model/ExploreSettingsModel",
	"../model/HomeModel",
	"../model/AppSettingsModel",
	"../model/URLFormatter"
], function (
	mLibrary,
	BaseController,
	Device,
	Log,
	History,
	Fragment,
	DocumentationNavigationModel,
	ExploreNavigationModel,
	IntegrateNavigationModel,
	OverviewNavigationModel,
	DesigntimeNavigationModel,
	ExploreSettingsModel,
	HomeModel,
	AppSettingsModel,
	URLFormatter
) {
	"use strict";

	return BaseController.extend("sap.ui.demo.cardExplorer.controller.App", {
		_appSettingsDialog: null,
		URLFormatter: URLFormatter,

		/**
		 * Called when the app is started.
		 */
		onInit: function () {
			var oComponent = this.getOwnerComponent();
			oComponent.getEventBus().subscribe("navEntryChanged", this.onNavEntryRouteChange, this);
			this._setToggleButtonTooltip(!Device.system.desktop);

			this.getRouter().attachBypassed(function () {
				this.navToRoute("overview/introduction");
			}, this);

			this.getView().setModel(ExploreSettingsModel, "settings");
			this.getView().setModel(HomeModel, "home");
			this.getView().setModel(AppSettingsModel, "appSettings");

			Device.media.attachHandler(this.onDeviceSizeChange, this);
			this.onDeviceSizeChange();

			oComponent.getCookiesManagement().then(function(oCookieMgmtComponent) {
				oCookieMgmtComponent.enable(oComponent.getRootControl());
			});
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
					sRouteHash = this._findPreviousRouteHash(["explore", "exploreOverview"]) || "explore/list";
					break;
				case "learnDetail":
					sRouteHash = this._findPreviousRouteHash("learn") || "learn/gettingStarted";
					break;
				case "integrate":
					sRouteHash = this._findPreviousRouteHash("integrate") || "integrate/overview";
					break;
				case "designtime":
					sRouteHash = this._findPreviousRouteHash("designtime") || "designtime/overview";
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
				case "overview":
					this.getRouter().navTo("overview", {
						topic: aParts[1],
						subTopic: aParts[2]
					});
					break;
				case "learn":
					this.getRouter().navTo("learnDetail", {
						topic: aParts[1] || "gettingStarted",
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
				case "integrate":
					this.getRouter().navTo("integrate", {
						topic: aParts[1]
					});
					break;
				case "designtime":
					this.getRouter().navTo("designtime", {
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

			// special handling for "footer" section in Explore
			if (oItemConfig.key === "footer" && oItemConfig.target === "exploreSamples") {
				sChildKey = oItemConfig.key;
			} else if (oItem.data("type") === "root") {
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

		onNavEntryRouteChange: function (sChanelId, sEventId, oPayload) {
			this.switchCurrentModelAndTab(oPayload.routeName);
			this.getView().byId("sideNavigation").setSelectedKey(oPayload.navigationItemKey);
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

			if (sRouteName.startsWith("learn")) {
				oModel = DocumentationNavigationModel;
				oIconTabHeader.setSelectedKey("learnDetail");
			} else if (sRouteName.startsWith("explore")) {
				oModel = ExploreNavigationModel;
				oIconTabHeader.setSelectedKey("exploreSamples");
			} else if (sRouteName.startsWith("integrate")) {
				oModel = IntegrateNavigationModel;
				oIconTabHeader.setSelectedKey("integrate");
			} else if (sRouteName.startsWith("designtime")) {
				oModel = DesigntimeNavigationModel;
				oIconTabHeader.setSelectedKey("designtime");
			} else { // default
				oModel = OverviewNavigationModel;
				oIconTabHeader.setSelectedKey("overview");
			}

			this.setModel(oModel);
		},

		handleAppSettings: function (sAction) {
			switch (sAction) {
				case 'open': {
					if (!this._appSettingsDialog) {
						Fragment.load({
							name: "sap.ui.demo.cardExplorer.view.AppSettingsDialog",
							controller: this
						}).then(function (oDialog) {
							// connect dialog to the root view of this component (models, lifecycle)
							this.getView().addDependent(oDialog);
							this._appSettingsDialog = oDialog;
							this._appSettingsDialog.open();
						}.bind(this));
					} else {
						this._appSettingsDialog.open();
					}
					break;
				}
				case 'reset': {
					AppSettingsModel.resetValues();
					break;
				}
				case 'close': {
					this._appSettingsDialog.close();
					break;
				}
				case 'apply': {
					AppSettingsModel.saveValues();
					AppSettingsModel.applyValues();
					this._appSettingsDialog.close();
					break;
				}
				default: break;
			}
		}
	});
});