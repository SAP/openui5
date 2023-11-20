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
	 * Default prefix to be used for a storage instance when no other prefix is provided
	 * at construction time.
	 *
	 * @private
	 */
	var STATE_STORAGE_KEY_PREFIX = "state.key_";

	/**
	 * @class A Storage API for JavaScript.
	 *
	 * <b>Note:</b> The Web Storage API stores the data on the client. Therefore, you must not use
	 * this API for confidential information.
 	 *
	 * Provides a unified interface and methods to store data on the client using the
	 * Web Storage API or a custom implementation. By default, data can be persisted inside
	 * localStorage or sessionStorage.
	 *
	 * A typical intended usage of this API is the storage of a string representing the state of
	 * a control. In this case, the data is stored in the browser session, and the methods to be
	 * used are {@link #put} and {@link #get}. The method {@link #remove} can be used to delete
	 * the previously saved state.
	 *
	 * The <code>Storage</code> class allows a simple scoping by prefixing the keys of all
	 * <code>put/get/remove</code> operations with a fixed prefix given when constructing a
	 * storage instance. By choosing unique prefixes, different instances can write/read/delete
	 * data to the same underlying storage implementation without interfering with each other.
	 *
	 * For the sake of completeness, the method {@link #clear} is available. However, it does not
	 * honor the scoping and therefore should only be called when a global erasing of data is
	 * required. If only keys with certain prefix should be deleted, the method {@link #removeAll}
	 * should be used.
	 *
	 * Besides creating an own storage instance, callers can use the static methods of the
	 * <code>Storage</code> class to access a default session storage instance. All calls will use
	 * the same scope (same prefix).
	 *
	 * @example
	 * <pre>
	 * // Default Storage
	 * sap.ui.require(["sap/ui/util/Storage"], function(Storage) {
	 *  Storage.get("stored_data");
	 * });
	 * </pre>
	 *
	 * @example
	 * <pre>
	 * // Storage Instance
	 * sap.ui.require(["sap/ui/util/Storage"], function(Storage) {
	 *  var oMyStorage = new Storage(Storage.Type.session, "my_prefix");
	 *  oMyStorage.put("stored_data", "{ state: 'active' }");
	 *  oMyStorage.get("stored_data");
	 * });
	 * </pre>
	 *
	 * @since 1.58
	 * @alias module:sap/ui/util/Storage
	 * @param {module:sap/ui/util/Storage.Type | Storage} [vStorage=module:sap/ui/util/Storage.Type.session]
	 *     The type of native storage implementation that this <code>Storage</code> instance should
	 *     use internally. Alternatively, this can be a custom implementation of the
	 *     {@link https://developer.mozilla.org/en-US/docs/Web/API/Storage Storage Web API).
	 * @param {string} [sStorageKeyPrefix='state.key_']
	 *     The scope prefix to be used by this storage instance
	 * @public
	 * @borrows module:sap/ui/util/Storage#isSupported as isSupported
	 * @borrows module:sap/ui/util/Storage#put as put
	 * @borrows module:sap/ui/util/Storage#get as get
	 * @borrows module:sap/ui/util/Storage#remove as remove
	 * @borrows module:sap/ui/util/Storage#removeAll as removeAll
	 * @borrows module:sap/ui/util/Storage#clear as clear
	 * @borrows module:sap/ui/util/Storage#getType as getType
	 */
	var Storage = function (vStorage, sStorageKeyPrefix) {

		var sType = "unknown",
			sPrefix = (sStorageKeyPrefix || STATE_STORAGE_KEY_PREFIX) + "-",
			oStorageImpl;

		if (!vStorage || typeof (vStorage) === "string") {
			sType = vStorage || Storage.Type.session;
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
		} else if (typeof (vStorage) === "object") {
			sType = vStorage.getType ? vStorage.getType() : "unknown";
			oStorageImpl = vStorage;
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
		 * @returns {boolean} true if storage is supported, false otherwise (e.g. due to browser security settings)
		 * @public
		 */
		this.isSupported = function () {
			//Possibility to define for custom storage
			return typeof (oStorageImpl.isSupported) == "function" ? oStorageImpl.isSupported() : true;
		};

		/**
		 * Stores the given value under the given key in the storage or updates the value
		 * if the key already exists.
		 *
		 * This method supports the same types of values as <code>JSON.stringify</code>.
		 *
		 * @param {string} sKey
		 *     Key to store the given value under; will be prefixed with the prefix given when
		 *     constructing this <code>Storage</code>
		 * @param {any} vValue
		 *     Value to store/update under the given key
		 * @returns {boolean}
		 *     Whether the data was successfully stored
		 *
		 * @public
		 */
		this.put = function (sKey, vValue) {
			//precondition: non-empty sKey and available storage feature
			assert(typeof sKey === "string" && sKey.length > 0, "key must be a non-empty string");
			return hasExecuted(function () {
				oStorageImpl.setItem(sPrefix + sKey, JSON.stringify(vValue));
			});
		};


		/**
		 * Retrieves the value for the given key or <code>null</code> if the key does not exist
		 * in this storage.
		 *
		 * The returned value will be of a type that <code>JSON.parse</code> could return, too.
		 *
		 * @param {string} sKey
		 *     Key to retrieve the value for; will be prefixed with the prefix given when
		 *     constructing this <code>Storage</code>
		 * @returns {any}
		 *     The key's value or <code>null</code> if the key does not exist in the storage.
		 * @public
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
		 * Removes the key and its value from storage, if the key exists.
		 *
		 * @param {string} sKey
		 *     Key to remove; will be prefixed with the prefix given when constructing this
		 *     <code>Storage</code>
		 * @returns {boolean}
		 *     Whether the deletion succeeded; if the key didn't exists, the method also
		 *     reports a success
		 * @public
		 */
		this.remove = function (sKey) {
			// precondition: non-empty sKey and available storage feature
			assert(typeof sKey === "string" && sKey.length > 0, "key must be a non-empty string");
			return hasExecuted(function () {
				oStorageImpl.removeItem(sPrefix + sKey);
			});
		};

		/**
		 * Removes all key/value pairs form the storage where the key starts with the given
		 * <code>sKeyPrefix</code>.
		 *
		 * @param {string} [sKeyPrefix=""]
		 *     Key prefix for the keys/values to delete; will be additionally prefixed with the
		 *     prefix given when constructing this <code>Storage</code>
		 * @returns {boolean}
		 *     Whether the deletion was successful; if no key matches the prefix, this is also
		 *     a success
		 * @public
		 */
		this.removeAll = function (sKeyPrefix) {
			return hasExecuted(function () {
				var p = sPrefix + (sKeyPrefix || ""),
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
		 * the data saved under any key, it should not be called when managing data
		 * for specific controls.
		 *
 		 * @returns {boolean}
 		 *     Whether clearing the storage was successful
		 * @public
		 */
		this.clear = function () {
			return hasExecuted(function () {
				oStorageImpl.clear();
			});
		};

		/**
		 * Returns the type of this storage.
		 *
		 * @returns {module:sap/ui/util/Storage.Type | string}
		 *     Type of this storage or "unknown" when the Storage was created with an
		 *     unknown type or implementation
		 * @public
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