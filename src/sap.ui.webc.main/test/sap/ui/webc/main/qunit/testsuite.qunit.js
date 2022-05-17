sap.ui.define(function() {
	"use strict";
	return {
		name: "QUnit TestSuite for sap.ui.webc.main",
		defaults: {
			group: "Default",
			qunit: {
				version: "edge"
			},
			sinon: {
				version: 4
			},
			ui5: {
				language: "en",
				rtl: false,
				libs: ["sap.ui.webc.main"],
				"xx-waitForTheme": true
			},
			coverage: {
				only: ["sap/ui/webc/main"]
			},
			loader: {
				paths: {
					"sap/ui/demo/mock": "test-resources/sap/ui/documentation/sdk/",
					"qunit": "test-resources/sap/ui/webc/main/qunit/"
				}
			},
			runAfterLoader: "qunit/ResizeObserverErrorHandler",
			page: "test-resources/sap/ui/webc/main/qunit/testsandbox.qunit.html?test={name}",
			autostart: true
		},
		tests: {

			"Avatar": {
				coverage: {
					only: ["sap/ui/webc/main/Avatar"]
				}
			},

			"AvatarGroup": {
				coverage: {
					only: ["sap/ui/webc/main/AvatarGroup"]
				}
			},

			"Badge": {
				coverage: {
					only: ["sap/ui/webc/main/Badge"]
				}
			},

			"Breadcrumbs": {
				coverage: {
					only: ["sap/ui/webc/main/Breadcrumbs"]
				}
			},

			"BusyIndicator": {
				coverage: {
					only: ["sap/ui/webc/main/BusyIndicator"]
				}
			},

			"Button": {
				coverage: {
					only: ["sap/ui/webc/main/Button"]
				}
			},

			"Calendar": {
				coverage: {
					only: ["sap/ui/webc/main/Calendar"]
				}
			},

			"Card": {
				coverage: {
					only: ["sap/ui/webc/main/Card"]
				}
			},

			"CardHeader": {
				coverage: {
					only: ["sap/ui/webc/main/CardHeader"]
				}
			},

			"Carousel": {
				coverage: {
					only: ["sap/ui/webc/main/Carousel"]
				}
			},

			"CheckBox": {
				coverage: {
					only: ["sap/ui/webc/main/CheckBox"]
				}
			},

			"ColorPalette": {
				coverage: {
					only: ["sap/ui/webc/main/ColorPalette"]
				}
			},

			"ColorPicker": {
				coverage: {
					only: ["sap/ui/webc/main/ColorPicker"]
				}
			},

			"ComboBox": {
				coverage: {
					only: ["sap/ui/webc/main/ComboBox"]
				}
			},

			"DatePicker": {
				coverage: {
					only: ["sap/ui/webc/main/DatePicker"]
				}
			},

			"DateRangePicker": {
				coverage: {
					only: ["sap/ui/webc/main/DateRangePicker"]
				}
			},

			"DateTimePicker": {
				coverage: {
					only: ["sap/ui/webc/main/DateTimePicker"]
				}
			},

			"Dialog": {
				coverage: {
					only: ["sap/ui/webc/main/Dialog"]
				}
			},

			"FileUploader": {
				coverage: {
					only: ["sap/ui/webc/main/FileUploader"]
				}
			},

			"Icon": {
				coverage: {
					only: ["sap/ui/webc/main/Icon"]
				}
			},

			"Input": {
				coverage: {
					only: ["sap/ui/webc/main/Input"]
				}
			},

			"Label": {
				coverage: {
					only: ["sap/ui/webc/main/Label"]
				}
			},

			"Link": {
				coverage: {
					only: ["sap/ui/webc/main/Link"]
				}
			},

			"List": {
				coverage: {
					only: ["sap/ui/webc/main/List"]
				}
			},

			"MessageStrip": {
				coverage: {
					only: ["sap/ui/webc/main/MessageStrip"]
				}
			},

			"MultiComboBox": {
				coverage: {
					only: ["sap/ui/webc/main/MultiComboBox"]
				}
			},

			"MultiInput": {
				coverage: {
					only: ["sap/ui/webc/main/MultiInput"]
				}
			},

			"Panel": {
				coverage: {
					only: ["sap/ui/webc/main/Panel"]
				}
			},

			"Popover": {
				coverage: {
					only: ["sap/ui/webc/main/Popover"]
				}
			},

			"ProgressIndicator": {
				coverage: {
					only: ["sap/ui/webc/main/ProgressIndicator"]
				}
			},

			"RadioButton": {
				coverage: {
					only: ["sap/ui/webc/main/RadioButton"]
				}
			},

			"RangeSlider": {
				coverage: {
					only: ["sap/ui/webc/main/RangeSlider"]
				}
			},

			"RatingIndicator": {
				coverage: {
					only: ["sap/ui/webc/main/RatingIndicator"]
				}
			},

			"ResponsivePopover": {
				coverage: {
					only: ["sap/ui/webc/main/ResponsivePopover"]
				}
			},

			"SegmentedButton": {
				coverage: {
					only: ["sap/ui/webc/main/SegmentedButton"]
				}
			},

			"Select": {
				coverage: {
					only: ["sap/ui/webc/main/Select"]
				}
			},

			"Slider": {
				coverage: {
					only: ["sap/ui/webc/main/Slider"]
				}
			},

			"StepInput": {
				coverage: {
					only: ["sap/ui/webc/main/StepInput"]
				}
			},

			"Switch": {
				coverage: {
					only: ["sap/ui/webc/main/Switch"]
				}
			},

			"TabContainer": {
				coverage: {
					only: ["sap/ui/webc/main/TabContainer"]
				}
			},

			"Table": {
				coverage: {
					only: ["sap/ui/webc/main/Table"]
				}
			},

			"TextArea": {
				coverage: {
					only: ["sap/ui/webc/main/TextArea"]
				}
			},

			"TimePicker": {
				coverage: {
					only: ["sap/ui/webc/main/TimePicker"]
				}
			},

			"Title": {
				coverage: {
					only: ["sap/ui/webc/main/Title"]
				}
			},

			"Toast": {
				coverage: {
					only: ["sap/ui/webc/main/Toast"]
				}
			},

			"Tree": {
				coverage: {
					only: ["sap/ui/webc/main/Tree"]
				}
			},
			"designtime/Avatar": {
				title: "QUnit Page for sap.ui.webc.main.Avatar design time and rta enabling",
				ui5: {
					libs: ["sap.ui.webc.main","sap.ui.rta"]
				},
				sinon: false,
				group: "Designtime"
			},
			"designtime/Badge": {
				title: "QUnit Page for sap.ui.webc.main.Badge design time and rta enabling",
				ui5: {
					libs: ["sap.ui.webc.main", "sap.ui.rta"]
				},
				sinon: false,
				group: "Designtime"
			},
			"designtime/BusyIndicator": {
				title: "QUnit Page for sap.ui.webc.main.BusyIndicator design time and rta enabling",
				ui5: {
					libs: ["sap.ui.webc.main", "sap.ui.rta"]
				},
				sinon: false,
				group: "Designtime"
			},
			"designtime/Button": {
				title: "QUnit Page for sap.ui.webc.main.Button design time and rta enabling",
				ui5: {
					libs: ["sap.ui.webc.main","sap.ui.rta"]
				},
				sinon: false,
				group: "Designtime"
			},
			"designtime/Card": {
				title: "QUnit Page for sap.ui.webc.main.Card design time and rta enabling",
				ui5: {
					libs: ["sap.ui.webc.main", "sap.ui.rta"]
				},
				sinon: false,
				group: "Designtime"
			},
			"designtime/Carousel": {
				title: "QUnit Page for sap.ui.webc.main.Carousel design time and rta enabling",
				ui5: {
					libs: ["sap.ui.webc.main", "sap.ui.rta"]
				},
				sinon: false,
				group: "Designtime"
			},
			"designtime/DatePicker": {
				title: "QUnit Page for sap.ui.webc.main.DatePicker design time and rta enabling",
				ui5: {
					libs: ["sap.ui.webc.main","sap.ui.rta"]
				},
				sinon: false,
				group: "Designtime"
			},
			"designtime/DateTimePicker": {
				title: "QUnit Page for sap.ui.webc.main.DateTimePicker design time and rta enabling",
				ui5: {
					libs: ["sap.ui.webc.main","sap.ui.rta"]
				},
				sinon: false,
				group: "Designtime"
			},
			"designtime/Dialog": {
				title: "QUnit Page for sap.ui.webc.main.Dialog design time and rta enabling",
				ui5: {
					libs: ["sap.ui.webc.main", "sap.ui.rta"]
				},
				sinon: false,
				group: "Designtime"
			},
			"designtime/Input": {
				title: "QUnit Page for sap.ui.webc.main.Input design time and rta enabling",
				ui5: {
					libs: ["sap.ui.webc.main","sap.ui.rta"]
				},
				sinon: false,
				group: "Designtime"
			},
			"designtime/Label": {
				title: "QUnit Page for sap.ui.webc.main.Label design time and rta enabling",
				ui5: {
					libs: ["sap.ui.webc.main", "sap.ui.rta"]
				},
				sinon: false,
				group: "Designtime"
			},
			"designtime/Link": {
				title: "QUnit Page for sap.ui.webc.main.Link design time and rta enabling",
				ui5: {
					libs: ["sap.ui.webc.main","sap.ui.rta"]
				},
				sinon: false,
				group: "Designtime"
			},
			"designtime/MultiInput": {
				title: "QUnit Page for sap.ui.webc.main.MultiInput design time and rta enabling",
				ui5: {
					libs: ["sap.ui.webc.main","sap.ui.rta"]
				},
				sinon: false,
				group: "Designtime"
			},
			"designtime/Panel": {
				title: "QUnit Page for sap.ui.webc.main.Panel design time and rta enabling",
				ui5: {
					libs: ["sap.ui.webc.main","sap.ui.rta"]
				},
				sinon: false,
				group: "Designtime"
			},
			"designtime/Popover": {
				title: "QUnit Page for sap.ui.webc.main.Popover design time and rta enabling",
				ui5: {
					libs: ["sap.ui.webc.main", "sap.ui.rta"]
				},
				sinon: false,
				group: "Designtime"
			},
			"designtime/RadioButton": {
				title: "QUnit Page for sap.ui.webc.main.RadioButton design time and rta enabling",
				ui5: {
					libs: ["sap.ui.webc.main", "sap.ui.rta"]
				},
				sinon: false,
				group: "Designtime"
			},
			"designtime/RangeSlider": {
				title: "QUnit Page for sap.ui.webc.main.RangeSlider design time and rta enabling",
				ui5: {
					libs: ["sap.ui.webc.main","sap.ui.rta"]
				},
				sinon: false,
				group: "Designtime"
			},
			"designtime/RatingIndicator": {
				title: "QUnit Page for sap.ui.webc.main.RatingIndicator design time and rta enabling",
				ui5: {
					libs: ["sap.ui.webc.main","sap.ui.rta"]
				},
				loader: {
					paths: {
						dt: "test-resources/sap/ui/webc/main/qunit/designtime/"
					}
				},
				sinon: false,
				group: "Designtime"
			},
			"designtime/ResponsivePopover": {
				title: "QUnit Page for sap.ui.webc.main.ResponsivePopover design time and rta enabling",
				ui5: {
					libs: ["sap.ui.webc.main", "sap.ui.rta"]
				},
				sinon: false,
				group: "Designtime"
			},
			"designtime/Slider": {
				title: "QUnit Page for sap.ui.webc.main.Slider design time and rta enabling",
				ui5: {
					libs: ["sap.ui.webc.main","sap.ui.rta"]
				},
				sinon: false,
				group: "Designtime"
			},
			"designtime/Tab": {
				title: "QUnit Page for sap.ui.webc.main.Tab design time and rta enabling",
				ui5: {
					libs: ["sap.ui.webc.main", "sap.ui.rta"]
				},
				sinon: false,
				group: "Designtime"
			},
			"designtime/TabContainer": {
				title: "QUnit Page for sap.ui.webc.main.TabContainer design time and rta enabling",
				ui5: {
					libs: ["sap.ui.webc.main", "sap.ui.rta"]
				},
				sinon: false,
				group: "Designtime"
			},
			"designtime/Table": {
				title: "QUnit Page for sap.ui.webc.main.Table design time and rta enabling",
				ui5: {
					libs: ["sap.ui.webc.main","sap.ui.rta"]
				},
				sinon: false,
				group: "Designtime"
			},
			"designtime/Title": {
				title: "QUnit Page for sap.ui.webc.main.Title design time and rta enabling",
				ui5: {
					libs: ["sap.ui.webc.main", "sap.ui.rta"]
				},
				sinon: false,
				group: "Designtime"
			},
			"Generic Testsuite": {
				page: "test-resources/sap/ui/webc/main/qunit/testsuite.generic.qunit.html"
			}
		}
	};
});
