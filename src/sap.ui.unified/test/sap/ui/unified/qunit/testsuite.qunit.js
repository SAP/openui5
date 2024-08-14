sap.ui.define(function() {

	"use strict";

	return {
		name: "Library 'sap.ui.unified'",	/* Just for a nice title on the pages */
		defaults: {
			group: "Library",
			qunit: {
				version: 2					// Whether QUnit should be loaded and if so, what version
			},
			sinon: {
				version: 4					// Whether Sinon should be loaded and if so, what version
			},
			ui5: {
				language: "en-US",
				rtl: false,					// Whether to run the tests in RTL mode
				libs: ["sap.ui.unified"],	// Libraries to load upfront in addition to the library which is tested (sap.ui.unified), if null no libs are loaded
				"xx-waitForTheme": "init"	// Whether the start of the test should be delayed until the theme is applied
			},
			coverage: {
				only:	"[sap/ui/unified]",	// Which files to show in the coverage report, if null, no files are excluded from coverage
				branchCoverage: true		// Whether to enable standard branch coverage
			},
			loader: {
				paths: {
					"sap/ui/demo/mock": "test-resources/sap/ui/documentation/sdk/"
				}
			},
			page: "test-resources/sap/ui/unified/qunit/teststarter.qunit.html?test={name}",
			autostart: true					// Whether to call QUnit.start() when the test setup is done
		},
		tests: {
			"Calendar": {
				group: "Calendar",
				qunit: {
					reorder: false
				},
				coverage: {
					only: ["sap/ui/unified/Calendar"]
				}
			},

			"CalendarRow": {
				group: "Calendar",
				qunit: {
					reorder: false
				},
				coverage: {
					only: ["sap/ui/unified/CalendarRow"]
				}
			},

			"CalendarDateInterval": {
				group: "Calendar",
				ui5: {
					theme: "sap_horizon"
				},

				qunit: {
					reorder: false
				},
				coverage: {
					only: ["sap/ui/unified/CalendarDateInterval"]
				}
			},

			"CalendarMonthInterval": {
				group: "Calendar",
				qunit: {
					reorder: false
				},
				sinon: {
					sinon: 1,
					useFakeTimers: true
				},
				coverage: {
					only: ["sap/ui/unified/CalendarMonthInterval"]
				}
			},

			"CalendarOneMonthInterval": {
				group: "Calendar",
				qunit: {
					reorder: false
				},
				coverage: {
					only: ["sap/ui/unified/CalendarOneMonthInterval"]
				}
			},

			"CalendarWeekInterval": {
				group: "Calendar",
				qunit: {
					reorder: false
				},
				coverage: {
					only: ["sap/ui/unified/CalendarWeekInterval"]
				}
			},

			"CalendarTimeInterval": {
				group: "Calendar",
				qunit: {
					reorder: false
				},
				coverage: {
					only: ["sap/ui/unified/CalendarTimeInterval"]
				}
			},

			"CalendarDate": {
				group: "Calendar",
				qunit: {
					reorder: false
				},
				coverage: {
					only: ["sap/ui/unified/calendar/CalendarDate"]
				}
			},

			"Calendar_Islamic": {
				group: "Calendar",
				ui5: {
					calendarType: "islamic"
				},
				coverage: {
					only: ["sap/ui/unified/Calendar_Islamic"]
				}
			},

			"Calendar_Japanese": {
				group: "Calendar",
				ui5: {
					calendarType: "Japanese"
				},
				coverage: {
					only: ["sap/ui/unified/Calendar_Japanese"]
				}
			},

			"CalendarLegend": {
				group: "Calendar",
				coverage: {
					only: ["sap/ui/unified/CalendarLegend"]
				}
			},

			"CalendarUtils": {
				group: "Calendar",
				coverage: {
					only: ["sap/ui/unified/calendar/CalendarUtils"]
				}
			},

			"Month": {
				group: "Calendar",
				coverage: {
					only: ["sap/ui/unified/calendar/Month"]
				}
			},

			"FileUploader": {
				group: "FileUploader",
				ui5: {
					libs: ["sap.ui.unified", "sap.m"]
				},
				coverage: {
					only: ["sap/ui/unified/FileUploader"]
				}
			},

			"Header": {
				group: "Header",
				sinon: {
					version: 1 // sinon-qunit-bridge does not supported nested tests
				},
				coverage: {
					only: ["sap/ui/unified/Header"]
				}
			},

			"ColorPicker": {
				group: "ColorPicker",
				coverage: {
					only: ["sap/ui/unified/ColorPicker"]
				}
			},

			"ColorPickerPopover": {
				group: "ColorPickerPopover",
				coverage: {
					only: ["sap/ui/unified/ColorPickerPopover"]
				}
			},

			"Currency": {
				group: "Currency",
				coverage: {
					only: ["sap/ui/unified/Currency"]
				}
			},

			"Menu": {
				group: "Menu",
				qunit: {
					reorder: false
				},
				coverage: {
					only: ["sap/ui/unified/Menu"]
				}
			},

			"MenuItem": {
				group: "Menu",
				qunit: {
					reorder: false
				},
				coverage: {
					only: ["sap/ui/unified/MenuItem"]
				}
			},

			"MonthPicker": {
				group: "Calendar",
				qunit: {
					reorder: false
				},
				coverage: {
					only: ["sap/ui/unified/calendar/MonthPicker"]
				}
			},

			"NonWorkingPeriod":{
				group: "NonWorkingPeriod",
				qunit: {
					reorder: false
				},
				coverage: {
					only: ["sap/ui/unified/NonWorkingPeriod"]
				}
			},

			"RecurringNonWorkingPeriod":{
				group: "RecurringNonWorkingPeriod",
				qunit: {
					reorder: false
				},
				coverage: {
					only: ["sap/ui/unified/RecurringNonWorkingPeriod"]
				}
			},

			"TimeRange":{
				group: "TimeRange",
				qunit: {
					reorder: false
				},
				coverage: {
					only: ["sap/ui/unified/TimesRange"]
				}
			},

			"TimesRow":{
				group: "Calendar",
				qunit: {
					reorder: false
				},
				coverage: {
					only: ["sap/ui/unified/calendar/TimesRow"]
				}
			},

			"YearPicker": {
				group: "Calendar",
				qunit: {
					reorder: false
				},
				coverage: {
					only: ["sap/ui/unified/calendar/YearPicker"]
				}
			},

			"IndexPicker": {
				group: "Calendar",
				qunit: {
					reorder: false
				},
				coverage: {
					only: ["sap/ui/unified/calendar/IndexPicker"]
				}
			},

			"ExploredSamples": {
				loader: {
					map: {
						"*": {
							"sap/ui/thirdparty/sinon": "sap/ui/thirdparty/sinon-4",
							"sap/ui/thirdparty/sinon-qunit": "sap/ui/qunit/sinon-qunit-bridge"
						}
					}
				},
				runAfterLoader: "sap/ui/demo/mock/qunit/SampleTesterErrorHandler",
				ui5: {
					libs: ["sap.ui.unified", "sap.ui.documentation", "sap.ui.layout", "sap.m"],
					"xx-componentPreload": "off"
				},
				autostart: false
			},

			"Generic Testsuite": {
				page: "test-resources/sap/ui/unified/qunit/testsuite.generic.qunit.html"
			},

			// Design Time & RTA Enabling
			"Designtime-Library": {
				group: "Designtime",
				module: "./designtime/Library.qunit"
			}
		}
	};
});