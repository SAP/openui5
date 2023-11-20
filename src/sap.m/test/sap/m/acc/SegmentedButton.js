sap.ui.define([
	"sap/m/Label",
	"sap/m/SegmentedButton",
	"sap/m/SegmentedButtonItem",
	"sap/m/Text",
	"sap/m/Title",
	"sap/ui/layout/VerticalLayout"
], function(Label, SegmentedButton, SegmentedButtonItem, MText, Title, VerticalLayout) {
	"use strict";

	// ----------------
	// Utility functions
	// ----------------

	function getText(sText) {
		return new MText({ text: sText }).addStyleClass("sapUiTinyMarginTop");
	}

	function getTitle(sText) {
		return new Title({
			text: sText,
			titleStyle: "H3"
		}).addStyleClass("sapUiMediumMarginTop");
	}


	// -----------------------------------
	// Standalone SegmentedButtons section
	// -----------------------------------

	var oSegmentedButtonTwoItems = new SegmentedButton({
		items: [
			new SegmentedButtonItem({
				text: "First"
			}),
			new SegmentedButtonItem({
				text: "Second"
			})
		]
	});

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


	// ----------------------------------
	// Disabling SegmentedButtons section
	// ----------------------------------

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


	// ---------------------------------------------------
	// SegmentedButton with additional information section
	// ---------------------------------------------------

	var oSegmentedButtonLabel = new Label({
		text: "Some information provided by this label",
		labelFor: "labelled-segmentedbutton"
	}).addStyleClass("sapUiTinyMarginTop");			// Apply this class for better visual representation

	var oLabelledSegmentedButton = new SegmentedButton("labelled-segmentedbutton", {
		items: [
			new SegmentedButtonItem({
				text: "First"
			}),
			new SegmentedButtonItem({
				text: "Second"
			})
		]
	});

	var oAriaLabelledByText = new MText({
		text: "Text used for labeling"
	}).addStyleClass("sapUiTinyMarginTop");		// Apply this class for better visual representation

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
	}).addStyleClass("sapUiTinyMarginTop");		// Apply this class for better visual representation

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


	// ------
	// Example Layout
	// ------

	var oLayout = new VerticalLayout({
		content: [
			getTitle("Standalone SegmentedButtons"),

			getText("SegmentedButton with two items:"),
			oSegmentedButtonTwoItems,
			getText("SegmentedButton with three items:"),
			oSegmentedButtonThreeItems,
			getText("SegmentedButton with three items, where the middle one is hidden:"),
			oSegmentedButtonThreeItemsMiddleHidden,
			getText("SegmentedButton with explicit item selection:"),
			oSegmentedButtonExplicitSelection,
			getText("Icon-only SegmentedButton:"),
			oIconOnlySegmentedButton,
			getText("Combined (icon + text) SegmentedButtons:"),
			oCombinedSegmentedButton,


			getTitle("Disabling SegmentedButtons"),

			getText("Disabled SegmentedButton"),
			oDisabledSegmentedButton,
			getText("SegmentedButton with the middle item being disabled:"),
			oSegmentedButtonMiddleItemDisabled,


			getTitle("SegmentedButton with additional information"),

			getText("SegmentedButton and sap.m.Label:"),
			oSegmentedButtonLabel,
			oLabelledSegmentedButton,
			getText("SegmentedButton with ariaLabelledBy association:"),
			oAriaLabelledByText,
			oSegmentedButtonAriaLabelledBy,
			getText("SegmentedButton with ariaDescribedBy association:"),
			oAriaDescribedByText,
			oSegmentedButtonAriaDescribedBy
		]
	}).addStyleClass("sapUiSmallMarginBegin");


	oLayout.placeAt("content");
});
