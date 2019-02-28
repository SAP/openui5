/*!
 * ${copyright}
 */

sap.ui.define([
		"sap/m/Table",
		"sap/f/cards/BaseContent",
		"sap/m/Column",
		"sap/m/ColumnListItem",
		"sap/m/Text",
		"sap/m/Link",
		"sap/m/ProgressIndicator",
		"sap/m/ObjectIdentifier",
		"sap/m/ObjectStatus",
		"sap/f/Avatar"
	], function (
		ResponsiveTable,
		BaseContent,
		Column,
		ColumnListItem,
		Text,
		Link,
		ProgressIndicator,
		ObjectIdentifier,
		ObjectStatus,
		Avatar
	) {
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
		 * @extends sap.f.cards.BaseContent
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
		var TableContent = BaseContent.extend("sap.f.cards.TableContent", {
			renderer: {}
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

		TableContent.prototype.setConfiguration = function (oConfiguration) {
			BaseContent.prototype.setConfiguration.apply(this, arguments);

			if (!oConfiguration) {
				return;
			}

			if (oConfiguration.columns) {
				this._setColumns(oConfiguration.columns);
			}
		};

		TableContent.prototype._setColumns = function (aColumns) {
			var aCells = [],
				oTable = this._getTable();

			aColumns.forEach(function (oColumn) {
				this._getTable().addColumn(new Column({ header: new Text({ text: oColumn.label }) }));
				aCells.push(this._createCell(oColumn));
			}.bind(this));

			oTable.bindItems({
				path: this.getBindingContext().getPath(),
				template: new ColumnListItem({
					cells: aCells
				})
			});
		};

		/**
		 * Factory method that returns a control from the correct type for each column.
		 *
		 * @param {Object} oColumn Object with settings from the schema.
		 * @returns {sap.ui.core.Control} The control of the proper type.
		 * @private
		 */
		TableContent.prototype._createCell = function (oColumn) {

			if (oColumn.url) {
				return new Link({
					text: oColumn.value,
					href: oColumn.url
				});
			}

			if (oColumn.identifier) {
				return new ObjectIdentifier({
					title: oColumn.value
				});
			}

			if (oColumn.state) {
				return new ObjectStatus({
					text: oColumn.value,
					state: oColumn.state
				});
			}

			if (oColumn.value) {
				return new Text({
					text: oColumn.value
				});
			}

			if (oColumn.icon) {
				return new Avatar({
					src: oColumn.icon.src,
					displayShape: oColumn.icon.shape
				});
			}

			if (oColumn.progressIndicator) {
				return new ProgressIndicator({
					percentValue: oColumn.progressIndicator.percent,
					displayValue: oColumn.progressIndicator.text,
					state: oColumn.progressIndicator.state
				});
			}
		};

		return TableContent;
});
