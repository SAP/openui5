/* global QUnit */

sap.ui.define([
	"sap/ui/fl/write/internal/ChangesController",
	"sap/ui/fl/write/api/PersistenceWriteAPI",
	"sap/ui/fl/descriptorRelated/api/DescriptorInlineChangeFactory",
	"sap/ui/core/util/reflection/JsControlTreeModifier",
	"sap/ui/thirdparty/jquery",
	"sap/ui/thirdparty/sinon-4"
], function(
	ChangesController,
	PersistenceWriteAPI,
	DescriptorInlineChangeFactory,
	JsControlTreeModifier,
	jQuery,
	sinon
) {
	"use strict";

	var sandbox = sinon.sandbox.create();
	var sReturnValue = "returnValue";

	function mockFlexController(oControl, oReturn) {
		sandbox.stub(ChangesController, "getFlexControllerInstance")
			.withArgs(oControl)
			.returns(oReturn);
	}

	function mockDescriptorController(oControl, oReturn) {
		sandbox.stub(ChangesController, "getDescriptorFlexControllerInstance")
			.withArgs(oControl)
			.returns(oReturn);
	}

	function getMethodStub(aArguments, vReturnValue) {
		var fnPersistenceStub = sandbox.stub();
		fnPersistenceStub
			.withArgs.apply(fnPersistenceStub, aArguments)
			.returns(vReturnValue);
		return fnPersistenceStub;
	}

	QUnit.module("Given PersistenceWriteAPI", {
		beforeEach: function () {
			this.vSelector = {
				elementId: "selector",
				elementType: "sap.ui.core.Control",
				appComponent: {
					id: "appComponent"
				}
			};
		},
		afterEach: function() {
			sandbox.restore();
			delete this.vSelector;
		}
	}, function() {
		QUnit.test("when save is called", function(assert) {
			var bSkipUpdateCache = true;

			var fnFlexStub = getMethodStub([bSkipUpdateCache], Promise.resolve());
			var fnDescriptorStub = getMethodStub([bSkipUpdateCache], Promise.resolve());

			mockFlexController(this.vSelector, { saveAll : fnFlexStub });
			mockDescriptorController(this.vSelector, { saveAll : fnDescriptorStub });

			sandbox.stub(PersistenceWriteAPI, "_getUIChanges")
				.withArgs(this.vSelector, {invalidateCache: true})
				.resolves(sReturnValue);

			return PersistenceWriteAPI.save(this.vSelector, bSkipUpdateCache)
				.then(function(sValue) {
					assert.strictEqual(sValue, sReturnValue, "then the flex persistence was called with correct parameters");
				});
		});

		QUnit.test("when reset is called", function(assert) {
			var mPropertyBag = {
				layer: "customer",
				generator: "generator",
				selectorIds: [],
				changeTypes: []
			};

			var oAppComponent = {id: "appComponent"};

			sandbox.stub(ChangesController, "getAppComponentForSelector")
				.withArgs(this.vSelector)
				.returns(oAppComponent);

			var fnPersistenceStub = getMethodStub([mPropertyBag.layer, mPropertyBag.generator, oAppComponent, mPropertyBag.selectorIds, mPropertyBag.changeTypes], Promise.resolve());
			var fnDescriptorStub = getMethodStub([mPropertyBag.layer, mPropertyBag.generator, oAppComponent, mPropertyBag.selectorIds, mPropertyBag.changeTypes], Promise.resolve(sReturnValue));

			mockFlexController(oAppComponent, { resetChanges : fnPersistenceStub });
			mockDescriptorController(oAppComponent, { resetChanges: fnDescriptorStub });

			return PersistenceWriteAPI.reset(this.vSelector, mPropertyBag)
				.then(function (sValue) {
					assert.strictEqual(sValue, sReturnValue, "then the flex persistence was called with correct parameters");
				});
		});

		QUnit.test("when publish is called", function(assert) {
			var mPropertyBag = {
				sStyleClass: "styleClass",
				sLayer: "customer",
				aAppVariantDescriptors: []
			};

			var oAppComponent = { id: "appComponent" };

			sandbox.stub(ChangesController, "getAppComponentForSelector")
				.withArgs(this.vSelector)
				.returns(oAppComponent);

			var fnPersistenceStub = getMethodStub([{}, mPropertyBag.styleClass, mPropertyBag.layer, mPropertyBag.appVariantDescriptors], Promise.resolve(sReturnValue));

			mockFlexController(oAppComponent, { _oChangePersistence: { transportAllUIChanges : fnPersistenceStub } });

			return PersistenceWriteAPI.publish(this.vSelector, mPropertyBag)
				.then(function(sValue) {
					assert.strictEqual(sValue, sReturnValue, "then the flex persistence was called with correct parameters");
				});
		});

		QUnit.test("when _getUIChanges is called", function(assert) {
			var mPropertyBag = {type: "propertyBag", invalidateCache: true};
			var fnPersistenceStub = getMethodStub([mPropertyBag, mPropertyBag.invalidateCache], Promise.resolve(sReturnValue));

			mockFlexController(this.vSelector, { _oChangePersistence: { getChangesForComponent : fnPersistenceStub } });

			return PersistenceWriteAPI._getUIChanges(this.vSelector, mPropertyBag)
				.then(function(sValue) {
					assert.strictEqual(sValue, sReturnValue, "then the flex persistence was called correctly");
				});
		});

		QUnit.test("when hasChanges is called", function(assert) {
			var mPropertyBag = {type: "propertyBag", invalidateCache: true};
			var mPropertyBagAdjusted = Object.assign({}, mPropertyBag);
			mPropertyBagAdjusted.includeCtrlVariants = true;
			mPropertyBagAdjusted.invalidateCache = false;

			var fnPersistenceStub = getMethodStub([mPropertyBagAdjusted, mPropertyBagAdjusted.invalidateCache], Promise.resolve(["change1"]));

			mockFlexController(this.vSelector, { _oChangePersistence: { getChangesForComponent : fnPersistenceStub } });

			return PersistenceWriteAPI.hasChanges(this.vSelector, mPropertyBag)
				.then(function(bHasChanges) {
					assert.ok(bHasChanges, "then the flex persistence was called correctly");
				});
		});

		QUnit.test("when hasChangesToPublish is called and flex dirty changes exist", function(assert) {
			var mPropertyBag = {type: "propertyBag", invalidateCache: true};

			sandbox.stub(PersistenceWriteAPI, "hasChanges")
				.withArgs(this.vSelector, mPropertyBag)
				.resolves(false);

			var fnPersistenceStub = getMethodStub([], ["change1"]);

			mockFlexController(this.vSelector, { _oChangePersistence: { getDirtyChanges : fnPersistenceStub } });

			return PersistenceWriteAPI.hasChangesToPublish(this.vSelector, mPropertyBag)
				.then(function(bHasChanges) {
					assert.ok(bHasChanges, "then the flex persistence was called correctly");
				});
		});

		QUnit.test("when add is called with a flex change", function(assert) {
			var oChange = {
				getChangeType: function() { return "flexChange"; }
			};
			var oAppComponent = {id: "appComponent"};

			sandbox.stub(ChangesController, "getAppComponentForSelector")
				.withArgs(this.vSelector)
				.returns(oAppComponent);

			var fnPersistenceStub = getMethodStub([oChange, oAppComponent], sReturnValue);

			mockFlexController(oAppComponent, { addPreparedChange : fnPersistenceStub });

			assert.strictEqual(PersistenceWriteAPI.add(oChange, this.vSelector), sReturnValue, "then the flex persistence was called with correct parameters");
		});

		QUnit.test("when add is called with a descriptor change", function(assert) {
			var done = assert.async();
			var sDescriptorChangeType = DescriptorInlineChangeFactory.getDescriptorChangeTypes()[0];
			var oChange = {
				getChangeType: function() {
					return sDescriptorChangeType;
				},
				store: function() {
					assert.ok(true, "then changes's store() was called");
					done();
				}
			};
			PersistenceWriteAPI.add(oChange, this.vSelector);
		});

		QUnit.test("when add is called but an error is thrown", function(assert) {
			var sError = "mock error";
			var oChange = {
				getChangeType: function () {
					throw new Error(sError);
				}
			};
			assert.throws(
				function() {
					PersistenceWriteAPI.add(oChange, this.vSelector);
				},
				new Error(sError),
				"then an error is caught during the process"
			);
		});

		QUnit.test("when remove is called for a flex change", function(assert) {
			var oChange = {
				getSelector: function() { return this.vSelector; }.bind(this),
				getChangeType: function() { return ""; }
			};
			var oElement = { type: "element" };
			var oAppComponent = {id: "appComponent"};

			sandbox.stub(ChangesController, "getAppComponentForSelector")
				.withArgs(this.vSelector)
				.returns(oAppComponent);

			sandbox.stub(JsControlTreeModifier, "bySelector")
				.withArgs(this.vSelector, oAppComponent)
				.returns(oElement);

			var fnRemoveChangeStub = sandbox.stub();
			var fnDeleteChangeStub = sandbox.stub();

			mockFlexController(oElement, { _removeChangeFromControl : fnRemoveChangeStub, deleteChange : fnDeleteChangeStub });

			PersistenceWriteAPI.remove(oChange, this.vSelector);
			assert.ok(fnRemoveChangeStub.calledWith(oElement, oChange, JsControlTreeModifier), "then the flex persistence was called with correct parameters");
			assert.ok(fnDeleteChangeStub.calledWith(oChange, oAppComponent), "then the flex persistence was called with correct parameters");
		});

		QUnit.test("when remove is called for a descriptor change", function(assert) {
			var sDescriptorChangeType = DescriptorInlineChangeFactory.getDescriptorChangeTypes()[0];
			var oChange = {
				getChangeType: function() {return sDescriptorChangeType;}
			};

			var oAppComponent = {id: "appComponent"};

			sandbox.stub(ChangesController, "getAppComponentForSelector")
				.withArgs(this.vSelector)
				.returns(oAppComponent);

			var fnDeleteChangeStub = sandbox.stub();

			mockDescriptorController(oAppComponent, { deleteChange: fnDeleteChangeStub });

			PersistenceWriteAPI.remove(oChange, this.vSelector);
			assert.ok(fnDeleteChangeStub.calledWith(oChange, oAppComponent), "then the flex persistence was called with correct parameters");
		});
	});

	QUnit.done(function () {
		jQuery('#qunit-fixture').hide();
	});
});
