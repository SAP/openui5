/*global QUnit */
sap.ui.require(["sap/ui/dom/includeStylesheet", "sap/ui/thirdparty/jquery"], function(includeStyleSheet /* jQuery*/) {
	QUnit.module("sap.ui.dom.includeStylesheet", {
		before: function() {
			// @TODO-evo: remove stubbed functions once jquery.sap.dom is refactored
			jQuery.sap = jQuery.sap || {};
			jQuery.sap.domById = function domById(sId, oWindow) {
				return sId ? (oWindow || window).document.getElementById(sId) : null;
			};
			jQuery.sap.byId = function byId(sId, oContext) {
				var escapedId = "";
				if (sId) {
					escapedId = "#" + sId.replace(/(:|\.)/g, '\\$1');
				}
				return jQuery(escapedId, oContext);
			};

			// create test area for stylsheets
			this.oTestArea = $('<div id="includeStyleSheetTest" class="sap-jsunitIncludeStyleSheetTest" style="width:100px;height:100px">Test area for includeStyleSheet</div>');
			$("body").append(this.oTestArea);

			// pre-include a stylesheet
			this.oLink = $("<link rel='stylesheet' href='./testdata/lib.css' data-marker='42' id='sap-ui-theme-sap.ui.layout'>");
			$("head").append(this.oLink);
		},
		after: function() {
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
		includeStyleSheet("./testdata/testA.css", "jsunitIncludeStyleSheetTest", function (){
			var oTestArea = jQuery.sap.domById("includeStyleSheetTest");
			var sBefore = jQuery(oTestArea).css("backgroundColor");
			var iLinkCnt = document.getElementsByTagName("LINK").length;
			includeStyleSheet("./testdata/testB.css", "jsunitIncludeStyleSheetTest", function() {
				assert.notStrictEqual(jQuery(oTestArea).css("backgroundColor"), sBefore, "background-color should have changed");
				assert.strictEqual(document.getElementsByTagName("LINK").length, iLinkCnt, "no new link element should have been created");
				done();
			}, handleError);
		}, handleError);
	});

	QUnit.test("basic (Promise)", function(assert) {
		var oTestArea, sBefore, iLinkCnt;
		return includeStyleSheet({
			url: "./testdata/testA.css",
			id: "jsunitIncludeStyleSheetTest",
			promisify: true
		}).then(function() {
			oTestArea = jQuery.sap.domById("includeStyleSheetTest");
			sBefore = jQuery(oTestArea).css("backgroundColor");
			iLinkCnt = document.getElementsByTagName("LINK").length;
		return includeStyleSheet({
			url: "./testdata/testC.css",
			id: "jsunitIncludeStyleSheetTest",
			promisify: true
			});
		}).then(function() {
			assert.notStrictEqual(jQuery(oTestArea).css("backgroundColor"), sBefore, "background-color should have changed");
			assert.strictEqual(document.getElementsByTagName("LINK").length, iLinkCnt, "no new link element should have been created");
		});
	});

	QUnit.test("don't load twice", function(assert) {

		var sStyleSheetUrl = "./testdata/lib.css";
		var $link = jQuery.sap.byId("sap-ui-theme-sap.ui.layout");
		assert.equal($link.length, 1, "initially, there should be exactly one matching link)");
		assert.equal($link.attr("data-marker"), "42", "initially, the link object should be the declarative one");

		includeStyleSheet(sStyleSheetUrl, "sap-ui-theme-sap.ui.layout");

		var $link = jQuery.sap.byId("sap-ui-theme-sap.ui.layout");
		assert.equal($link.length, 1, "after includeStylesheet, there still should be exactly one matching link");
		assert.equal($link.attr("data-marker"), "42", "after includeStylesheet, the link object still should be the old one");

		// use link node to make URL absolute
		var oLink = document.createElement('link');
		oLink.href = sStyleSheetUrl;
		var sAbsoluteStylesheetUrl = oLink.href;

		includeStyleSheet(sAbsoluteStylesheetUrl, "sap-ui-theme-sap.ui.layout");

		var $link = jQuery.sap.byId("sap-ui-theme-sap.ui.layout");
		assert.equal($link.length, 1, "after includeStylesheet with absolute URL, there still should be exactly one matching link");
		assert.equal($link.attr("data-marker"), "42", "after includeStylesheet with absolute URL, the link object still should be the old one");

		/*
		// @TODO-evo: How to handle this without a booted core?
		sap.ui.getCore().loadLibrary("sap.ui.layout");

		var $link = jQuery.sap.byId("sap-ui-theme-sap.ui.layout");
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
		var iInitialStylesheets = document.styleSheets.length;

		// include 5 stylesheets
		var iNewStylesheets = 5;
		var sStyleBaseUrl = "./testdata/stylesheets/";
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
			assert.equal(document.styleSheets.length, iExpectedStylesheets, "Overall stylesheet count should be like expected");

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

		aPromises.push(includeStyleSheetWrapped("./testdata/dummy.css", {
			"id": "mylink",
			"data-sap-ui-attr": "attrval"
		}).then(function() {
			var oLink = document.getElementById("mylink");
			assert.ok(oLink, "link should have been found");
			assert.strictEqual("attrval", oLink.getAttribute("data-sap-ui-attr"), "link should have a custom attribute");
			return includeStyleSheetWrapped("./testdata/dummy.css", {
				"id": "mylink",
				"data-sap-ui-attr": "otherval"
			}).then(function() {
				var oLink = document.getElementById("mylink");
				assert.ok(oLink, "link should have been found");
				assert.strictEqual("otherval", oLink.getAttribute("data-sap-ui-attr"), "link should have replaced the custom attribute");
			});
		}));

		aPromises.push(includeStyleSheetWrapped("./testdata/dummy.css", {
			"data-sap-ui-id": "mylink",
			"data-sap-ui-attr": "attrval"
		}).then(function() {
			var oLink = document.querySelectorAll("link[data-sap-ui-id='mylink']")[0];
			assert.ok(oLink, "link should have been found");
			assert.strictEqual("attrval", oLink.getAttribute("data-sap-ui-attr"), "link should have a custom attribute");
		}));

		aPromises.push(includeStyleSheet({
			"url": "./testdata/dummy.css",
			"attributes": {
				"id": "mylink-async-attrid",
				"data-sap-ui-attr": "attrval"
			}
		}).then(function() {
			var oLink = document.getElementById("mylink-async-attrid");
			assert.ok(oLink, "link should have been found");
			assert.strictEqual("attrval", oLink.getAttribute("data-sap-ui-attr"), "link should have a custom attribute");
			return includeStyleSheet({
				"url": "./testdata/dummy.css",
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
			"url": "./testdata/dummy.css",
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
			"url": "./testdata/dummy.css",
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