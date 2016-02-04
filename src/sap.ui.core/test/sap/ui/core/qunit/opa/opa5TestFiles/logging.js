sap.ui.define(['jquery.sap.global', 'sap/ui/test/Opa', 'sap/ui/test/Opa5'], function ($, Opa, Opa5) {
	"use strict";
	var sLogPrefix = "Opa5 - finding controls";

	QUnit.module("Logging", {
		beforeEach: function () {
			var sView = [
				'<core:View xmlns:core="sap.ui.core" xmlns="sap.ui.commons">',
				'<Button id="foo">',
				'</Button>',
				'<Button id="bar">',
				'</Button>',
				'<Button id="baz">',
				'</Button>',
				'<Image id="boo"></Image>',
				'</core:View>'
			].join('');

			this.oView = sap.ui.xmlview({id: "myViewWithAb", viewContent : sView });
			this.oView.setViewName("bar");

			this.oView.placeAt("qunit-fixture");
			sap.ui.getCore().applyChanges();
			var that = this;
			this.waitForStub = sinon.stub(Opa.prototype, "waitFor", function (oOptions) {
				that.check = function () {
					oOptions.check.apply(this, oOptions);
				}.bind(this);
			});

			this.debugSpy = sinon.spy($.sap.log, "debug");
		},
		afterEach: function () {
			this.waitForStub.restore();
			this.debugSpy.restore();
			this.oView.destroy();
		}
	});

	QUnit.test("Should log if a control is not found inside a view", function() {
		// Arrange
		new Opa5().waitFor({
			viewName: "bar",
			id: "notExistingId"
		});

		// Act
		this.check();

		// Assert
		sinon.assert.calledWith(this.debugSpy, sinon.match(/notExistingId in the view bar/), sLogPrefix);
	});

	QUnit.test("Should log if a view is not found", function() {
		// Arrange
		new Opa5().waitFor({
			viewName: "notExistingView"
		});

		// Act
		this.check();

		// Assert
		sinon.assert.calledWith(this.debugSpy, sinon.match("Found no view with the name: notExistingView"), sLogPrefix);
	});
});