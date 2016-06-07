/*!
 * ${copyright}
 */

/**
 * @fileOverview Application component to display information on entities from the TEA_BUSI
 *   OData service.
 * @version @version@
 */
sap.ui.define([
		"jquery.sap.global",
		"sap/ui/core/mvc/View", // sap.ui.view()
		"sap/ui/core/mvc/ViewType",
		"sap/ui/core/sample/common/Component",
		"sap/ui/model/json/JSONModel",
		"sap/ui/model/odata/v4/ODataModel",
		"sap/ui/test/TestUtils",
		"sap/ui/thirdparty/sinon",
		"sap/ui/thirdparty/URI"
	], function (jQuery, View, ViewType, BaseComponent, JSONModel, ODataModel, TestUtils, sinon,
		URI) {
	"use strict";

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
					groupId : jQuery.sap.getUriParameters().get("$direct")
						? "$direct" // switch off batch
						: undefined,
					serviceUrl : sServiceUrl + sQuery,
					synchronizationMode : "None",
					updateGroupId : jQuery.sap.getUriParameters().get("updateGroupId") || undefined
				});
				this.setModel(oModel);
			}

			if (!bHasOwnProxy) {
				TestUtils.setupODataV4Server(this.oSandbox, {
					"TEAMS?$expand=TEAM_2_EMPLOYEES($expand=EMPLOYEE_2_EQUIPMENTS),TEAM_2_MANAGER&$skip=0&$top=100" : {
						source : "TEAMS.json"
					},
					"Equipments?$orderby=Category,Name&$select=Category,ID,Name,EmployeeId&$skip=0&$top=100" : {
						source : "equipments.json"
					},
					"GetEmployeeMaxAge()" : {
						source : "GetEmployeeMaxAge.json"
					},
					"$metadata" : {source : "metadata.xml"}
				}, "sap/ui/core/demokit/sample/odata/v4/ListBinding/data",
				"/sap/opu/odata4/IWBEP/TEA/default/IWBEP/TEA_BUSI/0001/");
			}

			return sap.ui.view({
				type : ViewType.XML,
				viewName : "sap.ui.core.sample.odata.v4.ListBinding.Main",
				models : {
					undefined : oModel,
					ui : new JSONModel({
						bRealOData : bRealOData
					})
				}
			});
		}
	});
});
