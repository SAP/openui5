sap.ui.require([
	"sap/m/App",
	"sap/m/OverflowToolbar",
	"sap/m/ToolbarSpacer",
	"sap/m/Switch",
	"sap/m/Label",
	"sap/m/Page",
	"sap/m/Title",
	"sap/m/Shell",
	"sap/m/Text",
	"sap/ui/layout/DynamicSideContent",
	"sap/ui/core/library"
], function(App, OverflowToolbar, ToolbarSpacer, Switch, Label, Page, Title, Shell, Text, DynamicSideContent, coreLibrary) {
	"use strict";

	var TitleLevel = coreLibrary.TitleLevel;

	var oApp = new App();
	var oShell = new Shell({
		app: oApp,
		appWidthLimited: false
	});

	var oDynamicSideContent = new DynamicSideContent({
		sideContent: [
			new Title({
				text: "Side Content",
				level: TitleLevel.H2,
				titleStyle: TitleLevel.H5,
				wrapping: true
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
				new Title({
					text: "Main content",
					level: TitleLevel.H2,
					titleStyle: TitleLevel.H5,
					wrapping: true
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
		]
	}).addStyleClass("sapUiContentPadding");

	var oFooterBar = new OverflowToolbar({
		content: [
			new Label({
				wrapping: true,
				text: "Set limit",
				labelFor: "shellLimitBtn"
			}),
			new Switch("shellLimitBtn", {
				change: function () {
					oShell.setAppWidthLimited(!oShell.getAppWidthLimited());
				}
			}),
			new ToolbarSpacer(),
			new Label({
				wrapping: true,
				text: "Show side content",
				labelFor: "sideContentBtn"
			}),
			new Switch("sideContentBtn", {
				state: true,
				change: function () {
					oDynamicSideContent.setShowSideContent(!oDynamicSideContent.getShowSideContent());
				}
			}),
			new ToolbarSpacer(),
			new Label({
				wrapping: true,
				text: "Show main content",
				labelFor: "mineContentBtn"
			}),
			new Switch("mineContentBtn", {
				state: true,
				change: function () {
					oDynamicSideContent.setShowMainContent(!oDynamicSideContent.getShowMainContent());
				}
			}),
			new ToolbarSpacer(),
			new Label({
				wrapping: true,
				text: "Equal split content",
				labelFor: "equalSplitBtn"
			}),
			new Switch("equalSplitBtn", {
				change: function () {
					oDynamicSideContent.setEqualSplit(!oDynamicSideContent.getEqualSplit());
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
	oShell.placeAt("body");
});
