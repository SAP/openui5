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