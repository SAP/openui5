/*!
 * ${copyright}
 */
// The SandboxModel is used in the manifest instead of OData V4 model for the following purposes:
// Certain constructor parameters are taken from URL parameters. For the "non-realOData" case, a
// mock server for the back-end requests is set up.
sap.ui.define([
	"sap/ui/core/sample/common/SandboxModelHelper",
	"sap/ui/model/odata/v4/ODataModel"
], function (SandboxModelHelper, ODataModel) {
	"use strict";

	var oMockData = {
			sFilterBase : "/sap/opu/odata4/sap/zui5_testv4/default/sap/zui5_epm_sample/0002/",
			mFixture : {
				"ContactList(42010aef-0de5-1eea-af8f-5bce865f0879)?$select=ContactGUID,EmailAddress,FirstName,LastName" : {
					message : {
						ContactGUID : "42010aef-0de5-1eea-af8f-5bce865f0879",
						FirstName : "Karl",
						LastName : "Müller",
						EmailAddress : "customer-do.not.reply@sap.com"
					}
				},
				"PATCH ContactList(42010aef-0de5-1eea-af8f-5bce865f0879)" : {
					code : 204
				},
				"ContactList(42010aef-0de5-1eea-af8f-5bce865f0879)?$select=FirstName,LastName" : {
					message : {
						FirstName : "Karl**",
						LastName : "Müller**"
					}
				}
			},
			sSourceBase : "sap/ui/core/sample/odata/v4/FieldGroups/data"
		};

	return ODataModel.extend("sap.ui.core.sample.odata.v4.FieldGroups.SandboxModel", {
		constructor : function (mParameters) {
			return SandboxModelHelper.adaptModelParametersAndCreateModel(mParameters, oMockData);
		}
	});
});
