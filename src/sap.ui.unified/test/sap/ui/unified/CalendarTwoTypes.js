sap.ui.define([
	"sap/base/i18n/Localization",
	"sap/ui/core/library",
	"sap/ui/unified/library",
	"sap/m/App",
	"sap/m/FlexBox",
	"sap/m/Page",
	"sap/ui/unified/Calendar",
	"sap/ui/core/date/UI5Date"
], function(
	Localization,
	coreLibrary,
	unifiedLibrary,
	App,
	FlexBox,
	Page,
	Calendar,
	UI5Date
) {
	"use strict";
	var CalendarType = coreLibrary.CalendarType,
		DateRange = unifiedLibrary.DateRange;

	Localization.setLanguage("en-US");

	new App("myApp", {
		pages: new Page({
			title: "Calendar",
			content : [
				new FlexBox({
					items: [
						new Calendar("Cal-Gregorian-Islamic", {
							secondaryCalendarType: CalendarType.Islamic,
							selectedDates: [
								new DateRange({
									startDate: UI5Date.getInstance(2015, 0, 2)
								})
							]
						}).addStyleClass("sapUiTinyMargin"),
						new Calendar("Cal-Persian-Japanese", {
							primaryCalendarType: CalendarType.Persian,
							secondaryCalendarType: CalendarType.Japanese,
							selectedDates: [
								new DateRange({
									startDate: UI5Date.getInstance(2015, 0, 2)
								})
							]
						}).addStyleClass("sapUiTinyMargin"),
						new Calendar("Cal-Gregorian-Buddhist", {
							secondaryCalendarType: CalendarType.Buddhist,
							months: 2,
							selectedDates: [
								new DateRange({
									startDate: UI5Date.getInstance(2015, 0, 2)
								})
							]
						}).addStyleClass("sapUiTinyMargin")
					]
				})
			]
		})
	}).placeAt("body");

});