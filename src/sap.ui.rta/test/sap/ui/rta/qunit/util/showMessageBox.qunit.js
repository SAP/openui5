/*global QUnit*/

sap.ui.define([
	"sap/ui/rta/util/showMessageBox",
	"sap/ui/core/Core",
	"sap/m/MessageBox",
	"sap/ui/thirdparty/sinon-4"
],
function (
	showMessageBox,
	oCore,
	MessageBox,
	sinon
) {
	"use strict";
	var sandbox = sinon.createSandbox();

	function fnTriggerMessageBox(sMessage, sType) {
		showMessageBox(
			sMessage,
			{
				id: "messagebox"
			},
			sType
		);
	}

	QUnit.module("Basic functionality", {
		beforeEach: function() {
		},
		afterEach: function() {
			sandbox.restore();
		}
	}, function () {
		QUnit.test("call without links - show", function (assert) {
			var fnDone = assert.async();
			var sMessage = "My custom message";
			var sType = "show";
			var messageBoxSpy = sandbox.spy(MessageBox, sType);
			fnTriggerMessageBox(sMessage, sType);

			var oMessageBoxDialog = oCore.byId("messagebox");

			oMessageBoxDialog.attachAfterOpen(function (oEvent) {
				assert.strictEqual(oEvent.getSource().$("cont").text(), sMessage);
				assert.ok(messageBoxSpy.calledOnce, "MessageBox Type was set correctly");
				oMessageBoxDialog.destroy();
				fnDone();
			});
		});

		var aMessageBoxTypes = ["show", "alert", "confirm", "error", "information", "success", "warning"];

		aMessageBoxTypes.forEach(function (sType) {
			QUnit.test("call with a link - " + sType, function (assert) {
				var fnDone = assert.async();
				var sMessageWithLink = "My [custom](http://example.com/) message";
				var messageBoxSpy = sandbox.spy(MessageBox, sType);

				fnTriggerMessageBox(sMessageWithLink, sType);

				var oMessageBoxDialog = oCore.byId("messagebox");

				oMessageBoxDialog.attachAfterOpen(function (oEvent) {
					var sMessage = "My custom message";
					assert.strictEqual(oEvent.getSource().$("cont").text(), sMessage);
					var oLink = oEvent.getSource().$("cont").find("a");
					assert.strictEqual(oLink.length, 1);
					assert.strictEqual(oLink.attr("href"), "http://example.com/");
					assert.strictEqual(oLink.text(), "custom");
					assert.ok(messageBoxSpy.calledOnce, "MessageBox Type was set correctly");
					oMessageBoxDialog.destroy();
					fnDone();
				});
			});
		});

		QUnit.test("call with multiple links - show", function (assert) {
			var fnDone = assert.async();
			var sMessage = "My custom message with multiple links";
			var sMessageWithLink = "My [custom](http://example.com/0) message with [multiple](http://example.com/1) [links](http://example.com/2)";
			var sType = "show";
			var messageBoxSpy = sandbox.spy(MessageBox, sType);

			fnTriggerMessageBox(sMessageWithLink, sType);

			var oMessageBoxDialog = oCore.byId("messagebox");

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
				assert.ok(messageBoxSpy.calledOnce, "MessageBox Type was set correctly");

				oMessageBoxDialog.destroy();
				fnDone();
			});
		});

		QUnit.test("call with a link - no type added", function (assert) {
			var fnDone = assert.async();
			var sMessage = "My custom message";
			var sMessageWithLink = "My [custom](http://example.com/) message";
			var messageBoxSpy = sandbox.spy(MessageBox, "show");

			showMessageBox(
				sMessageWithLink,
				{
					id: "messagebox"
				}
			);

			var oMessageBoxDialog = oCore.byId("messagebox");

			oMessageBoxDialog.attachAfterOpen(function (oEvent) {
				assert.strictEqual(oEvent.getSource().$("cont").text(), sMessage);
				var oLink = oEvent.getSource().$("cont").find("a");
				assert.strictEqual(oLink.length, 1);
				assert.strictEqual(oLink.attr("href"), "http://example.com/");
				assert.strictEqual(oLink.text(), "custom");
				assert.ok(messageBoxSpy.calledOnce, "MessageBox Type was set correctly");
				oMessageBoxDialog.destroy();
				fnDone();
			});
		});
	});

	QUnit.done(function () {
		document.getElementById("qunit-fixture").style.display = "none";
	});
});
