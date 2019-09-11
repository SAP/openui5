/*!
 * ${copyright}
 */

// Provides a sandbox for this component:
// For the "realOData" case when the component runs with backend, the v4.ODataModel constructor
//   is wrapped so that the URL is adapted to a proxy URL and certain constructor parameters are
//   taken from URL parameters
// For the "non-realOData" case, sets up a mock server for the backend requests.
//
// Note: For setup to work properly, this module has to be loaded *before* model instantiation
//   from the component's manifest. Add it as "js" resource to sap.ui5/resources in the
//   manifest.json to achieve that.
sap.ui.define([
	"sap/base/util/UriParameters",
	"sap/ui/model/odata/v4/ODataModel",
	"sap/ui/test/TestUtils",
	'sap/ui/thirdparty/sinon'
], function (UriParameters, ODataModel, TestUtils, sinon) {
	"use strict";

	var oSandbox = sinon.sandbox.create();

	function adaptModelConstructor() {
		var Constructor = sap.ui.model.odata.v4.ODataModel;

		oSandbox.stub(sap.ui.model.odata.v4, "ODataModel", function (mParameters) {
			var oUriParameters = UriParameters.fromQuery(window.location.search),
				sUpdateGroupId = oUriParameters.get("updateGroupId")
					|| TestUtils.retrieveData(
						"sap.ui.core.sample.odata.v4.MusicArtists.updateGroupId")
					|| mParameters.updateGroupId;

			// clone: do not modify constructor call parameter
			mParameters = Object.assign({}, mParameters, {
				earlyRequests : oUriParameters.get("earlyRequests") !== "false",
				groupId : oUriParameters.get("$direct") ? "$direct" : mParameters.groupId,
				serviceUrl : TestUtils.proxy(mParameters.serviceUrl),
				updateGroupId : sUpdateGroupId
			});
			return new Constructor(mParameters);
		});
	}

	function setupMockServer() {
		TestUtils.setupODataV4Server(oSandbox, {
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
		}, "sap/ui/core/sample/odata/v4/MusicArtists/data",
		"/sap/opu/odata4/sap/sadl_gw_appmusic_draft/srvd/sap/sadl_gw_appmusicdr_definition/0001/");
	}

	if (TestUtils.isRealOData()) {
		adaptModelConstructor();
	} else {
		setupMockServer();
	}

	TestUtils.setData("sap.ui.core.sample.odata.v4.MusicArtists.sandbox", oSandbox);
});