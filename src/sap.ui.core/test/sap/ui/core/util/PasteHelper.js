// Note: the HTML page 'PasteHelper.html' loads this module via data-sap-ui-on-init

sap.ui.define([
	'sap/ui/core/util/PasteHelper',
	'sap/ui/core/Core',
	'sap/ui/core/Element',
	'sap/ui/model/json/JSONModel',
	'sap/ui/table/Table',
	'sap/ui/table/Column',
	'sap/m/TextArea',
	'sap/m/Text',
	'sap/m/Label',
	'sap/m/MessageBox',
	"sap/ui/model/type/String",
	"sap/ui/model/odata/type/Byte",
	"sap/ui/model/type/Boolean",
	"sap/ui/model/odata/type/Date",
	"sap/ui/model/type/Currency"
],
		function(PasteHelper, Core, Element, JSONModel, Table, Column, TextArea, Text, Label, MessageBox, TypeString, Byte, TypeBoolean, TypeDate, Currency) {
			"use strict";

			// Test Data if not using Excel spreadsheet for copying.
			//var aData3_OK = [["Luis", "10", "yes", "2018-12-03", "5 USD"],["Leo", "8", "no","2018-12-18", "15.53 EUR"]];
			const testA = "Luis\t10\ttrue\t2018-12-03\t5 USD\tLuis White\nLeo\t8\tfalse\t2018-12-18\t10 EUR\tLeo Bond";

			var oTable;

			function showDataInTable(aData) {
				aData = aData || [];

				if (!oTable) {
					var oModel = new JSONModel();
					oTable = new Table({
						selectionMode: "None"
					});
					oTable.setModel(oModel);
					oTable.bindRows("/data");
					oTable.placeAt("content");
				}
				oTable.destroyColumns();
				oTable.getModel().setData({data: []});

				var aTableData = [];
				for (var i = 0; i < aData.length; i++) {
					var oRow = {};
					for (var j = 0; j < aData[i].length; j++) {
						if (i == 0) {
							oTable.addColumn(new Column({
								label: new Label({text: "Column " + (j + 1)}),
								template: new Text({text: "{data" + j + "}", wrapping: false}),
								width: "200px"
							}));
						}
						oRow["data" + j] = aData[i][j];
					}
					aTableData.push(oRow);
				}

				oTable.getModel().setData({data: aTableData});
			}


			function pasteListener(e) {
				// call Utility pasteHelper
				var aData = PasteHelper.getPastedDataAs2DArray(e);

				var aColumnsInfo = [
					{
						property: "name",
						type: new TypeString() //not EDM, but UI5 data type
					},
					{
						property: "age",
						type:  new Byte() // OData type Edm.Byte
					},
					{
						property: "validAbo",
						type: new TypeBoolean() // not EDM type, can be "true" or "false"
					},
					{
						property: "lastLoginDate",
						type: new TypeDate() // OData EDM type
					},
					{
						property: "aboPrice",
						type: new Currency()
					},
					{
						property: "fullName",
						customParseFunction: function(data) {
							return ( data.toUpperCase());
						}
					}
				];
				PasteHelper.parse(aData, aColumnsInfo).then(function(oResult) {
					if (oResult.parsedData) {
						showDataInTable(aData);
						var msg = "";
						var myJSON = JSON.stringify(oResult.parsedData);
						Element.getElementById("ta2").setValue(myJSON);
						if (e.target.id == "ta1-inner") {
							Element.getElementById("ta1").setValue(e.clipboardData.getData("text"));
						}
						e.preventDefault();

					} else {
						var msg = "";
						for (var i = 0; i < oResult.errors.length; i++) {
							msg = msg + "\n" + (oResult.errors)[i].message;
						}
						MessageBox.error(msg);
						Element.getElementById("ta2").setValue(msg);
						e.preventDefault();
					}
				});

			}

			window.addEventListener('paste', pasteListener);

			var t1 = new Label({text: "Copy the content presenting data in the clipboard (copied from the excel) from the first text area and paste to the second text area:"});
			t1.placeAt('content');

			var ta1 = new TextArea({
				id: "ta1",
				width: "70%",
				height: "100px",
				value: testA
			});
			ta1.placeAt('content');

			var ta2 = new TextArea({
				id: "ta2",
				width: "70%",
				value: "Paste the data from excel or from the Text area above here",
				height: "100px"
			});
			ta2.placeAt('content');
		});