sap.ui.define(['sap/ui/core/UIComponent', "sap/ui/core/util/MockServer", "sap/ui/model/odata/v2/ODataModel"],
	function (UIComponent, MockServer, ODataModel) {
		"use strict";

		var sServiceURI = "/ProductSet/";
		var sMetaDataURI = "../../../../../mockdata/";

		var Component = UIComponent.extend("sap.m.test.plugins.CellSelector.GridTableOPA.Component", {
			metadata: {
				id: "GridTableOPA",
				manifest: "json"
			},
			init: function() {
				this.oMockServer = new MockServer({
					rootUri: sServiceURI
				});

				MockServer.config({
					autoRespond: true,
					autoRespondAfter: 2000
				});

				this.oMockServer.simulate(sMetaDataURI + "metadata.xml", sMetaDataURI);
				this.oMockServer.start();

				this.setModel(new ODataModel(sServiceURI));
				UIComponent.prototype.init.apply(this, arguments);
			},
			exit: function() {
				this.oMockServer.destroy();
				this.oMockServer = null;
				MockServer.config({autoRespondAfter: 0});
			}
		});

		return Component;

	});
