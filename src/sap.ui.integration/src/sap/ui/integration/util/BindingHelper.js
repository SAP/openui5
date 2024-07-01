/*!
 * ${copyright}
 */
sap.ui.define([
	"sap/ui/base/BindingParser",
	"sap/base/util/extend",
	"sap/base/util/isPlainObject",
	"sap/ui/integration/formatters/DateTimeFormatter",
	"sap/ui/integration/formatters/NumberFormatter",
	"sap/ui/integration/formatters/TextFormatter",
	"sap/ui/integration/bindingFeatures/DateRange",
	"sap/ui/integration/formatters/InitialsFormatter"
], function (
	BindingParser,
	extend,
	isPlainObject,
	DateTimeFormatter,
	NumberFormatter,
	TextFormatter,
	DateRange,
	InitialsFormatter
) {
	"use strict";

	/**
	 * Workaround for ticket DINC0196232
	 * @param {string} sString The string to test.
	 * @returns {boolean} True if size formatter is used
	 */
	function containsSizeFormatter(sString) {
		if (typeof sString !== "string") {
			return false;
		}

		return /\Wsize\(/.test(sString);
	}

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
		text: TextFormatter.text,
		unit: NumberFormatter.unit,
		initials: InitialsFormatter.initials
	};

	BindingHelper.mLocals = {
		"format": mFormatters,
		"dateRange": DateRange
	};

	/**
	 * Resolves expression bindings with our formatters. Also creates binding infos, if there is a binding syntax.
	 *
	 * @param {any} vValue The value with binding.
	 * @param {object} mLocalBindingNamespaces Local binding functions
	 * @returns {object|undefined} Created binding info or undefined if there is no binding.
	 */
	BindingHelper.extractBindingInfo = function (vValue, mLocalBindingNamespaces) {
		vValue = BindingHelper.escapeCardPlaceholders(vValue);

		let vResult = BindingParser.complexParser(
			vValue,
			undefined, // oContext
			true, // bUnescape - when set to 'true' expressions that don't contain bindings are also resolved, else they are treated as strings (needed to resolve expression binding)
			undefined, // bTolerateFunctionsNotFound
			undefined, // bStaticContext
			undefined, // bPreferContext
			extend({}, BindingHelper.mLocals, mLocalBindingNamespaces) // mLocals - functions which will be used in expression binding
		);

		// Workaround for ticket DINC0196232
		// 'true' should be true, 'false' -> false, '42' should be 42
		if (containsSizeFormatter(vValue)) {
			const vOriginalResult = vResult;

			if (vOriginalResult === "true") {
				vResult = true;
			} else if (vOriginalResult === "false") {
				vResult = false;
			} else if (vOriginalResult === "null") {
				vResult = null;
			} else if (vOriginalResult === "undefined") {
				vResult = undefined;
			} else if (!Number.isNaN(Number(vOriginalResult))) {
				vResult = Number(vOriginalResult);
			}
		}
		// End of workaround

		return vResult;
	};

	/**
	 * Calls <code>BindingHelper.extractBindingInfo</code> for the given vItem. If it is array or object, it will be processed recursively.
	 * The given vItem won't be modified.
	 * If any there is any left string value containing placeholders, e.g '{{parameters.city}} it will be escaped.
	 *
	 * @param {*} vItem Object, Array, or any other type.
	 * @param {object} mLocalBindingNamespaces Local binding functions
	 * @returns {*} Processed variant of vItem which is turned to binding info(s).
	 */
	BindingHelper.createBindingInfos = function (vItem, mLocalBindingNamespaces) {

		if (!vItem) {
			return vItem;
		}

		if (Array.isArray(vItem)) {
			return vItem.map(function (vItem) {
				return BindingHelper.createBindingInfos(vItem, mLocalBindingNamespaces);
			});
		}

		if (isPlainObject(vItem)) {
			var oItemCopy = {};

			for (var sKey in vItem) {
				oItemCopy[sKey] = BindingHelper.createBindingInfos(vItem[sKey], mLocalBindingNamespaces);
			}

			return oItemCopy;
		}

		if (typeof vItem === "string") {
			var oBindingInfo = BindingHelper.extractBindingInfo(vItem, mLocalBindingNamespaces);

			// Workaround for ticket DINC0196232
			if (containsSizeFormatter(vItem)) {
				return oBindingInfo;
			}
			// End of workaround

			return BindingHelper.escapeParametersAndDataSources(oBindingInfo || vItem);
		}

		return vItem;
	};

	/**
	 * Creates binding info with formatter
	 *
	 * @param {array|object|string|undefined} vValue Array of parts, existing binding info, or primitive value
	 * @param {function} fnFormatter Formatter function
	 * @returns {object|undefined} New binding info object with the formatter or undefined
	 */
	BindingHelper.formattedProperty = function(vValue, fnFormatter) {
		if (vValue === undefined) {
			return vValue;
		}

		var oBindingInfo = {};

		if (Array.isArray(vValue)) { // multiple values - create binding info with 'parts' and 'formatter'
			oBindingInfo.parts = vValue.map(function (vInfo) {
				return typeof vInfo === "object" ? extend({} , vInfo) : {value: vInfo};
			});

			oBindingInfo.formatter = fnFormatter;
		} else if (typeof vValue === "object") { // create binding info with a 'formatter'
			oBindingInfo = extend({}, vValue);

			if (vValue.formatter) {
				var fnInitialFormatter = oBindingInfo.formatter;

				oBindingInfo.formatter = function () {
					var sInitialFormatterResult = fnInitialFormatter.apply(this, arguments);
					return fnFormatter(sInitialFormatterResult);
				};
			} else {
				oBindingInfo.formatter = fnFormatter;
			}

		} else { // return static binding
			oBindingInfo = {
				value: vValue,
				formatter: fnFormatter
			};
		}

		return oBindingInfo;
	};

	/**
	 * Escapes the cards placeholders with double braces, so that the binding parser does not consider it as a binding.
	 * The string "{{destinations.myDestination}}" will become "\{\{destinations.myDestination\}\}".
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

	BindingHelper.isAbsolutePath = function (sPath) {
		return sPath.startsWith("/");
	};

	/**
	 * Adds prefix to a binding info and its parts (if such exist).
	 * @param {*} vItem Binding info, array of binding infos, or string/boolean/etc. If it is array or object, it will be processed recursively.
	 * @param {*} sPath The path to add as prefix to all relative paths.
	 * @returns {*} If binding info or array of binding infos is given, a copy of it will be returned with new paths, else the value is not modified.
	 */
	BindingHelper.prependRelativePaths = function(vItem, sPath) {
		if (!vItem) {
			return vItem;
		}

		if (BindingHelper.isBindingInfo(vItem)) {
			var oBindingInfoClone = extend({}, vItem);

			if (oBindingInfoClone.path && !this.isAbsolutePath(oBindingInfoClone.path)) {
				oBindingInfoClone.path = sPath + "/" + oBindingInfoClone.path;
			}

			if (oBindingInfoClone.parts) {
				oBindingInfoClone.parts = oBindingInfoClone.parts.map(function (oBindingInfo) {
					return BindingHelper.prependRelativePaths(oBindingInfo, sPath);
				});
			}

			return oBindingInfoClone;
		}

		if (Array.isArray(vItem)) {
			return vItem.map(function (vItem) {
				return BindingHelper.prependRelativePaths(vItem, sPath);
			});
		}

		if (typeof vItem === "object") {
			var oItemCopy = {};

			for (var sKey in vItem) {
				oItemCopy[sKey] = BindingHelper.prependRelativePaths(vItem[sKey], sPath);
			}

			return oItemCopy;
		}

		return vItem;
	};

	/**
	 * Copy the models from one managed object into another.
	 *
	 * Note: This method will overwrite models which already exist in the target object with corresponding models from the source.
	 * @param {sap.ui.base.ManagedObject} oSource Copy from this managed object.
	 * @param {sap.ui.base.ManagedObject} oTarget The object which will receive the models.
	 */
	BindingHelper.propagateModels = function (oSource, oTarget) {
		var oSourceModels = extend({}, oSource.oPropagatedProperties.oModels, oSource.oModels),
			aModelsNames = Object.keys(oSourceModels),
			oDefaultModel = oSource.getModel();

		if (oDefaultModel) {
			oTarget.setModel(oDefaultModel);
		}

		aModelsNames.forEach(function (sModelName) {
			if (sModelName === "undefined") {
				// "undefined" is used for the propagated default model, we have already copied it
				return;
			}

			var oModel = oSource.getModel(sModelName);

			if (oModel) {
				oTarget.setModel(oModel, sModelName);
			}
		});
	};

	/**
	 * Allows to reuse same binding info object.
	 * @param {*} vBindingInfo The parsed value from manifest
	 * @returns {*} Shallow copy of binding info, or unmodified primitive value.
	 */
	BindingHelper.reuse = function (vBindingInfo) {
		if (typeof vBindingInfo === "object") {
			return extend({}, vBindingInfo);
		}

		return vBindingInfo;
	};

	BindingHelper.isBindingInfo = function (oObj) {

		if (!oObj) {
			return false;
		}

		return oObj.hasOwnProperty("path") || (oObj.hasOwnProperty("parts") && (oObj.hasOwnProperty("formatter") || oObj.hasOwnProperty("binding")));
	};



	return BindingHelper;
});

