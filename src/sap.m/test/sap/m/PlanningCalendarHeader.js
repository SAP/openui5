// Note: the HTML page 'PlanningCalendarHeader.html' loads this module via data-sap-ui-on-init

var oPCHeader;
sap.ui.define([
	'sap/m/PlanningCalendarHeader',
	'sap/m/Button',
	'sap/m/SegmentedButton',
	'sap/m/App',
	 'sap/m/Page'
],
function (PlanningCalendarHeader, Button, SegmentedButton, App, Page) {
	"use strict";
	oPCHeader = new PlanningCalendarHeader("PlanningCalendarHeader",{
		pickerText: "Picker text",
		actions: [
			new SegmentedButton('ViewSwitch1', {
				buttons: [
					new Button({
						text: "Days"
					}),
					new Button({
						text: "Week"
					}),
					new Button({
						text: "Months"
					})
				]}
			),
			new Button("firstButton", {
				text: "hello world"
			}),
			new Button("firstButton1", {
				text: "hello world"
			}),
			new Button("firstButton2", {
				text: "hello world"
			})
		],
		pressPrevious: function () {
			console.log("Previous pressed!");
		},
		pressToday: function () {
			console.log("Today pressed!");
		},
		pressNext: function () {
			console.log("Next pressed!");
		},
		dateSelect: function () {
			console.log("Date selected!");
		}
	});
	new App({
		pages: new Page({
			title: "PlanningCalendarHeader test page",
			content: oPCHeader
		})
	}).placeAt("body");
});