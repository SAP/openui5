/*global QUnit, sinon */
sap.ui.define([
	"sap/ui/test/pipelines/ActionPipeline"
], function (ActionPipeline) {
	"use strict";

	QUnit.module("processing");

	QUnit.test("Should process a single action", function(assert) {
		// Arrange
		var fnAction = this.spy(),
			oControlStub = {};

		// System under Test
		var oPipeline = new ActionPipeline();

		// Act
		oPipeline.process({
			control: oControlStub,
			actions: fnAction
		});

		// Assert
		sinon.assert.calledWith(fnAction, oControlStub);
	});

	QUnit.test("Should process multiple Actions", function(assert) {
		// Arrange
		var fnFirstAction = this.spy(),
			fnSecondAction = this.spy(),
			oControlStub = {},
			oAction = {
				executeOn: fnSecondAction
			};

		// System under Test
		var oPipeline = new ActionPipeline();

		// Act
		oPipeline.process({
			control: oControlStub,
			actions: [fnFirstAction, oAction]
		});

		// Assert
		sinon.assert.calledWith(fnFirstAction, oControlStub);
		sinon.assert.calledWith(fnSecondAction, oControlStub);
	});

});
