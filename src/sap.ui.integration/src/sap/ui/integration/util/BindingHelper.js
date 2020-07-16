/*!
 * ${copyright}
 */
sap.ui.define([
	"sap/ui/base/BindingParser",
	"sap/base/util/extend",
	"sap/ui/integration/formatters/DateTimeFormatter",
	"sap/ui/integration/formatters/NumberFormatter",
	"sap/ui/integration/bindingFeatures/DateRange"
], function (
	BindingParser,
	extend,
	DateTimeFormatter,
	NumberFormatter,
	DateRange
) {
	"use strict";

	/**
	 * Matches cards placeholders like "{{parameters.param1}}". It checks for two opening braces and two closing braces.
	 * Does not match the framework's binding syntax: "{= ${url}}".
	 *
	 * \{\{ - two opening braces
	 * ([^}]+) - everything which is not a closing brace
	 * \}\} - two closing braces
	 *
	 * @type {RegExp}
	 */
	var rCardPlaceholderPattern = /\{\{([^}]+)\}\}/g,
		rCardParametersPattern = /\{\{(parameters\.[^}]+)\}\}/g,
		rCardDataSourcesPattern = /\{\{(dataSources\.[^}]+)\}\}/g;

	/**
	 * Helper class for working with bindings.
	 *
	 * @author SAP SE
	 * @version ${version}
	 *
	 * @private
	 * @alias sap.ui.integration.util.BindingHelper
	 */
	var BindingHelper = {};

	/**
	 * Map of cards formatters.
	 */
	var mFormatters = {
		date: DateTimeFormatter.date,
		dateTime: DateTimeFormatter.dateTime,
		currency: NumberFormatter.currency,
		"float": NumberFormatter.float,
		integer: NumberFormatter.integer,
		percent: NumberFormatter.percent,
		unit: NumberFormatter.unit
	};

	BindingHelper.mLocals = {
		"format": mFormatters,
		"dateRange": DateRange
	};

	/**
	 * Resolves expression bindings with our formatters. Also creates binding infos, if there is a binding syntax.
	 *
	 * @param {any} vValue The value with binding.
	 * @returns {object|undefined} Created binding info or undefined if there is no binding.
	 */
	BindingHelper.extractBindingInfo = function (vValue) {
		vValue = BindingHelper.escapeCardPlaceholders(vValue);

		return BindingParser.complexParser(
			vValue,
			undefined, // oContext
			true, // bUnescape - when set to 'true' expressions that don't contain bindings are also resolved, else they are treated as strings (needed to resolve expression binding)
			undefined, // bTolerateFunctionsNotFound
			undefined, // bStaticContext
			undefined, // bPreferContext
			BindingHelper.mLocals // mLocals - functions which will be used in expression binding
		);
	};

	/**
	 * Calls <code>BindingHelper.extractBindingInfo</code> for the given vItem. If it is array or object, it will be processed recursively.
	 * The given vItem won't be modified.
	 * If any there is any left string value containing placeholders, e.g '{{parameters.city}} it will be escaped.
	 *
	 * @param {*} vItem Object, Array, or any other type.
	 * @returns {*} Processed variant of vItem which is turned to binding info(s).
	 */
	BindingHelper.createBindingInfos = function (vItem) {

		if (!vItem) {
			return vItem;
		}

		if (Array.isArray(vItem)) {
			return vItem.map(BindingHelper.createBindingInfos);
		}

		if (typeof vItem === "object") {
			var oItemCopy = {};

			for (var sKey in vItem) {
				oItemCopy[sKey] = BindingHelper.createBindingInfos(vItem[sKey]);
			}

			return oItemCopy;
		}

		return BindingHelper.escapeParametersAndDataSources(BindingHelper.extractBindingInfo(vItem) || vItem);
	};

	/**
	 * Creates a binding info with formatter or applies formatter directly if the value is string.
	 *
	 * @param {array|object|string} vValue Can be array with parts, object that represents a binding info or a string.
	 * @param {function} fnFormatter Formatter function.
	 * @returns {object|string} New binding info object with the formatter, or a formatted string.
	 */
	BindingHelper.formattedProperty = function(vValue, fnFormatter) {

		var vBindingInfo = {};

		if (Array.isArray(vValue)) { // multiple values - create binding info with 'parts' and 'formatter'
			vBindingInfo.parts = vValue.map(function (vInfo) {
				return typeof vInfo === "object" ? extend({} , vInfo) : {value: vInfo};
			});

			vBindingInfo.formatter = fnFormatter;
		} else if (typeof vValue === "object") { // create binding info with a 'formatter'
			vBindingInfo = extend({}, vValue);

			if (vValue.formatter) {

				var fnInitialFormatter = vBindingInfo.formatter;

				vBindingInfo.formatter = function () {
					var sInitialFormatterResult = fnInitialFormatter.apply(this, arguments);
					return fnFormatter(sInitialFormatterResult);
				};
			} else {
				vBindingInfo.formatter = fnFormatter;
			}

		} else { // single string value - just apply the formatter on it
			vBindingInfo = fnFormatter(vValue);
		}

		return vBindingInfo;
	};

	/**
	 * Escapes the cards placeholders with double braces, so that the binding parser does not consider it as a binding.
	 * The string "{{destinations.myDestination}}" will become "\\{\\{destinations.myDestination\\}\\}".
	 *
	 * @param {any} vValue The value to escape.
	 * @returns {string} The escaped value.
	 */
	BindingHelper.escapeCardPlaceholders = function (vValue) {
		if (typeof vValue !== "string") {
			return vValue;
		}

		return vValue.replace(rCardPlaceholderPattern, "\\{\\{$1\\}\\}");
	};

	// Escapes the card placeholders like <code>escapeCardPlaceholders</code>, but doesn't include destinations.
	BindingHelper.escapeParametersAndDataSources = function (vValue) {
		if (typeof vValue !== "string") {
			return vValue;
		}

		return vValue.replace(rCardParametersPattern, "\\{\\{$1\\}\\}").replace(rCardDataSourcesPattern, "\\{\\{$1\\}\\}");
	};

	/**
	 * Adds new functions in the given namespace, which can be used in expression binding.
	 * @param {string} sNamespace The namespace.
	 * @param {object} oValue The functions, that will be available in this namespace.
	 */
	BindingHelper.addNamespace = function (sNamespace, oValue) {
		BindingHelper.mLocals[sNamespace] = oValue;
	};

	BindingHelper.isAbsolutePath = function (sPath) {
		return sPath.startsWith("/");
	};

	/**
	 * Adds prefix to a binding info and its parts (if such exist).
	 * @param {*} vBindingInfo Binding info object or text/boolean/etc if there is no binding syntax.
	 * @param {*} sPath The path to add as prefix to all relative paths.
	 * @returns {*} If binding info is given, a copy of it will be returned with new paths, else the value is not modified.
	 */
	BindingHelper.prependRelativePaths = function(vBindingInfo, sPath) {
		if (typeof vBindingInfo !== "object") {
			return vBindingInfo;
		}

		var oBindingInfoClone = extend({}, vBindingInfo);

		if (oBindingInfoClone.path && !this.isAbsolutePath(oBindingInfoClone.path)) {
			oBindingInfoClone.path = sPath + "/" + oBindingInfoClone.path;
		}

		if (oBindingInfoClone.parts) {
			oBindingInfoClone.parts = oBindingInfoClone.parts.map(function (oBindingInfo) {
				return BindingHelper.prependRelativePaths(oBindingInfo, sPath);
			});
		}

		return oBindingInfoClone;
	};

	return BindingHelper;
});

