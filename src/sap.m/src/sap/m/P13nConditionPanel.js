/*!
 * ${copyright}
 */

// Provides control sap.m.P13nConditionPanel.
sap.ui.define([
	'jquery.sap.global', './library', 'sap/ui/core/Control', 'sap/ui/core/format/DateFormat', 'sap/ui/core/format/NumberFormat'
], function(jQuery, library, Control, DateFormat, NumberFormat) {
	"use strict";

	/**
	 * Constructor for a new P13nConditionPanel.
	 * 
	 * @param {string}
	 *            [sId] id for the new control, generated automatically if no id is given
	 * @param {object}
	 *            [mSettings] initial settings for the new control
	 * 
	 * @class The ConditionPanel Control will be used to realize the Sorting, Filtering and Grouping
	 *        panel of the new Personalization dialog.
	 * @extends sap.m.P13nPanel
	 * @version ${version}
	 * 
	 * @constructor
	 * @public
	 * @experimental Since version 1.25. !!! THIS CONTROL IS ONLY FOR INTERNAL USE !!!
	 * @alias sap.m.P13nConditionPanel
	 * @ui5-metamodel This control/element also will be described in the UI5 (legacy) designtime metamodel
	 */
	var P13nConditionPanel = Control.extend("sap.m.P13nConditionPanel", /** @lends sap.m.P13nConditionPanel.prototype */
	{
		metadata: {

			library: "sap.m",
			properties: {

				/**
				 * defines the max number of conditions on the ConditionPanel
				 */
				maxConditions: {
					type: "string",
					group: "Misc",
					defaultValue: '-1'
				},

				/**
				 * exclude options for filter
				 */
				exclude: {
					type: "boolean",
					group: "Misc",
					defaultValue: false
				},

				/**
				 * defines if the mediaQuery or a ContainerResize will be used for layout update. When
				 * the P13nConditionPanel is used on a dialog the property should be set to true!
				 */
				containerQuery: {
					type: "boolean",
					group: "Misc",
					defaultValue: false
				},

				/**
				 * adds initial a new empty condition row
				 */
				autoAddNewRow: {
					type: "boolean",
					group: "Misc",
					defaultValue: false
				},

				/**
				 * makes the remove icon on the first condition row disabled when only one condition
				 * exist.
				 */
				disableFirstRemoveIcon: {
					type: "boolean",
					group: "Misc",
					defaultValue: false
				},

				/**
				 * makes the Add icon visible on each condition row. If is set to false the Add is only
				 * visible at the end and you can only append a new condition.
				 */
				alwaysShowAddIcon: {
					type: "boolean",
					group: "Misc",
					defaultValue: true
				},

				/**
				 * new added condition use the settings from the previous condition as default.
				 */
				usePrevConditionSetting: {
					type: "boolean",
					group: "Misc",
					defaultValue: true
				},

				/**
				 * KeyField value can only be selected once. When you set the property to true the
				 * ConditionPanel will automatically offers on the KeyField drop down only the keyFields
				 * which are not used. The default behavior is that in each keyField dropdown all
				 * keyfields are listed.
				 */
				autoReduceKeyFieldItems: {
					type: "boolean",
					group: "Misc",
					defaultValue: false
				},

				/**
				 * can be used to control the layout behavior. Default is "" which will automatically
				 * change the layout. With "Desktop", "Table" or"Phone" you can set a fixed layout.
				 */
				layoutMode: {
					type: "string",
					group: "Misc",
					defaultValue: null
				},

				/**
				 * show additional labels in the condition
				 */
				showLabel: {
					type: "boolean",
					group: "Misc",
					defaultValue: false
				},

				/**
				 * This represents the displayFormat of the condition Values. 
				 * With the value "UpperCase" the entered value of the condition will be converted to upperCase.
				 */
				displayFormat: {
					type: "string",
					group: "Misc",
					defaultValue: null
				}
			},
			aggregations: {

				/**
				 * Content for the ConditionPanel. This property is not public!
				 */
				content: {
					type: "sap.ui.core.Control",
					multiple: true,
					singularName: "content",
					visibility: "hidden"
				}
			},
			events: {

				/**
				 * Workaround for updating the binding
				 */
				dataChange: {}
			}
		}
	});

	// EXC_ALL_CLOSURE_003
	/**
	 * This method must be used to assign a list of conditions.
	 * 
	 * @param {object[]}
	 *            aConditions array of Conditions.
	 * 
	 * @public
	 * @since 1.25.0
	 */
	P13nConditionPanel.prototype.setConditions = function(aConditions) {
		if (!aConditions) {
			jQuery.sap.log.error("sap.m.P13nConditionPanel : aCondition is not defined");
		}

		if (this._bIgnoreSetConditions) {
			return;
		}

		this._oConditionsMap = {};
		this._iConditions = 0;
		for (var i = 0; i < aConditions.length; i++) {
			this._addCondition2Map(aConditions[i]);
		}

		this._clearConditions();
		this._fillConditions();
	};

	/**
	 * remove all conditions.
	 * 
	 */
	P13nConditionPanel.prototype.removeAllConditions = function() {
		this._oConditionsMap = {};
		this._iConditions = 0;

		this._clearConditions();
		this._fillConditions();
	};

	/**
	 * add a single condition.
	 * 
	 * @param {object}
	 *            oCondition the new condition of type { "key": "007", "operation":
	 *            sap.m.P13nConditionOperation.Ascending, "keyField": "keyFieldKey", "value1": "", "value2": ""};
	 */
	P13nConditionPanel.prototype.addCondition = function(oCondition) {
		if (this._bIgnoreSetConditions) {
			return;
		}
		oCondition.index = this._iConditions;

		this._addCondition2Map(oCondition);
		this._addCondition(oCondition); 
	};

	/**
	 * insert a single condition.
	 * 
	 * @param {object}
	 *            oCondition the new condition of type { "key": "007", "operation":
	 *            sap.m.P13nConditionOperation.Ascending, "keyField": "keyFieldKey", "value1": "", "value2": ""};
	 * @param {integer}
	 *            index of the new condition
	 */
	P13nConditionPanel.prototype.insertCondition = function(oCondition, index) {
		if (this._bIgnoreSetConditions) {
			return;
		}
		if (index !== undefined) {
			oCondition.index = index;
		}
		this._addCondition2Map(oCondition);
		this._addCondition(oCondition); 
	};

	/**
	 * remove a single condition.
	 * 
	 * @param {object}
	 *            vCondition is the condition which should be removed. can be either a string with the
	 *            key of the condition of the condition object itself.
	 */
	P13nConditionPanel.prototype.removeCondition = function(vCondition) {
		this._clearConditions();

		if (typeof (vCondition) == "string") {
			delete this._oConditionsMap[vCondition];
		}

		if (typeof (vCondition) == "object") {
			delete this._oConditionsMap[vCondition.key];
		}

		this._fillConditions();
	};

	/**
	 * add a single condition into the _oConditionMap.
	 * 
	 * @private
	 * @param {object}
	 *            oCondition the new condition of type { "key": "007", "operation":
	 *            sap.m.P13nConditionOperation.Ascending, "keyField": "keyFieldKey", "value1": "", "value2": ""};
	 */
	P13nConditionPanel.prototype._addCondition2Map = function(oCondition) {
		if (!oCondition.key) {
			oCondition.key = "condition_" + this._iConditions;
		}
		this._iConditions++;
		this._oConditionsMap[oCondition.key] = oCondition;
	};

	/**
	 * returns array of all defined conditions.
	 * 
	 * @public
	 * @returns {object[]} array of Conditions
	 */
	P13nConditionPanel.prototype.getConditions = function() {
		var oCondition;
		var aConditions = [];

		if (this._oConditionsMap) {
			for ( var conditionId in this._oConditionsMap) {
				oCondition = this._oConditionsMap[conditionId];
				var sValue = oCondition.value;
				if (!sValue) {
					sValue = this._getFormatedConditionText(oCondition.operation, oCondition.value1, oCondition.value2, oCondition.exclude, oCondition.keyField, oCondition.showIfGrouped);
				}

				if (!oCondition._oGrid || oCondition._oGrid.select.getSelected()) {
					aConditions.push({
						"key": conditionId,
						"text": sValue,
						"exclude": oCondition.exclude,
						"operation": oCondition.operation,
						"keyField": oCondition.keyField,
						"value1": oCondition.value1,
						"value2": oCondition.value2,
						"showIfGrouped": oCondition.showIfGrouped
					});

				}
			}
		}

		return aConditions;
	};

	/**
	 * setter for the supported operations which we show per condition row. This array of "default"
	 * operations will only be used when we do not have on the keyfield itself some specific operations
	 * and a keyfield is of not of type date or numeric.
	 * 
	 * @public
	 * @param {sap.m.P13nConditionOperation[]}
	 *            aOperations array of operations [sap.m.P13nConditionOperation.BT,
	 *            sap.m.P13nConditionOperation.EQ]
	 * @param {string}
	 *            sType defines the type for which this operations will be used. is sType is not defined
	 *            the operations will be used as default operations.
	 */
	P13nConditionPanel.prototype.setOperations = function(aOperation, sType) {
		sType = sType || "default";
		this._oTypeOperations[sType] = aOperation;

		this._updateOperations();
	};

	/**
	 * add a single operation
	 * 
	 * @public
	 * @param {sap.m.P13nConditionOperation}
	 *            oOperation
	 * @param {string}
	 *            sType defines the type for which this operations will be used.
	 */
	P13nConditionPanel.prototype.addOperation = function(oOperation, sType) {
		sType = sType || "default";
		this._oTypeOperations[sType].push(oOperation);

		this._updateOperations();
	};

	/**
	 * remove all operations
	 * 
	 * @public
	 * @param {string}
	 *            sType defines the type for which all operations should be removed
	 */
	P13nConditionPanel.prototype.removeAllOperations = function(sType) {
		sType = sType || "default";
		this._oTypeOperations[sType] = [];

		this._updateOperations();
	};

	/**
	 * returns the default array of operations
	 * 
	 * @public
	 * @param {string}
	 *            sType defines the type for which the operations should be returned.
	 * @returns {sap.m.P13nConditionOperation[]} array of operations
	 */
	P13nConditionPanel.prototype.getOperations = function(sType) {
		sType = sType || "default";
		return this._oTypeOperations[sType];
	};

	/**
	 * This method allows you to specify the KeyFields for the conditions. You can set an array of
	 * object with Key and Text properties to define the keyfields.
	 * 
	 * @public
	 * @param {array}
	 *            aKeyFields array of KeyFields [{key: "CompanyCode", text: "ID"}, {key:"CompanyName", text : "Name"}]
	 */
	P13nConditionPanel.prototype.setKeyFields = function(aKeyFields) {
		this._aKeyFields = aKeyFields;

		this._updateKeyFieldItems(this._oConditionsGrid, true);
		this._updateKeyFields();
	};

	/**
	 * add a single KeyField
	 * 
	 * @public
	 * @param {object}
	 *            oKeyField {key: "CompanyCode", text: "ID"}
	 */
	P13nConditionPanel.prototype.addKeyField = function(oKeyField) {
		this._aKeyFields.push(oKeyField);

		this._updateKeyFieldItems(this._oConditionsGrid, true, true);
		this._enableConditions();
		this._updateKeyFields();
		this._updateOperations();
	};

	/**
	 * removes all KeyFields
	 * 
	 * @public
	 */
	P13nConditionPanel.prototype.removeAllKeyFields = function() {
		this._aKeyFields = [];

		this._updateKeyFieldItems(this._oConditionsGrid, true);
	};

	/**
	 * getter for KeyFields array
	 * 
	 * @public
	 * @returns {object[]} array of KeyFields [{key: "CompanyCode", text: "ID"}, {key:"CompanyName",
	 *          text : "Name"}]
	 */
	P13nConditionPanel.prototype.getKeyFields = function() {
		return this._aKeyFields;
	};

	/**
	 * sets the AlwaysShowAddIcon.
	 * 
	 * @public
	 * @param {boolean}
	 *            bEnabled makes the Add icon visible for each condition row.
	 */
	P13nConditionPanel.prototype.setAlwaysShowAddIcon = function(bEnabled) {
		this.setProperty("alwaysShowAddIcon", bEnabled);

		if (this._oConditionsGrid) {
			this._oConditionsGrid.toggleStyleClass("conditionRootGrid", this.getLayoutMode() !== "Desktop" && !this.getAlwaysShowAddIcon());
		}

		return this;
	};

	/**
	 * sets the LayoutMode. If not set the layout depends on the size of the browser or the container.
	 * see ContainerQuery
	 * 
	 * @public
	 * @param {string}
	 *            sLayoutMode define the layout mode for the condition row. The value can be Desktop,
	 *            Tablet or Phone.
	 */
	P13nConditionPanel.prototype.setLayoutMode = function(sLayoutMode) {
		this.setProperty("layoutMode", sLayoutMode);

		if (this._oConditionsGrid) {
			this._oConditionsGrid.toggleStyleClass("conditionRootGrid", sLayoutMode !== "Desktop" && !this.getAlwaysShowAddIcon());
		}

		this._updateConditionFieldSpans(sLayoutMode);

		// we have to refill the content grids
		this._clearConditions();
		this._fillConditions();

		return this;
	};

	/**
	 * sets the LayoutMode.
	 * 
	 * @private
	 * @param {string}
	 *            sLayoutMode define the layout mode for the condition row. The value can be Desktop,
	 *            Tablet or Phone.
	 */
	P13nConditionPanel.prototype._updateConditionFieldSpans = function(sMode) {
		if (this._aConditionsFields) {
			var bDesktop = sMode === "Desktop";
			if (bDesktop) {
				this._aConditionsFields[1].Span = "L1 M1 S1";
				this._aConditionsFields[2].Span = "L3 M3 S3";
				this._aConditionsFields[3].Span = "L1 M1 S1";
				this._aConditionsFields[4].Span = "L2 M2 S2";
				this._aConditionsFields[5].Span = "L3 M3 S3";
				this._aConditionsFields[6].Span = "L2 M2 S2";
				this._aConditionsFields[7].Span = "L1 M1 S1";
			}
			var bTablet = sMode === "Tablet";
			if (bTablet) {
				this._aConditionsFields[1].Span = "L1 M1 S1";
				this._aConditionsFields[2].Span = "L5 M5 S5";
				this._aConditionsFields[3].Span = "L1 M1 S1";
				this._aConditionsFields[4].Span = "L5 M5 S5";
				this._aConditionsFields[5].Span = "L10 M10 S10";
				this._aConditionsFields[6].Span = "L10 M10 S10";
				this._aConditionsFields[7].Span = "L1 M1 S1";
			}
		}
	};

	/*
	 * Initialize the control
	 * 
	 * @private
	 */
	P13nConditionPanel.prototype.init = function() {
		// load the required layout lib
		sap.ui.getCore().loadLibrary("sap.ui.layout");
		jQuery.sap.require("sap.ui.layout.Grid");

		sap.ui.layout.Grid.prototype.init.apply(this);

		this.addStyleClass("sapMConditionPanel");

		// init some resources
		this._oRb = sap.ui.getCore().getLibraryResourceBundle("sap.m");
		this._sBetweenOperation = this._oRb.getText("CONDITIONPANEL_OPTIONBT");
		this._sInitialOperation = this._oRb.getText("CONDITIONPANEL_OPTIONInitial");
		this._sFromLabelText = this._oRb.getText("CONDITIONPANEL_LABELFROM");
		this._sToLabelText = this._oRb.getText("CONDITIONPANEL_LABELTO");
		this._sValueLabelText = this._oRb.getText("CONDITIONPANEL_LABELVALUE");
		this._sShowIfGroupedLabelText = this._oRb.getText("CONDITIONPANEL_LABELGROUPING");
		this._sValidationDialogFieldMessage = this._oRb.getText("CONDITIONPANEL_FIELDMESSAGE");

		this._oTypeOperations = {
			"default": []
		};

		this._aKeyFields = [];
		this._oConditionsMap = {};
		this._iConditions = 0;
		this._iConditionCount = 0;
		this._sLayoutMode = "Desktop";

		this._iBreakPointTablet = sap.ui.Device.media._predefinedRangeSets[sap.ui.Device.media.RANGESETS.SAP_STANDARD].points[0];
		this._iBreakPointDesktop = sap.ui.Device.media._predefinedRangeSets[sap.ui.Device.media.RANGESETS.SAP_STANDARD].points[1];

		// create the main grid and add it into the hidden content aggregation
		this._oConditionsGrid = new sap.ui.layout.Grid({
			width: "100%",
			defaultSpan: "L12 M12 S12",
			hSpacing: 0,
			vSpacing: 0
		}).toggleStyleClass("conditionRootGrid", this.getLayoutMode() !== "Desktop" && !this.getAlwaysShowAddIcon());

		this.addAggregation("content", this._oConditionsGrid);

		this._aConditionsFields = [
			{
				"ID": "select",
				"Label": "",
				"Span": "L1 M1 S1",
				"Control": "CheckBox",
				"Value": ""
			}, {
				"ID": "keyFieldLabel",
				"Text": "Sort By",
				"Span": "L1 M1 S1",
				"Control": "Label"
			}, {
				"ID": "keyField",
				"Label": "",
				"Span": "L3 M5 S10",
				"Control": "ComboBox",
				"SelectedKey": "0"
			}, {
				"ID": "operationLabel",
				"Text": "Sort Order",
				"Span": "L1 M1 S1",
				"Control": "Label"
			}, {
				"ID": "operation",
				"Label": "",
				"Span": "L2 M5 S10",
				"Control": "ComboBox",
				"SelectedKey": "0"
			}, {
				"ID": "value1",
				"Label": this._sFromLabelText,
				"Span": "L3 M10 S10",
				"Control": "TextField",
				"Value": ""
			}, {
				"ID": "value2",
				"Label": this._sToLabelText,
				"Span": "L2 M10 S10",
				"Control": "TextField",
				"Value": ""
			}, {
				"ID": "showIfGrouped",
				"Label": this._sShowIfGroupedLabelText,
				"Span": "L1 M10 S10",
				"Control": "CheckBox",
				"Value": "false"
			}
		];
		this._updateConditionFieldSpans(this.getLayoutMode());

		// fill/update the content "oConditionGrid"s
		this._fillConditions();
	};

	/*
	 * destroy and remove all internal references
	 * 
	 * @private
	 */
	P13nConditionPanel.prototype.exit = function() {

		if (this._sContainerResizeListener) {
			sap.ui.core.ResizeHandler.deregister(this._sContainerResizeListener);
			this._sContainerResizeListener = null;
		}

		sap.ui.Device.media.detachHandler(this._handleMediaChange, this, sap.ui.Device.media.RANGESETS.SAP_STANDARD);

		this._aConditionsFields = null;

		this._aKeys = null;
		this._aKeyFields = null;
		this._oTypeOperations = null;

		this._oRb = null;

		this._sBetweenOperation = null;
		this._sInitialOperation = null;
		this._sFromLabelText = null;
		this._sToLabelText = null;
		this._sValueLabelText = null;
		this._sValidationDialogFieldMessage = null;

		this._oConditionsMap = null;
	};

	/*
	 * removes all condition rows from the main ConditionGrid.
	 * 
	 * @private
	 */
	P13nConditionPanel.prototype._clearConditions = function() {
		this._oConditionsGrid.removeAllContent();
		this._iConditionCount = 0;
	};

	/*
	 * creates all condition rows and updated the values of the fields.
	 * 
	 * @private
	 */
	P13nConditionPanel.prototype._fillConditions = function() {
		var i = 0;
		var oCondition;
		var iMaxConditions = this._getMaxConditionsAsNumber();

		// init existing conditions
		if (this._oConditionsMap) {
			for ( var conditionId in this._oConditionsMap) {
				oCondition = this._oConditionsMap[conditionId];
				if (i < iMaxConditions) {
					this._createConditionRow(this._oConditionsGrid, oCondition, conditionId);
				} else { 
					break; 
				}
				i++;
			}
		}

		// create empty Conditions row/fields
		if ((this.getAutoAddNewRow() || this._oConditionsGrid.getContent().length === 0) && this._oConditionsGrid.getContent().length < iMaxConditions) {
			this._createConditionRow(this._oConditionsGrid);
		}
	};

	/*
	 * add one condition 
	 * 
	 * @private
	 */
	P13nConditionPanel.prototype._addCondition = function(oCondition) {
		var i = 0;
		var iMaxConditions = this._getMaxConditionsAsNumber();

		if (this._oConditionsMap) {
			for ( var conditionId in this._oConditionsMap) {
				if (i < iMaxConditions && oCondition === this._oConditionsMap[conditionId]) {
					this._createConditionRow(this._oConditionsGrid, oCondition, conditionId, i);
				}
				i++;
			}
		}
	};
	
	
	P13nConditionPanel.prototype._getMaxConditionsAsNumber = function() {
		return this.getMaxConditions() === "-1" ? 1000 : parseInt(this.getMaxConditions(), 10);
	};


	P13nConditionPanel.prototype.onAfterRendering = function() {
		if (this.getLayoutMode()) {
			this._sLayoutMod = this.getLayoutMode();
			return;
		}

		if (this.getContainerQuery()) {
			this._sContainerResizeListener = sap.ui.core.ResizeHandler.register(this._oConditionsGrid, jQuery.proxy(this._onGridResize, this));
			this._onGridResize();
		} else {
			sap.ui.Device.media.attachHandler(this._handleMediaChange, this, sap.ui.Device.media.RANGESETS.SAP_STANDARD);
		}
	};

	P13nConditionPanel.prototype.onBeforeRendering = function() {
		this._cleanup();
	};

	P13nConditionPanel.prototype._handeMediaChange = function(p) {
		this._sLayoutMode = p.name;

		// if (window.console) {
		// console.log(" ---> MediaChange " + p.name);
		// }

		this._updateLayout(p);
	};

	P13nConditionPanel.prototype._cleanup = function() {
		if (this._sContainerResizeListener) {
			sap.ui.core.ResizeHandler.deregister(this._sContainerResizeListener);
			this._sContainerResizeListener = null;
		}
		sap.ui.Device.media.detachHandler(this._handleMediaChange, this, sap.ui.Device.media.RANGESETS.SAP_STANDARD);
	};

	/**
	 * appends a new condition grid with all containing controls in the main grid
	 * 
	 * @private
	 * @param {grid}
	 *            oTargetGrid the main grid in which the new condition grid will be added
	 * @param {object}
	 *            oConditionGridData the condition data for the new added condition grid controls
	 * @param {string}
	 *            sKey the key for the new added condition grid
	 * @param {integer}
	 *            iPos the index of the new condition in the targetGrid
	 */
	P13nConditionPanel.prototype._createConditionRow = function(oTargetGrid, oConditionGridData, sKey, iPos) {
		var oButtonContainer = null;
		var oGrid;
		var that = this;

		if (iPos === undefined) {
			iPos = oTargetGrid.getContent().length;
		}

		var sOrgKey = sKey;
		if (!sKey) {
			sKey = "condition_" + (this._iConditionCount);
		}
		this._iConditionCount++;

		var oConditionGrid = new sap.ui.layout.Grid({
			width: "100%",
			defaultSpan: "L12 M12 S12",
			hSpacing: 1,
			vSpacing: 0,
			containerQuery: this.getContainerQuery()
		}).data("_key", sKey);

		for ( var iField in this._aConditionsFields) {
			var oControl;
			var field = this._aConditionsFields[iField];

			switch (field["Control"]) {
				case "CheckBox":
					// the CheckBox is not visible and only used internal to validate if a condition is
					// filled correct.
					oControl = new sap.m.CheckBox({
						enabled: false,
						visible: false,
						layoutData: new sap.ui.layout.GridData({
							span: field["Span"]
						})
					});

					if (field["ID"] === "showIfGrouped") {
						oControl.setEnabled(true);
						oControl.setText(field["Label"]);
						oControl.setTooltip(field["Label"]);
						oControl.attachSelect(function() {
							that._changeField(oConditionGrid);
						});

						if (typeof oConditionGridData !== "undefined") {
							oControl.setSelected(oConditionGridData.showIfGrouped);
						} else {
							if (this.getUsePrevConditionSetting()) {
								// select the value from the condition above
								if (iPos > 0) {
									oGrid = oTargetGrid.getContent()[iPos - 1];
									oControl.setSelected(oGrid.showIfGrouped.getSelected());
								}
							}
						}

					} else {
						if (typeof oConditionGridData !== "undefined") {
							oControl.setSelected(true);
							oControl.setEnabled(true);
						}
					}
					break;

				case "ComboBox":
					if (field["ID"] === "keyField") {
						oControl = new sap.m.ComboBox({
						//oControl.setForceSelection(true); 
						//oControl = new sap.m.Select({
							selectedKey: field["SelectedKey"],
							// autoAdjustWidth: true,
							forceSelection : true,
							width: "100%",
							layoutData: new sap.ui.layout.GridData({
								span: field["Span"]
							})
						});

						this._fillKeyFieldListItems(oControl, this._aKeyFields);

						oControl.attachChange(function() {
							that._triggerChangeKeyfield(oTargetGrid, oConditionGrid);
							//sap.m.MessageToast.show("Change");
						});

//						oControl.attachSelectionChange(function() {
//							that._triggerChangeKeyfield(oTargetGrid, oConditionGrid);
//							//sap.m.MessageToast.show("SelectionChange");
//						});

						if (typeof oConditionGridData !== "undefined") {
							oControl.setSelectedKey(oConditionGridData.keyField);
							this._aKeyFields.forEach(function(oKeyField, index) {
								var key = oKeyField.key;
								if (key === undefined) {
									key = oKeyField;
								}
								if (oConditionGridData.keyField === key) {
									oControl.setSelectedItem(oControl.getItems()[index]);
								}
							}, this);
						} else {
							if (this.getUsePrevConditionSetting() && !this.getAutoReduceKeyFieldItems()) {
								// select the key from the condition above
								if (iPos > 0 && sOrgKey === null) {
									oGrid = oTargetGrid.getContent()[iPos - 1];
									oControl.setSelectedKey(oGrid.keyField.getSelectedKey());
								} else {
									oControl.setSelectedItem(oControl.getItems()[0]);
									this._aKeyFields.forEach(function(oKeyField, index) {
										if (oKeyField.isDefault) {
											oControl.setSelectedItem(oControl.getItems()[index]);
										}
									}, this);
								}
							} else {
								this._aKeyFields.forEach(function(oKeyField, index) {
									if (oKeyField.isDefault) {
										oControl.setSelectedItem(oControl.getItems()[index]);
									}
								}, this);
							}
						}
					}

					if (field["ID"] === "operation") {
						oControl = new sap.m.Select({
							selectedKey: field["SelectedKey"],
							// autoAdjustWidth: true,
							width: "100%",
							layoutData: new sap.ui.layout.GridData({
								span: field["Span"]
							})
						});

						oControl.attachChange(function() {
							that._triggerChangeOperations(oTargetGrid, oConditionGrid);
						});

//						oControl.attachSelectionChange(function() {
//							that._triggerChangeOperations(oTargetGrid, oConditionGrid);
//						});

						// fill some operations to the control to be able to set the selected items
						oConditionGrid[field["ID"]] = oControl;
						this._updateOperation(oTargetGrid, oConditionGrid);

						if (typeof oConditionGridData !== "undefined") {
							var oKeyField = this._getCurrentKeyField(oConditionGrid.keyField);
							var aOperations = this._oTypeOperations["default"];
							if (oKeyField) {
								if (oKeyField.type && this._oTypeOperations[oKeyField.type]) {
									aOperations = this._oTypeOperations[oKeyField.type];
								}
							}

							aOperations.forEach(function(oOperation, index) {
								if (oConditionGridData.operation === oOperation) {
									oControl.setSelectedItem(oControl.getItems()[index]);
								}
							}, this);
						} else {
							if (this.getUsePrevConditionSetting()) {
								// select the key from the condition above
								if (iPos > 0 && sOrgKey === null) {
									var oGrid = oTargetGrid.getContent()[iPos - 1];
									oControl.setSelectedKey(oGrid.operation.getSelectedKey());
								}
							}
						}
					}

					// init tooltip of select control
					if (oControl.getSelectedItem()) {
						oControl.setTooltip(oControl.getSelectedItem().getTooltip() || oControl.getSelectedItem().getText());
					}

					break;

				case "TextField":
					var oCurrentKeyField = this._getCurrentKeyField(oConditionGrid.keyField);
					oControl = this._createField(oCurrentKeyField, field, oConditionGrid);
					oControl.oTargetGrid = oTargetGrid;

					if (typeof oConditionGridData !== "undefined") {
						if (typeof oConditionGridData[field["ID"]] !== "undefined") {
							var sValue = oConditionGridData[field["ID"]];
							var oValue;

							if (typeof sValue === "string" && oConditionGrid.oFormatter) {
								oValue = oConditionGrid.oFormatter.parse(sValue);
							} else {
								oValue = sValue;
							}

							if (!isNaN(oValue) && oValue !== null && oConditionGrid.oFormatter) {
								sValue = oConditionGrid.oFormatter.format(oValue);
								oControl.setValue(sValue);
								//oCtrl.setValueState(sap.ui.core.ValueState.None);
							} else {
								oControl.setValue(oValue);
								//oCtrl.setValueState(sap.ui.core.ValueState.Warning);
								//oCtrl.setValueStateText(this._sValidationDialogFieldMessage);
							}
						}
					}
					break;

				case "Label":
					oControl = new sap.m.Label({
						text: field["Text"] + ":",
						visible: this.getShowLabel(),
						layoutData: new sap.ui.layout.GridData({
							span: field["Span"]
						})
					}).addStyleClass("conditionLabel");

					oControl.oTargetGrid = oTargetGrid;
					break;
			}

			oConditionGrid[field["ID"]] = oControl;
			oConditionGrid.addContent(oControl);
		}

		// create a hLayout container for the remove and add buttons
		oButtonContainer = new sap.ui.layout.HorizontalLayout({
			layoutData: new sap.ui.layout.GridData({
				span: this.getLayoutMode() === "Desktop" ? "L2 M2 S2" : "L1 M2 S2"
			})
		});
		oConditionGrid.addContent(oButtonContainer);
		oConditionGrid["ButtonContainer"] = oButtonContainer;

		// create "Remove button"
		var oRemoveControl = new sap.m.Button({
			type: sap.m.ButtonType.Transparent,
			icon: sap.ui.core.IconPool.getIconURI("sys-cancel"),
			press: function() {
				that._triggerRemoveCondition(this.oTargetGrid, oConditionGrid);
			},
			layoutData: new sap.ui.layout.GridData({
				span: this.getLayoutMode() === "Desktop" ? "L1 M1 S1" : "L1 M2 S2"
			})
		});

		oRemoveControl.oTargetGrid = oTargetGrid;

		oButtonContainer.addContent(oRemoveControl);
		oConditionGrid["remove"] = oRemoveControl;

		// create "Add button"
		var oAddControl = new sap.m.Button({
			type: sap.m.ButtonType.Transparent,
			icon: sap.ui.core.IconPool.getIconURI("add"),
			tooltip: this._oRb.getText("CONDITIONPANEL_ADD_TOOLTIP"),
			press: function() {
				that._triggerAddCondition(this.oTargetGrid, oConditionGrid);
			},
			layoutData: new sap.ui.layout.GridData({
				span: this.getLayoutMode() === "Desktop" ? "L1 M1 S1" : "L1 M10 S10"
			})
		});

		oAddControl.oTargetGrid = oTargetGrid;
		oAddControl.addStyleClass("conditionAddBtnFloatRight");

		oButtonContainer.addContent(oAddControl);
		oConditionGrid["add"] = oAddControl;

		// Add the new create condition
		oTargetGrid.insertContent(oConditionGrid, iPos);

		// update Operations for all conditions
		this._updateOperation(oTargetGrid, oConditionGrid);
		this._changeOperation(oTargetGrid, oConditionGrid);

		// disable fields if the selectedKeyField value is none
		this._enableConditions();

		// update the add/remove buttons visibility
		this._updateConditionButtons(oTargetGrid);

		if (this.getAutoReduceKeyFieldItems()) {
			this._updateKeyFieldItems(oTargetGrid, false);
		}

		if (this._sLayoutMode) {
			this._updateLayout({
				name: this._sLayoutMode
			});
		}

		if (typeof oConditionGridData !== "undefined") {
			var sConditionText = this._getFormatedConditionText(oConditionGridData.operation, oConditionGridData.value1, oConditionGridData.value2, oConditionGridData.exclude, oConditionGridData.keyField, oConditionGridData.showIfGrouped);

			oConditionGridData._oGrid = oConditionGrid;
			oConditionGridData.value = sConditionText;
			this._oConditionsMap[sKey] = oConditionGridData;
		}

		return oConditionGrid;
	};

	/**
	 * press handler for the remove Condition buttons
	 * 
	 * @private
	 * @param {grid}
	 *            oTargetGrid the main grid
	 * @param {grid}
	 *            oConditionGrid from where the Remove is triggered
	 */
	P13nConditionPanel.prototype._triggerRemoveCondition = function(oTargetGrid, oConditionGrid) {
		// search index of the condition grid to set the focus later to the previous condition
		var idx = oTargetGrid.getContent().indexOf(oConditionGrid);

		this._removeCondition(oTargetGrid, oConditionGrid);

		if (this.getAutoReduceKeyFieldItems()) {
			this._updateKeyFieldItems(oTargetGrid, false);
		}

		// set the focus on the remove button of the newly added condition
		if (idx >= 0) {
			idx = Math.min(idx, oTargetGrid.getContent().length - 1);
			var oConditionGrid = oTargetGrid.getContent()[idx];
			setTimeout(function() {
				oConditionGrid.remove.focus();
			});
		}
	};

	/**
	 * press handler for the add condition buttons
	 * 
	 * @private
	 * @param {grid}
	 *            oTargetGrid the main grid
	 * @param {grid}
	 *            oSourceConditionGrid from where the Add is triggered
	 */
	P13nConditionPanel.prototype._triggerAddCondition = function(oTargetGrid, oSourceConditionGrid) {
		var iPos = oTargetGrid.getContent().indexOf(oSourceConditionGrid);
		var oConditionGrid = this._createConditionRow(oTargetGrid, undefined, null, iPos + 1);
		this._changeField(oConditionGrid);

		// set the focus in a fields of the newly added condition
		setTimeout(function() {
			oConditionGrid.keyField.focus();
		});
	};

	P13nConditionPanel.prototype._getCurrentKeyField = function(oKeyFieldCtrl) {
		var sKey = oKeyFieldCtrl.getSelectedKey();
		var aItems = this._aKeyFields;
		for ( var iItem in aItems) {
			var oItem = aItems[iItem];
			if (oItem.key === sKey) {
				return oItem;
			}
		}
		return null;
	};

	/**
	 * creates a new control for the condition value1 and value2 field. Control can be an Input or
	 * DatePicker
	 * 
	 * @private
	 * @param {object}
	 *            oCurrentKeyField object of the current selected KeyField which contains type of the
	 *            column ("string" (default) "date" or "numeric") and a maxLength information
	 * @param {object}
	 *            oFieldInfo
	 * @param {grid}
	 *            oConditionGrid which should contain the new created field
	 * @returns {Control} the created control instance either Input or DatePicker
	 */
	P13nConditionPanel.prototype._createField = function(oCurrentKeyField, oFieldInfo, oConditionGrid) {
		var oControl;
		var sCtrlType = oCurrentKeyField ? oCurrentKeyField.type : "";
		var that = this;

		var params = {
			value: oFieldInfo["Value"],
			width: "100%",
			placeholder: oFieldInfo["Label"],
			change: function() {
				that._changeField(oConditionGrid);
			},
			layoutData: new sap.ui.layout.GridData({
				span: oFieldInfo["Span"]
			})
		};

		switch (sCtrlType) {
			case "numeric":
				var oFloatFormatOptions;
				if (oCurrentKeyField.precision || oCurrentKeyField.scale) {
					oFloatFormatOptions = {};
					if (oCurrentKeyField.precision) {
						oFloatFormatOptions["maxIntegerDigits"] = parseInt(oCurrentKeyField.precision, 10);
					}
					if (oCurrentKeyField.scale) {
						oFloatFormatOptions["maxFractionDigits"] = parseInt(oCurrentKeyField.scale, 10);
					}
				}
				oConditionGrid.oFormatter = NumberFormat.getFloatInstance(oFloatFormatOptions);

				oControl = new sap.m.Input(params);
				break;
			case "date":
				oConditionGrid.oFormatter = DateFormat.getDateInstance();
				oControl = new sap.m.DatePicker(params);
				break;
			default:
				oConditionGrid.oFormatter = null;
				oControl = new sap.m.Input(params);
		}

		if (oCurrentKeyField && oCurrentKeyField.maxLength && oControl.setMaxLength) {
			var l = -1;
			if (typeof oCurrentKeyField.maxLength === "string") {
				l = parseInt(oCurrentKeyField.maxLength, 10);
			}
			if (typeof oCurrentKeyField.maxLength === "number") {
				l = oCurrentKeyField.maxLength;
			}
			if (l > 0) {
				oControl.setMaxLength(l);
			}
		}

		return oControl;
	};

	/**
	 * fill all operations from the aOperation array into the select control items list
	 * 
	 * @private
	 * @param {sap.m.Select}
	 *            oSelect the select control which should be filled
	 * @param {array}
	 *            aOperations array of operations
	 */
	P13nConditionPanel.prototype._fillOperationItems = function(oSelect, aOperations, sType) {
		oSelect.removeAllItems();
		for ( var iOperation in aOperations) {
			var sText = this._oRb.getText("CONDITIONPANEL_OPTION" + sType + aOperations[iOperation]);
			oSelect.addItem(new sap.ui.core.ListItem({
				text: sText,
				tooltip: sText,
				key: aOperations[iOperation]
			}));
		}
	};

	/**
	 * fill all KeyFieldItems from the aItems array into the select control items list
	 * 
	 * @private
	 * @param {sap.m.Select}
	 *            oSelect the select control which should be filled
	 * @param {array}
	 *            aItems array of keyfields
	 */
	P13nConditionPanel.prototype._fillKeyFieldListItems = function(oSelect, aItems) {
		oSelect.removeAllItems();
		for ( var iItem in aItems) {
			var oItem = aItems[iItem];
			oSelect.addItem(new sap.ui.core.ListItem({
				key: oItem.key,
				text: oItem.text,
				tooltip: oItem.tooltip ? oItem.tooltip : oItem.text
			}));
		}
	};

	/**
	 * change handler for the Operation field
	 * 
	 * @private
	 * @param {grid}
	 *            oTargetGrid the main grid
	 * @param {grid}
	 *            oConditionGrid Grid which contains the Operation control which has been changed
	 */
	P13nConditionPanel.prototype._triggerChangeOperations = function(oTargetGrid, oConditionGrid) {
		this._changeOperation(oTargetGrid, oConditionGrid);
		this._changeField(oConditionGrid);
	};

	/**
	 * change handler for the KeyField field
	 * 
	 * @private
	 * @param {grid}
	 *            oTargetGrid the main grid
	 * @param {grid}
	 *            oConditionGrid Grid which contains the KeyField control which has been changed
	 */
	P13nConditionPanel.prototype._triggerChangeKeyfield = function(oTargetGrid, oConditionGrid) {

		this._updateOperation(oTargetGrid, oConditionGrid);

		// update the value fields for the KeyField
		this._updateValueFields(oTargetGrid, oConditionGrid);

		this._changeOperation(oTargetGrid, oConditionGrid);

		this._changeField(oConditionGrid);

		if (this.getAutoReduceKeyFieldItems()) {
			this._updateKeyFieldItems(oTargetGrid, false);
		}
	};

	P13nConditionPanel.prototype._updateKeyFields = function() {
		var aConditionGrids = this._oConditionsGrid.getContent();
		aConditionGrids.forEach(function(oConditionGrid) {
			this._updateValueFields(this._oConditionsGrid, oConditionGrid);
			this._changeOperation(this._oConditionsGrid, oConditionGrid);
		}, this);
	};

	/**
	 * creates the Value1/2 fields based on the KeyField Type
	 * 
	 * @private
	 * @param {grid}
	 *            oTargetGrid the main grid
	 * @param {grid}
	 *            oConditionGrid Grid which contains the KeyField control which has been changed
	 */
	P13nConditionPanel.prototype._updateValueFields = function(oTargetGrid, oConditionGrid) {

		// update the value fields for the KeyField
		var oCurrentKeyField = this._getCurrentKeyField(oConditionGrid.keyField);

		var fnCreateAndUpdateField = function(oCtrl, index) {
			var oConditionGrid = oCtrl.getParent();
			var sOldValue = oCtrl.getValue();

			oConditionGrid.removeContent(oCtrl);
			//delete oConditionGrid.value1;
			var fieldInfo = this._aConditionsFields[index];
			oCtrl = this._createField(oCurrentKeyField, fieldInfo, oConditionGrid);
			oConditionGrid[fieldInfo["ID"]] = oCtrl;
			oConditionGrid.insertContent(oCtrl, index);

			var oValue, sValue;
			if (oConditionGrid.oFormatter && sOldValue) {
				oValue = oConditionGrid.oFormatter.parse(sOldValue);
				if (!isNaN(oValue) && oValue !== null) {
					sValue = oConditionGrid.oFormatter.format(oValue);
					oCtrl.setValue(sValue);
				}
			}
			if (!sValue) {
				oCtrl.setValue(sOldValue);
			}
		};

		// update Value1 field control
		jQuery.proxy(fnCreateAndUpdateField, this)(oConditionGrid.value1, 5);

		// update Value2 field control
		jQuery.proxy(fnCreateAndUpdateField, this)(oConditionGrid.value2, 6);
	};

	P13nConditionPanel.prototype._updateOperations = function() {
		var aConditionGrids = this._oConditionsGrid.getContent();
		aConditionGrids.forEach(function(oConditionGrid) {
			this._updateOperation(this._oConditionsGrid, oConditionGrid);
			this._changeOperation(this._oConditionsGrid, oConditionGrid);
		}, this);
	};

	P13nConditionPanel.prototype._updateOperation = function(oTargetGrid, oConditionGrid) {
		var sType = "";

		var oKeyField = this._getCurrentKeyField(oConditionGrid.keyField);

		var aOperations = this._oTypeOperations["default"];
		if (oKeyField && !this.getExclude()) {
			if (oKeyField.type && oKeyField.type === "numeric" && this._oTypeOperations["numeric"]) {
				sType = oKeyField.type;
				aOperations = this._oTypeOperations[sType];
			}
			if (oKeyField.type && oKeyField.type === "date" && this._oTypeOperations["date"]) {
				sType = oKeyField.type;
				aOperations = this._oTypeOperations[sType];
			}
			if (oKeyField.operations) {
				aOperations = oKeyField.operations;
			}
		}

		var oSelItem = oConditionGrid.operation.getSelectedItem();

		this._fillOperationItems(oConditionGrid.operation, aOperations, sType ? "_" + sType.toUpperCase() + "_" : "");

		if (oSelItem) {
			oConditionGrid.operation.setSelectedKey(oSelItem.getKey());
		} else {
			oConditionGrid.operation.setSelectedItem(oConditionGrid.operation.getItems()[0]);
		}
	};

	/**
	 * update the Items from all KeyFields
	 * 
	 * @private
	 * @param {grid}
	 *            oTargetGrid the main grid
	 * @param {boolean}
	 *            bFillAll fills all KeyFields or only the none used
	 * @param {boolean}
	 *            bAppendLast adds only the last Keyfield to the Items of the selected controls
	 */
	P13nConditionPanel.prototype._updateKeyFieldItems = function(oTargetGrid, bFillAll, bAppendLast) {
		var n = oTargetGrid.getContent().length;
		var i;

		// collect all used Keyfields
		var oUsedItems = {};
		if (!bFillAll) {
			for (i = 0; i < n; i++) {
				var oKeyField = oTargetGrid.getContent()[i].keyField;

				var sKey = oKeyField.getSelectedKey();
				if (sKey != null && sKey !== "") {
					oUsedItems[sKey] = true;
				}
			}
		}

		var fHandledIsDefault = function(oKeyFieldItem, index) {
			if (oKeyFieldItem.isDefault) {
				oKeyField.setSelectedItem(oKeyField.getItems()[index]);
			}
		};

		for (i = 0; i < n; i++) {
			var oKeyField = oTargetGrid.getContent()[i].keyField;
			var oSelectCheckbox = oTargetGrid.getContent()[i].select;
			var sOldKey = oKeyField.getSelectedKey();
			var j = 0;
			var aItems = this._aKeyFields;

			if (bAppendLast) {
				j = aItems.length - 1;
			} else {
				// clean the items
				oKeyField.removeAllItems();
			}

			// fill all or only the not used items
			for (j; j < aItems.length; j++) {
				var oItem = aItems[j];
				if (oItem.key == null || oItem.key === "" || !oUsedItems[oItem.key] || oItem.key === sOldKey) {
					oKeyField.addItem(new sap.ui.core.ListItem({
						key: oItem.key,
						text: oItem.text,
						tooltip: oItem.tooltip ? oItem.tooltip : oItem.text
					}));
				}
			}

			if (sOldKey) {
				oKeyField.setSelectedKey(sOldKey);
			} else if (oKeyField.getItems().length > 0) {
				// make at least the first item the selected item. We need this for updating the tooltip
				oKeyField.setSelectedItem(oKeyField.getItems()[0]);
			}

			if (!oSelectCheckbox.getSelected()) {
				// set/update the isDefault keyfield as selected item for an empty condition row
				this._aKeyFields.forEach(fHandledIsDefault, this);
			}

			// update the tooltip
			if (oKeyField.getSelectedItem()) {
				oKeyField.setTooltip(oKeyField.getSelectedItem().getTooltip() || oKeyField.getSelectedItem().getText());
			}
		}
	};

	/**
	 * called when the user makes a change on the condition operation. The function will update the
	 * fields in the condition grid.
	 * 
	 * @private
	 * @param {grid}
	 *            oTargetGrid the main grid
	 * @param {grid}
	 *            oConditionGrid Grid which contains the Operation control which has been changed
	 */
	P13nConditionPanel.prototype._changeOperation = function(oTargetGrid, oConditionGrid) {
		var oKeyfield = oConditionGrid.keyField;
		var oOperation = oConditionGrid.operation;
		var sOperation = oOperation.getSelectedKey();
		var oValue1 = oConditionGrid.value1;
		var oValue2 = oConditionGrid.value2;
		var oShowIfGrouedvalue = oConditionGrid.showIfGrouped;

		if (!sOperation) {
			return;
		}

		if (sOperation === sap.m.P13nConditionOperation.BT) {
			// for the "between" operation we enable both fields
			oValue1.setPlaceholder(this._sFromLabelText);
			oValue1.setVisible(true);

			oValue2.setPlaceholder(this._sToLabelText);
			oValue2.setVisible(true);
		} else {
			if (sOperation === sap.m.P13nConditionOperation.GroupAscending || sOperation === sap.m.P13nConditionOperation.GroupDescending) {

				// update visible of fields
				oValue1.setVisible(false);
				oValue2.setVisible(false);
				oOperation.setVisible(false);
				oShowIfGrouedvalue.setVisible(this._getMaxConditionsAsNumber() != 1);

				// correct field span
				// oKeyfield.getLayoutData().setSpan("L4 M4 S4");
				// oOperation.getLayoutData().setSpan("L4 M4 S4");
				// oShowIfGrouedvalue.getLayoutData().setSpan("L2 M2 S2");
				oKeyfield.getLayoutData().setSpan("L5 M5 S5");
				oOperation.getLayoutData().setSpan("L4 M4 S4");
				oShowIfGrouedvalue.getLayoutData().setSpan("L4 M4 S4");
			} else {
				if (sOperation === sap.m.P13nConditionOperation.Initial || sOperation === sap.m.P13nConditionOperation.Ascending || sOperation === sap.m.P13nConditionOperation.Descending || sOperation === sap.m.P13nConditionOperation.Total || sOperation === sap.m.P13nConditionOperation.Average || sOperation === sap.m.P13nConditionOperation.Minimum || sOperation === sap.m.P13nConditionOperation.Maximum) {

					// for this operations we disable both value fields
					oValue1.setVisible(false);
					oValue2.setVisible(false);

					// correct the field span
					if (sOperation !== sap.m.P13nConditionOperation.Initial) {
						var iSpan = this.getShowLabel() ? 4 : 5;
						if (this.getLayoutMode() === "Desktop") {
							oKeyfield.getLayoutData().setSpan("L5 M5 S5");
							oOperation.getLayoutData().setSpan("L4 M4 S4");
						} else {
							oKeyfield.getLayoutData().setSpanL(iSpan);
							oOperation.getLayoutData().setSpanL(iSpan - 1);
							// oKeyfield.getLayoutData().setSpan("L5 M5 S5");
							// oOperation.getLayoutData().setSpan("L4 M4 S4");
						}
					}
				} else {
					// for all other operations we enable only the Value1 fields
					oValue1.setPlaceholder(this._sValueLabelText);
					oValue1.setVisible(true);

					oValue2.setVisible(false);
				}
			}
		}
	};

	/**
	 * called when the user makes a change in one of the condition fields. The function will update,
	 * remove or add the conditions for this condition.
	 * 
	 * @private
	 * @param {grid}
	 *            oConditionGrid Grid which contains the Operation control which has been changed
	 */
	P13nConditionPanel.prototype._changeField = function(oConditionGrid) {
		var sKeyField = oConditionGrid.keyField.getSelectedKey();
		if (oConditionGrid.keyField.getSelectedItem()) {
			oConditionGrid.keyField.setTooltip(oConditionGrid.keyField.getSelectedItem().getTooltip() || oConditionGrid.keyField.getSelectedItem().getText());
		}

		var sOperation = oConditionGrid.operation.getSelectedKey();
		if (oConditionGrid.operation.getSelectedItem()) {
			oConditionGrid.operation.setTooltip(oConditionGrid.operation.getSelectedItem().getTooltip() || oConditionGrid.operation.getSelectedItem().getText());
		}

		var fnFormatFieldValue = function(oCtrl) {
			var oConditionGrid = oCtrl.getParent();
			var sValue = oCtrl.getValue();

			if (this.getDisplayFormat() === "UpperCase" && sValue) {
				sValue = sValue.toUpperCase();
				oCtrl.setValue(sValue);
			}

			if (oConditionGrid.oFormatter && sValue) {
				var oValue = oConditionGrid.oFormatter.parse(sValue);
				if (!isNaN(oValue) && oValue !== null) {
					sValue = oConditionGrid.oFormatter.format(oValue);
					oCtrl.setValue(sValue);
					oCtrl.setValueState(sap.ui.core.ValueState.None);
				} else {
					oCtrl.setValueState(sap.ui.core.ValueState.Warning);
					oCtrl.setValueStateText(this._sValidationDialogFieldMessage);
				}
			}
		};

		// update Value1 field control
		jQuery.proxy(fnFormatFieldValue, this)(oConditionGrid.value1);
		var oValue1 = oConditionGrid.value1.getValue();
		var sValue1 = oValue1;
		if (oConditionGrid.oFormatter && sValue1) {
			oValue1 = oConditionGrid.oFormatter.parse(sValue1);
			if (isNaN(oValue1) || oValue1 === null) {
				sValue1 = "";
			}
		}

		// update Value2 field control
		jQuery.proxy(fnFormatFieldValue, this)(oConditionGrid.value2);
		var oValue2 = oConditionGrid.value2.getValue();
		var sValue2 = oValue2;
		if (oConditionGrid.oFormatter && sValue2) {
			oValue2 = oConditionGrid.oFormatter.parse(sValue2);
			if (isNaN(oValue2) || oValue2 === null) {
				sValue2 = "";
			}
		}

		var bShowIfGrouped = oConditionGrid.showIfGrouped.getSelected();
		var bExclude = this.getExclude();
		var oSelectCheckbox = oConditionGrid.select;
		var sValue = "";
		var sKey;

		if (sKeyField === "" || sKeyField == null) {
			// handling of "(none)" value
			sKeyField = null;
			sKey = oConditionGrid.data("_key");
			delete this._oConditionsMap[sKey];

			this._enableCondition(oConditionGrid, false);

			oSelectCheckbox.setSelected(false);
			oSelectCheckbox.setEnabled(false);

			this._bIgnoreSetConditions = true;
			this.fireDataChange({
				key: sKey,
				index: oConditionGrid.getParent().getContent().indexOf(oConditionGrid),
				operation: "remove",
				newData: null
			});
			this._bIgnoreSetConditions = false;
			return;
		}

		this._enableCondition(oConditionGrid, true);

		sValue = this._getFormatedConditionText(sOperation, sValue1, sValue2, bExclude, sKeyField, bShowIfGrouped);

		var oConditionData = {
			"value": sValue,
			"exclude": bExclude,
			"operation": sOperation,
			"keyField": sKeyField,
			"value1": oValue1,
			"value2": oValue2,
			"showIfGrouped": bShowIfGrouped
		};
		sKey = oConditionGrid.data("_key");

		if (sValue !== "") {
			var sOperation = "update";
			if (!this._oConditionsMap[sKey]) {
				sOperation = "add";
			}
			this._oConditionsMap[sKey] = oConditionData;

			oSelectCheckbox.setSelected(true);
			oSelectCheckbox.setEnabled(true);

			this.fireDataChange({
				key: sKey,
				index: oConditionGrid.getParent().getContent().indexOf(oConditionGrid),
				operation: sOperation,
				newData: oConditionData
			});
		} else {
			delete this._oConditionsMap[sKey];

			oSelectCheckbox.setSelected(false);
			oSelectCheckbox.setEnabled(false);

			this._bIgnoreSetConditions = true;
			this.fireDataChange({
				key: sKey,
				index: oConditionGrid.getParent().getContent().indexOf(oConditionGrid),
				operation: "remove",
				newData: null
			});
			this._bIgnoreSetConditions = false;
		}

	};

	P13nConditionPanel.prototype._enableConditions = function() {
		var aConditionGrids = this._oConditionsGrid.getContent();
		aConditionGrids.forEach(function(oConditionGrid) {
			var oKeyField = this._getCurrentKeyField(oConditionGrid.keyField);
			var sKeyField = oKeyField && oKeyField.key !== undefined ? oKeyField.key : oKeyField;
			var bEnabled = sKeyField !== "" && sKeyField !== null;
			this._enableCondition(oConditionGrid, bEnabled);
		}, this);
	};

	P13nConditionPanel.prototype._enableCondition = function(oConditionGrid, bEnable) {
		oConditionGrid.operation.setEnabled(bEnable);
		oConditionGrid.value1.setEnabled(bEnable);
		oConditionGrid.value2.setEnabled(bEnable);
		oConditionGrid.showIfGrouped.setEnabled(bEnable);
	};

	/**
	 * press handler for the remove condition buttons
	 * 
	 * @private
	 * @param {grid}
	 *            oTargetGrid the main grid
	 * @param {grid}
	 *            oConditionGrid from where the remove is triggered
	 */
	P13nConditionPanel.prototype._removeCondition = function(oTargetGrid, oConditionGrid) {
		if (oConditionGrid.getContent().length > 1) {
			var sKey = oConditionGrid.data("_key");
			var iIndex = oConditionGrid.getParent().getContent().indexOf(oConditionGrid);
			delete this._oConditionsMap[sKey];
			oConditionGrid.destroy();

			if (oTargetGrid.getContent().length < 1) {
				this._createConditionRow(oTargetGrid);
			} else {
				this._updateConditionButtons(oTargetGrid);
			}

			this.fireDataChange({
				key: sKey,
				index: iIndex,
				operation: "remove",
				newData: null
			});

		}
	};

	/**
	 * update the condition add/remove buttons visibility
	 * 
	 * @private
	 */
	P13nConditionPanel.prototype._updateConditionButtons = function(oTargetGrid) {
		var iMaxConditions = this._getMaxConditionsAsNumber();
		var n = oTargetGrid.getContent().length;

		// if (n >= this._aKeyFields.length-1 && this.getAutoReduceKeyFieldItems()) {
		// // if the number of condition_rows-1 is the same as the KeyFields we hide the Add icon on all
		// condition rows.
		// iMax = 0;
		// }

		for (var i = 0; i < n; i++) {
			var oAddBtn = oTargetGrid.getContent()[i].add;
			if ((this.getAlwaysShowAddIcon() && (n < iMaxConditions)) || (i === n - 1 && i < iMaxConditions - 1)) {
				// show the Add only for the last condition row and if the Max value is not reached
				oAddBtn.removeStyleClass("displayNone");
			} else {
				oAddBtn.addStyleClass("displayNone");
			}

			var oRemoveBtn = oTargetGrid.getContent()[i].remove;
			if (iMaxConditions === 1 || (i === 0 && n === 1 && this.getDisableFirstRemoveIcon())) {
				oRemoveBtn.addStyleClass("displayNone");
			} else {
				oRemoveBtn.removeStyleClass("displayNone");
			}
		}
	};

	/**
	 * check if the entered/modified conditions are correct, marks invalid fields yellow (Warning state)
	 * and opens a popup message dialog to give the user the feedback that some values are wrong or
	 * missing.
	 * 
	 * @private
	 * @param {function}
	 *            fnCallback which we call when all conditions are valid or the user ignores the
	 *            wrong/missing fields by pressing Yes on a message dialog.
	 */
	P13nConditionPanel.prototype.validateConditions = function() {
		var that = this;

		var fnCheckConditions = function(aGrids) {
			var bValid = true;
			for (var i = 0; i < aGrids.length; i++) {
				var oGrid = aGrids[i];
				var bIsValid = that._checkCondition(oGrid, i === aGrids.length - 1);
				bValid = bValid && bIsValid;
			}

			return bValid;
		};

		return fnCheckConditions(this._oConditionsGrid.getContent());
	};

	/**
	 * removes all errors/warning states from the value1/2 fields of all conditions.
	 * 
	 * @public
	 */
	P13nConditionPanel.prototype.removeValidationErrors = function() {
		this._oConditionsGrid.getContent().forEach(function(oConditionGrid) {
			var oValue1 = oConditionGrid.value1;
			var oValue2 = oConditionGrid.value2;
			oValue1.setValueState(sap.ui.core.ValueState.None);
			oValue2.setValueState(sap.ui.core.ValueState.None);
		}, this);
	};

	/**
	 * removes all invalid conditions.
	 * 
	 * @public
	 */
	P13nConditionPanel.prototype.removeInvalidConditions = function() {
		var aInvalidConditionGrids = [];
		this._oConditionsGrid.getContent().forEach(function(oConditionGrid) {
			if (oConditionGrid.value1.getValueState() !== sap.ui.core.ValueState.None || oConditionGrid.value2.getValueState() !== sap.ui.core.ValueState.None) {
				aInvalidConditionGrids.push(oConditionGrid);
			}
		}, this);

		aInvalidConditionGrids.forEach(function(oConditionGrid) {
			this._removeCondition(this._oConditionsGrid, oConditionGrid);

			if (this.getAutoReduceKeyFieldItems()) {
				this._updateKeyFieldItems(this._oConditionsGrid, false);
			}
		}, this);
	};

	/**
	 * checks on a single condition if the values are filled correct and set the Status of invalid
	 * fields to Warning. the condition is invalide, when e.g. in the BT condition one or both of the
	 * values is/are empty of for other condition operations the vlaue1 field is not filled.
	 * 
	 * @private
	 * @param {Grid}
	 *            oConditionGrid which contains the fields of a single condition
	 * @param {boolean}
	 *            isLast indicated if this is the last condition in the group
	 * @returns {boolean} true, when the condition is filled correct, else false.
	 */
	P13nConditionPanel.prototype._checkCondition = function(oConditionGrid, isLast) {
		var bValid = true;
		var value1 = oConditionGrid.value1;
		var value2 = oConditionGrid.value2;

		var bValue1Empty = value1 && (value1.getVisible() && !value1.getValue());
		var bValue2Empty = value2 && (value2.getVisible() && !value2.getValue());

		var sOperation = oConditionGrid.operation.getSelectedKey();

		if (sOperation === sap.m.P13nConditionOperation.BT) {
			if (!bValue1Empty ? bValue2Empty : !bValue2Empty) { // XOR
				if (bValue1Empty) {
					value1.setValueState(sap.ui.core.ValueState.Warning);
					value1.setValueStateText(this._sValidationDialogFieldMessage);
				}

				if (bValue2Empty) {
					value2.setValueState(sap.ui.core.ValueState.Warning);
					value2.setValueStateText(this._sValidationDialogFieldMessage);
				}

				bValid = false;
			} else {
				value1.setValueState(sap.ui.core.ValueState.None);
				value2.setValueState(sap.ui.core.ValueState.None);
			}
		}

		if (!isLast) {
			var fnFormatFieldValue = function(oCtrl) {
				var oConditionGrid = oCtrl.getParent();
				var sValue = oCtrl.getValue();

				if (this.getDisplayFormat() === "UpperCase" && sValue) {
					sValue = sValue.toUpperCase();
					oCtrl.setValue(sValue);
				}

				if (oConditionGrid.oFormatter && sValue) {
					var oValue = oConditionGrid.oFormatter.parse(sValue);
					if (!isNaN(oValue) && oValue !== null) {
						sValue = oConditionGrid.oFormatter.format(oValue);
						oCtrl.setValue(sValue);
						oCtrl.setValueState(sap.ui.core.ValueState.None);
					} else {
						oCtrl.setValueState(sap.ui.core.ValueState.Warning);
						oCtrl.setValueStateText(this._sValidationDialogFieldMessage);
					}
				}
			};

			jQuery.proxy(fnFormatFieldValue, this)(value1);
			jQuery.proxy(fnFormatFieldValue, this)(value2);

			if ((value1.getVisible() && value1.getValueState() !== sap.ui.core.ValueState.None) || (value2.getVisible() && value2.getValueState() !== sap.ui.core.ValueState.None)) {
				bValid = false;
			}
		}

		return bValid;
	};

	/**
	 * creates and returns the text for a condition
	 * 
	 * @private
	 * @param {string}
	 *            sOperation the operation type sap.m.P13nConditionOperation
	 * @param {string}
	 *            sValue1 text of the first condition field
	 * @param {string}
	 *            sValue2 text of the seoncd condition field
	 * @param {boolean}
	 *            bExclude indicates if the condition is a Exclude condition
	 * @param {string}
	 *            sKeyField id
	 * @returns {string} the condition text
	 */
	P13nConditionPanel.prototype._getFormatedConditionText = function(sOperation, sValue1, sValue2, bExclude, sKeyField, bShowIfGrouped) {
		var sConditionText = "";

		var sKeyFieldText = null;
		if (this._aKeyFields && this._aKeyFields.length > 1) {
			// search the text for the KeyField
			for (var i = 0; i < this._aKeyFields.length; i++) {
				var oKeyField = this._aKeyFields[i];
				if (typeof oKeyField !== "string") {
					if (oKeyField.key === sKeyField && oKeyField.text) {
						sKeyFieldText = oKeyField.text;
					}
				}
			}
		}

		if (sValue1 !== "" && sValue1 !== undefined) {
			switch (sOperation) {
				case sap.m.P13nConditionOperation.EQ:
					sConditionText = "=" + sValue1;
					break;
				case sap.m.P13nConditionOperation.GT:
					sConditionText = ">" + sValue1;
					break;
				case sap.m.P13nConditionOperation.GE:
					sConditionText = ">=" + sValue1;
					break;

				case sap.m.P13nConditionOperation.LT:
					sConditionText = "<" + sValue1;
					break;

				case sap.m.P13nConditionOperation.LE:
					sConditionText = "<=" + sValue1;
					break;

				case sap.m.P13nConditionOperation.Contains:
					sConditionText = "*" + sValue1 + "*";
					break;

				case sap.m.P13nConditionOperation.StartsWith:
					sConditionText = sValue1 + "*";
					break;

				case sap.m.P13nConditionOperation.EndsWith:
					sConditionText = "*" + sValue1;
					break;

				case sap.m.P13nConditionOperation.BT:
					if (sValue2 !== "") {
						sConditionText = sValue1 + "..." + sValue2;
						break;
					}
			}
		} else {
			switch (sOperation) {
				case sap.m.P13nConditionOperation.Initial:
					sConditionText = "=''";
					break;

				case sap.m.P13nConditionOperation.Ascending:
					sConditionText = "ascending";
					break;
				case sap.m.P13nConditionOperation.GroupAscending:
					sConditionText = "ascending";
					sConditionText += " showIfGrouped:" + bShowIfGrouped;
					break;

				case sap.m.P13nConditionOperation.Descending:
					sConditionText = "descending";
					break;
				case sap.m.P13nConditionOperation.GroupDescending:
					sConditionText = "descending";
					sConditionText += " showIfGrouped:" + bShowIfGrouped;
					break;

				case sap.m.P13nConditionOperation.Total:
					sConditionText = "total";
					break;

				case sap.m.P13nConditionOperation.Average:
					sConditionText = "average";
					break;

				case sap.m.P13nConditionOperation.Minimum:
					sConditionText = "minimum";
					break;

				case sap.m.P13nConditionOperation.Maximum:
					sConditionText = "maximum";
					break;
			}
		}

		if (bExclude && sConditionText !== "") {
			sConditionText = "!(" + sConditionText + ")";
		}

		if (sKeyFieldText && sConditionText !== "") {
			sConditionText = sKeyFieldText + ": " + sConditionText;
		}

		return sConditionText;
	};

	P13nConditionPanel.prototype._updateLayout = function(oRangeInfo) {
		if (!this._oConditionsGrid) {
			return;
		}

		// if (window.console) {
		// console.log(" ---> " + oRangeInfo.name);
		// }

		var aGrids = this._oConditionsGrid.getContent();
		var n = this._aConditionsFields.length;
		var newIndex = n;
		if (oRangeInfo.name === "Tablet") {
			newIndex = 5;
		}
		if (oRangeInfo.name === "Phone") {
			newIndex = 3;
		}

		for (var i = 0; i < aGrids.length; i++) {
			var grid = aGrids[i];
			grid.removeContent(grid.ButtonContainer);
			grid.insertContent(grid.ButtonContainer, newIndex);

			if (!this.getAlwaysShowAddIcon()) {
				if (newIndex !== n) {
					grid.ButtonContainer.removeContent(grid.add);
					grid.addContent(grid.add);
				} else {
					grid.removeContent(grid.add);
					grid.ButtonContainer.addContent(grid.add);
				}
			}
		}
	};

	P13nConditionPanel.prototype._onGridResize = function() {
		var domElement = this._oConditionsGrid.getDomRef();
		if (!domElement) {
			return;
		}
		if (!jQuery(domElement).is(":visible")) {
			return;
		}
		var w = domElement.clientWidth;

		var oRangeInfo = {};
		if (w <= this._iBreakPointTablet) {
			oRangeInfo.name = "Phone";
		} else if ((w > this._iBreakPointTablet) && (w <= this._iBreakPointDesktop)) {
			oRangeInfo.name = "Tablet";
		} else {
			oRangeInfo.name = "Desktop";
		}

		// if (window.console) {
		// console.log(w + " ---> " + oRangeInfo.name);
		// }

		if (oRangeInfo.name === "Phone" && this._sLayoutMode !== oRangeInfo.name) {
			this._updateLayout(oRangeInfo);
			this._sLayoutMode = oRangeInfo.name;
		}
		if (oRangeInfo.name === "Tablet" && this._sLayoutMode !== oRangeInfo.name) {
			this._updateLayout(oRangeInfo);
			this._sLayoutMode = oRangeInfo.name;
		}
		if (oRangeInfo.name === "Desktop" && this._sLayoutMode !== oRangeInfo.name) {
			this._updateLayout(oRangeInfo);
			this._sLayoutMode = oRangeInfo.name;
		}
	};

	sap.m.P13nConditionOperation = {
		// filter operations
		BT: "BT",
		EQ: "EQ",
		Contains: "Contains",
		StartsWith: "StartsWith",
		EndsWith: "EndsWith",
		LT: "LT",
		LE: "LE",
		GT: "GT",
		GE: "GE",
		Initial: "Initial",

		// sort operations
		Ascending: "Ascending",
		Descending: "Descending",

		// group operations
		GroupAscending: "GroupAscending",
		GroupDescending: "GroupDescending",

		// calculation operations
		Total: "Total",
		Average: "Average",
		Minimum: "Minimum",
		Maximum: "Maximum"
	};

	return P13nConditionPanel;

}, /* bExport= */true);
