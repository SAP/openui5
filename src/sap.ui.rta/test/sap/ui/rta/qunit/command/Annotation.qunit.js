/* global QUnit */

sap.ui.define([
	"sap/ui/rta/command/Annotation",
	"rta/test/qunit/command/basicCommandTest"
], function(
	AnnotationCommand,
	basicCommandTest
) {
	"use strict";

	basicCommandTest({
		commandName: "annotation",
		designTimeAction: false
	}, {
		changeType: "annotation",
		content: "myFancyContent"
	}, {
		changeType: "annotation",
		content: "myFancyContent"
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