sap.ui.define([
	"sap/ui/core/util/MockServer",
	"sap/base/Log"
], (MockServer, Log) => {
	"use strict";

	return {
		/**
		 * Initializes the mock server.
		 * You can configure the delay with the URL parameter "serverDelay".
		 * The local mock data in this folder is returned instead of the real data for testing.
		 * @public
		 */
		init() {
			// create
			const oMockServer = new MockServer({ rootUri: "/" });

			oMockServer.simulate("../localService/metadata.xml", {
				sMockdataBaseUrl: "../localService/mockdata",
				bGenerateMissingMockData: true
			});

			// handling custom URL parameter step
			const fnCustom = (oEvent) => {
				const oXhr = oEvent.getParameter("oXhr");
				if (oXhr?.url.includes("first")) {
					oEvent.getParameter("oFilteredData").results.splice(3, 100);
				}
			};
			oMockServer.attachAfter("GET", fnCustom, "Meetups");

			// start
			oMockServer.start();

			Log.info("Running the app with mock data");
		}
	};
});