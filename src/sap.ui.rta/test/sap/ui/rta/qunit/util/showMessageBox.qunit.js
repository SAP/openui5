/*global QUnit*/

sap.ui.define([
	"sap/ui/rta/util/showMessageBox"
],
function (
	showMessageBox
) {
	"use strict";

	QUnit.module("Basic functionality", function () {
		QUnit.test("call without links", function (assert) {
			var fnDone = assert.async();
			var sMessage = "My custom message";

			showMessageBox(sMessage, {
				id: "messagebox"
			});

			var oMessageBoxDialog = sap.ui.getCore().byId("messagebox");

			oMessageBoxDialog.attachAfterOpen(function (oEvent) {
				assert.strictEqual(oEvent.getSource().$("cont").text(), sMessage);
				oMessageBoxDialog.destroy();
				fnDone();
			});
		});

		QUnit.test("call with a link", function (assert) {
			var fnDone = assert.async();
			var sMessage = "My custom message";
			var sMessageWithLink = "My [custom](http://example.com/) message";

			showMessageBox(sMessageWithLink, {
				id: "messagebox"
			});

			var oMessageBoxDialog = sap.ui.getCore().byId("messagebox");

			oMessageBoxDialog.attachAfterOpen(function (oEvent) {
				assert.strictEqual(oEvent.getSource().$("cont").text(), sMessage);
				var oLink = oEvent.getSource().$("cont").find("a");
				assert.strictEqual(oLink.length, 1);
				assert.strictEqual(oLink.attr("href"), "http://example.com/");
				assert.strictEqual(oLink.text(), "custom");
				oMessageBoxDialog.destroy();
				fnDone();
			});
		});

		QUnit.test("call with multiple links", function (assert) {
			var fnDone = assert.async();
			var sMessage = "My custom message with multiple links";
			var sMessageWithLink = "My [custom](http://example.com/0) message with [multiple](http://example.com/1) [links](http://example.com/2)";

			showMessageBox(sMessageWithLink, {
				id: "messagebox"
			});

			var oMessageBoxDialog = sap.ui.getCore().byId("messagebox");

			oMessageBoxDialog.attachAfterOpen(function (oEvent) {
				assert.strictEqual(oEvent.getSource().$("cont").text(), sMessage);
				var oLinks = oEvent.getSource().$("cont").find("a");
				assert.strictEqual(oLinks.length, 3);

				var oLink0 = oLinks.eq(0);
				assert.strictEqual(oLink0.attr("href"), "http://example.com/0");
				assert.strictEqual(oLink0.text(), "custom");

				var oLink1 = oLinks.eq(1);
				assert.strictEqual(oLink1.attr("href"), "http://example.com/1");
				assert.strictEqual(oLink1.text(), "multiple");

				var oLink2 = oLinks.eq(2);
				assert.strictEqual(oLink2.attr("href"), "http://example.com/2");
				assert.strictEqual(oLink2.text(), "links");


				oMessageBoxDialog.destroy();
				fnDone();
			});
		});
	});

	QUnit.done(function () {
		document.getElementById("qunit-fixture").style.display = "none";
	});
});
