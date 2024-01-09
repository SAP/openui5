/*!
 * ${copyright}
 */
sap.ui.define([
	"sap/ui/core/qunit/analytics/o4aFakeService"
], function (o4aFakeService) {
	"use strict";
	/**
	 * the $metadata response
	 */
	o4aFakeService.addResponse({

		uri: "$metadata",

		header: o4aFakeService.headers.METADATA,

		content: "<edmx:Edmx Version=\"1.0\"\n" +
		"	xmlns:edmx=\"http://schemas.microsoft.com/ado/2007/06/edmx\" xmlns:sap=\"http://www.sap.com/Protocols/SAPData\">\n" +
		"	<edmx:DataServices m:DataServiceVersion=\"2.0\"\n" +
		"		xmlns:m=\"http://schemas.microsoft.com/ado/2007/08/dataservices/metadata\">\n" +
		"		<Schema Namespace=\"servicemock\"\n" +
		"			xmlns:d=\"http://schemas.microsoft.com/ado/2007/08/dataservices\"\n" +
		"			xmlns:m=\"http://schemas.microsoft.com/ado/2007/08/dataservices/metadata\"\n" +
		"			xmlns=\"http://schemas.microsoft.com/ado/2008/09/edm\">\n" +
		"			<EntityType Name=\"ActualPlannedCostsResultsType\"\n" +
		"				sap:semantics=\"aggregate\">\n" +
		"				<Key>\n" +
		"					<PropertyRef Name=\"id\" />\n" +
		"				</Key>\n" +
		"				<Property Name=\"id\" Type=\"Edm.String\" Nullable=\"false\"\n" +
		"					MaxLength=\"2147483647\" sap:filterable=\"false\" />\n" +
		"				<Property Name=\"ControllingArea\" Type=\"Edm.String\"\n" +
		"					MaxLength=\"4\" sap:aggregation-role=\"dimension\" sap:label=\"Controlling Area\"\n" +
		"					sap:text=\"ControllingAreaText\" />\n" +
		"				<Property Name=\"ControllingAreaLevel\" Type=\"Edm.Integer\" sap:hierarchy-level-for=\"ControllingArea\"/>\n" +
		"				<Property Name=\"CostCenter\" Type=\"Edm.String\" MaxLength=\"10\"\n" +
		"					sap:aggregation-role=\"dimension\" sap:label=\"Cost Center\" sap:text=\"CostCenterText\"\n" +
		"					sap:super-ordinate=\"ControllingArea\" />\n" +
		"				<Property Name=\"CostCenterLevel\" Type=\"Edm.Integer\" sap:hierarchy-level-for=\"CostCenter\"/>\n" +
		"				<Property Name=\"FiscalVariant\" Type=\"Edm.String\" MaxLength=\"2\"\n" +
		"					sap:aggregation-role=\"dimension\" sap:label=\"Fiscal Variant\" />\n" +
		"				<Property Name=\"FiscalPeriod\" Type=\"Edm.String\" MaxLength=\"7\"\n" +
		"					sap:aggregation-role=\"dimension\" sap:label=\"Fiscal Period\" />\n" +
		"				<Property Name=\"FiscalYear\" Type=\"Edm.String\" MaxLength=\"4\"\n" +
		"					sap:aggregation-role=\"dimension\" sap:label=\"Fiscal Year\" />\n" +
		"				<Property Name=\"CostElement\" Type=\"Edm.String\" MaxLength=\"10\"\n" +
		"					sap:aggregation-role=\"dimension\" sap:label=\"Cost Element\" sap:text=\"CostElementText\"\n" +
		"					sap:super-ordinate=\"ControllingArea\" />\n" +
		"				<Property Name=\"ValueType\" Type=\"Edm.String\" MaxLength=\"2\"\n" +
		"					sap:aggregation-role=\"dimension\" sap:label=\"Value Type\" />\n" +
		"				<Property Name=\"CurrencyType\" Type=\"Edm.String\" MaxLength=\"2\"\n" +
		"					sap:aggregation-role=\"dimension\" sap:label=\"Currency Type\"\n" +
		"					sap:attribute-for=\"Currency\" />\n" +
		"				<Property Name=\"Currency\" Type=\"Edm.String\" MaxLength=\"5\"\n" +
		"					sap:semantics=\"currency-code\" sap:aggregation-role=\"dimension\"\n" +
		"					sap:label=\"Currency\" />\n" +
		"				<Property Name=\"CostElementText\" Type=\"Edm.String\"\n" +
		"					MaxLength=\"40\" sap:label=\"Cost Element\" sap:attribute-for=\"CostElement\" />\n" +
		"				<Property Name=\"CostCenterText\" Type=\"Edm.String\"\n" +
		"					MaxLength=\"40\" sap:label=\"Cost Center\" sap:attribute-for=\"CostCenter\" />\n" +
		"				<Property Name=\"ControllingAreaText\" Type=\"Edm.String\"\n" +
		"					MaxLength=\"40\" sap:label=\"Controlling Area\" sap:attribute-for=\"ControllingArea\" />\n" +
		"				<Property Name=\"ActualCosts\" Type=\"Edm.Decimal\" Precision=\"34\"\n" +
		"					sap:filterable=\"false\" sap:aggregation-role=\"measure\" sap:label=\"Actual Costs\"\n" +
		"					sap:unit=\"Currency\" />\n" +
		"				<Property Name=\"PlannedCosts\" Type=\"Edm.Decimal\" Precision=\"34\"\n" +
		"					sap:filterable=\"false\" sap:aggregation-role=\"measure\" sap:label=\"Planned Costs\"\n" +
		"					sap:unit=\"Currency\" />\n" +
		"				<Property Name=\"ActualPlannedCostsDifference\" Type=\"Edm.Decimal\"\n" +
		"					Precision=\"34\" sap:filterable=\"false\" sap:aggregation-role=\"measure\"\n" +
		"					sap:label=\"Actual Planned Costs Difference\" sap:unit=\"Currency\" />\n" +
		"				<Property Name=\"ActualPlannedCostsPercentage\" Type=\"Edm.Decimal\"\n" +
		"					Precision=\"34\" sap:filterable=\"false\" sap:aggregation-role=\"measure\"\n" +
		"					sap:label=\"Actual Planned Costs Percentage\" />\n" +
		"				<!-- Dimensions without labels / texts -->\n" +
		"				<Property Name=\"ControllingAreaNoText\" Type=\"Edm.String\"\n" +
		"					MaxLength=\"4\" sap:aggregation-role=\"dimension\" sap:label=\"Controlling Area\"\n />\n" +
		"				<Property Name=\"ControllingAreaNoTextNoLabel\" Type=\"Edm.String\"\n" +
		"					MaxLength=\"4\" sap:aggregation-role=\"dimension\" />\n" +
		"				<Property Name=\"ControllingAreaNoTextEmptyLabel\" Type=\"Edm.String\"\n" +
		"					MaxLength=\"4\" sap:aggregation-role=\"dimension\" sap:label=\"\" />\n" +
		"				<Property Name=\"ControllingAreaWithTextEmptyLabel\" Type=\"Edm.String\"\n" +
		"					MaxLength=\"4\" sap:aggregation-role=\"dimension\" sap:label=\"\"\n" +
		"					sap:text=\"ControllingAreaText2\" />\n" +
		"				<Property Name=\"ControllingAreaText2\" Type=\"Edm.String\"\n" +
		"					MaxLength=\"40\" sap:label=\"Controlling Area2\" sap:attribute-for=\"ControllingAreaWithTextEmptyLabel\" />\n" +
		"				<!-- property of type Edm.Time for grouping SNOW: CS20230006325114 -->\n" +
		"				<Property Name=\"CreationTime\" Type=\"Edm.Time\" sap:label=\"Created At\" sap:aggregation-role=\"dimension\" />\n" +
		"				<!-- Ordinary properties -->\n" +
		"				<Property Name=\"Property0\" Type=\"Edm.String\" />\n" +
		"				<Property Name=\"Property1\" Type=\"Edm.String\" />\n" +
		"				<NavigationProperty Name=\"ControllingAreaDetails\"\n" +
		"					Relationship=\"servicemock.ControllingAreaToMasterDataType\"\n" +
		"					FromRole=\"ActualPlannedCostsResultsDependent\" ToRole=\"ControllingAreasPrincipal\" sap:hierarchy-node-for=\"ControllingArea\"/>\n" +
		"				<NavigationProperty Name=\"CostCenterDetails\"\n" +
		"					Relationship=\"servicemock.CostCenterToMasterDataType\"\n" +
		"					FromRole=\"ActualPlannedCostsResultsDependent\" ToRole=\"CostCentersPrincipal\" sap:hierarchy-node-for=\"CostCenter\"/>\n" +
		"				<NavigationProperty Name=\"CostElementDetails\"\n" +
		"					Relationship=\"servicemock.CostElementToMasterDataType\"\n" +
		"					FromRole=\"ActualPlannedCostsResultsDependent\" ToRole=\"CostElementsPrincipal\" sap:hierarchy-node-for=\"CostElement\"/>\n" +
		"			</EntityType>\n" +
		"			<EntityType Name=\"ActualPlannedCostsType\" sap:semantics=\"parameters\">\n" +
		"				<Key>\n" +
		"					<PropertyRef Name=\"P_ControllingArea\" />\n" +
		"					<PropertyRef Name=\"P_CostCenter\" />\n" +
		"					<PropertyRef Name=\"P_CostCenterTo\" />\n" +
		"				</Key>\n" +
		"				<Property Name=\"P_ControllingArea\" Type=\"Edm.String\"\n" +
		"					Nullable=\"false\" MaxLength=\"4\" sap:label=\"Controlling Area\"\n" +
		"					sap:parameter=\"mandatory\" />\n" +
		"				<Property Name=\"P_CostCenter\" Type=\"Edm.String\" Nullable=\"false\"\n" +
		"					MaxLength=\"10\" sap:label=\"Cost Center\" sap:parameter=\"mandatory\"\n" +
		"					sap:upper-boundary=\"P_CostCenterTo\" sap:super-ordinate=\"ControllingArea\"\n" +
		"					sap:filterable=\"false\" />\n" +
		"				<Property Name=\"P_CostCenterTo\" Type=\"Edm.String\" Nullable=\"false\"\n" +
		"					MaxLength=\"10\" sap:label=\"Cost Center To\" sap:parameter=\"mandatory\"\n" +
		"					sap:lower-boundary=\"P_CostCenter\" sap:super-ordinate=\"ControllingArea\"\n" +
		"					sap:filterable=\"false\" />\n" +
		"				<NavigationProperty Name=\"Results\"\n" +
		"					Relationship=\"servicemock.ActualPlannedCosts_ActualPlannedCostsResultsType\"\n" +
		"					FromRole=\"ActualPlannedCostsPrincipal\" ToRole=\"ActualPlannedCostsResultsDependent\" />\n" +
		"			</EntityType>\n" +
		"			<EntityType Name=\"ControllingAreasType\">\n" +
		"				<Key>\n" +
		"					<PropertyRef Name=\"ControllingArea\" />\n" +
		"				</Key>\n" +
		"				<Property Name=\"ControllingArea\" Type=\"Edm.String\"\n" +
		"					Nullable=\"false\" MaxLength=\"4\" sap:aggregation-role=\"dimension\"\n" +
		"					sap:label=\"Controlling Area\" sap:text=\"Text\" />\n" +
		"				<Property Name=\"Currency\" Type=\"Edm.String\" MaxLength=\"5\"\n" +
		"					sap:aggregation-role=\"dimension\" sap:label=\"Currency\" />\n" +
		"				<Property Name=\"FiscalVariant\" Type=\"Edm.String\" MaxLength=\"2\"\n" +
		"					sap:aggregation-role=\"dimension\" sap:label=\"Fiscal Variant\" />\n" +
		"				<Property Name=\"Text\" Type=\"Edm.String\" MaxLength=\"40\"\n" +
		"					sap:label=\"Text\" />\n" +
		"			</EntityType>\n" +
		"			<EntityType Name=\"CostCenterResultsType\">\n" +
		"				<Key>\n" +
		"					<PropertyRef Name=\"P_KeyDate\" />\n" +
		"					<PropertyRef Name=\"ControllingArea\" />\n" +
		"					<PropertyRef Name=\"CostCenter\" />\n" +
		"				</Key>\n" +
		"				<Property Name=\"P_KeyDate\" Type=\"Edm.DateTime\" Nullable=\"false\" />\n" +
		"				<Property Name=\"ControllingArea\" Type=\"Edm.String\"\n" +
		"					Nullable=\"false\" MaxLength=\"4\" sap:aggregation-role=\"dimension\"\n" +
		"					sap:label=\"Controlling Area\" />\n" +
		"				<Property Name=\"CostCenter\" Type=\"Edm.String\" Nullable=\"false\"\n" +
		"					MaxLength=\"10\" sap:aggregation-role=\"dimension\" sap:label=\"Cost Center\"\n" +
		"					sap:text=\"Text\" />\n" +
		"				<Property Name=\"PersonResponsible\" Type=\"Edm.String\"\n" +
		"					MaxLength=\"20\" sap:aggregation-role=\"dimension\" sap:label=\"Person Responsible\" />\n" +
		"				<Property Name=\"ValidFromDate\" Type=\"Edm.DateTime\"\n" +
		"					sap:aggregation-role=\"dimension\" sap:label=\"ValidFromDate\" />\n" +
		"				<Property Name=\"ValidToDate\" Type=\"Edm.DateTime\"\n" +
		"					sap:aggregation-role=\"dimension\" sap:label=\"ValidToDate\" />\n" +
		"				<Property Name=\"Text\" Type=\"Edm.String\" MaxLength=\"40\"\n" +
		"					sap:label=\"Text\" />\n" +
		"			</EntityType>\n" +
		"			<EntityType Name=\"CostCentersTemporalViewType\"\n" +
		"				sap:semantics=\"parameters\">\n" +
		"				<Key>\n" +
		"					<PropertyRef Name=\"P_KeyDate\" />\n" +
		"				</Key>\n" +
		"				<Property Name=\"P_KeyDate\" Type=\"Edm.DateTime\" Nullable=\"false\"\n" +
		"					sap:label=\"Key Date\" sap:parameter=\"mandatory\" />\n" +
		"				<NavigationProperty Name=\"Results\"\n" +
		"					Relationship=\"servicemock.CostCentersTemporalView_CostCenterResultsType\"\n" +
		"					FromRole=\"CostCentersTemporalViewPrincipal\" ToRole=\"CostCenterResultsDependent\" />\n" +
		"			</EntityType>\n" +
		"			<EntityType Name=\"CostCentersType\">\n" +
		"				<Key>\n" +
		"					<PropertyRef Name=\"ControllingArea\" />\n" +
		"					<PropertyRef Name=\"CostCenter\" />\n" +
		"				</Key>\n" +
		"				<Property Name=\"ControllingArea\" Type=\"Edm.String\"\n" +
		"					Nullable=\"false\" MaxLength=\"4\" sap:aggregation-role=\"dimension\"\n" +
		"					sap:label=\"Controlling Area\" />\n" +
		"				<Property Name=\"CostCenter\" Type=\"Edm.String\" Nullable=\"false\"\n" +
		"					MaxLength=\"10\" sap:aggregation-role=\"dimension\" sap:label=\"Cost Center\"\n" +
		"					sap:text=\"Text\" />\n" +
		"				<Property Name=\"PersonResponsible\" Type=\"Edm.String\"\n" +
		"					MaxLength=\"20\" sap:aggregation-role=\"dimension\" sap:label=\"Person Responsible\" />\n" +
		"				<Property Name=\"Text\" Type=\"Edm.String\" MaxLength=\"40\"\n" +
		"					sap:label=\"Text\" />\n" +
		"			</EntityType>\n" +
		"			<EntityType Name=\"CostElementsType\">\n" +
		"				<Key>\n" +
		"					<PropertyRef Name=\"ControllingArea\" />\n" +
		"					<PropertyRef Name=\"CostElement\" />\n" +
		"				</Key>\n" +
		"				<Property Name=\"ControllingArea\" Type=\"Edm.String\"\n" +
		"					Nullable=\"false\" MaxLength=\"4\" sap:aggregation-role=\"dimension\"\n" +
		"					sap:label=\"Controlling Area\" />\n" +
		"				<Property Name=\"CostElement\" Type=\"Edm.String\" Nullable=\"false\"\n" +
		"					MaxLength=\"10\" sap:aggregation-role=\"dimension\" sap:label=\"Cost Element\"\n" +
		"					sap:text=\"Text\" />\n" +
		"				<Property Name=\"Text\" Type=\"Edm.String\" MaxLength=\"40\"\n" +
		"					sap:label=\"Text\" />\n" +
		"			</EntityType>\n" +
		"			<!-- EntityType for hierarchy support -->\n" +
		"			<EntityType Name=\"TypeWithHierarchies\"\n" +
		"				sap:label=\"Cost Centers: Actual/Planned Costs (hry only)\"\n" +
		"				sap:semantics=\"aggregate\"\n" +
		"				sap:content-version=\"1\">\n" +
		"				<Key>\n" +
		"					<PropertyRef Name=\"ID\"/>\n" +
		"				</Key>\n" +
		"				<Property Name=\"ID\" Type=\"Edm.String\" Nullable=\"false\" sap:filterable=\"false\"\n" +
		"					sap:updatable=\"false\" sap:sortable=\"false\"/>\n" +
		"				<Property Name=\"TotaledProperties\" Type=\"Edm.String\"\n" +
		"					sap:aggregation-role=\"totaled-properties-list\" sap:is-annotation=\"true\"\n" +
		"						sap:updatable=\"false\" sap:sortable=\"false\"/>\n" +
		"				<Property Name=\"CostCenter\" Type=\"Edm.String\" MaxLength=\"15\"\n" +
		"					sap:aggregation-role=\"dimension\" sap:creatable=\"false\"\n" +
		"					sap:text=\"CostCenterText\" sap:updatable=\"false\" sap:label=\"Cost Center\"/>\n" +
		"				<Property Name=\"CostCenter_NodeID\" Type=\"Edm.String\" MaxLength=\"281\"\n" +
		"					sap:filter-restriction=\"multi-value\" sap:hierarchy-node-for=\"CostCenter\"\n" +
		"					sap:text=\"CostCenter_NodeText\" sap:label=\"Cost Center Node ID\"\n" +
		"					sap:sortable=\"false\"/>\n" +
		"				<Property Name=\"CostCenter_NodeIDExt\" Type=\"Edm.String\" MaxLength=\"250\"\n" +
		"					sap:filterable=\"false\" sap:hierarchy-node-external-key-for=\"CostCenter_NodeID\"\n" +
		"					sap:text=\"CostCenter_NodeText\" sap:label=\"Cost Center Node ID External\"\n" +
		"					sap:sortable=\"false\"/>\n" +
		"				<Property Name=\"CostCenter_NodeText\" Type=\"Edm.String\" MaxLength=\"60\"\n" +
		"					sap:filterable=\"false\" sap:label=\"Cost Center Node Text\" sap:sortable=\"false\"/>\n" +
		"				<Property Name=\"CostCenter_ParentID\" Type=\"Edm.String\" MaxLength=\"281\"\n" +
		"					sap:filter-restriction=\"multi-value\" sap:hierarchy-parent-node-for=\"CostCenter_NodeID\"\n" +
		"					sap:label=\"Cost Center Parent ID\" sap:sortable=\"false\"/>\n" +
		"				<Property Name=\"CostCenter_Level\" Type=\"Edm.Int16\" sap:filter-restriction=\"multi-value\"\n" +
		"					sap:hierarchy-level-for=\"CostCenter_NodeID\" sap:label=\"Cost Center Level\"\n" +
		"					sap:sortable=\"false\"/>\n" +
		"				<Property Name=\"CostCenter_Drillstate\" Type=\"Edm.String\" MaxLength=\"9\"\n" +
		"					sap:filterable=\"false\" sap:hierarchy-drill-state-for=\"CostCenter_NodeID\"\n" +
		"					sap:is-annotation=\"true\" sap:label=\"Cost Center Drilldown State\" sap:sortable=\"false\"/>\n" +
		"				<Property Name=\"CostCenter_Nodecount\" Type=\"Edm.Int16\" sap:filterable=\"false\"\n" +
		"					sap:hierarchy-node-descendant-count-for=\"CostCenter_NodeID\" sap:is-annotation=\"true\"\n" +
		"					sap:label=\"Cost Center Counter for Descendant Nodes\" sap:sortable=\"false\"/>\n" +
		"				<Property Name=\"CostCenterText\" Type=\"Edm.String\" MaxLength=\"1333\" sap:creatable=\"false\"\n" +
		"					sap:filterable=\"false\" sap:updatable=\"false\" sap:label=\"Cost Center (Description)\"/>\n" +
		"				<Property Name=\"CostElement\" Type=\"Edm.String\" MaxLength=\"15\"\n" +
		"					sap:aggregation-role=\"dimension\" sap:creatable=\"false\" sap:text=\"CostElementText\"\n" +
		"					sap:updatable=\"false\" sap:label=\"Cost Element\"/>\n" +
		"				<Property Name=\"CostElementText\" Type=\"Edm.String\" MaxLength=\"1333\" sap:creatable=\"false\"\n" +
		"					sap:filterable=\"false\" sap:updatable=\"false\" sap:label=\"Cost Element (Description)\"/>\n" +
		"				<Property Name=\"ActualCosts\" Type=\"Edm.Decimal\" Precision=\"42\" Scale=\"2\"\n" +
		"					sap:aggregation-role=\"measure\" sap:creatable=\"false\" sap:filterable=\"false\"\n" +
		"					sap:text=\"ActualCosts_F\" sap:unit=\"ActualCosts_E\" sap:updatable=\"false\"\n" +
		"					sap:label=\"Actual Costs\"/>\n" +
		"				<Property Name=\"ActualCosts_F\" Type=\"Edm.String\" MaxLength=\"60\" sap:creatable=\"false\"\n" +
		"					sap:filterable=\"false\" sap:updatable=\"false\" sap:label=\"Actual Costs (Formatted)\"/>\n" +
		"				<Property Name=\"ActualCosts_E\" Type=\"Edm.String\" MaxLength=\"5\" sap:creatable=\"false\"\n" +
		"					sap:filterable=\"false\" sap:updatable=\"false\" sap:label=\"Actual Costs (Currency)\"\n" +
		"					sap:semantics=\"currency-code\"/>\n" +
		"				<Property Name=\"CostElement_NodeID\" Type=\"Edm.String\" MaxLength=\"281\"\n" +
		"					sap:filter-restriction=\"multi-value\" sap:hierarchy-node-for=\"CostElement\"\n" +
		"					sap:sortable=\"false\"/>\n" +
		"				<Property Name=\"CostElement_Level\" Type=\"Edm.Int16\" sap:filter-restriction=\"multi-value\"\n" +
		"					sap:hierarchy-level-for=\"CostElement_NodeID\" sap:label=\"Cost Element Level\"\n" +
		"					sap:sortable=\"false\"/>\n" +
		"			</EntityType>\n" +
		"			<!-- Entity type with a measure with a sap:text annotation -->\n" +
		"			<EntityType Name=\"CONTRACTPERFType\" sap:semantics=\"aggregate\"\n" +
		"				 sap:content-version=\"1\">\n" +
		"				<Key>\n" +
		"					<PropertyRef Name=\"ID\"/>\n" +
		"				</Key>\n" +
		"				<Property Name=\"ID\" Type=\"Edm.String\" Nullable=\"false\"/>\n" +
		"				<Property Name=\"SalesDocument\" Type=\"Edm.String\" MaxLength=\"10\"\n" +
		"					sap:aggregation-role=\"dimension\"/>\n" +
		"				<Property Name=\"SalesOrganization\" Type=\"Edm.String\"\n" +
		"					MaxLength=\"4\" sap:aggregation-role=\"dimension\"/>\n" +
		"				<Property Name=\"CostOvrWithhold\" Type=\"Edm.Decimal\"\n" +
		"					Precision=\"42\" Scale=\"2\" sap:aggregation-role=\"measure\"\n" +
		"					sap:text=\"CostOvrWithhold_F\" sap:unit=\"TransactionCurrency\"/>\n" +
		"				<Property Name=\"CostOvrWithhold_F\" Type=\"Edm.String\"\n" +
		"					 MaxLength=\"60\"/>\n" +
		"				<Property Name=\"TransactionCurrency\" Type=\"Edm.String\"\n" +
		"					MaxLength=\"5\" sap:aggregation-role=\"dimension\"\n" +
		"					sap:semantics=\"currency-code\"/>\n" +
		"				<Property Name=\"CostInGlobalCurrency\" Type=\"Edm.Decimal\"\n" +
		"					Precision=\"42\" Scale=\"2\" sap:aggregation-role=\"measure\"\n" +
		"					sap:text=\"CostInGlobalCurrency_F\" sap:unit=\"GlobalCurrency\"/>\n" +
		"				<Property Name=\"CostInGlobalCurrency_F\" Type=\"Edm.String\"\n" +
		"					 MaxLength=\"60\"/>\n" +
		"				<Property Name=\"GlobalCurrency\" Type=\"Edm.String\"\n" +
		"					MaxLength=\"5\" sap:aggregation-role=\"dimension\"\n" +
		"					sap:semantics=\"currency-code\"/>\n" +
		"			</EntityType>\n" +
		"			<Association Name=\"ActualPlannedCosts_ActualPlannedCostsResultsType\">\n" +
		"				<End Type=\"servicemock.ActualPlannedCostsType\" Role=\"ActualPlannedCostsPrincipal\"\n" +
		"					Multiplicity=\"*\" />\n" +
		"				<End Type=\"servicemock.ActualPlannedCostsResultsType\"\n" +
		"					Role=\"ActualPlannedCostsResultsDependent\" Multiplicity=\"*\" />\n" +
		"			</Association>\n" +
		"			<Association Name=\"CostCentersTemporalView_CostCenterResultsType\">\n" +
		"				<End Type=\"servicemock.CostCentersTemporalViewType\"\n" +
		"					Role=\"CostCentersTemporalViewPrincipal\" Multiplicity=\"*\" />\n" +
		"				<End Type=\"servicemock.CostCenterResultsType\" Role=\"CostCenterResultsDependent\"\n" +
		"					Multiplicity=\"*\" />\n" +
		"			</Association>\n" +
		"			<Association Name=\"ControllingAreaToMasterDataType\">\n" +
		"				<End Type=\"servicemock.ControllingAreasType\" Role=\"ControllingAreasPrincipal\"\n" +
		"					Multiplicity=\"1\" />\n" +
		"				<End Type=\"servicemock.ActualPlannedCostsResultsType\"\n" +
		"					Role=\"ActualPlannedCostsResultsDependent\" Multiplicity=\"*\" />\n" +
		"				<ReferentialConstraint>\n" +
		"					<Principal Role=\"ControllingAreasPrincipal\">\n" +
		"						<PropertyRef Name=\"ControllingArea\" />\n" +
		"					</Principal>\n" +
		"					<Dependent Role=\"ActualPlannedCostsResultsDependent\">\n" +
		"						<PropertyRef Name=\"ControllingArea\" />\n" +
		"					</Dependent>\n" +
		"				</ReferentialConstraint>\n" +
		"			</Association>\n" +
		"			<Association Name=\"CostCenterToMasterDataType\">\n" +
		"				<End Type=\"servicemock.CostCentersType\" Role=\"CostCentersPrincipal\"\n" +
		"					Multiplicity=\"1\" />\n" +
		"				<End Type=\"servicemock.ActualPlannedCostsResultsType\"\n" +
		"					Role=\"ActualPlannedCostsResultsDependent\" Multiplicity=\"*\" />\n" +
		"				<ReferentialConstraint>\n" +
		"					<Principal Role=\"CostCentersPrincipal\">\n" +
		"						<PropertyRef Name=\"CostCenter\" />\n" +
		"					</Principal>\n" +
		"					<Dependent Role=\"ActualPlannedCostsResultsDependent\">\n" +
		"						<PropertyRef Name=\"CostCenter\" />\n" +
		"					</Dependent>\n" +
		"				</ReferentialConstraint>\n" +
		"			</Association>\n" +
		"			<Association Name=\"CostElementToMasterDataType\">\n" +
		"				<End Type=\"servicemock.CostElementsType\" Role=\"CostElementsPrincipal\"\n" +
		"					Multiplicity=\"1\" />\n" +
		"				<End Type=\"servicemock.ActualPlannedCostsResultsType\"\n" +
		"					Role=\"ActualPlannedCostsResultsDependent\" Multiplicity=\"*\" />\n" +
		"				<ReferentialConstraint>\n" +
		"					<Principal Role=\"CostElementsPrincipal\">\n" +
		"						<PropertyRef Name=\"CostElement\" />\n" +
		"					</Principal>\n" +
		"					<Dependent Role=\"ActualPlannedCostsResultsDependent\">\n" +
		"						<PropertyRef Name=\"CostElement\" />\n" +
		"					</Dependent>\n" +
		"				</ReferentialConstraint>\n" +
		"			</Association>\n" +
		"			<EntityContainer Name=\"CCA\"\n" +
		"				m:IsDefaultEntityContainer=\"true\">\n" +
		"				<EntitySet Name=\"ActualPlannedCostsResults\"\n" +
		"					EntityType=\"servicemock.ActualPlannedCostsResultsType\"\n" +
		"					sap:addressable=\"false\" />\n" +
		"				<EntitySet Name=\"ActualPlannedCosts\"\n" +
		"					EntityType=\"servicemock.ActualPlannedCostsType\"\n" +
		"					sap:addressable=\"false\" />\n" +
		"				<EntitySet Name=\"ControllingAreas\" EntityType=\"servicemock.ControllingAreasType\" />\n" +
		"				<EntitySet Name=\"CostCenterResults\"\n" +
		"					EntityType=\"servicemock.CostCenterResultsType\"\n" +
		"					sap:addressable=\"false\" />\n" +
		"				<EntitySet Name=\"CostCentersTemporalView\"\n" +
		"					EntityType=\"servicemock.CostCentersTemporalViewType\"\n" +
		"					sap:addressable=\"false\" />\n" +
		"				<EntitySet Name=\"CostCenters\" EntityType=\"servicemock.CostCentersType\" />\n" +
		"				<EntitySet Name=\"CostElements\" EntityType=\"servicemock.CostElementsType\" />\n" +
		"				<!-- EntitySet for hierarchy support -->\n" +
		"				<EntitySet Name=\"TypeWithHierarchiesResults\" \n" +
		"					EntityType=\"servicemock.TypeWithHierarchies\"\n" +
		"					sap:creatable=\"false\" sap:updatable=\"false\" sap:deletable=\"false\"\n" +
		"					sap:addressable=\"false\" sap:content-version=\"1\"/>\n" +
		"				<!-- EntitySet for type with measure having sap:text annotation -->\n" +
		"				<EntitySet Name=\"CONTRACTPERFResults\" \n" +
		"					EntityType=\"servicemock.CONTRACTPERFType\"\n" +
		"					sap:creatable=\"false\" sap:updatable=\"false\" sap:deletable=\"false\"\n" +
		"					sap:content-version=\"1\"/>\n" +
		"				<AssociationSet Name=\"ActualPlannedCosts_ActualPlannedCostsResults\"\n" +
		"					Association=\"servicemock.ActualPlannedCosts_ActualPlannedCostsResultsType\">\n" +
		"					<End Role=\"ActualPlannedCostsPrincipal\" EntitySet=\"ActualPlannedCosts\" />\n" +
		"					<End Role=\"ActualPlannedCostsResultsDependent\" EntitySet=\"ActualPlannedCostsResults\" />\n" +
		"				</AssociationSet>\n" +
		"				<AssociationSet Name=\"CostCentersTemporalView_CostCenterResults\"\n" +
		"					Association=\"servicemock.CostCentersTemporalView_CostCenterResultsType\">\n" +
		"					<End Role=\"CostCentersTemporalViewPrincipal\" EntitySet=\"CostCentersTemporalView\" />\n" +
		"					<End Role=\"CostCenterResultsDependent\" EntitySet=\"CostCenterResults\" />\n" +
		"				</AssociationSet>\n" +
		"				<AssociationSet Name=\"ControllingAreaToMasterData\"\n" +
		"					Association=\"servicemock.ControllingAreaToMasterDataType\">\n" +
		"					<End Role=\"ControllingAreasPrincipal\" EntitySet=\"ControllingAreas\" />\n" +
		"					<End Role=\"ActualPlannedCostsResultsDependent\" EntitySet=\"ActualPlannedCostsResults\" />\n" +
		"				</AssociationSet>\n" +
		"				<AssociationSet Name=\"CostCenterToMasterData\"\n" +
		"					Association=\"servicemock.CostCenterToMasterDataType\">\n" +
		"					<End Role=\"CostCentersPrincipal\" EntitySet=\"CostCenters\" />\n" +
		"					<End Role=\"ActualPlannedCostsResultsDependent\" EntitySet=\"ActualPlannedCostsResults\" />\n" +
		"				</AssociationSet>\n" +
		"				<AssociationSet Name=\"CostElementToMasterData\"\n" +
		"					Association=\"servicemock.CostElementToMasterDataType\">\n" +
		"					<End Role=\"CostElementsPrincipal\" EntitySet=\"CostElements\" />\n" +
		"					<End Role=\"ActualPlannedCostsResultsDependent\" EntitySet=\"ActualPlannedCostsResults\" />\n" +
		"				</AssociationSet>\n" +
		"			</EntityContainer>\n" +
		"		</Schema>\n" +
		"	</edmx:DataServices>\n" +
		"</edmx:Edmx>"
	});

	return o4aFakeService;
});