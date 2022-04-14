/*!
 * ${copyright}
 */
// The SandboxModel is used in the manifest instead of OData V4 model so that we can modify model
// parameters via query options.
sap.ui.define([
	"sap/ui/core/sample/common/SandboxModelHelper",
	"sap/ui/model/odata/v4/ODataModel",
	"sap/ui/test/TestUtils"
], function (SandboxModelHelper, ODataModel, TestUtils) {
	"use strict";

	var oMockData = {
			sFilterBase : "/MyProducts/",
			mFixture : {
				"Products?$filter=IsActiveEntity%20eq%20false%20or%20SiblingEntity/IsActiveEntity%20eq%20null&$select=HasDraftEntity,ID,IsActiveEntity,name&$skip=0&$top=20" : {
					ifMatch : function () {
						bPart101Persisted = false;
						return true;
					},
					source : "Products.json"
				},
				"Products(ID=10,IsActiveEntity=false)/_Parts?$count=true&$select=ID,description,quantity&$skip=0&$top=120" : [{
					ifMatch : function () {
						return bPart101Persisted;
					},
					source : "Product_10_Parts_with_Part_101.json"
				}, {
					source : "Product_10_Parts.json"
				}],
				"Products(ID=20,IsActiveEntity=false)/_Parts?$count=true&$select=ID,description,quantity&$skip=0&$top=120" : {
					source : "Product_20_Parts.json"
				},
				"Products(ID=20,IsActiveEntity=false)/_Parts?$count=true&$select=ID,description,quantity&$orderby=quantity&$skip=0&$top=120" : {
					source : "Product_20_Parts_sorted.json"
				},
				"POST /MyProducts/Products(ID=10,IsActiveEntity=false)/_Parts" : [{
					ifMatch : /"ID":99/,
					message : {
						ID : 99,
						description : null,
						quantity : null,
						_Product_ID : 10
					}
				}, {
					code : 400,
					ifMatch : /"ID":100/,
					message : {
						error : {
							message : "Key exists already",
							"@SAP__common.numericSeverity" : 4,
							target : "ID"
						}
					}
				}, {
					ifMatch : function () {
						bPart101Persisted = true;
						return true;
					},
					message : {
						ID : 101,
						description : null,
						quantity : null,
						_Product_ID : 10
					}
				}]
			},
			sSourceBase : "sap/ui/core/sample/odata/v4/MultipleInlineCreationRowsGrid/data"
		},
		bPart101Persisted;

	return ODataModel.extend(
		"sap.ui.core.sample.odata.v4.MultipleInlineCreationRowsGrid.SandboxModel", {
		constructor : function (mParameters) {
			mParameters = SandboxModelHelper.adaptModelParameters(mParameters,
				TestUtils.retrieveData("sap.ui.core.sample.odata.v4.MultipleInlineCreationRowsGrid"
					+ ".updateGroupId")); // updateGroupId controlled by OPA

			return SandboxModelHelper.createModel(mParameters, oMockData);
		}
	});
});
