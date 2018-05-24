/*!
 * ${copyright}
 */
sap.ui.require([
	"sap/ui/base/BindingParser", "sap/ui/model/BindingMode", "sap/ui/model/ClientContextBinding",
	"sap/ui/model/Context", "sap/ui/model/FilterProcessor",
	"sap/ui/model/json/JSONListBinding", "sap/ui/model/json/JSONPropertyBinding",
	"sap/ui/model/json/JSONTreeBinding", "sap/ui/model/Model",
	"sap/ui/model/odata/_ODataMetaModelUtils", "sap/ui/model/odata/ODataMetaModel",
	"sap/ui/model/odata/ODataModel", "sap/ui/model/odata/v2/ODataModel", "sap/ui/test/TestUtils"
], function (BindingParser, BindingMode, ClientContextBinding, Context, FilterProcessor,
	JSONListBinding, JSONPropertyBinding, JSONTreeBinding, Model, Utils, ODataMetaModel,
	ODataModel1, ODataModel, TestUtils) {
	/*global QUnit, sinon */
	/*eslint camelcase: 0, max-nested-callbacks: 0, no-multi-str: 0, no-warning-comments: 0*/
	"use strict";

	//TODO remove this workaround in IE9 for
	// https://github.com/cjohansen/Sinon.JS/commit/e8de34b5ec92b622ef76267a6dce12674fee6a73
	sinon.xhr.supportsCORS = true;

	var sComponent = "sap.ui.model.odata.ODataMetaModel",
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
				<Property Name="BusinessPartnerID" Type="Edm.String" \
					Nullable="false" MaxLength="10" sap:label="Bus. Part. ID" \
					sap:creatable="false" sap:filter-restriction="multi-value" \
					sap:text="AnyProperty" sap:updatable="false" \
					sap:sortable="false" sap:required-in-filter ="true" \
					sap:display-format="UpperCase" >\
				</Property>\
				<Property Name="WebAddress" Type="Edm.String" />\
				<Property Name="AnyProperty" Type="Edm.String" sap:display-format="NonNegative" \
					sap:field-control="UX_FC_READONLY" sap:filterable="false" sap:sortable="false" \
					sap:updatable="false" />\
				<Property Name="NonFilterable" Type="Edm.String" sap:filterable="false" \
					sap:heading="No Filter" sap:quickinfo="No Filtering" />\
				<Property Name="YearMonthDay" Type="Edm.String" sap:semantics="yearmonthday" />\
				<NavigationProperty Name="ToFoo" Relationship="GWSAMPLE_BASIC.Assoc_Foo" \
					FromRole="FromRole_Foo" ToRole="ToRole_Foo" sap:filterable="false"/>\
				<NavigationProperty Name="Corrupt" Relationship="NOT.Found" FromRole="F" \
					ToRole="T"/>\
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
					sap:aggregation-role="measure" sap:unit="WeightUnit" sap:visible="true" />\
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
					sap:deletable-path="Deletable" sap:topable="false"\
					sap:updatable-path="Updatable" sap:requires-filter="true"\
					sap:content-version="1" />\
				<EntitySet Name="ProductSet" EntityType="GWSAMPLE_BASIC.Product" \
					sap:deletable="false" sap:deletable-path="Deletable" sap:searchable="true" \
					sap:updatable-path="Updatable" sap:updatable="true" />\
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
				<FunctionImport Name="NoArgs" ReturnType="GWSAMPLE_BASIC.Product" \
					EntitySet="ProductSet" m:HttpMethod="POST" \
					sap:action-for="GWSAMPLE_BASIC.Product">\
				</FunctionImport>\
				<FunctionImport Name="ReturnsCollection" \
					ReturnType="Collection(GWSAMPLE_BASIC.Product)" \
					EntitySet="ProductSet">\
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
			<Annotations xmlns="http://docs.oasis-open.org/odata/ns/edm"\
					Target="GWSAMPLE_BASIC.BusinessPartner">\
				<Annotation Term="Org.OData.Capabilities.V1.InsertRestrictions">\
						<Record>\
							<PropertyValue xmlns="http://docs.oasis-open.org/odata/ns/edm"\
								xmlns:bar="http://docs.oasis-open.org/odata/ns/bar"\
								Property="AttributeNotation" NavigationPropertyPath="ToFoo"/>\
							<PropertyValue Property="Collection_PropertyPath">\
									<Collection>\
										<PropertyPath\
											xmlns="http://docs.oasis-open.org/odata/ns/edm"\
											>ToFoo</PropertyPath>\
									</Collection>\
							</PropertyValue>\
							<PropertyValue Property="ElementNotation">\
								<NavigationPropertyPath\
									xmlns="http://docs.oasis-open.org/odata/ns/edm"\
									>ToFoo</NavigationPropertyPath>\
							</PropertyValue>\
							<PropertyValue Property="NonInsertableNavigationProperties">\
									<Collection>\
										<NavigationPropertyPath\
											xmlns="http://docs.oasis-open.org/odata/ns/edm"\
											>ToFoo</NavigationPropertyPath>\
									</Collection>\
							</PropertyValue>\
						</Record>\
				</Annotation>\
			</Annotations>\
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
	<Annotation Term="com.sap.vocabularies.Common.v1.Label" \
		String="Label via external annotation: Business Partner" />\
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
	<Annotations Target="GWSAMPLE_BASIC.BusinessPartner/WebAddress">\
		<Annotation Term="Org.OData.Core.V1.IsURL"/>\
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
		<Annotation Term="com.sap.vocabularies.Analytics.v1.Measure" Bool="false"/>\
		<Annotation Term="Org.OData.Measures.V1.Unit" Path="WeightUnit"/>\
	</Annotations>\
	<Annotations Target="GWSAMPLE_BASIC.Product/WeightUnit">\
			<Annotation Term="com.sap.vocabularies.Common.v1.FieldControl" \
				EnumMember="com.sap.vocabularies.Common.v1.FieldControlType/ReadOnly"/>\
			<Annotation Term="com.sap.vocabularies.UI.v1.Hidden" Bool="false"/>\
	</Annotations>\
	<Annotations Target="GWSAMPLE_BASIC.GWSAMPLE_BASIC_Entities/BusinessPartnerSet">\
		<Annotation Term="Org.OData.Capabilities.V1.DeleteRestrictions">\
			<Record>\
				<PropertyValue Property="Deletable" Path="DeletableFromAnnotation"/>\
			</Record>\
		</Annotation>\
		<Annotation Term="Org.OData.Capabilities.V1.UpdateRestrictions">\
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
<Annotations Target="GWSAMPLE_BASIC.BusinessPartner/AnyProperty">\
	<Annotation Term="com.sap.vocabularies.Common.v1.IsDigitSequence"/>\
</Annotations>\
<Annotations Target="GWSAMPLE_BASIC.BusinessPartner/ToFoo">\
	<Annotation Term="acme.Foo.v1.Foo" String="GWSAMPLE_BASIC.BusinessPartner/ToFoo" />\
</Annotations>\
<Annotations Target="GWSAMPLE_BASIC.CT_Address">\
	<Annotation Term="acme.Foo.v1.Foo" String="GWSAMPLE_BASIC.CT_Address" />\
</Annotations>\
<Annotations Target="GWSAMPLE_BASIC.CT_Address/City">\
	<Annotation Term="com.sap.vocabularies.Common.v1.Label" \
		String="GWSAMPLE_BASIC.CT_Address/City" />\
</Annotations>\
<Annotations Target="GWSAMPLE_BASIC.GWSAMPLE_BASIC_Entities">\
	<Annotation Term="acme.Foo.v1.Foo" String="GWSAMPLE_BASIC.GWSAMPLE_BASIC_Entities" />\
</Annotations>\
<Annotations Target="GWSAMPLE_BASIC.GWSAMPLE_BASIC_Entities/Assoc_FooSet">\
	<Annotation Term="acme.Foo.v1.Foo" \
		String="GWSAMPLE_BASIC.GWSAMPLE_BASIC_Entities/Assoc_FooSet" />\
</Annotations>\
<Annotations Target="GWSAMPLE_BASIC.GWSAMPLE_BASIC_Entities/Assoc_FooSet/FromRole_Foo">\
	<Annotation Term="acme.Foo.v1.Foo" \
		String="GWSAMPLE_BASIC.GWSAMPLE_BASIC_Entities/Assoc_FooSet/FromRole_Foo" />\
</Annotations>\
<Annotations Target="GWSAMPLE_BASIC.GWSAMPLE_BASIC_Entities/BusinessPartnerSet">\
	<Annotation Term="acme.Foo.v1.Foo" \
		String="GWSAMPLE_BASIC.GWSAMPLE_BASIC_Entities/BusinessPartnerSet" />\
</Annotations>\
<Annotations Target="GWSAMPLE_BASIC.GWSAMPLE_BASIC_Entities/Foo">\
	<Annotation Term="acme.Foo.v1.Foo" String="GWSAMPLE_BASIC.GWSAMPLE_BASIC_Entities/Foo" />\
</Annotations>\
<Annotations Target="GWSAMPLE_BASIC.GWSAMPLE_BASIC_Entities/Foo/BusinessPartnerID">\
	<Annotation Term="acme.Foo.v1.Foo" \
		String="GWSAMPLE_BASIC.GWSAMPLE_BASIC_Entities/Foo/BusinessPartnerID" />\
</Annotations>\
</Schema>\
</edmx:DataServices>\
</edmx:Edmx>\
		', sCurrencyCodeViaPath = '\
<?xml version="1.0" encoding="utf-8"?>\
<edmx:Edmx Version="1.0"\
	xmlns:edmx="http://schemas.microsoft.com/ado/2007/06/edmx"\
	xmlns:m="http://schemas.microsoft.com/ado/2007/08/dataservices/metadata"\
	xmlns:sap="http://www.sap.com/Protocols/SAPData">\
	<edmx:DataServices m:DataServiceVersion="2.0">\
		<Schema Namespace="foo.bar" sap:schema-version="1"\
			xmlns="http://schemas.microsoft.com/ado/2008/09/edm">\
			<ComplexType Name="Foo">\
				<Property Name="Price" Type="Edm.Decimal" sap:unit="Currency/Code"/>\
				<Property Name="BadPrice" Type="Edm.Decimal" sap:unit="Code"/>\
				<Property Name="WrongSemantics" Type="Edm.Decimal" sap:unit="Currency/BadCode"/>\
				<Property Name="Currency" Type="foo.bar.Currency"/>\
			</ComplexType>\
			<ComplexType Name="Currency">\
				<Property Name="Code" Type="Edm.String" sap:semantics="currency-code"/>\
				<Property Name="BadCode" Type="Edm.String" sap:semantics="wrongSemantics"/>\
			</ComplexType>\
			<EntityType Name="Product" sap:content-version="1">\
				<Key>\
					<PropertyRef Name="ProductId" />\
				</Key>\
				<Property Name="ProductId" Type="Edm.String" MaxLength="20" />\
				<Property Name="Price" Type="Edm.Decimal" sap:unit="to_Currency/Code" />\
				<NavigationProperty Name="to_Currency"\
					Relationship="foo.bar.ProductCurrency"\
					FromRole="ToRole_ProductCurrency" ToRole="FromRole_ProductCurrency" />\
			</EntityType>\
			<EntityType Name="Currency" sap:content-version="1">\
				<Key>\
					<PropertyRef Name="Id" />\
				</Key>\
				<Property Name="Id" Type="Edm.String" MaxLength="20" />\
				<Property Name="Code" Type="Edm.String" sap:semantics="currency-code" />\
			</EntityType>\
			<Association Name="ProductCurrency" sap:content-version="1">\
				<End Type="foo.bar.Currency" Multiplicity="1"\
					Role="FromRole_ProductCurrency" />\
				<End Type="foo.bar.Product" Multiplicity="*"\
					Role="ToRole_ProductCurrency" />\
				<ReferentialConstraint>\
					<Principal Role="FromRole_ProductCurrency">\
						<PropertyRef Name="CurrencyId" />\
					</Principal>\
					<Dependent Role="ToRole_ProductCurrency">\
						<PropertyRef Name="Id" />\
					</Dependent>\
				</ReferentialConstraint>\
			</Association>\
			<EntityContainer Name="foo.bar_Entities" m:IsDefaultEntityContainer="true"\
				sap:supported-formats="atom json xlsx">\
				<EntitySet Name="Products" EntityType="foo.bar.Product"\
					sap:content-version="1" />\
				<EntitySet Name="Currencies" EntityType="foo.bar.Currency"\
					sap:content-version="1" />\
				<AssociationSet Name="ProductCurrenciesSet"\
					Association="foo.bar.ProductCurrency" sap:content-version="1">\
					<End EntitySet="Currencies" Role="FromRole_ProductCurrency" />\
					<End EntitySet="Products" Role="ToRole_ProductCurrency" />\
				</AssociationSet>\
			</EntityContainer>\
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
			<Annotations Target="FAR_CUSTOMER_LINE_ITEMS.Item/CompanyCode" \
					xmlns="http://docs.oasis-open.org/odata/ns/edm">\
				<Annotation Term="com.sap.vocabularies.Common.v1.ValueList">\
				</Annotation>\
			</Annotations>\
		</Schema>\
	</edmx:DataServices>\
</edmx:Edmx>\
		', sFARMetadataInvalid = '\
<?xml version="1.0" encoding="utf-8"?>\
<!--\
	fictitious empty response for \
	/sap/opu/odata/sap/FAR_CUSTOMER_LINE_ITEMS/$metadata?sap-value-list=Item/Invalid \
-->\
<edmx:Edmx Version="1.0" xmlns:edmx="http://schemas.microsoft.com/ado/2007/06/edmx" \
		xmlns:m="http://schemas.microsoft.com/ado/2007/08/dataservices/metadata" \
		xmlns:sap="http://www.sap.com/Protocols/SAPData">\
	<edmx:Reference Uri="/sap/opu/odata/IWFND/CATALOGSERVICE;v=2/Vocabularies(TechnicalName=\'%2FIWBEP%2FVOC_COMMON\',Version=\'0001\',SAP__Origin=\'LOCAL\')/$value" \
			xmlns:edmx="http://docs.oasis-open.org/odata/ns/edmx">\
		<edmx:Include Namespace="com.sap.vocabularies.Common.v1" Alias="Common"/>\
	</edmx:Reference>\
	<edmx:Reference Uri="/sap/opu/odata/IWFND/CATALOGSERVICE;v=2/Vocabularies(TechnicalName=\'%2FIWBEP%2FVOC_UI\',Version=\'0001\',SAP__Origin=\'LOCAL\')/$value" \
			xmlns:edmx="http://docs.oasis-open.org/odata/ns/edmx">\
		<edmx:Include Namespace="com.sap.vocabularies.UI.v1" Alias="UI"/>\
	</edmx:Reference>\
	<edmx:DataServices m:DataServiceVersion="2.0">\
		<Schema Namespace="FAR_CUSTOMER_LINE_ITEMS" xml:lang="en" sap:schema-version="0" \
				xmlns="http://schemas.microsoft.com/ado/2008/09/edm">\
			<EntityType Name="FOO" sap:content-version="1"/><!-- TODO remove this! -->\
			<EntityContainer Name="FAR_CUSTOMER_LINE_ITEMS_Entities" \
				m:IsDefaultEntityContainer="true" sap:supported-formats="atom json xlsx">\
			</EntityContainer>\
		</Schema>\
	</edmx:DataServices>\
</edmx:Edmx>\
		', sMultipleValueListAnnotations = '\
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
		', sValueListMetadata = '\
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
		', sCustomerAnnotations = '\
<?xml version="1.0" encoding="utf-8"?>\
<edmx:Edmx Version="4.0"\
	xmlns="http://docs.oasis-open.org/odata/ns/edm"\
	xmlns:edmx="http://docs.oasis-open.org/odata/ns/edmx">\
<edmx:DataServices>\
<Schema Namespace="name.space">\
	<Annotations Target="FAR_CUSTOMER_LINE_ITEMS.Item/Customer" Qualifier="DEBID_addtl">\
		<Annotation Term="com.sap.vocabularies.Common.v1.ValueList">\
			<Record>\
				<PropertyValue Property="CollectionPath" String="VL_SH_DEBID"/>\
			</Record>\
		</Annotation>\
	</Annotations>\
</Schema>\
</edmx:DataServices>\
</edmx:Edmx>\
		',
		mHeaders = {"Content-Type" : "application/xml"},
		sIgnoreThisWarning = "EventProvider sap.ui.model.odata.ODataModel path /$metadata should be"
			+ " absolute if no Context is set",
		mFixture = {
			"/fake/currencyCodeViaPath/$metadata" :
				{headers : mHeaders, message : sCurrencyCodeViaPath},
			"/fake/emptyDataServices/$metadata" :
				{headers : mHeaders, message : sEmptyDataServices},
			"/fake/emptyEntityType/$metadata" : {headers : mHeaders, message : sEmptyEntityType},
			"/fake/emptySchema/$metadata" : {headers : mHeaders, message : sEmptySchema},
			"/fake/emptySchemaWithAnnotations/$metadata" :
				{headers : mHeaders, message : sEmptySchemaWithAnnotations},
			"/fake/service/$metadata" : {headers : mHeaders, message : sMetadata},
			"/fake/annotations" : {headers : mHeaders, message : sAnnotations},
			"/fake/annotations2" : {headers : mHeaders, message : sAnnotations2},
			"/fake/emptyAnnotations" : {headers : mHeaders, message : sEmptyAnnotations},
			"/fake/multipleValueLists" :
				{headers : mHeaders, message : sMultipleValueListAnnotations},
			"/fake/valueListMetadata/$metadata" :
				{headers : mHeaders, message : sValueListMetadata},
			"/FAR_CUSTOMER_LINE_ITEMS/annotations" :
				{headers : mHeaders, message : sCustomerAnnotations},
			"/FAR_CUSTOMER_LINE_ITEMS/$metadata" :
				{source : "FAR_CUSTOMER_LINE_ITEMS.metadata.xml"},
			"/FAR_CUSTOMER_LINE_ITEMS/$metadata?sap-value-list=FAR_CUSTOMER_LINE_ITEMS.Item%2FCompanyCode" :
				{source : "FAR_CUSTOMER_LINE_ITEMS.metadata_ItemCompanyCode.xml"},
			"/FAR_CUSTOMER_LINE_ITEMS/$metadata?sap-value-list=FAR_CUSTOMER_LINE_ITEMS.Item%2FCompanyCode%2CFAR_CUSTOMER_LINE_ITEMS.Item%2FCustomer" :
				{source : "FAR_CUSTOMER_LINE_ITEMS.metadata_ItemCompanyCode_ItemCustomer.xml"},
			"/FAR_CUSTOMER_LINE_ITEMS/$metadata?sap-value-list=FAR_CUSTOMER_LINE_ITEMS.Item%2FCustomer" :
				{source : "FAR_CUSTOMER_LINE_ITEMS.metadata_ItemCustomer.xml"},
			// Note: Gateway says
			// "Value-List FAR_CUSTOMER_LINE_ITEMS.Item/Invalid not found in Metadata", but we want
			// to make our code more robust against empty responses
			"/FAR_CUSTOMER_LINE_ITEMS/$metadata?sap-value-list=FAR_CUSTOMER_LINE_ITEMS.Item%2FInvalid" :
				{headers : mHeaders, message : sFARMetadataInvalid}, // no annotations at all
			// annotations for a different type
			"/FAR_CUSTOMER_LINE_ITEMS/$metadata?sap-value-list=FAR_CUSTOMER_LINE_ITEMS.Foo%2FInvalid" :
				{source : "FAR_CUSTOMER_LINE_ITEMS.metadata_ItemCompanyCode.xml"},
			"/FAR_CUSTOMER_LINE_ITEMS/$metadata?sap-value-list=FAR_CUSTOMER_LINE_ITEMS.MyComplexType%2FCustomer" :
				{source : "FAR_CUSTOMER_LINE_ITEMS.metadata_MyComplexTypeCustomer.xml"},
			"/GWSAMPLE_BASIC/$metadata" : {source : "GWSAMPLE_BASIC.metadata.xml"},
			"/GWSAMPLE_BASIC/annotations" : {source : "GWSAMPLE_BASIC.annotations.xml"}
		};

	/**
	 * Runs the given code under test with an <code>ODataMetaModel</code> for the service URL
	 * "/fake/service" and the given (array of) annotation URLs.
	 *
	 * @param {object} assert the assertions
	 * @param {object} oLogMock the log mock
	 * @param {string|string[]} vAnnotationUrl
	 *   the (array of) annotation URLs
	 * @param {function(sap.ui.model.odata.ODataMetaModel)} fnCodeUnderTest
	 *   the given code under test
	 * @returns {any|Promise}
	 *   (a promise to) whatever <code>fnCodeUnderTest</code> returns
	 */
	function withFakeService(assert, oLogMock, vAnnotationUrl, fnCodeUnderTest) {
		oLogMock.expects("warning")
			.withExactArgs("Inconsistent service",
				"Use either 'sap:deletable' or 'sap:deletable-path' at entity set 'ProductSet'",
				sComponent);
		oLogMock.expects("warning")
			.withExactArgs("Inconsistent service",
				"Use either 'sap:updatable' or 'sap:updatable-path' at entity set 'ProductSet'",
				sComponent);

		return withGivenService(assert, "/fake/service", vAnnotationUrl, fnCodeUnderTest);
	}

	/**
	 * Runs the given code under test with an <code>ODataMetaModel</code> for the service URL
	 * "/GWSAMPLE_BASIC" and annotation URL "/GWSAMPLE_BASIC/annotations".
	 *
	 * @param {object} assert the assertions
	 * @param {function(sap.ui.model.odata.ODataMetaModel)} fnCodeUnderTest
	 *   the given code under test
	 * @returns {any|Promise}
	 *   (a promise to) whatever <code>fnCodeUnderTest</code> returns
	 */
	function withMetaModel(assert, fnCodeUnderTest) {
		return withGivenService(assert, "/GWSAMPLE_BASIC", "/GWSAMPLE_BASIC/annotations",
			fnCodeUnderTest);
	}

	/**
	 * Runs the given code under test with an <code>ODataMetaModel</code> for the service URL
	 * "/GWSAMPLE_BASIC" and (array of) annotation URLs.
	 *
	 * @param {object} assert the assertions
	 * @param {string|string[]} vAnnotationUrl
	 *   the (array of) annotation URLs
	 * @param {function(sap.ui.model.odata.ODataMetaModel)} fnCodeUnderTest
	 *   the given code under test
	 * @returns {any|Promise}
	 *   (a promise to) whatever <code>fnCodeUnderTest</code> returns
	 */
	function withGivenAnnotations(assert, vAnnotationUrl, fnCodeUnderTest) {
		return withGivenService(assert, "/GWSAMPLE_BASIC", vAnnotationUrl, fnCodeUnderTest);
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
	QUnit.module("sap.ui.model.odata.ODataMetaModel", {
		beforeEach : function () {
			TestUtils.useFakeServer(this._oSandbox, "sap/ui/core/qunit/model", mFixture);
			this.iOldLogLevel = jQuery.sap.log.getLevel(sComponent);
			// do not rely on ERROR vs. DEBUG due to minified sources
			jQuery.sap.log.setLevel(jQuery.sap.log.Level.ERROR, sComponent);
			this.oLogMock = this.mock(jQuery.sap.log);
			this.oLogMock.expects("warning").never();
			this.oLogMock.expects("error").never();
			// avoid caching of metadata across tests
			this.stub(ODataModel, "_getSharedData").returns({});
		},
		afterEach : function () {
			jQuery.sap.log.setLevel(this.iOldLogLevel, sComponent);
		}
	});

	//*********************************************************************************************
	QUnit.test("TestUtils.deepContains", function (assert) {
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
	QUnit.test("compatibility with synchronous ODataModel", function (assert) {
		var oMetaModel, oModel;

		this.oLogMock.expects("warning").withExactArgs(sIgnoreThisWarning);

		oModel = new ODataModel1("/GWSAMPLE_BASIC", {
			annotationURI : "/GWSAMPLE_BASIC/annotations",
			json : true,
			loadMetadataAsync : false
		});
		oMetaModel = oModel.getMetaModel();

		assert.strictEqual(oMetaModel.getProperty("/dataServices/schema/0/namespace"),
			"GWSAMPLE_BASIC", "metadata available");
		assert.strictEqual(
			oMetaModel.getProperty("/dataServices/schema/0/entityType/0/property/1/sap:label"),
			"Bus. Part. ID", "SAPData is lifted");
		assert.strictEqual(
			oMetaModel.getProperty("/dataServices/schema/0/entityType/0/property/1/"
				+ "com.sap.vocabularies.Common.v1.Label/String"),
			"Bus. Part. ID", "V2 --> V4");
		assert.strictEqual(
			oMetaModel.getProperty("/dataServices/schema/0/entityType/0/"
				+ "com.sap.vocabularies.UI.v1.HeaderInfo/TypeName/String"),
			"Business Partner", "V4 annotations available");

		return oMetaModel.loaded().then(function () {
			assert.strictEqual(arguments.length, 1, "almost no args");
			assert.strictEqual(arguments[0], undefined, "almost no args");
		});
	});

	//*********************************************************************************************
	QUnit.test("compatibility with asynchronous old ODataModel", function (assert) {
		var oMetaModel, oModel;

		this.oLogMock.expects("warning").withExactArgs(sIgnoreThisWarning);

		oModel = new ODataModel1("/GWSAMPLE_BASIC", {
			annotationURI : "/GWSAMPLE_BASIC/annotations",
			json : true,
			loadMetadataAsync : true
		});
		oMetaModel = oModel.getMetaModel();

		return oMetaModel.loaded().then(function () {
			assert.strictEqual(arguments.length, 1, "almost no args");
			assert.strictEqual(arguments[0], undefined, "almost no args");

			assert.strictEqual(oMetaModel.getProperty("/dataServices/schema/0/namespace"),
				"GWSAMPLE_BASIC", "metadata available");
			assert.strictEqual(
				oMetaModel.getProperty("/dataServices/schema/0/entityType/0/property/1/sap:label"),
				"Bus. Part. ID", "SAPData is lifted");
			assert.strictEqual(
				oMetaModel.getProperty("/dataServices/schema/0/entityType/0/property/1/"
					+ "com.sap.vocabularies.Common.v1.Label/String"),
				"Bus. Part. ID", "V2 --> V4");
			assert.strictEqual(
				oMetaModel.getProperty("/dataServices/schema/0/entityType/0/"
					+ "com.sap.vocabularies.UI.v1.HeaderInfo/TypeName/String"),
				"Business Partner", "V4 annotations available");
		});
	});

	//*********************************************************************************************
	QUnit.test("compatibility w/ asynchronous old ODataModel: use after load", function (assert) {
		var iCount = 0,
			fnDone = assert.async(),
			oModel;

		function loaded() {
			var oMetaModel;

			iCount += 1;
			if (iCount === 2) {
				// ...then get meta model and use immediately
				oMetaModel = oModel.getMetaModel();

				try {
					assert.strictEqual(oMetaModel.getProperty("/dataServices/schema/0/namespace"),
						"GWSAMPLE_BASIC", "metadata available");
					assert.strictEqual(
						oMetaModel.getProperty("/dataServices/schema/0/entityType/0/property/1/"
							+ "sap:label"),
						"Bus. Part. ID", "SAPData is lifted");
					assert.strictEqual(
						oMetaModel.getProperty("/dataServices/schema/0/entityType/0/property/1/"
							+ "com.sap.vocabularies.Common.v1.Label/String"),
						"Bus. Part. ID", "V2 --> V4");
					assert.strictEqual(
						oMetaModel.getProperty("/dataServices/schema/0/entityType/0/"
							+ "com.sap.vocabularies.UI.v1.HeaderInfo/TypeName/String"),
						"Business Partner", "V4 annotations available");
				} catch (ex) {
					assert.ok(false, ex);
				}

				fnDone();
			}
		}

		this.oLogMock.expects("warning").withExactArgs(sIgnoreThisWarning);

		oModel = new ODataModel1("/GWSAMPLE_BASIC", {
			annotationURI : "/GWSAMPLE_BASIC/annotations",
			json : true,
			loadMetadataAsync : true
		});

		// wait for metadata and annotations to be loaded (but not via oMetaModel.loaded())...
		oModel.attachAnnotationsLoaded(loaded);
		oModel.attachMetadataLoaded(loaded);
	});

	//*********************************************************************************************
	QUnit.test("compatibility with old ODataModel: separate value list load", function (assert) {
		var oContext, oEntityType, oMetaModel, oModel, oProperty;

		this.oLogMock.expects("warning").withExactArgs(sIgnoreThisWarning);

		oModel = new ODataModel1("/FAR_CUSTOMER_LINE_ITEMS", {
			json : true,
			loadMetadataAsync : false
		});
		oMetaModel = oModel.getMetaModel();
		oContext = oMetaModel.getMetaContext("/Items('foo')/Customer");
		oEntityType = oMetaModel.getODataEntityType("FAR_CUSTOMER_LINE_ITEMS.Item");
		oProperty = oMetaModel.getODataProperty(oEntityType, "Customer");

		return oMetaModel.getODataValueLists(oContext).then(function (mValueLists) {
			assert.deepEqual(mValueLists, {
				"" : oProperty["com.sap.vocabularies.Common.v1.ValueList"],
				"DEBID" : oProperty["com.sap.vocabularies.Common.v1.ValueList#DEBID"]
			});

			// check robustness: no error even if interface is missing
			oMetaModel = new ODataMetaModel(oMetaModel.oMetadata);
			return oMetaModel.getODataValueLists(oContext);
		});
	});

	//*********************************************************************************************
	QUnit.test("functions using 'this.oModel' directly", function (assert) {
		var oModel = new ODataModel("/GWSAMPLE_BASIC", {
				annotationURI : "/GWSAMPLE_BASIC/annotations",
				json : true,
				loadMetadataAsync : true
			}),
			oMetaModel = oModel.getMetaModel();

		assert.ok(oMetaModel instanceof ODataMetaModel);
		assert.strictEqual(typeof oMetaModel.oODataModelInterface.addAnnotationUrl, "function",
			"function addAnnotationUrl");

		// call functions before loaded() promise has been resolved
		assert.throws(function () {
			oMetaModel._getObject("/");
		}, "_getObject");
		assert.throws(function () {
			oMetaModel.getODataAssociationEnd({
				"navigationProperty" : [{
					"name" : "ToSalesOrders",
					"relationship" : "GWSAMPLE_BASIC.Assoc_BusinessPartner_SalesOrders",
					"fromRole" : "FromRole_Assoc_BusinessPartner_SalesOrders",
					"toRole" : "ToRole_Assoc_BusinessPartner_SalesOrders"
				}]
			}, "ToSalesOrders");
		}, "getODataAssociationEnd");
		assert.throws(function () {
			oMetaModel.getODataComplexType("don't care");
		}, "getODataComplexType");
		assert.throws(function () {
			oMetaModel.getODataEntityContainer();
		}, "getODataEntityContainer");
		assert.throws(function () {
			oMetaModel.getODataEntityType("don't care");
		}, "getODataEntityType");
		assert.throws(function () {
			oMetaModel.isList();
		}, "isList");

		return oMetaModel.loaded();
	});

	//*********************************************************************************************
	QUnit.test("basics", function (assert) {
		var oMetaModel = new ODataMetaModel({
				getServiceMetadata : function () { return {dataServices : {}}; }
			}),
			that = this;

		// code under test
		assert.strictEqual(oMetaModel.getAdapterFactoryModulePath(),
			"sap/ui/model/odata/v2/meta/ODataAdapterFactory");

		return oMetaModel.loaded().then(function () {
			var oMetaModelMock = that.mock(oMetaModel),
				oModelMock = that.mock(oMetaModel.oModel),
				oResult = {};

			assert.strictEqual(arguments.length, 1, "almost no args");
			assert.strictEqual(arguments[0], undefined, "almost no args");

			that.mock(Model.prototype).expects("destroy");

			// generic dispatching
			["destroy", "isList"].forEach(function (sName) {
				oModelMock.expects(sName).withExactArgs("foo", 0, false).returns(oResult);

				assert.strictEqual(oMetaModel[sName]("foo", 0, false), oResult, sName);
			});

			// getProperty dispatches to _getObject
			oMetaModelMock.expects("_getObject").withExactArgs("foo", 0, false)
				.returns(oResult);
			assert.strictEqual(oMetaModel.getProperty("foo", 0, false), oResult, "getProperty");

			assert.throws(function () {
				oMetaModel.refresh();
			}, /Unsupported operation: ODataMetaModel#refresh/);

			oMetaModel.setLegacySyntax(); // allowed
			oMetaModel.setLegacySyntax(false); // allowed
			assert.throws(function () {
				oMetaModel.setLegacySyntax(true);
			}, /Legacy syntax not supported by ODataMetaModel/);

			assert.strictEqual(oMetaModel.getDefaultBindingMode(), BindingMode.OneTime);
			assert.strictEqual(oMetaModel.oModel.getDefaultBindingMode(), BindingMode.OneTime);
			assert.throws(function () {
				oMetaModel.setDefaultBindingMode(BindingMode.OneWay);
			});
			assert.throws(function () {
				oMetaModel.setDefaultBindingMode(BindingMode.TwoWay);
			});
		});
	});

	//*********************************************************************************************
	QUnit.test("bindings", function (assert) {
		return withMetaModel(assert, function (oMetaModel) {
			var oBinding,
				oContext = oMetaModel.createBindingContext("/dataServices"),
				aFilters = [],
				mParameters = {},
				sPath = "schema/0/foo",
				aSorters = [];

			// Note: support for events not needed
			oBinding = oMetaModel.bindContext(sPath, oContext, mParameters);
			assert.ok(oBinding instanceof ClientContextBinding);
			assert.strictEqual(oBinding.getModel(), oMetaModel);
			assert.strictEqual(oBinding.getPath(), sPath);
			assert.strictEqual(oBinding.getContext(), oContext);
			assert.strictEqual(oBinding.mParameters, mParameters);

			oBinding = oMetaModel.bindProperty(sPath, oContext, mParameters);
			assert.ok(oBinding instanceof JSONPropertyBinding);
			assert.strictEqual(oBinding.getModel(), oMetaModel);
			assert.strictEqual(oBinding.getPath(), sPath);
			assert.strictEqual(oBinding.getContext(), oContext);
			assert.strictEqual(oBinding.mParameters, mParameters);

			assert.throws(function () {
				oBinding.setValue("foo");
			}, /Unsupported operation: ODataMetaModel#setProperty/);

			oBinding = oMetaModel.bindList(sPath, oContext, aSorters, aFilters, mParameters);
			assert.ok(oBinding instanceof JSONListBinding);
			//TODO improve performance by not extending JSONListBinding?
			// - update() makes a shallow copy of this.oList, avoid?!
			// - checkUpdate() calls _getObject() twice; uses jQuery.sap.equal(); avoid?!
			assert.strictEqual(oBinding.getModel(), oMetaModel, "inner model not leaked");
			assert.strictEqual(oBinding.getPath(), sPath);
			assert.strictEqual(oBinding.getContext(), oContext);
			assert.strictEqual(oBinding.aSorters, aSorters);
			//TODO spy on ListBinding instead?
			assert.strictEqual(oBinding.aApplicationFilters, aFilters);
			assert.strictEqual(oBinding.mParameters, mParameters);

			oBinding = oMetaModel.bindTree(sPath, oContext, aFilters, mParameters);
			assert.ok(oBinding instanceof JSONTreeBinding);
			assert.strictEqual(oBinding.getModel(), oMetaModel);
			assert.strictEqual(oBinding.getPath(), sPath);
			assert.strictEqual(oBinding.getContext(), oContext);
			assert.strictEqual(oBinding.aApplicationFilters, aFilters);
			assert.strictEqual(oBinding.mParameters, mParameters);
		});
	});

	//*********************************************************************************************
	QUnit.test("bindList", function (assert) {
		var that = this;

		return withMetaModel(assert, function (oMetaModel) {
			var fnApply = that.mock(FilterProcessor).expects("apply"),
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

			assert.strictEqual(oBinding.aIndices, aIndices);
			assert.strictEqual(oBinding.iLength, oBinding.aIndices.length);

			fnGetValue = fnApply.args[0][2];
			that.mock(oMetaModel).expects("getProperty")
				.withExactArgs("0/namespace", sinon.match.same(oBinding.oList["schema"]))
				.returns("foo");

			// code under test
			assert.strictEqual(fnGetValue("schema", "0/namespace"), "foo");

			// code under test
			assert.strictEqual(fnGetValue("schema", "@sapui.name"), "schema");
		});
	});

	//*********************************************************************************************
	QUnit.test("_getObject", function (assert) {
		return withMetaModel(assert, function (oMetaModel) {
			var oContext;

			// w/o context
			assert.strictEqual(oMetaModel._getObject("/"), oMetaModel.oModel._getObject("/"));
			assert.strictEqual(oMetaModel._getObject("/foo"), undefined);
			assert.strictEqual(oMetaModel._getObject("/dataServices"),
				oMetaModel.oModel._getObject("/dataServices"));
			assert.strictEqual(oMetaModel._getObject("/dataServices/schema"),
				oMetaModel.oModel._getObject("/dataServices/schema"));

			// with sap.ui.model.Context
			oContext = oMetaModel.getContext("/dataServices/schema");
			assert.strictEqual(oMetaModel._getObject(undefined, oContext),
				oMetaModel.oModel._getObject("/dataServices/schema"));
			oContext = oMetaModel.getContext("/dataServices");
			assert.strictEqual(oMetaModel._getObject("schema", oContext),
				oMetaModel.oModel._getObject("/dataServices/schema"));

			// with object context
			oContext = oMetaModel._getObject("/dataServices");
			assert.strictEqual(oMetaModel._getObject("schema", oContext),
				oMetaModel.oModel._getObject("/dataServices/schema"));
			oContext = oMetaModel._getObject("/dataServices/schema");
			assert.strictEqual(oMetaModel._getObject(undefined, oContext),
				oMetaModel.oModel._getObject("/dataServices/schema"));
			// absolute path wins over object context
			oContext = oMetaModel._getObject("/dataServices/schema/0/entityType/0");
			assert.strictEqual(
				oMetaModel._getObject("/dataServices/schema/0/entityType/1", oContext),
				oMetaModel.oModel._getObject("/dataServices/schema/0/entityType/1"));
		});
	});

	//*********************************************************************************************
	[false, true].forEach(function (bIsLoggable) {
		QUnit.test("_getObject: queries instead of indexes, log = " + bIsLoggable, function (assert) {
			var oLogMock = this.oLogMock;

			jQuery.sap.log.setLevel(bIsLoggable
				? jQuery.sap.log.Level.WARNING
				: jQuery.sap.log.Level.ERROR,
				sComponent);

			oLogMock.expects("error")
				.withExactArgs("A query is not allowed when an object context has been given",
					"entityType/[$\{name}==='BusinessPartner']", sComponent);
			oLogMock.expects("error")
				.withExactArgs("Invalid query: '/dataServices/' does not point to an array",
					"/dataServices/[${namespace}==='GWSAMPLE_BASIC']", sComponent);
			oLogMock.expects("error")
				.withExactArgs("no closing braces found in '[${namespace==='GWSAMPLE_BASIC']/"
					+ "entityType' after pos:2", undefined, "sap.ui.base.ExpressionParser");
			oLogMock.expects("warning").never();

			return withMetaModel(assert, function (oMetaModel) {
				[{
					i : "/dataServices/schema/[${namespace}==='GWSAMPLE_BASIC']",
					o : "/dataServices/schema/0"
				}, { // syntax error (missing closing ']')
					i : "/dataServices/schema/[${namespace}==='GWSAMPLE_BASIC'",
					o : undefined
				}, { // syntax error (text after closing ']')
					i : "/dataServices/schema/[${namespace}==='GWSAMPLE_BASIC']a",
					o : undefined
				}, { // syntax error (text after closing ']')
					i : "/dataServices/schema/[${namespace}==='GWSAMPLE_BASIC']a/entityType/1",
					o : undefined,
					m : "Invalid part: entityType"
				}, { // query when we just landed in Nirvana
					i : "/dataServices/unknown/[${namespace}==='GWSAMPLE_BASIC']",
					o : undefined,
					m : "Invalid part: [${namespace}==='GWSAMPLE_BASIC']"
				}, {
					i : "/dataServices/schema/[${namespace}==='GWSAMPLE_BASIC']/entityType/"
						+ "[$\{name}==='Product']",
					o : "/dataServices/schema/0/entityType/1",
					c : {} // unnecessary context object (because of absolute path) silently ignored
				}, { // ensure we don't fail after a 'namespace' query that didn't find a result
					i : "/dataServices/schema/[${namespace}==='unknown']/entityType/"
						+ "[$\{name}==='Product']",
					o : undefined,
					m : "Invalid part: entityType"
				}, { // ensure we don't fail after a 'name' query that didn't find a result
					i : "/dataServices/schema/[${namespace}==='GWSAMPLE_BASIC']/entityType/"
						+ "[$\{name}==='unknown']/property/[$\{name=}'foo']",
					o : undefined,
					m : "Invalid part: property"
				}, {
					i : "/dataServices/schema/[${namespace}==='GWSAMPLE_BASIC']/entityType/"
						+ "[$\{name}==='BusinessPartner']/com.sap.vocabularies.UI.v1.LineItem/"
						+ "[${Value/Path}==='BusinessPartnerID']/Label/String",
					o : "/dataServices/schema/0/entityType/0/com.sap.vocabularies.UI.v1.LineItem/0"
						+ "/Label/String"
				}, {
					i : "entityType/[$\{name}==='Product']",
					o : "/dataServices/schema/0/entityType/1",
					c : oMetaModel.getContext(
						"/dataServices/schema/[${namespace}==='GWSAMPLE_BASIC']")
				}, { // query, but context is an object
					i : "entityType/[$\{name}==='BusinessPartner']",
					o : null,
					c : oMetaModel.getObject(
						"/dataServices/schema/[${namespace}==='GWSAMPLE_BASIC']")
				}, { // query on non-array
					i : "/dataServices/[${namespace}==='GWSAMPLE_BASIC']",
					o : null
				}, { // stupid query with [], but returning true
					i : "/dataServices/schema/['GWSAMPLE_BASIC/foo'.split('/')[0]===${namespace}]"
						+ "/entityType",
					o : "/dataServices/schema/0/entityType"
				}, { // syntax error in query
					i : "/dataServices/schema/[${namespace==='GWSAMPLE_BASIC']/entityType",
					o : undefined,
					m : "Invalid part: entityType"
				}, { // search for the first property having a maxLength
					i : "/dataServices/schema/0/entityType/0/property/[${maxLength}]",
					o : "/dataServices/schema/0/entityType/0/property/1"
				}].forEach(function (oFixture) {
					var fnBindObject, fnUnbindObject;

					if (oFixture.m) {
						oLogMock.expects("warning")
							// do not construct arguments in vain!
							.exactly(bIsLoggable ? 1 : 0)
							.withExactArgs(oFixture.m, "path: " + oFixture.i
								+ ", context: undefined", sComponent);
					}
					oMetaModel.mQueryCache = {};
					if (oMetaModel.oResolver) {
						fnBindObject = oMetaModel.oResolver.bindObject;
						oMetaModel.oResolver.bindObject = function () {
							assert.strictEqual(this.getBinding("any"), undefined,
								"no property binding on bindObject");
							fnBindObject.apply(this, arguments);
						};
						fnUnbindObject = oMetaModel.oResolver.unbindObject;
						oMetaModel.oResolver.unbindObject = function () {
							assert.strictEqual(this.getBinding("any"), undefined,
								"no property binding on unbindObject");
							fnUnbindObject.apply(this, arguments);
						};
					}
					assert.strictEqual(oMetaModel._getObject(oFixture.i, oFixture.c), oFixture.o
						? oMetaModel.oModel.getObject(oFixture.o)
						: oFixture.o, oFixture.i);
					assert.strictEqual(oMetaModel.oResolver.getBinding("any"), undefined,
						"no property binding in the end");
					assert.strictEqual(oMetaModel.oResolver.getObjectBinding(), undefined,
						"no object binding in the end");
				});
			});
		});
	});

	//*********************************************************************************************
	QUnit.test("integration-like test for queries instead of indexes", function (assert) {
		return withMetaModel(assert, function (oMetaModel) {
			[
				"[${namespace} === \\'GWSAMPLE_BASIC\\']",
				"[${namespace}.indexOf(\\'GWSAMPLE_BASIC\\') === 0]",
				"[(${namespace} || \\'\\').indexOf(\\'GWSAMPLE_BASIC\\') === 0]",
				"[${namespace} && ${namespace}.indexOf(\\'GWSAMPLE_BASIC\\') === 0]"
			].forEach(function (sQuery) {
				var sPath = "/dataServices/schema/" + sQuery + "/namespace";

				function check(sBinding) {
					var oIcon;

					oMetaModel.mQueryCache = {};

					try {
						oIcon = new sap.ui.core.Icon({
							color : sBinding,
							models : oMetaModel
						});

						assert.strictEqual(oIcon.getColor(), 'GWSAMPLE_BASIC', sBinding);
					} catch (ex) {
						assert.ok(false, sBinding + ": " + ex.stack);
					}
				}

				// Note: simple binding not possible due to following error
// no closing braces found in '[${namespace' after pos:2 -  sap.ui.base.ExpressionParser
//				check("{" + sPath + "}"); // simple binding
				check("{path : '" + sPath + "'}"); // complex binding
				check("{:= ${path : '" + sPath + "'} }"); // emdedded into expression binding
			});
		});
	});

	//*********************************************************************************************
	QUnit.test("_getObject: some error in parseExpression (not SyntaxError)", function (assert) {
		var oError = new Error();

		this.mock(BindingParser).expects("parseExpression").throws(oError);

		return withMetaModel(assert, function (oMetaModel) {
			assert.throws(function () {
				oMetaModel.getObject("/dataServices/schema/[${namespace}==='GWSAMPLE_BASIC']");
			}, oError);
		});
	});

	//*********************************************************************************************
	QUnit.test("_getObject: caching queries", function (assert) {
		var that = this;

		return withMetaModel(assert, function (oMetaModel) {
			var sPath = "/dataServices/schema/[${namespace}==='GWSAMPLE_BASIC']/entityType/"
					+ "[$\{name}==='Product']",
				oResult = oMetaModel._getObject(sPath);

			that.mock(oMetaModel.oResolver).expects("bindProperty").never();

			assert.strictEqual(oMetaModel._getObject(sPath), oResult);
		});
	});

	//*********************************************************************************************
	[false, true].forEach(function (bWarn) {
		QUnit.test("_getObject: warning w/o context, log = " + bWarn, function (assert) {
			var oLogMock = this.oLogMock;

			oLogMock.expects("isLoggable")
				.withExactArgs(jQuery.sap.log.Level.WARNING, sComponent)
				.returns(bWarn);
			oLogMock.expects("warning")
				.exactly(bWarn ? 1 : 0) // do not construct arguments in vain!
				.withExactArgs("Invalid part: bar", "path: /foo/bar, context: undefined",
					sComponent);

			return withMetaModel(assert, function (oMetaModel) {
				assert.strictEqual(oMetaModel._getObject("/foo/bar"), undefined);
			});
		});

		QUnit.test("_getObject: warning with sap.ui.model.Context, log = " + bWarn,
			function (assert){
				var oLogMock = this.oLogMock;

				oLogMock.expects("isLoggable")
					.withExactArgs(jQuery.sap.log.Level.WARNING, sComponent)
					.returns(bWarn);
				oLogMock.expects("warning")
					.exactly(bWarn ? 1 : 0) // do not construct arguments in vain!
					.withExactArgs("Invalid part: relative",
						"path: some/relative/path, context: /dataServices/schema/0/entityType/0",
						sComponent);

				return withMetaModel(assert, function (oMetaModel) {
					var oContext = oMetaModel.getContext("/dataServices/schema/0/entityType/0");
					assert.strictEqual(oMetaModel._getObject("some/relative/path", oContext),
						undefined);
				});
			});

		QUnit.test("_getObject: warning with object context, log = " + bWarn, function (assert) {
			var oLogMock = this.oLogMock;

			oLogMock.expects("isLoggable")
				.withExactArgs(jQuery.sap.log.Level.WARNING, sComponent)
				.returns(bWarn);
			oLogMock.expects("warning")
				.exactly(bWarn ? 1 : 0) // do not construct arguments in vain!
				.withExactArgs("Invalid part: relative",
					"path: some/relative/path, context: [object Object]", sComponent);

			return withMetaModel(assert, function (oMetaModel) {
				var oContext = oMetaModel._getObject("/dataServices/schema/0/entityType/0");
				assert.strictEqual(oMetaModel._getObject("some/relative/path", oContext),
					undefined);
			});
		});
	});

	//*********************************************************************************************
	QUnit.test("_getObject: Invalid relative path w/o context", function (assert) {
		this.oLogMock.expects("error").withExactArgs(
			"Invalid relative path w/o context", "some/relative/path", sComponent);

		return withMetaModel(assert, function (oMetaModel) {
			assert.strictEqual(oMetaModel._getObject("some/relative/path"), null);
		});
	});

	//*********************************************************************************************
	QUnit.test("/dataServices/schema/<i>/annotations dropped", function (assert) {
		return withGivenService(assert, "/fake/emptySchemaWithAnnotations", "",
			function (oMetaModel) {
				return oMetaModel.loaded().then(function () {
					assert.strictEqual(oMetaModel.getObject("/dataServices/schema/0/annotations"),
						undefined);
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
		QUnit.test("ODataMetaModel loaded: " + oFixture.title, function (assert) {
			return withFakeService(assert, this.oLogMock, oFixture.annotationURI,
					function (oMetaModel, oModel) {
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
					oBusinessPartnerWebAddress = oBusinessPartner.property[1],
					oContact = oGWSampleBasic.entityType[3],
					oContactTel = oContact.property[4],
					oAnyProperty = oBusinessPartner.property[2],
					oNonFilterable = oBusinessPartner.property[3],
					oYearMonthDay = oBusinessPartner.property[4],
					oCTAddress = oGWSampleBasic.complexType[0],
					oCTAddressCity = oCTAddress.property[0],
					oFunctionImport = oEntityContainer.functionImport[0],
					oParameter = oFunctionImport.parameter[0],
					sPrefix,
					oProduct = oGWSampleBasic.entityType[2],
					oProductCurrencyCode =  oProduct.property[4],
					oProductPrice = oProduct.property[0],
					oProductSet = oEntityContainer.entitySet[1],
					oProductWeightMeasure =  oProduct.property[2],
					oProductWeightUnit =  oProduct.property[3],
					oToFooNavigationProperty = oBusinessPartner.navigationProperty[0],
					oValue,
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

					assert.strictEqual(oVHSexSet["sap:" + sExtension], "false");
					delete oVHSexSet["sap:" + sExtension];
					oExpected = {};
					oExpected[sProperty] = {"Bool" : "false"};
					assert.deepEqual(oVHSexSet["Org.OData.Capabilities.V1." + sCapability],
						oExpected, sExtension + " at entity set");
					delete oVHSexSet["Org.OData.Capabilities.V1." + sCapability];
				}

				assert.strictEqual(oBusinessPartner.name, "BusinessPartner");
				assert.strictEqual(oBusinessPartnerId.name, "BusinessPartnerID");

				assert.ok(oMetadata, "metadata is loaded");

				assert.strictEqual(oBusinessPartner.namespace, "GWSAMPLE_BASIC");
				delete oBusinessPartner.namespace;
				assert.strictEqual(oBusinessPartner.$path, "/dataServices/schema/0/entityType/0");
				delete oBusinessPartner.$path;
				assert.strictEqual(oVHSex.namespace, "GWSAMPLE_BASIC");
				delete oVHSex.namespace;
				assert.strictEqual(oVHSex.$path, "/dataServices/schema/0/entityType/1");
				delete oVHSex.$path;
				assert.strictEqual(oProduct.namespace, "GWSAMPLE_BASIC");
				delete oProduct.namespace;
				assert.strictEqual(oProduct.$path, "/dataServices/schema/0/entityType/2");
				delete oProduct.$path;
				assert.strictEqual(oContact.namespace, "GWSAMPLE_BASIC");
				delete oContact.namespace;
				assert.strictEqual(oContact.$path, "/dataServices/schema/0/entityType/3");
				delete oContact.$path;

				assert.strictEqual(oGWSampleBasic.$path, "/dataServices/schema/0");
				delete oGWSampleBasic.$path;
				assert.strictEqual(oGWSampleBasic["sap:schema-version"], "0000");
				delete oGWSampleBasic["sap:schema-version"];
				assert.deepEqual(oGWSampleBasic["Org.Odata.Core.V1.SchemaVersion"], {
					String : "0000"
				});
				delete oGWSampleBasic["Org.Odata.Core.V1.SchemaVersion"];

				assert.strictEqual(oBusinessPartner["sap:content-version"], "1");
				delete oBusinessPartner["sap:content-version"];

				assert.deepEqual(oBusinessPartner["Org.OData.Capabilities.V1.InsertRestrictions"], {
					"AttributeNotation" : {
						"NavigationPropertyPath" : "ToFoo"
					},
					"Collection_PropertyPath": [{
						"PropertyPath": "ToFoo"
					}],
					"ElementNotation": {
						"NavigationPropertyPath": "ToFoo"
					},
					"NonInsertableNavigationProperties" : [{
						"NavigationPropertyPath" : "ToFoo"
					}]
				});
				delete oBusinessPartner["Org.OData.Capabilities.V1.InsertRestrictions"];

				assert.strictEqual(oCTAddress.namespace, "GWSAMPLE_BASIC");
				delete oCTAddress.namespace;
				assert.strictEqual(oCTAddress.$path, "/dataServices/schema/0/complexType/0",
					"$path");
				delete oCTAddress.$path;

				assert.strictEqual(oAssociation["sap:content-version"], "1");
				delete oAssociation["sap:content-version"];

				assert.strictEqual(oAssociation.namespace, "GWSAMPLE_BASIC");
				delete oAssociation.namespace;
				assert.strictEqual(oAssociation.$path, "/dataServices/schema/0/association/0");
				delete oAssociation.$path;

				assert.strictEqual(oAssociationSet["sap:creatable"], "false");
				delete oAssociationSet["sap:creatable"];

				assert.strictEqual(oBusinessPartnerSet["sap:content-version"], "1");
				delete oBusinessPartnerSet["sap:content-version"];

				assert.strictEqual(oEntityContainer["sap:use-batch"], "false");
				delete oEntityContainer["sap:use-batch"];

				assert.strictEqual(oEntityContainer.namespace, "GWSAMPLE_BASIC");
				delete oEntityContainer.namespace;
				assert.strictEqual(oEntityContainer.$path,
					"/dataServices/schema/0/entityContainer/0");
				delete oEntityContainer.$path;

				assert.strictEqual(oFunctionImport["sap:action-for"],
					"GWSAMPLE_BASIC.BusinessPartner");
				delete oFunctionImport["sap:action-for"];

				assert.strictEqual(oEntityContainer.functionImport[1]["sap:action-for"],
					"GWSAMPLE_BASIC.Product");
				delete oEntityContainer.functionImport[1]["sap:action-for"];

				assert.strictEqual(oVHSex["sap:content-version"], "1");
				delete oVHSex["sap:content-version"];
				assert.strictEqual(oVHSexSet["sap:content-version"], "1");
				delete oVHSexSet["sap:content-version"];

				if (i > 0) {
					assert.deepEqual(oBusinessPartner["com.sap.vocabularies.Common.v1.Label"], {
						"String" : "Label via external annotation: Business Partner"
					});
					delete oBusinessPartner["com.sap.vocabularies.Common.v1.Label"];

					assert.deepEqual(oBusinessPartner["com.sap.vocabularies.UI.v1.HeaderInfo"], {
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

					// DefaultValue="true"
					assert.deepEqual(oBusinessPartnerWebAddress["Org.OData.Core.V1.IsURL"],
						{"Bool" : "true"}, 'DefaultValue="true"');
					delete oBusinessPartnerWebAddress["Org.OData.Core.V1.IsURL"];

					if (i > 1) { // additional tests for 2nd annotations file
						// schema
						assert.deepEqual(oGWSampleBasic["acme.Foo.v1.Foo"], {
							"String" : "GWSAMPLE_BASIC"
						});
						delete oGWSampleBasic["acme.Foo.v1.Foo"];
						// entity type: navigation property
						assert.deepEqual(oToFooNavigationProperty["acme.Foo.v1.Foo"], {
							"String" : "GWSAMPLE_BASIC.BusinessPartner/ToFoo"
						});
						delete oToFooNavigationProperty["acme.Foo.v1.Foo"];
						// complex type
						assert.deepEqual(oCTAddress["acme.Foo.v1.Foo"], {
							"String" : "GWSAMPLE_BASIC.CT_Address"
						});
						delete oCTAddress["acme.Foo.v1.Foo"];
						// association
						assert.deepEqual(oAssociation["acme.Foo.v1.Foo"], {
							"String" : "GWSAMPLE_BASIC.Assoc_Foo"
						});
						delete oAssociation["acme.Foo.v1.Foo"];
						// association: end
						assert.deepEqual(oAssociationEnd["acme.Foo.v1.Foo"], {
							"String" : "GWSAMPLE_BASIC.Assoc_Foo/FromRole_Foo"
						});
						delete oAssociationEnd["acme.Foo.v1.Foo"];
						// entity container
						assert.deepEqual(oEntityContainer["acme.Foo.v1.Foo"], {
							"String" : "GWSAMPLE_BASIC.GWSAMPLE_BASIC_Entities"
						});
						delete oEntityContainer["acme.Foo.v1.Foo"];
						// entity container: association set
						assert.deepEqual(oAssociationSet["acme.Foo.v1.Foo"], {
							"String" : "GWSAMPLE_BASIC.GWSAMPLE_BASIC_Entities/Assoc_FooSet"
						});
						delete oAssociationSet["acme.Foo.v1.Foo"];
						// Note: "entity container: association set: end" is not needed!
						// entity container: entity set
						assert.deepEqual(oBusinessPartnerSet["acme.Foo.v1.Foo"], {
							"String" : "GWSAMPLE_BASIC.GWSAMPLE_BASIC_Entities/BusinessPartnerSet"
						});
						delete oBusinessPartnerSet["acme.Foo.v1.Foo"];
						// entity container: function import
						assert.deepEqual(oFunctionImport["acme.Foo.v1.Foo"], {
							"String" : "GWSAMPLE_BASIC.GWSAMPLE_BASIC_Entities/Foo"
						});
						delete oFunctionImport["acme.Foo.v1.Foo"];
						// entity container: function import: parameter
						assert.deepEqual(oParameter["acme.Foo.v1.Foo"], {
							"String"
								: "GWSAMPLE_BASIC.GWSAMPLE_BASIC_Entities/Foo/BusinessPartnerID"
						});
						delete oParameter["acme.Foo.v1.Foo"];
					}
				}

				// check SAP V2 annotations as V4 annotations
				// sap:aggregation-role
				assert.strictEqual(oProductWeightMeasure["sap:aggregation-role"], "measure");
				delete oProductWeightMeasure["sap:aggregation-role"];
				assert.deepEqual(
					oProductWeightMeasure["com.sap.vocabularies.Analytics.v1.Measure"], {
						"Bool" : (i > 0 ? "false" : "true")
				}, "sap:aggregation-role -> com.sap.vocabularies.Analytics.v1.Measure");
				delete oProductWeightMeasure["com.sap.vocabularies.Analytics.v1.Measure"];

				// sap:label
				assert.strictEqual(oBusinessPartnerId["sap:label"], "Bus. Part. ID");
				delete oBusinessPartnerId["sap:label"];
				assert.deepEqual(oBusinessPartnerId["com.sap.vocabularies.Common.v1.Label"], {
					"String" : "Bus. Part. ID"
				}, "Label derived from sap:label");
				delete oBusinessPartnerId["com.sap.vocabularies.Common.v1.Label"];

				// in case of i > 1 property has been overwritten by annotation file
				// complex type: property
				assert.strictEqual(oCTAddressCity["sap:label"], "City");
				delete oCTAddressCity["sap:label"];
				assert.deepEqual(oCTAddressCity["com.sap.vocabularies.Common.v1.Label"], {
					"String" : i <= 1 ? "City" : "GWSAMPLE_BASIC.CT_Address/City"
				}, "Label derived from sap:label");
				delete oCTAddressCity["com.sap.vocabularies.Common.v1.Label"];
				// check sap:semantics
				assert.strictEqual(oCTAddressCity["sap:semantics"], "city");
				delete oCTAddressCity["sap:semantics"];
				assert.deepEqual(oCTAddress["com.sap.vocabularies.Communication.v1.Contact"],
					{ "adr" : { "locality" : { "Path" : "City" } } });
				delete oCTAddress["com.sap.vocabularies.Communication.v1.Contact"];

				assert.strictEqual(oParameter["sap:label"], "ID");
				delete oParameter["sap:label"];
				assert.deepEqual(oParameter["com.sap.vocabularies.Common.v1.Label"], {
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
				assert.strictEqual(oBusinessPartnerId["sap:creatable"], "false");
				delete oBusinessPartnerId["sap:creatable"];
				assert.strictEqual(oBusinessPartnerId["sap:updatable"], "false");
				delete oBusinessPartnerId["sap:updatable"];
				assert.deepEqual(oBusinessPartnerId["Org.OData.Core.V1.Computed"], {
					"Bool" : (i > 0 ? "false" : "true")
				}, "sap:creatable=false and sap:updatable=false on property level");
				delete oBusinessPartnerId["Org.OData.Core.V1.Computed"];

				// sap:creatable=true and sap:updatable=false on property level
				// sap:creatable=true is the default and thus no SAP V2 annotation is added
				assert.strictEqual(oAnyProperty["sap:updatable"], "false");
				delete oAnyProperty["sap:updatable"];
				assert.deepEqual(oAnyProperty["Org.OData.Core.V1.Immutable"], {
					"Bool" : "true"
				}, "sap:creatable=true and sap:updatable=false on property level");
				delete oAnyProperty["Org.OData.Core.V1.Immutable"];

				// sap:searchable
				assert.strictEqual(oVHSexSet["sap:searchable"], "true");
				delete oVHSexSet["sap:searchable"];
				assert.deepEqual(
					oBusinessPartnerSet["Org.OData.Capabilities.V1.SearchRestrictions"], {
						"Searchable": {"Bool" : (i > 0 ? "true" : "false")}
					}, "BusinessPartnerSet not searchable");
				delete oBusinessPartnerSet["Org.OData.Capabilities.V1.SearchRestrictions"];

				// sap:pageable
				assert.strictEqual(oVHSexSet["sap:pageable"], "false");
				delete oVHSexSet["sap:pageable"];
				assert.deepEqual(oVHSexSet["Org.OData.Capabilities.V1.TopSupported"],
					{"Bool" : "false"}, "VH_SexSet not TopSupported");
				assert.deepEqual(oVHSexSet["Org.OData.Capabilities.V1.SkipSupported"],
					{"Bool" : "false"}, "VH_SexSet not SkipSupported");
				delete oVHSexSet["Org.OData.Capabilities.V1.TopSupported"];
				delete oVHSexSet["Org.OData.Capabilities.V1.SkipSupported"];

				// sap:topable
				assert.strictEqual(oBusinessPartnerSet["sap:topable"], "false");
				delete oBusinessPartnerSet["sap:topable"];
				assert.deepEqual(oBusinessPartnerSet["Org.OData.Capabilities.V1.TopSupported"],
					{"Bool" : "false"}, "oBusinessPartnerSet not TopSupported");
				delete oBusinessPartnerSet["Org.OData.Capabilities.V1.TopSupported"];

				// sap:requires-filter
				assert.strictEqual(oBusinessPartnerSet["sap:requires-filter"], "true");
				delete oBusinessPartnerSet["sap:requires-filter"];
				assert.deepEqual(
					oBusinessPartnerSet["Org.OData.Capabilities.V1.FilterRestrictions"].
						RequiresFilter, {"Bool" : "true"}, "BusinessPartnerSet requires filter");
				delete oBusinessPartnerSet["Org.OData.Capabilities.V1.FilterRestrictions"].
					RequiresFilter;

				// sap:text
				assert.strictEqual(oBusinessPartnerId["sap:text"], "AnyProperty");
				delete oBusinessPartnerId["sap:text"];
				assert.deepEqual(oBusinessPartnerId["com.sap.vocabularies.Common.v1.Text"],
					{ "Path" : "AnyProperty" }, "BusinessPartnerId text");
				delete oBusinessPartnerId["com.sap.vocabularies.Common.v1.Text"];

				// sap:precision
				assert.strictEqual(oProductPrice["sap:precision"], "PriceScale");
				delete oProductPrice["sap:precision"];
				assert.deepEqual(oProductPrice["Org.OData.Measures.V1.Scale"],
					{ "Path" : "PriceScale" }, "ProductPrice precision");
				delete oProductPrice["Org.OData.Measures.V1.Scale"];

				// sap:unit - currency
				assert.strictEqual(oProductPrice["sap:unit"], "CurrencyCode");
				delete oProductPrice["sap:unit"];
				assert.strictEqual(oProductCurrencyCode["sap:semantics"], "currency-code");
				delete oProductCurrencyCode["sap:semantics"];
				assert.deepEqual(oProductPrice["Org.OData.Measures.V1.ISOCurrency"],
					{ "Path" : (i > 0 ? "CurrencyCodeFromAnnotation" : "CurrencyCode") },
					"ProductPrice currency");
				delete oProductPrice["Org.OData.Measures.V1.ISOCurrency"];
				// sap:unit - unit
				assert.strictEqual(oProductWeightMeasure["sap:unit"], "WeightUnit");
				delete oProductWeightMeasure["sap:unit"];
				assert.strictEqual(oProductWeightUnit["sap:semantics"], "unit-of-measure");
				delete oProductWeightUnit["sap:semantics"];
				assert.deepEqual(oProductWeightMeasure["Org.OData.Measures.V1.Unit"],
					{ "Path" : "WeightUnit" }, "ProductWeightMeasure unit");
				delete oProductWeightMeasure["Org.OData.Measures.V1.Unit"];

				// sap:field-control
				assert.strictEqual(oAnyProperty["sap:field-control"], "UX_FC_READONLY");
				delete oAnyProperty["sap:field-control"];
				assert.deepEqual(oAnyProperty["com.sap.vocabularies.Common.v1.FieldControl"],
					{ "Path" : "UX_FC_READONLY" }, "AnyProperty FieldControl");
				delete oAnyProperty["com.sap.vocabularies.Common.v1.FieldControl"];

				// sap:sortable
				assert.strictEqual(oBusinessPartnerId["sap:sortable"], "false");
				delete oBusinessPartnerId["sap:sortable"];
				assert.strictEqual(oAnyProperty["sap:sortable"], "false");
				delete oAnyProperty["sap:sortable"];
				assert.deepEqual(
					oBusinessPartnerSet["Org.OData.Capabilities.V1.SortRestrictions"], {
						"NonSortableProperties": [
							{"PropertyPath" : "BusinessPartnerID"},
							{"PropertyPath" : "AnyProperty"}
						]
					}, "BusinessPartnerSet not searchable");
				delete oBusinessPartnerSet["Org.OData.Capabilities.V1.SortRestrictions"];

				// sap:filterable
				assert.strictEqual(oAnyProperty["sap:filterable"], "false");
				delete oAnyProperty["sap:filterable"];
				assert.strictEqual(oNonFilterable["sap:filterable"], "false");
				delete oNonFilterable["sap:filterable"];
				assert.deepEqual(
					oBusinessPartnerSet["Org.OData.Capabilities.V1.FilterRestrictions"]
						["NonFilterableProperties"],
					i > 0 ? undefined :
						[
							{"PropertyPath" : "AnyProperty"},
							{"PropertyPath" : "NonFilterable"},
							// deprecated but still converted
							// TODO Remove Utils.addPropertyToAnnotation("sap:filterable"...) call
							// for navigation properties from calculateEntitySetAnnotations after
							// all annotation consumers have adjusted their code to use only
							// Org.OData.Capabilities.V1.NavigationRestrictions instead of
							// Org.OData.Capabilities.V1.FilterRestrictions for navigation
							// properties.
							{"PropertyPath" : "ToFoo"} // deprecated but still converted
						],
					"BusinessPartnerSet not filterable");
				delete oBusinessPartnerSet["Org.OData.Capabilities.V1.FilterRestrictions"]
					["NonFilterableProperties"];

				assert.deepEqual(
					oBusinessPartnerSet["Org.OData.Capabilities.V1.NavigationRestrictions"],
					{
						"RestrictedProperties" : [{
							"NavigationProperty" : {
								"NavigationPropertyPath" : "ToFoo"
							},
							"FilterRestrictions" : {
								"Filterable": {"Bool" : "false"}
							}
						}]
					},
					"Non filterable navigation property");
				delete oBusinessPartnerSet["Org.OData.Capabilities.V1.NavigationRestrictions"];

				assert.strictEqual(oToFooNavigationProperty["sap:filterable"], "false");
				delete oToFooNavigationProperty["sap:filterable"];

				// sap:required-in-filter
				assert.strictEqual(oBusinessPartnerId["sap:required-in-filter"], "true");
				delete oBusinessPartnerId["sap:required-in-filter"];
				// check that V4 annotations win
				assert.deepEqual(
					oBusinessPartnerSet["Org.OData.Capabilities.V1.FilterRestrictions"], {
						"RequiredProperties": i === 0
						? [ {"PropertyPath" : "BusinessPartnerID"} ]
						: [ {"PropertyPath" : "AnyProperty"} ]
					}, "BusinessPartnerSet filter restrictions");
				delete oBusinessPartnerSet["Org.OData.Capabilities.V1.FilterRestrictions"];

				// sap:semantics="yearmonthday" --> com.sap.vocabularies.Common.v1.IsCalendarDate
				assert.strictEqual(oYearMonthDay["sap:semantics"], "yearmonthday");
				delete oYearMonthDay["sap:semantics"];
				assert.deepEqual(
					oYearMonthDay["com.sap.vocabularies.Common.v1.IsCalendarDate"],
					{"Bool" : "true"},
					'sap:semantics="yearmonthday" --> ...Common.v1.IsCalendarDate');
				delete oYearMonthDay["com.sap.vocabularies.Common.v1.IsCalendarDate"];

				// sap:semantics for Communication.Contact
				// test only a subset of sap:semantics (different categories)
				oContact.property.forEach(function (oProperty) {
					// check only availability of sap:semantics
					// lift is tested multiple times before
					assert.ok(oProperty["sap:semantics"], oProperty.name + " has sap:semantics");
					delete oProperty["sap:semantics"];
				});
				assert.deepEqual(oContact["com.sap.vocabularies.Communication.v1.Contact"], i === 0
					? {
						"adr" : {
							"code" : { "Path" : "Zip" }
						},
						"n" : {
							"given" : { "Path" : "FirstName" },
							"prefix" : { "Path" : "Honorific" },
							"surname" : { "Path" : "LastName" }
						},
						"nickname" : { "Path" : "NickName" },
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
						"n" : {
							"additional" : { "Path" : "MiddleName" },
							"given" : { "Path" : "FirstName" },
							"prefix" : { "Path" : "Honorific" },
							"suffix" : { "Path" : "Suffix" },
							"surname" : { "Path" : "LastName" }
						},
						"nickname" : {
							// TODO why is EdmType contained here but not in properties in n above?
							"EdmType" : "Edm.String",
							"Path" : "NickName"
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

				assert.deepEqual(
					oContactTel["com.sap.vocabularies.Communication.v1.IsPhoneNumber"],
					{ "Bool" : "true" }, "IsPhoneNumber");
				delete oContactTel["com.sap.vocabularies.Communication.v1.IsPhoneNumber"];

				// sap:display-format
				assert.strictEqual(oAnyProperty["sap:display-format"], "NonNegative");
				delete oAnyProperty["sap:display-format"];
				oValue = oAnyProperty["com.sap.vocabularies.Common.v1.IsDigitSequence"];
				if (i === 2) {
					assert.deepEqual(oValue, {"Bool" : "true"}, "sap:display-format=NonNegative");
				} else {
					assert.deepEqual(oValue, { "Bool" : (i === 0 ? "true" : "false") },
						"sap:display-format=NonNegative");
				}
				delete oAnyProperty["com.sap.vocabularies.Common.v1.IsDigitSequence"];

				assert.strictEqual(oBusinessPartnerId["sap:display-format"], "UpperCase");
				delete oBusinessPartnerId["sap:display-format"];
				assert.deepEqual(
					oBusinessPartnerId["com.sap.vocabularies.Common.v1.IsUpperCase"], {
						"Bool" : "true"
					}, "sap:display-format=UpperCase");
				delete oBusinessPartnerId["com.sap.vocabularies.Common.v1.IsUpperCase"];

				// sap:heading
				assert.strictEqual(oNonFilterable["sap:heading"], "No Filter");
				delete oNonFilterable["sap:heading"];
				assert.deepEqual(oNonFilterable["com.sap.vocabularies.Common.v1.Heading"], {
					"String" : (i === 0 ? "No Filter" : "No Filter via Annotation")
				}, "sap:heading");
				delete oNonFilterable["com.sap.vocabularies.Common.v1.Heading"];

				// sap:quickinfo
				assert.strictEqual(oNonFilterable["sap:quickinfo"], "No Filtering");
				delete oNonFilterable["sap:quickinfo"];
				assert.deepEqual(oNonFilterable["com.sap.vocabularies.Common.v1.QuickInfo"], {
					"String" : (i === 0 ? "No Filtering" : "No Filtering via Annotation")
				}, "sap:quickinfo");
				delete oNonFilterable["com.sap.vocabularies.Common.v1.QuickInfo"];

				// sap:visible
				assert.strictEqual(oProductWeightUnit["sap:visible"], "false");
				delete oProductWeightUnit["sap:visible"];
				assert.strictEqual(oProductWeightMeasure["sap:visible"], "true");
				delete oProductWeightMeasure["sap:visible"];
				assert.deepEqual(
					oProductWeightUnit["com.sap.vocabularies.Common.v1.FieldControl"], {
						"EnumMember" : "com.sap.vocabularies.Common.v1.FieldControlType/" +
							(i === 0 ? "Hidden" : "ReadOnly")},
					"Product WeightUnit invisible");
				delete oProductWeightUnit["com.sap.vocabularies.Common.v1.FieldControl"];
				assert.deepEqual(oProductWeightUnit["com.sap.vocabularies.UI.v1.Hidden"],
					(i === 0 ? {"Bool" : "true"} : {"Bool" : "false"}),
					"Product WeightUnit invisible - UI.Hidden");
				delete oProductWeightUnit["com.sap.vocabularies.UI.v1.Hidden"];

				// sap:deletable-path (EntitySet)
				assert.strictEqual(oBusinessPartnerSet["sap:deletable-path"], "Deletable");
				delete oBusinessPartnerSet["sap:deletable-path"];
				assert.deepEqual(
					oBusinessPartnerSet["Org.OData.Capabilities.V1.DeleteRestrictions"],
					{ "Deletable" : { "Path" :
						( i === 0 ? "Deletable" : "DeletableFromAnnotation") }}, "deletable-path");
				delete oBusinessPartnerSet["Org.OData.Capabilities.V1.DeleteRestrictions"];

				// sap:updatable-path (EntitySet)
				assert.strictEqual(oBusinessPartnerSet["sap:updatable-path"], "Updatable");
				delete oBusinessPartnerSet["sap:updatable-path"];
				assert.deepEqual(
					oBusinessPartnerSet["Org.OData.Capabilities.V1.UpdateRestrictions"],
					{ "Updatable" : { "Path" :
						( i === 0 ? "Updatable" : "UpdatableFromAnnotation") }}, "updatable-path");
				delete oBusinessPartnerSet["Org.OData.Capabilities.V1.UpdateRestrictions"];

				// sap:filter-restriction (Property)
				assert.strictEqual(oBusinessPartnerId["sap:filter-restriction"], "multi-value");
				delete oBusinessPartnerId["sap:filter-restriction"];
				assert.strictEqual(oProductPrice["sap:filter-restriction"], "interval");
				delete oProductPrice["sap:filter-restriction"];
				assert.strictEqual(oProductCurrencyCode["sap:filter-restriction"], "single-value");
				delete oProductCurrencyCode["sap:filter-restriction"];

				sPrefix = "com.sap.vocabularies.Common.v1.";
				assert.deepEqual(oBusinessPartnerSet[sPrefix + "FilterExpressionRestrictions"], [{
						"Property" : { "PropertyPath" : "BusinessPartnerID" },
						"AllowedExpressions" : {
							"EnumMember" : sPrefix + "FilterExpressionType/MultiValue"
						}
					}], "filter-restriction at BusinessPartnerSet");
				delete oBusinessPartnerSet[sPrefix + "FilterExpressionRestrictions"];
				assert.deepEqual(oProductSet[sPrefix + "FilterExpressionRestrictions"],
					(i === 0 ? [{
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

				// sap:deletable/updatable-path after sap:deletable/updatable (EntitySet)
				assert.strictEqual(oProductSet["sap:deletable-path"], "Deletable");
				delete oProductSet["sap:deletable-path"];
				assert.strictEqual(oProductSet["sap:deletable"], "false");
				delete oProductSet["sap:deletable"];
				assert.deepEqual(
					oProductSet["Org.OData.Capabilities.V1.DeleteRestrictions"],
					{"Deletable" : {"Bool" : "false"}}, "deletable-path");
				delete oProductSet["Org.OData.Capabilities.V1.DeleteRestrictions"];
				assert.strictEqual(oProductSet["sap:updatable-path"], "Updatable");
				delete oProductSet["sap:updatable-path"];
				assert.strictEqual(oProductSet["sap:updatable"], "true");
				delete oProductSet["sap:updatable"];
				assert.deepEqual(
					oProductSet["Org.OData.Capabilities.V1.UpdateRestrictions"],
					{"Updatable" : {"Bool" : "false"}}, "updatable-path");
				delete oProductSet["Org.OData.Capabilities.V1.UpdateRestrictions"];
				assert.strictEqual(oProductSet["sap:searchable"], "true");
				delete oProductSet["sap:searchable"];

				// remove datajs artefact for inline annotations in $metadata
				// @see _ODataMetaModelUtils.merge
				delete oMetadata.dataServices.schema[0].annotations;

				assert.deepEqual(oMetaModelData, oMetadata, "nothing else left...");
				assert.notStrictEqual(oMetaModelData, oMetadata, "is clone");
			});
		});
	});

	//*********************************************************************************************
	// Note: http://www.html5rocks.com/en/tutorials/es6/promises/ says that
	// "Any errors thrown in the constructor callback will be implicitly passed to reject()."
	// We make sure the same happens even with our asynchronous constructor.
	[false, true].forEach(function (bAsync) {
		QUnit.test("Errors thrown inside load(), async = " + bAsync, function (assert) {
			var oError, oModel;

			this.oLogMock.expects("warning").exactly(bAsync ? 0 : 1)
				.withExactArgs(sIgnoreThisWarning);

			oError = new Error("This call failed intentionally");
			oModel = new (bAsync ? ODataModel : ODataModel1)("/fake/service", {
				annotationURI : "",
				json : true,
				loadMetadataAsync : bAsync
			});

			if (bAsync) {
				this.oLogMock.expects("error").withExactArgs(
					"error in ODataMetaModel.loaded(): " + oError.message, undefined,
					"sap.ui.model.odata.v2.ODataModel");
			}
			// Note: this is just a placeholder for "anything which could go wrong inside load()"
			this.mock(Model.prototype).expects("setDefaultBindingMode").throws(oError);

			// code under test
			return oModel.getMetaModel().loaded().then(function () {
				throw new Error("Unexpected success");
			}, function (ex) {
				assert.strictEqual(ex, oError, ex.message);
			});
		});
	});

	//*********************************************************************************************
	["annotations", "emptyAnnotations"].forEach(function (sAnnotation) {
		["emptyDataServices", "emptySchema", "emptyEntityType"].forEach(
			// Note: w/o dataServices, sap.ui.model.odata.ODataMetadata#_loadMetadata throws
			//   "Invalid metadata document"

			function (sPath) {
				QUnit.test("check that no errors happen for empty/missing structures:"
						+ sAnnotation + ", " + sPath, function (assert) {
					var oMetaModel, oModel;

					oModel = new ODataModel("/fake/" + sPath, {
						// annotations are mandatory for this test case
						annotationURI : "/fake/" + sAnnotation,
						json : true
					});

					// code under test
					oMetaModel = oModel.getMetaModel();

					return oMetaModel.loaded().then(function () {
						assert.strictEqual(oMetaModel.getODataEntityType("GWSAMPLE_BASIC.Product"),
							null, "getODataEntityType");
						assert.strictEqual(
							oMetaModel.getODataEntityType("GWSAMPLE_BASIC.Product", true),
							undefined, "getODataEntityType as path");
						assert.strictEqual(oMetaModel.getODataEntitySet("ProductSet"),
							null, "getODataEntitySet");
						assert.strictEqual(oMetaModel.getODataEntitySet("ProductSet", true),
							undefined, "getODataEntitySet as path");
						assert.strictEqual(oMetaModel.getODataFunctionImport("RegenerateAllData"),
							null, "getODataFunctionImport");
						assert.strictEqual(
							oMetaModel.getODataFunctionImport("RegenerateAllData", true),
							undefined, "getODataFunctionImport as path");
					});
				});
			}
		);
	});

	//*********************************************************************************************
	QUnit.test("getODataEntityContainer (as object or as path)", function (assert) {
		return withMetaModel(assert, function (oMetaModel) {
			var sPath = "/dataServices/schema/0/entityContainer/0",
				oEntityContainer = oMetaModel.getObject(sPath);

			assert.strictEqual(oMetaModel.getODataEntityContainer(), oEntityContainer);
			assert.strictEqual(oMetaModel.getODataEntityContainer(true), sPath);

			// find the single container even if it is not marked as default
			delete oEntityContainer.isDefaultEntityContainer;
			assert.strictEqual(oMetaModel.getODataEntityContainer(), oEntityContainer);
			assert.strictEqual(oMetaModel.getODataEntityContainer(true), sPath);
		});
	});

	//*********************************************************************************************
	QUnit.test("getODataEntityContainer (multiple containers)", function (assert) {
		return withMetaModel(assert, function (oMetaModel) {

			// multiple entity containers within single schema
			oMetaModel.getObject("/dataServices").schema = [{
				entityContainer : [{name : "A"}, {name : "B"}],
				namespace : "ignored"
			}];

			assert.strictEqual(oMetaModel.getODataEntityContainer(), null);
			assert.strictEqual(oMetaModel.getODataEntityContainer(true), undefined);
		});
	});

	//*********************************************************************************************
	QUnit.test("getODataEntityContainer (multiple schemas)", function (assert) {
		return withMetaModel(assert, function (oMetaModel) {

			// single entity container, but multiple schemas
			oMetaModel.getObject("/dataServices").schema = [{
				entityContainer : [{name : "ignored"}],
				namespace : "A"
			}, {
				namespace : "B"
			}];

			assert.strictEqual(oMetaModel.getODataEntityContainer(), null);
			assert.strictEqual(oMetaModel.getODataEntityContainer(true), undefined);
		});
	});
	// Note: see sEmptyDataServices and sEmptySchema for cases w/o schemas or w/o entity containers

	//*********************************************************************************************
	QUnit.test("getODataEntitySet", function (assert) {
		return withMetaModel(assert, function (oMetaModel) {
			assert.strictEqual(oMetaModel.getODataEntitySet("ProductSet"),
				oMetaModel.getObject("/dataServices/schema/0/entityContainer/0/entitySet/1"));
			assert.strictEqual(oMetaModel.getODataEntitySet("FooSet"), null);
			assert.strictEqual(oMetaModel.getODataEntitySet(), null);
		});
	});

	//*********************************************************************************************
	QUnit.test("getODataEntitySet as path", function (assert) {
		return withMetaModel(assert, function (oMetaModel) {
			assert.strictEqual(oMetaModel.getODataEntitySet("ProductSet", true),
				"/dataServices/schema/0/entityContainer/0/entitySet/1");
			assert.strictEqual(oMetaModel.getODataEntitySet("FooSet", true), undefined);
			assert.strictEqual(oMetaModel.getODataEntitySet(undefined, true), undefined);
		});
	});

	//*********************************************************************************************
	QUnit.test("getODataFunctionImport", function (assert) {
		return withMetaModel(assert, function (oMetaModel) {
			assert.strictEqual(oMetaModel.getODataFunctionImport("RegenerateAllData"),
				oMetaModel.getObject("/dataServices/schema/0/entityContainer/0/functionImport/0"));
			assert.strictEqual(oMetaModel.getODataFunctionImport(
				"GWSAMPLE_BASIC.GWSAMPLE_BASIC_Entities/RegenerateAllData"),
				oMetaModel.getObject("/dataServices/schema/0/entityContainer/0/functionImport/0"));
			assert.strictEqual(oMetaModel.getODataFunctionImport(
				"FOO_Bar/RegenerateAllData"),
				null);
			assert.strictEqual(oMetaModel.getODataFunctionImport("Foo"), null);
			assert.strictEqual(oMetaModel.getODataFunctionImport(), null);
		});
	});

	//*********************************************************************************************
	QUnit.test("getODataFunctionImport as path", function (assert) {
		return withMetaModel(assert, function (oMetaModel) {
			assert.strictEqual(oMetaModel.getODataFunctionImport("RegenerateAllData", true),
				"/dataServices/schema/0/entityContainer/0/functionImport/0");
			assert.strictEqual(oMetaModel.getODataFunctionImport("Foo", true), undefined);
			assert.strictEqual(oMetaModel.getODataFunctionImport(undefined, true), undefined);
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
	 * ==> SAP Gateway supports a single entity container only, and OData V4 has been adjusted
	 * accordingly.
	 */

	//*********************************************************************************************
	QUnit.test("getODataComplexType", function (assert) {
		return withMetaModel(assert, function (oMetaModel) {
			assert.strictEqual(oMetaModel.getODataComplexType("GWSAMPLE_BASIC.CT_Address"),
					oMetaModel.getObject("/dataServices/schema/0/complexType/0"));
			assert.strictEqual(oMetaModel.getODataComplexType("FOO.CT_Address"), null);
			assert.strictEqual(oMetaModel.getODataComplexType("GWSAMPLE_BASIC.Foo"), null);
			assert.strictEqual(oMetaModel.getODataComplexType("GWSAMPLE_BASIC"), null);
			assert.strictEqual(oMetaModel.getODataComplexType(), null);
		});
	});

	//*********************************************************************************************
	QUnit.test("getODataEntityType", function (assert) {
		return withMetaModel(assert, function (oMetaModel) {
			assert.strictEqual(oMetaModel.getODataEntityType("GWSAMPLE_BASIC.Product"),
				oMetaModel.getObject("/dataServices/schema/0/entityType/1"));
			assert.strictEqual(oMetaModel.getODataEntityType("FOO.Product"), null);
			assert.strictEqual(oMetaModel.getODataEntityType("GWSAMPLE_BASIC.Foo"), null);
			assert.strictEqual(oMetaModel.getODataEntityType("GWSAMPLE_BASIC"), null);
			assert.strictEqual(oMetaModel.getODataEntityType(), null);

			// change the namespace to contain a dot
			oMetaModel.getObject("/dataServices/schema/0").namespace = "GWSAMPLE.BASIC";
			assert.strictEqual(oMetaModel.getODataEntityType("GWSAMPLE.BASIC.Product"),
				oMetaModel.getObject("/dataServices/schema/0/entityType/1"));
		});
	});

	//*********************************************************************************************
	QUnit.test("getODataEntityType as path", function (assert) {
		return withMetaModel(assert, function (oMetaModel) {
			assert.strictEqual(oMetaModel.getODataEntityType("GWSAMPLE_BASIC.Product", true),
				"/dataServices/schema/0/entityType/1");
			assert.strictEqual(oMetaModel.getODataEntityType("FOO.Product", true), undefined);
			assert.strictEqual(oMetaModel.getODataEntityType("GWSAMPLE_BASIC.Foo", true),
				undefined);
			assert.strictEqual(oMetaModel.getODataEntityType("GWSAMPLE_BASIC", true), undefined);
			assert.strictEqual(oMetaModel.getODataEntityType(undefined, true), undefined);
		});
	});

	//*********************************************************************************************
	QUnit.test("getODataAssociationEnd", function (assert) {
		return withMetaModel(assert, function (oMetaModel) {
			var oEntityType = oMetaModel.getODataEntityType("GWSAMPLE_BASIC.Product");

			assert.strictEqual(oMetaModel.getODataAssociationEnd(oEntityType, "ToSupplier"),
				oMetaModel.getObject("/dataServices/schema/0/association/5/end/0"));
			assert.strictEqual(oMetaModel.getODataAssociationEnd(oEntityType, "ToFoo"), null);
			assert.strictEqual(oMetaModel.getODataAssociationEnd(null, "ToSupplier"), null);
			assert.strictEqual(oMetaModel.getODataAssociationEnd({}, "ToSupplier"), null);
		});
	});

	//*********************************************************************************************
	QUnit.test("getODataAssociation*Set*End", function (assert) {
		return withMetaModel(assert, function (oMetaModel) {
			var oEntityType = oMetaModel.getODataEntityType("GWSAMPLE_BASIC.Product");

			assert.strictEqual(oMetaModel.getODataAssociationSetEnd(oEntityType, "ToSupplier"),
				oMetaModel.getObject(
					"/dataServices/schema/0/entityContainer/0/associationSet/10/end/0"));
			assert.strictEqual(oMetaModel.getODataAssociationSetEnd(oEntityType, "ToFoo"), null);
			assert.strictEqual(oMetaModel.getODataAssociationSetEnd(null, "ToSupplier"), null);
			assert.strictEqual(oMetaModel.getODataAssociationSetEnd({}, "ToSupplier"), null);
		});
	});

	//*********************************************************************************************
	QUnit.test("getODataAssociation*Set*End: set not found", function (assert) {
		return withFakeService(assert, this.oLogMock, "", function (oMetaModel, oModel) {
				var oEntityType = oMetaModel.getODataEntityType("GWSAMPLE_BASIC.BusinessPartner");

				assert.strictEqual(
					oMetaModel.getODataAssociationSetEnd(oEntityType, "Corrupt"),
					null);
			});
	});

	//*********************************************************************************************
	QUnit.test("getODataAssociation*Set*End: entityContainer is undefined", function (assert) {
		var that = this;

		return withMetaModel(assert, function (oMetaModel) {
			var oEntityType = oMetaModel.getODataEntityType("GWSAMPLE_BASIC.Product");

			that.mock(oMetaModel).expects("getODataEntityContainer").returns(null);

			// code under test
			assert.strictEqual(oMetaModel.getODataAssociationSetEnd(oEntityType, "ToSupplier"),
				null);
		});
	});

	//*********************************************************************************************
	QUnit.test("getODataProperty", function (assert) {
		return withMetaModel(assert, function (oMetaModel) {
			var oComplexType = oMetaModel.getODataComplexType("GWSAMPLE_BASIC.CT_Address"),
				oEntityType = oMetaModel.getODataEntityType("GWSAMPLE_BASIC.BusinessPartner"),
				aParts;

			// entity type
			assert.strictEqual(oMetaModel.getODataProperty(oEntityType, "Address"),
				oMetaModel.getObject("/dataServices/schema/0/entityType/0/property/0"));
			assert.strictEqual(oMetaModel.getODataProperty(), null);
			assert.strictEqual(oMetaModel.getODataProperty(oEntityType), null);
			assert.strictEqual(oMetaModel.getODataProperty(oEntityType, "foo"), null);

			// complex type
			assert.strictEqual(oMetaModel.getODataProperty(oComplexType, "Street"),
				oMetaModel.getObject("/dataServices/schema/0/complexType/0/property/2"));
			assert.strictEqual(oMetaModel.getODataProperty(oComplexType), null);
			assert.strictEqual(oMetaModel.getODataProperty(oComplexType, "foo"), null);

			// {string[]} path
			aParts = ["foo"];
			assert.strictEqual(oMetaModel.getODataProperty(oEntityType, aParts), null);
			assert.strictEqual(aParts.length, 1, "no parts consumed");
			aParts = ["Address"];
			assert.strictEqual(oMetaModel.getODataProperty(oEntityType, aParts),
				oMetaModel.getObject("/dataServices/schema/0/entityType/0/property/0"));
			assert.strictEqual(aParts.length, 0, "all parts consumed");
			aParts = ["Address", "foo"];
			assert.strictEqual(oMetaModel.getODataProperty(oEntityType, aParts),
				oMetaModel.getObject("/dataServices/schema/0/entityType/0/property/0"));
			assert.strictEqual(aParts.length, 1, "one part consumed");
			aParts = ["Street"];
			assert.strictEqual(oMetaModel.getODataProperty(oComplexType, aParts),
				oMetaModel.getObject("/dataServices/schema/0/complexType/0/property/2"));
			assert.strictEqual(aParts.length, 0, "all parts consumed");
			aParts = ["Address", "Street"];
			assert.strictEqual(oMetaModel.getODataProperty(oEntityType, aParts),
				oMetaModel.getObject("/dataServices/schema/0/complexType/0/property/2"));
			assert.strictEqual(aParts.length, 0, "all parts consumed");
		});
	});

	//*********************************************************************************************
	QUnit.test("getODataProperty as path", function (assert) {
		return withMetaModel(assert, function (oMetaModel) {
			var oComplexType = oMetaModel.getODataComplexType("GWSAMPLE_BASIC.CT_Address"),
				oEntityType = oMetaModel.getODataEntityType("GWSAMPLE_BASIC.BusinessPartner"),
				aParts;

			// entity type
			assert.strictEqual(oMetaModel.getODataProperty(oEntityType, "Address", true),
				"/dataServices/schema/0/entityType/0/property/0");
			assert.strictEqual(oMetaModel.getODataProperty(null, "", true), undefined);
			assert.strictEqual(oMetaModel.getODataProperty(oEntityType, undefined, true),
				undefined);
			assert.strictEqual(oMetaModel.getODataProperty(oEntityType, "foo", true), undefined);

			// complex type
			assert.strictEqual(oMetaModel.getODataProperty(oComplexType, "Street", true),
				"/dataServices/schema/0/complexType/0/property/2");
			assert.strictEqual(oMetaModel.getODataProperty(oComplexType, undefined, true),
				undefined);
			assert.strictEqual(oMetaModel.getODataProperty(oComplexType, "foo", true), undefined);

			// {string[]} path
			aParts = ["foo"];
			assert.strictEqual(oMetaModel.getODataProperty(oEntityType, aParts, true), undefined);
			assert.strictEqual(aParts.length, 1, "no parts consumed");
			aParts = ["Address"];
			assert.strictEqual(oMetaModel.getODataProperty(oEntityType, aParts, true),
				"/dataServices/schema/0/entityType/0/property/0");
			assert.strictEqual(aParts.length, 0, "all parts consumed");
			aParts = ["Address", "foo"];
			assert.strictEqual(oMetaModel.getODataProperty(oEntityType, aParts, true),
				"/dataServices/schema/0/entityType/0/property/0");
			assert.strictEqual(aParts.length, 1, "one part consumed");
			aParts = ["Street"];
			assert.strictEqual(oMetaModel.getODataProperty(oComplexType, aParts, true),
				"/dataServices/schema/0/complexType/0/property/2");
			assert.strictEqual(aParts.length, 0, "all parts consumed");
			aParts = ["Address", "Street"];
			assert.strictEqual(oMetaModel.getODataProperty(oEntityType, aParts, true),
				"/dataServices/schema/0/complexType/0/property/2");
			assert.strictEqual(aParts.length, 0, "all parts consumed");
		});
	});

	//*********************************************************************************************
	QUnit.test("getMetaContext: empty data path", function (assert) {
		return withMetaModel(assert, function (oMetaModel) {
			assert.strictEqual(oMetaModel.getMetaContext(undefined), null);
			assert.strictEqual(oMetaModel.getMetaContext(null), null);
			assert.strictEqual(oMetaModel.getMetaContext(""), null);
		});
	});

	//*********************************************************************************************
	QUnit.test("getMetaContext: entity set only", function (assert) {
		return withMetaModel(assert, function (oMetaModel) {
			var oMetaContext = oMetaModel.getMetaContext("/ProductSet('ABC')");

			assert.ok(oMetaContext instanceof Context);
			assert.strictEqual(oMetaContext.getModel(), oMetaModel);
			assert.strictEqual(oMetaContext.getPath(), "/dataServices/schema/0/entityType/1");

			assert.strictEqual(oMetaModel.getMetaContext("/ProductSet('ABC')"), oMetaContext,
				"the context has been cached");

			assert.throws(function () {
				oMetaModel.getMetaContext("foo/bar");
			}, /Not an absolute path: foo\/bar/);
			assert.throws(function () {
				oMetaModel.getMetaContext("/FooSet('123')");
			}, /Entity set or function import not found: FooSet/);
			assert.throws(function () {
				oMetaModel.getMetaContext("/('123')");
			}, /Entity set or function import not found: /);
		});
	});

	//*********************************************************************************************
	QUnit.test("getMetaContext: entity set & navigation properties", function (assert) {
		return withMetaModel(assert, function (oMetaModel) {
			var oMetaContext = oMetaModel.getMetaContext("/ProductSet('ABC')/ToSupplier");

			assert.ok(oMetaContext instanceof Context);
			assert.strictEqual(oMetaContext.getModel(), oMetaModel);
			assert.strictEqual(oMetaContext.getPath(), "/dataServices/schema/0/entityType/0");

			assert.strictEqual(oMetaModel.getMetaContext("/ProductSet('ABC')/ToSupplier"),
				oMetaContext, "the context has been cached");

			assert.throws(function () {
				oMetaModel.getMetaContext("/ProductSet('ABC')/ToFoo(0)");
			}, /Property not found: ToFoo\(0\)/);

			assert.throws(function () {
				oMetaModel.getMetaContext("/ProductSet('ABC')/ToSupplier('ABC')");
			}, /Multiplicity is 1: ToSupplier\('ABC'\)/);

			// many navigation properties
			oMetaContext = oMetaModel.getMetaContext(
				"/SalesOrderSet('123')/ToLineItems(SalesOrderID='123',ItemPosition='1')/ToProduct"
				+ "/ToSupplier/ToContacts(guid'01234567-89AB-CDEF-0123-456789ABCDEF')");
			assert.strictEqual(oMetaContext.getPath(), "/dataServices/schema/0/entityType/4");
		});
	});

	//*********************************************************************************************
	QUnit.test("getMetaContext: entity set & property", function (assert) {
		return withMetaModel(assert, function (oMetaModel) {
			var sPath = "/ProductSet('ABC')/ProductID",
				oMetaContext = oMetaModel.getMetaContext(sPath);

			assert.ok(oMetaContext instanceof Context);
			assert.strictEqual(oMetaContext.getModel(), oMetaModel);
			assert.strictEqual(oMetaContext.getPath(),
				"/dataServices/schema/0/entityType/1/property/0");

			assert.strictEqual(oMetaModel.getMetaContext(sPath), oMetaContext, "cached");

			assert.throws(function () {
				oMetaModel.getMetaContext("/ProductSet('ABC')/ProductID(0)");
			}, /Property not found: ProductID\(0\)/);

			assert.throws(function () {
				oMetaModel.getMetaContext("/FooSet('123')/Bar");
			}, /Entity set or function import not found: FooSet/);
		});
	});

	//*********************************************************************************************
	QUnit.test("getMetaContext: entity set, navigation property & property", function (assert) {
		return withMetaModel(assert, function (oMetaModel) {
			var sPath = "/ProductSet('ABC')/ToSupplier/BusinessPartnerID",
				oMetaContext = oMetaModel.getMetaContext(sPath);

			assert.ok(oMetaContext instanceof Context);
			assert.strictEqual(oMetaContext.getModel(), oMetaModel);
			assert.strictEqual(oMetaContext.getPath(),
				"/dataServices/schema/0/entityType/0/property/1");

			assert.strictEqual(oMetaModel.getMetaContext(sPath), oMetaContext, "cached");

			assert.throws(function () {
				oMetaModel.getMetaContext("/ProductSet('ABC')/ToSupplier/Foo");
			}, /Property not found: Foo/);
		});
	});

	//*********************************************************************************************
	QUnit.test("getMetaContext: entity set & complex property", function (assert) {
		return withMetaModel(assert, function (oMetaModel) {
			var sPath = "/ProductSet('ABC')/ToSupplier/Address/Street",
				oMetaContext = oMetaModel.getMetaContext(sPath);

			assert.ok(oMetaContext instanceof Context);
			assert.strictEqual(oMetaContext.getModel(), oMetaModel);
			assert.strictEqual(oMetaContext.getPath(),
				"/dataServices/schema/0/complexType/0/property/2");

			assert.strictEqual(oMetaModel.getMetaContext(sPath), oMetaContext, "cached");

			assert.throws(function () {
				oMetaModel.getMetaContext("/ProductSet('ABC')/ToSupplier/Address/Foo");
			}, /Property not found: Foo/);

			//TODO "nested" complex types are supported, we just need an example
			assert.throws(function () {
				oMetaModel.getMetaContext("/ProductSet('ABC')/ToSupplier/Address/Street/AndSoOn");
			}, /Property not found: AndSoOn/);
		});
	});

	//*********************************************************************************************
	QUnit.test("getMetaContext: function import only", function (assert) {
		return withMetaModel(assert, function (oMetaModel) {
			var sPath = "/SalesOrder_Confirm",
				oMetaContext = oMetaModel.getMetaContext(sPath);

			assert.ok(oMetaContext instanceof Context);
			assert.strictEqual(oMetaContext.getModel(), oMetaModel);
			assert.strictEqual(oMetaContext.getPath(),
				"/dataServices/schema/0/entityContainer/0/functionImport/1");

			assert.strictEqual(oMetaModel.getMetaContext(sPath), oMetaContext, "cached");
		});
	});

	//*********************************************************************************************
	QUnit.test("getMetaContext: function import returning collection", function (assert) {
		return withFakeService(assert, this.oLogMock, "", function (oMetaModel) {
			var sPath = "/ReturnsCollection(0)/Price",
				oMetaContext = oMetaModel.getMetaContext(sPath);

			assert.ok(oMetaContext instanceof Context);
			assert.strictEqual(oMetaContext.getModel(), oMetaModel);
			assert.strictEqual(oMetaContext.getPath(),
				"/dataServices/schema/0/entityType/2/property/0");

			assert.strictEqual(oMetaModel.getMetaContext(sPath), oMetaContext, "cached");
		});
	});

	//*********************************************************************************************
	QUnit.test("getMetaContext: function import & navigation property", function (assert) {
		return withMetaModel(assert, function (oMetaModel) {
			var sPath = "/SalesOrder_Confirm/ToBusinessPartner",
				oMetaContext = oMetaModel.getMetaContext(sPath);

			assert.ok(oMetaContext instanceof Context);
			assert.strictEqual(oMetaContext.getModel(), oMetaModel);
			assert.strictEqual(oMetaContext.getPath(),
				"/dataServices/schema/0/entityType/0");

			assert.strictEqual(oMetaModel.getMetaContext(sPath), oMetaContext, "cached");

			assert.throws(function () {
				oMetaModel.getMetaContext("/SalesOrder_Confirm/ToBusinessPartner/Foo");
			}, /Property not found: Foo/);
		});
	});

	//*********************************************************************************************
	QUnit.test("getMetaContext: function import, navigation & complex property", function (assert) {
		return withMetaModel(assert, function (oMetaModel) {
			var sPath = "/SalesOrder_Confirm/ToBusinessPartner/Address/Street",
				oMetaContext = oMetaModel.getMetaContext(sPath);

			assert.ok(oMetaContext instanceof Context);
			assert.strictEqual(oMetaContext.getModel(), oMetaModel);
			assert.strictEqual(oMetaContext.getPath(),
				"/dataServices/schema/0/complexType/0/property/2");

			assert.strictEqual(oMetaModel.getMetaContext(sPath), oMetaContext, "cached");

			assert.throws(function () {
				oMetaModel.getMetaContext("/SalesOrder_Confirm/ToBusinessPartner/Address/Foo");
			}, /Property not found: Foo/);
		});
	});

	//*********************************************************************************************
	QUnit.test("getMetaContext: function import & complex type", function (assert) {
		return withMetaModel(assert, function (oMetaModel) {
			var sPath = "/RegenerateAllData/String",
				oMetaContext = oMetaModel.getMetaContext(sPath);

			assert.ok(oMetaContext instanceof Context);
			assert.strictEqual(oMetaContext.getModel(), oMetaModel);
			assert.strictEqual(oMetaContext.getPath(),
				"/dataServices/schema/0/complexType/1/property/0");

			assert.strictEqual(oMetaModel.getMetaContext(sPath), oMetaContext, "cached");

			assert.throws(function () {
				oMetaModel.getMetaContext("/RegenerateAllData/Foo");
			}, /Property not found: Foo/);
		});
	});

	//*********************************************************************************************
	QUnit.test("getODataValueLists: Metadata loaded completely, ValueList w/o qualifier",
		function (assert) {
			var that = this;

			return withMetaModel(assert, function (oMetaModel) {
				var oContext = oMetaModel.getMetaContext("/ProductSet(foo)/Category"),
					oEntityType = oMetaModel.getODataEntityType("GWSAMPLE_BASIC.Product"),
					oInterface = oMetaModel.oODataModelInterface,
					oPromise,
					oProperty = oMetaModel.getODataProperty(oEntityType, "Category");

				that.mock(oInterface).expects("addAnnotationUrl").never();

				oPromise = oMetaModel.getODataValueLists(oContext);

				oPromise.then(function (mValueLists) {
					assert.deepEqual(mValueLists,
						{"" : oProperty["com.sap.vocabularies.Common.v1.ValueList"]});
				});
				return oPromise;
			});
		}
	);

	//*********************************************************************************************
	QUnit.test("getODataValueLists: Metadata loaded completely, no ValueList", function (assert) {
		return withMetaModel(assert, function (oMetaModel) {
			var oContext = oMetaModel.getMetaContext("/ProductSet(foo)/TypeCode"),
				oPromise = oMetaModel.getODataValueLists(oContext);

			oPromise.then(function (mValueLists) {
				assert.deepEqual(mValueLists, {});
			});
			return oPromise;
		});
	});

	//*********************************************************************************************
	QUnit.test("getODataValueLists: Metadata loaded completely, multiple ValueLists",
		function (assert){
			return withGivenAnnotations(assert,
				["/GWSAMPLE_BASIC/annotations", "/fake/multipleValueLists"],
				function (oMetaModel) {
					var oContext = oMetaModel.getMetaContext("/ProductSet(foo)/WeightUnit"),
						oEntityType = oMetaModel.getODataEntityType("GWSAMPLE_BASIC.Product"),
						oPromise = oMetaModel.getODataValueLists(oContext),
						oProperty = oMetaModel.getODataProperty(oEntityType, "WeightUnit");

					oPromise.then(function (mValueLists) {
						assert.deepEqual(mValueLists, {
							"" : oProperty["com.sap.vocabularies.Common.v1.ValueList"],
							"FOO" : oProperty["com.sap.vocabularies.Common.v1.ValueList#FOO"]
						});
					});
					return oPromise;
				}
			);
		});

	//*********************************************************************************************
	QUnit.test("getODataValueLists: Metadata loaded w/o annot., separate value list load",
		// Note: "/FAR_CUSTOMER_LINE_ITEMS/annotations" contains
		// @com.sap.vocabularies.Common.v1.ValueList#DEBID_addtl, but we expect a request as long as
		// the annotation w/o qualifier is missing!
		function (assert) {
			var that = this;

			return withGivenService(assert, "/FAR_CUSTOMER_LINE_ITEMS",
					"/FAR_CUSTOMER_LINE_ITEMS/annotations", function (oMetaModel) {
				var oContext = oMetaModel.getMetaContext("/Items('foo')/Customer"),
					oPromise,
					fnSpy = that.spy(oMetaModel.oODataModelInterface, "addAnnotationUrl");

				// no sap:value-list => no request
				oMetaModel.getODataValueLists(
					oMetaModel.getMetaContext("/Items('foo')/GeneratedID"));
				assert.strictEqual(fnSpy.callCount, 0);

				// separate value list load
				oPromise = oMetaModel.getODataValueLists(oContext);
				assert.strictEqual(oMetaModel.getODataValueLists(oContext), oPromise,
					"promise cached");
				return oPromise.then(function (mValueLists) {
					assert.deepEqual(mValueLists, {
						"" : { //value list with no qualifier
							"CollectionPath" : {"String" : "VL_SH_DEBIA"},
							"Parameters" : [{
								"LocalDataProperty" : {"PropertyPath" : "Customer"},
								"ValueListProperty" : {"String" : "KUNNR"},
								"RecordType"
									: "com.sap.vocabularies.Common.v1.ValueListParameterInOut"
							}]
						},
						"DEBID" : { //value list for qualifier DEBID
							"CollectionPath" : {"String" : "VL_SH_DEBID"},
							"Parameters" : [{
								"LocalDataProperty" : {"PropertyPath" : "CompanyCode"},
								"ValueListProperty" : {"String" : "BUKRS"},
								"RecordType"
									: "com.sap.vocabularies.Common.v1.ValueListParameterInOut"
							}]
						},
						"DEBID_addtl" : { // from "/FAR_CUSTOMER_LINE_ITEMS/annotations"
							"CollectionPath" : {
								"String" : "VL_SH_DEBID"
							}
						}
					});

					assert.strictEqual(fnSpy.callCount, 1, "addAnnotationUrl once");
					assert.ok(fnSpy.calledWithExactly(
						"$metadata?sap-value-list=FAR_CUSTOMER_LINE_ITEMS.Item%2FCustomer"),
						"addAnnotationUrl arguments");

					assert.notStrictEqual(oMetaModel.getODataValueLists(oContext), oPromise,
						"resolved promises deleted from cache");

					return oMetaModel.getODataValueLists(oContext).then(function (mValueLists0) {
						assert.deepEqual(mValueLists0, mValueLists, "same result");
						assert.strictEqual(fnSpy.callCount, 1, "addAnnotationUrl not called again");
					});
				});
			});
		}
	);

	//*********************************************************************************************
	QUnit.test("getODataValueLists: addAnnotationUrl rejects", function (assert) {
		var that = this;

		return withGivenService(assert, "/FAR_CUSTOMER_LINE_ITEMS", null, function (oMetaModel) {
			var oContext = oMetaModel.getMetaContext("/Items('foo')/Customer"),
				oInterface = oMetaModel.oODataModelInterface,
				oMyError = new Error(),
				oPromise;

			that.mock(oInterface).expects("addAnnotationUrl")
				.returns(Promise.reject(oMyError));

			oPromise = oMetaModel.getODataValueLists(oContext);
			return oPromise.then(function () {
				throw new Error("Unexpected success");
			}, function (oError) {
				assert.strictEqual(oError, oMyError, "error propagated");
				assert.strictEqual(oMetaModel.getODataValueLists(oContext), oPromise,
					"rejected promises are cached");
			});
		});
	});

	//*********************************************************************************************
	["/Items('foo')/Invalid", "/Foos('foo')/Invalid"].forEach(function (sPath) {
		QUnit.test("getODataValueLists: reject invalid response for " + sPath, function (assert) {
			return withGivenService(
					assert, "/FAR_CUSTOMER_LINE_ITEMS", null, function (oMetaModel) {
				var oContext = oMetaModel.getMetaContext(sPath);

				return oMetaModel.getODataValueLists(oContext).then(function () {
					throw new Error("Unexpected success");
				}, function (oError) {
					assert.strictEqual(oError.message,
						"No value lists returned for " + oContext.getPath());
				});
			});
		});
	});

	//*********************************************************************************************
	QUnit.test("getODataValueLists: reject unsupported path", function (assert) {
		return withGivenService(assert, "/FAR_CUSTOMER_LINE_ITEMS", null, function (oMetaModel) {
			var oContext = oMetaModel.getMetaContext("/Items('foo')");

			assert.throws(function () {
				oMetaModel.getODataValueLists(oContext);
			}, /Unsupported property context with path \/dataServices\/schema\/0\/entityType\/0/);
		});
	});

	//*********************************************************************************************
	QUnit.test("getODataValueLists: request bundling", function (assert) {
		var that = this;

		return withGivenService(assert, "/FAR_CUSTOMER_LINE_ITEMS", null, function (oMetaModel) {
			var oCompanyCode = oMetaModel.getMetaContext("/Items('foo')/CompanyCode"),
				oCustomer = oMetaModel.getMetaContext("/Items('foo')/Customer"),
				oInterface = oMetaModel.oODataModelInterface,
				oPromiseCompanyCode,
				oPromiseCustomer;

			that.spy(oInterface, "addAnnotationUrl");

			// Note: "wrong" alphabetic order of calls to check that property names will be sorted!
			oPromiseCustomer = oMetaModel.getODataValueLists(oCustomer);
			oPromiseCompanyCode = oMetaModel.getODataValueLists(oCompanyCode);

			// check caching of pending requests
			assert.strictEqual(oMetaModel.getODataValueLists(oCompanyCode), oPromiseCompanyCode);
			assert.strictEqual(oMetaModel.getODataValueLists(oCustomer), oPromiseCustomer);

			return Promise.all([oPromiseCustomer, oPromiseCompanyCode]).then(function () {
				// check bundling
				assert.strictEqual(oInterface.addAnnotationUrl.callCount, 1,
					"addAnnotationUrl once");
				assert.strictEqual(oInterface.addAnnotationUrl.args[0][0],
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
	QUnit.test("_sendBundledRequest", function (assert) {
		var that = this;

		return withGivenService(assert, "/FAR_CUSTOMER_LINE_ITEMS", null, function (oMetaModel) {
			var oError = new Error(),
				oInterface = oMetaModel.oODataModelInterface,
				mQName2PendingRequest = {
					"BAR" : {
						resolve : function () {},
						reject : function () {}
					},
					"FOO" : {
						resolve : function () {},
						reject : function (oError) {
							assert.ok(false, oError);
						}
					}
				},
				oResponse = {
					annotations : {},
					entitySets : []
				},
				oPromise = Promise.resolve(oResponse);

			that.mock(oInterface).expects("addAnnotationUrl")
				.withExactArgs("$metadata?sap-value-list=BAR,FOO")
				.returns(oPromise);

			oMetaModel.mQName2PendingRequest = mQName2PendingRequest;

			// technical test: oResponse is delivered to all pending requests, regardless of
			// errors thrown
			that.mock(mQName2PendingRequest.BAR).expects("resolve")
				.withExactArgs(sinon.match.same(oResponse))
				.throws(oError);
			// if "resolve" handler throws, "reject" handler is called
			that.mock(mQName2PendingRequest.BAR).expects("reject")
				.withExactArgs(sinon.match.same(oError));
			that.mock(mQName2PendingRequest.FOO).expects("resolve")
				.withExactArgs(sinon.match.same(oResponse));

			// code under test
			oMetaModel._sendBundledRequest();

			// check bundling
			assert.deepEqual(Object.keys(oMetaModel.mQName2PendingRequest), [], "nothing pending");

			return oPromise.then(function (oResponse0) {
				assert.strictEqual(oResponse0, oResponse);
			});
		});
	});
	// Note: rejecting a promise in _sendBundledRequest() cannot realistically throw errors

	//*********************************************************************************************
	QUnit.test("getODataValueLists: Merge metadata with separate value list load", function (assert) {
		return withGivenService(assert, "/FAR_CUSTOMER_LINE_ITEMS", null, function (oMetaModel) {
			var oContext = oMetaModel.getMetaContext("/Items('foo')/Customer"),
				oItemSetLabel = oMetaModel.getODataEntitySet("Items")
					["com.sap.vocabularies.Common.v1.Label"],
				oItemTypeLabel = oMetaModel.getODataEntityType("FAR_CUSTOMER_LINE_ITEMS.Item")
					["com.sap.vocabularies.Common.v1.Label"];

			assert.ok(!oMetaModel.getODataEntitySet("VL_SH_DEBIA"));
			assert.ok(!oMetaModel.getODataEntitySet("VL_SH_DEBID"));
			assert.ok(!oMetaModel.getODataEntityType("FAR_CUSTOMER_LINE_ITEMS.VL_SH_DEBIA"));
			assert.ok(!oMetaModel.getODataEntityType("FAR_CUSTOMER_LINE_ITEMS.VL_SH_DEBID"));

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
				assert.notStrictEqual(oClonedSet_DEBIA, oSet_DEBIA);
				TestUtils.deepContains(oClonedSet_DEBID, oSet_DEBID);
				assert.notStrictEqual(oClonedSet_DEBID, oSet_DEBID);

				TestUtils.deepContains(oClonedType_DEBIA, oType_DEBIA);
				assert.notStrictEqual(oClonedType_DEBIA, oType_DEBIA);
				TestUtils.deepContains(oClonedType_DEBID, oType_DEBID);
				assert.notStrictEqual(oClonedType_DEBID, oType_DEBID);

				assert.strictEqual(
					oMetaModel.getODataEntitySet("Items")["com.sap.vocabularies.Common.v1.Label"],
					oItemSetLabel,
					"existing sets remain unchanged, as reference");
				assert.strictEqual(
					oMetaModel.getODataEntityType("FAR_CUSTOMER_LINE_ITEMS.Item")
						["com.sap.vocabularies.Common.v1.Label"],
					oItemTypeLabel,
					"existing types remain unchanged, as reference");

				// check that V4 annotations are properly merged and that V2 ones are lifted etc.
				assert.strictEqual(
					oClonedType_DEBIA.property[2/*LAND1*/]
						["com.sap.vocabularies.Common.v1.ValueList"].CollectionPath.String,
					"VL_SH_FARP_T005");
				assert.strictEqual(oClonedType_DEBIA.property[2/*LAND1*/]["sap:label"], "Country");
				assert.strictEqual(
					oClonedType_DEBIA.property[2/*LAND1*/]
						["com.sap.vocabularies.Common.v1.Label"].String,
					"Country");

				assert.strictEqual(oClonedSet_DEBIA["sap:creatable"], "false");
				assert.strictEqual(oClonedSet_DEBIA["sap:deletable"], "false");
				assert.deepEqual(
					oClonedSet_DEBIA["Org.OData.Capabilities.V1.InsertRestrictions"],
					{Insertable : {Bool : "false"}}, "V2 --> V4");
				assert.deepEqual(
					oClonedSet_DEBIA["Org.OData.Capabilities.V1.DeleteRestrictions"],
					{Deletable : {Bool : "true"}}, "V4 wins");
			});
		});
	});

	//*********************************************************************************************
	QUnit.test("getODataValueLists: Merge metadata with existing entity set", function (assert) {
		return withGivenService(assert, "/FAR_CUSTOMER_LINE_ITEMS", null, function (oMetaModel) {
			var oContext = oMetaModel.getMetaContext("/Items('foo')/CompanyCode"),
				aEntitySet = oMetaModel.getObject(
					"/dataServices/schema/0/entityContainer/0/entitySet"),
				iOriginalLength;

			// preparation: add dummy entity set with same name
			aEntitySet.push({name : "VL_SH_H_T001"});
			iOriginalLength = aEntitySet.length;

			return oMetaModel.getODataValueLists(oContext).then(function (mValueLists) {
				assert.strictEqual(aEntitySet.length, iOriginalLength, "set not added twice");
			});
		});
	});

	//*********************************************************************************************
	QUnit.test("getODataValueLists: Merge metadata with existing entity type", function (assert) {
		return withGivenService(assert, "/FAR_CUSTOMER_LINE_ITEMS", null, function (oMetaModel) {
			var oContext = oMetaModel.getMetaContext("/Items('foo')/CompanyCode"),
				aEntityType = oMetaModel.getObject("/dataServices/schema/0/entityType"),
				iOriginalLength;

			// preparation: add dummy entity type with same name
			aEntityType.push({name : "VL_SH_H_T001"});
			iOriginalLength = aEntityType.length;

			return oMetaModel.getODataValueLists(oContext).then(function (mValueLists) {
				assert.strictEqual(aEntityType.length, iOriginalLength, "type not added twice");
				assert.ok(oMetaModel.getODataEntitySet("VL_SH_H_T001"), "set is added");
			});
		});
	});

	//*********************************************************************************************
	QUnit.test("getODataValueLists: ValueList on ComplexType", function (assert) {
		var that = this;

		return withGivenService(assert, "/FAR_CUSTOMER_LINE_ITEMS", null, function (oMetaModel) {
			var oContext = oMetaModel.getMetaContext("/Items('foo')/Complex/Customer"),
				oInterface = oMetaModel.oODataModelInterface;

			that.spy(oInterface, "addAnnotationUrl");

			return oMetaModel.getODataValueLists(oContext).then(function (mValueLists) {
				assert.deepEqual(mValueLists, {
					"" : {
						"CollectionPath" : {"String" : "VL_SH_DEBIA"},
						"Parameters" : [{
							"LocalDataProperty" : {"PropertyPath" : "Customer"},
							"ValueListProperty" : {"String" : "KUNNR"},
							"RecordType" : "com.sap.vocabularies.Common.v1.ValueListParameterInOut"
						}]
					}
				});

				assert.ok(oInterface.addAnnotationUrl.calledWithExactly(
					"$metadata?sap-value-list=FAR_CUSTOMER_LINE_ITEMS.MyComplexType%2FCustomer"),
					oInterface.addAnnotationUrl.printf("addAnnotationUrl calls: %C"));
			});
		});
	});

	//*********************************************************************************************
	QUnit.test("load: Performance measurement points", function (assert) {
		var oAverageSpy, oEndSpy, oMetaModel, oModel;

		this.oLogMock.expects("warning").withExactArgs(sIgnoreThisWarning);

		oAverageSpy = this.spy(jQuery.sap.measure, "average")
			.withArgs("sap.ui.model.odata.ODataMetaModel/load", "", [sComponent]);
		oEndSpy = this.spy(jQuery.sap.measure, "end")
			.withArgs("sap.ui.model.odata.ODataMetaModel/load");
		oModel = new ODataModel1("/GWSAMPLE_BASIC", {
			annotationURI : "/GWSAMPLE_BASIC/annotations",
			json : true,
			loadMetadataAsync : true
		});
		oMetaModel = oModel.getMetaModel();

		assert.strictEqual(oAverageSpy.callCount, 0, "load start measurement before");
		assert.strictEqual(oEndSpy.callCount, 0, "load end measurement before");
		return oMetaModel.loaded().then(function () {
			assert.strictEqual(oAverageSpy.callCount, 1, "load start measurement after");
			assert.strictEqual(oEndSpy.callCount, 1, "load end measurement after");
			});
	});

	//*********************************************************************************************
	QUnit.test("destroy immediately", function (assert) {
		var oModel = new ODataModel("/GWSAMPLE_BASIC", {
				annotationURI : "/GWSAMPLE_BASIC/annotations",
				json : true,
				loadMetadataAsync : true
			}),
			oMetaModel = oModel.getMetaModel();

		this.oLogMock.expects("error")
			.withExactArgs("error in ODataMetaModel.loaded(): Meta model already destroyed",
				undefined, "sap.ui.model.odata.v2.ODataModel");

		oMetaModel.destroy();
		return oMetaModel.loaded().then(function () {
			assert.ok(false);
		}, function (oError) {
			assert.notOk(oMetaModel.oModel, "No model at the metamodel");
			assert.strictEqual(oError.message, "Meta model already destroyed");
		});
	});

	//*********************************************************************************************
	[false, true].forEach(function (bWarn) {
		QUnit.test("Get sap:semantics for sap:unit via a path, warn=" + bWarn, function (assert) {
			var oMetaModel, oModel;

			this.oLogMock.expects("isLoggable").twice()
				.withExactArgs(jQuery.sap.log.Level.WARNING, sComponent)
				.returns(bWarn);
			this.oLogMock.expects("warning").exactly(bWarn ? 1 : 0)
				.withExactArgs("Path 'Code' for sap:unit cannot be resolved",
					"foo.bar.Foo/BadPrice", sComponent);
			this.oLogMock.expects("warning").exactly(bWarn ? 1 : 0)
				.withExactArgs("Unsupported sap:semantics='wrongSemantics' "
						+ "at sap:unit='Currency/BadCode'; "
						+ "expected 'currency-code' or 'unit-of-measure'",
					"foo.bar.Foo/WrongSemantics", sComponent);

			oModel = new ODataModel("/fake/currencyCodeViaPath", {json : true});

			// code under test
			oMetaModel = oModel.getMetaModel();

			return oMetaModel.loaded().then(function () {
				assert.strictEqual(oMetaModel.getObject("/dataServices/schema/"
						+ "[${namespace}==='foo.bar']/entityType/"
						+ "[$\{name}==='Product']/property/[$\{name}==='Price']/"
						+ "Org.OData.Measures.V1.ISOCurrency/Path"),
					"to_Currency/Code");
				assert.strictEqual(oMetaModel.getObject("/dataServices/schema/"
						+ "[${namespace}==='foo.bar']/complexType/"
						+ "[$\{name}==='Foo']/property/[$\{name}==='Price']/"
						+ "Org.OData.Measures.V1.ISOCurrency/Path"),
					"Currency/Code");
				assert.notOk("undefined" in oMetaModel.getObject("/dataServices/schema/"
						+ "[${namespace}==='foo.bar']/complexType/"
						+ "[$\{name}==='Foo']/property/[$\{name}==='WrongSemantics']"));
			});
		});
	});

	//TODO support getODataValueLists with reference to complex type property via entity type
	//TODO protect against addAnnotationUrl calls from outside ODataMetaModel?

	//TODO our errors do not include sufficient detail for error analysis, e.g. a full path
	//TODO errors and warnings intentionally created should not be logged to console
});
