/*!
 * ${copyright}
 */

sap.ui.define([
	"sap/ui/thirdparty/jquery",
	"./DataTableUtil"
], function (
	$,
	DataTableUtil
) {
	"use strict";

	/**
	 *
	 * @constructor
	 */
	function DataTable () {
		this.aDataTables = [];
	}

	DataTable.prototype.addDatatable = function (oDataTable) {
		this.aDataTables.push(oDataTable);
	};

	DataTable.prototype.destroyDatatables = function () {
		this.aDataTables.forEach(function(oDataTable) {
			oDataTable.destroy();
		});
		this.aDataTables = [];
	};

	DataTable.prototype.addMiddlewares = function () {
		// add search middleware
		$.fn.dataTable.ext.search.push(
			function( settings, oData , index, rowData, counter ) {
				var bShow = true,
					oDataTable = this.aDataTables.find(function (oDataTable) {
						return oDataTable.sId === settings.sTableId;
					});

				if (oDataTable) {
					bShow = oDataTable.handleSearch(settings, oData , index, rowData, counter);
				}

				return bShow;
			}.bind(this)
		);

		$.extend($.fn.dataTableExt.oSort, {
			"alpha-numeric-asc": function ( a, b ) {
				return DataTableUtil.sortAlphaNumeric(a, b);
			},
			"alpha-numeric-desc": function ( a, b ) {
				return DataTableUtil.sortAlphaNumeric(b, a);
			}
		} );
	};

	function DataTableHelper () {
		var instance = null;

		return {
			getInstance: function () {
				if (!instance) {
					instance = new DataTable();
				}
				return instance;
			}
		};
	}

	return DataTableHelper();
});