/* global QUnit */
QUnit.config.autostart = false;

sap.ui.require([
	"sap/ui/test/Opa5",
	"sap/ui/test/opaQunit",
	"sap/ui/fl/FakeLrepConnectorSessionStorage",
	"test-resources/sap/ui/fl/testutils/opa/TestLibrary"
], function (
	Opa5,
	opaTest,
	FakeLrepConnectorSessionStorage
) {
	"use strict";

	var VM_ID = "Comp1---IDView--idVariantManagementCtrl";

	Opa5.extendConfig({
		viewName: "VariantManagement",
		viewNamespace: "sap.ui.fl.sample.variantmanagement",
		autoWait: true,
		async: false,
		timeout: 15,
		arrangements: new Opa5({
			iStartMyApp: function () {
				return this.iStartMyAppInAFrame(
					sap.ui.require.toUrl(
						"sap/ui/fl/qunit/variants/variantmanagement/index.html"
					)
				);
			},
			iClearTheSessionLRep: function () {
				FakeLrepConnectorSessionStorage.forTesting.synchronous.clearAll();
				window.sessionStorage.removeItem("sap.ui.rta.restart.CUSTOMER");
				window.sessionStorage.removeItem("sap.ui.rta.restart.USER");
				localStorage.clear();
			}
		}),
		actions: new Opa5({
		}),
		assertions: new Opa5({
		})
	});


	QUnit.module("EndUserTesting");

	opaTest("1. expected view 'Standard' should be displayed", function(Given, When, Then) {
		Given.iClearTheSessionLRep();
		Given.iStartMyApp();

		Then.onFlVariantManagement.theVariantShouldBeDisplayed(VM_ID, "Standard");
	});

	opaTest("2. 'My Views': [Standard] should be displayed", function(Given, When, Then) {
		When.onFlVariantManagement.iOpenMyView(VM_ID);

		Then.onFlVariantManagement.theMyViewShouldContain(VM_ID, ["Standard"]);
	});

	opaTest("3. 'Save View': opens dialog", function(Given, When, Then) {
		When.onFlVariantManagement.iOpenSaveView(VM_ID);

		Then.onFlVariantManagement.theOpenSaveViewDialog(VM_ID);
	});

	opaTest("4. 'Save View': a new private view 'NewViewPrivate' will be created", function(Given, When, Then) {
		When.onFlVariantManagement.iCreateNewVariant(VM_ID, "NewViewPrivate", true, false, false);

		Then.onFlVariantManagement.theVariantShouldBeDisplayed(VM_ID, "NewViewPrivate");
	});

	opaTest("5. 'My Views': [Standard, NewViewPrivate] should be displayed", function(Given, When, Then) {
		When.onFlVariantManagement.iOpenMyView(VM_ID);

		Then.onFlVariantManagement.theMyViewShouldContain(VM_ID, ["Standard", "NewViewPrivate"]);
	});

	opaTest("6. 'Save View': a new public view 'NewViewPrivate' will be created", function(Given, When, Then) {
		When.onFlVariantManagement.iOpenSaveView(VM_ID);
		Then.onFlVariantManagement.theOpenSaveViewDialog(VM_ID);
		When.onFlVariantManagement.iCreateNewVariant(VM_ID, "NewViewPublic", false, true, true);

		Then.onFlVariantManagement.theVariantShouldBeDisplayed(VM_ID, "NewViewPublic");
	});

	opaTest("7. 'My Views': [Standard, NewViewPrivate, NewViewPublic] should be displayed", function(Given, When, Then) {
		When.onFlVariantManagement.iOpenMyView(VM_ID);

		Then.onFlVariantManagement.theMyViewShouldContain(VM_ID, ["Standard", "NewViewPrivate", "NewViewPublic"]);
	});

	opaTest("8. 'Manage Views': opens dialog", function(Given, When, Then) {
		When.onFlVariantManagement.iOpenManageViews(VM_ID);

		Then.onFlVariantManagement.theOpenManageViewsDialog(VM_ID);
	});

	opaTest("9. 'Manage Views': checking content", function(Given, When, Then) {
		Then.onFlVariantManagement.theOpenManageViewsDialogDefaultShouldBe("NewViewPrivate");
		Then.onFlVariantManagement.theOpenManageViewsDialogTitleShouldContain(["Standard", "NewViewPrivate", "NewViewPublic"]);
		Then.onFlVariantManagement.theOpenManageViewsDialogFavoritesShouldContain([true, true, true]);
		Then.onFlVariantManagement.theOpenManageViewsDialogApplyAutomaticallyShouldContain([false, false, true]);
	});

	opaTest("10. 'Manage Views': adapting and saving content", function(Given, When, Then) {
		When.onFlVariantManagement.iSetDefaultVariant("NewViewPublic");
		When.onFlVariantManagement.iRenameVariant("NewViewPrivate", "PrivateNewVariant");
		When.onFlVariantManagement.iSetFavoriteVariant("PrivateNewVariant", false);
		When.onFlVariantManagement.iApplyAutomaticallyVariant("PrivateNewVariant", true);

		Then.onFlVariantManagement.theOpenManageViewsDialogTitleShouldContain(["Standard", "PrivateNewVariant", "NewViewPublic"]);
		Then.onFlVariantManagement.theOpenManageViewsDialogFavoritesShouldContain([true, false, true]);
		Then.onFlVariantManagement.theOpenManageViewsDialogApplyAutomaticallyShouldContain([false, true, true]);

		When.onFlVariantManagement.iPressTheManageViewsSave(VM_ID);
		Then.onFlVariantManagement.theVariantShouldBeDisplayed(VM_ID, "NewViewPublic");
	});

	opaTest("11. 'My Views': [Standard, NewViewPublic] should be displayed", function(Given, When, Then) {
		When.onFlVariantManagement.iOpenMyView(VM_ID);

		Then.onFlVariantManagement.theMyViewShouldContain(VM_ID, ["Standard", "NewViewPublic"]);
	});

	opaTest("12. 'Manage Views': checking content and leaving via 'Cancel'", function(Given, When, Then) {
		When.onFlVariantManagement.iOpenManageViews(VM_ID);
		Then.onFlVariantManagement.theOpenManageViewsDialog(VM_ID);

		Then.onFlVariantManagement.theOpenManageViewsDialogDefaultShouldBe("NewViewPublic");
		Then.onFlVariantManagement.theOpenManageViewsDialogTitleShouldContain(["Standard", "NewViewPublic", "PrivateNewVariant"]);
		Then.onFlVariantManagement.theOpenManageViewsDialogFavoritesShouldContain([true, true, false]);
		Then.onFlVariantManagement.theOpenManageViewsDialogApplyAutomaticallyShouldContain([false, true, true]);

		When.onFlVariantManagement.iPressTheManageViewsCancel(VM_ID);
	});

	opaTest("13. 'Manage Views': reopening dialog and removing the current default variant", function(Given, When, Then) {
		When.onFlVariantManagement.iOpenMyView(VM_ID);
		When.onFlVariantManagement.iOpenManageViews(VM_ID);
		Then.onFlVariantManagement.theOpenManageViewsDialog(VM_ID);

		Then.onFlVariantManagement.theOpenManageViewsDialogDefaultShouldBe("NewViewPublic");
		When.onFlVariantManagement.iRemoveVariant("NewViewPublic");
		When.onFlVariantManagement.iPressTheManageViewsSave(VM_ID);
	});

	opaTest("14: expected view 'Standard' should be displayed", function(Given, When, Then) {
		Then.onFlVariantManagement.theVariantShouldBeDisplayed(VM_ID, ["Standard"]);

		// Shutdown
		Given.iTeardownMyAppFrame();
	});


	QUnit.start();
});
