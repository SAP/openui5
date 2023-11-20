sap.ui.define([
	"sap/m/App",
	"sap/m/QuickViewPage",
	"sap/m/QuickViewGroup",
	"sap/m/QuickViewGroupElement",
	"sap/m/library",
	"sap/m/QuickViewCard",
	"sap/m/Avatar",
	"sap/m/Panel",
	"sap/m/Page"
], function(App, QuickViewPage, QuickViewGroup, QuickViewGroupElement, mobileLibrary, QuickViewCard, Avatar, Panel, Page) {
	"use strict";

	// shortcut for sap.m.QuickViewGroupElementType
	var QuickViewGroupElementType = mobileLibrary.QuickViewGroupElementType;

	// create and add app
	var app = new App("myApp", {initialPage:"quickViewPage"});
	app.placeAt("body");

	var oQuickViewPage = new QuickViewPage({
		header	: "Store",
		title	: "Jumbo",
		description	: "The best toy store in the USA",
		icon	: "http://www.iconshock.com/img_jpg/SUNNYDAY/general/jpg/128/toy_icon.jpg",
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
	});

	var oQuickViewCard = new QuickViewCard({
		pages: [oQuickViewPage ]
	});

	var oQuickViewCard2 = new QuickViewCard({
		pages: [
			new QuickViewPage({
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

	var oPanel = new Panel('quickViewPagePanel', {
		width : '320px',
		height : '292px',
		headerText : 'Store',
		content : [
			oQuickViewCard
		]
	});

	var oPanel2 = new Panel({
		width : '320px',
		headerText : 'User',
		content : [
			oQuickViewCard2
		]
	});

	// create and add a page with icon tab bar
	var page = new Page("quickViewPage", {
		title : "Quick View Page",
		titleLevel: "H1",
		content : [
			oPanel,
			oPanel2
		]
	});
	app.addPage(page);
});
