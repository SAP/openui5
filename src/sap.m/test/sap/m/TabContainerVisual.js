// Note: the HTML page 'TabContainerVisual.html' loads this module via data-sap-ui-on-init

sap.ui.define([
	"sap/m/App",
	"sap/m/Page",
	"sap/m/Panel",
	"sap/ui/Device",
	"sap/m/TabContainer",
	"sap/m/TabContainerItem"
],
function(
	App,
	Page,
	Panel,
	Device,
	TabContainer,
	TabContainerItem
) {
	"use strict";
	Device.system.phone = true;
	Device.system.desktop = false;
	document.querySelector("html").classList.add("sap-phone");
	document.querySelector("html").classList.remove("sap-desktop");

	var oApp = new App();
	oApp.addPage(new Page({
		title: "sap.m.TabContainer visual test page",
		content: [
			new Panel({
				headerText: "One tab present",
				content: [
					new TabContainer("one", {
						items: [
							new TabContainerItem({
								name: "Tab one",
								additionalText: "Tab one"
							})
						]
					})
				]
			}),

			new Panel({
				headerText: "Add new button",
				content: [
					new TabContainer("two", {
						showAddNewButton: true,
						items: [
							new TabContainerItem({
								name: "Tab one",
								additionalText: "Tab one"
							})
						]
					})
				]
			}),

			new Panel({
				headerText: "More than one tab present",
				content: [
					new TabContainer("three", {
						items: [
							new TabContainerItem({
								name: "Tab one",
								additionalText: "Tab one"
							}),
							new TabContainerItem({
								name: "Tab two",
								additionalText: "Tab two"
							})
						]
					})
				]
			}),

			new Panel({
				headerText: "Add new button and more than one tab present",
				content: [
					new TabContainer("four", {
						showAddNewButton: true,
						items: [
							new TabContainerItem({
								name: "Tab one",
								additionalText: "Tab one"
							}),
							new TabContainerItem({
								name: "Tab two",
								additionalText: "Tab two"
							})
						]
					})
				]
			})
		]
	}))

	oApp.placeAt("body");
});