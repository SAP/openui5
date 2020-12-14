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
					source : "metadata.xml"
				},
				"ContactList(42010aef-0de5-1eea-af8f-5bce865f0879)?$select=ContactGUID,EmailAddress,FirstName,LastName" : {
					source : "Contact.json"
				},
				"PATCH ContactList(42010aef-0de5-1eea-af8f-5bce865f0879)" : {
					code : 204
				},
				"ContactList(42010aef-0de5-1eea-af8f-5bce865f0879)?$select=FirstName,LastName" : {
					source : "Contact_SideEffects.json"
				}
			},
			sFilterBase : "/sap/opu/odata4/sap/zui5_testv4/default/sap/zui5_epm_sample/0002/",
			sSourceBase : "sap/ui/core/sample/odata/v4/FieldGroups/data"
		};

	return ODataModel.extend("sap.ui.core.sample.odata.v4.FieldGroups.SandboxModel", {
		constructor : function (mParameters) {
			return SandboxModelHelper.adaptModelParametersAndCreateModel(mParameters, oMockData);
		}
	});
});
