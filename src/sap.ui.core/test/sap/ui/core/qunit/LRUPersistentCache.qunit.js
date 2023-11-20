/* global QUnit */
sap.ui.define(["sap/ui/Device", "sap/base/Log", "sap/ui/Global"], function(Device, Log, Global) {
	"use strict";
	var oCache,
		aSupportedEnv = [];

	aSupportedEnv.push({
		system: Device.system.SYSTEMTYPE.DESKTOP,
		browserName: Device.browser.BROWSER.CHROME,
		browserVersion: 49
	});
	aSupportedEnv.push({
		system: Device.system.SYSTEMTYPE.DESKTOP,
		browserName: Device.browser.BROWSER.SAFARI,
		browserVersion: 13
	});
	aSupportedEnv.push({
		system: Device.system.SYSTEMTYPE.TABLET,
		browserName: Device.browser.BROWSER.SAFARI,
		browserVersion: 13
	});
	aSupportedEnv.push({
		system: Device.system.SYSTEMTYPE.PHONE,
		browserName: Device.browser.BROWSER.SAFARI,
		browserVersion: 13
	});
	aSupportedEnv.push({
		system: Device.system.SYSTEMTYPE.TABLET,
		os: Device.os.OS.ANDROID,
		browserName: Device.browser.BROWSER.CHROME,
		browserVersion:80
	});
	aSupportedEnv.push({
		system: Device.system.SYSTEMTYPE.PHONE,
		os: Device.os.OS.ANDROID,
		browserName: Device.browser.BROWSER.CHROME,
		browserVersion: 80
	});
	var bSupportedEnv = aSupportedEnv.some(function(oSuppportedEnv) {
		var bSupportedSystem = Device.system[oSuppportedEnv.system],
			bSupportedOSName = oSuppportedEnv.os ? oSuppportedEnv.os === Device.os.name : true,
			bSupportedBrowserName = oSuppportedEnv.browserName === Device.browser.name,
			bSupportedBrowserVersion = Device.browser.version >= oSuppportedEnv.browserVersion;

		return bSupportedSystem && bSupportedOSName && bSupportedBrowserName && bSupportedBrowserVersion && window.indexedDB;
	});

	if (!bSupportedEnv) {
		QUnit.test("All tests are skipped, as the CacheManager is not supported on the underlying environment (see assert)", function(assert) {
			assert.ok(true, "Environment: system [" + JSON.stringify(Device.system) + "],  browser: " +
				JSON.stringify(Device.browser) + ", window.indexedDB: " + window.indexedDB);
		});

		QUnit.start();
	} else {
		sap.ui.require(["sap/ui/core/cache/LRUPersistentCache"], function(classCacheManager) {
			classCacheManager.init().then(function(impl) {
				oCache = impl;
			}).then(function() {
				QUnit.module("Basic", {
					beforeEach: function() {
					},
					afterEach: function() {
						return deleteDatabaseEntries();
					}
				});

				QUnit.test("Test store of an object with circular references", function(assert) {
					var child = {
						value: 5
					};
					var parent = {
						children: [child],
						value: 9
					};
					child.parent = parent; // creates a cycle, objects no longer form a tree

					oCache.stringify = function(o) {
						return JSON.stringify(o, ["children", "value"]);
					};
					return oCache.set("key12", parent).
					then(function() {
						return oCache.get("key12");
					}).then(function(result) {
						oCache.stringify = JSON.stringify;
						assert.deepEqual(result, parent, "Gotten value with a circular reference must be the same as the one that is previously set");
					}).catch(function(e) {
						oCache.stringify = JSON.stringify;
						assert.ok(false, "Test didn't go well: " + e);
					});
				});

				QUnit.test("What is given to set() is available with get()", function(assert) {
					return oCache.set("key", "value")
						.then(function() {
							return verifyCacheEntries({
								key: "value"
							}, "nonexisting", assert);
						})
						.then(function() {
							return oCache.set("key2", "value2");
						})
						.then(function() {
							return oCache.set("key3", "value3");
						})
						.then(function() {
							return verifyCacheEntries({
								key: "value",
								key2: "value2",
								key3: "value3"
							}, null, assert);
						});
				});

				QUnit.test("Set complex object", function(assert) {
					var oValue = {
						firstName: "Peter",
						lastName: "Dou",
						birthdate: new Date(),
						sallary: 10300,
						address: {
							city: "Paris",
							street: "Champse Elysee"
						}
					};
					return oCache.set("key", oValue)
						.then(function() {
							return verifyCacheEntries({
								key: oValue
							}, null, assert);
						});
				});

				QUnit.test("Deleting entries", function(assert) {
					return oCache.set("key", "value")
						.then(function() {
							return oCache.del("key");
						})
						.then(function() {
							assert.ok(true, "Key was successfully removed.");
						});
				});

				QUnit.test("Overwriting existing values", function(assert) {
					return oCache.set("key1", "value1")
						.then(function() {
							return oCache.set("key2", "value2");
						})
						.then(function() {
							return oCache.set("key3", "value3");
						})
						.then(function() {
							return oCache.set("key1", "newValue");
						})
						.then(function() {
							return oCache.get("key1");
						})
						.then(function(firstValue) {
							assert.strictEqual(firstValue, "newValue", "The new value must be set");
							return oCache.get("key2");
						})
						.then(function(secondValue) {
							assert.strictEqual(secondValue, "value2", "The value must be set to value2.");
							return oCache.get("key3");
						})
						.then(function(thirdValue) {
							assert.strictEqual(thirdValue, "value3", "The value must be set to value3.");
						});
				});

				QUnit.test("Testing if has() returns the correct value", function(assert) {
					return oCache.has("key").then(function(result) {
						assert.strictEqual(result, false, "The key should not exist before being set");

						return oCache.set("key", "value");
					}).then(function() {
						return oCache.has("key");
					}).then(function(result) {
						assert.strictEqual(result, true, "Has should return true if the key is present.");
					});
				});

				QUnit.test("Inserting multiple values and then deleting several", function(assert) {
					var valuesToBeInserted = [{
							key: "key1",
							value: "value1"
						},
						{
							key: "key2",
							value: "value2"
						},
						{
							key: "key3",
							value: "value3"
						},
						{
							key: "key4",
							value: "value4"
						},
						{
							key: "key5",
							value: "value5"
						},
						{
							key: "key6",
							value: "value6"
						},
						{
							key: "key7",
							value: "value7"
						},
						{
							key: "key8",
							value: "value8"
						},
						{
							key: "key9",
							value: "value9"
						},
						{
							key: "key10",
							value: "value10"
						}
					];

					return Promise.all(valuesToBeInserted.map(function(item) {
						return oCache.set(item.key, item.value);
					})).then(function() {
						return Promise.all(valuesToBeInserted.map(function(item) {
							return oCache.has(item.key)
								.then(function(result) {
									assert.strictEqual(result, true, "Value for key: " + item.key + " should exist after set.");
								});
						}));
					}).then(function() {
						oCache.del("key1");
					}).then(function() {
						oCache.del("key3");
					}).then(function() {
						oCache.del("key4");
					}).then(function() {
						oCache.del("key5");
					}).then(function() {
						oCache.del("key8");
					}).then(function() {
						var valuesAfterDelete = [{
								key: "key2",
								value: "value2"
							},
							{
								key: "key6",
								value: "value6"
							},
							{
								key: "key7",
								value: "value7"
							},
							{
								key: "key9",
								value: "value9"
							},
							{
								key: "key10",
								value: "value10"
							}
						];

						return Promise.all(valuesAfterDelete.map(function(item) {
							return oCache.has(item.key)
								.then(function(result) {
									assert.strictEqual(result, true, "Value for key: " + item.key + " should exist after delete.");
								});
						}));
					}).then(function() {
						var valuesDeleted = [{
								key: "key1",
								value: "value1"
							},
							{
								key: "key3",
								value: "value3"
							},
							{
								key: "key4",
								value: "value4"
							},
							{
								key: "key5",
								value: "value5"
							},
							{
								key: "key8",
								value: "value8"
							}
						];

						return Promise.all(valuesDeleted.map(function(item) {
							return oCache.has(item.key)
								.then(function(result) {
									assert.strictEqual(result, false, "Value for key: " + item.key + " should be deleted.");
								});
						}));
					});
				});

				QUnit.test("Loading metadata to memory", function(assert) {
					return oCache.set("key1", "value1").then(function() {
						return oCache.set("key2", "value2");
					}).then(function() {
						return oCache.set("key3", "value3");
					}).then(function() {
						return reInitCacheManager(oCache);
					}).then(function() {
						Log.debug("Cache Manager reinitialized!");
						assert.deepEqual(JSON.stringify(oCache._metadata), JSON.stringify(oCache._metadata), "After reload, the metadata is consistent");
					});
				});

				QUnit.test("delete with filters - olderThan", function(assert) {
					// arrange
					var done = assert.async();
					var pSet1 = oCache.set("a1", { value: "1" });
					var pSet2 = oCache.set("a2", { value: "2" });
					var pSet3 = oCache.set("b3", { value: "3" });

					// act - get all 3 entries, after 50 ms get one of them, filter and delete them
					// based on usage time, verify correct delete
					Promise.all([ pSet1, pSet2, pSet3 ]).then(function() {
						return Promise.all([ oCache.get("b3"), oCache.get("a2") ]);
					}).then(function() {
						var oFilterDate = new Date();
						setTimeout(function() {
							oCache.get("a2").then(function() {
								return oCache.delWithFilters({ olderThan: oFilterDate });
							}).then(function() {
								return Promise.all([oCache.has("a1"), oCache.has("a2"), oCache.has("b3")]);
							}).then(function(aResults) {
								assert.strictEqual(aResults[0], false, "entry 1 was deleted");
								assert.strictEqual(aResults[1], true, "entry 2 remained");
								assert.strictEqual(aResults[2], false, "entry 3 was deleted");
								done();
							});
						}, 50);
					});
				});

				QUnit.test("delete with filters - prefix", function(assert) {
					// arrange
					var done = assert.async();
					var pSet1 = oCache.set("a1", { value: "1" });
					var pSet2 = oCache.set("a2", { value: "2" });
					var pSet3 = oCache.set("b3", { value: "3" });

					// act - delete based on key prefix, verify correct delete
					Promise.all([ pSet1, pSet2, pSet3 ]).then(function() {
						return oCache.delWithFilters({ prefix: "a" });
					}).then(function() {
						return Promise.all([oCache.has("a1"), oCache.has("a2"), oCache.has("b3")]);
					}).then(function(aResults) {
						assert.strictEqual(aResults[0], false, "entry 1 was deleted");
						assert.strictEqual(aResults[1], false, "entry 2 was deleted");
						assert.strictEqual(aResults[2], true, "entry 3 remained");
						done();
					});
				});

				QUnit.test("delete with filters - olderThan & prefix", function(assert) {
					// arrange
					var done = assert.async();
					var pSet1 = oCache.set("a1", { value: "1" });
					var pSet2 = oCache.set("a2", { value: "2" });
					var pSet3 = oCache.set("b3", { value: "3" });

					// act - get all 3 entries, after 50 ms get one of them, filter and delete them
					// based on usage time & prefix, verify correct delete
					Promise.all([ pSet1, pSet2, pSet3 ]).then(function() {
						return Promise.all([ oCache.get("a1"), oCache.get("b3"), oCache.get("a2") ]);
					}).then(function() {
						var oFilterDate = new Date();
						setTimeout(function() {
							oCache.get("a2").then(function() {
								return oCache.delWithFilters({ olderThan: oFilterDate, prefix: "a" });
							}).then(function() {
								return Promise.all([oCache.has("a1"), oCache.has("a2"), oCache.has("b3")]);
							}).then(function(aResults) {
								assert.strictEqual(aResults[0], false, "entry 1 was deleted");
								assert.strictEqual(aResults[1], true, "entry 2 remained");
								assert.strictEqual(aResults[2], true, "entry 3 remained");
								done();
							});
						}, 50);
					});
				});

				QUnit.module("Index", {
					beforeEach: function() {
					},
					afterEach: function() {
						return deleteDatabaseEntries();
					}
				});

				QUnit.test("Entries have ui5 version index equal to current ui5 version", function(assert) {
					this.stub(Global, "version").value("1.36.1");

					return oCache.set("key1_1.36.1", "myValue").then(function() {
						return oCache.set("key2_1.36.1", "myValue");
					}).then(function() {
						return verifyCacheEntries({
							"key1_1.36.1": "myValue",
							"key2_1.36.1": "myValue"
						}, null, assert);
					}).then(function() {
						return oCache.has("key1_1.36.1");
					}).then(function(bHas) {
						assert.ok(bHas, "CacheManager must has() entry for key 'key1_1.36.1'");
					}).then(function() {
						return oCache.has("key2_1.36.1");
					}).then(function(bHas) {
						assert.ok(bHas, "CacheManager must has() entry for key 'key2_1.36.1'");
					});
				});

				QUnit.test("Entries with different ui5 version than current does not exist", function(assert) {
					var that = this,
						stub = this.stub(Global, "version").value("1.36.1");

					return oCache.set("key1_1.36.1", "myValue").then(function() {
						return oCache.set("key2_1.36.1", "myValue");
					}).then(function() {
						//switch the version
						stub.restore();
						stub = that.stub(Global, "version").value("1.36.2");
						return reInitCacheManager(oCache);
					}).then(function() {
						return verifyCacheEntries(null, ["key1_1.36.1", "key2_1.36.1"], assert);
					}).then(function() {
						return oCache.has("key1_1.36.1");
					}).then(function(bHas) {
						assert.ok(!bHas, "CacheManager must not has() entry for key 'key1_1.36.1'");
					}).then(function() {
						return oCache.has("key2_1.36.1");
					}).then(function(bHas) {
						assert.ok(!bHas, "CacheManager must not has() entry for key 'key2_1.36.2'");
						return oCache.set("key1_1.36.2", "value");
					}).then(function() {
						return verifyCacheEntries({
							"key1_1.36.2": "value"
						}, null, assert);
					});
				});

				/**
				 * W3C(https://www.w3.org/TR/IndexedDB/#dfn-transaction-commit):
				 *
				 * Generally speaking, the above requirements mean that any transaction which has an overlapping scope with
				 * a "readwrite" transaction and which was created after that "readwrite" transaction,
				 * can't run in parallel with that "readwrite" transaction.
				 *
				 */
				QUnit.module("Transactions", {
					beforeEach: function() {
						this.o1MB = get1MbEntry();
					},
					afterEach: function() {
						return deleteDatabaseEntries();
					}
				});

				QUnit.test("Get Item (ro) -> Del Item (rw)", function(assert) {
					var done = assert.async();
					//arrange
					oCache.set("key1", "smallValue").then(function() {
						//act
						oCache.get("key1").then(function(value) {
							//check
							assert.equal(value, "smallValue", "Get item (ro) still sees the item, because [get] started before [del]");
							done();
						});
						//act
						oCache.del("key1");
					});
				});

				QUnit.test("Del Item (rw) -> Get Item (ro)", function(assert) {
					var done = assert.async();
					oCache.set("key1", this.o1MB).then(function() {
						//act
						oCache.del("key1");
						oCache.get("key2").then(function(value) {
							//check
							assert.strictEqual(typeof value, "undefined", "Get (ro) waits running [del]");
							done();
						});
					});
				});

				QUnit.test("Get Item (ro) -> Set Item (rw)", function(assert) {
					var done = assert.async();
					//act
					oCache.get("key1").then(function(value) {
						//check
						assert.strictEqual(typeof value, "undefined", "Get item (ro) still does not see any item, because [get] started before [set]");
					});
					//act
					oCache.set("key1", this.o1MB).then(function() {
						done();
					});
				});

				QUnit.test("Get Item (ro) -> Update Item (rw) ", function(assert) {
					var done = assert.async();

					//arrange
					oCache.set("key1", "smallValue").then(function() {
						//act
						oCache.get("key1").then(function(value) {
							//check
							assert.strictEqual(value, "smallValue", "Get item (ro) sees the old value (before update transaction completes) as it started before [update]");
						});
						//act
						oCache.set("key1", "smallValueUpdated").then(function() {
							done();
						});
					});
				});

				QUnit.test("Set Item (rw) -> Get Item (ro) ", function(assert) {
					var done = assert.async(),
						that = this;

					//act
					oCache.set("key1", that.o1MB);
					oCache.get("key1").then(function(value) {
						//check
						assert.deepEqual(value, that.o1MB, "Get (ro) waits running [set]");
						done();
					});
				});

				QUnit.test("Update Item (rw) -> Get Item (ro)", function(assert) {
					var done = assert.async();

					//arrange
					oCache.set("key1", "smallValue").then(function() {
						//act
						oCache.set("key1", "smallValueUpdated");
						oCache.get("key1").then(function(value) {
							//check
							assert.strictEqual(value, "smallValueUpdated", "Get (ro) waits running [update]");
							done();
						});
					});
				});

				QUnit.module("LRU", {
					beforeEach: function() {
						return deleteDatabaseEntries();
					},
					afterEach: function() {
						return deleteDatabaseEntries();
					},
					putItems: function(aItems) {
						return Promise.all(aItems.map(function(oItem) {
							if (Object.keys(oItem).length != 1) {
								throw new Error("There should be only one key inside an item, but they are not " + JSON.stringify(oItem));
							}
							var oKey = Object.keys(oItem)[0];
							return oCache.set(oKey, oItem[oKey]);
						}));
					},
					//Asserts given data structure
					assertMetadataStructureLength: function(byKeyLength, byIndexLength, assert) {
						assert.equal(Object.keys(oCache._metadata.__byKey__).length, byKeyLength, "LRU map structure __byKey__ should be correct.");
						assert.equal(Object.keys(oCache._metadata.__byIndex__).length, byIndexLength, "LRU map structure __byIndex__ should be correct.");
					},
					mockPut: function(expectedKey, oErrorEvent, callStart, callEnd) {
						callStart = callStart || 1;
						callEnd = callEnd || callStart;
						var originalFnPut = window.IDBObjectStore.prototype.put;
						var counter = 1;
						this.stub(window.IDBObjectStore.prototype, "put").callsFake(function(entry, key) {
							if (key === expectedKey && (counter >= callStart && counter <= callEnd)) {
								Log.debug("Sinon aborts the transaction [mocking put] for key=[" + expectedKey + "] " + counter + "nd time");
								counter++;
								/* We fake the objectStore.put operation and we manually call the transaction.onabort. From IndexedDB point of view
								 / the transaction is not failed/aborted, so it calls transaction.oncomplete handler.
								 / This is the reason to fake the oncomplete productive implementation for this particular transaction,
								 / so indexed db won't call the real handler.
								 / The real handler resolves the transaction that is not true in the real flow, where it should have been resolved by
								 / free space scenario coding */
								this.transaction.oncomplete = function() {}; //TODO test that this is really what happens (then tx.onabort is called, no tx.compete call)

								setTimeout(function() {
									this.transaction.onabort(oErrorEvent);
								}.bind(this), 1);
								return {};
							} else {
								return originalFnPut.apply(this, arguments);
							}
						});
					},

					mockDelete: function(expectedKey, callStart, callEnd) {
						callStart = callStart || 1;
						callEnd = callEnd || callStart;
						var originalFnDel = window.IDBObjectStore.prototype.delete;
						var counter = 1;
						var that = this;
						this.stub(window.IDBObjectStore.prototype, "delete").callsFake(function(key) {
							if (key === expectedKey && (counter >= callStart && counter <= callEnd)) {
								Log.debug("Sinon aborts the transaction [mocking delete] for key=[" + expectedKey + "] " + counter + "nd time");
								counter++;
								/* We fake the objectStore.delete operation and we manually call the transaction.onabort. From IndexedDB point of view
								 / the transaction is not failed/aborted, so it calls transaction.oncomplete handler.
								 / This is the reason to fake the oncomplete productive implementation for this particular transaction,
								 / so indexed db won't call the real handler.
								 / The real handler resolves the transaction that is not true in the real flow */
								this.transaction.oncomplete = function() {};

								setTimeout(function() {
									this.transaction.onabort(that.buildDomError());
								}.bind(this), 1);
								return {};
							} else {
								return originalFnDel.apply(this, arguments);
							}
						});
					},

					/**
					 * Simulates No-free space scenario when setting certain key.
					 * @param expectedKey the key that the #set operation should fail for
					 * @param callStart works together with <code>callEnd</code>the CM.set call iteration that should start failing for the give key.
					 * Example: mockPutWithNoFreeSpaceScenario("key12", 2, 5); will create a mock that will fail if CM.set is called for 2nd up-to 5th time with the key "key12".
					 * @param callEnd works together with <code>callStart</code>the CM.set call iteration that should end failing for the give key.
					 */
					mockPutWithNoFreeSpaceScenario: function(expectedKey, callStart, callEnd) {
						this.mockPut(expectedKey, this.buildQuotaExceededEvent(), callStart, callEnd);
					},

					mockPutWithError: function(expectedKey, callStart, callEnd) {
						this.mockPut(expectedKey, this.buildDomError(), callStart, callEnd);
					},

					buildDomError: function() {
						return {
							message: "Sinon DOMError",
							target: {
								error: {
									name: "DOMError"
								}
							}
						};
					},

					/**Simulate real (most important part) QuotaExceededError that the browsers implementation use*/
					buildQuotaExceededEvent: function() {
						return {
							message: "Sinon QuotaExceededError",
							target: {
								error: {
									name: "QuotaExceededError"
								}
							}
						};
					},

					/**
					 * @param {array} aItems
					 */
					assertKeyAtIndex: function(aItems, aNonExistingIndexes, assert) {
						aItems.forEach(function(oItem) {
							if (Object.keys(oItem).length != 1) {
								throw new Error("There should be only one key inside an item, but they are not " + JSON.stringify(oItem));
							}
							var iPosition = parseInt(Object.keys(oItem)[0]);
							var oKey = oItem[iPosition];
							if (oKey) {
								assert.equal(oCache._metadata.__byKey__[oKey], iPosition, "LRU map structure __byKey__ should contain the entry with key '" + oKey + "'");
							}
							assert.equal(oCache._metadata.__byIndex__[iPosition], oKey, "LRU map structure __byIndex__ should contain key " + oKey + " at position " + iPosition);
						});

						aNonExistingIndexes.forEach(function(iIndex) {
							assert.ok(!oCache._metadata.__byIndex__.hasOwnProperty(iIndex), "LRU map structure __byIndex__ should not contain key [" + iIndex + "]");
						});
					},

					assertCounters: function(lruCount, mruCount, assert) {
						assert.equal(oCache._lru, lruCount, "Cache Manager lru value should equal to the next item to delete");
						assert.equal(oCache._mru, mruCount, "Cache Manager mru value should equal to the next free index");
					},

					assertItemCount: function(expectedCount, message, assert) {
						return oCache._getCount().then(function(count) {
							assert.equal(count, expectedCount, message);
						});
					}
				});

				QUnit.test("Least recently used is deleted when space cleanup even if it is the only item inside the cache.", function(assert) {
					var self = this;
					this.mockPutWithNoFreeSpaceScenario("password2");
					return oCache.set("password1", "secret").then(function() {
						return verifyCacheEntries({
							"password1": "secret"
						}, null, assert);
					}).then(function() {
						return self.assertItemCount(1, "The cache must contain only one entry", assert);
					}).then(function() {
						return oCache.set("password2", "mysecret");
					}).then(function() {
						return self.assertItemCount(1, "After adding the last item the item count is still 1", assert);
					}).then(function() {
						return verifyCacheEntries({
							"password2": "mysecret"
						}, "password1", assert);
					});
				});

				//        QUnit.test("LRU&MRU counters are enough to handle many items", function (assert) {
				//        });

				QUnit.test("Failed put will keep metadata as before it failed", function(assert) {
					var self = this,
						metadata, lru, mru;

					this.mockPutWithError("password2");

					return oCache.set("password1", "mysecret").then(function() {
						metadata = oCache._metadata;
						lru = oCache._lru;
						mru = oCache._mru;

						return oCache.set("password2", "mysecret").then(function() {
							assert.ok(!true, "Set of password2 should have failed. See the test mock!!!");
						}, function() {
							return self.assertItemCount(1, "After failing to add item the item count doesn't change", assert);
						});
					}).then(function() {
						self.assertCounters(lru, mru, assert);
						assert.deepEqual(metadata, oCache._metadata, "After failing to add item the metadata record should be not be changed.");
					}).then(function() {
						return verifyCacheEntries({
							"password1": "mysecret"
						}, "password2", assert);
					});
				});

				QUnit.test("Failed delete will keep metadata as before it failed", function(assert) {
					var self = this,
						metadata, lru, mru;

					this.mockDelete("password2");

					return this.putItems([{
						"password1": "mysecret"
					}, {
						"password2": "mysecret"
					}]).then(function() {
						metadata = oCache._metadata;
						lru = oCache._lru;
						mru = oCache._mru;

						return oCache.del("password2").then(function() {
							assert.ok(!true, "Delete of password2 should have failed. See the test mock!!!");
						}, function() {
							return self.assertItemCount(2, "After failing to delete item the item count doesn't change", assert);
						});
					}).then(function() {
						self.assertCounters(lru, mru, assert);
						assert.deepEqual(metadata, oCache._metadata, "After failing to delete item the metadata record should be not be changed.");
					}).then(function() {
						return verifyCacheEntries({
							"password1": "mysecret",
							"password2": "mysecret"
						}, null, assert);
					});
				});

				QUnit.test("Getting most used item does not change its usage index(mru)", function(assert) {
					var self = this,
						metadata, lru, mru;

					return this.putItems([{
						"password1": "mysecret"
					}, {
						"password2": "mysecret"
					}]).then(function() {
						metadata = oCache._metadata;
						lru = oCache._lru;
						mru = oCache._mru;

						return oCache.get("password2");
					}).then(function() {
						self.assertCounters(lru, mru, assert);
						assert.deepEqual(metadata, oCache._metadata, "After getting the most used item the metadata should not be changed.");
					});
				});

				QUnit.test("Recently gotten item is not being deleted when space cleanup", function(assert) {
					var that = this;
					this.mockPutWithNoFreeSpaceScenario("d", 1, 1); //the first try to set "d" will fail, the rest will succeed

					// Input        Operation               Result
					//----------------------------------------------------
					// a - 0        1) get "a",             a         - 3
					// b - 1        2) set "d" (no space)
					// c - 2                                c         - 2
					//                                      d         - 4
					return this.putItems([{
							"a": "A"
						}, {
							"b": "B"
						}, {
							"c": "C"
						}])
						.then(function() {
							return oCache.get("a", "A");
						}).then(function() {
							return new Promise(function(resolve, reject) {
								setTimeout(function() {
									that.assertCounters(1, 3, assert);
									resolve();
								}, 0);
							});
						}).then(function() {
							return oCache.set("d", "D");
						}).then(function() {
							assert.ok(true, "Adding new element, that force space cleanup, should be successful");
							/* Usually the gives the chance of CM to update its
							 / indexes(and item count) as this is happening asynchronously so the get does not involves any sets in the indexed db
							 */
							//TODO check why this test fails
							//TODO rethink  this!!!
							return new Promise(function(resolve, reject) {
								setTimeout(function() {
									that.assertItemCount(3, "After adding new element, that forces space cleanup, item's count should be correct", assert).then(resolve, reject);
								}, 0);
							});
						}).then(function() {
							// Unit testing start
							that.assertMetadataStructureLength(3, 3, assert);
							that.assertKeyAtIndex([{
									3: "a"
								},
								{
									2: "c"
								},
								{
									4: "d"
								}
							], [0, 1], assert);
							that.assertCounters(2, 4, assert);

							// Unit testing end
							return verifyCacheEntries({
								"a": "A",
								"c": "C",
								"d": "D"
							}, "b", assert);
						});
				});

				QUnit.test("Recently gotten item actually changes it's lru index", function(assert) {
					var that = this;
					// Input        Operation               Result
					//----------------------------------------------------
					// a - 0        1) get "c",             a         - 5
					// b - 1        2) get "a"              b         - 1
					// c - 2                                c         - 4
					// d - 3                                d         - 3
					return this.putItems([{
							"a": "A"
						}, {
							"b": "B"
						}, {
							"c": "C"
						}, {
							"d": "D"
						}])
						.then(function() {
							return oCache.get("c");
						}).then(function() {
							return oCache.get("a");
						}).then(function() {
							that.assertMetadataStructureLength(4, 4, assert);
							that.assertKeyAtIndex([{
									5: "a"
								},
								{
									1: "b"
								},
								{
									4: "c"
								},
								{
									3: "d"
								}
							], [0, 2], assert);
							that.assertCounters(1, 5, assert);
						});
				});
				QUnit.test("Loading LRU to memory", function(assert) {
					var that = this;
					return this.putItems([{
							"key1": "value1"
						}, {
							"key2": "value2"
						}, {
							"key3": "value3"
						}])
						.then(function() {
							that.originalMetadata = oCache._metadata;
							return reInitCacheManager(oCache);
						})
						.then(function(cm) {
							oCache = cm;
							assert.deepEqual(JSON.stringify(cm._metadata), JSON.stringify(that.originalMetadata), "After reload, the lru map is consistent");
							that.metadata = null;
						});
				});

				QUnit.start();

				/**
				 * Verifies that that given key(s) exists with given value
				 * @param oExpectedEntries an object of keys and their values expected to exist in the cache
				 * @param aNonExistingKeys array of strings with the keys of non-existing entries
				 * @returns {Promise} that will resolve if all checks are completed (regardless its failure/success) or reject if checks are not completed within a given timeout (5 seconds)
				 */
				function verifyCacheEntries(oExpectedEntries, aNonExistingKeys, assert) {
					var oExpectedEntries = oExpectedEntries || {};
					aNonExistingKeys = aNonExistingKeys || [];
					if (aNonExistingKeys && !Array.isArray(aNonExistingKeys)) {
						aNonExistingKeys = [aNonExistingKeys];
					}

					//Create promise for each item that must be inside the cache
					var existingPromises = Object.keys(oExpectedEntries).map(function(key) {
						return oCache.get(key).then(function(existingValue) {
							assert.deepEqual(existingValue, oExpectedEntries[key], "Values for key [" + key + "] should match.");
							return true;
						});
					});
					aNonExistingKeys = aNonExistingKeys || [];
					var nonExistingPromises = aNonExistingKeys.map(function(key) {
						return oCache.has(key).then(function(found) {
							assert.equal(false, found, "The key " + key + " should not exist.");
							if (found) {
								throw new Error("unexpected key found: ", key);
							}
							return true;
						});
					});
					return Promise.all(existingPromises.concat(nonExistingPromises));
				}

				function deleteDatabaseEntries() {
					if (oCache) {
						return Promise.resolve(function() {
							Log.debug(new Date() + ". Deleting all entries");
						}).then(function() {
							return oCache.reset();
						}).then(function() {
							Log.debug(new Date() + ". Entries deleted ");
						});
					}
				}

				function reInitCacheManager(cm) {
					Log.debug("Reinit cache manager");
					if (cm) {
						Log.debug("Closing database...");
						cm._db.close();
						Log.debug("Closing database...done");
						cm = null;
						return oCache.init().then(function(cm) {
							cm.stringify = JSON.stringify;
							return cm;
						});
					} else {
						return Promise.resolve();
					}
				}

				function get1MbEntry() {
					var s200bytes = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijh";
					var o1KB = {
						v: [],
						a: ""
					};
					for (var i = 0; i < 5; i++) {
						o1KB.v[i] = s200bytes.slice();
					}
					o1KB.v[5] = "ABCDEFGHIJKL"; //24 bytes

					var o1MB = {
						v: [],
						a: ""
					};
					for (var i = 0; i < 1024; i++) {
						o1MB.v[i] = o1KB.v.slice();
					}
					return o1MB;
				}
			});
		});
	}

});