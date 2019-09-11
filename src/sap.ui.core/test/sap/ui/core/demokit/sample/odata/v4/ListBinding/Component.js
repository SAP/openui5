/*!
 * ${copyright}
 */

/**
 * @fileOverview Application component to display information on entities from the TEA_BUSI
 *   OData service.
 * @version @version@
 */
sap.ui.define([
	"sap/base/util/UriParameters",
	"sap/ui/core/library",
	"sap/ui/core/mvc/View", // sap.ui.view()
	"sap/ui/core/sample/common/Component",
	"sap/ui/model/json/JSONModel",
	"sap/ui/model/odata/v4/ODataModel",
	"sap/ui/test/TestUtils",
	"sap/ui/thirdparty/URI"
], function (UriParameters, library, View, BaseComponent, JSONModel, ODataModel, TestUtils, URI) {
	"use strict";

	// shortcut for sap.ui.core.mvc.ViewType
	var ViewType = library.mvc.ViewType;

	return BaseComponent.extend("sap.ui.core.sample.odata.v4.ListBinding.Component", {
		metadata : {
			manifest : "json"
		},

		createContent : function () {
			var bHasOwnProxy = this.proxy !== BaseComponent.prototype.proxy,
				oModel = this.getModel(),
				fnProxy = bHasOwnProxy
					? this.proxy
					: TestUtils.proxy,
				bRealOData = TestUtils.isRealOData(),
				sServiceUrl = fnProxy(oModel.sServiceUrl),
				sQuery;

			if (oModel.sServiceUrl !== sServiceUrl) {
				//replace model from manifest in case of proxy
				sQuery = URI.buildQuery(oModel.mUriParameters);
				sQuery = sQuery ? "?" + sQuery : "";
				oModel.destroy();
				oModel = new ODataModel({
					groupId : UriParameters.fromQuery(window.location.search).get("$direct")
						? "$direct" // switch off batch
						: undefined,
					operationMode : oModel.sOperationMode,
					serviceUrl : sServiceUrl + sQuery,
					synchronizationMode : "None",
					updateGroupId : UriParameters.fromQuery(window.location.search).get("updateGroupId")
						|| oModel.getUpdateGroupId()
				});
				this.setModel(oModel);
			}

			if (!bHasOwnProxy) {
				TestUtils.setupODataV4Server(this.oSandbox, {
					"Equipments?$count=true&$orderby=Category,Name&$select=Category,ID,Name,EmployeeId&$skip=0&$top=5" : {
						source : "equipments.json"
					},
					"Equipments?$count=true&$orderby=Category,Name&$select=Category,ID,Name,EmployeeId&$skip=5&$top=4" : {
						source : "equipments2.json"
					},
					"GetEmployeeMaxAge()" : {
						source : "GetEmployeeMaxAge.json"
					},
					"$metadata" : {source : "metadata.xml"},
					"/sap/opu/odata4/IWBEP/TEA/default/iwbep/tea_busi_product/0001/$metadata" : {source : "metadata_product.xml"},
					"/sap/opu/odata4/IWBEP/TEA/default/iwbep/tea_busi_supplier/0001/$metadata" : {source : "metadata_supplier.xml"},
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
						source : "Team_no_more_data.json"
					},
					"TEAMS('TEAM_02')/TEAM_2_EMPLOYEES?$expand=EMPLOYEE_2_EQUIPMENTS&$orderby=AGE,LOCATION/City/CITYNAME&$skip=0&$top=1" : {
						source : "Team02_skip0_top1.json"
					},
					"TEAMS('TEAM_02')/TEAM_2_EMPLOYEES?$expand=EMPLOYEE_2_EQUIPMENTS&$orderby=AGE,LOCATION/City/CITYNAME&$skip=1&$top=1" : {
						source : "Team02_skip1_top1.json"
					},
					"TEAMS('TEAM_02')/TEAM_2_EMPLOYEES?$expand=EMPLOYEE_2_EQUIPMENTS&$orderby=AGE,LOCATION/City/CITYNAME&$skip=2&$top=1" : {
						source : "Team_no_more_data.json"
					},
					"TEAMS('TEAM_03')/TEAM_2_EMPLOYEES?$expand=EMPLOYEE_2_EQUIPMENTS&$orderby=AGE,LOCATION/City/CITYNAME&$skip=0&$top=1" : {
						source : "Team03_skip0_top1.json"
					},
					"TEAMS('TEAM_03')/TEAM_2_EMPLOYEES?$expand=EMPLOYEE_2_EQUIPMENTS&$orderby=AGE,LOCATION/City/CITYNAME&$skip=1&$top=1" : {
						source : "Team03_skip1_top1.json"
					},
					"TEAMS('TEAM_03')/TEAM_2_EMPLOYEES?$expand=EMPLOYEE_2_EQUIPMENTS&$orderby=AGE,LOCATION/City/CITYNAME&$skip=2&$top=1" : {
						source : "Team_no_more_data.json"
					}
				}, "sap/ui/core/sample/odata/v4/ListBinding/data",
				"/sap/opu/odata4/IWBEP/TEA/default/IWBEP/TEA_BUSI/0001/");
			}

			return sap.ui.view({
				async : true,
				type : ViewType.XML,
				viewName : "sap.ui.core.sample.odata.v4.ListBinding.Main",
				models : {
					undefined : oModel,
					ui : new JSONModel({
						Budget : null,
						ManagerID : null,
						bRealOData : bRealOData,
						TeamID : null
					})
				}
			});
		}
	});
});
