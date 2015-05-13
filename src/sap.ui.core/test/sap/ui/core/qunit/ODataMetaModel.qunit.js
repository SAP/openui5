/*!
 * ${copyright}
 */
sap.ui.require([
	"sap/ui/model/BindingMode", "sap/ui/model/ClientContextBinding", "sap/ui/model/Context",
	"sap/ui/model/FilterProcessor",
	"sap/ui/model/json/JSONListBinding", "sap/ui/model/json/JSONPropertyBinding",
	"sap/ui/model/json/JSONTreeBinding", "sap/ui/model/MetaModel", "sap/ui/model/Model",
	"sap/ui/model/odata/_ODataMetaModelUtils", "sap/ui/model/odata/ODataMetaModel",
	"sap/ui/model/odata/ODataModel", "sap/ui/model/odata/v2/ODataModel"
], function(BindingMode, ClientContextBinding, Context, FilterProcessor, JSONListBinding,
	JSONPropertyBinding, JSONTreeBinding, MetaModel, Model, Utils, ODataMetaModel, ODataModel,
	ODataModel2) {
	/*global deepEqual, equal, expect, module, notDeepEqual, notEqual, notPropEqual,
	notStrictEqual, ok, propEqual, sinon, strictEqual, test, throws,
	*/
	"use strict";

	jQuery.sap.require("sap.ui.thirdparty.datajs");

	sinon.config.useFakeServer = true;
	//TODO remove this workaround in IE9 for
	// https://github.com/cjohansen/Sinon.JS/commit/e8de34b5ec92b622ef76267a6dce12674fee6a73
	sinon.xhr.supportsCORS = true;

	function onFailed(oEvent) {
		var oParameters = oEvent.getParameters();
		while (oParameters.getParameters) { // drill down to avoid circular structure
			oParameters = oParameters.getParameters();
		}
		ok(false, "Failed to load: " + JSON.stringify(oParameters));
	}

	var oDataMetaModel, // single cached instance, see withMetaModel()
		sMetadata = '\
<?xml version="1.0" encoding="utf-8"?>\
<edmx:Edmx Version="1.0"\
	xmlns="http://schemas.microsoft.com/ado/2008/09/edm"\
	xmlns:edmx="http://schemas.microsoft.com/ado/2007/06/edmx"\
	xmlns:m="http://schemas.microsoft.com/ado/2007/08/dataservices/metadata"\
	xmlns:sap="http://www.sap.com/Protocols/SAPData">\
	<edmx:DataServices m:DataServiceVersion="2.0">\
		<Schema Namespace="GWSAMPLE_BASIC" xml:lang="en"\
			sap:schema-version="0000">\
			<EntityType Name="BusinessPartner" sap:content-version="1">\
				<Property Name="BusinessPartnerID" Type="Edm.String"\
					Nullable="false" MaxLength="10" sap:label="Bus. Part. ID"\
					sap:creatable="false" sap:text="AnyProperty" sap:updatable="false" \
					sap:sortable="false" sap:required-in-filter ="true" \
					sap:display-format="UpperCase" >\
				</Property>\
				<Property Name="AnyProperty" Type="Edm.String" sap:display-format="NonNegative" \
					sap:field-control="UX_FC_READONLY" sap:filterable="false" sap:sortable="false" \
					sap:updatable="false" />\
				<Property Name="NonFilterable" Type="Edm.String" sap:filterable="false" \
					sap:heading="No Filter" sap:quickinfo="No Filtering" />\
				<NavigationProperty Name="ToFoo" Relationship="GWSAMPLE_BASIC.Assoc_Foo" FromRole="FromRole_Foo" ToRole="ToRole_Foo" sap:filterable="true"/>\
			</EntityType>\
			<EntityType Name="VH_Sex" sap:content-version="1">\
				<Property Name="Sex" Type="Edm.String" Nullable="false" MaxLength="1" />\
			</EntityType>\
			<EntityType Name="Product">\
				<Property Name="Price" Type="Edm.Decimal" Precision="16" Scale="3" \
					sap:precision="PriceScale" sap:unit="CurrencyCode"/>\
				<Property Name="PriceScale" Type="Edm.Byte"/>\
				<Property Name="WeightMeasure" Type="Edm.Decimal" Precision="13" Scale="3" \
					sap:unit="WeightUnit" sap:visible="true" />\
				<Property Name="WeightUnit" Type="Edm.String" MaxLength="3" \
					sap:semantics="unit-of-measure" sap:visible="false" />\
				<Property Name="CurrencyCode" Type="Edm.String" MaxLength="5" \
					sap:semantics="currency-code"/>\
			</EntityType>\
			<EntityType Name="Contact">\
				<Property Name="FirstName" Type="Edm.String" sap:semantics="givenname"/>\
				<Property Name="Honorific" Type="Edm.String" sap:semantics="honorific"/>\
				<Property Name="LastName" Type="Edm.String" sap:semantics="familyname"/>\
				<Property Name="NickName" Type="Edm.String" sap:semantics="nickname"/>\
				<Property Name="Tel" Type="Edm.String" sap:semantics="tel;type=anything,fax"/>\
				<Property Name="Zip" Type="Edm.String" sap:semantics="zip"/>\
			</EntityType>\
			<EntityContainer Name="GWSAMPLE_BASIC_Entities"\
				m:IsDefaultEntityContainer="true" sap:use-batch="false">\
				<EntitySet Name="BusinessPartnerSet" EntityType="GWSAMPLE_BASIC.BusinessPartner"\
					sap:topable="false" sap:requires-filter="true" sap:content-version="1" />\
				<EntitySet Name="VH_SexSet" EntityType="GWSAMPLE_BASIC.VH_Sex" \
					sap:creatable="false" sap:updatable="false" sap:deletable="false" \
					sap:pageable="false" sap:searchable="true" sap:content-version="1"/> \
				<AssociationSet Name="Assoc_FooSet" Association="GWSAMPLE_BASIC.Assoc_Foo" \
					sap:creatable="false">\
					<End EntitySet="BusinessPartnerSet" Role="FromRole_Foo"/>\
					<End EntitySet="BusinessPartnerSet" Role="ToRole_Foo"/>\
				</AssociationSet>\
				<FunctionImport Name="Foo" ReturnType="GWSAMPLE_BASIC.BusinessPartner" \
					EntitySet="BusinessPartnerSet" m:HttpMethod="POST" \
					sap:action-for="GWSAMPLE_BASIC.BusinessPartner">\
					<Parameter Name="BusinessPartnerID" Type="Edm.String" Mode="In" MaxLength="10" \
						sap:label="ID"/>\
				</FunctionImport>\
			</EntityContainer>\
			<ComplexType Name="CT_Address">\
				<Property Name="City" Type="Edm.String" MaxLength="40" sap:label="City"\
					sap:semantics="city"/>\
			</ComplexType>\
			<Association Name="Assoc_Foo" sap:content-version="1">\
				<End Type="GWSAMPLE_BASIC.BusinessPartner" Multiplicity="1" Role="FromRole_Foo"/>\
				<End Type="GWSAMPLE_BASIC.BusinessPartner" Multiplicity="*" Role="ToRole_Foo"/>\
			</Association>\
		</Schema>\
	</edmx:DataServices>\
</edmx:Edmx>\
		', sAnnotations = '\
<?xml version="1.0" encoding="utf-8"?>\
<edmx:Edmx Version="4.0"\
	xmlns="http://docs.oasis-open.org/odata/ns/edm"\
	xmlns:edmx="http://docs.oasis-open.org/odata/ns/edmx">\
<edmx:DataServices>\
<Schema Namespace="zanno4sample_anno_mdl.v1">\
<Annotations Target="GWSAMPLE_BASIC.BusinessPartner">\
	<Annotation Term="com.sap.vocabularies.Common.v1.Label" String="Label via external annotation: Business Partner" />\
	<Annotation Term="com.sap.vocabularies.UI.v1.HeaderInfo">\
		<Record Type="com.sap.vocabularies.UI.v1.HeaderInfoType">\
			<PropertyValue Property="TypeName" String="Business Partner"/>\
			<PropertyValue Property="Title">\
				<Record Type="com.sap.vocabularies.UI.v1.DataField">\
					<PropertyValue Property="Label" String="Name"/>\
					<PropertyValue Property="Value">\
						<Apply Function="odata.concat">\
							<Path>CompanyName</Path>\
							<String/>\
							<Path>LegalForm</Path>\
						</Apply>\
					</PropertyValue>\
				</Record>\
			</PropertyValue>\
		</Record>\
	</Annotation>\
</Annotations>\
<Annotations Target="GWSAMPLE_BASIC.Contact">\
<Annotation Term="com.sap.vocabularies.Communication.v1.Contact">\
	<Record>\
		<PropertyValue Property="n">\
			<Record>\
				<PropertyValue Property="given" Path="FirstName"/>\
				<PropertyValue Property="additional" Path="MiddleName"/>\
				<PropertyValue Property="surname" Path="LastName"/>\
				<PropertyValue Property="prefix" Path="Honorific"/>\
				<PropertyValue Property="suffix" Path="Suffix"/>\
			</Record>\
		</PropertyValue>\
		<PropertyValue Property="nickname" Path="NickName"/>\
		<PropertyValue Property="tel">\
			<Collection>\
				<Record>\
					<PropertyValue Property="uri" Path="Tel"/>\
					<PropertyValue Property="type">\
						<EnumMember>com.sap.vocabularies.Communication.v1.PhoneType/work com.sap.vocabularies.Communication.v1.PhoneType/cell</EnumMember>\
					</PropertyValue>\
				</Record>\
			</Collection>\
		</PropertyValue>\
	</Record>\
</Annotation>\
</Annotations>\
	<Annotations Target="GWSAMPLE_BASIC.BusinessPartner/BusinessPartnerID">\
		<Annotation Term="Org.OData.Core.V1.Computed" Bool="false"/>\
		<Annotation Term="com.sap.vocabularies.Common.v1.Text" Path="AnyProperty"/>\
	</Annotations>\
	<Annotations Target="GWSAMPLE_BASIC.BusinessPartner/AnyProperty">\
		<Annotation Term="com.sap.vocabularies.Common.v1.FieldControl" Path="UX_FC_READONLY"/>\
		<Annotation Term="Org.OData.Core.V1.Immutable" Bool="true"/>\
		<Annotation Term="com.sap.vocabularies.Common.v1.IsDigitSequence" Bool="false"/>\
	</Annotations>\
	<Annotations Target="GWSAMPLE_BASIC.BusinessPartner/NonFilterable">\
			<Annotation Term="com.sap.vocabularies.Common.v1.Heading" \
				String="No Filter via Annotation" />\
			<Annotation Term="com.sap.vocabularies.Common.v1.QuickInfo" \
				String="No Filtering via Annotation" />\
	</Annotations>\
	<Annotations Target="GWSAMPLE_BASIC.Product/Price">\
		<Annotation Term="Org.OData.Measures.V1.Scale" Path="PriceScale"/>\
		<Annotation Term="Org.OData.Measures.V1.ISOCurrency" Path="CurrencyCodeFromAnnotation"/>\
	</Annotations>\
	<Annotations Target="GWSAMPLE_BASIC.Product/WeightMeasure">\
		<Annotation Term="Org.OData.Measures.V1.Unit" Path="WeightUnit"/>\
	</Annotations>\
	<Annotations Target="GWSAMPLE_BASIC.Product/WeightUnit">\
			<Annotation Term="com.sap.vocabularies.Common.v1.FieldControl" \
				EnumMember="com.sap.vocabularies.Common.v1.FieldControlType/ReadOnly"/>\
	</Annotations>\
	<Annotations Target="GWSAMPLE_BASIC.GWSAMPLE_BASIC_Entities/BusinessPartnerSet">\
		<Annotation Term="Org.OData.Capabilities.V1.FilterRestrictions">\
			<Record>\
				<PropertyValue Property="RequiresFilter" Bool="true"/>\
				<PropertyValue Property="RequiredProperties">\
					<Collection>\
						<PropertyPath>AnyProperty</PropertyPath>\
					</Collection>\
				</PropertyValue>\
			</Record>\
		</Annotation>\
		<Annotation Term="Org.OData.Capabilities.V1.SearchRestrictions">\
			<Record>\
				<PropertyValue Property="Searchable" Bool="true"/>\
			</Record>\
		</Annotation>\
		<Annotation Term="Org.OData.Capabilities.V1.SortRestrictions">\
			<Record>\
				<PropertyValue Property="NonSortableProperties">\
					<Collection>\
						<PropertyPath>BusinessPartnerID</PropertyPath>\
						<PropertyPath>AnyProperty</PropertyPath>\
					</Collection>\
				</PropertyValue>\
			</Record>\
		</Annotation>\
		<Annotation Term="Org.OData.Capabilities.V1.TopSupported" Bool="false" />\
	</Annotations>\
	<Annotations Target="GWSAMPLE_BASIC.GWSAMPLE_BASIC_Entities/VH_SexSet">\
		<Annotation Term="Org.OData.Capabilities.V1.InsertRestrictions">\
			<Record>\
				<PropertyValue Property="Insertable" Bool="false"/>\
			</Record>\
		</Annotation>\
		<Annotation Term="Org.OData.Capabilities.V1.TopSupported" Bool="false" />\
		<Annotation Term="Org.OData.Capabilities.V1.SkipSupported" Bool="false" />\
		<Annotation Term="Org.OData.Capabilities.V1.UpdateRestrictions">\
			<Record>\
				<PropertyValue Property="Updatable" Bool="false"/>\
			</Record>\
		</Annotation>\
		<Annotation Term="Org.OData.Capabilities.V1.DeleteRestrictions">\
			<Record>\
				<PropertyValue Property="Deletable" Bool="false"/>\
			</Record>\
		</Annotation>\
	</Annotations>\
</Schema>\
</edmx:DataServices>\
</edmx:Edmx>\
		', sAnnotations2 = '\
<?xml version="1.0" encoding="utf-8"?>\
<edmx:Edmx Version="4.0" xmlns:edmx="http://docs.oasis-open.org/odata/ns/edmx">\
<edmx:DataServices>\
<Schema Namespace="foo" xmlns="http://docs.oasis-open.org/odata/ns/edm">\
<Annotations Target="GWSAMPLE_BASIC">\
	<Annotation Term="acme.Foo.v1.Foo" String="GWSAMPLE_BASIC" />\
</Annotations>\
<Annotations Target="GWSAMPLE_BASIC.Assoc_Foo">\
	<Annotation Term="acme.Foo.v1.Foo" String="GWSAMPLE_BASIC.Assoc_Foo" />\
</Annotations>\
<Annotations Target="GWSAMPLE_BASIC.Assoc_Foo/FromRole_Foo">\
	<Annotation Term="acme.Foo.v1.Foo" String="GWSAMPLE_BASIC.Assoc_Foo/FromRole_Foo" />\
</Annotations>\
<Annotations Target="GWSAMPLE_BASIC.BusinessPartner/ToFoo">\
	<Annotation Term="acme.Foo.v1.Foo" String="GWSAMPLE_BASIC.BusinessPartner/ToFoo" />\
</Annotations>\
<Annotations Target="GWSAMPLE_BASIC.CT_Address">\
	<Annotation Term="acme.Foo.v1.Foo" String="GWSAMPLE_BASIC.CT_Address" />\
</Annotations>\
<Annotations Target="GWSAMPLE_BASIC.CT_Address/City">\
	<Annotation Term="com.sap.vocabularies.Common.v1.Label" String="GWSAMPLE_BASIC.CT_Address/City" />\
</Annotations>\
<Annotations Target="GWSAMPLE_BASIC.GWSAMPLE_BASIC_Entities">\
	<Annotation Term="acme.Foo.v1.Foo" String="GWSAMPLE_BASIC.GWSAMPLE_BASIC_Entities" />\
</Annotations>\
<Annotations Target="GWSAMPLE_BASIC.GWSAMPLE_BASIC_Entities/Assoc_FooSet">\
	<Annotation Term="acme.Foo.v1.Foo" String="GWSAMPLE_BASIC.GWSAMPLE_BASIC_Entities/Assoc_FooSet" />\
</Annotations>\
<Annotations Target="GWSAMPLE_BASIC.GWSAMPLE_BASIC_Entities/Assoc_FooSet/FromRole_Foo">\
	<Annotation Term="acme.Foo.v1.Foo" String="GWSAMPLE_BASIC.GWSAMPLE_BASIC_Entities/Assoc_FooSet/FromRole_Foo" />\
</Annotations>\
<Annotations Target="GWSAMPLE_BASIC.GWSAMPLE_BASIC_Entities/BusinessPartnerSet">\
	<Annotation Term="acme.Foo.v1.Foo" String="GWSAMPLE_BASIC.GWSAMPLE_BASIC_Entities/BusinessPartnerSet" />\
</Annotations>\
<Annotations Target="GWSAMPLE_BASIC.GWSAMPLE_BASIC_Entities/Foo">\
	<Annotation Term="acme.Foo.v1.Foo" String="GWSAMPLE_BASIC.GWSAMPLE_BASIC_Entities/Foo" />\
</Annotations>\
<Annotations Target="GWSAMPLE_BASIC.GWSAMPLE_BASIC_Entities/Foo/BusinessPartnerID">\
	<Annotation Term="acme.Foo.v1.Foo" String="GWSAMPLE_BASIC.GWSAMPLE_BASIC_Entities/Foo/BusinessPartnerID" />\
</Annotations>\
</Schema>\
</edmx:DataServices>\
</edmx:Edmx>\
		', sEmptyAnnotations = '\
<?xml version="1.0" encoding="utf-8"?>\
<edmx:Edmx Version="4.0" xmlns:edmx="http://docs.oasis-open.org/odata/ns/edmx">\
<edmx:DataServices>\
<Schema Namespace="foo" xmlns="http://docs.oasis-open.org/odata/ns/edm"/>\
</edmx:DataServices>\
</edmx:Edmx>\
		', sEmptyMetadata = '\
<?xml version="1.0" encoding="utf-8"?>\
<edmx:Edmx Version="1.0"\
	xmlns:edmx="http://schemas.microsoft.com/ado/2007/06/edmx"\
	/>\
		', sEmptyDataServices = '\
<?xml version="1.0" encoding="utf-8"?>\
<edmx:Edmx Version="1.0"\
	xmlns:edmx="http://schemas.microsoft.com/ado/2007/06/edmx"\
	xmlns:m="http://schemas.microsoft.com/ado/2007/08/dataservices/metadata"\
	>\
	<edmx:DataServices m:DataServiceVersion="2.0"/>\
</edmx:Edmx>\
		', sEmptySchema = '\
<?xml version="1.0" encoding="utf-8"?>\
<edmx:Edmx Version="1.0"\
	xmlns="http://schemas.microsoft.com/ado/2008/09/edm"\
	xmlns:edmx="http://schemas.microsoft.com/ado/2007/06/edmx"\
	xmlns:m="http://schemas.microsoft.com/ado/2007/08/dataservices/metadata"\
	>\
	<edmx:DataServices m:DataServiceVersion="2.0">\
		<Schema Namespace="GWSAMPLE_BASIC" xml:lang="en"/>\
	</edmx:DataServices>\
</edmx:Edmx>\
		', sEmptyEntityType = '\
<?xml version="1.0" encoding="utf-8"?>\
<edmx:Edmx Version="1.0"\
	xmlns="http://schemas.microsoft.com/ado/2008/09/edm"\
	xmlns:edmx="http://schemas.microsoft.com/ado/2007/06/edmx"\
	xmlns:m="http://schemas.microsoft.com/ado/2007/08/dataservices/metadata"\
	xmlns:sap="http://www.sap.com/Protocols/SAPData">\
	<edmx:DataServices m:DataServiceVersion="2.0">\
		<Schema Namespace="GWSAMPLE_BASIC" xml:lang="en"\
			sap:schema-version="0000">\
			<EntityType Name="BusinessPartner" sap:content-version="1"/>\
			<EntityContainer Name="GWSAMPLE_BASIC_Entities"\
				m:IsDefaultEntityContainer="true">\
				<EntitySet Name="BusinessPartnerSet" EntityType="GWSAMPLE_BASIC.BusinessPartner"\
					sap:content-version="1" />\
			</EntityContainer>\
		</Schema>\
	</edmx:DataServices>\
</edmx:Edmx>\
		',
		sGWAnnotations = jQuery.sap.syncGetText("model/GWSAMPLE_BASIC.annotations.xml", "", null),
		sGWMetadata = jQuery.sap.syncGetText("model/GWSAMPLE_BASIC.metadata.xml", "", null),
		mHeaders = {"Content-Type" : "application/xml"},
		mFixture = {
			"/fake/emptyDataServices/$metadata" : [200, mHeaders, sEmptyDataServices],
			"/fake/emptyEntityType/$metadata" : [200, mHeaders, sEmptyEntityType],
			"/fake/emptyMetadata/$metadata" : [200, mHeaders, sEmptyDataServices],
			"/fake/emptySchema/$metadata" : [200, mHeaders, sEmptySchema],
			"/fake/service/$metadata" : [200, mHeaders, sMetadata],
			"/fake/annotations" : [200, mHeaders, sAnnotations],
			"/fake/annotations2" : [200, mHeaders, sAnnotations2],
			"/fake/emptyAnnotations" : [200, mHeaders, sEmptyAnnotations],
			"/GWSAMPLE_BASIC/$metadata" : [200, mHeaders, sGWMetadata],
			"/GWSAMPLE_BASIC/annotations" : [200, mHeaders, sGWAnnotations]
		},
		oGlobalSandbox; // global sandbox for async tests

	/**
	 * Sets up the given sandbox in order to use the URLs and responses defined in mFixture;
	 * leaves unknown URLs alone.
	 *
	 * @param {object} oSandbox
	 *   <a href ="http://sinonjs.org/docs/#sandbox">a Sinon.JS sandbox</a>
	 */
	function setupSandbox(oSandbox) {
		var oServer = oSandbox.useFakeServer(), sUrl;

		//TODO how to properly tear down this stuff?
		sinon.FakeXMLHttpRequest.useFilters = true;
		sinon.FakeXMLHttpRequest.addFilter(function (sMethod, sUrl, bAsync) {
			return mFixture[sUrl] === undefined; // do not fake if URL is unknown
		});

		for (sUrl in mFixture) {
			oServer.respondWith(sUrl, mFixture[sUrl]);
		}
		oServer.autoRespond = true;
	}

	/**
	 * Runs the given code under test with an <code>ODataMetaModel</code>.
	 *
	 * @param {function} fnCodeUnderTest
	 * @param {boolean} bImmediately
	 *   whether to run the test immediately instead of waiting for the meta model to be loaded
	 * @returns {any|Promise}
	 *   (a promise to) whatever <code>fnCodeUnderTest</code> returns
	 */
	function withMetaModel(fnCodeUnderTest, bImmediately) {
		var oMetaModel,
			oModel,
			oSandbox; // <a href ="http://sinonjs.org/docs/#sandbox">a Sinon.JS sandbox</a>

		/*
		 * Call the given "code under test" with the given OData meta model, making sure that
		 * no changes to the model are kept in the cached singleton.
		 */
		function call(fnCodeUnderTest, oDataMetaModel) {
			var sCopy = oDataMetaModel.oModel.getJSON();

			try {
				return fnCodeUnderTest(oDataMetaModel);
			} finally {
				oDataMetaModel.oModel.setJSON(sCopy);
			}
		}

		// Note: bImmediately requires a fresh instance
		if (oDataMetaModel && !bImmediately) {
			return call(fnCodeUnderTest, oDataMetaModel);
		}

		try {
			oSandbox = sinon.sandbox.create();
			setupSandbox(oSandbox);

			// sets up a v2 ODataModel and retrieves an ODataMetaModel from there
			oModel = new ODataModel2("/GWSAMPLE_BASIC", {
				annotationURI : "/GWSAMPLE_BASIC/annotations",
				json : true,
				loadMetadataAsync : true
			});
			oModel.attachMetadataFailed(onFailed);
			oModel.attachAnnotationsFailed(onFailed);

			if (bImmediately) {
				// no caching, no undo of modifications!
				return fnCodeUnderTest(oModel.getMetaModel());
			} else {
				// calls the code under test once the meta model has loaded
				oDataMetaModel = oModel.getMetaModel();
				return oDataMetaModel.loaded().then(function () {
					return call(fnCodeUnderTest, oDataMetaModel);
				});
			}
		} finally {
			oSandbox.restore();
		}
	}

	//*********************************************************************************************
	module("sap.ui.model.odata.ODataMetaModel", {
		beforeEach : function () {
			oGlobalSandbox = sinon.sandbox.create();
		},
		afterEach : function () {
			// I would consider this an API, see https://github.com/cjohansen/Sinon.JS/issues/614
			oGlobalSandbox.verifyAndRestore();
			ODataModel2.mServiceData = {}; // clear cache
		}
	});

	//*********************************************************************************************
	test("functions using 'this.oModel' directly", function () {
		return withMetaModel(function (oMetaModel) {
			// call functions before loaded() promise has been resolved
			throws(function () {
				oMetaModel._getObject("/");
			}, "_getObject")
			throws(function () {
				oMetaModel.destroy();
			}, "destroy")
			throws(function () {
				oMetaModel.getODataAssociationEnd({
					"navigationProperty" : [{
						"name" : "ToSalesOrders",
						"relationship" : "GWSAMPLE_BASIC.Assoc_BusinessPartner_SalesOrders",
						"fromRole" : "FromRole_Assoc_BusinessPartner_SalesOrders",
						"toRole" : "ToRole_Assoc_BusinessPartner_SalesOrders"
					}]
				}, "ToSalesOrders");
			}, "getODataAssociationEnd")
			throws(function () {
				oMetaModel.getODataComplexType("don't care");
			}, "getODataComplexType")
			throws(function () {
				oMetaModel.getODataEntityContainer();
			}, "getODataEntityContainer")
			throws(function () {
				oMetaModel.getODataEntityType("don't care");
			}, "getODataEntityType")
			throws(function () {
				oMetaModel.isList();
			}, "isList")

			return oMetaModel.loaded();
		}, true);
	});

	//*********************************************************************************************
	test("basics", function () {
		var oMetaModel = new ODataMetaModel({
				getServiceMetadata : function () { return {dataServices : {}}; },
				isLoaded : function () { return true; }
			});

		return oMetaModel.loaded().then(sinon.test(function () {
			var oMetaModelMock = this.mock(oMetaModel),
				oModelMock = this.mock(oMetaModel.oModel),
				oResult = {};

			this.mock(Model.prototype).expects("destroy").once();
			// do not mock/stub this or else "destroy" will not bubble up!
			this.spy(MetaModel.prototype, "destroy");

			// generic dispatching
			["destroy", "isList"].forEach(function (sName) {
				oModelMock.expects(sName).once().withExactArgs("foo", 0, false).returns(oResult);

				strictEqual(oMetaModel[sName]("foo", 0, false), oResult, sName);
			});

			// getProperty dispatches to _getObject
			oMetaModelMock.expects("_getObject").once().withExactArgs("foo", 0, false)
				.returns(oResult);
			strictEqual(oMetaModel.getProperty("foo", 0, false), oResult, "getProperty");

			ok(MetaModel.prototype.destroy.calledOnce);

			throws(function () {
				oMetaModel.refresh();
			}, /Unsupported operation: ODataMetaModel#refresh/);

			oMetaModel.setLegacySyntax(); // allowed
			oMetaModel.setLegacySyntax(false); // allowed
			throws(function () {
				oMetaModel.setLegacySyntax(true);
			}, /Legacy syntax not supported by ODataMetaModel/);

			strictEqual(oMetaModel.getDefaultBindingMode(), BindingMode.OneTime);
			strictEqual(oMetaModel.oModel.getDefaultBindingMode(), BindingMode.OneTime);
			throws(function () {
				oMetaModel.setDefaultBindingMode(BindingMode.OneWay);
			});
			throws(function () {
				oMetaModel.setDefaultBindingMode(BindingMode.TwoWay);
			});
		}).apply({/*give Sinon a "this" to enrich*/}));
	});

	//*********************************************************************************************
	test("bindings", function () {
		return withMetaModel(function (oMetaModel) {
			var oBinding,
				oContext = oMetaModel.createBindingContext("/foo"),
				aFilters = [],
				mParameters = {},
				sPath = "some/relative/path",
				aSorters = [];

			// Note: support for events not needed
			oBinding = oMetaModel.bindContext(sPath, oContext, mParameters);
			ok(oBinding instanceof ClientContextBinding);
			strictEqual(oBinding.getModel(), oMetaModel);
			strictEqual(oBinding.getPath(), sPath);
			strictEqual(oBinding.getContext(), oContext);
			strictEqual(oBinding.mParameters, mParameters);

			oBinding = oMetaModel.bindProperty(sPath, oContext, mParameters);
			ok(oBinding instanceof JSONPropertyBinding);
			strictEqual(oBinding.getModel(), oMetaModel);
			strictEqual(oBinding.getPath(), sPath);
			strictEqual(oBinding.getContext(), oContext);
			strictEqual(oBinding.mParameters, mParameters);

			throws(function () {
				oBinding.setValue("foo");
			}, /Unsupported operation: ODataMetaModel#setProperty/);

			oBinding = oMetaModel.bindList(sPath, oContext, aSorters, aFilters, mParameters);
			ok(oBinding instanceof JSONListBinding);
			strictEqual(oBinding.getModel(), oMetaModel, "inner model not leaked");
			strictEqual(oBinding.getPath(), sPath);
			strictEqual(oBinding.getContext(), oContext);
			strictEqual(oBinding.aSorters, aSorters);
			strictEqual(oBinding.aApplicationFilters, aFilters); //TODO spy on ListBinding instead?
			strictEqual(oBinding.mParameters, mParameters);

			oBinding = oMetaModel.bindTree(sPath, oContext, aFilters, mParameters);
			ok(oBinding instanceof JSONTreeBinding);
			strictEqual(oBinding.getModel(), oMetaModel);
			strictEqual(oBinding.getPath(), sPath);
			strictEqual(oBinding.getContext(), oContext);
			strictEqual(oBinding.aFilters, aFilters);
			strictEqual(oBinding.mParameters, mParameters);
		});
	});

	//*********************************************************************************************
	test("bindList", function () {
		var that = this;

		return withMetaModel(function (oMetaModel) {
			var fnApply = that.mock(FilterProcessor).expects("apply"),
				oBinding,
				oContext = oMetaModel.createBindingContext("/"),
				aFilters = [],
				fnGetValue,
				aIndices = ["schema"],
				mParameters = {},
				sPath = "dataServices",
				aSorters = [];

			fnApply.once()
				.withArgs(["dataServiceVersion", "schema"], aFilters)
				.returns(aIndices);

			// code under test
			oBinding = oMetaModel.bindList(sPath, oContext, aSorters, aFilters, mParameters);
			// implicitly calls oBinding.applyFilter()

			strictEqual(oBinding.aIndices, aIndices);
			strictEqual(oBinding.iLength, oBinding.aIndices.length);

			fnGetValue = fnApply.args[0][2];
			that.mock(oMetaModel).expects("getProperty").once()
				.withExactArgs("0/namespace", oBinding.oList["schema"])
				.returns("foo");

			// code under test
			strictEqual(fnGetValue("schema", "0/namespace"), "foo");

			// code under test
			strictEqual(fnGetValue("schema", "@sapui.name"), "schema");
		});
	});

	//*********************************************************************************************
	test("_getObject", function () {
		return withMetaModel(function (oMetaModel) {
			var oContext;

			// w/o context
			strictEqual(oMetaModel._getObject("/"), oMetaModel.oModel._getObject("/"));
			strictEqual(oMetaModel._getObject("/foo"), undefined);
			strictEqual(oMetaModel._getObject("/dataServices"),
				oMetaModel.oModel._getObject("/dataServices"));
			strictEqual(oMetaModel._getObject("/dataServices/schema"),
				oMetaModel.oModel._getObject("/dataServices/schema"));

			// with sap.ui.model.Context
			oContext = oMetaModel.getContext("/dataServices/schema");
			strictEqual(oMetaModel._getObject(undefined, oContext),
				oMetaModel.oModel._getObject("/dataServices/schema"));
			oContext = oMetaModel.getContext("/dataServices");
			strictEqual(oMetaModel._getObject("schema", oContext),
				oMetaModel.oModel._getObject("/dataServices/schema"));

			// with object context
			oContext = oMetaModel._getObject("/dataServices");
			strictEqual(oMetaModel._getObject("schema", oContext),
				oMetaModel.oModel._getObject("/dataServices/schema"));
			oContext = oMetaModel._getObject("/dataServices/schema");
			strictEqual(oMetaModel._getObject(undefined, oContext),
				oMetaModel.oModel._getObject("/dataServices/schema"));
			// absolute path wins over object context
			oContext = oMetaModel._getObject("/dataServices/schema/0/entityType/0");
			strictEqual(oMetaModel._getObject("/dataServices/schema/0/entityType/1", oContext),
				oMetaModel.oModel._getObject("/dataServices/schema/0/entityType/1"));
		});
	});

	//*********************************************************************************************
	[false, true].forEach(function (bIsLoggable) {
		test("_getObject: warning w/o context, log = " + bIsLoggable, function () {
			var oLogMock = oGlobalSandbox.mock(jQuery.sap.log);

			oLogMock.expects("isLoggable").once()
				.withExactArgs(jQuery.sap.log.Level.WARNING)
				.returns(bIsLoggable);
			oLogMock.expects("warning")
				.exactly(bIsLoggable ? 1 : 0) // do not construct arguments in vain!
				.withExactArgs("Invalid part: bar", "path: /foo/bar, context: undefined",
					"sap.ui.model.odata.ODataMetaModel");

			return withMetaModel(function (oMetaModel) {
				strictEqual(oMetaModel._getObject("/foo/bar"), undefined);
			});
		});

		test("_getObject: warning with sap.ui.model.Context, log = " + bIsLoggable, function () {
			var oLogMock = oGlobalSandbox.mock(jQuery.sap.log);

			oLogMock.expects("isLoggable").once()
				.withExactArgs(jQuery.sap.log.Level.WARNING)
				.returns(bIsLoggable);
			oLogMock.expects("warning")
				.exactly(bIsLoggable ? 1 : 0) // do not construct arguments in vain!
				.withExactArgs("Invalid part: relative",
					"path: some/relative/path, context: /dataServices/schema/0/entityType/0",
					"sap.ui.model.odata.ODataMetaModel");

			return withMetaModel(function (oMetaModel) {
				var oContext = oMetaModel.getContext("/dataServices/schema/0/entityType/0");
				strictEqual(oMetaModel._getObject("some/relative/path", oContext), undefined);
			});
		});

		test("_getObject: warning with object context, log = " + bIsLoggable, function () {
			var oLogMock = oGlobalSandbox.mock(jQuery.sap.log);

			oLogMock.expects("isLoggable").once()
				.withExactArgs(jQuery.sap.log.Level.WARNING)
				.returns(bIsLoggable);
			oLogMock.expects("warning")
				.exactly(bIsLoggable ? 1 : 0) // do not construct arguments in vain!
				.withExactArgs("Invalid part: relative",
					"path: some/relative/path, context: [object Object]",
					"sap.ui.model.odata.ODataMetaModel");

			return withMetaModel(function (oMetaModel) {
				var oContext = oMetaModel._getObject("/dataServices/schema/0/entityType/0");
				strictEqual(oMetaModel._getObject("some/relative/path", oContext), undefined);
			});
		});
	});

	//*********************************************************************************************
	test("_getObject: Invalid relative path w/o context", function () {
		oGlobalSandbox.mock(jQuery.sap.log).expects("error").once().withExactArgs(
			"Invalid relative path w/o context",
			"some/relative/path",
			"sap.ui.model.odata.ODataMetaModel");

		return withMetaModel(function (oMetaModel) {
			strictEqual(oMetaModel._getObject("some/relative/path"), null);
		});
	});

	//*********************************************************************************************
	[{
		annotationURI : null,
		title : "no annotations"
	}, {
		annotationURI : "/fake/annotations",
		title : "one annotation file"
	}, {
		annotationURI : ["/fake/annotations", "/fake/annotations2"],
		title : "multiple annotation files"
	}].forEach(function (oFixture, i) {
		test("ODataMetaModel loaded: " + oFixture.title, function () {
			var oMetaModel, oModel;

			setupSandbox(this.sandbox);
			oModel = new ODataModel2("/fake/service", {
				annotationURI : oFixture.annotationURI,
				json : true,
				loadMetadataAsync : true
			});
			oModel.attachMetadataFailed(onFailed);
			oModel.attachAnnotationsFailed(onFailed);

			oMetaModel = oModel.getMetaModel();
			ok(oMetaModel instanceof ODataMetaModel);

			return oMetaModel.loaded().then(function () {
				var oAnnotations = oModel.getServiceAnnotations(),
					oMetadata = oModel.getServiceMetadata(),
					oMetaModelData = oMetaModel.getObject("/"),
					oGWSampleBasic = oMetaModelData.dataServices.schema[0],
					oEntityContainer = oGWSampleBasic.entityContainer[0],
					oAssociation = oGWSampleBasic.association[0],
					oAssociationEnd = oAssociation.end[0],
					oAssociationSet = oEntityContainer.associationSet[0],
					oBusinessPartner = oGWSampleBasic.entityType[0],
					oBusinessPartnerId = oBusinessPartner.property[0],
					oBusinessPartnerSet = oEntityContainer.entitySet[0],
					oContact = oGWSampleBasic.entityType[3],
					oContactTel = oContact.property[4],
					oAnyProperty = oBusinessPartner.property[1],
					oNonFilterable = oBusinessPartner.property[2],
					oCTAddress = oGWSampleBasic.complexType[0],
					oCTAddressCity = oCTAddress.property[0],
					oFunctionImport = oEntityContainer.functionImport[0],
					oNavigationProperty = oBusinessPartner.navigationProperty[0],
					oParameter = oFunctionImport.parameter[0],
					oProduct = oGWSampleBasic.entityType[2],
					oProductCurrencyCode =  oProduct.property[4],
					oProductPrice = oProduct.property[0],
					oProductWeightMeasure =  oProduct.property[2],
					oProductWeightUnit =  oProduct.property[3],
					sSAPData = "http://www.sap.com/Protocols/SAPData",
					oVHSex = oGWSampleBasic.entityType[1],
					oVHSexSet = oEntityContainer.entitySet[1];

				function checkCapabilities(sExtension) {
					var sCapability, sProperty, oExpected;

					switch (sExtension) {
						case "updatable":
							sCapability = "UpdateRestrictions";
							sProperty = "Updatable";
							break;
						case "deletable":
							sCapability = "DeleteRestrictions";
							sProperty = "Deletable";
							break;
						default:
							sCapability = "InsertRestrictions";
							sProperty = "Insertable";
					}

					deepEqual(oVHSexSet["sap:" + sExtension], "false");
					delete oVHSexSet["sap:" + sExtension];
					oExpected = {};
					oExpected[sProperty] = {"Bool": "false"};
					deepEqual(oVHSexSet["Org.OData.Capabilities.V1." + sCapability], oExpected,
						sExtension + " at entity set");
					delete oVHSexSet["Org.OData.Capabilities.V1." + sCapability];
				}

				strictEqual(oBusinessPartner.name, "BusinessPartner");
				strictEqual(oBusinessPartnerId.name, "BusinessPartnerID");

				strictEqual(arguments.length, 1, "almost no args");
				deepEqual(arguments[0], undefined, "almost no args");
				ok(oMetadata, "metadata is loaded");

				strictEqual(oBusinessPartner.$path, "/dataServices/schema/0/entityType/0");
				delete oBusinessPartner.$path;
				strictEqual(oVHSex.$path, "/dataServices/schema/0/entityType/1");
				delete oVHSex.$path;
				strictEqual(oProduct.$path, "/dataServices/schema/0/entityType/2");
				delete oProduct.$path;
				strictEqual(oContact.$path, "/dataServices/schema/0/entityType/3");
				delete oContact.$path;

				deepEqual(oGWSampleBasic["sap:schema-version"], "0000");
				delete oGWSampleBasic["sap:schema-version"];

				deepEqual(oBusinessPartner["sap:content-version"], "1");
				delete oBusinessPartner["sap:content-version"];

				strictEqual(oCTAddress.$path, "/dataServices/schema/0/complexType/0", "$path");
				delete oCTAddress.$path;

				deepEqual(oAssociation["sap:content-version"], "1");
				delete oAssociation["sap:content-version"];

				strictEqual(oAssociation.$path, "/dataServices/schema/0/association/0");
				delete oAssociation.$path;

				deepEqual(oAssociationSet["sap:creatable"], "false");
				delete oAssociationSet["sap:creatable"];

				deepEqual(oBusinessPartnerSet["sap:content-version"], "1");
				delete oBusinessPartnerSet["sap:content-version"];

				deepEqual(oEntityContainer["sap:use-batch"], "false");
				delete oEntityContainer["sap:use-batch"];

				strictEqual(oEntityContainer.$path, "/dataServices/schema/0/entityContainer/0");
				delete oEntityContainer.$path;

				deepEqual(oFunctionImport["sap:action-for"], "GWSAMPLE_BASIC.BusinessPartner");
				delete oFunctionImport["sap:action-for"];

				deepEqual(oNavigationProperty["sap:filterable"], "true");
				delete oNavigationProperty["sap:filterable"];

				deepEqual(oVHSex["sap:content-version"], "1");
				delete oVHSex["sap:content-version"];
				deepEqual(oVHSexSet["sap:content-version"], "1");
				delete oVHSexSet["sap:content-version"];

				if (i > 0) {
					ok(oAnnotations, "annotations are also loaded");

					deepEqual(oBusinessPartner["com.sap.vocabularies.Common.v1.Label"], {
						"String" : "Label via external annotation: Business Partner"
					});
					delete oBusinessPartner["com.sap.vocabularies.Common.v1.Label"];

					deepEqual(oBusinessPartner["com.sap.vocabularies.UI.v1.HeaderInfo"], {
						"RecordType" : "com.sap.vocabularies.UI.v1.HeaderInfoType",
						"Title" : {
							"Label" : {
								"String" : "Name"
							},
							"RecordType" : "com.sap.vocabularies.UI.v1.DataField",
							"Value" : {
								"Apply" : {
									"Name" : "odata.concat",
									"Parameters" : [{
										"Type" : "Path",
										"Value" : "CompanyName"
									}, {
										"Type" : "String",
										"Value" : ""
									}, {
										"Type" : "Path",
										"Value" : "LegalForm"
									}]
								}
							}
						},
						"TypeName" : {
							"String" : "Business Partner"
						}
					});
					delete oBusinessPartner["com.sap.vocabularies.UI.v1.HeaderInfo"];

					if (i > 1) { // additional tests for 2nd annotations file
						// schema
						deepEqual(oGWSampleBasic["acme.Foo.v1.Foo"], {
							"String" : "GWSAMPLE_BASIC"
						});
						delete oGWSampleBasic["acme.Foo.v1.Foo"];
						// entity type: navigation property
						deepEqual(oNavigationProperty["acme.Foo.v1.Foo"], {
							"String" : "GWSAMPLE_BASIC.BusinessPartner/ToFoo"
						});
						delete oNavigationProperty["acme.Foo.v1.Foo"];
						// complex type
						deepEqual(oCTAddress["acme.Foo.v1.Foo"], {
							"String" : "GWSAMPLE_BASIC.CT_Address"
						});
						delete oCTAddress["acme.Foo.v1.Foo"];
						// association
						deepEqual(oAssociation["acme.Foo.v1.Foo"], {
							"String" : "GWSAMPLE_BASIC.Assoc_Foo"
						});
						delete oAssociation["acme.Foo.v1.Foo"];
						// association: end
						deepEqual(oAssociationEnd["acme.Foo.v1.Foo"], {
							"String" : "GWSAMPLE_BASIC.Assoc_Foo/FromRole_Foo"
						});
						delete oAssociationEnd["acme.Foo.v1.Foo"];
						// entity container
						deepEqual(oEntityContainer["acme.Foo.v1.Foo"], {
							"String" : "GWSAMPLE_BASIC.GWSAMPLE_BASIC_Entities"
						});
						delete oEntityContainer["acme.Foo.v1.Foo"];
						// entity container: association set
						deepEqual(oAssociationSet["acme.Foo.v1.Foo"], {
							"String" : "GWSAMPLE_BASIC.GWSAMPLE_BASIC_Entities/Assoc_FooSet"
						});
						delete oAssociationSet["acme.Foo.v1.Foo"];
						// Note: "entity container: association set: end" is not needed!
						// entity container: entity set
						deepEqual(oBusinessPartnerSet["acme.Foo.v1.Foo"], {
							"String" : "GWSAMPLE_BASIC.GWSAMPLE_BASIC_Entities/BusinessPartnerSet"
						});
						delete oBusinessPartnerSet["acme.Foo.v1.Foo"];
						// entity container: function import
						deepEqual(oFunctionImport["acme.Foo.v1.Foo"], {
							"String" : "GWSAMPLE_BASIC.GWSAMPLE_BASIC_Entities/Foo"
						});
						delete oFunctionImport["acme.Foo.v1.Foo"];
						// entity container: function import: parameter
						deepEqual(oParameter["acme.Foo.v1.Foo"], {
							"String"
								: "GWSAMPLE_BASIC.GWSAMPLE_BASIC_Entities/Foo/BusinessPartnerID"
						});
						delete oParameter["acme.Foo.v1.Foo"];
					}
				}

				// check SAP V2 annotations as V4 annotations
				// sap:label
				deepEqual(oBusinessPartnerId["sap:label"], "Bus. Part. ID");
				delete oBusinessPartnerId["sap:label"];
				deepEqual(oBusinessPartnerId["com.sap.vocabularies.Common.v1.Label"], {
					"String" : "Bus. Part. ID"
				}, "Label derived from sap:label");
				delete oBusinessPartnerId["com.sap.vocabularies.Common.v1.Label"];

				// in case of i > 1 property has been overwritten by annotation file
				// complex type: property
				deepEqual(oCTAddressCity["sap:label"], "City");
				delete oCTAddressCity["sap:label"];
				deepEqual(oCTAddressCity["com.sap.vocabularies.Common.v1.Label"], {
					"String" : i <= 1 ? "City" : "GWSAMPLE_BASIC.CT_Address/City"
				}, "Label derived from sap:label");
				delete oCTAddressCity["com.sap.vocabularies.Common.v1.Label"];
				// check sap:semantics
				deepEqual(oCTAddressCity["sap:semantics"], "city");
				delete oCTAddressCity["sap:semantics"];
				deepEqual(oCTAddress["com.sap.vocabularies.Communication.v1.Contact"],
					{ "adr": { "locality": { "Path": "City" } } });
				delete oCTAddress["com.sap.vocabularies.Communication.v1.Contact"];

				deepEqual(oParameter["sap:label"], "ID");
				delete oParameter["sap:label"];
				deepEqual(oParameter["com.sap.vocabularies.Common.v1.Label"], {
					"String" : "ID"
				}, "Label derived from sap:label");
				delete oParameter["com.sap.vocabularies.Common.v1.Label"];

				// sap:creatable
				checkCapabilities("creatable");

				// sap:updatable
				checkCapabilities("updatable");

				// sap:deletable
				checkCapabilities("deletable");

				// sap:creatable=false and sap:updatable=false on property level
				deepEqual(oBusinessPartnerId["sap:creatable"], "false");
				delete oBusinessPartnerId["sap:creatable"];
				deepEqual(oBusinessPartnerId["sap:updatable"], "false");
				delete oBusinessPartnerId["sap:updatable"];
				deepEqual(oBusinessPartnerId["Org.OData.Core.V1.Computed"], {
					"Bool" : (i > 0 ? "false" : "true")
				}, "sap:creatable=false and sap:updatable=false on property level");
				delete oBusinessPartnerId["Org.OData.Core.V1.Computed"];

				// sap:creatable=true and sap:updatable=false on property level
				// sap:creatable=true is the default and thus no SAP V2 annotation is added
				deepEqual(oAnyProperty["sap:updatable"], "false");
				delete oAnyProperty["sap:updatable"];
				deepEqual(oAnyProperty["Org.OData.Core.V1.Immutable"], {
					"Bool" : "true"
				}, "sap:creatable=true and sap:updatable=false on property level");
				delete oAnyProperty["Org.OData.Core.V1.Immutable"];

				// sap:searchable
				deepEqual(oVHSexSet["sap:searchable"], "true");
				delete oVHSexSet["sap:searchable"];
				deepEqual(oBusinessPartnerSet["Org.OData.Capabilities.V1.SearchRestrictions"], {
					"Searchable": {"Bool" : (i > 0 ? "true" : "false")}
				}, "BusinessPartnerSet not searchable");
				delete oBusinessPartnerSet["Org.OData.Capabilities.V1.SearchRestrictions"];

				// sap:pageable
				deepEqual(oVHSexSet["sap:pageable"], "false");
				delete oVHSexSet["sap:pageable"];
				deepEqual(oVHSexSet["Org.OData.Capabilities.V1.TopSupported"], {"Bool" : "false"},
					"VH_SexSet not TopSupported");
				deepEqual(oVHSexSet["Org.OData.Capabilities.V1.SkipSupported"], {"Bool" : "false"},
					"VH_SexSet not SkipSupported");
				delete oVHSexSet["Org.OData.Capabilities.V1.TopSupported"];
				delete oVHSexSet["Org.OData.Capabilities.V1.SkipSupported"];

				// sap:topable
				deepEqual(oBusinessPartnerSet["sap:topable"], "false");
				delete oBusinessPartnerSet["sap:topable"];
				deepEqual(oBusinessPartnerSet["Org.OData.Capabilities.V1.TopSupported"],
					{"Bool" : "false"}, "oBusinessPartnerSet not TopSupported");
				delete oBusinessPartnerSet["Org.OData.Capabilities.V1.TopSupported"];

				// sap:requires-filter
				deepEqual(oBusinessPartnerSet["sap:requires-filter"], "true");
				delete oBusinessPartnerSet["sap:requires-filter"];
				deepEqual(
					oBusinessPartnerSet["Org.OData.Capabilities.V1.FilterRestrictions"].
						RequiresFilter, {"Bool" : "true"}, "BusinessPartnerSet requires filter");
				delete oBusinessPartnerSet["Org.OData.Capabilities.V1.FilterRestrictions"].
					RequiresFilter;

				// sap:text
				deepEqual(oBusinessPartnerId["sap:text"], "AnyProperty");
				delete oBusinessPartnerId["sap:text"];
				deepEqual(oBusinessPartnerId["com.sap.vocabularies.Common.v1.Text"],
					{ "Path" : "AnyProperty" }, "BusinessPartnerId text");
				delete oBusinessPartnerId["com.sap.vocabularies.Common.v1.Text"];

				// sap:precision
				deepEqual(oProductPrice["sap:precision"], "PriceScale");
				delete oProductPrice["sap:precision"];
				deepEqual(oProductPrice["Org.OData.Measures.V1.Scale"],
					{ "Path" : "PriceScale" }, "ProductPrice precision");
				delete oProductPrice["Org.OData.Measures.V1.Scale"];

				// sap:unit - currency
				deepEqual(oProductPrice["sap:unit"], "CurrencyCode");
				delete oProductPrice["sap:unit"];
				deepEqual(oProductCurrencyCode["sap:semantics"], "currency-code");
				delete oProductCurrencyCode["sap:semantics"];
				deepEqual(oProductPrice["Org.OData.Measures.V1.ISOCurrency"],
					{ "Path" : (i > 0 ? "CurrencyCodeFromAnnotation" : "CurrencyCode") },
					"ProductPrice currency");
				delete oProductPrice["Org.OData.Measures.V1.ISOCurrency"];
				// sap:unit - unit
				deepEqual(oProductWeightMeasure["sap:unit"], "WeightUnit");
				delete oProductWeightMeasure["sap:unit"];
				deepEqual(oProductWeightUnit["sap:semantics"], "unit-of-measure");
				delete oProductWeightUnit["sap:semantics"];
				deepEqual(oProductWeightMeasure["Org.OData.Measures.V1.Unit"],
					{ "Path" : "WeightUnit" }, "ProductWeightMeasure unit");
				delete oProductWeightMeasure["Org.OData.Measures.V1.Unit"];

				// sap:field-control
				deepEqual(oAnyProperty["sap:field-control"], "UX_FC_READONLY");
				delete oAnyProperty["sap:field-control"];
				deepEqual(oAnyProperty["com.sap.vocabularies.Common.v1.FieldControl"],
					{ "Path" : "UX_FC_READONLY" }, "AnyProperty FieldControl");
				delete oAnyProperty["com.sap.vocabularies.Common.v1.FieldControl"];

				// sap:sortable
				deepEqual(oBusinessPartnerId["sap:sortable"], "false");
				delete oBusinessPartnerId["sap:sortable"];
				deepEqual(oAnyProperty["sap:sortable"], "false");
				delete oAnyProperty["sap:sortable"];
				deepEqual(oBusinessPartnerSet["Org.OData.Capabilities.V1.SortRestrictions"], {
					"NonSortableProperties": [
						{"PropertyPath" : "BusinessPartnerID"},
						{"PropertyPath" : "AnyProperty"}
					]
				}, "BusinessPartnerSet not searchable");
				delete oBusinessPartnerSet["Org.OData.Capabilities.V1.SortRestrictions"];

				// sap:filterable
				deepEqual(oAnyProperty["sap:filterable"], "false");
				delete oAnyProperty["sap:filterable"];
				deepEqual(oNonFilterable["sap:filterable"], "false");
				delete oNonFilterable["sap:filterable"];
				deepEqual(oBusinessPartnerSet["Org.OData.Capabilities.V1.FilterRestrictions"]
						["NonFilterableProperties"],
					i > 0 ? undefined :
						[
							{"PropertyPath" : "AnyProperty"},
							{"PropertyPath" : "NonFilterable"}
						],
					"BusinessPartnerSet not filterable");
				delete oBusinessPartnerSet["Org.OData.Capabilities.V1.FilterRestrictions"]
					["NonFilterableProperties"];

				// sap:required-in-filter
				deepEqual(oBusinessPartnerId["sap:required-in-filter"], "true");
				delete oBusinessPartnerId["sap:required-in-filter"];
				// check that v4 annotations win
				deepEqual(oBusinessPartnerSet["Org.OData.Capabilities.V1.FilterRestrictions"], {
					"RequiredProperties": i === 0
					? [ {"PropertyPath" : "BusinessPartnerID"} ]
					: [ {"PropertyPath" : "AnyProperty"} ]
				}, "BusinessPartnerSet filter restrictions");
				delete oBusinessPartnerSet["Org.OData.Capabilities.V1.FilterRestrictions"];

				// sap:semantics for Communication.Contact
				// test only a subset of sap:semantics (different categories)
				oContact.property.forEach(function (oProperty) {
					// check only availability of sap:semantics
					// lift is tested multiple times before
					ok(oProperty["sap:semantics"], oProperty.name + " has sap:semantics");
					delete oProperty["sap:semantics"];
				});
				deepEqual(oContact["com.sap.vocabularies.Communication.v1.Contact"], i === 0
					? {
						"adr": {
							"code": { "Path": "Zip" }
						},
						"n": {
							"given": { "Path": "FirstName" },
							"prefix": { "Path": "Honorific" },
							"surname": { "Path": "LastName" }
						},
						"nickname": { "Path": "NickName" },
						"tel" : [{
							"type" : {
								"EnumMember" :
									"com.sap.vocabularies.Communication.v1.PhoneType/fax"
							},
							"uri" : {
								"Path" : "Tel"
							}
						}]
					}
					: {
						"n": {
							"additional": { "Path": "MiddleName" },
							"given": { "Path": "FirstName" },
							"prefix": { "Path": "Honorific" },
							"suffix": { "Path": "Suffix" },
							"surname": { "Path": "LastName" }
						},
						"nickname": {
							// TODO why is EdmType contained here but not in properties in n above?
							"EdmType": "Edm.String",
							"Path": "NickName"
						},
						"tel" : [{
							"type" : {
								"EnumMember" :
									"com.sap.vocabularies.Communication.v1.PhoneType/work " +
									"com.sap.vocabularies.Communication.v1.PhoneType/cell"
							},
							"uri" : {
								"Path" : "Tel"
							}
						}]
					}
				);
				delete oContact["com.sap.vocabularies.Communication.v1.Contact"];

				deepEqual(oContactTel["com.sap.vocabularies.Communication.v1.IsPhoneNumber"],
						{ "Bool" : "true" }, "IsPhoneNumber");
				delete oContactTel["com.sap.vocabularies.Communication.v1.IsPhoneNumber"];

				// sap:display-format
				deepEqual(oAnyProperty["sap:display-format"], "NonNegative");
				delete oAnyProperty["sap:display-format"];
				deepEqual(oAnyProperty["com.sap.vocabularies.Common.v1.IsDigitSequence"], {
					"Bool" : (i === 0 ? "true" : "false")
				}, "sap:display-format=NonNegative");
				delete oAnyProperty["com.sap.vocabularies.Common.v1.IsDigitSequence"];

				deepEqual(oBusinessPartnerId["sap:display-format"], "UpperCase");
				delete oBusinessPartnerId["sap:display-format"];
				deepEqual(oBusinessPartnerId["com.sap.vocabularies.Common.v1.IsUpperCase"], {
					"Bool" : "true"
				}, "sap:display-format=UpperCase");
				delete oBusinessPartnerId["com.sap.vocabularies.Common.v1.IsUpperCase"];

				// sap:heading
				deepEqual(oNonFilterable["sap:heading"], "No Filter");
				delete oNonFilterable["sap:heading"];
				deepEqual(oNonFilterable["com.sap.vocabularies.Common.v1.Heading"], {
					"String" : (i === 0 ? "No Filter" : "No Filter via Annotation")
				}, "sap:heading");
				delete oNonFilterable["com.sap.vocabularies.Common.v1.Heading"];

				// sap:quickinfo
				deepEqual(oNonFilterable["sap:quickinfo"], "No Filtering");
				delete oNonFilterable["sap:quickinfo"];
				deepEqual(oNonFilterable["com.sap.vocabularies.Common.v1.QuickInfo"], {
					"String" : (i === 0 ? "No Filtering" : "No Filtering via Annotation")
				}, "sap:quickinfo");
				delete oNonFilterable["com.sap.vocabularies.Common.v1.QuickInfo"];

				// sap:visible
				deepEqual(oProductWeightUnit["sap:visible"], "false");
				delete oProductWeightUnit["sap:visible"];
				deepEqual(oProductWeightMeasure["sap:visible"], "true");
				delete oProductWeightMeasure["sap:visible"];
				deepEqual(oProductWeightUnit["com.sap.vocabularies.Common.v1.FieldControl"], {
					"EnumMember" : "com.sap.vocabularies.Common.v1.FieldControlType/" +
						(i === 0 ? "Hidden" : "ReadOnly")},
					"Product WeightUnit invisible");
				delete oProductWeightUnit["com.sap.vocabularies.Common.v1.FieldControl"];

				deepEqual(oMetaModelData, oMetadata, "nothing else left...");
			});
		});
	});

	//*********************************************************************************************
	// Note: http://www.html5rocks.com/en/tutorials/es6/promises/ says that
	// "Any errors thrown in the constructor callback will be implicitly passed to reject()."
	// We make sure the same happens even with our asynchronous constructor.
	test("Errors thrown inside load()", function () {
		var oError = new Error("This call failed intentionally"),
			oModel;

		oGlobalSandbox.stub(Model.prototype, "setDefaultBindingMode").throws(oError);
		setupSandbox(this.sandbox);
		oModel = new ODataModel2("/fake/service", {
			annotationURI : "",
			json : true
		});

		// code under test
		return oModel.getMetaModel().loaded().then(function () {
			throw new Error("Unexpected success");
		}, function (ex) {
			strictEqual(ex, oError, ex.message);
		});
	});

	//*********************************************************************************************
	[false, true, false, true].forEach(function (bAsync, i) {
		test("Error loading" + (i < 2 ? " meta data" : " annotations" )
				+ ", async: " + bAsync, function () {
			var oModel,
				sMetadataURL = i < 2 ? "/invalid/service" : "/fake/service",
				sAnnotationsURL = i < 2 ? "" : "/invalid/annotations",
				fnConstructor = bAsync
					? ODataModel2
					: ODataModel;

			setupSandbox(this.sandbox);
			oModel = new fnConstructor(sMetadataURL, {
				annotationURI : sAnnotationsURL,
				json : true
			});

			// code under test
			return oModel.getMetaModel().loaded().then(function () {
				throw new Error("Unexpected success");
			}, function (ex) {
				ok(ex instanceof Error);
				ok(/Error loading meta model/.test(ex.message), ex.message);
			});
		});
	});

	//*********************************************************************************************
	["annotations", "emptyAnnotations"].forEach(function (sAnnotation) {
		["emptyMetadata", "emptyDataServices", "emptySchema", "emptyEntityType"].forEach(

			function (sPath) {
				test(sAnnotation + ", " + sPath, function () {
					var oMetaModel, oModel;

					setupSandbox(this.sandbox);
					oModel = new ODataModel2("/fake/" + sPath, {
						// annotations are mandatory for this test case
						annotationURI : "/fake/" + sAnnotation,
						json : true
					});

					// code under test
					oMetaModel = oModel.getMetaModel();
					return oMetaModel.loaded().then(function () {
						// check that no errors happen for empty/missing structures
						strictEqual(oMetaModel.getODataEntityType("GWSAMPLE_BASIC.Product"),
							null, "getODataEntityType");
						strictEqual(oMetaModel.getODataEntityType("GWSAMPLE_BASIC.Product", true),
							undefined, "getODataEntityType as path");
						strictEqual(oMetaModel.getODataEntitySet("ProductSet"),
							null, "getODataEntitySet");
						strictEqual(oMetaModel.getODataEntitySet("ProductSet", true),
							undefined, "getODataEntitySet as path");
						strictEqual(oMetaModel.getODataFunctionImport("RegenerateAllData"),
							null, "getODataFunctionImport");
						strictEqual(oMetaModel.getODataFunctionImport("RegenerateAllData", true),
							undefined, "getODataFunctionImport as path");
					});
				});
			}
		);
	});

	//*********************************************************************************************
	test("getODataEntityContainer", function () {
		return withMetaModel(function (oMetaModel) {
			strictEqual(oMetaModel.getODataEntityContainer(),
				oMetaModel.getObject("/dataServices/schema/0/entityContainer/0"));
		});
	});

	//*********************************************************************************************
	test("getODataEntityContainer as path", function () {
		return withMetaModel(function (oMetaModel) {
			strictEqual(oMetaModel.getODataEntityContainer(true),
				"/dataServices/schema/0/entityContainer/0");
		});
	});

	//*********************************************************************************************
	test("getODataEntitySet", function () {
		return withMetaModel(function (oMetaModel) {
			strictEqual(oMetaModel.getODataEntitySet("ProductSet"),
				oMetaModel.getObject("/dataServices/schema/0/entityContainer/0/entitySet/1"));
			strictEqual(oMetaModel.getODataEntitySet("FooSet"), null);
			strictEqual(oMetaModel.getODataEntitySet(), null);
		});
	});

	//*********************************************************************************************
	test("getODataEntitySet as path", function () {
		return withMetaModel(function (oMetaModel) {
			strictEqual(oMetaModel.getODataEntitySet("ProductSet", true),
				"/dataServices/schema/0/entityContainer/0/entitySet/1");
			strictEqual(oMetaModel.getODataEntitySet("FooSet", true), undefined);
			strictEqual(oMetaModel.getODataEntitySet(undefined, true), undefined);
		});
	});

	//*********************************************************************************************
	test("getODataFunctionImport", function () {
		return withMetaModel(function (oMetaModel) {
			strictEqual(oMetaModel.getODataFunctionImport("RegenerateAllData"),
				oMetaModel.getObject("/dataServices/schema/0/entityContainer/0/functionImport/0"));
			strictEqual(oMetaModel.getODataFunctionImport(
				"GWSAMPLE_BASIC.GWSAMPLE_BASIC_Entities/RegenerateAllData"),
				oMetaModel.getObject("/dataServices/schema/0/entityContainer/0/functionImport/0"));
			strictEqual(oMetaModel.getODataFunctionImport(
				"FOO_Bar/RegenerateAllData"),
				null);
			strictEqual(oMetaModel.getODataFunctionImport("Foo"), null);
			strictEqual(oMetaModel.getODataFunctionImport(), null);
		});
	});

	//*********************************************************************************************
	test("getODataFunctionImport as path", function () {
		return withMetaModel(function (oMetaModel) {
			strictEqual(oMetaModel.getODataFunctionImport("RegenerateAllData", true),
				"/dataServices/schema/0/entityContainer/0/functionImport/0");
			strictEqual(oMetaModel.getODataFunctionImport("Foo", true), undefined);
			strictEqual(oMetaModel.getODataFunctionImport(undefined, true), undefined);
		});
	});

	//TODO test with multiple schemas; what if there is no default entity container?
	/*
	 * http://www.odata.org/documentation/odata-version-2-0/overview/ says about
	 * "IsDefaultEntityContainer":
	 * "A CSDL document may include many Entity Containers; this attribute is used by data services
	 * to indicate the default container. As described in [OData:URI], Entities in the default
	 * container do not need to be container-qualified when addressed in URIs.This attribute may be
	 * present on any element in a CSDL document"
	 * e.g. "GWSAMPLE_BASIC_Entities.ProductSet"
	 *
	 * http://docs.oasis-open.org/odata/odata/v4.0/odata-v4.0-part3-csdl.html
	 * "13 Entity Container" says
	 * "Each metadata document used to describe an OData service MUST define exactly one entity
	 * container." But then again, there is "13.1.2 Attribute Extends"...
	 *
	 * ==> SAP Gateway supports a single entity container only, and OData v4 has been adjusted
	 * accordingly.
	 */

	//*********************************************************************************************
	test("getODataComplexType", function () {
		return withMetaModel(function (oMetaModel) {
			strictEqual(oMetaModel.getODataComplexType("GWSAMPLE_BASIC.CT_Address"),
					oMetaModel.getObject("/dataServices/schema/0/complexType/0"));
			strictEqual(oMetaModel.getODataComplexType("FOO.CT_Address"), null);
			strictEqual(oMetaModel.getODataComplexType("GWSAMPLE_BASIC.Foo"), null);
			strictEqual(oMetaModel.getODataComplexType("GWSAMPLE_BASIC"), null);
			strictEqual(oMetaModel.getODataComplexType(), null);
		});
	});

	//*********************************************************************************************
	test("getODataEntityType", function () {
		return withMetaModel(function (oMetaModel) {
			strictEqual(oMetaModel.getODataEntityType("GWSAMPLE_BASIC.Product"),
				oMetaModel.getObject("/dataServices/schema/0/entityType/1"));
			strictEqual(oMetaModel.getODataEntityType("FOO.Product"), null);
			strictEqual(oMetaModel.getODataEntityType("GWSAMPLE_BASIC.Foo"), null);
			strictEqual(oMetaModel.getODataEntityType("GWSAMPLE_BASIC"), null);
			strictEqual(oMetaModel.getODataEntityType(), null);

			// change the namespace to contain a dot
			oMetaModel.getObject("/dataServices/schema/0").namespace = "GWSAMPLE.BASIC";
			strictEqual(oMetaModel.getODataEntityType("GWSAMPLE.BASIC.Product"),
				oMetaModel.getObject("/dataServices/schema/0/entityType/1"));
		});
	});

	//*********************************************************************************************
	test("getODataEntityType as path", function () {
		return withMetaModel(function (oMetaModel) {
			strictEqual(oMetaModel.getODataEntityType("GWSAMPLE_BASIC.Product", true),
				"/dataServices/schema/0/entityType/1");
			strictEqual(oMetaModel.getODataEntityType("FOO.Product", true), undefined);
			strictEqual(oMetaModel.getODataEntityType("GWSAMPLE_BASIC.Foo", true), undefined);
			strictEqual(oMetaModel.getODataEntityType("GWSAMPLE_BASIC", true), undefined);
			strictEqual(oMetaModel.getODataEntityType(undefined, true), undefined);
		});
	});

	//*********************************************************************************************
	test("getODataAssociationEnd", function () {
		return withMetaModel(function (oMetaModel) {
			var oEntityType = oMetaModel.getODataEntityType("GWSAMPLE_BASIC.Product");

			strictEqual(oMetaModel.getODataAssociationEnd(oEntityType, "ToSupplier"),
				oMetaModel.getObject("/dataServices/schema/0/association/5/end/0"));
			strictEqual(oMetaModel.getODataAssociationEnd(oEntityType, "ToFoo"), null);
			strictEqual(oMetaModel.getODataAssociationEnd(null, "ToSupplier"), null);
			strictEqual(oMetaModel.getODataAssociationEnd({}, "ToSupplier"), null);
		});
	});

	//*********************************************************************************************
	test("getODataAssociation*Set*End", function () {
		return withMetaModel(function (oMetaModel) {
			var oEntityType = oMetaModel.getODataEntityType("GWSAMPLE_BASIC.Product");

			strictEqual(oMetaModel.getODataAssociationSetEnd(oEntityType, "ToSupplier"),
				oMetaModel.getObject(
					"/dataServices/schema/0/entityContainer/0/associationSet/10/end/0"));
			strictEqual(oMetaModel.getODataAssociationSetEnd(oEntityType, "ToFoo"), null);
			strictEqual(oMetaModel.getODataAssociationSetEnd(null, "ToSupplier"), null);
			strictEqual(oMetaModel.getODataAssociationSetEnd({}, "ToSupplier"), null);
		});
	});

	//*********************************************************************************************
	test("getODataProperty", function () {
		return withMetaModel(function (oMetaModel) {
			var oComplexType = oMetaModel.getODataComplexType("GWSAMPLE_BASIC.CT_Address"),
				oEntityType = oMetaModel.getODataEntityType("GWSAMPLE_BASIC.BusinessPartner"),
				aParts;

			// entity type
			strictEqual(oMetaModel.getODataProperty(oEntityType, "Address"),
				oMetaModel.getObject("/dataServices/schema/0/entityType/0/property/0"));
			strictEqual(oMetaModel.getODataProperty(), null);
			strictEqual(oMetaModel.getODataProperty(oEntityType), null);
			strictEqual(oMetaModel.getODataProperty(oEntityType, "foo"), null);

			// complex type
			strictEqual(oMetaModel.getODataProperty(oComplexType, "Street"),
				oMetaModel.getObject("/dataServices/schema/0/complexType/0/property/2"));
			strictEqual(oMetaModel.getODataProperty(oComplexType), null);
			strictEqual(oMetaModel.getODataProperty(oComplexType, "foo"), null);

			// {string[]} path
			aParts = ["foo"];
			strictEqual(oMetaModel.getODataProperty(oEntityType, aParts), null);
			strictEqual(aParts.length, 1, "no parts consumed");
			aParts = ["Address"];
			strictEqual(oMetaModel.getODataProperty(oEntityType, aParts),
				oMetaModel.getObject("/dataServices/schema/0/entityType/0/property/0"));
			strictEqual(aParts.length, 0, "all parts consumed");
			aParts = ["Address", "foo"];
			strictEqual(oMetaModel.getODataProperty(oEntityType, aParts),
				oMetaModel.getObject("/dataServices/schema/0/entityType/0/property/0"));
			strictEqual(aParts.length, 1, "one part consumed");
			aParts = ["Street"];
			strictEqual(oMetaModel.getODataProperty(oComplexType, aParts),
				oMetaModel.getObject("/dataServices/schema/0/complexType/0/property/2"));
			strictEqual(aParts.length, 0, "all parts consumed");
			aParts = ["Address", "Street"];
			strictEqual(oMetaModel.getODataProperty(oEntityType, aParts),
				oMetaModel.getObject("/dataServices/schema/0/complexType/0/property/2"));
			strictEqual(aParts.length, 0, "all parts consumed");
		});
	});

	//*********************************************************************************************
	test("getODataProperty as path", function () {
		return withMetaModel(function (oMetaModel) {
			var oComplexType = oMetaModel.getODataComplexType("GWSAMPLE_BASIC.CT_Address"),
				oEntityType = oMetaModel.getODataEntityType("GWSAMPLE_BASIC.BusinessPartner"),
				aParts;

			// entity type
			strictEqual(oMetaModel.getODataProperty(oEntityType, "Address", true),
				"/dataServices/schema/0/entityType/0/property/0");
			strictEqual(oMetaModel.getODataProperty(null, "", true), undefined);
			strictEqual(oMetaModel.getODataProperty(oEntityType, undefined, true), undefined);
			strictEqual(oMetaModel.getODataProperty(oEntityType, "foo", true), undefined);

			// complex type
			strictEqual(oMetaModel.getODataProperty(oComplexType, "Street", true),
				"/dataServices/schema/0/complexType/0/property/2");
			strictEqual(oMetaModel.getODataProperty(oComplexType, undefined, true), undefined);
			strictEqual(oMetaModel.getODataProperty(oComplexType, "foo", true), undefined);

			// {string[]} path
			aParts = ["foo"];
			strictEqual(oMetaModel.getODataProperty(oEntityType, aParts, true), undefined);
			strictEqual(aParts.length, 1, "no parts consumed");
			aParts = ["Address"];
			strictEqual(oMetaModel.getODataProperty(oEntityType, aParts, true),
				"/dataServices/schema/0/entityType/0/property/0");
			strictEqual(aParts.length, 0, "all parts consumed");
			aParts = ["Address", "foo"];
			strictEqual(oMetaModel.getODataProperty(oEntityType, aParts, true),
				"/dataServices/schema/0/entityType/0/property/0");
			strictEqual(aParts.length, 1, "one part consumed");
			aParts = ["Street"];
			strictEqual(oMetaModel.getODataProperty(oComplexType, aParts, true),
				"/dataServices/schema/0/complexType/0/property/2");
			strictEqual(aParts.length, 0, "all parts consumed");
			aParts = ["Address", "Street"];
			strictEqual(oMetaModel.getODataProperty(oEntityType, aParts, true),
				"/dataServices/schema/0/complexType/0/property/2");
			strictEqual(aParts.length, 0, "all parts consumed");
		});
	});

	//*********************************************************************************************
	test("getMetaContext: empty data path", function () {
		return withMetaModel(function (oMetaModel) {
			strictEqual(oMetaModel.getMetaContext(undefined), null);
			strictEqual(oMetaModel.getMetaContext(null), null);
			strictEqual(oMetaModel.getMetaContext(""), null);
		});
	});

	//*********************************************************************************************
	test("getMetaContext: entity set only", function () {
		return withMetaModel(function (oMetaModel) {
			var oMetaContext = oMetaModel.getMetaContext("/ProductSet('ABC')");

			ok(oMetaContext instanceof Context);
			strictEqual(oMetaContext.getModel(), oMetaModel);
			strictEqual(oMetaContext.getPath(), "/dataServices/schema/0/entityType/1");

			strictEqual(oMetaModel.getMetaContext("/ProductSet('ABC')"), oMetaContext,
				"the context has been cached");

			throws(function () {
				oMetaModel.getMetaContext("foo/bar");
			}, /Not an absolute path: foo\/bar/);
			throws(function () {
				oMetaModel.getMetaContext("/FooSet('123')");
			}, /Entity set not found: FooSet\('123'\)/);
			throws(function () {
				oMetaModel.getMetaContext("/('123')");
			}, /Entity set not found: \('123'\)/);
		});
	});

	//*********************************************************************************************
	test("getMetaContext: entity set & navigation properties", function () {
		return withMetaModel(function (oMetaModel) {
			var oMetaContext = oMetaModel.getMetaContext("/ProductSet('ABC')/ToSupplier");

			ok(oMetaContext instanceof Context);
			strictEqual(oMetaContext.getModel(), oMetaModel);
			strictEqual(oMetaContext.getPath(), "/dataServices/schema/0/entityType/0");

			strictEqual(oMetaModel.getMetaContext("/ProductSet('ABC')/ToSupplier"), oMetaContext,
				"the context has been cached");

			throws(function () {
				oMetaModel.getMetaContext("/ProductSet('ABC')/ToFoo(0)");
			}, /Property not found: ToFoo\(0\)/);

			throws(function () {
				oMetaModel.getMetaContext("/ProductSet('ABC')/ToSupplier('ABC')");
			}, /Multiplicity is 1: ToSupplier\('ABC'\)/);

			// many navigation properties
			oMetaContext = oMetaModel.getMetaContext(
				"/SalesOrderSet('123')/ToLineItems(SalesOrderID='123',ItemPosition='1')/ToProduct"
				+ "/ToSupplier/ToContacts(guid'01234567-89AB-CDEF-0123-456789ABCDEF')");
			strictEqual(oMetaContext.getPath(), "/dataServices/schema/0/entityType/4");
		});
	});

	//*********************************************************************************************
	test("getMetaContext: entity set & property", function () {
		return withMetaModel(function (oMetaModel) {
			var sPath = "/ProductSet('ABC')/ProductID",
				oMetaContext = oMetaModel.getMetaContext(sPath);

			ok(oMetaContext instanceof Context);
			strictEqual(oMetaContext.getModel(), oMetaModel);
			strictEqual(oMetaContext.getPath(), "/dataServices/schema/0/entityType/1/property/0");

			strictEqual(oMetaModel.getMetaContext(sPath), oMetaContext, "cached");

			throws(function () {
				oMetaModel.getMetaContext("/ProductSet('ABC')/ProductID(0)");
			}, /Property not found: ProductID\(0\)/);

			throws(function () {
				oMetaModel.getMetaContext("/FooSet('123')/Bar");
			}, /Entity set not found: FooSet/);
		});
	});

	//*********************************************************************************************
	test("getMetaContext: entity set, navigation property & property", function () {
		return withMetaModel(function (oMetaModel) {
			var sPath = "/ProductSet('ABC')/ToSupplier/BusinessPartnerID",
				oMetaContext = oMetaModel.getMetaContext(sPath);

			ok(oMetaContext instanceof Context);
			strictEqual(oMetaContext.getModel(), oMetaModel);
			strictEqual(oMetaContext.getPath(), "/dataServices/schema/0/entityType/0/property/1");

			strictEqual(oMetaModel.getMetaContext(sPath), oMetaContext, "cached");

			throws(function () {
				oMetaModel.getMetaContext("/ProductSet('ABC')/ToSupplier/Foo");
			}, /Property not found: Foo/);
		});
	});

	//*********************************************************************************************
	test("getMetaContext: entity set & complex property", function () {
		return withMetaModel(function (oMetaModel) {
			var sPath = "/ProductSet('ABC')/ToSupplier/Address/Street",
				oMetaContext = oMetaModel.getMetaContext(sPath);

			ok(oMetaContext instanceof Context);
			strictEqual(oMetaContext.getModel(), oMetaModel);
			strictEqual(oMetaContext.getPath(), "/dataServices/schema/0/complexType/0/property/2");

			strictEqual(oMetaModel.getMetaContext(sPath), oMetaContext, "cached");

			throws(function () {
				oMetaModel.getMetaContext("/ProductSet('ABC')/ToSupplier/Address/Foo");
			}, /Property not found: Foo/);

			//TODO "nested" complex types are supported, we just need an example
			throws(function () {
				oMetaModel.getMetaContext("/ProductSet('ABC')/ToSupplier/Address/Street/AndSoOn");
			}, /Property not found: AndSoOn/);
		});
	});
	//TODO our errors do not include sufficient detail for error analysis, e.g. a full path
});
