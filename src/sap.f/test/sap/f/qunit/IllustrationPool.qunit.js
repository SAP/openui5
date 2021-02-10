/*global QUnit, sinon*/
sap.ui.define([
	"sap/base/Log",
	"sap/f/IllustrationPool",
	"sap/ui/core/Core"
],
function (
	Log,
	IllustrationPool,
	Core
) {
	"use strict";

	/**
	 * STATIC MEMBERS
	 */
	var SAP_ILLUSTRATION_POOL_ID = 'sap-ui-illustration-pool',
		SAP_ILLUSTRATION_PATTERNS_NAME = '-Patterns',
		SAP_ILLUSTRATION_SET_NAME = 'sapIllus';

	/* --------------------------- Illustration Public methods -------------------------------------- */
	QUnit.module("loadAsset");

	QUnit.test("invalid asset ID", function (assert) {
		// Arrange
		var fnErrorSpy = sinon.spy(Log, "error"),
			fnRequireSvgSpy = sinon.spy(IllustrationPool, "_requireSVG"),
			sErrMsg = "ID of the asset can not be blank/empty.";

		IllustrationPool.loadAsset("");

		// Assert
		assert.ok(fnErrorSpy.calledOnce, "error is logged if an empty string is passed as asset ID");
		assert.ok(fnErrorSpy.calledWithExactly(sErrMsg), "error is logged with the correct error message");
		assert.strictEqual(fnRequireSvgSpy.callCount, 0, "no svg is required if the asset ID is invalid");

		// Clean
		fnErrorSpy.restore();
		fnRequireSvgSpy.restore();
	});

	QUnit.test("asset from unregistered Illustration Set", function (assert) {
		// Arrange
		var fnErrorSpy = sinon.spy(Log, "error"),
			fnRequireSvgSpy = sinon.spy(IllustrationPool, "_requireSVG"),
			sDummySet = "dummySet",
			sErrorMessage = "The illustration set '" + sDummySet + "' is not registered. Please register it before requiring one of its assets.";

		// Act
		IllustrationPool.loadAsset(sDummySet + "-Spot-DummyAsset");

		// Assert
		assert.ok(fnErrorSpy.calledOnce, "error is logged once");
		assert.ok(fnErrorSpy.calledWithExactly(sErrorMessage),
			"when we try to load asset from unregistered illustration set, the proper error message is logged");
		assert.strictEqual(fnRequireSvgSpy.callCount, 0, "no svg is required if the illustration set of the asset is unregistered");

		// Clean
		fnErrorSpy.restore();
		fnRequireSvgSpy.restore();
	});

	QUnit.test("valid asset ID", function (assert) {
		// Arrange
		var fnInfoSpy = sinon.spy(Log, "info"),
			fnRequireSvgSpy = sinon.spy(IllustrationPool, "_requireSVG"),
			fnUpdateDomSpy = sinon.spy(IllustrationPool, "_updateDOMPool"),
			sValidSet = SAP_ILLUSTRATION_SET_NAME,
			sValidAsset = sValidSet + "-Spot-BeforeSearch",
			sInfoMsg = "The asset with ID '" + sValidAsset + "' is either loaded or being loaded.",
			oRequireSVGPromise,
			done = assert.async();

		// Act
		IllustrationPool.loadAsset(sValidAsset);
		oRequireSVGPromise = fnRequireSvgSpy.returnValues[0];
		oRequireSVGPromise.then(function() {
			// Act
			IllustrationPool.loadAsset(sValidAsset, "testInstanceID");

			// Assert
			assert.ok(fnUpdateDomSpy.calledOnce,
				"_updateDOMPool is called once if we try to load asset which belongs to an instance and the asset is already cached/loaded");

			// End
			fnUpdateDomSpy.restore();
			done();
		});

		// Assert
		assert.expect(7);
		assert.ok(fnRequireSvgSpy.calledOnce, "asset is properly required once");
		assert.ok(oRequireSVGPromise instanceof Promise, "returned value from _requireSVG is a Promise");
		assert.ok(fnRequireSvgSpy.calledWithExactly(sValidSet, sValidAsset, undefined),
			"asset is required with the correct via the _requireSVG method with the correct arguments");

		// Act
		fnRequireSvgSpy.reset();
		IllustrationPool.loadAsset(sValidAsset);

		// Assert
		assert.ok(fnInfoSpy.calledOnce, "information is logged once");
		assert.ok(fnInfoSpy.calledWithExactly(sInfoMsg), "information is logged with the correct info message");
		assert.strictEqual(fnRequireSvgSpy.callCount, 0, "no svg is required if the asset is already required once");

		// Clean
		fnInfoSpy.restore();
		fnRequireSvgSpy.restore();
	});

	QUnit.module("registerIllustrationSet");

	QUnit.test("trying to register a set which is already registered or being registered", function (assert) {
		// Arrange
		var fnWarningSpy = sinon.spy(Log, "warning"),
			fnLoadMetadataSpy = sinon.spy(IllustrationPool, "_loadMetadata"),
			sWarningMsg = "Illustration Set already registered.",
			sWarningMsgPending = "Illustration Set is currently being loaded.",
			oLoadMetadataPromise,
			oDummySetConfig = {
				setFamily: "dummy",
				setURI: "dummyPath/"
			},
			done = assert.async();

		// Act
		IllustrationPool.registerIllustrationSet({setFamily: SAP_ILLUSTRATION_SET_NAME});

		// Assert
		assert.expect(8);
		assert.ok(fnWarningSpy.calledOnce, "warning is logged we try to register existing illustration set");
		assert.ok(fnWarningSpy.calledWithExactly(sWarningMsg), "warning is logged with the correct warning message");
		assert.strictEqual(fnLoadMetadataSpy.callCount, 0, "no metadata is required if the illustration set is registered");

		// Act
		fnWarningSpy.reset();
		fnLoadMetadataSpy.reset();
		IllustrationPool.registerIllustrationSet(oDummySetConfig);
		oLoadMetadataPromise = fnLoadMetadataSpy.returnValues[0];
		oLoadMetadataPromise.then(function() {
			// Clean
			fnWarningSpy.restore();
			fnLoadMetadataSpy.restore();
			done();
		});

		// Assert
		assert.ok(fnLoadMetadataSpy.calledOnce, "while registering the dummy illustration set, its metadata is required");
		assert.ok(fnLoadMetadataSpy.calledWithExactly(oDummySetConfig.setFamily, oDummySetConfig.setURI, undefined),
			"the correct arguments are passed to the _loadMetadata function");

		// Act
		fnLoadMetadataSpy.reset();
		IllustrationPool.registerIllustrationSet(oDummySetConfig);

		// Assert
		assert.ok(fnWarningSpy.calledOnce, "warning is logged we try to register pending illustration set");
		assert.ok(fnWarningSpy.calledWithExactly(sWarningMsgPending), "warning is logged with the correct warning message");
		assert.strictEqual(fnLoadMetadataSpy.callCount, 0, "no metadata is required if the illustration set is pending");

	});

	/* --------------------------- Illustration Private methods -------------------------------------- */
	QUnit.module("_addAssetToDOMPool");

	QUnit.test("assets are correctly added to the Illustration Pool's DOM Ref", function (assert) {
		// Arrange
		var	fnCreateDOMPoolSpy = sinon.spy(IllustrationPool, "_getDOMPool"),
			sDummyParagraphID = "testDOMparagraph";

		// Act
		IllustrationPool._addAssetToDOMPool("<p id=" + sDummyParagraphID + ">Test Dom Node</p>");

		// Assert
		assert.ok(fnCreateDOMPoolSpy.calledOnce, "create DOM is called once in the _addAssetToDOMPool method");
		assert.ok(jQuery("#" + SAP_ILLUSTRATION_POOL_ID).children("#" + sDummyParagraphID)[0],
			"the dummy DOM node is successfully added to the Illustration Pool's DOM Ref");

		// Clean
		fnCreateDOMPoolSpy.restore();
	});

	QUnit.module("_getDOMPool");

	QUnit.test("the Illustration Pool's DOM Ref is correctly returned when the Ref is already created", function (assert) {
		// Act
		IllustrationPool._getDOMPool(); // Force creation of DOM Pool if it isn't already created

		// Assert
		assert.strictEqual(IllustrationPool._getDOMPool(), jQuery("#" + SAP_ILLUSTRATION_POOL_ID)[0],
			"Illustration Pool's DOM Ref is correctly returned when it's already created");
	});

	QUnit.test("the Illustration Pool's DOM Ref is correctly created when the Ref is not already created", function (assert) {
		// Arrange
		var	fnLoadAssetSpy = sinon.spy(IllustrationPool, "loadAsset");

		// Act Remove the Illustration Pool's DOM Ref from the Static Area
		Core.getStaticAreaRef().removeChild(IllustrationPool._getDOMPool());

		// Assert
		assert.notOk(jQuery("#" + SAP_ILLUSTRATION_POOL_ID)[0],
			"Illustration Pool's DOM Ref is deleted");

		// Act
		IllustrationPool._getDOMPool();

		// Assert
		assert.ok(jQuery(Core.getStaticAreaRef()).children("#" + SAP_ILLUSTRATION_POOL_ID)[0],
			"Illustration Pool's DOM Ref is created anew and it's a child of the Static Area");
		assert.ok(fnLoadAssetSpy.calledOnce, "loadAsset is called once when we are creating the Illustration Pool's DOM Ref");
		assert.ok(fnLoadAssetSpy.calledWithExactly(SAP_ILLUSTRATION_SET_NAME + SAP_ILLUSTRATION_PATTERNS_NAME),
			"loadAsset is called with default patterns as argument");

		// Clean
		fnLoadAssetSpy.restore();
	});

	QUnit.module("_requireSVG");

	QUnit.test("invalid path", function (assert) {
		// Arrange
		var fnErrorSpy = sinon.spy(Log, "error"),
			sDummyID = "dummyID",
			sErrMsg = sDummyID + " asset could not be loaded",
			oRequireSVGPromise,
			done = assert.async();

		// Assert
		assert.expect(2);

		// Act
		oRequireSVGPromise = IllustrationPool._requireSVG(SAP_ILLUSTRATION_SET_NAME, sDummyID);
		oRequireSVGPromise.then(function() {
			// Assert
			assert.ok(fnErrorSpy.calledOnce, "error is logged once in the error of the oRequireSVGPromise");
			assert.ok(fnErrorSpy.calledWithExactly(sErrMsg), "error is logged with the correct message");

			// End
			fnErrorSpy.restore();
			done();
		});
	});

	QUnit.test("valid patterns path", function (assert) {
		// Arrange
		var fnAddAssetToDOMPoolSpy = sinon.spy(IllustrationPool, "_addAssetToDOMPool"),
			oRequireSVGPromise,
			done = assert.async();

		// Assert
		assert.expect(2);

		// Act
		oRequireSVGPromise = IllustrationPool._requireSVG(SAP_ILLUSTRATION_SET_NAME, SAP_ILLUSTRATION_SET_NAME + SAP_ILLUSTRATION_PATTERNS_NAME);
		oRequireSVGPromise.then(function(sHTML) {
			// Assert
			assert.ok(fnAddAssetToDOMPoolSpy.calledOnce, "_addAssetToDOMPool is called once in the success of the oRequireSVGPromise");
			assert.ok(fnAddAssetToDOMPoolSpy.calledWithExactly(sHTML),
				"_addAssetToDOMPool is called with the correct arguments (the loaded raw HTML string of the pattern)");

			// End
			fnAddAssetToDOMPoolSpy.restore();
			done();
		});
	});

	QUnit.test("valid asset path for an instance", function (assert) {
		// Arrange
		var fnUpdateDOMPoolSpy = sinon.spy(IllustrationPool, "_updateDOMPool"),
			oRequireSVGPromise,
			done = assert.async();

		// Assert
		assert.expect(1);

		// Act
		oRequireSVGPromise = IllustrationPool._requireSVG(SAP_ILLUSTRATION_SET_NAME, "sapIllus-Scene-NoEmail", "dummyInstance");
		oRequireSVGPromise.then(function() {
			// Assert
			assert.ok(fnUpdateDOMPoolSpy.calledOnce, "_updateDOMPool is called once in the success of the oRequireSVGPromise");

			// End
			fnUpdateDOMPoolSpy.restore();
			done();
		});
	});

	QUnit.module("_loadMetadata");

	QUnit.test("invalid metadata", function (assert) {
		// Arrange
		var fnErrorSpy = sinon.spy(Log, "error"),
			sInvalidPath = "testInvalidPath/",
			sErrMsg = "Metadata from: " + (sInvalidPath + "metadata.json") + " file path could not be loaded",
			oLoadMetadataPromise,
			done = assert.async();

		// Assert
		assert.expect(2);

		// Act
		oLoadMetadataPromise = IllustrationPool._loadMetadata("fakeName", sInvalidPath, false);

		oLoadMetadataPromise.then(function() {
			// Assert
			assert.ok(fnErrorSpy.calledOnce, "error is logged once in the error of the oLoadMetadataPromise");
			assert.ok(fnErrorSpy.calledWithExactly(sErrMsg), "error is logged with the correct message");

			// End
			fnErrorSpy.restore();
			done();
		});
	});

	QUnit.test("valid metadata", function (assert) {
		// Arrange
		var fnInfoSpy = sinon.spy(Log, "info"),
			fnLoadMetadataSpy = sinon.spy(IllustrationPool, "_loadMetadata"),
			fnMetadataLoadedSpy = sinon.spy(IllustrationPool, "_metadataLoaded"),
			oLoadMetadataPromise,
			setFamily = "tnt",
			setURI = sap.ui.require.toUrl("sap/tnt/themes/base/illustrations/"),
			bLoadAllResources = false,
			sInfoMsg = "Metadata for illustration set (" + setFamily + ") successfully loaded",
			done = assert.async();

		// Assert
		assert.expect(4);

		// Act
		IllustrationPool.registerIllustrationSet({
			setFamily: setFamily,
			setURI: setURI
		}, bLoadAllResources);
		oLoadMetadataPromise = fnLoadMetadataSpy.returnValues[0];
		oLoadMetadataPromise.then(function(oMetadataJSON) {
			// Assert
			assert.ok(fnInfoSpy.calledOnce, "info is logged once in the success of the oLoadMetadataPromise");
			assert.ok(fnInfoSpy.calledWithExactly(sInfoMsg), "info is logged with the correct message");
			assert.ok(fnMetadataLoadedSpy.calledOnce, "_metadataLoaded is called once in the success of the oLoadMetadataPromise");
			assert.ok(fnMetadataLoadedSpy.calledWithExactly(setFamily, oMetadataJSON, bLoadAllResources),
				"_metadataLoaded is with the correct arguments");

			// End
			fnInfoSpy.restore();
			fnLoadMetadataSpy.restore();
			fnMetadataLoadedSpy.restore();
			done();
		});
	});

	QUnit.module("_updateDOMPool");

	QUnit.test("adding new asset to the DOM node of the IllustrationPool", function (assert) {
		// Arrange
		var fnAddAssetSpy = sinon.spy(IllustrationPool, "_addAssetToDOMPool"),
			fnRequireSvgSpy = sinon.spy(IllustrationPool, "_requireSVG"),
			sValidAssetID = SAP_ILLUSTRATION_SET_NAME + "-Scene-BeforeSearch",
			oRequireSVGPromise,
			done = assert.async();

		// Assert
		assert.expect(3);

		// Act
		IllustrationPool.loadAsset(sValidAssetID, "id1");
		oRequireSVGPromise = fnRequireSvgSpy.returnValues[0];
		oRequireSVGPromise.then(function(sHTML) {
			// Assert
			assert.ok(fnAddAssetSpy.calledOnce,
				"_addAssetToDOMPool is called once when adding the new asset to the DOM Pool");
			assert.ok(fnAddAssetSpy.calledWithExactly(sHTML, sValidAssetID),
				"_addAssetToDOMPool is called with the correct arguments");
			assert.strictEqual(document.getElementById(SAP_ILLUSTRATION_POOL_ID), document.getElementById(sValidAssetID).parentNode,
				"newly loaded asset DOM Node is added to the Illustration Pool's DOM Node");

			// End
			fnRequireSvgSpy.restore();
			fnAddAssetSpy.restore();
			done();
		});
	});

	QUnit.test("adding existing asset to the DOM node of the IllustrationPool", function (assert) {
		// Arrange
		var fnAddAssetSpy = sinon.spy(IllustrationPool, "_addAssetToDOMPool"),
			fnUpdateDOMPoolSpy = sinon.spy(IllustrationPool, "_updateDOMPool"),
			sValidAssetID = SAP_ILLUSTRATION_SET_NAME + "-Scene-BeforeSearch";

		// Act
		IllustrationPool.loadAsset(sValidAssetID, "id2");

		// Assert
		assert.ok(fnUpdateDOMPoolSpy.calledOnce,
			"_updateDOMPool is called once when trying to add the existing asset to the DOM Pool");
		assert.strictEqual(fnAddAssetSpy.callCount, 0,
			"_addAssetToDOMPool is not called when trying to add existing asset to the DOM Pool");

		// Clean
		fnAddAssetSpy.restore();
		fnUpdateDOMPoolSpy.restore();
	});

	QUnit.test("removing an asset which is no longer used from the DOM node of the IllustrationPool", function (assert) {
		// Arrange
		var fnRemoveAssetSpy = sinon.spy(IllustrationPool, "_removeAssetFromDOMPool"),
			fnRequireSvgSpy = sinon.spy(IllustrationPool, "_requireSVG"),
			oRequireSVGPromise,
			sAssetToBeDeletedID = SAP_ILLUSTRATION_SET_NAME + "-Scene-BeforeSearch",
			sValidAssetID = SAP_ILLUSTRATION_SET_NAME + "-Dialog-BeforeSearch",
			done = assert.async();

		// Assert
		assert.expect(3);

		// Act
		IllustrationPool.loadAsset(sValidAssetID, "id1");

		oRequireSVGPromise = fnRequireSvgSpy.returnValues[0];
		oRequireSVGPromise.then(function() {

			// Act
			IllustrationPool.loadAsset(sValidAssetID, "id2");

			// Assert
			assert.ok(fnRemoveAssetSpy.calledOnce,
				"_removeAssetFromDOMPool is called once when removing the asset which is no longer used by an instance from the DOM Pool");
			assert.ok(fnRemoveAssetSpy.calledWithExactly(sAssetToBeDeletedID),
				"_removeAssetFromDOMPool is called with the correct arguments");
			assert.strictEqual(document.getElementById(sAssetToBeDeletedID), null,
				"the removed asset no longer exists in the DOM");

			// End
			fnRequireSvgSpy.restore();
			fnRemoveAssetSpy.restore();
			done();
		});
	});

});
