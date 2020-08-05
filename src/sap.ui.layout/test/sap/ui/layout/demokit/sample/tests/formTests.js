/* global QUnit */
QUnit.config.autostart = false;

sap.ui.getCore().attachInit(function () {
	"use strict";

	sap.ui.require([
		"sap/ui/test/Opa5",
		"sap/ui/test/opaQunit",
		"sap/ui/layout/sample/tests/actions/formTests",
		"sap/ui/layout/sample/tests/assertions/formTests"
	], function (Opa5, opaTest, Actions, Assertions) {
		var sSampleName = document.querySelector("[data-sample-component]").dataset.sampleComponent;

		Opa5.extendConfig({
			viewNamespace: sSampleName + ".",
			arrangements: new Opa5({
				iStartTheFormSample: function () {
					return this.iStartMyUIComponent({
						componentConfig: {
							name: sSampleName,
							manifest: true
						}
					});
				}
			}),
			autoWait: true,
			viewName: "Page",
			actions: Actions,
			assertions: Assertions
		});

		QUnit.module("EditSave");

		opaTest("Should go to the edit page", function (Given, When, Then) {
			// Arrange
			Given.iStartTheFormSample();

			// Act
			When.iPressOnEdit();

			// Assert
			Then.iShouldBeOnTheEditPage();
		});

		opaTest("Should persist the values", function (Given, When, Then) {
			// Act
			When.iChangeValuesInTheForm().
				and.iPressOnSave();

			// Assert
			Then.theValuesShouldBePersisted().
				and.iTeardownMyUIComponent();
		});

		QUnit.module("EditCancel");

		opaTest("Should go to the edit page", function (Given, When, Then) {
			// Arrange
			Given.iStartTheFormSample();

			// Act
			When.iPressOnEdit();

			// Assert
			Then.iShouldBeOnTheEditPage();
		});

		opaTest("Should restore the values", function (Given, When, Then) {
			// Act
			When.iChangeValuesInTheForm().
				and.iPressOnCancel();

			// Assert
			Then.theValuesShouldNotBePersisted().
				and.iTeardownMyUIComponent();
		});
		QUnit.start();
	});
});