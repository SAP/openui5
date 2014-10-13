/*!
 * ${copyright}
 */

// Provides control sap.m.P13nConditionPanel.
sap.ui.define(['jquery.sap.global', './P13nPanel', './library', 'sap/ui/core/Control', 'sap/ui/core/format/DateFormat', 'sap/ui/core/format/NumberFormat'],
	function(jQuery, P13nPanel, library, Control, DateFormat, NumberFormat) {
	"use strict";



/**
 * Constructor for a new P13nConditionPanel.
 *
 * @param {string} [sId] id for the new control, generated automatically if no id is given 
 * @param {object} [mSettings] initial settings for the new control
 *
 * @class
 * The ConditionPanel Control will be used to realize the Sorting, Filtering and Grouping panel of the new Personalization dialog.
 * @extends sap.m.P13nPanel
 * @version ${version}
 *
 * @constructor
 * @public
 * @experimental Since version 1.25. 
 * !!! THIS CONTROL IS ONLY FOR INTERNAL USE !!!
 * @name sap.m.P13nConditionPanel
 * @ui5-metamodel This control/element also will be described in the UI5 (legacy) designtime metamodel
 */
var P13nConditionPanel = P13nPanel.extend("sap.m.P13nConditionPanel", /** @lends sap.m.P13nConditionPanel.prototype */ { metadata : {

	library : "sap.m",
	properties : {

		/**
		 * defines the max number of conditions on the ConditionPanel
		 */
		maxConditions : {type : "string", group : "Misc", defaultValue : '-1'},

		/**
		 * exclude options for filter
		 */
		exclude : {type : "boolean", group : "Misc", defaultValue : false},

		/**
		 * defines if the mediaQuery or a ContainerResize will be used for layout update.
		 * When the ConditionPanel is used on a dialog the property should be set to true!
		 */
		containerQuery : {type : "boolean", group : "Misc", defaultValue : false},

		/**
		 * adds initial a new empty condition row
		 */
		autoAddNewRow : {type : "boolean", group : "Misc", defaultValue : false},

		/**
		 * makes the remove icon on the first condition row disabled when only one condition exist.
		 */
		disableFirstRemoveIcon : {type : "boolean", group : "Misc", defaultValue : false},

		/**
		 * makes the Add icon visible on each condition row. If is set to false the Add is only visible at the end and you casn only append a new condition.
		 */
		alwaysShowAddIcon : {type : "boolean", group : "Misc", defaultValue : true},

		/**
		 * new added condition use the settings from the previous condition as default.
		 */
		usePrevConditionSetting : {type : "boolean", group : "Misc", defaultValue : true},

		/**
		 * KeyField value can only be selected once. When you set the property to true the ConditionPanel will automatically offers on the KeyField drop down only the keyFields which are not used. The default behavior is that in each keyField dropdown all keyfields are listed.
		 */
		autoReduceKeyFieldItems : {type : "boolean", group : "Misc", defaultValue : false},

		/**
		 * can be used to control the layout behavior. Default is "" which will automatically change the layout. With "Desktop", "Table" or"Phone" you can set a fixed layout.
		 */
		layoutMode : {type : "string", group : "Misc", defaultValue : null},
		
		/**
		 * show additional labels in the condition
		 */
		showLabel : {type : "boolean", group : "Misc", defaultValue : false}
	},
	aggregations : {

		/**
		 * Content for the ConditionPanel. This property is not public!
		 */
		content : {type : "sap.ui.core.Control", multiple : true, singularName : "content", visibility : "hidden"}
	},
	events : {

		/**
		 * Workaround for updating the binding
		 */
		dataChange : {}
	}
}});


/**
 * This method allows you to specify the KeyFields for the conditions. You can set an array of object with Key and Text properties to define the keyfields.
 *
 * @name sap.m.P13nConditionPanel#setKeyFields
 * @function
 * @type void
 * @public
 * @ui5-metamodel This method also will be described in the UI5 (legacy) designtime metamodel
 */


/**
 * This method must be used to assign a list of conditions.
 *
 * @name sap.m.P13nConditionPanel#setConditions
 * @function
 * @param {object[]} aAConditions
 *         array of Conditions.
 * @type void
 * @public
 * @ui5-metamodel This method also will be described in the UI5 (legacy) designtime metamodel
 */


// EXC_ALL_CLOSURE_003
	/**
	 * sets the array of conditions. 
	 * 
	 * @param {array}
	 *            aConditions the complete list of conditions
	 */
	P13nConditionPanel.prototype.setConditions = function(aConditions) {
		if (this._bIgnoreSetConditions) {
			return;
		}
		
		this._oConditionsMap = {};
		this._iConditions = 0;
		
		this._oConditionsGrid.removeAllContent();
		this.iConditionCount = 0;
		
		for (var i = 0; i < aConditions.length; i++) {
			this.__addCondition(aConditions[i]);
		}
		
		this._fillConditions();
	};
	
	
	/**
	 * remove all conditions. 
	 * 
	 */
	P13nConditionPanel.prototype.removeAllConditions = function() {
		this._oConditionsMap = {};
		this._iConditions = 0;
		
		this._oConditionsGrid.removeAllContent();
		this.iConditionCount = 0;
	
		this._fillConditions();
	};
	
	
	/**
	 * add a single condition. 
	 * 
	 * @param {object}
	 *            oCondition the new condition of type  { "key": "007", "operation": sap.m.P13nConditionOperation.Ascending, "keyField": "keyFieldKey", "value1": "", "value2": ""};
	 */
	P13nConditionPanel.prototype.addCondition = function(oCondition) {
		oCondition.index = this._iConditions;
		
		this.__addCondition(oCondition);
	
		this._fillConditions();
	};
	
	P13nConditionPanel.prototype.insertCondition = function(oCondition, index) {
		if (index) {
			oCondition.index = index;
		}
		this.__addCondition(oCondition);
		this._fillConditions();
	};
	
	
	P13nConditionPanel.prototype.removeCondition = function(vCondition) {
		this._oConditionsGrid.removeAllContent();
		this.iConditionCount = 0;
		
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
	 *            oCondition the new condition of type  { "key": "007", "operation": sap.m.P13nConditionOperation.Ascending, "keyField": "keyFieldKey", "value1": "", "value2": ""};
	 */
	P13nConditionPanel.prototype.__addCondition = function(oCondition) {
		if (!oCondition.key) {
			oCondition.key = "condition_" + this._iConditions;
		}
		this._iConditions++;
		this._oConditionsMap[oCondition.key] = oCondition;
	};
	
	
	/**
	 * returns the array of conditions.
	 * 
	 * @public
	 * @returns {array}
	 *            array of Conditions 
	 */
	P13nConditionPanel.prototype.getConditions = function() {
		var oCondition;
		var aConditions = [];
		
		if (this._oConditionsMap) {
			for ( var conditionId in this._oConditionsMap) {
				oCondition = this._oConditionsMap[conditionId];
				var sValue = oCondition.value;
				if (!sValue) {
					sValue = this._getFormatedConditionText(oCondition.operation, oCondition.value1, oCondition.value2, oCondition.exclude, oCondition.keyField);
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
						"grouping": oCondition.grouping
					});
	
				}
			}
		}
	
		return aConditions;
	};
	
	
	/**
	 * setter for the supported operations array
	 * 
	 * @public
	 * @param {array}
	 *            aOperations array of operations [sap.m.P13nConditionOperation.BT, sap.m.P13nConditionOperation.EQ]
	 */
	P13nConditionPanel.prototype.setOperations = function(aOperation) {
		this._aOperations = aOperation;
		
		this._updateAllOperations();
	};
	
	
	P13nConditionPanel.prototype.addOperation = function(oOperation) {
		this._aOperations.push(oOperation);
	
		this._updateAllOperations();
	};
	
	
	P13nConditionPanel.prototype.removeAllOperations = function() {
		this._aOperations = [];
	
		this._updateAllOperations();
	};
	
	
	P13nConditionPanel.prototype.getOperations = function() {
		return this._aOperations;
	};
	
	
	/**
	 * setter for a KeyFields array
	 * 
	 * @public
	 * @param {array}
	 *            aKeyFields array of KeyFields [{key: "CompanyCode", text: "ID"}, {key:"CompanyName", text : "Name"}]
	 */
	P13nConditionPanel.prototype.setKeyFields = function(aKeyFields) {
		this._aKeyFields = aKeyFields;
		
		this._updateKeyFieldItems(this, this._oConditionsGrid, true);
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
	
		this._updateKeyFieldItems(this, this._oConditionsGrid, true);
		this._enableAllCondition();		
	};
	
	
	P13nConditionPanel.prototype.removeAllKeyFields = function() {
		this._aKeyFields = [];
	
		this._updateKeyFieldItems(this, this._oConditionsGrid, true);
	};
	
	
	/**
	 * getter for KeyFields array
	 * 
	 * @public
	 * @returns {array}
	 *            array of KeyFields [{key: "CompanyCode", text: "ID"}, {key:"CompanyName", text : "Name"}]
	 */
	P13nConditionPanel.prototype.getKeyFields = function() {
		return this._aKeyFields;
	};
	
	
	
	/**
	 * sets the LayoutMode.
	 * 
	 * @public
	 * @param {string}
	 *            sMode define the layout mode for the condition row.
	 */
	P13nConditionPanel.prototype.setLayoutMode = function(sMode) {
		this.setProperty("layoutMode", sMode);
	
		if (this._oConditionsGrid) {
			this._oConditionsGrid.toggleStyleClass("conditionRootGrid", sMode !== "Desktop");
		}
		
		if (this._aConditionsFields) {
			var bDesktop = sMode === "Desktop";
			if (bDesktop) {
				this._aConditionsFields[1].Span = "L3 M3 S3"; // : "L3 M5 S10";
				this._aConditionsFields[2].Span = "L2 M2 S2"; // : "L2 M5 S10";
				this._aConditionsFields[3].Span = "L3 M3 S3"; // : "L3 M10 S10";
				this._aConditionsFields[4].Span = "L2 M2 S2"; // : "L3 M10 S10";
				this._aConditionsFields[5].Span = "L1 M1 S1"; // : "L1 M10 S10";
			}
		}
	
		// we have to refill the content grids
		this._oConditionsGrid.removeAllContent();
		this.iConditionCount = 0;
		this._fillConditions();
		
		return this;
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
		this._sGroupingLabelText = this._oRb.getText("CONDITIONPANEL_LABELGROUPING");
		this._sValidationDialogFieldMessage = this._oRb.getText("CONDITIONPANEL_FIELDMESSAGE");
	
		this._aKeyFields = [];
		this._aOperations = [];
		this._oConditionsMap = {};
		this._iConditions = 0;
		this.iConditionCount = 0;
		this._sLayoutMode = "Desktop";
		
		this._iBreakPointTablet = sap.ui.Device.media._predefinedRangeSets[sap.ui.Device.media.RANGESETS.SAP_STANDARD].points[0];
		this._iBreakPointDesktop = sap.ui.Device.media._predefinedRangeSets[sap.ui.Device.media.RANGESETS.SAP_STANDARD].points[1];
		
		// create the main grid and add it into the hidden content aggregation
		this._oConditionsGrid = new sap.ui.layout.Grid({
			width: "100%",
			defaultSpan: "L12 M12 S12",
			hSpacing: 0,
			vSpacing: 0
		}).toggleStyleClass("conditionRootGrid", this.getLayoutMode() !== "Desktop");
	
		this.addAggregation("content", this._oConditionsGrid);
		
		
		this._aConditionsFields = [ {
			"ID": "select",
			"Label": "",
			"Span": "L1 M1 S1",
			"Control": "CheckBox",
			"Value": ""
		}, {
			"ID": "keyFieldLabel",
			"Text": "Column",
			"Span": this.getLayoutMode() === "Desktop" ? "L1 M1 S1" : "L1 M1 S10",
			"Control": "Label"
		}, {
			"ID": "keyField",
			"Label": "",
			"Span": this.getLayoutMode() === "Desktop" ? "L3 M3 S3" : "L3 M5 S10",
			"Control": "ComboBox",
			"SelectedKey": "0"
		}, {
			"ID": "operationLabel",
			"Text": "Operation",
			"Span": this.getLayoutMode() === "Desktop" ? "L1 M1 S1" : "L1 M1 S10",
			"Control": "Label"
		}, {
			"ID": "operation",
			"Label": "",
			"Span": this.getLayoutMode() === "Desktop" ? "L2 M2 S2" : "L2 M5 S10",
			"Control": "ComboBox",
			"SelectedKey": "0"
		}, {
			"ID": "value1",
			"Label": this._sFromLabelText,
			"Span": this.getLayoutMode() === "Desktop" ? "L3 M3 S3" : "L3 M10 S10",
			"Control": "TextField",
			"Value": ""
		}, {
			"ID": "value2",
			"Label": this._sToLabelText,
			"Span": this.getLayoutMode() === "Desktop" ? "L2 M2 S2" : "L2 M10 S10",
			"Control": "TextField",
			"Value": ""
		}, {
			"ID": "grouping",
			"Label": this._sGroupingLabelText,
			"Span": this.getLayoutMode() === "Desktop" ? "L1 M1 S1" : "L1 M10 S10",
			"Control": "CheckBox",
			"Value": "false"
		} ];
	
		
		// fill/update the content "oConditionGrid"s 
		this._fillConditions();
	};
	
	
	P13nConditionPanel.prototype.exit = function() {
	
		if (this._sContainerResizeListener) {
			sap.ui.core.ResizeHandler.deregister(this._sContainerResizeListener);
			this._sContainerResizeListener = null;
		}
	
		sap.ui.Device.media.detachHandler(this._handleMediaChange, this, sap.ui.Device.media.RANGESETS.SAP_STANDARD);
	
		var destroyHelper = function(obj) {
			if (obj && obj.destroy) {
				obj.destroy();
			}
			return null;
		};
		
		this._aConditionsFields = destroyHelper(this._aConditionsFields);
		
		this._aKeys = destroyHelper(this._aKeys);
		this._aKeyFields = destroyHelper(this._aKeyFields);
		this._aOperations = destroyHelper(this._aOperations);
		
		this._oRb = destroyHelper(this._oRb);
		
		this._sBetweenOperation = destroyHelper(this._sBetweenOperation);
		this._sInitialOperation = destroyHelper(this._sInitialOperation);
		this._sFromLabelText = destroyHelper(this._sFromLabelText);
		this._sToLabelText = destroyHelper(this._sToLabelText);
		this._sValueLabelText = destroyHelper(this._sValueLabelText);
		this._sValidationDialogFieldMessage = destroyHelper(this._sValidationDialogFieldMessage);
		
		this._oConditionsMap = destroyHelper(this._oConditionsMap);
	};
	
	
	P13nConditionPanel.prototype._fillConditions = function() {
		var i = 0;
		var conditionData;
		var iMaxConditions = this.getMaxConditions() === "-1" ? 1000 : parseInt(this.getMaxConditions(), 10);
	
		// init existing conditions
		if (this._oConditionsMap) {
			for (var conditionId in this._oConditionsMap) {
				conditionData = this._oConditionsMap[conditionId];
				if (i < iMaxConditions) {
					this._addCondition(this, this._oConditionsGrid, conditionData, conditionId);
				}
				i++;
			}
		}
	
		// create empty Conditions row/fields
		if ((this.getAutoAddNewRow() || this._oConditionsGrid.getContent().length === 0) && this._oConditionsGrid.getContent().length < iMaxConditions) {
			this._addCondition(this, this._oConditionsGrid);
		}
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
	  
	P13nConditionPanel.prototype._handleMediaChange = function(p) {
		this._sLayoutMode = p.name;
	
	//	if (window.console) {
	//		console.log(" ---> MediaChange " + p.name);
	//	}
	
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
	 * @param {object}
	 *            oThat is the P13nConditionPanel
	 * @param {grid}
	 *            oTargetGrid the main grid in which the new condition grid will be added
	 * @param {object}
	 *            oConditionGridData the condition data for the new added condition grid controls
	 * @param {string}
	 *            sKey the key for the new added condition grid
	 * @param {integer}
	 *            iPos the index of the new condition in the targetGrid
	 */
	P13nConditionPanel.prototype._addCondition = function(oThat, oTargetGrid, oConditionGridData, sKey, iPos) {
		var oButtonContainer = null;
		var oGrid;
		
		if (!iPos) {
			iPos = oTargetGrid.getContent().length;
		}
		
		if (!sKey) {
			sKey = "condition_" + (this.iConditionCount);
		}
		this.iConditionCount++;
	
	
		var oConditionGrid = new sap.ui.layout.Grid({
			width: "100%",
			defaultSpan: "L12 M12 S12",
			hSpacing: 1,
			vSpacing: 0,
			containerQuery: true
		}).data("_key", sKey);
	
		for ( var iField in oThat._aConditionsFields) {
			var oControl;
			var field = oThat._aConditionsFields[iField];
	
			switch (field["Control"]) {
				case "CheckBox":
					// the CheckBox is not visible and only used internal to validate if a condition is filled correct.
					oControl = new sap.m.CheckBox({
						enabled: false,
						visible: false,
						layoutData: new sap.ui.layout.GridData({
							span: field["Span"]
						})
					});
	
					if (field["ID"] === "grouping") {
						oControl.setEnabled(true);
						oControl.setText(field["Label"]);
						oControl.getLayoutData().setVisibleOnLarge(false);
						oControl.getLayoutData().setVisibleOnMedium(false);
						oControl.getLayoutData().setVisibleOnSmall(false);
						
						if (typeof oConditionGridData !== "undefined") {
							oControl.setSelected(oConditionGridData.grouping);
						} else {
							if (oThat.getUsePrevConditionSetting()) {
								// select the value from the condition above
								if (iPos > 0) {
									oGrid = oTargetGrid.getContent()[iPos - 1];
									oControl.setSelected(oGrid.grouping.getSelected());
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
					var i;
					
					oControl = new sap.m.Select({
						selectedKey: field["SelectedKey"],
						// autoAdjustWidth: true,
						width: "100%",
						layoutData: new sap.ui.layout.GridData({
							span: field["Span"]
						})
					});
	
					if (field["ID"] === "keyField") {
						oThat._fillKeyFieldListItems(oControl, oThat._aKeyFields);
					
						oControl.attachChange(function() {
							oThat._triggerChangeKeyfield(oThat, oTargetGrid, oConditionGrid);
						});
						
						if (typeof oConditionGridData !== "undefined") {
							for (i = 0; i < oThat._aKeyFields.length; i++) {
								var key = oThat._aKeyFields[i].key;
								if (key === undefined) {
									key = oThat._aKeyFields[i];
								}
								if (oConditionGridData.keyField === key) {
									oControl.setSelectedIndex(i);
								}
							}
						}  else {
							if (oThat.getUsePrevConditionSetting() && !oThat.getAutoReduceKeyFieldItems()) {
								// select the key from the condition above
								if (iPos > 0) {
									oGrid = oTargetGrid.getContent()[iPos - 1];
									oControl.setSelectedKey(oGrid.keyField.getSelectedKey());
								} else {
									oControl.setSelectedIndex(0);
								}
							}
						}
					}
	
					if (field["ID"] === "operation") {
	
						var getOperations = function() {
							var oKeyField = oThat._getCurrentKeyField(oConditionGrid.keyField);
					
							var aOperations = oThat._aOperations;
							if (oKeyField && oKeyField.operations) {
								aOperations = oKeyField.operations;
							}
							return aOperations;
						};
				
						oThat._fillOperationItems(oControl, getOperations());
						
						oControl.attachChange(function() {
							oThat._triggerChangeOperations(oThat, oTargetGrid, oConditionGrid);
						});
						if (typeof oConditionGridData !== "undefined") {
							var aOperations = oThat._aOperations;
							for (i = 0; i < aOperations.length; i++) {
								if (oConditionGridData.operation === aOperations[i]) {
									oControl.setSelectedIndex(i);
								}
							}
						} else {
							if (oThat.getUsePrevConditionSetting()) {
								// select the key from the condition above
								if (iPos > 0) {
									var oGrid = oTargetGrid.getContent()[iPos - 1];
									oControl.setSelectedKey(oGrid.operation.getSelectedKey());
								} else {
									oControl.setSelectedIndex(0);
								}
							}
						}
					}
	
					break;
	
				case "TextField":
					var oCurrentKeyField = this._getCurrentKeyField(oConditionGrid.keyField);
					var sCtrlType = this._getCurrentKeyFieldType(oConditionGrid.keyField);
					oControl = this._createField(sCtrlType, field, oThat, oConditionGrid);
					if (oCurrentKeyField && oCurrentKeyField.maxlength) {
						oControl.setMaxLength(parseInt(oCurrentKeyField.maxlength, 10));
					}
					oControl.oTargetGrid = oTargetGrid;
	
					if (typeof oConditionGridData !== "undefined") {
						if (typeof oConditionGridData[field["ID"]] !== "undefined") {
							var oValue = oConditionGridData[field["ID"]];
							var sValue = oConditionGrid.oFormatter && oValue ? oConditionGrid.oFormatter.format(oValue) : oValue;
							oControl.setValue(sValue);
						}
					}
					break;
					
				case "Label":
					oControl = new sap.m.Label({
									text:  field["Text"] + ":",
									visible: this.getShowLabel(),
									layoutData: new sap.ui.layout.GridData({
										span: field["Span"]
									})
								});

					oControl.oTargetGrid = oTargetGrid;
					break;					
			}
			
			oControl.gridId = field["ID"];
			oConditionGrid[field["ID"]] = oControl;
	
			oConditionGrid.addContent(oControl);
		}
	
	
	
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
				oThat._triggerRemoveCondition(oThat, this.oTargetGrid, oConditionGrid);
			},
			layoutData: new sap.ui.layout.GridData({
				span: this.getLayoutMode() === "Desktop" ? "L1 M1 S1" : "L1 M2 S2"
			})
		});
	
		oRemoveControl.oTargetGrid = oTargetGrid;
		oRemoveControl.gridId = "remove";
		
		oButtonContainer.addContent(oRemoveControl);
		oConditionGrid["remove"] = oRemoveControl;
	
	
		// create "Add button"
		var oAddControl = new sap.m.Button({
			type: sap.m.ButtonType.Transparent,
			icon: sap.ui.core.IconPool.getIconURI("add"),
			tooltip: this._oRb.getText("CONDITIONPANEL_ADD_TOOLTIP"),
			press: function() {
				oThat._triggerAddCondition(oThat, this.oTargetGrid, oConditionGrid);
			},
			layoutData: new sap.ui.layout.GridData({
				span: this.getLayoutMode() === "Desktop" ? "L1 M1 S1" : "L1 M10 S10"
			})
		});
	
		oAddControl.oTargetGrid = oTargetGrid;
		oAddControl.addStyleClass("conditionAddBtnFloatRight");
		oAddControl.gridId = "add";
	
		oButtonContainer.addContent(oAddControl);
		oConditionGrid["add"] = oAddControl;
		
		// Add the new create condition
		oTargetGrid.insertContent(oConditionGrid, iPos);
	
		// update Operations for all conditions
		oThat._changeOperations(oThat, oTargetGrid, oConditionGrid);
		
		// disable fields if the selectedKeyField value is none
		var oKeyField = oThat._getCurrentKeyField(oConditionGrid.keyField);
		var sKeyField = oKeyField && oKeyField.key !== undefined ? oKeyField.key : oKeyField;
		oThat._enableCondition(oThat, oConditionGrid, !(sKeyField == "" || sKeyField == null));
	
		// update the add/remove buttons visibility
		this._updateConditionButtons(oTargetGrid);
	
		if (oThat.getAutoReduceKeyFieldItems()) {
			oThat._updateKeyFieldItems(oThat, oTargetGrid, false);
		}
	
		if (this._sLayoutMode) { this._updateLayout( { name : this._sLayoutMode } ); }
	
		if (typeof oConditionGridData !== "undefined") {
			var sConditionText = oThat._getFormatedConditionText(oConditionGridData.operation, oConditionGridData.value1, oConditionGridData.value2, oConditionGridData.exclude, oConditionGridData.keyField);
	
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
	 * @param {object}
	 *            oThat is the P13nConditionPanel
	 * @param {grid}
	 *            oTargetGrid the main grid 
	 * @param {grid}
	 *            oConditionGrid from where the Remove is triggered
	 */
	P13nConditionPanel.prototype._triggerRemoveCondition = function(oThat, oTargetGrid, oConditionGrid) {
		// search index of the condition grid to set the focus later to the previous condition
		var idx = oTargetGrid.getContent().indexOf(oConditionGrid);
		
		oThat._removeCondition(oThat, oTargetGrid, oConditionGrid);
	
		if (oThat.getAutoReduceKeyFieldItems()) {
			oThat._updateKeyFieldItems(oThat, oTargetGrid, false);
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
	 * @param {object}
	 *            oThat is the P13nConditionPanel
	 * @param {grid}
	 *            oTargetGrid the main grid 
	 * @param {grid}
	 *            oSourceConditionGrid from where the Add is triggered
	 */
	P13nConditionPanel.prototype._triggerAddCondition = function(oThat, oTargetGrid, oSourceConditionGrid) {
		var iPos = oTargetGrid.getContent().indexOf(oSourceConditionGrid);
		var oConditionGrid = oThat._addCondition(oThat, oTargetGrid, undefined, null, iPos + 1);
		oThat._changeField(oThat, oConditionGrid);
		
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
	
	
	P13nConditionPanel.prototype._getCurrentKeyFieldType = function(oKeyFieldCtrl) {
		var sCtrlType = "";
		var oCurrentKeyField = this._getCurrentKeyField(oKeyFieldCtrl);
		if (oCurrentKeyField && oCurrentKeyField.type) {
			sCtrlType = oCurrentKeyField.type;
		}
		return sCtrlType;
	};
	
	
	P13nConditionPanel.prototype._createField = function(sCtrlType, oFieldInfo, oThat, oConditionGrid) {
		var oControl;
		var params = {
			value: oFieldInfo["Value"],
			width: "100%",
			placeholder: oFieldInfo["Label"],
			change: function() {
				oThat._changeField(oThat, oConditionGrid);
			},
			layoutData: new sap.ui.layout.GridData({
				span: oFieldInfo["Span"]
			})
		};
		
		switch (sCtrlType) {
			case "numeric":
				oConditionGrid.oFormatter = NumberFormat.getFloatInstance();
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
	P13nConditionPanel.prototype._fillOperationItems = function(oSelect, aOperations) {
		oSelect.removeAllItems();
		for ( var iOperation in aOperations) {
			var sText = this._oRb.getText("CONDITIONPANEL_OPTION" + aOperations[iOperation]);
			if (!sText) {
				sText = aOperations[iOperation];
			}
			oSelect.addItem(new sap.ui.core.ListItem({
				text: sText,
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
			oSelect.addItem(new sap.ui.core.ListItem({
				text: aItems[iItem].text,
				key: aItems[iItem].key
			}));
		}
	};
	
	/**
	 * change handler for the Operation field
	 * 
	 * @private
	 * @param {object}
	 *            oThat is the P13nConditionPanel
	 * @param {grid}
	 *            oTargetGrid the main grid 
	 * @param {grid}
	 *            oConditionGrid Grid which contains the Operation control which has been changed
	 */
	P13nConditionPanel.prototype._triggerChangeOperations = function(oThat, oTargetGrid, oConditionGrid) {
		oThat._changeOperations(oThat, oTargetGrid, oConditionGrid);
		oThat._changeField(oThat, oConditionGrid);
	};
	
	/**
	 * change handler for the KeyField field
	 * 
	 * @private
	 * @param {object}
	 *            oThat is the P13nConditionPanel
	 * @param {grid}
	 *            oTargetGrid the main grid 
	 * @param {grid}
	 *            oConditionGrid Grid which contains the KeyField control which has been changed
	 */
	P13nConditionPanel.prototype._triggerChangeKeyfield = function(oThat, oTargetGrid, oConditionGrid) {
	
		oThat._updateOperations(oThat, oTargetGrid, oConditionGrid);
		
		// update the value fields for the KeyField
		var oCurrentKeyField = this._getCurrentKeyField(oConditionGrid.keyField);
		var sCtrlType = this._getCurrentKeyFieldType(oConditionGrid.keyField);
	
		// update Value1 field control
		var sOldValue1 = oConditionGrid.value1.getValue();
		oConditionGrid.removeContent(oConditionGrid.value1);
		delete oConditionGrid.value1;
		var fieldInfo = oThat._aConditionsFields[5];
		var oNewValue1 = this._createField(sCtrlType, fieldInfo, oThat, oConditionGrid);
		if (oCurrentKeyField && oCurrentKeyField.maxlength) {
			oNewValue1.setMaxLength(parseInt(oCurrentKeyField.maxlength, 10));
		}
		oNewValue1.setValue(sOldValue1);
		oNewValue1.gridId = fieldInfo["ID"];
		oConditionGrid[fieldInfo["ID"]] = oNewValue1;
		oConditionGrid.insertContent(oNewValue1, 5);
		
		
		// update Value2 field control
		var sOldValue2 = oConditionGrid.value2.getValue();
		oConditionGrid.removeContent(oConditionGrid.value2);
		delete oConditionGrid.value2;
		var fieldInfo = oThat._aConditionsFields[6];
		var oNewValue2 = this._createField(sCtrlType, fieldInfo, oThat, oConditionGrid);
		if (oCurrentKeyField && oCurrentKeyField.maxlength) {
			oNewValue2.setMaxLength(parseInt(oCurrentKeyField.maxlength, 10));
		}
		oNewValue2.setValue(sOldValue2);
		oNewValue2.gridId = fieldInfo["ID"];
		oConditionGrid[fieldInfo["ID"]] = oNewValue2;
		oConditionGrid.insertContent(oNewValue2, 6);
	
		oThat._changeOperations(oThat, oTargetGrid, oConditionGrid);
	
	
		oThat._changeField(oThat, oConditionGrid);
		
		if (oThat.getAutoReduceKeyFieldItems()) {
			oThat._updateKeyFieldItems(oThat, oTargetGrid, false);
		}
	};
	
	
	P13nConditionPanel.prototype._updateAllOperations = function() {
		var aConditionGrids = this._oConditionsGrid.getContent();
		aConditionGrids.forEach(function(oConditionGrid) {
			this._updateOperations(this, this._oConditionsGrid, oConditionGrid);
			this._changeOperations(this, this._oConditionsGrid, oConditionGrid);
		}, this);
	};
	
	P13nConditionPanel.prototype._updateOperations = function(oThat, oTargetGrid, oConditionGrid) {
		// update the operations for the Keyfield
		var getOperations = function() {
			var oKeyField = oThat._getCurrentKeyField(oConditionGrid.keyField);
	
			var aOperations = oThat._aOperations;
			if (oKeyField && oKeyField.operations) {
				aOperations = oKeyField.operations;
			}
			return aOperations;
		};
		
		
		var sOldSelectedOperationKey = oConditionGrid.operation.getSelectedKey();
		oThat._fillOperationItems(oConditionGrid.operation, getOperations());
		oConditionGrid.operation.setSelectedKey(sOldSelectedOperationKey);
	};
	
	
	/**
	 * update the Items from all KeyFields 
	 * 
	 * @private
	 * @param {object}
	 *            oThat is the P13nConditionPanel
	 * @param {grid}
	 *            oTargetGrid the main grid 
	 * @param {boolean}
	 *            bFillAll fills all KeyFields or only the none used
	 */
	P13nConditionPanel.prototype._updateKeyFieldItems = function(oThat, oTargetGrid, bFillAll) {
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
	
		for (i = 0; i < n; i++) {
			var oKeyField = oTargetGrid.getContent()[i].keyField;
			
			// remember the old KeyField
			var sOldKey = oKeyField.getSelectedKey();
					
			// clean the items
			oKeyField.removeAllItems();
			
			// fill all or only the not used items 
			var aItems = oThat._aKeyFields;
			for ( var iItem in aItems) {
				var oItem = aItems[iItem];
				if (oItem.key == null || oItem.key === "" || !oUsedItems[oItem.key] || oItem.key === sOldKey) {
					oKeyField.addItem(new sap.ui.core.ListItem({
						text: oItem.text,
						key: oItem.key
					}));
				}
			}
			
			oKeyField.setSelectedKey(sOldKey);
		}
	};
	
	/**
	 * called when the user makes a change on the condition operation. The function will update the fields in the condition grid.
	 * 
	 * @private
	 * @param {object}
	 *            oThat is the P13nConditionPanel
	 * @param {grid}
	 *            oTargetGrid the main grid 
	 * @param {grid}
	 *            oConditionGrid Grid which contains the Operation control which has been changed
	 */
	P13nConditionPanel.prototype._changeOperations = function(oThat, oTargetGrid, oConditionGrid) {
		var oKeyfield = oConditionGrid.keyField;
		var oOperation = oConditionGrid.operation;
		var sOperation = oOperation.getSelectedKey();
		var oValue1 = oConditionGrid.value1;
		var oValue2 = oConditionGrid.value2;
		var oCheckvalue = oConditionGrid.grouping;
	
		if (sOperation === sap.m.P13nConditionOperation.BT) {
			// for the "between" operation we enable both fields
			oValue1.setPlaceholder(oThat._sFromLabelText);
			oValue1.setEnabled(true);
			oValue1.setVisible(true);
			
			oValue2.setPlaceholder(oThat._sToLabelText);
			oValue2.setVisible(true);
			oValue2.getLayoutData().setVisibleL(true);
			oValue2.getLayoutData().setVisibleM(true);
			oValue2.getLayoutData().setVisibleS(true);
			
			oCheckvalue.getLayoutData().setVisibleOnLarge(false);
			oCheckvalue.getLayoutData().setVisibleOnMedium(false);
			oCheckvalue.getLayoutData().setVisibleOnSmall(false);
			
		} else {
			if (sOperation === sap.m.P13nConditionOperation.GroupAscending ||
				sOperation === sap.m.P13nConditionOperation.GroupDescending) {
	
				oCheckvalue.setVisible(true);
				oKeyfield.getLayoutData().setSpanL(4);
				oOperation.getLayoutData().setSpanL(4);
				oCheckvalue.getLayoutData().setSpanL(2);
				
				oValue1.setVisible(false);
				
				oValue2.setValue("");
				oValue2.setPlaceholder("");
				oValue2.setVisible(false);
	
				oCheckvalue.getLayoutData().setVisibleOnLarge(true);
				oCheckvalue.getLayoutData().setVisibleOnMedium(true);
				oCheckvalue.getLayoutData().setVisibleOnSmall(true);
			} else {
			if (sOperation === sap.m.P13nConditionOperation.Initial ||
				sOperation === sap.m.P13nConditionOperation.Ascending ||
				sOperation === sap.m.P13nConditionOperation.Descending ||
				sOperation === sap.m.P13nConditionOperation.Total ||
				sOperation === sap.m.P13nConditionOperation.Average ||
				sOperation === sap.m.P13nConditionOperation.Minimum ||
				sOperation === sap.m.P13nConditionOperation.Maximum ) {
	
				// for the "initial" operation we disable both value fields
				oValue1.setPlaceholder("");
				oValue1.setVisible(false);
				
				oValue2.setPlaceholder("");
				oValue2.setVisible(false);
				oValue2.getLayoutData().setVisibleL(true);
				oValue2.getLayoutData().setVisibleM(false);
				oValue2.getLayoutData().setVisibleS(false);
				
				oCheckvalue.getLayoutData().setVisibleOnLarge(false);
				oCheckvalue.getLayoutData().setVisibleOnMedium(false);
				oCheckvalue.getLayoutData().setVisibleOnSmall(false);
	
				if ( sOperation !== sap.m.P13nConditionOperation.Initial) {
					if (this.getLayoutMode() === "Desktop") {
						oKeyfield.getLayoutData().setSpan("L5 M5 S5");
						oOperation.getLayoutData().setSpan("L4 M4 S4");
					} else {
						oKeyfield.getLayoutData().setSpanL(5);
						oOperation.getLayoutData().setSpanL(4);
	//					oKeyfield.getLayoutData().setSpan("L5 M5 S5");
	//					oOperation.getLayoutData().setSpan("L4 M4 S4");
					}
				}
			} else {
				// for all other operations we enable only the Value1 fields
				oValue1.setPlaceholder(oThat._sValueLabelText);
				oValue1.setVisible(true);
	
				oValue2.setValue("");
				oValue2.setPlaceholder("");
				oValue2.setVisible(false);
				oValue2.getLayoutData().setVisibleL(true);
				oValue2.getLayoutData().setVisibleM(false);
				oValue2.getLayoutData().setVisibleS(false);
	
				oCheckvalue.getLayoutData().setVisibleOnLarge(false);
				oCheckvalue.getLayoutData().setVisibleOnMedium(false);
				oCheckvalue.getLayoutData().setVisibleOnSmall(false);
				}
			}
		}
	};
	
	/**
	 * called when the user makes a change in one of the condition fields. The function will update, remove or add the conditions for this condition.
	 * 
	 * @private
	 * @param {object}
	 *            oThat is the P13nConditionPanel
	 * @param {grid}
	 *            oConditionGrid Grid which contains the Operation control which has been changed
	 */
	P13nConditionPanel.prototype._changeField = function(oThat, oConditionGrid) {
		var sKeyField = oConditionGrid.keyField.getSelectedKey();
		var sOperation = oConditionGrid.operation.getSelectedKey();
		var sValue1 = oConditionGrid.value1.getValue();
		var oValue1 = oConditionGrid.oFormatter ? oConditionGrid.oFormatter.parse(sValue1) : sValue1;
		if (oConditionGrid.oFormatter) { sValue1 = oConditionGrid.oFormatter.format(oValue1); } 
		var sValue2 = oConditionGrid.value2.getValue();
		var oValue2 = oConditionGrid.oFormatter ? oConditionGrid.oFormatter.parse(sValue2) : sValue2;
		if (oConditionGrid.oFormatter) { sValue2 = oConditionGrid.oFormatter.format(oValue2); } 
		var bGrouping = oConditionGrid.grouping.getSelected();
		var bExclude = this.getExclude();
		var oSelectCheckbox = oConditionGrid.select;
		var sValue = "";
		var sKey;
		 
		if (sKeyField === "" || sKeyField == null) {
			// handling of "(none)" value
			sKeyField = null;
			sKey = oConditionGrid.data("_key");
			delete this._oConditionsMap[sKey];
			
			this._enableCondition(oThat, oConditionGrid, false);
			
			oSelectCheckbox.setSelected(false);
			oSelectCheckbox.setEnabled(false);
			
			this._bIgnoreSetConditions = true;
			this.fireDataChange({
				key : sKey,
				operation: "remove",
				newData : null
			});		
			this._bIgnoreSetConditions = false;
			return;
		}
	
		this._enableCondition(oThat, oConditionGrid, true);
	
		sValue = oThat._getFormatedConditionText(sOperation, sValue1, sValue2, bExclude, sKeyField);
	
		var oConditionData = {
			"value": sValue,
			"exclude": bExclude,
			"operation": sOperation,
			"keyField": sKeyField,
			"value1": oValue1,
			"value2": oValue2,
			"grouping": bGrouping
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
				key : sKey,
				index: oConditionGrid.getParent().getContent().indexOf(oConditionGrid),
				operation: sOperation,
				newData : oConditionData
			});
		} else {
			delete this._oConditionsMap[sKey];
	
			oSelectCheckbox.setSelected(false);
			oSelectCheckbox.setEnabled(false);
			
			this._bIgnoreSetConditions = true;
			this.fireDataChange({
				key : sKey,
				operation: "remove",
				newData : null
			});		
			this._bIgnoreSetConditions = false;
		}
		
	};
	
	
	P13nConditionPanel.prototype._enableAllCondition = function() {
		var aConditionGrids = this._oConditionsGrid.getContent();
		aConditionGrids.forEach(function(oConditionGrid) {
			var oKeyField = this._getCurrentKeyField(oConditionGrid.keyField);
			var sKeyField = oKeyField && oKeyField.key !== undefined ? oKeyField.key : oKeyField;
			this._enableCondition(this, oConditionGrid, !(sKeyField == "" || sKeyField == null));
		}, this);
	};

	P13nConditionPanel.prototype._enableCondition = function(oThat, oConditionGrid, bEnable) {
		oConditionGrid.operation.setEnabled(bEnable);
		oConditionGrid.value1.setEnabled(bEnable);
		oConditionGrid.value2.setEnabled(bEnable);
		oConditionGrid.grouping.setEnabled(bEnable);
		oConditionGrid.remove.setEnabled(bEnable);
	};
	
	
	/**
	 * press handler for the remove condition buttons
	 * 
	 * @private
	 * @param {object}
	 *            oThat is the P13nConditionPanel
	 * @param {grid}
	 *            oTargetGrid the main grid 
	 * @param {grid}
	 *            oConditionGrid from where the remove is triggered
	 */
	P13nConditionPanel.prototype._removeCondition = function(oThat, oTargetGrid, oConditionGrid) {
		if (oConditionGrid.getContent().length > 1) {
			var sKey = oConditionGrid.data("_key");
			delete oThat._oConditionsMap[sKey];
			oConditionGrid.destroy();
	
			if (oTargetGrid.getContent().length < 1) {
				this._addCondition(this, oTargetGrid);
			} else {
				this._updateConditionButtons(oTargetGrid);
			}
			
			this.fireDataChange({
				key : sKey,
				operation: "remove",
				newData : null
			});
			
		}
	};
	
	/**
	 * update the condition add/remove buttons visibility
	 * 
	 * @private
	 */
	P13nConditionPanel.prototype._updateConditionButtons = function(oTargetGrid) {
		var iMax = parseInt(this.getMaxConditions(), 10);
	
		var n = oTargetGrid.getContent().length;
		for (var i = 0; i < n; i++) {
			var oAddBtn = oTargetGrid.getContent()[i].add;
			if (this.getAlwaysShowAddIcon() || (i === n - 1 && (iMax === -1 || i < iMax - 1))) {
				// show the Add only for the last condition row and if the Max value is not reached
				oAddBtn.removeStyleClass("displayNone");
			} else {
				oAddBtn.addStyleClass("displayNone");
			}
	
			var oRemoveBtn = oTargetGrid.getContent()[i].remove;
			if (iMax === 1 || (i === 0 && n === 1 && this.getDisableFirstRemoveIcon())) {
				oRemoveBtn.addStyleClass("displayNone");
			} else {
				oRemoveBtn.removeStyleClass("displayNone");
			}
		}
	};
	
	/**
	 * check if the entered/modified conditions are correct, marks invalid fields yellow (Warning state) and opens a popup message dialog to give the user the feedback
	 * that some values are wrong or missing.
	 * 
	 * @private
	 * @param {function} fnCallback which we call when all conditions are valid or the user ignores the wrong/missing fields by pressing Yes on a message dialog.
	 */
	P13nConditionPanel.prototype.validateConditions = function() {
		var that = this;
	
		var fnCheckConditions = function(aGrids) {
			var bValid = true;
			for (var i = 0; i < aGrids.length; i++) {
				var oGrid = aGrids[i];
				var sOperation = oGrid.operation.getSelectedKey();
	
				if (i < aGrids.length - 1 || sOperation === sap.m.P13nConditionOperation.BT) {
					var bIsValid = that._checkCondition(oGrid, i === aGrids.length - 1);
					bValid = bValid && bIsValid;
				}
			}
	
			return bValid;
		};
	
		return fnCheckConditions(this._oConditionsGrid.getContent());
	};
	
	/**
	 * checks on a single condition if the values are filled correct and set the Status of invalid fields to Warning. the condition is invalide, when e.g. in the BT condition
	 * one or both of the values is/are empty of for other condition operations the vlaue1 field is not filled.
	 * 
	 * @private
	 * @param {Grid} oConditionGrid which contains the fields of a single condition
	 * @param {boolean} isLast indicated if this is the last condition in the group
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
	P13nConditionPanel.prototype._getFormatedConditionText = function(sOperation, sValue1, sValue2, bExclude, sKeyField) {
		var sConditionText = "";
	
		var sKeyFieldText = null;
		if (this._aKeyFields && this._aKeyFields.length > 1) {
			// search the text for the KeyField
			for (var i = 0; i < this._aKeyFields.length; i++) {
				if (typeof this._aKeyFields[i] !== "string") {
					if (this._aKeyFields[i].key === sKeyField && this._aKeyFields[i].text) {
						sKeyFieldText = this._aKeyFields[i].text;
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
				case sap.m.P13nConditionOperation.GroupAscending:
					sConditionText = "ascending";
					break;
	
				case sap.m.P13nConditionOperation.Descending:
				case sap.m.P13nConditionOperation.GroupDescending:
					sConditionText = "descending";
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
	
	//	if (window.console) {
	//		console.log(" ---> " + oRangeInfo.name);
	//	}
		
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
	
	//	if (window.console) {
	//		console.log(w + " ---> " + oRangeInfo.name);
	//	}
		
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

}, /* bExport= */ true);
