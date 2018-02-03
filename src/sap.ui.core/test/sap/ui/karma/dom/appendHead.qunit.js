/*global QUnit */
sap.ui.require(["sap/ui/dom/appendHead"], function(appendHead) {

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