/*!
 * ${copyright}
 */

// Provides control sap.ui.dt.test.report.Table.
sap.ui.define([
	"sap/ui/core/Control",
	"sap/ui/model/json/JSONModel",
	"sap/ui/table/TreeTable",
	"sap/ui/table/Column",
	"sap/ui/table/rowmodes/Fixed",
	"sap/m/Toolbar",
	"sap/m/ToolbarSpacer",
	"sap/m/Button",
	"sap/m/SearchField",
	"sap/m/Label",
	"sap/m/Text",
	"sap/m/RatingIndicator",
	"./TableRenderer"
], function(
	Control,
	JSONModel,
	TreeTable,
	Column,
	FixedRowMode,
	Toolbar,
	ToolbarSpacer,
	Button,
	SearchField,
	Label,
	Text,
	RatingIndicator,
	TableRenderer
) {
	"use strict";

	/**
	 * Constructor for a new Table report.
	 *
	 * @param {string} [sId] id for the new control, generated automatically if no id is given
	 * @param {object} [mSettings] initial settings for the new control
	 *
	 * @class
	 * The table report can be used to visualize the design time tests.
	 * @extends sap.ui.core.Control
	 *
	 * @author SAP SE
	 * @version ${version}
	 *
	 * @constructor
	 * @private
	 * @since 1.38
	 * @alias sap.ui.dt.enablement.report.Table
	 */
	var oTable = Control.extend("sap.ui.dt.enablement.report.Table", /** @lends sap.ui.dt.enablement.report.Table.prototype */ {
		metadata: {
			library: "sap.ui.dt",
			properties: {
				data: {
					type: "object"
				}
			},
			aggregations: {
				_table: {
					type: "sap.ui.table.TreeTable",
					hidden: true,
					multiple: false
				}
			}
		},

		/**
		 * Called when the Table is initialized
		 * @protected
		 */
		init() {
			this.setAggregation("_table", this._createTable());
		},

		/**
		 * Called when the Table is destroyed
		 * @protected
		 */
		exit() {
			clearTimeout(this._iFilterTimeout);
			this.setData(null);
		},

		/**
		 * Sets the data to display in the table
		 * @param {object} oData the data to display
		 *
		 * @public
		 */
		setData(oData) {
			if (this._oModel) {
				this._oModel.destroy();
				delete this._oModel;
			}
			if (oData) {
				this._oModel = new JSONModel(oData);
				this._getTable().setModel(this._oModel);
			} else {
				this._getTable().setModel(null);
			}
			this.setProperty("data", oData);
		},

		/**
		 * Filters the table.
		 *
		 * @param  {string} sFilter The filter string.
		 *
		 * @public
		 */
		filter(sFilter) {
			var oModel = this._getTable().getModel();
			if (oModel) {
				if (sFilter.length > 0) {
					// As UI5 does not support filtering on first level, we have to do it on our own
					var aData = this.getData();
					var aFilteredData = aData.children.filter(function(oEntry) {
						if (sFilter.indexOf("status=") !== -1) {
							return oEntry.status.value === sFilter.substring(sFilter.indexOf("=") + 1);
						}
						return oEntry.name.toLowerCase().indexOf(sFilter.toLowerCase()) !== -1;
					});
					oModel.setData(aFilteredData);
				} else {
					oModel.setData(this.getData());
				}
			}
		},

		/**
		 * @private
		 */
		_createTable() {
			var oTable = new TreeTable(`${this.getId()}--table`, {
				selectionMode: "MultiToggle",
				rowMode: new FixedRowMode({
					rowCount: 20
				}),
				enableSelectAll: false,
				ariaLabelledBy: "title",
				extension: this._createToolbar(),
				rows: "{path:'/', parameters: {arrayNames:['children']}}",
				columns: [
					this._createTextColumn("name", "Name", "{name}"),
					this._createRatingIndicatorColumn("value", "Status Values", "{status/value}", "{status/text} ({status/value})"),
					this._createTextColumn("status", "Status", "{status/text}"),
					this._createTextColumn("message", "Message", "{message}")
				]
			});

			return oTable;
		},

		/**
		 * @private
		 */
		_createToolbar() {
			return new Toolbar(`${this.getId()}--toolbar`, {
				content: [
					new ToolbarSpacer(`${this.getId()}--toolbar-spacer`),
					new Button(`${this.getId()}--toolbar-collapse-button`, {
						text: "Collapse all",
						press: this._onCollapseAll.bind(this)
					}),
					new Button(`${this.getId()}--toolbar-expand-button`, {
						text: "Expand",
						press: this._onExpandSecondLevel.bind(this)
					}),
					new SearchField(`${this.getId()}--toolbar-search-field`, {
						liveChange: this._onSearch.bind(this)
					})
				]
			});
		},

		/**
		 * @private
		 */
		_onSearch(oEvt) {
			var sFilter = oEvt.getParameter("newValue");
			clearTimeout(this._iFilterTimeout);
			this._iFilterTimeout = setTimeout(function() {
				this.filter(sFilter);
			}.bind(this), 100);
		},

		/**
		 * @private
		 */
		_createTextColumn(sId, sColumnText, sRowText) {
			return this._createColumn(sId, sColumnText,
				new Text({
					text: sRowText
				})
			);
		},

		/**
		 * @private
		 */
		_createRatingIndicatorColumn(sId, sColumnText, sRowText, sTooltip) {
			return this._createColumn(sId, sColumnText,
				new RatingIndicator({
					maxValue: 3,
					value: sRowText,
					enabled: false,
					tooltip: sTooltip
				})
			);
		},

		/**
		 * @private
		 */
		_createColumn(sId, sColumnText, oTemplate) {
			return new Column(`${this.getId()}--table-column-${sId}`, {
				label: new Label({text: sColumnText}),
				width: "13em",
				template: oTemplate
			});
		},

		/**
		 * @private
		 */
		_getTable() {
			return this.getAggregation("_table");
		},

		/**
		 * @private
		 */
		_onCollapseAll() {
			var oTable = this._getTable();
			oTable.collapseAll();
		},

		/**
		 * @private
		 */
		_onExpandSecondLevel() {
			var oTable = this._getTable();
			oTable.expandToLevel(2);
		},

		renderer: TableRenderer
	});

	return oTable;
});