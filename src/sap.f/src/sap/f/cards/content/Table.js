/*!
 * ${copyright}
 */
/**
 * Table Card
 */
sap.ui.define(["sap/m/Table", "sap/ui/core/Control", "sap/ui/model/json/JSONModel", "sap/f/cards/Data"],
	function (ResponsiveTable, Control, JSONModel, Data) {
		"use strict";

		var Table = Control.extend("sap.f.cards.content.Table", {
			metadata: {
				properties: {

					data: {
						type: "object"
					},
					columns: {
						type: "array"
					},
					row: {
						type: "array"
					}
				},
				aggregations: {
					_content: {
						multiple: false,
						visibility: "hidden"
					}
				}
			},
			renderer: function (oRm, oCardContent) {
				oRm.write("<div");
				oRm.writeElementData(oCardContent);
				oRm.write(">");
				oRm.renderControl(oCardContent.getAggregation("_content"));
				oRm.write("</div>");
			}
		});

		Table.prototype.applySettings = function (mSettings, oScope) {

			var oData = mSettings.data;

			if (oData) {
				this.setData(oData);
				delete mSettings.data;
			}

			Control.prototype.applySettings.apply(this, [mSettings, oScope]);

			mSettings.data = oData;

			return this;
		};

		Table.prototype.init = function () {
			//create a Table control
			this.oTable = new ResponsiveTable({
				id: this.getId() + "-Table"
			});

			this.setAggregation("_content", this.oTable);
			var oModel = new JSONModel();
			this.setModel(oModel);
		};

		Table.prototype.onBeforeRendering = function () {

			var aCells = [];

			this.getColumns().forEach(function (oColumn) {
				this.getAggregation("_content").addColumn(new sap.m.Column({header: new sap.m.Text({text: oColumn.label})}));
				aCells.push(new sap.m.Text({text: oColumn.value}));
			}.bind(this));

			this.getAggregation("_content").bindItems({
				path: this.getAggregation("_content").getBindingContext().getPath(),
				template: new sap.m.ColumnListItem({
					cells: aCells
				})
			});
		};

		Table.prototype.exit = function () {

			if (this.oTable) {
				this.oTable.destroy();
				this.oTable = null;
			}
		};

		Table.prototype.destroy = function () {
			this.setAggregation("_content", null);
			this.setModel(null);
			return Control.prototype.destroy.apply(this, arguments);
		};

		Table.prototype.setData = function (oData) {

			this.setProperty("data", oData, true);

			if (!oData) {
				return this;
			}

			this.getAggregation("_content").bindElement({
				path: oData.path || "/"
			});

			var oRequest = oData.request;

			if (oData.json && !oRequest) {
				this.getModel().setData(oData.json);
			}

			if (oRequest) {
				Data.fetch(oRequest).then(function (data) {
					this.getModel().setData(data);
				}.bind(this)).catch(function (oError) {
					// TODO: Handle errors. Maybe add error message
				});
			}

			return this;
		};

		return Table;
});
