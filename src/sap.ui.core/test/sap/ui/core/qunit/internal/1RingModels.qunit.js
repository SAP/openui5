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
		// ***************************************************************************************
		// sap.ui.base.* - tests are contained in testsuite.databinding.qunit.js
		// ***************************************************************************************
		"sap/ui/core/qunit/BindingParser.qunit",
		"sap/ui/core/qunit/ExpressionParser.qunit",

		// ***************************************************************************************
		// sap.ui.core.rules.Model.support - tests are contained in testsuite.rule.qunit.js
		// ***************************************************************************************
		//TODO: get test running in 1RingModels.qunit; it uses sap.ui.support.TestHelper which has
		// a hard reference to sinon V1
		// "sap/ui/core/qunit/rule/model/bindingPathSyntaxValidation.qunit",

		// ***************************************************************************************
		// sap.ui.model.analytics.* - tests are contained in testsuite.databinding.qunit.js
		// ***************************************************************************************
		//TODO: get test running in 1RingModels.qunit; it uses sinon 1
		//"sap/ui/core/qunit/analytics/AnalyticalBinding.qunit",
		"sap/ui/core/qunit/analytics/odata4analytics.qunit",
		//TODO: get test running in 1RingModels.qunit; it uses sinon 1
		// test is contained in /sap.ui.table/test/sap/ui/table/qunit/testsuite.qunit.js
		//"sap/ui/table/qunit/AnalyticalTable.qunit",

		// ***************************************************************************************
		// sap.ui.model.DataState - tests are contained in testsuite.databinding.qunit.js
		// ***************************************************************************************
		"sap/ui/core/qunit/DataState.qunit",

		// ***************************************************************************************
		// sap.ui.model.message.*
		// ***************************************************************************************
		// contained in testsuite.app.qunit.js
		"sap/ui/core/qunit/app/MessageListBinding.qunit",
		// tests contained in testsuite.messages.qunit.js
		//TODO: get test running in 1RingModels.qunit; it uses MockServer
		// "sap/ui/core/qunit/messages/messagesEnd2End.qunit",
		//TODO: get test running in 1RingModels.qunit; it uses MockServer
		// "sap/ui/core/qunit/messages/messagesGeneral.qunit",

		// ***************************************************************************************
		// sap.ui.model.odata.type.* - tests are contained in testsuite.odata.types.qunit.js
		// ***************************************************************************************
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

		// ***************************************************************************************
		// sap.ui.model.odata.* - tests are contained in testsuite.databinding.qunit.js
		// ***************************************************************************************
		"sap/ui/core/qunit/odata/_AnnotationHelperBasics.qunit",
		"sap/ui/core/qunit/odata/_AnnotationHelperExpression.qunit",
		"sap/ui/core/qunit/odata/_ODataMetaModelUtils.qunit",
		// Note: some types use lazy loading and are used by AnnotationHelper tests!
		"sap/ui/core/qunit/odata/AnnotationHelper.qunit",
		//TODO: get test running in 1RingModels.qunit; it uses ODataMessagesFakeService
		// "sap/ui/core/qunit/odata/ODataMessageParser.qunit",
		"sap/ui/core/qunit/odata/ODataMessageParserNoFakeService.qunit",
		"sap/ui/core/qunit/odata/ODataMetaModel.qunit",

		// ***************************************************************************************
		// sap.ui.model.odata.v2.* - tests are contained in testsuite.odatav2.qunit.js
		// ***************************************************************************************
		//TODO: get test running in 1RingModels.qunit; it uses MockServer
		// "sap/ui/core/qunit/odata/v2/CanonicalRequests.qunit",
		"sap/ui/core/qunit/odata/v2/ODataListBindingNoFakeService.qunit",
		"sap/ui/core/qunit/odata/v2/ODataModelNoFakeService.qunit",
		"sap/ui/core/qunit/odata/v2/ODataModel.integration.qunit",
		//TODO: get test running in 1RingModels.qunit; it uses MockServer
		// "sap/ui/core/qunit/odata/v2/V2ODataModel.qunit",

		// ***************************************************************************************
		// sap.ui.model.resource.* - tests are contained in testsuite.databinding.qunit.js
		// ***************************************************************************************
		"sap/ui/core/qunit/resource/ResourceBinding.qunit",
		//TODO: get test running in 1RingModels.qunit; it uses "originInfo" configuration that
		// cannot be changed at runtime
		// "sap/ui/core/qunit/resource/ResourceModel.qunit",

		// ***************************************************************************************
		// sap.ui.model.type.* - tests are contained in testsuite.types.qunit.js
		// ***************************************************************************************
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