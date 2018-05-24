/*!
 * ${copyright}
 */

sap.ui.loader.config({paths: {"sap/ui/core/qunit": "/" + window.location.pathname.split("/")[1] + "/test-resources/sap/ui/core/qunit"}});

sap.ui.require([
	"sap/ui/core/qunit/odata/v4/_AnnotationHelperExpression.qunit",
	"sap/ui/core/qunit/odata/v4/AnnotationHelper.qunit",
	"sap/ui/core/qunit/odata/v4/Context.qunit",
	"sap/ui/core/qunit/odata/v4/lib/_AggregationCache.qunit",
	"sap/ui/core/qunit/odata/v4/lib/_Batch.qunit",
	"sap/ui/core/qunit/odata/v4/lib/_Cache.qunit",
	"sap/ui/core/qunit/odata/v4/lib/_GroupLock.qunit",
	"sap/ui/core/qunit/odata/v4/lib/_Helper.qunit",
	"sap/ui/core/qunit/odata/v4/lib/_MetadataConverter.qunit",
	"sap/ui/core/qunit/odata/v4/lib/_MetadataRequestor.qunit",
	"sap/ui/core/qunit/odata/v4/lib/_Parser.qunit",
	"sap/ui/core/qunit/odata/v4/lib/_Requestor.qunit",
	"sap/ui/core/qunit/odata/v4/lib/_V2MetadataConverter.qunit",
	"sap/ui/core/qunit/odata/v4/lib/_V2Requestor.qunit",
	"sap/ui/core/qunit/odata/v4/lib/_V4MetadataConverter.qunit",
	"sap/ui/core/qunit/odata/v4/ODataBinding.qunit",
	"sap/ui/core/qunit/odata/v4/ODataContextBinding.qunit",
	"sap/ui/core/qunit/odata/v4/ODataListBinding.qunit",
	"sap/ui/core/qunit/odata/v4/ODataMetaModel.qunit",
	"sap/ui/core/qunit/odata/v4/ODataModel.integration.qunit",
	"sap/ui/core/qunit/odata/v4/ODataModel.qunit",
	"sap/ui/core/qunit/odata/v4/ODataParentBinding.qunit",
	"sap/ui/core/qunit/odata/v4/ODataPropertyBinding.qunit",
	"sap/ui/core/qunit/odata/v4/ODataUtils.qunit"
], function () {
	"use strict";
	// nothing to do here, only the requires are important
});
