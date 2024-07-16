// Note: the HTML page 'ODataV2MessagesPerf.html' loads this module via data-sap-ui-on-init

sap.ui.define([
	'sap/ui/core/util/MockServer',
	'sap/ui/model/odata/v2/ODataModel',
	'sap/ui/model/json/JSONModel',
	'sap/ui/model/odata/ODataPropertyBinding',
	'sap/ui/table/Table',
	'sap/m/Button',
	'sap/m/Label',
	'sap/m/Text',
	'sap/base/util/merge',
	'sap/ui/performance/Measurement',
	"sap/m/Table",
	"sap/m/Column",
	"sap/m/ColumnListItem"
], function(
	MockServer,
	ODataModel,
	JSONModel,
	ODataPropertyBinding,
	Table,
	Button,
	Label,
	Text,
	merge,
	Measurement,
	MTable,
	Column,
	ColumnListItem
) {
	"use strict";
	var sServiceUri = "/SalesOrderSrv/";
	var sDataRootPath = "qunit/testdata/SalesOrder/";

	Measurement.setActive(true, ["cu", "cd"]);
	var oMockServer = new MockServer({
		rootUri: sServiceUri
	});
	oMockServer.simulate("qunit/testdata/SalesOrder/metadata.xml", sDataRootPath);

	var aRequests = oMockServer.getRequests();
	aRequests.forEach(function (oRequest) {
		var fnOrginalResponse;
		String(oRequest.path);

		//if (sPath.indexOf("$") == -1) {

		fnOrginalResponse = oRequest.response;
		oRequest.response = function (oXhr) {
			var fnOrignalXHRRespond = oXhr.respond;
			var sUrl = oXhr.url;
			var oDo = 10000;
			oXhr.respond = function (status, headers, content) {
				if (sUrl === '/SalesOrderSrv/SalesOrderSet/$count') {
					content = "" + oDo + 10;
				} else if (sUrl.startsWith('/SalesOrderSrv/SalesOrderSet')) {
					var oEntry, oContent = JSON.parse(content);

					for (var i = 0; i < oDo; i++) {
						oEntry = merge({}, oContent.d.results[0]);
						oEntry.__metadata.uri = sServiceUri + "SalesOrderSet(" + i + ")";
						oEntry.SalesOrderID = "SalesOrderSet(" + i + ")";
						oEntry.ToLineItems = {id:"LI(" + i + ")"};
						oContent.d.results.push(oEntry);
					}
					content = JSON.stringify(oContent);
				}
				fnOrignalXHRRespond.apply(this, arguments);
			};
			fnOrginalResponse.apply(this, arguments);
		};
		//}
	});
	oMockServer.start();

	// create an ODataModel from URL
	var oModel = new ODataModel(sServiceUri, {defaultOperationMode: 'Client'});
	oModel.setSizeLimit(9999999);

	var oMeasureModel = new JSONModel();

	var i = 0, j = 0;
	var fnCheckUpdateOrig = ODataModel.prototype.checkUpdate;
	ODataModel.prototype.checkUpdate = function() {
		i++;
		Measurement.start("cu" + i, "checkupdate model", ["cu"]);
		fnCheckUpdateOrig.apply(this, arguments);
		Measurement.end("cu" + i);
		oMeasureModel.setData(Measurement.getAllMeasurements());
	};
	var fnCheckDataState = ODataModel.prototype.checkDataState;
	ODataModel.prototype.checkDataState = function() {
		j++;
		Measurement.start("cd" + j, "checkDataState model", ["cd"]);
		fnCheckDataState.apply(this, arguments);
		Measurement.end("cd" + j);
		oMeasureModel.setData(Measurement.getAllMeasurements());
	};
	var oTable = new Table({ // create Table UI
		columns : [
			{
				label: new Label({
					text: "Measure Id"
				}),
				template: new Text({
					text:"{measure>id}"
				})
			},
			{
				label: new Label({
					text: "Info"
				}),
				template: new Text({
					text:"{measure>info}"
				})
			},
			{
				label: new Label({
					text: "Time"
				}),
				template: new Text({
					text:"{measure>time}"
				})
			}
		]
	});

	oTable.bindRows({path: "measure>/"}); // bind the rows against a certain root-level collection in the service
	oTable.placeAt("measure"); // place Table onto UI*/$

	new Button({text: 'force checkUpdate', press: function() {
	   oModel.checkUpdate(true);
	}}).placeAt("measure");
	new Button({text: 'update data', press: function() {
		oModel.setProperty("/SalesOrderSet(0)/id", "SalesOrderSet(0er)");
	}}).placeAt("measure");
	new Button({text: 'refresh data', press: function() {
		oTable.getBinding("items").refresh();
	}}).placeAt("measure");
	// create a List control

	var oTable = new MTable({
		columns: [
			new Column({
				header: new Text({text:"SO ID"})
			}),
			new Column({
				header: new Text({text:"LI ID"})
			})
		]
	});

	// bind the List items to the data collection
	oTable.bindItems({
		path : "/SalesOrderSet",
		template : new ColumnListItem({
			cells: [
				new Text({text: '{SalesOrderID}'}),
				new Text({text: '{ToLineItems/id}'})
			]
		})
	});

	oTable.setModel(oModel);
	oTable.setModel(oMeasureModel, "measure");

	oTable.placeAt("content");
});