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
		fileName: "id_1656921947872_169_codeExt",
		fileType: "change",
		changeType: "codeExt",
		moduleName: "AP/controller/extension/changes/coding/foo",
		reference: "AP.controller.extension",
		content: {
			codeRef: "coding/foo.js"
		},
		selector: {
			controllerName: "sap.ui.rta.controller.ProductDetail"
		},
		layer: "VENDOR",
		namespace: "apps/sap.ui.rta.changes/",
		projectId: "AP.controller.extension",
		creation: "2022-07-04T08:05:48.561Z",
		originalLanguage: "EN",
		support: {
			generator: "my.fancy.generator",
			sapui5Version: Core.getConfiguration().getVersion().toString()
		},
		texts: {}
	};

	QUnit.module("FlexObjectFactory", {}, function() {
		QUnit.test("createControllerExtensionChange", function(assert) {
			var mPropertyBag = {
				codeRef: oChangeDefinition.content.codeRef,
				controllerName: oChangeDefinition.selector.controllerName,
				layer: oChangeDefinition.layer,
				namespace: oChangeDefinition.namespace,
				reference: oChangeDefinition.reference,
				moduleName: oChangeDefinition.moduleName,
				generator: "my.fancy.generator"
			};
			var oCEChange = FlexObjectFactory.createControllerExtensionChange(mPropertyBag);

			assert.ok(oCEChange.isA("sap.ui.fl.apply._internal.flexObjects.ControllerExtensionChange"), "the correct change was created");
			assert.deepEqual(_omit(oCEChange.convertToFileContent(), "creation", "fileName"), _omit(oChangeDefinition, "creation", "fileName"), "the convert function is correct");
		});

		QUnit.test("createFromFileContent", function(assert) {
			var oCEChange = FlexObjectFactory.createFromFileContent(oChangeDefinition);
			assert.ok(oCEChange.isA("sap.ui.fl.apply._internal.flexObjects.ControllerExtensionChange"), "the correct change was created");
			assert.strictEqual(oCEChange.getFileType(), "change", "the file type is correct");
			assert.strictEqual(oCEChange.getControllerName(), "sap.ui.rta.controller.ProductDetail", "the controller name is correct");
			assert.deepEqual(oCEChange.convertToFileContent(), oChangeDefinition, "the convert function is correct");
		});
	});
});