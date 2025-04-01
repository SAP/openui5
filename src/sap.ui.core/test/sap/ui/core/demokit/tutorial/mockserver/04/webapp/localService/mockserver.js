sap.ui.define([
	"sap/ui/thirdparty/jquery",
	"sap/ui/core/date/UI5Date",
	"sap/ui/core/util/MockServer",
	"sap/base/Log"
], (jQuery, UI5Date, MockServer, Log) => {
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

			// handling mocking a function import call step
			const aRequests = oMockServer.getRequests();
			aRequests.push({
				method: "GET",
				path: new RegExp("FindUpcomingMeetups(.*)"),
				response: (oXhr) => {
					Log.debug("Incoming request for FindUpcomingMeetups");
					const oToday = UI5Date.getInstance();
					oToday.setHours(0); // or today.toUTCString(0) due to timezone differences
					oToday.setMinutes(0);
					oToday.setSeconds(0);
					// the mock server only works with sap.jQuery.ajax and async: false. But the request does not
					// actually go to a server, so it does not block the main thread.
					jQuery.ajax({
						url: `/Meetups?$filter=EventDate ge datetime'${oToday.toISOString()}'`,
						dataType : 'json',
						async: false,
						success : (oData) => {
							oXhr.respondJSON(200, {}, JSON.stringify(oData));
						}
					});
					return true;
				}
			});
			oMockServer.setRequests(aRequests);

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