/*global QUnit */
sap.ui.define([
	"sap/ui/qunit/QUnitUtils",
	"sap/ui/qunit/utils/createAndAppendDiv",
	"sap/m/DraftIndicator"
], function(QUnitUtils, createAndAppendDiv, DraftIndicator) {
	"use strict";

	// prepare DOM
	createAndAppendDiv("qunit-fixture-visible");



	var oBundle = sap.ui.getCore().getLibraryResourceBundle("sap.m");
	var oCore = sap.ui.getCore();

	QUnit.module("id");

	QUnit.test("semantic control can be retrieved by Id", function (assert) {
		// Arrange
		var oDraftIndi = new DraftIndicator("draftId");

		assert.strictEqual(oDraftIndi.getId(), "draftId", "control has the expected id");

		// Act
		var oRetrievedIndi = sap.ui.getCore().byId("draftId");

		// Assert
		assert.notEqual(oRetrievedIndi, undefined, "the button is retrieved by id");
		assert.strictEqual(oRetrievedIndi.getId(), "draftId", "control has the expected id");

		oDraftIndi.destroy();
	});


	QUnit.module("states");

	QUnit.test("set 'Saving draft' and 'Clear Draft' state", function (assert) {
		// Arrange
		var oDraftIndi = new DraftIndicator();

		// System under test
		oDraftIndi.placeAt("qunit-fixture-visible");
		oCore.applyChanges();

		// Act
		oDraftIndi.showDraftSaving();
		// Assert
		assert.strictEqual(oDraftIndi._getLabel().getText(), oBundle.getText("DRAFT_INDICATOR_SAVING_DRAFT"), "Saving draft is shown");

		this.clock.tick(3000);

		// Act
		oDraftIndi.clearDraftState();
		// Assert
		assert.strictEqual(oDraftIndi._getLabel().getText(), "", "Draft saved is cleared");

		// Clean up
		oDraftIndi.destroy();
	});

	QUnit.test("set Draft Saved state and check that it is not cleared after default timeout", function (assert) {
		// Arrange
		var oDraftIndi = new DraftIndicator();

		// System under test
		oDraftIndi.placeAt("qunit-fixture-visible");
		oCore.applyChanges();

		// Act
		oDraftIndi.showDraftSaved();
		oCore.applyChanges();

		// Assert
		assert.strictEqual(oDraftIndi.$("label").text(), oBundle.getText("DRAFT_INDICATOR_DRAFT_SAVED"), "Draft saved is shown");
		this.clock.tick(1500);

		// Assert
		assert.ok(oDraftIndi.$("label").text() != "", "Draft saved state is not cleared after default timeout");

		// Clean up
		oDraftIndi.destroy();
	});

	QUnit.test("set Draft Saving state and check that if it is cleared after default timeout", function (assert) {
		// Arrange
		var oDraftIndi = new DraftIndicator();

		// System under test
		oDraftIndi.placeAt("qunit-fixture-visible");
		oCore.applyChanges();

		// Act
		oDraftIndi.showDraftSaving();
		oCore.applyChanges();

		// Assert
		assert.strictEqual(oDraftIndi.$("label").text(), oBundle.getText("DRAFT_INDICATOR_SAVING_DRAFT"), "Draft saved is shown");
		this.clock.tick(1500);

		// Assert
		assert.strictEqual(oDraftIndi.$("label").text(), "", "Draft saving state is cleared after default timeout");

		// Clean up
		oDraftIndi.destroy();
	});

	QUnit.test("the control doesn't recreate the label upon destruction", function (assert) {
		// Arrange
		var oDraftIndi = new DraftIndicator();

		// Act
		oDraftIndi.showDraftSaving();
		oDraftIndi.destroy();
		this.clock.tick(1500);

		// Assert
		assert.strictEqual(oDraftIndi.getAggregation("_label"), null, "The label was not recreated");

		// Clean up
		oDraftIndi.destroy();
	});
});