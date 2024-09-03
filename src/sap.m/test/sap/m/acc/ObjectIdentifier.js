sap.ui.define([
	"sap/m/App",
	"sap/m/MessageToast",
	"sap/m/Page",
	"sap/m/Title",
	"sap/ui/core/library",
	"sap/m/Text",
	"sap/m/ObjectIdentifier",
	"sap/m/Table",
	"sap/m/Column",
	"sap/m/ColumnListItem",
	"sap/ui/layout/VerticalLayout"
], function(App, MessageToast, Page, Title, coreLibrary, MText, ObjectIdentifier, Table, Column, ColumnListItem, VerticalLayout) {
	"use strict";



	// shortcut for sap.ui.core.TitleLevel
	var TitleLevel = coreLibrary.TitleLevel;

	// -----------------
	// Utility functions
	// -----------------

	function onTitlePress(oEvent) {
		MessageToast.show(oEvent.getSource().getId() + " pressed");
	}

	function getTitle(sText) {
		return new Title({
			text: sText,
			titleStyle: TitleLevel.H2
		}).addStyleClass("sapUiMediumMarginTop");
	}

	function getText(sText, bSuppressApplyingClasses) {
		var oGeneratedText = new MText({ text: sText });

		if (!bSuppressApplyingClasses) {
			oGeneratedText.addStyleClass("sapUiMediumMarginTop sapUiSmallMarginBottom");
		}

		return oGeneratedText;
	}

	function getObjectIdentifier(oProps, bShouldIndent) {
		// Wraps the standard constructor call and provides an option to adds
		// indentation, to avoid confusion visually in some cases
		var oGeneratedObjectIdentifier = new ObjectIdentifier(oProps);

		if (bShouldIndent) {
			oGeneratedObjectIdentifier.addStyleClass("sapUiMediumMarginBegin");
		}

		return oGeneratedObjectIdentifier;
	}


	// ------------------------------------
	// Standalone ObjectIdentifier controls
	// ------------------------------------

	var oActiveObjectIdentifier = getObjectIdentifier({
		title: "Notebook",
		text: "Perfectly fine for daily use",
		titleActive: true,
		titlePress: onTitlePress
	}, true);

	var oObjectIdentifier = getObjectIdentifier({
		title: "Gaming Notebook",
		text: "Your wallet is going to feel this"
	}, true);

	var oActiveTextlessObjectIdentifier = getObjectIdentifier({
		title: "Ultrawide monitor",
		titleActive: true,
		titlePress: onTitlePress
	}, true);

	var oTextlessObjectIdentifier = getObjectIdentifier({
		title: "Standard monitor"
	}, true);

	var oTitlelessObjectIdentifier = getObjectIdentifier({
		text: "Just a regular computer shop"
	}, true);


	// -------------------------------------
	// Labelling ObjectIdentifiers controls
	// -------------------------------------

	var oAriaLabelledByText = new MText({
		text: "Text used for labelling"
	}).addStyleClass("sapUiMediumMarginBegin sapUiTinyMarginBottom");	// Added for better visual representation

	var oObjectIdentifierAriaLabelledBy = getObjectIdentifier({
		title: "Gaming mouse",
		text: "So many buttons to click...",
		titleActive: true,
		titlePress: onTitlePress,
		ariaLabelledBy: oAriaLabelledByText
	}, true);


	// --------------------------
	// ObjectIdentifiers in Table
	// --------------------------

	var oTable = new Table({
		columns: [
			new Column({
				header: getText("Control", true)
			}),
			new Column({
				header: getText("Description", true)
			})
		],
		items: [
			new ColumnListItem({
				cells: [
					oActiveObjectIdentifier.clone(),
					getText("Active ObjectIdentifier with title and text", true)
				]
			}),
			new ColumnListItem({
				cells: [
					oObjectIdentifier.clone(),
					getText("ObjectIdentifier with title and text", true)
				]
			}),
			new ColumnListItem({
				cells: [
					oActiveTextlessObjectIdentifier.clone(),
					getText("Active ObjectIdentifier with title only", true)
				]
			}),
			new ColumnListItem({
				cells: [
					oTextlessObjectIdentifier.clone(),
					getText("ObjectIdentifier with title only", true)
				]
			}),
			new ColumnListItem({
				cells: [
					oTitlelessObjectIdentifier.clone(),
					getText("ObjectIdentifier with text only", true)
				]
			})
		]
	});


	// ----------------
	// Page's layout
	// ----------------

	var oLayout = new VerticalLayout({
		content: [
			getTitle("Standalone ObjectIdentifiers"),

			getText("Active ObjectIdentifier with title and text:"),
			oActiveObjectIdentifier,
			getText("ObjectIdentifier with title and text:"),
			oObjectIdentifier,
			getText("Active ObjectIdentifier with title only:"),
			oActiveTextlessObjectIdentifier,
			getText("ObjectIdentifier with title only:"),
			oTextlessObjectIdentifier,
			getText("ObjectIdentifier with text only:"),
			oTitlelessObjectIdentifier,

			getTitle("Labelling ObjectIdentifiers"),

			getText("ObjectIdentifier with ariaLabelledBy:"),
			oAriaLabelledByText,
			oObjectIdentifierAriaLabelledBy,

			getTitle("ObjectIdentifiers in Table"),

			getText("Note: ObjectIdentifiers are cloned from the 'Standalone ObjectIdentifiers' section"),
			oTable
		]
	}).addStyleClass("sapUiSmallMarginBegin");

	new App({
		pages: new Page({
			title: "ObjectIdentifiers Accessibility Test Page",
			titleLevel: "H1",
			content: oLayout
		})
	}).placeAt("content");
});
