/*!
 * ${copyright}
 */
sap.ui.define([
	"sap/ui/core/sample/common/Controller",
	"sap/ui/model/Filter",
	"sap/ui/model/FilterOperator",
	"sap/ui/model/Sorter",
	"sap/ui/model/json/JSONModel"
], function (Controller, Filter, FilterOperator, Sorter, JSONModel) {
	"use strict";

	return Controller.extend("sap.ui.core.sample.odata.v4.Ancestry.Main", {
		onExport : function () {
			var oRowsBinding = this.byId("table").getBinding("rows"),
				oSettings = {
					context : {
						title : "Ancestry"
					},
					dataSource : oRowsBinding,
					fileName : "Ancestry.xlsx",
					workbook : {
						columns : [{
							label : "Level",
							property : "SADL__DistanceFromOutputRoot",
							type : "Number"
						}, {
							label : "ID",
							property : "id",
							type : "String"
						}, {
							label : "Parent's ID",
							property : "my_parent_id",
							type : "String"
						}, {
							label : "First Name",
							property : "first_name",
							type : "String"
						}, {
							label : "Last Name",
							property : "last_name",
							type : "String"
						}, {
							inputFormat : "yyyy-mm-dd",
							label : "Date Of Birth",
							property : "date_of_birth",
							type : "Date",
							utc : true
						}, {
							label : "Hobby",
							property : "hobby",
							type : "String"
						}],
						hierarchyLevel : "SADL__DistanceFromOutputRoot"
					}
				};

			sap.ui.getCore().loadLibrary("sap.ui.export", true).then(function () {
				sap.ui.require(["sap/ui/export/Spreadsheet"], function (Spreadsheet) {
					var oSheet = new Spreadsheet(oSettings);

					oSheet.build().finally(function () {
						oSheet.destroy();
					});
				});
			});
		},

		onFilter : function () {
			var sFilter = this.getView().getModel("ui").getProperty("/sFilter"),
				oRowsBinding = this.byId("table").getBinding("rows");

			oRowsBinding.suspend();
			oRowsBinding.filter(sFilter
				? new Filter("hobby", FilterOperator.Contains, sFilter)
				: []);
			this._oAggregation.expandTo = sFilter ? 99 : 2; // auto expand on filter
			oRowsBinding.setAggregation(this._oAggregation);
			oRowsBinding.resume();
		},

		onInit : function () {
			var oTable = this.byId("table"),
				oRowsBinding = oTable.getBinding("rows"),
				oView = this.getView();

			oView.setModel(new JSONModel({
				sFilter : "",
				sIcon : ""
			}), "ui");
			this.bDescending = undefined;

			// enable V4 tree table flag
			oTable._oProxy._bEnableV4 = true;

			this._oAggregation = {
				expandTo : 2,
				hierarchyQualifier : "SADL_V_RS_Ancestry_Hier"
			};
			oRowsBinding.setAggregation(this._oAggregation);
			oRowsBinding.resume();

			oView.setModel(oView.getModel(), "header");
			oView.setBindingContext(oRowsBinding.getHeaderContext(), "header");
		},

		onSort : function () {
			var sNewIcon,
				oSorter;

			// choose next sort order: no sort -> ascending -> descending -> no sort
			switch (this.bDescending) {
				case false:
					this.bDescending = true;
					sNewIcon = "sap-icon://sort-descending";
					oSorter = new Sorter("date_of_birth", /*bDescending*/true);
					break;

				case true:
					this.bDescending = undefined;
					sNewIcon = "";
					break;

				default: // undefined
					this.bDescending = false;
					sNewIcon = "sap-icon://sort-ascending";
					oSorter = new Sorter("date_of_birth", /*bDescending*/false);
			}

			this.getView().getModel("ui").setProperty("/sIcon", sNewIcon);
			this.byId("table").getBinding("rows").sort(oSorter);
		}
	});
});
