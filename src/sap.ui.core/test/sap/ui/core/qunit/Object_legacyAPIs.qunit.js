/* global QUnit */
sap.ui.define([
	"sap/ui/base/Object",
	"sap/ui/core/Icon",
	"sap/base/util/ObjectPath"
], function(BaseObject, Icon, ObjectPath) {
	"use strict";

	function testsuite(caption, TestClass, sTestClassName, TestSubClass, sTestSubClassName) {

		QUnit.module(caption, {
			beforeEach: function() {
				this.oObject = new BaseObject();
				this.oNewClassInstance = new TestClass(42);
				this.oNewSubClassInstance = new TestSubClass();
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
			assert.strictEqual(this.oNewClassInstance.getMetadata().getParent().getName(), "sap.ui.base.Object", "basetype as expected");
			assert.ok(this.oNewSubClassInstance.getMetadata().getParent() != false, "basetype set");
			assert.strictEqual(this.oNewSubClassInstance.getMetadata().getParent(), this.oNewClassInstance.getMetadata(), "basetype as expected");
		});

		QUnit.test("PublicMethods", function(assert) {
			assert.deepEqual(this.oNewClassInstance.getMetadata().getPublicMethods(), ["method1"], "public methods");
			assert.deepEqual(this.oNewClassInstance.getMetadata().getAllPublicMethods(), ["method1"], "public methods");
			assert.deepEqual(this.oNewSubClassInstance.getMetadata().getPublicMethods(), ["method2"], "public methods");
			assert.deepEqual(this.oNewSubClassInstance.getMetadata().getAllPublicMethods(), ["method1", "method2"], "public methods");
		});

		QUnit.test("Interfaces", function(assert) {
			assert.deepEqual(this.oNewClassInstance.getMetadata().getInterfaces(), ["sap.test.MyInterface", "sap.ui.base.Poolable"], "interfaces");
			assert.ok(this.oNewClassInstance.getMetadata().isInstanceOf("sap.ui.base.Poolable"), "isInstanceOf");
			assert.ok(this.oNewClassInstance.getMetadata().isInstanceOf("sap.test.MyInterface"), "isInstanceOf");
			assert.ok(!this.oNewClassInstance.getMetadata().isInstanceOf("sap.ui.base.PureImagination"), "isInstanceOf");
			assert.deepEqual(this.oNewSubClassInstance.getMetadata().getInterfaces(), ["sap.ui.base.Cacheable", "sap.ui.base.Poolable"], "interfaces");
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

			var oTest1 = new TestClass();
			assert.strictEqual(oTest1.isA(sTestClassName), true, "self test: instance is a " + sTestClassName);
			assert.strictEqual(oTest1.isA("sap.test.MyInterface"), true, "self test: instance implements interface sap.test.MyInterface");
			assert.strictEqual(oTest1.isA("sap.ui.base.Cacheable"), false, "self test: instance does not implement interface sap.ui.base.Cacheable");

			var oTest2 = new TestSubClass();
			assert.strictEqual(oTest2.isA(sTestSubClassName), true, "self test: instance is a " + sTestSubClassName);
			assert.strictEqual(oTest2.isA(sTestClassName), true, "inheritance: instance is a " + sTestClassName);
			assert.strictEqual(oTest2.isA("sap.test.MyInterface"), true, "self test: instance implements interface sap.test.MyInterface");
			assert.strictEqual(oTest2.isA("sap.ui.base.Cacheable"), true, "self test: instance implements interface sap.ui.base.Cacheable");
			assert.strictEqual(oTest2.isA("sap.ui.base.Poolable"), true, "self test: instance implements interface sap.ui.base.Poolable");
		});
	}




	ObjectPath.create("sap.test");

	var LegacyClass = sap.test.LegacyClass = function(v1) {
		this.value1 = v1;
	};
	LegacyClass.prototype = Object.create(BaseObject.prototype);
	BaseObject.defineClass("sap.test.LegacyClass", {
		baseType: "sap.ui.base.Object",
		interfaces: ["sap.ui.base.Poolable", "sap.test.MyInterface"],
		publicMethods: ["method1"]
	});
	LegacyClass.prototype.method1 = function() {
		return this.value1;
	};

	var LegacySubClass = sap.test.LegacySubClass = function(v1, v2) {
		LegacyClass.call(this, v1);
		this.value2 = v2;
	};
	LegacySubClass.prototype = Object.create(LegacyClass.prototype);
	BaseObject.defineClass("sap.test.LegacySubClass", {
		baseType: "sap.test.LegacyClass",
		interfaces: ["sap.ui.base.Cacheable", "sap.ui.base.Poolable"],
		publicMethods: ["method2"]
	});
	LegacySubClass.prototype.method2 = function() {
		return this.value2;
	};

	testsuite("Legacy Class Definition", LegacyClass, "sap.test.LegacyClass", LegacySubClass, "sap.test.LegacySubClass");
});
