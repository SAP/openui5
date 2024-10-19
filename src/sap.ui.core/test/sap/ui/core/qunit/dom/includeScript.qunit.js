/*global QUnit */
sap.ui.define([
	"./testdata/dataStore",
	"sap/ui/dom/includeScript"
], function(dataStore, includeScript) {
	"use strict";

	var sPath = sap.ui.require.toUrl("testdata/core");

	QUnit.module("sap/ui/dom/includeScript", {
		beforeEach: function() {
			dataStore.counter = 0;
		}
	});

	QUnit.test("basic (callback)", function(assert) {
		var done = assert.async();
		function handleError () {
			assert.notOk(true, "Error callback called");
			done();
		}
		includeScript(sPath + "/dom/testdata/incrementDataStoreCounter.js", "includeScriptTestScript", function() {
			var iBefore = dataStore.counter;
			var iScriptCnt = document.getElementsByTagName("SCRIPT").length;
			includeScript(sPath + "/dom/testdata/incrementDataStoreCounter.js", "includeScriptTestScript", function() {
				assert.strictEqual(dataStore.counter, iBefore + 1, "dataStore.counter should have been incremented");
				assert.strictEqual(document.getElementsByTagName("SCRIPT").length, iScriptCnt, "no new script element should have been created");
				done();
			}, handleError);
		}, handleError);
	});

	QUnit.test("basic (Promise)", function(assert) {
		var iBefore;
		var iScriptCnt;
		return includeScript({
			url: sPath + "/dom/testdata/incrementDataStoreCounter.js",
			id: "includeScriptTestScript"
		}).then(function() {
			iBefore = dataStore.counter;
			iScriptCnt = document.getElementsByTagName("SCRIPT").length;
			return includeScript({
				url: sPath + "/dom/testdata/incrementDataStoreCounter.js",
				id: "includeScriptTestScript"
			});
		}).then(function() {
			assert.strictEqual(dataStore.counter, iBefore + 1, "dataStore.counter should have been incremented");
			assert.strictEqual(document.getElementsByTagName("SCRIPT").length, iScriptCnt, "no new script element should have been created");
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

		aPromises.push(includeScriptWrapped(sPath + "/dom/testdata/dummy.js", {
			"id": "myscript",
			"data-sap-ui-attr": "attrval"
		}).then(function() {
			var oScript = document.getElementById("myscript");
			assert.ok(oScript, "script should have been found");
			assert.strictEqual(oScript.getAttribute("data-sap-ui-attr"), "attrval", "script should have a custom attribute");
			return includeScriptWrapped(sPath + "/dom/testdata/dummy.js", {
				"id": "myscript",
				"data-sap-ui-attr": "otherval"
			}).then(function() {
				var oScript = document.getElementById("myscript");
				assert.ok(oScript, "script should have been found");
				assert.strictEqual(oScript.getAttribute("data-sap-ui-attr"), "otherval", "script should have replaced the custom attribute");
			});
		}));

		aPromises.push(includeScriptWrapped(sPath + "/dom/testdata/dummy.js", {
			"data-sap-ui-id": "myscript",
			"data-sap-ui-attr": "attrval"
		}).then(function() {
			var oScript = document.querySelectorAll("script[data-sap-ui-id='myscript']")[0];
			assert.ok(oScript, "script should have been found");
			assert.strictEqual(oScript.getAttribute("data-sap-ui-attr"), "attrval", "script should have a custom attribute");
		}));

		aPromises.push(includeScript({
			"url": sPath + "/dom/testdata/dummy.js",
			"attributes": {
				"id": "myscript-async-attrid",
				"data-sap-ui-attr": "attrval"
			}
		}).then(function() {
			var oScript = document.getElementById("myscript-async-attrid");
			assert.ok(oScript, "script should have been found");
			assert.strictEqual(oScript.getAttribute("data-sap-ui-attr"), "attrval", "script should have a custom attribute");
			return includeScript({
				"url": sPath + "/dom/testdata/dummy.js",
				"attributes": {
					"id": "myscript-async-attrid",
					"data-sap-ui-attr": "otherval"
				}
			}).then(function() {
				var oScript = document.getElementById("myscript-async-attrid");
				assert.ok(oScript, "script should have been found");
				assert.strictEqual(oScript.getAttribute("data-sap-ui-attr"), "otherval", "script should have replaced the custom attribute");
			});
		}));

		aPromises.push(includeScript({
			"url": sPath + "/dom/testdata/dummy.js",
			"id": "myscript-async",
			"attributes": {
				"id": "myscript-async-override",
				"data-sap-ui-attr": "attrval"
			}
		}).then(function() {
			var oScript = document.getElementById("myscript-async");
			assert.ok(oScript, "script should have been found");
			assert.notOk(document.getElementById("myscript-async-override"), "script should have not been found");
			assert.strictEqual(oScript.getAttribute("data-sap-ui-attr"), "attrval", "script should have a custom attribute");
		}));

		aPromises.push(includeScript({
			"url": sPath + "/dom/testdata/dummy.js",
			"attributes": {
				"data-sap-ui-id": "myscript-async",
				"data-sap-ui-attr": "attrval"
			}
		}).then(function() {
			var oScript = document.querySelectorAll("script[data-sap-ui-id='myscript-async']")[0];
			assert.ok(oScript, "script should have been found");
			assert.strictEqual(oScript.getAttribute("data-sap-ui-attr"), "attrval", "script should have a custom attribute");
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
		includeScript(sPath + "testdata/dummy.js", null);
		assert.ok(true, "No exception occurs when using null as parameter.");
	});

	QUnit.test("custom attributes (immutable)", function(assert) {

		var mAttributes = {
			"data-sap-ui-attr": "attrval"
		};

		return includeScript({
			url: sPath + "/testdata/dummy.js",
			id : "myscript-immutable",
			attributes: mAttributes
		}).then(function() {
			assert.notOk(mAttributes.id, "attributes should not be modified");
		});

	});

});