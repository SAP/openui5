/*!
 * ${copyright}
 */
// The SandboxModel is used in the manifest instead of OData V4 model for the following purposes:
// For the "realOData" case, the URL is adapted to a proxy URL and certain constructor parameters
// are taken from URL parameters.
// For the "non-realOData" case, a mock server for the backend requests is set up.
sap.ui.define([
	"sap/ui/core/sample/common/SandboxModelHelper",
	"sap/ui/model/odata/v4/ODataModel"
], function (SandboxModelHelper, ODataModel) {
	"use strict";

	var oMockData = {
		mFixture : {
			"$metadata" : {source : "metadata.xml"},
			"Artists?$orderby=CreatedAt&$filter=IsActiveEntity%20eq%20true&$select=ArtistUUID,CountryOfOrigin_Text,FoundingYear,HasDraftEntity,IsActiveEntity,Name&$skip=0&$top=10" : {
				source : "ArtistsList_0.json"
			},
			"Artists(ArtistUUID=005056ab-6fd8-1ee8-9ff2-ae6f1e73c206,IsActiveEntity=true)?$select=ArtistUUID,BreakupYear,CountryOfOrigin,CountryOfOrigin_Text,FoundingYear,IsActiveEntity,Name,RegionOfOrigin,RegionOfOrigin_Text" : {
				source : "Artist_elvis.json"
			},
			"Artists(ArtistUUID=005056ab-6fd8-1ee8-9ff2-ae6f1e740206,IsActiveEntity=true)?$select=ArtistUUID,BreakupYear,CountryOfOrigin,CountryOfOrigin_Text,FoundingYear,IsActiveEntity,Name,RegionOfOrigin,RegionOfOrigin_Text" : {
				source : "Artist_queen.json"
			},
			"Artists(ArtistUUID=005056ab-6fd8-1ee8-9ff2-ae6f1e73c206,IsActiveEntity=true)/com.sap.gateway.srvd.sadl_gw_appmusicdr_definition.v0001.EditAction?$select=ArtistUUID,BreakupYear,CountryOfOrigin,CountryOfOrigin_Text,FoundingYear,IsActiveEntity,Name,RegionOfOrigin,RegionOfOrigin_Text" : {
				source : "Artist_elvis_draft.json"
			},
			"POST Artists(ArtistUUID=005056ab-6fd8-1ee8-9ff2-ae6f1e73c206,IsActiveEntity=true)/com.sap.gateway.srvd.sadl_gw_appmusicdr_definition.v0001.EditAction?$select=ArtistUUID,BreakupYear,CountryOfOrigin,CountryOfOrigin_Text,FoundingYear,IsActiveEntity,Name,RegionOfOrigin,RegionOfOrigin_Text" : {
				source : "Artist_elvis_draft.json"
			},
			"Artists(ArtistUUID=005056ab-6fd8-1ee8-a794-502aecd26758,IsActiveEntity=false)/com.sap.gateway.srvd.sadl_gw_appmusicdr_definition.v0001.ActivationAction?$select=ArtistUUID,BreakupYear,CountryOfOrigin,CountryOfOrigin_Text,FoundingYear,IsActiveEntity,Name,RegionOfOrigin,RegionOfOrigin_Text" : {
				source : "Artist_elvis_draft_activation.json"
			},
			"POST /sap/opu/odata4/sap/sadl_gw_appmusic_draft/srvd/sap/sadl_gw_appmusicdr_definition/0001/Artists(ArtistUUID=005056ab-6fd8-1ee8-9ff2-ae6f1e73c206,IsActiveEntity=false)/com.sap.gateway.srvd.sadl_gw_appmusicdr_definition.v0001.ActivationAction?$select=ArtistUUID,BreakupYear,CountryOfOrigin,CountryOfOrigin_Text,FoundingYear,IsActiveEntity,Name,RegionOfOrigin,RegionOfOrigin_Text" : {
				source : "Artist_elvis.json"
			},
			"POST Artists" : {
				source : "Artist_create.json"
			},
			"Artists(ArtistUUID=005056ab-6fd8-1ee8-9ff2-ae6f1e73c007,IsActiveEntity=false)?$select=ArtistUUID,CountryOfOrigin_Text,FoundingYear,HasDraftEntity,IsActiveEntity,Name" : {
				source : "Artist_create.json"
			},
			"Artists(ArtistUUID=005056ab-6fd8-1ee8-9ff2-ae6f1e73c007,IsActiveEntity=false)?$select=ArtistUUID,BreakupYear,CountryOfOrigin,CountryOfOrigin_Text,FoundingYear,IsActiveEntity,Name,RegionOfOrigin,RegionOfOrigin_Text" : {
				source : "Artist_create.json"
			},
			"POST Artists(ArtistUUID=005056ab-6fd8-1ee8-9ff2-ae6f1e73c007,IsActiveEntity=false)/com.sap.gateway.srvd.sadl_gw_appmusicdr_definition.v0001.ActivationAction?$select=ArtistUUID,BreakupYear,CountryOfOrigin,CountryOfOrigin_Text,FoundingYear,IsActiveEntity,Name,RegionOfOrigin,RegionOfOrigin_Text" : {
				source : "Artist_create_activation.json"
			},
			"Artists(ArtistUUID=005056ab-6fd8-1ee8-9ff2-ae6f1e73c206,IsActiveEntity=true)/_Publication?$orderby=ReleaseDate&$select=CurrencyCode,IsActiveEntity,Name,Price,PublicationUUID,ReleaseDate&$skip=0&$top=10" : {
				source : "Elvis_Publications.json"
			},
			"Artists(ArtistUUID=005056ab-6fd8-1ee8-9ff2-ae6f1e73c206,IsActiveEntity=false)/_Publication?$orderby=ReleaseDate&$select=CurrencyCode,IsActiveEntity,Name,Price,PublicationUUID,ReleaseDate&$skip=0&$top=10" : {
				source : "Elvis_Publications_draft.json"
			},
			"Artists(ArtistUUID=005056ab-6fd8-1ee8-9ff2-ae6f1e73c206,IsActiveEntity=true)/_Publication(PublicationUUID=fa163e7a-d4f1-1ed8-b5eb-5ee09a2ba28f,IsActiveEntity=true)?$select=CurrencyCode,IsActiveEntity,Name,Price,PublicationUUID,ReleaseDate" : {
				source : "Elvis_Publication_0.json"
			},
			"Artists(ArtistUUID=005056ab-6fd8-1ee8-9ff2-ae6f1e73c206,IsActiveEntity=false)/_Publication(PublicationUUID=fa163e7a-d4f1-1ed8-b5eb-5ee09a2ba28f,IsActiveEntity=false)?$select=CurrencyCode,IsActiveEntity,Name,Price,PublicationUUID,ReleaseDate" : {
				source : "Elvis_Publication_0_draft.json"
			}
		},
		sFilterBase : "//sap/opu/odata4/sap/sadl_gw_appmusic_draft/srvd/sap/sadl_gw_appmusicdr_definition/0001/",
		sSourceBase : "sap/ui/core/sample/odata/v4/MusicArtists/data"
	};

	return ODataModel.extend("sap.ui.core.sample.odata.v4.MusicArtists.SandboxModel", {
		constructor : function (mParameters) {
			return SandboxModelHelper.adaptModelParametersAndCreateModel(mParameters, oMockData);
		}
	});
});