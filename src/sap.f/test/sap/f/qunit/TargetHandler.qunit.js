/*global QUnit */

sap.ui.define([
	"sap/f/routing/TargetHandler",
    "sap/m/Dialog"
],
function (
	TargetHandler, Dialog
) {
	"use strict";

	QUnit.module("Basic functionality");

	QUnit.test("Closing Dialogs when navigating back", function (assert) {

		// Arrange
		var oTargetHandler = new TargetHandler(),
            oDialog = new Dialog(),
			oStub = this.stub(oTargetHandler, "_getDirection").callsFake(function () {
				return true;
			}),
			oSpy = this.spy(oDialog, "close");

        // Act
        oDialog.open();
        oTargetHandler.navigate({});

        // Assert
		assert.ok(oSpy.called, true, "Dialog is closed");


		// Clean up
		oTargetHandler.destroy();
		oStub.restore();
	});
});