/*!
 * ${copyright}
 */

// Provides reuse functionality for reading documentation from api.json files (as created by the UI5 JSDoc3 template/plugin)
sap.ui.define(["sap/base/Log"],
	function(Log) {
		"use strict";

		var WORKER = {
				URL: sap.ui.require.toUrl("sap/ui/documentation/sdk/controller/util/IndexWorker.js"),
				COMMANDS: {
					INIT: "fetch",
					SEARCH: "search"
				},
				RESPONSE_FIELDS: {
					DONE: "bDone",
					SEARCH_RESULT: "oSearchResult"
				}
			},
			oInitPromise,
			oWorker;

		/**
		 * Initializes the setup for client-search
		 *
		 * @returns {*}
		 */
		function init() {
			if (!oInitPromise) {
				oInitPromise = new Promise(function(resolve, reject) {

					oWorker = new window.Worker(WORKER.URL);

					// listen for confirmation from worker
					oWorker.addEventListener('message', function(oEvent) {
						var oData = oEvent.data;
						if (oEvent.data.error) {
							reject(oEvent.data.error);
						}
						resolve(oData && oData[WORKER.RESPONSE_FIELDS.DONE] === true);
					}, false);

					// instruct the worker to fetch the index data
					oWorker.postMessage({
						"cmd": WORKER.COMMANDS.INIT
					});
				});
			}

			return oInitPromise;
		}


		/**
		 * Initiates search and return a promise with the search result
		 *
		 * @param sQuery the search string
		 * @returns {Promise<any>}
		 */
		function search(sQuery, oOptions) {

			return new Promise(function(resolve, reject) {
				init().then(function() {

					oWorker.addEventListener('message', function(oEvent) {
						var oData = oEvent.data;
						resolve(oData && oData[WORKER.RESPONSE_FIELDS.SEARCH_RESULT]);
					}, false);

					oWorker.postMessage({
						"cmd": WORKER.COMMANDS.SEARCH,
						"query": sQuery,
						"options": oOptions
					});
				})
				.catch(function(err) {
					Log.error(err);
				});
			});
		}

		return {
			init: init,
			search: search
		};

	});