sap.ui.define([
	"sap/ui/core/util/MockServer",
	"sap/ui/thirdparty/jquery"
], function (MockServer, jQuery) {
	"use strict";

	var oMockServer,
		aData;

	function loadData () {
		return new Promise(function (resolve, reject) {
			jQuery.ajax(sap.ui.require.toUrl("sap/ui/demo/cardExplorer/localService/agenda/data.json"), {
				dataType: "json"
			})
			.done(resolve)
			.fail(function (jqXHR, sTextStatus, sError) {
				reject(sError);
			});
		});
	}

	function prepareData (_aData) {
		aData = _aData;
	}

	function filterData (sStartDate, sEndDate) {
		return aData.filter(function (oEntry) {
			var oTime = new Date(oEntry.Time);
			return oTime >= new Date(sStartDate) && oTime <= new Date(sEndDate);
		});
	}

	function initMockServer () {
		oMockServer = new MockServer({
			rootUri: "/agenda"
		});

		var aRequests = oMockServer.getRequests();

		aRequests.push({
			method: "GET",
			path: /\?+(.*)/,
			response: function (oXhr, sQuery) {
				var oQueryParams = new URLSearchParams(sQuery);
				oXhr.respondJSON(200, null, filterData(oQueryParams.get("startDate"), oQueryParams.get("endDate")));
			}
		});

		oMockServer.setRequests(aRequests);
		oMockServer.start();
	}

	var oMockServerInterface = {
		_pInit: null,

		init: function () {
			this._pInit = this._pInit || loadData()
				.then(prepareData)
				.then(initMockServer);

			return this._pInit;
		},

		destroy: function () {
			if (!oMockServer) {
				return;
			}

			oMockServer.destroy();
			oMockServer = null;
			this._pInit = null;
		}
	};

	return oMockServerInterface;
});
