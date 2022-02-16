/*global QUnit, sinon*/
sap.ui.define([
	'sap/ui/performance/trace/Interaction',
	'sap/ui/core/mvc/XMLView',
	'sap/ui/performance/trace/FESRHelper',
	"sap/ui/test/actions/Press"
], function(Interaction, XMLView, FESRHelper, Press) {
	"use strict";

	QUnit.module("Interaction API", {
		before: function() {
			Interaction.setActive(true);
		},
		after: function() {
			Interaction.setActive(false);
		}
	});

	QUnit.test("add BusyIndicator duration", function(assert) {

		assert.expect(4);
		Interaction.start();
		var oPendingInteraction = Interaction.getPending();
		var iBusyDuration = oPendingInteraction.busyDuration;

		assert.strictEqual(iBusyDuration, 0, "no busy duration shoudl have been added");

		//busy indicator adds busy duration - everything is fine
		Interaction.addBusyDuration(33);
		iBusyDuration = oPendingInteraction.busyDuration;
		assert.strictEqual(iBusyDuration, 33, "busy indicator adds busy duration");


		// interaction is ended because a key was pressed (busy indicator still shows)
		Interaction.end(true);
		assert.notOk(Interaction.getPending(), "interaction is ended because a key was pressed");

		//BusyIndicator#hide uis triggered which calls #addBusyDuration, this call should not fail
		try {
			Interaction.addBusyDuration(33);
		} catch (e) {
			assert.notOk(e, "addBusyDuration should not fail");
		}
		assert.strictEqual(iBusyDuration, oPendingInteraction.busyDuration, "no additional duration is added");

	});

	QUnit.test("set component name", function(assert) {

		assert.expect(5);
		Interaction.start();
		var oPendingInteraction = Interaction.getPending();
		var sComponentName = oPendingInteraction.stepComponent;


		assert.strictEqual(oPendingInteraction.component, "undetermined", "component name should not be set");
		assert.strictEqual(sComponentName, undefined, "step component name should not be set");

		Interaction.setStepComponent("foo");
		sComponentName = oPendingInteraction.stepComponent;
		assert.strictEqual(sComponentName, "foo", "component name should be set");


		Interaction.end(true);
		assert.notOk(Interaction.getPending(), "interaction is ended because a key was pressed");

		try {
			Interaction.setStepComponent("bar");
		} catch (e) {
			assert.notOk(e, "setStepComponent should not fail");
		}
		assert.strictEqual(sComponentName, "foo", "no additional duration is added");

		Interaction.clear();

	});

	QUnit.test("Semantic Stepname", function(assert) {
		assert.expect(2);
		this.clock = sinon.useFakeTimers();
		window.performance.getEntriesByType = function() { return []; };

		return XMLView.create({
			definition: '<mvc:View xmlns:mvc="sap.ui.core.mvc" xmlns="sap.m" xmlns:fesr="http://schemas.sap.com/sapui5/extension/sap.ui.core.FESR/1">'
			+ '          <Button id="btnWithDeclarativeSemanticAnnotation" text="Create something" fesr:press="create"/>                     '
			+ '          <Button id="btnWithProgramaticSemanticAnnotation" text="Delete something"/>                     '
			+ '    </mvc:View>         '
		}).then(function (oView) {
			oView.placeAt("qunit-fixture");
			sap.ui.getCore().applyChanges();
			return new Promise(function(resolve, reject) {
				var oBtn1 = oView.byId("btnWithDeclarativeSemanticAnnotation"),
					oBtn2 = oView.byId("btnWithProgramaticSemanticAnnotation"),
					oPress = new Press(),
					oInteraction;

				FESRHelper.setSemanticStepname(oBtn2, "press", "delete");

				oBtn1.attachPress(function () {
					oInteraction = Interaction.getPending();
					assert.strictEqual(oInteraction.semanticStepName, "create", "Semantic step name declared in XMLView is correct");
					this.clock.tick(1);
					oPress.executeOn(oBtn2);
				}.bind(this));

				oBtn2.attachPress(function () {
					oInteraction = Interaction.getPending();
					assert.strictEqual(oInteraction.semanticStepName, "delete", "Semantic step name set programatically is correct");
					resolve();
				});

				oPress.executeOn(oBtn1);
			}.bind(this)).then(function () {
				// cleanup
				oView.destroy();
				delete window.performance.getEntriesByType;
				this.clock.restore();
			}.bind(this));
		}.bind(this));
	});

});
