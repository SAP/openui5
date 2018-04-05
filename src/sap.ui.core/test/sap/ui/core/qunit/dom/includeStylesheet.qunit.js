/*global QUnit */
sap.ui.define(["sap/ui/dom/includeStylesheet", "sap/ui/thirdparty/jquery"], function(includeStyleSheet, jQuery) {
	"use strict";

	QUnit.module("sap.ui.dom.includeStylesheet", {
		beforeEach: function() {
			// create test area for stylsheets
			this.oTestArea = jQuery('<div id="includeStyleSheetTest" class="sap-jsunitIncludeStyleSheetTest" style="width:100px;height:100px">Test area for includeStyleSheet</div>');
			jQuery("#qunit-fixture").append(this.oTestArea);

			// pre-include a stylesheet
			this.oLink = jQuery("<link rel='stylesheet' href='./dom/testdata/lib.css' data-marker='42' id='sap-ui-theme-sap.ui.layout'>");
			jQuery("head").append(this.oLink);
		},
		afterEach: function() {
			this.oTestArea.remove();
			this.oLink.remove();
		}
	});

	QUnit.test("basic", function(assert) {
		var done = assert.async();
		function handleError () {
			assert.notOk(true, "Error callback called");
			done();
		}
		includeStyleSheet("./dom/testdata/testA.css", "jsunitIncludeStyleSheetTest", function (){
			var oTestArea = document.getElementById("includeStyleSheetTest");
			var sBefore = jQuery(oTestArea).css("backgroundColor");
			var iLinkCnt = document.getElementsByTagName("LINK").length;
			includeStyleSheet("./dom/testdata/testB.css", "jsunitIncludeStyleSheetTest", function() {
				assert.notStrictEqual(jQuery(oTestArea).css("backgroundColor"), sBefore, "background-color should have changed");
				assert.strictEqual(document.getElementsByTagName("LINK").length, iLinkCnt, "no new link element should have been created");
				done();
			}, handleError);
		}, handleError);
	});

	QUnit.test("basic (Promise)", function(assert) {
		var oTestArea, sBefore, iLinkCnt;
		return includeStyleSheet({
			url: "./dom/testdata/testA.css",
			id: "jsunitIncludeStyleSheetTest"
		}).then(function() {
			oTestArea = document.getElementById("includeStyleSheetTest");
			sBefore = jQuery(oTestArea).css("backgroundColor");
			iLinkCnt = document.getElementsByTagName("LINK").length;
			return includeStyleSheet({
				url: "./dom/testdata/testC.css",
				id: "jsunitIncludeStyleSheetTest"
			});
		}).then(function() {
			assert.notStrictEqual(jQuery(oTestArea).css("backgroundColor"), sBefore, "background-color should have changed");
			assert.strictEqual(document.getElementsByTagName("LINK").length, iLinkCnt, "no new link element should have been created");
		});
	});

	QUnit.test("don't load twice", function(assert) {

		var sStyleSheetUrl = "./dom/testdata/lib.css";
		var $link = jQuery(document.getElementById("sap-ui-theme-sap.ui.layout"));
		assert.equal($link.length, 1, "initially, there should be exactly one matching link)");
		assert.equal($link.attr("data-marker"), "42", "initially, the link object should be the declarative one");

		includeStyleSheet(sStyleSheetUrl, "sap-ui-theme-sap.ui.layout");

		$link = jQuery(document.getElementById("sap-ui-theme-sap.ui.layout"));
		assert.equal($link.length, 1, "after includeStylesheet, there still should be exactly one matching link");
		assert.equal($link.attr("data-marker"), "42", "after includeStylesheet, the link object still should be the old one");

		// use link node to make URL absolute
		var oLink = document.createElement('link');
		oLink.href = sStyleSheetUrl;
		var sAbsoluteStylesheetUrl = oLink.href;

		includeStyleSheet(sAbsoluteStylesheetUrl, "sap-ui-theme-sap.ui.layout");

		$link = jQuery(document.getElementById("sap-ui-theme-sap.ui.layout"));
		assert.equal($link.length, 1, "after includeStylesheet with absolute URL, there still should be exactly one matching link");
		assert.equal($link.attr("data-marker"), "42", "after includeStylesheet with absolute URL, the link object still should be the old one");

		// Creates a URL like
		// http://example.com/dom/testdata/../../dom/testdata/lib.css
		// which should be normalized to
		// http://example.com/dom/testdata/lib.css
		var sAbsoluteStylesheetUrlUnnormalized = sAbsoluteStylesheetUrl.replace(/lib\.css$/, "../../dom/testdata/lib.css");

		includeStyleSheet(sAbsoluteStylesheetUrlUnnormalized, "sap-ui-theme-sap.ui.layout");

		$link = jQuery(document.getElementById("sap-ui-theme-sap.ui.layout"));
		assert.equal($link.length, 1, "after includeStylesheet with unnormalized absolute URL, there still should be exactly one matching link");
		assert.equal($link.attr("data-marker"), "42", "after includeStylesheet with unnormalized absolute URL, the link object still should be the old one");

		/*
		// @TODO-evo: How to handle this without a booted core?
		sap.ui.getCore().loadLibrary("sap.ui.layout");

		var $link = jQuery(document.getElementById("sap-ui-theme-sap.ui.layout"));
		assert.equal($link.length, 1, "after loadLibrary, there should be exactly one matching link");
		assert.equal($link.attr("data-marker"), "42", "after loadLibrary, the link object still should be the old one");
		*/
	});

	QUnit.test("stylesheet count", function(assert) {

		function getStyleId(i) {
			return "style" + (i + 1);
		}

		function includeStyleSheetWrapped(i, fnResolve, fnReject) {
			var sStyleId = getStyleId(i);
			includeStyleSheet(sStyleBaseUrl + sStyleId + '.css', sStyleId, fnResolve, fnReject);
		}

		// remember initial stylesheet count
		var iInitialStylesheets = document.querySelectorAll("link[rel=stylesheet]").length;

		// include 5 stylesheets
		var iNewStylesheets = 5;
		var sStyleBaseUrl = "./dom/testdata/stylesheets/";
		var aPromises = [];
		var i;
		for (i = 0; i < iNewStylesheets; i++) {

			// success / error callback will only be called for real link tags
			// create promise to keep track of loading state
			var oPromise = new Promise(function(fnResolve, fnReject) {
				includeStyleSheetWrapped(i, fnResolve, fnReject);
			});
			aPromises.push(oPromise);

		}

		// all new stylesheets should be added
		var iExpectedStylesheets = iInitialStylesheets + iNewStylesheets;

		// wait until all stylesheets are loaded
		return Promise.all(aPromises).then(function() {
			assert.equal(document.querySelectorAll("link[rel=stylesheet]").length, iExpectedStylesheets, "Overall stylesheet count should be like expected");

			// remove all added stylesheets again
			for (i = 0; i < iNewStylesheets; i++) {
				var sStyleId = getStyleId(i);
				var oLink = jQuery("#" + sStyleId);
				oLink.remove();
			}

		}, function(e) {
			assert.ok(false, e);
		});

	});

	QUnit.test("custom attributes", function(assert) {

		function includeStyleSheetWrapped(vUrl, mAttributes) {
			return new Promise(function(fnResolve, fnReject) {
				includeStyleSheet(vUrl, mAttributes, fnResolve, fnReject);
			});
		}

		var done = assert.async();
		var aPromises = [];

		aPromises.push(includeStyleSheetWrapped("./dom/testdata/dummy.css", {
			"id": "mylink",
			"data-sap-ui-attr": "attrval"
		}).then(function() {
			var oLink = document.getElementById("mylink");
			assert.ok(oLink, "link should have been found");
			assert.strictEqual("attrval", oLink.getAttribute("data-sap-ui-attr"), "link should have a custom attribute");
			return includeStyleSheetWrapped("./dom/testdata/dummy.css", {
				"id": "mylink",
				"data-sap-ui-attr": "otherval"
			}).then(function() {
				var oLink = document.getElementById("mylink");
				assert.ok(oLink, "link should have been found");
				assert.strictEqual("otherval", oLink.getAttribute("data-sap-ui-attr"), "link should have replaced the custom attribute");
			});
		}));

		aPromises.push(includeStyleSheetWrapped("./dom/testdata/dummy.css", {
			"data-sap-ui-id": "mylink",
			"data-sap-ui-attr": "attrval"
		}).then(function() {
			var oLink = document.querySelectorAll("link[data-sap-ui-id='mylink']")[0];
			assert.ok(oLink, "link should have been found");
			assert.strictEqual("attrval", oLink.getAttribute("data-sap-ui-attr"), "link should have a custom attribute");
		}));

		aPromises.push(includeStyleSheet({
			"url": "./dom/testdata/dummy.css",
			"attributes": {
				"id": "mylink-async-attrid",
				"data-sap-ui-attr": "attrval"
			}
		}).then(function() {
			var oLink = document.getElementById("mylink-async-attrid");
			assert.ok(oLink, "link should have been found");
			assert.strictEqual("attrval", oLink.getAttribute("data-sap-ui-attr"), "link should have a custom attribute");
			return includeStyleSheet({
				"url": "./dom/testdata/dummy.css",
				"attributes": {
					"id": "mylink-async-attrid",
					"data-sap-ui-attr": "otherval"
				}
			}).then(function() {
				var oLink = document.getElementById("mylink-async-attrid");
				assert.ok(oLink, "link should have been found");
				assert.strictEqual("otherval", oLink.getAttribute("data-sap-ui-attr"), "link should have replaced the custom attribute");
			});
		}));

		aPromises.push(includeStyleSheet({
			"url": "./dom/testdata/dummy.css",
			"id": "mylink-async",
			"attributes": {
				"id": "mylink-async-override",
				"data-sap-ui-attr": "attrval"
			}
		}).then(function() {
			var oLink = document.getElementById("mylink-async");
			assert.ok(oLink, "link should have been found");
			assert.notOk(document.getElementById("mylink-async-override"), "link should have not been found");
			assert.strictEqual("attrval", oLink.getAttribute("data-sap-ui-attr"), "link should have a custom attribute");
		}));

		aPromises.push(includeStyleSheet({
			"url": "./dom/testdata/dummy.css",
			"attributes": {
				"data-sap-ui-id": "mylink-async",
				"data-sap-ui-attr": "attrval"
			}
		}).then(function() {
			var oLink = document.querySelectorAll("link[data-sap-ui-id='mylink-async']")[0];
			assert.ok(oLink, "link should have been found");
			assert.strictEqual("attrval", oLink.getAttribute("data-sap-ui-attr"), "link should have a custom attribute");
		}));

		Promise.all(aPromises).then(function() {
			assert.ok(true, "includeStyleSheet checks work properly");
			done();
		}).catch(function(ex) {
			assert.ok(false, "includeStyleSheet must not fail here: " + ex);
			done();
		});
	});

});