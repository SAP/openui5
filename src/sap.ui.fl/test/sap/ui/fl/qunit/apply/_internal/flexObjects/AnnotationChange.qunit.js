/* global QUnit */

sap.ui.define([
	"sap/base/util/restricted/_omit",
	"sap/ui/fl/apply/_internal/flexObjects/FlexObjectFactory"
], function(
	_omit,
	FlexObjectFactory
) {
	"use strict";
	const oAnnotationChangeDefinition = {
		fileName: "id_1656921947872_169_annotationChange",
		fileType: "annotation_change",
		changeType: "annotationChangeType",
		reference: "my.annotation.reference",
		content: {
			annotationPath: "someAnnotationPath",
			value: "someValue"
		},
		layer: "CUSTOMER",
		namespace: "apps/my.annotation.reference/changes/",
		projectId: "my.annotation.reference",
		creation: "2022-07-04T08:05:48.561Z",
		originalLanguage: "EN",
		selector: {
			serviceUrl: "someServiceUrl"
		},
		support: {
			generator: "my.annotation.generator",
			compositeCommand: "composite"
		},
		texts: {}
	};

	QUnit.module("FlexObjectFactory", {}, function() {
		QUnit.test("Creation with property bag", function(assert) {
			var mPropertyBag = {
				changeType: oAnnotationChangeDefinition.changeType,
				content: oAnnotationChangeDefinition.content,
				layer: oAnnotationChangeDefinition.layer,
				namespace: oAnnotationChangeDefinition.namespace,
				reference: oAnnotationChangeDefinition.reference,
				generator: oAnnotationChangeDefinition.support.generator,
				compositeCommand: oAnnotationChangeDefinition.support.compositeCommand,
				serviceUrl: "someServiceUrl"
			};
			var oAnnotationChange = FlexObjectFactory.createAnnotationChange(mPropertyBag);
			assert.ok(oAnnotationChange.isA("sap.ui.fl.apply._internal.flexObjects.AnnotationChange"), "the correct change was created");
			assert.deepEqual(
				_omit(oAnnotationChange.convertToFileContent(), "creation", "fileName"),
				_omit(oAnnotationChangeDefinition, "creation", "fileName"),
				"the convert function is correct"
			);
			assert.strictEqual(oAnnotationChange.getValue(), oAnnotationChangeDefinition.content.value, "the value is correct");
		});

		QUnit.test("Creation from file content", function(assert) {
			const oFileContent = {
				...oAnnotationChangeDefinition,
				texts: { annotationText: { value: "abc" } }
			};
			var oAnnotationChange = FlexObjectFactory.createFromFileContent(oFileContent);
			assert.ok(oAnnotationChange.isA("sap.ui.fl.apply._internal.flexObjects.AnnotationChange"), "the correct change was created");
			assert.strictEqual(oAnnotationChange.getFileType(), "annotation_change", "the file type is correct");
			assert.deepEqual(oAnnotationChange.convertToFileContent(), oFileContent, "the convert function is correct");
			assert.strictEqual(oAnnotationChange.getValue(), "abc", "the value is correct");
		});
	});
});