/*!
* ${copyright}
*/

sap.ui.define([
	'sap/ui/thirdparty/jquery',
	'sap/ui/model/json/JSONModel',
	'sap/ui/Device',
	'sap/ui/core/mvc/View'
], function (jQuery, JSONModel, Device, View) {
	"use strict";
	function create(oViewSettings, oModel, oComp) {
		var oMetaModel = oModel.getMetaModel(),
		oDeviceModel = new JSONModel(Device);
		oDeviceModel.setDefaultBindingMode("OneWay");

		return oMetaModel.requestObject("/").then(function() {
			oViewSettings.preprocessors = jQuery.extend(true, {
				xml: {
					bindingContexts: {
					},
					models: {
						'sap.ui.mdc.metaModel': oMetaModel,
						'sap.ui.mdc.deviceModel': oDeviceModel
					}
				}
			}, oViewSettings.preprocessors);
			oViewSettings.type = "XML";
			var oViewPromise;
			oComp.runAsOwner(function(){
				oViewPromise = View.create(oViewSettings);
				oViewPromise.then(function(oView){
					oComp._addContent(oView);
					return oView;
				});

			});
			return oViewPromise;
		});
	}
	var viewFactory = {
		create: create
	};
	return viewFactory;
});