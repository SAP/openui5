/*!
 * ${copyright}
 */
/*
 * IMPORTANT: This is a private module, its API must not be used and is subject to change.
 * Code other than the OpenUI5 libraries must not introduce dependencies to this module.
 */
sap.ui.define(["sap/base/assert"], function (assert) {
	"use strict";


	/**
	 * Prefix added to all storage keys. The prefix is used as namespace for data using the same key.
	 *
	 * @private
	 */
	var STATE_STORAGE_KEY_PREFIX = "state.key_";

	/**
	 * @class A Storage API for JavaScript.
	 *
	 * <b>Note:</b> The Web Storage API stores the data on the client. Therefore, you must not use this API for confidential information.
 	 *
	 * Provides a unified interface and methods to store data on the client using the Web Storage API or a custom implementation.
	 * By default, data can be persisted inside localStorage or a sessionStorage.
	 *
	 * You can access the 'default' storage by using {@link module:sap/ui/util/Storage} methods
	 * static on the module export or by creating an own instance of Storage via the constructor.
	 *
	 * A typical intended usage of this API is the storage of a string representing the state of
	 * a control. In this case, the data is stored in the browser session, and the methods to be
	 * used are {@link #put} and {@link #get}. The method {@link #remove} can be used to delete
	 * the previously saved state.
	 *
	 * For the sake of completeness, the method {@link #clear} is available. However, it should be
	 * called only in very particular situations, when a global erasing of data is required. If
	 * only keys with certain prefix should be deleted, the method {@link #removeAll} should be
	 * used.
	 *
	 * @example
	 * <pre>
	 * // Default Storage
	 * sap.ui.require(["sap/ui/util/Storage"], function(Storage) {
	 *  Storage.get("stored_data");
	 * });
	 * </pre>
	 * @example
	 * <pre>
	 * // Storage Instance
	 * sap.ui.require(["sap/ui/util/Storage"], function(Storage) {
	 *  var oMyStorage = new Storage(Storage.Type.session, "my_prefix");
	 *  oMyStorage.put("stored_data", "{ state: 'active' }");
	 *  oMyStorage.get("stored_data");
	 * });
	 * </pre>
	 * @since 1.58
	 * @alias module:sap/ui/util/Storage
	 * @param {module:sap/ui/util/Storage.Type | Storage} [pStorage=module:sap/ui/util/Storage.Type.session] The type this storage should be of or an Object implementing the typical Storage API for direct usage.
	 * @param {string} [sStorageKeyPrefix='state.key_'] The prefix to use in this storage.
	 * @public
	 */
	var Storage = function (pStorage, sStorageKeyPrefix) {

		var sType = "unknown",
			sPrefix = (sStorageKeyPrefix || STATE_STORAGE_KEY_PREFIX) + "-",
			oStorageImpl;

		if (!pStorage || typeof (pStorage) === "string") {
			sType = pStorage || Storage.Type.session;
			try {
				oStorageImpl = window[sType + "Storage"];
				// Test for QUOTA_EXCEEDED_ERR (Happens e.g. in mobile Safari when private browsing active)
				if (oStorageImpl) {
					var sTestKey = sPrefix + "___sapui5TEST___";
					oStorageImpl.setItem(sTestKey, "1");
					oStorageImpl.removeItem(sTestKey);
				}
			} catch (e) {
				oStorageImpl = null;
			}
		} else if (typeof (pStorage) === "object") {
			sType = pStorage.getType ? pStorage.getType() : "unknown";
			oStorageImpl = pStorage;
		}

		/**
		 * Helper function for function execution ignoring errors and checking for support.
		 *
		 * @param {function} fnToExecute
		 * @returns {boolean}
	 	*/
		var hasExecuted = function (fnToExecute) {
			try {
				if (this.isSupported()) {
					fnToExecute();
					return true;
				}
			} catch (e) {
				return false;
			}

			return false;

		}.bind(this);

		/**
		 * Returns whether the given storage is supported.
		 *
		 * @return {boolean} true if storage is supported, false otherwise (e.g. due to browser security settings)
		 * @public
		 * @function
		 * @name module:sap/ui/util/Storage#isSupported
		 */
		this.isSupported = function () {
			//Possibility to define for custom storage
			return typeof (oStorageImpl.isSupported) == "function" ? oStorageImpl.isSupported() : true;
		};

		/**
		 * Add key to the storage or updates value if the key already exists.
		 *
		 * @param {string} sKey key to create
		 * @param {string} sValue value to create/update
		 * @return {boolean} true if the data was successfully stored, otherwise false
		 *
		 * @public
		 * @function
		 * @name module:sap/ui/util/Storage#put
		 */
		this.put = function (sKey, sStateToStore) {
			//precondition: non-empty sKey and available storage feature
			assert(typeof sKey === "string" && sKey.length > 0, "key must be a non-empty string");
			return hasExecuted(function () {
				oStorageImpl.setItem(sPrefix + sKey, JSON.stringify(sStateToStore));
			});
		};


		/**
		 * Retrieves data item for a specific key.
		 *
		 * @param {string} sKey key to retrieve
		 * @returns {object|null} key's value or <code>null</code>
		 * @public
		 * @function
		 * @name module:sap/ui/util/Storage#get
		 */
		this.get = function (sKey) {
			//precondition: non-empty sKey and available storage feature
			assert(typeof sKey === "string" && sKey.length > 0, "key must be a non-empty string");

			var oData;

			hasExecuted(function () {
				oData = JSON.parse(oStorageImpl.getItem(sPrefix + sKey));
			});

			return oData !== undefined ?  oData : null;
		};

		/**
		 * Removes key from storage if it exists.
		 *
		 * @param {string} sKey key to remove
		 * @return {boolean} true if the deletion
		 * was successful or the data doesn't exist under the specified key,
		 * and false if the feature is unavailable or a problem occurred
		 * @public
		 * @function
		 * @name module:sap/ui/util/Storage#remove
		 */
		this.remove = function (sKey) {
			//precondition: non-empty sKey and available storage feature
			assert(typeof sKey === "string" && sKey.length > 0, "key must be a non-empty string");
			return hasExecuted(function () {
				oStorageImpl.removeItem(sPrefix + sKey);
			});
		};

		/**
		 * Removes all stored keys.
		 *
		 * @param {string} [sIdPrefix=""] prefix id for the states to delete
		 * @return {boolean} true if the deletion
		 * was successful or the data doesn't exist under the specified key,
		 * and false if the feature is unavailable or a problem occurred
		 * @public
		 * @function
		 * @name module:sap/ui/util/Storage#removeAll
		 */
		this.removeAll = function (sIdPrefix) {
			return hasExecuted(function () {
				var p = sPrefix + (sIdPrefix || ""),
					keysToRemove = [],
					key, i;

				// first determine keys that should be removed
				for (i = 0; i < oStorageImpl.length; i++) {
					key = oStorageImpl.key(i);
					if (key && key.startsWith(p)) {
						keysToRemove.push(key);
					}
				}

				// then remove them (to avoid concurrent modification while looping over the keys)
				for (i = 0; i < keysToRemove.length; i++) {
					oStorageImpl.removeItem(keysToRemove[i]);
				}
			});
		};

		/**
		 * Clears the whole storage (Independent of the current Storage instance!).
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
		 * @name module:sap/ui/util/Storage#clear
		 */
		this.clear = function () {
			return hasExecuted(function () {
				oStorageImpl.clear();
			});
		};

		/**
		 * Returns the storage type.
		 *
		 * @returns {module:sap/ui/util/Storage.Type | string} storage type or "unknown"
		 * @public
		 * @function
		 * @name module:sap/ui/util/Storage#getType
		 */
		this.getType = function () {
			return sType;
		};
	};

	/**
	 * Enumeration of the storage types supported by {@link module:sap/ui/util/Storage}.
	 *
	 * @enum {string}
	 * @public
	 * @version ${version}
	 */
	Storage.Type = {
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

	Object.assign(Storage, new Storage());

	return Storage;
});