/*
 * ! ${copyright}
 */

sap.ui.define([
	"sap/ui/mdc/table/Column",
	"sap/m/Text",
	"sap/m/VBox",
	"sap/ui/unified/Currency"
], function(
	Column,
	Text,
	VBox,
	Currency
) {
	"use strict";

	var TableDelegateUtils = {};

	/**
	 * Creates the column for the specified property and table.
	 *
	 * @param {sap.ui.mdc.Table} oTable
	 *     Instance of the table.
	 * @param {string} sPropertyName
	 *     Name of the property.
	 * @param {function(sap.ui.mdc.Table, object):(sap.ui.core.Control | undefined)} [fnCreateTemplate]
	 *     Callback to create a column template. Receives the table instance and property object. If no callback is provided or the callback does
	 *     not return a control, a default control is created.
	 * @returns {Promise<sap.ui.mdc.Column>}
	 *     Promise that resolves with the column.
	 * @private
	 */
	TableDelegateUtils.createColumn = function(oTable, sPropertyName, fnCreateTemplate) {
		if (!oTable.isA) {
			return Promise.resolve(null);
		}

		return oTable.awaitPropertyHelper().then(function(oPropertyHelper) {
			var oProperty = oPropertyHelper.getProperty(sPropertyName);

			if (!oProperty) {
				return null;
			}

			var oTemplate = fnCreateTemplate ? fnCreateTemplate(oTable, oProperty) : null;
			var oColumnInfo = {
				header: oProperty.label,
				template: oTemplate || this.createColumnTemplate(oTable, oProperty),
				dataProperty: sPropertyName
			};

			if (oProperty.unit) {
				oColumnInfo.hAlign = "Right";
			}

			return new Column(oTable.getId() + "--" + oProperty.name, oColumnInfo);
		}.bind(this));
	};

	/**
	 * Creates and returns the template of the column for the specified info
	 *
	 * @param {sap.ui.mdc.Table} oTable
	 *     Instance of the table.
	 * @param {Object} oProperty
	 *     The property object from the property helper.
	 * @returns {sap.ui.core.Control}
	 *     The template control.
	 * @private
	 */
	TableDelegateUtils.createColumnTemplate = function(oTable, oProperty) {
		if (oProperty.isComplex()) {
			return new VBox({
				items: oProperty.getSimpleProperties().map(function(oProperty) {
					return new Text({path: oProperty.path});
				})
			});
		}

		if (oProperty.unit) {
			return Promise.resolve(new Currency({
				useSymbol: false,
				value: {path: oProperty.path},
				currency: {path: oProperty._unit.path}
			}));
		}

		if (oProperty.text) {
			return new Text({
				text: {
					parts: [
						{path: oProperty.path},
						{path: oProperty._text.path}
					],
					formatter: function(sValue, sTextValue) {
						return sValue + (sTextValue ? "(" + sTextValue + ")" : "");
					}
				}
			});
		}

		return new Text({text: {path: oProperty.path}});
	};

	TableDelegateUtils.getMetadataInfo = function(oTable) {
		return oTable.getDelegate().payload;
	};

	TableDelegateUtils.getModel = function(oTable) {
		return oTable.getModel(this.getMetadataInfo(oTable).model);
	};

	return TableDelegateUtils;
});
