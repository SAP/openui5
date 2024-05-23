/*!
 * ${copyright}
 */
sap.ui.define([
	"sap/base/Log",
	"sap/ui/core/Element",
	"sap/ui/core/ElementRegistry",
	"sap/ui/core/LabelEnablement",
	"sap/ui/model/FieldHelp"
], function (Log, Element, ElementRegistry, LabelEnablement, FieldHelp) {
	/*global sinon, QUnit*/
	"use strict";
	const sClassName = "sap/ui/model/FieldHelp";

	//*********************************************************************************************
	QUnit.module("sap/ui/model/FieldHelp", {
		beforeEach : function () {
			this.oLogMock = this.mock(Log);
			this.oLogMock.expects("error").never();
			this.oLogMock.expects("warning").never();
		},
		afterEach : function () {
			// ensure to clean up
			FieldHelp.getInstance().deactivate();
			ElementRegistry.forEach((oElement) => {
				oElement.destroy();
			});
		}
	});

	//*********************************************************************************************
	QUnit.test("constructor", function (assert) {
		// code under test
		const oFieldHelp = new FieldHelp();

		assert.strictEqual(oFieldHelp.bActive, undefined, "private member");
		assert.strictEqual(oFieldHelp.isActive(), false);
	});

	//*********************************************************************************************
	QUnit.test("getInstance", function (assert) {
		// code under test
		const oFieldHelp = FieldHelp.getInstance();

		assert.ok(oFieldHelp);
		assert.ok(oFieldHelp instanceof FieldHelp);

		// code under test
		assert.strictEqual(FieldHelp.getInstance(), oFieldHelp);
	});

	//*********************************************************************************************
	QUnit.test("activate", function (assert) {
		const oFieldHelp = FieldHelp.getInstance();
		const oFieldHelpMock = this.mock(oFieldHelp);

		assert.strictEqual(oFieldHelp.isActive(), false);
		assert.strictEqual(ElementRegistry.size, 0);

		// ElementRegistry.forEach cannot be mocked - test it integratively
		const oElement0 = new Element();
		const oElement1 = new Element();
		const oElement2 = new Element();

		assert.strictEqual(ElementRegistry.size, 3);
		const oElement0Mock = this.mock(oElement0);
		oElement0Mock.expects("data").withExactArgs("sap-ui-DocumentationRef").returns(["~vValue0", "~vValue1"]);
		oElement0Mock.expects("getMetadata").withExactArgs().returns({
			getName() { return "oElement0"; } // required by oElement.toString called by sinon
		});
		oFieldHelpMock.expects("_setFieldHelpDocumentationRefs")
			.withExactArgs(sinon.match.same(oElement0), undefined, ["~vValue0", "~vValue1"]);

		const oElement1Mock = this.mock(oElement1);
		oElement1Mock.expects("data").withExactArgs("sap-ui-DocumentationRef").returns(null);
		const oElement1MetaData = {
			getAllProperties() {},
			getName() { return "oElement1"; } // required by oElement.toString called by sinon
		};
		oElement1Mock.expects("getMetadata").atLeast(1).withExactArgs().returns(oElement1MetaData);
		this.mock(oElement1MetaData).expects("getAllProperties")
			.withExactArgs()
			.returns({"~sPropertyName1": {}, "~sPropertyName2": {}});
		oFieldHelpMock.expects("update").withExactArgs(sinon.match.same(oElement1), "~sPropertyName1");
		oFieldHelpMock.expects("update").withExactArgs(sinon.match.same(oElement1), "~sPropertyName2");

		const oElement2Mock = this.mock(oElement2);
		oElement2Mock.expects("data").withExactArgs("sap-ui-DocumentationRef").returns("~vValue");
		oElement2Mock.expects("getMetadata").withExactArgs().returns({
			getName() { return "oElement2"; } // required by oElement.toString called by sinon
		});
		oFieldHelpMock.expects("_setFieldHelpDocumentationRefs")
			.withExactArgs(sinon.match.same(oElement2), undefined, ["~vValue"]);

		const fnUpdateHotspotsCallback = () => {};

		// code under test
		oFieldHelp.activate(fnUpdateHotspotsCallback);

		assert.strictEqual(oFieldHelp.isActive(), true);

		// code under test - second call does nothing as field help is already active
		oFieldHelp.activate(fnUpdateHotspotsCallback);

		assert.throws(() => {
			// code under test - second call of activate with different callback throws error
			oFieldHelp.activate(() => {});
		}, new Error("The field help is active for a different update hotspots callback handler"));
	});

	//*********************************************************************************************
	QUnit.test("activate, deactivate and isActive", function (assert) {
		const oFieldHelp = FieldHelp.getInstance();
		assert.strictEqual(oFieldHelp.isActive(), false);

		// code under test - use empty element registry to avoid calculating any field help
		oFieldHelp.activate(() => {/* any callback function */});

		assert.strictEqual(oFieldHelp.isActive(), true);

		// code under test
		oFieldHelp.deactivate();

		assert.strictEqual(oFieldHelp.isActive(), false);

		// code under test - can be called multiple times without throwing an error
		oFieldHelp.deactivate();

		assert.strictEqual(oFieldHelp.isActive(), false);

		// code under test - after deactivation another callback handler can be used
		oFieldHelp.activate(() => {/* another callback function */});

		assert.strictEqual(oFieldHelp.isActive(), true);
	});

	//*********************************************************************************************
	QUnit.test("update: nothing to do cases", function (assert) {
		const oFieldHelp = FieldHelp.getInstance();

		// code under test - if field help is not active, update is ignored
		oFieldHelp.update("~element", "~property");
		this.mock(oFieldHelp).expects("_setFieldHelpDocumentationRefs").never();
		const oElement = {
			getBinding() {},
			getMetadata() {}
		};
		const oElementMock = this.mock(oElement);
		const oMetadata = {getProperty() {}};
		const oMetadataMock = this.mock(oMetadata);
		oElementMock.expects("getMetadata").withExactArgs().returns(oMetadata);
		oElementMock.expects("getBinding").never();
		oMetadataMock.expects("getProperty").withExactArgs("~property").returns({group: "Misc"});
		oFieldHelp.activate("~fnCallback");

		// code under test - property is not in "Data" group
		oFieldHelp.update(oElement, "~property");

		oElementMock.expects("getMetadata").withExactArgs().returns(oMetadata);
		oElementMock.expects("getBinding").never();
		oMetadataMock.expects("getProperty").withExactArgs("tooltip").returns(undefined);
		oFieldHelp.activate("~fnCallback");

		// code under test - update is called for an association (e.g. "tooltip") which does not have property metadata
		oFieldHelp.update(oElement, "tooltip");

		oElementMock.expects("getMetadata").withExactArgs().returns(oMetadata);
		oMetadataMock.expects("getProperty").withExactArgs("~property").returns({group: "Data"});
		oElementMock.expects("getBinding").withExactArgs("~property").returns(undefined);

		// code under test - property is in "Data" group but has no binding
		oFieldHelp.update(oElement, "~property");
	});

	//*********************************************************************************************
	QUnit.test("update: PropertyBinding without DocumentationRef", function (assert) {
		const oElement = {
			getBinding() {},
			getMetadata() {}
		};
		const oElementMock = this.mock(oElement);
		const oMetadata = {getProperty() {}};
		const oMetadataMock = this.mock(oMetadata);
		oElementMock.expects("getMetadata").withExactArgs().returns(oMetadata);
		oMetadataMock.expects("getProperty").withExactArgs("~property").returns({group: "Data"});
		const oBinding = {isA() {}};
		const oPromise = Promise.resolve(); // resolves with undefined, means no documentation ref
		this.mock(FieldHelp).expects("_requestDocumentationRef").withExactArgs(sinon.match.same(oBinding))
			.returns(oPromise);
		oElementMock.expects("getBinding").withExactArgs("~property").returns(oBinding);
		this.mock(oBinding).expects("isA").withExactArgs("sap.ui.model.CompositeBinding").returns(false);
		const oFieldHelp = FieldHelp.getInstance();
		oFieldHelp.activate("~fnCallback");
		// call _setFieldHelpDocumentationRefs even if there ar no documentation refs for proper cleanup
		this.mock(oFieldHelp).expects("_setFieldHelpDocumentationRefs")
			.withExactArgs(sinon.match.same(oElement), "~property", []);

		// code under test - property is in "Data" group, has a binding and it is not a CompositeBinding
		oFieldHelp.update(oElement, "~property");

		return oPromise;
	});

	//*********************************************************************************************
	QUnit.test("update: PropertyBinding with DocumenatationRef", function (assert) {
		const oElement = {
			getBinding() {},
			getMetadata() {}
		};
		const oElementMock = this.mock(oElement);
		const oMetadata = {getProperty() {}};
		const oMetadataMock = this.mock(oMetadata);
		oElementMock.expects("getMetadata").withExactArgs().returns(oMetadata);
		oMetadataMock.expects("getProperty").withExactArgs("~property").returns({group: "Data"});
		const oBinding = {isA() {}};
		oElementMock.expects("getBinding").withExactArgs("~property").returns(oBinding);
		this.mock(oBinding).expects("isA").withExactArgs("sap.ui.model.CompositeBinding").returns(false);
		const oPromise = Promise.resolve("~documentationRef");
		this.mock(FieldHelp).expects("_requestDocumentationRef").withExactArgs(sinon.match.same(oBinding))
			.returns(oPromise);
		const oFieldHelp = FieldHelp.getInstance();
		const oFieldHelpMock = this.mock(oFieldHelp);
		oFieldHelp.activate("~fnCallback");
		oFieldHelpMock.expects("_setFieldHelpDocumentationRefs").never();

		// code under test - property is in "Data" group, has a binding and it is not a CompositeBinding
		oFieldHelp.update(oElement, "~property");

		// is called asynchronously
		oFieldHelpMock.expects("_setFieldHelpDocumentationRefs")
			.withExactArgs(sinon.match.same(oElement), "~property", ["~documentationRef"]);

		return oPromise;
	});

	//*********************************************************************************************
[false, true].forEach((bHasType) => {
	QUnit.test(`update: composite binding, has type: ${bHasType}`, function (assert) {
		const oElement = {
			getBinding() {},
			getMetadata() {}
		};
		const oElementMock = this.mock(oElement);
		const oMetadata = {getProperty() {}};
		const oMetadataMock = this.mock(oMetadata);
		oElementMock.expects("getMetadata").withExactArgs().returns(oMetadata);
		oMetadataMock.expects("getProperty").withExactArgs("~property").returns({group: "Data"});
		const oCompositeBinding = {
			getBindings() {},
			getType() {},
			isA() {}
		};
		const oCompositeBindingMock = this.mock(oCompositeBinding);
		oElementMock.expects("getBinding").withExactArgs("~property").returns(oCompositeBinding);
		oCompositeBindingMock.expects("isA").withExactArgs("sap.ui.model.CompositeBinding").returns(true);
		const oCompositeType = {getPartsIgnoringMessages() {}};
		oCompositeBindingMock.expects("getType").withExactArgs().returns(bHasType ? oCompositeType : undefined);
		this.mock(oCompositeType).expects("getPartsIgnoringMessages").withExactArgs()
			.exactly(bHasType ? 1 : 0)
			.returns([3]);
		const oBinding0 = {};
		const oBinding1 = {};
		const oBinding2 = {};
		const oBinding3 = {};
		oCompositeBindingMock.expects("getBindings").withExactArgs()
			.returns([oBinding0, oBinding1, oBinding2, oBinding3]);
		const oDocumentationRefPromise0 = Promise.resolve("~documentationRef0");
		const oFieldHelpModuleMock = this.mock(FieldHelp);
		oFieldHelpModuleMock.expects("_requestDocumentationRef").withExactArgs(sinon.match.same(oBinding0))
			.returns(oDocumentationRefPromise0);
		oFieldHelpModuleMock.expects("_requestDocumentationRef").withExactArgs(sinon.match.same(oBinding1))
			.returns(undefined); // binding does not support documentation refs
		const oDocumentationRefPromise2 = Promise.resolve(); // resolves with undefined, means no documentation ref
		oFieldHelpModuleMock.expects("_requestDocumentationRef").withExactArgs(sinon.match.same(oBinding2))
			.returns(oDocumentationRefPromise2);
		const oDocumentationRefPromise3 = Promise.resolve("~documentationRef3");
		oFieldHelpModuleMock.expects("_requestDocumentationRef").withExactArgs(sinon.match.same(oBinding3))
			.exactly(bHasType ? 0 : 1)
			.returns("~documentationRef3");
		const oFieldHelp = FieldHelp.getInstance();
		const oFieldHelpMock = this.mock(oFieldHelp);
		oFieldHelpMock.expects("_setFieldHelpDocumentationRefs").never();
		oFieldHelp.activate("~fnCallback");

		// code under test - property is in "Data" group, has a CompositeBinding without a type
		oFieldHelp.update(oElement, "~property");

		oFieldHelpMock.expects("_setFieldHelpDocumentationRefs")
			.withExactArgs(sinon.match.same(oElement), "~property",
				bHasType ? ["~documentationRef0"] : ["~documentationRef0", "~documentationRef3"]);

		return Promise.all([oDocumentationRefPromise0, oDocumentationRefPromise2, oDocumentationRefPromise3]);
	});
});

	//*********************************************************************************************
	QUnit.test("_updateHotspots", function (assert) {
		const oFieldHelp = new FieldHelp();
		const fnUpdateHotspotsCallback = this.stub();
		const oFieldHelpMock = this.mock(oFieldHelp);
		oFieldHelp.activate(fnUpdateHotspotsCallback);

		// code under test
		const oPromise = oFieldHelp._updateHotspots();

		assert.ok(oPromise instanceof Promise);

		// code under test - as long as data is collected, the same promise is returned
		assert.strictEqual(oFieldHelp._updateHotspots(), oPromise);

		// called async
		assert.strictEqual(fnUpdateHotspotsCallback.callCount, 0); // not yet called; will be called after a timeout
		oFieldHelpMock.expects("isActive").withExactArgs().returns(true);
		oFieldHelpMock.expects("_getFieldHelpHotspots").withExactArgs().returns(["~aHotspots"]);

		return oPromise.then((oResult) => {
			assert.strictEqual(oResult, undefined); // resolves without any value
			assert.strictEqual(fnUpdateHotspotsCallback.callCount, 1);
			assert.strictEqual(fnUpdateHotspotsCallback.getCall(0).args.length, 1);
			assert.deepEqual(fnUpdateHotspotsCallback.getCall(0).args[0], ["~aHotspots"]);
			fnUpdateHotspotsCallback.resetHistory();

			// code under test
			const oPromise2 = oFieldHelp._updateHotspots();

			assert.notStrictEqual(oPromise2, oPromise);
			oFieldHelpMock.expects("isActive").withExactArgs().returns(false);
			assert.strictEqual(fnUpdateHotspotsCallback.callCount, 0);

			return oPromise2.catch((oReason) => {
				assert.strictEqual(oReason, undefined); // rejects without any value
				assert.strictEqual(fnUpdateHotspotsCallback.callCount, 0); // not called if deactivated
			});
		}).then(() => {
			// code under test
			const oPromise3 = oFieldHelp._updateHotspots();

			oFieldHelpMock.expects("isActive").withExactArgs().returns(true);
			oFieldHelpMock.expects("_getFieldHelpHotspots").withExactArgs().returns([]);
			assert.strictEqual(fnUpdateHotspotsCallback.callCount, 0);

			return oPromise3;
		}).then(() => {
			// update hotspots has to be called even if there are no hotspots
			assert.strictEqual(fnUpdateHotspotsCallback.callCount, 1);
			assert.deepEqual(fnUpdateHotspotsCallback.getCall(0).args[0], []);
		});
	});

	//*********************************************************************************************
	QUnit.test("_getFieldHelpHotspots and _setFieldHelpDocumentationRefs", function (assert) {
		const oFieldHelp = new FieldHelp();

		// code under test - there are no registered controls
		assert.deepEqual(oFieldHelp._getFieldHelpHotspots(), []);

		const oElement0 = {getId() {}};
		const oElement0Mock = this.mock(oElement0);
		const oFieldHelpMock = this.mock(oFieldHelp);
		oElement0Mock.expects("getId").withExactArgs().returns("~element0");
		const oUpdateHotspotsPromise = {catch() {}};
		const oUpdateHotspotsPromiseMock = this.mock(oUpdateHotspotsPromise);
		oFieldHelpMock.expects("_updateHotspots").withExactArgs().returns(oUpdateHotspotsPromise);
		// ensure that Promise is caught to avoid uncaught in Promise
		oUpdateHotspotsPromiseMock.expects("catch").withExactArgs(sinon.match.func).callThrough();

		// code under test - set a single field help URN for the control
		oFieldHelp._setFieldHelpDocumentationRefs(oElement0, undefined, [
			"urn:sap-com:documentation:key?=type=~customType0&id=~customId0"
		]);

		const oElement1 = {getId() {}};
		const oElement1Mock = this.mock(oElement1);
		oElement1Mock.expects("getId").withExactArgs().returns("~element1");
		oFieldHelpMock.expects("_updateHotspots").withExactArgs().withExactArgs().returns(oUpdateHotspotsPromise);
		oUpdateHotspotsPromiseMock.expects("catch").withExactArgs(sinon.match.func).callThrough();

		// code under test - multiple URNs for a control
		oFieldHelp._setFieldHelpDocumentationRefs(oElement1, undefined, [
			"urn:sap-com:documentation:key?=type=~customType1&id=~customId1&origin=~origin1",
			"urn:sap-com:documentation:key?=type=~customType2&id=~customId2&origin=~origin2"
		]);

		oElement1Mock.expects("getId").withExactArgs().returns("~element1");
		oFieldHelpMock.expects("_updateHotspots").withExactArgs().withExactArgs().returns(oUpdateHotspotsPromise);
		oUpdateHotspotsPromiseMock.expects("catch").withExactArgs(sinon.match.func).callThrough();

		// code under test - single URN for a control property
		oFieldHelp._setFieldHelpDocumentationRefs(oElement1, "~property0", [
			"urn:sap-com:documentation:key?=type=~customType3&id=~customId3"
		]);

		oElement1Mock.expects("getId").withExactArgs().returns("~element1");
		oFieldHelpMock.expects("_updateHotspots").withExactArgs().withExactArgs().returns(oUpdateHotspotsPromise);
		oUpdateHotspotsPromiseMock.expects("catch").withExactArgs(sinon.match.func).callThrough();

		// code under test - duplicate URN for a different control property
		oFieldHelp._setFieldHelpDocumentationRefs(oElement1, "~property1", [
			"urn:sap-com:documentation:key?=type=~customType3&id=~customId3"
		]);

		const oElementMock = this.mock(Element);
		oElementMock.expects("getElementById").withExactArgs("~element0").returns(oElement0);
		const oLabelEnablementMock = this.mock(LabelEnablement);
		oLabelEnablementMock.expects("_getLabelTexts").withExactArgs(sinon.match.same(oElement0))
			.returns(["~sLabel0", "foo"]);
		oElementMock.expects("getElementById").withExactArgs("~element1").returns(oElement1);
		oLabelEnablementMock.expects("_getLabelTexts").withExactArgs(sinon.match.same(oElement1)).returns(["~sLabel1"]);

		// code under test
		assert.deepEqual(oFieldHelp._getFieldHelpHotspots(), [{
			backendHelpKey: {id: "~customId0", origin: null, type: "~customType0"},
			hotspotId: "~element0",
			labelText: "~sLabel0"
		}, {
			backendHelpKey: {id: "~customId1", origin: "~origin1", type: "~customType1"},
			hotspotId: "~element1",
			labelText: "~sLabel1"
		}, {
			backendHelpKey: {id: "~customId2", origin: "~origin2", type: "~customType2"},
			hotspotId: "~element1",
			labelText: "~sLabel1"
		}, {
			backendHelpKey: {id: "~customId3", origin: null, type: "~customType3"},
			hotspotId: "~element1",
			labelText: "~sLabel1"
		}]);

		oElement1Mock.expects("getId").withExactArgs().returns("~element1");
		oFieldHelpMock.expects("_updateHotspots").withExactArgs().withExactArgs().returns(oUpdateHotspotsPromise);
		oUpdateHotspotsPromiseMock.expects("catch").withExactArgs(sinon.match.func).callThrough();

		// code under test - overwrites existing control URN, e.g. caused by switching the parent context
		oFieldHelp._setFieldHelpDocumentationRefs(oElement1, undefined, [
			"urn:sap-com:documentation:key?=type=~customType4&id=~customId4&origin=~origin4"
		]);

		oElementMock.expects("getElementById").withExactArgs("~element0").returns(oElement0);
		oLabelEnablementMock.expects("_getLabelTexts").withExactArgs(sinon.match.same(oElement0)).returns(["~sLabel0"]);
		oElementMock.expects("getElementById").withExactArgs("~element1").returns(oElement1);
		oLabelEnablementMock.expects("_getLabelTexts").withExactArgs(sinon.match.same(oElement1)).returns(["~sLabel1"]);

		// code under test
		assert.deepEqual(oFieldHelp._getFieldHelpHotspots(), [{
			backendHelpKey: {id: "~customId0", origin: null, type: "~customType0"},
			hotspotId: "~element0",
			labelText: "~sLabel0"
		}, {
			backendHelpKey: {id: "~customId4", origin: "~origin4", type: "~customType4"},
			hotspotId: "~element1",
			labelText: "~sLabel1"
		}, {
			backendHelpKey: {id: "~customId3", origin: null, type: "~customType3"},
			hotspotId: "~element1",
			labelText: "~sLabel1"
		}]);

		oElement1Mock.expects("getId").withExactArgs().returns("~element1");
		oFieldHelpMock.expects("_updateHotspots").withExactArgs().withExactArgs().returns(oUpdateHotspotsPromise);
		oUpdateHotspotsPromiseMock.expects("catch").withExactArgs(sinon.match.func).callThrough();

		// code under test - delete URNs for the control
		oFieldHelp._setFieldHelpDocumentationRefs(oElement1, undefined, []);

		oElement1Mock.expects("getId").withExactArgs().returns("~element1");
		oFieldHelpMock.expects("_updateHotspots").withExactArgs().withExactArgs().returns(oUpdateHotspotsPromise);
		oUpdateHotspotsPromiseMock.expects("catch").withExactArgs(sinon.match.func).callThrough();

		// code under test - delete URNs for a control property
		oFieldHelp._setFieldHelpDocumentationRefs(oElement1, "~property0", []);

		oElementMock.expects("getElementById").withExactArgs("~element0").returns(oElement0);
		oLabelEnablementMock.expects("_getLabelTexts").withExactArgs(sinon.match.same(oElement0)).returns(["~sLabel0"]);
		oElementMock.expects("getElementById").withExactArgs("~element1").returns(oElement1);
		oLabelEnablementMock.expects("_getLabelTexts").withExactArgs(sinon.match.same(oElement1)).returns(["~sLabel1"]);

		// code under test
		assert.deepEqual(oFieldHelp._getFieldHelpHotspots(), [{
			backendHelpKey: {id: "~customId0", origin: null, type: "~customType0"},
			hotspotId: "~element0",
			labelText: "~sLabel0"
		}, {
			backendHelpKey: {id: "~customId3", origin: null, type: "~customType3"},
			hotspotId: "~element1",
			labelText: "~sLabel1"
		}]);

		oElement1Mock.expects("getId").withExactArgs().returns("~element1");
		oFieldHelpMock.expects("_updateHotspots").withExactArgs().withExactArgs().returns(oUpdateHotspotsPromise);
		oUpdateHotspotsPromiseMock.expects("catch").withExactArgs(sinon.match.func).callThrough();

		// code under test - remove all URNs of the last control property, of a control entry
		oFieldHelp._setFieldHelpDocumentationRefs(oElement1, "~property1", []);

		oElementMock.expects("getElementById").withExactArgs("~element0").returns(oElement0);
		oLabelEnablementMock.expects("_getLabelTexts").withExactArgs(sinon.match.same(oElement0)).returns(["~sLabel0"]);

		// code under test
		assert.deepEqual(oFieldHelp._getFieldHelpHotspots(), [{
			backendHelpKey: {id: "~customId0", origin: null, type: "~customType0"},
			hotspotId: "~element0",
			labelText: "~sLabel0"
		}]);

		oElement0Mock.expects("getId").withExactArgs().returns("~element0");
		oFieldHelpMock.expects("_updateHotspots").withExactArgs().withExactArgs().returns(oUpdateHotspotsPromise);
		oUpdateHotspotsPromiseMock.expects("catch").withExactArgs(sinon.match.func).callThrough();

		// code under test - remove the last registered URN
		oFieldHelp._setFieldHelpDocumentationRefs(oElement0, undefined, []);

		// code under test
		assert.deepEqual(oFieldHelp._getFieldHelpHotspots(), []);
	});

	//*********************************************************************************************
	QUnit.test("_getFieldHelpHotspots: no label found", function (assert) {
		const oFieldHelp = new FieldHelp();
		const oFieldHelpMock = this.mock(oFieldHelp);
		const oElement0 = {getId() {}};
		this.mock(oElement0).expects("getId").withExactArgs().returns("~element0");
		const oUpdateHotspotsPromise = Promise.resolve();
		oFieldHelpMock.expects("_updateHotspots").withExactArgs().returns(oUpdateHotspotsPromise);
		const sURNElement0 = "urn:sap-com:documentation:key?=type=~customType0&id=~customId0";
		oFieldHelp._setFieldHelpDocumentationRefs(oElement0, undefined, [sURNElement0]);
		const oElement1 = {getId() {}};
		this.mock(oElement1).expects("getId").withExactArgs().returns("~element1");
		const oUpdateHotspotsPromise1 = Promise.resolve();
		oFieldHelpMock.expects("_updateHotspots").withExactArgs().returns(oUpdateHotspotsPromise1);
		oFieldHelp._setFieldHelpDocumentationRefs(oElement1, undefined, [
			"urn:sap-com:documentation:key?=type=~customType1&id=~customId1"
		]);

		const oElementMock = this.mock(Element);
		oElementMock.expects("getElementById").withExactArgs("~element0").returns(oElement0);
		const oLabelEnablementMock = this.mock(LabelEnablement);
		oLabelEnablementMock.expects("_getLabelTexts").withExactArgs(sinon.match.same(oElement0)).returns([]);
		this.oLogMock.expects("error")
			.withExactArgs("Cannot find a label for control '~element0'; ignoring field help",
				`{"undefined":["${sURNElement0}"]}`, sClassName);
		oElementMock.expects("getElementById").withExactArgs("~element1").returns(oElement1);
		oLabelEnablementMock.expects("_getLabelTexts").withExactArgs(sinon.match.same(oElement1)).returns(["~sLabel"]);

		// code under test - only the control which has a label is added to the internal data structure
		assert.deepEqual(oFieldHelp._getFieldHelpHotspots(), [{
			backendHelpKey: {id: "~customId1", origin: null, type: "~customType1"},
			hotspotId: "~element1",
			labelText: "~sLabel"
		}]);

		return Promise.all([oUpdateHotspotsPromise, oUpdateHotspotsPromise1]);
	});

	//*********************************************************************************************
	QUnit.test("_getFieldHelpHotspots: destroyed control", function (assert) {
		const oFieldHelp = new FieldHelp();
		const oElement0 = {getId() {}};
		this.mock(oElement0).expects("getId").withExactArgs().returns("~element0");
		const oUpdateHotspotsPromise = {catch() {}};
		this.mock(oFieldHelp).expects("_updateHotspots").withExactArgs().returns(oUpdateHotspotsPromise);
		this.mock(oUpdateHotspotsPromise).expects("catch").withExactArgs(sinon.match.func);
		oFieldHelp._setFieldHelpDocumentationRefs(oElement0, undefined, [
			"urn:sap-com:documentation:key?=type=~customType0&id=~customId0"
		]);

		const oElementMock = this.mock(Element);
		oElementMock.expects("getElementById").withExactArgs("~element0").returns(oElement0);
		this.mock(LabelEnablement).expects("_getLabelTexts").withExactArgs(sinon.match.same(oElement0))
			.returns(["~sLabel0"]);
		assert.deepEqual(oFieldHelp._getFieldHelpHotspots(), [{
			backendHelpKey: {id: "~customId0", origin: null, type: "~customType0"},
			hotspotId: "~element0",
			labelText: "~sLabel0"
		}]);

		// simulate that the control has been destroyed
		oElementMock.expects("getElementById").withExactArgs("~element0").returns(undefined);

		// code under test - control was destroyed in between
		assert.deepEqual(oFieldHelp._getFieldHelpHotspots(), []);

		// code under test - the destroyed control has been removed from internal data structure -> no getElementById
		assert.deepEqual(oFieldHelp._getFieldHelpHotspots(), []);
	});

	//*********************************************************************************************
	QUnit.test("_setFieldHelpDocumentationRefs: _updateHotspots rejects", function (assert) {
		const oFieldHelp = new FieldHelp();
		const oElement0 = {getId() {}};
		this.mock(oElement0).expects("getId").withExactArgs().returns("~element0");
		const oUpdateHotspotsPromise = Promise.reject(new Error("Update hotspots failed"));
		this.mock(oFieldHelp).expects("_updateHotspots").withExactArgs().returns(oUpdateHotspotsPromise);

		// code under test - set field help, but the update rejects as field help is deactivated in between
		oFieldHelp._setFieldHelpDocumentationRefs(oElement0, undefined, [
			"urn:sap-com:documentation:key?=type=~customType0&id=~customId0"
		]);

		return Promise.resolve().then(() => {/* wait until _updateHotspots is completely processed */});
	});

	//*********************************************************************************************
	QUnit.test("deactivate cleans internal data structure", function (assert) {
		const oFieldHelp = new FieldHelp();
		const oElement = {getId() {return "~element";}};
		const oUpdateHotspotsPromise = {catch() {}};
		const oUpdateHotspotsPromiseMock = this.mock(oUpdateHotspotsPromise);
		this.mock(oFieldHelp).expects("_updateHotspots").withExactArgs().returns(oUpdateHotspotsPromise);
		// ensure that Promise is caught to avoid uncaught in Promise
		oUpdateHotspotsPromiseMock.expects("catch").withExactArgs(sinon.match.func).callThrough();
		oFieldHelp._setFieldHelpDocumentationRefs(oElement, undefined, [
			"urn:sap-com:documentation:key?=type=~customType&id=~customId"
		]);
		this.mock(Element).expects("getElementById").withExactArgs("~element").returns(oElement);
		this.mock(LabelEnablement).expects("_getLabelTexts").withExactArgs(sinon.match.same(oElement))
			.returns(["~sLabelText"]);

		assert.deepEqual(oFieldHelp._getFieldHelpHotspots(), [{
			backendHelpKey: {id: "~customId", origin: null, type: "~customType"},
			hotspotId: "~element",
			labelText: "~sLabelText"
		}]);

		// code under test
		oFieldHelp.deactivate();

		assert.deepEqual(oFieldHelp._getFieldHelpHotspots(), []);
	});

	//*********************************************************************************************
[undefined, "/foo#meta", "/bar@annotation"].forEach((sResolvedPath) => {
	QUnit.test("_requestDocumentationRef: unsupported binding path: " + sResolvedPath, function (assert) {
		const oBinding = {
			getResolvedPath() {},
			isDestroyed() {}
		};
		this.mock(oBinding).expects("isDestroyed").withExactArgs().returns(false);
		this.mock(oBinding).expects("getResolvedPath").withExactArgs().returns(sResolvedPath);

		// code under test
		assert.strictEqual(FieldHelp._requestDocumentationRef(oBinding), undefined);
	});
});

	//*********************************************************************************************
	QUnit.test("_requestDocumentationRef: binding is being destroyed", function (assert) {
		const oBinding = {isDestroyed() {}};
		this.mock(oBinding).expects("isDestroyed").withExactArgs().returns(true);

		// code under test - binding is being destroyed
		assert.strictEqual(FieldHelp._requestDocumentationRef(oBinding), undefined);
	});

	//*********************************************************************************************
[
	{bHasModel: false}, // e.g. StaticBinding
	{bHasModel: true, oMetaModel: undefined},
	{bHasModel: true, oMetaModel: {/* no getMetaContext */}}
].forEach(({bHasModel, oMetaModel}, i) => {
	QUnit.test("_requestDocumentationRef: no meta model with getMetaContext, #" + i, function (assert) {
		const oBinding = {
			getModel() {},
			getResolvedPath() {},
			isDestroyed() {}
		};
		this.mock(oBinding).expects("isDestroyed").withExactArgs().returns(false);
		this.mock(oBinding).expects("getResolvedPath").withExactArgs().returns("/resolved/data/path");
		const oModel = {getMetaModel() {}};
		this.mock(oModel).expects("getMetaModel").withExactArgs().exactly(bHasModel ? 1 : 0). returns(oMetaModel);
		this.mock(oBinding).expects("getModel").withExactArgs().returns(bHasModel ? oModel : undefined);

		// code under test
		assert.strictEqual(FieldHelp._requestDocumentationRef(oBinding), undefined);
	});
});

	//*********************************************************************************************
[
	{bHasAnnotation: false, oPropertyMetadata: undefined}, // no metadata at all
	{bHasAnnotation: false, oPropertyMetadata: {}}, // metadata for meta context available, but no anntation
	{
		bHasAnnotation: true,
		oPropertyMetadata: {
			"com.sap.vocabularies.Common.v1.DocumentationRef": {String: "~DocumentationRefValue"}
		}
	}
].forEach(({bHasAnnotation, oPropertyMetadata}, i) => {
	QUnit.test("_requestDocumentationRef: V2 binding, #" + i, function (assert) {
		const oBinding = {
			getModel() {},
			getResolvedPath() {},
			isDestroyed() {}
		};
		this.mock(oBinding).expects("isDestroyed").withExactArgs().returns(false);
		this.mock(oBinding).expects("getResolvedPath").withExactArgs().returns("/resolved/data/path");
		const oModel = {getMetaModel() {}};
		const oMetaModel = {
			getMetaContext() {},
			getObject() {},
			isA() {},
			loaded() {}
		};
		this.mock(oModel).expects("getMetaModel").withExactArgs(). returns(oMetaModel);
		this.mock(oBinding).expects("getModel").withExactArgs().returns(oModel);
		this.mock(oMetaModel).expects("isA").withExactArgs("sap.ui.model.odata.ODataMetaModel").returns(true);
		this.mock(oMetaModel).expects("loaded").withExactArgs().resolves();
		this.mock(oMetaModel).expects("getMetaContext").withExactArgs("/resolved/data/path").returns("~metaContext");
		this.mock(oMetaModel).expects("getObject").withExactArgs("", "~metaContext").returns(oPropertyMetadata);

		// code under test
		const oPromise = FieldHelp._requestDocumentationRef(oBinding);

		assert.ok(oPromise instanceof Promise);

		return oPromise.then((sDocumentationRefValue) => {
			assert.strictEqual(sDocumentationRefValue, bHasAnnotation ? "~DocumentationRefValue" : undefined);
		});
	});
});

	//*********************************************************************************************
	QUnit.test("_requestDocumentationRef: V2 binding, loaded promise rejects", function (assert) {
		const oBinding = {
			getModel() {},
			getResolvedPath() {},
			isDestroyed() {}
		};
		this.mock(oBinding).expects("isDestroyed").withExactArgs().returns(false);
		this.mock(oBinding).expects("getResolvedPath").withExactArgs().returns("/resolved/data/path");
		const oModel = {getMetaModel() {}};
		const oMetaModel = {
			getMetaContext() {},
			getObject() {},
			isA() {},
			loaded() {}
		};
		this.mock(oModel).expects("getMetaModel").withExactArgs(). returns(oMetaModel);
		this.mock(oBinding).expects("getModel").withExactArgs().returns(oModel);
		this.mock(oMetaModel).expects("isA").withExactArgs("sap.ui.model.odata.ODataMetaModel").returns(true);
		const oError = new Error("~loadedRejected");
		this.mock(oMetaModel).expects("loaded").withExactArgs().rejects(oError);
		this.oLogMock.expects("error")
			.withExactArgs("Failed to request 'com.sap.vocabularies.Common.v1.DocumentationRef' annotation for path "
				+ "'/resolved/data/path'", sinon.match.same(oError), sClassName);

		// code under test
		const oPromise = FieldHelp._requestDocumentationRef(oBinding);

		assert.ok(oPromise instanceof Promise);

		return oPromise.then((sDocumentationRefValue) => {
			assert.strictEqual(sDocumentationRefValue, undefined);
		});
	});

	//*********************************************************************************************
	QUnit.test("_requestDocumentationRef: V2 binding, error while fetching metadata", function (assert) {
		const oBinding = {
			getModel() {},
			getResolvedPath() {},
			isDestroyed() {}
		};
		this.mock(oBinding).expects("isDestroyed").withExactArgs().returns(false);
		this.mock(oBinding).expects("getResolvedPath").withExactArgs().returns("/resolved/data/path");
		const oModel = {getMetaModel() {}};
		const oMetaModel = {
			getMetaContext() {},
			getObject() {},
			isA() {},
			loaded() {}
		};
		this.mock(oModel).expects("getMetaModel").withExactArgs(). returns(oMetaModel);
		this.mock(oBinding).expects("getModel").withExactArgs().returns(oModel);
		this.mock(oMetaModel).expects("isA").withExactArgs("sap.ui.model.odata.ODataMetaModel").returns(true);
		this.mock(oMetaModel).expects("loaded").withExactArgs().resolves();
		this.mock(oMetaModel).expects("getMetaContext").withExactArgs("/resolved/data/path").returns("~metaContext");
		const oError = new Error("Context cannot be determined");
		this.mock(oMetaModel).expects("getObject").withExactArgs("", "~metaContext").throws(oError);
		this.oLogMock.expects("error")
			.withExactArgs("Failed to request 'com.sap.vocabularies.Common.v1.DocumentationRef' annotation for path "
				+ "'/resolved/data/path'", sinon.match.same(oError), sClassName);

		// code under test
		const oPromise = FieldHelp._requestDocumentationRef(oBinding);

		assert.ok(oPromise instanceof Promise);

		return oPromise.then((sDocumentationRefValue) => {
			assert.strictEqual(sDocumentationRefValue, undefined);
		});
	});

	//*********************************************************************************************
[false, true].forEach((bHasAnnotation) => {
	QUnit.test("_requestDocumentationRef: V4 binding, has annotation=" + bHasAnnotation, function (assert) {
		const oBinding = {
			getModel() {},
			getResolvedPath() {},
			isDestroyed() {}
		};
		this.mock(oBinding).expects("isDestroyed").withExactArgs().returns(false);
		this.mock(oBinding).expects("getResolvedPath").withExactArgs().returns("/resolved/data/path");
		const oModel = {getMetaModel() {}};
		const oMetaModel = {
			getMetaContext() {},
			isA() {},
			requestObject() {}
		};
		this.mock(oModel).expects("getMetaModel").withExactArgs(). returns(oMetaModel);
		this.mock(oBinding).expects("getModel").withExactArgs().returns(oModel);
		this.mock(oMetaModel).expects("isA").withExactArgs("sap.ui.model.odata.ODataMetaModel").returns(false);
		this.mock(oMetaModel).expects("getMetaContext").withExactArgs("/resolved/data/path").returns("~metaContext");
		this.mock(oMetaModel).expects("requestObject")
			.withExactArgs("@com.sap.vocabularies.Common.v1.DocumentationRef", "~metaContext")
			.resolves(bHasAnnotation ? {String: "~DocumentationRefValue"} : undefined);

		// code under test
		const oPromise = FieldHelp._requestDocumentationRef(oBinding);

		assert.ok(oPromise instanceof Promise);

		return oPromise.then((sDocumentationRefValue) => {
			assert.strictEqual(sDocumentationRefValue, bHasAnnotation ? "~DocumentationRefValue" : undefined);
		});
	});
});

	//*********************************************************************************************
	QUnit.test("_requestDocumentationRef: V4 binding, requestObject rejects", function (assert) {
		const oBinding = {
			getModel() {},
			getResolvedPath() {},
			isDestroyed() {}
		};
		this.mock(oBinding).expects("isDestroyed").withExactArgs().returns(false);
		this.mock(oBinding).expects("getResolvedPath").withExactArgs().returns("/resolved/data/path");
		const oModel = {getMetaModel() {}};
		const oMetaModel = {
			getMetaContext() {},
			isA() {},
			requestObject() {}
		};
		this.mock(oModel).expects("getMetaModel").withExactArgs(). returns(oMetaModel);
		this.mock(oBinding).expects("getModel").withExactArgs().returns(oModel);
		this.mock(oMetaModel).expects("isA").withExactArgs("sap.ui.model.odata.ODataMetaModel").returns(false);
		this.mock(oMetaModel).expects("getMetaContext").withExactArgs("/resolved/data/path").returns("~metaContext");
		const oError = new Error("~requestObjectRejected");
		this.mock(oMetaModel).expects("requestObject")
			.withExactArgs("@com.sap.vocabularies.Common.v1.DocumentationRef", "~metaContext")
			.rejects(oError);
		this.oLogMock.expects("error")
			.withExactArgs("Failed to request 'com.sap.vocabularies.Common.v1.DocumentationRef' annotation for path "
				+ "'/resolved/data/path'", sinon.match.same(oError), sClassName);

		// code under test
		const oPromise = FieldHelp._requestDocumentationRef(oBinding);

		assert.ok(oPromise instanceof Promise);

		return oPromise.then((sDocumentationRefValue) => {
			assert.strictEqual(sDocumentationRefValue, undefined);
		});
	});
});