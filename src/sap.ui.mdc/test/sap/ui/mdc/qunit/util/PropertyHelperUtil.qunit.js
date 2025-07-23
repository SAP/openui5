/*!
 * ${copyright}
 */

/* global QUnit, sinon */
/* eslint-disable no-new */

sap.ui.define([
	"sap/ui/mdc/util/PropertyHelperUtil",
	"sap/ui/VersionInfo"
], function(PropertyHelperUtil, VersionInfo) {
	"use strict";

	QUnit.module("API tests");

	QUnit.test("Does not call VersionInfo.load due to 2.0 issues (DINC0578994)", function(assert) {
		// Arrange
		const expectedValue = false;
		const oLoadSpy = sinon.spy(VersionInfo, "load");

		// Act
		const bValidated = PropertyHelperUtil.checkValidationExceptions();

		// Assert
		assert.strictEqual(bValidated, expectedValue, "Validation exceptions are not thrown");
		assert.ok(oLoadSpy.notCalled, "VersionInfo.load is not called");
	});
});