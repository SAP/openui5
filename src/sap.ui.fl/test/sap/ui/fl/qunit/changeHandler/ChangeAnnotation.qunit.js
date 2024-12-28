/* global QUnit */

sap.ui.define([
	"sap/ui/fl/apply/_internal/flexObjects/AnnotationChange",
	"sap/ui/fl/changeHandler/condenser/Classification",
	"sap/ui/fl/changeHandler/ChangeAnnotation",
	"sap/ui/fl/Layer"
], function(
	AnnotationChange,
	Classification,
	ChangeAnnotation,
	Layer
) {
	"use strict";

	QUnit.module("sap.ui.fl.changeHandler.ChangeAnnotation", {
		beforeEach() {
			this.oAnnotationChange = new AnnotationChange({
				serviceUrl: "someServiceUrl",
				layer: Layer.CUSTOMER,
				flexObjectMetadata: {
					changeType: "myChangeType"
				}
			});
		},
		afterEach() {
			this.oAnnotationChange.destroy();
		}
	}, function() {
		QUnit.test("completeChangeContent / applyChange / getCondenserInfo", function(assert) {
			assert.deepEqual(this.oAnnotationChange.getContent(), {}, "initial content is empty");
			ChangeAnnotation.completeChangeContent(this.oAnnotationChange, {
				content: {
					annotationPath: "somePath",
					value: "someValue",
					unknownProperty: "someUnknownProperty"
				}
			});
			assert.deepEqual(this.oAnnotationChange.getContent(), {
				annotationPath: "somePath",
				value: "someValue"
			}, "content was set correctly");

			const oApplyChangeResult = ChangeAnnotation.applyChange(this.oAnnotationChange);
			assert.deepEqual(oApplyChangeResult, {
				path: "somePath",
				value: "someValue"
			}, "applyChange returns the correct result");

			const oDummyAppComponent = {foo: "bar"};
			const oCondenserInfo = ChangeAnnotation.getCondenserInfo(this.oAnnotationChange, {appComponent: oDummyAppComponent});
			assert.deepEqual(oCondenserInfo, {
				affectedControl: oDummyAppComponent,
				classification: Classification.LastOneWins,
				uniqueKey: "somePath_myChangeType"
			}, "getCondenserInfo returns the correct result");
		});
	});

	QUnit.done(function() {
		document.getElementById("qunit-fixture").style.display = "none";
	});
});