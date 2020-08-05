/*!
 * ${copyright}
 */

(function () {
	"use strict";
	/*global QUnit */

	var bAlreadyStopped = QUnit.config.autostart === false;

	QUnit.config.autostart = false;

	sap.ui.require([
		"sap/ui/core/Core",
		"sap/ui/core/qunit/odata/v4/AnnotationHelper.qunit",
		"sap/ui/core/qunit/odata/v4/Context.qunit",
		"sap/ui/core/qunit/odata/v4/ODataBinding.qunit",
		"sap/ui/core/qunit/odata/v4/ODataContextBinding.qunit",
		"sap/ui/core/qunit/odata/v4/ODataListBinding.qunit",
		"sap/ui/core/qunit/odata/v4/ODataMetaModel.qunit",
		"sap/ui/core/qunit/odata/v4/ODataModel.integration.qunit",
		"sap/ui/core/qunit/odata/v4/ODataModel.qunit",
		"sap/ui/core/qunit/odata/v4/ODataParentBinding.qunit",
		"sap/ui/core/qunit/odata/v4/ODataPropertyBinding.qunit",
		"sap/ui/core/qunit/odata/v4/ODataUtils.qunit",
		"sap/ui/core/qunit/odata/v4/_AnnotationHelperExpression.qunit",
		"sap/ui/core/qunit/odata/v4/lib/_AggregationCache.qunit",
		"sap/ui/core/qunit/odata/v4/lib/_AggregationHelper.qunit",
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
		"sap/ui/core/qunit/odata/v4/lib/_V4MetadataConverter.qunit"
	], function (Core) {
		function start() {
			Core.detachThemeChanged(start);
			QUnit.start();
		}

		// don't start if autostart was stopped elsewhere (then the module is part of 1Ring)
		if (!bAlreadyStopped) {
			if (Core.isThemeApplied()) {
				QUnit.start();
			} else {
				Core.attachThemeChanged(start);
			}
		}
	});
}());