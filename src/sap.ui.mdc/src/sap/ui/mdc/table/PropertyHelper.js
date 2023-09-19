/*!
 * ${copyright}
 */

sap.ui.define([
	"../util/PropertyHelper",
	"sap/m/table/Util",
	"sap/ui/base/Object"
], function(
	PropertyHelperBase,
	TableUtil,
	BaseObject
) {
	"use strict";

	/**
	 * @typedef {sap.ui.mdc.util.PropertyInfo} sap.ui.mdc.table.PropertyInfo
	 *
	 * An object literal describing a data property in the context of an {@link sap.ui.mdc.Table}.
	 *
	 * When specifying the <code>PropertyInfo</code> objects in the {@link sap.ui.mdc.Table#getPropertyInfo propertyInfo} property, the
	 * following attributes need to be specified:
	 * <ul>
	 *   <li><code>name</code></li>
	 *   <li><code>path</code></li>
	 *   <li><code>dataType</code></li>
	 *   <li><code>formatOptions</code></li>
	 *   <li><code>constraints</code></li>
	 *   <li><code>maxConditions</code></li>
	 *   <li><code>caseSensitive</code></li>
	 *   <li><code>visualSettings.widthCalculation</code></li>
	 *   <li><code>propertyInfos</code></li>
	 *   <li><code>groupable</code></li>
	 *   <li><code>key</code></li>
	 *   <li><code>unit</code></li>
	 *   <li><code>text</code></li>
	 * </ul>
	 *
	 * If the property is complex, the following attributes need to be specified:
	 * <ul>
	 *   <li><code>name</code></li>
	 *   <li><code>visualSettings.widthCalculation</code></li>
	 *   <li><code>propertyInfos</code> (all referenced properties must be specified)</li>
	 * </ul>
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
	 * @property {object} [clipboardSettings]
	 *   Object that contains information about the clipboard settings. Setting this value to <code>null</code> disables the copy function.
	 * @property {string} [clipboardSettings.template]
	 *   Defines the formatting template that supports indexed placeholders of <code>propertyInfos</code> within curly brackets, for example, "{0} ({1})".
	 * @property {Object} [visualSettings]
	 *   This object contains all relevant properties for visual adjustments.
	 * @property {Object} [visualSettings.widthCalculation]
	 *   This object contains all properties and their default values for the column width calculation
	 * @property {int} [visualSettings.widthCalculation.minWidth=2]
	 *   The minimum content width in rem
	 * @property {int} [visualSettings.widthCalculation.maxWidth=19]
	 *   The maximum content width in rem
	 * @property {int} [visualSettings.widthCalculation.defaultWidth=8]
	 *   The default column content width when type check fails
	 * @property {float} [visualSettings.widthCalculation.gap=0]
	 *   The additional content width in rem
	 * @property {boolean} [visualSettings.widthCalculation.includeLabel=true]
	 *   Whether the label should be taken into account
	 * @property {boolean} [visualSettings.widthCalculation.truncateLabel=true]
	 *   Whether the label should be trucated or not
	 * @property {boolean} [visualSettings.widthCalculation.verticalArrangement=false]
	 *   Whether the referenced properties are arranged vertically
	 * @property {string[]} [visualSettings.widthCalculation.excludeProperties]
	 *   A list of invisible referenced property names
	 * @property {string[]} [propertyInfos]
	 *   The availability of this property makes the <code>PropertyInfo</code> a complex <code>PropertyInfo</code>. Provides a list of related
	 *   properties (by name). These related properties must not themselves be complex.
	 *
	 * @public
	 */

	/**
	 * Constructor for a new table property helper.
	 *
	 * @param {sap.ui.mdc.table.PropertyInfo[]} aProperties
	 *     The properties to process in this helper
	 * @param {sap.ui.base.ManagedObject} [oParent]
	 *     A reference to an instance that will act as the parent of this helper
	 * @param {object} [mExtensionAttributes]
	 *     Additional, model-specific attributes that the <code>PropertyInfo</code> may contain within the attribute "extension". Extension
	 *     attributes cannot be mandatory.
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
	 */
	const PropertyHelper = PropertyHelperBase.extend("sap.ui.mdc.table.PropertyHelper", {
		constructor: function(aProperties, oParent, mExtensionAttributes) {
			PropertyHelperBase.call(this, aProperties, oParent, Object.assign({
				// Enable default attributes
				filterable: true,
				sortable: true,
				propertyInfos: true,

				// Additional attributes
				groupable: {
					type: "boolean",
					forComplexProperty: {
						valueIfNotAllowed: false
					}
				},
				key: {
					type: "boolean",
					forComplexProperty: {
						valueIfNotAllowed: false
					}
				},
				unit: {
					type: "PropertyReference"
				},
				text: {
					type: "PropertyReference"
				},
				exportSettings: {
					type: "object",
					"default": {
						value: {},
						ignoreIfNull: true
					},
					forComplexProperty: {
						allowed: true
					}
				},
				clipboardSettings: {
					type: {
						template: {
							type: "string"
						}
					},
					"default": {
						value: {},
						ignoreIfNull: true
					},
					forComplexProperty: {
						allowed: true
					}
				},
				visualSettings: {
					type: {
						widthCalculation: {
							type: {
								minWidth: {
									type: "int",
									"default": {
										value: 2
									}
								},
								maxWidth: {
									type: "int",
									"default": {
										value: 19
									}
								},
								defaultWidth: {
									type: "int",
									"default": {
										value: 8
									}
								},
								gap: {
									type: "float",
									"default": {
										value: 0
									}
								},
								includeLabel: {
									type: "boolean",
									"default": {
										value: true
									}
								},
								truncateLabel: {
									type: "boolean",
									"default": {
										value: true
									}
								},
								verticalArrangement: {
									type: "boolean",
									"default": {
										value: false
									}
								},
								excludeProperties: {
									type: "PropertyReference[]"
								}
							},
							"default": {
								value: {},
								ignoreIfNull: true
							}
						}
					},
					"default": {
						value: {}
					},
					forComplexProperty: {
						allowed: true
					}
				}
			}, mExtensionAttributes ? {
				extension: {
					type: mExtensionAttributes,
					"default": {
						value: {}
					},
					forComplexProperty: {
						allowed: true,
						propagateAllowance: false
					}
				}
			} : {}, this._bEnableAggregatableAttribute ? {
				aggregatable: {
					type: "boolean",
					forComplexProperty: {
						valueIfNotAllowed: false
					}
				}
			} : {}));
		}
	});

	/**
	 * @inheritDoc
	 */
	PropertyHelper.prototype.prepareProperty = function(oProperty) {
		PropertyHelperBase.prototype.prepareProperty.apply(this, arguments);

		// The typeConfig is required for internal processes like column width calculation and filter handling.
		// TODO: The typeConfig can still provided by the user for legacy reasons. Once migration is completed, always create the typeConfig based
		//  on the provided dataType.
		if (!oProperty.isComplex() && !oProperty.typeConfig && oProperty.dataType && this.getParent()) {
			const oTypeUtil = this.getParent().getControlDelegate().getTypeMap();
			oProperty.typeConfig = oTypeUtil.getTypeConfig(oProperty.dataType, oProperty.formatOptions, oProperty.constraints);
		}

		Object.defineProperty(oProperty, "getGroupableProperties", {
			value: function() {
				return oProperty.getSimpleProperties().filter(function(oProperty) {
					return oProperty.groupable;
				});
			}
		});
	};

	/**
	 * Gets all groupable properties.
	 *
	 * @returns {sap.ui.mdc.table.PropertyInfo[]} All groupable properties
	 * @public
	 */
	PropertyHelper.prototype.getGroupableProperties = function() {
		return this.getProperties().filter(function(oProperty) {
			return oProperty.groupable;
		});
	};

	/**
	 * Gets the clipboard settings for a column.
	 *
	 * @param {sap.ui.mdc.table.Column} oColumn The column for which to get the clipboard settings
	 * @returns {sap.m.plugins.CopyProvider.ColumnClipboardSettings|null} Clipboard setting object for the provided column.
	 * @private
	 */
	PropertyHelper.prototype.getColumnClipboardSettings = function(oColumn) {
		const oProperty = this.getProperty(oColumn.getPropertyKey());
		if (!oProperty || oProperty.clipboardSettings === null) {
			return null;
		}

		const aProperties = oProperty.getSimpleProperties().map(function(oSimpleProperty) {
			return oSimpleProperty.path;
		});
		const aTypes = oProperty.getSimpleProperties().map(function(oSimpleProperty) {
			return oSimpleProperty.typeConfig && oSimpleProperty.typeConfig.typeInstance;
		});
		const sTemplate = oProperty.clipboardSettings.template || Array.from(Array(aProperties.length).keys(), function(iIndex) {
			return "{" + iIndex + "}";
		}).join(" ");

		return {
			properties: aProperties,
			template: sTemplate,
			types: aTypes
		};
	};

	/**
	 * Gets the export settings for a column.
	 *
	 * @param {sap.ui.mdc.table.Column} oColumn The column for which to get the export settings
	 * @returns {Object[]} Array of export setting objects for the provided column. Will return more than one object if it is complex property.
	 * @private
	 */
	PropertyHelper.prototype.getColumnExportSettings = function(oColumn) {
		const aColumnExportSettings = [];

		if (!BaseObject.isA(oColumn, "sap.ui.mdc.table.Column")) {
			return aColumnExportSettings;
		}

		const oProperty = this.getProperty(oColumn.getPropertyKey());

		if (!oProperty) {
			return aColumnExportSettings;
		}

		const oExportSettings = oProperty.exportSettings;

		// exportSettings have been set explicitly to null by the application for this column to exclude it from the export
		if (oExportSettings === null) {
			return aColumnExportSettings;
		}

		const aPaths = [];
		let oColumnExportSettings;

		if (!oProperty.isComplex()) {
			oColumnExportSettings = getColumnExportSettingsObject(oColumn, oProperty, oExportSettings);
			oColumnExportSettings.property = oProperty.path;
			aColumnExportSettings.push(oColumnExportSettings);

			return aColumnExportSettings;
		}

		const aPropertiesFromComplexProperty = oProperty.getSimpleProperties();
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
				if (!oProperty.exportSettings) {
					return;
				}

				const oCurrentColumnExportSettings = getColumnExportSettingsObject(oColumn, oProperty, oProperty.exportSettings);

				oCurrentColumnExportSettings.property = oProperty.path;
				if (iIndex > 0) {
					oCurrentColumnExportSettings.columnId = oColumn.getId() + "-additionalProperty" + iIndex;
				}
				if (oProperty.exportSettings || oCurrentColumnExportSettings.property) {
					aColumnExportSettings.push(oCurrentColumnExportSettings);
				}
			});
		}

		return aColumnExportSettings;
	};

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
	 * Sets defaults to export settings and returns a new export settings object.
	 *
	 * @param {sap.ui.mdc.table.Column} oColumn The column from which to get default values
	 * @param {sap.ui.mdc.table.PropertyInfo} oProperty The property from which to get default values
	 * @param {Object} oExportSettings The export settings for which to set defaults
	 * @returns {Object} The new export settings object
	 * @private
	 */
	function getColumnExportSettingsObject(oColumn, oProperty, oExportSettings) {
		return Object.assign({
			columnId: oColumn.getId(),
			label: oProperty.label,
			width: getColumnWidthNumber(oColumn.getWidth()),
			textAlign: oColumn.getHAlign(),
			type: "String"
		}, oExportSettings);
	}

	/**
	 * Calculates the width of the provided column based on the <code>visualSettings</code> of the relevant <code>PropertyInfo</code>.
	 *
	 * @param {sap.ui.mdc.table.Column} oMDCColumn The <code>Column</code> instance for which to set the width
	 * @returns Promise<sap.ui.core.CSSSize | null> A promise that resolves with the calculated width, or <code>null</code> if calculation wasn't
	 * possible
	 */
	PropertyHelper.prototype.calculateColumnWidth = function(oMDCColumn) {
		const sPropertyName = oMDCColumn.getPropertyKey();
		const oTable = oMDCColumn.getTable();

		return oTable._getPropertyByNameAsync(sPropertyName).then(function(oProperty) {
			if (!oProperty) {
			  return null;
			}

			const mPropertyInfoVisualSettings = oProperty.visualSettings;
			if (mPropertyInfoVisualSettings && mPropertyInfoVisualSettings.widthCalculation === null) {
				return null;
			}

			return this._calcColumnWidth(oProperty, oMDCColumn);
		}.bind(this));
	};

	/**
	 * Calculates the column width based on the provided <code>PropertyInfo</code>.
	 *
	 * @param {sap.ui.mdc.table.PropertyInfo} oProperty The property of the <code>Column</code> instance for which to set the width
	 * @param {sap.ui.mdc.table.Column} oMDCColumn The <code>Column</code> instance for which the width is calculated
	 * @return {string} The calculated column width
	 * @since 1.95
	 * @private
	 */
	 PropertyHelper.prototype._calcColumnWidth = function (oProperty, oMDCColumn) {
		const mWidthCalculation = Object.assign({
			gap: 0,
			includeLabel: true,
			truncateLabel: true,
			excludeProperties: [],
			required: oMDCColumn.getRequired()
		}, oProperty.visualSettings && oProperty.visualSettings.widthCalculation);

		const oMDCTable = oMDCColumn.getParent();
		if (oMDCTable && oMDCTable._isOfType("TreeTable") && oMDCTable.indexOfColumn(oMDCColumn) == 0) {
			mWidthCalculation.treeColumn = true;
		}

		let aTypes = [];
		if (oProperty.isComplex()) {
			// for complex properties generate [<TypeInstance>, <TypeSettings>][] structure
			aTypes = oProperty.getSimpleProperties().flatMap(function(oProp) {
				const mPropWidthCalculation = oProp.visualSettings ? oProp.visualSettings.widthCalculation : undefined;
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

		const sHeader = (mWidthCalculation.includeLabel) ? oMDCColumn.getHeader() || oProperty.label : "";
		return TableUtil.calcColumnWidth(aTypes, sHeader, mWidthCalculation);
	};

	return PropertyHelper;
});