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
				"$metadata" : {
					source : "metadataV2.xml"
				},
				"EdmTypesCollection?$select=Boolean,Byte,GlobalUID,ID,Int16,Int32,SByte,String&$skip=0&$top=100" : {
					source : "EdmTypesV2.json"
				},
				"EdmTypesCollection('1')?$select=Binary,Boolean,Byte,Date,DateTime,DateTimeOffset,Decimal,Double,Float,GlobalUID,ID,Int16,Int32,Int64,SByte,Single,String,Time" : {
					source : "EdmTypesV2_SingleEntity.json"
				}
			},
			sFilterBase : "/sap/opu/odata/sap/ZUI5_EDM_TYPES/",
			sSourceBase : "sap/ui/core/sample/odata/v4/ConsumeV2Service/data"
		};

	return ODataModel.extend("sap.ui.core.sample.odata.v4.ConsumeV2Service.SandboxModel", {
		constructor : function (mParameters) {
			return SandboxModelHelper.adaptModelParametersAndCreateModel(mParameters, oMockData);
		}
	});
});