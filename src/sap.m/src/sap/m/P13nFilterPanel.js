/*
 * ! ${copyright}
 */

// Provides control sap.m.P13nFilterPanel.
sap.ui.define([
	'./P13nConditionPanel', './P13nPanel', './library', 'sap/m/Panel', './P13nFilterItem'
], function(P13nConditionPanel, P13nPanel, library, Panel, P13nFilterItem) {
	"use strict";

	// shortcut for sap.m.P13nPanelType
	var P13nPanelType = library.P13nPanelType;

	// shortcut for sap.m.P13nConditionOperation TODO: use enum in library.js or official API
	var P13nConditionOperation = library.P13nConditionOperation;

	/**
	 * Constructor for a new P13nFilterPanel.
	 *
	 * @param {string} [sId] ID for the new control, generated automatically if no ID is given
	 * @param {object} [mSettings] initial settings for the new control
	 * @class The P13nFilterPanel control is used to define filter-specific settings for table personalization.
	 * @extends sap.m.P13nPanel
	 * @version ${version}
	 * @constructor
	 * @public
	 * @since 1.26.0
	 * @alias sap.m.P13nFilterPanel
	 * @ui5-metamodel This control/element also will be described in the UI5 (legacy) designtime metamodel
	 */
	var P13nFilterPanel = P13nPanel.extend("sap.m.P13nFilterPanel", /** @lends sap.m.P13nFilterPanel.prototype */ {
		metadata: {

			library: "sap.m",
			properties: {

				/**
				 * Defines the maximum number of include filters.
				 */
				maxIncludes: {
					type: "string",
					group: "Misc",
					defaultValue: '-1'
				},

				/**
				 * Defines the maximum number of exclude filters.
				 */
				maxExcludes: {
					type: "string",
					group: "Misc",
					defaultValue: '-1'
				},

				/**
				 * Defines if the <code>mediaQuery</code> or a <code>ContainerResize</code> is used for layout update. If the
				 * <code>ConditionPanel</code> is used in a dialog, the property must be set to <code>true</code>.
				 */
				containerQuery: {
					type: "boolean",
					group: "Misc",
					defaultValue: false
				},

				/**
				 * Can be used to control the layout behavior. Default is "" which will automatically change the layout. With "Desktop", "Table"
				 * or"Phone" you can set a fixed layout.
				 */
				layoutMode: {
					type: "string",
					group: "Misc",
					defaultValue: null
				},

				/**
				 * Should empty operation be enabled for certain data types. This is also based on their nullable setting.
				 */
				enableEmptyOperations: {
					type: "boolean",
					group: "Misc",
					defaultValue: false
				}
			},
			aggregations: {

				/**
				 * Contains content for include and exclude panels.
				 */
				content: {
					type: "sap.ui.core.Control",
					multiple: true,
					singularName: "content",
					visibility: "hidden"
				},

				/**
				 * Defines filter items.
				 */
				filterItems: {
					type: "sap.m.P13nFilterItem",
					multiple: true,
					singularName: "filterItem",
					bindable: "bindable"
				}
			},
			events: {

				/**
				 * Event raised if a filter item has been added.
				 */
				addFilterItem: {},

				/**
				 * Event raised if a filter item has been removed.
				 */
				removeFilterItem: {},

				/**
				 * Event raised if a filter item has been updated.
				 */
				updateFilterItem: {},

				/**
				 * Event raised if a filter item has been changed. reason can be added, updated or removed.
				 * @experimental Since version 1.56
				 */
				filterItemChanged: {
					parameters: {
						/**
						 * reason for the changeFilterItem event. Value can be added, updated or removed.
						 */
						reason: { type: "string" },
						/**
						 * key of the changed filterItem
						 */
						key: { type: "string" },
						/**
						 * index of the changed filterItem
						 */
						index: { type: "int" },
						/**
						 * JSON object of the changed filterItem instance (in case of reason=="removed" the itemData parameter does not exist)
						 */
						itemData: {
							type: "object"
						}
					}
				}
			}
		},
		renderer: {
			apiVersion: 2,
			render: function(oRm, oControl){
				oRm.openStart("section", oControl);
				oRm.class("sapMFilterPanel");
				oRm.openEnd();

				oRm.openStart("div");
				oRm.class("sapMFilterPanelContent");
				oRm.class("sapMFilterPanelBG");
				oRm.openEnd();

				oControl.getAggregation("content").forEach(function(oChildren){
					oRm.renderControl(oChildren);
				});

				oRm.close("div");
				oRm.close("section");
			}
		}
	});

	// EXC_ALL_CLOSURE_003

	/**
	 * Sets the array of conditions.
	 *
	 * @public
	 * @param {object[]} aConditions the complete list of conditions
	 * @returns {sap.m.P13nFilterPanel} this for chaining
	 */
	P13nFilterPanel.prototype.setConditions = function(aConditions) {
		var aIConditions = [];
		var aEConditions = [];

		if (aConditions.length) {
			for (var i = 0; i < aConditions.length; i++) {
				var oConditionData = aConditions[i];
				if (!oConditionData.exclude) {
					aIConditions.push(oConditionData);
				} else {
					aEConditions.push(oConditionData);
				}
			}
		}

		this._oIncludeFilterPanel.setConditions(aIConditions);
		this._oExcludeFilterPanel.setConditions(aEConditions);
		if (aEConditions.length > 0) {
			this._oExcludePanel.setExpanded(true);
		}
		return this;
	};

	/**
	 * Returns the array of conditions.
	 *
	 * @public
	 */
	P13nFilterPanel.prototype.getConditions = function() {
		var aIConditions = this._oIncludeFilterPanel.getConditions();
		var aEConditions = this._oExcludeFilterPanel.getConditions();

		return aIConditions.concat(aEConditions);
	};

	P13nFilterPanel.prototype.setContainerQuery = function(bContainerQuery) {
		this.setProperty("containerQuery", bContainerQuery);

		this._oIncludeFilterPanel.setContainerQuery(bContainerQuery);
		this._oExcludeFilterPanel.setContainerQuery(bContainerQuery);
		return this;
	};

	P13nFilterPanel.prototype.setLayoutMode = function(sMode) {
		this.setProperty("layoutMode", sMode);

		this._oIncludeFilterPanel.setLayoutMode(sMode);
		this._oExcludeFilterPanel.setLayoutMode(sMode);
		return this;
	};

	/**
	 * Checks if the entered and modified conditions are correct, marks invalid fields in yellow (warning).
	 *
	 * @public
	 * @returns {boolean} <code>True</code> if all conditions are valid, <code>false</code> otherwise.
	 */
	P13nFilterPanel.prototype.validateConditions = function() {
		return this._oIncludeFilterPanel.validateConditions() && this._oExcludeFilterPanel.validateConditions();
	};

	/**
	 * Removes all invalid conditions.
	 *
	 * @public
	 * @since 1.28
	 */
	P13nFilterPanel.prototype.removeInvalidConditions = function() {
		this._oIncludeFilterPanel.removeInvalidConditions();
		this._oExcludeFilterPanel.removeInvalidConditions();
	};

	/**
	 * Removes all errors and warnings states from of all filter conditions.
	 *
	 * @public
	 * @since 1.28
	 */
	P13nFilterPanel.prototype.removeValidationErrors = function() {
		this._oIncludeFilterPanel.removeValidationErrors();
		this._oExcludeFilterPanel.removeValidationErrors();
	};

	P13nFilterPanel.prototype.onBeforeNavigationFrom = function() {
		return this.validateConditions();
	};

	P13nFilterPanel.prototype.onAfterNavigationFrom = function() {
		return this.removeInvalidConditions();
	};

	/**
	 * Setter for the supported Include operations array.
	 *
	 * @public
	 * @param {sap.m.P13nConditionOperation[]} aOperation - array of operations [<code>sap.m.P13nConditionOperation.BT</code>,
	 *        <code>sap.m.P13nConditionOperation.EQ</code>]
	 * @param {string} sType - the type for which the operations are defined
	 */
	P13nFilterPanel.prototype.setIncludeOperations = function(aOperation, sType) {
		sType = sType || "default";
		this._aIncludeOperations[sType] = aOperation;

		if (this._oIncludeFilterPanel) {
			this._oIncludeFilterPanel.setOperations(this._aIncludeOperations[sType], sType);
		}
	};

	/**
	 * Getter for the include operations.
	 *
	 * @public
	 * @param {string} sType for which the operations are defined
	 * @returns {sap.m.P13nConditionOperation} array of operations [<code>sap.m.P13nConditionOperation.BT</code>,
	 *          <code>sap.m.P13nConditionOperation.EQ</code>]
	 */
	P13nFilterPanel.prototype.getIncludeOperations = function(sType) {
		if (this._oIncludeFilterPanel) {
			return this._oIncludeFilterPanel.getOperations(sType);
		}
	};

	/**
	 * Setter for the supported exclude operations array.
	 *
	 * @public
	 * @param {sap.m.P13nConditionOperation[]} aOperation - array of operations [<code>sap.m.P13nConditionOperation.BT</code>,
	 *        <code>sap.m.P13nConditionOperation.EQ</code>]
	 * @param {string} sType - the type for which the operations are defined
	 */
	P13nFilterPanel.prototype.setExcludeOperations = function(aOperation, sType) {
		sType = sType || "default";
		this._aExcludeOperations[sType] = aOperation;

		if (this._oExcludeFilterPanel) {
			this._oExcludeFilterPanel.setOperations(this._aExcludeOperations[sType], sType);
		}
	};

	/**
	 * Getter for the exclude operations.
	 *
	 * @public
	 * @param {string} sType - the type for which the operations are defined
	 * @returns {sap.m.P13nConditionOperation[]} array of operations [<code>sap.m.P13nConditionOperation.BT</code>,
	 *          <code>sap.m.P13nConditionOperation.EQ</code>]
	 */
	P13nFilterPanel.prototype.getExcludeOperations = function(sType) {
		if (this._oExcludeFilterPanel) {
			return this._oExcludeFilterPanel.getOperations(sType);
		}
	};

	/**
	 * Setter for a KeyFields array.
	 *
	 * @private
	 * @deprecated Since 1.34. This method does not work anymore - you should use the Items aggregation
	 * @param {array} aKeyFields - array of KeyFields [{key: "CompanyCode", text: "ID"}, {key:"CompanyName", text : "Name"}]
	 * @param {array} aKeyFieldsExclude - array of exclude KeyFields
	 */
	P13nFilterPanel.prototype.setKeyFields = function(aKeyFields, aKeyFieldsExclude) {
		this._aKeyFields = aKeyFields;

		if (this._oIncludeFilterPanel) {
			aKeyFields.some(function(oKeyField){
				if (oKeyField.isDefault){
					this._oIncludeFilterPanel.setAutoAddNewRow(true);
				}
			}.bind(this));
			this._oIncludeFilterPanel.setKeyFields(aKeyFields);
		}
		if (this._oExcludeFilterPanel) {
			this._oExcludeFilterPanel.setKeyFields(
				(Array.isArray(aKeyFieldsExclude) && aKeyFieldsExclude.length > 0) ? aKeyFieldsExclude : aKeyFields
			);
		}

	};

	P13nFilterPanel.prototype.getKeyFields = function() {
		return this._aKeyFields;
	};

	P13nFilterPanel.prototype.setMaxIncludes = function(sMax) {
		this.setProperty("maxIncludes", sMax);

		if (this._oIncludeFilterPanel) {
			this._oIncludeFilterPanel.setMaxConditions(sMax);
		}
		this._updatePanel();
		return this;
	};

	P13nFilterPanel.prototype.setMaxExcludes = function(sMax) {
		this.setProperty("maxExcludes", sMax);

		if (this._oExcludeFilterPanel) {
			this._oExcludeFilterPanel.setMaxConditions(sMax);
		}
		this._updatePanel();
		return this;
	};

	P13nFilterPanel.prototype._updatePanel = function() {
		var iMaxIncludes = this.getMaxIncludes() === "-1" ? 1000 : parseInt(this.getMaxIncludes());
		var iMaxExcludes = this.getMaxExcludes() === "-1" ? 1000 : parseInt(this.getMaxExcludes());

		if (iMaxIncludes > 0) {
			if (iMaxExcludes <= 0) {
				// in case we do not show the exclude panel remove the include panel header text and add an extra top margin
				this._oIncludePanel.setHeaderText(null);
				this._oIncludePanel.setExpandable(false);
				this._oIncludePanel.addStyleClass("panelTopMargin");
				this._oIncludePanel.addStyleClass("panelNoHeader");
			}
		}

		if (iMaxExcludes === 0) {
			this._oExcludePanel.setHeaderText(null);
			this._oExcludePanel.setExpandable(false);
			this._oExcludePanel.addStyleClass("panelNoHeader");
		}

	};

	P13nFilterPanel.prototype.init = function() {
		this.setType(P13nPanelType.filter);
		this.setTitle(sap.ui.getCore().getLibraryResourceBundle("sap.m").getText("FILTERPANEL_TITLE"));

		sap.ui.getCore().loadLibrary("sap.ui.layout");

		this._aKeyFields = [];

		// init some resources
		this._oRb = sap.ui.getCore().getLibraryResourceBundle("sap.m");

		this._aIncludeOperations = {};

		if (!this._aIncludeOperations["default"]) {
			this.setIncludeOperations([
				P13nConditionOperation.EQ, P13nConditionOperation.BT, P13nConditionOperation.LT, P13nConditionOperation.LE, P13nConditionOperation.GT, P13nConditionOperation.GE
			]);
		}

		if (!this._aIncludeOperations["string"]) {
			this.setIncludeOperations([
				P13nConditionOperation.Contains, P13nConditionOperation.EQ, P13nConditionOperation.BT, P13nConditionOperation.StartsWith, P13nConditionOperation.EndsWith, P13nConditionOperation.LT, P13nConditionOperation.LE, P13nConditionOperation.GT, P13nConditionOperation.GE
			], "string");
		}
		if (!this._aIncludeOperations["date"]) {
			this.setIncludeOperations([
				P13nConditionOperation.EQ, P13nConditionOperation.BT, P13nConditionOperation.LT, P13nConditionOperation.LE, P13nConditionOperation.GT, P13nConditionOperation.GE
			], "date");
		}
		if (!this._aIncludeOperations["time"]) {
			this.setIncludeOperations([
				P13nConditionOperation.EQ, P13nConditionOperation.BT, P13nConditionOperation.LT, P13nConditionOperation.LE, P13nConditionOperation.GT, P13nConditionOperation.GE
			], "time");
		}
		if (!this._aIncludeOperations["datetime"]) {
			this.setIncludeOperations([
				P13nConditionOperation.EQ, P13nConditionOperation.BT, P13nConditionOperation.LT, P13nConditionOperation.LE, P13nConditionOperation.GT, P13nConditionOperation.GE
			], "datetime");
		}
		if (!this._aIncludeOperations["numeric"]) {
			this.setIncludeOperations([
				P13nConditionOperation.EQ, P13nConditionOperation.BT, P13nConditionOperation.LT, P13nConditionOperation.LE, P13nConditionOperation.GT, P13nConditionOperation.GE
			], "numeric");
		}
		if (!this._aIncludeOperations["numc"]) {
			this.setIncludeOperations([
				P13nConditionOperation.Contains, P13nConditionOperation.EQ, P13nConditionOperation.BT, P13nConditionOperation.EndsWith, P13nConditionOperation.LT, P13nConditionOperation.LE, P13nConditionOperation.GT, P13nConditionOperation.GE
			], "numc");
		}
		if (!this._aIncludeOperations["boolean"]) {
			this.setIncludeOperations([
				P13nConditionOperation.EQ
			], "boolean");
		}

		this._aExcludeOperations = {};

		if (!this._aExcludeOperations["default"]) {
			this.setExcludeOperations([
				P13nConditionOperation.EQ
			]);
		}

		this._oIncludePanel = new Panel({
			expanded: true,
			expandable: true,
			headerText: this._oRb.getText("FILTERPANEL_INCLUDES"),
			width: "auto"
		}).addStyleClass("sapMFilterPadding");

		this._oIncludeFilterPanel = new P13nConditionPanel({
			maxConditions: this.getMaxIncludes(),
			alwaysShowAddIcon: false,
			layoutMode: this.getLayoutMode(),
			dataChange: this._handleDataChange()
		});
		this._oIncludeFilterPanel._sAddRemoveIconTooltipKey = "FILTER";

		for (var sType in this._aIncludeOperations) {
			this._oIncludeFilterPanel.setOperations(this._aIncludeOperations[sType], sType);
		}

		this._oIncludePanel.addContent(this._oIncludeFilterPanel);

		this.addAggregation("content", this._oIncludePanel);

		this._oExcludePanel = new Panel({
			expanded: false,
			expandable: true,
			headerText: this._oRb.getText("FILTERPANEL_EXCLUDES"),
			width: "auto"
		}).addStyleClass("sapMFilterPadding");

		this._oExcludeFilterPanel = new P13nConditionPanel({
			exclude: true,
			maxConditions: this.getMaxExcludes(),
			alwaysShowAddIcon: false,
			layoutMode: this.getLayoutMode(),
			dataChange: this._handleDataChange()
		});
		this._oExcludeFilterPanel._sAddRemoveIconTooltipKey = "FILTER";

		for (var sType in this._aExcludeOperations) {
			this._oExcludeFilterPanel.setOperations(this._aExcludeOperations[sType], sType);
		}

		this._oExcludePanel.addContent(this._oExcludeFilterPanel);

		this.addAggregation("content", this._oExcludePanel);

		this._updatePanel();
	};

	P13nFilterPanel.prototype.exit = function() {

		var destroyHelper = function(o) {
			if (o && o.destroy) {
				o.destroy();
			}
			return null;
		};

		this._aKeyFields = destroyHelper(this._aKeyFields);
		this._aIncludeOperations = destroyHelper(this._aIncludeOperations);
		this._aExcludeOperations = destroyHelper(this._aExcludeOperations);

		this._oRb = destroyHelper(this._oRb);
	};

	P13nFilterPanel.prototype.onBeforeRendering = function() {
		var aKeyFieldsExclude = [],
			aKeyFields,
			sModelName,
			bEnableEmptyOperations = this.getEnableEmptyOperations();

		if (this._bUpdateRequired) {
			this._bUpdateRequired = false;

			aKeyFields = [];
			sModelName = (this.getBindingInfo("items") || {}).model;
			var fGetValueOfProperty = function(sName, oContext, oItem) {
				var oBinding = oItem.getBinding(sName),
					oMetadata;

				if (oBinding && oContext) {
					return oContext.getObject()[oBinding.getPath()];
				}
				oMetadata = oItem.getMetadata();
				return oMetadata.hasProperty(sName) ? oMetadata.getProperty(sName).get(oItem) : oMetadata.getAggregation(sName).get(oItem);
			};
			this.getItems().forEach(function(oItem_) {
				var oContext = oItem_.getBindingContext(sModelName),
					oField,
					bNullable,
					oFieldExclude;

				// Update key of model (in case of 'restore' the key in model gets lost because it is overwritten by Restore Snapshot)
				if (oItem_.getBinding("key")) {
					oContext.getObject()[oItem_.getBinding("key").getPath()] = oItem_.getKey();
				}
				aKeyFields.push(oField = {
					key: oItem_.getColumnKey(),
					text: fGetValueOfProperty("text", oContext, oItem_),
					tooltip: fGetValueOfProperty("tooltip", oContext, oItem_),
					maxLength: fGetValueOfProperty("maxLength", oContext, oItem_),
					type: fGetValueOfProperty("type", oContext, oItem_),
					typeInstance: fGetValueOfProperty("typeInstance", oContext, oItem_),
					formatSettings: fGetValueOfProperty("formatSettings", oContext, oItem_),
					precision: fGetValueOfProperty("precision", oContext, oItem_),
					scale: fGetValueOfProperty("scale", oContext, oItem_),
					isDefault: fGetValueOfProperty("isDefault", oContext, oItem_),
					values: fGetValueOfProperty("values", oContext, oItem_)
				});

				if (bEnableEmptyOperations) {
					bNullable = oItem_.getNullable();

					// Copy the oField object and add it to the exclude array - we need this only when exclude
					// operations are enabled
					oFieldExclude = {};
					Object.keys(oField).forEach(function (sKey) {
						oFieldExclude[sKey] = oField[sKey];
					});
					aKeyFieldsExclude.push(oFieldExclude);

					// Manage empty operations for include and exclude scenario
					this._enhanceFieldOperationsWithEmpty(oFieldExclude, bNullable, true);
					this._enhanceFieldOperationsWithEmpty(oField, bNullable);

					this._modifyFieldOperationsBasedOnMaxLength(oFieldExclude);
				}

				this._modifyFieldOperationsBasedOnMaxLength(oField);
			}, this);

			this.setKeyFields(aKeyFields, aKeyFieldsExclude);

			var aConditions = [];
			sModelName = (this.getBindingInfo("filterItems") || {}).model;
			this.getFilterItems().forEach(function(oFilterItem_) {

				// the "filterItems" aggregation data - obtained via getFilterItems() - has the old state !
				var oContext = oFilterItem_.getBindingContext(sModelName);
				// Update key of model (in case of 'restore' the key in model gets lost because it is overwritten by Restore Snapshot)
				if (oFilterItem_.getBinding("key") && oContext) {
					oContext.getObject()[oFilterItem_.getBinding("key").getPath()] = oFilterItem_.getKey();
				}
				aConditions.push({
					key: oFilterItem_.getKey(),
					keyField: fGetValueOfProperty("columnKey", oContext, oFilterItem_),
					operation: fGetValueOfProperty("operation", oContext, oFilterItem_),
					value1: fGetValueOfProperty("value1", oContext, oFilterItem_),
					value2: fGetValueOfProperty("value2", oContext, oFilterItem_),
					exclude: fGetValueOfProperty("exclude", oContext, oFilterItem_)
				});
			});
			this.setConditions(aConditions);
		}
	};

	/**
	 * Modifies field own operations based on it's maxLength setting some operations are not supported and have to be
	 * removed.
	 * @param {object} oField the field that has to be modified
	 * @private
	 */
	P13nFilterPanel.prototype._modifyFieldOperationsBasedOnMaxLength = function (oField) {
		var aOperations;

		// check if maxLength is 1 and remove contains, start and ends with operations
		if (oField.maxLength === 1 || oField.maxLength === "1") {
			// Take the operations from the string type (because maxLength is only supported by type string) and remove Contains, StartsWith and EndsWith
			// This operations array on the keyFields will overwrite the type operations which are defined by the type!
			// We could also handle this in the P13nConditionPanel and remove all the not supported operations (e.g. Contains, StartsWith and EndsWith when maxLength == 1)
			// BCP 1970047060
			aOperations = oField.operations ? oField.operations : this._oIncludeFilterPanel.getOperations(oField.type);
			oField.operations = [];
			aOperations.forEach(function(sOperation) {
				if ([
					P13nConditionOperation.Contains,
					P13nConditionOperation.StartsWith,
					P13nConditionOperation.EndsWith
				].indexOf(sOperation) === -1) {
					oField.operations.push(sOperation);
				}
			}, this);
		}
	};

	/**
	 * Enhance one field own operations set with empty operation based on the field type and it's nullable setting
	 * @param {object} oField the object that would be enhanced
	 * @param {boolean} bNullable this is used to determine if empty operation will be added
	 * @param {boolean} [bExclude=false] handle include or exclude operations
	 * @private
	 */
	P13nFilterPanel.prototype._enhanceFieldOperationsWithEmpty = function (oField, bNullable, bExclude) {
		var oFilterPanel,
			aOperations;

		if (
			["string", "stringdate"].indexOf(oField.type) > -1 || // For these field types we aways add the empty operation
			(["date", "datetime"].indexOf(oField.type) > -1 && bNullable) // For date types we add it only if nullable=true
		) {
			oFilterPanel = this[bExclude ? "_oExcludeFilterPanel" : "_oIncludeFilterPanel"];

			// Load operations from the conditions panel
			aOperations = oFilterPanel.getOperations(oField.type);
			if (!aOperations) {
				// Load default operations in case type based are missing
				// For exclude operations we add only the EQ operation
				aOperations = oFilterPanel.getOperations();
			}

			// Make sure we have operations array available on the field object
			if (!Array.isArray(oField.operations)) {
				oField.operations = [];
			}

			// Add the operations to the field own operations set so we can customize them per field
			aOperations.forEach(function (sOperation) {
				oField.operations.push(sOperation);
			});

			// And we add the "Empty" operation if it's not added before
			if (oField.operations.indexOf(P13nConditionOperation.Empty) === -1) {
				oField.operations.push(P13nConditionOperation.Empty);
			}
		}
	};

	P13nFilterPanel.prototype.addItem = function(oItem) {
		P13nPanel.prototype.addItem.apply(this, arguments);

		if (!this._bIgnoreBindCalls) {
			this._bUpdateRequired = true;
		}

		return this;
	};

	P13nFilterPanel.prototype.removeItem = function(oItem) {
		var oRemoved = P13nPanel.prototype.removeItem.apply(this, arguments);

		this._bUpdateRequired = true;

		return oRemoved;
	};

	P13nFilterPanel.prototype.destroyItems = function() {
		this.destroyAggregation("items");

		if (!this._bIgnoreBindCalls) {
			this._bUpdateRequired = true;
		}
		return this;
	};

	P13nFilterPanel.prototype.addFilterItem = function(oFilterItem) {
		this.addAggregation("filterItems", oFilterItem, true);

		if (!this._bIgnoreBindCalls) {
			this._bUpdateRequired = true;
		}

		return this;
	};

	P13nFilterPanel.prototype.insertFilterItem = function(oFilterItem, iIndex) {
		this.insertAggregation("filterItems", oFilterItem, iIndex, true);

		if (!this._bIgnoreBindCalls) {
			this._bUpdateRequired = true;
		}

		return this;
	};

	P13nFilterPanel.prototype.updateFilterItems = function(sReason) {
		this.updateAggregation("filterItems");

		if (sReason === "change" && !this._bIgnoreBindCalls) {
			this._bUpdateRequired = true;
			this.invalidate();
		}
	};

	P13nFilterPanel.prototype.removeFilterItem = function(oFilterItem) {
		oFilterItem = this.removeAggregation("filterItems", oFilterItem, true);

		if (!this._bIgnoreBindCalls) {
			this._bUpdateRequired = true;
		}

		return oFilterItem;
	};

	P13nFilterPanel.prototype.removeAllFilterItems = function() {
		var aFilterItems = this.removeAllAggregation("filterItems", true);

		if (!this._bIgnoreBindCalls) {
			this._bUpdateRequired = true;
		}

		return aFilterItems;
	};

	P13nFilterPanel.prototype.destroyFilterItems = function() {
		this.destroyAggregation("filterItems");

		if (!this._bIgnoreBindCalls) {
			this._bUpdateRequired = true;
		}

		return this;
	};

	P13nFilterPanel.prototype._handleDataChange = function() {
		var that = this;

		return function(oEvent) {
			var oNewData = oEvent.getParameter("newData");
			var sOperation = oEvent.getParameter("operation");
			var sKey = oEvent.getParameter("key");
			var iConditionIndex = oEvent.getParameter("index");
			var oFilterItem;

			// map the iConditionIndex to the index in the FilterItems
			var iIndex = -1;
			var bExclude = oEvent.getSource() === that._oExcludeFilterPanel;
			that.getFilterItems().some(function(oItem, i) {
				// window.console.log(i+ " " + oItem.getValue1());
				if ((!oItem.getExclude() && !bExclude) || (oItem.getExclude() && bExclude)) {
					iConditionIndex--;
				}
				iIndex = i;
				return iConditionIndex < 0;
			}, this);

			switch (sOperation) {
				case "update":
					oFilterItem = that.getFilterItems()[iIndex];
					if (oFilterItem) {
						oFilterItem.setExclude(oNewData.exclude);
						oFilterItem.setColumnKey(oNewData.keyField);
						oFilterItem.setOperation(oNewData.operation);
						oFilterItem.setValue1(oNewData.value1);
						oFilterItem.setValue2(oNewData.value2);
					}
					that.fireUpdateFilterItem({
						key: sKey,
						index: iIndex,
						filterItemData: oFilterItem
					});
					that.fireFilterItemChanged({
						reason: "updated",
						key: sKey,
						index: iIndex,
						itemData: {
							columnKey: oNewData.keyField,
							operation: oNewData.operation,
							exclude: oNewData.exclude,
							value1: oNewData.value1,
							value2: oNewData.value2
						}
					});
					break;
				case "add":
					if (iConditionIndex >= 0) {
						iIndex++;
					}

					oFilterItem = new P13nFilterItem({
						columnKey: oNewData.keyField,
						exclude: oNewData.exclude,
						operation: oNewData.operation
					});
					oFilterItem.setValue1(oNewData.value1);
					oFilterItem.setValue2(oNewData.value2);

					that._bIgnoreBindCalls = true;
					that.fireAddFilterItem({
						key: sKey,
						index: iIndex,
						filterItemData: oFilterItem
					});

					that.fireFilterItemChanged({
						reason: "added",
						key: sKey,
						index: iIndex,
						itemData: {
							columnKey: oNewData.keyField,
							operation: oNewData.operation,
							exclude: oNewData.exclude,
							value1: oNewData.value1,
							value2: oNewData.value2
						}
					});

					that._bIgnoreBindCalls = false;
					break;
				case "remove":
					that._bIgnoreBindCalls = true;
					that.fireRemoveFilterItem({
						key: sKey,
						index: iIndex
					});
					that.fireFilterItemChanged({
						reason: "removed",
						key: sKey,
						index: iIndex
					});
					that._bIgnoreBindCalls = false;
					break;
				default:
					throw "Operation'" + sOperation + "' is not supported yet";
			}
			that._notifyChange();
		};
	};

	P13nFilterPanel.prototype._notifyChange = function() {
		var fListener = this.getChangeNotifier();
		if (fListener) {
			fListener(this);
		}
	};

	return P13nFilterPanel;

});