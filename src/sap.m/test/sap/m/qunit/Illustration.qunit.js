/*global QUnit*/
sap.ui.define([
	"sap/base/Log",
	"sap/m/Illustration",
	"sap/m/IllustrationPool",
	"sap/ui/core/Core",
	"sap/ui/core/InvisibleText",
	"sap/ui/core/Theming"
],
function (
	Log,
	Illustration,
	IllustrationPool,
	Core,
	InvisibleText,
	Theming
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
		var fnBuildSymbolSpy = this.spy(this.oIllustration, "_buildSymbolId"),
			fnLoadAssetSpy = this.spy(IllustrationPool, "loadAsset"),
			fnWarningStub = this.stub(Log, "warning"),
			sDummySet = "sapIllus",
			sDummyMedia = "Dialog",
			sDummyType = "BeforeSearch";

		// Act
		this.oIllustration.onBeforeRendering();

		// Assert
		assert.ok(fnBuildSymbolSpy.calledOnce, "_buildSymbolId called once onBeforeRendering");
		assert.strictEqual(fnLoadAssetSpy.callCount, 0,
			"loadAsset function of the IllustrationPool is not called if the _sSymbolId is empty");
		assert.ok(fnWarningStub.calledOnce, "warning function of the Log class called when the _sSymbolId is empty");
		assert.ok(fnWarningStub.calledWithExactly(Illustration.CAN_NOT_BUILD_SYMBOL_MSG),
			"warning function of the Log class called with the correct static message");

		// Act
		fnWarningStub.resetHistory();
		this.oIllustration.setSet(sDummySet, true)
			.setMedia(sDummyMedia, true)
			.setType(sDummyType);
		Core.applyChanges();

		// Assert
		assert.ok(fnLoadAssetSpy.calledOnce, "loadAsset function of the IllustrationPool class called once onBeforeRendering _sSymbolId isn't empty");
		assert.ok(fnLoadAssetSpy.calledWithExactly(this.oIllustration._sSymbolId, this.oIllustration._sId, this.oIllustration._sIdPrefix),
			"loadAsset function of the IllustrationPool class called with the correct arguments (_sSymbolId, _sId, _sIdPrefix)");
		assert.strictEqual(fnWarningStub.callCount, 0, "warning function of the Log class isn't called when the symbol isn't empty");

		// Clean
		fnBuildSymbolSpy.restore();
		fnLoadAssetSpy.restore();
		fnWarningStub.restore();
	});

	QUnit.test("onThemeChanged", function (assert) {
		// Arrange
		var fnInvalidateSpy = this.spy(this.oIllustration, "invalidate");

		// Act
		this.oIllustration.onThemeChanged();

		// Assert
		assert.ok(fnInvalidateSpy.calledOnce, "invalidate function called once onThemeChanged");

		// Clean
		fnInvalidateSpy.restore();
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

	QUnit.test("_buildSymbolId formats to mapped values", function (assert) {
		// load metadata with mappings
		var sDummySet = "sapIllus",
			sDummyMedia = "Dialog",
			sDummyType = "TestSymbol",
			metadata = {
			symbols: [
				"TestSymbol"
			],
			collections: [{
				prefix: "v5/",
				mappings: {
					"TestSymbol": "TestSymbol_fiori3"
				}
			}]
		};

		// Act
		IllustrationPool._metadataLoaded('sapIllus', metadata, false);
		this.oIllustration
			.setSet(sDummySet, true)
			.setMedia(sDummyMedia, true)
			.setType(sDummyType);

		Theming.setTheme("sap_horizon");
		Core.applyChanges();

		this.oIllustration._buildSymbolId();

		// Assert
		assert.strictEqual(this.oIllustration._sSymbolId, "sapIllus-Dialog-TestSymbol_fiori3", "Symbol ID is built with mapped value");
		assert.strictEqual(this.oIllustration._sIdPrefix, "v5/", "ID prefix is built with mapped value");
	});

	/* --------------------------- Illustrattion Associations -------------------------------------- */
	QUnit.module("Illustrattion - Associations ", {
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

	QUnit.test("Testing ariaLabelledBy association", function (assert) {

		// Arrange
		new InvisibleText("illustration_label", {text: "My label"}).toStatic();

		var $illustration = this.oIllustration.$();

		// Act
		this.oIllustration.addAriaLabelledBy('illustration_label');
		Core.applyChanges();

		// Assert
		assert.equal($illustration.attr("aria-labelledby"), 'illustration_label');
	});

});
