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
				"localAnnotations.xml" : {source : "localAnnotations.xml"},
				"$metadata" : {source : "metadata.xml"},
				"/sap/opu/odata4/IWBEP/TEA/default/iwbep/tea_busi_product/0001/$metadata" : {
					source : "metadata_product.xml"
				},
				"/sap/opu/odata4/IWBEP/TEA/default/iwbep/tea_busi_supplier/0001/$metadata" : {
					source : "metadata_supplier.xml"
				},
				"Equipments?$select=Category,EmployeeId,ID,Name&$expand=EQUIPMENT_2_PRODUCT($select=ID,Name;$expand=PRODUCT_2_CATEGORY($select=CategoryIdentifier,CategoryName),PRODUCT_2_SUPPLIER($select=SUPPLIER_ID,Supplier_Name))&$skip=0&$top=5" : {
					source : "equipments.json"
				},
				"Equipments?$select=Category,EmployeeId,ID,Name&$expand=EQUIPMENT_2_PRODUCT($select=ID,Name;$expand=PRODUCT_2_SUPPLIER($select=SUPPLIER_ID,Supplier_Name))&$skip=0&$top=5" : {
					source : "equipments.json"
				}
			},
			sFilterBase : "/sap/opu/odata4/IWBEP/TEA/default/IWBEP/TEA_BUSI/0001/",
			sSourceBase : "sap/ui/core/sample/odata/v4/ListBindingTemplate/data"
		};

	return ODataModel.extend("sap.ui.core.sample.odata.v4.ListBindingTemplate.SandboxModel", {
		constructor : function (mParameters) {
			return SandboxModelHelper.adaptModelParametersAndCreateModel(mParameters, oMockData);
		}
	});
});