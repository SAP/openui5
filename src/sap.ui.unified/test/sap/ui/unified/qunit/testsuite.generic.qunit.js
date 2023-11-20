sap.ui.define([
	"sap/ui/test/generic/GenericTestCollection"
], function(GenericTestCollection) {
	"use strict";

	var oConfig = GenericTestCollection.createTestsuiteConfig({
		library: "sap.ui.unified",
		objectCapabilities: {
			"sap.ui.unified.ContentSwitcher": {
				apiVersion: 1 // deprecated
			},
			"sap.ui.unified.Shell": {
				apiVersion: 1 // deprecated
			},
			"sap.ui.unified.ShellHeader": {
				apiVersion: 1 // deprecated
			},
			"sap.ui.unified.ShellLayout": {
				apiVersion: 1 // deprecated
			},
			"sap.ui.unified.ShellOverlay": {
				apiVersion: 1 // deprecated
			},
			"sap.ui.unified.SplitContainer": {
				apiVersion: 1 // deprecated
			},
			"sap.ui.unified.calendar.TimesRow": {
				aggregations: {
					specialDates: GenericTestCollection.ExcludeReason.SetterNeedsSpecificSettings,
					selectedDates: GenericTestCollection.ExcludeReason.SetterNeedsSpecificSettings
				}
			},
			"sap.ui.unified.CalendarTimeInterval": {
				aggregations: {
					specialDates: GenericTestCollection.ExcludeReason.SetterNeedsSpecificSettings,
					selectedDates: GenericTestCollection.ExcludeReason.SetterNeedsSpecificSettings
				}
			},
			"sap.ui.unified.CalendarRow": {
				aggregations: {
					appointments: GenericTestCollection.ExcludeReason.SetterNeedsSpecificSettings,
					intervalHeaders: GenericTestCollection.ExcludeReason.SetterNeedsSpecificSettings
				}
			},
			"sap.ui.unified.internal.CustomYearPicker": {
				moduleName: "sap/ui/unified/calendar/CustomYearPicker"
			},
			"sap.ui.unified._ColorPickerBox": {
				moduleName: "sap/ui/unified/ColorPicker"
			}
		}
	});

	return oConfig;
});