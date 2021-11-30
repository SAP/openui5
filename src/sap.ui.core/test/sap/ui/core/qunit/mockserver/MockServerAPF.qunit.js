/*global QUnit */
sap.ui.define([
	"sap/base/Log",
	"sap/ui/core/util/MockServer"
], function(Log, MockServer) {
	"use strict";

	// convenience helper for synchronous ajax calls
	var syncAjax = MockServer._syncAjax;

	QUnit.module("sap/ui/core/util/MockServer: given APF model and data in MockServer", {
		beforeEach: function () {
			this.rootUri = "/apfService/";
			this.dataEntitySet = "ApfTestQueryResults";
			this.paramEntitySet = "ApfTestQuery";
			this.oMockServer = new MockServer({
				rootUri: this.rootUri
			});
			var stubMetadata = 'test-resources/sap/ui/core/qunit/mockserver/testdata/apfapp/tMockApfMetadata.xml';
			var stubData = 'test-resources/sap/ui/core/qunit/mockserver/testdata/apfapp/';
			this.oMockServer.simulate(stubMetadata, stubData);
			this.oMockServer.start();
			this.log = function (text) {
				var prevLevel = Log.getLevel();
				Log.setLevel(Log.Level.DEBUG);
				Log.debug("  ##test: " + text);
				Log.setLevel(prevLevel);
			};
			this.post = function (object, sEntitySetName) {
				var oSettings = JSON.stringify(object);
				this.oResponse = syncAjax({
					url: this.rootUri + sEntitySetName,
					type: "POST",
					data: oSettings,
					dataType: "json"
				});
			};
			this.postSet = function (aSet, sEntitySetName) {
				var i = 0;
				for (i; i < aSet.length; ++i) {
					this.oResponse = this.post(aSet[i]);
				}
			};
			this.postTable = function (aTable, oTemplate, sEntitySetName) {
				var row, attr = 0, member;
				var obj;
				for (row = 0; row < aTable.length; ++row) {
					obj = {};
					attr = 0;
					for (member in oTemplate) {
						if (oTemplate.hasOwnProperty(member)) {
							var value = (aTable[row])[attr];
							obj["" + member] = value;
							++attr;
						}
					}
					this.oResponse = syncAjax({
						url: this.rootUri + sEntitySetName,
						type: "POST",
						data: JSON.stringify(obj),
						dataType: "json"
					});
				}
			};
			this.resultTemplate = {
				"GenID": "ID_9999",
				"NavID": "#9999",
				"SAPClient": "999",
				"CompanyCode": "9999",
				"CompanyCodeName": "Company 9999",
				"DaysSalesOutstanding": 9.99
			};
			this.parameterTemplate = {
				"P_SAPClient": "9999",
				"P_FromDate": "01012014",
				"P_ToDate": "01062014",
				"P_DisplayCurrency": "eu",
				"P_ExchangeRateType": "eu",
				"P_ExchangeRateDate": "01012014",
				"P_AgingGridMeasureInDays": 10,
				"P_NetDueGridMeasureInDays": 10,
				"P_NetDueArrearsGridMsrInDays": 10,
				"NavID": "#9999"
			};
		},
		afterEach: function () {
			this.oMockServer.stop();
			this.oMockServer.destroy();
		}
	});

	QUnit.test("real initial data", function (assert) {
		var rowExpr = "(SAPClient eq '999')";
		var wcaQuery = this.dataEntitySet + "?$filter=" + rowExpr;
		var response = syncAjax({ url: this.rootUri + wcaQuery });
		assert.equal(response.statusCode, "200");
	});

	QUnit.test("ID initial data", function (assert) {
		var rowExpr = "(GenID eq 'ID_9999')";
		var wcaQuery = this.dataEntitySet + "?$filter=" + rowExpr;
		var response = syncAjax({ url: this.rootUri + wcaQuery });
		assert.equal(response.statusCode, "200");
	});

	QUnit.test("predicate initial data", function (assert) {
		var wcaQuery = this.dataEntitySet + "(GenID='ID_9999')";
		var response = syncAjax({ url: this.rootUri + wcaQuery });
		assert.equal(response.statusCode, "200");
	});

	QUnit.test("query initial parameter data", function (assert) {
		var query = "ApfTestQuery(P_SAPClient='9999',P_FromDate='01012014',P_ToDate='01062014'," +
			"P_DisplayCurrency='eu',P_ExchangeRateType='eu',P_ExchangeRateDate='01012014'," +
			"P_AgingGridMeasureInDays=10,P_NetDueGridMeasureInDays=10,P_NetDueArrearsGridMsrInDays=10)";
		var response = syncAjax({ url: this.rootUri + query });
		assert.equal(response.statusCode, "200");
	});

	QUnit.test("navigate from initial param to initial data", function (assert) {
		var query = "ApfTestQuery(P_SAPClient='9999',P_FromDate='01012014',P_ToDate='01062014'," +
			"P_DisplayCurrency='eu',P_ExchangeRateType='eu',P_ExchangeRateDate='01012014'," +
			"P_AgingGridMeasureInDays=10,P_NetDueGridMeasureInDays=10,P_NetDueArrearsGridMsrInDays=10)" +
			"/Results";
		var response = syncAjax({ url: this.rootUri + query });
		assert.equal(response.statusCode, "200");
	});

	QUnit.test("POST table", function (assert) {
		var aTable = [
			["GID_1", "#9999", "777", "c1", "Company 1", 1.11],
			["GID_2", "#9999", "777", "c2", "Company 2", 2.22],
			["GID_3", "#111", "777", "c3", "Company 3", 3.33],
			["GID_4", "#111", "777", "c4", "Company 4", 4.33],
			["GID_5", "#111", "777", "c3", "Company 3", 5.33]
		];
		this.postTable(aTable, this.resultTemplate, this.dataEntitySet);

		var myUrl = this.rootUri + this.dataEntitySet + "?$filter=(SAPClient eq '777')";
		var response = syncAjax({ url: myUrl });
		assert.equal(response.statusCode, "200");
		assert.equal(response.data.d.results.length, 5, "many");
	});

	QUnit.test("POST table & filter by number", function (assert) {
		var aTable = [
			["GID_1", "#9999", "777", "c1", "Company 1", 1.11],
			["GID_2", "#9999", "777", "c2", "Company 2", 2.22],
			["GID_3", "#111", "777", "c3", "Company 3", 3.33],
			["GID_4", "#111", "777", "c4", "Company 4", 4.33],
			["GID_5", "#111", "777", "c3", "Company 3", 5.33]
		];
		this.postTable(aTable, this.resultTemplate, this.dataEntitySet);

		var myUrl = this.rootUri + this.dataEntitySet + "?$filter=(DaysSalesOutstanding eq 2.22)";
		var response = syncAjax({ url: myUrl });
		assert.equal(response.statusCode, "200");
		assert.equal(response.data.d.results.length, 1, "one");
	});

	QUnit.test("POST table GET results on parameter set #9999", function (assert) {
		var ParameterCombination = [
			["777", "01012014", "01062014", "us", "us", "01012014", 10, 10, 10, "#111"
			]
		];
		var aTable = [
			["GID_1", "#9999", "777", "c1", "Company 1", 1.11],
			["GID_2", "#9999", "777", "c2", "Company 2", 2.22],
			["GID_3", "#111", "777", "c3", "Company 3", 3.33],
			["GID_4", "#111", "777", "c4", "Company 4", 4.33],
			["GID_5", "#111", "777", "c3", "Company 3", 5.33]
		];
		this.postTable(ParameterCombination, this.parameterTemplate, this.paramEntitySet);
		this.postTable(aTable, this.resultTemplate, this.dataEntitySet);

		var query = "ApfTestQuery(P_SAPClient='9999',P_FromDate='01012014',P_ToDate='01062014'," +
			"P_DisplayCurrency='eu',P_ExchangeRateType='eu',P_ExchangeRateDate='01012014'," +
			"P_AgingGridMeasureInDays=10,P_NetDueGridMeasureInDays=10,P_NetDueArrearsGridMsrInDays=10)" +
			"/Results";
		var response = syncAjax({ url: this.rootUri + query });
		assert.equal(response.statusCode, "200");
		assert.equal(response.data.d.results.length, 4, "many");
	});

	QUnit.test("POST table GET results on parameter set #111", function (assert) {
		var parameter = [
			["777", "01012014", "01062014", "us", "us", "01012014", 10, 10, 10, "#111"
			]
		];
		var aTable = [
			["GID_1", "#9999", "777", "c1", "Company 1", 1.11],
			["GID_2", "#9999", "777", "c2", "Company 2", 2.22],
			["GID_3", "#111", "777", "c3", "Company 3", 3.33],
			["GID_4", "#111", "777", "c4", "Company 4", 4.33],
			["GID_5", "#111", "777", "c3", "Company 3", 5.33]
		];
		this.postTable(parameter, this.parameterTemplate, this.paramEntitySet);
		this.postTable(aTable, this.resultTemplate, this.dataEntitySet);

		var query111 = "ApfTestQuery(P_SAPClient='777',P_FromDate='01012014',P_ToDate='01062014'," +
			"P_DisplayCurrency='us',P_ExchangeRateType='us',P_ExchangeRateDate='01012014'," +
			"P_AgingGridMeasureInDays=10,P_NetDueGridMeasureInDays=10,P_NetDueArrearsGridMsrInDays=10)";
		var response111 = syncAjax({ url: this.rootUri + query111 });
		assert.equal(response111.statusCode, "200");

		var query = "ApfTestQuery(P_SAPClient='777',P_FromDate='01012014',P_ToDate='01062014'," +
			"P_DisplayCurrency='us',P_ExchangeRateType='us',P_ExchangeRateDate='01012014'," +
			"P_AgingGridMeasureInDays=10,P_NetDueGridMeasureInDays=10,P_NetDueArrearsGridMsrInDays=10)" +
			"/Results";
		var response = syncAjax({ url: this.rootUri + query });
		assert.equal(response.statusCode, "200");
		assert.equal(response.data.d.results.length, 3, "many");
	});


});