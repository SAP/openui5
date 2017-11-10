/*global QUnit*/

sap.ui.define([
	"sap/ui/test/Opa5",
	"sap/ui/test/opaQunit",
	"sap/ui/test/matchers/PropertyStrictEquals"
], function (Opa5, opaTest, PropertyStrictEquals) {
	"use strict";

	QUnit.module("EditSave");

	opaTest("Should go to the edit page", function(Given, When, Then) {

		// Arrange
		Given.iStartTheFormSample();

		// Act
		When.iPressOnEdit();

		// Assert
		Then.iShouldBeOnTheEditPage();
	});

	opaTest("Should persist the values", function(Given, When, Then) {

		// Act
		When.iChangeValuesInTheForm().
			and.iPressOnSave();

		// Assert
		Then.theValuesShouldBePersisted().
			and.iTeardownMyAppFrame();
	});

	QUnit.module("EditCancel");

	opaTest("Should go to the edit page", function(Given, When, Then) {

		// Arrange
		Given.iStartTheFormSample();

		// Act
		When.iPressOnEdit();

		// Assert
		Then.iShouldBeOnTheEditPage();
	});

	opaTest("Should restore the values", function(Given, When, Then) {

		// Act
		When.iChangeValuesInTheForm().
			and.iPressOnCancel();

		// Assert
		Then.theValuesShouldNotBePersisted().
			and.iTeardownMyAppFrame();
	});

	Opa5.extendConfig({
		viewName : "Page",
		actions : new Opa5({
			_pressOnButton : function (sId) {
				return this.waitFor({
					id : sId,
					matchers: new PropertyStrictEquals({name: "enabled", value: true}),
					success : function (oButton) {
						oButton.$().trigger("tap");
					},
					errorMessage : "did not find the " + sId + " button"
				});
			},

			iPressOnEdit : function () {

				return this._pressOnButton("edit");

			},

			iPressOnSave : function () {

				return this._pressOnButton("save");

			},

			iPressOnCancel : function () {

				return this._pressOnButton("cancel");

			},

			iChangeValuesInTheForm : function () {

				return this.waitFor({
					id : ["name" , "country"],
					success : function (aInputs) {
						var oName = aInputs[0],
							oCountry = aInputs[1];

						var sName = oName.getValue();
						oName.setValue("Foobar");

						// helper function to select anything else except the currently selected item
						function generateRandomExcept(iMin, iMax, iIndex) {
							var iNum = Math.floor(Math.random() * (iMax - iMin + 1)) + iMin;
							return (iNum === iIndex ? generateRandomExcept(iMin, iMax, iIndex) : iNum);
						}

						var iSelectedIndex = oCountry.getSelectedIndex();
						var iAnotherIndex = generateRandomExcept(0, oCountry.getItems().length - 1, iSelectedIndex);
						var sSelectedCountry = oCountry.getSelectedItem().getText();
						var oAnotherCountry = oCountry.getItems()[iAnotherIndex];
						var sAnotherCountry = oAnotherCountry.getText();

						this.getContext().sSelectedCountry = sSelectedCountry;
						this.getContext().sAnotherCountry = sAnotherCountry;
						this.getContext().sName = sName;
						oCountry.setSelectedKey(oAnotherCountry.getKey());

						Opa5.assert.ok(true, "Selected the item with key '" + oAnotherCountry.getKey() + "'");
					},
					errorMessage : "did not find the inputs name and country"
				});

			}
		}),
		assertions : new Opa5({
			iShouldBeOnTheEditPage : function () {
				return this.waitFor({
					controlType: "sap.ui.layout.form.Form",
					success : function () {
						Opa5.assert.ok("Did navigate to the edit page");
					},
					errorMessage : "did not navigate to the edit page"
				});
			},

			theValuesShouldBePersisted : function () {
				return this.waitFor({
					id : ["nameText" , "countryText"],
					success : function (aInputs) {
						var oName = aInputs[0],
						oCountry = aInputs[1];

						Opa5.assert.strictEqual(oName.getText(), "Foobar", "the name text was correct");
						Opa5.assert.strictEqual(oCountry.getText(), this.getContext().sAnotherCountry, "the country text was correct");
					},
					errorMessage : "did not find the texts for country and name"
				});
			},

			theValuesShouldNotBePersisted : function () {
				return this.waitFor({
					id : ["nameText" , "countryText"],
					success : function (aInputs) {
						var oName = aInputs[0],
						oCountry = aInputs[1];

						Opa5.assert.strictEqual(oName.getText(), this.getContext().sName, "the name text was restored");
						Opa5.assert.strictEqual(oCountry.getText(), this.getContext().sSelectedCountry, "the country text was restored");
					},
					errorMessage : "did not find the texts for country and name"
				});
			}
		})
	});


}, /* bExport= */ true);
