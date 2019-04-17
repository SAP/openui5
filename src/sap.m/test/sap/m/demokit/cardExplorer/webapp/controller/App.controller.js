sap.ui.define([
		"sap/ui/demo/cardExplorer/controller/BaseController",
		"sap/ui/model/json/JSONModel",
		"../model/DocumentationNavigationModel",
		"../model/ExploreNavigationModel"
	], function (BaseController,
				 JSONModel,
				 documentationNavigationModel,
				 exploreNavigationModel) {
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
			},

			onTabSelect: function (oEvent) {
				var item = oEvent.getParameter('item');
				this.getRouter().navTo(item.getKey());
			},

			onSideNavigationItemSelect: function (oEvent) {
				var item = oEvent.getParameter('item');
				this.getRouter().navTo(item.getKey());
			},

			onSideNavButtonPress : function() {
				var toolPage = this.byId('toolPage');
				var sideExpanded = toolPage.getSideExpanded();

				this._setToggleButtonTooltip(sideExpanded);

				toolPage.setSideExpanded(!toolPage.getSideExpanded());
			},

			onRouteChange: function (oEvent) {
				var routeConfig = oEvent.getParameter('config');
				var routeName = routeConfig.name;
				var sideNavigation = this.getView().byId('sideNavigation');
				var iconTabHeader = this.getView().byId('iconTabHeader');
				var model = documentationNavigationModel;

				if (routeName.indexOf('explore') === 0) {
					model = exploreNavigationModel;
					iconTabHeader.setSelectedKey("exploreCardTypes");
				}

				this.getView().setModel(model);

				sideNavigation.setSelectedKey(routeConfig.name);
			},

			_setToggleButtonTooltip : function(bLarge) {
				var toggleButton = this.byId('sideNavigationToggleButton');
				if (bLarge) {
					toggleButton.setTooltip('Large Size Navigation');
				} else {
					toggleButton.setTooltip('Small Size Navigation');
				}
			}
		});
	}
);