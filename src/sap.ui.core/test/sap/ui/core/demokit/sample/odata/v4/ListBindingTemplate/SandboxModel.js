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
			sFilterBase : "/sap/opu/odata4/IWBEP/TEA/default/IWBEP/TEA_BUSI/0001/",
			mFixture : {
				"localAnnotations.xml" : {source : "localAnnotations.xml"},
				"Equipments?$select=Category,EmployeeId,ID,Name&$expand=EQUIPMENT_2_PRODUCT($select=ID,Name;$expand=PRODUCT_2_CATEGORY($select=CategoryIdentifier,CategoryName),PRODUCT_2_SUPPLIER($select=SUPPLIER_ID,Supplier_Name))&$skip=0&$top=5" : {
					source : "equipments.json"
				},
				"Equipments?$select=Category,EmployeeId,ID,Name&$expand=EQUIPMENT_2_PRODUCT($select=ID,Name;$expand=PRODUCT_2_SUPPLIER($select=SUPPLIER_ID,Supplier_Name))&$skip=0&$top=5" : {
					source : "equipments.json"
				}
			},
			aRegExps : [{
				regExp : /^GET [\w\/]+\/TEA_BUSI\/0001\/\$metadata\?sap-language=..$/,
				response : {source : "metadata.xml"}
			}, {
				regExp : /^GET [\w\/]+\/tea_busi_product\/0001\/\$metadata\?sap-language=..$/,
				response : {source : "metadata_product.xml"}
			}, {
				regExp : /^GET [\w\/]+\/tea_busi_supplier\/0001\/\$metadata\?sap-language=..$/,
				response : {source : "metadata_supplier.xml"}
			}],
			sSourceBase : "sap/ui/core/sample/odata/v4/ListBindingTemplate/data"
		};

	return ODataModel.extend("sap.ui.core.sample.odata.v4.ListBindingTemplate.SandboxModel", {
		constructor : function (mParameters) {
			return SandboxModelHelper.adaptModelParametersAndCreateModel(mParameters, oMockData);
		}
	});
});
