/*globals QUnit, sinon*/
jQuery.sap.require("sap.ui.fl.Change");
jQuery.sap.require("sap.ui.fl.Utils");
jQuery.sap.require("sap.ui.base.EventProvider");
jQuery.sap.require("sap.ui.fl.registry.Settings");

(function(Change, Utils, EventProvider, Settings) {
	'use strict';

	var sandbox = sinon.sandbox.create();

	QUnit.module("sap.ui.fl.Change", {
		beforeEach: function() {
			this.oControl = {};
			this.oChangeDef = {
				fileName: "0815_1",
				namespace: "apps/smartFilterBar/changes/",
				packageName: "$TMP",
				fileType: "variant",
				layer: "VENDOR",
				changeType: "filterVariant",
				reference: "smartFilterBar",
				componentName: "smartFilterBar",
				selector: {"persistenceKey": "control1"},
				conditions: {},
				context: [],
				content: {something: "createNewVariant"},
				texts: {
					variantName: {
						value: "myVariantName",
						type: "myTextType"
					}
				},
				originalLanguage: "DE",
				support: {
					generator: "Dallas beta 1",
					user: "cookie monster"
				}
			};

			sandbox.stub(Utils, "getCurrentLayer").returns("VENDOR");
		},
		afterEach: function() {
			sandbox.restore();
		}
	});

	QUnit.test("constructor ", function(assert) {
		var oInstance = new sap.ui.fl.Change(this.oChangeDef);
		assert.ok(oInstance);
	});

	QUnit.test("Shall inherit from EventProvider", function(assert) {
		var oInstance = new Change(this.oChangeDef);
		assert.ok(oInstance instanceof EventProvider, "Shall inherit from event provider");
	});

	QUnit.test("Change.isVariant", function(assert) {
		var oInstance = new Change(this.oChangeDef);
		assert.equal(oInstance.isVariant(), true);
	});

	QUnit.test("Change.getChangeType", function(assert) {
		var oInstance = new Change(this.oChangeDef);
		assert.equal(oInstance.getChangeType(), "filterVariant");
	});

	QUnit.test("Change.getPackage", function(assert) {
		var oInstance = new Change(this.oChangeDef);
		assert.equal(oInstance.getPackage(), "$TMP");
	});

	QUnit.test("getNamespace should return the namespace of the defintion", function(assert) {
		var oInstance = new Change(this.oChangeDef);
		assert.strictEqual(oInstance.getNamespace(), "apps/smartFilterBar/changes/");
	});

	QUnit.test("Change.getId", function(assert) {
		var oInstance = new Change(this.oChangeDef);
		assert.equal(oInstance.getId(), "0815_1");
	});

	QUnit.test("Change.getContent", function(assert) {
		var oInstance = new Change(this.oChangeDef);
		assert.ok(oInstance.getContent());
	});

	QUnit.test("Change.setContent", function(assert) {
		var oInstance = new Change(this.oChangeDef);
		assert.equal(oInstance.getPendingAction(), "NEW");
		oInstance.setContent({something: "nix"});
		deepEqual(oInstance.getContent(), {something: "nix"});
	});

	QUnit.test("Change.getContext", function(assert) {
		var oInstance = new Change(this.oChangeDef);
		assert.ok(oInstance.getContext());
	});

	QUnit.test("Change.getText", function(assert) {
		var oInstance = new Change(this.oChangeDef);
		assert.equal(oInstance.getText('variantName'), 'myVariantName');
	});

	QUnit.test("Change.setText", function(assert) {
		var oInstance = new Change(this.oChangeDef);
		oInstance.setText('variantName', 'newText');
		assert.equal(oInstance.getText('variantName'), 'newText');
		oInstance.setText('variantName', 'myVariantName');
	});

	QUnit.test("Change._isReadOnlyDueToLayer", function(assert) {
		// check for different layer
		this.oChangeDef.layer = "CUSTOMER";
		var oInstance = new Change(this.oChangeDef);
		assert.equal(oInstance._isReadOnlyDueToLayer(), true);
		// check for same layer
		this.oChangeDef.layer = "VENDOR";
		oInstance = new Change(this.oChangeDef);
		assert.equal(oInstance._isReadOnlyDueToLayer(), false);
	});

	QUnit.test("Change.markForDeletion", function(assert) {
		var oInstance = new Change(this.oChangeDef);
		oInstance.markForDeletion();
		assert.equal(oInstance.getPendingAction(), "DELETE");
	});

	QUnit.test("Change._isDirty", function(assert) {
		var oInstance = new Change(this.oChangeDef);
		assert.equal(oInstance._isDirty(), false);
		oInstance.setText('addText', 'changed');
		var oContent = oInstance.getContent();
		oContent.fields = {first: "addedField"};

		assert.equal(oInstance._isDirty(), true);
	});

	QUnit.test("Change.set/get-Request", function(assert) {
		var oInstance = new Change(this.oChangeDef);
		oInstance.setRequest('test');

		assert.equal(oInstance.getRequest(), 'test');
	});

	QUnit.test("Change.getLayer", function(assert) {
		var oInstance = new Change(this.oChangeDef);
		assert.equal(oInstance.getLayer(), "VENDOR");
	});

	QUnit.test("Change.getComponent", function(assert) {
		var oChange, sComponent;
		oChange = new Change(this.oChangeDef);
		sComponent = oChange.getComponent();
		assert.equal(sComponent, "smartFilterBar");
	});

	QUnit.test("Change.isUserDependent", function(assert) {
		var oInstance = new Change(this.oChangeDef);
		assert.ok(!oInstance.isUserDependent());
	});

	QUnit.test("Change.getPendingChanges", function(assert) {
		var oInstance = new Change(this.oChangeDef);
		assert.equal(oInstance.getPendingAction(), "NEW");

		oInstance.setContent({});
		assert.equal(oInstance.getPendingAction(), "NEW");

		oInstance.markForDeletion();
		assert.equal(oInstance.getPendingAction(), "DELETE");
	});

	QUnit.test("Change.getDefinition", function(assert) {
		var oInstance = new Change(this.oChangeDef);
		assert.ok(oInstance.getDefinition());
	});

	QUnit.test("createInitialFileContent", function(assert) {
		var oInfo = {
			service: "someService",
			reference: "smartFilterBar",
			componentName: "smartFilterBar",
			changeType: "filterVariant",
			texts: {
				variantName: {
					type: "myTextType",
					value: "myVariantName"
				}
			},
			content: {something: "createNewVariant"},
			isVariant: true,
			packageName: "/UIF/LREP",
			selector: {"persistenceKey": "control1"},
			id: "0815_1"
		};

		var oCreatedFile = Change.createInitialFileContent(oInfo);

		assert.equal(oCreatedFile.reference, "smartFilterBar");
		assert.equal(oCreatedFile.fileName, "0815_1");
		assert.equal(oCreatedFile.changeType, "filterVariant");
		assert.equal(oCreatedFile.fileType, "variant");
		assert.equal(oCreatedFile.namespace, "apps/smartFilterBar/changes/");
		assert.equal(oCreatedFile.packageName, "/UIF/LREP");
		assert.deepEqual(oCreatedFile.content, {something: "createNewVariant"});
		assert.deepEqual(oCreatedFile.texts, {variantName: {value: "myVariantName", type: "myTextType"}});
		assert.deepEqual(oCreatedFile.selector, {"persistenceKey": "control1"});
	});

	QUnit.test("_isReadOnlyDueToOriginalLanguage shall compare the original language with the current language", function(assert) {
		var oChange, bIsReadOnly;
		oChange = new Change(this.oChangeDef);
		sandbox.stub(Utils, "getCurrentLanguage").returns("DE");

		//Call CUT
		bIsReadOnly = oChange._isReadOnlyDueToOriginalLanguage();

		assert.strictEqual(bIsReadOnly, false);
	});

	QUnit.test("setResponse shall set an object to the Change instance", function(assert) {
		//Arrange
		var sampleResponse = {
			fileName: "0815_1",
			fileType: "variant",
			changeType: "filterVariant",
			component: "smartFilterBar",
			content: {something: "createNewVariant"},
			selector: {"persistenceKey": "control1"},
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
				user: "cookie monster"
			}
		};

		var oChange = new Change(this.oChangeDef);
		assert.ok(!oChange._oDefinition.creation);
		assert.equal(oChange._isDirty(), false);

		//Act
		oChange.setResponse(sampleResponse);

		//Assert
		assert.ok(oChange._oDefinition.creation, "2014-10-30T13:52:40.4754350Z");
		assert.equal(oChange._isDirty(), false);
	});

	QUnit.test("_isReadOnlyDueToOriginalLanguage shall be true if the original language is initial", function(assert) {
		var oChange, bIsReadOnly;
		this.oChangeDef.originalLanguage = "";
		oChange = new Change(this.oChangeDef);
		//Call CUT
		bIsReadOnly = oChange._isReadOnlyDueToOriginalLanguage();

		assert.strictEqual(bIsReadOnly, false);
	});

	QUnit.test("Change.isLabelReadOnly", function(assert) {
		var oChange;
		oChange = new Change(this.oChangeDef);

		oChange._isReadOnlyWhenNotKeyUser = sinon.stub().returns(false);

		//false false
		oChange._isReadOnlyDueToLayer = sinon.stub().returns(false);
		oChange._isReadOnlyDueToOriginalLanguage = sinon.stub().returns(false);
		assert.strictEqual(oChange.isReadOnly(), false);
		assert.strictEqual(oChange.isLabelReadOnly(), false);

		//true false
		oChange._isReadOnlyDueToLayer = sinon.stub().returns(true);
		oChange._isReadOnlyDueToOriginalLanguage = sinon.stub().returns(false);
		assert.strictEqual(oChange.isReadOnly(), true);
		assert.strictEqual(oChange.isLabelReadOnly(), true);

		//false true
		oChange._isReadOnlyDueToLayer = sinon.stub().returns(false);
		oChange._isReadOnlyDueToOriginalLanguage = sinon.stub().returns(true);
		assert.strictEqual(oChange.isReadOnly(), false);
		assert.strictEqual(oChange.isLabelReadOnly(), true);

		//true true
		oChange._isReadOnlyDueToLayer = sinon.stub().returns(true);
		oChange._isReadOnlyDueToOriginalLanguage = sinon.stub().returns(true);
		assert.strictEqual(oChange.isReadOnly(), true);
		assert.strictEqual(oChange.isLabelReadOnly(), true);

	});

	QUnit.test("Change.isReadOnly", function(assert) {
		var oChange;
		oChange = new Change(this.oChangeDef);

		//false false
		oChange._isReadOnlyDueToLayer = sinon.stub().returns(false);
		oChange._isReadOnlyWhenNotKeyUser = sinon.stub().returns(false);
		assert.strictEqual(oChange.isReadOnly(), false);

		//true false
		oChange._isReadOnlyDueToLayer = sinon.stub().returns(true);
		oChange._isReadOnlyWhenNotKeyUser = sinon.stub().returns(false);
		assert.strictEqual(oChange.isReadOnly(), true);

		//false true
		oChange._isReadOnlyDueToLayer = sinon.stub().returns(false);
		oChange._isReadOnlyWhenNotKeyUser = sinon.stub().returns(true);
		assert.strictEqual(oChange.isReadOnly(), true);

		//true true
		oChange._isReadOnlyDueToLayer = sinon.stub().returns(true);
		oChange._isReadOnlyWhenNotKeyUser = sinon.stub().returns(true);
		assert.strictEqual(oChange.isReadOnly(), true);
	});

	QUnit.test("_isReadOnlyWhenNotKeyUser shall return true, if not key user", function(assert) {
		var oChange = new Change(this.oChangeDef); //shared change

		sandbox.stub(Settings, "getInstanceOrUndef").returns(new Settings({isKeyUser: false}));
		assert.strictEqual(oChange._isReadOnlyWhenNotKeyUser(), true);
	});

	QUnit.test("_isReadOnlyWhenNotKeyUser shall return false, if key user", function(assert) {
		var oChange = new Change(this.oChangeDef); //shared change

		sandbox.stub(Settings, "getInstanceOrUndef").returns(new Settings({isKeyUser: true}));
		assert.strictEqual(oChange._isReadOnlyWhenNotKeyUser(), false);
	});

	QUnit.test("_isReadOnlyWhenNotKeyUser shall return false, if not key user but user dependant", function(assert) {
		var oChange = new Change(this.oChangeDef); //shared change

		//make change user dependent. In this case the method should never return true
		sandbox.stub(oChange, 'isUserDependent').returns(true);

		sandbox.stub(Settings, "getInstanceOrUndef").returns(new Settings({isKeyUser: false}));
		assert.strictEqual(oChange._isReadOnlyWhenNotKeyUser(), false);
	});

	QUnit.test("_isReadOnlyWhenNotKeyUser shall return false, if key user and user dependant", function(assert) {
		var oChange = new Change(this.oChangeDef); //shared change

		//make change user dependent. In this case the method should never return true
		sandbox.stub(oChange, 'isUserDependent').returns(true);

		sandbox.stub(Settings, "getInstanceOrUndef").returns(new Settings({isKeyUser: true}));
		assert.strictEqual(oChange._isReadOnlyWhenNotKeyUser(), false);
	});

}(sap.ui.fl.Change, sap.ui.fl.Utils, sap.ui.base.EventProvider, sap.ui.fl.registry.Settings));
