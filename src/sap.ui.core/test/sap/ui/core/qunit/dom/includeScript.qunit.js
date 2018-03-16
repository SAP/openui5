/*global QUnit */
sap.ui.define(["sap/ui/dom/includeScript"], function(includeScript) {
	"use strict";

	QUnit.module("sap.ui.dom.includeScript", {
		beforeEach: function() {
			window.sap.jsunittestvalue = 0;
		}
	});

	QUnit.test("basic", function(assert) {
		var done = assert.async();
		function handleError () {
			assert.notOk(true, "Error callback called");
			done();
		}
		includeScript("./dom/testdata/sapjsunittestvalueincrementor.js", "jsunitIncludeScriptTestScript", function() {
			var iBefore = sap.jsunittestvalue;
			var iScriptCnt = document.getElementsByTagName("SCRIPT").length;
			includeScript("./dom/testdata/sapjsunittestvalueincrementor.js", "jsunitIncludeScriptTestScript", function() {
				assert.strictEqual(iBefore + 1, sap.jsunittestvalue, "testvalue should have been incremented");
				assert.strictEqual(iScriptCnt, document.getElementsByTagName("SCRIPT").length, "no new script element should have been created");
				done();
			}, handleError);
		}, handleError);
	});

	QUnit.test("basic (Promise)", function(assert) {
		var iBefore;
		var iScriptCnt;
		return includeScript({
			url: "./dom/testdata/sapjsunittestvalueincrementor.js",
			id: "jsunitIncludeScriptTestScript"
		}).then(function() {
			iBefore = sap.jsunittestvalue;
			iScriptCnt = document.getElementsByTagName("SCRIPT").length;
			return includeScript({
				url: "./dom/testdata/sapjsunittestvalueincrementor.js",
				id: "jsunitIncludeScriptTestScript"
			});
		}).then(function() {
			assert.strictEqual(iBefore + 1, sap.jsunittestvalue, "testvalue should have been incremented");
			assert.strictEqual(iScriptCnt, document.getElementsByTagName("SCRIPT").length, "no new script element should have been created");
		});
	});

	QUnit.test("custom attributes", function(assert) {

		function includeScriptWrapped(vUrl, mAttributes) {
			return new Promise(function(fnResolve, fnReject) {
				includeScript(vUrl, mAttributes, fnResolve, fnReject);
			});
		}

		var done = assert.async();
		var aPromises = [];

		aPromises.push(includeScriptWrapped("./dom/testdata/dummy.js", {
			"id": "myscript",
			"data-sap-ui-attr": "attrval"
		}).then(function() {
			var oScript = document.getElementById("myscript");
			assert.ok(oScript, "script should have been found");
			assert.strictEqual("attrval", oScript.getAttribute("data-sap-ui-attr"), "script should have a custom attribute");
			return includeScriptWrapped("./dom/testdata/dummy.js", {
				"id": "myscript",
				"data-sap-ui-attr": "otherval"
			}).then(function() {
				var oScript = document.getElementById("myscript");
				assert.ok(oScript, "script should have been found");
				assert.strictEqual("otherval", oScript.getAttribute("data-sap-ui-attr"), "script should have replaced the custom attribute");
			});
		}));

		aPromises.push(includeScriptWrapped("./dom/testdata/dummy.js", {
			"data-sap-ui-id": "myscript",
			"data-sap-ui-attr": "attrval"
		}).then(function() {
			var oScript = document.querySelectorAll("script[data-sap-ui-id='myscript']")[0];
			assert.ok(oScript, "script should have been found");
			assert.strictEqual("attrval", oScript.getAttribute("data-sap-ui-attr"), "script should have a custom attribute");
		}));

		aPromises.push(includeScript({
			"url": "./dom/testdata/dummy.js",
			"attributes": {
				"id": "myscript-async-attrid",
				"data-sap-ui-attr": "attrval"
			}
		}).then(function() {
			var oScript = document.getElementById("myscript-async-attrid");
			assert.ok(oScript, "script should have been found");
			assert.strictEqual("attrval", oScript.getAttribute("data-sap-ui-attr"), "script should have a custom attribute");
			return includeScript({
				"url": "./dom/testdata/dummy.js",
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

		aPromises.push(includeScript({
			"url": "./dom/testdata/dummy.js",
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

		aPromises.push(includeScript({
			"url": "./dom/testdata/dummy.js",
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

});