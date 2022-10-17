sap.ui.define([
	"sap/m/App",
	"sap/m/QuickView",
	"sap/m/library",
	"sap/m/QuickViewPage",
	"sap/m/QuickViewGroup",
	"sap/m/QuickViewGroupElement",
	"sap/m/Avatar",
	"sap/m/Button",
	"sap/ui/core/library",
	"sap/m/Page"
], function(App, QuickView, mobileLibrary, QuickViewPage, QuickViewGroup, QuickViewGroupElement, Avatar, Button, coreLibrary, Page) {
	"use strict";

	// shortcut for sap.ui.core.aria.HasPopup
	var HasPopup = coreLibrary.aria.HasPopup;

	// shortcut for sap.m.QuickViewGroupElementType
	var QuickViewGroupElementType = mobileLibrary.QuickViewGroupElementType;

	// shortcut for sap.m.PlacementType
	var PlacementType = mobileLibrary.PlacementType;

	// create and add app
	var app = new App("myApp", {initialPage:"quickViewPage"});
	app.placeAt("body");

	var oQuickView1 = new QuickView("QV1", {
		placement : PlacementType.VerticalPreferedBottom,
		pages : [
			new QuickViewPage({
				header	: "Store",
				title	: "Jumbo",
				description	: "The best toy store in the USA",
				icon	: "sap-icon://retail-store",
				groups	: [
					new QuickViewGroup({
						heading		: "Store details",
						elements	: [
							new QuickViewGroupElement({
								label	: "Address",
								value	: "Sunset Blvd. 7, Los Angeles"
							}),
							new QuickViewGroupElement({
								label	: "Website",
								value	: "http://jumbo.com",
								url 	: "http://jumbo.com",
								type	: QuickViewGroupElementType.link
							}),
							new QuickViewGroupElement({
								label	: "Email",
								value	: "info@jumbo.com",
								type	: QuickViewGroupElementType.email
							}),
							new QuickViewGroupElement({
								label	: "Opening hours",
								value	: "Every day from 8AM to 10PM",
								type	: QuickViewGroupElementType.text
							})
						]
					})
				]
			})
		]
	});

	var oQuickView2 = new QuickView({
		placement : PlacementType.VerticalPreferedBottom,
		pages : [
			new QuickViewPage({
				header: "Financial Department",
				title : "Jane Doe",
				description : "Financial Advisor",
				avatar: new Avatar({
					initials: "JD",
					displayShape: "Circle"
				}),
				groups : [
					new QuickViewGroup({
						heading : "Contact Details",
						elements : [
							new QuickViewGroupElement({
								label : "Address",
								value : "Sunset Blvd. 7, Los Angeles"
							}),
							new QuickViewGroupElement({
								label : "Mobile",
								value : "+123456789",
								type : QuickViewGroupElementType.phone
							}),
							new QuickViewGroupElement({
								label : "Email",
								value : "jane.doe@sap.com",
								type : QuickViewGroupElementType.email
							})
						]
					})
				]
			})
		]
	});

	var oSinglePageQuickViewButton = new Button("SinglePageQVButton", {
		text: "Open a single page quick view",
		ariaHasPopup: HasPopup.Dialog,
		press: function() {
			oQuickView1.openBy(this);
		}
	});

	var oButton2 = new Button({
		text: "Open a quick view with avatar",
		ariaHasPopup: HasPopup.Dialog,
		press: function() {
			oQuickView2.openBy(this);
		}
	});

	// create and add a page with icon tab bar
	var page = new Page("quickViewPage", {
		title : "Quick View",
		titleLevel: "H1",
		content : [
			oSinglePageQuickViewButton,
			oButton2
		]
	});
	app.addPage(page);
});
