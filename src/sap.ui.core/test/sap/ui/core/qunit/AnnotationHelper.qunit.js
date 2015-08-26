/*!
 * ${copyright}
 */
sap.ui.require([
	"sap/ui/base/BindingParser", "sap/ui/base/ManagedObject", "sap/ui/model/json/JSONModel",
	"sap/ui/model/odata/_AnnotationHelperBasics", "sap/ui/model/odata/_AnnotationHelperExpression",
	"sap/ui/model/odata/v2/ODataModel", "sap/ui/model/PropertyBinding",
	"sap/ui/test/TestUtils"
], function(BindingParser, ManagedObject, JSONModel, Basics, Expression, ODataModel,
		PropertyBinding, TestUtils) {
	/*global QUnit, sinon */
	/*eslint max-nested-callbacks: 0, no-multi-str: 0, no-warning-comments: 0*/
	"use strict";

	//TODO remove this workaround in IE9 for
	// https://github.com/cjohansen/Sinon.JS/commit/e8de34b5ec92b622ef76267a6dce12674fee6a73
	sinon.xhr.supportsCORS = true;

	var AnnotationHelper = sap.ui.model.odata.AnnotationHelper, // Note: lazy require in place!
		oCIRCULAR = {},
		oBoolean = {
			name : "sap.ui.model.odata.type.Boolean",
			constraints : {"nullable" : false}
		},
		oByte = {
			name : "sap.ui.model.odata.type.Byte",
			constraints : {"nullable" : false}
		},
		oDateTime = {
			name : "sap.ui.model.odata.type.DateTime",
			constraints : {"nullable": false, "isDateOnly": true}
		},
		oDateTimeOffset = {
			name : "sap.ui.model.odata.type.DateTimeOffset",
			constraints : {"nullable": false}
		},
		oDecimal = {
			name : "sap.ui.model.odata.type.Decimal",
			constraints : {"nullable": false, "precision" : 13, "scale" : 3}
		},
		oDouble = {
			name : "sap.ui.model.odata.type.Double",
			constraints : {"nullable": false}
		},
		oFloat = {
			name : "sap.ui.model.odata.type.Single"
		},
		oGuid = {
			name : "sap.ui.model.odata.type.Guid",
			constraints : {"nullable": false}
		},
		oInt16 = {
			name : "sap.ui.model.odata.type.Int16",
			constraints : {"nullable" : false}
		},
		oInt32 = {
			name : "sap.ui.model.odata.type.Int32",
			constraints : {"nullable" : false}
		},
		oInt64 = {
			name : "sap.ui.model.odata.type.Int64",
			constraints : {"nullable" : false}
		},
		oSByte = {
			name : "sap.ui.model.odata.type.SByte",
			constraints : {"nullable" : false}
		},
		oSingle = {
			name : "sap.ui.model.odata.type.Single",
			constraints : {"nullable" : false}
		},
		oString10 = {
			name : "sap.ui.model.odata.type.String",
			constraints : {"nullable" : false, "maxLength" : 10}
		},
		oString80 = {
			name : "sap.ui.model.odata.type.String",
			constraints : {"maxLength" : 80}
		},
		oTime = {
			name : "sap.ui.model.odata.type.Time",
			constraints : {"nullable" : false}
		},
		sGwsampleTestAnnotations = '\
<?xml version="1.0" encoding="utf-8"?>\
<edmx:Edmx Version="4.0"\
	xmlns="http://docs.oasis-open.org/odata/ns/edm"\
	xmlns:edmx="http://docs.oasis-open.org/odata/ns/edmx">\
<edmx:DataServices>\
<Schema Namespace="zanno4sample_anno_mdl.v1">\
	<Annotations Target="GWSAMPLE_BASIC.BusinessPartner">\
		<Annotation Term="com.sap.vocabularies.UI.v1.Identification">\
			<Collection>\
				<!-- standalone fillUriTemplate -->\
				<Record Type="com.sap.vocabularies.UI.v1.DataFieldWithUrl">\
					<PropertyValue Property="Url">\
						<Apply Function="odata.fillUriTemplate">\
							<String><![CDATA[#BusinessPartner-displayFactSheet?BusinessPartnerID={ID1}]]></String>\
							<LabeledElement Name="ID1">\
								<Path>BusinessPartnerID</Path>\
							</LabeledElement>\
						</Apply>\
					</PropertyValue>\
					<PropertyValue Property="Value" String="n/a"/>\
				</Record>\
				<!-- concat embeds concat & uriEncode -->\
				<Record Type="com.sap.vocabularies.UI.v1.DataField">\
					<PropertyValue Property="Value">\
						<Apply Function="odata.concat">\
							<Path>CompanyName</Path>\
							<Apply Function="odata.concat">\
								<String> </String>\
							</Apply>\
							<Apply Function="odata.uriEncode">\
								<Path>LegalForm</Path>\
							</Apply>\
						</Apply>\
					</PropertyValue>\
				</Record>\
				<!-- uriEncode embeds concat -->\
				<Record Type="com.sap.vocabularies.UI.v1.DataField">\
					<PropertyValue Property="Value">\
						<Apply Function="odata.uriEncode">\
							<Apply Function="odata.concat">\
								<Path>CompanyName</Path>\
								<String> </String>\
								<Path>LegalForm</Path>\
							</Apply>\
						</Apply>\
					</PropertyValue>\
				</Record>\
				<!-- concat w/ constants -->\
				<Record Type="com.sap.vocabularies.UI.v1.DataField">\
					<PropertyValue Property="Value">\
						<Apply Function="odata.concat">\
							<Bool>true</Bool>\
							<String>|</String>\
							<Date>2015-03-24</Date>\
							<String>|</String>\
							<DateTimeOffset>2015-03-24T14:03:27Z</DateTimeOffset>\
							<String>|</String>\
							<Decimal>-123456789012345678901234567890.1234567890</Decimal>\
							<String>|</String>\
							<Float>-7.4503e-36</Float>\
							<String>|</String>\
							<Guid>0050568D-393C-1ED4-9D97-E65F0F3FCC23</Guid>\
							<String>|</String>\
							<!-- Number.MAX_SAFE_INTEGER + 1 -->\
							<Int>9007199254740992</Int>\
							<String>|</String>\
							<TimeOfDay>13:57:06</TimeOfDay>\
						</Apply>\
					</PropertyValue>\
				</Record>\
				<!-- fillUriTemplate w/ constants -->\
				<Record Type="com.sap.vocabularies.UI.v1.DataFieldWithUrl">\
					<PropertyValue Property="Url">\
						<Apply Function="odata.fillUriTemplate">\
							<String><![CDATA[#{Bool}/{Date}/{DateTimeOffset}/{Decimal}/{Float}/{Guid}/{Int}/{String}/{TimeOfDay}]]></String>\
							<LabeledElement Name="Bool">\
								<Bool>true</Bool>\
							</LabeledElement>\
							<LabeledElement Name="Date">\
								<Date>2015-03-24</Date>\
							</LabeledElement>\
							<LabeledElement Name="DateTimeOffset">\
								<DateTimeOffset>2015-03-24T14:03:27Z</DateTimeOffset>\
							</LabeledElement>\
							<LabeledElement Name="Decimal">\
								<Decimal>-123456789012345678901234567890.1234567890</Decimal>\
							</LabeledElement>\
							<LabeledElement Name="Float">\
								<Float>-7.4503e-36</Float>\
							</LabeledElement>\
							<LabeledElement Name="Guid">\
								<Guid>0050568D-393C-1ED4-9D97-E65F0F3FCC23</Guid>\
							</LabeledElement>\
							<LabeledElement Name="Int">\
								<Int>9007199254740992</Int>\
							</LabeledElement>\
							<LabeledElement Name="String">\
								<String>hello, world</String>\
							</LabeledElement>\
							<LabeledElement Name="TimeOfDay">\
								<TimeOfDay>13:57:06</TimeOfDay>\
							</LabeledElement>\
						</Apply>\
					</PropertyValue>\
					<PropertyValue Property="Value" String="n/a"/>\
				</Record>\
				<!-- fillUriTemplate + uriEncode w/ constants -->\
				<Record Type="com.sap.vocabularies.UI.v1.DataFieldWithUrl">\
					<PropertyValue Property="Url">\
						<Apply Function="odata.fillUriTemplate">\
							<String>/sap/opu/odata/sap/ZUI5_EDM_TYPES/EdmTypesCollection?\
$filter=Boolean+eq+{Bool}+and+Date+eq+{Date}+and+DateTimeOffset+eq+{DateTimeOffset}\
+and+Decimal+eq+{Decimal}+and+Double+eq+{Float}+and+GlobalUID+eq+{Guid}+and+Int64+eq+{Int}\
+and+String40+eq+{String}+and+Time+eq+{TimeOfDay}</String>\
							<LabeledElement Name="Bool">\
								<Apply Function="odata.uriEncode">\
									<Bool>false</Bool>\
								</Apply>\
							</LabeledElement>\
							<LabeledElement Name="Date">\
								<Apply Function="odata.uriEncode">\
									<Date>2099-03-25</Date>\
								</Apply>\
							</LabeledElement>\
							<LabeledElement Name="DateTimeOffset">\
								<Apply Function="odata.uriEncode">\
									<!-- TODO split seconds, e.g. ".123456789012" -->\
									<DateTimeOffset>2099-01-06T07:25:21Z</DateTimeOffset>\
								</Apply>\
							</LabeledElement>\
							<LabeledElement Name="Decimal">\
								<Apply Function="odata.uriEncode">\
									<Decimal>-12345678901234567.12345678901234</Decimal>\
								</Apply>\
							</LabeledElement>\
							<LabeledElement Name="Float">\
								<Apply Function="odata.uriEncode">\
									<Float>1.69E+308</Float>\
								</Apply>\
							</LabeledElement>\
							<LabeledElement Name="Guid">\
								<Apply Function="odata.uriEncode">\
									<Guid>0050568D-393C-1EE4-A5AE-9AAE85248FF1</Guid>\
								</Apply>\
							</LabeledElement>\
							<LabeledElement Name="Int">\
								<Apply Function="odata.uriEncode">\
									<Int>-9223372036854775800</Int>\
								</Apply>\
							</LabeledElement>\
							<LabeledElement Name="String">\
								<Apply Function="odata.uriEncode">\
									<String>String Filtered Maxlength 40</String>\
								</Apply>\
							</LabeledElement>\
							<LabeledElement Name="TimeOfDay">\
								<Apply Function="odata.uriEncode">\
									<!-- TODO split seconds, e.g. ".123456789012" -->\
									<TimeOfDay>11:11:11</TimeOfDay>\
								</Apply>\
							</LabeledElement>\
						</Apply>\
					</PropertyValue>\
					<PropertyValue Property="Value" String="n/a"/>\
				</Record>\
				<!-- Comparison Operators -->\
				<Record Type="com.sap.vocabularies.UI.v1.DataField">\
					<PropertyValue Property="Value">\
						<And>\
							<Eq>\
								<Lt>\
									<Path>p1</Path>\
									<Path>p2</Path>\
								</Lt>\
								<Gt>\
									<Path>p4</Path>\
									<Path>p5</Path>\
								</Gt>\
							</Eq>\
							<Ne>\
								<Ge>\
									<Path>p6</Path>\
									<Path>p7</Path>\
								</Ge>\
								<Le>\
									<Path>p8</Path>\
									<Path>p9</Path>\
								</Le>\
							</Ne>\
						</And>\
					</PropertyValue>\
				</Record>\
				<!-- Logical Operators -->\
				<Record Type="com.sap.vocabularies.UI.v1.DataField">\
					<PropertyValue Property="Value">\
						<Or>\
							<Not>\
								<Eq>\
									<Path>p1</Path>\
									<Path>p2</Path>\
								</Eq>\
							</Not>\
							<And>\
								<Eq>\
									<Path>p3</Path>\
									<Path>p4</Path>\
								</Eq>\
								<Eq>\
									<Path>p5</Path>\
									<Path>p6</Path>\
								</Eq>\
							</And>\
						</Or>\
					</PropertyValue>\
				</Record>\
			</Collection>\
		</Annotation>\
	</Annotations>\
	<Annotations Target="GWSAMPLE_BASIC.Contact">\
		<!-- edm:If -->\
		<Annotation Term="com.sap.vocabularies.UI.v1.HeaderInfo">\
			<Record Type="com.sap.vocabularies.UI.v1.HeaderInfoType">\
				<PropertyValue Property="Title">\
					<Record Type="com.sap.vocabularies.UI.v1.DataField">\
						<PropertyValue Property="Label" String="Name"/>\
						<PropertyValue Property="Value">\
							<If>\
								<Eq>\
									<Path>Sex</Path>\
									<String>M</String>\
								</Eq>\
								<String>Mr. </String>\
								<If>\
									<Eq>\
										<Path>Sex</Path>\
										<String>F</String>\
									</Eq>\
									<String>Mrs. </String>\
									<String></String>\
								</If>\
							</If>\
						</PropertyValue>\
					</Record>\
				</PropertyValue>\
				<PropertyValue Property="Description">\
					<Record Type="com.sap.vocabularies.UI.v1.DataFieldForAction">\
						<PropertyValue Property="Action" String="GWSAMPLE_BASIC.GWSAMPLE_BASIC_Entities/RegenerateAllData"/>\
					</Record>\
				</PropertyValue>\
				<PropertyValue Property="ImageUrl">\
					<Record Type="com.sap.vocabularies.UI.v1.DataFieldWithUrl">\
						<PropertyValue Property="Url">\
							<If>\
								<Ne>\
									<Path>EmailAddress</Path>\
									<Null/>\
								</Ne>\
								<Apply Function="odata.concat">\
									<String>mailto:</String>\
									<Path>EmailAddress</Path>\
								</Apply>\
								<Null/>\
							</If>\
						</PropertyValue>\
						<PropertyValue Property="Value" String="n/a"/>\
					</Record>\
				</PropertyValue>\
			</Record>\
		</Annotation>\
	</Annotations>\
</Schema>\
</edmx:DataServices>\
</edmx:Edmx>\
		',
		sTestMetadata = '\
<?xml version="1.0" encoding="utf-8"?>\
<edmx:Edmx Version="1.0" xmlns:edmx="http://schemas.microsoft.com/ado/2007/06/edmx" xmlns:m="http://schemas.microsoft.com/ado/2007/08/dataservices/metadata" xmlns:sap="http://www.sap.com/Protocols/SAPData">\
	<edmx:DataServices m:DataServiceVersion="2.0">\
		<Schema Namespace="GWSAMPLE_BASIC" xml:lang="en" sap:schema-version="0000" xmlns="http://schemas.microsoft.com/ado/2008/09/edm">\
			<EntityType Name="BusinessPartner" sap:content-version="1"/>\
			<EntityType Name="Product" sap:content-version="1">\
				<Property Name="_Boolean" Type="Edm.Boolean" Nullable="false"/>\
				<Property Name="_Byte" Type="Edm.Byte" Nullable="false"/>\
				<Property Name="_DateTime" Type="Edm.DateTime" Nullable="false" sap:display-format="Date"/>\
				<Property Name="_DateTimeOffset" Type="Edm.DateTimeOffset" Nullable="false"/>\
				<Property Name="_Decimal" Type="Edm.Decimal" Nullable="false" Precision="13" Scale="3"/>\
				<Property Name="_Double" Type="Edm.Double" Nullable="false"/>\
				<Property Name="_Float" Type="Edm.Float"/>\
				<Property Name="_Guid" Type="Edm.Guid" Nullable="false"/>\
				<Property Name="_Int16" Type="Edm.Int16" Nullable="false"/>\
				<Property Name="_Int32" Type="Edm.Int32" Nullable="false"/>\
				<Property Name="_Int64" Type="Edm.Int64" Nullable="false"/>\
				<Property Name="_Int64Small" Type="Edm.Int64" Nullable="false"/>\
				<Property Name="_SByte" Type="Edm.SByte" Nullable="false"/>\
				<Property Name="_Single" Type="Edm.Single" Nullable="false"/>\
				<Property Name="_String10" Type="Edm.String" Nullable="false" MaxLength="10"/>\
				<Property Name="_String80" Type="Edm.String" MaxLength="80"/>\
				<Property Name="_Time" Type="Edm.Time" Nullable="false"/>\
			</EntityType>\
		</Schema>\
	</edmx:DataServices>\
</edmx:Edmx>\
		',
		sTestAnnotations = '\
<?xml version="1.0" encoding="utf-8"?>\
<edmx:Edmx Version="4.0"\
		xmlns="http://docs.oasis-open.org/odata/ns/edm"\
		xmlns:edmx="http://docs.oasis-open.org/odata/ns/edmx">\
	<edmx:DataServices>\
		<Schema Namespace="zanno4sample_anno_mdl.v1">\
			<Annotations Target="GWSAMPLE_BASIC.Product">\
				<Annotation Term="com.sap.vocabularies.UI.v1.Identification">\
					<Collection>\
						<Record Type="com.sap.vocabularies.UI.v1.DataField">\
							<PropertyValue Property="Value">\
								<Eq><Path>_Boolean</Path><Bool>true</Bool></Eq>\
							</PropertyValue>\
						</Record>\
						<Record Type="com.sap.vocabularies.UI.v1.DataField">\
							<PropertyValue Property="Value">\
								<Eq><Path>_Byte</Path><Int>255</Int></Eq>\
							</PropertyValue>\
						</Record>\
						<Record Type="com.sap.vocabularies.UI.v1.DataField">\
							<PropertyValue Property="Value">\
								<Eq><Path>_DateTime</Path><DateTimeOffset>2015-04-22T12:43:07.236Z</DateTimeOffset></Eq>\
							</PropertyValue>\
						</Record>\
						<Record Type="com.sap.vocabularies.UI.v1.DataField">\
							<PropertyValue Property="Value">\
								<Eq><Path>_DateTimeOffset</Path><DateTimeOffset>2015-04-22T12:43:07.236Z</DateTimeOffset></Eq>\
							</PropertyValue>\
						</Record>\
						<Record Type="com.sap.vocabularies.UI.v1.DataField">\
							<PropertyValue Property="Value">\
								<Eq><Path>_Decimal</Path><Decimal>104245025234234502435.6430345</Decimal></Eq>\
							</PropertyValue>\
						</Record>\
						<Record Type="com.sap.vocabularies.UI.v1.DataField">\
							<PropertyValue Property="Value">\
								<Eq><Path>_Double</Path><Float>3.1415927</Float></Eq>\
							</PropertyValue>\
						</Record>\
						<Record Type="com.sap.vocabularies.UI.v1.DataField">\
							<PropertyValue Property="Value">\
								<Eq><Path>_Float</Path><Float>0.30103</Float></Eq>\
							</PropertyValue>\
						</Record>\
						<Record Type="com.sap.vocabularies.UI.v1.DataField">\
							<PropertyValue Property="Value">\
								<Eq><Path>_Guid</Path><Guid>0050568D-393C-1ED4-9D97-E65F0F3FCC23</Guid></Eq>\
							</PropertyValue>\
						</Record>\
						<Record Type="com.sap.vocabularies.UI.v1.DataField">\
							<PropertyValue Property="Value">\
								<Eq><Path>_Int16</Path><Int>16</Int></Eq>\
							</PropertyValue>\
						</Record>\
						<Record Type="com.sap.vocabularies.UI.v1.DataField">\
							<PropertyValue Property="Value">\
								<Eq><Path>_Int32</Path><Int>32</Int></Eq>\
							</PropertyValue>\
						</Record>\
						<Record Type="com.sap.vocabularies.UI.v1.DataField">\
							<PropertyValue Property="Value">\
								<Eq><Path>_Int64</Path><Int>9007199254740992</Int></Eq>\
							</PropertyValue>\
						</Record>\
						<Record Type="com.sap.vocabularies.UI.v1.DataField">\
							<PropertyValue Property="Value">\
								<Eq><Path>_Int64Small</Path><Int>64</Int></Eq>\
							</PropertyValue>\
						</Record>\
						<Record Type="com.sap.vocabularies.UI.v1.DataField">\
							<PropertyValue Property="Value">\
								<Eq><Path>_SByte</Path><Int>-126</Int></Eq>\
							</PropertyValue>\
						</Record>\
						<Record Type="com.sap.vocabularies.UI.v1.DataField">\
							<PropertyValue Property="Value">\
								<Eq><Path>_Single</Path><Float>2.7182818</Float></Eq>\
							</PropertyValue>\
						</Record>\
						<Record Type="com.sap.vocabularies.UI.v1.DataField">\
							<PropertyValue Property="Value">\
								<Eq><Path>_String10</Path><String>foo</String></Eq>\
							</PropertyValue>\
						</Record>\
						<Record Type="com.sap.vocabularies.UI.v1.DataField">\
							<PropertyValue Property="Value">\
								<Eq><Path>_String80</Path><String>bar</String></Eq>\
							</PropertyValue>\
						</Record>\
						<Record Type="com.sap.vocabularies.UI.v1.DataField">\
							<PropertyValue Property="Value">\
								<Eq><Path>_Time</Path><TimeOfDay>12:43:07.236</TimeOfDay></Eq>\
							</PropertyValue>\
						</Record>\
					</Collection>\
				</Annotation>\
			</Annotations>\
		</Schema>\
	</edmx:DataServices>\
</edmx:Edmx>\
		',
		sPath2BusinessPartner = "/dataServices/schema/0/entityType/0",
		sPath2Product = "/dataServices/schema/0/entityType/1",
		sPath2SalesOrder = "/dataServices/schema/0/entityType/2",
		sPath2SalesOrderLineItem = "/dataServices/schema/0/entityType/3",
		sPath2Contact = "/dataServices/schema/0/entityType/4",
		fnEscape = BindingParser.complexParser.escape,
		fnGetNavigationPath = AnnotationHelper.getNavigationPath,
		fnIsMultiple = AnnotationHelper.isMultiple,
		fnSimplePath = AnnotationHelper.simplePath,
		TestControl = ManagedObject.extend("TestControl", {
			metadata: {
				properties: {
					any: "any",
					text: "string"
				}
			}
		}),
		mHeaders = {"Content-Type" : "application/xml"},
		mFixture = {
			"/GWSAMPLE_BASIC/$metadata" : {source : "GWSAMPLE_BASIC.metadata.xml"},
			"/GWSAMPLE_BASIC/annotations" : {source : "GWSAMPLE_BASIC.annotations.xml"},
			"/GWSAMPLE_BASIC/test_annotations" :
				{headers : mHeaders, message : sGwsampleTestAnnotations},
			"/test/$metadata" :  {headers : mHeaders, message : sTestMetadata},
			"/test/annotations" : {headers : mHeaders, message : sTestAnnotations}
		},
		oGlobalSandbox; // global sandbox for async tests

	oCIRCULAR.circle = oCIRCULAR; // some circular structure

	/**
	 * Override QUnit's original <code>module</code> function in order to automatically provide a
	 * properly configured sandbox.
	 *
	 * @param {string} sTitle
	 *   the module's title
	 * @param {object} [oEnvironment]
	 *   the test environment
	 * @param {function} [oEnvironment.afterEach]
	 *   setup
	 * @param {function} [oEnvironment.beforeEach]
	 *   teardown
	 */
	function module(sTitle, oEnvironment) {
		var fnAfterEach, fnBeforeEach;

		oEnvironment = oEnvironment || {};
		fnAfterEach = oEnvironment.afterEach;
		fnBeforeEach = oEnvironment.beforeEach;

		oEnvironment.beforeEach = function () {
			oGlobalSandbox = sinon.sandbox.create();
			TestUtils.useFakeServer(oGlobalSandbox, "sap/ui/core/qunit/model", mFixture);
			if (fnBeforeEach) {
				fnBeforeEach.apply(this, arguments);
			}
		};
		oEnvironment.afterEach = function () {
			if (fnAfterEach) {
				fnAfterEach.apply(this, arguments);
			}
			ODataModel.mServiceData = {}; // clear cache
			// I would consider this an API,
			// see https://github.com/cjohansen/Sinon.JS/issues/614
			oGlobalSandbox.verifyAndRestore();
		};

		QUnit.module(sTitle, oEnvironment);
	}

	/**
	 * Formats the value using the AnnotationHelper. Provides access to the given current context.
	 *
	 * @param {any} vValue
	 *   the value
	 * @param {sap.ui.model.Context} [oCurrentContext]
	 *   the given current context
	 * @param {function} [fnMethod=sap.ui.model.odata.AnnotationHelper.format]
	 *   the custom formatter function to call
	 * @param {boolean} [bSkipRawValue=false]
	 *   do not pass raw value to format function
	 * @returns {string}
	 *   a binding string
	 */
	function format(vValue, oCurrentContext, fnMethod, bSkipRawValue) {
		if (typeof oCurrentContext === "function") { // allow oCurrentContext to be omitted
			fnMethod = oCurrentContext;
			oCurrentContext = null;
		}
		fnMethod = fnMethod || AnnotationHelper.format;
		if (fnMethod.requiresIContext === true) {
			return bSkipRawValue ? fnMethod(oCurrentContext) : fnMethod(oCurrentContext, vValue);
		}
		return fnMethod(vValue);
	}

	/**
	 * Parses the value via the complex parser.
	 *
	 * @param {string} sBinding
	 *   a binding string
	 * @returns {object|string}
	 *   a binding info or the formatted, unescaped value
	 */
	function parse(sBinding) {
		// @see applySettings: complex parser returns undefined if there is nothing to unescape
		return BindingParser.complexParser(sBinding, undefined, true) || sBinding;
	}

	/**
	 * Formats the value using the AnnotationHelper and then parses the result via the complex
	 * parser. Provides access to the given current context.
	 *
	 * @param {any} vValue
	 *   the value
	 * @param {sap.ui.model.Context} [oCurrentContext]
	 *   the given current context
	 * @param {function} [fnMethod=sap.ui.model.odata.AnnotationHelper.format]
	 *   the custom formatter function to call
	 * @param {boolean} [bSkipRawValue=false]
	 *   do not pass raw value to format function
	 * @returns {object|string}
	 *   a binding info or the formatted, unescaped value
	 */
	function formatAndParse(vValue, oCurrentContext, fnMethod, bSkipRawValue) {
		return parse(format(vValue, oCurrentContext, fnMethod, bSkipRawValue));
	}

	/**
	 * Tests that the raw value for the given context actually leads to the expected binding.
	 *
	 * @param {object} assert the assertions
	 * @param {sap.ui.model.Context} oCurrentContext
	 *   the context pointing to the raw value
	 * @param {any} vExpected
	 *   the expected result from binding the <code>format</code> result against the model
	 * @param {object} oModelData
	 *   the data for the JSONModel to bind to
	 */
	function testBinding(assert, oCurrentContext, vExpected, oModelData) {
		var oModel = new JSONModel(oModelData),
			oControl = new TestControl({
				models: oModel,
				bindingContexts: oModel.createBindingContext("/")
			}),
			oRawValue = oCurrentContext.getObject(),
			sBinding = format(oRawValue, oCurrentContext),
			oSingleBindingInfo = parse(sBinding);

		oControl.bindProperty("text", oSingleBindingInfo);
		assert.strictEqual(oControl.getText(), vExpected, sBinding);
	}

	/**
	 * Runs the given code under test with the <code>GWSAMPLE_BASIC</code> meta model.
	 *
	 * @param {object} assert the assertions
	 * @param {function(sap.ui.model.odata.ODataMetaModel)} fnCodeUnderTest
	 *   the given code under test
	 * @returns {any|Promise}
	 *   (a promise to) whatever <code>fnCodeUnderTest</code> returns
	 */
	function withGwsampleModel(assert, fnCodeUnderTest) {
		return withGivenService(assert, "/GWSAMPLE_BASIC", "/GWSAMPLE_BASIC/annotations",
			fnCodeUnderTest);
	}

	/**
	 * Runs the given code under test with the <code>GWSAMPLE_BASIC</code> meta model and
	 * <code>sGwsampleTestAnnotations</code>.
	 *
	 * @param {object} assert the assertions
	 * @param {function(sap.ui.model.odata.ODataMetaModel)} fnCodeUnderTest
	 *   the given code under test
	 * @returns {any|Promise}
	 *   (a promise to) whatever <code>fnCodeUnderTest</code> returns
	 */
	function withGwsampleModelAndTestAnnotations(assert, fnCodeUnderTest) {
		return withGivenService(assert, "/GWSAMPLE_BASIC", "/GWSAMPLE_BASIC/test_annotations",
			fnCodeUnderTest);
	}

	/**
	 * Runs the given code under test with an <code>ODataMetaModel</code> built from
	 * <code>sTestMetaData</code> and <code>sTestMetaAnnotations</code>.
	 *
	 * @param {object} assert the assertions
	 * @param {function(sap.ui.model.odata.ODataMetaModel)} fnCodeUnderTest
	 *   the given code under test
	 * @returns {any|Promise}
	 *   (a promise to) whatever <code>fnCodeUnderTest</code> returns
	 */
	function withTestModel(assert, fnCodeUnderTest) {
		return withGivenService(assert, "/test", "/test/annotations", fnCodeUnderTest);
	}

	/**
	 * Runs the given code under test with an <code>ODataMetaModel</code> (and an
	 * <code>ODataModel</code>) for the given service and (array of) annotation URLs.
	 *
	 * @param {object} assert the assertions
	 * @param {string} sServiceUrl
	 *   the service URL
	 * @param {string|string[]} vAnnotationUrl
	 *   the (array of) annotation URLs
	 * @param {function} fnCodeUnderTest
	 *   the given code under test
	 * @returns {any|Promise}
	 *   (a promise to) whatever <code>fnCodeUnderTest</code> returns
	 */
	function withGivenService(assert, sServiceUrl, vAnnotationUrl, fnCodeUnderTest) {
		// sets up a v2 ODataModel and retrieves an ODataMetaModel from there
		var oModel = new ODataModel(sServiceUrl, {
				annotationURI : vAnnotationUrl,
				json : true,
				loadMetadataAsync : true
			});

		function onFailed(oEvent) {
			var oParameters = oEvent.getParameters();
			while (oParameters.getParameters) { // drill down to avoid circular structure
				oParameters = oParameters.getParameters();
			}
			assert.ok(false, "Failed to load: " + JSON.stringify(oParameters));
		}
		oModel.attachMetadataFailed(onFailed);
		oModel.attachAnnotationsFailed(onFailed);

		// calls the code under test once the meta model has loaded
		return oModel.getMetaModel().loaded().then(function () {
			return fnCodeUnderTest(oModel.getMetaModel(), oModel);
		});
	}

	//*********************************************************************************************
	module("sap.ui.model.odata.AnnotationHelper.format");

	//*********************************************************************************************
	[true, false].forEach(function (bWithRawValue) {
		QUnit.test("forward to getExpression: with RawValue " + bWithRawValue, function (assert) {
			var oInterface = {
					getObject: function () {/* will be overwritten by mock*/}
				},
				oRawValue = {},
				sResult = {},
				oGetObjectMock = oGlobalSandbox.mock(oInterface).expects("getObject");

			oGlobalSandbox.mock(Expression).expects("getExpression")
				.withExactArgs(oInterface, oRawValue, true).returns(sResult);

			if (bWithRawValue) {
				oGetObjectMock.never();

				// code under test
				assert.strictEqual(AnnotationHelper.format(oInterface, oRawValue), sResult,
					"result");
			} else {
				oGetObjectMock.withExactArgs("").returns(oRawValue);

				// code under test
				assert.strictEqual(AnnotationHelper.format(oInterface), sResult, "result");
			}
		});
	});

	//*********************************************************************************************
	["", "foo", "{path : 'foo'}", 'path : "{\\f,o,o}"'].forEach(function (sString) {
		QUnit.test("14.4.11 Expression edm:String: " + sString, function (assert) {
			return withGwsampleModel(assert, function (oMetaModel) {
				var sMetaPath = sPath2Product
						+ "/com.sap.vocabularies.UI.v1.FieldGroup#Dimensions/Data/0/Label",
					oCurrentContext = oMetaModel.getContext(sMetaPath),
					oRawValue = oMetaModel.getProperty(sMetaPath);

				// evil, test code only: write into ODataMetaModel
				oRawValue.String = sString;

				assert.strictEqual(formatAndParse(oRawValue, oCurrentContext), sString);
			});
		});
	});

	//*********************************************************************************************
	QUnit.test("forward to getExpression: raw value automatically determined", function (assert) {
		return withGwsampleModel(assert, function (oMetaModel) {
			var sMetaPath = sPath2Product
				+ "/com.sap.vocabularies.UI.v1.FieldGroup#Dimensions/Data/0/Label",
			oCurrentContext = oMetaModel.getContext(sMetaPath),
			sString = "{path : 'foo'}",
			oRawValue = oMetaModel.getProperty(sMetaPath);

			oGlobalSandbox.mock(Expression).expects("getExpression")
				.withExactArgs(oCurrentContext, oRawValue, true).returns(sString);

			AnnotationHelper.format(oCurrentContext);
		});
	});

	//*********************************************************************************************
	QUnit.test("14.4.11 Expression edm:String: references", function (assert) {
		return withGwsampleModel(assert, function (oMetaModel) {
			var sMetaPath = sPath2Product
					+ "/com.sap.vocabularies.UI.v1.FieldGroup#Dimensions/Data/0/Label",
				oCurrentContext = oMetaModel.getContext(sMetaPath),
				oEntityTypeBP,
				oRawValue = oMetaModel.getProperty(sMetaPath),
				oSingleBindingInfo;

			function getSetting(sName) {
				assert.strictEqual(sName, "bindTexts");
				return true;
			}

			oCurrentContext.getSetting = getSetting;

			oSingleBindingInfo = formatAndParse(oRawValue, oCurrentContext);

			assert.deepEqual(oSingleBindingInfo, {
				path : "/##/dataServices/schema/[${namespace}==='GWSAMPLE_BASIC']/entityType/"
					// "$\{name}" to avoid that Maven replaces "${name}"
					+ "[$\{name}==='Product']/com.sap.vocabularies.UI.v1.FieldGroup"
					+ "#Dimensions/Data/[${Value/Path}==='Width']/Label/String"
			});

			// ensure that the formatted value does not contain double quotes
			assert.ok(AnnotationHelper.format(oCurrentContext, oRawValue).indexOf('"') < 0);


			// check escaping via fake annotation
			oEntityTypeBP = oMetaModel.getObject(sPath2Product);
			oEntityTypeBP["foo{Dimensions}"]
				= oEntityTypeBP["com.sap.vocabularies.UI.v1.FieldGroup#Dimensions"];
			sMetaPath = sPath2Product + "/foo{Dimensions}/Data/0/Label";
			oCurrentContext = oMetaModel.getContext(sMetaPath);
			oRawValue = oMetaModel.getProperty(sMetaPath);
			oCurrentContext.getSetting = getSetting;

			oSingleBindingInfo = formatAndParse(oRawValue, oCurrentContext);

			assert.deepEqual(oSingleBindingInfo, {
				path : "/##/dataServices/schema/[${namespace}==='GWSAMPLE_BASIC']/entityType/"
					+ "[$\{name}==='Product']/foo{Dimensions}/Data/[${Value/Path}==='Width']"
					+ "/Label/String"
			});
		});
	});

	//*********************************************************************************************
	[
		{typeName: "Bool", result: "true"},
		{typeName: "Date", result: "2015-03-24"},
		{typeName: "DateTimeOffset", result: "2015-03-24T14:03:27Z"},
		{typeName: "Decimal", result: "-123456789012345678901234567890.1234567890"},
		{typeName: "Float", result: "-7.4503e-36"},
		{typeName: "Guid", result: "0050568D-393C-1ED4-9D97-E65F0F3FCC23"},
		{typeName: "Int", result: "9007199254740992"},
		{typeName: "TimeOfDay", result: "13:57:06"}
	].forEach(function (oFixture, index) {
		QUnit.test("14.4.x Constant Expression edm:" + oFixture.typeName, function (assert) {
			return withGwsampleModelAndTestAnnotations(assert, function (oMetaModel) {
				var sMetaPath = sPath2BusinessPartner
						+ "/com.sap.vocabularies.UI.v1.Identification/3/Value/Apply/Parameters/"
						+ (2 * index),
					oCurrentContext = oMetaModel.getContext(sMetaPath),
					oRawValue = oMetaModel.getObject(sMetaPath);

				assert.strictEqual(formatAndParse(oRawValue, oCurrentContext), oFixture.result);
			});
		});
	});

	//*********************************************************************************************
	["", "/", ".", "foo", "path : 'foo'", 'path : "{\\f,o,o}"'].forEach(function (sPath) {
		QUnit.test("14.5.12 Expression edm:Path: " + JSON.stringify(sPath), function (assert) {
			var oMetaModel = new JSONModel({
					"Value" : {
						"Path" : sPath
					}
				}),
				sMetaPath = "/Value",
				oCurrentContext = oMetaModel.getContext(sMetaPath),
				oRawValue = oMetaModel.getProperty(sMetaPath),
				oSingleBindingInfo = formatAndParse(oRawValue, oCurrentContext);

			assert.strictEqual(typeof oSingleBindingInfo, "object", "got a binding info");
			assert.strictEqual(oSingleBindingInfo.path, sPath);
			assert.strictEqual(oSingleBindingInfo.type, undefined);
		});
	});

	//*********************************************************************************************
	[
		oBoolean,
		oByte,
		oDateTime,
		oDateTimeOffset,
		oDecimal,
		oDouble,
		oFloat,
		oGuid,
		oInt16,
		oInt32,
		oInt64,
		oInt64,
		oSByte,
		oSingle,
		oString10,
		oString80,
		oTime
	].forEach(function(oType, i) {
		var sPath = sPath2Product + "/com.sap.vocabularies.UI.v1.Identification/" + i
				+ "/Value/Eq/0";

		QUnit.test("14.5.12 Expression edm:Path w/ type, path = " + sPath
			+ ", type = " + oType.name,
			function (assert) {
				return withTestModel(assert, function (oMetaModel) {
					var oCurrentContext = oMetaModel.getContext(sPath),
						oRawValue = oMetaModel.getObject(sPath),
						sBinding,
						oSingleBindingInfo;

					sBinding = format(oRawValue, oCurrentContext);

					assert.ok(!/constraints\s*:\s*{}/.test(sBinding),
						"No empty constraints in binding");

					oSingleBindingInfo = parse(sBinding);

					assert.strictEqual(oSingleBindingInfo.path, oRawValue.Path);
					assert.ok(oSingleBindingInfo.type instanceof jQuery.sap.getObject(oType.name),
						"type is " + oType.name);
					assert.deepEqual(oSingleBindingInfo.type.oConstraints, oType.constraints);

					// ensure that the formatted value does not contain double quotes
					assert.ok(AnnotationHelper.format(oCurrentContext, oRawValue).indexOf('"') < 0);
				});
			}
		);
	});
	// Q: output simple binding expression in case application has not opted-in to complex ones?
	//    /* if (ManagedObject.bindingParser === sap.ui.base.BindingParser.simpleParser) {} */
	// A: rather not, we probably need complex bindings in many cases (e.g. for types)

	//*********************************************************************************************
	[
		{Apply : null},
		{Apply : "unsupported"},
		{Apply : {Name : "unsupported"}},
		{Apply : {Name : "odata.concat"}},
		{Apply : {Name : "odata.concat", Parameters : {}}},
		{Apply : {Name : "odata.fillUriTemplate"}},
		{Apply : {Name : "odata.fillUriTemplate", Parameters : {}}},
		{Apply : {Name : "odata.fillUriTemplate", Parameters : []}},
		{Apply : {Name : "odata.fillUriTemplate", Parameters : [{}]}},
		{Apply : {Name : "odata.fillUriTemplate", Parameters : [null]}},
		{Apply : {Name : "odata.fillUriTemplate", Parameters : ["no object"]}},
		{Apply : {Name : "odata.fillUriTemplate", Parameters : [{Type: "NoString"}]}},
		{Apply : {Name : "odata.uriEncode"}},
		{Apply : {Name : "odata.uriEncode", Parameters : {}}},
		{Apply : {Name : "odata.uriEncode", Parameters : []}},
		{Apply : {Name : "odata.uriEncode", Parameters : [null]}}
	].forEach(function (oApply) {
		var sError = "Unsupported: " + Basics.toErrorString(oApply);

		QUnit.test("14.5.3 Expression edm:Apply: " + sError, function (assert) {
			oGlobalSandbox.mock(Basics).expects("error").once().throws(new SyntaxError());

			return withGwsampleModel(assert, function (oMetaModel) {
				var sPath = sPath2Contact + "/com.sap.vocabularies.UI.v1.HeaderInfo/Title/Value",
					oCurrentContext = oMetaModel.getContext(sPath);

				assert.strictEqual(formatAndParse(oApply, oCurrentContext), sError);
			});
		});
	});

	//*********************************************************************************************
	QUnit.test("14.5.3.1.1 Function odata.concat", function (assert) {
		return withGwsampleModel(assert, function (oMetaModel) {
			var sPath = sPath2Contact + "/com.sap.vocabularies.UI.v1.Badge/Title/Value",
				oRawValue = oMetaModel.getObject(sPath);

			//TODO remove this workaround to fix whitespace issue
			oRawValue.Apply.Parameters[1].Value = " ";

			testBinding(assert, oMetaModel.getContext(sPath), "John Doe", {
				FirstName: "John",
				LastName: "Doe"
			});
		});
	});

	//*********************************************************************************************
	QUnit.test("14.5.3.1.1 Function odata.concat: escaping & unsupported type", function (assert) {
		oGlobalSandbox.mock(Basics).expects("error").once().throws(new SyntaxError());

		return withGwsampleModel(assert, function (oMetaModel) {
			var sPath = sPath2Contact + "/com.sap.vocabularies.UI.v1.HeaderInfo/Title/Value",
				oCurrentContext = oMetaModel.getContext(sPath),
				oParameter = {Type: "Int16", Value: 42},
				oRawValue = {
					Apply: {
						Name: "odata.concat",
						// Note: 1st value needs proper escaping!
						// Due to changed error handling this is not tested anymore here
						Parameters: [{Type: "String", Value : "{foo}"}, oParameter]
					}
				};

			assert.strictEqual(formatAndParse(oRawValue, oCurrentContext),
				"Unsupported: " + Basics.toErrorString(oRawValue));
		});
	});

	//*********************************************************************************************
	QUnit.test("14.5.3.1.1 Function odata.concat: null parameter", function (assert) {
		oGlobalSandbox.mock(Basics).expects("error").once().throws(new SyntaxError());

		return withGwsampleModel(assert, function (oMetaModel) {
			var sPath = sPath2Contact + "/com.sap.vocabularies.UI.v1.HeaderInfo/Title/Value",
				oCurrentContext = oMetaModel.getContext(sPath),
				oRawValue = {
					Apply: {
						Name: "odata.concat",
						Parameters: [{Type: "String", Value : "*foo*"}, null]
					}
				};

			assert.strictEqual(formatAndParse(oRawValue, oCurrentContext),
				"Unsupported: " + Basics.toErrorString(oRawValue));
		});
	});

	//*********************************************************************************************
	QUnit.test("14.5.3.1.1 Function odata.concat: various constants", function (assert) {
		return withGwsampleModelAndTestAnnotations(assert, function (oMetaModel) {
			var sMetaPath = sPath2BusinessPartner
					+ "/com.sap.vocabularies.UI.v1.Identification/3/Value",
				oCurrentContext = oMetaModel.getContext(sMetaPath),
				oRawValue = oMetaModel.getObject(sMetaPath);

			assert.strictEqual(formatAndParse(oRawValue, oCurrentContext),
				"true|" +
				"2015-03-24|" +
				"2015-03-24T14:03:27Z|" +
				"-123456789012345678901234567890.1234567890|" +
				"-7.4503e-36|" +
				"0050568D-393C-1ED4-9D97-E65F0F3FCC23|" +
				"9007199254740992|" +
				"13:57:06");
		});
	});

	//*********************************************************************************************
	QUnit.test("14.5.3.1.2 odata.fillUriTemplate: fake annotations", function (assert) {
		return withGwsampleModelAndTestAnnotations(assert, function (oMetaModel) {
			var sMetaPath = sPath2BusinessPartner
					+ "/com.sap.vocabularies.UI.v1.Identification/0/Url",
				oContext = oMetaModel.getContext(sMetaPath);

			testBinding(assert, oContext,
				"#BusinessPartner-displayFactSheet?BusinessPartnerID=0815", {
				BusinessPartnerID: "0815"
			});

			// test that the binding still works with bindTexts
			// testBinding cannot be used because it uses a JSONModel w/o meta model
			oContext.getSetting = function (sSetting) {
				return sSetting === "bindTexts";
			};
			assert.strictEqual(format(oContext.getObject(), oContext),
				"{=odata.fillUriTemplate(${path:"
				+ "'/##/dataServices/schema/[${namespace}===\\'GWSAMPLE_BASIC\\']/entityType/"
				+ "[$\{name}===\\'BusinessPartner\\']/com.sap.vocabularies.UI.v1.Identification/"
				+ "0/Url/Apply/Parameters/0/Value'},{'ID1':${BusinessPartnerID}})}");
		});
	});

	//*********************************************************************************************
	QUnit.test("14.5.3.1.2 odata.fillUriTemplate: various constants", function (assert) {
		return withGwsampleModelAndTestAnnotations(assert, function (oMetaModel) {
			var sMetaPath = sPath2BusinessPartner
					+ "/com.sap.vocabularies.UI.v1.Identification/4/Url",
				oCurrentContext = oMetaModel.getContext(sMetaPath),
				oRawValue = oMetaModel.getObject(sMetaPath);

			// Note: theoretically, each piece inserted into the template needs to be URI encoded,
			// this is only done where it actually makes a difference here
			assert.strictEqual(formatAndParse(oRawValue, oCurrentContext),
				"#true/2015-03-24/"
				+ encodeURIComponent("2015-03-24T14:03:27Z")
				+ "/-123456789012345678901234567890.1234567890/-7.4503e-36"
				+ "/0050568D-393C-1ED4-9D97-E65F0F3FCC23/9007199254740992/"
				+ encodeURIComponent("hello, world")
				+ "/"
				+ encodeURIComponent("13:57:06"));
		});
	});

	//*********************************************************************************************
	[
		{type: "String", value: "foo\\bar", result: "'foo\\bar'"},
		{type: "Unsupported", value: "foo\\bar", error: true}
	].forEach(function (oFixture) {
		QUnit.test("14.5.3.1.3 Function odata.uriEncode: " + JSON.stringify(oFixture.type),
			function (assert) {
				if (oFixture.error) {
					oGlobalSandbox.mock(Basics).expects("error").once().throws(new SyntaxError());
				}

				return withGwsampleModel(assert, function (oMetaModel) {
					var oExpectedResult,
						sMetaPath = sPath2BusinessPartner
							+ "/com.sap.vocabularies.UI.v1.Identification/0/Url",
						oCurrentContext = oMetaModel.getContext(sMetaPath),
						oRawValue = {
							Apply: {
								Name: "odata.uriEncode",
								Parameters: [{
									Type: oFixture.type,
									Value: oFixture.value
								}]
							}
						};

					oExpectedResult = oFixture.error
						? "Unsupported: " + Basics.toErrorString(oRawValue)
						: oFixture.result;
					assert.strictEqual(formatAndParse(oRawValue, oCurrentContext), oExpectedResult);
				});
			}
		);
	});

	//*********************************************************************************************
	QUnit.test("14.5.3.1.3 Function odata.uriEncode", function (assert) {
		return withGwsampleModel(assert, function (oMetaModel) {
			var sMetaPath = sPath2BusinessPartner + "/com.sap.vocabularies.UI.v1.Identification/2"
					+ "/Url/Apply/Parameters/1/Value";

			testBinding(assert, oMetaModel.getContext(sMetaPath), "'Domplatz'", {
				Address: {
					Street : "Domplatz",
					City : "Speyer"
				}
			});
		});
	});

	//*********************************************************************************************
	[ // see http://www.odata.org/documentation/odata-version-2-0/overview/
		{type: "Bool", result: "false"},
		{type: "Date", result: "datetime'2099-03-25T00:00:00'"},
		//TODO split seconds, e.g. ".123456789012"
		{type: "DateTimeOffset", result: "datetimeoffset'2099-01-06T07:25:21Z'"},
		{type: "Decimal", result: "-12345678901234567.12345678901234M"},
		{type: "Float", result: "1.69e+308d"},
		{type: "Guid", result: "guid'0050568D-393C-1EE4-A5AE-9AAE85248FF1'"},
		{type: "Int", result: "-9223372036854775800L"},
		{type: "String", result: "'String Filtered Maxlength 40'"},
		//TODO split seconds, e.g. ".123456789012"
		{type: "TimeOfDay", result: "time'PT11H11M11S'"}
	].forEach(function (oFixture, index) {
		QUnit.test("14.5.3.1.3 odata.uriEncode of edm:" + oFixture.type, function (assert) {
			return withGwsampleModelAndTestAnnotations(assert, function (oMetaModel) {
				var sMetaPath = sPath2BusinessPartner
						+ "/com.sap.vocabularies.UI.v1.Identification/5/Url/Apply/"
						+ "Parameters/" + (index + 1) + "/Value",
					oCurrentContext = oMetaModel.getContext(sMetaPath),
					oRawValue = oMetaModel.getObject(sMetaPath);

				assert.strictEqual(formatAndParse(oRawValue, oCurrentContext), oFixture.result);
			});
		});
	});

	//*********************************************************************************************
	QUnit.test("14.5.3.1.3 odata.uriEncode: integration-like test", function (assert) {
		function encode(s) {
			return encodeURIComponent(s).replace(/'/g, "%27");
		}

		return withGwsampleModelAndTestAnnotations(assert, function (oMetaModel) {
			var sExpectedUrl,
				sMetaPath = sPath2BusinessPartner
					+ "/com.sap.vocabularies.UI.v1.Identification/5/Url",
				oCurrentContext = oMetaModel.getContext(sMetaPath),
				oRawValue = oMetaModel.getObject(sMetaPath);

			// see http://www.odata.org/documentation/odata-version-2-0/overview/
			sExpectedUrl = "/sap/opu/odata/sap/ZUI5_EDM_TYPES/EdmTypesCollection?$filter="
				+ "Boolean+eq+false"
				+ "+and+Date+eq+"
				+ encode("datetime'2099-03-25T00:00:00'")
				+ "+and+DateTimeOffset+eq+"
				//TODO split seconds, e.g. ".123456789012"
				+ encode("datetimeoffset'2099-01-06T07:25:21Z'")
				+ "+and+Decimal+eq+"
				+ encode("-12345678901234567.12345678901234M")
				+ "+and+Double+eq+"
				+ encode("1.69e+308d")
				+ "+and+GlobalUID+eq+"
				+ encode("guid'0050568D-393C-1EE4-A5AE-9AAE85248FF1'")
				+ "+and+Int64+eq+"
				+ encode("-9223372036854775800L")
				+ "+and+String40+eq+"
				+ encode("'String Filtered Maxlength 40'")
				+ "+and+Time+eq+"
				+ encode("time'PT11H11M11S'");

			assert.strictEqual(formatAndParse(oRawValue, oCurrentContext), sExpectedUrl,
				sExpectedUrl);
		});
	});

	//*********************************************************************************************
	QUnit.test("14.5.3 Nested apply (fillUriTemplate embeds uriEncode)", function (assert) {
		return withGwsampleModel(assert, function (oMetaModel) {
			var sMetaPath = sPath2BusinessPartner + "/com.sap.vocabularies.UI.v1.Identification/2"
					+ "/Url";

			testBinding(assert, oMetaModel.getContext(sMetaPath),
				"https://www.google.de/maps/place/%27Domplatz%27,%27Speyer%27",
				{
					Address: {
						Street : "Domplatz",
						City : "Speyer"
					}
				});
		});
	});

	//*********************************************************************************************
	QUnit.test("14.5.3 Nested apply (odata.fillUriTemplate & invalid uriEncode)",
		function (assert) {
			oGlobalSandbox.mock(Basics).expects("error").once().throws(new SyntaxError());

			return withGwsampleModel(assert, function (oMetaModel) {
				var sMetaPath = sPath2BusinessPartner + "/com.sap.vocabularies.UI.v1."
						+ "Identification/2/Url",
					oCurrentContext = oMetaModel.getContext(sMetaPath),
					oRawValue = {
						Apply : {
							Name : "odata.fillUriTemplate",
							Parameters : [{
								Type: "String",
								Value: "http://foo.bar/{x}"
							}, {
								Name: "x",
								Value: {
									Apply: {Name: "odata.uriEncode"}
								}
							}]
						}
					};

				assert.strictEqual(formatAndParse(oRawValue, oCurrentContext),
					"Unsupported: " + Basics.toErrorString(oRawValue));
			});
		});

	//*********************************************************************************************
	QUnit.test("14.5.3 Nested apply (concat embeds concat & uriEncode)", function (assert) {
		// This test is important to show that a nested concat must be expression
		return withGwsampleModelAndTestAnnotations(assert, function (oMetaModel) {
			var sMetaPath = sPath2BusinessPartner
					+ "/com.sap.vocabularies.UI.v1.Identification/1/Value";

			testBinding(assert, oMetaModel.getContext(sMetaPath), "SAP 'SE'", {
				CompanyName: "SAP",
				LegalForm: "SE"
			});
		});
	});

	//*********************************************************************************************
	QUnit.test("14.5.3 Nested apply (uriEncode embeds concat)", function (assert) {
		return withGwsampleModelAndTestAnnotations(assert, function (oMetaModel) {
			var sMetaPath = sPath2BusinessPartner
					+ "/com.sap.vocabularies.UI.v1.Identification/2/Value";

			testBinding(assert, oMetaModel.getContext(sMetaPath), "'SAP SE'", {
				CompanyName: "SAP",
				LegalForm: "SE"
			});
		});
	});

	//*********************************************************************************************
	QUnit.test("14.5.1 Comparison and Logical Operators: part 1, comparison", function (assert) {
		return withGwsampleModelAndTestAnnotations(assert, function (oMetaModel) {
			var sMetaPath = sPath2BusinessPartner
					+ "/com.sap.vocabularies.UI.v1.Identification/6/Value",
				oCurrentContext = oMetaModel.getContext(sMetaPath),
				oRawValue = oMetaModel.getObject(sMetaPath);

			oGlobalSandbox.stub(Expression, "path", function (oInterface, oPathValue) {
				// do not try to "determine type for property"
				return {result: "binding", value: oPathValue.value};
			});

			assert.strictEqual(format(oRawValue, oCurrentContext),
				"{=((${p1}<${p2})===(${p4}>${p5}))&&((${p6}>=${p7})!==(${p8}<=${p9}))}");
		});
	});

	//*********************************************************************************************
	QUnit.test("14.5.1 Comparison and Logical Operators: part 2, logical", function (assert) {
		return withGwsampleModelAndTestAnnotations(assert, function (oMetaModel) {
			var sMetaPath = sPath2BusinessPartner
					+ "/com.sap.vocabularies.UI.v1.Identification/7/Value",
				oCurrentContext = oMetaModel.getContext(sMetaPath),
				oRawValue = oMetaModel.getObject(sMetaPath);

			oGlobalSandbox.stub(Expression, "path", function (oInterface, oPathValue) {
				// do not try to "determine type for property"
				return {result: "binding", value: oPathValue.value};
			});

			assert.strictEqual(format(oRawValue, oCurrentContext),
				"{=(!(${p1}===${p2}))||((${p3}===${p4})&&(${p5}===${p6}))}");
		});
	});

	//*********************************************************************************************
	[
	    {path: "_Boolean", value: true},
	    {path: "_Byte", value: 255},
	    {path: "_DateTime", value: new Date(Date.UTC(2015, 3, 22, 12, 43, 7, 236))},
	    {path: "_DateTimeOffset", value: new Date(Date.UTC(2015, 3, 22, 12, 43, 7, 236))},
	    {path: "_Decimal", value: "104245025234234502435.6430345"},
	    {path: "_Double", value: 3.1415927},
	    {path: "_Float", value: 0.30103},
	    {path: "_Guid", value: "0050568D-393C-1ED4-9D97-E65F0F3FCC23"},
	    {path: "_Int16", value: 16},
	    {path: "_Int32", value: 32},
	    {path: "_Int64", value: "9007199254740992"},
	    {path: "_Int64Small", value: "64"},
	    {path: "_SByte", value: -126},
	    {path: "_Single", value: 2.7182818},
	    {path: "_String10", value: "foo"},
	    {path: "_String80", value: "bar"},
	    {path: "_Time", value: {__edmType: "Edm.Time", ms: Date.UTC(1970, 0, 1, 12, 43, 7, 236)}}
	].forEach(function (oFixture, i) {
		QUnit.test("14.5.1 Comparison and Logical Operators: Eq on" + oFixture.path,
			function (assert) {
				return withTestModel(assert, function (oMetaModel) {
					var sPath = sPath2Product + "/com.sap.vocabularies.UI.v1.Identification/" + i
							+ "/Value/",
						oCurrentContext = oMetaModel.getContext(sPath),
						oTestData = {};

					// null handling (no value for the property)
					testBinding(assert, oCurrentContext, "false", oTestData);

					oTestData[oFixture.path] = oFixture.value;
					testBinding(assert, oCurrentContext, "true", oTestData);
				});
			});
	});

	//*********************************************************************************************
	QUnit.test("14.5.6 Expression edm:If", function (assert) {
		return withGwsampleModelAndTestAnnotations(assert, function (oMetaModel) {
			var sMetaPath = sPath2Contact
					+ "/com.sap.vocabularies.UI.v1.HeaderInfo/Title/Value",
				oCurrentContext = oMetaModel.getContext(sMetaPath);

			testBinding(assert, oCurrentContext, "Mr. ", {Sex: "M"});
			testBinding(assert, oCurrentContext, "Mrs. ", {Sex: "F"});
			testBinding(assert, oCurrentContext, "", {Sex: ""});
		});
	});

	//*********************************************************************************************
	QUnit.test("14.5.10 Expression edm:Null", function (assert) {
		return withGwsampleModelAndTestAnnotations(assert, function (oMetaModel) {
			var sMetaPath = sPath2Contact
					+ "/com.sap.vocabularies.UI.v1.HeaderInfo/ImageUrl/Url",
				oCurrentContext = oMetaModel.getContext(sMetaPath);

			testBinding(assert, oCurrentContext, undefined, {EmailAddress: null},
				"null from formatter converted to property's default value");
			testBinding(assert, oCurrentContext, "mailto:foo@bar.com",
				{EmailAddress: "foo@bar.com"});
		});
	});

	//*********************************************************************************************
	module("sap.ui.model.odata.AnnotationHelper.simplePath");

	//*********************************************************************************************
	[true, false].forEach(function (bWithRawValue) {
		QUnit.test("forward to getExpression: with RawValue " + bWithRawValue, function (assert) {
			var oInterface = {
					getObject: function () {/* will be overwritten by mock*/}
				},
				oRawValue = {},
				sResult = {},
				oGetObjectMock = oGlobalSandbox.mock(oInterface).expects("getObject");

			oGlobalSandbox.mock(Expression).expects("getExpression")
				.withExactArgs(oInterface, oRawValue, false).returns(sResult);

			if (bWithRawValue) {
				oGetObjectMock.never();

				// code under test
				assert.strictEqual(AnnotationHelper.simplePath(oInterface, oRawValue), sResult,
					"result");
			} else {
				oGetObjectMock.withExactArgs("").returns(oRawValue);

				// code under test
				assert.strictEqual(AnnotationHelper.simplePath(oInterface), sResult, "result");
			}
		});
	});

	//*********************************************************************************************
	["", "/", ".", "foo", "{\\}", "path : 'foo'", 'path : "{\\f,o,o}"'].forEach(function (sPath) {
		QUnit.test("14.5.12 Expression edm:Path: " + JSON.stringify(sPath), function (assert) {
			var oMetaModel = new JSONModel({
					"Value" : {
						"Path" : sPath
					}
				}),
				sMetaPath = "/Value",
				oCurrentContext = oMetaModel.getContext(sMetaPath),
				oRawValue = oMetaModel.getProperty(sMetaPath),
				oSingleBindingInfo
					= formatAndParse(oRawValue, oCurrentContext, fnSimplePath);

			assert.strictEqual(typeof oSingleBindingInfo, "object", "got a binding info");
			assert.strictEqual(oSingleBindingInfo.path, sPath);
			assert.strictEqual(oSingleBindingInfo.type, undefined);
			assert.strictEqual(oSingleBindingInfo.constraints, undefined);

			if (sPath.indexOf(":") < 0 && fnEscape(sPath) === sPath) {
				// @see sap.ui.base.BindingParser: rObject, rBindingChars
				assert.strictEqual(fnSimplePath(oCurrentContext, oRawValue), "{" + sPath + "}",
					"make sure that simple cases look simple");
			}
		});
	});

	//*********************************************************************************************
	module("sap.ui.model.odata.AnnotationHelper.followPath");

	//*********************************************************************************************
	[{
		// empty (annotation) path
		AnnotationPath : "",
		metaPath : sPath2Product + "/com.sap.vocabularies.UI.v1.Facets/0/Facets/0/Target",
		navigationPath : "",
		resolvedPath : sPath2Product
	}, {
		// one navigation property, multiplicity "1"
		AnnotationPath : "ToSupplier",
		metaPath : sPath2Product + "/com.sap.vocabularies.UI.v1.Facets/0/Facets/0/Target",
		entitySet : "BusinessPartnerSet",
		isMultiple : false,
		navigationPath : "ToSupplier",
		resolvedPath : sPath2BusinessPartner
	}, {
		// navigation property and term cast (typical use case!)
		AnnotationPath : "ToSupplier/@com.sap.vocabularies.Communication.v1.Address",
		metaPath : sPath2Product + "/com.sap.vocabularies.UI.v1.Facets/0/Facets/0/Target",
		entitySet : "BusinessPartnerSet",
		isMultiple : false,
		navigationPath : "ToSupplier",
		resolvedPath : sPath2BusinessPartner + "/com.sap.vocabularies.Communication.v1.Address"
//	}, {
//		// annotation at navigation property itself
//TODO what exactly should happen in this case, can the path continue after this?
//		AnnotationPath : "ToSupplier@some.annotation.for.Navigation.Property",
//		metaPath : sPath2Product + "/com.sap.vocabularies.UI.v1.Facets/0/Facets/0/Target",
//		entitySet : "BusinessPartnerSet",
//		isMultiple : false,
//		navigationPath : "ToSupplier",
//		resolvedPath :
//			sPath2Product + "/navigationProperty/1/some.annotation.for.Navigation.Property"
	}, {
		// many navigation properties, ToLineItems has multiplicity "*" but is not last!
		AnnotationPath
			: "ToLineItems/ToProduct/ToSupplier/ToContacts/@com.sap.vocabularies.UI.v1.HeaderInfo",
		metaPath : sPath2SalesOrder + "/com.sap.vocabularies.UI.v1.Facets/0/Target",
		entitySet : "ContactSet",
		isMultiple : Error,
		navigationPath : "ToLineItems/ToProduct/ToSupplier/ToContacts",
		resolvedPath : sPath2Contact + "/com.sap.vocabularies.UI.v1.HeaderInfo"
	}, {
		// single navigation property with multiplicity "*" and fantasy term cast
		AnnotationPath : "ToLineItems/@foo.Bar",
		metaPath : sPath2SalesOrder + "/com.sap.vocabularies.UI.v1.Facets/0/Target",
		entitySet : "SalesOrderLineItemSet",
		isMultiple : true,
		navigationPath : "ToLineItems",
		// decision: invalid path is usually OK for data binding
		resolvedPath : sPath2SalesOrderLineItem + "/foo.Bar"
	}, {
		// many navigation properties, multiplicity "*" as last one
		AnnotationPath : "ToProduct/ToSupplier/ToContacts/@com.sap.vocabularies.UI.v1.HeaderInfo",
		metaPath : sPath2SalesOrderLineItem + "/com.sap.vocabularies.UI.v1.Facets/0/Target",
		entitySet : "ContactSet",
		isMultiple : true,
		navigationPath : "ToProduct/ToSupplier/ToContacts",
		resolvedPath : sPath2Contact + "/com.sap.vocabularies.UI.v1.HeaderInfo"
	}, {
		// just a term cast with a qualifier
		AnnotationPath : "@com.sap.vocabularies.UI.v1.FieldGroup#Dimensions",
		metaPath : sPath2Product + "/com.sap.vocabularies.UI.v1.Facets/0/Facets/0/Target",
		navigationPath : "",
		resolvedPath : sPath2Product + "/com.sap.vocabularies.UI.v1.FieldGroup#Dimensions"
	}, {
		// type cast syntax, not yet supported
		AnnotationPath : "unsupported.type.cast",
		metaPath : sPath2Product + "/com.sap.vocabularies.UI.v1.Facets/0/Facets/0/Target",
		navigationPath : "",
		resolvedPath : undefined
	}, {
		// some invalid property
		AnnotationPath : "invalid_property",
		metaPath : sPath2Product + "/com.sap.vocabularies.UI.v1.Facets/0/Facets/0/Target",
		navigationPath : "",
		resolvedPath : undefined
	}, {
		// Note: suffix after unsupported path is ignored
		AnnotationPath : "invalid_property/@some.Annotation",
		metaPath : sPath2Product + "/com.sap.vocabularies.UI.v1.Facets/0/Facets/0/Target",
		navigationPath : "",
		resolvedPath : undefined
	}, {
		// navigation property path
		NavigationPropertyPath : "ToBusinessPartner",
		metaPath : sPath2Contact + "/com.sap.vocabularies.UI.v1.LineItem/0/Target",
		entitySet : "BusinessPartnerSet",
		isMultiple : false,
		navigationPath : "ToBusinessPartner",
		resolvedPath : sPath2BusinessPartner
	}, {
		// structural property
		Path : "Address",
		metaPath : sPath2BusinessPartner + "/com.sap.vocabularies.Communication.v1.Address/street",
		navigationPath : "",
		resolvedPath : sPath2BusinessPartner + "/property/0"
	}, {
		// structural property of complex type
		Path : "Address/Street",
		metaPath : sPath2BusinessPartner + "/com.sap.vocabularies.Communication.v1.Address/street",
		navigationPath : "",
		resolvedPath : "/dataServices/schema/0/complexType/0/property/2"
	}, {
		// structural property of complex type
		PropertyPath : "Address/Street",
		metaPath : sPath2BusinessPartner + "/com.sap.vocabularies.Communication.v1.Address/street",
		navigationPath : "",
		resolvedPath : "/dataServices/schema/0/complexType/0/property/2"
	}, {
		// annotation at entity set: "an empty path resolves to the entity set"
		// Note: no singletons in v2!
		Path : "",
		metaPath : "/dataServices/schema/0/entityContainer/0/entitySet/1"
			+ "/com.sap.vocabularies.UI.v1.DataPoint/Value",
		navigationPath : "",
		resolvedPath : "/dataServices/schema/0/entityContainer/0/entitySet/1"
	}, {
		// annotation at entity set: "non-empty paths MUST follow the rules for annotations
		//   targeting the declared entity type of the entity set"
		Path : "ProductID",
		metaPath : "/dataServices/schema/0/entityContainer/0/entitySet/1"
			+ "/com.sap.vocabularies.UI.v1.DataPoint/Value",
		navigationPath : "",
		resolvedPath : "/dataServices/schema/0/entityType/1/property/0"
	}].forEach(function (oFixture) {
		var sPath, sTitle;

		if (oFixture.hasOwnProperty("AnnotationPath")) {
			sPath = oFixture.AnnotationPath;
			sTitle = "14.5.2 Expression edm:AnnotationPath: " + sPath;
		} else if (oFixture.hasOwnProperty("Path")) {
			sPath = oFixture.Path;
			sTitle = "14.5.12 Expression edm:Path: " + sPath;
		} else if (oFixture.hasOwnProperty("PropertyPath")) {
			sPath = oFixture.PropertyPath;
			sTitle = "14.5.13 Expression edm:PropertyPath: " + sPath;
		} else if (oFixture.hasOwnProperty("NavigationPropertyPath")) {
			sPath = oFixture.NavigationPropertyPath;
			sTitle = "14.5.11 Expression edm:NavigationPropertyPath: " + sPath;
		}

		if (oFixture.navigationPath === "") {
			// w/o a navigation path, these cannot have a different value
			oFixture.entitySet = undefined;
			oFixture.isMultiple = false;
		}

		QUnit.test(sTitle, function (assert) {
			return withGwsampleModel(assert, function (oMetaModel) {
				var oContext = oMetaModel.createBindingContext(oFixture.metaPath),
					oRawValue = oMetaModel.getProperty(oFixture.metaPath),
					oSingleBindingInfo;

				if (oRawValue) {
					// evil, test code only: write into ODataMetaModel
					delete oRawValue.AnnotationPath;
					delete oRawValue.Path;
					delete oRawValue.PropertyPath;
					delete oRawValue.NavigationPropertyPath;
					if (oFixture.hasOwnProperty("AnnotationPath")) {
						oRawValue.AnnotationPath = oFixture.AnnotationPath;
					} else if (oFixture.hasOwnProperty("Path")) {
						oRawValue.Path = oFixture.Path;
					} else if (oFixture.hasOwnProperty("PropertyPath")) {
						oRawValue.PropertyPath = oFixture.PropertyPath;
					} else if (oFixture.hasOwnProperty("NavigationPropertyPath")) {
						oRawValue.NavigationPropertyPath = oFixture.NavigationPropertyPath;
					}
				}

				// getNavigationPath
				[false, true].forEach(function (bSkipRawValue) {
					oSingleBindingInfo
						= formatAndParse(oRawValue, oContext, fnGetNavigationPath, bSkipRawValue);

					assert.strictEqual(typeof oSingleBindingInfo, "object",
						"getNavigationPath: got a binding info; skip raw value: "
							+ bSkipRawValue);
					assert.strictEqual(oSingleBindingInfo.path, oFixture.navigationPath,
						"getNavigationPath; skip raw value: " + bSkipRawValue);
					assert.strictEqual(oSingleBindingInfo.type, undefined,
						"getNavigationPath: no type; skip raw value: " + bSkipRawValue);
				});

				// gotoEntitySet
				assert.strictEqual(AnnotationHelper.gotoEntitySet(oContext),
					oFixture.entitySet
						? oMetaModel.getODataEntitySet(oFixture.entitySet, true)
						: undefined,
					"gotoEntitySet");

				// isMultiple
				[false, true].forEach(function (bSkipRawValue) {
					if (oFixture.isMultiple === Error) {
						try {
							formatAndParse(oRawValue, oContext, fnIsMultiple, bSkipRawValue);
							assert.ok(false, "Exception expected");
						} catch (e) {
							assert.strictEqual(e.message,
								'Association end with multiplicity "*" is not the last one: '
									+ sPath);
						}
					} else {
						assert.strictEqual(formatAndParse(oRawValue, oContext, fnIsMultiple,
							bSkipRawValue), String(oFixture.isMultiple), "isMultiple");
					}
				});

				// resolvePath
				assert.strictEqual(AnnotationHelper.resolvePath(oContext), oFixture.resolvedPath,
					"resolvePath");
			});
		});
	});

	//*********************************************************************************************
	[{
		// invalid meta path
		metaPath : "/foo",
		isMultiple : "",
		navigationPath : undefined,
		resolvedPath : undefined
	}, {
		// valid meta path, but raw value will be empty
		metaPath : sPath2Product + "/com.sap.vocabularies.UI.v1.Facets/0/Facets/0/Target",
		isMultiple : "",
		navigationPath : undefined,
		resolvedPath : undefined
	}, {
		// valid meta path, but outside of entity type
		metaPath : "/dataServices/schema/0/@foo.Bar",
		isMultiple : "",
		navigationPath : undefined,
		resolvedPath : undefined
	}].forEach(function (oFixture) {
		QUnit.test("Missing path expression, context: " + oFixture.metaPath, function (assert) {
			return withGwsampleModel(assert, function (oMetaModel) {
				var oContext = oMetaModel.createBindingContext(oFixture.metaPath),
					oRawValue = oMetaModel.getProperty(oFixture.metaPath);

				if (oRawValue) {
					// evil, test code only: write into ODataMetaModel
					delete oRawValue.AnnotationPath;
				} else if (oFixture.metaPath === "/dataServices/schema/0/@foo.Bar") {
					oRawValue = {
						"AnnotationPath" : "n/a"
					};
					oMetaModel.getProperty("/dataServices/schema/0")["foo.Bar"] = oRawValue;
				}

				// getNavigationPath
				assert.strictEqual(AnnotationHelper.getNavigationPath(oContext, oRawValue), "",
					"getNavigationPath");

				// gotoEntitySet
				assert.strictEqual(AnnotationHelper.gotoEntitySet(oContext), undefined,
					"gotoEntitySet");

				// isMultiple
				assert.strictEqual(formatAndParse(oRawValue, oContext, fnIsMultiple), "",
					"isMultiple");

				// resolvePath
				assert.strictEqual(AnnotationHelper.resolvePath(oContext), undefined,
					"resolvePath");
			});
		});
	});

	//TODO support type cast
	//TODO support term casts to odata.mediaEditLink, odata.mediaReadLink, odata.mediaContentType?
	//TODO support $count

	//TODO support annotations embedded within entity container, entity set (or singleton?),
	// complex type, property of entity or complex type

	// TODO improve error handling: unsupported within apply function gives unreadable result and
	// should be avoided, illegalValue should report the full binding path and not only the last
	// property which is most probably "String", "Path" or "Value"

	//*********************************************************************************************
	module("sap.ui.model.odata.AnnotationHelper.gotoEntityType");

	//*********************************************************************************************
	QUnit.test("gotoEntityType called directly on the entity type's qualified name",
		function (assert) {
			return withGwsampleModel(assert, function (oMetaModel) {
				var sMetaPath = "/dataServices/schema/0/entityContainer/0/entitySet/0/entityType",
					sQualifiedName = "GWSAMPLE_BASIC.BusinessPartner",
					oContext = oMetaModel.createBindingContext(sMetaPath);

				assert.strictEqual(oMetaModel.getProperty(sMetaPath), sQualifiedName);

				assert.strictEqual(AnnotationHelper.gotoEntityType(oContext),
					oMetaModel.getODataEntityType(sQualifiedName, true));
			});
		});

	//*********************************************************************************************
	module("sap.ui.model.odata.AnnotationHelper.gotoEntitySet");

	//*********************************************************************************************
	QUnit.test("gotoEntitySet called directly on the entity set's name", function (assert) {
		return withGwsampleModel(assert, function (oMetaModel) {
			var sMetaPath
					= "/dataServices/schema/0/entityContainer/0/associationSet/1/end/1/entitySet",
				oContext = oMetaModel.createBindingContext(sMetaPath);

			assert.strictEqual(oMetaModel.getProperty(sMetaPath), "ProductSet");

			assert.strictEqual(AnnotationHelper.gotoEntitySet(oContext),
				oMetaModel.getODataEntitySet("ProductSet", true));
		});
	});

	//*********************************************************************************************
	module("sap.ui.model.odata.AnnotationHelper.gotoFunctionImport");

	//*********************************************************************************************
	QUnit.test("gotoFunctionImport", function (assert) {
		return withGwsampleModelAndTestAnnotations(assert, function (oMetaModel) {
			var sMetaPath =
					sPath2Contact + "/com.sap.vocabularies.UI.v1.HeaderInfo/Description/Action",
				oContext = oMetaModel.createBindingContext(sMetaPath);

			assert.strictEqual(AnnotationHelper.gotoFunctionImport(oContext),
				oMetaModel.getODataFunctionImport("RegenerateAllData", true));
		});
	});

	//*********************************************************************************************
	module("sap.ui.model.odata.AnnotationHelper.createPropertySetting", {
		afterEach : function afterEach() {
			delete window.foo;
		},

		beforeEach : function beforeEach() {
			var oModel = new JSONModel({bar : "world", foo : "hello"}),
				oControl = new TestControl({
					models: {
						"undefined" : oModel,
						"model" : oModel
					}
				});

			// control instance for integration-like tests
			this.oControl = oControl;
			// candidate for a root formatter
			this.formatter = function formatter() {
				// turn arguments into a real array and return its JSON representation
				var aArray = Array.prototype.slice.apply(arguments);
				return JSON.stringify.call(JSON, aArray);
			};
			// candidate for a leaf formatter, also inside a composite binding
			window.foo = {
				Helper : {
					help : function help(oRawValue) {
//TODO						assert.ok(this instanceof PropertyBinding || this === oControl,
//							"foo.Helper.help: 'this' is kept");
						return "_" + oRawValue + "_";
					}
				}
			};
		},

		/**
		 * Checks that createPropertySetting() works as expected for multiple bindings.
		 *
		 * @param {object} assert the assertions
		 * @param {any[]} aParts
		 *   non-empty array of constants or data binding expressions
		 * @param {any[]} aExpectedValues
		 *   the expected values of each part
		 */
		checkMultiple : function checkMultiple(assert, aParts, aExpectedValues) {
			var oControl = this.oControl;

			// test without and with root formatter
			[undefined, this.formatter].forEach(function (fnRootFormatter) {
				var sExpectedText = fnRootFormatter
					? JSON.stringify(aExpectedValues)
					// @see sap.ui.model.CompositeBinding#getExternalValue
					// "default: multiple values are joined together as space separated list if no
					// formatter or type specified"
					: aExpectedValues.join(" ");

				oControl.applySettings({
					"text" : AnnotationHelper.createPropertySetting(aParts, fnRootFormatter)
				});

				assert.strictEqual(oControl.getText(), sExpectedText);
			});
		},

		/*
		 * Checks that createPropertySetting() works as expected for a single binding.
		 *
		 * @param {string} sBinding
		 *   a constant or data binding expression
		 * @param {string} sExpectedText
		 *   the expected value of the test control's "text" property
		 */
		checkSingle : function checkSingle(assert, sBinding, sExpectedText) {
			var oControl = this.oControl,
				vParts = [sBinding];

			[undefined, this.formatter].forEach(function (fnRootFormatter) {
				if (fnRootFormatter) {
					sExpectedText = JSON.stringify([sExpectedText]);
				}

				oControl.applySettings({
					"text" : AnnotationHelper.createPropertySetting(vParts, fnRootFormatter)
				});

				assert.strictEqual(oControl.getText(), sExpectedText, "sBinding: " + sBinding);
				assert.strictEqual(vParts[0], sBinding, "array argument unchanged");
			});
		}
	});

	//*********************************************************************************************
	QUnit.test("some basics", function (assert) {
		// see sap.ui.base.BindingParser: makeSimpleBindingInfo
		assert.deepEqual(AnnotationHelper.createPropertySetting(["{/foo/bar}"]), {
			path : "/foo/bar"
		}, "{/foo/bar}");
		assert.deepEqual(AnnotationHelper.createPropertySetting(["{meta>foo/bar}"]), {
			model : "meta",
			path : "foo/bar"
		}, "{meta>foo/bar}");

		// complex binding syntax
		assert.deepEqual(AnnotationHelper.createPropertySetting(["{path:'foo/bar'}"]), {
			path : "foo/bar"
		}, "{path:'foo/bar'}");
		assert.deepEqual(AnnotationHelper.createPropertySetting(["{path:'meta>/foo/bar'}"]), {
			path : "meta>/foo/bar"
		}, "{path:'meta>/foo/bar'}");
	});

	//*********************************************************************************************
	QUnit.test("simple binding syntax", function (assert) {
		this.checkSingle(assert, "{/foo}", "hello");
		this.checkSingle(assert, "{model>/foo}", "hello");
	});

	//*********************************************************************************************
	QUnit.test("complex binding syntax", function (assert) {
		this.checkSingle(assert, "{path : 'model>/foo', formatter : 'foo.Helper.help'}", "_hello_");
		this.checkSingle(assert, "{model : 'model', path : '/bar', formatter : 'foo.Helper.help'}",
			"_world_");

		// Note: formatters inside parts are not supported!
//		this.checkSingle(assert, "{parts : [{path : '/foo', formatter : 'foo.Helper.help'}]}", "_hello_");
	});

	//*********************************************************************************************
	QUnit.test("composite binding", function (assert) {
		this.checkSingle(assert, "hello {path : '/bar', formatter : 'foo.Helper.help'}",
			"hello _world_");
		this.checkSingle(assert, "hello {path : 'model>/bar', formatter : 'foo.Helper.help'}",
			"hello _world_");
		this.checkSingle(assert,
			"hello {model : 'model', path : '/bar', formatter : 'foo.Helper.help'}",
			"hello _world_");
	});

	//*********************************************************************************************
	QUnit.test("expression binding", function (assert) {
		this.checkSingle(assert, "{:= ${/foo} + ' ' + ${path:'/bar'}}", "hello world");
		this.checkSingle(assert, "{:= ${model>/foo} + ' ' + ${path:'model>/bar'}}",
			"hello world");
		this.checkSingle(assert, "{:= ${model>/foo} + ' ' + ${model:'model',path:'/bar'}}",
			"hello world");
	});

	//*********************************************************************************************
	QUnit.test("empty array of parts", function (assert) {
		assert.strictEqual(AnnotationHelper.createPropertySetting([]), undefined);
		assert.strictEqual(AnnotationHelper.createPropertySetting([], this.formatter), "[]");
	});

	//*********************************************************************************************
	QUnit.test("multiple parts: simple binding syntax", function (assert) {
		this.checkMultiple(assert, ["{/foo}", "{model>/bar}"], ["hello", "world"]);
	});

	//*********************************************************************************************
	QUnit.test("multiple parts: complex binding syntax", function (assert) {
		this.checkMultiple(assert, [
				"{path : '/foo', formatter : 'foo.Helper.help'}",
				"{model : 'model', path : '/bar', formatter : 'foo.Helper.help'}"
			], ["_hello_", "_world_"]);
	});

	//*********************************************************************************************
	QUnit.test("multiple parts: composite binding", function (assert) {
		this.checkMultiple(assert, [
				"hello {model : 'model', path : '/bar', formatter : 'foo.Helper.help'}",
				"{path : 'model>/foo', formatter : 'foo.Helper.help'} world"
			], ["hello _world_", "_hello_ world"]);
	});

	//*********************************************************************************************
	QUnit.test("multiple parts: expression binding", function (assert) {
		this.checkMultiple(assert, [
				"{:= ${/foo} + '>' + ${path:'/bar'}}",
				"{:= ${model>/bar} + '<' + ${model:'model',path:'/foo'}}"
			], ["hello>world", "world<hello"]);
	});

	//*********************************************************************************************
	QUnit.test("single constant string value", function (assert) {
		var that = this;

		["", "hello, world!", "}{"].forEach(function (sConstant) {
			// constant string
			that.checkSingle(assert, BindingParser.complexParser.escape(sConstant), sConstant);

			// constant expression binding
			that.checkSingle(assert, "{:= '" + sConstant + "'}", sConstant);
		});
	});

	//*********************************************************************************************
	QUnit.test("single constant non-string value", function (assert) {
		var oControl = this.oControl,
			that = this;

		function strictEqualOrNaN(vActual, vExpected) {
			if (vExpected !== vExpected) { // NaN
				assert.ok(vActual !== vActual);
			} else {
				assert.strictEqual(vActual, vExpected);
			}
		}

		[false, true, 0, 1, NaN, null, undefined, []].forEach(function (vConstant) {
			var sBinding, vPropertySetting;

			[undefined, that.formatter].forEach(function (fnRootFormatter) {
				/*eslint no-self-compare: 0*/
				var vExpectedValue = fnRootFormatter
					? JSON.stringify([vConstant])
					: vConstant,
					vParts = [vConstant];

				vPropertySetting
					= AnnotationHelper.createPropertySetting(vParts, fnRootFormatter);

				assert.deepEqual(vParts, [vConstant], "array argument unchanged");
				strictEqualOrNaN(vPropertySetting, vExpectedValue);

				// Note: sap.ui.base.ManagedObject#validateProperty maps null to undefined
				oControl.applySettings({"any" : vPropertySetting});
				strictEqualOrNaN(oControl.getAny(),
					oControl.validateProperty("any", vExpectedValue));

				oControl.applySettings({"text" : vPropertySetting});
				strictEqualOrNaN(oControl.getText(),
					oControl.validateProperty("text", vExpectedValue));
			});

			// constant expression binding
			sBinding = Array.isArray(vConstant)
				? "{:= " + JSON.stringify(vConstant) + "}"
				: "{:= " + vConstant + "}";

			vPropertySetting = AnnotationHelper.createPropertySetting([sBinding]);

			strictEqualOrNaN(vPropertySetting, "" + vConstant);
			//TODO properly handle non-string constants in expression binding!
		});
	});

	//*********************************************************************************************
	QUnit.test("multiple constant values", function (assert) {
		var aParts = ["", "hello, world!", false, true, 0, 1, NaN, null, undefined, []],
			aExpectedValues = aParts.slice();

		aParts.push(BindingParser.complexParser.escape("}{"));
		aExpectedValues.push("}{");

		this.checkMultiple(assert, aParts, aExpectedValues);
	});

	//*********************************************************************************************
	QUnit.test("Unsupported part", function (assert) {
		[Function].forEach(function (vPart) {
			assert.throws(function () {
				AnnotationHelper.createPropertySetting([vPart]);
			}, new Error("Unsupported part: " + vPart), "Unsupported part: " + vPart);
		});
	});

	//*********************************************************************************************
	QUnit.test("Function name(s) not found", function (assert) {
		var sBinding = "{path:'/foo',formatter:'foo'} {path:'/bar',formatter:'bar'}";

		assert.throws(function () {
			AnnotationHelper.createPropertySetting([sBinding]);
		}, new Error("Function name(s) foo, bar not found"), "Function name(s) not found");
	});

	//TODO implement (and document?) "ui5object" as marker property for constant objects?
});
