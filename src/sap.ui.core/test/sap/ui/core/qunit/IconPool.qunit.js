
/* global QUnit */
sap.ui.define([
	"sap/ui/core/IconPool",
	"sap/ui/core/Icon",
	"sap/m/Image",
	"sap/base/Log"
], function(IconPool, Icon, Image, Log) {
	"use strict";

	var sBasePath = sap.ui.require.toUrl("");

	QUnit.module("Basic");

	QUnit.test("Constructor should throw an error", function(assert) {

		assert.throws(function() {
			new IconPool();
		}, "called with new");

		assert.throws(function() {
			IconPool();
		}, "called without new");

	});


	QUnit.module("Methods");

	QUnit.test("insertFontFaceStyle", function(assert) {
		assert.equal(jQuery("head > link[type='text/css']").get(0), null, "Style should not have been inserted.");

		// insert sap-icons font
		IconPool.insertFontFaceStyle();

		var oLinkElement = jQuery("head > link[type='text/css']");
		assert.ok(oLinkElement.length === 0, "Link element isn't created because the font-face is declared in the library.css");
	});

	QUnit.test("createControlByURI", function(assert) {
		var oAssertStub = this.stub(jQuery.sap, "assert").callsFake(function(bCondition) {
			if (!bCondition) {
				assert.ok(false, "Condition check shouldn't fail");
			}
		});

		var oFontIcon = IconPool.createControlByURI({
			src: "sap-icon://add",
			tap: function() {},
			densityAware: false,
			size: "2.5rem"
		});
		assert.equal(oFontIcon.getSrc(), "sap-icon://add", "icon: 'src' should be correct.");
		assert.equal(oFontIcon.mEventRegistry.press.length, 1, "icon: deprecated 'tap' event will be registered as 'press'.");

		var oImgIcon = IconPool.createControlByURI({
			src: "../images/help.gif",
			tap: function() {},
			densityAware: false,
			size: "2.5rem"
		}, Image);
		assert.equal(oImgIcon.getSrc(), "../images/help.gif", "img: 'src' should be correct.");

		oImgIcon = IconPool.createControlByURI("../images/help.gif", Image);
		assert.equal(oImgIcon.getSrc(), "../images/help.gif", "img: 'src' should be correct.");

		oAssertStub.restore();
	});

	QUnit.test("addIcon / getIconURI / getIconInfo", function(assert) {
		// legacy syntax
		IconPool.addIcon("legacy-syntax", "collection-1", "Arial", "beef", false, false);
		assert.equal(IconPool.getIconURI("legacy-syntax", "collection-1"), "sap-icon://collection-1/legacy-syntax", "'legacy-syntax' icon uri correct.");
		assert.deepEqual(IconPool.getIconInfo("sap-icon://collection-1/legacy-syntax"), {
			collection: "collection-1",
			content: String.fromCharCode("0xbeef"),
			fontFamily: "Arial",
			name: "legacy-syntax",
			skipMirroring: false,
			suppressMirroring: false,
			text: "",
			uri: "sap-icon://collection-1/legacy-syntax"
		}, "'legacy-syntax' icon info correct.");

		// add icon twice
		assert.equal(IconPool.addIcon("legacy-syntax", "collection-1", "Arial", "beef", false, false), undefined,
			"Adding an icon twice without override should return 'undefined' instead of the icon info object.");

		// single char
		var oIcon1 = IconPool.addIcon("test01", "test", {
			content: "0000"
		});
		var oIcon2 = IconPool.addIcon("test02", "test", {
			content: ["0000"]
		});

		var oIcon3 = IconPool.addIcon("test03", "test", {
			content: "0f0f"
		});
		var oIcon4 = IconPool.addIcon("test04", "test", {
			content: ["0f0f"]
		});

		// multi char
		var oIcon5 = IconPool.addIcon("test05", "test", {
			content: ["ffff", "dead"]
		});
		var oIcon6 = IconPool.addIcon("test06", "test", {
			content: ["f0f0", "dead"]
		});

		var oIcon7 = IconPool.addIcon("test07", "test", {
			content: "f0f0"
		});
		oIcon7.content += String.fromCharCode(0xdead);
		var oIcon8 = IconPool.getIconInfo("test07", "test");

		assert.equal(oIcon1.content, String.fromCharCode(0x0000), "0000-Icons have correct content");
		assert.equal(oIcon2.content, String.fromCharCode(0x0000), "0000-Icons have correct content");
		assert.equal(oIcon1.content, oIcon2.content, "0000-Icons match");

		assert.equal(oIcon3.content, String.fromCharCode(0x0f0f), "0000-Icons have correct content");
		assert.equal(oIcon4.content, String.fromCharCode(0x0f0f), "0000-Icons have correct content");
		assert.equal(oIcon3.content, oIcon4.content, "0f0f-Icons match");

		assert.equal(oIcon5.content, String.fromCharCode(0xffff) + String.fromCharCode(0xdead), "Multi-Icons have correct content");
		assert.equal(oIcon6.content, String.fromCharCode(0xf0f0) + String.fromCharCode(0xdead), "Multi-Icons have correct content");

		assert.equal(oIcon7.content, String.fromCharCode(0xf0f0) + String.fromCharCode(0xdead), "Multi-Icons have correct content");
		assert.equal(oIcon8.content, String.fromCharCode(0xf0f0) + String.fromCharCode(0xdead), "Multi-Icons have correct content");
		assert.equal(oIcon7, oIcon8, "Multi-Icons have correct content");

	});

	QUnit.test("getIconInfo: icons under the undefined collection", function(assert) {
		var oIconInfo = IconPool.getIconInfo("manager");

		assert.strictEqual(oIconInfo.collectionName, undefined, "The default collection name should be undefined");
		assert.equal(oIconInfo.uri, "sap-icon://manager", "The default collectionName doesn't appear in uri");
	});

	QUnit.test("addIcon: the default icons shouldn't be modified with collection name 'undefined'", function(assert) {
		var oIconInfo = IconPool.getIconInfo("manager");

		IconPool.addIcon("manager", "undefined", {
			content: oIconInfo.content.charCodeAt(0) + 0x1000,
			overWrite: true
		});

		var oNewIconInfo = IconPool.getIconInfo("manager");

		assert.equal(oNewIconInfo.content, oIconInfo.content, "the defualt collection can't be overwritten");
	});

	QUnit.test("isIconURI", function(assert) {
		assert.equal(IconPool.isIconURI(), false, "Should return 'false' when no URI is provided.");
		assert.equal(IconPool.isIconURI("sap-icon://"), false, "Should return 'false' when no hostname is provided.");
		assert.equal(IconPool.isIconURI("sap-icon://foo"), true, "Should return 'true' for valid icon URIs.");
	});

	QUnit.test("getIconCollectionNames", function(assert) {
		assert.deepEqual(IconPool.getIconCollectionNames(), ["undefined", "collection-1", "test"], "Correct set of collections should be returned.");
	});

	QUnit.test("getIconNames", function(assert) {

		// default collection
		assert.ok(Object.keys(IconPool.getIconNames()).length > 10, "Default collection should have more than 10 icons.");

		// custom collection
		assert.deepEqual(IconPool.getIconNames("collection-1"), ["legacy-syntax"], "Correct set of icons for 'collection-1' should be returned.");

	});

	QUnit.test("getIconForMimeType", function(assert) {
		assert.equal(IconPool.getIconForMimeType("image/png"), "sap-icon://attachment-photo", "Should return 'attachment-photo' icon URI for png files.");
		assert.equal(IconPool.getIconForMimeType("application/vnd.ms-excel"), "sap-icon://excel-attachment", "Should return 'excel-attachment' icon URI for xls files.");
		assert.equal(IconPool.getIconForMimeType("text/x-foo-bar"), "sap-icon://document", "Should return 'document' icon URI as fallback.");
	});

	QUnit.test("getIconInfo with sap-icon://undefined/wrench", function(assert) {
		var oIconInfo = IconPool.getIconInfo("sap-icon://undefined/wrench");
		assert.strictEqual(oIconInfo.collectionName, undefined, "the string undefined is converted back");
		assert.strictEqual(oIconInfo.name, "wrench", "iconName is correctly parsed");
	});

	QUnit.module("Loading of additional icon fonts");

	QUnit.test("insertFontFaceStyle", function(assert) {
		var iCountStyles = jQuery("head > style[type='text/css']").length;

		IconPool.registerFont({
			fontFamily: "SAP-icons-TNT",
			fontURI: jQuery.sap.getModulePath("sap.tnt.themes.base.fonts")
		});

		// insert sap-icons-TNT font
		IconPool.insertFontFaceStyle("SAP-icons-TNT", jQuery.sap.getModulePath("sap.tnt.themes.base.fonts", "/"));
		assert.strictEqual(jQuery("head > style[type='text/css']").length, iCountStyles + 1, "The icon font has been added to the CSS");
		var sCss = jQuery("head > style[type='text/css']").text();

		assert.ok(sCss.indexOf("url('" + sBasePath + "/sap/tnt/themes/base/fonts/SAP-icons-TNT") !== -1,
			"TNT Font should have been included from sap.tnt base theme folder.");

		// insert font again
		IconPool.insertFontFaceStyle("SAP-icons-TNT", jQuery.sap.getModulePath("sap.tnt.themes.base.fonts"));
		assert.strictEqual(jQuery("head > style[type='text/css']").length, iCountStyles + 1, "Fonts should only be included once");
	});

	QUnit.test("insertFontFaceStyle: insert an unregistered font logs an error", function(assert) {
		var iCountStyles = jQuery("head > style[type='text/css']").length;

		// inserting a font that is not registered must fail
		var oErrorSpy = this.spy(Log, "error");

		IconPool.insertFontFaceStyle("unRegisteredFont", jQuery.sap.getModulePath("sap.tnt.themes.base.fonts", "/"));
		assert.strictEqual(jQuery("head > style[type='text/css']").length, iCountStyles, "Inserting a unregistered font does not insert a new style tag");
		assert.strictEqual(oErrorSpy.callCount, 1, "Inserting an unregistered font logs an error");
	});

	QUnit.test("insertFontFaceStyle: no need to insert font face for the default font", function(assert) {
		var iCountStyles = jQuery("head > style[type='text/css']").length;

		var oInfoSpy = this.spy(Log, "info");

		IconPool.registerFont({
			fontFamily: "SAP-icons-TNT",
			collectionName: "overwriteDefaultFont",
			fontURI: jQuery.sap.getModulePath("sap.tnt.themes.base.fonts")
		});

		// overwriting SAP-icons with a different font must fail
		IconPool.insertFontFaceStyle("SAP-icons", jQuery.sap.getModulePath("sap.tnt.themes.base.fonts", "/"), "overwriteDefaultFont");
		assert.strictEqual(jQuery("head > style[type='text/css']").length, iCountStyles, "Inserting a new font as 'SAP-icons' must not insert a new style tag");
		assert.strictEqual(oInfoSpy.callCount, 1, "Inserting font face for default font leads to an info log");
	});

	QUnit.test("insertFontFaceStyle: must provide a path for the font", function(assert) {
		var iCountStyles = jQuery("head > style[type='text/css']").length;
		var oErrorSpy = this.spy(Log, "error");

		IconPool.insertFontFaceStyle("Some-font-name");

		assert.strictEqual(jQuery("head > style[type='text/css']").length, iCountStyles, "Inserting a new font as 'SAP-icons' must not insert a new style tag");
		assert.strictEqual(oErrorSpy.callCount, 1, "Log an error when insertFontFaceStyle is called with only one parameter");
	});

	QUnit.test("registerFont without fontURI", function(assert) {
		var oErrorSpy = this.spy(Log, "error");

		IconPool.registerFont({});
		assert.strictEqual(oErrorSpy.callCount, 1, "Registering a font without the configuration parameter fontURI throws an error");
	});

	QUnit.test("registerFont: trying to overwrite the default font family logs an error", function(assert) {
		var oErrorSpy = this.spy(Log, "error");

		IconPool.registerFont({
			fontFamily: "SAP-icons",
			collectionName: "overwriteDefaultFont",
			fontURI: jQuery.sap.getModulePath("sap.tnt.themes.base.fonts")
		});
		assert.strictEqual(oErrorSpy.callCount, 1, "Re-registering the default font family logs an error");
	});

	QUnit.test("registerFont two times throws a warning", function(assert) {
		var oWarningSpy = this.spy(Log, "warning");

		IconPool.registerFont({
			fontFamily: "TwoTimes",
			fontURI: jQuery.sap.getModulePath("sap.tnt.themes.base.fonts"),
			lazy: true
		});
		IconPool.registerFont({
			fontFamily: "TwoTimes",
			fontURI: jQuery.sap.getModulePath("sap.tnt.themes.base.fonts"),
			lazy: true
		});
		assert.strictEqual(oWarningSpy.callCount, 1, "Registering a font with the same name twice throws a warning");
	});

	QUnit.test("registerFont does not throw an error when an icon has been manually registered with the same collection name", function(assert) {
		var oErrorSpy = this.spy(Log, "error");

		// single char
		IconPool.addIcon("someIcon", "testAddIcon", {
			content: "0000"
		});

		IconPool.getIconInfo("someNonExistingIcon", "testAddIcon");
		IconPool.getIconInfo("sap-icon://testAddIcon/someNonExistingIcon");

		assert.strictEqual(oErrorSpy.callCount, 0, "Fetching a manually registered icon does not throw an error");
	});

	QUnit.test("registerFont (async metadata)", function(assert) {
		var done = assert.async();

		// stub the ajax method
		var stub = this.stub(jQuery, 'ajax');
		stub.yieldsTo('success', {
			"technicalsystem": "0xe000"
		});

		// register TNT icon font
		IconPool.registerFont({
			fontFamily: "SAP-icons-TNT",
			collectionName: "tntasync",
			fontURI: jQuery.sap.getModulePath("sap.tnt.themes.base.fonts"),
			lazy: true
		});

		// before the icon font metadata is loaded a Promise is returned
		var oIconInfo = IconPool.getIconInfo("sap-icon://tntasync/technicalsystem", undefined, "async");
		assert.ok(oIconInfo instanceof Promise, "getIconInfo returned a promise when trying to fetch an icon that is not loaded yet");

		// after the font is loaded the content is also resolved properly based on the metadata
		oIconInfo.then(function() {
			var oIconInfo = IconPool.getIconInfo("sap-icon://tntasync/technicalsystem", undefined, "mixed");
			assert.ok(!(oIconInfo instanceof Promise), "getIconInfo returned the info when trying to fetch an icon that is already loaded with mixed mode");
			assert.equal(oIconInfo.collection, "tntasync", "Icon collection is correct");
			assert.equal(oIconInfo.fontFamily, "SAP-icons-TNT", "Icon font family is correct");
			assert.equal(oIconInfo.content, String.fromCharCode(0xe000), "Icon content has been resolved properly");
			done();
		});
	});

	QUnit.test("registerFont (async metadata error)", function(assert) {
		var done = assert.async();

		// stub the ajax method
		var oErrorSpy = this.spy(Log, "error");
		var stub = this.stub(jQuery, 'ajax');
		stub.yieldsTo('error', {});

		// register TNT icon font
		IconPool.registerFont({
			fontFamily: "some-wrong-font-family",
			collectionName: "wrong",
			fontURI: "some/wrong/path",
			lazy: true
		});

		IconPool._loadFontMetadata("wrong", true).then(function() {
			assert.ok(true, "The _loadFontMetadata promise failed");
			assert.strictEqual(oErrorSpy.callCount, 1, "Loading a font with wrong metadata triggers an error");

			done();
		});
	});

	QUnit.test("registerFont (lazy loading)", function(assert) {
		// stub the ajax method
		var stub = this.stub(jQuery, 'ajax');
		stub.yieldsTo('success', {
			"technicalsystem": "0xe000"
		});

		// register TNT icon font
		IconPool.registerFont({
			fontFamily: "SAP-icons-TNT",
			collectionName: "tntlazy",
			fontURI: jQuery.sap.getModulePath("sap.tnt.themes.base.fonts"),
			lazy: true
		});

		assert.ok(stub.notCalled, "The font metadata is not loaded before an icon is queried");

		IconPool.getIconInfo("sap-icon://tntlazy/technicalsystem");
		assert.ok(stub.calledOnce, "The font metadata is loaded once");

		IconPool.getIconInfo("sap-icon://tntlazy/technicalsystem");
		assert.ok(stub.calledOnce, "The font metadata is loaded only once");
	});

	QUnit.test("registerFont (no lazy loading)", function(assert) {
		// stub the ajax method
		var stub = this.stub(jQuery, 'ajax');
		stub.yieldsTo('success', {
			"technicalsystem": "0xe000"
		});

		// register TNT icon font
		IconPool.registerFont({
			fontFamily: "SAP-icons-TNT",
			collectionName: "tntnolazy",
			fontURI: jQuery.sap.getModulePath("sap.tnt.themes.base.fonts")
		});

		assert.ok(stub.calledOnce, "The font metadata is loaded right away");

		IconPool.getIconInfo("sap-icon://tntnolazy/technicalsystem");
		assert.ok(stub.calledOnce, "The font metadata is loaded only once");
	});

	QUnit.test("registerFont (no metadataURI)", function(assert) {
		var done = assert.async();
		var stub = this.stub(jQuery, "ajax").callsFake(function(sURL, oOptions) {
			// check that metadataURL is composed correctly
			if (sURL.indexOf("sap/METADATA.json") >= 0) {
				assert.ok(true, "The metadataURI parameter has been composed correctly");
				stub.restore(); // restore explicitly to avoid further asserts
				done();
			}
		});
		// register TNT icon font
		IconPool.registerFont({
			fontFamily: "METADATA",
			collectionName: "tntmetadata",
			fontURI: jQuery.sap.getModulePath("sap")
		});

		IconPool.getIconInfo("sap-icon://tntmetadata/foo");
	});

	QUnit.test("fontLoaded returns a promise", function(assert) {
		var done = assert.async();

		// register TNT icon font
		IconPool.registerFont({
			fontFamily: "SAP-icons-TNT",
			collectionName: "tntloaded",
			fontURI: jQuery.sap.getModulePath("sap.tnt.themes.base.fonts")
		});

		IconPool.fontLoaded("tntloaded").then(function() {
			assert.ok(true, "The fontLoaded promise is resolved correctly the first time");
			IconPool.fontLoaded("tntloaded").then(function() {
				assert.ok(true, "The fontLoaded promise is resolved correctly the second time");
				done();
			});
		});
	});

	QUnit.test("fontLoaded returns undefined for an invalid font", function(assert) {
		assert.strictEqual(IconPool.fontLoaded("invalid"), undefined, "fontLoaded returns undefined");
	});

	QUnit.module("Sync getIconInfo");

	QUnit.test("Calling getIconInfo with 'sync' mode on the default icon font returns the result immediately", function(assert) {
		var oIconInfo = IconPool.getIconInfo("sap-icon://card", undefined, "sync");
		assert.equal(oIconInfo.collection, undefined, "Icon collection is correct");
		assert.equal(oIconInfo.fontFamily, "SAP-icons", "Icon font family is correct");
		assert.equal(oIconInfo.content, String.fromCharCode(0xe044), "Icon content has been resolved properly");

		oIconInfo = IconPool.getIconInfo("sap-icon://card", "sync");
		assert.equal(oIconInfo.collection, undefined, "Icon collection is correct when not giving the iconCollection parameter");
		assert.equal(oIconInfo.fontFamily, "SAP-icons", "Icon font family is correct when not giving the iconCollection parameter");
		assert.equal(oIconInfo.content, String.fromCharCode(0xe044), "Icon content has been resolved properly when not giving the iconCollection parameter");
	});

	QUnit.test("Calling getIconInfo with 'sync' mode on a separate icon font returns the result immediately", function(assert) {
		// stub the ajax method
		var stub = this.stub(jQuery, 'ajax');
		stub.yieldsTo('success', {
			"customicon": "0xe001"
		});

		// register an additional icon font
		IconPool.registerFont({
			fontFamily: "some-font-family",
			collectionName: "somefont",
			fontURI: jQuery.sap.getModulePath("sap.tnt.themes.base.fonts"),
			lazy: true
		});

		var oIconInfo = IconPool.getIconInfo("sap-icon://somefont/customicon", undefined, "sync");
		assert.equal(oIconInfo.collection, "somefont", "Icon collection is correct");
		assert.equal(oIconInfo.fontFamily, "some-font-family", "Icon font family is correct");
		assert.equal(oIconInfo.content, String.fromCharCode(0xe001), "Icon content has been resolved properly");
	});

	QUnit.test("Calling getIconInfo with 'sync' mode on a separate icon font and without an iconCollection parameter returns the result immediately", function(assert) {
		// stub the ajax method
		var stub = this.stub(jQuery, 'ajax');
		stub.yieldsTo('success', {
			"customicon": "0xe001"
		});

		// register an additional icon font
		IconPool.registerFont({
			fontFamily: "some-font-family1",
			collectionName: "somefont1",
			fontURI: jQuery.sap.getModulePath("sap.tnt.themes.base.fonts"),
			lazy: true
		});

		var oIconInfo = IconPool.getIconInfo("sap-icon://somefont1/customicon", "sync");
		assert.equal(oIconInfo.collection, "somefont1", "Icon collection is correct");
		assert.equal(oIconInfo.fontFamily, "some-font-family1", "Icon font family is correct");
		assert.equal(oIconInfo.content, String.fromCharCode(0xe001), "Icon content has been resolved properly");
	});

	QUnit.module("Async getIconInfo");

	QUnit.test("Calling getIconInfo with 'async' mode on a default font icon returns a Promise", function(assert) {
		var done = assert.async();
		var oIconInfo = IconPool.getIconInfo("sap-icon://nutrition-activity", undefined, "async");
		assert.ok(oIconInfo instanceof Promise, "getIconInfo returns a promise");
		oIconInfo.then(function(oIconInfo) {
			assert.ok(oIconInfo, "The promise is resolved with the icon info");
			assert.equal(oIconInfo.fontFamily, "SAP-icons", "Icon font family is correct");
			assert.equal(oIconInfo.content, String.fromCharCode(0xe105), "Icon content has been resolved properly");
			done();
		});
	});

	QUnit.test("Calling getIconInfo with 'async' mode on a default font and without an iconCollection parameter icon returns a Promise", function(assert) {
		var done = assert.async();
		var oIconInfo = IconPool.getIconInfo("sap-icon://nutrition-activity", "async");
		assert.ok(oIconInfo instanceof Promise, "getIconInfo returns a promise");
		oIconInfo.then(function(oIconInfo) {
			assert.ok(oIconInfo, "The promise is resolved with the icon info");
			assert.equal(oIconInfo.fontFamily, "SAP-icons", "Icon font family is correct");
			assert.equal(oIconInfo.content, String.fromCharCode(0xe105), "Icon content has been resolved properly");
			done();
		});
	});

	QUnit.test("Calling getIconInfo with 'async' is successfully handled in all cases (load, pending, success)", function(assert) {
		var done = assert.async();
		// stub the ajax method
		var fontLoaded = function() {
			var oIconInfo = IconPool.getIconInfo("sap-icon://tntfakeasync/python", undefined, "async");
			oIconInfo.then(function(oIconInfo) {
				assert.ok(oIconInfo, "After loading the promise is resolved with the icon info");
				assert.equal(oIconInfo.collection, "tntfakeasync", "Icon collection is correct");
				assert.equal(oIconInfo.fontFamily, "SAP-icons-TNT", "Icon font family is correct");
				assert.equal(oIconInfo.content, String.fromCharCode(0xe00f), "Icon content has been resolved properly");
				done();
			});
		};

		this.stub(jQuery, "ajax").callsFake(function(sURL, oOptions) {
			// introduce the least amount of delay for this test
			setTimeout(function() {
				oOptions.success({
					"technicalsystem": "0xe000",
					"python": "0xe00f"
				});
				fontLoaded();
			}, 0);
		});

		// register TNT icon font
		IconPool.registerFont({
			fontFamily: "SAP-icons-TNT",
			collectionName: "tntfakeasync",
			fontURI: jQuery.sap.getModulePath("sap.tnt.themes.base.fonts"),
			lazy: true
		});

		var oIconInfo = IconPool.getIconInfo("sap-icon://tntfakeasync/technicalsystem", undefined, "async");
		assert.ok(oIconInfo.then, "On first load a promise is returned");

		var oIconInfo = IconPool.getIconInfo("sap-icon://tntfakeasync/python", undefined, "async");
		assert.ok(oIconInfo.then, "While loading still a promise is returned");
	});

	QUnit.test("Calling getIconInfo on a separate font first with 'async' and immediately with 'sync' afterwards returns correct results for both", function(assert) {
		var done = assert.async();
		// register an additional icon font without loading metadata immediately
		IconPool.registerFont({
			fontFamily: "SAP-icons-TNT",
			collectionName: "tntAsyncSync",
			fontURI: jQuery.sap.getModulePath("sap.tnt.themes.base.fonts"),
			lazy: true
		});

		// get icon info asynchronously
		var oIconInfoAsync = IconPool.getIconInfo("sap-icon://tntAsyncSync/arrow", "async");

		// get icon info synchronously
		var oIconInfoSync = IconPool.getIconInfo("sap-icon://tntAsyncSync/arrow", "sync");

		assert.ok(oIconInfoAsync instanceof Promise, "The asynchronous load returns a promise");
		assert.equal(oIconInfoSync.collection, "tntAsyncSync", "Icon collection from the synchronous load is correct");
		assert.equal(oIconInfoSync.fontFamily, "SAP-icons-TNT", "Font family from the synchronous load is correct");

		oIconInfoAsync.then(function(result) {
			assert.equal(result.collection, "tntAsyncSync", "Icon collection from the asynchronous load is correct");
			assert.equal(result.fontFamily, "SAP-icons-TNT", "Font family from the asynchronous load is correct");
			done();
		});
	});

	QUnit.module("Mixed getIconInfo");

	QUnit.test("Calling getIconInfo with 'mixed' mode on a default font icon returns the result immediately", function(assert) {
		var oIconInfo = IconPool.getIconInfo("sap-icon://nutrition-activity", undefined, "mixed");
		assert.equal(oIconInfo.collection, undefined, "Icon collection is correct");
		assert.equal(oIconInfo.fontFamily, "SAP-icons", "Icon font family is correct");
		assert.equal(oIconInfo.content, String.fromCharCode(0xe105), "Icon content has been resolved properly");

		oIconInfo = IconPool.getIconInfo("sap-icon://nutrition-activity", "mixed");
		assert.equal(oIconInfo.collection, undefined, "Icon collection is correct when not giving the iconCollection parameter");
		assert.equal(oIconInfo.fontFamily, "SAP-icons", "Icon font family is correct when not giving the iconCollection parameter");
		assert.equal(oIconInfo.content, String.fromCharCode(0xe105), "Icon content has been resolved properly when not giving the iconCollection parameter");
	});

	QUnit.test("Calling getIconInfo with 'mixed' is successfully handled in all cases (load, pending, success)", function(assert) {
		var done = assert.async();
		// stub the ajax method
		 var fontLoaded = function() {
			var oIconInfo = IconPool.getIconInfo("sap-icon://tntfakemixed/python", undefined, "mixed");
			assert.ok(oIconInfo.content, "After loading the icon information is returned immediately");
			assert.equal(oIconInfo.collection, "tntfakemixed", "Icon collection is correct");
			assert.equal(oIconInfo.fontFamily, "SAP-icons-TNT", "Icon font family is correct");
			assert.equal(oIconInfo.content, String.fromCharCode(0xe00f), "Icon content has been resolved properly");

			done();
		};

		this.stub(jQuery, "ajax").callsFake(function(sURL, oOptions) {
			// introduce the least amount of delay for this test
			setTimeout(function() {
				oOptions.success({
					"technicalsystem": "0xe000",
					"python": "0xe00f"
				});
				fontLoaded();
			}, 0);
		});

		// register TNT icon font
		IconPool.registerFont({
			fontFamily: "SAP-icons-TNT",
			collectionName: "tntfakemixed",
			fontURI: jQuery.sap.getModulePath("sap.tnt.themes.base.fonts"),
			lazy: true
		});

		var oIconInfo = IconPool.getIconInfo("sap-icon://tntfakemixed/technicalsystem", undefined, "mixed");
		assert.ok(oIconInfo.then, "On first load a promise is returned");

		oIconInfo = IconPool.getIconInfo("sap-icon://tntfakemixed/python", undefined, "mixed");
		assert.ok(oIconInfo.then, "While loading still a promise is returned");
	});

});
