sap.ui.define([
	"sap/ui/Device"
], function(Device) {

	"use strict";
	return {
		name: "QUnit TestSuite for sap.m",
		defaults: {
			bootCore: true,
			ui5: {
				libs: "sap.m",
				theme: "sap_belize",
				noConflict: true,
				preload: "auto",
				"xx-waitForTheme": "init"
			},
			qunit: {
				version: 1,
				reorder: false
			},
			sinon: {
				version: 1,
				qunitBridge: true,
				useFakeTimers: false
			},
			module: "./{name}.qunit"
		},
		tests: {
			ComboBox: {
				title: "Test Page for sap.m.ComboBox",
				_alternativeTitle: "QUnit tests: sap.m.ComboBox",
				ui5: {
					libs: "sap.m, sap.ui.layout",
					language: "en"
				},
				sinon: {
					useFakeTimers: true
				}
			},
			DatePicker: {
				title: "DatePicker - sap.m",
				_alternativeTitle: "QUnit tests: sap.m.DatePicker",
				qunit: {
					// one test checks a module for not being loaded, another checks it for being loaded
					// -> order of tests is significant!
					reorder: false
				},
				ui5: {
					language: "en-US"
				}
			},
			DateRangeSelection: {
				title: "DateRangeSelection - sap.m",
				_alternativeTitle: "QUnit tests: sap.m.DateRangeSelection",
				ui5: {
					language: "en-US"
				}
			},
			DateTimeField: {
				title: "DateTimeField - sap.m",
				_alternativeTitle: "QUnit tests: sap.m.DatePicker",
				ui5: {
					language: "en-US"
				},
				qunit: {
					version: 2
				}
			},
			DateTimeInput: {
				title: "Test Page for sap.m.DateTimeInput",
				_alternativeTitle: "QUnit page for sap.m.DateTimeInput",
				ui5: {
					language: "en-US"
				},
				sinon: {
					useFakeTimers: true
				}
			},
			DateTimePicker: {
				title: "DatePicker - sap.m",
				_alternativeTitle: "QUnit tests: sap.m.DateTimePicker",
				ui5: {
					language: "en-US"
				}
			},
			FeedInput: {
				title: "Test Page for sap.m.FeedInput",
				qunit: {
					version: 2
				},
				sinon: {
					version: 4
				},
				coverage: {
					only: "//sap\/m\/FeedInput.*/"
				}
			},
			Input: {
				title: "QUnit page for sap.m.Input",
				sinon: {
					useFakeTimers: true
				}
			},
			InputBase: {
				title: "QUnit tests: sap.m.InputBase",
				sinon: {
					useFakeTimers: true
				}
			},
			MaskInput: {
				title: "Test Page for sap.m.MaskInput",
				_alternativeTitle: "QUnit page for sap.m.MaskInput",
				ui5: {
					language: "en-US",
					bindingSyntax: "simle"
				},
				sinon: {
					useFakeTimers: true
				}
			},
			MultiComboBox: {
				title: "QUnit tests: sap.m.MultiComboBox",
				sinon: {
					useFakeTimers: true
				}
			},
			MultiInput: {
				title: "QUnit page for sap.m.MultiInput",
				sinon: {
					useFakeTimers: true
				}
			},
			StepInput: {
				title: "QUnit Page for sap.m.StepInput",
				sinon: {
					useFakeTimers: true
				}
			},
			SuggestionsPopover: {
				title: "QUnit Page for sap.m.SuggestionsPopover",
				ui5: {
					compatVersion: "1.65"
				},
				qunit: {
					version: 2
				},
				coverage: {
					only: [
						"sap/m/SuggestionsPopover"
					]
				}
			},
			TextArea: {
				title: "Test Page for sap.m.TextArea",
				_alternativeTitle: "QUnit page for sap.m.TextArea",
				sinon: {
					useFakeTimers: true
				}
			},
			TimePicker: {
				title: "Test Page for sap.m.TimePicker",
				_alternativeTitle: "QUnit page for sap.m.TimePicker",
				ui5: {
					language: "en-US"
				}
			},
			Token: {
				title: "Test Page for sap.m.Token",
				_alternativeTitle: "QUnit page for sap.m.Token"
			},
			Tokenizer: {
				title: "Test Page for sap.m.Tokenizer",
				_alternativeTitle: "QUnit page for sap.m.Tokenizer"
			},
			ValueStateMessage: {
				title: "Test page for sap.m.delegate.ValueStateMessage",
				_alternativeTitle: "QUnit tests for sap.m.delegate.ValueStateMessage",
				sinon: {
					useFakeTimers: true
				}
			}
		}
	};
});
