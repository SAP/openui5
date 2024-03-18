sap.ui.define([
	'sap/m/IconTabFilter',
	'sap/m/Text',
	"sap/m/App",
	"sap/m/Page",
	"sap/m/Panel",
	"sap/m/IconTabSeparator",
	"sap/m/IconTabBar"
], function (
	IconTabFilter,
	Text,
	App,
	Page,
	Panel,
	IconTabSeparator,
	IconTabBar
	) {
	"use strict";

	const oIconTabBar = new IconTabBar("idIconTabBar0",{
		expanded: false
	}).addStyleClass("sapUiResponsiveContentPadding");
		for (var i = 1; i <= 30; i++) {
			const oIconTabFilter = new IconTabFilter({
				text: 'Tab ' + i,
				content: new Text({
					text: 'Content ' + i
				})
			});

			oIconTabBar.addItem(oIconTabFilter);
		}


	const oIconTabBar1 = new IconTabBar("idIconTabBar3", {
		expanded: false,
		items: [
			new IconTabFilter({
				text: "Info"
			}),
			new IconTabFilter({
				text: "Attachments"
			}),
			new IconTabFilter({
				text: "Notes"
			}),
			new IconTabFilter({
				text: "People"
			}),
			new IconTabFilter({
				text: "Info"
			}),
			new IconTabFilter({
				text: "Attachments"
			}),
			new IconTabFilter({
				text: "Notes"
			}),
			new IconTabFilter({
				text: "People"
			}),
			new IconTabFilter({
				text: "Info"
			}),
			new IconTabFilter({
				text: "Attachments"
			}),
			new IconTabFilter({
				text: "Notes"
			}),
			new IconTabFilter({
				text: "People"
			}),
			new IconTabFilter({
				text: "Info"
			}),
			new IconTabFilter({
				text: "Attachments"
			}),
			new IconTabFilter({
				text: "Notes"
			}),
			new IconTabFilter({
				text: "People"
			}),
			new IconTabFilter({
				text: "Info"
			}),
			new IconTabFilter({
				text: "Attachments"
			}),
			new IconTabFilter({
				text: "Notes"
			}),
			new IconTabFilter({
				text: "People"
			}),
			new IconTabFilter({
				text: "Info"
			}),
			new IconTabFilter({
				text: "Attachments"
			}),
			new IconTabFilter({
				text: "Notes"
			}),
			new IconTabFilter({
				text: "People"
			})
		]
	}).addStyleClass("sapUiResponsiveContentPadding");

	const oIconTabBar2 = new IconTabBar("idIconTabBar6", {
		expanded: false,
		headerMode: "Inline",
		items: [
			new IconTabFilter({
				text: "Info",
				count: "3"
			}),
			new IconTabFilter({
				text: "Attachments",
				count: "4321"
			}),
			new IconTabFilter({
				text: "Notes",
				count: "333"
			}),
			new IconTabFilter({
				text: "People",
				count: "34"
			}),
			new IconTabFilter({
				text: "Info",
				count: "3"
			}),
			new IconTabFilter({
				text: "Attachments",
				count: "4321"
			}),
			new IconTabFilter({
				text: "Notes",
				count: "333"
			}),
			new IconTabFilter({
				text: "People",
				count: "34"
			}),
			new IconTabFilter({
				text: "Info",
				count: "3"
			}),
			new IconTabFilter({
				text: "Attachments",
				count: "4321"
			}),
			new IconTabFilter({
				text: "Notes",
				count: "333"
			}),
			new IconTabFilter({
				text: "People",
				count: "34"
			}),
			new IconTabFilter({
				text: "Info",
				count: "3"
			}),
			new IconTabFilter({
				text: "Attachments",
				count: "4321"
			}),
			new IconTabFilter({
				text: "Notes",
				count: "333"
			}),
			new IconTabFilter({
				text: "People",
				count: "34"
			}),
			new IconTabFilter({
				text: "Info",
				count: "3"
			}),
			new IconTabFilter({
				text: "Attachments",
				count: "4321"
			}),
			new IconTabFilter({
				text: "Notes",
				count: "333"
			}),
			new IconTabFilter({
				text: "People",
				count: "34"
			}),
			new IconTabFilter({
				text: "Info",
				count: "3"
			}),
			new IconTabFilter({
				text: "Attachments",
				count: "4321"
			}),
			new IconTabFilter({
				text: "Notes",
				count: "333"
			}),
			new IconTabFilter({
				text: "People",
				count: "34"
			})
		]
	}).addStyleClass("sapUiResponsiveContentPadding");

	const oIconTabBar3 = new IconTabBar("idIconTabBar7", {
		expanded: false,
		items: [
			new IconTabFilter({
				text: "Info",
				count: "3"
			}),
			new IconTabFilter({
				text: "Attachments",
				count: "4321"
			}),
			new IconTabFilter({
				text: "Notes",
				count: "333"
			}),
			new IconTabFilter({
				text: "People",
				count: "34"
			}),
			new IconTabFilter({
				text: "Info",
				count: "3"
			}),
			new IconTabFilter({
				text: "Attachments",
				count: "4321"
			}),
			new IconTabFilter({
				text: "Notes",
				count: "333"
			}),
			new IconTabFilter({
				text: "People",
				count: "34"
			}),
			new IconTabFilter({
				text: "Info",
				count: "3"
			}),
			new IconTabFilter({
				text: "Attachments",
				count: "4321"
			}),
			new IconTabFilter({
				text: "Notes",
				count: "333"
			}),
			new IconTabFilter({
				text: "People",
				count: "34"
			}),
			new IconTabFilter({
				text: "Info",
				count: "3"
			}),
			new IconTabFilter({
				text: "Attachments",
				count: "4321"
			}),
			new IconTabFilter({
				text: "Notes",
				count: "333"
			}),
			new IconTabFilter({
				text: "People",
				count: "34"
			}),
			new IconTabFilter({
				text: "Info",
				count: "3"
			}),
			new IconTabFilter({
				text: "Attachments",
				count: "4321"
			}),
			new IconTabFilter({
				text: "Notes",
				count: "333"
			}),
			new IconTabFilter({
				text: "People",
				count: "34"
			}),
			new IconTabFilter({
				text: "Info",
				count: "3"
			}),
			new IconTabFilter({
				text: "Attachments",
				count: "4321"
			}),
			new IconTabFilter({
				text: "Notes",
				count: "333"
			}),
			new IconTabFilter({
				text: "People",
				count: "34"
			})
		]
	}).addStyleClass("sapUiResponsiveContentPadding");

	const oIconTabBar4 = new IconTabBar("idIconTabBar4", {
		expanded: false,
		items: [
			new IconTabFilter({
				icon:"sap-icon://hint"
			}),
			new IconTabFilter({
				icon:"sap-icon://attachment",
				count:"3"
			}),
			new IconTabFilter({
				icon:"sap-icon://notes",
				count:"12"
			}),
			new IconTabFilter({
				icon:"sap-icon://group"
			}),
			new IconTabFilter({
				icon:"sap-icon://hint"
			}),
			new IconTabFilter({
				icon:"sap-icon://attachment",
				count:"3"
			}),
			new IconTabFilter({
				icon:"sap-icon://notes",
				count:"12"
			}),
			new IconTabFilter({
				icon:"sap-icon://group"
			}),
			new IconTabFilter({
				icon:"sap-icon://hint"
			}),
			new IconTabFilter({
				icon:"sap-icon://attachment",
				count:"3"
			}),
			new IconTabFilter({
				icon:"sap-icon://notes",
				count:"12"
			}),
			new IconTabFilter({
				icon:"sap-icon://group"
			}),
			new IconTabFilter({
				icon:"sap-icon://hint"
			}),
			new IconTabFilter({
				icon:"sap-icon://attachment",
				count:"3"
			}),
			new IconTabFilter({
				icon:"sap-icon://notes",
				count:"12"
			}),
			new IconTabFilter({
				icon:"sap-icon://group"
			}),
			new IconTabFilter({
				icon:"sap-icon://hint"
			})
			]
	}).addStyleClass("sapUiResponsiveContentPadding");

	const oIconTabBar5 = new IconTabBar("idIconTabBar1", {
		expanded: false,
		items: [
			new IconTabFilter({
				icon:"sap-icon://hint",
				iconColor:"Critical"
			}),
			new IconTabSeparator({
				icon:""
			}),
			new IconTabFilter({
				icon:"sap-icon://attachment",
				iconColor:"Neutral",
				count:"3"
			}),
			new IconTabSeparator({
				icon:"sap-icon://vertical-grip"
			}),
			new IconTabFilter({
				icon:"sap-icon://notes",
				iconColor:"Positive",
				count:"12"
			}),
			new IconTabSeparator({
				icon:"sap-icon://process"
			}),
			new IconTabFilter({
				icon:"sap-icon://group",
				iconColor:"Negative"
			}),
			new IconTabFilter({
				icon:"sap-icon://hint",
				iconColor:"Critical"
			}),
			new IconTabSeparator({
				icon:""
			}),
			new IconTabFilter({
				icon:"sap-icon://attachment",
				iconColor:"Neutral",
				count:"3"
			}),
			new IconTabSeparator({
				icon:"sap-icon://vertical-grip"
			}),
			new IconTabFilter({
				icon:"sap-icon://notes",
				iconColor:"Positive",
				count:"12"
			}),
			new IconTabSeparator({
				icon:"sap-icon://process"
			}),
			new IconTabFilter({
				icon:"sap-icon://group",
				iconColor:"Negative"
			}),
			new IconTabFilter({
				icon:"sap-icon://hint",
				iconColor:"Critical"
			}),
			new IconTabSeparator({
				icon:""
			}),
			new IconTabFilter({
				icon:"sap-icon://attachment",
				iconColor:"Neutral",
				count:"3"
			}),
			new IconTabSeparator({
				icon:"sap-icon://vertical-grip"
			}),
			new IconTabFilter({
				icon:"sap-icon://notes",
				iconColor:"Positive",
				count:"12"
			}),
			new IconTabSeparator({
				icon:"sap-icon://process"
			}),
			new IconTabFilter({
				icon:"sap-icon://group",
				iconColor:"Negative"
			}),
			new IconTabFilter({
				icon:"sap-icon://hint",
				iconColor:"Critical"
			}),
			new IconTabSeparator({
				icon:""
			}),
			new IconTabFilter({
				icon:"sap-icon://attachment",
				iconColor:"Neutral",
				count:"3"
			}),
			new IconTabSeparator({
				icon:"sap-icon://vertical-grip"
			}),
			new IconTabFilter({
				icon:"sap-icon://notes",
				iconColor:"Positive",
				count:"12"
			}),
			new IconTabSeparator({
				icon:"sap-icon://process"
			}),
			new IconTabFilter({
				icon:"sap-icon://group",
				iconColor:"Negative"
			}),
			new IconTabFilter({
				icon:"sap-icon://hint",
				iconColor:"Critical"
			}),
			new IconTabSeparator({
				icon:""
			}),
			new IconTabFilter({
				icon:"sap-icon://attachment",
				iconColor:"Neutral",
				count:"3"
			}),
			new IconTabSeparator({
				icon:"sap-icon://vertical-grip"
			}),
			new IconTabFilter({
				icon:"sap-icon://notes",
				iconColor:"Positive",
				count:"12"
			}),
			new IconTabSeparator({
				icon:"sap-icon://process"
			}),
			new IconTabFilter({
				icon:"sap-icon://group",
				iconColor:"Negative"
			})
		]
	}).addStyleClass("sapUiResponsiveContentPadding");

	const oIconTabBar6 = new IconTabBar("idIconTabBar2", {
		expanded: false,
		items: [
			new IconTabFilter({
				icon:"sap-icon://begin",
				iconColor:"Positive",
				design:"Horizontal",
				count:"53 of 123",
				text:"Confirm Ok",
				key:"Ok"
			}),
			new IconTabSeparator({
				icon:"sap-icon://open-command-field"
			}),
			new IconTabFilter({
				icon:"sap-icon://compare",
				iconColor:"Critical",
				design:"Horizontal",
				count:"51 of 123",
				text:"Check Heavy",
				key:"Heavy"
			}),
			new IconTabSeparator({
				icon:"sap-icon://open-command-field"
			}),
			new IconTabFilter({
				icon:"sap-icon://inventory",
				iconColor:"Negative",
				design:"Horizontal",
				count:"19 of 123",
				text:"Claim Overweight",
				key:"Overweight"
			}),
			new IconTabFilter({
				icon:"sap-icon://begin",
				iconColor:"Positive",
				design:"Horizontal",
				count:"53 of 123",
				text:"Confirm Ok",
				key:"Ok"
			}),
			new IconTabSeparator({
				icon:"sap-icon://open-command-field"
			}),
			new IconTabFilter({
				icon:"sap-icon://compare",
				iconColor:"Critical",
				design:"Horizontal",
				count:"51 of 123",
				text:"Check Heavy",
				key:"Heavy"
			}),
			new IconTabSeparator({
				icon:"sap-icon://open-command-field"
			}),
			new IconTabFilter({
				icon:"sap-icon://inventory",
				iconColor:"Negative",
				design:"Horizontal",
				count:"19 of 123",
				text:"Claim Overweight",
				key:"Overweight"
			}),
			new IconTabFilter({
				icon:"sap-icon://begin",
				iconColor:"Positive",
				design:"Horizontal",
				count:"53 of 123",
				text:"Confirm Ok",
				key:"Ok"
			}),
			new IconTabSeparator({
				icon:"sap-icon://open-command-field"
			}),
			new IconTabFilter({
				icon:"sap-icon://compare",
				iconColor:"Critical",
				design:"Horizontal",
				count:"51 of 123",
				text:"Check Heavy",
				key:"Heavy"
			}),
			new IconTabSeparator({
				icon:"sap-icon://open-command-field"
			}),
			new IconTabFilter({
				icon:"sap-icon://inventory",
				iconColor:"Negative",
				design:"Horizontal",
				count:"19 of 123",
				text:"Claim Overweight",
				key:"Overweight"
			}),
			new IconTabFilter({
				icon:"sap-icon://begin",
				iconColor:"Positive",
				design:"Horizontal",
				count:"53 of 123",
				text:"Confirm Ok",
				key:"Ok"
			}),
			new IconTabSeparator({
				icon:"sap-icon://open-command-field"
			}),
			new IconTabFilter({
				icon:"sap-icon://compare",
				iconColor:"Critical",
				design:"Horizontal",
				count:"51 of 123",
				text:"Check Heavy",
				key:"Heavy"
			}),
			new IconTabSeparator({
				icon:"sap-icon://open-command-field"
			}),
			new IconTabFilter({
				icon:"sap-icon://inventory",
				iconColor:"Negative",
				design:"Horizontal",
				count:"19 of 123",
				text:"Claim Overweight",
				key:"Overweight"
			})
		]
	}).addStyleClass("sapUiResponsiveContentPadding");

	const oIconTabBar7 = new IconTabBar("idIconTabBar5", {
		expanded: false,
		items: [
			new IconTabFilter({
				showAll: true,
				count:"123",
				text:"Products",
				key:"All"
			}),
			new IconTabSeparator(),
			new IconTabFilter({
				icon:"sap-icon://begin",
				iconColor:"Positive",
				count:"53",
				text:"Ok",
				key:"Ok"
			}),
			new IconTabFilter({
				icon:"sap-icon://compare",
				iconColor:"Critical",
				count:"51",
				text:"Heavy",
				key:"Heavy"
			}),
			new IconTabFilter({
				icon:"sap-icon://inventory",
				iconColor:"Negative",
				count:"19",
				text:"Overweight",
				key:"Overweight"
			}),
			new IconTabFilter({
				showAll: true,
				count:"123",
				text:"Products",
				key:"All"
			}),
			new IconTabSeparator(),
			new IconTabFilter({
				icon:"sap-icon://begin",
				iconColor:"Positive",
				count:"53",
				text:"Ok",
				key:"Ok"
			}),
			new IconTabFilter({
				icon:"sap-icon://compare",
				iconColor:"Critical",
				count:"51",
				text:"Heavy",
				key:"Heavy"
			}),
			new IconTabFilter({
				icon:"sap-icon://inventory",
				iconColor:"Negative",
				count:"19",
				text:"Overweight",
				key:"Overweight"
			}),
			new IconTabFilter({
				showAll: true,
				count:"123",
				text:"Products",
				key:"All"
			}),
			new IconTabSeparator(),
			new IconTabFilter({
				icon:"sap-icon://begin",
				iconColor:"Positive",
				count:"53",
				text:"Ok",
				key:"Ok"
			}),
			new IconTabFilter({
				icon:"sap-icon://compare",
				iconColor:"Critical",
				count:"51",
				text:"Heavy",
				key:"Heavy"
			}),
			new IconTabFilter({
				icon:"sap-icon://inventory",
				iconColor:"Negative",
				count:"19",
				text:"Overweight",
				key:"Overweight"
			}),
			new IconTabFilter({
				showAll: true,
				count:"123",
				text:"Products",
				key:"All"
			}),
			new IconTabSeparator(),
			new IconTabFilter({
				icon:"sap-icon://begin",
				iconColor:"Positive",
				count:"53",
				text:"Ok",
				key:"Ok"
			}),
			new IconTabFilter({
				icon:"sap-icon://compare",
				iconColor:"Critical",
				count:"51",
				text:"Heavy",
				key:"Heavy"
			}),
			new IconTabFilter({
				icon:"sap-icon://inventory",
				iconColor:"Negative",
				count:"19",
				text:"Overweight",
				key:"Overweight"
			})
		]
	}).addStyleClass("sapUiResponsiveContentPadding");

	const oApp = new App("myApp",{});
	const oPanel = new Panel({
		content: [oIconTabBar,
				oIconTabBar1,
				oIconTabBar2,
				oIconTabBar3,
				oIconTabBar4,
				oIconTabBar5,
				oIconTabBar6,
				oIconTabBar7
		]
	}).addStyleClass("max-width");
	const oPage = new Page({
		showHeader: false,
		content: [oPanel]
	});
	oApp.addPage(oPage).placeAt("content");
});