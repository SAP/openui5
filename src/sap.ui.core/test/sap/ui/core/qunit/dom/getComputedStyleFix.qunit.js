/*global QUnit */
sap.ui.define(["sap/ui/dom/getComputedStyleFix"], function(getComputedStyleFix) {
	"use strict";


	var _oldComputedStyle = window.getComputedStyle;
	QUnit.module("sap.ui.dom.getComputedStyleFix", {
		afterEach: function() {
			// reset globals
			window.getComputedStyle = _oldComputedStyle;
		}
	});

	QUnit.test("basic", function(assert) {
		getComputedStyleFix();
		var oDetachedDiv = document.createElement("div");
		assert.ok(window.getComputedStyle(oDetachedDiv), "css style is successfully returned for detached div");
	});


	QUnit.test("simulate getComputedStyle returning null", function(assert) {

		var oDetachedDiv = document.createElement("div");
		var actual =  function() {
			return null;
		};
		Object.defineProperty(window, "getComputedStyle", {
			get: function() {
				return actual;
			},
			set: function(vValue) {
				actual = vValue;
			}
		});
		getComputedStyleFix();

		assert.ok(window.getComputedStyle(oDetachedDiv), "css style is successfully returned for detached div");
	});

	QUnit.test("simulate getComputedStyle returning null and document.body being null", function(assert) {

		var oDetachedDiv = document.createElement("div");
		var fnGetComputedStyle =  function() {
			return null;
		};
		Object.defineProperty(window, "getComputedStyle", {
			get: function() {
				return fnGetComputedStyle;
			},
			set: function(vValue) {
				fnGetComputedStyle = vValue;
			}
		});
		var _oldBody = document.body;
		var oBody = null;
		Object.defineProperty(document, "body", {
			get: function() {
				return oBody;
			},
			set: function(vValue) {
				oBody = vValue;
			}
		});
		assert.notOk(document.body);
		getComputedStyleFix();
		assert.ok(window.getComputedStyle(oDetachedDiv), "css style is successfully returned for detached div");
		document.body = _oldBody;
		assert.ok(document.body);
	});

});