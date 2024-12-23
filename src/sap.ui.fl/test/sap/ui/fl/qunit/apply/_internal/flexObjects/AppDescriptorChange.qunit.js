/* global QUnit */
sap.ui.define([
	"sap/base/util/restricted/_omit",
	"sap/ui/fl/apply/_internal/appVariant/DescriptorChangeTypes",
	"sap/ui/fl/apply/_internal/flexObjects/FlexObjectFactory",
	"sap/ui/thirdparty/sinon-4"
], function(
	_omit,
	DescriptorChangeTypes,
	FlexObjectFactory,
	sinon
) {
	"use strict";
	const sandbox = sinon.createSandbox();

	const oChangeDefinition = {
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
			compositeCommand: "composite"
		},
		texts: {}
	};

	QUnit.module("FlexObjectFactory", {}, function() {
		QUnit.test("createControllerExtension", function(assert) {
			const mPropertyBag = {
				changeType: oChangeDefinition.changeType,
				content: oChangeDefinition.content,
				layer: oChangeDefinition.layer,
				namespace: oChangeDefinition.namespace,
				reference: oChangeDefinition.reference,
				generator: oChangeDefinition.support.generator,
				compositeCommand: oChangeDefinition.support.compositeCommand
			};
			const oAppDescriptorChange = FlexObjectFactory.createAppDescriptorChange(mPropertyBag);
			assert.ok(
				oAppDescriptorChange.isA("sap.ui.fl.apply._internal.flexObjects.AppDescriptorChange"),
				"the correct change was created"
			);
			assert.deepEqual(
				_omit(oAppDescriptorChange.convertToFileContent(), "creation", "fileName"),
				_omit(oChangeDefinition, "creation", "fileName"),
				"the convert function is correct"
			);
		});

		QUnit.test("createFromFileContent", function(assert) {
			const oAppDescriptorChange = FlexObjectFactory.createFromFileContent(oChangeDefinition);
			assert.ok(
				oAppDescriptorChange.isA("sap.ui.fl.apply._internal.flexObjects.AppDescriptorChange"),
				"the correct change was created"
			);
			assert.strictEqual(oAppDescriptorChange.getFileType(), "change", "the file type is correct");
			assert.deepEqual(oAppDescriptorChange.convertToFileContent(), oChangeDefinition, "the convert function is correct");
		});

		QUnit.test("createAppDescriptorChange", function(assert) {
			const oChangeDefinition = {
				appDescriptorChange: true,
				fileName: "id_1656921947872_169_appDescriptor",
				fileType: "change",
				changeType: "appdescr_ui_generic_app_changePageConfiguration",
				content: {
					parentPage: {
						component: "sap.suite.ui.generic.template.ListReport",
						entitySet: "Travel"
					},
					entityPropertyChange: {
						propertyPath: "component/settings/filterSettings/dateSettings",
						operation: "UPSERT",
						propertyValue: {
							useDateRange: false
						}
					}
				},
				originalLanguage: "EN",
				layer: "VENDOR",
				texts: {}
			};
			const mPropertyBag = {
				changeType: "appdescr_ui_generic_app_changePageConfiguration",
				content: {
					parentPage: {
						component: "sap.suite.ui.generic.template.ListReport",
						entitySet: "Travel"
					},
					entityPropertyChange: {
						propertyPath: "component/settings/filterSettings/dateSettings",
						operation: "UPSERT",
						propertyValue: {
							useDateRange: false
						}
					}
				},
				layer: "VENDOR"
			};

			const oAppDescriptorChange = FlexObjectFactory.createAppDescriptorChange(mPropertyBag);
			assert.ok(
				oAppDescriptorChange.isA("sap.ui.fl.apply._internal.flexObjects.AppDescriptorChange"),
				"the correct change was created"
			);
			assert.deepEqual(
				_omit(oAppDescriptorChange.convertToFileContent(), "fileName"),
				_omit(oChangeDefinition, "fileName"),
				"the convert function is correct"
			);
		});
	});

	QUnit.module("Others", {
		afterEach() {
			sandbox.restore();
		}
	}, function() {
		QUnit.test("getIdForCondensing", function(assert) {
			const oAppDescriptorChange = FlexObjectFactory.createFromFileContent(oChangeDefinition);
			assert.strictEqual(oAppDescriptorChange.getIdForCondensing(), "appDescriptor_my.reference", "the ID for condensing is correct");
		});

		QUnit.test("canBeCondensed", function(assert) {
			sandbox.stub(DescriptorChangeTypes, "getCondensableChangeTypes").returns(["appDescriptor"]);
			const oAppDescriptorChange = FlexObjectFactory.createFromFileContent(oChangeDefinition);
			assert.ok(oAppDescriptorChange.canBeCondensed(), "the change can be condensed");

			const oNotCondensable = FlexObjectFactory.createFromFileContent({...oChangeDefinition, changeType: "notCondensable"});
			assert.notOk(oNotCondensable.canBeCondensed(), "the change can't be condensed");
		});
	});

	QUnit.done(function() {
		document.getElementById("qunit-fixture").style.display = "none";
	});
});
