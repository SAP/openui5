sap.ui.define([
	"sap/ui/test/generic/GenericTestCollection"
], function(GenericTestCollection) {
	"use strict";

	var oConfig = GenericTestCollection.createTestsuiteConfig({
		library: "sap.m",
		objectCapabilities: {
			"sap.m.FacetFilterItem": {
				rendererHasDependencies: true // render issues because expecting fn getWordWrap on parent control
			},
			"sap.m.IconTabBarSelectList": {
				rendererHasDependencies: true // render issues because expecting IconTabHeader as parent control
			},
			"sap.m.LightBox": {
				rendererHasDependencies: true // render issues because expecting aggregation ImageContent filled
			},
			"sap.m.PlanningCalendar": {
				properties: {
					builtInViews: "Hour",
					viewKey: "Hour"
				},
				aggregations: {
					specialDates: GenericTestCollection.ExcludeReason.SetterNeedsSpecificSettings,
					views: GenericTestCollection.ExcludeReason.SetterNeedsSpecificSettings
				}
			},
			"sap.m.internal.ObjectMarkerCustomText": {
				moduleName: "sap/m/ObjectMarker"
			},
			"sap.m.internal.ObjectMarkerCustomLink": {
				moduleName: "sap/m/ObjectMarker"
			},
			"sap.m.HeaderContainerItemContainer": {
				moduleName: "sap/m/HeaderContainer"
			},
			"sap.m._overflowToolbarHelpers.OverflowToolbarAssociativePopover": {
				moduleName: "sap/m/OverflowToolbarAssociativePopover"
			},
			"sap.m.internal.TabStripSelect": {
				moduleName: "sap/m/TabStrip"
			},
			"sap.m.internal.TabStripSelectList": {
				moduleName: "sap/m/TabStrip"
			},
			"sap.m.internal.ToggleSpinButton": {
				moduleName: "sap/m/TimePickerClocks"
			},
			"sap.m.upload.DynamicItemContent": {
				moduleName: "sap/m/upload/UploadSetItem",
				rendererHasDependencies: true
			},
			"sap.m.SinglePlanningCalendarMonthGrid._internal.IntervalPlaceholder": {
				moduleName: "sap/m/SinglePlanningCalendarMonthGrid"
			},
			"sap.m.SinglePlanningCalendarGrid._internal.IntervalPlaceholder": {
				moduleName: "sap/m/SinglePlanningCalendarMonthGrid"
			},
			"sap.m.internal.DateTimePickerPopup": {
				moduleName: "sap/m/DateTimePicker"
			},
			"sap.m._PlanningCalendarRowHeader": {
				moduleName: "sap/m/PlanningCalendar"
			},
			"sap.m._PlanningCalendarRowTimeline": {
				moduleName: "sap/m/PlanningCalendar",
				rendererHasDependencies: true
			},
			"sap.m._PlanningCalendarInternalHeader": {
				moduleName: "sap/m/PlanningCalendar"
			},
			"sap.m._PlanningCalendarIntervalPlaceholder": {
				moduleName: "sap/m/PlanningCalendar",
				apiVersion: 1
			},
			"sap.m.internal.PlanningCalendarRowListItem": {
				moduleName: "sap/m/PlanningCalendar"
			},
			"sap.m.internal.DynamicDateRangeInput": {
				moduleName: "sap/m/DynamicDateRange",
				rendererHasDependencies: true
			},
			"sap.m.DynamicDateRangeListItem": {
				moduleName: "sap/m/DynamicDateRange"
			},
			"sap.m.SelectionDetailsListItem": {
				moduleName: "sap/m/SelectionDetailsItem"
			},
			"sap.m.TablePopin": {
				moduleName: "sap/m/ColumnListItem"
			}
		}
	});

	return oConfig;
});