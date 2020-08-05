sap.ui.define(['sap/base/util/extend','sap/ui/core/util/MockServer'],
	function(extend, StandardMockServer) {
	"use strict";

	// load mock server
	// NOTE TO DEVELOPERS: You do not need to reproduce this following section
	// It is just so we can simulate a delay from the fictional back end, giving
	// us some context to show delayed loading sequences.

	var MockServer = {

		server : null,

		rootUri : "/mockserver/",

		dataPath : "test-resources/sap/ui/documentation/sdk/mockserver/",

		start : function (oConfig) {
			// configure respond to requests delay
			StandardMockServer.config(extend({
				autoRespond : true,
				autoRespondAfter : 10
			}, oConfig));

			// create mockserver
			this.server = new StandardMockServer({
				rootUri : this.rootUri
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

});
