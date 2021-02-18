/*
 * !${copyright}
 */
sap.ui.define([
	"./Item", 'sap/ui/base/SyncPromise', "sap/ui/mdc/library"
], function(Item, SyncPromise, MDCLib) {
	"use strict";

	var DimensionClass, TimeDimensionClass, HierachyDimensionClass;
	var _SUPPORTED_ROLE = {
		category: true,
		category2: true,
		series: true
	};

	// Provides the Item class.
	/**
	 * Constructor for a new Item.
	 *
	 * @param {string} [sId] ID for the new control, generated automatically if no ID is given
	 * @param {object} [mSettings] initial settings for the new control
	 * @class The Item for the field/property metadata used within MDC controls, an instance can be created to override the default/metadata
	 *        behavior.
	 *        <h3><b>Note:</b></h3>
	 *        The control is experimental and the API/behaviour is not finalised and hence this should not be used for productive usage.
	 * @extends sap.ui.mdc.chart.Item
	 * @author SAP SE
	 * @constructor The API/behaviour is not finalised and hence this control should not be used for productive usage.
	 * @private
	 * @experimental
	 * @since 1.61
	 * @alias sap.ui.mdc.chart.DimensionItem
	 * @ui5-metamodel This control/element also will be described in the UI5 (legacy) designtime metamodel
	 */
	var DimensionItem = Item.extend("sap.ui.mdc.chart.DimensionItem", /** @lends sap.ui.mdc.chart.Item.prototype */
	{
		metadata: {
			"abstract": true,
			library: "sap.ui.mdc",
			properties: {
				/**
				 * Function returning a formatted text for a item key value that will be used for axis labelling. If specified, this property takes precedence over the "textProperty" property of the item.
				 * item key value and the corresponding text will be passed to the supplied function as parameters.
				 */
				textFormatter: {
					type: "function"
				},
				/**
				 * Text for a item key value, typically by a pointer using the binding syntax to some property containing the text.
				 *
				 * <b>NOTE:</b> This property was bound internally if automatically created via metadata of oData service and please call "unbindProperty" before setting.
				 */
				textProperty: {
					type: "string"
				},
				/**
				 * Whether a text is displayed. If the "textProperty" property has not been specified, it will be derived from the metadata.
				 */
				displayText: {
					type: "boolean",
					defaultValue: true
				},
				role: {
					type: "string",
					defaultValue: "category"
				},
				/**
				 * Specifies whether item as a dimension is part of the inResult of inner chart
				 */
				inResult: {
					type: "boolean",
					defaultValue: false
				},
				/**
				 * The level for hierachy dimension
				 */
				level: {
					type: "int",
					defaultValue: undefined
				},
				/**
				 * The time unit @link sap.chart.TimeUnitType
				 */
				timeUnit: {
					type: "string",
					defaultValue: undefined
				},
				/**
				 * The criticality for coloring
				 *
				 * @since 1.64
				 */
				criticality: {
					type: "object",
					multiple: "false"
				}
			}
		}
	});

	/**
	 * Translate mdc dimension item settings to viz chart dimension settings
	 *
	 * @param mMetadata
	 * @return {{role: *, name: *, label: *}}
	 *
	 * @private
	 * @ui5-restricted sap.ui.mdc
	 */
	DimensionItem.prototype.getSettings = function(mMetadata) {
		var mSettings = {
			label: this.getLabel() || mMetadata.label,
			role: this.getRole(),
			name: this.getKey(),
			textProperty: this.getTextProperty(),
			displayText: this.getDisplayText()
		};

		if (this._isHierarchyDimension()) {
			mSettings.level = this.getLevel();
		}

		return mSettings;
	};

	/**
	 * Pushes updates on the item to the inner chart
	 *
	 * @param {object} oChart chart to push the update to
	 *
	 * @experimental
	 * @private
	 * @ui5-restricted sap.ui.mdc
	 */
	DimensionItem.prototype.toChart = function(oChart) {
		return new SyncPromise(function(resolve) {
			this._oVizItem = oChart.getDimensionByName(this.getKey());
			if (this._oVizItem) {
				var sOldRole = this._oVizItem.getRole();
				this._oVizItem.setRole(this.getRole());
				if (this._observer) {
					this._observer.propertyChange(this, "role", sOldRole, this.getRole());
				}
				resolve(this);
			} else {
				this.toVizChartItem().then(function(oItem) {
					this._oVizItem = oItem;
					oChart.addDimension(this._oVizItem, true);
					if (this._observer) {
						this._observer.propertyChange(this, "role", null, this.getRole());
					}
					resolve(this);
				}.bind(this));
			}
		}.bind(this));
	};

	/**
	 * Returns a promise that resolves to a Vizchart Item with given metadata
	 *
	 * @param mMetadata given metadata for the item
	 * @returns {sap.ui.base.SyncPromise} resolves to Vizchart Item
	 *
	 * @experimental
	 * @private
	 * @ui5-restricted sap.ui.mdc
	 */
	DimensionItem.prototype.toVizChartItem = function(mMetadata) {
		if (!this._pToVizItem) {
			this._pToVizItem = new SyncPromise(function(resolve) {
				mMetadata = mMetadata || {};
				var DimInstanceClass, sDimInstanceClass, oVizItem;
				if (this._isHierarchyDimension()) {
					DimInstanceClass = HierachyDimensionClass;
					sDimInstanceClass = "sap/chart/data/HierarchyDimension";
				} else if (this._isTimeDimension()) {
					DimInstanceClass = TimeDimensionClass;
					sDimInstanceClass = "sap/chart/data/TimeDimension";
				} else {
					DimInstanceClass = DimensionClass;
					sDimInstanceClass = "sap/chart/data/Dimension";
				}

				if (DimInstanceClass) {
					oVizItem = new DimInstanceClass(this.getSettings(mMetadata));
					resolve(oVizItem);
				} else {
					sap.ui.require([
						sDimInstanceClass
					], function(DimensionClassLoaded) {
						DimInstanceClass = DimensionClassLoaded;
						oVizItem = new DimInstanceClass(this.getSettings(mMetadata));
						resolve(oVizItem);
					}.bind(this));
				}
			}.bind(this));
		}

		return this._pToVizItem;
	};

	/**
	 * Role of the inner chart item, see @sap.ui.mdc.ChartItemRoleType
	 * @param vRole The role of the inner chart item
	 * @returns {this} reference to <code>this</code> for method chaining
	 *
	 * @experimental
	 * @private
	 * @ui5-restricted sap.ui.mdc
	 */
	DimensionItem.prototype.setRole = function(vRole) {
		if (!_SUPPORTED_ROLE[vRole]) {
			throw new TypeError("Invalide Measure role: " + vRole);
		}

		this.setProperty("role", vRole, true);

		var oChart = this.getParent();
		//now changing the role may affect a change of the type

		if (oChart) {
			oChart.oChartPromise.then(function(oVizChart) {
				this.toChart(oVizChart);
			}.bind(this));
		}

		return this;
	};

	/**
	 *
	 * @return {string} The type of the inner charts item which can be 'Dimension' or 'Measure'
	 *
	 * @experimental
	 * @private
	 * @ui5-restricted sap.ui.mdc
	 */
	DimensionItem.prototype.getVizItemType = function() {
		return MDCLib.ChartItemType.Dimension;
	};

	/**
	 *
	 * @return {boolean} <code>true</code> if the item is a hierarchy dimension
	 *
	 * @experimental
	 * @private
	 * @ui5-restricted sap.ui.mdc
	 */
	DimensionItem.prototype._isHierarchyDimension = function() {
		return false;
	};

	/**
	 *
	 * @return {boolean} <code>true</code> if the item is a time dimension
	 *
	 * @experimental
	 * @private
	 * @ui5-restricted sap.ui.mdc
	 */
	DimensionItem.prototype._isTimeDimension = function() {
		if (this.getVizItemType() == "Measure") {
			return false;
		}

		switch (this.getType()) {
			case "date":
			case "time":
			case "datetime":
				return true;
			default:
				return false;
		}
	};

	return DimensionItem;

}, true);
