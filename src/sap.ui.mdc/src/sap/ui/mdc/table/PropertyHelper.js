/*!
 * ${copyright}
 */

sap.ui.define([
	"../util/PropertyHelper",
	"sap/m/table/Util"
], function(
	PropertyHelperBase,
	TableUtil
) {
	"use strict";

	/**
	 * @typedef {sap.ui.mdc.util.PropertyInfo} sap.ui.mdc.table.PropertyInfo
	 *
	 * @property {boolean} [filterable=true]
	 *   Defines whether a property is filterable.
	 * @property {boolean} [sortable=true]
	 *   Defines whether a property is sortable.
	 * @property {boolean} [groupable=false]
	 *   Defines whether a property is groupable.
	 * @property {boolean} [key=false]
	 *   Defines whether a property is a key or part of a key in the data.
	 * @property {string} [unit]
	 *   Name of the unit property that is related to this property.
	 * @property {string} [text]
	 *   Name of the text property that is related to this property in a 1:1 relation.
	 * @property {object} [exportSettings]
	 *   Object that contains information about the export settings, see {@link sap.ui.export.Spreadsheet}.
	 * @property {Object} [visualSettings]
	 *   This object contains all relevant properties for visual adjustments.
	 * @property {Object} [visualSettings.widthCalculation]
	 *   This object contains all properties and their default values for the column width calculation
	 * @property {integer} [visualSettings.widthCalculation.minWidth=2]
	 *   The minimum content width in rem
	 * @property {integer} [visualSettings.widthCalculation.maxWidth=19]
	 *   The maximum content width in rem
	 * @property {integer} [visualSettings.widthCalculation.defaultWidth=8]
	 *   The default column content width when type check fails
	 * @property {float} [visualSettings.widthCalculation.gap=0]
	 *   The additional content width in rem
	 * @property {boolean} [visualSettings.widthCalculation.includeLabel=true]
	 *   Whether the label should be taken into account
	 * @property {boolean} [visualSettings.widthCalculation.truncateLabel=true]
	 *   Whether the label should be trucated or not
	 * @property {boolean} [visualSettings.widthCalculation.verticalArrangement=false]
	 *   Whether the referenced properties are arranged vertically
	 * @property {sap.ui.mdc.util.PropertyHelper[]} [visualSettings.widthCalculation.excludeProperties]
	 *   A list of invisible referenced property names
	 * @property {string[]} [propertyInfos]
	 *   The availability of this property makes the <code>PropertyInfo</code> a complex <code>PropertyInfo</code>. Provides a list of related
	 *   properties (by name). These related properties must not themselves be complex.
	 *
	 * @private
	 * @experimental
	 * @ui5-restricted sap.fe
	 * MDC_PUBLIC_CANDIDATE
	 */

	/**
	 * Constructor for a new table property helper.
	 *
	 * @param {sap.ui.mdc.table.PropertyInfo[]} aProperties
	 *     The properties to process in this helper
	 * @param {Object<string, Object>} [mExtensions]
	 *     Key-value map, where the key is the name of the property and the value is the extension containing mode-specific information.
	 *     The extension of a property is stored in a reserved <code>extension</code> attribute, and its attributes must be specified with
	 *     <code>mExtensionAttributeMetadata</code>.
	 * @param {sap.ui.base.ManagedObject} [oParent]
	 *     A reference to an instance that will act as the parent of this helper
	 * @param {Object} [mExtensionAttributeMetadata]
	 *     The attribute metadata for the model-specific property extension
	 *
	 * @class
	 * Table property helpers in this SAPUI5 library provide tables with consistent and standardized structure of properties and their attributes.
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
	var PropertyHelper = PropertyHelperBase.extend("sap.ui.mdc.table.PropertyHelper", {
		constructor: function(aProperties, mExtensions, oParent, mExtensionAttributeMetadata) {
			var aAllowedAttributes = ["filterable", "sortable", "groupable", "key", "unit", "text", "exportSettings", "propertyInfos", "visualSettings"];
			PropertyHelperBase.call(this, aProperties, mExtensions, oParent, aAllowedAttributes, mExtensionAttributeMetadata);
		}
	});

	function isMdcColumnInstance(oColumn) {
		return !!(oColumn && oColumn.isA && oColumn.isA("sap.ui.mdc.table.Column"));
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

	/**
	 * @inheritDoc
	 */
	PropertyHelper.prototype.prepareProperty = function(oProperty) {
		PropertyHelperBase.prototype.prepareProperty.apply(this, arguments);
		oProperty.aggregatable = false;
	};

	/**
	 * Gets the export settings for a column.
	 *
	 * @param {sap.ui.mdc.table.Column} oColumn The column for which to get the export settings
	 * @returns {Object[]} Array of export setting objects for the provided column. Will return more than one object if it is complex property.
	 * @private
	 */
	PropertyHelper.prototype.getColumnExportSettings = function(oColumn) {
		var aColumnExportSettings = [];

		if (!isMdcColumnInstance(oColumn)) {
			return aColumnExportSettings;
		}

		var oProperty = this.getProperty(oColumn.getDataProperty());

		if (!oProperty) {
			return aColumnExportSettings;
		}

		var oExportSettings = oProperty.exportSettings;

		// exportSettings have been set explicitly to null by the application for this column to exclude it from the export
		if (oExportSettings === null) {
			return aColumnExportSettings;
		}

		var aPaths = [];
		var oColumnExportSettings;
		var aPropertiesFromComplexProperty;

		if (!oProperty.isComplex()) {
			oColumnExportSettings = getColumnExportSettingsObject(oColumn, oProperty, oExportSettings);
			oColumnExportSettings.property = oProperty.path;
			aColumnExportSettings.push(oColumnExportSettings);

			return aColumnExportSettings;
		}

		aPropertiesFromComplexProperty = oProperty.getSimpleProperties();
		if (Object.keys(oExportSettings).length) {
			oColumnExportSettings = getColumnExportSettingsObject(oColumn, oProperty, oExportSettings);
			aPropertiesFromComplexProperty.forEach(function(oProperty) {
				aPaths.push(oProperty.path);
			});
			oColumnExportSettings.property = aPaths;
			aColumnExportSettings.push(oColumnExportSettings);
		} else {
			// when there are no exportSettings given for a ComplexProperty
			aPropertiesFromComplexProperty.forEach(function(oProperty, iIndex) {
				var oPropertyInfoExportSettings = oProperty.exportSettings,
					oCurrentColumnExportSettings = getColumnExportSettingsObject(oColumn, oProperty, oPropertyInfoExportSettings);
				oCurrentColumnExportSettings.property = oProperty.path;
				if (iIndex > 0) {
					oCurrentColumnExportSettings.columnId = oColumn.getId() + "-additionalProperty" + iIndex;
				}
				if (oPropertyInfoExportSettings || oCurrentColumnExportSettings.property) {
					aColumnExportSettings.push(oCurrentColumnExportSettings);
				}
			});
		}

		return aColumnExportSettings;
	};

	/**
	 * Sets defaults to export settings and returns a new export settings object.
	 *
	 * @param {sap.ui.mdc.table.Column} oColumn The column from which to get default values
	 * @param {Object} oProperty The property from which to get default values
	 * @param {Object} oExportSettings The export settings for which to set defaults
	 * @returns {Object} The new export settings object
	 * @private
	 */
	function getColumnExportSettingsObject(oColumn, oProperty, oExportSettings) {
		var oExportObj = Object.assign({
			columnId: oColumn.getId(),
			label: oProperty.label,
			width: getColumnWidthNumber(oColumn.getWidth()),
			textAlign: oColumn.getHAlign(),
			type: "String"
		}, oExportSettings);

		return oExportObj;
	}

	/**
	 * Calculates the width of the provided column based on the <code>visualSettings</code> of the relevant <code>PropertyInfo</code>.
	 *
	 * @param {sap.ui.mdc.table.Column} oMDCColumn The <code>Column</code> instance for which to set the width
	 * @returns {sap.ui.core.CSSSize | null} The calculated width, or <code>null</code> if calculation wasn't possible
	 */
	PropertyHelper.prototype.calculateColumnWidth = function(oMDCColumn) {
		var sPropertyName = oMDCColumn.getDataProperty();
		var oProperty = this.getProperty(sPropertyName);

		if (!oProperty) {
			return null;
		}

		var mPropertyInfoVisualSettings = oProperty.visualSettings;
		if (mPropertyInfoVisualSettings && mPropertyInfoVisualSettings.widthCalculation === null) {
			return null;
		}

		var fPadding = oMDCColumn.getTable()._bMobileTable ? 1 : 1.1875; // TODO: get from theme parameters
		return this._calcColumnWidth(oProperty, fPadding, oMDCColumn.getHeader());
	};

	/**
	 * Calculates the column width based on the provided <code>PropertyInfo</code>.
	 *
	 * @param {Object} oProperty The properties of <code>PropertyInfo</code> of <code>Column</code> instance for which to set the width
	 * @param {float} [fPadding=1] The additional horizontal border and padding added to the content width calculation of the column
	 * @param {string} [sHeader] The header in case of it is different than the PropertyInfo header
	 * @return {string} The calculated column width
	 * @since 1.95
	 * @private
	 */
	 PropertyHelper.prototype._calcColumnWidth = function (oProperty, fPadding, sHeader) {
		var mWidthCalculation = Object.assign({
			gap: 0,
			includeLabel: true,
			truncateLabel: true,
			padding: fPadding || 1,
			excludeProperties: []
		}, oProperty.visualSettings && oProperty.visualSettings.widthCalculation);

		var aTypes = [];
		if (oProperty.isComplex()) {
			// for complex properties generate [<TypeInstance>, <TypeSettings>][] structure
			aTypes = oProperty.getSimpleProperties().flatMap(function(oProp) {
				var mPropWidthCalculation = oProp.visualSettings ? oProp.visualSettings.widthCalculation : undefined;
				return mPropWidthCalculation === null || mWidthCalculation.excludeProperties.includes(oProp.name) ? [] : [
					[oProp.typeConfig.typeInstance, mPropWidthCalculation]
				];
			});
		} else {
			// for simple properties generate <TypeInstance>[] structure
			aTypes.push(oProperty.typeConfig.typeInstance);
		}

		if (oProperty.unit) {
			// @TODO: follow the unit property, like a complex property, instead of adding a fix gap
			mWidthCalculation.gap += 2.5;
		}

		sHeader = (mWidthCalculation.includeLabel) ? sHeader || oProperty.label : "";
		return TableUtil.calcColumnWidth(aTypes, sHeader, mWidthCalculation);
	};

	return PropertyHelper;
});