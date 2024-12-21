sap.ui.define([
	"sap/m/App",
	"sap/m/Page",
	"sap/m/Label",
	"sap/m/SegmentedButton",
	"sap/m/SegmentedButtonItem",
	"sap/m/Text",
	"sap/m/Title",
	"sap/ui/layout/VerticalLayout",
	"sap/ui/core/library"
], function(App, Page, Label, SegmentedButton, SegmentedButtonItem, MText, Title, VerticalLayout, coreLibrary) {
	"use strict";

	// shortcut for sap.ui.core.TitleLevel
	var TitleLevel = coreLibrary.TitleLevel;

	function getTitle(sText) {
		return new Title({
			level: TitleLevel.H2,
			titleStyle: TitleLevel.H5,
			text: sText,
			wrapping: true
		}).addStyleClass("sapUiMediumMarginTop");
	}

	var oSegmentedButtonThreeItems = new SegmentedButton({
		items: [
			new SegmentedButtonItem({
				text: "First"
			}),
			new SegmentedButtonItem({
				text: "Second"
			}),
			new SegmentedButtonItem({
				text: "Third"
			})
		]
	});

	var oSegmentedButtonThreeItemsMiddleHidden = new SegmentedButton({
		items: [
			new SegmentedButtonItem({
				text: "First"
			}),
			new SegmentedButtonItem({
				text: "Second",
				visible: false
			}),
			new SegmentedButtonItem({
				text: "Third"
			})
		]
	});

	var oSegmentedButtonExplicitSelection = new SegmentedButton({
		selectedKey: "3",
		items: [
			new SegmentedButtonItem({
				text: "First",
				key: "1"
			}),
			new SegmentedButtonItem({
				text: "Second",
				key: "2"
			}),
			new SegmentedButtonItem({
				text: "Third",
				key: "3"
			})
		]
	});

	var oIconOnlySegmentedButton = new SegmentedButton({
		items: [
			new SegmentedButtonItem({
				icon: "sap-icon://accelerated",
				tooltip: "First tooltip"
			}),
			new SegmentedButtonItem({
				icon: "sap-icon://account",
				tooltip: "Second tooltip"
			})
		]
	});

	var oCombinedSegmentedButton = new SegmentedButton({
		items: [
			new SegmentedButtonItem({
				text: "First",
				icon: "sap-icon://accelerated"
			}),
			new SegmentedButtonItem({
				text: "Second",
				icon: "sap-icon://account"
			})
		]
	});

	var oDisabledSegmentedButton = new SegmentedButton({
		enabled: false,
		items: [
			new SegmentedButtonItem({
				text: "First",
				icon: "sap-icon://accelerated"
			}),
			new SegmentedButtonItem({
				text: "Second",
				icon: "sap-icon://account"
			})
		]
	});

	var oSegmentedButtonMiddleItemDisabled = new SegmentedButton({
		items: [
			new SegmentedButtonItem({
				icon: "sap-icon://accelerated",
				tooltip: "First tooltip"
			}),
			new SegmentedButtonItem({
				icon: "sap-icon://negative",
				tooltip: "Tooltip for disabled item",
				enabled: false
			}),
			new SegmentedButtonItem({
				icon: "sap-icon://account",
				tooltip: "Last tooltip"
			})
		]
	});

	var oAriaLabelledByText = new MText({
		text: "Text used for labeling"
	}).addStyleClass("sapUiTinyMarginTop");

	var oSegmentedButtonAriaLabelledBy = new SegmentedButton({
		ariaLabelledBy: oAriaLabelledByText,
		items: [
			new SegmentedButtonItem({
				text: "First"
			}),
			new SegmentedButtonItem({
				text: "Second"
			})
		]
	});

	var oAriaDescribedByText = new MText({
		text: "Text used for describing"
	}).addStyleClass("sapUiTinyMarginTop");

	var oSegmentedButtonAriaDescribedBy = new SegmentedButton({
		ariaDescribedBy: oAriaDescribedByText,
		items: [
			new SegmentedButtonItem({
				text: "First"
			}),
			new SegmentedButtonItem({
				text: "Second"
			})
		]
	});

	var oPageLayout = new VerticalLayout({
		content: [
			getTitle("Standalone SegmentedButtons"),
			new Label({text: "SegmentedButton with three items:", wrapping: true, labelFor: oSegmentedButtonThreeItems}),
			oSegmentedButtonThreeItems,
			new Label({text: "SegmentedButton with three items, where the middle one is hidden:", wrapping: true, labelFor: oSegmentedButtonThreeItemsMiddleHidden}),
			oSegmentedButtonThreeItemsMiddleHidden,
			new Label({text: "SegmentedButton with explicit item selection:", wrapping: true, labelFor: oSegmentedButtonExplicitSelection}),
			oSegmentedButtonExplicitSelection,
			new Label({text: "Icon-only SegmentedButton:", wrapping: true, labelFor: oIconOnlySegmentedButton}),
			oIconOnlySegmentedButton,
			new Label({text: "Combined (icon + text) SegmentedButtons:", wrapping: true, labelFor: oCombinedSegmentedButton}),
			oCombinedSegmentedButton,


			getTitle("Disabling SegmentedButtons"),
			new Label({text: "Disabled SegmentedButton:", wrapping: true, labelFor: oDisabledSegmentedButton}),
			oDisabledSegmentedButton,
			new Label({text: "SegmentedButton with the middle item being disabled:", wrapping: true, labelFor: oSegmentedButtonMiddleItemDisabled}),
			oSegmentedButtonMiddleItemDisabled,


			getTitle("SegmentedButton with additional information"),
			oAriaLabelledByText,
			oSegmentedButtonAriaLabelledBy,
			new Label({text: "SegmentedButton with ariaDescribedBy association:", wrapping: true, labelFor: oSegmentedButtonAriaDescribedBy}),
			oAriaDescribedByText,
			oSegmentedButtonAriaDescribedBy
		]
	}).addStyleClass("sapUiContentPadding");

	var oApp = new App();
	var oPage = new Page({
		title: "SegmentedButton Accessibility Test Page",
		titleLevel: TitleLevel.H1,
		content: oPageLayout
	});

	oApp.addPage(oPage);
	oApp.placeAt("body");
});
