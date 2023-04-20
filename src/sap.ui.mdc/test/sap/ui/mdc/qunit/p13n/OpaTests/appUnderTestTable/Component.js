/*!
 * ${copyright}
 */
sap.ui.define([
	'sap/ui/core/UIComponent',
	'test-resources/sap/ui/mdc/qunit/util/V4ServerHelper',
	'sap/ui/model/odata/v4/ODataModel'
], function(UIComponent, V4ServerHelper, ODataModel) {
	"use strict";

	return UIComponent.extend("AppUnderTestTable.Component", {
		metadata: {
			manifest: "json"
		},

		init: function() {
			UIComponent.prototype.init.apply(this, arguments);
			V4ServerHelper.requestFreshServerURL(true).then(function(tenantBaseUrl) {

				var oModel = new ODataModel({
					serviceUrl: tenantBaseUrl + "music/",
					groupId: "$direct",
					autoExpandSelect: true,
					operationMode: "Server"
				 });

				 this.setModel(oModel);
			 }.bind(this));
		}
	});
});
