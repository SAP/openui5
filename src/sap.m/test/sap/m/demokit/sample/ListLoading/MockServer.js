jQuery.sap.declare("sap.m.sample.ListLoading.MockServer");

// load mock server
jQuery.sap.require("sap.ui.app.MockServer");

// NOTE TO DEVELOPERS: You do not need to reproduce this following section
// It is just so we can simulate a delay from the fictional back end, giving
// us some context to show delayed loading sequences.

sap.m.sample.ListLoading.MockServer = {

	server : null,

	rootUri : "/mockserver/products/",

	dataPath : "test-resources/sap/ui/demokit/explored/mockdata/products/",

	start : function (oConfig) {
		// configure respond to requests delay
		sap.ui.app.MockServer.config(jQuery.extend({
			autoRespond : true,
			autoRespondAfter : 10
		}, oConfig));

		// create mockserver
		this.server = new sap.ui.app.MockServer({
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