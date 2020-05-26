sap.ui.define(function() {

	"use strict";
	return {
		name: "QUnit TestSuite for sap.ui.commons",
		defaults: {
			bootCore: true,
			ui5: {
				libs: "sap.ui.commons",
				theme: "sap_bluecrystal",
				noConflict: true,
				preload: "auto"
			},
			qunit: {
				version: 2,
				reorder: false
			},
			sinon: {
				version: 4,
				qunitBridge: true,
				useFakeTimers: false
			},
			module: "./{name}.qunit"
		},
		tests: {
			AbsoluteLayout: {
				title: "AbsoluteLayout - sap.ui.commons",
				_alternativeTitle: "QUnit tests: sap.ui.commons.layout.AbsoluteLayout"
			},
			Accordion: {
				title: "QUnit Page for sap.ui.commons.Accordion"
			},
			ApplicationHeader: {
				title: "QUnit Page for sap.ui.commons.ApplicationHeader"
			},
			AutoComplete: {
				title: "AutoComplete - sap.ui.commons",
				_alternativeTitle: "QUnit tests: sap.ui.commons.AutoComplete"
			},
			BorderLayout: {
				title: "QUnit tests: sap.ui.commons.layout.BorderLayout"
			},
			Button: {
				title: "QUnit Page for sap.ui.commons.Button"
			},
			Callout: {
				title: "QUnit test for the Callout control",
				_alternativeTitle: "QUnit tests: sap.ui.commons.Callout"
			},
			Carousel: {
				title: "Carousel - sap.ui.commons",
				_alternativeTitle: "QUnit tests: sap.ui.commons.Carousel"
			},
			CheckBox: {
				title: "Test Page for sap.ui.commons.CheckBox"
			},
			ColorPicker: {
				title: "Test Page for ColorPicker - sap.ui.commons",
				_alternativeTitle: "QUnit tests: sap.ui.commons.ColorPicker"
			},
			ColorPickerHSL: {
				title: "Test Page for ColorPicker - sap.ui.commons",
				_alternativeTitle: "QUnit tests: sap.ui.commons.ColorPicker"
			},
			ComboBox: {
				title: "ComboBox - sap.ui.commons",
				_alternativeTitle: "QUnit Page for ComboBox - sap.ui.commons"
			},
			Datepicker: {
				title: "QUnit Test for DatePicker",
				_alternativeTitle: "QUnit Page for sap.ui.commons.Datepicker",
				ui5: {
					language: "en-US"
				}
			},
			Dialog: {
				title: "Dialog - sap.ui.commons - QUnit test page"
			},
			DropdownBox: {
				title: "DropdownBox - sap.ui.commons",
				_alternativeTitle: "QUnit Page for DropdownBox - sap.ui.commons"
			},
			Form: {
				title: "QUnit Test for Form",
				_alternativeTitle: "QUnit tests: sap.ui.commons.form.Form"
			},
			FormattedTextView: {
				title: "QUnit tests: sap.ui.commons.FormattedTextView"
			},
			GenericEventBinding: {
				title: "Generic Event Binding - sap.ui.core.Control.attachBrowserEvent() - QUnit Test Page",
				_alternativeTitle: "QUnit Page for sap.ui.core.Control.attachBrowserEvent() -- Generic Event Binding"
			},
			GridLayout: {
				title: "QUnit Test for GridLayout",
				_alternativeTitle: "QUnit tests: sap.ui.commons.form.GridLayout"
			},
			HorizontalDivider: {
				title: "HorizontalDivider - sap.ui.commons",
				_alternativeTitle: "QUnit tests: sap.ui.commons.HorizontalDivider"
			},
			HorizontalLayout: {
				title: "QUnit Page for sap.ui.commons.layout.HorizontalLayout"
			},
			Image: {
				title: "Image - sap.ui.commons - QUnit test",
				_alternativeTitle: "QUnit Page for sap.ui.commons.Image"
			},
			ImageMap: {
				title: "qunit Test for Image Map",
				_alternativeTitle: "QUnit tests: sap.ui.commons.ImageMap"
			},
			InPlaceEdit: {
				title: "qunit Test for InPlaceEdit",
				_alternativeTitle: "QUnit tests: sap.ui.commons.InPlaceEdit"
			},
			Label: {
				title: "Test Page for sap.ui.commons.Label",
				_alternativeTitle: "QUnit page for sap.ui.commons.Label"
			},
			Link: {
				title: "Test Page for sap.ui.commons.Link",
				_alternativeTitle: "QUnit Page for sap.ui.commons.Link"
			},
			"ListBox-ComboBoxPopup": {
				title: "ListBox - sap.ui.commons",
				_alternativeTitle: "QUnit Page for sap.ui.commons.ListBox"
			},
			"ListBox-GoldReflection": {
				title: "ListBox - sap.ui.commons",
				_alternativeTitle: "QUnit Page for sap.ui.commons.ListBox"
			},
			ListBox: {
				title: "ListBox - sap.ui.commons",
				_alternativeTitle: "QUnit Page for sap.ui.commons.ListBox"
			},
			MatrixLayout: {
				title: "qunit Test for MatrixLayout"
			},
			Menu: {
				title: "Menu - sap.ui.commons",
				_alternativeTitle: "QUnit tests: sap.ui.commons.MenuItemBase"
			},
			MenuBar: {
				title: "MenuBar - sap.ui.commons",
				_alternativeTitle: "QUnit tests: sap.ui.commons.MenuBar"
			},
			MenuButton: {
				title: "MenuButton - sap.ui.commons",
				_alternativeTitle: "QUnit tests: sap.ui.commons.MenuButton"
			},
			MessageBar: {
			},
			Paginator: {
				title: "Paginator - sap.ui.commons",
				_alternativeTitle: "QUnit Page for sap.ui.commons.Paginator",
				ui5: {
					language: "en"
				}
			},
			Panel: {
				title: "Panel - sap.ui.commons",
				_alternativeTitle: "QUnit Page for sap.ui.commons.Panel"
			},
			PasswordField: {
				title: "qunit Test for PasswordField",
				_alternativeTitle: "QUnit tests: sap.ui.commons.PasswordField"
			},
			ProgressIndicator: {
				title: "qunit Test for ProgressIndicator"
			},
			RadioButton: {
				title: "Test Page for sap.ui.commons.RadioButton",
				_alternativeTitle: "QUnit Page for sap.ui.commons.RadioButton"
			},
			RadioButtonGroup: {
				title: "qunit Test for RadioButtonGroup",
				_alternativeTitle: "QUnit tests: sap.ui.commons.RadioButtonGroup"
			},
			RangeSlider: {
				title: "qunit Test for RangeSlider",
				_alternativeTitle: "QUnit tests: sap.ui.commons.RangeSlider"
			},
			RatingIndicator: {
				title: "RatingIndicator - sap.ui.commons",
				_alternativeTitle: "QUnit tests: sap.ui.commons.RatingIndicator",
				ui5: {
					language: "en"
				}
			},
			ResponsiveContainer: {
				title: "ResponsiveContainer - sap.ui.commons",
				_alternativeTitle: "QUnit Page for ResponsiveContainer - sap.ui.commons",
				sinon: {
					useFakeTimers: true
				},
				ui5: {
					libs: "sap.ui.commons, sap.m"
				}
			},
			ResponsiveFlowLayout: {
				title: "ResponsiveFlowLayout - sap.ui.commons",
				_alternativeTitle: "QUnit Page for\n\t	sap.ui.commons.layout.ResponsiveFlowLayout"
			},
			ResponsiveLayout: {
				title: "QUnit Test for ResponsiveLayout",
				_alternativeTitle: "QUnit tests: sap.ui.commons.form.ResponsiveLayout"
			},
			RichTooltip: {
				title: "RichTooltip - sap.ui.commons",
				_alternativeTitle: "QUnit tests: sap.ui.commons.RichTooltip",
				ui5: {
					language: "en"
				}
			},
			RoadMap: {
				title: "RoadMap - sap.ui.commons",
				_alternativeTitle: "QUnit tests: sap.ui.commons.RoadMap"
			},
			RowRepeater: {
				title: "RowRepeater - sap.ui.commons",
				_alternativeTitle: "QUnit Page for RowRepeater - sap.ui.commons"
			},
			SearchField: {
				title: "SearchField - sap.ui.commons",
				_alternativeTitle: "QUnit tests: sap.ui.commons.SearchField"
			},
			SegmentedButton: {
				title: "qunit Test for SegmentedButton",
				_alternativeTitle: "QUnit tests: sap.ui.commons.SegmentedButton"
			},
			SimpleForm: {
				title: "QUnit Test for SimpleForm",
				_alternativeTitle: "QUnit tests: sap.ui.commons.form.SimpleForm"
			},
			Slider: {
				title: "qunit Test for Slider",
				_alternativeTitle: "QUnit tests: sap.ui.commons.Slider"
			},
			Splitter: {
				title: "Splitter - sap.ui.commons",
				_alternativeTitle: "QUnit Page for sap.ui.commons.Splitter"
			},
			Tab: {
				title: "Test Page for sap.ui.commons.Tab",
				_alternativeTitle: "QUnit page for sap.ui.commons.Tab"
			},
			TabStrip: {
				title: "qunit Test for TabStrip",
				_alternativeTitle: "QUnit tests: sap.ui.commons.TabStrip",
				sinon: {
					version: 4,
					useFakeTimers: true,
					qunitBridge: true
				}
			},
			TextArea: {
				title: "qunit Test for TextArea",
				_alternativeTitle: "QUnit tests: sap.ui.commons.TextArea"
			},
			TextField: {
				title: "Test Page for sap.ui.commons.TextField",
				_alternativeTitle: "QUnit page for sap.ui.commons.TextField",
				ui5: {
					theme: "base"
				}
			},
			TextView: {
				title: "qunit Test for TextView",
				_alternativeTitle: "QUnit tests: sap.ui.commons.TextView"
			},
			ToggleButton: {
				title: "ToggleButton - sap.ui.commons",
				_alternativeTitle: "QUnit Page for ToggleButton"
			},
			Toolbar: {
				title: "Test Page for sap.ui.commons.Toolbar",
				_alternativeTitle: "QUnit page for sap.ui.commons.Toolbar",
				ui5: {
					libs: "sap.ui.layout,sap.ui.commons"
				}
			},
			ToolbarKeyboardNavigation: {
				title: "Test Page Keyboard Navigation for sap.ui.commons.Toolbar",
				_alternativeTitle: "QUnit page for sap.ui.commons.Toolbar",
				ui5: {
					libs: "sap.ui.layout,sap.ui.commons"
				}
			},
			ToolbarOverflow: {
				title: "Test Page for sap.ui.commons.Toolbar Overflow",
				_alternativeTitle: "QUnit page for sap.ui.commons.Toolbar Overflow"
			},
			ToolbarRightItems: {
				title: "Test Page for sap.ui.commons.Toolbar with Right Side Items",
				_alternativeTitle: "QUnit page for sap.ui.commons.Toolbar with Right Side Items"
			},
			Tree: {
				title: "Tree - sap.ui.commons",
				_alternativeTitle: "QUnit Page for Tree Testing"
			},
			TreeMultiSelection: {
				title: "TreeMultiSelection - sap.ui.commons",
				_alternativeTitle: "QUnit Page for Tree Testing"
			},
			TriStateCheckBox: {
				title: "Testpage for sap.ui.commons.TriStateCheckBox",
				_alternativeTitle: "QUnit Page for the Control sap.ui.commons.TriStateCheckBox"
			},
			ValueHelpField: {
				title: "qunit Test for ValueHelpField",
				_alternativeTitle: "QUnit tests: sap.ui.commons.ValueHelpField"
			},
			VerticalLayout: {
				title: "qunit Test for VerticalLayout",
				_alternativeTitle: "QUnit tests: sap.ui.commons.layout.VerticalLayout"
			}
		}
	};
});
