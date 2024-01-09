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

	var oPart50 = {
			ID : 50,
			description : "Part 50",
			quantity : null,
			_Product_ID : 100
		},
		oPart99 = {
			ID : 99,
			description : "Part 99",
			quantity : null,
			_Product_ID : 10
		},
		oPart101 = {
			ID : 101,
			description : null,
			quantity : null,
			_Product_ID : 10
		},
		oProduct20Refresh = {
			ID : 20,
			amount : "200",
			name : "Product 2",
			HasActiveEntity : false,
			HasDraftEntity : false,
			IsActiveEntity : false
		},
		oProduct100 = {
			ID : 100,
			amount : null,
			categoryID : null,
			_Category_ID : null,
			HasActiveEntity : false,
			HasDraftEntity : false,
			IsActiveEntity : false,
			name : null
		},
		oProduct110 = {
			ID : 110,
			amount : null,
			categoryID : null,
			_Category_ID : null,
			HasActiveEntity : false,
			HasDraftEntity : false,
			IsActiveEntity : false,
			name : "Product 110"
		},
		bPart101Persisted,
		oMockData = {
			sFilterBase : "/MyProducts/",
			mFixture : {
				"Products?$count=true&$filter=IsActiveEntity%20eq%20false%20or%20SiblingEntity/IsActiveEntity%20eq%20null&$select=HasActiveEntity,HasDraftEntity,ID,IsActiveEntity,amount,name&$skip=0&$top=20" : {
					ifMatch : function () {
						bPart101Persisted = false;
						return true;
					},
					source : "Products.json"
				},
				"Products?$count=true&$filter=IsActiveEntity%20eq%20false%20or%20SiblingEntity/IsActiveEntity%20eq%20null&$select=HasActiveEntity,HasDraftEntity,ID,IsActiveEntity,amount,name&$skip=0&$top=18" : {
					source : "Products.json"
				},
				"Products?$filter=ID%20eq%2020%20and%20IsActiveEntity%20eq%20false&$select=HasActiveEntity,HasDraftEntity,ID,IsActiveEntity,amount,name" : {
					message : {value : [oProduct20Refresh]}
				},
				"Products(ID=10,IsActiveEntity=false)/_Parts?$count=true&$select=ID,description,quantity&$skip=0&$top=118" : [{
					ifMatch : function () {
						return bPart101Persisted;
					},
					source : "Product_10_Parts_with_Part_101.json"
				}, {
					source : "Product_10_Parts.json"
				}],
				"Products(ID=10,IsActiveEntity=false)/_Parts?$count=true&$select=ID,description,quantity&$skip=0&$top=120" : [{
					ifMatch : function () {
						return bPart101Persisted;
					},
					source : "Product_10_Parts_with_Part_101.json"
				}, {
					source : "Product_10_Parts.json"
				}],
				"Products(ID=10,IsActiveEntity=false)/_Parts(99)?$select=ID,description,quantity" : {
					message : oPart99
				},
				"Products(ID=10,IsActiveEntity=false)/_Parts(101)?$select=ID,description,quantity" : {
					message : oPart101
				},
				"Products(ID=20,IsActiveEntity=false)/_Parts?$count=true&$select=ID,description,quantity&$skip=0&$top=118" : {
					source : "Product_20_Parts.json"
				},
				"Products(ID=20,IsActiveEntity=false)/_Parts?$count=true&$select=ID,description,quantity&$skip=0&$top=120" : {
					source : "Product_20_Parts.json"
				},
				"Products(ID=20,IsActiveEntity=false)/_Parts?$count=true&$select=ID,description,quantity&$orderby=quantity&$skip=0&$top=118" : {
					source : "Product_20_Parts_sorted.json"
				},
				"Products(ID=20,IsActiveEntity=false)/_Parts?$count=true&$select=ID,description,quantity&$orderby=quantity&$skip=0&$top=120" : {
					source : "Product_20_Parts_sorted.json"
				},
				"Products(ID=100,IsActiveEntity=false)/_Parts?$count=true&$select=ID,description,quantity&$orderby=quantity&$skip=0&$top=120" : {
					message : {value : []}
				},
				"Products(ID=100,IsActiveEntity=false)?$select=HasActiveEntity,HasDraftEntity,ID,IsActiveEntity,amount,name" : {
					message : oProduct100
				},
				"Products(ID=110,IsActiveEntity=false)?$select=HasActiveEntity,HasDraftEntity,ID,IsActiveEntity,amount,name" : {
					message : oProduct110
				},
				"Products(ID=110,IsActiveEntity=false)/_Parts?$count=true&$select=ID,description,quantity&$skip=0&$top=120" : {
					message : {value : []}
				},
				"Products(ID=110,IsActiveEntity=false)/_Parts(50)?$select=ID,description,quantity" : {
					message : oPart50
				},
				"POST Products" : [{
					ifMatch : /"ID":100/,
					message : oProduct100
				}, {
					ifMatch : /"ID":110/,
					message : oProduct110
				}],
				"POST Products(ID=10,IsActiveEntity=false)/_Parts" : [{
					ifMatch : /"ID":99/,
					message : oPart99
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
					message : oPart101
				}],
				"POST Products(ID=101,IsActiveEntity=false)/_Parts" : [{
					ifMatch : /"ID":50/,
					message : oPart50
				}]
			},
			sSourceBase : "sap/ui/core/sample/odata/v4/MultipleInlineCreationRowsGrid/data"
		};

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
