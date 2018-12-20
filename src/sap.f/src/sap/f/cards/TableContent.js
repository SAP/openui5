/*!
 * ${copyright}
 */

sap.ui.define(["sap/m/Table", "sap/ui/core/Control", "sap/ui/model/json/JSONModel", "sap/f/cards/Data"],
	function (ResponsiveTable, Control, JSONModel, Data) {
		"use strict";

		/**
		 * Constructor for a new <code>Table</code>.
		 *
		 * @param {string} [sId] ID for the new control, generated automatically if no ID is given
		 * @param {object} [mSettings] Initial settings for the new control
		 *
		 * @class
		 *
		 * <h3>Overview</h3>
		 *
		 *
		 * <h3>Usage</h3>
		 *
		 * <h3>Responsive Behavior</h3>
		 *
		 * @extends sap.ui.core.Control
		 *
		 * @author SAP SE
		 * @version ${version}
		 *
		 * @constructor
		 * @experimental
		 * @since 1.60
		 * @see {@link TODO Card}
		 * @alias sap.f.cards.TableContent
		 */
		var TableContent = Control.extend("sap.f.cards.TableContent", {
			metadata: {
				properties: {
					manifestContent: { type: "object" }
				},
				defaultAggregation: "columns",
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

		TableContent.prototype._getTable = function () {

			if (this._bIsBeingDestroyed) {
				return null;
			}

			var oTable = this.getAggregation("_content");

			if (!oTable) {
				oTable = new ResponsiveTable({
					id: this.getId() + "-Table"
				});
				this.setAggregation("_content", oTable);
			}

			return oTable;
		};

		TableContent.prototype.setManifestContent = function (oContent) {

			this.setProperty("manifestContent", oContent);

			if (!oContent) {
				return;
			}

			if (oContent.data) {
				this._setData(oContent.data);
			}

			if (oContent.columns) {
				this._setColumns(oContent.columns);
			}
		};

		TableContent.prototype._setColumns = function (aColumns) {
			var aCells = [];

			aColumns.forEach(function (oColumn) {
				this._getTable().addColumn(new sap.m.Column({ header: new sap.m.Text({ text: oColumn.label }) }));
				aCells.push(new sap.m.Text({ text: oColumn.value }));
			}.bind(this));

			this._getTable().bindItems({
				path: this._getTable().getBindingContext().getPath(),
				template: new sap.m.ColumnListItem({
					cells: aCells
				})
			});
		};

		TableContent.prototype.applySettings = function (mSettings, oScope) {

			var oData = mSettings.data;

			if (oData) {
				this._setData(oData);
				delete mSettings.data;
			}

			Control.prototype.applySettings.apply(this, [mSettings, oScope]);

			mSettings.data = oData;

			return this;
		};

		TableContent.prototype.init = function () {
			var oModel = new JSONModel();
			this.setModel(oModel);
		};

		TableContent.prototype.destroy = function () {
			this.setModel(null);
			return Control.prototype.destroy.apply(this, arguments);
		};

		TableContent.prototype._setData = function (oData) {

			this._getTable().bindElement({
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

		return TableContent;
});
