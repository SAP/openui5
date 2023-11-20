/* global QUnit */

sap.ui.define(["jquery.sap.storage", "sap/ui/Device"], function(jQuery, Device) {
	"use strict";

	var SUPPORTED_CHECK_INACTIVE = 0;
	var SUPPORTED_CHECK_EXPECT_SUPPORT = 1;
	var SUPPORTED_CHECK_EXPECT_NO_SUPPORT = -1;

	function testStorage(assert, oStorage, sIdPrefix, iCheckSupported){
		var store = jQuery.sap.storage(oStorage, sIdPrefix);

		var type = jQuery.sap.storage.Type.session;
		if (typeof (oStorage) == "string"){
			type = oStorage;
		} else if (oStorage){
			if (oStorage.getType){
				type = oStorage.getType();
			} else {
				type = "unknown";
			}
		}

		assert.equal(type, store.getType(), "Storage is of requested type");

		var supported = store.isSupported();

		if (supported){
			if (iCheckSupported != SUPPORTED_CHECK_INACTIVE){
				assert.ok(iCheckSupported == SUPPORTED_CHECK_EXPECT_SUPPORT, "Store is supported as expected");
			}

			var val = store.get("testkey");
			assert.ok(!val, "Value initally not defined");

			var res = store.put("testkey", "testvalue");
			assert.ok(res, "put returns true when storage is supported");

			val = store.get("testkey");
			assert.equal(val, "testvalue", "Value correct after put");

			res = store.put("Testkey2", "testvalue2");
			val = store.get("Testkey2");
			assert.equal(val, "testvalue2", "Value correct after put");

			res = store.put("testkey3", "testvalue3");
			val = store.get("testkey3");
			assert.equal(val, "testvalue3", "Value correct after put");

			res = store.removeAll("Test");
			assert.ok(res, "removeAll returns true when storage is supported");

			val = store.get("testkey");
			assert.equal(val, "testvalue", "Value still there after removeAll");

			val = store.get("Testkey2");
			assert.ok(!val, "Value not there after removeAll");

			val = store.get("testkey3");
			assert.equal(val, "testvalue3", "Value still there after removeAll");

			res = store.remove("testkey3");
			assert.ok(res, "remove returns true when storage is supported");

			val = store.get("testkey3");
			assert.ok(!val, "Value not there after remove");

			val = store.get("testkey");
			assert.equal(val, "testvalue", "Value still there after remove");

			res = store.removeAll();
			assert.ok(res, "removeAll returns true when storage is supported");

			val = store.get("testkey");
			assert.ok(!val, "Value not there after removeAll");
		} else {
			if (iCheckSupported != SUPPORTED_CHECK_INACTIVE){
				assert.ok(iCheckSupported == SUPPORTED_CHECK_EXPECT_NO_SUPPORT, "Store is not supported as expected");
			}

			var val = store.get("testkey");
			assert.ok(!val, "Value initally not defined");

			var res = store.put("testkey", "testvalue");
			assert.ok(!res, "put returns false when storage is not supported");

			val = store.get("testkey");
			assert.ok(!val, "Value still not set after put");

			res = store.remove("testkey");
			assert.ok(!res, "remove returns false when storage is not supported");

			res = store.removeAll();
			assert.ok(!res, "removeAll returns false when storage is not supported");
		}

		store.clear();
	}

	function testCache(assert, oStorage, sIdPrefix, bCachingExpected){
		var store1 = jQuery.sap.storage(oStorage, sIdPrefix);
		var store2 = jQuery.sap.storage(oStorage, sIdPrefix);
		var store3 = jQuery.sap.storage(oStorage, sIdPrefix + "Something");

		if (bCachingExpected){
			assert.ok(store1 === store2, "Storage cached: " + store1.getType());
		} else {
			assert.ok(store1 != store2, "Storage not cached " + store1.getType());
		}

		assert.ok(store1 != store3, "Cache is prefix aware " + store1.getType());
	}

	function testPrefix(assert, sIdPrefix){
		var s = new SimpleStorage("custom3");
		var store = jQuery.sap.storage(s, sIdPrefix);
		var txt = sIdPrefix ? sIdPrefix : "DEFAULT";

		store.put("testkey0", "testvalue0");
		store.put("testkey1", "testvalue1");

		assert.equal(s.length, 2, txt + ": 2 items added");
		for (var i = 0; i < s.length; i++){
			assert.equal(s.key(i), (sIdPrefix ? sIdPrefix : "state.key_") + "-testkey" + i, txt + ": correct key '" + s.key(i) + "'");
		}

		store.clear();

		assert.equal(s.length, 0, txt + ": All items removed");
	}

//*******************************

	var SimpleStorage = function(sType){
		this._type = sType;
		this._supported = true;
		this._values = {};
		this._keys = [];

		this._updateLength = function() {
			this.length = this._keys.length;
		};
	};

	SimpleStorage.prototype.getType = function(){
		return this._type;
	};

	SimpleStorage.prototype.isSupported = function(){
		return this._supported;
	};

	SimpleStorage.prototype.clear = function(){
		this._values = {};
		this._keys = [];
		this._updateLength();
	};

	SimpleStorage.prototype.setItem = function(sId, sStateToStore){
		var bHasItem = !!this._values[sId];
		this._values[sId] = sStateToStore;
		if (!bHasItem){
			this._keys.push(sId);
			this._updateLength();
		}
	};

	SimpleStorage.prototype.removeItem = function(sId){
		delete this._values[sId];
		var newKeys = [];
		for (var i = 0; i < this._keys.length; i++){
			if (sId != this._keys[i]){
				newKeys.push(this._keys[i]);
			}
		}
		this._keys = newKeys;
		this._updateLength();
	};

	SimpleStorage.prototype.getItem = function(sId){
		return this._values[sId];
	};

	SimpleStorage.prototype.key = function(idx){
		if (idx >= this.length || idx < 0){
			return null;
		}
		return this._keys[idx];
	};

	// QUnitUtils.delayTestStart();

	QUnit.module("Basic");

	QUnit.test("Default Storage", function(assert) {
		testStorage(assert, null, null, Device.os.ios ? SUPPORTED_CHECK_INACTIVE : SUPPORTED_CHECK_EXPECT_SUPPORT);
	});

	QUnit.test("Session Storage", function(assert) {
		testStorage(assert, jQuery.sap.storage.Type.session, "myprefix", Device.os.ios ? SUPPORTED_CHECK_INACTIVE : SUPPORTED_CHECK_EXPECT_SUPPORT);
	});

	QUnit.test("Local Storage", function(assert) {
		testStorage(assert, jQuery.sap.storage.Type.local, "myprefix", Device.os.ios ? SUPPORTED_CHECK_INACTIVE : SUPPORTED_CHECK_EXPECT_SUPPORT);
	});

	QUnit.test("Custom Storage", function(assert) {
		testStorage(assert, new SimpleStorage("custom1"), "myprefix", SUPPORTED_CHECK_EXPECT_SUPPORT);
	});

	QUnit.test("Not Supported", function(assert) {
		var s = new SimpleStorage("not supported");
		s._supported = false;
		testStorage(assert, s, "myprefix", SUPPORTED_CHECK_EXPECT_NO_SUPPORT);
	});

	QUnit.test("Cache", function(assert) {
		testCache(assert, jQuery.sap.storage.Type.session, "myprefix", true);
		testCache(assert, jQuery.sap.storage.Type.local, "myprefix", true);
		testCache(assert, new SimpleStorage("custom2"), "myprefix", false);
	});

	QUnit.test("Prefixes", function(assert) {
		testPrefix(assert, null);
		testPrefix(assert, "myprefix");
	});

	QUnit.test("Storage API using static methods", function (assert) {
		assert.equal(typeof jQuery.sap.storage.isSupported, "function", "Storage has static method isSupported");
		assert.equal(typeof jQuery.sap.storage.clear, "function", "Storage has static method clear");
		assert.equal(typeof jQuery.sap.storage.get, "function","Storage has static method get");
		assert.equal(typeof jQuery.sap.storage.getType, "function", "Storage has static method getType");
		assert.equal(typeof jQuery.sap.storage.put, "function", "Storage has static method put");
		assert.equal(typeof jQuery.sap.storage.remove, "function", "Storage has static method remove");
		assert.equal(typeof jQuery.sap.storage.removeAll, "function", "Storage has static method removeAll");
	});

});
