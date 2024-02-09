sap.ui.define([
	'sap/m/IconTabFilter',
	'sap/m/Text',
	"sap/m/IconTabHeader",
	"sap/m/App",
	"sap/m/Page",
	"sap/m/Panel",
	"sap/m/IconTabSeparator",
	"sap/m/IconTabBar"
], function (
	IconTabFilter,
	Text,
	IconTabHeader,
	App,
	Page,
	Panel,
	IconTabSeparator,
	IconTabBar
	) {
	"use strict";

	const oIconTabHeader = new IconTabHeader("idIconTabHeader0",{}).addStyleClass("sapUiResponsiveContentPadding");
		for (var i = 1; i <= 30; i++) {
			const oIconTabFilter = new IconTabFilter({
				text: 'Tab ' + i,
				content: new Text({
					text: 'Content ' + i
				})
			});

			oIconTabHeader.addItem(oIconTabFilter);
		}


	const oIconTabHeader1 = new IconTabBar({
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

	const oIconTabHeader2 = new IconTabBar("idIconTabHeader6", {
		mode: "Inline",
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

	const oIconTabHeader3 = new IconTabBar("idIconTabHeader7", {
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

	const oIconTabHeader4 = new IconTabBar("idIconTabHeader4", {
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

	const oIconTabHeader5 = new IconTabBar("idIconTabHeader1", {
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

	const oIconTabHeader6 = new IconTabBar("idIconTabHeader2", {
		items: [
			new IconTabFilter({
				icon:"sap-icon://begin",
				iconColor:"Positive",
				count:"53",
				text:"Ok",
				key:"Ok"
			}),
			new IconTabSeparator({
				icon:"sap-icon://open-command-field"
			}),
			new IconTabFilter({
				icon:"sap-icon://compare",
				iconColor:"Critical",
				count:"51",
				text:"Heavy",
				key:"Heavy"
			}),
			new IconTabSeparator({
				icon:"sap-icon://open-command-field"
			}),
			new IconTabFilter({
				icon:"sap-icon://inventory",
				iconColor:"Negative",
				count:"19",
				text:"Overweight",
				key:"Overweight"
			}),
			new IconTabSeparator({
				icon:"sap-icon://open-command-field"
			}),
			new IconTabFilter({
				icon:"sap-icon://begin",
				iconColor:"Positive",
				count:"53",
				text:"Ok",
				key:"Ok"
			}),
			new IconTabSeparator({
				icon:"sap-icon://open-command-field"
			}),
			new IconTabFilter({
				icon:"sap-icon://compare",
				iconColor:"Critical",
				count:"51",
				text:"Heavy",
				key:"Heavy"
			}),
			new IconTabSeparator({
				icon:"sap-icon://open-command-field"
			}),
			new IconTabFilter({
				icon:"sap-icon://inventory",
				iconColor:"Negative",
				count:"19",
				text:"Overweight",
				key:"Overweight"
			}),
			new IconTabSeparator({
				icon:"sap-icon://open-command-field"
			}),
			new IconTabFilter({
				icon:"sap-icon://begin",
				iconColor:"Positive",
				count:"53",
				text:"Ok",
				key:"Ok"
			}),
			new IconTabSeparator({
				icon:"sap-icon://open-command-field"
			}),
			new IconTabFilter({
				icon:"sap-icon://compare",
				iconColor:"Critical",
				count:"51",
				text:"Heavy",
				key:"Heavy"
			}),
			new IconTabSeparator({
				icon:"sap-icon://open-command-field"
			}),
			new IconTabFilter({
				icon:"sap-icon://inventory",
				iconColor:"Negative",
				count:"19",
				text:"Overweight",
				key:"Overweight"
			}),
			new IconTabSeparator({
				icon:"sap-icon://open-command-field"
			}),
			new IconTabFilter({
				icon:"sap-icon://begin",
				iconColor:"Positive",
				count:"53",
				text:"Ok",
				key:"Ok"
			}),
			new IconTabSeparator({
				icon:"sap-icon://open-command-field"
			}),
			new IconTabFilter({
				icon:"sap-icon://compare",
				iconColor:"Critical",
				count:"51",
				text:"Heavy",
				key:"Heavy"
			}),
			new IconTabSeparator({
				icon:"sap-icon://open-command-field"
			}),
			new IconTabFilter({
				icon:"sap-icon://inventory",
				iconColor:"Negative",
				count:"19",
				text:"Overweight",
				key:"Overweight"
			}),
			new IconTabSeparator({
				icon:"sap-icon://open-command-field"
			}),
			new IconTabFilter({
				icon:"sap-icon://begin",
				iconColor:"Positive",
				count:"53",
				text:"Ok",
				key:"Ok"
			}),
			new IconTabSeparator({
				icon:"sap-icon://open-command-field"
			}),
			new IconTabFilter({
				icon:"sap-icon://compare",
				iconColor:"Critical",
				count:"51",
				text:"Heavy",
				key:"Heavy"
			}),
			new IconTabSeparator({
				icon:"sap-icon://open-command-field"
			}),
			new IconTabFilter({
				icon:"sap-icon://inventory",
				iconColor:"Negative",
				count:"19",
				text:"Overweight",
				key:"Overweight"
			}),
			new IconTabSeparator({
				icon:"sap-icon://open-command-field"
			})
		]
	}).addStyleClass("sapUiResponsiveContentPadding");

	const oIconTabHeader7 = new IconTabBar("idIconTabHeader5", {
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
		content: [oIconTabHeader,
				oIconTabHeader1,
				oIconTabHeader2,
				oIconTabHeader3,
				oIconTabHeader4,
				oIconTabHeader5,
				oIconTabHeader6,
				oIconTabHeader7
		]
	}).addStyleClass("max-width");
	const oPage = new Page({
		showHeader: false,
		content: [oPanel]
	});
	oApp.addPage(oPage).placeAt("content");
});