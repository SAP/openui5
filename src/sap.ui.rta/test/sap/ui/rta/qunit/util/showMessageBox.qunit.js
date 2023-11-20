/* global QUnit */

sap.ui.define([
	"sap/ui/rta/util/showMessageBox",
	"sap/ui/core/Element",
	"sap/m/MessageBox",
	"sap/ui/thirdparty/sinon-4"
], function(
	showMessageBox,
	Element,
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
		beforeEach() {
		},
		afterEach() {
			sandbox.restore();
		}
	}, function() {
		QUnit.test("call without links - show", function(assert) {
			var fnDone = assert.async();
			var sMessage = "My custom message";
			var sType = "show";
			var messageBoxSpy = sandbox.spy(MessageBox, sType);
			fnTriggerMessageBox(sMessage, sType);

			var oMessageBoxDialog = Element.getElementById("messagebox");

			oMessageBoxDialog.attachAfterOpen(function() {
				assert.strictEqual(document.getElementById("messagebox-cont").textContent, sMessage);
				assert.ok(messageBoxSpy.calledOnce, "MessageBox Type was set correctly");
				oMessageBoxDialog.destroy();
				fnDone();
			});
		});

		var aMessageBoxTypes = ["show", "alert", "confirm", "error", "information", "success", "warning"];

		aMessageBoxTypes.forEach(function(sType) {
			QUnit.test(`call with a link - ${sType}`, function(assert) {
				var fnDone = assert.async();
				var sMessageWithLink = "My [custom](http://example.com/) message";
				var messageBoxSpy = sandbox.spy(MessageBox, sType);

				fnTriggerMessageBox(sMessageWithLink, sType);

				var oMessageBoxDialog = Element.getElementById("messagebox");

				oMessageBoxDialog.attachAfterOpen(function() {
					var sMessage = "My custom message";
					assert.strictEqual(document.getElementById("messagebox-cont").textContent, sMessage);
					var aLink = Array.from(document.getElementById("messagebox-cont").querySelectorAll("a"));
					assert.strictEqual(aLink.length, 1);
					assert.strictEqual(aLink[0].getAttribute("href"), "http://example.com/");
					assert.strictEqual(aLink[0].textContent, "custom");
					assert.ok(messageBoxSpy.calledOnce, "MessageBox Type was set correctly");
					oMessageBoxDialog.destroy();
					fnDone();
				});
			});
		});

		QUnit.test("call with multiple links - show", function(assert) {
			var fnDone = assert.async();
			var sMessage = "My custom message with multiple links";
			var sMessageWithLink = "My [custom](http://example.com/0) message with [multiple](http://example.com/1) [links](http://example.com/2)";
			var sType = "show";
			var messageBoxSpy = sandbox.spy(MessageBox, sType);

			fnTriggerMessageBox(sMessageWithLink, sType);

			var oMessageBoxDialog = Element.getElementById("messagebox");

			oMessageBoxDialog.attachAfterOpen(function() {
				assert.strictEqual(document.getElementById("messagebox-cont").textContent, sMessage);
				var aLinks = Array.from(document.getElementById("messagebox-cont").querySelectorAll("a"));
				assert.strictEqual(aLinks.length, 3);

				var oLink0 = aLinks[0];
				assert.strictEqual(oLink0.getAttribute("href"), "http://example.com/0");
				assert.strictEqual(oLink0.textContent, "custom");

				var oLink1 = aLinks[1];
				assert.strictEqual(oLink1.getAttribute("href"), "http://example.com/1");
				assert.strictEqual(oLink1.textContent, "multiple");

				var oLink2 = aLinks[2];
				assert.strictEqual(oLink2.getAttribute("href"), "http://example.com/2");
				assert.strictEqual(oLink2.textContent, "links");
				assert.ok(messageBoxSpy.calledOnce, "MessageBox Type was set correctly");

				oMessageBoxDialog.destroy();
				fnDone();
			});
		});

		QUnit.test("call with a link - no type added", function(assert) {
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

			var oMessageBoxDialog = Element.getElementById("messagebox");

			oMessageBoxDialog.attachAfterOpen(function() {
				assert.strictEqual(document.getElementById("messagebox-cont").textContent, sMessage);
				var aLink = Array.from(document.getElementById("messagebox-cont").querySelectorAll("a"));
				assert.strictEqual(aLink.length, 1);
				assert.strictEqual(aLink[0].getAttribute("href"), "http://example.com/");
				assert.strictEqual(aLink[0].textContent, "custom");
				assert.ok(messageBoxSpy.calledOnce, "MessageBox Type was set correctly");
				oMessageBoxDialog.destroy();
				fnDone();
			});
		});
	});

	QUnit.done(function() {
		document.getElementById("qunit-fixture").style.display = "none";
	});
});