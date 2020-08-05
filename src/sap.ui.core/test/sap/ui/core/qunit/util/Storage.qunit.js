/*!
 * ${copyright}
 */
/*global QUnit */
sap.ui.define(["sap/ui/util/Storage"], function(Storage) {
	"use strict";
	var storageType = Storage.Type;

	var setup = {};
	setup.init = function() {
		this.SUPPORTED_CHECK_INACTIVE = 0;
		this.SUPPORTED_CHECK_EXPECT_SUPPORT = 1;
		this.SUPPORTED_CHECK_EXPECT_NO_SUPPORT = -1;

		this.testStorage = function(oStorage, sIdPrefix, iCheckSupported, assert) {
			var store = new Storage(oStorage, sIdPrefix);

			var type = storageType.session;
			if (typeof (oStorage) == "string") {
				type = oStorage;
			} else if (oStorage) {
				if (oStorage.getType) {
					type = oStorage.getType();
				} else {
					type = "unknown";
				}
			}

			assert.equal(type, store.getType(), "Storage is of requested type");

			var supported = store.isSupported();

			if (supported) {
				if (iCheckSupported != this.SUPPORTED_CHECK_INACTIVE) {
					assert.ok(iCheckSupported == this.SUPPORTED_CHECK_EXPECT_SUPPORT, "Store is supported as expected");
				}

				var val = store.get("testkey");
				assert.notOk(val, "Value initially not defined");

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

				store.put("RemoveTestkey", "removetestvalue");
				store.put("RemoveTestkey2", "removetestvalue2");
				res = store.removeAll("RemoveTest");
				assert.ok(res, "removeAll returns true when storage is supported");

				val = store.get("RemoveTestkey");
				assert.equal(val, null);
				val = store.get("RemoveTestkey2");
				assert.equal(val, null);

				val = store.get("testkey");
				assert.equal(val, "testvalue", "Value still there after removeAll");

				val = store.get("testkey3");
				assert.equal(val, "testvalue3", "Value still there after removeAll");

				res = store.remove("testkey3");
				assert.ok(res, "remove returns true when storage is supported");

				val = store.get("testkey3");
				assert.notOk(val, "Value not there after remove");

				val = store.get("testkey");
				assert.equal(val, "testvalue", "Value still there after remove");

				res = store.removeAll();
				assert.ok(res, "removeAll returns true when storage is supported");

				val = store.get("testkey");
				assert.notOk(val, "Value not there after removeAll");
			} else {
				if (iCheckSupported != this.SUPPORTED_CHECK_INACTIVE) {
					assert.ok(iCheckSupported == this.SUPPORTED_CHECK_EXPECT_NO_SUPPORT, "Store is not supported as expected");
				}
				this.testInvalidStorage(oStorage, sIdPrefix, assert);

			}

			store.clear();
		};

		this.testInvalidStorage = function(oStorage, sIdPrefix, assert){


			var store = new Storage(oStorage, sIdPrefix);

			var val = store.get("testkey");
			assert.notOk(val, "Value initially not defined");

			var res = store.put("testkey", "testvalue");
			assert.notOk(res, "put returns false when storage is not supported");

			val = store.get("testkey");
			assert.notOk(val, "Value still not set after put");

			res = store.remove("testkey");
			assert.notOk(res, "remove returns false when storage is not supported");

			res = store.removeAll();
			assert.notOk(res, "removeAll returns false when storage is not supported");
		};

		this.testPrefix = function(sIdPrefix, assert) {
			var s = new SimpleStorage("custom3");
			var store = new Storage(s, sIdPrefix);
			var txt = sIdPrefix ? sIdPrefix : "DEFAULT";

			store.put("testkey0", "testvalue0");
			store.put("testkey1", "testvalue1");

			assert.equal(s.length, 2, txt + ": 2 items added");
			for (var i = 0; i < s.length; i++) {
				assert.equal(s.key(i), (sIdPrefix ? sIdPrefix : "state.key_") + "-testkey" + i, txt + ": correct key '" + s.key(i) + "'");
			}

			store.clear();

			assert.equal(s.length, 0, txt + ": All items removed");
		};

		//*******************************

		var SimpleStorage = function(sType) {
			this._type = sType;
			this._supported = true;
			this._values = {};
			this._keys = [];

			this._updateLength = function() {
				this.length = this._keys.length;
			};
		};

		SimpleStorage.prototype.getType = function() {
			return this._type;
		};

		SimpleStorage.prototype.isSupported = function() {
			return this._supported;
		};

		SimpleStorage.prototype.clear = function() {
			this._values = {};
			this._keys = [];
			this._updateLength();
		};

		SimpleStorage.prototype.setItem = function(sId, sStateToStore) {
			var bHasItem = !!this._values[sId];
			this._values[sId] = sStateToStore;
			if (!bHasItem) {
				this._keys.push(sId);
				this._updateLength();
			}
		};

		SimpleStorage.prototype.removeItem = function(sId) {
			delete this._values[sId];
			var newKeys = [];
			for (var i = 0; i < this._keys.length; i++) {
				if (sId != this._keys[i]) {
					newKeys.push(this._keys[i]);
				}
			}
			this._keys = newKeys;
			this._updateLength();
		};

		SimpleStorage.prototype.getItem = function(sId) {
			return this._values[sId];
		};

		SimpleStorage.prototype.key = function(idx) {
			if (idx >= this.length || idx < 0) {
				return null;
			}
			return this._keys[idx];
		};
		this.createSimpleStorage = function(sType) {
			return new SimpleStorage(sType);
		};

		//*******************************

		this.createInvalidSimpleStorage = function(sType) {
			var oSimpleStorage = this.createSimpleStorage(sType);
			oSimpleStorage.length = 1;
			oSimpleStorage.clear = function(){
				throw new Error("unsupported clear");
			};
			oSimpleStorage.removeItem = function(){
				throw new Error("unsupported removeItem");
			};
			oSimpleStorage.key = function(){
				throw new Error("unsupported key");
			};
			oSimpleStorage.setItem = function(){
				throw new Error("unsupported setItem");
			};
			return oSimpleStorage;
		};
	};

	setup.init();

	QUnit.module("sap/ui/util/Storage");

	QUnit.test("Default Storage", function(assert) {
		setup.testStorage(null, null, sap.ui.Device.os.ios ? setup.SUPPORTED_CHECK_INACTIVE : setup.SUPPORTED_CHECK_EXPECT_SUPPORT, assert);
	});

	QUnit.test("Session Storage", function(assert) {
		setup.testStorage(storageType.session, "myprefix", sap.ui.Device.os.ios ? setup.SUPPORTED_CHECK_INACTIVE : setup.SUPPORTED_CHECK_EXPECT_SUPPORT, assert);
	});

	QUnit.test("Local Storage", function(assert) {
		setup.testStorage(storageType.local, "myprefix", sap.ui.Device.os.ios ? setup.SUPPORTED_CHECK_INACTIVE : setup.SUPPORTED_CHECK_EXPECT_SUPPORT, assert);
	});

	QUnit.test("Custom Storage", function(assert) {
		setup.testStorage(setup.createSimpleStorage("custom1"), "myprefix", setup.SUPPORTED_CHECK_EXPECT_SUPPORT, assert);
	});

	QUnit.test("Not Supported", function(assert) {
		var s = setup.createSimpleStorage("not supported");
		s._supported = false;
		setup.testStorage(s, "myprefix", setup.SUPPORTED_CHECK_EXPECT_NO_SUPPORT, assert);
	});

	QUnit.test("Not Supported With Errors", function(assert) {
		var s = setup.createInvalidSimpleStorage("with errors");
		assert.ok(s.isSupported(), "should be supported but throw errors");
		setup.testInvalidStorage(s, "myprefix", assert);

		var os = new Storage(s, "with errors");
		assert.ok(os.isSupported(), "storage object should be supported but throw errors");

		assert.notOk(os.clear(), "clear should throw an exception");
	});

	QUnit.test("Prefixes", function(assert) {
		setup.testPrefix(null, assert);
		setup.testPrefix("myprefix", assert);
	});

});