/*!
 * ${copyright}
 */

sap.ui.define([], function () {
	"use strict";

	/**
	 * Utility class helping with input validations.
	 *
	 * @author SAP SE
	 * @version ${version}
	 *
	 * @private
	 * @alias sap.ui.integration.util.Validators
	 */
	var Validators = {
		string: {
			maxLength: function (v, max) {
				return v.length <= max;
			},
			maxLengthTxt: "EDITOR_VAL_MAXLENGTH",
			minLength: function (v, min) {
				return v.length >= min;
			},
			minLengthTxt: "EDITOR_VAL_MINLENGTH",
			pattern: function (v, pattern) {
				var p = new RegExp(pattern);
				return p.test(v);
			},
			patternTxt: "EDITOR_VAL_NOMATCH",
			required: function (v, b) {
				return !b || !!v;
			},
			requiredTxt: "EDITOR_VAL_TEXTREQ",
			validateTxt: "EDITOR_VAL_NOMATCH"
		},
		"string[]": {
			maxLength: function (v, max) {
				return Array.isArray(v) && v.length <= max;
			},
			maxLengthTxt: "EDITOR_VAL_LISTMAXLENGTH",
			minLength: function (v, min) {
				return Array.isArray(v) && v.length >= min;
			},
			minLengthTxt: "EDITOR_VAL_LISTMINLENGTH",
			required: function (v, b) {
				return Array.isArray(v) && v.length > 0;
			},
			requiredTxt: "EDITOR_VAL_LISTREQ"
		},
		integer: {
			maximum: function (v, valValue, valSettings) {
				if (valSettings.exclusiveMaximum) {
					valSettings._txt = "maximumExclusiveTxt";
					return v < valValue;
				}
				return v <= valValue;
			},
			maximumTxt: "EDITOR_VAL_MAX",
			maximumExclusiveTxt: "EDITOR_VAL_MAX_E",
			minimum: function (v, valValue, valSettings) {
				if (valSettings.exclusiveMinimum) {
					valSettings._txt = "minimumExclusiveTxt";
					return v > valValue;
				}
				return v >= valValue;
			},
			minimumTxt: "EDITOR_VAL_MIN",
			minimumExclusiveTxt: "EDITOR_VAL_MIN_E",
			multipleOf: function (v, valValue) {
				return (v % valValue) === 0;
			},
			multipleOfTxt: "EDITOR_VAL_MULTIPLE",
			required: function (v, b) {
				return !isNaN(v) && v !== "";
			},
			requiredTxt: "EDITOR_VAL_NUMBERREQ",
			validateTxt: "EDITOR_VAL_NOMATCH"
		},
		number: {
			maximum: function (v, valValue, valSettings) {
				if (valSettings.exclusiveMaximum) {
					valSettings._txt = "maximumExclusiveTxt";
					return v < valValue;
				}
				return v <= valValue;
			},
			maximumTxt: "EDITOR_VAL_MAX",
			maximumExclusiveTxt: "EDITOR_VAL_MAX_E",
			minimum: function (v, valValue, valSettings) {
				if (valSettings.exclusiveMinimum) {
					valSettings._txt = "minimumExclusiveTxt";
					return v > valValue;
				}
				return v >= valValue;
			},
			minimumTxt: "EDITOR_VAL_MIN",
			minimumExclusiveTxt: "EDITOR_VAL_MAX_E",
			multipleOf: function (v, valValue) {
				return (v % valValue) === 0;
			},
			multipleOfTxt: "EDITOR_VAL_MULTIPLE",
			required: function (v, b) {
				return !isNaN(v) && v !== "";
			},
			requiredTxt: "EDITOR_VAL_NUMBERREQ",
			validateTxt: "EDITOR_VAL_NOMATCH"
		},
		keyValuePair: {
			required: function (v, b) {
				return !b || !!v.value;
			},
			requiredTxt: "EDITOR_VAL_FIELDREQ",
			resrictToPredefinedOptions: function (v, b) {
				return (b && !v.value && !v.key) || (b && !!v.key);
			},
			resrictToPredefinedOptionsTxt: "EDITOR_ONLY_LISTED_VALUES_ALLOWED"
		}
	};

	return Validators;
});