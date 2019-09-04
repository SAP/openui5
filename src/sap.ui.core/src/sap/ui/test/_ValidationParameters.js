/*!
 * ${copyright}
 */
sap.ui.define([
	"sap/ui/thirdparty/jquery",
	"sap/ui/test/matchers/matchers"
], function (jQueryDOM, matchers) {
	"use strict";

	// all config options that can be used in a generic OPA waitFor statement
	var OPA_WAITFOR = {
		error: "func",
		check: "func",
		success: "func",
		timeout: "numeric",
		debugTimeout: "numeric",
		pollingInterval: "numeric",
		_stackDropCount: "numeric",
		errorMessage: "string",
		asyncPolling: "bool"
	};

	// the basic config options that can be used in an OPA5 waitFor statement - superset of OPA options + new options for control search
	var OPA5_WAITFOR = jQueryDOM.extend({
		_stack: "string",
		viewName: "string",
		viewNamespace: "string",
		viewId: "string",
		fragmentId: "string",
		visible: "bool",
		enabled: "bool",
		matchers: "any",
		actions: "any",
		id: "any",
		controlType: "any",
		searchOpenDialogs: "bool",
		autoWait: "any"
	}, OPA_WAITFOR);

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
		OPA_WAITFOR: OPA_WAITFOR,
		OPA5_WAITFOR: OPA5_WAITFOR_WITH_MATCHERS,
		OPA5_WAITFOR_DECORATED: OPA5_WAITFOR_DECORATED
	};
});
