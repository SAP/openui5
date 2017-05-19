sap.ui.define(
	["sap/ui/thirdparty/sinon"],
	function (sinon) {
		"use strict";

		return {
			/**
			 * Initializes a fake server for testing purposes.
			 * @public
			 */
			init : function () {
				// create a Sinon.JS fake server that responds automatically after 1s
				this.oServer = sinon.fakeServer.create();
				this.oServer.autoRespond = true;
				this.oServer.autoRespondAfter = 1000;

				// that responds only to a specific request
				sinon.fakeServer.xhr.useFilters = true;
				this.oServer.xhr.addFilter(function(method, url) {
					// whenever this returns true the request will not faked
					return !url.match("/some/remote/service/");
				});

				// and sends back a title string for the page
				this.oServer.respondWith("GET", "/some/remote/service/", [ 200, { "Content-Type": "text/html"}, "Hello from Server"]);
			}
		};

	}
);

