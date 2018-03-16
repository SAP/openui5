/*global QUnit */
sap.ui.define(["sap/ui/dom/appendHead"], function(appendHead) {
	"use strict";

	QUnit.module("sap.ui.dom.appendHead");

	QUnit.test("Add element to head", function(assert) {
		var oLink = document.createElement("Link");
		appendHead(oLink);
		var head = window.document.getElementsByTagName("head")[0];
		if (head) {
			assert.strictEqual(head.lastChild, oLink);
		}
	});
});