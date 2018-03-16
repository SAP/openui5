/*!
 * ${copyright}
 */

/*
 * Provides methods to store and retrieve data based on Web Storage API.
 */
sap.ui.define([
	'jquery.sap.global',
	'sap/base/storage'
], function(jQuery, storage) {
	"use strict";

	/**
	 * Returns a {@link jQuery.sap.storage.Storage Storage} object for a given HTML5 storage (type) and,
	 * as a convenience, provides static functions to access the default (session) storage.
	 *
	 * When called as a function, it returns an instance of {@link jQuery.sap.storage.Storage}, providing access
	 * to the storage of the given {@link jQuery.sap.storage.Type} or to the given HTML5 Storage object.
	 *
	 * The default session storage can be easily accessed with methods {@link jQuery.sap.storage.get},
	 * {@link jQuery.sap.storage.put}, {@link jQuery.sap.storage.remove}, {@link jQuery.sap.storage.clear},
	 * {@link jQuery.sap.storage.getType} and {@link jQuery.sap.storage.removeAll}
	 *
	 * @param {jQuery.sap.storage.Type | Storage}
	 *     oStorage the type specifying the storage to use or an object implementing the browser's Storage API.
	 * @param {string} [sIdPrefix] Prefix used for the Ids. If not set a default prefix is used.
	 * @returns {jQuery.sap.storage.Storage}
	 *
	 * @version ${version}
	 * @since 0.11.0
	 * @namespace
	 * @public
	 *
	 * @borrows jQuery.sap.storage.Storage#get as get
	 * @borrows jQuery.sap.storage.Storage#put as put
	 * @borrows jQuery.sap.storage.Storage#remove as remove
	 * @borrows jQuery.sap.storage.Storage#clear as clear
	 * @borrows jQuery.sap.storage.Storage#getType as getType
	 * @borrows jQuery.sap.storage.Storage#removeAll as removeAll
	 * @borrows jQuery.sap.storage.Storage#isSupported as isSupported
	 */
	jQuery.sap.storage = storage(window).getInstance;

	/**
	 * @interface A Storage API for JavaScript.
	 *
	 * Provides methods to store data on the client using Web Storage API support by the browser. The data
	 * received by this API must be already serialized, in string format. Similarly, the API returns the retrieved
	 * data in serialized string format, so it is the responsibility of the caller to de-serialize it, if applicable.
	 *
	 * Attention: The Web Storage API stores the data on the client. Therefore do not use this API for confidential information.
	 *
	 * One can get access to the 'default' storage by using {@link jQuery.sap.storage} directly
	 * or alternatively via factory functionality available as <code>jQuery.sap.storage(jQuery.sap.storage.Type.session)</code>
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
	 * @since 0.11.0
	 * @public
	 * @name jQuery.sap.storage.Storage
	 */

	/**
	 * Returns whether the given storage is suppported.
	 *
	 * @return {boolean} true if storage is supported, false otherwise (e.g. due to browser security settings)
	 * @public
	 * @name jQuery.sap.storage.Storage#isSupported
	 * @function
	 */

	/**
	 * Stores the passed state string in the session, under the key
	 * sStorageKeyPrefix + sId.
	 *
	 * sStorageKeyPrefix is the id prefix defined for the storage instance (@see jQuery.sap#storage)
	 *
	 * @param {string} sId Id for the state to store
	 * @param {string} sStateToStore content to store
	 * @return {boolean} true if the data were successfully stored, false otherwise
	 * @public
	 * @name jQuery.sap.storage.Storage#put
	 * @function
	 */

	/**
	 * Retrieves the state string stored in the session under the key
	 * sStorageKeyPrefix + sId.
	 *
	 * sStorageKeyPrefix is the id prefix defined for the storage instance (@see jQuery.sap#storage)
	 *
	 * @param {string} sId Id for the state to retrieve
	 * @return {string} the string from the storage, if the retrieval
	 * was successful, and null otherwise
	 * @public
	 * @name jQuery.sap.storage.Storage#get
	 * @function
	 */

	/**
	 * Deletes the state string stored in the session under the key
	 * sStorageKeyPrefix + sId.s
	 *
	 * sStorageKeyPrefix is the id prefix defined for the storage instance (@see jQuery.sap#storage)
	 *
	 * @param {string} sId Id for the state to delete
	 * @return {boolean} true if the deletion
	 * was successful or the data doesn't exist under the specified key,
	 * and false if the feature is unavailable or a problem occurred
	 * @public
	 * @name jQuery.sap.storage.Storage#remove
	 * @function
	 */

	/**
	 * Deletes all state strings stored in the session under the key prefix
	 * sStorageKeyPrefix + sIdPrefix.
	 *
	 * sStorageKeyPrefix is the id prefix defined for the storage instance (@see jQuery.sap#storage)
	 *
	 * @param {string} sIdPrefix Id prefix for the states to delete
	 * @return {boolean} true if the deletion
	 * was successful or the data doesn't exist under the specified key,
	 * and false if the feature is unavailable or a problem occurred
	 * @since 1.13.0
	 * @public
	 * @name jQuery.sap.storage.Storage#removeAll
	 * @function
	 */

	/**
	 * Deletes all the entries saved in the session (Independent of the current Storage instance!).
	 *
	 * CAUTION: This method should be called only in very particular situations,
	 * when a global erasing of data is required. Given that the method deletes
	 * the data saved under any ID, it should not be called when managing data
	 * for specific controls.
	 *
	 * @return {boolean} true if execution of removal
	 * was successful or the data to remove doesn't exist,
	 * and false if the feature is unavailable or a problem occurred
	 * @public
	 * @name jQuery.sap.storage.Storage#clear
	 * @function
	 */

	/**
	 * Returns the type of the storage.
	 * @returns {jQuery.sap.storage.Type | string} the type of the storage or "unknown"
	 * @public
	 * @name jQuery.sap.storage.Storage#getType
	 * @function
	 */


	/**
	 * Enumeration of the storage types supported by {@link jQuery.sap.storage.Storage}
	 * @enum {string}
	 * @public
	 * @version ${version}
	 * @since 0.11.0
	 */
	jQuery.sap.storage.Type = storage.Type;

	/**
	 * Indicates usage of the browser's localStorage feature
	 * @type {string}
	 * @public
	 * @name jQuery.sap.storage.Type.local
	 */

	/**
	 * Indicates usage of the browser's sessionStorage feature
	 * @type {string}
	 * @public
	 * @name jQuery.sap.storage.Type.session
	 */

	/**
	 * Indicates usage of the browser's globalStorage feature
	 * @type {string}
	 * @public
	 * @name jQuery.sap.storage.Type.global
	 */


	return jQuery;

});