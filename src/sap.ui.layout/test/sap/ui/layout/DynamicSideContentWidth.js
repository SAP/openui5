sap.ui.require([
	"sap/m/App",
	"sap/m/Bar",
	"sap/m/Button",
	"sap/m/library",
	"sap/m/Page",
	"sap/m/ObjectHeader",
	"sap/m/Shell",
	"sap/m/SplitApp",
	"sap/m/Text",
	"sap/m/VBox",
	"sap/ui/core/HTML",
	"sap/ui/layout/DynamicSideContent"
], function(App, Bar, Button, mobileLibrary, Page, ObjectHeader, Shell, SplitApp, Text, VBox, HTML, DynamicSideContent) {
	"use strict";

	var FlexAlignItems = mobileLibrary.FlexAlignItems;

	var oApp = new App();
	var oShell = new Shell({
		app: oApp,
		appWidthLimited: false
	});

	var oDSC = new DynamicSideContent({
		sideContentWidthM: "250px",
		sideContentWidthL: "400px",
		sideContentWidthXL: "500px",
		sideContentPosition: "Begin",
		sideContentFallDown: "BelowM",
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
			cow swine kevin. Tongue ball tip beef ribs, kevin!!!'
			})
		],
		mainContent: [
				new ObjectHeader({
					title: "App Header",
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
			cow swine kevin. Tongue ball tip beef ribs, kevin!!!'
				}),
			new Button({press: function() {
				oDSC.addMainContent(new Button({text: "Btn"}));
			}, text: "Add main content"}),
			new Button({press: function() {
				oDSC.addSideContent(new Button({text: "Btn"}));
			}, text: "Add side content"}),
			new HTML({ content: "<hr>" })

		]
	});

	oDSC.attachBreakpointChanged(function(oEvent) {
        var sBreakpoint = oEvent.getParameter("currentBreakpoint"),
			sSideContentWidth = this._getSideContentWidth();
		oPage.setTitle("Dynamic Side Content | Breakpoint: " + sBreakpoint + " | Side Content Width: " + (sSideContentWidth ? sSideContentWidth : "n/a"));
    });

	var oFooterBar = new Bar();

	var oPage = new Page("mySecondPage", {
		backgroundDesign: "Standard",
		title : "Dynamic Side Content - Side Content Width",
		enableScrolling : true,
		footer: oFooterBar,
		content: oDSC
	});

	oFooterBar.addContentMiddle(new Button({
		text: "Limit ON",
		press: function () {
			if (oShell.getAppWidthLimited()) {
				oShell.setAppWidthLimited(false);
				this.setText("Limit ON");
			} else {
				oShell.setAppWidthLimited(true);
				this.setText("Limit OFF");
			}
		}
	}));

	oFooterBar.addContentMiddle(new Button({
		text: "Show SC",
		press: function () {
			oDSC.setShowSideContent(true);
		}
	}));

	oFooterBar.addContentMiddle(new Button({
		text: "Hide SC",
		press: function () {
			oDSC.setShowSideContent(false);
		}
	}));

	oFooterBar.addContentMiddle(new Button({
		text: "Show MC",
		press: function () {
			oDSC.setShowMainContent(true);
		}
	}));

	oFooterBar.addContentMiddle(new Button("btnHideMC", {
		text: "Hide MC",
		press: function () {
			oDSC.setShowMainContent(false);
		}
	}));

	oFooterBar.addContentMiddle(new Button({
		text: "Toggle",
		press: function () {
			oDSC.toggle();
		}
	}));

	oFooterBar.addContentMiddle(new Button({
		text: "EqualSplit ON",
		press: function () {
			if (oDSC.getEqualSplit()) {
				oDSC.setEqualSplit(false);
				this.setText("EqualSplit ON");
			} else {
				oDSC.setEqualSplit(true);
				this.setText("EqualSplit OFF");
			}
		}
	}));

	oApp.addPage(oPage);
	oShell.placeAt("content");
});
