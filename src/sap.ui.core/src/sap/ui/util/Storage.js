/*!
 * ${copyright}
 */
sap.ui.define(["sap/base/assert"], function(assert) {
	"use strict";


	var fnStorage = function() {

		/**
		 * Prefix added to all storage keys (typically IDs) passed by the applications
		 * when they are calling state storage methods. The goal of such prefix is to
		 * leave space for saving data (with the same key) and also for scenarios other than
		 * state saving.
		 * @public
		 */
		var sStateStorageKeyPrefix = "state.key_";

		/**
		 * @interface A Storage API for JavaScript.
		 *
		 * Provides methods to store data on the client using Web Storage API support by the browser. The data
		 * received by this API must be already serialized, in string format. Similarly, the API returns the retrieved
		 * data in serialized string format, so it is the responsibility of the caller to de-serialize it, if applicable.
		 *
		 * <b>Note:</b> The Web Storage API stores the data on the client. Therefore do not use this API for confidential information.
		 *
		 * You can get access to the 'default' storage by using {@link sap/ui/util/Storage} directly
		 * or alternatively via factory functionality available as <code>sap.ui.require(["sap/ui/util/Storage"],function(storage){storage(storage.Type.session);});</code>
		 * returning an object implementing this interface.
		 *
		 * A typical intended usage of this API is the storage of a string representing the state of a control.
		 * In such usage, the data is stored in the browser session, and
		 * the methods to be used are {@link #put} and {@link #get}.
		 * The method {@link #remove} can be used to delete the previously saved state.
		 *
		 * In sake of completeness, the method {@link #clear} is available.
		 * However, it should be called only in very particular situations,
		 * when a global erasing of data is required. If only keys with certain prefix
		 * should be deleted the method {@link #removeAll} should be used.
		 *
		 * @author SAP SE
		 * @version ${version}
		 * @public
		 * @alias module:sap/ui/util/Storage
		 */

		/**
		 * Constructor for an instance of {@link module:sap/ui/util/Storage}.
		 *
		 * @param {module:sap/ui/util/Storage.Type | Storage} [pStorage=sap/ui/util/Storage.Type.session] The type this storage should be of or an Object implementing the typical Storage API for direct usage.
		 * @param {string} [sStorageKeyPrefix='state.key_'] The prefix to use in this storage.
		 * @public
		 */
		var fnCreateStorage = function(pStorage, sStorageKeyPrefix) {

			var sType = "unknown",
				sPrefix = sStorageKeyPrefix || sStateStorageKeyPrefix;
			sPrefix += "-";
			var sTestKey = sPrefix + "___sapui5TEST___",
				oStorage;

			if (!pStorage || typeof (pStorage) === "string") {
				sType = pStorage || "session";
				try {
					oStorage = window[sType + "Storage"];
				} catch (e) {
					oStorage = null;
				}
				try { // Test for QUOTA_EXCEEDED_ERR (Happens e.g. in mobile Safari when private browsing active)
					if (oStorage) {
						oStorage.setItem(sTestKey, "1");
						oStorage.removeItem(sTestKey);
					}
				} catch (e) {
					oStorage = null;
				}
			} else if (typeof (pStorage) === "object") {
				sType = pStorage.getType ? pStorage.getType() : "unknown";
				oStorage = pStorage;
			}

			var bStorageAvailable = !!oStorage;

			/**
			 * Returns whether the given storage is suppported.
			 *
			 * @return {boolean} true if storage is supported, false otherwise (e.g. due to browser security settings)
			 * @public
			 * @function
			 */
			this.isSupported = function() {
				if (!bStorageAvailable) { //No storage available at all or not accessible
					return false;
				}
				if (typeof (oStorage.isSupported) == "function") { //Possibility to define for custom storage
					return oStorage.isSupported();
				}
				return true;
			};

			/**
			 * Stores the passed state string in the session, under the key sStorageKeyPrefix + sId.
			 *
			 * sStorageKeyPrefix is the ID prefix defined for the storage instance (@see sap/ui/util/Storage)
			 *
			 * @param {string} sId ID for the state to store
			 * @param {string} sStateToStore Content to store
			 * @return {boolean} true if the data were successfully stored, false otherwise
			 * @public
			 * @function
			 */
			this.put = function(sId, sStateToStore) {
				//precondition: non-empty sId and available storage feature
				assert(typeof sId === "string" && sId, "sId must be a non-empty string");
				if (this.isSupported() && sId) {
					try {
						oStorage.setItem(sPrefix + sId, JSON.stringify(sStateToStore));
						return true;
					} catch (e) {
						return false;
					}
				} else {
					return false;
				}
			};

			/**
			 * Retrieves the state string stored in the session under the key sStorageKeyPrefix + sId.
			 *
			 * sStorageKeyPrefix is the ID prefix defined for the storage instance (@see sap/ui/util/Storage)
			 *
			 * @param {string} sId ID for the state to retrieve
			 * @return {string} The string from the storage, if the retrieval was successful, and null otherwise
			 * @public
			 * @function
			 */
			this.get = function(sId) {
				//precondition: non-empty sId and available storage feature
				assert(typeof sId === "string" && sId, "sId must be a non-empty string");
				if (this.isSupported() && sId ) {
					try {
						var sItem = oStorage.getItem(sPrefix + sId);
						return JSON.parse(sItem);
					} catch (e) {
						return null;
					}
				} else {
					return null;
				}
			};

			/**
			 * Deletes the state string stored in the session under the key sStorageKeyPrefix + sId.s.
			 *
			 * sStorageKeyPrefix is the ID prefix defined for the storage instance (@see sap/ui/util/Storage)
			 *
			 * @param {string} sId ID for the state to delete
			 * @return {boolean} true if the deletion
			 * was successful or the data doesn't exist under the specified key,
			 * and false if the feature is unavailable or a problem occurred
			 * @public
			 * @function
			 */
			this.remove = function(sId) {
				//precondition: non-empty sId and available storage feature
				assert(typeof sId === "string" && sId, "sId must be a non-empty string");
				if (this.isSupported() && sId) {
					try {
						oStorage.removeItem(sPrefix + sId);
						return true;
					} catch (e) {
						return false;
					}
				} else {
					return false;
				}
			};

			/**
			 * Deletes all state strings stored in the session under the key prefix sStorageKeyPrefix + sIdPrefix.
			 *
			 * sStorageKeyPrefix is the ID prefix defined for the storage instance (@see sap/ui/util/Storage)
			 *
			 * @param {string} sIdPrefix ID prefix for the states to delete
			 * @return {boolean} true if the deletion
			 * was successful or the data doesn't exist under the specified key,
			 * and false if the feature is unavailable or a problem occurred
			 * @public
			 * @function
			 */
			this.removeAll = function(sIdPrefix) {
				//precondition: available storage feature
				if (this.isSupported() && oStorage.length && typeof oStorage.key === "function") {
					try {
						var len = oStorage.length;
						var aKeysToRemove = [];
						var key, i;
						var p = sPrefix + (sIdPrefix || "");
						for (i = 0; i < len; i++) {
							key = oStorage.key(i);
							if (key && key.indexOf(p) == 0) {
								aKeysToRemove.push(key);
							}
						}

						for (i = 0; i < aKeysToRemove.length; i++) {
							oStorage.removeItem(aKeysToRemove[i]);
						}

						return true;
					} catch (e) {
						return false;
					}
				} else {
					return false;
				}
			};

			/**
			 * Deletes all the entries saved in the session (Independent of the current Storage instance!).
			 *
			 * <b>CAUTION</b> This method should be called only in very particular situations,
			 * when a global erasing of data is required. Given that the method deletes
			 * the data saved under any ID, it should not be called when managing data
			 * for specific controls.
			 *
			 * @return {boolean} true if execution of removal
			 * was successful or the data to remove doesn't exist,
			 * and false if the feature is unavailable or a problem occurred
			 * @public
			 * @function
			 */
			this.clear = function() {
				//precondition: available storage feature
				if (this.isSupported()) {
					try {
						oStorage.clear();
						return true;
					} catch (e) {
						return false;
					}
				} else {
					return false;
				}
			};

			/**
			 * Returns the type of the storage.
			 *
			 * @returns {sap/ui/util/Storage.Type | string} The type of the storage or "unknown"
			 * @public
			 * @function
			 */
			this.getType = function(){
				return sType;
			};
		};

		/**
		 * A map holding instances of different 'standard' storages.
		 * Used to limit number of created storage objects.
		 * @private
		 */
		var mStorages = {};

		var oExportStorage = {

			/**
			 * Returns a {@link sap/ui/util/Storage.Storage Storage} object for a given HTML5 storage (type) and,
			 * as a convenience, provides static functions to access the default (session) storage.
			 *
			 * When called as a function, it returns an instance of {@link sap/ui/util/Storage.Storage}, providing access
			 * to the storage of the given {@link sap/ui/util/Storage.Type} or to the given HTML5 Storage object.
			 *
			 * The default session storage can be easily accessed with methods {@link sap/ui/util/Storage.get},
			 * {@link sap/ui/util/Storage.put}, {@link sap/ui/util/Storage.remove}, {@link sap/ui/util/Storage.clear},
			 * {@link sap/ui/util/Storage.getType} and {@link sap/ui/util/Storage.removeAll}
			 *
			 * @param {sap/ui/util/Storage.Type | Storage} oStorage The type specifying the storage to use or
			 * an object implementing the browser's Storage API.
			 * @param {string} [sIdPrefix] Prefix used for the IDs. If not set a default prefix is used.
			 * @returns {module:sap/ui/util/Storage.Storage} A storage instance
			 * @version ${version}
			 * @namespace
			 * @function
			 * @public
			 *
			 * @borrows sap/ui/util/Storage.Storage#get as get
			 * @borrows sap/ui/util/Storage.Storage#put as put
			 * @borrows sap/ui/util/Storage.Storage#remove as remove
			 * @borrows sap/ui/util/Storage.Storage#clear as clear
			 * @borrows sap/ui/util/Storage.Storage#getType as getType
			 * @borrows sap/ui/util/Storage.Storage#removeAll as removeAll
			 * @borrows sap/ui/util/Storage.Storage#isSupported as isSupported
			 */
			getInstance: function(oStorage, sIdPrefix) {
				// if nothing or the default was passed in, simply return ourself
				if (!oStorage) {
					oStorage = fnStorage.Type.session;
				}

				if (typeof (oStorage) === "string" && fnStorage.Type[oStorage]) {
					var sKey = oStorage;
					if (sIdPrefix && sIdPrefix != sStateStorageKeyPrefix) {
						sKey = oStorage + "_" + sIdPrefix;
					}

					return mStorages[sKey] || (mStorages[sKey] = new fnCreateStorage(oStorage, sIdPrefix));
				}

				// OK, tough but probably good for issue identification. As something was passed in, let's at least ensure our used API is fulfilled.
				assert(oStorage instanceof Object && oStorage.clear && oStorage.setItem && oStorage.getItem && oStorage.removeItem, "storage: duck typing the storage");
				return new fnCreateStorage(oStorage, sIdPrefix);
			}

		};

		// ensure the storage constructor applied to our storage object
		fnCreateStorage.apply(oExportStorage.getInstance);
		mStorages[fnStorage.Type.session] = oExportStorage.getInstance;

		return oExportStorage;

	};

	/**
	 * Enumeration of the storage types supported by {@link sap/ui/util/Storage.Storage}.
	 *
	 * @enum {string}
	 * @public
	 * @version ${version}
	 */
	fnStorage.Type = {
		/**
		 * Indicates usage of the browser's localStorage feature
		 * @public
		 */
		local: "local",
		/**
		 * Indicates usage of the browser's sessionStorage feature
		 * @public
		 */
		session: "session"
	};

	/**
	 * @static
	 * @alias module:sap/ui/util/Storage
	 * @public
	 */
	var oStorage = fnStorage();
	oStorage.Type = fnStorage.Type;
	return oStorage;
});