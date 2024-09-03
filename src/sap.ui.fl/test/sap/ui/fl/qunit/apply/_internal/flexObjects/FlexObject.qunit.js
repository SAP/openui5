/* global QUnit */

sap.ui.define([
	"sap/base/util/LoaderExtensions",
	"sap/ui/fl/apply/_internal/flexObjects/FlexObjectFactory",
	"sap/ui/fl/apply/_internal/flexObjects/States",
	"sap/ui/fl/Layer",
	"sap/ui/fl/registry/Settings",
	"sap/ui/fl/Utils",
	"sap/ui/thirdparty/sinon-4"
], function(
	LoaderExtensions,
	FlexObjectFactory,
	States,
	Layer,
	Settings,
	Utils,
	sinon
) {
	"use strict";
	const sandbox = sinon.createSandbox();

	const oFileContent = {
		fileName: "foo",
		fileType: "change",
		reference: "sap.ui.demoapps.rta.fiorielements",
		packageName: "$TMP",
		content: {
			originalControlType: "sap.m.Label"
		},
		layer: Layer.CUSTOMER,
		texts: {
			originalText: {
				value: "My original text",
				type: "XFLD"
			}
		},
		namespace: "apps/sap.ui.demoapps.rta.fiorielements/changes/",
		projectId: "sap.ui.demoapps.rta.fiorielements",
		creation: "2021-12-14T08:34:50.8705900Z",
		originalLanguage: "EN",
		support: {
			generator: "sap.ui.rta.command",
			service: "",
			user: "",
			sapui5Version: "1.100.0-SNAPSHOT",
			sourceChangeFileName: "",
			compositeCommand: "",
			command: "rename"
		},
		oDataInformation: {},
		sourceSystem: "someSystem",
		sourceClient: "someClient"
	};

	QUnit.module("Basic tests", {
		afterEach() {
			sandbox.restore();
		}
	}, function() {
		QUnit.test("constructor - when originalLanguage is missing", function(assert) {
			sandbox.stub(Utils, "getCurrentLanguage").returns("EN");
			const oFlexObject = FlexObjectFactory.createFromFileContent({
				fileType: "change"
			});
			assert.strictEqual(
				oFlexObject.getSupportInformation().originalLanguage,
				"EN",
				"then the current language is used as a fallback"
			);
		});

		QUnit.test("constructor - when reference is set and namespace is missing and the reference has the legacy .Component", function(assert) {
			const oFlexObject = FlexObjectFactory.createFromFileContent({
				fileType: "change",
				reference: "sap.ui.demoapps.rta.fiorielements.Component"
			});
			assert.strictEqual(
				oFlexObject.getFlexObjectMetadata().namespace,
				"apps/sap.ui.demoapps.rta.fiorielements/changes/",
				"then the namespace is filled"
			);
			assert.strictEqual(
				oFlexObject.getFlexObjectMetadata().reference,
				"sap.ui.demoapps.rta.fiorielements",
				"then the .Component is removed"
			);
		});

		QUnit.test("constructor - when both reference and namespace are set and the reference has the legacy .Component", function(assert) {
			const oFlexObject = FlexObjectFactory.createFromFileContent({
				fileType: "change",
				reference: "sap.ui.demoapps.rta.fiorielements.Component",
				namespace: "apps/sap.ui.demoapps.rta.fiorielements/changes/"
			});
			assert.strictEqual(
				oFlexObject.getFlexObjectMetadata().namespace,
				"apps/sap.ui.demoapps.rta.fiorielements/changes/",
				"then the namespace is not overridden"
			);
			assert.strictEqual(
				oFlexObject.getFlexObjectMetadata().reference,
				"sap.ui.demoapps.rta.fiorielements",
				"then the .Component is removed"
			);
		});

		QUnit.test("constructor - when reference is set and projectId is missing", function(assert) {
			const oFlexObject = FlexObjectFactory.createFromFileContent({
				fileType: "change",
				reference: "sap.ui.demoapps.rta.fiorielements"
			});
			assert.strictEqual(
				oFlexObject.getFlexObjectMetadata().projectId,
				"sap.ui.demoapps.rta.fiorielements",
				"then the projectId is filled"
			);
		});

		QUnit.test("constructor - when both reference and projectId are set", function(assert) {
			const oFlexObject = FlexObjectFactory.createFromFileContent({
				fileType: "change",
				reference: "sap.ui.demoapps.rta.fiorielements",
				projectId: "sap.ui.demoapps.rta.fiorielements"
			});
			assert.strictEqual(
				oFlexObject.getFlexObjectMetadata().projectId,
				"sap.ui.demoapps.rta.fiorielements",
				"then the projectId is not overridden"
			);
		});
	});

	QUnit.module("Custom getters/setters", {
		beforeEach() {
			this.oFlexObject = FlexObjectFactory.createFromFileContent(oFileContent);
		},
		afterEach() {
			sandbox.restore();
		}
	}, function() {
		QUnit.test("when setting the content", function(assert) {
			this.oFlexObject.setState(States.LifecycleState.PERSISTED);
			this.oFlexObject.setContent({
				foo: "bar"
			});
			assert.strictEqual(
				this.oFlexObject.getState(),
				States.LifecycleState.UPDATED,
				"then the flexObject is marked as DIRTY"
			);
		});

		QUnit.test("when calling getText", function(assert) {
			assert.strictEqual(
				this.oFlexObject.getText("originalText"),
				"My original text",
				"then the value is returned"
			);
		});

		QUnit.test("when calling setText", function(assert) {
			this.oFlexObject.setState(States.LifecycleState.PERSISTED);
			this.oFlexObject.setText("originalText", "My new text");
			assert.strictEqual(
				this.oFlexObject.getText("originalText"),
				"My new text",
				"then the existing value was updated"
			);
			assert.strictEqual(
				this.oFlexObject.getState(),
				States.LifecycleState.UPDATED,
				"then the flexObject is marked as DIRTY"
			);
		});

		QUnit.test("when calling setResponse", function(assert) {
			this.oFlexObject.setResponse({
				support: {
					user: "TESTUSER"
				}
			});
			assert.strictEqual(
				this.oFlexObject.getState(),
				States.LifecycleState.PERSISTED,
				"then the state changes to PERSISTED"
			);
			assert.strictEqual(
				this.oFlexObject.getSupportInformation().user,
				"TESTUSER",
				"then the flexObject is updated"
			);
		});

		QUnit.test("when calling setResponse without file content", function(assert) {
			const oOriginalFile = this.oFlexObject.convertToFileContent();
			this.oFlexObject.setResponse({});
			assert.strictEqual(
				this.oFlexObject.getState(),
				States.LifecycleState.NEW,
				"then the state is not changed"
			);
			assert.deepEqual(
				this.oFlexObject.convertToFileContent(),
				oOriginalFile,
				"then the flexObject is not updated"
			);
		});

		QUnit.test("isChangeFromOtherSystem - when settings cannot be read", function(assert) {
			sandbox.stub(Settings, "getInstanceOrUndef").returns();
			assert.ok(this.oFlexObject.isChangeFromOtherSystem(), "then isChangeFromOtherSystem returns true");
		});

		QUnit.test("isChangeFromOtherSystem - when in settings no system and client info is maintained", function(assert) {
			const oSettingsStub = sandbox.stub(Settings, "getInstanceOrUndef").returns(new Settings({}));
			assert.notOk(this.oFlexObject.isChangeFromOtherSystem(), "then isChangeFromOtherSystem returns false");
			oSettingsStub.returns(new Settings({client: "someClient"}));
			assert.notOk(this.oFlexObject.isChangeFromOtherSystem(), "then isChangeFromOtherSystem returns false");
			oSettingsStub.returns(new Settings({system: "someSystem"}));
			assert.notOk(this.oFlexObject.isChangeFromOtherSystem(), "then isChangeFromOtherSystem returns false");
		});

		QUnit.test("isChangeFromOtherSystem shall return false when change has no source system/client info", function(assert) {
			sandbox.stub(Settings, "getInstanceOrUndef").returns(new Settings({system: "someSystem", client: "someClient"}));
			this.oFlexObject.update({
				sourceSystem: undefined,
				sourceClient: undefined
			});
			assert.notOk(this.oFlexObject.isChangeFromOtherSystem(), "then isChangeFromOtherSystem returns false");
		});

		QUnit.test("isChangeFromOtherSystem shall return true when there is a mismatch between system/client info in the settings and the source system/client of the change", function(assert) {
			sandbox.stub(Settings, "getInstanceOrUndef").returns(new Settings({system: "someSystem", client: "someClient"}));
			// mismatch between system in settings and source system of change
			this.oFlexObject.update({
				sourceSystem: "XXX",
				sourceClient: "100"
			});
			assert.ok(this.oFlexObject.isChangeFromOtherSystem(), "then isChangeFromOtherSystem returns true");
		});

		QUnit.test("isChangeFromOtherSystem shall return false when system/client info in the settings and the source system/client of the change match", function(assert) {
			sandbox.stub(Settings, "getInstanceOrUndef").returns(new Settings({system: "someSystem", client: "someClient"}));
			assert.notOk(this.oFlexObject.isChangeFromOtherSystem(), "then isChangeFromOtherSystem returns false");
		});

		QUnit.test("when calling isUserDependent while the layer is NOT USER", function(assert) {
			assert.notOk(this.oFlexObject.isUserDependent(), "then isUserDependent retuns false");
		});

		QUnit.test("when calling isUserDependent while the layer is USER", function(assert) {
			this.oFlexObject.update({
				layer: Layer.USER
			});
			assert.ok(this.oFlexObject.isUserDependent(), "then isUserDependent retuns true");
		});

		QUnit.test("when calling getNamespace function", function(assert) {
			assert.strictEqual(this.oFlexObject.getNamespace(), oFileContent.namespace, "then namespace is returned");
		});
	});

	QUnit.module("State handling", {
		beforeEach() {
			this.oFlexObject = FlexObjectFactory.createFromFileContent(oFileContent);
		},
		afterEach() {
			sandbox.restore();
		}
	}, function() {
		QUnit.test("FlexObject.getState", function(assert) {
			assert.strictEqual(
				this.oFlexObject.getState(),
				States.LifecycleState.NEW,
				"then initially the state is NEW"
			);
			this.oFlexObject.setState(States.LifecycleState.PERSISTED);
			assert.strictEqual(
				this.oFlexObject.getState(),
				States.LifecycleState.PERSISTED,
				"then the state can be changed to PERSISTED"
			);
			assert.ok(
				this.oFlexObject.isPersisted(),
				"then the state can be changed to PERSISTED"
			);
			this.oFlexObject.setContent({});
			assert.strictEqual(
				this.oFlexObject.getState(),
				States.LifecycleState.UPDATED,
				"then the state changes to DIRTY when content is set"
			);
			this.oFlexObject.markForDeletion();
			assert.strictEqual(
				this.oFlexObject.getState(),
				States.LifecycleState.DELETED,
				"then the state changes to DELETED when calling markForDeletion"
			);
		});

		QUnit.test("FlexObject.setState with an incorrect value", function(assert) {
			this.oFlexObject.setState("anInvalidState");
			assert.strictEqual(
				this.oFlexObject.getState(),
				States.LifecycleState.NEW,
				"then the state is not updated"
			);
		});

		QUnit.test("FlexObject.setState to DIRTY when current state is NEW", function(assert) {
			this.oFlexObject.setState(States.LifecycleState.UPDATED);
			assert.strictEqual(
				this.oFlexObject.getState(),
				States.LifecycleState.NEW,
				"then the state is not updated"
			);
		});

		QUnit.test("FlexObject.setState to DIRTY when current state is PERSISTED", function(assert) {
			this.oFlexObject.setState(States.LifecycleState.PERSISTED);
			this.oFlexObject.setState(States.LifecycleState.UPDATED);
			assert.strictEqual(
				this.oFlexObject.getState(),
				States.LifecycleState.UPDATED,
				"then the state is changed"
			);
		});

		QUnit.test("FlexObject.restorePreviousState after change from DIRTY to PERSISTED", function(assert) {
			this.oFlexObject.setState(States.LifecycleState.PERSISTED);
			this.oFlexObject.restorePreviousState();
			assert.strictEqual(
				this.oFlexObject.getState(),
				States.LifecycleState.NEW,
				"then the state is changed back to dirty"
			);
		});

		QUnit.test("FlexObject.restorePreviousState after setting the state twice", function(assert) {
			this.oFlexObject.setState(States.LifecycleState.PERSISTED);
			this.oFlexObject.setState(States.LifecycleState.PERSISTED);
			this.oFlexObject.restorePreviousState();
			assert.strictEqual(
				this.oFlexObject.getState(),
				States.LifecycleState.NEW,
				"then the state is changed back to the previous distinct state"
			);
		});

		QUnit.test("FlexObject.restorePreviousState twice", function(assert) {
			this.oFlexObject.setState(States.LifecycleState.PERSISTED);
			this.oFlexObject.setState(States.LifecycleState.UPDATED);
			this.oFlexObject.restorePreviousState();
			this.oFlexObject.restorePreviousState();
			assert.strictEqual(
				this.oFlexObject.getState(),
				States.LifecycleState.PERSISTED,
				"then the restore still only goes back to the previous state"
			);
		});

		QUnit.test("FlexObject.markForDeletion", function(assert) {
			this.oFlexObject.markForDeletion();
			assert.strictEqual(
				this.oFlexObject.getState(),
				States.LifecycleState.DELETED,
				"then the state is changed to DELETED"
			);
		});
	});

	QUnit.module("Updates and export", {
		beforeEach() {
			this.oFlexObject = FlexObjectFactory.createFromFileContent(oFileContent);
		},
		afterEach() {
			sandbox.restore();
		}
	}, function() {
		QUnit.test("when a FlexObject is updated", function(assert) {
			const oInitialSupportInfo = this.oFlexObject.getSupportInformation();
			const oUpdate = {
				layer: Layer.VENDOR,
				content: {
					test: "someUpdate",
					foo: {
						bar: 1
					}
				},
				packageName: "someOtherPackage",
				support: {
					user: "USERNAME"
				}
			};
			this.oFlexObject.update(oUpdate);
			assert.deepEqual(
				this.oFlexObject.getSupportInformation(),
				{ ...oInitialSupportInfo, ...oUpdate.support },
				"then the updated properties are modified"
			);

			assert.notStrictEqual(
				oUpdate.content,
				this.oFlexObject.getContent(),
				"then the original file is not cloned"
			);
		});

		QUnit.test("when a very deep FlexObject is updated", function(assert) {
			return LoaderExtensions.loadResource({
				dataType: "json",
				url: sap.ui.require.toUrl("test-resources/sap/ui/fl/qunit/testResources/DeepFlexObject.json"),
				async: true
			}).then(function(oDeepObject) {
				this.oFlexObject = FlexObjectFactory.createFromFileContent(oDeepObject);
				oDeepObject.packageName = "test";
				this.oFlexObject.update(oDeepObject);
				assert.strictEqual(
					this.oFlexObject.getFlexObjectMetadata().packageName,
					"test",
					"then the object was updated properly"
				);
			}.bind(this));
		});

		QUnit.test("when trying to update the fileName/id", function(assert) {
			this.oFlexObject.update({
				fileName: "someNewId"
			});
			assert.strictEqual(
				this.oFlexObject.getId(),
				"foo",
				"then the property is not updated"
			);
		});

		QUnit.test("when exporting file content of a FlexObject", function(assert) {
			// fileName is assigned to the id upon creation
			const oExpectedFileContent = { ...oFileContent };
			oExpectedFileContent.selector = {};
			oExpectedFileContent.dependentSelector = {};
			assert.deepEqual(
				this.oFlexObject.convertToFileContent(),
				oExpectedFileContent,
				"then the output should have the same information as the original file content"
			);
		});

		QUnit.test("when cloning file content", function(assert) {
			const oExpectedFileContent = { ...oFileContent };
			oExpectedFileContent.selector = {};
			oExpectedFileContent.dependentSelector = {};
			const oCopiedFlexObject = this.oFlexObject.cloneFileContentWithNewId();
			assert.notStrictEqual(
				oCopiedFlexObject,
				oExpectedFileContent,
				"then the two flex objects are not equal"
			);
			assert.notStrictEqual(oCopiedFlexObject.fileName, oFileContent.fileName, "then the cloned flex object has another id as the original flex object");
		});
	});

	QUnit.done(function() {
		document.getElementById("qunit-fixture").style.display = "none";
	});
});