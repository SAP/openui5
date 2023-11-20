sap.ui.define([
	"sap/ui/core/mvc/HTMLView",
	"./_createDesignModeTests_legacyAPIs.qunit"
], function (HTMLView, _createDesignModeTests) {
	"use strict";

	/*
	 * DeclarativeSupport does not support asynchronous processing and might trigger sync XHRs.
	 * Therefore, tests with HTMLView are moved into a separatetest module, marked as , 'unavoidablySync'
	 */
	_createDesignModeTests(HTMLView);

});