/*!
 * ${copyright}
 */

/**
 * @fileOverview Application component to show the consumption of an OData V2 service with an
 * OData V4 model.
 * @version @version@
 */
sap.ui.define([
	"jquery.sap.global",
	"sap/ui/core/mvc/View", // sap.ui.view()
	"sap/ui/core/mvc/ViewType",
	"sap/ui/core/sample/common/Component",
	"sap/ui/model/odata/OperationMode",
	"sap/ui/model/odata/v4/ODataModel",
	"sap/ui/test/TestUtils"
], function (jQuery, View, ViewType, BaseComponent, OperationMode, ODataModel, TestUtils) {
	"use strict";

	return BaseComponent.extend("sap.ui.core.sample.odata.v4.ConsumeV2Service.Component", {
		metadata : {
			manifest : "json"
		},

		createContent : function () {
			var sGroupId = jQuery.sap.getUriParameters().get("$direct")
					? "$direct" // switch off batch
					: undefined,
				bHasOwnProxy = this.proxy !== BaseComponent.prototype.proxy,
				oModel = this.getModel(),
				fnProxy = bHasOwnProxy
					? this.proxy
					: TestUtils.proxy,
				sServiceUrl = fnProxy(oModel.sServiceUrl);

			if (oModel.sServiceUrl !== sServiceUrl || sGroupId) {
				//replace model from manifest in case of proxy
				oModel.destroy();
				oModel = new ODataModel({
					autoExpandSelect : false,
					groupId : sGroupId,
					odataVersion : "2.0",
					operationMode : OperationMode.Server,
					serviceUrl : sServiceUrl,
					synchronizationMode : "None"
				});
				this.setModel(oModel);
			}

			if (!bHasOwnProxy) {
				TestUtils.setupODataV4Server(this.oSandbox, {
						"$metadata" : {
							//TODO workaround for not yet implemented metadata conversion
							source : "metadataV4.xml"
						},
						"EdmTypesCollection?$select=ID,Boolean,Byte,Guid,Int16,Int32,SByte,String&$skip=0&$top=100" : {
							source : "EdmTypesV2.json"
						},
						"EdmTypesCollection('1')?$select=ID,Boolean,Byte,Double,Float,Guid,Int16,Int32,SByte,Single,String" : {
							source : "EdmTypesV2_SingleEntity.json"
						}
					}, "sap/ui/core/sample/odata/v4/ConsumeV2Service/data",
					"/sap/opu/odata/sap/ZUI5_EDM_TYPES/");
			}

			return sap.ui.view({
				async : true,
				id : "sap.ui.core.sample.odata.v4.ConsumeV2Service.Main",
				models : oModel,
				type : ViewType.XML,
				viewName : "sap.ui.core.sample.odata.v4.ConsumeV2Service.Main"
			});
		}
	});
});
