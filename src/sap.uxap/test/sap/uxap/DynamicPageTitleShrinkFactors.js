// Note: the HTML page 'DynamicPageTitleShrinkFactors.html' loads this module via data-sap-ui-on-init

sap.ui.define([
	"sap/m/App",
	"sap/m/Page",
	"sap/ui/core/mvc/Controller",
	"sap/ui/core/mvc/XMLView",
	"sap/ui/thirdparty/jquery"
], async function(App, Page, Controller, MvcXMLView, jQuery, XMLView) {
	"use strict";
	const MyController = Controller.extend("MyController", {
		onInit: function() {
			this.view = this.getView();
			this.titleSlider = this.view.byId('titleSlider');
			this.contentSlider = this.view.byId('contentSlider');
			this.actionsSlider = this.view.byId('actionsSlider');
		},

		// implement an event handler in the Controller
		changeShrinkRatio: function(oEvent) {
			var oView = this.getView(),
				sAreaShrinkRatio = this.titleSlider.getValue() + ":"
									+ this.contentSlider.getValue() + ":"
									+ this.actionsSlider.getValue();

			oView.byId('dynamicPageTitle').setAreaShrinkRatio(sAreaShrinkRatio);
		}
	});

	new App({
		pages: [
			new Page({
				title: "New Header",
				content: [
					await MvcXMLView.create({
						controller: new MyController(),
						definition: jQuery('#view1').html()
					})
				]
			})
		]
	}).placeAt("content");
});