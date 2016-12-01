sap.ui.define([
	"sap/ui/core/UIComponent",
	"sap/ui/model/json/JSONModel"
], function (UIComponent, JSONModel) {
	"use strict";

	var Component = UIComponent.extend("flexiblecolumnlayout.Component", {
		metadata: {
			manifest: "json"
		},

		init: function () {
			UIComponent.prototype.init.apply(this, arguments);

			var oData = {
				fullScreenColumn: "None",
				detail: {
					fullScreenButton: {
						icon: "sap-icon://full-screen",
						visible: false
					},
					closeButton: {
						visible: false
					}
				},
				detailDetail: {
					fullScreenButton: {
						icon: "sap-icon://full-screen",
						visible: false
					},
					closeButton: {
						visible: false
					}
				}
			};

			var oModel = new JSONModel(oData);
			this.setModel(oModel);

			this.getRouter().initialize();
		},

		createContent: function () {
			// create root view
			return sap.ui.view({
				viewName: "flexiblecolumnlayout.FlexibleColumnLayout",
				type: "XML"
			});
		},

		isFullScreen: function () {
			return this.getModel().getProperty("/fullScreenColumn") !== "None";
		}
	});
	return Component;
}, true);
