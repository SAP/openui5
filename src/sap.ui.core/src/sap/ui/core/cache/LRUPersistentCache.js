/*!
 * ${copyright}
 */

/*!
 * Portions of this module ("Least Recently Used" logic) are taken from the node-lru-cache project (see https://github.com/isaacs/node-lru-cache/blob/v2.7.3/README.md),
 * but modified. Please see the OpenUI5 LICENSE file for license information respecting node-lru-cache.
 */

sap.ui.define(['jquery.sap.global'],
	function (jQuery) {
		"use strict";

		/**
		 * @classdesc
		 * This object provides cache functionality with persistence in IndexedDB.
		 * The component is an experimental and private.
		 * Do not use outside UI5 framework itself.
		 * This implementation works with entries corresponding to a single ui5 version.
		 * If the cache is loaded with different ui5 version, all previous entries will be deleted. The latter behavior is about of a further changes (feature requests)
		 *
		 * This implementation relies on existing configuration @see sap.ui.core.Configuration.
		 *
		 * Do not use it directly, use sap.ui.core.cache.CacheManager instead
		 * @private
		 * @experimental
		 * @since 1.40.0
		 * @namespace
		 * @alias sap.ui.core.cache.LRUPersistentCache
		 */

		var LRUPersistentCache = {
			name: "LRUPersistentCache",

			defaultOptions: {
				databaseName: "ui5-cachemanager-db",
				_contentStoreName: "content-store",
				_metadataStoreName: "metadata-store",
				_metadataKey: "metadataKey"
			},

			_db: {},

			init: function () {
				this._metadata = {};
				/**
				 * The mru index whose value is always assigned to the last added item
				 */
				this._mru = -1;
				/**
				 * Least recently used. Index of the item that is used less and is the next potential item that will be deleted
				 */
				this._lru = -1;
				return initIndexedDB(this);
			},

			_destroy: function () {
				if (this._db.close) {
					this._db.close();
				}
				this._metadata = null;
				this._ui5version = null;
			},

			set: function (key, value) {
				if (keyMatchesExclusionStrings(key)) {
					jQuery.sap.log.warning("Cache Manager ignored 'set' for key [" + key + "]");
					return Promise.resolve();
				}
				if (key == null) { //undefined or null
					return Promise.reject("Cache Manager does not accept undefined or null as key");
				}
				if (typeof value === "undefined") {
					return Promise.reject("Cache Manager does not accept undefined as value");
				}
				jQuery.sap.log.debug("Cache Manager LRUPersistentCache: adding item with key [" + key + "]...");
				var self = this,
					sMsrTotal = "[sync ] fnSet: total[sync]  key [" + key + "]",
					sMsrOpeningTx = "[sync ] fnSet: txStart[sync]  key [" + key + "]",
					sMsrOpeningStores = "[sync ] fnSet: storeOpen[sync]  key [" + key + "]",
					sMsrPutContent = "[sync ] fnSet: putContent[sync]  key [" + key + "]",
					sMsrPutMetadata = "[sync ] fnSet: putMetadata[sync]  key [" + key + "]",
					sMsrSerialize = "[sync ] fnSet: serialize[sync]  key [" + key + "]";

				return new Promise(function fnSet(resolve, reject) {
					jQuery.sap.measure.start(sMsrTotal, "CM", sMsrCatSet);
					var objectStore, objectStoreRequest,
						objectMetadataStore,
						oItem, backupMetadata;

					backupMetadata = cloneMetadata(self._metadata);
					oItem = new Item(key, value, typeof value, ++self._mru, sMsrSerialize, sMsrCatSet).serialize();

					jQuery.sap.measure.start(sMsrOpeningTx, "CM", sMsrCatSet);
					var transaction = self._db.transaction([self.defaultOptions._contentStoreName, self.defaultOptions._metadataStoreName], "readwrite");
					jQuery.sap.measure.end(sMsrOpeningTx);

					transaction.onerror = function (event) {
						var sMessage = "Cache Manager cannot complete add/put transaction for entry with key: " + oItem.oData.key + ". Details: " + collectErrorData(event);
						jQuery.sap.log.error(sMessage);
						self._metadata = backupMetadata;
						assignRUCounters(self);
						reject(sMessage);
					};

					transaction.onabort = function (event) {
						self._metadata = backupMetadata;
						assignRUCounters(self);
						var iOriginalItemCount = getItemCount(self);

						if (isQuotaExceeded(event) && iOriginalItemCount > 0) {
							jQuery.sap.log.warning("Cache Manager is trying to free some space to add/put new item");
							cleanAndStore(self, key, value).then(
								function () {
									jQuery.sap.log.debug("Cache Manager LRUPersistentCache: set completed after freeing space. ItemCount changed from " +
										iOriginalItemCount + " to " + getItemCount(self));
									resolve();
								},
								function (sMessage) {
									var sMsg = "Cache Manager LRUPersistentCache: set unsuccessful. Cannot free space to add/put entry. Details: " + sMessage;
									jQuery.sap.log.error(sMsg);
									reject(sMsg);
								});
						} else {
							var sErrMsg = "Cache Manager LRUPersistentCache: set failed: " + collectErrorData(event);
							jQuery.sap.log.error(sErrMsg);
							reject(sErrMsg);
						}
					};

					transaction.oncomplete = function () {
						jQuery.sap.log.debug("Cache Manager LRUPersistentCache: adding item with key [" + key + "]... done");
						resolve();
					};

					jQuery.sap.measure.start(sMsrOpeningStores, "CM", sMsrCatSet);
					objectStore = transaction.objectStore(self.defaultOptions._contentStoreName);
					objectMetadataStore = transaction.objectStore(self.defaultOptions._metadataStoreName);
					jQuery.sap.measure.end(sMsrOpeningStores);

					jQuery.sap.measure.start(sMsrPutContent, "CM", sMsrCatSet);
					objectStoreRequest = objectStore.put(oItem.oData, oItem.oData.key);
					jQuery.sap.measure.end(sMsrPutContent);
					jQuery.sap.measure.end(sMsrTotal);

					objectStoreRequest.onsuccess = function () {
						updateItemUsage(self, oItem);

						jQuery.sap.measure.start(sMsrPutMetadata, "CM", sMsrCatSet);
						objectMetadataStore.put(self._metadata, self.defaultOptions._metadataKey);
						jQuery.sap.measure.end(sMsrPutMetadata);
					};

					if (jQuery.sap.log.getLevel() >= jQuery.sap.log.LogLevel.DEBUG) {
						jQuery.sap.log.debug("Cache Manager LRUPersistentCache: measurements: "
							+ sMsrTotal + ": " + jQuery.sap.measure.getMeasurement(sMsrTotal).duration
							+ "; " + sMsrSerialize + ": " + jQuery.sap.measure.getMeasurement(sMsrSerialize).duration
							+ "; " + sMsrOpeningTx + ": " + jQuery.sap.measure.getMeasurement(sMsrOpeningTx).duration
							+ "; " + sMsrOpeningStores + ": " + jQuery.sap.measure.getMeasurement(sMsrOpeningStores).duration
							+ "; " + sMsrPutContent + ": " + jQuery.sap.measure.getMeasurement(sMsrPutContent).duration
							+ "; " + sMsrPutMetadata + ": " + jQuery.sap.measure.getMeasurement(sMsrPutMetadata).duration
						);
					}
				});
			},

			has: function (key) {
				if (keyMatchesExclusionStrings(key)) {
					jQuery.sap.log.warning("Cache Manager ignored 'has' for key [" + key + "]");
					return Promise.resolve(false);
				}
				return this.get(key).then(function (value) {
					return typeof value !== "undefined";
				});
			},

			/**
			 * Returns the current item count.
			 * @returns {Promise} a resolved Promise with value corresponding to the item count.
			 * @private
			 */
			_getCount: function () {
				return Promise.resolve(getItemCount(this));
			},

			/**
			 * Retrieves all items.
			 * @param {boolean} bDeserialize  whether to deserialize the content or not
			 * @returns {Promise} a promise that would be resolved in case of successful operation or rejected with
			 * value of the error message if the operation fails. When resolved the Promise will return the array of all
			 * entries in the following format: <code>{key: <myKey>, value: <myValue>}</code>
			 * @private
			 */
			_getAll: function (bDeserialize) {
				var self = this, oItem,
					sMsrDeserialize = "[sync ] _getAll: deserialize";

				return new Promise(function (resolve, reject) {
					var entries = [],
						transaction = self._db.transaction([self.defaultOptions._contentStoreName], "readonly"),
						objectStore = transaction.objectStore(self.defaultOptions._contentStoreName);

					transaction.onerror = function (event) {
						reject(collectErrorData(event));
					};

					transaction.oncomplete = function (event) {
						resolve(entries);
					};

					objectStore.openCursor().onsuccess = function (event) {
						var cursor = event.target.result;
						if (cursor && cursor.value) { //cursor.value is ItemData
							oItem = new Item(cursor.value, sMsrDeserialize, sMsrCatGet).deserialize();
							entries.push({
								key: oItem.oData.key,
								value: oItem.oData.value
							});
							cursor.continue();
						}
					};
				});
			},

			_loadMetaStructure: function () {
				var self = this;
				return new Promise(function (resolve, reject) {
					var transaction = self._db.transaction([self.defaultOptions._metadataStoreName], "readonly");

					transaction.onerror = function (event) {
						if (!transaction.errorHandled) {
							transaction.errorHandled = true;
							var sMessage = "Cache Manager cannot complete transaction for read metadata. Details: " + transaction.error;
							jQuery.sap.log.error(sMessage);
							reject(sMessage);
						}
					};

					var objectStore = transaction.objectStore(self.defaultOptions._metadataStoreName);

					try {
						var objectStoreRequest = objectStore.get(self.defaultOptions._metadataKey);
						objectStoreRequest.onsuccess = function (event) {
							self._metadata = objectStoreRequest.result ? objectStoreRequest.result : initMetadata(self._ui5version);
							if (self._metadata.__ui5version !== self._ui5version) {
								self.reset().then(resolve, function (e) {
									jQuery.sap.log.error("Cannot reset the cache. Details:" + e);
									transaction.abort();
								});
							} else {
								resolve();
							}
						};
						objectStoreRequest.onerror = function (event) {
							jQuery.sap.log.error("Cache Manager cannot complete transaction for read metadata items. Details: " + event.message);
							reject(event.message);
						};
					} catch (e) {
						jQuery.sap.log.error("Cache Manager cannot read metadata entries behind key: " + self.defaultOptions._metadataKey + ". Details: " + e.message);
						reject(e.message);
					}
				});
			},

			get: function (key) {
				if (keyMatchesExclusionStrings(key)) {
					jQuery.sap.log.warning("Cache Manager ignored 'get' for key [" + key + "]");
					return Promise.resolve();
				}
				return get(this, key);
			},

			del: function (key) {
				if (keyMatchesExclusionStrings(key)) {
					jQuery.sap.log.warning("Cache Manager ignored 'del' for key [" + key + "]");
					return Promise.resolve();
				}
				return del(this, key);
			},

			reset: function () {
				var self = this;
				return new Promise(function (resolve, reject) {
					var genericStore, metadataStore, clearGenericStoreReq, clearMetadataStoreReq, transaction;

					transaction = self._db.transaction([self.defaultOptions._contentStoreName, self.defaultOptions._metadataStoreName], "readwrite");
					transaction.onerror = transaction.onabort = function (event) {
						if (!transaction.errorHandled) {
							transaction.errorHandled = true;
							var sMessage = "Cache Manager LRUPersistentCache: transaction for reset() failed. Details: " + transaction.error;
							jQuery.sap.log.error(sMessage);
							reject(sMessage);
						}
					};
					transaction.oncomplete = function (event) {
						resolve();
					};

					genericStore = transaction.objectStore(self.defaultOptions._contentStoreName);
					metadataStore = transaction.objectStore(self.defaultOptions._metadataStoreName);

					try {
						clearGenericStoreReq = genericStore.clear();
						clearGenericStoreReq.onerror = function () {
							transaction.abort();
						};
						clearGenericStoreReq.onsuccess = function () {
							clearMetadataStoreReq = metadataStore.clear();
							clearMetadataStoreReq.onerror = function () {
								transaction.abort();
							};
							clearMetadataStoreReq.onsuccess = function () {
								self._metadata = initMetadata(sap.ui.version);
								assignRUCounters(self);
							};
						};
					} catch (e) {
						transaction.abort();
					}
				});
			}
		};

		var sMsrCatGet = "LRUPersistentCache,get",
			sMsrCatSet = "LRUPersistentCache,set",
			iMsrCounter = 0;

		function scheduleMetadataSave(self) {//an async store of the metadata , the caller should not be interested in the result, since no reporting status back is supported
			//locking both stores as no further modification is required. This will block any further metadata update and sets, but this is the way to keep the metadata consistent
			var transaction = self._db.transaction([self.defaultOptions._contentStoreName, self.defaultOptions._metadataStoreName], "readwrite");

			transaction.onerror = transaction.onabort = function (event) {
				jQuery.sap.log.warning("Cache Manager cannot persist the information about usage of an entry. This may lead to earlier removal of the entry if browser storage space is over. Details: " + transaction.error);
			};

			try {
				transaction.objectStore(self.defaultOptions._metadataStoreName).put(self._metadata, self.defaultOptions._metadataKey);
			} catch (e) {
				jQuery.sap.log.warning("Cache Manager cannot persist the information about usage of an entry. This may lead to earlier removal of the entry if browser storage space is over. Details: " + e.message);
			}
		}

		function del(self, key) {
			return new Promise(function (resolve, reject) {
				var tx, oMetadataBackup;

				tx = self._db.transaction([self.defaultOptions._contentStoreName, self.defaultOptions._metadataStoreName], "readwrite");
				oMetadataBackup = cloneMetadata(self._metadata);

				function errorHandler(event) {
					self._metadata = oMetadataBackup;
					assignRUCounters(self);

					var sMessage = "Cache Manager LRUPersistentCache: cannot delete item with key: " + key + ". Details: " + collectErrorData(event);
					jQuery.sap.log.error(sMessage);

					reject(sMessage);
				}

				tx.onerror = errorHandler;
				tx.onabort = errorHandler;

				tx.oncomplete = function () {
					// The cache is empty so its obvious we can reset the counters
					if (getItemCount(self) === 0) {
						self._lru = -1;
						self._mru = -1;

						self._metadata = initMetadata(self._ui5version);
					}

					jQuery.sap.log.debug("Cache Manager LRUPersistentCache: item with key " + key + " deleted");
					resolve();
				};

				jQuery.sap.log.debug("Cache Manager LRUPersistentCache: deleting item [" + key + "]");
				var oDeleteRst = tx.objectStore(self.defaultOptions._contentStoreName).delete(key);

				oDeleteRst.onsuccess = function () {
					jQuery.sap.log.debug("Cache Manager LRUPersistentCache: request for deleting item [" + key + "] is successful, updating metadata...");
					deleteMetadataForEntry(self, key);
					tx.objectStore(self.defaultOptions._metadataStoreName).put(self._metadata, self.defaultOptions._metadataKey);
				};
			});
		}

		function get(self, key) {
			if (self.getCounter === undefined) {
				self.getCounter = 0;
			}
			self.getCounter++;
			var sMsrTotal = "[sync ] fnGet" + self.getCounter + ": total[sync]  key [" + key + "]",
				sMsrOpeningTx = "[sync ] fnGet" + self.getCounter + ": txStart[sync]  key [" + key + "]",
				sMsrOpeningStores = "[sync ] fnGet" + self.getCounter + ": storeOpen[sync]  key [" + key + "]",
				sMsrAccessingResult = "[sync ] fnGet" + self.getCounter + ": access result[sync]  key [" + key + "]",
				sMsrPutMetadata = "[sync ] fnGet" + self.getCounter + ": putMetadata[sync]  key [" + key + "]",
				sMsrDeserialize = "[sync ] fnGet" + self.getCounter + ": deserialize[sync]  key [" + key + "]",
				sMsrImplementationGet = "[sync ]  _instance.get",
				sMsrGetRequestOnSuccess = "[sync ]  getRequest.onSuccess";

			jQuery.sap.log.debug("Cache Manager LRUPersistentCache: get for key [" + key + "]...");
			jQuery.sap.measure.start(sMsrImplementationGet, "CM", sMsrCatGet);


			var p = new Promise(function fnGet(resolve, reject) {
				var result, transaction, getRequest, oItem;

				jQuery.sap.measure.start(sMsrTotal, "CM", sMsrCatGet);
				jQuery.sap.measure.start(sMsrOpeningTx, "CM", sMsrCatGet);

				transaction = self._db.transaction([self.defaultOptions._contentStoreName, self.defaultOptions._metadataStoreName], "readwrite");
				jQuery.sap.measure.end(sMsrOpeningTx);

				transaction.onerror = function (event) {
					var sMessage = "Cache Manager cannot complete delete transaction for entry with key: " + key + ". Details: " + transaction.error;
					jQuery.sap.log.error(sMessage);
					reject(sMessage);
				};

				try {
					jQuery.sap.measure.start(sMsrOpeningStores, "CM", sMsrCatGet);
					getRequest = transaction.objectStore(self.defaultOptions._contentStoreName).get(key);
					jQuery.sap.measure.end(sMsrOpeningStores);

					getRequest.onsuccess = function (event) {
						jQuery.sap.measure.start(sMsrGetRequestOnSuccess, "CM", sMsrCatGet);

						jQuery.sap.measure.start(sMsrAccessingResult, "CM", sMsrCatGet);
						oItem = new Item(getRequest.result, sMsrDeserialize, sMsrCatGet);
						jQuery.sap.measure.end(sMsrAccessingResult);

						debugMsr("Cache Manager LRUPersistentCache: accessing the result", key, sMsrAccessingResult);

						if (oItem.oData) {
							jQuery.sap.measure.start(sMsrPutMetadata, "CM", sMsrCatGet);

							if (oItem.oData.lu !== self._mru) { // Update the usage data only if the item is not already the most used one
								oItem.oData.lu = ++self._mru;
								updateItemUsage(self, oItem);
								scheduleMetadataSave(self); //postponed as update of the metadata is not crucial here
							}

							jQuery.sap.measure.end(sMsrPutMetadata);
							result = oItem.deserialize().oData.value;
						}
						jQuery.sap.measure.end(sMsrGetRequestOnSuccess);
						jQuery.sap.log.debug("Cache Manager LRUPersistentCache: get for key [" + key + "]...done");
						resolve(result); // whatever it is (null, undefined, real value from the storage) - we return it back
					};
					getRequest.onerror = function (event) {
						jQuery.sap.log.error("Cache Manager cannot get entry with key: " + key + ". Details: " + event.message);
						reject(event.message);
					};
				} catch (e) {
					jQuery.sap.log.error("Cache Manager cannot get entry with key: " + key + ". Details: " + e.message);
					reject(e.message);
					return;
				}
				jQuery.sap.measure.end(sMsrTotal);
			});

			jQuery.sap.measure.end(sMsrImplementationGet);
			return p;
		}

		function deleteItemAndUpdateMetadata(self) {
			var vKeyToDelete = getNextItemToDelete(self);

			if (vKeyToDelete == undefined) {
				var sErrMsg = "Cache Manager LRUPersistentCache: deleteItemAndUpdateMetadata cannot find item to delete";
				jQuery.sap.log.debug(sErrMsg);
				return Promise.reject(sErrMsg);
			}

			return internalDel(self, vKeyToDelete).then(function () {
				return Promise.resolve().then(function () {
					deleteMetadataForEntry(self, vKeyToDelete);
					return persistMetadata(self).then(function () {
						return vKeyToDelete;
					}, function () {
						jQuery.sap.log.warning("Cache Manager LRUPersistentCache: Free space algorithm deleted item " +
							"but the metadata changes could not be persisted. This won't break the functionality.");
						return vKeyToDelete;
					});
				});
			});
		}

		function persistMetadata(self) {
			return new Promise(function (resolve, reject) {
				try {
					var tx = self._db.transaction([self.defaultOptions._contentStoreName, self.defaultOptions._metadataStoreName], "readwrite");

					tx.onerror = errorHandler;
					tx.onabort = errorHandler;

					tx.oncomplete = function () {
						jQuery.sap.log.debug("Cache Manager LRUPersistentCache: persistMetadata - metadata was successfully updated");
						resolve();
					};

					tx.objectStore(self.defaultOptions._metadataStoreName).put(self._metadata, self.defaultOptions._metadataKey);
				} catch (e) {
					errorHandler(null, e);
				}

				function errorHandler(event, exception) {
					var sErrMsg = "Cache Manager LRUPersistentCache: persistMetadata error - metadata was not successfully persisted. Details: " +
						collectErrorData(event) + ". Exception: " + (exception ? exception.message : "");
					jQuery.sap.log.debug(sErrMsg);
					reject(sErrMsg);
				}
			});
		}

		function internalDel(self, key) {
			return new Promise(function (resolve, reject) {
				var tx = self._db.transaction([self.defaultOptions._contentStoreName, self.defaultOptions._metadataStoreName], "readwrite");

				function errorHandler(event) {
					var sMessage = "Cache Manager LRUPersistentCache: internalDel cannot complete delete transaction for entry with key: "
						+ key + ". Details: " + collectErrorData(event);
					jQuery.sap.log.warning(sMessage);
					reject(event);
				}

				tx.onerror = errorHandler;
				tx.onabort = errorHandler;

				tx.oncomplete = function () {
					// The cache is empty so its obvious we can reset the counters
					if (getItemCount(self) === 0) {
						self._lru = 0;
						self._mru = 0;

						self._metadata = initMetadata(self._ui5version);
					}

					jQuery.sap.log.debug("Cache Manager LRUPersistentCache: internalDel deleting item [" + key + "]...done");
					resolve();
				};

				jQuery.sap.log.debug("Cache Manager LRUPersistentCache: internalDel deleting item [" + key + "]...");
				tx.objectStore(self.defaultOptions._contentStoreName).delete(key);
			});
		}

		function internalSet(self, key, value) {
			return new Promise(function (resolve, reject) {

					var objectStoreRequest,
						transaction, backupMetadata,
						sMsrSerialize = "[sync ] internalSet: serialize[sync]  key [" + key + "]";

					backupMetadata = cloneMetadata(self._metadata);
					var oItem = new Item(key, value, typeof value, ++self._mru, sMsrSerialize, sMsrCatSet).serialize();
					jQuery.sap.log.debug("Cache Manager: LRUPersistentCache: internal set with parameters: key [" + oItem.oData.key + "], access index [" + oItem.oData.lu + "]");

					//store in database
					transaction = self._db.transaction([self.defaultOptions._contentStoreName, self.defaultOptions._metadataStoreName], "readwrite");

					transaction.onerror = errorHandler;
					transaction.onabort = errorHandler;

					function errorHandler(event) {
						jQuery.sap.log.debug("Cache Manager: LRUPersistentCache: internal set failed. Details: " + collectErrorData(event));
						self._metadata = backupMetadata;
						assignRUCounters(self);
						reject(event);
					}

					transaction.oncomplete = function () {
						jQuery.sap.log.debug("Cache Manager: LRUPersistentCache: Internal set transaction completed. ItemCount: " + getItemCount(self));
						resolve();
					};

					objectStoreRequest = transaction.objectStore(self.defaultOptions._contentStoreName).put(oItem.oData, oItem.oData.key);

					objectStoreRequest.onsuccess = function () {
						updateItemUsage(self, oItem);
						transaction.objectStore(self.defaultOptions._metadataStoreName).put(self._metadata, self.defaultOptions._metadataKey);
					};
				}
			);
		}

		/**
		 * Set/updates item's usage by setting LRU indexes and moves the LRU pointer if needed.
		 * @param {sap.ui.core.cache.LRUPersistenceCache} self the <code>this</code> instance
		 * @param {Item} oItem the item to update indexes for
		 */
		function updateItemUsage(self, oItem) {
			if (self._metadata.__byKey__[oItem.oData.key] != null) { // ItemData already exists, we need to remove the old position index
				var oldIndex = self._metadata.__byKey__[oItem.oData.key];
				delete self._metadata.__byIndex__[oldIndex];
				jQuery.sap.log.debug("Cache Manager LRUPersistentCache: set/internalset - item already exists, so its indexes are updated");
			}
			self._metadata.__byIndex__[oItem.oData.lu] = oItem.oData.key;
			self._metadata.__byKey__[oItem.oData.key] = oItem.oData.lu;

			seekMetadataLRU(self);
		}

		function initIndexedDB(instance) {
			instance._ui5version = sap.ui.version;
			return new Promise(function executorInitIndexedDB(resolve, reject) {
				var DBOpenRequest;

				jQuery.sap.log.debug("Cache Manager " + "_initIndexedDB started");

				function openDB() {
					try {
						DBOpenRequest = window.indexedDB.open(instance.defaultOptions.databaseName, 1);
					} catch (e) {
						jQuery.sap.log.error("Could not open Cache Manager database. Details: " + e.message);
						reject(e.message);
					}
				}

				openDB();
				DBOpenRequest.onerror = function (event) {
					jQuery.sap.log.error("Could not initialize Cache Manager database. Details: " + event.message);
					reject(event.error);
				};

				DBOpenRequest.onsuccess = function (event) {
					var oMsr = startMeasurements("init_onsuccess");
					instance._db = DBOpenRequest.result;
					instance._db.onversionchange = function (event) {
						if (!event.newVersion) { /* Means database is about to be deleted. See http://www.w3.org/TR/IndexedDB/#dfn-steps-for-deleting-a-database */
							event.target.close();
						}
					};
					instance._loadMetaStructure().then(
						function () {
							jQuery.sap.log.debug("Cache Manager " + " metadataLoaded. Serialization support: " + isSerializationSupportOn() + ", resolving initIndexDb promise");
							resolve(instance);
						}, reject);
					oMsr.endSync();
				};

				DBOpenRequest.onupgradeneeded = function (event) {
					var db = event.target.result;
					db.onerror = function (event) {
						jQuery.sap.log.error("Cache Manager error. Details: " + event.message);
						reject(db.error);
					};
					try {
						var objectStore = db.createObjectStore(instance.defaultOptions._contentStoreName);
						db.createObjectStore(instance.defaultOptions._metadataStoreName);
					} catch (e) {
						jQuery.sap.log.error("Could not initialize Cache Manager object store. Details: " + e.message);
						throw e;
					}

					objectStore.createIndex("ui5version", "ui5version", {unique: false});
				};
			});
		}


		function ItemData(key, value, type, lastUsedIndex) {
			this.key = key;
			this.sOrigType = type;
			this.value = value;
			this.lu = lastUsedIndex;
		}

		function Item(key, value, type, lastUsedIndex, sMeasureId, sMsrCat) {
			if (arguments.length === 3) { //ItemData constructor, usually used when getting ItemData from DB
				this.oData = key;
				this.sMeasureId = value;
				this.sMsrCat = type;
			} else { //
				this.oData = new ItemData(key, value, type, lastUsedIndex);
			}
		}
		/**
		 * Deserializes the value if serialization support is switched on
		 * @returns {Item} <code>this</code>
		 */
		Item.prototype.deserialize = function () {
			if (isSerializationSupportOn() && this.oData.sOrigType === "object") {
				jQuery.sap.measure.start(this.sMeasureId, this.sMeasureId, this.sMsrCat);
				this.oData.value = JSON.parse(this.oData.value);
				jQuery.sap.measure.end(this.sMeasureId);

				debugMsr("Cache Manager LRUPersistentCache: de-serialization the result", this.oData.key, this.sMeasureId);
			}
			return this;
		};

		/**
		 * Serializes the value if serialization support is switched on
		 * @returns {Item} <code>this</code>
		 */
		Item.prototype.serialize = function () {
			if (isSerializationSupportOn() && this.oData.sOrigType === "object") {
				jQuery.sap.measure.start(this.sMeasureId, this.sMeasureId, this.sMsrCat);
				this.oData.value = JSON.stringify(this.oData.value);
				jQuery.sap.measure.end(this.sMeasureId);

				debugMsr("Cache Manager LRUPersistentCache: serialization of the value", this.oData.key, this.sMeasureId);
			}
			return this;
		};


		function initMetadata(ui5version) {
			return {
				__byKey__: {},
				__byIndex__: {},
				__ui5version: ui5version
			};
		}

		/**
		 * Clones a given metadata instance
		 * @param source the instance to clone
		 * @returns {*} cloned metadata
		 */
		function cloneMetadata(source) {
			var backupMetadata = initMetadata(source.__ui5version);
			for (var index in source.__byIndex__) {
				backupMetadata.__byIndex__[index] = source.__byIndex__[index];
			}
			for (var key in source.__byKey__) {
				backupMetadata.__byKey__[key] = source.__byKey__[key];
			}
			return backupMetadata;
		}

		function assignRUCounters(self) {
			var lrumru = computeLRUMRU(self._metadata.__byIndex__);
			self._mru = lrumru.mru;
			self._lru = lrumru.lru;

			jQuery.sap.log.debug("Cache Manager LRUPersistentCache: LRU counters are assigned to the CM: " + JSON.stringify(lrumru));
		}

		function getItemCount(self) {
			return Object.keys(self._metadata.__byKey__).length;
		}

		function getNextItemToDelete(self) {
			var oKey = self._metadata.__byIndex__[self._lru];
			if (oKey == undefined && !seekMetadataLRU(self)) {
				return null;
			} else {
				//LRU is moved to an existing item by seekMetadataLRU
				return self._metadata.__byIndex__[self._lru];
			}
		}

		function computeLRUMRU(lruIndexes) {
			var i = -1, mru = -1, lru = Number.MAX_VALUE,
				aLruIndexKeys = Object.keys(lruIndexes),
				iLength = aLruIndexKeys.length;

			if (iLength === 0) {
				return {mru: -1, lru: -1};
			} else {
				while (++i < iLength) {
					var iIndex = parseInt(aLruIndexKeys[i], 10);
					if (mru < iIndex) {
						mru = iIndex;
					}
					if (lru > iIndex) {
						lru = iIndex;
					}
				}
				return {mru: mru, lru: lru};
			}
		}

		/**
		 * Tries to free space until the given new item is successfully added.
		 * @param {sap.ui.core.cache.LRUPersistentCache} self the instance of the Cache Manager
		 * @param {ItemData} oItem the item to free space for
		 * @returns {Window.Promise} a promise that will resolve if the given item is added, or reject - if not.
		 */
		function cleanAndStore(self, key, value) {
			return new Promise(function (resolve, reject) {
				var attempt = 0;

				_cleanAndStore(self, key, value);

				function _cleanAndStore(self, key, value) {
					attempt++;
					jQuery.sap.log.debug("Cache Manager LRUPersistentCache: cleanAndStore: freeing space attempt [" + (attempt) + "]");

					deleteItemAndUpdateMetadata(self).then(function (deletedKey) {
						jQuery.sap.log.debug("Cache Manager LRUPersistentCache: cleanAndStore: deleted item with key [" + deletedKey + "]. Going to put " + key);
						return internalSet(self, key, value).then(resolve, function (event) {
							if (isQuotaExceeded(event)) {
								jQuery.sap.log.debug("Cache Manager LRUPersistentCache: cleanAndStore: QuotaExceedError during freeing up space...");
								if (getItemCount(self) > 0) {
									_cleanAndStore(self, key, value);
								} else {
									reject("Cache Manager LRUPersistentCache: cleanAndStore: even when the cache is empty, the new item with key [" + key + "] cannot be added");
								}
							} else {
								reject("Cache Manager LRUPersistentCache: cleanAndStore: cannot free space: " + collectErrorData(event));
							}
						});
					}, reject);
				}
			});
		}

		function isQuotaExceeded(event) {
			return (event && event.target && event.target.error && event.target.error.name === "QuotaExceededError");
		}

		/**
		 * Deletes all metadata for given key
		 * @param self the instance
		 * @param key the key for the entry
		 */
		function deleteMetadataForEntry(self, key) {
			var iIndex = self._metadata.__byKey__[key];
			delete self._metadata.__byKey__[key];
			delete self._metadata.__byIndex__[iIndex];
			seekMetadataLRU(self);
		}

		/**
		 * Moves the pointer of LRU to the next available (non-empty) item starting from the current position.
		 * @returns {boolean} true if the seek moved the pointer to an existing item, false - if no item is found
		 */
		function seekMetadataLRU(self) {
			while (self._lru <= self._mru && self._metadata.__byIndex__[self._lru] == undefined) {
				self._lru++;
			}
			// The lru should never skip item. So current value should always point to the 1st (numeric order) non-empty
			// item in self._metadata.__byIndex map
			return (self._lru <= self._mru);
		}

		function collectErrorData(event) {
			if (!event) {
				return "";
			}
			var sResult = event.message;
			if (event.target && event.target.error && event.target.error.name) {
				sResult += " Error name: " + event.target.error.name;
			}
			return sResult;
		}

		function isSerializationSupportOn() {
			return sap.ui.getCore().getConfiguration().isUI5CacheSerializationSupportOn();
		}

		function getExcludedKeys() {
			return sap.ui.getCore().getConfiguration().getUI5CacheExcludedKeys();
		}

		/**
		 * Checks whether given key matches any item in the set of excluded keys.
		 * The matching utilizes "wildcard string comparison" and is case sensitive.
		 * @param key the key to check
		 * @returns {boolean} true if the key matches at least ont of the set of the excluded keys
		 * @private
		 */
		function keyMatchesExclusionStrings(key) {
			return getExcludedKeys().some(function (excludedKey) {
				return key.indexOf(excludedKey) > -1;
			});
		}

		function startMeasurements(sOperation, key) {
			iMsrCounter++;
			var sMeasureAsync = "[async]  " + sOperation + "[" + key + "]- #" + (iMsrCounter),
				sMeasureSync = "[sync ]  " + sOperation + "[" + key + "]- #" + (iMsrCounter);

			jQuery.sap.measure.start(sMeasureAsync, "CM", ["LRUPersistentCache", sOperation]);
			jQuery.sap.measure.start(sMeasureSync, "CM", ["LRUPersistentCache", sOperation]);

			return {
				sMeasureAsync: sMeasureAsync,
				sMeasureSync: sMeasureSync,
				endAsync: function () {
					jQuery.sap.measure.end(this.sMeasureAsync);
				},
				endSync: function () {
					jQuery.sap.measure.end(this.sMeasureSync);
				}
			};
		}

		/**
		 * Logs a debug message related to certain measurement if log level is debug or higher
		 * @param {string} sMsg the message
		 * @param {string} sKey the key to log message for
		 * @param {string} sMsrId the measurementId to use for obtaining the jquery.sap.measure measurement
		 */
		function debugMsr(sMsg, sKey, sMsrId) {
			//avoid redundant string concatenation & getMeasurement call
			if (jQuery.sap.log.getLevel() >= jQuery.sap.log.LogLevel.DEBUG) {
				jQuery.sap.log.debug(sMsg + " for key [" + sKey + "] took: " + jQuery.sap.measure.getMeasurement(sMsrId).duration);
			}
		}

		return LRUPersistentCache;
	}, /* bExport= */false);

