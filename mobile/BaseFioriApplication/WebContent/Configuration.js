jQuery.sap.declare("myApp.Configuration");
jQuery.sap.require("sap.ca.scfld.md.ConfigurationBase");
jQuery.sap.require("sap.ca.scfld.md.app.Application");

sap.ca.scfld.md.ConfigurationBase.extend("myApp.Configuration", {
	oServiceParams: {
		serviceList: [{
			name: "SRA018_SO_TRACKING_SRV_Entities",
			masterCollection: "SalesOrders",
			serviceUrl: "/sap/opu/odata/sap/SRA018_SO_TRACKING_SRV/",
			isDefault: true,
			mockedDataSource: "/myApp/model/metadata.xml"
		}]
	},

	getServiceParams : function() {
		return this.oServiceParams;
	},

	/**
	 * @inherit
	 */
	getServiceList : function() {
		return this.getServiceParams().serviceList;
	},

	getMasterKeyAttributes : function() {
		//return the key attribute of your master list item
		return ["Id"];
	},
});
