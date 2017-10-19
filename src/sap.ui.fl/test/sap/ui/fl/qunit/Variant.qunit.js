/*global sinon, QUnit*/
sap.ui.require([
		"sap/ui/fl/ChangePersistence",
		"sap/ui/fl/Utils",
		"sap/ui/fl/Variant",
		"sap/ui/base/EventProvider",
		"sap/ui/fl/Cache",
		"sap/ui/fl/registry/Settings"
	],
	function(ChangePersistence, Utils, Variant, EventProvider, Cache, Settings) {
	'use strict';
	sinon.config.useFakeTimers = false;
	var sandbox = sinon.sandbox.create();

	QUnit.module("Given sap.ui.fl.Variant class", {
		beforeEach: function(assert) {
			this.ushellStore = sap.ushell; // removes the lib for a pure OpenUI5 testing
			this.oControl = {};
			this.sUserId = "cookieMonster";
			var done = assert.async();
			jQuery.getJSON("./testResources/TestFakeVariantLrepResponse.json")
				.done(function(oFakeVariantResponse) {
					this.oVariant = {};
					this.oVariantDef = oFakeVariantResponse.variantSection["idMain1--variantManagementOrdersTable"].variants[0];
					this.oVariant = new Variant(this.oVariantDef);
					done();
				}.bind(this));

			sandbox.stub(Utils, "getCurrentLayer").returns("VENDOR");
		},
		afterEach: function() {
			sap.ushell = this.ushellStore;
			sandbox.restore();
		}
	});

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
		assert.strictEqual(this.oVariant.getNamespace(), "sap.ui.rta.test.Demo.md.Component", "then reference is returned as namespace");
	});

	QUnit.test("when getId is called", function(assert) {
		assert.equal(this.oVariant.getId(), this.oVariantDef.content.fileName);
	});

	QUnit.test("when getContent is called", function(assert) {
		assert.deepEqual(this.oVariant.getContent(), this.oVariantDef.content);
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

	QUnit.test("when _isReadOnlyDueToLayer is called", function(assert) {
		// check for different layer
		this.oVariantDef.content.layer = "CUSTOMER";
		assert.equal(this.oVariant._isReadOnlyDueToLayer(), true);
		// check for same layer
		this.oVariantDef.content.layer = "VENDOR";
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

	QUnit.test("when getDefinition is called", function(assert) {
		assert.ok(this.oVariant.getDefinition());
	});

	QUnit.test("when createInitialFileContent is called", function(assert) {
		var oExpectedInfo = {
			"fileName": "variant0",
			"title": "variant A",
			"fileType": "ctrl_variant",
			"reference": "sap.ui.rta.test.Demo.md.Component",
			"variantManagementReference": "idMain1--variantManagementOrdersTable",
			"variantReference": "",
			"packageName": "$TMP",
			"self": "sap.ui.rta.test.Demo.md.Componentvariant0.ctrl_variant",
			"content": {},
			"layer": "VENDOR",
			"texts": {
				"TextDemo": {
					"value": "Text for TextDemo",
					"type": "myTextType"
				}
			},
			"namespace": "sap.ui.rta.test.Demo.md.Component",
			"creation": "",
			"originalLanguage": "",
			"conditions": {},
			"support": {
				"generator": "Variant.createInitialFileContent",
				"service": "",
				"user": "",
				"sapui5Version": sap.ui.version
			},
			"validAppVersions": {}
		};

		oExpectedInfo.originalLanguage = Utils.getCurrentLanguage();

		var oVariantFileContent = Variant.createInitialFileContent(this.oVariantDef.content);

		assert.deepEqual(oVariantFileContent, oExpectedInfo, "then correct initial file content set");
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
				selector: {"id": "control1"},
				layer: "VENDOR",
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
