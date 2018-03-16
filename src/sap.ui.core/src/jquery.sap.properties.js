/*!
 * ${copyright}
 */

// Provides access to Java-like properties files
sap.ui.define(['jquery.sap.global', 'sap/ui/Properties'],
	function(jQuery, Properties) {
	"use strict";

	 /**
	 * Creates and returns a new instance of {@link jQuery.sap.util.Properties}.
	 *
	 * If option 'url' is passed, immediately a load request for the given target is triggered.
	 * A property file that is loaded can contain comments with a leading ! or #.
	 * The loaded property list does not contain any comments.
	 *
	 * <b>Example for loading a property file:</b>
	 * <pre>
	 *  jQuery.sap.properties({url : "../myProperty.properties"});
	 * </pre>
	 *
	 * <b>Example for creating an empty properties instance:</b>
	 * <pre>
	 *  jQuery.sap.properties();
	 * </pre>
	 *
	 * <b>Examples for getting and setting properties:</b>
	 * <pre>
	 *	var oProperties = jQuery.sap.properties();
	 *	oProperties.setProperty("KEY_1","Test Key");
	 *	var sValue1 = oProperties.getProperty("KEY_1");
	 *	var sValue2 = oProperties.getProperty("KEY_2","Default");
	 * </pre>
	 *
	 * @name jQuery.sap.properties
	 * @function
	 * @param {object} [mParams] Parameters used to initialize the property list
	 * @param {string} [mParams.url] The URL to the .properties file which should be loaded
	 * @param {boolean} [mParams.async=false] Whether the .properties file should be loaded asynchronously or not
	 * @param {object} [mParams.headers] A map of additional header key/value pairs to send along with
	 *    the request (see <code>headers</code> option of <code>jQuery.ajax</code>)
	 * @param {object} [mParams.returnNullIfMissing=false] Whether <code>null</code> should be returned
	 *    for a missing properties file; by default an empty collection is returned
	 * @return {jQuery.sap.util.Properties|null|Promise} A new property collection (synchronous case)
	 *    or <code>null</code> if the file could not be loaded and <code>returnNullIfMissing</code>
	 *    was set; in case of asynchronous loading, always a Promise is returned, which resolves with
	 *    the property collection or with <code>null</code> if the file could not be loaded and
	 *    <code>returnNullIfMissing</code> was set to true
	 * @throws {Error} When the file has syntax issues (e.g. incomplete unicode escapes);
	 *    in async mode, the error is not thrown but the returned Promise will be rejected
	 * @SecSink {0|PATH} Parameter is used for future HTTP requests
	 * @public
	 */
	jQuery.sap.properties = Properties;

	// Javadoc for private inner class "Properties" - this list of comments is intentional!
	/**
	 * @interface Represents a collection of string properties (key/value pairs).
	 *
	 * Each key and its corresponding value in the collection is a string, keys are case-sensitive.
	 *
	 * Use {@link jQuery.sap.properties} to create an instance of <code>jQuery.sap.util.Properties</code>.
	 *
	 * The {@link #getProperty} method can be used to retrieve a value from the collection,
	 * {@link #setProperty} to store or change a value for a key and {@link #getKeys}
	 * can be used to retrieve an array of all keys that are currently stored in the collection.
	 *
	 * @version ${version}
	 * @since 0.9.0
	 * @name jQuery.sap.util.Properties
	 * @public
	 */

	/**
	 * Returns the value for the given key or <code>null</code> if the collection has no value for the key.
	 *
	 * Optionally, a default value can be given which will be returned if the collection does not contain
	 * a value for the key; only non-empty default values are supported.
	 *
	 * @param {string} sKey Key to return the value for
	 * @param {string} [sDefaultValue=null] Optional, a default value that will be returned
	 *    if the requested key is not in the collection
	 * @returns {string} Value for the given key or the default value or <code>null</code>
	 *    if no default value or a falsy default value was given
	 * @public
	 *
	 * @function
	 * @name jQuery.sap.util.Properties#getProperty
	 */
	/**
	 * Returns an array of all keys in the property collection.
	 * @returns {string[]} All keys in the property collection
	 * @public
	 *
	 * @function
	 * @name jQuery.sap.util.Properties#getKeys
	 */
	/**
	 * Stores or changes the value for the given key in the collection.
	 *
	 * If the given value is not a string, the collection won't be modified.
	 * The key is always cast to a string.
	 *
	 * @param {string} sKey Key of the property
	 * @param {string} sValue String value for the key
	 * @public
	 *
	 * @function
	 * @name jQuery.sap.util.Properties#setProperty
	 */
	/**
	 * Creates and returns a clone of the property collection.
	 * @returns {jQuery.sap.util.Properties} A clone of the property collection
	 * @public
	 *
	 * @function
	 * @name jQuery.sap.util.Properties#clone
	 */

	return jQuery;

});
