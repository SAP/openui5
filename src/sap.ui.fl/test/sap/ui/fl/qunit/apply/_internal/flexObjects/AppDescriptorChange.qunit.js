/* global QUnit */
sap.ui.define([
	"sap/base/util/restricted/_omit",
	"sap/ui/core/Core",
	"sap/ui/fl/apply/_internal/flexObjects/FlexObjectFactory"
], function(
	_omit,
	Core,
	FlexObjectFactory
) {
	"use strict";

	var oChangeDefinition = {
		appDescriptorChange: true,
		fileName: "id_1656921947872_169_appDescriptor",
		fileType: "change",
		changeType: "appDescriptor",
		reference: "my.reference",
		content: {
			foo: "bar"
		},
		layer: "VENDOR",
		namespace: "apps/my.reference/changes/",
		projectId: "my.reference",
		creation: "2022-07-04T08:05:48.561Z",
		originalLanguage: "EN",
		support: {
			generator: "my.fancy.generator",
			sapui5Version: Core.getConfiguration().getVersion().toString(),
			compositeCommand: "composite"
		},
		texts: {}
	};
	QUnit.module("FlexObjectFactory", {}, function() {
		QUnit.test("createControllerExtension", function(assert) {
			var mPropertyBag = {
				changeType: oChangeDefinition.changeType,
				content: oChangeDefinition.content,
				layer: oChangeDefinition.layer,
				namespace: oChangeDefinition.namespace,
				reference: oChangeDefinition.reference,
				generator: oChangeDefinition.support.generator,
				compositeCommand: oChangeDefinition.support.compositeCommand
			};
			var oAppDescriptorChange = FlexObjectFactory.createAppDescriptorChange(mPropertyBag);
			assert.ok(oAppDescriptorChange.isA("sap.ui.fl.apply._internal.flexObjects.AppDescriptorChange"), "the correct change was created");
			assert.deepEqual(_omit(oAppDescriptorChange.convertToFileContent(), "creation", "fileName"), _omit(oChangeDefinition, "creation", "fileName"), "the convert function is correct");
		});

		QUnit.test("createFromFileContent", function(assert) {
			var oAppDescriptorChange = FlexObjectFactory.createFromFileContent(oChangeDefinition);
			assert.ok(oAppDescriptorChange.isA("sap.ui.fl.apply._internal.flexObjects.AppDescriptorChange"), "the correct change was created");
			assert.strictEqual(oAppDescriptorChange.getFileType(), "change", "the file type is correct");
			assert.deepEqual(oAppDescriptorChange.convertToFileContent(), oChangeDefinition, "the convert function is correct");
		});
	});
});
