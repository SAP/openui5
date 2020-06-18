sap.ui.define([
	"sap/ui/test/Opa5",
	"sap/ui/test/actions/Press",
	"sap/ui/test/matchers/Ancestor",
	"sap/ui/test/matchers/Properties",
	"sap/ui/test/matchers/PropertyStrictEquals",
	"sap/ui/mdc/library"
], function(
	Opa5,
	Press,
	Ancestor,
	Properties,
	PropertyStrictEquals,
	library
) {
	"use strict";

	var EditMode = library.EditMode,
		VIEW_NAME = "test.sap.ui.mdc.field.Field.view.Field1",
		ARTIST_FIELD = "artistnamefield",
		COUNTRY_FIELD = "countryfield",
		COUNTRY_FIELD_VALUE_HELP_BUTTON = "countryfield-inner-vhi",
		COUNTRY_VALUE_HELP_DIALOG = "countryfieldhelp-dialog",
		COUNTRY_VALUE_HELP_DIALOG_TITLE = "countryfieldhelp-dialog-title",
		COUNTRY_FIELD_HELP_SEARCH_FIELD = "countryfieldhelp-VHP--SearchField",
		COUNTRY_VALUE_HELP_DIALOG_OK_BUTTON = "countryfieldhelp-ok",
		COUNTRY_VALUE_HELP_DIALOG_CANCEL_BUTTON = "countryfieldhelp-cancel",
		COUNTRY_VALUE_HELP_TABLE = "countryfieldhelptable";

	Opa5.createPageObjects({
		onTheAppPage: {
			actions: {
				iPressTheCountryValueHelpButton: function() {
					return this.waitFor({
						id: COUNTRY_FIELD_VALUE_HELP_BUTTON,
						viewName: VIEW_NAME,
						actions: new Press(),
						errorMessage: "the the country value help button on the artist view was not rendered"
					});
				},

				iPressTheCountryValueHelpDialogCancelButton: function() {
					return this.waitFor({
						id: COUNTRY_VALUE_HELP_DIALOG,
						viewName: VIEW_NAME,
						success: function(oValueHelpDialog) {
							Opa5.getContext().control = oValueHelpDialog;

							this.waitFor({
								id: COUNTRY_VALUE_HELP_DIALOG_CANCEL_BUTTON,
								viewName: VIEW_NAME,
								matchers: [
									new Ancestor(oValueHelpDialog)
								],
								actions: new Press(),
								errorMessage: "the country value help cancel button was not rendered"
							});
						}
					});
				},

				iPressTheCountryValueHelpDialogOKButton: function() {
					return this.waitFor({
						id: COUNTRY_VALUE_HELP_DIALOG,
						viewName: VIEW_NAME,
						success: function(oValueHelpDialog) {
							Opa5.getContext().control = oValueHelpDialog;

							this.waitFor({
								id: COUNTRY_VALUE_HELP_DIALOG_OK_BUTTON,
								viewName: VIEW_NAME,
								matchers: [
									new Ancestor(oValueHelpDialog)
								],
								actions: new Press(),
								errorMessage: "the country value help ok button was not rendered"
							});
						}
					});
				},

				iSelectTheFirstCountryInTheValueHelpDialog: function() {
					this.waitFor({
						id: COUNTRY_VALUE_HELP_TABLE,
						viewName: VIEW_NAME,
						success: function(oTable) {
							return this.waitFor({
								viewName: VIEW_NAME,
								controlType: "sap.m.Text",
								matchers: [
									new Ancestor(oTable),
									new Properties({
										text: "AD"
									})
								],
								actions: new Press(),
								success: function() {
									Opa5.assert.ok(true, "the column list item in the value help dialog was found");
								}
							});
						},
						errorMessage: "the column list in the value help dialog was not found"
					});
				}
			},

			assertions: {

				iShouldSeeTheArtistFieldWithValue: function(sValue) {
					return this.waitFor({
						id: ARTIST_FIELD,
						viewName: VIEW_NAME,
						success: function(oField) {

							// assert
							Opa5.assert.strictEqual(oField.getEditMode(), EditMode.Display, "the artist field is in display mode");
							Opa5.assert.strictEqual(oField.getValue(), sValue);
							Opa5.assert.strictEqual(oField.getBinding("value").getValue(), sValue, "the artist field has the correct value in the binding");
							Opa5.assert.strictEqual(oField.getFocusDomRef().textContent, sValue, "the artist field displays the correct formatted value");
						},
						errorMessage: "the artist field was not rendered"
					});
				},

				iShouldSeeTheCountryFieldWithValues: function(sValue, sFormattedValue) {
					return this.waitFor({
						id: COUNTRY_FIELD,
						viewName: VIEW_NAME,
						success: function(oField) {

							// assert
							Opa5.assert.strictEqual(oField.getEditMode(), EditMode.Editable, "the country field is in edit mode");
							Opa5.assert.strictEqual(oField.getValue(), sValue);
							Opa5.assert.strictEqual(oField.getBinding("value").getValue(), sValue, "the country field has the correct value in the binding");
							Opa5.assert.strictEqual(oField.getFocusDomRef().value, sFormattedValue, "the country field displays the correct formatted value");
						},
						errorMessage: "the country field was not rendered"
					});
				},

				iShouldSeeTheCountryValueHelpDialog: function() {
					return this.waitFor({
						id: COUNTRY_VALUE_HELP_DIALOG,
						viewName: VIEW_NAME,
						success: function(oValueHelpDialog) {
							Opa5.assert.ok(true, "the country value help dialog was rendered/open");

							this.waitFor({
								id: COUNTRY_VALUE_HELP_DIALOG_TITLE,
								viewName: VIEW_NAME,
								success: function(oTitle) {

									// assert
									Opa5.assert.strictEqual(oTitle.getText(), "Countries", "the country value help dialog title was rendered");
								},
								errorMessage: "the country value help dialog title was not rendered"
							});

							this.waitFor({
								id: COUNTRY_FIELD_HELP_SEARCH_FIELD,
								viewName: VIEW_NAME,
								success: function(oField) {

									// assert
									Opa5.assert.ok(true, "the search field inside the value help dialog was rendered");
								},
								errorMessage: "the search field was not rendered"
							});

							this.waitFor({
								id: COUNTRY_VALUE_HELP_DIALOG_OK_BUTTON,
								viewName: VIEW_NAME,
								success: function(oOKButton) {

									// assert
									Opa5.assert.strictEqual(oOKButton.getText(), "OK", "the OK button with the correct text was render");
								},
								errorMessage: "the OK button was not rendered"
							});

							this.waitFor({
								id: COUNTRY_VALUE_HELP_DIALOG_CANCEL_BUTTON,
								viewName: VIEW_NAME,
								success: function(oCancelButton) {

									// assert
									Opa5.assert.strictEqual(oCancelButton.getText(), "Cancel", "the Cancel button with the correct text was render");
								},
								errorMessage: "the Cancel button was not rendered"
							});

							this.waitFor({
								id: COUNTRY_VALUE_HELP_TABLE,
								viewName: VIEW_NAME,
								success: function(oTable) {
									Opa5.assert.ok(true, "the table inside the country value help dialog was render");

									this.waitFor({
										viewName: VIEW_NAME,
										controlType: "sap.m.ColumnListItem",
										matchers: [
											new Ancestor(oTable)
										],
										success: function(aColumnListItems) {

											// arrange
											var oColumnListItem = aColumnListItems.find(function(oColumnListItem) {
												return oColumnListItem.getSelected();
											});

											var aCells = oColumnListItem.getCells();

											// assert
											Opa5.assert.strictEqual(aColumnListItems.length, 100, "the table inside the country value help dialog renders the correct amount of rows");
											Opa5.assert.strictEqual(aCells[0].getText(), "DE", "the correct column list item was selected");
											Opa5.assert.strictEqual(aCells[1].getText(), "Germany", "the correct column list item was selected");
										},
										errorMessage: "the incorrect amount of items was rendered"
									});
								},
								errorMessage: "the table control was not rendered"
							});
						},
						errorMessage: "the value help dialog control for the country field was not rendered/opened"
					});
				},

				iShouldNotSeeTheValueHelpDialog: function() {
					return this.waitFor({
						success: function() {

							// this test should be executed async to wait until the close animation of the dialog is completed
							this.iWaitForPromise(new Promise(function(resolve, reject) {

								// the dialog close animation requires 300ms
								setTimeout(resolve, 300);
							})).then(function() {

								// arrange
								var oValueHelpDialog = Opa5.getContext().control;

								// assert
								Opa5.assert.strictEqual(oValueHelpDialog.isOpen(), false, "the country value help dialog was closed");

								// cleanup
								Opa5.getContext().control = null;
							});
						}
					});
				}
			}
		}
	});
});
