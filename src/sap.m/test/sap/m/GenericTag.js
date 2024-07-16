sap.ui.define([
	"sap/m/MessageToast",
	"sap/m/GenericTag",
	"sap/m/library",
	"sap/m/ObjectNumber",
	"sap/m/Page",
	"sap/ui/layout/VerticalLayout",
	"sap/m/HBox",
	"sap/ui/core/HTML",
	"sap/m/App"
], function (MessageToast, GenericTag, mobileLibrary,
			ObjectNumber, Page, VerticalLayout, HBox, HTML, App) {
	"use strict";

	// shortcut for sap.m.FlexWrap
	const FlexWrap = mobileLibrary.FlexWrap;

	var GenericTagDesign = mobileLibrary.GenericTagDesign;
	var GenericTagValueState = mobileLibrary.GenericTagValueState;

	var onPress = function (evt) {
		MessageToast.show(evt.getSource().getId() + " Pressed");
	};

	var oNeutralGenericTag = new GenericTag({
		id: "genericTag",
		text: "Text that truncates.",
		design: GenericTagDesign.Full,
		valueState: GenericTagValueState.None,
		value: new ObjectNumber({
			number: "956",
			unit: "EUR",
		}),
		press: onPress
	});

	var oInformationGenericTag = new GenericTag({
		text: "Text that truncates.",
		status: "Information",
		design: GenericTagDesign.Full,
		valueState: GenericTagValueState.None,
		value: new ObjectNumber({
			number: "956",
			unit: "EUR"
		}),
		press: onPress
	});

	var oErrorGenericTag = new GenericTag({
		text: "Text that truncates.",
		status: "Error",
		design: GenericTagDesign.Full,
		valueState: GenericTagValueState.None,
		value: new ObjectNumber({
			number: "123",
			unit: "EUR"
		}),
		press: onPress
	});

	var oWarningGenericTag = new GenericTag({
		text: "Text that truncates.",
		status: "Warning",
		design: GenericTagDesign.Full,
		valueState: GenericTagValueState.None,
		value: new ObjectNumber({
			number: "335",
			unit: "EUR"
		}),
		press: onPress
	});

	var oSuccessGenericTag = new GenericTag({
		text: "Text that truncates.",
		status: "Success",
		design: GenericTagDesign.Full,
		valueState: GenericTagValueState.None,
		value: new ObjectNumber({
			number: "335",
			unit: "EUR"
		}),
		press: onPress
	});

	var oNeutralGenericTagError = new GenericTag({
		text: "Text that truncates.",
		design: GenericTagDesign.Full,
		valueState: GenericTagValueState.Error,
		value: new ObjectNumber({
			number: "956",
			unit: "EUR"
		}),
		press: onPress
	});

	var oInformationGenericTagError = new GenericTag({
		text: "Text that truncates.",
		status: "Information",
		design: GenericTagDesign.Full,
		valueState: GenericTagValueState.Error,
		value: new ObjectNumber({
			number: "489",
			unit: "EUR"
		}),
		press: onPress
	});

	var oErrorGenericTagError = new GenericTag({
		text: "Text that truncates.",
		status: "Error",
		design: GenericTagDesign.Full,
		valueState: GenericTagValueState.Error,
		value: new ObjectNumber({
			number: "123",
			unit: "EUR"
		}),
		press: onPress
	});

	var oWarningGenericTagError = new GenericTag({
		text: "Text that truncates.",
		status: "Warning",
		design: GenericTagDesign.Full,
		valueState: GenericTagValueState.Error,
		value: new ObjectNumber({
			number: "335",
			unit: "EUR"
		}),
		press: onPress
	});

	var oSuccessGenericTagError = new GenericTag({
		text: "Text that truncates.",
		status: "Success",
		design: GenericTagDesign.Full,
		valueState: GenericTagValueState.Error,
		value: new ObjectNumber({
			number: "774",
			unit: "EUR"
		}),
		press: onPress
	});

	var oNeutralGenericTagIconHidden = new GenericTag({
		text: "Text that truncates.",
		design: GenericTagDesign.StatusIconHidden,
		valueState: GenericTagValueState.None,
		value: new ObjectNumber({
			number: "956",
			unit: "EUR"
		}),
		press: onPress
	});

	var oInformationGenericTagIconHidden = new GenericTag({
		text: "Text that truncates.",
		status: "Information",
		design: GenericTagDesign.StatusIconHidden,
		valueState: GenericTagValueState.None,
		value: new ObjectNumber({
			number: "493",
			unit: "EUR"
		}),
		press: onPress
	});

	var oErrorGenericTagIconHidden = new GenericTag({
		text: "Text that truncates.",
		status: "Error",
		design: GenericTagDesign.StatusIconHidden,
		valueState: GenericTagValueState.None,
		value: new ObjectNumber({
			number: "123",
			unit: "EUR"
		}),
		press: onPress
	});

	var oWarningGenericTagIconHidden = new GenericTag({
		text: "Text that truncates.",
		status: "Warning",
		design: GenericTagDesign.StatusIconHidden,
		valueState: GenericTagValueState.None,
		value: new ObjectNumber({
			number: "335",
			unit: "EUR"
		}),
		press: onPress
	});

	var oSuccessGenericTagIconHidden = new GenericTag({
		text: "Text that truncates.",
		status: "Success",
		design: GenericTagDesign.StatusIconHidden,
		valueState: GenericTagValueState.None,
		value: new ObjectNumber({
			number: "335",
			unit: "EUR"
		}),
		press: onPress
	});

	var oNeutralGenericTagIconHiddenError = new GenericTag({
		text: "Text that truncates.",
		design: GenericTagDesign.StatusIconHidden,
		valueState: GenericTagValueState.Error,
		value: new ObjectNumber({
			number: "956",
			unit: "EUR"
		}),
		press: onPress
	});

	var oInformationGenericTagIconHiddenError = new GenericTag({
		text: "Text that truncates.",
		status: "Information",
		design: GenericTagDesign.StatusIconHidden,
		valueState: GenericTagValueState.Error,
		value: new ObjectNumber({
			number: "123",
			unit: "EUR"
		}),
		press: onPress
	});

	var oErrorGenericTagIconHiddenError = new GenericTag({
		text: "Text that truncates.",
		status: "Error",
		design: GenericTagDesign.StatusIconHidden,
		valueState: GenericTagValueState.Error,
		value: new ObjectNumber({
			number: "123",
			unit: "EUR"
		}),
		press: onPress
	});

	var oWarningGenericTagIconHiddenError = new GenericTag({
		text: "Text that truncates.",
		status: "Warning",
		design: GenericTagDesign.StatusIconHidden,
		valueState: GenericTagValueState.Error,
		value: new ObjectNumber({
			number: "335",
			unit: "EUR"
		}),
		press: onPress
	});

	var oSuccessGenericTagIconHiddenError = new GenericTag({
		text: "Text that truncates.",
		status: "Success",
		design: GenericTagDesign.StatusIconHidden,
		valueState: GenericTagValueState.Error,
		value: new ObjectNumber({
			number: "335",
			unit: "EUR"
		}),
		press: onPress
	});

	new HBox({
		items: [
			oNeutralGenericTag,
			oErrorGenericTag,
			oWarningGenericTag,
		]
	});

	var oPage = new Page("myPage", {
		title: "sap.m.GenericTag Test Page",
		content: [
			new VerticalLayout({
				width: "100%",
				content: [
					new HTML({ content: "<h3>sap.m.GenericTagDesign.Full + sap.m.GenericTagValueState.None</h3>" }),
					new HBox({
						wrap: FlexWrap.Wrap,
						items: [
							oNeutralGenericTag,
							oInformationGenericTag,
							oErrorGenericTag,
							oWarningGenericTag,
							oSuccessGenericTag
						]
					}),
					new HTML({ content: "<hr>" }),
					new HTML({ content: "<h3>sap.m.GenericTagDesign.Full + sap.m.GenericTagValueState.Error</h3>" }),
					new HBox({
						wrap: FlexWrap.Wrap,
						items: [
							oNeutralGenericTagError,
							oInformationGenericTagError,
							oErrorGenericTagError,
							oWarningGenericTagError,
							oSuccessGenericTagError
						]
					}),
					new HTML({ content: "<hr>" }),
					new HTML({ content: "<h3>sap.m.GenericTagDesign.StatusIconHidden + sap.m.GenericTagValueState.None</h3>" }),
					new HBox({
						wrap: FlexWrap.Wrap,
						items: [
							oNeutralGenericTagIconHidden,
							oInformationGenericTagIconHidden,
							oErrorGenericTagIconHidden,
							oWarningGenericTagIconHidden,
							oSuccessGenericTagIconHidden
						]
					}),
					new HTML({ content: "<hr>" }),
					new HTML({ content: "<h3>sap.m.GenericTagDesign.StatusIconHidden + sap.m.GenericTagValueState.Error</h3>" }),
					new HBox({
						wrap: FlexWrap.Wrap,
						items: [
							oNeutralGenericTagIconHiddenError,
							oInformationGenericTagIconHiddenError,
							oErrorGenericTagIconHiddenError,
							oWarningGenericTagIconHiddenError,
							oSuccessGenericTagIconHiddenError
						]
					})
				]
			})
		]
	});

	oPage.addStyleClass("sapUiContentPadding");

	new App("myApp", {
		initialPage: "myPage",
		pages: [oPage]
	}).placeAt("body");
})