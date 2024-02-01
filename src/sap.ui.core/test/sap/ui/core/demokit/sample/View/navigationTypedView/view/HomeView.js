sap.ui.define([
	"sap/ui/core/mvc/View",
	"sap/m/Page",
	"sap/m/Button",
	"sap/m/library",
	"sap/ui/Device"
], (View, Page, Button, sapMLibrary, Device) => {
	"use strict";

	const { ButtonType } = sapMLibrary;

	return View.extend("sap.ui.core.sample.View.navigationTypedView.view.HomeView", {
		getControllerName() {
			return "sap.ui.core.sample.View.navigationTypedView.controller.Home";
		},

		// getAutoPrefixId returning true has no effect here since createContent returns a Promise. Use createId instead.

		async createContent(oController) {
			this.setHeight("100%");
			return new Page(this.createId("page"), { // Resulting ID suffix: homeView--page
				title: "Home",
				headerContent: new Button(this.createId("buttonToNavigate"), {
					text: "Navigate",
					icon: "sap-icon://navigation-right-arrow",
					iconFirst: false,
					type: ButtonType.Emphasized,
					press: [oController.navToNext, oController]
				}),
				content: await Promise.all([ // Sample. Use await anywhere accordingly within createContent.
					oController.loadFragment({
						name: Device.system.phone
							? "sap.ui.core.sample.View.navigationTypedView.view.HomeContentMobile"
							: "sap.ui.core.sample.View.navigationTypedView.view.HomeContentDesktop",
						type: "JS",
						addToDependents: false
					})
					//, and some other controls either synchronously via new ...
					// or via other asynchronous APIs that return a Promise.
				])
			}).addStyleClass("sapUiResponsivePadding--header sapUiResponsivePadding--content");
		}

	});
});