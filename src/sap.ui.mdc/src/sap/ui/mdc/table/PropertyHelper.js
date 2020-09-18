/*
 * ! ${copyright}
 */

sap.ui.define([
	"sap/ui/mdc/util/PropertyHelper"
], function(
	PropertyHelperBase
) {
	"use strict";

	/**
	 * Constructor for a new table property helper.
	 *
	 * @param {object[]} aProperties The properties to process in this helper
	 * @param {sap.ui.base.ManagedObject} [oParent] A reference to an instance that will act as the parent of this helper
	 *
	 * @class
	 * Table property helpers give tables of this library a consistent and standardized view on properties and their attributes.
	 * Validates the given properties, sets defaults, and provides utilities to work with these properties.
	 * The utilities can only be used for properties that are known to the helper. Known properties are all those that are passed to the constructor.
	 *
	 * @extends sap.ui.mdc.util.PropertyHelper
	 *
	 * @author SAP SE
	 * @version ${version}
	 *
	 * @private
	 * @experimental
	 * @since 1.83
	 * @alias sap.ui.mdc.table.PropertyHelper
	 * @ui5-metamodel This control/element also will be described in the UI5 (legacy) designtime metamodel
	 */
	var PropertyHelper = PropertyHelperBase.extend("sap.ui.mdc.table.PropertyHelper");

	function isMdcColumnInstance(oColumn) {
		if (!oColumn || !oColumn.isA || !oColumn.isA("sap.ui.mdc.table.Column")) {
			return false;
		}

		return true;
	}

	function getColumnWidthNumber(sWidth) {
		if (sWidth.indexOf("em") > 0) {
			return Math.round(parseFloat(sWidth));
		}

		if (sWidth.indexOf("px") > 0) {
			return Math.round(parseInt(sWidth) / 16);
		}

		return "";
	}

	PropertyHelper.prototype.getTable = function() {
		return this.getParent();
	};

	/**
	 * Gets the export settings for a column.
	 *
	 * @param {sap.ui.mdc.table.Column} oColumn The column for which to get the export settings
	 * @param {boolean} [bSplitCells=false] Whether the <code>splitCells</code> configuration is enabled
	 * @returns {null|object} Export setting object for the provided column
	 * @public
	 */
	PropertyHelper.prototype.getColumnExportSettings = function(oColumn, bSplitCells) {
		if (!isMdcColumnInstance(oColumn)) {
			return null;
		}

		var oProperty = this.getProperty(oColumn.getDataProperties()[0]);

		if (!oProperty) {
			return null;
		}

		bSplitCells = bSplitCells === true;

		var	aColumnExportSettings = [];
		var aPropertiesFromComplexProperty;
		var oExportSettings = this.getExportSettings(oProperty);
		var oColumnExportSettings;
		var aPaths = [];
		var sAdditionalPath;
		var oAdditionalProperty;
		var oAdditionExportSettings;
		var oAdditionalColumnExportSettings;

		if (this.isComplex(oProperty)) {
			aPropertiesFromComplexProperty = this.getPropertiesFromComplexProperty(oProperty);
			if (!bSplitCells && oExportSettings) {
				oColumnExportSettings = getColumnExportSettingsObject(this, oColumn, oProperty, oExportSettings);
				aPropertiesFromComplexProperty.forEach(function(oPropertyInfo) {
					aPaths.push(this.getPath(oPropertyInfo));
				}, this);
				oColumnExportSettings.property = aPaths;
				aColumnExportSettings.push(oColumnExportSettings);
			} else {
				// when there are no exportSettings given for a ComplexProperty or when the splitCells=true
				aPropertiesFromComplexProperty.forEach(function(oCurrentProperty, iIndex) {
					var oCurrentExportSettings = this.getExportSettings(oCurrentProperty),
						oCurrentColumnExportSettings = getColumnExportSettingsObject(this, oColumn, oCurrentProperty, oCurrentExportSettings);
					oCurrentColumnExportSettings.property = this.getPath(oCurrentProperty);
					if (iIndex > 0) {
						oCurrentColumnExportSettings.columnId = oColumn.getId() + "-additionalProperty" + iIndex;
					}
					aColumnExportSettings.push(oCurrentColumnExportSettings);
				}, this);
			}
		} else if (!bSplitCells && oExportSettings) {
			// called for basic propertyInfo having exportSettings
			oColumnExportSettings = getColumnExportSettingsObject(this, oColumn, oProperty, oExportSettings);
			oColumnExportSettings.property = this.getPath(oProperty);
			aColumnExportSettings.push(oColumnExportSettings);
		} else {
			oColumnExportSettings = getColumnExportSettingsObject(this, oColumn, oProperty, oExportSettings);
			oColumnExportSettings.property = this.getPath(oProperty);
			oColumnExportSettings.displayUnit = !bSplitCells ? true : false;
			aColumnExportSettings.push(oColumnExportSettings);

			// get Additional path in case of split cells
			sAdditionalPath = bSplitCells && oExportSettings && oExportSettings.unitProperty ? oExportSettings.unitProperty : null;

			if (sAdditionalPath) {
				oAdditionalProperty = getAdditionalProperty(this, sAdditionalPath);
				oAdditionExportSettings = this.getExportSettings(oAdditionalProperty);
				oAdditionalColumnExportSettings = getColumnExportSettingsObject(this, oColumn, oAdditionalProperty, oAdditionExportSettings);
				oAdditionalColumnExportSettings.property = this.getPath(oAdditionalProperty);
				oAdditionalColumnExportSettings.columnId = oColumn.getId() + "-additionalProperty";
				aColumnExportSettings.push(oAdditionalColumnExportSettings);
			}
		}

		return aColumnExportSettings;
	};

	/**
	 * Gets the property that is identified by a <code>path</code>.
	 *
	 * @param {sap.ui.mdc.table.PropertyHelper} oPropertyHelper Property helper instance
	 * @param {string} sPath The value of the <code>path</code> attribute of the property
	 * @returns {object} The property
	 * @public
	 */
	function getAdditionalProperty(oPropertyHelper, sPath) {
		var oProperty = oPropertyHelper.getPropertyMap()[sPath];

		if (!oProperty) {
			oProperty = oPropertyHelper.getProperties().find(function(oCurrentProperty) {
				return sPath === oCurrentProperty.path;
			});
		}

		if (oPropertyHelper.isComplex(oProperty)) {
			throw new Error("The 'unitProperty' points to a complex property");
		}

		return oProperty;
	}

	/**
	 * Sets defaults to export settings and returns a new export settings object.
	 *
	 * @param {sap.ui.mdc.table.PropertyHelper} oPropertyHelper Property helper instance
	 * @param {sap.ui.mdc.table.Column} oColumn The column from which to get default values
	 * @param {object} oProperty The property from which to get default values
	 * @param {object} oExportSettings The export settings for which to set defaults
	 * @returns {object} The new export settings object
	 * @private
	 */
	function getColumnExportSettingsObject(oPropertyHelper, oColumn, oProperty, oExportSettings) {
		return Object.assign({
			columnId: oColumn.getId(),
			label: oPropertyHelper.getLabel(oProperty),
			width: getColumnWidthNumber(oColumn.getWidth()),
			textAlign: oColumn.getHAlign(),
			type: "String"
		}, oExportSettings);
	}

	return PropertyHelper;
});