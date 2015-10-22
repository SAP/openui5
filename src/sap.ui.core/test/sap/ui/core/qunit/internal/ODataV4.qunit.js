/*!
 * ${copyright}
 */

jQuery.sap.registerResourcePath("sap/ui/core/qunit",
	"/" + window.location.pathname.split("/")[1] + "/test-resources/sap/ui/core/qunit");

sap.ui.require([
	"sap/ui/core/qunit/odata/v4/_ODataHelper.qunit",
	"sap/ui/core/qunit/odata/v4/_OlingoDocument.qunit",
	"sap/ui/core/qunit/odata/v4/ODataContextBinding.qunit",
	"sap/ui/core/qunit/odata/v4/ODataDocumentModel.qunit",
	"sap/ui/core/qunit/odata/v4/ODataListBinding.qunit",
	"sap/ui/core/qunit/odata/v4/ODataMetaModel.qunit",
	"sap/ui/core/qunit/odata/v4/ODataModel.qunit",
	"sap/ui/core/qunit/odata/v4/ODataPropertyBinding.qunit"
], function () {
	"use strict";
	// nothing to do here, only the requires are important
});
