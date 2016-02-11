/*!
 * ${copyright}
 */

/**
 * @fileOverview Application component to display information on entities from the TEA_BUSI
 *   OData service.
 * @version @version@
 */
sap.ui.define([
		'jquery.sap.global',
		'sap/ui/core/mvc/View',
		'sap/ui/core/sample/common/Component',
		'sap/ui/model/odata/v4/ODataModel',
		'sap/ui/test/TestUtils',
		'sap/ui/thirdparty/sinon'
	], function (jQuery, View, BaseComponent, ODataModel, TestUtils, sinon) {
	"use strict";

	var Component = BaseComponent.extend("sap.ui.core.sample.odata.v4.ListBinding.Component", {
		metadata : "json",

		createContent : function () {
			var bHasOwnProxy = this.proxy !== sap.ui.core.sample.common.Component.prototype.proxy,
				fnProxy = bHasOwnProxy
					? this.proxy // if overridden, use it!
					: TestUtils.proxy,
				oModel = new ODataModel({
					serviceUrl : fnProxy("/sap/opu/odata4/IWBEP/TEA/default/IWBEP/TEA_BUSI/0001/")
				});

			if (!bHasOwnProxy) {
				TestUtils.setupODataV4Server(sinon.sandbox.create(), {
					"TEAMS?$expand=TEAM_2_EMPLOYEES($expand=EMPLOYEE_2_EQUIPMENTS),TEAM_2_MANAGER&$skip=0&$top=100"
						: {source : "TEAMS.json"},
					"$metadata" : {source : "metadata.xml"}
				}, "sap/ui/core/demokit/sample/odata/v4/ListBinding/data",
				"/sap/opu/odata4/IWBEP/TEA/default/IWBEP/TEA_BUSI/0001/");
			}

			return sap.ui.view({
				type : sap.ui.core.mvc.ViewType.XML,
				viewName : "sap.ui.core.sample.odata.v4.ListBinding.Main",
				models : oModel
			});
		}
	});

	return Component;
});
