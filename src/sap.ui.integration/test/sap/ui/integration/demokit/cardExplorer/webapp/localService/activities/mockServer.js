sap.ui.define([
	"sap/ui/core/util/MockServer",
	"sap/ui/thirdparty/jquery",
	"sap/ui/core/date/UI5Date"
], function (MockServer, jQuery, UI5Date) {
	"use strict";

	var oMockServer,
		aData;

	function loadData () {
		return new Promise(function (resolve, reject) {
			jQuery.ajax(sap.ui.require.toUrl("sap/ui/demo/cardExplorer/localService/activities/data.json"), {
				dataType: "json"
			})
			.done(resolve)
			.fail(function (jqXHR, sTextStatus, sError) {
				reject(sError);
			});
		});
	}

	function prepareData (_aData) {
		var oToday = UI5Date.getInstance();

		aData = _aData.map(function (oEntry) {
			var oTime = UI5Date.getInstance(oEntry.Time);
			oTime.setMonth(oToday.getMonth()); // always use the current month
			oTime.setFullYear(oToday.getFullYear()); // always use the current year

			// yesterday, today, tomorrow
			var aOffsets = [-1, 0, 1];
			var iRandomDayOffset = aOffsets[Math.floor(Math.random() * aOffsets.length)];

			// randomly distribute the entries between yesterday, today and tomorrow
			oTime.setDate(UI5Date.getInstance().getDate() + iRandomDayOffset);
			oEntry.Time = oTime	.toISOString();

			return oEntry;
		});
	}

	function filterData (sStartDate, sEndDate) {
		return aData.filter(function (oEntry) {
			var oTime = UI5Date.getInstance(oEntry.Time);
			return oTime >= UI5Date.getInstance(sStartDate) && oTime <= UI5Date.getInstance(sEndDate);
		});
	}

	function initMockServer () {
		oMockServer = new MockServer({
			rootUri: "/activities"
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
