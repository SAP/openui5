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
	"sap/m/HBox",
	"sap/ui/core/library",
	"sap/ui/core/mvc/View",
	"sap/ui/core/sample/common/Component",
	"sap/ui/model/json/JSONModel",
	"sap/ui/model/odata/v4/ODataModel",
	"sap/ui/test/TestUtils"
], function (UriParameters, HBox, library, View, BaseComponent, JSONModel, ODataModel, TestUtils) {
	"use strict";

	// shortcut for sap.ui.core.mvc.ViewType
	var ViewType = library.mvc.ViewType;

	return BaseComponent.extend("sap.ui.core.sample.odata.v4.ListBindingTemplate.Component", {
		metadata : {
			manifest : "json"
		},

		createContent : function () {
			var bHasOwnProxy = this.proxy !== BaseComponent.prototype.proxy,
				oLayout = new HBox({
					renderType : "Bare"
				}),
				oMetaModel,
				oModel = this.getModel(),
				fnProxy = bHasOwnProxy
					? this.proxy
					: TestUtils.proxy,
				bRealOData = TestUtils.isRealOData(),
				sServiceUrl = fnProxy(oModel.sServiceUrl);

			if (oModel.sServiceUrl !== sServiceUrl) {
				//replace model from manifest in case of proxy
				oMetaModel = oModel.getMetaModel();
				oModel.destroy();
				oModel = new ODataModel({
					annotationURI : oMetaModel.aAnnotationUris,
					autoExpandSelect : true,
					groupId : UriParameters.fromQuery(window.location.search).get("$direct")
						? "$direct" // switch off batch
						: undefined,
					operationMode : oModel.sOperationMode, // OK even after oModel was destroyed
					serviceUrl : sServiceUrl,
					synchronizationMode : "None"
				});
				this.setModel(oModel);
			}
			oMetaModel = oModel.getMetaModel();
			oMetaModel.setDefaultBindingMode("OneWay");

			if (!bHasOwnProxy) {
				TestUtils.setupODataV4Server(this.oSandbox, {
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

				}, "sap/ui/core/sample/odata/v4/ListBindingTemplate/data",
				"/sap/opu/odata4/IWBEP/TEA/default/IWBEP/TEA_BUSI/0001/");
			}

			View.create({
				async : true,
				bindingContexts : {
					undefined : oModel.createBindingContext("/Equipments")
				},
				models : {
					// Note: XML Templating creates bindings to default model only!
					undefined : oModel,
					metaModel : oMetaModel,
					ui : new JSONModel({
						sCode : "",
						bCodeVisible : false,
						bRealOData : bRealOData,
						icon : bRealOData ? "sap-icon://building" : "sap-icon://record",
						iconTooltip : bRealOData ? "real OData service" : "mock OData service"
					})
				},
				preprocessors : {
					xml : {
						bindingContexts : {
							data : oModel.createBindingContext("/Equipments")
						},
						models : {
							data : oModel,
							meta : oMetaModel
						}
					}
				},
				type : ViewType.XML,
				viewName : "sap.ui.core.sample.odata.v4.ListBindingTemplate.Main"
			}).then(function (oView) {
				oLayout.addItem(oView);
			});

			return oLayout;
		}
	});
});
