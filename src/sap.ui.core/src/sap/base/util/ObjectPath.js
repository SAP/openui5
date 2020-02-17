/*!
 * ${copyright}
 */
sap.ui.define([], function() {
	"use strict";

	/**
	 * Manages an object path.
	 *
	 * The object path can be just created with {@link #.create}, then an empty nested object path will be created from
	 * the provided string. If a value is set for an object path {@link #.set} it is also created if it not already
	 * exists. Values can be retrieved from the objectpath with {@link #get}.
	 *
	 * @namespace
	 * @since 1.58
	 * @alias module:sap/base/util/ObjectPath
	 * @public
	 */
	var ObjectPath = {};

	/**
	 * The default root context for the object path.
	 *
	 * @type {object}
	 * @private
	 */
	var defaultRootContext = window;

	/**
	 * If the provided object path is a string, it will be split and returned as an array.
	 *
	 * @private
	 * @param {string|string[]} vObjectPath Path as string where each name is separated by '.'. Can also be an array of names.
	 * @returns {string[]} The path as an array
	 */
	function getObjectPathArray(vObjectPath) {
		return Array.isArray(vObjectPath) ? vObjectPath.slice() : vObjectPath.split(".");
	}

	/**
	 * Creates a object path from the provided path in the provided root context.
	 *
	 * The provided path is used to navigate through the nested objects, starting with the root context.
	 *
	 * @example
	 * var root = {};
	 * ObjectPath.create("my.test.module", root) === root.my.test.module;
	 * ObjectPath.set(["my", "test", "otherModule"], root) === root.my.test.otherModule;
	 *
	 * @public
	 * @static
	 * @param {string|string[]} vObjectPath Path as string where each name is separated by '.'. Can also be an array of names.
	 * @param {Object} [oRootContext=window] Root context where the path starts
	 * @returns {Object} The newly created context object, e.g. base.my.test.module
	 * @throws {Error} Will throw an error if a value already exists within the path and the object path cannot be set.
	 */
	ObjectPath.create = function(vObjectPath, oRootContext) {
		var oObject = oRootContext || defaultRootContext;
		var aNames = getObjectPathArray(vObjectPath);

		for (var i = 0; i < aNames.length; i++) {
			var sName = aNames[i];

			// we only accept nested objects and functions in the ObjectPath
			// Functions in the ObjectPath are typically constructor functions
			if (oObject[sName] === null
				|| (oObject[sName] !== undefined && (typeof oObject[sName] !== "object" && typeof oObject[sName] !== "function"))
			) {
				throw new Error("Could not set object-path for '" + aNames.join(".") + "', path segment '" + sName + "' already exists.");
			}

			oObject[sName] = oObject[sName] || {};
			oObject = oObject[sName];
		}

		return oObject;
	};

	/**
	 * Returns a value located in the provided path.
	 * If the provided path cannot be resolved completely, <code>undefined</code> is returned.
	 *
	 * The provided object path is used to navigate through the nested objects, starting with the root context.
	 * If no root context is provided, the object path begins with <code>window</code>.
	 *
	 * @public
	 * @static
	 * @param {string|string[]} vObjectPath Path as string where each name is separated by '.'. Can also be an array of names.
	 * @param {Object} [oRootContext=window] Root context where the path starts
	 * @returns {any} Returns the value located in the provided path, or <code>undefined</code> if the path does not exist completely.
	 * @example
	 * ObjectPath.get("my.test.module", root) === root.my.test.module
	 * ObjectPath.get(["my", "test", "otherModule"], root) === root.my.test.otherModule
	 * ObjectPath.get("globalVar") === window["globalVar"];
	 */
	ObjectPath.get = function(vObjectPath, oRootContext) {
		var oObject = oRootContext || defaultRootContext;
		var aNames = getObjectPathArray(vObjectPath);
		var sPropertyName = aNames.pop();

		for (var i = 0; i < aNames.length && oObject; i++) {
			oObject = oObject[aNames[i]];
		}

		return oObject ? oObject[sPropertyName] : undefined;
	};

	/**
	 * Sets a value located in the provided path.
	 *
	 * The provided path is used to navigate through the nested objects, starting with the root context.
	 *
	 * <b>Note:</b> Ensures that the object path exists.
	 *
	 * @public
	 * @static
	 * @param {string|string[]} vObjectPath vObjectPath Path as string where each name is separated by '.'. Can also be an array of names.
	 * @param {any} vValue The value to be set in the root context's object path
	 * @param {Object} [oRootContext=window] Root context where the path starts
	 * @throws {Error} Will throw an error if a value already exists within the object path and the path cannot be set.
	 * @example
	 * var root = {};
	 * ObjectPath.set("my.test.module", "propertyValue", root);
	 * ObjectPath.set(["my", "test", "otherModule"], "otherPropertyValue", root);
	 */
	ObjectPath.set = function(vObjectPath, vValue, oRootContext) {
		oRootContext = oRootContext || defaultRootContext;
		var aNames = getObjectPathArray(vObjectPath);
		var sPropertyName = aNames.pop();

		// ensure object exists
		var oObject = ObjectPath.create(aNames, oRootContext);
		oObject[sPropertyName] = vValue;
	};

	return ObjectPath;
});
