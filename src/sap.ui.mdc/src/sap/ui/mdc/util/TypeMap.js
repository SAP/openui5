/*!
 * ${copyright}
 */

sap.ui.define([
], function(
) {
	"use strict";

	var _cache = new WeakMap(); // We do not want to share Maps with derived TypeMaps

	/**
	 * Configuration class for type-handling in MDC delegates.
	 * Allows mapping of model-types to <code>sap.ui.mdc.enum.BaseType</code> and enables model-specific type configuration.
	 *
	 * <b>Note:</b>
	 * This utility is experimental and the API/behavior is not finalized and hence this should not be used for productive usage.
	 *
	 * @namespace
	 * @author SAP SE
	 * @private
	 * @ui5-restricted sap.fe
	 * @experimental As of version 1.114.0
	 * @MDC_PUBLIC_CANDIDATE
	 * @since 1.114.0
	 * @alias sap.ui.mdc.util.TypeMap
	 */
	var TypeMap = {};

	/*
	* Gets values of the internal map, treating string values as references to other keys (aliases)
	*/
	TypeMap._get = function (sType) {
		var vEntry = this._getMap().get(sType);
		if (typeof vEntry === "string") {
			return this._get(vEntry);
		} else if (vEntry) {
			return [sType, vEntry];
		}
	};

	/*
	* Updates the internal map's values, if not suppressed by TypeMap.freeze()
	*/
	TypeMap._set = function (sKey, vValue) {
		var oMap = this._getMap();
		if (oMap._bFrozen) {
			throw "TypeMap: You must not modify a frozen TypeMap";
		}
		oMap.set(sKey, vValue);
	};

	/*
	* As derived typemaps want to act as singletons with separate data-sets, we provide a context based cache for each map's internal data.
	* Please also see <code>sap.ui.mdc.util.TypeMap.import</code>
	*/
	TypeMap._getMap = function () {
		var oMap = _cache.get(this);
		if (!oMap) {
			oMap = new Map();
			_cache.set(this, oMap);
		}
		return oMap;
	};

	/**
	 * Sets a BaseType and an optional model- or scenario-specific configuration method for a given sap.ui.model.SimpleType ObjectPath string
	 *
	 * As default <code>string</code> is returned.
	 *
	 * @param {string} sType Objectpath string for sap.ui.model.SimpleType
	 * @param {sap.ui.mdc.enum.BaseType|function} vBaseType BaseType fitting the given sType or method returning a BaseType based on type configuration
	 * @param {function} [fnOptions] Optional customizing method for formatoptions and constraints. See <code>sap.ui.mdc.DefaultTypeMap</code> for examples.
	 * @private
	 * @ui5-restricted sap.fe
	 * @MDC_PUBLIC_CANDIDATE
	 */
	TypeMap.set = function (sType, vBaseType, fnOptions) {
		this._set(sType, [vBaseType, fnOptions]);
	};

	/**
	 * Allows alternative identifiers for Types, such as "Boolean" for "sap.ui.model.type.Boolean"
	 *
	 * @param {string} sType Objectpath string for sap.ui.model.SimpleType
	 * @param {string} sAlias Alternative identifier for sType
	 * @private
	 * @ui5-restricted sap.fe
	 * @MDC_PUBLIC_CANDIDATE
	 */
	TypeMap.setAlias = function (sType, sAlias) {
		this._set(sType, sAlias);
	};

	/**
	 * Returns the <code>sap.ui.mdc.enum.BaseType</code> or a method to resolve the BaseType dynamically for the given type
	 *
	 * @param {string} sType Objectpath string for sap.ui.model.SimpleType
	 * @returns {sap.ui.mdc.enum.BaseType|function} BaseType configured for the sap.ui.model.SimpleType or function to resolve BaseType based on configuration
	 * @private
	 * @ui5-restricted sap.fe
	 * @MDC_PUBLIC_CANDIDATE
	 */
	TypeMap.getBaseType = function (sType) {
		var aResult = this._get(sType);
		return aResult && aResult[1][0];
	};

	/**
	 * Returns the option customizing method configured for a sap.ui.model.SimpleType
	 *
	 * @param {string} sType Objectpath string for sap.ui.model.SimpleType
	 * @returns {function} Method for model-specific type configuration. See <code>sap.ui.mdc.DefaultTypeMap</code> for examples.
	 * @private
	 * @ui5-restricted sap.fe
	 * @MDC_PUBLIC_CANDIDATE
	 */
	TypeMap.getOptions = function (sType) {
		var aResult = this._get(sType);
		return aResult && aResult[1][1];
	};

	/**
	 * Returns the ObjectPath string for a given type alias.
	 *
	 * @param {string} sAlias Identifier for a configured Type Alias
	 * @returns {string} Objectpath string for sap.ui.model.SimpleType
	 * @private
	 * @ui5-restricted sap.fe
	 * @MDC_PUBLIC_CANDIDATE
	 */
	TypeMap.getClass = function (sAlias) {
		var aResult = this._get(sAlias);
		return aResult && aResult[0];
	};

	 /**
	 * Exports the TypeMap's current data
	 *
	 * @returns {Array} Array created from this TypeMap's internal map
	 * @private
	 * @ui5-restricted sap.fe
	 * @MDC_PUBLIC_CANDIDATE
	 */
	TypeMap.export = function () {
		return Array.from(this._getMap());
	};

	/**
	 * Imports a TypeMap's data into another TypeMap
	 *
	 * @param {sap.ui.mdc.util.TypeMap} oTypeMap TypeMap to import
	 * @private
	 * @ui5-restricted sap.fe
	 * @MDC_PUBLIC_CANDIDATE
	 */
	TypeMap.import = function (oTypeMap) {
		oTypeMap.export().forEach(function (aEntry) {
			this._getMap().set(aEntry[0], aEntry[1]);
		}.bind(this));
	};

	/**
	 * Prevents further manipulation of a TypeMap's data
	 *
	 * @private
	 * @ui5-restricted sap.fe
	 * @MDC_PUBLIC_CANDIDATE
	 */
	TypeMap.freeze = function () {
		this._getMap()._bFrozen = true;
	};

	return TypeMap;
});