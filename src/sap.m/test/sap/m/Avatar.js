sap.ui.define([
	"sap/ui/core/InvisibleText",
	"sap/m/MessageToast",
	"sap/m/Page",
	"sap/m/Avatar",
	"sap/m/LightBox",
	"sap/m/LightBoxItem",
	"sap/m/App"
], function(InvisibleText, MessageToast, Page, Avatar, LightBox, LightBoxItem, App) {
	"use strict";

			new InvisibleText("avatar_label", {text: "My label"}).toStatic();

			function onAvatarPress (oEvent) {
				MessageToast.show(oEvent.getSource().getId() + " pressed");
			}

			var oPage = new Page("avatar-page", {
				title: "sap.m.Avatar",
				titleLevel: "H1",
				content: [
					new Avatar("defaultXSSquareAvatar", {
						displaySize: "XS",
						displayShape: "Square",
						tooltip: "XS size Avatar"
					}),
					new Avatar("defaultAvatar", {
						tooltip: "S size Avatar"
					}),
					new Avatar("decorativeAvatar", {
						 decorative: true,
						 tooltip: "S size Avatar decorative"
						}),
					new Avatar("initialsMCircleAvatar", {
						initials: "BP",
						displaySize: "M",
						tooltip: "М size Avatar with initials"
					}),
					new Avatar("iconLAvatar", {
						src: "sap-icon://lab",
						displaySize: "L",
						tooltip: "L size Avatar with icon"
					}),
					new Avatar("imageXL", {
						src: "images/Woman_avatar_01.png",
						displaySize: "XL",
						tooltip: "XL size Avatar with image"

					}),
					// if image cannot be found, the initials will be shown if provided
					new Avatar("imageXL2", {
						initials: "YY",
						src: "images/cannotfind_Woman_avatar_01.png",
						displaySize: "XL",
						tooltip: "XL size Avatar with image and initials"
					}),
					new Avatar("imageXLSquareCover", {
						ariaLabelledBy: 'avatar_label',
						tooltip: "XL Avatar with Image with cover fit type",
						src: "images/Screw_avatar_01.jpg",
						displaySize: "XL",
						displayShape: "Square",
						imageFitType: "Cover",
						press: onAvatarPress
					}).addStyleClass("sapUiTinyMarginBegin sapUiTinyMarginEnd sapUiTinyMarginTop"),
					new Avatar("imageXLSquareContain", {
						ariaLabelledBy: 'avatar_label',
						tooltip: "XL Avatar with Image with contain fit type",
						src: "images/Lamp_avatar_01.jpg",
						displaySize: "XL",
						displayShape: "Square",
						imageFitType: "Contain",
						press: onAvatarPress
					}).addStyleClass("sapUiTinyMarginBegin sapUiTinyMarginEnd sapUiTinyMarginTop"),
					new Avatar("initialsCustomAvatar", {
						ariaLabelledBy: 'avatar_label',
						tooltip: "Avatar with Custom size and font size",
						initials: "BP",
						displaySize: "Custom",
						customDisplaySize: "10rem",
						customFontSize: "2rem",
						badgeIcon: "sap-icon://zoom-in",
						badgeTooltip: "Zoom in",
						press: onAvatarPress
					}).addStyleClass("sapUiTinyMarginTop"),
					new Avatar({
						ariaLabelledBy: 'avatar_label',
						tooltip: "M size Avatar",
						initials: "LB",
						displaySize: "M",
						badgeTooltip: "Zoom in",
						detailBox: new LightBox({
							id: "lightBox",
							imageContent: new LightBoxItem({
								imageSrc: "images/Woman_avatar_01.png",
								title: "LightBox example"
							})
						})
					}).addStyleClass("sapUiTinyMarginBegin")
				]
			});

			var oApp = new App();
			oApp.addPage(oPage).placeAt("body");
});
