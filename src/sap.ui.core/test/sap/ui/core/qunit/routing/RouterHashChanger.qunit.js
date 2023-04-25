/*global QUnit, sinon */
sap.ui.define([
	"sap/base/Log",
	"sap/ui/core/routing/HashChanger",
	"sap/ui/core/routing/RouterHashChanger",
	"sap/ui/thirdparty/hasher"
], function (Log, HashChanger, RouterHashChanger, hasher) {
	"use strict";


	QUnit.module("RouterHashChanger Lifecycle");

	QUnit.test("constructor - invalid", function (assert) {
		assert.throws(function()  {
			new RouterHashChanger();
		}, "invalid constructor should throw an error");
	});

	QUnit.test("constructor - with parent", function (assert) {
		var oRHC = new RouterHashChanger({
			parent: HashChanger.getInstance(),
			hash: "initialHash",
			subHashMap: {
				foo: "bar"
			}
		});

		assert.ok(oRHC instanceof RouterHashChanger, "valid constructor result should be a RouterHashChanger");
		assert.ok(oRHC.getHash(), "initialHash", "The initial hash is set");
		assert.equal(oRHC.subHashMap.foo, "bar", "The subHashMap is set");
		oRHC.destroy();
	});

	QUnit.test("init", function(assert) {
		var oHashChanger = HashChanger.getInstance();
		var oRHC = new RouterHashChanger({
			parent: oHashChanger
		});

		var oInitSpy = sinon.spy(oHashChanger, "init");
		oRHC.init();
		assert.equal(oInitSpy.callCount, 1, "The init call is forwarded to parent");
		oRHC.destroy();
		oHashChanger.destroy();
	});

	QUnit.test("destroy", function(assert) {
		var oRHC = new RouterHashChanger({
			parent: HashChanger.getInstance(),
			hash: "initialHash",
			subHashMap: {}
		});
		oRHC.destroy();
		assert.strictEqual(oRHC.children, undefined, "deleted children");
		assert.strictEqual(oRHC.hash, undefined, "deleted hash");
		assert.strictEqual(oRHC.parent, undefined, "deleted parent");
		assert.strictEqual(oRHC.subHashMap, undefined, "deleted subHashMap");
		assert.strictEqual(HashChanger.getInstance()._oRouterHashChanger, undefined, "The RouterHashChanger is removed from the HashChanger");
	});

	QUnit.test("destroy - with children", function(assert) {
		var oRHC = new RouterHashChanger({
			parent: HashChanger.getInstance()
		});
		var oRHCChild = oRHC.createSubHashChanger("foo");
		var oRHCGrandChild = oRHCChild.createSubHashChanger("bar");
		var oDestroySpy = sinon.spy(RouterHashChanger.prototype, "destroy");
		oRHC.destroy();
		assert.ok(oDestroySpy.calledOn(oRHC), "RouterHashChanger destroyed");
		assert.ok(oDestroySpy.calledOn(oRHCChild), "Child destroyed");
		assert.ok(oDestroySpy.calledOn(oRHCGrandChild), "Grandchild destroyed");
		oDestroySpy.restore();
	});

	QUnit.test("destroy - with children should deregister the child from parent", function(assert) {
		var oRHC = new RouterHashChanger({
			parent: HashChanger.getInstance()
		});
		var oRHCChild = oRHC.createSubHashChanger("foo");
		var oRHCGrandChild = oRHCChild.createSubHashChanger("bar");
		var oDestroySpy = sinon.spy(RouterHashChanger.prototype, "destroy");
		oRHCChild.destroy();
		assert.ok(oDestroySpy.calledOn(oRHCChild), "Child destroyed");
		assert.ok(oDestroySpy.calledOn(oRHCGrandChild), "Grandchild destroyed");
		assert.strictEqual(oRHC.children.foo, undefined, "The destroyed child is removed from its parent");
		oDestroySpy.restore();
	});

	QUnit.module("RouterHashChanger API", {
		beforeEach: function() {
			this.oRHC = new RouterHashChanger({
				parent: HashChanger.getInstance()
			});
		},
		afterEach: function() {
			this.oRHC.destroy();
		}
	});

	QUnit.test("_hasRouterAttached", function(assert) {
		assert.equal(this.oRHC._hasRouterAttached(), false, "There's no router attached initially");

		this.oRHC.attachEvent("hashChanged", function(){});

		assert.equal(this.oRHC._hasRouterAttached(), true, "There's router attached");
	});

	QUnit.test("getHash", function (assert) {
		assert.strictEqual(this.oRHC.getHash(), "", "intial hash is empty string");
	});

	QUnit.test("call setHash", function(assert) {
		var sHash, aChildPrefixes,
			iCount = 0,
			fnHashSet = function(oEvent) {
				iCount++;
				sHash = oEvent.getParameter("hash");
				aChildPrefixes = oEvent.getParameter("deletePrefix");
			};

		this.oRHC.attachEvent("hashSet", fnHashSet);

		this.oRHC.setHash("newHash");

		assert.equal(iCount, 1, "hashSet event is fired");
		assert.equal(sHash, "newHash", "The correct hash parameter is set in the event");
		assert.deepEqual(aChildPrefixes, [], "child prefix is an empty array");
	});

	QUnit.test("setHash called with collecting nested hash changes", function(assert) {
		var sHash, aChildPrefixes, aNestedHashInfo,
			iCount = 0,
			fnHashSet = function(oEvent) {
				iCount++;
				sHash = oEvent.getParameter("hash");
				aChildPrefixes = oEvent.getParameter("deletePrefix");
				aNestedHashInfo = oEvent.getParameter("nestedHashInfo");
			};

		this.oRHC.attachEvent("hashSet", fnHashSet);

		var oNestedRHC = this.oRHC.createSubHashChanger("nested");
		oNestedRHC.attachEvent("hashChanged", function() {});

		return this.oRHC.setHash("newHash", new Promise(function(resolve, reject) {
			Promise.resolve().then(function() {
				var sHash = oNestedRHC.getHash();
				assert.equal(typeof sHash, "string", "The invalid hash should still have type 'string'");
				assert.strictEqual(sHash, RouterHashChanger.InvalidHash, "The nested RouterHashChanger should return InvalidHash marker during its parent is still in collect mode");

				oNestedRHC.setHash("nestedHash");
				resolve();
			});
		})).then(function() {
			assert.equal(iCount, 1, "hashSet event is fired");
			assert.equal(sHash, "newHash", "The correct hash parameter is set in the event");
			assert.deepEqual(aChildPrefixes, ["nested"], "child prefix is collected");
			assert.equal(aNestedHashInfo.length, 1, "nested hash info is provided");
			assert.equal(aNestedHashInfo[0].key, "nested", "nested hash info is correct");
			assert.equal(aNestedHashInfo[0].hash, "nestedHash", "nested hash info is correct");
			assert.deepEqual(aNestedHashInfo[0].deletePrefix, [], "nested hash info is correct");
		});
	});

	QUnit.test("setHash called with collecting nested hash changes (suppress active hash collection)", function(assert) {
		var sHash, aChildPrefixes, aNestedHashInfo,
			iCount = 0,
			fnHashSet = function(oEvent) {
				iCount++;
				sHash = oEvent.getParameter("hash");
				aChildPrefixes = oEvent.getParameter("deletePrefix");
				aNestedHashInfo = oEvent.getParameter("nestedHashInfo");
			};

		this.oRHC.attachEvent("hashSet", fnHashSet);

		var oNestedRHC = this.oRHC.createSubHashChanger("nested");
		oNestedRHC.attachEvent("hashChanged", function() {});

		return this.oRHC.setHash("newHash", new Promise(function(resolve, reject) {
			Promise.resolve().then(function() {
				oNestedRHC.setHash("nestedHash");
				resolve();
			});
		}), /* suppress active prefix collection */true).then(function() {
			assert.equal(iCount, 1, "hashSet event is fired");
			assert.equal(sHash, "newHash", "The correct hash parameter is set in the event");
			assert.strictEqual(aChildPrefixes, undefined, "child prefix is undefined when active prefix collection is suppressed");
			assert.equal(aNestedHashInfo.length, 1, "nested hash info is provided");
			assert.equal(aNestedHashInfo[0].key, "nested", "nested hash info is correct");
			assert.equal(aNestedHashInfo[0].hash, "nestedHash", "nested hash info is correct");
			assert.deepEqual(aNestedHashInfo[0].deletePrefix, [], "nested hash info is correct");
		});
	});

	QUnit.test("call replaceHash", function(assert) {
		var sHash, aChildPrefixes,
			iCount = 0,
			fnHashReplaced = function(oEvent) {
				iCount++;
				sHash = oEvent.getParameter("hash");
				aChildPrefixes = oEvent.getParameter("deletePrefix");
			};

		this.oRHC.attachEvent("hashReplaced", fnHashReplaced);

		this.oRHC.replaceHash("newHash");

		assert.equal(iCount, 1, "hashReplaced event is fired");
		assert.equal(sHash, "newHash", "The correct hash parameter is set in the event");
		assert.deepEqual(aChildPrefixes, [], "child prefix is an empty array");
	});

	QUnit.test("replaceHash called with collecting nested hash changes", function(assert) {
		var sHash, aChildPrefixes, aNestedHashInfo,
			iCount = 0,
			fnHashReplaced = function(oEvent) {
				iCount++;
				sHash = oEvent.getParameter("hash");
				aChildPrefixes = oEvent.getParameter("deletePrefix");
				aNestedHashInfo = oEvent.getParameter("nestedHashInfo");
			};

		this.oRHC.attachEvent("hashReplaced", fnHashReplaced);

		var oNestedRHC = this.oRHC.createSubHashChanger("nested");
		oNestedRHC.attachEvent("hashChanged", function() {});

		return this.oRHC.replaceHash("newHash", new Promise(function(resolve, reject) {
			Promise.resolve().then(function() {
				oNestedRHC.setHash("nestedHash");
				resolve();
			});
		})).then(function() {
			assert.equal(iCount, 1, "hashReplace event is fired");
			assert.equal(sHash, "newHash", "The correct hash parameter is set in the event");
			assert.deepEqual(aChildPrefixes, ["nested"], "child prefix is collected");
			assert.equal(aNestedHashInfo.length, 1, "nested hash info is provided");
			assert.equal(aNestedHashInfo[0].key, "nested", "nested hash info is correct");
			assert.equal(aNestedHashInfo[0].hash, "nestedHash", "nested hash info is correct");
			assert.deepEqual(aNestedHashInfo[0].deletePrefix, [], "nested hash info is correct");
		});
	});

	QUnit.test("replaceHash called with collecting nested hash changes (suppress active prefix collection)", function(assert) {
		var sHash, aChildPrefixes, aNestedHashInfo,
			iCount = 0,
			fnHashReplaced = function(oEvent) {
				iCount++;
				sHash = oEvent.getParameter("hash");
				aChildPrefixes = oEvent.getParameter("deletePrefix");
				aNestedHashInfo = oEvent.getParameter("nestedHashInfo");
			};

		this.oRHC.attachEvent("hashReplaced", fnHashReplaced);

		var oNestedRHC = this.oRHC.createSubHashChanger("nested");
		oNestedRHC.attachEvent("hashChanged", function() {});

		return this.oRHC.replaceHash("newHash", new Promise(function(resolve, reject) {
			Promise.resolve().then(function() {
				oNestedRHC.setHash("nestedHash");
				resolve();
			});
		}), /* suppress active prefix collection */true).then(function() {
			assert.equal(iCount, 1, "hashReplace event is fired");
			assert.equal(sHash, "newHash", "The correct hash parameter is set in the event");
			assert.strictEqual(aChildPrefixes, undefined, "child prefix is undefined when active prefix collection is suppressed");
			assert.equal(aNestedHashInfo.length, 1, "nested hash info is provided");
			assert.equal(aNestedHashInfo[0].key, "nested", "nested hash info is correct");
			assert.equal(aNestedHashInfo[0].hash, "nestedHash", "nested hash info is correct");
			assert.deepEqual(aNestedHashInfo[0].deletePrefix, [], "nested hash info is correct");
		});
	});

	QUnit.test("fireHashChanged", function(assert) {
		var oHashChangedSpy = this.spy();
		this.oRHC.attachEvent("hashChanged", oHashChangedSpy);
		this.oRHC.fireHashChanged("hash");
		assert.equal(oHashChangedSpy.callCount, 1, "event was fired once");
		assert.strictEqual(oHashChangedSpy.args[0][0].getParameter("newHash"), "hash", "new hash is passed");
		assert.strictEqual(oHashChangedSpy.args[0][0].getParameter("oldHash"), "", "old hash is undefined");
	});

	QUnit.test("#createSubHashChanger", function(assert) {
		assert.strictEqual(this.oRHC.children, undefined, "initial child registry is empty");
		var oSubRHC = this.oRHC.createSubHashChanger("foo");
		assert.equal(this.oRHC.children["foo"], oSubRHC, "child is registered to parent");
		assert.ok(oSubRHC.hasListeners("hashSet"), "hashSet listener is set");
		assert.ok(oSubRHC.hasListeners("hashReplaced"),"hashReplaced listener is set");
		assert.strictEqual(oSubRHC.hash, "", "initial hash of SubHashChanger is empty");

		var oSubRHCDuplicate = this.oRHC.createSubHashChanger("foo");
		assert.strictEqual(oSubRHCDuplicate, oSubRHC, "The same instance should be returned for the same prefix");

		oSubRHC.destroy();
	});

	QUnit.module("RouterHashChanger SubHashChanger", {
		beforeEach: function(assert) {
			hasher.setHash("");

			this.oRHC = HashChanger.getInstance().createRouterHashChanger();
			this.oChildRHC1 = this.oRHC.createSubHashChanger("foo");
			this.oChildRHC2 = this.oRHC.createSubHashChanger("bar");
			this.oGrandChildRHC1 = this.oChildRHC1.createSubHashChanger("child1");
			this.oGrandChildRHC2 = this.oChildRHC1.createSubHashChanger("child2");

			this.oRootHashSetSpy = sinon.spy();
			this.oRHC.attachEvent("hashSet", this.oRootHashSetSpy);
			this.oRootHashReplacedSpy = sinon.spy();
			this.oRHC.attachEvent("hashReplaced", this.oRootHashReplacedSpy);

			this.oChild1HashSetSpy = sinon.spy();
			this.oChildRHC1.attachEvent("hashSet", this.oChild1HashSetSpy);
			this.oChild1HashReplacedSpy = sinon.spy();
			this.oChildRHC1.attachEvent("hashReplaced", this.oChild1HashReplacedSpy);

			this.oChild2HashSetSpy = sinon.spy();
			this.oChildRHC2.attachEvent("hashSet", this.oChild2HashSetSpy);
			this.oChild2HashReplacedSpy = sinon.spy();
			this.oChildRHC2.attachEvent("hashReplaced", this.oChild2HashReplacedSpy);

			this.oGrandChild1HashSetSpy = sinon.spy();
			this.oGrandChildRHC1.attachEvent("hashSet", this.oGrandChild1HashSetSpy);
			this.oGrandChild1HashReplacedSpy = sinon.spy();
			this.oGrandChildRHC1.attachEvent("hashReplaced", this.oGrandChild1HashReplacedSpy);

			this.oGrandChild2HashSetSpy = sinon.spy();
			this.oGrandChildRHC2.attachEvent("hashSet", this.oGrandChild2HashSetSpy);
			this.oGrandChild2HashReplacedSpy = sinon.spy();
			this.oGrandChildRHC2.attachEvent("hashReplaced", this.oGrandChild2HashReplacedSpy);


			this.oChild1HashChangedSpy = sinon.spy();
			this.oChildRHC1.attachEvent("hashChanged", this.oChild1HashChangedSpy);

			this.oGrandChild1HashChangedSpy = sinon.spy();
			this.oGrandChildRHC1.attachEvent("hashChanged", this.oGrandChild1HashChangedSpy);

			this.oGrandChild2HashChangedSpy = sinon.spy();
			this.oGrandChildRHC2.attachEvent("hashChanged", this.oGrandChild2HashChangedSpy);
		},
		afterEach: function(assert) {
			this.oGrandChildRHC2.destroy();
			this.oGrandChildRHC1.destroy();
			this.oChildRHC1.destroy();
			this.oChildRHC2.destroy();
			this.oRHC.destroy();
		}
	});

	QUnit.test("Prefixed key", function(assert) {
		assert.strictEqual(this.oRHC.key, "", "The top level RouterHashChanger has an empty string key");
		assert.strictEqual(this.oChildRHC1.key, "foo", "The child RouterHashChanger has correct key set");
		assert.strictEqual(this.oChildRHC2.key, "bar", "The child RouterHashChanger has correct key set");
		assert.strictEqual(this.oGrandChildRHC1.key, "foo-child1", "The grand child RouterHashChanger has correct key set");
		assert.strictEqual(this.oGrandChildRHC2.key, "foo-child2", "The grand child RouterHashChanger has correct key set");
	});

	QUnit.test("Browser hash changed", function(assert) {
		var oHashChanger = HashChanger.getInstance();
		var sHash = "rootHash&/foo/fooHash/fooHash1&/foo-child2/foo.child2/foo.child2Hash";
		var oRHCHashChangedSpy = sinon.spy();
		var oChild2HashChangedSpy = sinon.spy();

		this.oRHC.attachEvent("hashChanged", oRHCHashChangedSpy);
		this.oChildRHC2.attachEvent("hashChanged", oChild2HashChangedSpy);
		oHashChanger.fireHashChanged(sHash);

		assert.equal(oRHCHashChangedSpy.callCount, 1, "hashChange event is fired on oRHC");
		assert.equal(oRHCHashChangedSpy.args[0][0].getParameter("newHash"), "rootHash", "The correct hash is passed");
		assert.equal(this.oChild1HashChangedSpy.callCount, 1, "hashChange event is fired on oChildRHC1");
		assert.equal(this.oChild1HashChangedSpy.args[0][0].getParameter("newHash"), "fooHash/fooHash1", "The correct hash is passed");
		assert.equal(oChild2HashChangedSpy.callCount, 0, "no hashChange event is fired on oChildRHC2 because the RouterHashChanger already have empty string as default hash");
		assert.equal(this.oGrandChild1HashChangedSpy.callCount, 0, "no hashChange event is fired on oGrandChildRHC1 because the RouterHashChanger already have empty string as default hash");
		assert.equal(this.oGrandChild2HashChangedSpy.callCount, 1, "hashChange event is fired on oGrandChildRHC2 because the RouterHashChanger already have empty string as default hash");
		assert.equal(this.oGrandChild2HashChangedSpy.args[0][0].getParameter("newHash"), "foo.child2/foo.child2Hash", "The correct hash is passed");
	});

	QUnit.test("set hash on the grand child", function(assert) {
		this.oGrandChildRHC1.setHash("GrandChild1");
		assert.equal(this.oRootHashSetSpy.callCount, 1, "Root hash changer called");
		assert.equal(this.oChild1HashSetSpy.callCount, 1, "Child1 hash changer called");
		assert.equal(this.oGrandChild1HashSetSpy.callCount, 1, "GrandChild1 hash changer called");
		assert.equal(this.oGrandChild2HashSetSpy.callCount, 0, "GrandChild2 hash changer not called");
		assert.equal(this.oChild2HashSetSpy.callCount, 0, "Child 2 hash changer not called");
	});

	QUnit.test("set hash on the child", function(assert) {
		this.oChildRHC1.setHash("Child1");
		assert.equal(this.oRootHashSetSpy.callCount, 1, "Root hash changer called");
		assert.equal(this.oChild1HashSetSpy.callCount, 1, "Child1 hash changer called");
		assert.equal(this.oGrandChild1HashSetSpy.callCount, 0, "GrandChild1 hash changer called");
		assert.equal(this.oGrandChild2HashSetSpy.callCount, 0, "GrandChild2 hash changer not called");
		assert.equal(this.oChild2HashSetSpy.callCount, 0, "Child 2 hash changer not called");
	});

	QUnit.test("set hash on the child with collecting nested hash info", function(assert) {
		var oParentHashSetSpy = sinon.spy(),
			oChildHashSetSpy = sinon.spy(),
			oGrandChildHashSetSpy = sinon.spy(),
			that = this;

		this.oRHC.attachEvent("hashSet", oParentHashSetSpy);
		this.oChildRHC1.attachEvent("hashSet", oChildHashSetSpy);
		this.oGrandChildRHC1.attachEvent("hashSet", oGrandChildHashSetSpy);

		return this.oChildRHC1.setHash("Child1", new Promise(function(resolve, reject) {
			Promise.resolve().then(function() {
				that.oGrandChildRHC1.setHash("GrandChild1");
				resolve();
			});
		})).then(function() {
			assert.equal(oGrandChildHashSetSpy.callCount, 1, "hashSet event is not fired on the grand child router hash changer");

			assert.equal(oChildHashSetSpy.callCount, 1, "hashSet event is fired on the child router hash changer");
			assert.deepEqual(oChildHashSetSpy.getCall(0).args[0].getParameter("nestedHashInfo"), [{key: "foo-child1", hash: "GrandChild1", deletePrefix: []}]);

			assert.equal(oParentHashSetSpy.callCount, 1, "hashSet event is fired on the parent router hash changer");
			assert.deepEqual(oParentHashSetSpy.getCall(0).args[0].getParameter("nestedHashInfo"), [{key: "foo-child1", hash: "GrandChild1", deletePrefix: []}]);
		});
	});

	QUnit.test("delete prefix for one active child after setHash", function(assert) {
		this.oGrandChildRHC2.detachEvent("hashChanged", this.oGrandChild2HashChangedSpy);
		this.oChildRHC1.setHash("Child1");
		assert.equal(this.oChild1HashSetSpy.args[0][0].getParameter("deletePrefix").length, 1, "Child1 hash changer called");
		assert.equal(this.oChild1HashSetSpy.args[0][0].getParameter("deletePrefix")[0], "foo-child1", "Child1 hash changer called");
	});

	QUnit.test("delete prefix for children after setHash", function(assert) {
		this.oChildRHC1.setHash("Child1");
		assert.equal(this.oChild1HashSetSpy.args[0][0].getParameter("deletePrefix").length, 2, "Child1 hash changer called");
		assert.equal(this.oChild1HashSetSpy.args[0][0].getParameter("deletePrefix")[0], "foo-child1", "Child1 hash changer called");
		assert.equal(this.oChild1HashSetSpy.args[0][0].getParameter("deletePrefix")[1], "foo-child2", "Child1 hash changer called");
	});

	QUnit.test("replace hash on the grand child", function(assert) {
		this.oGrandChildRHC1.replaceHash("GrandChild1");
		assert.equal(this.oRootHashReplacedSpy.callCount, 1, "Root hash changer called");
		assert.equal(this.oChild1HashReplacedSpy.callCount, 1, "Child1 hash changer called");
		assert.equal(this.oGrandChild1HashReplacedSpy.callCount, 1, "GrandChild1 hash changer called");
		assert.equal(this.oGrandChild2HashReplacedSpy.callCount, 0, "GrandChild2 hash changer not called");
		assert.equal(this.oChild2HashReplacedSpy.callCount, 0, "Child 2 hash changer not called");
	});

	QUnit.test("replace hash on the child", function(assert) {
		this.oChildRHC1.replaceHash("Child1");
		assert.equal(this.oRootHashReplacedSpy.callCount, 1, "Root hash changer called");
		assert.equal(this.oChild1HashReplacedSpy.callCount, 1, "Child1 hash changer called");
		assert.equal(this.oGrandChild1HashReplacedSpy.callCount, 0, "GrandChild1 hash changer called");
		assert.equal(this.oGrandChild2HashReplacedSpy.callCount, 0, "GrandChild2 hash changer not called");
		assert.equal(this.oChild2HashReplacedSpy.callCount, 0, "Child 2 hash changer not called");
	});

	QUnit.test("delete prefix for one active child after replaceHash", function(assert) {
		this.oGrandChildRHC2.detachEvent("hashChanged", this.oGrandChild2HashChangedSpy);
		this.oChildRHC1.replaceHash("Child1");
		assert.equal(this.oChild1HashReplacedSpy.args[0][0].getParameter("deletePrefix").length, 1, "Child1 hash changer called");
		assert.equal(this.oChild1HashReplacedSpy.args[0][0].getParameter("deletePrefix")[0], "foo-child1", "Child1 hash changer called");
	});

	QUnit.test("delete prefix for children after replaceHash", function(assert) {
		this.oChildRHC1.replaceHash("Child1");
		assert.equal(this.oChild1HashReplacedSpy.args[0][0].getParameter("deletePrefix").length, 2, "Child1 hash changer called");
		assert.equal(this.oChild1HashReplacedSpy.args[0][0].getParameter("deletePrefix")[0], "foo-child1", "Child1 hash changer called");
		assert.equal(this.oChild1HashReplacedSpy.args[0][0].getParameter("deletePrefix")[1], "foo-child2", "Child1 hash changer called");
	});

	QUnit.test("fireHashChanged on SubHashChanger", function(assert) {
		this.oRHC.fireHashChanged("hash", {});

		assert.equal(this.oChild1HashChangedSpy.callCount, 0, "no hashChanged event is fired on the child hashChanger because the RouterHashChanger already have empty string as default hash");
		assert.equal(this.oGrandChild1HashChangedSpy.callCount, 0, "no hashChanged event is fired on the grand child hashChanger because the RouterHashChanger already have empty string as default hash");
		assert.equal(this.oGrandChild2HashChangedSpy.callCount, 0, "no hashChanged event is fired on the grand child hashChanger because the RouterHashChanger already have empty string as default hash");
	});

	QUnit.test("fireHashChanged on SubHashChanger with subhash", function(assert) {
		this.oRHC.fireHashChanged("hash", {"foo": "subhash"});

		assert.equal(this.oChild1HashChangedSpy.callCount, 1, "hashChanged event is fired on the child hashChanger");
		assert.equal(this.oGrandChild1HashChangedSpy.callCount, 0, "no hashChanged event is fired on the grand child hashChanger because the RouterHashChanger already have empty string as default hash");
		assert.equal(this.oGrandChild2HashChangedSpy.callCount, 0, "hashChanged event is fired on the grand child hashChanger because the RouterHashChanger already have empty string as default hash");
		assert.equal(this.oChild1HashChangedSpy.args[0][0].getParameter("newHash"), "subhash", "Child1 hashChanged fired");
	});

	QUnit.test("fireHashChanged on SubHashChanger with subhashes on nested level", function(assert) {
		this.oRHC.fireHashChanged("hash", {"foo": "subhash", "foo-child1": "subhash.foo"});

		assert.equal(this.oChild1HashChangedSpy.callCount, 1, "hashChanged event is fired on the child hashChanger");
		assert.equal(this.oGrandChild1HashChangedSpy.callCount, 1, "hashChanged event is fired on the grand child hashChanger");
		assert.equal(this.oGrandChild2HashChangedSpy.callCount, 0, "no hashChanged event is fired on the grand child hashChanger because the RouterHashChanger already have empty string as default hash");
		assert.equal(this.oChild1HashChangedSpy.args[0][0].getParameter("newHash"), "subhash", "Child1 hashChanged fired");
		assert.equal(this.oGrandChild1HashChangedSpy.args[0][0].getParameter("newHash"), "subhash.foo", "Grand Child1 hashChanged fired");
	});
});
