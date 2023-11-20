/* global QUnit, sinon */
sap.ui.define(["sap/ui/base/ManagedObjectRegistry", "sap/ui/base/ManagedObject", "sap/ui/core/Element", "sap/ui/core/Component"],
	function (ManagedObjectRegistry, ManagedObject, Element, Component) {
		"use strict";

		function createInstance(aInstanceId, FNClass) {
			var aInstance = [];
			var sTimeStamp = Date.now().toString(); // Ensure that ids are unique
			aInstanceId.forEach(function (sId) {
				aInstance.push(new FNClass(sId + sTimeStamp));
			});
			return aInstance;
		}

		function destroyInstance(aInstance) {
			aInstance.forEach(function (oInstance) {
				oInstance.destroy();
			});
		}

		QUnit.module("ManagedObjectRegistry (Happy Path)");

		QUnit.test("Should mixin object", function (assert) {
			var Foo = ManagedObject.extend("Foo", {
				constructor: function () {
					ManagedObject.apply(this, arguments);
				}
			});

			ManagedObjectRegistry.apply(Foo);

			assert.ok(Foo.prototype.register, "Has register prototype function");
			assert.ok(Foo.prototype.deregister, "Has deregister prototype function");
			assert.ok(Foo.hasOwnProperty("registry"), "Extended object has static property \"registry\"");
		});

		QUnit.test("Construction and destruction", function (assert) {
			var aInstanceId = ["A", "B", "C"];
			var Foo = ManagedObject.extend("Foo", {
				constructor: function () {
					ManagedObject.apply(this, arguments);
				}
			});
			ManagedObjectRegistry.apply(Foo);

			var aInstance = createInstance(aInstanceId, Foo);
			assert.equal(Foo.registry.size, 3, "3 instances added");
			destroyInstance(aInstance);
			assert.equal(Foo.registry.size, 0, "3 instances removed");
		});

		QUnit.test("Should retrieve added instances as copy", function (assert) {
			var Foo = ManagedObject.extend("Foo", {
				constructor: function () {
					ManagedObject.apply(this, arguments);
				}
			});

			ManagedObjectRegistry.apply(Foo);

			var oFoo = new Foo("A");

			var mElementsInRegistry = Foo.registry.all();
			assert.equal(Object.keys(mElementsInRegistry).length, 1, "Contains 1 instance in map");
			assert.equal(Object.getPrototypeOf(mElementsInRegistry), null, "Retrieved object contains no prototype functions");

			oFoo.destroy();
		});

		QUnit.test("Should retrieve instance by id", function (assert) {
			var Foo = ManagedObject.extend("Foo", {
				constructor: function () {
					ManagedObject.apply(this, arguments);
				}
			});

			ManagedObjectRegistry.apply(Foo);

			var oFoo1 = new Foo("A");
			var oFoo2 = new Foo("B");

			assert.ok(Foo.registry.get("B"), "Retrieves instance with id B");
			destroyInstance([oFoo1, oFoo2]);
		});

		QUnit.test("Should execute callback for all instances", function (assert) {
			var Foo = ManagedObject.extend("Foo", {
				constructor: function () {
					ManagedObject.apply(this, arguments);
				}
			});

			ManagedObjectRegistry.apply(Foo);
			var aCallbackCallee = [];
			var oFoo1 = new Foo("A");
			var oFoo2 = new Foo("B");
			var oFoo3 = new Foo("C");

			var fnCallback = function(oInstance, sId) {
				aCallbackCallee.push(oInstance);
			};
			var fnCallbackSpy = sinon.spy(fnCallback);

			Foo.registry.forEach(fnCallbackSpy);
			assert.equal(fnCallbackSpy.callCount, 3, "Executed callback 3 times");
			assert.ok(aCallbackCallee.indexOf(oFoo1) !== -1, "Executed callback for oFoo1");
			assert.ok(aCallbackCallee.indexOf(oFoo2) !== -1, "Executed callback for oFoo2");
			assert.ok(aCallbackCallee.indexOf(oFoo3) !== -1, "Executed callback for oFoo3");

			destroyInstance([oFoo1, oFoo2, oFoo3]);
		});

		QUnit.module("ManagedObjectRegistry (Sad Path)");

		QUnit.test("Should ensure that static registry property is immutable", function (assert) {
			var Foo = ManagedObject.extend("Foo", {
				constructor: function () {
					ManagedObject.apply(this, arguments);
				}
			});
			ManagedObjectRegistry.apply(Foo);

			assert.throws(function () {
				Foo.registry.mutator = null;
			}, "Throw on mutation");
		});


		QUnit.test("Should ensure that extended function is subclass of ManagedObject", function (assert) {
			assert.throws(function () {
				ManagedObjectRegistry.apply(function Foo() { });
			}, new TypeError("ManagedObjectRegistry mixin can only be applied to subclasses of sap.ui.base.ManagedObject"),
				"throws because function is not subclass of ManagedObject");
		});

		QUnit.test("Should throw when object with same id is added", function (assert) {
			var Foo = ManagedObject.extend("Foo", {
				constructor: function () {
					ManagedObject.apply(this, arguments);
				}
			});
			ManagedObjectRegistry.apply(Foo);

			assert.throws(function () {
				new Foo("A");
				new Foo("A");
			}, new Error("Error: adding object \"object\" with duplicate id 'A'"), "Same ids are not allowed");
		});

	});