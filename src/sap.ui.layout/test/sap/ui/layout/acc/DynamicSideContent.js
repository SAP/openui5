sap.ui.require([
	"sap/m/App",
	"sap/m/OverflowToolbar",
	"sap/m/ToolbarSpacer",
	"sap/m/Button",
	"sap/m/ToggleButton",
	"sap/m/Label",
	"sap/m/library",
	"sap/m/Page",
	"sap/m/ObjectHeader",
	"sap/m/Shell",
	"sap/m/SplitApp",
	"sap/m/Text",
	"sap/m/VBox",
	"sap/ui/core/HTML",
	"sap/ui/layout/DynamicSideContent",
	"sap/ui/core/library"
], function(App, OverflowToolbar, ToolbarSpacer, Button, ToggleButton, Label, mobileLibrary, Page, ObjectHeader, Shell, SplitApp, Text, VBox, HTML, DynamicSideContent, coreLibrary) {
	"use strict";

	var FlexAlignItems = mobileLibrary.FlexAlignItems;
	var TitleLevel = coreLibrary.TitleLevel;

	var oApp = new App();
	var oShell = new Shell({
		app: oApp,
		appWidthLimited: false
	});

	var oDynamicSideContent = new DynamicSideContent({
		sideContent: [
			new VBox({
				height: "200px",
				alignItems: FlexAlignItems.Center,
				justifyContent: FlexAlignItems.Center,
				items: [
					new Text({
						text: "Side Content"
					})
				]
			}),
			new Text({
				text: 'Bacon ipsum dolor amet pork belly fatback shank\
			boudin tri-tip short ribs filet mignon picanha.\
					Corned beef landjaeger pork chop ham hock\
			fatback tri-tip ground round, shoulder strip steak\
			flank spare ribs porchetta. Prosciutto meatball jerky\
			cow swine kevin. Tongue ball tip beef ribs, kevin\
			corned beef chicken turkey. Ham hock short ribs tail\
			sirloin turkey. Tail turkey tenderloin salami. Jerky\
			jowl andouille venison, meatball tenderloin chuck\
			boudin chicken beef tongue shank.\
					Bacon ipsum dolor amet pork belly fatback shank\
			boudin tri-tip short ribs filet mignon picanha.\
					Corned beef landjaeger pork chop ham hock\
			fatback tri-tip ground round, shoulder strip steak\
			flank spare ribs porchetta. Prosciutto meatball jerky\
			cow swine kevin. Tongue ball tip beef ribs, kevin\
			corned beef chicken turkey. Ham hock short ribs tail\
			Bacon ipsum dolor amet pork belly fatback shank\
			boudin tri-tip short ribs filet mignon picanha.\
					Corned beef landjaeger pork chop ham hock\
			fatback tri-tip ground round, shoulder strip steak\
			flank spare ribs porchetta. Prosciutto meatball jerky\
			cow swine kevin. Tongue ball tip beef ribs, kevin'
			}),
			new Text({
				text: 'Bacon ipsum dolor amet pork belly fatback shank\
			boudin tri-tip short ribs filet mignon picanha.\
					Corned beef landjaeger pork chop ham hock\
			fatback tri-tip ground round, shoulder strip steak\
			flank spare ribs porchetta. Prosciutto meatball jerky\
			cow swine kevin. Tongue ball tip beef ribs, kevin\
			corned beef chicken turkey. Ham hock short ribs tail\
			sirloin turkey. Tail turkey tenderloin salami. Jerky\
			jowl andouille venison, meatball tenderloin chuck\
			boudin chicken beef tongue shank.\
					Bacon ipsum dolor amet pork belly fatback shank\
			boudin tri-tip short ribs filet mignon picanha.\
					Corned beef landjaeger pork chop ham hock\
			fatback tri-tip ground round, shoulder strip steak\
			flank spare ribs porchetta. Prosciutto meatball jerky\
			cow swine kevin. Tongue ball tip beef ribs, kevin\
			corned beef chicken turkey. Ham hock short ribs tail\
			Bacon ipsum dolor amet pork belly fatback shank\
			boudin tri-tip short ribs filet mignon picanha.\
					Corned beef landjaeger pork chop ham hock\
			fatback tri-tip ground round, shoulder strip steak\
			flank spare ribs porchetta. Prosciutto meatball jerky\
			cow swine kevin. Tongue ball tip beef ribs, kevin'
			}),
			new Text({
				text: 'Bacon ipsum dolor amet pork belly fatback shank\
			boudin tri-tip short ribs filet mignon picanha.\
					Corned beef landjaeger pork chop ham hock\
			fatback tri-tip ground round, shoulder strip steak\
			flank spare ribs porchetta. Prosciutto meatball jerky\
			cow swine kevin. Tongue ball tip beef ribs, kevin\
			corned beef chicken turkey. Ham hock short ribs tail\
			sirloin turkey. Tail turkey tenderloin salami. Jerky\
			jowl andouille venison, meatball tenderloin chuck\
			boudin chicken beef tongue shank.\
					Bacon ipsum dolor amet pork belly fatback shank\
			boudin tri-tip short ribs filet mignon picanha.\
					Corned beef landjaeger pork chop ham hock\
			fatback tri-tip ground round, shoulder strip steak\
			flank spare ribs porchetta. Prosciutto meatball jerky\
			cow swine kevin. Tongue ball tip beef ribs, kevin\
			corned beef chicken turkey. Ham hock short ribs tail\
			Bacon ipsum dolor amet pork belly fatback shank\
			boudin tri-tip short ribs filet mignon picanha.\
					Corned beef landjaeger pork chop ham hock\
			fatback tri-tip ground round, shoulder strip steak\
			flank spare ribs porchetta. Prosciutto meatball jerky\
			cow swine kevin. Tongue ball tip beef ribs, kevin'
			}),
			new Text({
				text: 'Bacon ipsum dolor amet pork belly fatback shank\
			boudin tri-tip short ribs filet mignon picanha.\
					Corned beef landjaeger pork chop ham hock\
			fatback tri-tip ground round, shoulder strip steak\
			flank spare ribs porchetta. Prosciutto meatball jerky\
			cow swine kevin. Tongue ball tip beef ribs, kevin\
			corned beef chicken turkey. Ham hock short ribs tail\
			sirloin turkey. Tail turkey tenderloin salami. Jerky\
			jowl andouille venison, meatball tenderloin chuck\
			boudin chicken beef tongue shank.\
					Bacon ipsum dolor amet pork belly fatback shank\
			boudin tri-tip short ribs filet mignon picanha.\
					Corned beef landjaeger pork chop ham hock\
			fatback tri-tip ground round, shoulder strip steak\
			flank spare ribs porchetta. Prosciutto meatball jerky\
			cow swine kevin. Tongue ball tip beef ribs, kevin\
			corned beef chicken turkey. Ham hock short ribs tail\
			Bacon ipsum dolor amet pork belly fatback shank\
			boudin tri-tip short ribs filet mignon picanha.\
					Corned beef landjaeger pork chop ham hock\
			fatback tri-tip ground round, shoulder strip steak\
			flank spare ribs porchetta. Prosciutto meatball jerky\
			cow swine kevin. Tongue ball tip beef ribs, kevin'
			})
		],
		mainContent: [
				new ObjectHeader({
					title: "App Header",
					titleLevel: TitleLevel.H2,
					number: "KPI 1234",
					intro: "3 General Data"
				}),
				new Text({
					text: 'Bacon ipsum dolor amet pork belly fatback shank\
			boudin tri-tip short ribs filet mignon picanha.\
					Corned beef landjaeger pork chop ham hock\
			fatback tri-tip ground round, shoulder strip steak\
			flank spare ribs porchetta. Prosciutto meatball jerky\
			cow swine kevin. Tongue ball tip beef ribs, kevin\
			corned beef chicken turkey. Ham hock short ribs tail\
			sirloin turkey. Tail turkey tenderloin salami. Jerky\
			jowl andouille venison, meatball tenderloin chuck\
			boudin chicken beef tongue shank.\
					Bacon ipsum dolor amet pork belly fatback shank\
			boudin tri-tip short ribs filet mignon picanha.\
					Corned beef landjaeger pork chop ham hock\
			fatback tri-tip ground round, shoulder strip steak\
			flank spare ribs porchetta. Prosciutto meatball jerky\
			cow swine kevin. Tongue ball tip beef ribs, kevin\
			corned beef chicken turkey. Ham hock short ribs tail\
			Bacon ipsum dolor amet pork belly fatback shank\
			boudin tri-tip short ribs filet mignon picanha.\
					Corned beef landjaeger pork chop ham hock\
			fatback tri-tip ground round, shoulder strip steak\
			flank spare ribs porchetta. Prosciutto meatball jerky\
			cow swine kevin. Tongue ball tip beef ribs, kevin'
				}),
			new Button({press: function() {
				oDynamicSideContent.addMainContent(new Button({text: "Btn"}));
			}, text: "Add main content"}),
			new Button({press: function() {
				oDynamicSideContent.addSideContent(new Button({text: "Btn"}));
			}, text: "Add side content"}),
			new HTML({ content: "<hr>" })

		]
	}).addStyleClass("sapUiContentPadding");

	var oFooterBar = new OverflowToolbar({
		content: [
			new Label({
				wrapping: true,
				text: "Set limit",
				labelFor: "shellLimitBtn"
			}),
			new ToggleButton("shellLimitBtn", {
				text: "Limit",
				tooltip: "Set limit off",
				pressed: true,
				press: function () {
					if (oShell.getAppWidthLimited()) {
						this.setTooltip("Set limit off");
						oShell.setAppWidthLimited(false);
					} else {
						this.setTooltip("Set limit on");
						oShell.setAppWidthLimited(true);
					}
				}
			}),
			new ToolbarSpacer(),
			new Label({
				wrapping: true,
				text: "Set Side Content",
				labelFor: "sideContentBtn"
			}),
			new ToggleButton("sideContentBtn", {
				text: "Side Content",
				tooltip: "Hide side content",
				pressed: true,
				press: function (oEvent) {
					if (oEvent.getParameter("pressed")) {
						this.setTooltip("Hide side content");
						oDynamicSideContent.setShowSideContent(true);
					} else {
						this.setTooltip("Show side content");
						oDynamicSideContent.setShowSideContent(false);
					}
				}
			}),
			new ToolbarSpacer(),
			new Label({
				wrapping: true,
				text: "Set Mine Content",
				labelFor: "mineContentBtn"
			}),
			new ToggleButton("mineContentBtn", {
				text: "Middle",
				tooltip: "Hide main content",
				pressed: true,
				press: function (oEvent) {
					if (oEvent.getParameter("pressed")) {
						this.setTooltip("Hide main content");
						oDynamicSideContent.setShowMainContent(true);
					} else {
						this.setTooltip("Show main content");
						oDynamicSideContent.setShowMainContent(false);
					}
				}
			}),
			new ToolbarSpacer(),
			new Label({
				wrapping: true,
				text: "Toggle Content",
				labelFor: "toggleBtn"
			}),
			new Button("toggleBtn", {
				text: "Toggle",
				press: function () {
					oDynamicSideContent.toggle();
				}
			}),
			new ToolbarSpacer(),
			new Label({
				wrapping: true,
				text: "Equal Split Content",
				labelFor: "equalSplitBtn"
			}),
			new ToggleButton("equalSplitBtn", {
				text: "EqualSplit",
				tooltip: "EqualSplit on",
				press: function () {
					if (oDynamicSideContent.getEqualSplit()) {
						oDynamicSideContent.setEqualSplit(false);
						this.setTooltip("EqualSplit on");
					} else {
						oDynamicSideContent.setEqualSplit(true);
						this.setTooltip("EqualSplit off");
					}
				}
			})
		]
	});

	var oPage = new Page("mySecondPage", {
		backgroundDesign: "Standard",
		title : "Dynamic Side Content",
		titleLevel: TitleLevel.H1,
		enableScrolling : true,
		footer: oFooterBar,
		content: oDynamicSideContent
	});

	oApp.addPage(oPage);
	oShell.placeAt("content");
});
