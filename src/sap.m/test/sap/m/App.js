sap.ui.define([
	"sap/ui/core/InvisibleText",
	"sap/m/App",
	"sap/m/Page",
	"sap/m/Button",
	"sap/m/Bar",
	"sap/m/MessageToast",
	"sap/m/SearchField",
	"sap/ui/core/HTML"
], function(InvisibleText, App, Page, Button, Bar, MessageToast, SearchField, HTML) {
	"use strict";

	new InvisibleText("SF_AD", {text: "Sample Accessible Name"}).toStatic();

	var app = new App("myApp", {initialPage:"page1"});

	var page1 = new Page("page1", {
		title: "Page 1",
		titleLevel: "H1",
		content : [
			new Button({
				id : "show-footer-btn",
				text : "Show footer",
				press : function() {
					page1.setShowFooter(true);
				}
			}),
			new Button({
				id : "hide-footer-btn",
				text : "Hide footer",
				press : function() {
					page1.setShowFooter(false);
				}
			}),
			new Button({
				id : "go-to-page-2-btn",
				text : "To Page 2",
				press : function() {
					app.to("page2");
				}
			}),
			new Button({
				id : "show-nav-btn",
				text : "show Nav",
				press : function() {
					page1.setShowNavButton(true);
				}
			}),
			new Button({
				id : "hide-nav-btn",
				text : "hide Nav",
				press : function() {
					page1.setShowNavButton(false);
				}
			})
		],
		subHeader: new Bar({
			contentMiddle: [new SearchField("SFB1", {placeholder: "type text...", width: "100%", ariaLabelledBy: ["SF_AD"]})]
		}),
		footer: new Bar({
			id: 'page1-footer',
			contentMiddle: [
				new Button({icon:"images/iconCompetitors.png", iconDensityAware: false, tooltip: "Trophy"} ),
				new Button({icon:"images/iconCompetitors.png", iconDensityAware: false, tooltip: "Trophy"} ),
				new Button({icon:"images/iconCompetitors.png", iconDensityAware: false, tooltip: "Trophy"} ),
				new Button({icon:"images/iconCompetitors.png", iconDensityAware: false, tooltip: "Trophy"} )
			]
		})

	});

	var page2 = new Page("page2", {
		title: "Page 2",
		titleLevel: "H1",
		backgroundDesign:"Standard",
		showNavButton: true,
		navButtonText: "Page 1",
		navButtonPress: function(){ app.back(); },
		icon: "sap-icon://favorite",
		enableScrolling: false,
		headerContent: new Button({
			text : "Options",
			press : function() {
				MessageToast.show("Options would open now.");
			}
		}),
		content : [ new Button({
			text : "Back to Page 1",
			press : function() {
				app.back();
			}
		}), new HTML({content:"<div>This page does not scroll.</div>"}) ]
	});
	page2.setBackgroundDesign("List");
	app.addPage(page1).addPage(page2);

	app.placeAt("body");
});
