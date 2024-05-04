sap.ui.define([
	"sap/m/Input",
	"sap/m/Label",
	"sap/m/Button",
	"sap/m/Page",
	"sap/m/library",
	"sap/m/Bar",
	"sap/m/List",
	"sap/m/StandardListItem",
	"sap/m/SplitApp",
	"sap/ui/Device",
	"sap/base/Log"
], function(Input, Label, Button, Page, mobileLibrary, Bar, List, StandardListItem, SplitApp, Device, Log) {
	"use strict";

	// shortcut for sap.m.ListType
	var ListType = mobileLibrary.ListType;

	// shortcut for sap.m.ListMode
	var ListMode = mobileLibrary.ListMode;

	// shortcut for sap.m.SplitAppMode
	var SplitAppMode = mobileLibrary.SplitAppMode;

	// shortcut for sap.m.PageBackgroundDesign
	var PageBackgroundDesign = mobileLibrary.PageBackgroundDesign;

	function generateDetailPage2Content() {
		var aContent = [];
		var sLabelText = "This is detail ";
		var iInputCount = 19;
		var oLabelControl;
		var oInputControl;

		for (var iNumber = 0; iNumber < iInputCount; iNumber += 1) {
			oInputControl = new Input();
			oLabelControl = new Label({
				labelFor: oInputControl.getId(),
				text: sLabelText + (iNumber + 1)
			});
			aContent.push(oLabelControl);
			aContent.push(oInputControl);
		}

		return aContent;
	}

	function createIconCompetitorsButtons() {
		var buttonCount = 4;
		var content = [];

		for (var number = 0; number < buttonCount; number += 1) {
			content.push(new Button({
				icon: "images/iconCompetitors.png",
				tooltip: "Competitors icon " + ++number
			}));
		}

		return content;
	}

	// create first detail page
	var oDetailPage = new Page("detail", {
		title: "Detail 1",
		backgroundDesign: PageBackgroundDesign.Solid,
		content: [
			new Button("saNavigationToDetail", {
				text: "Navigate to detail 2",
				press: function() {
					oSplitApp.to("detailDetail");
				}
			})
		],
		showNavButton: Device.system.phone,
		navButtonText: "Back",
		navButtonPress: function() {
			oSplitApp.backDetail();
		},
		subHeader: new Bar({
			contentMiddle: [
				new Button("saShowHideMasterMode", {
					text: "show/hide",
					press: function() {
						oSplitApp.setMode(SplitAppMode.ShowHideMode);
					}
				}), new Button({
					text: "stretch/compress",
					press: function() {
						oSplitApp.setMode(SplitAppMode.StretchCompressMode);
					}
				}), new Button("saHideMasterMode", {
					text: "hide",
					press: function() {
						oSplitApp.setMode(SplitAppMode.HideMode);
					}
				}), new Button({
					text: "popover",
					press: function() {
						oSplitApp.setMode(SplitAppMode.PopoverMode);
					}
				})
			]
		}),
		footer: new Bar({
			id: "detail-footer",
			contentMiddle: [
				new Button({
					icon: "images/iconCompetitors.png",
					tooltip: "Competitors icon detail 1"
				}),
				new Button({
					icon: "images/iconCompetitors.png",
					tooltip: "Competitors icon detail 2"
				}),
				new Button({
					icon: "images/iconCompetitors.png",
					tooltip: "Competitors icon detail 3"
				}),
				new Button({
					icon: "images/iconCompetitors.png",
					tooltip: "Competitors icon detail 4"
				})
			]
		})
	}).addStyleClass("pageWithPadding");

	var oDetailDetailPage = new Page("detailDetail", {
		title: "Detail Detail",
		backgroundDesign: PageBackgroundDesign.Solid,
		content: [
			new Label({
				text: "this is Detail Detail"
			})
		],
		showNavButton: true,
		navButtonText: "Back",
		navButtonPress: function() {
			oSplitApp.backDetail();
		},
		subHeader: new Bar({
			contentMiddle: [
				new Button({
					text: "show/hide",
					press: function() {
						oSplitApp.setMode(SplitAppMode.ShowHideMode);
					}
				}), new Button({
					text: "stretch/compress",
					press: function() {
						oSplitApp.setMode(SplitAppMode.StretchCompressMode);
					}
				}), new Button({
					text: "hide",
					press: function() {
						oSplitApp.setMode(SplitAppMode.HideMode);
					}
				}), new Button({
					text: "popover",
					press: function() {
						oSplitApp.setMode(SplitAppMode.PopoverMode);
					}
				})
			]
		})
	}).addStyleClass("pageWithPadding");

	//create second detail page
	var oDetailPage2 = new Page("detail2", {
		title: "Detail 2",
		backgroundDesign: PageBackgroundDesign.Solid,
		showNavButton: true,
		navButtonText: "Back",
		navButtonPress: function() {
			oSplitApp.backDetail();
		},
		content: [
			generateDetailPage2Content()
		],
		subHeader: new Bar({
			contentMiddle: []
		}),
		footer: new Bar({
			id: "detai2l-footer",
			contentMiddle: [
				createIconCompetitorsButtons()
			]
		})
	}).addStyleClass("pageWithPadding");

	//create first master page

	var oMasterPage = new Page("master", {
		title: "Master",
		backgroundDesign: PageBackgroundDesign.List,
		icon: "images/SAPUI5.jpg",
		content: [
			new List({
				items: [
					new StandardListItem("saNavigateToMaster", {
						title: "To Master 2",
						type: "Navigation",
						press: function() {
							oSplitApp.toMaster("master2");
						}
					})
				]
			})
		],
		footer: new Bar({
			id: "master-footer",
			contentMiddle: [
				new Button({
					icon: "images/iconCompetitors.png",
					tooltip: "Competitors icon master 1"
				}),
				new Button({
					icon: "images/iconCompetitors.png",
					tooltip: "Competitors icon master 2"
				}),
				new Button({
					icon: "images/iconCompetitors.png",
					tooltip: "Competitors icon master 3"
				}),
				new Button({
					icon: "images/iconCompetitors.png",
					tooltip: "Competitors icon master 4"
				})
			]
		})
	});

	var iDetailPage2Length = oDetailPage2.getContent().length;
	var oButtonToLast = new Button({
		text: "Scroll to last input",
		press: function() {
			oDetailPage2.scrollToElement( oDetailPage2.getContent()[iDetailPage2Length - 1], 1000 );
		}
	});

	var oButtonToFirst = new Button({
		text: "Scroll to first input",
		press: function() {
			oDetailPage2.scrollToElement( oDetailPage2.getContent()[1], 1000 );
		}
	});

	//create second master page
	var oMasterPage2 = new Page("master2", {
		title: "Master 2",
		backgroundDesign: PageBackgroundDesign.List,
		showNavButton: true,
		navButtonPress: function() {
			oSplitApp.backMaster();
		},
		icon: "images/SAPUI5.jpg",
		content: [
			new List({
				mode: Device.system.phone ? ListMode.None : ListMode.SingleSelectMaster,
				selectionChange: function(oEv) {
					if (oEv.getParameter("listItem").getId() == "listDetail2") {
						oMasterPage2.addContent(oButtonToLast);
						oMasterPage2.addContent(oButtonToFirst);

						oSplitApp.toDetail("detail2");
					} else {
						oMasterPage2.removeContent(oButtonToLast);
						oMasterPage2.removeContent(oButtonToFirst);

						oSplitApp.toDetail("detail");
					}
				},
				items: [
					new StandardListItem("listDetail", {
						title: "To Detail 1",
						type: ListType.Active,
						press: function(oEv) {
							oSplitApp.toDetail("detail");
						}
					}),
					new StandardListItem("listDetail2", {
						title: "To Detail 2",
						type: ListType.Active,
						press: function(oEv) {
							oSplitApp.toDetail("detail2");
						}
					})
				]
			})
		],
		footer: new Bar({
			id: "master2-footer",
			contentMiddle: [
				createIconCompetitorsButtons()
			]
		})
	});

	//create SplitApp()
	var oSplitApp = new SplitApp({
		detailPages: [oDetailPage, oDetailDetailPage, oDetailPage2],
		masterPages: [oMasterPage, oMasterPage2],
		initialDetail: "detail",
		initialMaster: "master",
		afterMasterOpen: function() {
			Log.info("master is opened");
		},
		afterMasterClose: function() {
			Log.info("master is closed");
		}
	});

	if (Device.system.tablet  || Device.system.desktop) {
		oSplitApp.setDefaultTransitionNameDetail("fade");
	}

	oSplitApp.placeAt("body");
});
