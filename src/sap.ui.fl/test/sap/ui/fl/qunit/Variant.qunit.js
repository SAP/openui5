/*global QUnit*/

sap.ui.define([
	"sap/ui/fl/Layer",
	"sap/ui/fl/Utils",
	"sap/ui/fl/LayerUtils",
	"sap/ui/fl/Variant",
	"sap/ui/fl/registry/Settings",
	"sap/ui/base/EventProvider",
	"sap/ui/thirdparty/jquery",
	"sap/ui/thirdparty/sinon-4"
], function(
	Layer,
	Utils,
	LayerUtils,
	Variant,
	Settings,
	EventProvider,
	jQuery,
	sinon
) {
	"use strict";
	var sandbox = sinon.sandbox.create();

	QUnit.module("Given sap.ui.fl.Variant class", {
		beforeEach: function(assert) {
			this.oControl = {};
			this.sUserId = "cookieMonster";
			var done = assert.async();
			jQuery.getJSON("test-resources/sap/ui/fl/qunit/testResources/TestFakeVariantLrepResponse.json")
				.done(function(oFakeVariantResponse) {
					this.oVariant = {};
					this.oVariantDef = oFakeVariantResponse.variantSection["idMain1--variantManagementOrdersTable"].variants[0];
					this.oVariantFileContent = Variant.createInitialFileContent(this.oVariantDef);
					this.oVariant = new Variant(this.oVariantFileContent);
					done();
				}.bind(this));
		},
		afterEach: function() {
			sandbox.restore();
		}
	}, function() {
		QUnit.test("when new Variant is initialized", function(assert) {
			assert.ok(this.oVariant instanceof Variant, "then variant object returned");
		});

		QUnit.test("when Variant is returned", function(assert) {
			assert.ok(this.oVariant instanceof EventProvider, "then variant is inherited from event provider");
		});

		QUnit.test("when isVariant is called", function(assert) {
			assert.equal(this.oVariant.isVariant(), true);
		});

		QUnit.test("when getTitle is called", function(assert) {
			assert.equal(this.oVariant.getTitle(), "variant A");
		});

		QUnit.test("when getFileType is called", function(assert) {
			assert.equal(this.oVariant.getFileType(), "ctrl_variant");
		});

		QUnit.test("when getPackage is called", function(assert) {
			assert.equal(this.oVariant.getPackage(), "$TMP");
		});

		QUnit.test("when getNamespace is called", function(assert) {
			assert.equal(this.oVariant.getNamespace(), "sap.ui.rta.test.Demo.md.Component", "then reference is returned as namespace");
		});

		QUnit.test("when setNamespace is called", function(assert) {
			assert.equal(this.oVariant.getNamespace(), "sap.ui.rta.test.Demo.md.Component");
			this.oVariant.setNamespace("apps/ReferenceAppId/variants/");
			assert.equal(this.oVariant.getNamespace(), "apps/ReferenceAppId/variants/", "the namespace has been changed");
		});

		QUnit.test("when getControlChanges is called", function(assert) {
			assert.strictEqual(this.oVariant.getControlChanges(), this.oVariantDef.controlChanges, "then the control changes are returned");
		});

		QUnit.test("when getId is called", function(assert) {
			assert.equal(this.oVariant.getId(), this.oVariantDef.content.fileName);
		});

		QUnit.test("when getDefinition is called", function(assert) {
			this.oVariantDef.content.self = this.oVariantDef.content.namespace + this.oVariantDef.content.fileName + "." + "ctrl_variant";
			this.oVariantDef.content.support.sapui5Version = sap.ui.version;
			this.oVariantDef.content.validAppVersions = {};
			assert.deepEqual(this.oVariant.getDefinition(), this.oVariantDef.content);
		});

		QUnit.test("when getDefinitionWithChanges is called", function(assert) {
			this.oVariantDef.content.self = this.oVariantDef.content.namespace + this.oVariantDef.content.fileName + "." + "ctrl_variant";
			this.oVariantDef.content.support.sapui5Version = sap.ui.version;
			this.oVariantDef.content.validAppVersions = {};
			this.oVariantDef.variantChanges = {};
			assert.deepEqual(this.oVariant.getDefinitionWithChanges(), this.oVariantDef);
		});

		QUnit.test("when setState is called with an incorrect value", function(assert) {
			assert.equal(this.oVariant.getPendingAction(), "NEW");
			this.oVariant.setState("anInvalidState");
			assert.equal(this.oVariant.getPendingAction(), "NEW");
		});

		QUnit.test("when setState is called with state DIRTY, with current state NEW", function(assert) {
			assert.equal(this.oVariant.getPendingAction(), "NEW");
			this.oVariant.setState(Variant.states.DIRTY);
			assert.equal(this.oVariant.getPendingAction(), "NEW");
		});

		QUnit.test("when setState is called with state DIRTY, with current state PERSISTED", function(assert) {
			assert.equal(this.oVariant.getPendingAction(), "NEW");
			this.oVariant.setState(Variant.states.PERSISTED);
			this.oVariant.setState(Variant.states.DIRTY);
			assert.equal(this.oVariant.getPendingAction(), "UPDATE");
		});

		QUnit.test("when setContent is called", function(assert) {
			assert.equal(this.oVariant.getPendingAction(), "NEW");
			this.oVariant.setContent({something: "dummy"});
			assert.deepEqual(this.oVariant.getContent(), {something: "dummy"});
			assert.equal(this.oVariant.getPendingAction(), "NEW");
			this.oVariant.setState(Variant.states.PERSISTED);
			this.oVariant.setContent({something: "updated"});
			assert.deepEqual(this.oVariant.getContent(), {something: "updated"});
			assert.equal(this.oVariant.getPendingAction(), "UPDATE");
		});

		QUnit.test("when getText is called", function(assert) {
			assert.equal(this.oVariant.getText('TextDemo'), this.oVariantDef.content.texts['TextDemo'].value);
		});

		QUnit.test("when setText is called", function(assert) {
			this.oVariant.setText('TextDemo', 'newText');
			assert.equal(this.oVariant.getText('TextDemo'), 'newText');
			assert.equal(this.oVariant.getPendingAction(), "NEW");
			this.oVariant.setState(Variant.states.PERSISTED);
			this.oVariant.setText('TextDemo', 'newText2');
			assert.equal(this.oVariant.getState(), Variant.states.DIRTY);
		});

		QUnit.test("when _isReadOnlyDueToLayer is called for different layer", function(assert) {
			sandbox.stub(LayerUtils, "getCurrentLayer").returns(Layer.CUSTOMER);
			assert.equal(this.oVariant._isReadOnlyDueToLayer(), true);
		});

		QUnit.test("when _isReadOnlyDueToLayer is called for same layer", function(assert) {
			sandbox.stub(LayerUtils, "getCurrentLayer").returns(Layer.VENDOR);
			this.oVariant = new Variant(this.oVariantDef);
			assert.equal(this.oVariant._isReadOnlyDueToLayer(), false);
		});

		QUnit.test("when markForDeletion is called", function(assert) {
			this.oVariant.markForDeletion();
			assert.equal(this.oVariant.getPendingAction(), "DELETE");
		});

		QUnit.test("when set/get-Request is called", function(assert) {
			this.oVariant.setRequest('test');

			assert.equal(this.oVariant.getRequest(), 'test');
		});

		QUnit.test("when getLayer is called", function(assert) {
			assert.equal(this.oVariant.getLayer(), this.oVariantDef.content.layer);
		});

		QUnit.test("when getComponent is called", function(assert) {
			var sComponent = this.oVariant.getComponent();
			assert.equal(sComponent, this.oVariantDef.content.reference);
		});

		QUnit.test("when setComponent is called", function(assert) {
			assert.equal(this.oVariant.getComponent(), "sap.ui.rta.test.Demo.md.Component");
			this.oVariant.setComponent("AppVariantId");
			assert.equal(this.oVariant.getComponent(), "AppVariantId", "the component has been changed");
		});

		QUnit.test("when isUserDependent is called", function(assert) {
			assert.ok(!this.oVariant.isUserDependent());
		});

		QUnit.test("when getPendingChanges is called", function(assert) {
			assert.equal(this.oVariant.getPendingAction(), Variant.states.NEW);
			this.oVariant.setState(Variant.states.PERSISTED);

			this.oVariant.setContent({});
			assert.equal(this.oVariant.getPendingAction(), Variant.states.DIRTY);

			this.oVariant.markForDeletion();
			assert.equal(this.oVariant.getPendingAction(), Variant.states.DELETED);
		});

		QUnit.test("when getContent is called", function(assert) {
			assert.deepEqual(this.oVariant.getContent(), {title: "variant A"}, "then correct content returned");
		});

		QUnit.test("when createInitialFileContent is called", function(assert) {
			var oExpectedInfo = {
				content: {
					fileName: "variant0",
					fileType: "ctrl_variant",
					reference: "sap.ui.rta.test.Demo.md.Component",
					variantManagementReference: "idMain1--variantManagementOrdersTable",
					variantReference: "",
					packageName: "$TMP",
					self: "sap.ui.rta.test.Demo.md.Componentvariant0.ctrl_variant",
					content: {
						title: "variant A"
					},
					layer: Layer.VENDOR,
					texts: {
						TextDemo: {
							value: "Text for TextDemo",
							type: "myTextType"
						}
					},
					namespace: "sap.ui.rta.test.Demo.md.Component",
					creation: "",
					originalLanguage: Utils.getCurrentLanguage(),
					conditions: {},
					support: {
						generator: "Change.createInitialFileContent",
						service: "",
						user: "",
						sapui5Version: sap.ui.version
					},
					validAppVersions: {}
				},
				controlChanges: [],
				variantChanges: {}
			};

			var oVariantSpecificData = {
				content: this.oVariantDef.content
			};
			oVariantSpecificData.isVariant = true;
			var oVariantFileContent = Variant.createInitialFileContent(oVariantSpecificData);

			assert.deepEqual(oVariantFileContent, oExpectedInfo, "then correct initial file content set");
		});

		QUnit.test("when createInitialFileContent is called with generator", function(assert) {
			var sGenerator = "RTA";
			var oExpectedInfo = {
				content: {
					fileName: "variant0",
					fileType: "ctrl_variant",
					reference: "sap.ui.rta.test.Demo.md.Component",
					variantManagementReference: "idMain1--variantManagementOrdersTable",
					variantReference: "",
					packageName: "$TMP",
					self: "sap.ui.rta.test.Demo.md.Componentvariant0.ctrl_variant",
					content: {
						title: "variant A"
					},
					layer: Layer.VENDOR,
					texts: {
						TextDemo: {
							value: "Text for TextDemo",
							type: "myTextType"
						}
					},
					namespace: "sap.ui.rta.test.Demo.md.Component",
					creation: "",
					originalLanguage: Utils.getCurrentLanguage(),
					conditions: {},
					support: {
						generator: sGenerator,
						service: "",
						user: "",
						sapui5Version: sap.ui.version
					},
					validAppVersions: {}
				},
				controlChanges: [],
				variantChanges: {}
			};

			var oVariantSpecificData = {
				content: this.oVariantDef.content
			};
			oVariantSpecificData.isVariant = true;
			oVariantSpecificData.generator = sGenerator;
			var oVariantFileContent = Variant.createInitialFileContent(oVariantSpecificData);

			assert.deepEqual(oVariantFileContent, oExpectedInfo, "then correct initial file content set with generator");
		});

		QUnit.test("when _isReadOnlyDueToOriginalLanguage ", function(assert) {
			sandbox.stub(Utils, "getCurrentLanguage").returns("EN");
			var bIsReadOnly = this.oVariant._isReadOnlyDueToOriginalLanguage();
			assert.strictEqual(bIsReadOnly, false, "then original language compared with the current language");
		});

		QUnit.test("when setResponse is called", function(assert) {
			var sampleResponse = {
				content: {
					fileName: "0815_1",
					fileType: "ctrl_variant",
					component: "smartFilterBar",
					content: {something: "createNewVariant"},
					selector: {id: "control1"},
					layer: Layer.VENDOR,
					texts: {
						variantName: {
							value: "myVariantName",
							type: "myTextType"
						}
					},
					namespace: "localchange1/",
					creation: "2014-10-30T13:52:40.4754350Z",
					originalLanguage: "DE",
					conditions: {},
					support: {
						generator: "Dallas beta 1",
						user: this.sUserId
					}
				}
			};

			assert.ok(!this.oVariant._oDefinition.content.creation);
			assert.equal(this.oVariant.getState(), Variant.states.NEW);

			this.oVariant.setResponse(sampleResponse);

			assert.deepEqual(this.oVariant._oDefinition.content, sampleResponse.content, "then response set correctly");
			assert.equal(this.oVariant.getState(), Variant.states.PERSISTED);
		});

		QUnit.test("when _isReadOnlyDueToOriginalLanguage is called when original language is not set", function(assert) {
			this.oVariantDef.content.originalLanguage = "";

			var bIsReadOnly = this.oVariant._isReadOnlyDueToOriginalLanguage();

			assert.strictEqual(bIsReadOnly, false, "then not read only returned");
		});

		QUnit.test("when isReadOnly is called", function(assert) {
			//false false
			this.oVariant._isReadOnlyDueToLayer = sinon.stub().returns(false);
			this.oVariant._isReadOnlyWhenNotKeyUser = sinon.stub().returns(false);
			assert.strictEqual(this.oVariant.isReadOnly(), false);

			//true false
			this.oVariant._isReadOnlyDueToLayer = sinon.stub().returns(true);
			this.oVariant._isReadOnlyWhenNotKeyUser = sinon.stub().returns(false);
			assert.strictEqual(this.oVariant.isReadOnly(), true);

			//false true
			this.oVariant._isReadOnlyDueToLayer = sinon.stub().returns(false);
			this.oVariant._isReadOnlyWhenNotKeyUser = sinon.stub().returns(true);
			assert.strictEqual(this.oVariant.isReadOnly(), true);

			//true true
			this.oVariant._isReadOnlyDueToLayer = sinon.stub().returns(true);
			this.oVariant._isReadOnlyWhenNotKeyUser = sinon.stub().returns(true);
			assert.strictEqual(this.oVariant.isReadOnly(), true);
		});

		QUnit.test("when _isReadOnlyWhenNotKeyUser is called", function(assert) {
			var oGetInstanceOrUndefStub = sandbox.stub(Settings, "getInstanceOrUndef");
			oGetInstanceOrUndefStub.returns(new Settings({isKeyUser: false}));
			assert.strictEqual(this.oVariant._isReadOnlyWhenNotKeyUser(), true, "then true is returned when not a key user");

			oGetInstanceOrUndefStub.returns(new Settings({isKeyUser: true}));
			assert.strictEqual(this.oVariant._isReadOnlyWhenNotKeyUser(), false, "then false is returned when a key user");
		});

		QUnit.test("when _isReadOnlyWhenNotKeyUser for user dependent cases", function(assert) {
			var oIsUserDependentStub = sandbox.stub(this.oVariant, 'isUserDependent').returns(false);

			var oGetInstanceOrUndefStub = sandbox.stub(Settings, "getInstanceOrUndef");

			oIsUserDependentStub.returns(true);
			oGetInstanceOrUndefStub.returns(new Settings({isKeyUser: true}));
			assert.strictEqual(this.oVariant._isReadOnlyWhenNotKeyUser(), false, "then false returned when key user and user dependent");

			oIsUserDependentStub.returns(false);
			oGetInstanceOrUndefStub.returns(new Settings({isKeyUser: false}));
			assert.strictEqual(this.oVariant._isReadOnlyWhenNotKeyUser(), true, "then true returned when not key user and user is not determined");
		});
	});

	QUnit.done(function() {
		jQuery("#qunit-fixture").hide();
	});
});