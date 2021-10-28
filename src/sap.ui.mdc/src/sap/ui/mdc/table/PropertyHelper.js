/*
 * ! ${copyright}
 */

sap.ui.define([
	"../util/PropertyHelper",
	"sap/ui/core/Core",
	"sap/m/table/Util"
], function(
	PropertyHelperBase,
	Core,
	TableUtil
) {
	"use strict";

	/**
	 * @typedef {object} sap.ui.mdc.table.PropertyInfo
	 * @extends sap.ui.mdc.util.PropertyInfo
	 *
	 * @property {object} [exportSettings]
	 *   Object that contains information about the export settings, see {@link sap.ui.export.Spreadsheet}.
	 * @property {int} [maxConditions]
	 *   Defines the maximum number of filter conditions for the property. Possible values that can be used:
	 *   <ul>
	 *       <li>1 is a single-filter expression field</li>
	 *       <li>-1 is a multi-filter expression field</li>
	 *   </ul>
	 *   This information is for example used in the <code>addItem</code> method of the <code>FilterBar</code> control to forward this information to
	 *   the created <code>FilterField</code> instance.
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
	 * @property {boolean} [required]
	 *   Defines whether a filter condition for this property is required.
	 * @property {object} [visualSettings]
	 *   This object contains all relevant properties for visual adjustments.
	 * @property {object} [visualSettings.widthCalculation]
	 *   This object contains all properties and their default values for the column width calculation
	 *
	 * @private
	 * @experimental
	 * @ui5-restricted sap.fe
	 * MDC_PUBLIC_CANDIDATE
	*/

	/**
	 * Constructor for a new table property helper.
	 *
	 * @param {object[]} aProperties
	 *     The properties to process in this helper
	 * @param {Object<string, object>} [mExtensions]
	 *     Key-value map, where the key is the name of the property and the value is the extension containing mode-specific information.
	 *     The extension of a property is stored in a reserved <code>extension</code> attribute, and its attributes must be specified with
	 *     <code>mExtensionAttributeMetadata</code>.
	 * @param {sap.ui.base.ManagedObject} [oParent]
	 *     A reference to an instance that will act as the parent of this helper
	 * @param {object} [mExtensionAttributeMetadata]
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
	 * @param {boolean} [bSplitCells=false] Whether the <code>splitCells</code> configuration is enabled
	 * @returns {null|object} Export setting object for the provided column
	 * @public
	 */
	PropertyHelper.prototype.getColumnExportSettings = function(oColumn, bSplitCells) {
		if (!isMdcColumnInstance(oColumn)) {
			return null;
		}

		var oProperty = this.getProperty(oColumn.getDataProperty());

		if (!oProperty) {
			return null;
		}

		bSplitCells = bSplitCells === true;

		var	aColumnExportSettings = [];
		var aPropertiesFromComplexProperty;
		var oExportSettings = oProperty.exportSettings;
		var oColumnExportSettings;
		var aPaths = [];
		var sAdditionalPath;
		var oAdditionalProperty;
		var oAdditionExportSettings;
		var oAdditionalColumnExportSettings;

		if (oProperty.isComplex()) {
			aPropertiesFromComplexProperty = oProperty.getReferencedProperties();
			if (!bSplitCells && oExportSettings) {
				oColumnExportSettings = getColumnExportSettingsObject(oColumn, oProperty, oExportSettings, bSplitCells);
				aPropertiesFromComplexProperty.forEach(function(oProperty) {
					aPaths.push(oProperty.path);
				});
				oColumnExportSettings.property = aPaths;
				aColumnExportSettings.push(oColumnExportSettings);
			} else {
				// when there are no exportSettings given for a ComplexProperty or when the splitCells=true
				aPropertiesFromComplexProperty.forEach(function(oProperty, iIndex) {
					var oPropertyInfoExportSettings = oProperty.exportSettings,
						oCurrentColumnExportSettings = getColumnExportSettingsObject(oColumn, oProperty, oPropertyInfoExportSettings, bSplitCells);
					oCurrentColumnExportSettings.property = oProperty.path;
					if (iIndex > 0) {
						oCurrentColumnExportSettings.columnId = oColumn.getId() + "-additionalProperty" + iIndex;
					}
					if (oPropertyInfoExportSettings || oCurrentColumnExportSettings.property) {
						aColumnExportSettings.push(oCurrentColumnExportSettings);
					}
				}, this);
			}
		} else if (!bSplitCells && oExportSettings) {
			// called for basic PropertyInfo having exportSettings
			oColumnExportSettings = getColumnExportSettingsObject(oColumn, oProperty, oExportSettings, bSplitCells);
			oColumnExportSettings.property = oProperty.path;
			aColumnExportSettings.push(oColumnExportSettings);
		} else {
			oColumnExportSettings = getColumnExportSettingsObject(oColumn, oProperty, oExportSettings, bSplitCells);
			oColumnExportSettings.property = oProperty.path;
			if (oColumnExportSettings.property) {
				aColumnExportSettings.push(oColumnExportSettings);
			}

			// get Additional path in case of split cells
			sAdditionalPath = bSplitCells && oExportSettings && oExportSettings.unitProperty ? oExportSettings.unitProperty : null;

			if (sAdditionalPath) {
				oAdditionalProperty = getAdditionalProperty(this, sAdditionalPath);
				oAdditionExportSettings = oAdditionalProperty.exportSettings;
				oAdditionalColumnExportSettings = getColumnExportSettingsObject(oColumn, oAdditionalProperty, oAdditionExportSettings, bSplitCells);
				oAdditionalColumnExportSettings.property = oAdditionalProperty.path;
				oAdditionalColumnExportSettings.columnId = oColumn.getId() + "-additionalProperty";
				if (oAdditionExportSettings || oAdditionalColumnExportSettings.property) {
					aColumnExportSettings.push(oAdditionalColumnExportSettings);
				}
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
		var oProperty = oPropertyHelper.getProperty(sPath);

		if (!oProperty) {
			oProperty = oPropertyHelper.getProperties().find(function(oProperty) {
				return sPath === oProperty.path;
			});
		}

		if (oProperty.isComplex()) {
			throw new Error("The 'unitProperty' points to a complex property");
		}

		return oProperty;
	}

	/**
	 * Sets defaults to export settings and returns a new export settings object.
	 *
	 * @param {sap.ui.mdc.table.Column} oColumn The column from which to get default values
	 * @param {object} oProperty The property from which to get default values
	 * @param {object} oExportSettings The export settings for which to set defaults
	 * @param {boolean} bSplitCells Whether the <code>splitCells</code> configuration is enabled
	 * @returns {object} The new export settings object
	 * @private
	 */
	function getColumnExportSettingsObject(oColumn, oProperty, oExportSettings, bSplitCells) {
	var oExportObj = Object.assign({
			columnId: oColumn.getId(),
			label: oProperty.label,
			width: getColumnWidthNumber(oColumn.getWidth()),
			textAlign: oColumn.getHAlign(),
			type: "String"
		}, oExportSettings);

		if (bSplitCells) {
			oExportObj.displayUnit = false;
		}

		return oExportObj;
	}

	/**
	 * Sets the width of the provided column based on the <code>visualSettings</code> of the relevant <code>PropertyInfo</code>.
	 *
	 * @param {sap.ui.mdc.table.Column} oMDCColumn The <code>Column</code> instance for which to set the width
	 * @public
	 * @since 1.95
	 */
	PropertyHelper.prototype.setColumnWidth = function(oMDCColumn) {
		var sPropertyName = oMDCColumn.getDataProperty();
		var oProperty = this.getProperty(sPropertyName);
		if (!oProperty) {
			return;
		}

		var mPropertyInfoVisualSettings = oProperty.visualSettings;
		if (mPropertyInfoVisualSettings && mPropertyInfoVisualSettings.widthCalculation === null) {
			return;
		}

		var fWidth = this._calcColumnWidth(oProperty) + 1; // add 1rem extra for padding and border
		oMDCColumn._updateColumnWidth(fWidth + "rem");
	};

	/**
	 * Calculates the column width based on the provided <code>PropertyInfo</code>.
	 *
	 * @param {object} oProperty The properties of <code>PropertyInfo</code> of <code>Column</code> instance for which to set the width
	 * @param {object} [mWidthCalculation] The configuration object for the width calculation
	 * @param {int} [mWidthCalculation.minWidth=2] The minimum content width in rem
	 * @param {int} [mWidthCalculation.maxWidth=19] The maximum content width in rem
	 * @param {int} [mWidthCalculation.defaultWidth=8] The default column content width when type check fails
	 * @param {boolean} [mWidthCalculation.includeLabel=true] Whether the label should be taken into account
	 * @param {float} [mWidthCalculation.gap=0] The additional content width in rem
	 * @param {boolean} [mWidthCalculation.verticalArrangement=false] Whether the referenced properties are arranged vertically
	 * @param {string|array[]} [mWidthCalculation.excludeProperties=[]] A list of invisible referenced property names
	 * @return {float} [fWidth] Calculated width
	 * @since 1.95
	 * @private
	 */
	PropertyHelper.prototype._calcColumnWidth = function (oProperty, mWidthCalculation) {
		var fWidth = 0;
		var fLabelWidth = 0;
		var mPropertyInfoWidthCalculation = oProperty.visualSettings.widthCalculation;
		mWidthCalculation = Object.assign({}, mPropertyInfoWidthCalculation);

		var iMinWidth = Math.max(1, mWidthCalculation.minWidth);
		var iMaxWidth = Math.max(iMinWidth, mWidthCalculation.maxWidth);

		if (oProperty.isComplex()) {
			var aRelevantReferencedProperties = oProperty.getReferencedProperties().filter(function(oProp) {
				return ![].concat(mWidthCalculation.excludeProperties).includes(oProp.name);
			});

			aRelevantReferencedProperties.forEach(function(oReferencedProperty) {
				var fReferencedPropertyWidth = this._calcColumnWidth(oReferencedProperty, {
					includeLabel: false
				});

				if (mWidthCalculation.verticalArrangement || aRelevantReferencedProperties.length == 1) {
					fWidth = Math.max(fReferencedPropertyWidth, fWidth);
				} else {
					fWidth = fWidth + fReferencedPropertyWidth + 0.5; // add 0.5rem for some extra spacing in h-alignment
				}
			}, this);
		} else {
			var oTypeConfig = oProperty.typeConfig;
			var oType = oTypeConfig.typeInstance;

			if (oType) {
				fWidth = TableUtil.calcTypeWidth(oType, mWidthCalculation);
			}
			if (oProperty.unit) {
				fWidth += 2.5;
			}
		}

		fWidth += mWidthCalculation.gap;

		if (mWidthCalculation.includeLabel) {
			fLabelWidth = TableUtil.calcHeaderWidth(oProperty.label, fWidth, iMaxWidth, iMinWidth);
		}

		fWidth = Math.max(iMinWidth, fWidth, fLabelWidth);
		fWidth = Math.min(fWidth, iMaxWidth);
		fWidth = Math.round(fWidth * 100) / 100;

		return fWidth;
	};

	return PropertyHelper;
});