/*!
 * ${copyright}
 */
sap.ui.require([
	"sap/ui/base/BindingParser", "sap/ui/model/BindingMode", "sap/ui/model/ClientContextBinding",
	"sap/ui/model/Context", "sap/ui/model/FilterProcessor",
	"sap/ui/model/json/JSONListBinding", "sap/ui/model/json/JSONPropertyBinding",
	"sap/ui/model/json/JSONTreeBinding", "sap/ui/model/MetaModel", "sap/ui/model/Model",
	"sap/ui/model/odata/_ODataMetaModelUtils", "sap/ui/model/odata/ODataMetaModel",
	"sap/ui/model/odata/ODataModel", "sap/ui/model/odata/v2/ODataModel", "sap/ui/test/TestUtils"
], function(BindingParser, BindingMode, ClientContextBinding, Context, FilterProcessor,
	JSONListBinding, JSONPropertyBinding, JSONTreeBinding, MetaModel, Model, Utils, ODataMetaModel,
	ODataModel1, ODataModel, TestUtils) {
	/*global deepEqual, equal, expect, module, notDeepEqual, notEqual, notPropEqual,
	notStrictEqual, ok, propEqual, sinon, strictEqual, test, throws,
	*/
	"use strict";

	//TODO remove this workaround in IE9 for
	// https://github.com/cjohansen/Sinon.JS/commit/e8de34b5ec92b622ef76267a6dce12674fee6a73
	sinon.xhr.supportsCORS = true;

	var sMetadata = '\
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
				<Property Name="BusinessPartnerID" Type="Edm.String" \
					Nullable="false" MaxLength="10" sap:label="Bus. Part. ID" \
					sap:creatable="false" sap:filter-restriction="multi-value" \
					sap:text="AnyProperty" sap:updatable="false" \
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
					sap:filter-restriction="interval" sap:precision="PriceScale" \
					sap:unit="CurrencyCode"/>\
				<Property Name="PriceScale" Type="Edm.Byte"/>\
				<Property Name="WeightMeasure" Type="Edm.Decimal" Precision="13" Scale="3" \
					sap:unit="WeightUnit" sap:visible="true" />\
				<Property Name="WeightUnit" Type="Edm.String" MaxLength="3" \
					sap:semantics="unit-of-measure" sap:visible="false" />\
				<Property Name="CurrencyCode" Type="Edm.String" MaxLength="5" \
					sap:filter-restriction="single-value" sap:semantics="currency-code"/>\
			</EntityType>\
			<EntityType Name="Contact">\
				<Property Name="FirstName" Type="Edm.String" sap:semantics="givenname"/>\
				<Property Name="Honorific" Type="Edm.String" sap:semantics="honorific"/>\
				<Property Name="LastName" Type="Edm.String" sap:semantics="familyname"/>\
				<Property Name="NickName" Type="Edm.String" sap:semantics="nickname"/>\
				<Property Name="Tel" Type="Edm.String" sap:semantics="tel;type=fax"/>\
				<Property Name="Zip" Type="Edm.String" sap:semantics="zip"/>\
			</EntityType>\
			<EntityContainer Name="GWSAMPLE_BASIC_Entities"\
				m:IsDefaultEntityContainer="true" sap:use-batch="false">\
				<EntitySet Name="BusinessPartnerSet" EntityType="GWSAMPLE_BASIC.BusinessPartner"\
					sap:deletable-path="Deletable" sap:topable="false" sap:requires-filter="true"\
					sap:updatable-path="Updatable" sap:content-version="1" />\
				<EntitySet Name="ProductSet" EntityType="GWSAMPLE_BASIC.Product"/>\
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
		<Annotation Term="Org.OData.Core.V1.DeleteRestrictions">\
			<Record>\
				<PropertyValue Property="Deletable" Path="DeletableFromAnnotation"/>\
			</Record>\
		</Annotation>\
		<Annotation Term="Org.OData.Core.V1.UpdateRestrictions">\
			<Record>\
				<PropertyValue Property="Updatable" Path="UpdatableFromAnnotation"/>\
			</Record>\
		</Annotation>\
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
	<Annotations Target="GWSAMPLE_BASIC.GWSAMPLE_BASIC_Entities/ProductSet">\
		<Annotation Term="com.sap.vocabularies.Common.v1.FilterExpressionRestrictions">\
			<Collection>\
				<Record>\
					<PropertyValue Property="Property" PropertyPath="CurrencyCode"/>\
					<PropertyValue Property="AllowedExpressions" \
						EnumMember="com.sap.vocabularies.Common.v1.FilterExpressionType/MultiValue"\
					/>\
				</Record>\
			</Collection>\
		</Annotation>\
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
		', sEmptySchemaWithAnnotations = '\
<?xml version="1.0" encoding="utf-8"?>\
<edmx:Edmx Version="1.0"\
	xmlns="http://schemas.microsoft.com/ado/2008/09/edm"\
	xmlns:edmx="http://schemas.microsoft.com/ado/2007/06/edmx"\
	xmlns:m="http://schemas.microsoft.com/ado/2007/08/dataservices/metadata"\
	>\
	<edmx:DataServices m:DataServiceVersion="2.0">\
		<Schema Namespace="GWSAMPLE_BASIC" xml:lang="en">\
			<!-- mind the XML namespace! -->\
			<Annotations Target="FAR_CUSTOMER_LINE_ITEMS.Item/CompanyCode" xmlns="http://docs.oasis-open.org/odata/ns/edm">\
				<Annotation Term="com.sap.vocabularies.Common.v1.ValueList">\
				</Annotation>\
			</Annotations>\
		</Schema>\
	</edmx:DataServices>\
</edmx:Edmx>\
		',
		sFARMetadata = jQuery.sap.syncGetText(
			"model/FAR_CUSTOMER_LINE_ITEMS.metadata.xml", "", null),
		sFARMetadataCompanyCode = jQuery.sap.syncGetText(
			"model/FAR_CUSTOMER_LINE_ITEMS.metadata_ItemCompanyCode.xml", "", null),
		sFARMetadataCompanyCode_Customer = jQuery.sap.syncGetText(
			"model/FAR_CUSTOMER_LINE_ITEMS.metadata_ItemCompanyCode_ItemCustomer.xml", "", null),
		sFARMetadataCustomer = jQuery.sap.syncGetText(
			"model/FAR_CUSTOMER_LINE_ITEMS.metadata_ItemCustomer.xml", "", null),
		sFARMetadataInvalid = '\
<?xml version="1.0" encoding="utf-8"?>\
<!-- fictitious empty response for /sap/opu/odata/sap/FAR_CUSTOMER_LINE_ITEMS/$metadata?sap-value-list=Item/Invalid -->\
<edmx:Edmx Version="1.0" xmlns:edmx="http://schemas.microsoft.com/ado/2007/06/edmx" xmlns:m="http://schemas.microsoft.com/ado/2007/08/dataservices/metadata" xmlns:sap="http://www.sap.com/Protocols/SAPData">\
	<edmx:Reference Uri="/sap/opu/odata/IWFND/CATALOGSERVICE;v=2/Vocabularies(TechnicalName=\'%2FIWBEP%2FVOC_COMMON\',Version=\'0001\',SAP__Origin=\'LOCAL\')/$value" xmlns:edmx="http://docs.oasis-open.org/odata/ns/edmx">\
		<edmx:Include Namespace="com.sap.vocabularies.Common.v1" Alias="Common"/>\
	</edmx:Reference>\
	<edmx:Reference Uri="/sap/opu/odata/IWFND/CATALOGSERVICE;v=2/Vocabularies(TechnicalName=\'%2FIWBEP%2FVOC_UI\',Version=\'0001\',SAP__Origin=\'LOCAL\')/$value" xmlns:edmx="http://docs.oasis-open.org/odata/ns/edmx">\
		<edmx:Include Namespace="com.sap.vocabularies.UI.v1" Alias="UI"/>\
	</edmx:Reference>\
	<edmx:DataServices m:DataServiceVersion="2.0">\
		<Schema Namespace="FAR_CUSTOMER_LINE_ITEMS" xml:lang="en" sap:schema-version="0" xmlns="http://schemas.microsoft.com/ado/2008/09/edm">\
			<EntityType Name="FOO" sap:content-version="1"/><!-- TODO remove this! -->\
			<EntityContainer Name="FAR_CUSTOMER_LINE_ITEMS_Entities" m:IsDefaultEntityContainer="true" sap:supported-formats="atom json xlsx">\
			</EntityContainer>\
		</Schema>\
	</edmx:DataServices>\
</edmx:Edmx>\
		',
		sFARMetadataMyComplexType_Customer = jQuery.sap.syncGetText(
			"model/FAR_CUSTOMER_LINE_ITEMS.metadata_MyComplexTypeCustomer.xml", "", null),
		sGWAnnotations = jQuery.sap.syncGetText("model/GWSAMPLE_BASIC.annotations.xml", "", null),
		sGWMetadata = jQuery.sap.syncGetText("model/GWSAMPLE_BASIC.metadata.xml", "", null),
		sMultipleValueListAnnotations = '\
<?xml version="1.0" encoding="utf-8"?>\
<edmx:Edmx Version="4.0"\
	xmlns="http://docs.oasis-open.org/odata/ns/edm"\
	xmlns:edmx="http://docs.oasis-open.org/odata/ns/edmx">\
<edmx:DataServices>\
<Schema Namespace="zanno4sample_anno_mdl.v1">\
	<Annotations Target="GWSAMPLE_BASIC.Product/WeightUnit">\
		<Annotation Term="com.sap.vocabularies.Common.v1.ValueList">\
			<Record>\
				<PropertyValue Property="CollectionPath" String="VH_UnitWeight"/>\
			</Record>\
		</Annotation>\
	</Annotations>\
	<Annotations Target="GWSAMPLE_BASIC.Product/WeightUnit" Qualifier="FOO">\
		<Annotation Term="com.sap.vocabularies.Common.v1.ValueList">\
			<Record>\
				<PropertyValue Property="CollectionPath" String="VH_UnitQuantity"/>\
			</Record>\
		</Annotation>\
	</Annotations>\
</Schema>\
</edmx:DataServices>\
</edmx:Edmx>\
		',
		sValueListMetadata = '\
<?xml version="1.0" encoding="utf-8"?>\
<edmx:Edmx Version="1.0"\
	xmlns="http://schemas.microsoft.com/ado/2008/09/edm"\
	xmlns:edmx="http://schemas.microsoft.com/ado/2007/06/edmx"\
	xmlns:m="http://schemas.microsoft.com/ado/2007/08/dataservices/metadata"\
	xmlns:sap="http://www.sap.com/Protocols/SAPData">\
	<edmx:DataServices m:DataServiceVersion="2.0">\
		<Schema Namespace="GWSAMPLE_BASIC" xml:lang="en"\
			sap:schema-version="0000">\
			<EntityType Name="Product">\
				<Property Name="Price" Type="Edm.Decimal" Precision="16" Scale="3" \
					sap:precision="PriceScale" sap:unit="CurrencyCode"/>\
				<Property Name="WeightUnit" Type="Edm.String" MaxLength="3" \
					sap:semantics="unit-of-measure" sap:visible="false" sap:value-list="standard"/>\
			</EntityType>\
		</Schema>\
	</edmx:DataServices>\
</edmx:Edmx>\
		', mHeaders = {"Content-Type" : "application/xml"},
		mFixture = {
			"/fake/emptyDataServices/$metadata" : [200, mHeaders, sEmptyDataServices],
			"/fake/emptyEntityType/$metadata" : [200, mHeaders, sEmptyEntityType],
			"/fake/emptyMetadata/$metadata" : [200, mHeaders, sEmptyDataServices],
			"/fake/emptySchema/$metadata" : [200, mHeaders, sEmptySchema],
			"/fake/emptySchemaWithAnnotations/$metadata" : [200, mHeaders, sEmptySchemaWithAnnotations],
			"/fake/service/$metadata" : [200, mHeaders, sMetadata],
			"/fake/annotations" : [200, mHeaders, sAnnotations],
			"/fake/annotations2" : [200, mHeaders, sAnnotations2],
			"/fake/emptyAnnotations" : [200, mHeaders, sEmptyAnnotations],
			"/fake/multipleValueLists" : [200, mHeaders, sMultipleValueListAnnotations],
			"/fake/valueListMetadata/$metadata" : [200, mHeaders, sValueListMetadata],
			"/FAR_CUSTOMER_LINE_ITEMS/$metadata" : [200, mHeaders, sFARMetadata],
			"/FAR_CUSTOMER_LINE_ITEMS/$metadata?sap-value-list=FAR_CUSTOMER_LINE_ITEMS.Item%2FCompanyCode" :
				[200, mHeaders, sFARMetadataCompanyCode],
			"/FAR_CUSTOMER_LINE_ITEMS/$metadata?sap-value-list=FAR_CUSTOMER_LINE_ITEMS.Item%2FCompanyCode,FAR_CUSTOMER_LINE_ITEMS.Item%2FCustomer" :
				[200, mHeaders, sFARMetadataCompanyCode_Customer],
			"/FAR_CUSTOMER_LINE_ITEMS/$metadata?sap-value-list=FAR_CUSTOMER_LINE_ITEMS.Item%2FCustomer" :
				[200, mHeaders, sFARMetadataCustomer],
			// Note: Gateway says
			// "Value-List FAR_CUSTOMER_LINE_ITEMS.Item/Invalid not found in Metadata", but we want
			// to make our code more robust against empty responses
			"/FAR_CUSTOMER_LINE_ITEMS/$metadata?sap-value-list=FAR_CUSTOMER_LINE_ITEMS.Item%2FInvalid" :
				[200, mHeaders, sFARMetadataInvalid], // no annotations at all
			"/FAR_CUSTOMER_LINE_ITEMS/$metadata?sap-value-list=FAR_CUSTOMER_LINE_ITEMS.Foo%2FInvalid" :
				[200, mHeaders, sFARMetadataCompanyCode], // annotations for a different type
			"/FAR_CUSTOMER_LINE_ITEMS/$metadata?sap-value-list=FAR_CUSTOMER_LINE_ITEMS.MyComplexType%2FCustomer" :
				[200, mHeaders, sFARMetadataMyComplexType_Customer],
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
	 * Runs the given code under test with an <code>ODataMetaModel</code> for the service URL
	 * "/GWSAMPLE_BASIC" and annotation URL "/GWSAMPLE_BASIC/annotations".
	 */
	function withMetaModel(fnCodeUnderTest) {
		return withGivenService("/GWSAMPLE_BASIC", "/GWSAMPLE_BASIC/annotations", fnCodeUnderTest);
	}

	/**
	 * Runs the given code under test with an <code>ODataMetaModel</code> for the service URL
	 * "/GWSAMPLE_BASIC" and (array of) annotation URLs.
	 */
	function withGivenAnnotations(vAnnotationUrl, fnCodeUnderTest) {
		return withGivenService("/GWSAMPLE_BASIC", vAnnotationUrl, fnCodeUnderTest);
	}

	/**
	 * Runs the given code under test with an <code>ODataMetaModel</code> (and an
	 * <code>ODataModel</code>) for the given service and (array of) annotation URLs.
	 *
	 * @param {string} sServiceUrl
	 *   the service URL
	 * @param {string|string[]} vAnnotationUrl
	 *   the (array of) annotation URLs
	 * @param {function} fnCodeUnderTest
	 * @returns {any|Promise}
	 *   (a promise to) whatever <code>fnCodeUnderTest</code> returns
	 */
	function withGivenService(sServiceUrl, vAnnotationUrl, fnCodeUnderTest) {
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
			ok(false, "Failed to load: " + JSON.stringify(oParameters));
		}
		oModel.attachMetadataFailed(onFailed);
		oModel.attachAnnotationsFailed(onFailed);

		// calls the code under test once the meta model has loaded
		return oModel.getMetaModel().loaded().then(function () {
			return fnCodeUnderTest(oModel.getMetaModel(), oModel);
		});
	}

	//*********************************************************************************************
	module("sap.ui.model.odata.ODataMetaModel", {
		beforeEach : function () {
			oGlobalSandbox = sinon.sandbox.create();
			setupSandbox(oGlobalSandbox);
			this.iOldLogLevel = jQuery.sap.log.getLevel();
			// do not rely on ERROR vs. DEBUG due to minified sources
			jQuery.sap.log.setLevel(jQuery.sap.log.Level.ERROR);
		},
		afterEach : function () {
			jQuery.sap.log.setLevel(this.iOldLogLevel);
			ODataModel.mServiceData = {}; // clear cache
			// I would consider this an API, see https://github.com/cjohansen/Sinon.JS/issues/614
			oGlobalSandbox.verifyAndRestore();
			sinon.FakeXMLHttpRequest.filters = [];
		}
	});

	//*********************************************************************************************
	test("TestUtils.deepContains", function () {
		TestUtils.notDeepContains(null, {}, "null");
		TestUtils.notDeepContains(undefined, {}, "undefined");
		TestUtils.notDeepContains({}, [], "not an array");
		TestUtils.deepContains({}, {});
		TestUtils.deepContains([], []);
		TestUtils.deepContains([{}], []);
		TestUtils.notDeepContains([], [{}]);

		TestUtils.notDeepContains("foo", "bar");
//TODO?		TestUtils.deepContains(0, new Number(0));

		TestUtils.notDeepContains({}, {foo : "bar"});
		TestUtils.deepContains({foo : "bar"}, {foo : "bar"});
		TestUtils.deepContains({foo : "bar"}, {});

		TestUtils.notDeepContains([{}, {}], [{foo : "bar"}]);
	});

	//*********************************************************************************************
	test("compatibility with synchronous ODataModel", function () {
		var oModel = new ODataModel1("/GWSAMPLE_BASIC", {
				annotationURI : "/GWSAMPLE_BASIC/annotations",
				json : true,
				loadMetadataAsync : false
			}),
			oMetaModel = oModel.getMetaModel();

		strictEqual(oMetaModel.getProperty("/dataServices/schema/0/namespace"),
			"GWSAMPLE_BASIC", "meta data available");
		strictEqual(
			oMetaModel.getProperty("/dataServices/schema/0/entityType/0/property/1/sap:label"),
			"Bus. Part. ID", "SAPData is lifted");
		strictEqual(
			oMetaModel.getProperty("/dataServices/schema/0/entityType/0/property/1/"
				+ "com.sap.vocabularies.Common.v1.Label/String"),
			"Bus. Part. ID", "v2 --> v4");
		strictEqual(
			oMetaModel.getProperty("/dataServices/schema/0/entityType/0/"
				+ "com.sap.vocabularies.UI.v1.HeaderInfo/TypeName/String"),
			"Business Partner", "v4 annotations available");

		return oMetaModel.loaded().then(function () {
			strictEqual(arguments.length, 1, "almost no args");
			deepEqual(arguments[0], undefined, "almost no args");
		});
	});

	//*********************************************************************************************
	test("compatibility with asynchronous old ODataModel", function () {
		var oModel = new ODataModel1("/GWSAMPLE_BASIC", {
				annotationURI : "/GWSAMPLE_BASIC/annotations",
				json : true,
				loadMetadataAsync : true
			}),
			oMetaModel = oModel.getMetaModel();

		return oMetaModel.loaded().then(function () {
			strictEqual(arguments.length, 1, "almost no args");
			deepEqual(arguments[0], undefined, "almost no args");

			strictEqual(oMetaModel.getProperty("/dataServices/schema/0/namespace"),
				"GWSAMPLE_BASIC", "meta data available");
			strictEqual(
				oMetaModel.getProperty("/dataServices/schema/0/entityType/0/property/1/sap:label"),
				"Bus. Part. ID", "SAPData is lifted");
			strictEqual(
				oMetaModel.getProperty("/dataServices/schema/0/entityType/0/property/1/"
					+ "com.sap.vocabularies.Common.v1.Label/String"),
				"Bus. Part. ID", "v2 --> v4");
			strictEqual(
				oMetaModel.getProperty("/dataServices/schema/0/entityType/0/"
					+ "com.sap.vocabularies.UI.v1.HeaderInfo/TypeName/String"),
				"Business Partner", "v4 annotations available");
		});
	});

	//*********************************************************************************************
	test("compatibility with asynchronous old ODataModel: use after load", function (assert) {
		var iCount = 0,
			fnDone = assert.async(),
			oModel = new ODataModel1("/GWSAMPLE_BASIC", {
				annotationURI : "/GWSAMPLE_BASIC/annotations",
				json : true,
				loadMetadataAsync : true
			}),
			oMetaModel;

		function loaded() {
			iCount += 1;
			if (iCount === 2) {
				// ...then get meta model and use immediately
				oMetaModel = oModel.getMetaModel();

				try {
					strictEqual(oMetaModel.getProperty("/dataServices/schema/0/namespace"),
						"GWSAMPLE_BASIC", "meta data available");
					strictEqual(
						oMetaModel.getProperty("/dataServices/schema/0/entityType/0/property/1/"
							+ "sap:label"),
						"Bus. Part. ID", "SAPData is lifted");
					strictEqual(
						oMetaModel.getProperty("/dataServices/schema/0/entityType/0/property/1/"
							+ "com.sap.vocabularies.Common.v1.Label/String"),
						"Bus. Part. ID", "v2 --> v4");
					strictEqual(
						oMetaModel.getProperty("/dataServices/schema/0/entityType/0/"
							+ "com.sap.vocabularies.UI.v1.HeaderInfo/TypeName/String"),
						"Business Partner", "v4 annotations available");
				} catch (ex) {
					ok(false, ex);
				}

				fnDone();
			}
		}

		// wait for metadata and annotations to be loaded (but not via oMetaModel.loaded())...
		oModel.attachAnnotationsLoaded(loaded);
		oModel.attachMetadataLoaded(loaded);
	});

	//*********************************************************************************************
	test("compatibility with old ODataModel: separate value list load", function () {
		var oModel = new ODataModel1("/FAR_CUSTOMER_LINE_ITEMS", {
				json : true,
				loadMetadataAsync : false
			}),
			oMetaModel = oModel.getMetaModel(),
			oEntityType = oMetaModel.getODataEntityType("FAR_CUSTOMER_LINE_ITEMS.Item"),
			oProperty = oMetaModel.getODataProperty(oEntityType, "Customer"),
			oContext = oMetaModel.getMetaContext("/Items('foo')/Customer");

		return oMetaModel.getODataValueLists(oContext).then(function (mValueLists) {
			deepEqual(mValueLists, {
				"" : oProperty["com.sap.vocabularies.Common.v1.ValueList"],
				"DEBID" : oProperty["com.sap.vocabularies.Common.v1.ValueList#DEBID"]
			});

			// check robustness: no error even if interface is missing
			oMetaModel = new ODataMetaModel(oMetaModel.oMetadata);
			return oMetaModel.getODataValueLists(oContext);
		});
	});

	//*********************************************************************************************
	test("functions using 'this.oModel' directly", function () {
		var oModel = new ODataModel("/GWSAMPLE_BASIC", {
				annotationURI : "/GWSAMPLE_BASIC/annotations",
				json : true,
				loadMetadataAsync : true
			}),
			oMetaModel = oModel.getMetaModel();

		ok(oMetaModel instanceof ODataMetaModel);
		strictEqual(typeof oMetaModel.oODataModelInterface.addAnnotationUrl, "function",
			"function addAnnotationUrl");

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
	});

	//*********************************************************************************************
	test("basics", function () {
		var oMetaModel = new ODataMetaModel({
				getServiceMetadata : function () { return {dataServices : {}}; }
			});

		return oMetaModel.loaded().then(function () {
			var oMetaModelMock = oGlobalSandbox.mock(oMetaModel),
				oModelMock = oGlobalSandbox.mock(oMetaModel.oModel),
				oResult = {};

			strictEqual(arguments.length, 1, "almost no args");
			deepEqual(arguments[0], undefined, "almost no args");

			oGlobalSandbox.mock(Model.prototype).expects("destroy");
			// do not mock/stub this or else "destroy" will not bubble up!
			oGlobalSandbox.spy(MetaModel.prototype, "destroy");

			// generic dispatching
			["destroy", "isList"].forEach(function (sName) {
				oModelMock.expects(sName).withExactArgs("foo", 0, false).returns(oResult);

				strictEqual(oMetaModel[sName]("foo", 0, false), oResult, sName);
			});

			// getProperty dispatches to _getObject
			oMetaModelMock.expects("_getObject").withExactArgs("foo", 0, false)
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
		});
	});

	//*********************************************************************************************
	test("bindings", function () {
		return withMetaModel(function (oMetaModel) {
			var oBinding,
				oContext = oMetaModel.createBindingContext("/dataServices"),
				aFilters = [],
				mParameters = {},
				sPath = "schema/0/foo",
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
		return withMetaModel(function (oMetaModel) {
			var fnApply = oGlobalSandbox.mock(FilterProcessor).expects("apply"),
				oBinding,
				oContext = oMetaModel.createBindingContext("/"),
				aFilters = [],
				fnGetValue,
				aIndices = ["schema"],
				mParameters = {},
				sPath = "dataServices",
				aSorters = [];

			fnApply.withArgs(["dataServiceVersion", "schema"], aFilters).returns(aIndices);

			// code under test
			oBinding = oMetaModel.bindList(sPath, oContext, aSorters, aFilters, mParameters);
			// implicitly calls oBinding.applyFilter()

			strictEqual(oBinding.aIndices, aIndices);
			strictEqual(oBinding.iLength, oBinding.aIndices.length);

			fnGetValue = fnApply.args[0][2];
			oGlobalSandbox.mock(oMetaModel).expects("getProperty")
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
		test("_getObject: queries instead of indexes, log = " + bIsLoggable, function () {
			var oLogMock = oGlobalSandbox.mock(jQuery.sap.log);

			jQuery.sap.log.setLevel(bIsLoggable
				? jQuery.sap.log.Level.WARNING
				: jQuery.sap.log.Level.ERROR);

			oLogMock.expects("error")
				.withExactArgs("A query is not allowed when an object context has been given",
					"entityType/[$\{name}==='BusinessPartner']",
					"sap.ui.model.odata.ODataMetaModel");
			oLogMock.expects("error")
				.withExactArgs("Invalid query: '/dataServices/' does not point to an array",
					"/dataServices/[${namespace}==='GWSAMPLE_BASIC']",
					"sap.ui.model.odata.ODataMetaModel");
			oLogMock.expects("error")
				.withExactArgs("no closing braces found in '[${namespace==='GWSAMPLE_BASIC']/"
					+ "entityType' after pos:2", undefined, "sap.ui.base.ExpressionParser");
			oLogMock.expects("warning").never();

			return withMetaModel(function (oMetaModel) {
				[{
					i: "/dataServices/schema/[${namespace}==='GWSAMPLE_BASIC']",
					o: "/dataServices/schema/0"
				}, { // syntax error (missing closing ']')
					i: "/dataServices/schema/[${namespace}==='GWSAMPLE_BASIC'",
					o: undefined
				}, { // syntax error (text after closing ']')
					i: "/dataServices/schema/[${namespace}==='GWSAMPLE_BASIC']a",
					o: undefined
				}, { // syntax error (text after closing ']')
					i: "/dataServices/schema/[${namespace}==='GWSAMPLE_BASIC']a/entityType/1",
					o: undefined,
					m: "Invalid part: entityType"
				}, { // query when we just landed in Nirvana
					i: "/dataServices/unknown/[${namespace}==='GWSAMPLE_BASIC']",
					o: undefined,
					m: "Invalid part: [${namespace}==='GWSAMPLE_BASIC']"
				}, {
					i: "/dataServices/schema/[${namespace}==='GWSAMPLE_BASIC']/entityType/"
						+ "[$\{name}==='Product']",
					o: "/dataServices/schema/0/entityType/1",
					c: {} // unnecessary context object (because of absolute path) silently ignored
				}, { // ensure we don't fail after a 'namespace' query that didn't find a result
					i: "/dataServices/schema/[${namespace}==='unknown']/entityType/"
						+ "[$\{name}==='Product']",
					o: undefined,
					m: "Invalid part: entityType"
				}, { // ensure we don't fail after a 'name' query that didn't find a result
					i: "/dataServices/schema/[${namespace}==='GWSAMPLE_BASIC']/entityType/"
						+ "[$\{name}==='unknown']/property/[$\{name=}'foo']",
					o: undefined,
					m: "Invalid part: property"
				}, {
					i: "/dataServices/schema/[${namespace}==='GWSAMPLE_BASIC']/entityType/"
						+ "[$\{name}==='BusinessPartner']/com.sap.vocabularies.UI.v1.LineItem/"
						+ "[${Value/Path}==='BusinessPartnerID']/Label/String",
					o: "/dataServices/schema/0/entityType/0/com.sap.vocabularies.UI.v1.LineItem/0"
						+ "/Label/String"
				}, {
					i: "entityType/[$\{name}==='Product']",
					o: "/dataServices/schema/0/entityType/1",
					c: oMetaModel.getContext(
						"/dataServices/schema/[${namespace}==='GWSAMPLE_BASIC']")
				}, { // query, but context is an object
					i: "entityType/[$\{name}==='BusinessPartner']",
					o: null,
					c: oMetaModel.getObject(
						"/dataServices/schema/[${namespace}==='GWSAMPLE_BASIC']")
				}, { // query on non-array
					i: "/dataServices/[${namespace}==='GWSAMPLE_BASIC']",
					o: null,
				}, { // stupid query with [], but returning true
					i: "/dataServices/schema/['GWSAMPLE_BASIC/foo'.split('/')[0]===${namespace}]"
						+ "/entityType",
					o: "/dataServices/schema/0/entityType",
				}, { // syntax error in query
					i: "/dataServices/schema/[${namespace==='GWSAMPLE_BASIC']/entityType",
					o: undefined,
					m: "Invalid part: entityType"
				}, { // search for the first property having a maxLength
					i: "/dataServices/schema/0/entityType/0/property/[${maxLength}]",
					o: "/dataServices/schema/0/entityType/0/property/1",
				}].forEach(function (oFixture) {
					if (oFixture.m) {
						oLogMock.expects("warning")
							// do not construct arguments in vain!
							.exactly(bIsLoggable ? 1 : 0)
							.withExactArgs(oFixture.m, "path: " + oFixture.i
								+ ", context: undefined", "sap.ui.model.odata.ODataMetaModel");
					}
					strictEqual(oMetaModel._getObject(oFixture.i, oFixture.c), oFixture.o
						? oMetaModel.oModel.getObject(oFixture.o)
						: oFixture.o, oFixture.i);
				});
			});
		});
	});

	//*********************************************************************************************
	test("_getObject: some error in parseExpression (not SyntaxError)", function () {
		var oError = new Error();

		oGlobalSandbox.mock(BindingParser).expects("parseExpression").throws(oError);

		return withMetaModel(function (oMetaModel) {
			throws(function () {
				oMetaModel.getObject("/dataServices/schema/[${namespace}==='GWSAMPLE_BASIC']");
			}, oError);
		});
	});

	//*********************************************************************************************
	test("_getObject: caching queries", function () {
		return withMetaModel(function (oMetaModel) {
			var sPath = "/dataServices/schema/[${namespace}==='GWSAMPLE_BASIC']/entityType/"
					+ "[$\{name}==='Product']",
				oResult = oMetaModel._getObject(sPath);

			oGlobalSandbox.mock(oMetaModel.oResolver).expects("bindProperty").never();

			strictEqual(oMetaModel._getObject(sPath), oResult);
		});
	});

	//*********************************************************************************************
	[false, true].forEach(function (bIsLoggable) {
		test("_getObject: warning w/o context, log = " + bIsLoggable, function () {
			var oLogMock = oGlobalSandbox.mock(jQuery.sap.log);

			oLogMock.expects("isLoggable")
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

			oLogMock.expects("isLoggable")
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

			oLogMock.expects("isLoggable")
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
		oGlobalSandbox.mock(jQuery.sap.log).expects("error").withExactArgs(
			"Invalid relative path w/o context",
			"some/relative/path",
			"sap.ui.model.odata.ODataMetaModel");

		return withMetaModel(function (oMetaModel) {
			strictEqual(oMetaModel._getObject("some/relative/path"), null);
		});
	});

	//*********************************************************************************************
	test("/dataServices/schema/<i>/annotations dropped", function () {
		return withGivenService("/fake/emptySchemaWithAnnotations", "", function (oMetaModel) {
			return oMetaModel.loaded().then(function () {
				strictEqual(oMetaModel.getObject("/dataServices/schema/0/annotations"), undefined);
			});
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
			return withGivenService("/fake/service", oFixture.annotationURI, function (oMetaModel,
				oModel) {
				var oMetadata = oModel.getServiceMetadata(),
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
					sPrefix,
					oProduct = oGWSampleBasic.entityType[2],
					oProductCurrencyCode =  oProduct.property[4],
					oProductPrice = oProduct.property[0],
					oProductSet = oEntityContainer.entitySet[1],
					oProductWeightMeasure =  oProduct.property[2],
					oProductWeightUnit =  oProduct.property[3],
					sSAPData = "http://www.sap.com/Protocols/SAPData",
					oVHSex = oGWSampleBasic.entityType[1],
					oVHSexSet = oEntityContainer.entitySet[2];

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

				ok(oMetadata, "metadata is loaded");

				strictEqual(oBusinessPartner.namespace, "GWSAMPLE_BASIC");
				delete oBusinessPartner.namespace;
				strictEqual(oBusinessPartner.$path, "/dataServices/schema/0/entityType/0");
				delete oBusinessPartner.$path;
				strictEqual(oVHSex.namespace, "GWSAMPLE_BASIC");
				delete oVHSex.namespace;
				strictEqual(oVHSex.$path, "/dataServices/schema/0/entityType/1");
				delete oVHSex.$path;
				strictEqual(oProduct.namespace, "GWSAMPLE_BASIC");
				delete oProduct.namespace;
				strictEqual(oProduct.$path, "/dataServices/schema/0/entityType/2");
				delete oProduct.$path;
				strictEqual(oContact.namespace, "GWSAMPLE_BASIC");
				delete oContact.namespace;
				strictEqual(oContact.$path, "/dataServices/schema/0/entityType/3");
				delete oContact.$path;

				strictEqual(oGWSampleBasic.$path, "/dataServices/schema/0");
				delete oGWSampleBasic.$path;
				deepEqual(oGWSampleBasic["sap:schema-version"], "0000");
				delete oGWSampleBasic["sap:schema-version"];

				deepEqual(oBusinessPartner["sap:content-version"], "1");
				delete oBusinessPartner["sap:content-version"];

				strictEqual(oCTAddress.namespace, "GWSAMPLE_BASIC");
				delete oCTAddress.namespace;
				strictEqual(oCTAddress.$path, "/dataServices/schema/0/complexType/0", "$path");
				delete oCTAddress.$path;

				deepEqual(oAssociation["sap:content-version"], "1");
				delete oAssociation["sap:content-version"];

				strictEqual(oAssociation.namespace, "GWSAMPLE_BASIC");
				delete oAssociation.namespace;
				strictEqual(oAssociation.$path, "/dataServices/schema/0/association/0");
				delete oAssociation.$path;

				deepEqual(oAssociationSet["sap:creatable"], "false");
				delete oAssociationSet["sap:creatable"];

				deepEqual(oBusinessPartnerSet["sap:content-version"], "1");
				delete oBusinessPartnerSet["sap:content-version"];

				deepEqual(oEntityContainer["sap:use-batch"], "false");
				delete oEntityContainer["sap:use-batch"];

				strictEqual(oEntityContainer.namespace, "GWSAMPLE_BASIC");
				delete oEntityContainer.namespace;
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

				// sap:deletable-path (EntitySet)
				deepEqual(oBusinessPartnerSet["sap:deletable-path"], "Deletable");
				delete oBusinessPartnerSet["sap:deletable-path"];
				deepEqual(oBusinessPartnerSet["Org.OData.Core.V1.DeleteRestrictions"],
					{ "Deletable" : { "Path" :
						( i === 0 ? "Deletable" : "DeletableFromAnnotation") }}, "deletable-path");
				delete oBusinessPartnerSet["Org.OData.Core.V1.DeleteRestrictions"];

				// sap:updatable-path (EntitySet)
				deepEqual(oBusinessPartnerSet["sap:updatable-path"], "Updatable");
				delete oBusinessPartnerSet["sap:updatable-path"];
				deepEqual(oBusinessPartnerSet["Org.OData.Core.V1.UpdateRestrictions"],
					{ "Updatable" : { "Path" :
						( i === 0 ? "Updatable" : "UpdatableFromAnnotation") }}, "updatable-path");
				delete oBusinessPartnerSet["Org.OData.Core.V1.UpdateRestrictions"];

				// sap:filter-restriction (Property)
				deepEqual(oBusinessPartnerId["sap:filter-restriction"], "multi-value");
				delete oBusinessPartnerId["sap:filter-restriction"];
				deepEqual(oProductPrice["sap:filter-restriction"], "interval");
				delete oProductPrice["sap:filter-restriction"];
				deepEqual(oProductCurrencyCode["sap:filter-restriction"], "single-value");
				delete oProductCurrencyCode["sap:filter-restriction"];

				sPrefix = "com.sap.vocabularies.Common.v1.";
				deepEqual(oBusinessPartnerSet[sPrefix + "FilterExpressionRestrictions"], [{
						"Property" : { "PropertyPath" : "BusinessPartnerID" },
						"AllowedExpressions" : {
							"EnumMember" : sPrefix + "FilterExpressionType/MultiValue"
						}
					}], "filter-restriction at BusinessPartnerSet");
				delete oBusinessPartnerSet[sPrefix + "FilterExpressionRestrictions"];
				deepEqual(oProductSet[sPrefix + "FilterExpressionRestrictions"], (i === 0 ? [{
						"Property" : { "PropertyPath" : "Price" },
						"AllowedExpressions" : {
							"EnumMember" : sPrefix + "FilterExpressionType/SingleInterval"
						}
					}, {
						"Property" : { "PropertyPath" : "CurrencyCode" },
						"AllowedExpressions" : {
							"EnumMember" : sPrefix + "FilterExpressionType/SingleValue"
						}
					}] : [{
						"Property" : { "PropertyPath" : "CurrencyCode" },
						"AllowedExpressions" : {
							"EnumMember" : sPrefix + "FilterExpressionType/MultiValue"
						}
					}]), "filter-restriction at ProductSet");
				delete oProductSet[sPrefix + "FilterExpressionRestrictions"];

				deepEqual(oMetaModelData, oMetadata, "nothing else left...");
				notStrictEqual(oMetaModelData, oMetadata, "is clone");
			});
		});
	});

	//*********************************************************************************************
	// Note: http://www.html5rocks.com/en/tutorials/es6/promises/ says that
	// "Any errors thrown in the constructor callback will be implicitly passed to reject()."
	// We make sure the same happens even with our asynchronous constructor.
	[false, true].forEach(function (bAsync) {
		test("Errors thrown inside load(), async = " + bAsync, function () {
			var oError = new Error("This call failed intentionally"),
				oModel = new (bAsync ? ODataModel : ODataModel1)("/fake/service", {
					annotationURI : "",
					json : true,
					loadMetadataAsync : bAsync
				});

			// Note: this is just a placeholder for "anything which could go wrong inside load()"
			oGlobalSandbox.stub(Model.prototype, "setDefaultBindingMode").throws(oError);

			// code under test
			return oModel.getMetaModel().loaded().then(function () {
				throw new Error("Unexpected success");
			}, function (ex) {
				strictEqual(ex, oError, ex.message);
			});
		});
	});

	//*********************************************************************************************
	["annotations", "emptyAnnotations"].forEach(function (sAnnotation) {
		["emptyMetadata", "emptyDataServices", "emptySchema", "emptyEntityType"].forEach(

			function (sPath) {
				test("check that no errors happen for empty/missing structures:"
						+ sAnnotation + ", " + sPath, function () {
					var oMetaModel, oModel;

					oModel = new ODataModel("/fake/" + sPath, {
						// annotations are mandatory for this test case
						annotationURI : "/fake/" + sAnnotation,
						json : true
					});

					// code under test
					oMetaModel = oModel.getMetaModel();

					return oMetaModel.loaded().then(function () {
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

	//*********************************************************************************************
	test("getODataValueLists: Metadata loaded completely, ValueList w/o qualifier", function () {
		return withMetaModel(function (oMetaModel) {
			var oContext = oMetaModel.getMetaContext("/ProductSet(foo)/Category"),
				oEntityType = oMetaModel.getODataEntityType("GWSAMPLE_BASIC.Product"),
				oInterface = oMetaModel.oODataModelInterface,
				oPromise,
				oProperty = oMetaModel.getODataProperty(oEntityType, "Category");

			oGlobalSandbox.stub(oInterface, "addAnnotationUrl", function () {
				return Promise.reject(new Error("Unexpected call to addAnnotationUrl"));
			});

			oPromise = oMetaModel.getODataValueLists(oContext);

			strictEqual(oInterface.addAnnotationUrl.callCount, 0,
				"no separate load of value list");
			oPromise.then(function (mValueLists) {
				deepEqual(mValueLists,
					{"" : oProperty["com.sap.vocabularies.Common.v1.ValueList"]});
			});
			return oPromise;
		});
	});

	//*********************************************************************************************
	test("getODataValueLists: Metadata loaded completely, no ValueList", function () {
		return withMetaModel(function (oMetaModel) {
			var oContext = oMetaModel.getMetaContext("/ProductSet(foo)/TypeCode"),
				oPromise = oMetaModel.getODataValueLists(oContext);

			oPromise.then(function (mValueLists) {
				deepEqual(mValueLists, {});
			});
			return oPromise;
		});
	});

	//*********************************************************************************************
	test("getODataValueLists: Metadata loaded completely, multiple ValueLists", function () {
		return withGivenAnnotations(["/GWSAMPLE_BASIC/annotations", "/fake/multipleValueLists"],
			function (oMetaModel) {
				var oContext = oMetaModel.getMetaContext("/ProductSet(foo)/WeightUnit"),
					oEntityType = oMetaModel.getODataEntityType("GWSAMPLE_BASIC.Product"),
					oPromise = oMetaModel.getODataValueLists(oContext),
					oProperty = oMetaModel.getODataProperty(oEntityType, "WeightUnit");

				oPromise.then(function (mValueLists) {
					deepEqual(mValueLists, {
						"" : oProperty["com.sap.vocabularies.Common.v1.ValueList"],
						"FOO" : oProperty["com.sap.vocabularies.Common.v1.ValueList#FOO"]
					});
				});
				return oPromise;
			}
		);
	});

	//*********************************************************************************************
	test("getODataValueLists: Metadata loaded w/o annot., separate value list load", function () {
		return withGivenService("/FAR_CUSTOMER_LINE_ITEMS", null, function (oMetaModel) {
			var oContext = oMetaModel.getMetaContext("/Items('foo')/Customer"),
				oContextNoValueList = oMetaModel.getMetaContext("/Items('foo')/GeneratedID"),
				oEntityType = oMetaModel.getODataEntityType("FAR_CUSTOMER_LINE_ITEMS.Item"),
				oExpectedVL = { //value list with no qualifier
					"CollectionPath" : {"String":"VL_SH_DEBIA"},
					"Parameters" :[{
						"LocalDataProperty" : {"PropertyPath":"Customer"},
						"ValueListProperty" : {"String":"KUNNR"},
						"RecordType":"com.sap.vocabularies.Common.v1.ValueListParameterInOut"
					}]
				},
				oExpectedVL_DEBID = { //value list for qualifier DEBID
					"CollectionPath" : {"String": "VL_SH_DEBID"},
					"Parameters" : [{
						"LocalDataProperty" : {"PropertyPath": "CompanyCode"},
						"ValueListProperty" : {"String": "BUKRS"},
						"RecordType" : "com.sap.vocabularies.Common.v1.ValueListParameterInOut"
					}]
				},
				oInterface = oMetaModel.oODataModelInterface,
				oPromise;

			oGlobalSandbox.spy(oInterface, "addAnnotationUrl");

			// no sap:value-list => no request
			oMetaModel.getODataValueLists(oContextNoValueList);
			strictEqual(oInterface.addAnnotationUrl.callCount, 0);

			// separate value list load
			oPromise = oMetaModel.getODataValueLists(oContext);
			strictEqual(oMetaModel.getODataValueLists(oContext), oPromise, "promise is cached");
			return oPromise.then(function (mValueLists) {
				deepEqual(mValueLists, {
					"" : oExpectedVL,
					"DEBID" : oExpectedVL_DEBID
				});

				strictEqual(oInterface.addAnnotationUrl.callCount, 1, "addAnnotationUrl once");
				ok(oInterface.addAnnotationUrl.calledWithExactly(
					"$metadata?sap-value-list=FAR_CUSTOMER_LINE_ITEMS.Item%2FCustomer"),
					"addAnnotationUrl arguments");

				notStrictEqual(oMetaModel.getODataValueLists(oContext), oPromise,
					"resolved promises deleted from cache");
			});
		});
	});

	//*********************************************************************************************
	test("getODataValueLists: addAnnotationUrl rejects", function () {
		return withGivenService("/FAR_CUSTOMER_LINE_ITEMS", null, function (oMetaModel) {
			var oContext = oMetaModel.getMetaContext("/Items('foo')/Customer"),
				oInterface = oMetaModel.oODataModelInterface,
				oMyError = new Error(),
				oPromise;

			oGlobalSandbox.stub(oInterface, "addAnnotationUrl", function () {
				return Promise.reject(oMyError);
			});

			oPromise = oMetaModel.getODataValueLists(oContext);
			return oPromise.then(function () {
				throw new Error("Unexpected success");
			}, function (oError) {
				strictEqual(oError, oMyError, "error propagated");
				strictEqual(oMetaModel.getODataValueLists(oContext), oPromise,
					"rejected promises are cached");
			});
		});
	});

	//*********************************************************************************************
	["/Items('foo')/Invalid", "/Foos('foo')/Invalid"].forEach(function (sPath) {
		test("getODataValueLists: reject invalid response for " + sPath, function () {
			return withGivenService("/FAR_CUSTOMER_LINE_ITEMS", null, function (oMetaModel) {
				var oContext = oMetaModel.getMetaContext(sPath);

				return oMetaModel.getODataValueLists(oContext).then(function () {
					throw new Error("Unexpected success");
				}, function (oError) {
					strictEqual(oError.message,
						"No value lists returned for " + oContext.getPath());
				});
			});
		});
	});

	//*********************************************************************************************
	test("getODataValueLists: reject unsupported path", function () {
		return withGivenService("/FAR_CUSTOMER_LINE_ITEMS", null, function (oMetaModel) {
			var oContext = oMetaModel.getMetaContext("/Items('foo')");

			raises(function () {
				oMetaModel.getODataValueLists(oContext);
			}, /Unsupported property context with path \/dataServices\/schema\/0\/entityType\/0/);
		});
	});

	//*********************************************************************************************
	test("getODataValueLists: request bundling", function () {
		return withGivenService("/FAR_CUSTOMER_LINE_ITEMS", null, function (oMetaModel) {
			var oCompanyCode = oMetaModel.getMetaContext("/Items('foo')/CompanyCode"),
				oCustomer = oMetaModel.getMetaContext("/Items('foo')/Customer"),
				oInterface = oMetaModel.oODataModelInterface,
				oPromiseCompanyCode,
				oPromiseCustomer;

			oGlobalSandbox.spy(oInterface, "addAnnotationUrl");

			// Note: "wrong" alphabetic order of calls to check that property names will be sorted!
			oPromiseCustomer = oMetaModel.getODataValueLists(oCustomer);
			oPromiseCompanyCode = oMetaModel.getODataValueLists(oCompanyCode);

			// check caching of pending requests
			strictEqual(oMetaModel.getODataValueLists(oCompanyCode), oPromiseCompanyCode);
			strictEqual(oMetaModel.getODataValueLists(oCustomer), oPromiseCustomer);

			return Promise.all([oPromiseCustomer, oPromiseCompanyCode]).then(function () {
				// check bundling
				strictEqual(oInterface.addAnnotationUrl.callCount, 1, "addAnnotationUrl once");
				strictEqual(oInterface.addAnnotationUrl.args[0][0],
					"$metadata?sap-value-list=FAR_CUSTOMER_LINE_ITEMS.Item%2FCompanyCode" +
					",FAR_CUSTOMER_LINE_ITEMS.Item%2FCustomer",
					oInterface.addAnnotationUrl.printf("addAnnotationUrl calls: %C"));
			});
		});
	});
	// Note: there is no need to avoid setTimeout() calls because the handler is so cheap
	//TODO is there no need to clear timeouts in destroy()? is it better to resolve the promises?
	// Note: different cache keys (property path vs. qualified property name) should be OK
	//TODO call _sendBundledRequest with timeout > 0 to allow more API calls to "get on the bus"?
	// --> use a single timeout in this case and clear the old one every time a new API call comes,
	//     i.e. "bus leaves" only after some idle time!

	//*********************************************************************************************
	test("_sendBundledRequest", function () {
		return withGivenService("/FAR_CUSTOMER_LINE_ITEMS", null, function (oMetaModel) {
			var oError = new Error(),
				fnBarReject = sinon.spy(),
				fnBarResolve = sinon.stub().throws(oError),
				fnFooResolve = sinon.spy(),
				oInterface = oMetaModel.oODataModelInterface,
				oPromise,
				oResponse = {
					annotations : {},
					entitySets : []
				};

			oGlobalSandbox.stub(oInterface, "addAnnotationUrl")
				.returns(new Promise(function (fnResolve, fnReject) {
					fnResolve(oResponse);
				}));

			oMetaModel.mQName2PendingRequest = {
				"BAR" : {
					resolve : fnBarResolve,
					reject : fnBarReject
				},
				"FOO" : {
					resolve : fnFooResolve,
					reject : function (oError) {
						ok(false, oError);
					}
				}
			};

			oMetaModel._sendBundledRequest();

			// check bundling
			strictEqual(oInterface.addAnnotationUrl.callCount, 1, "addAnnotationUrl once");
			strictEqual(oInterface.addAnnotationUrl.args[0][0],
				"$metadata?sap-value-list=BAR,FOO",
				oInterface.addAnnotationUrl.printf("addAnnotationUrl calls: %C"));
			deepEqual(Object.keys(oMetaModel.mQName2PendingRequest), [], "nothing pending");

			oPromise = oInterface.addAnnotationUrl.returnValues[0];
			return oPromise.then(function (oResponse0) {
				strictEqual(oResponse0, oResponse);
				// technical test: oResponse is delivered to all pending requests, regardless of
				// errors thrown
				ok(fnBarResolve.calledWithExactly(oResponse), fnBarResolve.printf("%C"));
				ok(fnFooResolve.calledWithExactly(oResponse), fnFooResolve.printf("%C"));
				// if "resolve" handler throws, "reject" handler is called
				ok(fnBarReject.calledWithExactly(oError), fnBarReject.printf("%C"));
			});
		});
	});
	// Note: rejecting a promise in _sendBundledRequest() cannot realistically throw errors

	//*********************************************************************************************
	test("getODataValueLists: Merge metadata with separate value list load", function () {
		return withGivenService("/FAR_CUSTOMER_LINE_ITEMS", null, function (oMetaModel) {
			var oContext = oMetaModel.getMetaContext("/Items('foo')/Customer"),
				oItemSetLabel = oMetaModel.getODataEntitySet("Items")
					["com.sap.vocabularies.Common.v1.Label"],
				oItemTypeLabel = oMetaModel.getODataEntityType("FAR_CUSTOMER_LINE_ITEMS.Item")
					["com.sap.vocabularies.Common.v1.Label"];

			ok(!oMetaModel.getODataEntitySet("VL_SH_DEBIA"));
			ok(!oMetaModel.getODataEntitySet("VL_SH_DEBID"));
			ok(!oMetaModel.getODataEntityType("FAR_CUSTOMER_LINE_ITEMS.VL_SH_DEBIA"));
			ok(!oMetaModel.getODataEntityType("FAR_CUSTOMER_LINE_ITEMS.VL_SH_DEBID"));

			return oMetaModel.getODataValueLists(oContext).then(function (mValueLists) {
				var oODataMetadataSchema
						= oMetaModel.oMetadata.getServiceMetadata().dataServices.schema[0],
					oSet_DEBIA = oODataMetadataSchema.entityContainer[0].entitySet[2],
					oSet_DEBID = oODataMetadataSchema.entityContainer[0].entitySet[3],
					oType_DEBIA = oODataMetadataSchema.entityType[2],
					oType_DEBID = oODataMetadataSchema.entityType[3],
					oClonedSet_DEBIA = oMetaModel.getODataEntitySet("VL_SH_DEBIA"),
					oClonedSet_DEBID = oMetaModel.getODataEntitySet("VL_SH_DEBID"),
					oClonedType_DEBIA = oMetaModel.getODataEntityType(
						"FAR_CUSTOMER_LINE_ITEMS.VL_SH_DEBIA"),
					oClonedType_DEBID = oMetaModel.getODataEntityType(
						"FAR_CUSTOMER_LINE_ITEMS.VL_SH_DEBID");

				TestUtils.deepContains(oClonedSet_DEBIA, oSet_DEBIA);
				notStrictEqual(oClonedSet_DEBIA, oSet_DEBIA);
				TestUtils.deepContains(oClonedSet_DEBID, oSet_DEBID);
				notStrictEqual(oClonedSet_DEBID, oSet_DEBID);

				TestUtils.deepContains(oClonedType_DEBIA, oType_DEBIA);
				notStrictEqual(oClonedType_DEBIA, oType_DEBIA);
				TestUtils.deepContains(oClonedType_DEBID, oType_DEBID);
				notStrictEqual(oClonedType_DEBID, oType_DEBID);

				strictEqual(
					oMetaModel.getODataEntitySet("Items")["com.sap.vocabularies.Common.v1.Label"],
					oItemSetLabel,
					"existing sets remain unchanged, as reference");
				strictEqual(
					oMetaModel.getODataEntityType("FAR_CUSTOMER_LINE_ITEMS.Item")
						["com.sap.vocabularies.Common.v1.Label"],
					oItemTypeLabel,
					"existing types remain unchanged, as reference");

				// check that v4 annotations are properly merged and that v2 ones are lifted etc.
				strictEqual(
					oClonedType_DEBIA.property[2/*LAND1*/]
						["com.sap.vocabularies.Common.v1.ValueList"].CollectionPath.String,
					"VL_SH_FARP_T005");
				strictEqual(oClonedType_DEBIA.property[2/*LAND1*/]["sap:label"], "Country");
				strictEqual(
					oClonedType_DEBIA.property[2/*LAND1*/]
						["com.sap.vocabularies.Common.v1.Label"].String,
					"Country");

				strictEqual(oClonedSet_DEBIA["sap:creatable"], "false");
				strictEqual(oClonedSet_DEBIA["sap:deletable"], "false");
				deepEqual(
					oClonedSet_DEBIA["Org.OData.Capabilities.V1.InsertRestrictions"],
					{Insertable : {Bool : "false"}}, "v2 --> v4");
				deepEqual(
					oClonedSet_DEBIA["Org.OData.Capabilities.V1.DeleteRestrictions"],
					{Deletable : {Bool : "true"}}, "v4 wins");
			});
		});
	});

	//*********************************************************************************************
	test("getODataValueLists: Merge metadata with existing entity set", function () {
		return withGivenService("/FAR_CUSTOMER_LINE_ITEMS", null, function (oMetaModel) {
			var oContext = oMetaModel.getMetaContext("/Items('foo')/CompanyCode"),
				aEntitySet = oMetaModel.getObject(
					"/dataServices/schema/0/entityContainer/0/entitySet"),
				iOriginalLength;

			// preparation: add dummy entity set with same name
			aEntitySet.push({name : "VL_SH_H_T001"});
			iOriginalLength = aEntitySet.length;

			return oMetaModel.getODataValueLists(oContext).then(function (mValueLists) {
				strictEqual(aEntitySet.length, iOriginalLength, "set not added twice");
			});
		});
	});

	//*********************************************************************************************
	test("getODataValueLists: Merge metadata with existing entity type", function () {
		return withGivenService("/FAR_CUSTOMER_LINE_ITEMS", null, function (oMetaModel) {
			var oContext = oMetaModel.getMetaContext("/Items('foo')/CompanyCode"),
				aEntityType = oMetaModel.getObject("/dataServices/schema/0/entityType"),
				iOriginalLength;

			// preparation: add dummy entity type with same name
			aEntityType.push({name : "VL_SH_H_T001"});
			iOriginalLength = aEntityType.length;

			return oMetaModel.getODataValueLists(oContext).then(function (mValueLists) {
				strictEqual(aEntityType.length, iOriginalLength, "type not added twice");
				ok(oMetaModel.getODataEntitySet("VL_SH_H_T001"), "set is added");
			});
		});
	});

	//*********************************************************************************************
	test("getODataValueLists: ValueList on ComplexType", function () {
		return withGivenService("/FAR_CUSTOMER_LINE_ITEMS", null, function (oMetaModel) {
			var oContext = oMetaModel.getMetaContext("/Items('foo')/Complex/Customer"),
				oInterface = oMetaModel.oODataModelInterface;

			oGlobalSandbox.spy(oInterface, "addAnnotationUrl");

			return oMetaModel.getODataValueLists(oContext).then(function (mValueLists) {
				deepEqual(mValueLists, {
					"" : {
						"CollectionPath" : {"String":"VL_SH_DEBIA"},
						"Parameters" :[{
							"LocalDataProperty" : {"PropertyPath":"Customer"},
							"ValueListProperty" : {"String":"KUNNR"},
							"RecordType":"com.sap.vocabularies.Common.v1.ValueListParameterInOut"
						}]
					}
				});

				ok(oInterface.addAnnotationUrl.calledWithExactly(
					"$metadata?sap-value-list=FAR_CUSTOMER_LINE_ITEMS.MyComplexType%2FCustomer"),
					oInterface.addAnnotationUrl.printf("addAnnotationUrl calls: %C"));
			});
		});
	});

	//TODO support getODataValueLists with reference to complex type property via entity type
	//TODO protect against addAnnotationUrl calls from outside ODataMetaModel?

	//TODO our errors do not include sufficient detail for error analysis, e.g. a full path
	//TODO errors and warnings intentionally created should not be logged to console
});
