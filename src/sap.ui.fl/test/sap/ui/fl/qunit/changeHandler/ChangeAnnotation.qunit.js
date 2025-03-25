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

	const sChangeType = "myChangeType";

	function completeAndApplyChange(assert, oChange, sPath, vValue) {
		assert.deepEqual(oChange.getContent(), {}, "initial content is empty");
		ChangeAnnotation.completeChangeContent(oChange, {
			content: {
				annotationPath: sPath,
				value: vValue,
				unknownProperty: "someUnknownProperty"
			}
		});
		assert.deepEqual(oChange.getContent(), {
			annotationPath: sPath,
			value: vValue
		}, "content was set correctly");

		const oApplyChangeResult = ChangeAnnotation.applyChange(oChange);
		assert.deepEqual(oApplyChangeResult, {
			path: sPath,
			value: vValue
		}, "applyChange returns the correct result");

		const oDummyAppComponent = {foo: "bar"};
		const oCondenserInfo = ChangeAnnotation.getCondenserInfo(oChange, {appComponent: oDummyAppComponent});
		assert.deepEqual(oCondenserInfo, {
			affectedControl: oDummyAppComponent,
			classification: Classification.LastOneWins,
			uniqueKey: `${sPath}_${sChangeType}`
		}, "getCondenserInfo returns the correct result");
	}

	QUnit.module("sap.ui.fl.changeHandler.ChangeAnnotation", {
		beforeEach() {
			this.oAnnotationChange = new AnnotationChange({
				serviceUrl: "someServiceUrl",
				layer: Layer.CUSTOMER,
				flexObjectMetadata: {
					changeType: sChangeType
				}
			});
		},
		afterEach() {
			this.oAnnotationChange.destroy();
		}
	}, function() {
		QUnit.test("completeChangeContent / applyChange / getCondenserInfo with value of type string", function(assert) {
			completeAndApplyChange(assert, this.oAnnotationChange, "somePath", "someValue");
		});

		QUnit.test("completeChangeContent / applyChange / getCondenserInfo with value of type object", function(assert) {
			completeAndApplyChange(assert, this.oAnnotationChange, "somePath", {EnumMember: "com.sap.TextArrangementType/TextOnly"});
		});

		QUnit.test("with translatable texts", function(assert) {
			ChangeAnnotation.completeChangeContent(this.oAnnotationChange, {
				content: {
					annotationPath: "somePath",
					value: "someValue",
					text: "someTextValue"
				}
			});
			assert.deepEqual(this.oAnnotationChange.getContent(), {
				annotationPath: "somePath"
			}, "content was set correctly");
			assert.strictEqual(this.oAnnotationChange.getText("annotationText"), "someTextValue", "text was set correctly");

			const oApplyChangeResult = ChangeAnnotation.applyChange(this.oAnnotationChange);
			assert.deepEqual(oApplyChangeResult, {
				path: "somePath",
				value: "someTextValue"
			}, "applyChange returns the correct result");
		});

		QUnit.test("with objectTemplateInfo", function(assert) {
			ChangeAnnotation.completeChangeContent(this.oAnnotationChange, {
				content: {
					annotationPath: "somePath",
					value: "someValue",
					objectTemplateInfo: {
						templateAsString: '{"String": "placeHolder"}',
						placeholder: "placeHolder"
					}
				}
			});
			assert.deepEqual(this.oAnnotationChange.getContent(), {
				annotationPath: "somePath",
				objectTemplateInfo: {
					templateAsString: '{"String": "placeHolder"}',
					placeholder: "placeHolder"
				},
				value: "someValue"
			}, "content was set correctly");

			const oApplyChangeResult = ChangeAnnotation.applyChange(this.oAnnotationChange);
			assert.deepEqual(oApplyChangeResult, {
				path: "somePath",
				value: {String: "someValue"}
			}, "applyChange returns the correct result");
		});

		QUnit.test("with objectTemplateInfo and translatable text", function(assert) {
			ChangeAnnotation.completeChangeContent(this.oAnnotationChange, {
				content: {
					annotationPath: "somePath",
					value: "someValue",
					text: "someTextValue",
					objectTemplateInfo: {
						templateAsString: '{"String": "placeHolder"}',
						placeholder: "placeHolder"
					}
				}
			});
			assert.deepEqual(this.oAnnotationChange.getContent(), {
				annotationPath: "somePath",
				objectTemplateInfo: {
					templateAsString: '{"String": "placeHolder"}',
					placeholder: "placeHolder"
				}
			}, "content was set correctly");

			const oApplyChangeResult = ChangeAnnotation.applyChange(this.oAnnotationChange);
			assert.deepEqual(oApplyChangeResult, {
				path: "somePath",
				value: {String: "someTextValue"}
			}, "applyChange returns the correct result");
		});
	});

	QUnit.done(function() {
		document.getElementById("qunit-fixture").style.display = "none";
	});
});