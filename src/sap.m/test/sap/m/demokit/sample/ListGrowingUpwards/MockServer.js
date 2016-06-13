sap.ui.define(['jquery.sap.global','sap/ui/core/util/MockServer'],
	function(jQuery, MockServer1) {
	"use strict";

	// load mock server
	// NOTE TO DEVELOPERS: You do not need to reproduce this following section
	// It is just so we can simulate a delay from the fictional back end, giving
	// us some context to show delayed loading sequences.

	var MockServer = {

		server : null,
		serviceURL : "/ProductSet/",
		dataPath : "test-resources/sap/ui/demokit/explored/mockserver/ProductSet/",

		start : function (oConfig) {
			// configure respond to requests delay
			MockServer1.config(jQuery.extend({
				autoRespond : true,
				autoRespondAfter : 10
			}, oConfig));

			// create mockserver
			this.server = new MockServer1({
				rootUri : this.serviceURL
			});

			// simulate and start and return
			this.server.simulate(this.dataPath + "metadata.xml", this.dataPath);
			this.server.start();
			return this.server;
		},

		stop : function() {
			this.server.stop();
			this.server = null;
		}

	};


	return MockServer;

}, /* bExport= */ true);
