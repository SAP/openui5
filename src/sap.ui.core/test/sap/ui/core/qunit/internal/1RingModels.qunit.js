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
		// sap.ui.core.* - tests are contained in testsuite.i18.qunit.js
		// ***************************************************************************************
		"sap/ui/core/qunit/i18n/GenericLocaleData.qunit",
		//TODO: get test running in 1RingModels.qunit; tests don't run independently - refactoring
		// needed
		// "sap/ui/core/qunit/i18n/LocaleData.qunit",

		// ***************************************************************************************
		// sap.ui.core.date.* and sap.base.i18n.date.* - tests are contained in testsuite.i18.qunit.js
		// ***************************************************************************************
		"sap/ui/core/qunit/date/_Calendars.qunit",
		"sap/ui/core/qunit/i18n/Buddhist.qunit",
		"sap/ui/core/qunit/i18n/CalendarUtils.qunit",
		"sap/ui/core/qunit/i18n/CalendarWeekNumbering.qunit",
		"sap/ui/core/qunit/i18n/Islamic.qunit",
		"sap/ui/core/qunit/i18n/Japanese.qunit",
		"sap/ui/core/qunit/i18n/Persian.qunit",
		"sap/ui/core/qunit/i18n/TimezoneUtils.qunit",
		"sap/ui/core/qunit/i18n/UI5Date.qunit",
		"sap/ui/core/qunit/i18n/UniversalDate.qunit",
		"sap/ui/core/qunit/i18n/UniversalDateUtils.qunit",

		// ***************************************************************************************
		// sap.ui.core.format.* - tests are contained in testsuite.types.qunit.js
		// ***************************************************************************************
		"sap/ui/core/qunit/format/FormatUtils.qunit",
		//TODO: get test running in 1RingModels.qunit; tests don't run independently - refactoring
		// needed, currently they depend on the language en_US
		// "sap/ui/core/qunit/types/DateFormat.qunit",
		"sap/ui/core/qunit/types/NumberFormat.qunit",
		//TODO: get test running in 1RingModels.qunit; tests don't run independently - refactoring
		// needed, currently they depend on the language en_US
		// "sap/ui/core/qunit/types/NumberFormatCurrencies.qunit",
		// "sap/ui/core/qunit/types/NumberFormatCurrenciesTrailing.qunit",
		"sap/ui/core/qunit/types/Date.qunit",
		"sap/ui/core/qunit/types/DateFormatTimezones.qunit",
		"sap/ui/core/qunit/types/DateInterval.qunit",
		"sap/ui/core/qunit/types/FileSizeFormat.qunit",
		"sap/ui/core/qunit/types/ListFormat.qunit",

		// ***************************************************************************************
		// sap.ui.core.rules.Model.support - tests are contained in testsuite.rule.qunit.js
		// ***************************************************************************************
		"sap/ui/core/qunit/rule/model/bindingPathSyntaxValidation.qunit",
		"sap/ui/core/qunit/rule/model/selectUsedInBoundAggregation.qunit",

		// ***************************************************************************************
		// sap.ui.model.* - tests are contained in testsuite.databinding.qunit.js
		// ***************************************************************************************
		//TODO: get test running in 1RingModels.qunit; test has to be refactored
		// "sap/ui/core/qunit/CalculatedFields.qunit",
		"sap/ui/core/qunit/CompositeBinding.qunit",
		//TODO: get test running in 1RingModels.qunit; test has to be refactored
		// "sap/ui/core/qunit/DataBinding.qunit",
		"sap/ui/core/qunit/DataState.qunit",
		//TODO: get test running in 1RingModels.qunit; test has to be refactored
		// "sap/ui/core/qunit/ListBinding.qunit",
		//TODO: get test running in 1RingModels.qunit; test has to be refactored
		// "sap/ui/core/qunit/MasterDetail.qunit",
		"sap/ui/core/qunit/StaticBinding.qunit",
		"sap/ui/core/qunit/TreeBindingUtils.qunit",
		"sap/ui/core/qunit/model/_Helper.qunit",
		"sap/ui/core/qunit/model/Binding.qunit",
		"sap/ui/core/qunit/model/ClientListBinding.qunit",
		"sap/ui/core/qunit/model/ClientPropertyBinding.qunit",
		"sap/ui/core/qunit/model/ClientTreeBinding.qunit",
		"sap/ui/core/qunit/model/ClientTreeBindingAdapter.qunit",
		"sap/ui/core/qunit/model/CompositeDataState.qunit",
		"sap/ui/core/qunit/model/Context.qunit",
		"sap/ui/core/qunit/model/ContextBinding.qunit",
		"sap/ui/core/qunit/model/Filter.qunit",
		"sap/ui/core/qunit/model/FilterProcessor.qunit",
		"sap/ui/core/qunit/model/ListBinding.qunit",
		"sap/ui/core/qunit/model/Model.qunit",
		"sap/ui/core/qunit/model/PropertyBinding.qunit",
		"sap/ui/core/qunit/model/Sorter.qunit",
		"sap/ui/core/qunit/model/TreeBinding.qunit",
		"sap/ui/core/qunit/model/TreeBindingAdapter.qunit",

		// ***************************************************************************************
		// sap.ui.model.analytics.* - tests are contained in testsuite.databinding.qunit.js
		// ***************************************************************************************
		//TODO: get test running in 1RingModels.qunit; it uses sinon 1
		// "sap/ui/core/qunit/analytics/AnalyticalBinding.qunit",
		"sap/ui/core/qunit/analytics/AnalyticalTreeBindingAdapter.qunit",
		"sap/ui/core/qunit/analytics/odata4analytics.qunit",
		"sap/ui/core/qunit/analytics/ODataModelAdapter.qunit",
		//TODO: get test running in 1RingModels.qunit; it uses sinon 1
		// test is contained in /sap.ui.table/test/sap/ui/table/qunit/testsuite.qunit.js
		// "sap/ui/table/qunit/AnalyticalTable.qunit",

		// ***************************************************************************************
		// sap.ui.model.ClientModel
		// ***************************************************************************************
		"sap/ui/core/qunit/ClientModel.qunit",

		// ***************************************************************************************
		// sap.ui.model.json.* - tests are contained in testsuite.json.qunit.js
		// ***************************************************************************************
		"sap/ui/core/qunit/json/JSONBinding.qunit",
		"sap/ui/core/qunit/json/JSONListBinding.qunit",
		//TODO uses a fake service and does not got together with odata4analytics.qunit
//		"sap/ui/core/qunit/json/JSONModel.qunit",
		"sap/ui/core/qunit/json/JSONPropertyBinding.qunit",
		"sap/ui/core/qunit/json/JSONTreeBinding.qunit",
		"sap/ui/core/qunit/json/JSONTwoWay.qunit",

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
		"sap/ui/core/qunit/odata/type/DateTimeWithTimezone.qunit",
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
		"sap/ui/core/qunit/odata/AnnotationParserNoFakeService.qunit",
		//TODO: get test running in 1RingModels.qunit; it uses ODataAnnotationsFakeService
		// "sap/ui/core/qunit/odata/ODataAnnotations.qunit",
		//TODO: get test running in 1RingModels.qunit; it uses ODataMessagesFakeService
		// "sap/ui/core/qunit/odata/ODataListBinding.qunit",
		//TODO: get test running in 1RingModels.qunit; it uses ODataMessagesFakeService
		// "sap/ui/core/qunit/odata/ODataMessageParser.qunit",
		"sap/ui/core/qunit/odata/ODataMessageParserNoFakeService.qunit",
		//TODO: get test running in 1RingModels.qunit; it uses MockServer
		// "sap/ui/core/qunit/odata/ODataMetadata.qunit",
		"sap/ui/core/qunit/odata/ODataMetadataNoFakeService.qunit",
		"sap/ui/core/qunit/odata/ODataMetaModel.qunit",
		//TODO: get test running in 1RingModels.qunit; it uses ODataMessagesFakeService
		// "sap/ui/core/qunit/odata/ODataModel.qunit",
		//TODO: get test running in 1RingModels.qunit; it uses ODataMessagesFakeService
		// "sap/ui/core/qunit/odata/ODataSharedMetadata.qunit",
		//TODO: get test running in 1RingModels.qunit; it uses MockServer
		// "sap/ui/core/qunit/odata/ODataTreeBinding.qunit",
		//TODO: get test running in 1RingModels.qunit; it uses MockServer
		// "sap/ui/core/qunit/odata/ODataTreeBindingAdapter.qunit",
		"sap/ui/core/qunit/odata/ODataUtils.qunit",

		// ***************************************************************************************
		// sap.ui.model.odata.v2.* - tests are contained in testsuite.odatav2.qunit.js
		// ***************************************************************************************
		"sap/ui/core/qunit/odata/v2/_CreatedContextsCache.qunit",
		//TODO: get test running in 1RingModels.qunit; it uses MockServer
		// "sap/ui/core/qunit/odata/v2/CanonicalRequests.qunit",
		"sap/ui/core/qunit/odata/v2/Context.qunit",
		"sap/ui/core/qunit/odata/v2/datajs.qunit",
		//TODO: get test running in 1RingModels.qunit; it uses MockServer
		// "sap/ui/core/qunit/odata/v2/DerivedTypes.qunit",
		//TODO: get test running in 1RingModels.qunit; it uses ODataAnnotationsFakeService
		// "sap/ui/core/qunit/odata/v2/ODataAnnotationsV2.qunit",
		"sap/ui/core/qunit/odata/v2/ODataContextBindingNoFakeService.qunit",
		"sap/ui/core/qunit/odata/v2/ODataListBindingNoFakeService.qunit",
		"sap/ui/core/qunit/odata/v2/ODataModel.integration.qunit",
		"sap/ui/core/qunit/odata/v2/ODataModelNoFakeService.qunit",
		"sap/ui/core/qunit/odata/v2/ODataPropertyBindingNoFakeService.qunit",
		"sap/ui/core/qunit/odata/v2/ODataTreeBindingFlatNoFakeService.qunit",
		"sap/ui/core/qunit/odata/v2/ODataTreeBindingNoFakeService.qunit",
		//TODO: get test running in 1RingModels.qunit; it uses ODataModelFakeService
		// "sap/ui/core/qunit/odata/v2/ODataPropertyBinding.qunit",
		//TODO: get test running in 1RingModels.qunit; it uses ODataModelFakeService
		// "sap/ui/core/qunit/odata/v2/ODataV2ListBinding.qunit",
		//TODO: get test running in 1RingModels.qunit; it uses ODataModelFakeService
		// "sap/ui/core/qunit/odata/v2/ODataV2ListBinding_Paging.qunit",
		//TODO: get test running in 1RingModels.qunit; it uses ODataModelFakeService
		// "sap/ui/core/qunit/odata/v2/ODataV2Model.qunit",
		//TODO: get test running in 1RingModels.qunit; it uses MockServer
		// "sap/ui/core/qunit/odata/v2/ODataV2TreeBinding.qunit",
		//TODO: get test running in 1RingModels.qunit; it uses MockServer
		// "sap/ui/core/qunit/odata/v2/ODataV2TreeBindingFlat_MockSrv.qunit",
		//TODO: get test running in 1RingModels.qunit; it uses ODataModelFakeService
		// "sap/ui/core/qunit/odata/v2/ODataV2TreeBindingFlat_FakeSrv.qunit",
		//TODO: get test running in 1RingModels.qunit; it uses MockServer
		// "sap/ui/core/qunit/odata/v2/PendingChanges.qunit",
		//TODO: get test running in 1RingModels.qunit; it uses MockServer
		// "sap/ui/core/qunit/odata/v2/V2ODataModel.qunit",
		//TODO: get test running in 1RingModels.qunit; it uses MockServer
		// "sap/ui/core/qunit/odata/v2/V2ODataModelB.qunit",
		//TODO: get test running in 1RingModels.qunit; it uses MockServer
		// "sap/ui/core/qunit/odata/v2/V2ODataModelDataState.qunit",

		// ***************************************************************************************
		// sap.ui.model.resource.* - tests are contained in testsuite.databinding.qunit.js
		// ***************************************************************************************
		"sap/ui/core/qunit/resource/ResourceBinding.qunit",
		"sap/ui/core/qunit/resource/ResourceModel.qunit",

		// ***************************************************************************************
		// sap.ui.model.type.* - tests are contained in testsuite.types.qunit.js
		// ***************************************************************************************
		"sap/ui/core/qunit/types/CompositeType.qunit",
		"sap/ui/core/qunit/types/SimpleType.qunit",
		"sap/ui/core/qunit/types/Types.qunit",

		// ***************************************************************************************
		// sap.ui.model.xml.* - tests are contained in testsuite.xml.qunit.js
		// ***************************************************************************************
		"sap/ui/core/qunit/xml/XMLBinding.qunit",
		"sap/ui/core/qunit/xml/XMLListBinding.qunit",
		"sap/ui/core/qunit/xml/XMLModel.qunit",
		"sap/ui/core/qunit/xml/XMLModelNS.qunit",
		"sap/ui/core/qunit/xml/XMLPropertyBinding.qunit",
		"sap/ui/core/qunit/xml/XMLTreeBinding.qunit",
		"sap/ui/core/qunit/xml/XMLTwoWay.qunit"
	], function () {
		Core.ready().then(() => {
			QUnit.start();
		});
	});
});