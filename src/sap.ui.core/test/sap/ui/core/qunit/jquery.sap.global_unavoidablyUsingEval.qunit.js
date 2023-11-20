/* global QUnit */
sap.ui.define([
	"jquery.sap.global",
	"sap/ui/qunit/utils/createAndAppendDiv",
	"sap/ui/thirdparty/URI"
], function(jQuery, createAndAppendDiv, URI) {
	"use strict";

	/* !!! MOVE TO HEAD - DUE TO SAFARI ISSUES DURING TEST SETUP !!! */
	var a = [];
	var sPath = sap.ui.require.toUrl("testdata/core/");

	/**
	 * 	<link rel="stylesheet" id="sap-ui-theme-sap.ui.layout" href="../../../../../resources/sap/ui/layout/themes/sap_belize/library.css" data-marker="42">
	 * <div id="includeStyleSheetTest" class="sap-jsunitIncludeStyleSheetTest" >
	 *   Test area for includeStyleSheet
	 * </div>
	 */
	var link = document.createElement('link');
	link.id = "sap-ui-theme-sap.ui.layout";
	link.rel = 'stylesheet';
	link.href = 'resources/sap/ui/layout/themes/sap_belize/library.css';
	link.setAttribute("data-marker",'42');
	document.body.appendChild(link);

	var div = createAndAppendDiv("includeStyleSheetTest");
	div.className = "sap-jsunitIncludeStyleSheetTest";
	div.style.height = div.style.width = "100px";

	a.push(jQuery.sap.includeScript({
		url: sPath + "testdata/sapjsunittestvalueincrementor.js",
		id: "jsunitIncludeScriptTestScript",
		promisify: true
	}));

	a.push(jQuery.sap.includeStyleSheet({
		url: sPath + "testdata/testA.css",
		id: "jsunitIncludeStyleSheetTest",
		promisify: true
	}));

	function jQueryById(id) {
		return new jQuery(document.getElementById(id));
	}

	return Promise.all(a).then(function() {

		QUnit.module("Basic", {
			beforeEach: function(assert) {
				window.saptest = {};
				window.saptest.JUST_FOR_TESTING = "Just for testing";

				assert.notStrictEqual(window.sap.jsunittestvalue, undefined, "setup precondition");
				assert.notStrictEqual(window.sap.jsunittestvalue, null, "setup precondition");
			},
			afterEach: function() {
				window.saptest = null;
			}
		});

		QUnit.test("GlobalSetupDone", function(assert) {

			assert.notStrictEqual(sap, undefined, "package sap must be defined");
			assert.notStrictEqual(sap.ui, undefined, "package sap.ui must be defined");

		});

		QUnit.test("NewObject", function(assert) {

			var temp = {};

			temp.ClassA = function() {
				this.fieldA_1 = true;
				this.fieldA_2 = 'string';
			};
			temp.ClassA.prototype.methodA_1 = function() {
				return "ClassA.methodA_1";
			};
			temp.ClassA.prototype.methodA_2 = function() {
				return "ClassA.methodA_2";
			};

			var oA1 = new temp.ClassA();
			assert.ok(typeof oA1.methodA_1 == "function" && oA1.methodA_1() == "ClassA.methodA_1", "instance oA1 inherits from prototype");
			assert.ok(typeof oA1.methodA_2 == "function" && oA1.methodA_2() == "ClassA.methodA_2", "instance oA1 inherits from prototype");
			for (var key in temp.ClassA.prototype) {
				assert.ok(typeof temp.ClassA.prototype[key] == "function", "prototype of A only contains functions");
			}

			var oA2 = new temp.ClassA();
			assert.ok(typeof oA2.methodA_2 == "function" && oA2.methodA_2() == "ClassA.methodA_2", "instance oA2 inherits from prototype");
			oA2.methodA_2 = function() {
				return "oA2.methodA_2";
			};
			assert.ok(typeof oA2.methodA_2 == "function" && oA2.methodA_2() == "oA2.methodA_2", "instance oA2 overrides methodA_2");
			assert.ok(typeof oA1.methodA_2 == "function" && oA1.methodA_2() == "ClassA.methodA_2", "instance oA1 still inherits from prototype");

			temp.ClassB = function() {
				temp.ClassA.apply(this);
			};
			temp.ClassB.prototype = jQuery.sap.newObject(temp.ClassA.prototype);
			temp.ClassB.prototype.methodA_2 = function() {
				return "ClassB.methodA_2";
			};
			temp.ClassB.prototype.methodB_3 = function() {
				return "ClassB.methodB_3";
			};
			temp.ClassB.prototype.methodB_4 = function() {
				return "ClassB.methodB_4";
			};

			var oB1 = new temp.ClassB();

			assert.ok(typeof temp.ClassB.prototype.methodA_1 == "function" && temp.ClassB.prototype.methodA_1() == "ClassA.methodA_1", "prototype of B inherits from A");
			assert.ok(typeof temp.ClassB.prototype.fieldA_1 == "undefined", "prototype of B does not contain instance fields from A");
			assert.ok(typeof temp.ClassB.prototype.fieldA_2 == "undefined", "prototype of B does not contain instance fields from A");
			for (var key in temp.ClassB.prototype) {
				assert.ok(typeof temp.ClassB.prototype[key] == "function", "prototype of B only contains functions");
			}
			assert.strictEqual(oB1.methodA_1(), "ClassA.methodA_1", "B inherits methodA_1");
			assert.strictEqual(oB1.methodA_2(), "ClassB.methodA_2", "B overrides methodA_2");
		});


		//****************************************************
		// includeScript tests
		//****************************************************

		QUnit.module("includeScript ");

		QUnit.test("basic", function(assert) {
			var iBefore = sap.jsunittestvalue;
			var iScriptCnt = document.getElementsByTagName("SCRIPT").length;
			var done = assert.async();
			jQuery.sap.includeScript(sPath + "testdata/sapjsunittestvalueincrementor.js", "jsunitIncludeScriptTestScript", function() {
				assert.strictEqual(iBefore + 1, sap.jsunittestvalue, "testvalue should have been incremented");
				assert.strictEqual(iScriptCnt, document.getElementsByTagName("SCRIPT").length, "no new script element should have been created");
				done();
			});
		});

		QUnit.test("basic (Promise)", function(assert) {
			var iBefore = sap.jsunittestvalue;
			var iScriptCnt = document.getElementsByTagName("SCRIPT").length;
			return jQuery.sap.includeScript({
				url: sPath + "testdata/sapjsunittestvalueincrementor.js",
				id: "jsunitIncludeScriptTestScript",
				promisify: true
			}).then(function() {
				assert.strictEqual(iBefore + 1, sap.jsunittestvalue, "testvalue should have been incremented");
				assert.strictEqual(iScriptCnt, document.getElementsByTagName("SCRIPT").length, "no new script element should have been created");
			});
		});

		QUnit.test("custom attributes", function(assert) {

			function includeScript(vUrl, mAttributes) {
				return new Promise(function(fnResolve, fnReject) {
					jQuery.sap.includeScript(vUrl, mAttributes, fnResolve, fnReject);
				});
			}

			var done = assert.async();
			var aPromises = [];

			aPromises.push(includeScript(sPath + "testdata/dummy.js", {
				"id": "myscript",
				"data-sap-ui-attr": "attrval"
			}).then(function() {
				var oScript = document.getElementById("myscript");
				assert.ok(oScript, "script should have been found");
				assert.strictEqual("attrval", oScript.getAttribute("data-sap-ui-attr"), "script should have a custom attribute");
				return includeScript(sPath + "testdata/dummy.js", {
					"id": "myscript",
					"data-sap-ui-attr": "otherval"
				}).then(function() {
					var oScript = document.getElementById("myscript");
					assert.ok(oScript, "script should have been found");
					assert.strictEqual("otherval", oScript.getAttribute("data-sap-ui-attr"), "script should have replaced the custom attribute");
				});
			}));

			aPromises.push(includeScript(sPath + "testdata/dummy.js", {
				"data-sap-ui-id": "myscript",
				"data-sap-ui-attr": "attrval"
			}).then(function() {
				var oScript = document.querySelectorAll("script[data-sap-ui-id='myscript']")[0];
				assert.ok(oScript, "script should have been found");
				assert.strictEqual("attrval", oScript.getAttribute("data-sap-ui-attr"), "script should have a custom attribute");
			}));

			aPromises.push(jQuery.sap.includeScript({
				"url": sPath + "testdata/dummy.js",
				"attributes": {
					"id": "myscript-async-attrid",
					"data-sap-ui-attr": "attrval"
				}
			}).then(function() {
				var oScript = document.getElementById("myscript-async-attrid");
				assert.ok(oScript, "script should have been found");
				assert.strictEqual("attrval", oScript.getAttribute("data-sap-ui-attr"), "script should have a custom attribute");
				return jQuery.sap.includeScript({
					"url": sPath + "testdata/dummy.js",
					"attributes": {
						"id": "myscript-async-attrid",
						"data-sap-ui-attr": "otherval"
					}
				}).then(function() {
					var oScript = document.getElementById("myscript-async-attrid");
					assert.ok(oScript, "script should have been found");
					assert.strictEqual("otherval", oScript.getAttribute("data-sap-ui-attr"), "script should have replaced the custom attribute");
				});
			}));

			aPromises.push(jQuery.sap.includeScript({
				"url": sPath + "testdata/dummy.js",
				"id": "myscript-async",
				"attributes": {
					"id": "myscript-async-override",
					"data-sap-ui-attr": "attrval"
				}
			}).then(function() {
				var oScript = document.getElementById("myscript-async");
				assert.ok(oScript, "script should have been found");
				assert.notOk(document.getElementById("myscript-async-override"), "script should have not been found");
				assert.strictEqual("attrval", oScript.getAttribute("data-sap-ui-attr"), "script should have a custom attribute");
			}));

			aPromises.push(jQuery.sap.includeScript({
				"url": sPath + "testdata/dummy.js",
				"attributes": {
					"data-sap-ui-id": "myscript-async",
					"data-sap-ui-attr": "attrval"
				}
			}).then(function() {
				var oScript = document.querySelectorAll("script[data-sap-ui-id='myscript-async']")[0];
				assert.ok(oScript, "script should have been found");
				assert.strictEqual("attrval", oScript.getAttribute("data-sap-ui-attr"), "script should have a custom attribute");
			}));

			Promise.all(aPromises).then(function() {
				assert.ok(true, "includeScript checks work properly");
				done();
			}).catch(function(ex) {
				assert.ok(false, "includeScript must not fail here: " + ex);
				done();
			});

		});


		QUnit.test("ignore null parameters", function(assert) {
			try {
				jQuery.sap.includeScript(sPath + "testdata/dummy.js", null);
				assert.ok(true, "No exception occurs when using null as parameter.");
			} catch (ex) {
				assert.ok(false, "No exception must occur when using null as parameter!");
			}
		});


		QUnit.test("custom attributes (immutable)", function(assert) {

			var done = assert.async();
			var mAttributes = {
				"data-sap-ui-attr": "attrval"
			};

			jQuery.sap.includeScript({
				url: sPath + "testdata/dummy.js",
				id: "myscript-immutable",
				attributes: mAttributes
			}).then(function() {
				assert.notOk(mAttributes.id, "attributes should not be modified");
				done();
			});

		});


		//****************************************************
		// includeStylesheet tests
		//****************************************************

		QUnit.module("includeStyleSheet");

		QUnit.test("basic", function(assert) {
			var oTestArea = document.getElementById("includeStyleSheetTest");
			var sBefore = jQuery(oTestArea).css("backgroundColor");
			var iLinkCnt = document.getElementsByTagName("LINK").length;
			var done = assert.async();
			jQuery.sap.includeStyleSheet(sPath + "testdata/testB.css", "jsunitIncludeStyleSheetTest", function() {
				assert.notStrictEqual(jQuery(oTestArea).css("backgroundColor"), sBefore, "background-color should have changed");
				assert.strictEqual(document.getElementsByTagName("LINK").length, iLinkCnt, "no new link element should have been created");
				done();
			});
		});

		QUnit.test("basic (Promise)", function(assert) {
			var oTestArea = document.getElementById("includeStyleSheetTest");
			var sBefore = jQuery(oTestArea).css("backgroundColor");
			var iLinkCnt = document.getElementsByTagName("LINK").length;
			return jQuery.sap.includeStyleSheet({
				url: sPath + "testdata/testC.css",
				id: "jsunitIncludeStyleSheetTest",
				promisify: true
			}).then(function() {
				assert.notStrictEqual(jQuery(oTestArea).css("backgroundColor"), sBefore, "background-color should have changed");
				assert.strictEqual(document.getElementsByTagName("LINK").length, iLinkCnt, "no new link element should have been created");
			});
		});

		QUnit.test("don't load twice", function(assert) {
			var sStyleSheetUrl = "resources/sap/ui/layout/themes/sap_belize/library.css";
			var $link = jQueryById("sap-ui-theme-sap.ui.layout");
			assert.equal($link.length, 1, "initially, there should be exactly one matching link)");
			assert.equal($link.attr("data-marker"), "42", "initially, the link object should be the declarative one");

			jQuery.sap.includeStyleSheet(sStyleSheetUrl, "sap-ui-theme-sap.ui.layout");

			var $link = jQueryById("sap-ui-theme-sap.ui.layout");
			assert.equal($link.length, 1, "after includeStylesheet, there still should be exactly one matching link");
			assert.equal($link.attr("data-marker"), "42", "after includeStylesheet, the link object still should be the old one");

			// use link node to make URL absolute
			var oLink = document.createElement('link');
			oLink.href = sStyleSheetUrl;
			var sAbsoluteStylesheetUrl = oLink.href;

			jQuery.sap.includeStyleSheet(sAbsoluteStylesheetUrl, "sap-ui-theme-sap.ui.layout");

			var $link = jQueryById("sap-ui-theme-sap.ui.layout");
			assert.equal($link.length, 1, "after includeStylesheet with absolute URL, there still should be exactly one matching link");
			assert.equal($link.attr("data-marker"), "42", "after includeStylesheet with absolute URL, the link object still should be the old one");

			return sap.ui.getCore().loadLibrary("sap.ui.layout", {async: true}).then(function() {
				var $link = jQueryById("sap-ui-theme-sap.ui.layout");
				assert.equal($link.length, 1, "after loadLibrary, there should be exactly one matching link");
				assert.equal($link.attr("data-marker"), "42", "after loadLibrary, the link object still should be the old one");
			});

		});

		QUnit.test("stylesheet count", function(assert) {

			function getStyleId(i) {
				return "style" + (i + 1);
			}

			function includeStyleSheet(i) {
				return new Promise(function(fnResolve, fnReject) {
					var sStyleId = getStyleId(i);
					jQuery.sap.includeStyleSheet(sStyleBaseUrl + sStyleId + '.css', sStyleId, fnResolve, fnReject);
				});
			}

			// remember initial stylesheet count
			var iInitialStylesheets = document.styleSheets.length;

			// include 40 stylesheets
			var iNewStylesheets = 40;
			var sStyleBaseUrl = sPath + "testdata/stylesheets/";
			var aPromises = [];
			var i;
			for (i = 0; i < iNewStylesheets; i++) {

				// success / error callback will only be called for real link tags
				// create promise to keep track of loading state
				aPromises.push( includeStyleSheet(i) );

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

			function includeStyleSheet(vUrl, mAttributes) {
				return new Promise(function(fnResolve, fnReject) {
					jQuery.sap.includeStyleSheet(vUrl, mAttributes, fnResolve, fnReject);
				});
			}

			var done = assert.async();
			var aPromises = [];

			aPromises.push(includeStyleSheet(sPath + "testdata/dummy.css", {
				"id": "mylink",
				"data-sap-ui-attr": "attrval"
			}).then(function() {
				var oLink = document.getElementById("mylink");
				assert.ok(oLink, "link should have been found");
				assert.strictEqual("attrval", oLink.getAttribute("data-sap-ui-attr"), "link should have a custom attribute");
				return includeStyleSheet(sPath + "testdata/dummy.css", {
					"id": "mylink",
					"data-sap-ui-attr": "otherval"
				}).then(function() {
					var oLink = document.getElementById("mylink");
					assert.ok(oLink, "link should have been found");
					assert.strictEqual("otherval", oLink.getAttribute("data-sap-ui-attr"), "link should have replaced the custom attribute");
				});
			}));

			aPromises.push(includeStyleSheet(sPath + "testdata/dummy.css", {
				"data-sap-ui-id": "mylink",
				"data-sap-ui-attr": "attrval"
			}).then(function() {
				var oLink = document.querySelectorAll("link[data-sap-ui-id='mylink']")[0];
				assert.ok(oLink, "link should have been found");
				assert.strictEqual("attrval", oLink.getAttribute("data-sap-ui-attr"), "link should have a custom attribute");
			}));

			aPromises.push(jQuery.sap.includeStyleSheet({
				"url": sPath + "testdata/dummy.css",
				"attributes": {
					"id": "mylink-async-attrid",
					"data-sap-ui-attr": "attrval"
				}
			}).then(function() {
				var oLink = document.getElementById("mylink-async-attrid");
				assert.ok(oLink, "link should have been found");
				assert.strictEqual("attrval", oLink.getAttribute("data-sap-ui-attr"), "link should have a custom attribute");
				return jQuery.sap.includeStyleSheet({
					"url": sPath + "testdata/dummy.css",
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

			aPromises.push(jQuery.sap.includeStyleSheet({
				"url": sPath + "testdata/dummy.css",
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

			aPromises.push(jQuery.sap.includeStyleSheet({
				"url": sPath + "testdata/dummy.css",
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


		QUnit.test("ignore null parameters", function(assert) {
			try {
				jQuery.sap.includeStyleSheet(sPath + "testdata/testEmpty.css", null);
				assert.ok(true, "No exception occurs when using null as parameter.");
			} catch (ex) {
				assert.ok(false, "No exception must occur when using null as parameter!");
			}
		});


		QUnit.test("FOUC marker", function(assert) {
			function getHrefForUrl(sUrl) {
				return new URI(sUrl).absoluteTo(document.baseURI).query("").toString();
			}
			var done = assert.async();
			jQuery.sap.includeStyleSheet({
				url: sPath + "testdata/testA.css",
				id: "mylink-fouc",
				attributes: {
					"data-sap-ui-foucmarker": "mylink-fouc"
				}
			}).then(function() {
				return jQuery.sap.includeStyleSheet({
					url: sPath + "testdata/testB.css",
					id: "mylink-fouc"
				});
			}).then(function() {
				// due to the FOUC marker the old stylesheet should still be in the head
				// and the the new link should be added before the old link
				var oLinkA = document.querySelectorAll("link[data-sap-ui-foucmarker='mylink-fouc']")[0];
				assert.notOk(oLinkA.hasAttribute("id"), "The id attribute has been removed from the old link.");
				assert.equal(oLinkA.parentNode, document.head, "Old link is still in the head.");
				assert.equal(oLinkA.href, getHrefForUrl(sPath + "testdata/testA.css"), "Href of old link is correct.");
				var oLinkB = document.getElementById("mylink-fouc");
				assert.equal(oLinkB.parentNode, document.head, "New link has been added into the head.");
				assert.equal(oLinkB.href, getHrefForUrl(sPath + "testdata/testB.css"), "Href of new link is correct.");
				assert.equal(oLinkA.previousSibling, oLinkB, "New link has been added before the old link.");
				oLinkA.parentNode.removeChild(oLinkA);
				return jQuery.sap.includeStyleSheet({
					url: sPath + "testdata/testA.css",
					id: "mylink-fouc"
				});
			}).then(function() {
				// Counter check to validate the proper removal of the old link without the marker
				var oLinkA = document.getElementById("mylink-fouc");
				assert.equal(oLinkA.parentNode, document.head, "New link has been added into the head.");
				assert.equal(oLinkA.href, getHrefForUrl(sPath + "testdata/testA.css"), "Href of new link is correct.");
				var oLinkB = document.querySelectorAll("link[data-sap-ui-foucmarker='mylink-fouc']")[0];
				assert.notOk(oLinkB, "Old link has been removed.");
				oLinkA.parentNode.removeChild(oLinkA);
				done();
			});
		});


		QUnit.test("FOUC marker (same URL)", function(assert) {
			function getHrefForUrl(sUrl) {
				return new URI(sUrl).absoluteTo(document.baseURI).query("").toString();
			}
			var done = assert.async();
			jQuery.sap.includeStyleSheet({
				url: sPath + "testdata/testA.css",
				id: "mylink-fouc",
				attributes: {
					"data-sap-ui-foucmarker": "mylink-fouc"
				}
			}).then(function() {
				jQuery.sap.includeStyleSheet(sPath + "testdata/testA.css", "mylink-fouc");
			}).then(function() {
				// ensure to not mark the link with the foucmarker if not a new link is added
				var aFOUCLinks = document.querySelectorAll("link[data-sap-ui-foucmarker='mylink-fouc']");
				assert.equal(aFOUCLinks.length, 0, "The FOUC marker should have been removed from the link.");
				var oLink = document.getElementById("mylink-fouc");
				assert.equal(oLink.parentNode, document.head, "Link is still included in the head.");
				assert.equal(oLink.href, getHrefForUrl(sPath + "testdata/testA.css"), "Href of link is correct.");
				oLink.parentNode.removeChild(oLink);
				done();
			});
		});


		QUnit.test("custom attributes (immutable)", function(assert) {

			var done = assert.async();
			var mAttributes = {
				"data-sap-ui-attr": "attrval"
			};

			jQuery.sap.includeStyleSheet({
				url: sPath + "testdata/testA.css",
				id: "mylink-immutable",
				attributes: mAttributes
			}).then(function() {
				assert.notOk(mAttributes.id, "attributes should not be modified");
				done();
			});

		});


		//****************************************************
		// XHR tests (e.g. for syncXHRFix in Firefox)
		//****************************************************

		QUnit.module("XHR");

		QUnit.test("sync/async", function(assert) {
			var bSyncOngoing = false,
				done = assert.async();
			jQuery.ajax({
				url: "",
				async: true,
				cache: false
			}).then(function() {
				assert.ok(!bSyncOngoing, "Sync request is no longer running, when callback is called.");
				done();
			});
			bSyncOngoing = true;
			jQuery.ajax({
				url: "",
				async: false,
				cache: false
			});
			bSyncOngoing = false;
		});

		QUnit.test("events", function(assert) {
			var bSyncOngoing = false,
				done = assert.async();

			var asyncXHR = new XMLHttpRequest();

			function asyncListener1(oEvent) {
				assert.equal(bSyncOngoing, false, "Handler must not be called while synchronous request is ongoing");
				assert.equal(oEvent.type, "readystatechange", "Event object exists and has the expected type");
				assert.ok(this === asyncXHR, "this-reference points to XHR object");
			}

			function asyncListener2(oEvent) {
				assert.equal(bSyncOngoing, false, "Handler must not be called while synchronous request is ongoing");
				assert.equal(oEvent.type, "readystatechange", "Event object exists and has the expected type");
				assert.ok(this === asyncXHR, "this-reference points to XHR object");
				if (asyncXHR.readyState === 4) {
					done();
				}
			}
			asyncXHR.addEventListener("readystatechange", asyncListener1);
			asyncXHR.onreadystatechange = asyncListener2;
			asyncXHR.open("GET", "#", true);
			assert.equal(asyncXHR.readyState, 1, "After open, readyState should be 1");
			asyncXHR.send();
			assert.equal(asyncXHR.readyState, 1, "After send, readyState should still be 1");

			var syncXHR = new XMLHttpRequest();
			syncXHR.open("GET", "#", false);
			assert.equal(syncXHR.readyState, 1, "After open, readyState should be 1");
			bSyncOngoing = true;
			syncXHR.send();
			bSyncOngoing = false;
			assert.equal(syncXHR.readyState, 4, "After send for sync requests, readyState should be 4");
		});

		QUnit.test("events removed", function(assert) {
			var bSyncOngoing = false,
				done = assert.async();

			var asyncXHR = new XMLHttpRequest();

			function asyncListener1() {
				assert.equal(bSyncOngoing, false, "Handler must not be called while synchronous request is ongoing");
				assert.equal(asyncXHR.readyState, 1, "As events are removed synchronously, only readyState 1 should be fired");
			}

			function asyncListener2() {
				assert.equal(bSyncOngoing, false, "Handler must not be called while synchronous request is ongoing");
				assert.equal(asyncXHR.readyState, 1, "As events are removed synchronously, only readyState 1 should be fired");
			}
			asyncXHR.addEventListener("readystatechange", asyncListener1);
			asyncXHR.onreadystatechange = asyncListener2;
			asyncXHR.open("GET", "#", true);
			asyncXHR.send();

			var syncXHR = new XMLHttpRequest();
			syncXHR.open("GET", "#", false);
			bSyncOngoing = true;
			syncXHR.send();
			bSyncOngoing = false;

			asyncXHR.onreadystatechange = null;
			asyncXHR.removeEventListener("readystatechange", asyncListener1);

			setTimeout(function() {
				done();
			}, 0);
		});

		QUnit.test("async readyState without listener", function(assert) {
			var iTimeoutWaitLimit = 5000;
			var iTimeoutWaitCurrent = 0;
			var iTimeout = 10;
			var asyncXHR = new XMLHttpRequest();
			var done = assert.async();

			// This tests the behavior without using the "readystatechange" listener,
			// which may be unstable when relying on setTimout. Therefore the timeout will be extended to a
			// provided maximum wait time.
			var fnReadyStateTest = function() {
				if (asyncXHR.readyState !== 4 && iTimeoutWaitCurrent < iTimeoutWaitLimit) {
					iTimeoutWaitCurrent += iTimeout;
					setTimeout(function () {
						fnReadyStateTest();
					}, iTimeout);
				} else {
					assert.equal(asyncXHR.readyState, 4, "Ready state should be 4 after request is completed");
					done();
				}
			};

			asyncXHR.open("GET", "#", true);
			asyncXHR.send();
			fnReadyStateTest();
		});

		QUnit.test("setTimeout/setInterval with strings", function(assert) {
			var iInterval,
				done = assert.async();

			assert.expect(2);

			/* eslint-disable no-implied-eval */
			setTimeout("window.bTimeout = true", 0); // legacy-relevant
			iInterval = setInterval("window.bInterval = true", 0); // legacy-relevant
			/* eslint-enable no-implied-eval */

			setTimeout(function() {
				assert.ok(window.bTimeout, "String based timeout has been triggered");
				assert.ok(window.bInterval, "String based interval has been triggered");
				clearInterval(iInterval);
				delete window.bTimeout;
				delete window.bInterval;
				done();
			}, 100);
		});

		QUnit.test("sync/Promise/setTimeout", function(assert) {
			var bSyncOngoing = false,
				bTimeoutTriggered = false,
				bIntervalTriggered = false,
				bPromiseTriggered = false,
				vInterval,
				done = assert.async(),
				oResolved = Promise.resolve(),
				oRejected = Promise.reject();

			assert.expect(12);
			setTimeout(function(bTest) {
				bTimeoutTriggered = true;
				assert.ok(bTest, "Timeout parameter is passed correctly");
			}, 0, true);

			vInterval = setInterval(function(bTest) {
				bIntervalTriggered = true;
				assert.ok(bTest, "Interval parameter is passed correctly");
				clearInterval(vInterval);
			}, 0, true);

			oResolved.then(function() {
				bSyncOngoing = true;
				jQuery.ajax({
					url: "",
					async: false,
					cache: false
				});
				bSyncOngoing = false;
				oResolved.then(function() {
					bPromiseTriggered = true;
					assert.ok(!bTimeoutTriggered, "Resolved after request: Timeout must not have been triggered");
					assert.ok(!bIntervalTriggered, "Resolved after request: Interval must not have been triggered");
				});
			});

			oResolved.then(function() {
				assert.ok(!bSyncOngoing, "Resolved: Sync request is no longer running");
				assert.ok(!bTimeoutTriggered, "Resolved: Timeout must not have been triggered");
				assert.ok(!bIntervalTriggered, "Resolved: Interval must not have been triggered");
				assert.ok(!bPromiseTriggered, "Resolved: Promise must not have been triggered");
			});
			oRejected.catch(function() {
				assert.ok(!bSyncOngoing, "Rejected: Sync request is no longer running");
				assert.ok(!bTimeoutTriggered, "Rejected: Timeout must not have been triggered");
				assert.ok(!bIntervalTriggered, "Rejected: Interval must not have been triggered");
				assert.ok(!bPromiseTriggered, "Rejected: Promise must not have been triggered");
			});

			setTimeout(function() {
				done();
			}, 0);
		});

		QUnit.test("sync/Promise reject/resolve", function(assert) {
			assert.expect(4);
			var done = assert.async(),
				oError = new Error(),
				oResolved = Promise.resolve();

			oResolved.then(function() {
				jQuery.ajax({
					url: "",
					async: false,
					cache: false
				});
			});

			oResolved.then(function() {
				return 123;
			}).then(function(oResult) {
				assert.equal(oResult, 123, "Promise resolves with returned value");
			});

			oResolved.then(function() {
				return Promise.resolve(123);
			}).then(function(oResult) {
				assert.equal(oResult, 123, "Promise resolves with resolved promise value");
			});

			oResolved.then(function() {
				return Promise.reject(oError);
			}).catch(function(oException) {
				assert.equal(oException, oError, "Promise rejects with rejected promise Error");
			});

			oResolved.then(function() {
				throw oError;
			}).catch(function(oException) {
				assert.equal(oException, oError, "Promise rejects with thrown Error");
			});

			setTimeout(function() {
				done();
			}, 0);

		});

		/*eslint-disable no-console, no-native-reassign, no-undef*/
		QUnit.module("LocalStorageConfig", {
			beforeEach: function() {
				// to check the behavior of this test in the absence of localStorage, uncomment the following line
				// delete window.localStorage;
				this.bLocalStorage = (function() {
					try {
						localStorage.setItem("foo", "foo");
						localStorage.removeItem("foo");
						return true;
					} catch (e) {
						return false;
					}
				}());
				this.alert = window.alert;
				window.alert = sinon.spy();
				sinon.stub(console, 'warn');
			},
			afterEach: function() {
				jQuery.sap.debug(false);
				window.alert = this.alert;
				console.warn.restore();
			}
		});
		/*eslint-enable no-native-reassign, no-undef*/

		QUnit.test("jQuery.sap.debug", function(assert) {
			assert.expect(7);
			assert.strictEqual(jQuery.sap.debug(true), this.bLocalStorage ? "true" : undefined, "activation - boolean");
			assert.strictEqual(jQuery.sap.debug("foo"), this.bLocalStorage ? "foo" : undefined, "activation - string");
			assert.strictEqual(jQuery.sap.debug("foo"), this.bLocalStorage ? "foo" : undefined, "activation - 1");
			assert.strictEqual(jQuery.sap.debug(false), this.bLocalStorage ? null : undefined, "deactivation - boolean");
			assert.strictEqual(jQuery.sap.debug(null), this.bLocalStorage ? null : undefined, "deactivation - null");
			assert.strictEqual(jQuery.sap.debug(0), this.bLocalStorage ? null : undefined, "deactivation - 0");

			if (this.bLocalStorage) {
				assert.equal(window.alert.callCount, 5, "alerts");
			} else {
				assert.equal(console.warn.callCount, 6, "console warnings");
			}
		});

		QUnit.test("jQuery.sap.setReboot", function(assert) {
			assert.expect(4);
			assert.strictEqual(jQuery.sap.setReboot("foo"), this.bLocalStorage ? "foo" : undefined, "activation - string");
			assert.strictEqual(jQuery.sap.setReboot(""), this.bLocalStorage ? null : undefined, "deactivation - string");
			assert.strictEqual(jQuery.sap.setReboot(), this.bLocalStorage ? null : undefined, "deactivation - undefined");

			if (this.bLocalStorage) {
				assert.equal(window.alert.callCount, 1, "alerts");
			} else {
				assert.equal(console.warn.callCount, 3, "console warnings");
			}
		});

		QUnit.test("jQuery.sap.statistics", function(assert) {
			assert.expect(4);
			assert.strictEqual(jQuery.sap.statistics(true), this.bLocalStorage ? true : undefined, "activation - boolean");
			assert.strictEqual(jQuery.sap.statistics(false), this.bLocalStorage ? false : undefined, "deactivation - boolean");
			assert.strictEqual(jQuery.sap.statistics(), this.bLocalStorage ? false : undefined, "deactivation - undefined");
			if (this.bLocalStorage) {
				assert.equal(window.alert.callCount, 2, "alerts");
			} else {
				assert.equal(console.warn.callCount, 3, "console warnings");
			}
		});

		QUnit.module("Test jQuery.browser");
		QUnit.test("jQuery.browser", function(assert) {
			assert.ok(jQuery.browser, "jQuery.browser should be available.");
		});

		QUnit.module("Test jQuery.support");
		QUnit.test("jQuery.support", function(assert) {
			assert.ok(jQuery.support, "jQuery.support should be available.");
			assert.ok(typeof jQuery.support.cssTransforms === "boolean", "jQuery.support.cssTransforms should be set and type of boolean.");
			assert.ok(typeof jQuery.support.cssTransforms3d === "boolean", "jQuery.support.cssTransforms3d should be set and type of boolean.");
			assert.ok(typeof jQuery.support.cssTransitions === "boolean", "jQuery.support.cssTransitions should be set and type of boolean.");
			assert.ok(typeof jQuery.support.cssAnimations === "boolean", "jQuery.support.cssAnimations should be set and type of boolean.");
			assert.ok(typeof jQuery.support.cssGradients === "boolean", "jQuery.support.cssGradients should be set and type of boolean.");
			assert.ok(typeof jQuery.support.flexBoxPrefixed === "boolean", "jQuery.support.flexBoxPrefixed should be set and type of boolean.");
			assert.ok(typeof jQuery.support.flexBoxLayout === "boolean", "jQuery.support.flexBoxLayout should be set and type of boolean.");
			assert.ok(typeof jQuery.support.newFlexBoxLayout === "boolean", "jQuery.support.newFlexBoxLayout should be set and type of boolean.");
			assert.ok(typeof jQuery.support.hasFlexBoxSupport === "boolean", "jQuery.support.hasFlexBoxSupport should be set and type of boolean.");
		});
	});
});
