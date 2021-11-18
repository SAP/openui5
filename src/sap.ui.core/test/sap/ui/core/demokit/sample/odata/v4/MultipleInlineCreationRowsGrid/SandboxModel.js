/*!
 * ${copyright}
 */
// The SandboxModel is used in the manifest instead of OData V4 model so that we can modify model
// parameters via query options.
sap.ui.define([
	"sap/ui/core/sample/common/SandboxModelHelper",
	"sap/ui/model/odata/v4/ODataModel"
], function (SandboxModelHelper, ODataModel) {
	"use strict";

	var oMockData = {
			mFixture : {
				"$metadata?sap-language=EN" : {
					source : "metadata.xml"
				},
				"Products?$filter=IsActiveEntity%20eq%20false%20or%20SiblingEntity/IsActiveEntity%20eq%20null&$select=HasDraftEntity,ID,IsActiveEntity,name&$skip=0&$top=20" : {
					source : "Products.json"
				},
				"Products(ID=10,IsActiveEntity=false)/_Parts?$count=true&$select=ID,description,quantity&$skip=0&$top=120" : {
					source : "Product_10_Parts.json"
				},
				"POST /MyProducts/Products(ID=10,IsActiveEntity=false)/_Parts" : {
					source : "Create_Part_10_99.json"
				}
			},
			sFilterBase : "/MyProducts/",
			sSourceBase : "sap/ui/core/sample/odata/v4/MultipleInlineCreationRowsGrid/data"
	};

	return ODataModel.extend(
		"sap.ui.core.sample.odata.v4.MultipleInlineCreationRowsGrid.SandboxModel", {
		constructor : function (mParameters) {
			return SandboxModelHelper.adaptModelParametersAndCreateModel(mParameters, oMockData);
		}
	});
});
