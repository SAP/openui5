/*!
 * ${copyright}
 */
/*global QUnit */

QUnit.config.autostart = false;

// Note: to cover "sap/ui/base", this MUST happen after "qunit-coverage.js" is included!
sap.ui.require([
	"sap/ui/core/Core"
], function (Core) {
	"use strict";

	Core.boot();

	// Note: cannot require these above as data-sap-ui-resourceroots is ignored until boot
	sap.ui.require([
		// Load sinon before sinon-4 so that the global sinon object is sinon-4 and tests using
		// sinon-4 APIs do not break
		"sap/ui/thirdparty/sinon",
		"sap/ui/thirdparty/sinon-4",
		// alphabetic sort order according to module names
		// base
		"sap/ui/core/qunit/BindingParser.qunit",
		"sap/ui/core/qunit/ExpressionParser.qunit",
		// Support rules
		// sap.ui.core.rules.Model.support
		"sap/ui/core/qunit/rule/model/bindingPathSyntaxValidation.qunit",
		// DataState
		"sap/ui/core/qunit/DataState.qunit",
		"sap/ui/core/qunit/odata/v2/V2ODataModelDataState.qunit",
		// OData types
		"sap/ui/core/qunit/odata/type/Boolean.qunit",
		"sap/ui/core/qunit/odata/type/Currency.qunit",
		"sap/ui/core/qunit/odata/type/Date.qunit",
		"sap/ui/core/qunit/odata/type/DateTimeBase.qunit",
		"sap/ui/core/qunit/odata/type/Decimal.qunit",
		"sap/ui/core/qunit/odata/type/Double.qunit",
		"sap/ui/core/qunit/odata/type/Guid.qunit",
		"sap/ui/core/qunit/odata/type/Int.qunit",
		"sap/ui/core/qunit/odata/type/Int64.qunit",
		"sap/ui/core/qunit/odata/type/ODataType.qunit",
		"sap/ui/core/qunit/odata/type/Raw.qunit",
		"sap/ui/core/qunit/odata/type/Single.qunit",
		"sap/ui/core/qunit/odata/type/Stream.qunit",
		"sap/ui/core/qunit/odata/type/String.qunit",
		"sap/ui/core/qunit/odata/type/Time.qunit",
		"sap/ui/core/qunit/odata/type/TimeOfDay.qunit",
		"sap/ui/core/qunit/odata/type/Unit.qunit",
		"sap/ui/core/qunit/odata/type/UnitMixin.qunit",
		// OData V2
		"sap/ui/core/qunit/odata/_AnnotationHelperBasics.qunit",
		"sap/ui/core/qunit/odata/_AnnotationHelperExpression.qunit",
		"sap/ui/core/qunit/odata/_ODataMetaModelUtils.qunit",
		// Note: some types use lazy loading and are used by AnnotationHelper tests!
		"sap/ui/core/qunit/odata/AnnotationHelper.qunit",
		"sap/ui/core/qunit/odata/ODataMessageParserNoFakeService.qunit",
		"sap/ui/core/qunit/odata/ODataMetaModel.qunit",
		"sap/ui/core/qunit/odata/v2/ODataListBindingNoFakeService.qunit",
		"sap/ui/core/qunit/odata/v2/ODataModelNoFakeService.qunit",
		"sap/ui/core/qunit/odata/v2/ODataModel.integration.qunit",
		// Base types
		"sap/ui/core/qunit/types/Types.qunit"
	], function () {
		function start() {
			Core.detachThemeChanged(start);
			QUnit.start();
		}

		if (Core.isThemeApplied()) {
			QUnit.start();
		} else {
			Core.attachThemeChanged(start);
		}
	});
});