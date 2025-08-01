/*!
 * ${copyright}
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

	TableDelegateUtils.updateBindingInfo = function(oTable, oBindingInfo) {
		var oPayload = oTable.getPayload();

		if (!oPayload) {
			return;
		}

		if (oPayload.bindingPath && (oPayload.collectionPath || oPayload.collectionName || oPayload.modelName)) {
			throw new Error("If 'bindingPath' is set, 'collectionPath', 'collectionName', or 'modelName' must not be set in the payload.");
		}

		if (oPayload.collectionPath && (oPayload.collectionName || oPayload.modelName)) {
			throw new Error("If 'collectionPath' is set, 'collectionName', or 'modelName' must not be set in the payload.");
		}

		// Legacy support for collectionPath, collectionName, and modelName
		if (oPayload.bindingPath || oPayload.collectionPath) {
			oBindingInfo.path = oPayload.bindingPath || oPayload.collectionPath;
		} else {
			oBindingInfo.path = "/" + oPayload.collectionName;
			oBindingInfo.model = oPayload.modelName;
		}
	};

	function parseBindingPath(sBindingPath) {
		const oResult = {
			modelName: undefined,
			path: sBindingPath
		};
		const iSeparatorPos = sBindingPath.indexOf(">");

		if (iSeparatorPos > 0) {
			oResult.modelName = sBindingPath.substr(0, iSeparatorPos);
			oResult.path = sBindingPath.substr(iSeparatorPos + 1);
		}

		return oResult;
	}

	TableDelegateUtils.getModelName = function(oTable) {
		const oPayload = oTable.getPayload();

		if (oPayload?.bindingPath || oPayload?.collectionPath) {
			return parseBindingPath(oPayload?.bindingPath || oPayload?.collectionPath).modelName;
		} else {
			return oPayload?.modelName;
		}
	};

	TableDelegateUtils.getModel = function(oTable) {
		return oTable.getModel(this.getModelName(oTable));
	};

	TableDelegateUtils.getEntitySetPath = function(oTable) {
		const oPayload = oTable.getPayload();

		if (oPayload?.bindingPath || oPayload?.collectionPath) {
			return parseBindingPath(oPayload?.bindingPath || oPayload?.collectionPath).path;
		} else {
			return "/" + oPayload.collectionName;
		}
	};

	/**
	 * Creates the column for the specified property and table.
	 *
	 * @param {sap.ui.mdc.Table} oTable
	 *     Instance of the table.
	 * @param {string} sPropertyKey
	 *     Key of the property.
	 * @param {function(sap.ui.mdc.Table, object):(sap.ui.core.Control | undefined)} [fnCreateTemplate]
	 *     Callback to create a column template. Receives the table instance and property object. If no callback is provided or the callback does
	 *     not return a control, a default control is created.
	 * @returns {Promise<sap.ui.mdc.Column>}
	 *     Promise that resolves with the column.
	 * @private
	 */
	TableDelegateUtils.createColumn = function(oTable, sPropertyKey, fnCreateTemplate) {
		if (!oTable.isA) {
			return Promise.resolve(null);
		}

		return oTable._getPropertyByNameAsync(sPropertyKey).then(function(oProperty) {
			if (!oProperty) {
				return null;
			}

			var oTemplate = fnCreateTemplate ? fnCreateTemplate(oTable, oProperty) : null;
			var oColumnInfo = {
				header: oProperty.label,
				template: oTemplate || this.createColumnTemplate(oTable, oProperty),
				propertyKey: sPropertyKey
			};

			if (oProperty.unit) {
				oColumnInfo.hAlign = "Right";
			}

			return new Column(oTable.getId() + "--" + oProperty.key, oColumnInfo);
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
		const oPropertyHelper = oTable.getPropertyHelper();

		if (oProperty.isComplex()) {
			return new VBox({
				items: oProperty.getSimpleProperties().map((oProperty) => {
					return new Text({path: this.getColumnTemplateBindingPath(oTable, oProperty.path)});
				})
			});
		}

		if (oProperty.unit) {
			return Promise.resolve(new Currency({
				useSymbol: false,
				value: {path: this.getColumnTemplateBindingPath(oTable, oProperty.path)},
				currency: {path: this.getColumnTemplateBindingPath(oTable, oPropertyHelper.getProperty(oProperty.unit).path)}
			}));
		}

		if (oProperty.text) {
			return new Text({
				text: {
					parts: [
						{path: this.getColumnTemplateBindingPath(oTable, oProperty.path)},
						{path: this.getColumnTemplateBindingPath(oTable, oPropertyHelper.getProperty(oProperty.text).path)}
					],
					formatter: function(sValue, sTextValue) {
						return sValue + (sTextValue ? "(" + sTextValue + ")" : "");
					}
				}
			});
		}

		return new Text({text: {path: this.getColumnTemplateBindingPath(oTable, oProperty.path)}});
	};

	TableDelegateUtils.getColumnTemplateBindingPath = function(oTable, sPath) {
		const sModelName = this.getModelName(oTable);

		if (sModelName) {
			return sModelName + ">" + sPath;
		} else {
			return sPath;
		}
	};

	return TableDelegateUtils;
});
