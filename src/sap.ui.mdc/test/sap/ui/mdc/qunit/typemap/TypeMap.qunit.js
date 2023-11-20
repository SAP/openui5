/* global QUnit, sinon */

sap.ui.define([
	"sap/ui/mdc/util/TypeMap",
	"sap/ui/mdc/enums/BaseType",
	"sap/ui/model/type/String"
],
function(
	TypeMap,
	BaseType,
	StringType
) {
    "use strict";

	let TestTypeMap;
	let _mMap;
	let DerivedTestTypeMap;

	const fnOptions = function () {};

	QUnit.module("", { beforeEach: function () {
		TestTypeMap = Object.assign({}, TypeMap);
		_mMap = TestTypeMap._getMap();
		DerivedTestTypeMap = Object.assign({}, TestTypeMap);
	}});

	QUnit.test("_getMap", function(assert) {
		const _mMap = TestTypeMap._getMap();
		assert.ok(_mMap instanceof Map, "returns a Map");
		assert.equal(_mMap, TestTypeMap._getMap(), "returns same Map on repeated call.");
		assert.notEqual(_mMap, DerivedTestTypeMap._getMap(), "returns different Maps for derived TypeMaps.");
	});

	QUnit.test("set", function(assert) {
		assert.notOk(Array.from(_mMap).length, "Map is initially empty");
		TestTypeMap.set("this.is.my.TypeClass", BaseType.String, fnOptions);
		assert.equal(Array.from(_mMap).length, 1, "set pushed a value");
		assert.ok(_mMap.has("this.is.my.TypeClass"), "expected identifier is set");
		assert.equal(_mMap.get("this.is.my.TypeClass")[0], BaseType.String, "expected baseType is set");
		assert.equal(_mMap.get("this.is.my.TypeClass")[1], fnOptions, "expected Options method is set");
	});

	QUnit.test("setAlias", function(assert) {
		TestTypeMap.set("this.is.my.TypeClass", BaseType.String, fnOptions);
		TestTypeMap.setAlias("MyTypeClass", "this.is.my.TypeClass");
		assert.equal(Array.from(_mMap).length, 2, "set pushed a second value");
		assert.equal(_mMap.get("MyTypeClass"), "this.is.my.TypeClass", "expected key value pair is set");
	});

	QUnit.module("getters", {before: function () {
		TestTypeMap = Object.assign({}, TypeMap);
		_mMap = TestTypeMap._getMap();
		DerivedTestTypeMap = Object.assign({}, TestTypeMap);

		TestTypeMap.set("this.is.my.TypeClass", BaseType.String, fnOptions);
		TestTypeMap.setAlias("MyTypeClass", "this.is.my.TypeClass");
	}});

	QUnit.test("_get", function(assert) {
		const aResult = TestTypeMap._get("this.is.my.TypeClass");
		assert.ok(aResult, "_get returns an entry");
		assert.equal(aResult[0], "this.is.my.TypeClass", "_get returns expected value identifier");
		assert.equal(aResult[1][0], BaseType.String, "_get returns expected BaseType");
		assert.equal(aResult[1][1], fnOptions, "_get returns expected Options method");

		const aAliasResult = TestTypeMap._get("MyTypeClass");
		assert.equal(aResult[0], aAliasResult[0], "_get returns expected value identifier");
		assert.equal(aResult[1], aAliasResult[1], "_get returns expected value");
	});

	QUnit.test("_getBaseType", function(assert) {
		sinon.spy(TestTypeMap, "_get");
		assert.equal(TestTypeMap._getBaseType("this.is.my.TypeClass"), _mMap.get("this.is.my.TypeClass")[0], "expected baseType returned");
		assert.equal(TestTypeMap._getBaseType("MyTypeClass"), _mMap.get("this.is.my.TypeClass")[0], "expected baseType returned");
		assert.ok(TestTypeMap._get.calledThrice, "method relies on _get");
		TestTypeMap._get.restore();
	});

	QUnit.test("_getOptions", function(assert) {
		sinon.spy(TestTypeMap, "_get");
		assert.equal(TestTypeMap._getOptions("this.is.my.TypeClass"), _mMap.get("this.is.my.TypeClass")[1], "expected getOptions returned");
		assert.equal(TestTypeMap._getOptions("MyTypeClass"), _mMap.get("this.is.my.TypeClass")[1], "expected getOptions returned");
		assert.ok(TestTypeMap._get.calledThrice, "method relies on _get");
		TestTypeMap._get.restore();
	});

	QUnit.test("_getClass", function(assert) {
		sinon.spy(TestTypeMap, "_get");
		assert.equal(TestTypeMap._getClass("this.is.my.TypeClass"), "this.is.my.TypeClass", "expected identifier returned");
		assert.equal(TestTypeMap._getClass("MyTypeClass"), "this.is.my.TypeClass", "expected identifier returned");
		assert.ok(TestTypeMap._get.calledThrice, "method relies on _get");
		TestTypeMap._get.restore();
	});

	QUnit.module("export / import", {before: function () {
		TestTypeMap = Object.assign({}, TypeMap);
		_mMap = TestTypeMap._getMap();
		DerivedTestTypeMap = Object.assign({}, TestTypeMap);
		TestTypeMap.set("this.is.my.TypeClass", BaseType.String, fnOptions);
	}});

	QUnit.test("export", function(assert) {
		assert.deepEqual(TestTypeMap.export(), Array.from(_mMap), "returns expected external format");
	});

	QUnit.test("import", function(assert) {
		sinon.spy(TestTypeMap, "export");

		const _mDerivedMap = DerivedTestTypeMap._getMap();

		assert.notOk(Array.from(_mDerivedMap).length, "Derived TypeMap does not contain data.");

		DerivedTestTypeMap.import(TestTypeMap);
		assert.ok(TestTypeMap.export.called, "Derived TypeMap now contains data.");
		assert.ok(Array.from(_mDerivedMap).length, "Derived TypeMap now contains data.");
		assert.deepEqual(Array.from(_mDerivedMap), Array.from(_mMap), "Derived TypeMap data equals TypeMap data.");
		TestTypeMap.export.restore();
	});

	QUnit.test("freeze", function(assert) {
		TestTypeMap.freeze();

		assert.throws(
			function() {
				TestTypeMap.set("this.is.my.OtherTypeClass", BaseType.String);
			},
			function(sError) {
				return sError === "TypeMap: You must not modify a frozen TypeMap";
			},
			"TypeMap.set leads to error"
		);

		assert.throws(
			function() {
				TestTypeMap.setAlias("MyOtherTypeClass", "this.is.my.OtherTypeClass");
			},
			function(sError) {
				return sError === "TypeMap: You must not modify a frozen TypeMap";
			},
			"TypeMap.setAlias leads to error"
		);

		assert.notOk(Array.from(TestTypeMap._getMap()).length > 1, "TypeMap does not contain additional data.");

	});

	QUnit.module("Type initialization", { beforeEach: function () {
		TestTypeMap = Object.assign({}, TypeMap);
		_mMap = TestTypeMap._getMap();
		DerivedTestTypeMap = Object.assign({}, TestTypeMap);
	}});

	QUnit.test("initializeTypeFromValue", function(assert) {
		const oType = new StringType();
		assert.deepEqual(TestTypeMap.initializeTypeFromValue(oType, "Test"), {}, "empty object returned");
		oType.destroy();
	});

	QUnit.test("initializeInternalType", function(assert) {
		const oType = new StringType();
		assert.deepEqual(TestTypeMap.initializeInternalType(oType, {}), undefined, "nothing returned");
		oType.destroy();
	});

});