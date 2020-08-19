/*!
 * ${copyright}
 */
sap.ui.define([
	"sap/ui/thirdparty/jquery",
	"sap/ui/test/matchers/matchers"
], function (jQueryDOM, matchers) {
	"use strict";

	// options that are merged from Opa config into Opa waitFor
	var OPA_WAITFOR_CONFIG = {
		errorMessage: "string",
		timeout: "numeric",
		debugTimeout: "numeric",
		pollingInterval: "numeric",
		_stackDropCount: "numeric",
		asyncPolling: "bool"
	};

	// all config options that can be used in a generic OPA waitFor statement
	var OPA_WAITFOR = jQueryDOM.extend({
		error: "func",
		check: "func",
		success: "func"
	}, OPA_WAITFOR_CONFIG);

	// options that are merged from Opa5 config into Opa waitFor
	var OPA5_WAITFOR_CONFIG = jQueryDOM.extend({
		visible: "bool",
		enabled: "bool",
		editable: "bool",
		viewNamespace: "string",
		viewName: "string",
		viewId: "string",
		fragmentId: "string",
		autoWait: "any"
	}, OPA_WAITFOR_CONFIG);

	// the basic config options that can be used in an OPA5 waitFor statement - superset of OPA options + new options for control search
	var OPA5_WAITFOR = jQueryDOM.extend({
		_stack: "string",
		matchers: "any",
		actions: "any",
		id: "any",
		controlType: "any",
		searchOpenDialogs: "bool"
	}, OPA5_WAITFOR_CONFIG, OPA_WAITFOR);

	// all config options that can be used in an OPA5 waitFor statement - superset of OPA_WAITFOR + all declarative matchers
	var OPA5_WAITFOR_WITH_MATCHERS = jQueryDOM.extend({}, OPA5_WAITFOR, _getDeclarativeMatchers());

	// all config options that can exist in a basic OPA5 waitFor, when control seach starts, including any options added during pre-processing
	var OPA5_WAITFOR_DECORATED = jQueryDOM.extend({
		sOriginalControlType: "string",
		interaction: "any"
	}, OPA5_WAITFOR);

	function _getDeclarativeMatchers () {
		return Object.keys(sap.ui.test.matchers).reduce(function (mResult, sMatcher) {
			sMatcher = sMatcher.charAt(0).toLowerCase() + sMatcher.substr(1);
			mResult[sMatcher] = "any";
			return mResult;
		}, {});
	}

	return {
		OPA_WAITFOR_CONFIG: OPA_WAITFOR_CONFIG,
		OPA_WAITFOR: OPA_WAITFOR,
		OPA5_WAITFOR_CONFIG: OPA5_WAITFOR_CONFIG,
		OPA5_WAITFOR: OPA5_WAITFOR_WITH_MATCHERS,
		OPA5_WAITFOR_DECORATED: OPA5_WAITFOR_DECORATED
	};
});
