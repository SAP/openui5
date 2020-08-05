/* global QUnit */
sap.ui.define(["sap/ui/base/Object", "sap/ui/core/Icon"], function(BaseObject, Icon) {
	"use strict";
	/*
	 * JSUNIT:
	 *     create your test fixture here, e.g. create SAPUI5 control tree and add it to
	 *     "uiArea1".
	 */

	function assertArrayEquals(sMessage, assert, a1, a2) {
		if (!a1 || !a2) {
			assert.strictEqual(a2, a1, sMessage);
			return;
		}

		var l1 = a1.length,
			l2 = a2.length;
		assert.strictEqual(l2, l1, sMessage);
		for (var i = 0; i < l1; i++) {
			assert.strictEqual(a2[i], a1[i], sMessage);
		}
	}

	jQuery.sap.declare("sap.test.NewClass");

	sap.test.NewClass = function(v1) {
		this.value1 = v1;
	};
	sap.test.NewClass.prototype = jQuery.sap.newObject(BaseObject.prototype);
	BaseObject.defineClass("sap.test.NewClass", {
		baseType: "sap.ui.base.Object",
		interfaces: ["sap.ui.base.Poolable", "sap.test.MyInterface"],
		publicMethods: ["method1"]
	});
	sap.test.NewClass.prototype.method1 = function() {
		return this.value1;
	};

	sap.test.NewSubClass = function(v1, v2) {
		sap.test.NewClass.call(this, v1);
		this.value2 = v2;
	};
	sap.test.NewSubClass.prototype = jQuery.sap.newObject(sap.test.NewClass.prototype);
	BaseObject.defineClass("sap.test.NewSubClass", {
		baseType: "sap.test.NewClass",
		interfaces: ["sap.ui.base.Cacheable", "sap.ui.base.Poolable"],
		publicMethods: ["method2"]
	});
	sap.test.NewSubClass.prototype.method2 = function() {
		return this.value2;
	};

	QUnit.module("Base", {
		beforeEach: function() {
			this.oObject = new BaseObject();
			this.oNewClassInstance = new sap.test.NewClass(42);
			this.oNewSubClassInstance = new sap.test.NewSubClass();
		}
	});

	QUnit.test("InitialObject", function(assert) {
		// assert("fresh object doesn't have interface", typeof this.oObject.oInterface === "undefined");
		assert.ok(this.oObject.getInterface === BaseObject.prototype.getInterface, "fresh object doesn't have own getInterface implementation");
	});

	QUnit.test("GetInterface", function(assert) {
		var oIntf1 = this.oNewClassInstance.getInterface();
		assert.ok(oIntf1 !== undefined && oIntf1 !== null, "interface returned");
		// assert("object has interface member", this.oObject.oInterface && typeof this.oObject.oInterface === "object" );
		assert.ok(this.oNewClassInstance.getInterface !== BaseObject.prototype.getInterface, "object has own getInterface implementation");
		var oIntf2 = this.oNewClassInstance.getInterface();
		assert.ok(oIntf1 === oIntf2, "stable interface");
		for (var m in oIntf1) {
			if (typeof oIntf1[m] === "function") {
				assert.ok(this.oNewClassInstance.getMetadata().getAllPublicMethods().indexOf(m) >= 0, "interface has only functions from the list");
				// TODO the following tests only work for methods that have stable results and that don't require arguments
				var r1 = this.oNewClassInstance[m]();
				var r2 = oIntf1[m]();
				assert.strictEqual(r2, r1, "same values returned");
			}
		}
	});

	QUnit.test("GetMetadata", function(assert) {
		assert.ok(this.oNewClassInstance.getMetadata() != false, "metadata available");
		assert.ok(this.oNewSubClassInstance.getMetadata() != false, "metadata available");
	});

	QUnit.test("BaseTypeSet", function(assert) {
		assert.ok(this.oNewClassInstance.getMetadata().getParent() != false, "basetype set");
		assert.strictEqual("sap.ui.base.Object", this.oNewClassInstance.getMetadata().getParent().getName(), "basetype as expected");
		assert.ok(this.oNewSubClassInstance.getMetadata().getParent() != false, "basetype set");
		assert.strictEqual(this.oNewClassInstance.getMetadata(), this.oNewSubClassInstance.getMetadata().getParent(), "basetype as expected");
	});

	QUnit.test("PublicMethods", function(assert) {
		assertArrayEquals("public methods", assert, this.oNewClassInstance.getMetadata().getPublicMethods(), ["method1"]);
		assertArrayEquals("public methods", assert, this.oNewClassInstance.getMetadata().getAllPublicMethods(), ["method1"]);
		assertArrayEquals("public methods", assert, this.oNewSubClassInstance.getMetadata().getPublicMethods(), ["method2"]);
		assertArrayEquals("public methods", assert, this.oNewSubClassInstance.getMetadata().getAllPublicMethods(), ["method1", "method2"]);
	});

	QUnit.test("Interfaces", function(assert) {
		assertArrayEquals("interfaces", assert, this.oNewClassInstance.getMetadata().getInterfaces(), ["sap.test.MyInterface", "sap.ui.base.Poolable"]);
		assert.ok(this.oNewClassInstance.getMetadata().isInstanceOf("sap.ui.base.Poolable"), "isInstanceOf");
		assert.ok(this.oNewClassInstance.getMetadata().isInstanceOf("sap.test.MyInterface"), "isInstanceOf");
		assert.ok(!this.oNewClassInstance.getMetadata().isInstanceOf("sap.ui.base.PureImagination"), "isInstanceOf");
		assertArrayEquals("interfaces", assert, this.oNewSubClassInstance.getMetadata().getInterfaces(), ["sap.ui.base.Cacheable", "sap.ui.base.Poolable"]);
		assert.ok(this.oNewSubClassInstance.getMetadata().isInstanceOf("sap.ui.base.Cacheable"), "isInstanceOf");
		assert.ok(this.oNewSubClassInstance.getMetadata().isInstanceOf("sap.ui.base.Poolable"), "isInstanceOf");
		assert.ok(this.oNewSubClassInstance.getMetadata().isInstanceOf("sap.test.MyInterface"), "isInstanceOf");
	});

	QUnit.test("isA instance method", function(assert) {
		var oIcon = new Icon();
		assert.strictEqual(oIcon.isA("sap.ui.core.Icon"), true, "self test: instance is a sap.ui.core.Icon");
		assert.strictEqual(oIcon.isA("sap.ui.base.ManagedObject"), true, "inheritance: instance is a ManagedObject");
		assert.strictEqual(oIcon.isA("sap.ui.base.Object"), true, "inheritance: instance is a BaseObject");
		assert.strictEqual(oIcon.isA([
			"sap.ui.core.Icon",
			"sap.ui.base.ManagedObject"
		]), true, "multiple: instance is a sap.ui.core.Icon or ManagedObject");
		assert.strictEqual(oIcon.isA([
			"sap.test.pony",
			"sap.ui.base.ManagedObject"
		]), true, "multiple: instance is a 'sap.test.pony' (doesn't exist) or ManagedObject");

		assert.strictEqual(oIcon.isA("sap.ui.core.HTML"), false, "Icon is not HTML");
		assert.strictEqual(oIcon.isA(null), false, "null check");
		assert.strictEqual(oIcon.isA(""), false, "'' check");
		assert.strictEqual(oIcon.isA(0), false, "number check");
		assert.strictEqual(oIcon.isA(NaN), false, "NaN check");
		assert.strictEqual(oIcon.isA(), false, "undefined check");
		assert.strictEqual(oIcon.isA([
			null,
			undefined,
			"",
			0,
			NaN
		]), false, "multiple: invalid input");

		assert.strictEqual(oIcon.isA([
			"sap.test.pony",
			"sap.test.rainbow"
		]), false, "multiple: instance is not 'sap.test.pony' or 'sap.test.rainbow'");

		var oTest1 = new sap.test.NewClass();
		assert.strictEqual(oTest1.isA("sap.test.NewClass"), true, "self test: instance is a sap.test.NewClass");
		assert.strictEqual(oTest1.isA("sap.test.MyInterface"), true, "self test: instance implements interface sap.test.MyInterface");
		assert.strictEqual(oTest1.isA("sap.ui.base.Cacheable"), false, "self test: instance does not implement interface sap.ui.base.Cacheable");

		var oTest2 = new sap.test.NewSubClass();
		assert.strictEqual(oTest2.isA("sap.test.NewSubClass"), true, "self test: instance is a sap.test.NewSubClass");
		assert.strictEqual(oTest2.isA("sap.test.NewClass"), true, "inheritance: instance is a sap.test.NewClass");
		assert.strictEqual(oTest2.isA("sap.test.MyInterface"), true, "self test: instance implements interface sap.test.MyInterface");
		assert.strictEqual(oTest2.isA("sap.ui.base.Cacheable"), true, "self test: instance implements interface sap.ui.base.Cacheable");
		assert.strictEqual(oTest2.isA("sap.ui.base.Poolable"), true, "self test: instance implements interface sap.ui.base.Poolable");
	});

	QUnit.test("isA static function", function(assert) {
		var oIcon = new Icon();
		assert.strictEqual(BaseObject.isA(oIcon, "sap.ui.core.Icon"), true, "self test: instance is a sap.ui.core.Icon");
		assert.strictEqual(BaseObject.isA(oIcon, "sap.ui.base.ManagedObject"), true, "inheritance: instance is a ManagedObject");
		assert.strictEqual(BaseObject.isA(oIcon, "sap.ui.base.Object"), true, "inheritance: instance is a BaseObject");
		assert.strictEqual(BaseObject.isA(oIcon, [
			"sap.ui.base.Object",
			"sap.test.rainbow"
		]), true, "multiple: instance is a 'sap.test.rainbow' (doesn't exist) or BaseObject");

		assert.strictEqual(BaseObject.isA(oIcon, "sap.ui.core.HTML"), false, "Icon is not HTML");
		assert.strictEqual(BaseObject.isA(oIcon, null), false, "null check");
		assert.strictEqual(BaseObject.isA(oIcon, ""), false, "'' check");
		assert.strictEqual(BaseObject.isA(oIcon), false, "undefined check");
		assert.strictEqual(BaseObject.isA(oIcon), false, "undefined check");
		assert.strictEqual(BaseObject.isA(oIcon, [
			"sap.test.pony",
			"sap.test.rainbow"
		]), false, "multiple: instance is not 'sap.test.pony' or 'sap.test.rainbow'");

		var MyClass = function() {};
		MyClass.prototype.isA = function() {
			assert.ok(false, "Custom 'isA' method should not be called");
		};
		var oMyObject = new MyClass();
		assert.strictEqual(BaseObject.isA(oMyObject, "sap.ui.base.Object"), false, "MyClass is not BaseObject");
		assert.strictEqual(BaseObject.isA({}, "sap.ui.base.Object"), false, "Plain Object is not BaseObject");
		assert.strictEqual(BaseObject.isA(null, "sap.ui.base.Object"), false, "null is not BaseObject");
		assert.strictEqual(BaseObject.isA(undefined, "sap.ui.base.Object"), false, "undefined is not BaseObject");
		assert.strictEqual(BaseObject.isA(NaN, "sap.ui.base.Object"), false, "NaN is not BaseObject");
		assert.strictEqual(BaseObject.isA("", "sap.ui.base.Object"), false, "Empty string is not BaseObject");
	});
});
