/* global QUnit */

sap.ui.define([
	"rta/test/qunit/command/basicCommandTest",
	"sap/ui/rta/command/AnnotationCommand"
], function(
	basicCommandTest,
	AnnotationCommand
) {
	"use strict";

	basicCommandTest({
		commandName: "annotation",
		designtimeActionStructure: "annotation",
		variantIndependent: true
	}, {
		changeType: "annotation",
		serviceUrl: "testServiceUrl",
		content: {
			myFancy: "Content"
		}
	}, {
		changeType: "annotation",
		serviceUrl: "testServiceUrl",
		content: {
			myFancy: "Content"
		}
	});

	QUnit.module("AnnotationCommand Tests", {
		beforeEach() {
			this.oAnnotationCommand = new AnnotationCommand();
		},
		afterEach() {
			this.oAnnotationCommand.destroy();
		}
	});

	QUnit.test("needsReload property is true", function(assert) {
		assert.strictEqual(this.oAnnotationCommand.needsReload, true, "needsReload is true");
	});

	QUnit.done(function() {
		document.getElementById("qunit-fixture").style.display = "none";
	});
});