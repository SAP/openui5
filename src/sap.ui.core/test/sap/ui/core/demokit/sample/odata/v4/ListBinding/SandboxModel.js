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
				"Equipments?$count=true&$orderby=Category,Name&$select=Category,ID,Name,EmployeeId&$skip=0&$top=5" : {
					source : "equipments.json"
				},
				"Equipments?$count=true&$orderby=Category,Name&$select=Category,ID,Name,EmployeeId&$skip=5&$top=4" : {
					source : "equipments2.json"
				},
				"GetEmployeeMaxAge()" : {
					message : {value : 56}
				},
				"TEAMS?$expand=TEAM_2_EMPLOYEES($expand=EMPLOYEE_2_EQUIPMENTS($expand=EQUIPMENT_2_PRODUCT($expand=PRODUCT_2_CATEGORY,PRODUCT_2_SUPPLIER));$orderby=LOCATION/City/CITYNAME),TEAM_2_MANAGER&$skip=0&$top=100" : {
					source : "TEAMS.json"
				},
				"TEAMS('TEAM_01')/TEAM_2_EMPLOYEES?$expand=EMPLOYEE_2_EQUIPMENTS&$orderby=AGE,LOCATION/City/CITYNAME&$skip=0&$top=1" : {
					source : "Team01_skip0_top1.json"
				},
				"TEAMS('TEAM_01')/TEAM_2_EMPLOYEES?$expand=EMPLOYEE_2_EQUIPMENTS&$orderby=AGE,LOCATION/City/CITYNAME&$skip=1&$top=1" : {
					source : "Team01_skip1_top1.json"
				},
				"TEAMS('TEAM_01')/TEAM_2_EMPLOYEES?$expand=EMPLOYEE_2_EQUIPMENTS&$orderby=AGE,LOCATION/City/CITYNAME&$skip=2&$top=1" : {
					message : {value : []}
				},
				"TEAMS('TEAM_02')/TEAM_2_EMPLOYEES?$expand=EMPLOYEE_2_EQUIPMENTS&$orderby=AGE,LOCATION/City/CITYNAME&$skip=0&$top=1" : {
					source : "Team02_skip0_top1.json"
				},
				"TEAMS('TEAM_02')/TEAM_2_EMPLOYEES?$expand=EMPLOYEE_2_EQUIPMENTS&$orderby=AGE,LOCATION/City/CITYNAME&$skip=1&$top=1" : {
					source : "Team02_skip1_top1.json"
				},
				"TEAMS('TEAM_02')/TEAM_2_EMPLOYEES?$expand=EMPLOYEE_2_EQUIPMENTS&$orderby=AGE,LOCATION/City/CITYNAME&$skip=2&$top=1" : {
					message : {value : []}
				},
				"TEAMS('TEAM_03')/TEAM_2_EMPLOYEES?$expand=EMPLOYEE_2_EQUIPMENTS&$orderby=AGE,LOCATION/City/CITYNAME&$skip=0&$top=1" : {
					source : "Team03_skip0_top1.json"
				},
				"TEAMS('TEAM_03')/TEAM_2_EMPLOYEES?$expand=EMPLOYEE_2_EQUIPMENTS&$orderby=AGE,LOCATION/City/CITYNAME&$skip=1&$top=1" : {
					source : "Team03_skip1_top1.json"
				},
				"TEAMS('TEAM_03')/TEAM_2_EMPLOYEES?$expand=EMPLOYEE_2_EQUIPMENTS&$orderby=AGE,LOCATION/City/CITYNAME&$skip=2&$top=1" : {
					message : {value : []}
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
			sSourceBase : "sap/ui/core/sample/odata/v4/ListBinding/data"
		};

	function SandboxModel(mParameters) {
		return SandboxModelHelper.adaptModelParametersAndCreateModel(mParameters, oMockData);
	}
	SandboxModel.getMetadata = ODataModel.getMetadata;

	return SandboxModel;
});
