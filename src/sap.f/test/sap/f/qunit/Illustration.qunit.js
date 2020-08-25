/*global QUnit, sinon*/
sap.ui.define([
	"sap/base/Log",
	"sap/f/Illustration",
	"sap/f/IllustrationPool",
	"sap/ui/core/Core"
],
function (
	Log,
	Illustration,
	IllustrationPool,
	Core
) {
	"use strict";

	/* --------------------------- Illustration Lifecycle -------------------------------------- */
	QUnit.module("Illustration - Lifecycle ", {
		beforeEach: function () {
			// Arrange
			this.oIllustration = new Illustration();
			this.oIllustration.placeAt("qunit-fixture");
			Core.applyChanges();
		},
		afterEach: function () {
			// Clean
			this.oIllustration.destroy();
			this.oIllustration = null;
		}
	});

	QUnit.test("onBeforeRendering", function (assert) {
		// Arrange
		var fnBuildSymbolSpy = sinon.spy(this.oIllustration, "_buildSymbolId"),
			fnLoadAssetSpy = sinon.spy(IllustrationPool, "loadAsset"),
			fnWarningSpy = sinon.spy(Log, "warning"),
			sDummySet = "sapIllus",
			sDummyMedia = "Dialog",
			sDummyType = "BeforeSearch";

		// Act
		this.oIllustration.onBeforeRendering();

		// Assert
		assert.ok(fnBuildSymbolSpy.calledOnce, "_buildSymbolId called once onBeforeRendering");
		assert.strictEqual(fnLoadAssetSpy.callCount, 0,
			"loadAsset function of the IllustrationPool is not called if the _sSymbolId is empty");
		assert.ok(fnWarningSpy.calledOnce, "warning function of the Log class called when the _sSymbolId is empty");
		assert.ok(fnWarningSpy.calledWithExactly(Illustration.CAN_NOT_BUILD_SYMBOL_MSG),
			"warning function of the Log class called with the correct static message");

		// Act
		fnWarningSpy.reset();
		this.oIllustration.setSet(sDummySet, true)
			.setMedia(sDummyMedia, true)
			.setType(sDummyType);
		Core.applyChanges();

		// Assert
		assert.ok(fnLoadAssetSpy.calledOnce, "loadAsset function of the IllustrationPool class called once onBeforeRendering _sSymbolId isn't empty");
		assert.ok(fnLoadAssetSpy.calledWithExactly(this.oIllustration._sSymbolId, this.oIllustration._sId),
			"loadAsset function of the IllustrationPool class called with the correct arguments (_sSymbolId and _sId)");
		assert.strictEqual(fnWarningSpy.callCount, 0, "warning function of the Log class isn't called when the symbol isn't empty");

		// Clean
		fnBuildSymbolSpy.restore();
		fnLoadAssetSpy.restore();
		fnWarningSpy.restore();
	});

	/* --------------------------- Illustration Private methods -------------------------------------- */
	QUnit.module("Illustration - Private methods ", {
		beforeEach: function () {
			// Arrange
			this.oIllustration = new Illustration();
			this.oIllustration.placeAt("qunit-fixture");
			Core.applyChanges();
		},
		afterEach: function () {
			// Clean
			this.oIllustration.destroy();
			this.oIllustration = null;
		}
	});

	QUnit.test("_buildSymbolId", function (assert) {
		// Arrange
		var sDummySet = "sapIllus",
			sDummyMedia = "Dialog",
			sDummyType = "BeforeSearch",
			sExpectedSymbol = sDummySet + "-" + sDummyMedia + "-" + sDummyType;

		// Act
		this.oIllustration._buildSymbolId();

		// Assert
		assert.strictEqual(this.oIllustration._sSymbolId, "",
			"_sSymbolId is built empty since some or all of the Illustration properties are missing");

		// Act
		this.oIllustration.setSet(sDummySet, true)
			.setMedia(sDummyMedia, true)
			.setType(sDummyType);
		Core.applyChanges();

		// Assert
		assert.strictEqual(this.oIllustration._sSymbolId, sExpectedSymbol,
			"_sSymbolId is built as expected when all of the Illustration properties are present");
	});

});
