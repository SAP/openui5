
sap.ui.define([
	"jquery.sap.global",
	"sap/f/ShellBar",
	"sap/m/OverflowToolbarButton",
	"sap/m/App",
	"sap/m/Page",
	"sap/ui/layout/VerticalLayout",
	"sap/m/Slider",
	"sap/m/Button",
	"sap/m/Avatar",
	"sap/m/Menu",
	"sap/m/MenuItem",
	"sap/ui/core/Element"
], function (
	jQuery,
	ShellBar,
	OverflowToolbarButton,
	App,
	Page,
	VerticalLayout,
	Slider,
	Button,
	Avatar,
	Menu,
	MenuItem,
	Element
) {
	"use strict";

	var oControl,
		iInitialWidth = parseInt(window.location.hash.replace(/^#/, ""));

	if (!iInitialWidth) {
		iInitialWidth = 100;
	}

	jQuery("#center").width(iInitialWidth + "%");
	setTimeout(function () {
		oControl.setWidth(iInitialWidth + "%");
	}, 0);

	new App({
		pages: [
			new Page({
				showHeader: false,
				content: [
					oControl = new VerticalLayout({
						content: [

							new ShellBar("shell-bar", {
								homeIcon: sap.ui.require.toUrl("sap/ui/documentation/sdk/images/logo_sap.png"),
								title: "Main title some long long title ds dsa sd dasdas ",
								secondTitle: "Second title must alsoa dads",
								showCopilot: true,
								showNavButton: true,
								showSearch: true,
								showProductSwitcher: true,
								showNotifications: true,
								notificationsNumber: "2",
								profile: new Avatar({
									initials: "DN"
								}),
								menu: new Menu({
									title: "random 2",
									items: [
										new MenuItem({
											text: "fridge",
											icon: "sap-icon://fridge",
											items: [
												new MenuItem({
													text: "accidental leave",
													icon: "sap-icon://accidental-leave",
													items: [
														new MenuItem({
															icon: "sap-icon://factory",
															text: "factory"
														}),
														new MenuItem({
															icon: "sap-icon://flag",
															text: "flag"
														}),
														new MenuItem({
															icon: "sap-icon://flight",
															text: "flight"
														})
													]
												}),
												new MenuItem({
													text: "iphone",
													icon: "sap-icon://iphone",
													items: [
														new MenuItem({
															icon: "sap-icon://video",
															text: "video"
														}),
														new MenuItem({
															icon: "sap-icon://loan",
															text: "loan"
														}),
														new MenuItem({
															icon: "sap-icon://commission-check",
															text: "commission check"
														}),
														new MenuItem({
															icon: "sap-icon://doctor",
															text: "doctor"
														})
													]
												})
											]
										}),
										new MenuItem({
											text: "globe",
											icon: "sap-icon://globe",
											items: [
												new MenuItem({
													text: "e-care",
													icon: "sap-icon://e-care"
												})
											]
										})
									]
								}),
								additionalContent: [
									new OverflowToolbarButton({ icon: "sap-icon://home", text: "home", type: "Transparent" }),
									new OverflowToolbarButton({ icon: "sap-icon://action-settings", text: "Action settings", type: "Transparent" }),
									new OverflowToolbarButton({ icon: "sap-icon://add-photo", text: "Add photo", type: "Transparent" })
								]
							})

						]
					}),
					new Slider({
						id: "oTestSlider",
						value: iInitialWidth,
						liveChange: function () {
							var iWidth = this.getValue();

							oControl.setWidth(iWidth + "%");
							jQuery("#center").width(iWidth + "%");
						}
					}),
					new Button({
						text: "width 30%",
						id: "oTestBtnWidth",
						press: function () {
							var oSlider = Element.getElementById("oTestSlider");
							oSlider.setValue(20);
							oSlider.fireLiveChange();
						}
					}).addStyleClass("sapUiSmallMarginBeginEnd")
				]
			})
		]
	}).placeAt("content");

});
