/*
 * ! ${copyright}
 */

// Provides control sap.m.P13nConditionPanel

sap.ui.define([
	'./library',
	'sap/ui/core/library',
	'sap/ui/core/Control',
	'sap/ui/core/IconPool',
	'sap/ui/Device',
	'sap/ui/core/InvisibleText',
	'sap/ui/core/ResizeHandler',
	'sap/ui/core/Item',
	'sap/ui/core/ListItem',
	'sap/ui/model/odata/type/Boolean',
	'sap/ui/model/type/String',
	'sap/ui/model/odata/type/String',
	'sap/ui/model/type/Date',
	'sap/ui/model/type/Time',
	'sap/ui/model/odata/type/DateTime',
	'sap/ui/model/type/Float',
	'./Button',
	'./OverflowToolbar',
	'./OverflowToolbarLayoutData',
	'./ToolbarSpacer',
	'./Text',
	'./SearchField',
	'./CheckBox',
	'./ComboBox',
	'./Select',
	'./Label',
	'./Input',
	'./DatePicker',
	'./TimePicker',
	'./DateTimePicker',
	'sap/base/Log',
	'sap/ui/thirdparty/jquery'
], function(
	library,
	coreLibrary,
	Control,
	IconPool,
	Device,
	InvisibleText,
	ResizeHandler,
	Item,
	ListItem,
	BooleanOdataType,
	StringType,
	StringOdataType,
	DateType,
	TimeType,
	DateTimeOdataType,
	FloatType,
	Button,
	OverflowToolbar,
	OverflowToolbarLayoutData,
	ToolbarSpacer,
	Text,
	SearchField,
	CheckBox,
	ComboBox,
	Select,
	Label,
	Input,
	DatePicker,
	TimePicker,
	DateTimePicker,
	Log,
	jQuery
) {
	"use strict";

	// shortcut for sap.ui.core.ValueState
	var ValueState = coreLibrary.ValueState;

	// shortcut for sap.m.ButtonType
	var ButtonType = library.ButtonType;

	// shortcut for sap.m.ToolbarDesign
	var ToolbarDesign = library.ToolbarDesign;

	// shortcut for sap.ui.core.TextAlign
	var TextAlign = coreLibrary.TextAlign;

	// shortcut for sap.m.OverflowToolbarPriority
	var OverflowToolbarPriority = library.OverflowToolbarPriority;

	// shortcut for sap.m.P13nConditionOperation
	var P13nConditionOperation = library.P13nConditionOperation;

	// lazy dependency to sap.ui.layout.Grid
	var Grid;
	// lazy dependency to sap.ui.layout.GridData
	var GridData;
	// lazy dependency to sap.ui.layout.HorizontalLayout
	var HorizontalLayout;
	// lazy dependency to sap.ui.comp.odata.type.StringDate
	var StringDateType;

	/**
	 * Constructor for a new P13nConditionPanel.
	 *
	 * @param {string} [sId] ID for the new control, generated automatically if no ID is given
	 * @param {object} [mSettings] initial settings for the new control
	 * @class The ConditionPanel Control will be used to implement the Sorting, Filtering and Grouping panel of the new Personalization dialog.
	 * @extends sap.ui.core.Control
	 * @version ${version}
	 * @constructor
	 * @public
	 * @since 1.26.0
	 * @experimental since version 1.26 !!! THIS CONTROL IS ONLY FOR INTERNAL USE !!!
	 * @alias sap.m.P13nConditionPanel
	 * @ui5-metamodel This control/element also will be described in the UI5 (legacy) designtime metamodel
	 */
	var P13nConditionPanel = Control.extend("sap.m.P13nConditionPanel", /** @lends sap.m.P13nConditionPanel.prototype */ {
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
				 * defines if the mediaQuery or a ContainerResize will be used for layout update.
				 * When the <code>P13nConditionPanel</code> is used on a dialog the property should be set to <code>true</code>!
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
				 * makes the remove icon on the first condition row disabled when only one condition exist.
				 */
				disableFirstRemoveIcon: {
					type: "boolean",
					group: "Misc",
					defaultValue: false
				},

				/**
				 * makes the Add icon visible on each condition row. If is set to false the Add is only visible at the end and you can only append a
				 * new condition.
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
				 * KeyField value can only be selected once. When you set the property to <code>true</code> the ConditionPanel will automatically offers on the
				 * KeyField drop down only the keyFields which are not used. The default behavior is that in each keyField dropdown all keyfields are
				 * listed.
				 */
				autoReduceKeyFieldItems: {
					type: "boolean",
					group: "Misc",
					defaultValue: false
				},

				/**
				 * can be used to control the layout behavior. Default is "" which will automatically change the layout. With "Desktop", "Table"
				 * or "Phone" you can set a fixed layout.
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
				 * This represents the displayFormat of the condition Values. With the value "UpperCase" the entered value of the condition will be
				 * converted to upperCase.
				 */
				displayFormat: {
					type: "string",
					group: "Misc",
					defaultValue: null
				},
				/**
				 * Calls the validation listener tbd...
				 */
				validationExecutor: {
					type: "object",
					group: "Misc",
					defaultValue: null
				}
			},
			aggregations: {

				/**
				 * Content for the ConditionPanel. This aggregation is not public!
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
		},
		renderer:{
			apiVersion: 2,
			render: function(oRm, oControl){
				oRm.openStart("section", oControl);
				oRm.class("sapMConditionPanel");
				oRm.openEnd();
				oRm.openStart("div");
				oRm.class("sapMConditionPanelContent");
				oRm.class("sapMConditionPanelBG");
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
	 * This method must be used to assign a list of conditions.
	 *
	 * @param {object[]} aConditions array of Conditions.
	 * @public
	 */
	P13nConditionPanel.prototype.setConditions = function(aConditions) {
		if (!aConditions) {
			Log.error("sap.m.P13nConditionPanel : aCondition is not defined");
		}

		if (this._bIgnoreSetConditions) {
			return;
		}

		this._oConditionsMap = {};
		this._aConditionKeys = [];
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
	 * @public
	 */
	P13nConditionPanel.prototype.removeAllConditions = function() {
		this._oConditionsMap = {};
		this._aConditionKeys = [];
		this._iConditions = 0;

		this._clearConditions();
		this._fillConditions();
	};

	/**
	 * add a single condition.
	 *
	 * @param {object} oCondition the new condition of type <code>{ "key": "007", "operation": sap.m.P13nConditionOperation.Ascending, "keyField":
	 *        "keyFieldKey", "value1": "", "value2": ""};</code>
	 * @public
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
	 * @param {object} oCondition the new condition of type <code>{ "key": "007", "operation": sap.m.P13nConditionOperation.Ascending, "keyField":
	 *        "keyFieldKey", "value1": "", "value2": ""};</code>
	 * @param {int} index of the new condition
	 * @public
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
	 * @param {object} vCondition is the condition which should be removed. can be either a string with the key of the condition of the condition
	 *        object itself.
	 * @public
	 */
	P13nConditionPanel.prototype.removeCondition = function(vCondition) {
		this._clearConditions();

		if (typeof vCondition == "string") {
			this._removeConditionFromMap(vCondition);
		}

		if (typeof vCondition == "object") {
			this._removeConditionFromMap(vCondition.key);
		}

		this._fillConditions();
	};

	/**
	 * add a single condition into the _oConditionMap.
	 *
	 * @private
	 * @param {object} oCondition the new condition of type <code>{ "key": "007", "operation": sap.m.P13nConditionOperation.Ascending, "keyField":
	 *        "keyFieldKey", "value1": "", "value2": ""};</code>
	 */
	P13nConditionPanel.prototype._addCondition2Map = function(oCondition) {
		if (!oCondition.key) {
			oCondition.key = "condition_" + this._iConditions;
			if (this.getExclude()) {
				oCondition.key = "x" + oCondition.key;
			}
		}
		this._iConditions++;
		this._oConditionsMap[oCondition.key] = oCondition;
		this._aConditionKeys.push(oCondition.key);
	};

	P13nConditionPanel.prototype._removeConditionFromMap = function(sKey) {
		this._iConditions--;
		delete this._oConditionsMap[sKey];

		var i = this._aConditionKeys.indexOf(sKey);
		if (i >= 0) {
			this._aConditionKeys.splice(i, 1);
		}
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
			for (var conditionId in this._oConditionsMap) {
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
						"value2": oCondition.operation === P13nConditionOperation.BT ? oCondition.value2 : null,
						"showIfGrouped": oCondition.showIfGrouped
					});

				}
			}
		}

		return aConditions;
	};

	/**
	 * setter for the supported operations which we show per condition row. This array of "default" operations will only be used when we do not have
	 * on the keyfield itself some specific operations and a keyfield is of not of type date or numeric.
	 *
	 * @public
	 * @param {sap.m.P13nConditionOperation[]} aOperations array of operations <code>[sap.m.P13nConditionOperation.BT, sap.m.P13nConditionOperation.EQ]</code>
	 * @param {string} sType defines the type for which this operations will be used. is <code>sType</code> is not defined the operations will be used as default
	 *        operations.
	 */
	P13nConditionPanel.prototype.setOperations = function(aOperations, sType) {
		sType = sType || "default";
		this._oTypeOperations[sType] = aOperations;

		this._updateAllOperations();
	};

	P13nConditionPanel.prototype.setValues = function(aValues, sType) {
		sType = sType || "default";
		this._oTypeValues[sType] = aValues;

		// this._updateAllOperations();
	};

	/**
	 * add a single operation
	 *
	 * @public
	 * @param {sap.m.P13nConditionOperation} oOperation
	 * @param {string} sType defines the type for which this operations will be used.
	 */
	P13nConditionPanel.prototype.addOperation = function(oOperation, sType) {
		sType = sType || "default";
		this._oTypeOperations[sType].push(oOperation);

		this._updateAllOperations();
	};

	/**
	 * remove all operations
	 *
	 * @public
	 * @param {string} sType defines the type for which all operations should be removed
	 */
	P13nConditionPanel.prototype.removeAllOperations = function(sType) {
		sType = sType || "default";
		this._oTypeOperations[sType] = [];

		this._updateAllOperations();
	};

	/**
	 * returns the default array of operations
	 *
	 * @public
	 * @param {string} [sType=default] defines the type for which the operations should be returned.
	 * @returns {sap.m.P13nConditionOperation[]} array of operations
	 */
	P13nConditionPanel.prototype.getOperations = function(sType) {
		sType = sType || "default";
		return this._oTypeOperations[sType];
	};

	/**
	 * This method allows you to specify the KeyFields for the conditions. You can set an array of object with Key and Text properties to define the
	 * keyfields.
	 *
	 * @public
	 * @param {array} aKeyFields array of KeyFields <code>[{key: "CompanyCode", text: "ID"}, {key:"CompanyName", text : "Name"}]</code>
	 */
	P13nConditionPanel.prototype.setKeyFields = function(aKeyFields) {
		this._aKeyFields = aKeyFields;
		this._aKeyFields.forEach(function(oKeyField) {
			P13nConditionPanel._createKeyFieldTypeInstance(oKeyField);
		}, this);

		this._updateKeyFieldItems(this._oConditionsGrid, true);
		this._updateAllConditionsEnableStates();
		this._createAndUpdateAllKeyFields();
		this._updateAllOperations();
	};

	/**
	 * add a single KeyField
	 *
	 * @public
	 * @param {object} oKeyField {key: "CompanyCode", text: "ID"}
	 */
	P13nConditionPanel.prototype.addKeyField = function(oKeyField) {
		this._aKeyFields.push(oKeyField);
		P13nConditionPanel._createKeyFieldTypeInstance(oKeyField);

		this._updateKeyFieldItems(this._oConditionsGrid, true, true);
		this._updateAllConditionsEnableStates();
		this._createAndUpdateAllKeyFields();
		this._updateAllOperations();
	};

	P13nConditionPanel._createKeyFieldTypeInstance = function(oKeyField) {
		var oConstraints;

		//check if typeInstance exists, if not create the type instance
		if (!oKeyField.typeInstance) {
			switch (oKeyField.type) {
				case "boolean":
					//TODO in case the model is not an ODataModel we should use the sap.ui.model.type.Boolean
					oKeyField.typeInstance = new BooleanOdataType();
					break;
				case "numc":
					if (!(oKeyField.formatSettings && oKeyField.formatSettings.isDigitSequence)) {
						Log.error("sap.m.P13nConditionPanel", "NUMC type support requires isDigitSequence==true!");
						oKeyField.formatSettings = Object.assign({}, oKeyField.formatSettings, { isDigitSequence: true });
					}
					oConstraints = oKeyField.formatSettings;
					if (oKeyField.maxLength) {
						oConstraints = Object.assign({}, oConstraints, { maxLength: oKeyField.maxLength });
					}
					if (!oConstraints.maxLength) {
						Log.error("sap.m.P13nConditionPanel", "NUMC type suppport requires maxLength!");
					}
					oKeyField.typeInstance = new StringOdataType({}, oConstraints);
					break;
				case "date":
					//TODO we should use the none odata date type, otherwise the returned oValue1 is not a date object
					oKeyField.typeInstance = new DateType(Object.assign({}, oKeyField.formatSettings, { strictParsing: true }), {});
					break;
				case "time":
					//TODO we should use the none odata date type, otherwise the returned oValue1 is not a date object
					oKeyField.typeInstance = new TimeType(Object.assign({}, oKeyField.formatSettings, { strictParsing: true }), {});
					break;
				case "datetime":
					oKeyField.typeInstance = new DateTimeOdataType(Object.assign({}, oKeyField.formatSettings, { strictParsing: true }), { displayFormat: "Date" });

					// when the type is a DateTime type and isDateOnly==true, the type internal might use UTC=true
					// result is that date values which we format via formatValue(oDate, "string") are shown as the wrong date.
					// The current Date format is yyyy-mm-ddT00:00:00 GMT+01
					// Workaround: changing the oFormat.oFormatOptions.UTC to false!
					var oType = oKeyField.typeInstance;
					if (!oType.oFormat) {
						// create a oFormat of the type by formating a dummy date
						oType.formatValue(new Date(), "string");
					}
					if (oType.oFormat) {
						oType.oFormat.oFormatOptions.UTC = false;
					}
					break;
				case "stringdate":
					// TODO: Do we really need the COMP library here???
					sap.ui.getCore().loadLibrary("sap.ui.comp");
					StringDateType = StringDateType || sap.ui.requireSync("sap/ui/comp/odata/type/StringDate");
					oKeyField.typeInstance = new StringDateType(Object.assign({}, oKeyField.formatSettings, { strictParsing: true }));
					break;
				case "numeric":
					if (oKeyField.precision || oKeyField.scale) {
						oConstraints = {};
						if (oKeyField.precision) {
							oConstraints["maxIntegerDigits"] = parseInt(oKeyField.precision);
						}
						if (oKeyField.scale) {
							oConstraints["maxFractionDigits"] = parseInt(oKeyField.scale);
						}
					}
					oKeyField.typeInstance = new FloatType(oConstraints);
					break;
				default:
					var oFormatOptions = oKeyField.formatSettings;
					if (oKeyField.maxLength) {
						oFormatOptions = Object.assign({}, oFormatOptions, { maxLength: oKeyField.maxLength });
					}
					oKeyField.typeInstance = new StringType({}, oFormatOptions);
					break;
			}
		}
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
	 * @returns {object[]} array of KeyFields <code>[{key: "CompanyCode", text: "ID"}, {key:"CompanyName", text : "Name"}]</code>
	 */
	P13nConditionPanel.prototype.getKeyFields = function() {
		return this._aKeyFields;
	};

	/**
	 * sets the AlwaysShowAddIcon.
	 *
	 * @private
	 * @param {boolean} bEnabled makes the Add icon visible for each condition row.
	 */
	P13nConditionPanel.prototype.setAlwaysShowAddIcon = function(bEnabled) {
		this.setProperty("alwaysShowAddIcon", bEnabled);

		if (this._oConditionsGrid) {
			this._oConditionsGrid.toggleStyleClass("conditionRootGrid", this.getLayoutMode() !== "Desktop"); // && !this.getAlwaysShowAddIcon());
		}

		return this;
	};

	/**
	 * sets the LayoutMode. If not set the layout depends on the size of the browser or the container. see ContainerQuery
	 *
	 * @private
	 * @param {string} sLayoutMode define the layout mode for the condition row. The value can be Desktop, Tablet or Phone.
	 * @returns {sap.m.P13nConditionPanel} <code>this</code> to allow method chaining
	 */
	P13nConditionPanel.prototype.setLayoutMode = function(sLayoutMode) {
		this.setProperty("layoutMode", sLayoutMode);

		if (this._oConditionsGrid) {
			this._oConditionsGrid.toggleStyleClass("conditionRootGrid", sLayoutMode !== "Desktop"); // && !this.getAlwaysShowAddIcon());
		}

		this._updateConditionFieldSpans(sLayoutMode);

		// we have to refill the content grids
		this._clearConditions();
		this._fillConditions();

		return this;
	};

	/**
	 * sets the ContainerQuery. defines if the mediaQuery or a ContainerResize will be used for layout update. When the P13nConditionPanel is used on
	 * a dialog the property should be set to <code>true</code>!
	 *
	 * @private
	 * @since 1.30.0
	 * @param {boolean} bEnabled enables or disables the <code>ContainerQuery</code>
	 * @returns {sap.m.P13nConditionPanel} <code>this</code> to allow method chaining
	 */
	P13nConditionPanel.prototype.setContainerQuery = function(bEnabled) {
		this._unregisterResizeHandler();
		this.setProperty("containerQuery", bEnabled);
		this._registerResizeHandler();

		// we have to refill the content grids
		this._clearConditions();
		this._fillConditions();

		return this;
	};

	/**
	 * sets the LayoutMode.
	 *
	 * @private
	 * @param {string} sLayoutMode define the layout mode for the condition row. The value can be Desktop, Tablet or Phone.
	 */
	P13nConditionPanel.prototype._updateConditionFieldSpans = function(sMode) {
		if (this._aConditionsFields) {
			var bDesktop = sMode === "Desktop";
			if (bDesktop) {
				// this._aConditionsFields[1].SpanFilter = "L1 M1 S1"; Label
				this._aConditionsFields[2].SpanFilter = "L3 M3 S3";
				// this._aConditionsFields[3].SpanFilter = "L1 M1 S1"; Label
				this._aConditionsFields[4].SpanFilter = "L2 M2 S2";
				this._aConditionsFields[5].SpanFilter = "L3 M3 S3";
				this._aConditionsFields[6].SpanFilter = "L2 M2 S2";
				this._aConditionsFields[7].SpanFilter = "L1 M1 S1";
			}
			var bTablet = sMode === "Tablet";
			if (bTablet) {
				// this._aConditionsFields[1].SpanFilter = "L1 M1 S1"; Label
				this._aConditionsFields[2].SpanFilter = "L5 M5 S5";
				// this._aConditionsFields[3].SpanFilter = "L1 M1 S1"; Label
				this._aConditionsFields[4].SpanFilter = "L5 M5 S5";
				this._aConditionsFields[5].SpanFilter = "L10 M10 S10";
				this._aConditionsFields[6].SpanFilter = "L10 M10 S10";
				this._aConditionsFields[7].SpanFilter = "L1 M1 S1";
			}
		}
	};

	/*
	 * Initialize the control @private
	 */
	P13nConditionPanel.prototype.init = function() {
		// load the required layout lib
		sap.ui.getCore().loadLibrary("sap.ui.layout");
		Grid = Grid || sap.ui.requireSync("sap/ui/layout/Grid");
		GridData = GridData || sap.ui.requireSync("sap/ui/layout/GridData");
		HorizontalLayout = HorizontalLayout || sap.ui.requireSync("sap/ui/layout/HorizontalLayout");

		// init some resources
		this._oRb = sap.ui.getCore().getLibraryResourceBundle("sap.m");
		this._sFromLabelText = this._oRb.getText("CONDITIONPANEL_LABELFROM");
		this._sToLabelText = this._oRb.getText("CONDITIONPANEL_LABELTO");
		this._sValueLabelText = this._oRb.getText("CONDITIONPANEL_LABELVALUE");
		this._sShowIfGroupedLabelText = this._oRb.getText("CONDITIONPANEL_LABELGROUPING");
		this._sValidationDialogFieldMessage = this._oRb.getText("CONDITIONPANEL_FIELDMESSAGE");

		this._oTypeOperations = {
			"default": []
		};

		this._oTypeValues = {
			"default": []
		};

		this._aKeyFields = [];
		this._oConditionsMap = {};
		this._aConditionKeys = [];
		this._iConditions = 0;
		this._sLayoutMode = "Desktop";
		this._sConditionType = "Filter";
		this._sAddRemoveIconTooltip = "FILTER";

		this._iBreakPointTablet = Device.media._predefinedRangeSets[Device.media.RANGESETS.SAP_STANDARD].points[0];
		this._iBreakPointDesktop = Device.media._predefinedRangeSets[Device.media.RANGESETS.SAP_STANDARD].points[1];

		// create the main grid and add it into the hidden content aggregation
		this._oConditionsGrid = new Grid({
			width: "100%",
			defaultSpan: "L12 M12 S12",
			hSpacing: 0,
			vSpacing: 0
		}).toggleStyleClass("conditionRootGrid", this.getLayoutMode() !== "Desktop"); // && !this.getAlwaysShowAddIcon());
		this._oConditionsGrid.addStyleClass("sapUiRespGridOverflowHidden");

		this._iFirstConditionIndex = 0;
		this._iConditionPageSize = 10;

		this._oInvisibleTextField = new InvisibleText({
			text: this._oRb.getText("CONDITIONPANEL_FIELD_LABEL")
		});
		this._oInvisibleTextOperator = new InvisibleText({
			text: this._oRb.getText("CONDITIONPANEL_OPERATOR_LABEL")
		});
		this.addAggregation("content", this._oInvisibleTextField);
		this.addAggregation("content", this._oInvisibleTextOperator);

		this.addAggregation("content", this._oConditionsGrid);

		this._registerResizeHandler();

		this._aConditionsFields = [{
			"ID": "select",
			"Label": "",
			"SpanFilter": "L1 M1 S1",
			"SpanSort": "L1 M1 S1",
			"SpanGroup": "L1 M1 S1",
			"Control": "CheckBox",
			"Value": ""
		}, {
			"ID": "keyFieldLabel",
			"Text": "Sort By",
			"SpanFilter": "L1 M1 S1",
			"SpanSort": "L1 M1 S1",
			"SpanGroup": "L1 M1 S1",
			"Control": "Label"
		}, {
			"ID": "keyField",
			"Label": "",
			"SpanFilter": "L3 M5 S10",
			"SpanSort": "L5 M5 S12",
			"SpanGroup": "L4 M4 S12",
			"Control": "ComboBox"
		}, {
			"ID": "operationLabel",
			"Text": "Sort Order",
			"SpanFilter": "L1 M1 S1",
			"SpanSort": "L1 M1 S1",
			"SpanGroup": "L1 M1 S1",
			"Control": "Label"
		}, {
			"ID": "operation",
			"Label": "",
			"SpanFilter": "L2 M5 S10",
			"SpanSort": Device.system.phone ? "L5 M5 S8" : "L5 M5 S9",
			"SpanGroup": "L2 M5 S10",
			"Control": "ComboBox"
		}, {
			"ID": "value1",
			"Label": this._sFromLabelText,
			"SpanFilter": "L3 M10 S10",
			"SpanSort": "L3 M10 S10",
			"SpanGroup": "L3 M10 S10",
			"Control": "TextField",
			"Value": ""
		}, {
			"ID": "value2",
			"Label": this._sToLabelText,
			"SpanFilter": "L2 M10 S10",
			"SpanSort": "L2 M10 S10",
			"SpanGroup": "L2 M10 S10",
			"Control": "TextField",
			"Value": ""
		}, {
			"ID": "showIfGrouped",
			"Label": this._sShowIfGroupedLabelText,
			"SpanFilter": "L1 M10 S10",
			"SpanSort": "L1 M10 S10",
			"SpanGroup": "L3 M4 S9",
			"Control": "CheckBox",
			"Value": "false"
		}];
		this._oButtonGroupSpan = {
			"SpanFilter": "L2 M2 S2",
			"SpanSort": Device.system.phone ? "L2 M2 S4" : "L2 M2 S3",
			"SpanGroup": "L2 M2 S3"
		};
		this._updateConditionFieldSpans(this.getLayoutMode());

		// fill/update the content "oConditionGrid"s
		this._fillConditions();
	};

	/*
	 * create the paginator toolbar
	 * @private
	 */
	P13nConditionPanel.prototype._createPaginatorToolbar = function() {
		this._bPaginatorButtonsVisible = false;

		var that = this;

		this._oPrevButton = new Button({
			icon: IconPool.getIconURI("navigation-left-arrow"),
			//tooltip: "Show Previous",
			tooltip: this._oRb.getText("WIZARD_FINISH"), //TODO create new resoucre
			visible: true,
			press: function(oEvent) {
				that._iFirstConditionIndex = Math.max(0, that._iFirstConditionIndex - that._iConditionPageSize);
				that._clearConditions();
				that._fillConditions();
			},
			layoutData: new OverflowToolbarLayoutData({
				priority: OverflowToolbarPriority.NeverOverflow
			})
		});

		this._oNextButton = new Button({
			icon: IconPool.getIconURI("navigation-right-arrow"),
			//tooltip: "Show Next",
			tooltip: this._oRb.getText("WIZARD_NEXT"), //TODO create new resoucre
			visible: true,
			press: function(oEvent) {
				that._iFirstConditionIndex += that._iConditionPageSize;
				that._clearConditions();
				that._fillConditions();
			},
			layoutData: new OverflowToolbarLayoutData({
				priority: OverflowToolbarPriority.NeverOverflow
			})
		});

		this._oRemoveAllButton = new Button({
			text: this._oRb.getText("CONDITIONPANEL_REMOVE_ALL"), // "Remove All",
			//icon: sap.ui.core.IconPool.getIconURI("sys-cancel"),
			//tooltip: "Remove All",
			visible: true,
			press: function(oEvent) {

				that._aConditionKeys.forEach(function(sKey, iIndex) {
					if (iIndex >= 0) {
						this.fireDataChange({
							key: sKey,
							index: iIndex,
							operation: "remove",
							newData: null
						});
					}
				}, that);

				this._iFirstConditionIndex = 0;
				that.removeAllConditions();
			},
			layoutData: new OverflowToolbarLayoutData({
				priority: OverflowToolbarPriority.Low
			})
		});

		this._oAddButton = new Button({
			icon: IconPool.getIconURI("add"),
			tooltip: this._oRb.getText("CONDITIONPANEL_ADD" + (this._sAddRemoveIconTooltipKey ? "_" + this._sAddRemoveIconTooltipKey : "") + "_TOOLTIP"),
			visible: true,
			press: function(oEvent) {
				var oConditionGrid = that._createConditionRow(that._oConditionsGrid, undefined, null, 0);
				that._changeField(oConditionGrid);

				// set the focus in a fields of the newly added condition
				setTimeout(function() {
					oConditionGrid.keyField.focus();
				});

				that._updatePaginatorToolbar();
			},
			layoutData: new OverflowToolbarLayoutData({
				priority: OverflowToolbarPriority.Low
			})
		});

		this._oHeaderText = new Text({
			wrapping: false,
			layoutData: new OverflowToolbarLayoutData({
				priority: OverflowToolbarPriority.NeverOverflow
			})
		});

		this._oPageText = new Text({
			wrapping: false,
			textAlign: TextAlign.Center,
			layoutData: new OverflowToolbarLayoutData({
				priority: OverflowToolbarPriority.NeverOverflow
			})
		});

		this._oFilterField = new SearchField({
			width: "12rem",
			layoutData: new OverflowToolbarLayoutData({
				priority: OverflowToolbarPriority.High
			})
		});

		this._oPaginatorToolbar = new OverflowToolbar({
			height: "3rem",
			design: ToolbarDesign.Transparent,
			content: [
				this._oHeaderText, new ToolbarSpacer(), this._oFilterField, this._oPrevButton, this._oPageText, this._oNextButton, this._oRemoveAllButton, this._oAddButton
			]
		});
	};

	/*
	 * update the paginator toolbar element
	 * @private
	 */
	P13nConditionPanel.prototype._updatePaginatorToolbar = function() {
		if (this._sConditionType !== "Filter" || this.getMaxConditions() !== "-1") {
			return;
		}

		var iItems = this._aConditionKeys.length;
		var iPages = 1 + Math.floor(Math.max(0, iItems - 1) / this._iConditionPageSize);
		var iPage = 1 + Math.floor(this._iFirstConditionIndex / this._iConditionPageSize);

		var oParent = this.getParent();

		if (!this._oPaginatorToolbar) {
			if (iItems > this._iConditionPageSize) {
				this._createPaginatorToolbar();
				this.insertAggregation("content", this._oPaginatorToolbar, 0);
				this._onGridResize();
			} else {
				if (oParent && oParent.setHeaderText) {
					if (this._sOrgHeaderText == undefined) {
						this._sOrgHeaderText = oParent.getHeaderText();
					}

					oParent.setHeaderText(this._sOrgHeaderText + (iItems > 0 ? " (" + iItems + ")" : ""));
				}
				return;
			}
		}

		this._oPrevButton.setEnabled(this._iFirstConditionIndex > 0);
		this._oNextButton.setEnabled(this._iFirstConditionIndex + this._iConditionPageSize < iItems);

		if (oParent && oParent.setHeaderToolbar) {
			if (!oParent.getHeaderToolbar()) {
				this.removeAggregation("content", this._oPaginatorToolbar);
				oParent.setHeaderToolbar(this._oPaginatorToolbar);

				oParent.attachExpand(function(oEvent) {
					this._setToolbarElementVisibility(oEvent.getSource().getExpanded() && this._bPaginatorButtonsVisible);
				}.bind(this));
			}
		}

		if (oParent && oParent.setHeaderText) {
			if (this._sOrgHeaderText == undefined) {
				this._sOrgHeaderText = oParent.getHeaderText();
			}

			var sHeader = this._sOrgHeaderText + (iItems > 0 ? " (" + iItems + ")" : "");
			oParent.setHeaderText(sHeader);
			this._oHeaderText.setText(sHeader);
		} else {
			this._oHeaderText.setText(iItems + " Conditions");
		}

		this._oPageText.setText(iPage + "/" + iPages);

		this._bPaginatorButtonsVisible = this._bPaginatorButtonsVisible || iPages > 1;
		this._setToolbarElementVisibility(this._bPaginatorButtonsVisible);

		if (iPage > iPages) {
			// update the FirstConditionIndex and rerender
			this._iFirstConditionIndex -= Math.max(0, this._iConditionPageSize);
			this._clearConditions();
			this._fillConditions();
		}

		var nValidGrids = 0;
		this._oConditionsGrid.getContent().forEach(function(oGrid) {
			if (oGrid.select.getSelected()) {
				nValidGrids++;
			}
		}, this);

		if (iPages == iPage && (iItems - this._iFirstConditionIndex) > nValidGrids) {
			// check if we have to rerender the current last page
			this._clearConditions();
			this._fillConditions();
		}
	};

	/*
	 * make all toolbar elements visible or invisible
	 * @private
	 */
	P13nConditionPanel.prototype._setToolbarElementVisibility = function(bVisible) {
		this._oPrevButton.setVisible(bVisible);
		this._oNextButton.setVisible(bVisible);
		this._oPageText.setVisible(bVisible);
		this._oFilterField.setVisible(false); //bVisible);
		this._oAddButton.setVisible(bVisible);
		this._oRemoveAllButton.setVisible(bVisible);
	};

	/*
	 * destroy and remove all internal references
	 * @private
	 */
	P13nConditionPanel.prototype.exit = function() {
		this._clearConditions();

		this._unregisterResizeHandler();

		this._aConditionsFields = null;

		this._aKeys = null;
		this._aKeyFields = null;
		this._oTypeOperations = null;

		this._oRb = null;

		this._sFromLabelText = null;
		this._sToLabelText = null;
		this._sValueLabelText = null;
		this._sValidationDialogFieldMessage = null;

		this._oConditionsMap = null;
		this._aConditionKeys = [];
	};

	/*
	 * removes all condition rows from the main ConditionGrid. @private
	 */
	P13nConditionPanel.prototype._clearConditions = function() {
		var aGrid = this._oConditionsGrid.getContent();
		aGrid.forEach(function(oGrid) {
			for (var iField in this._aConditionsFields) {
				var field = this._aConditionsFields[iField];
				if (oGrid[field["ID"]] && oGrid.getContent().indexOf(oGrid[field["ID"]]) === -1) {
					// TODO: notice that since these fields could have been removed from
					// the inner aggregation, and thus would not be destroyed otherwise,
					// we destroy them separately here
					oGrid[field["ID"]].destroy();
				}
			}
		}, this);

		this._oConditionsGrid.destroyContent();
	};

	/*
	 * creates all condition rows and updated the values of the fields. @private
	 */
	P13nConditionPanel.prototype._fillConditions = function() {
		var oCondition, sConditionKey;
		var i = 0,
			iMaxConditions = this._getMaxConditionsAsNumber(),
			n = this._aConditionKeys.length;

		// fill existing conditions
		if (this._oConditionsMap) {
			var iPageSize = this._sConditionType !== "Filter" || this.getMaxConditions() !== "-1" ? 9999 : this._iConditionPageSize;
			n = Math.min(n, Math.min(iMaxConditions, this._iFirstConditionIndex + iPageSize));
			for (i = this._iFirstConditionIndex; i < n; i++) {
				sConditionKey = this._aConditionKeys[i];
				oCondition = this._oConditionsMap[sConditionKey];
				this._createConditionRow(this._oConditionsGrid, oCondition, sConditionKey);
			}
		}

		this._updatePaginatorToolbar();

		// create empty Conditions row/fields
		if ((this.getAutoAddNewRow() || this._oConditionsGrid.getContent().length === 0) && this._oConditionsGrid.getContent().length < iMaxConditions) {
			this._createConditionRow(this._oConditionsGrid);
		}
	};

	/*
	 * add one condition @private
	 */
	P13nConditionPanel.prototype._addCondition = function(oCondition) {
		var i = 0;
		var iMaxConditions = this._getMaxConditionsAsNumber();

		//TODO page handling missing
		if (this._oConditionsMap) {
			for (var conditionId in this._oConditionsMap) {
				if (i < iMaxConditions && oCondition === this._oConditionsMap[conditionId]) {
					this._createConditionRow(this._oConditionsGrid, oCondition, conditionId, i);
				}
				i++;
			}
		}

		this._updatePaginatorToolbar();
	};

	P13nConditionPanel.prototype._getMaxConditionsAsNumber = function() {
		return this.getMaxConditions() === "-1" ? 9999 : parseInt(this.getMaxConditions());
	};

	P13nConditionPanel.prototype.onAfterRendering = function() {
		if (this.getLayoutMode()) {
			this._sLayoutMode = this.getLayoutMode();
			return;
		}
	};

	P13nConditionPanel.prototype._handleMediaChange = function(p) {
		this._sLayoutMode = p.name;

		//		if (window.console) {
		//		 window.console.log(" ---> MediaChange " + p.name);
		//		}

		this._updateLayout(p);
	};

	P13nConditionPanel.prototype._unregisterResizeHandler = function() {
		if (this._sContainerResizeListener) {
			ResizeHandler.deregister(this._sContainerResizeListener);
			this._sContainerResizeListener = null;
		}
		Device.media.detachHandler(this._handleMediaChange, this, Device.media.RANGESETS.SAP_STANDARD);
	};

	P13nConditionPanel.prototype._registerResizeHandler = function() {
		if (this.getContainerQuery()) {
			this._sContainerResizeListener = ResizeHandler.register(this._oConditionsGrid, this._onGridResize.bind(this));
			this._onGridResize();
		} else {
			Device.media.attachHandler(this._handleMediaChange, this, Device.media.RANGESETS.SAP_STANDARD);
		}
	};

	/**
	 * returns the key of the condition grid or creates a new key
	 *
	 * @private
	 * @param {object} oConditionGrid
	 * @returns {string} the new or existing key
	 */
	P13nConditionPanel.prototype._getKeyFromConditionGrid = function(oConditionGrid) {
		var sKey = oConditionGrid.data("_key");
		if (!sKey) {
			sKey = this._createConditionKey();
		}
		return sKey;
	};

	/**
	 * creates a new key for the condition grids
	 *
	 * @private
	 * @returns {string} the new key
	 */
	P13nConditionPanel.prototype._createConditionKey = function() {
		var i = 0;
		var sKey;
		do {
			sKey = "condition_" + i;
			if (this.getExclude()) {
				sKey = "x" + sKey;
			}
			i++;
		} while (this._oConditionsMap[sKey]);

		return sKey;
	};

	/**
	 * appends a new condition grid with all containing controls in the main grid
	 *
	 * @private
	 * @param {grid} oTargetGrid the main grid in which the new condition grid will be added
	 * @param {object} oConditionGridData the condition data for the new added condition grid controls
	 * @param {string} sKey the key for the new added condition grid
	 * @param {int} iPos the index of the new condition in the targetGrid
         * @param {boolean} bUseRowFromAbove use the key from the row above for creating a new row
	 */
	P13nConditionPanel.prototype._createConditionRow = function(oTargetGrid, oConditionGridData, sKey, iPos, bUseRowFromAbove) {

		var oButtonContainer = null;
		var oGrid;
		var that = this;

		if (iPos === undefined) {
			iPos = oTargetGrid.getContent().length;
		}

		var oConditionGrid = new Grid({
			width: "100%",
			defaultSpan: "L12 M12 S12",
			hSpacing: 1,
			vSpacing: 0,
			containerQuery: this.getContainerQuery()
		}).data("_key", sKey);
		oConditionGrid.addStyleClass("sapUiRespGridOverflowHidden");

		/* eslint-disable no-loop-func */
		for (var iField in this._aConditionsFields) {
			var oControl;
			var field = this._aConditionsFields[iField];

			switch (field["Control"]) {
				case "CheckBox":
					// the CheckBox is not visible and only used internal to validate if a condition is
					// filled correct.
					oControl = new CheckBox({
						enabled: false,
						visible: false,
						layoutData: new GridData({
							span: field["Span" + this._sConditionType]
						})
					});

					if (field["ID"] === "showIfGrouped") {
						oControl.setEnabled(true);
						oControl.setText(field["Label"]);
						oControl.attachSelect(function() {
							that._changeField(oConditionGrid);
						});

						oControl.setSelected(oConditionGridData ? oConditionGridData.showIfGrouped : true);
					} else {
						if (oConditionGridData) {
							oControl.setSelected(true);
							oControl.setEnabled(true);
						}
					}
					break;

				case "ComboBox":
					if (field["ID"] === "keyField") {
						oControl = new ComboBox({ // before we used the new sap.m.Select control
							width: "100%",
							ariaLabelledBy: this._oInvisibleTextField
						});

						var fOriginalKey = oControl.setSelectedKey.bind(oControl);
						oControl.setSelectedKey = function(sKey) {
							fOriginalKey(sKey);
							var fValidate = that.getValidationExecutor();
							if (fValidate) {
								fValidate();
							}
						};

						var fOriginalItem = oControl.setSelectedItem.bind(oControl);
						oControl.setSelectedItem = function(oItem) {
							fOriginalItem(oItem);
							var fValidate = that.getValidationExecutor();
							if (fValidate) {
								fValidate();
							}
						};

						oControl.setLayoutData(new GridData({
							span: field["Span" + this._sConditionType]
						}));

						this._fillKeyFieldListItems(oControl, this._aKeyFields);

						if (oControl.attachSelectionChange) {
							oControl.attachSelectionChange(function(oEvent) {
								var fValidate = that.getValidationExecutor();
								if (fValidate) {
									fValidate();
								}

								that._handleSelectionChangeOnKeyField(oTargetGrid, oConditionGrid);
							});
						}

						if (oControl.attachChange) {
							oControl.attachChange(function(oEvent) {
								oConditionGrid.keyField.close();
								that._handleChangeOnKeyField(oTargetGrid, oConditionGrid);
							});
						}

						if (oControl.setSelectedItem) {
							if (oConditionGridData) {
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
									if (iPos > 0 && !sKey && bUseRowFromAbove) { //bUseRowFromAbove determines, if the default needs to be used
										oGrid = oTargetGrid.getContent()[iPos - 1];
										if (oGrid.keyField.getSelectedKey()) {
											oControl.setSelectedKey(oGrid.keyField.getSelectedKey());
										} else {
											// if no item is selected, we have to select at least the first keyFieldItem
											if (!oControl.getSelectedItem() && oControl.getItems().length > 0) {
												oControl.setSelectedItem(oControl.getItems()[0]);
											}
										}
									} else {
										this._aKeyFields.some(function(oKeyField, index) {
											if (oKeyField.isDefault) {
												oControl.setSelectedItem(oControl.getItems()[index]);
												return true;
											}
											if (!oControl.getSelectedItem() && oKeyField.type !== "boolean") {
												oControl.setSelectedItem(oControl.getItems()[index]);
											}
										}, this);

										// if no item is selected, we have to select at least the first keyFieldItem
										if (!oControl.getSelectedItem() && oControl.getItems().length > 0) {
											oControl.setSelectedItem(oControl.getItems()[0]);
										}
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
					}

					if (field["ID"] === "operation") {
						oControl = new Select({
							width: "100%",
							ariaLabelledBy: this._oInvisibleTextOperator,
							layoutData: new GridData({
								span: field["Span" + this._sConditionType]
							})
						});

						oControl.attachChange(function() {
							that._handleChangeOnOperationField(oTargetGrid, oConditionGrid);
						});

						// oControl.attachSelectionChange(function() {
						// that._handleChangeOnOperationField(oTargetGrid, oConditionGrid);
						// });

						// fill some operations to the control to be able to set the selected items
						oConditionGrid[field["ID"]] = oControl;
						this._updateOperationItems(oTargetGrid, oConditionGrid);

						if (oConditionGridData) {
							var oKeyField = this._getCurrentKeyFieldItem(oConditionGrid.keyField);
							var aOperations = this._oTypeOperations["default"];
							if (oKeyField) {
								if (oKeyField.type && this._oTypeOperations[oKeyField.type]) {
									aOperations = this._oTypeOperations[oKeyField.type];
								}
								if (oKeyField.operations) {
									aOperations = oKeyField.operations;
								}
							}

							aOperations.some(function(oOperation, index) {
								if (oConditionGridData.operation === oOperation) {
									oControl.setSelectedKey(oOperation);
									return true;
								}
							}, this);
						} else {
							if (this.getUsePrevConditionSetting()) {
								// select the key from the condition above
								if (iPos > 0 && sKey === null) {
									var oGrid = oTargetGrid.getContent()[iPos - 1];
									oControl.setSelectedKey(oGrid.operation.getSelectedKey());
								}
							}
						}
					}

					// init tooltip of select control
					if (oControl.getSelectedItem && oControl.getSelectedItem()) {
						oControl.setTooltip(oControl.getSelectedItem().getTooltip() || oControl.getSelectedItem().getText());
					}

					break;

				case "TextField":
					var oCurrentKeyField = this._getCurrentKeyFieldItem(oConditionGrid.keyField);
					oControl = this._createValueField(oCurrentKeyField, field, oConditionGrid);
					oControl.oTargetGrid = oTargetGrid;

					if (oConditionGridData && oConditionGridData[field["ID"]] !== undefined) {
						var vValue = oConditionGridData[field["ID"]];

						if (oControl instanceof Select) {
							if (typeof vValue === "boolean") {
								oControl.setSelectedIndex(vValue ? 2 : 1);
							}
						} else if (vValue !== null && oConditionGrid.oType) {

							// In case vValue is of type string, and type is StringDate we can set the value without formatting.
							if (typeof vValue === "string" && oConditionGrid.oType.getName() === "sap.ui.comp.odata.type.StringDate") {
								oControl.setValue(vValue);
							} else {
								// In case vValue is of type string, we try to convert it into the type based format.
								if (typeof vValue === "string" && ["String", "sap.ui.model.odata.type.String", "sap.ui.model.odata.type.Decimal"].indexOf(oConditionGrid.oType.getName()) == -1) {
									try {
										vValue = oConditionGrid.oType.parseValue(vValue, "string");
										oControl.setValue(oConditionGrid.oType.formatValue(vValue, "string"));
									} catch (err) {
										Log.error("sap.m.P13nConditionPanel", "Value '" + vValue + "' does not have the expected type format for " + oConditionGrid.oType.getName() + ".parseValue()");
									}
								} else {
									oControl.setValue(oConditionGrid.oType.formatValue(vValue, "string"));
								}
							}

						} else {
							oControl.setValue(vValue);
						}
					}
					break;

				case "Label":
					oControl = new Label({
						text: field["Text"] + ":",
						visible: this.getShowLabel(),
						layoutData: new GridData({
							span: field["Span" + this._sConditionType]
						})
					}).addStyleClass("conditionLabel");

					oControl.oTargetGrid = oTargetGrid;
					break;
			}

			oConditionGrid[field["ID"]] = oControl;
			oConditionGrid.addContent(oControl);
		}
		/* eslint-enable no-loop-func */

		// create a hLayout container for the remove and add buttons
		oButtonContainer = new HorizontalLayout({
			layoutData: new GridData({
				span: this.getLayoutMode() === "Desktop" ? "L2 M2 S2" : this._oButtonGroupSpan["Span" + this._sConditionType]
			})
		}).addStyleClass("floatRight");
		oConditionGrid.addContent(oButtonContainer);
		oConditionGrid["ButtonContainer"] = oButtonContainer;

		// create "Remove button"
		var oRemoveControl = new Button({
			type: ButtonType.Transparent,
			icon: IconPool.getIconURI("sys-cancel"),
			tooltip: this._oRb.getText("CONDITIONPANEL_REMOVE" + (this._sAddRemoveIconTooltipKey ? "_" + this._sAddRemoveIconTooltipKey : "") + "_TOOLTIP"),
			press: function() {
				that._handleRemoveCondition(this.oTargetGrid, oConditionGrid);
			},
			layoutData: new GridData({
				span: this.getLayoutMode() === "Desktop" ? "L1 M1 S1" : "L1 M2 S2"
			})
		});

		oRemoveControl.oTargetGrid = oTargetGrid;

		oButtonContainer.addContent(oRemoveControl);
		oConditionGrid["remove"] = oRemoveControl;

		// create "Add button"
		var oAddControl = new Button({
			type: ButtonType.Transparent,
			icon: IconPool.getIconURI("add"),
			tooltip: this._oRb.getText("CONDITIONPANEL_ADD" + (this._sAddRemoveIconTooltipKey ? "_" + this._sAddRemoveIconTooltipKey : "") + "_TOOLTIP"),
			press: function() {
				that._handleAddCondition(this.oTargetGrid, oConditionGrid, true);
			},
			layoutData: new GridData({
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
		this._updateOperationItems(oTargetGrid, oConditionGrid);
		this._changeOperationValueFields(oTargetGrid, oConditionGrid);

		// disable fields if the selectedKeyField value is none
		this._updateAllConditionsEnableStates();

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

		if (oConditionGridData) {
			var sConditionText = this._getFormatedConditionText(oConditionGridData.operation, oConditionGridData.value1, oConditionGridData.value2, oConditionGridData.exclude, oConditionGridData.keyField, oConditionGridData.showIfGrouped);

			oConditionGridData._oGrid = oConditionGrid;
			oConditionGridData.value = sConditionText;
			this._oConditionsMap[sKey] = oConditionGridData;
		}

		var sOperation = oConditionGrid.operation.getSelectedKey();
		// in case of a BT and a Date type try to set the minDate/maxDate for the From/To value datepicker
		if (sOperation === "BT" && oConditionGrid.value1.setMinDate && oConditionGrid.value2.setMaxDate) {
			var oValue1 = oConditionGrid.value1.getDateValue();
			var oValue2 = oConditionGrid.value2.getDateValue();
			this._updateMinMaxDate(oConditionGrid, oValue1, oValue2);
		} else {
			this._updateMinMaxDate(oConditionGrid, null, null);
		}

		return oConditionGrid;
	};

	/**
	 * press handler for the remove Condition buttons
	 *
	 * @private
	 * @param {grid} oTargetGrid the main grid
	 * @param {grid} oConditionGrid from where the Remove is triggered
	 */
	P13nConditionPanel.prototype._handleRemoveCondition = function(oTargetGrid, oConditionGrid) {
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

		this._updatePaginatorToolbar();
	};

	/**
	 * press handler for the add condition buttons
	 *
	 * @private
	 * @param {grid} oTargetGrid the main grid
	 * @param {grid} oSourceConditionGrid from where the Add is triggered
         * @param {boolean} bUseRowFromAbove use the key from the row above for creating a new row
	 */
	P13nConditionPanel.prototype._handleAddCondition = function(oTargetGrid, oSourceConditionGrid, bUseRowFromAbove) {
		var iPos = oTargetGrid.getContent().indexOf(oSourceConditionGrid);
		var oConditionGrid = this._createConditionRow(oTargetGrid, undefined, null, iPos + 1, bUseRowFromAbove);
		this._changeField(oConditionGrid);

		// set the focus in a fields of the newly added condition
		setTimeout(function() {
			oConditionGrid.keyField.focus();
		});

		this._updatePaginatorToolbar();
	};

	/**
	 * returns the selectedKeyFields item from the KeyField control.
	 *
	 * @private
	 * @param {control} oKeyFieldCtrl the Select/ComboBox
	 * @returns {object} the selected Keyfields object
	 */
	P13nConditionPanel.prototype._getCurrentKeyFieldItem = function(oKeyFieldCtrl) {
		if (oKeyFieldCtrl.getSelectedKey && oKeyFieldCtrl.getSelectedKey()) {
			var sKey = oKeyFieldCtrl.getSelectedKey();
			var aItems = this._aKeyFields;
			for (var iItem in aItems) {
				var oItem = aItems[iItem];
				if (oItem.key === sKey) {
					return oItem;
				}
			}
		}
		return null;
	};

	/**
	 * creates a new control for the condition value1 and value2 field. Control can be an Input or DatePicker
	 *
	 * @private
	 * @param {object} oCurrentKeyField object of the current selected KeyField which contains type of the column ("string", "date", "time", "numeric" or "boolean") and
	 *        a maxLength information
	 * @param {object} oFieldInfo
	 * @param {grid} oConditionGrid which should contain the new created field
	 * @returns {sap.ui.core.Control} the created control instance either Input or DatePicker
	 */
	P13nConditionPanel.prototype._createValueField = function(oCurrentKeyField, oFieldInfo, oConditionGrid) {
		var oControl;
		var sCtrlType;
		var that = this;

		var params = {
			value: oFieldInfo["Value"],
			width: "100%",
			placeholder: oFieldInfo["Label"],
			change: function(oEvent) {
				that._validateAndFormatFieldValue(oEvent);
				that._changeField(oConditionGrid, oEvent);
			},
			layoutData: new GridData({
				span: oFieldInfo["Span" + this._sConditionType]
			})
		};

		if (oCurrentKeyField && oCurrentKeyField.typeInstance) {
			var oType = oCurrentKeyField.typeInstance;
			sCtrlType = this._findConfig(oType, "ctrl");

			// use the DatePicker when type is sap.ui.model.odata.type.DateTime and displayFormat = Date
			if (sCtrlType === "DateTimePicker" && oType.getMetadata().getName() === "sap.ui.model.odata.type.DateTime") {
				if (!(oType.oConstraints && oType.oConstraints.isDateOnly)) {
					Log.error("sap.m.P13nConditionPanel", "sap.ui.model.odata.type.DateTime without displayFormat = Date is not supported!");
					oType.oConstraints = Object.assign({}, oType.oConstraints, { isDateOnly : true });
				}
				sCtrlType = "DatePicker";
			}
			//var aOperators = this._findConfig(oType, "operators");

			oConditionGrid.oType = oType;

			if (sCtrlType == "select") {
				var aItems = [];
				var aValues = oCurrentKeyField.values || this._oTypeValues[sCtrlType] || [
					"", oType.formatValue(false, "string"), oType.formatValue(true, "string")
				];
				aValues.forEach(function(oValue, index) {
					aItems.push(new Item({
						key: index.toString(),
						text: oValue.toString()
					}));
				});

				params = {
					width: "100%",
					items: aItems,
					change: function() {
						that._changeField(oConditionGrid);
						that._makeFieldValid(oControl, true);
					},
					layoutData: new GridData({
						span: oFieldInfo["Span" + this._sConditionType]
					})
				};
				oControl = new Select(params);
			} else if (sCtrlType == "TimePicker") {
				if (oType.oFormatOptions && oType.oFormatOptions.style) {
					params.displayFormat = oType.oFormatOptions.style;
				}
				oControl = new TimePicker(params);
			} else if (sCtrlType == "DateTimePicker") {
				if (oType.oFormatOptions && oType.oFormatOptions.style) {
					params.displayFormat = oType.oFormatOptions.style;
				}
				oControl = new DateTimePicker(params);
			} else if (sCtrlType === "DatePicker") {
				if (oType.oFormatOptions) {
					params.displayFormat = oType.oFormatOptions.style || oType.oFormatOptions.pattern;

					if (oType.isA("sap.ui.comp.odata.type.StringDate")) {
						params.valueFormat = "yyyyMMdd";
					}
				}
				oControl = new DatePicker(params);
			} else {
				oControl = new Input(params);

				//TODO oType should only be set when type is string!
				if (this._fSuggestCallback) {
					oCurrentKeyField = this._getCurrentKeyFieldItem(oConditionGrid.keyField);
					if (oCurrentKeyField && oCurrentKeyField.key) {
						var oSuggestProvider = this._fSuggestCallback(oControl, oCurrentKeyField.key);
						if (oSuggestProvider) {
							oControl._oSuggestProvider = oSuggestProvider;
						}
					}
				}

			}
		} else {
			// for a new added dummy row, which does not have a oCurrentKeyField, we have to create a dummy input field.
			oConditionGrid.oType = null;
			oControl = new Input(params);
		}

		if (sCtrlType !== "boolean" && sCtrlType !== "enum" && oControl) {
			oControl.onpaste = function(oEvent) {

				var sOriginalText;
				// for the purpose to copy from column in excel and paste in MultiInput/MultiComboBox
				if (window.clipboardData) {
					//IE
					sOriginalText = window.clipboardData.getData("Text");
				} else {
					// Chrome, Firefox, Safari
					sOriginalText = oEvent.originalEvent.clipboardData.getData('text/plain');
				}

				var oConditionGrid = oEvent.srcControl.getParent();
				var aSeparatedText = sOriginalText.split(/\r\n|\r|\n/g);

				var oOperation = oConditionGrid.operation;
				var op = oOperation.getSelectedKey();

				if (aSeparatedText && aSeparatedText.length > 1 && op !== "BT") {
					setTimeout(function() {
						var iLength = aSeparatedText ? aSeparatedText.length : 0;
						var oKeyField = that._getCurrentKeyFieldItem(oConditionGrid.keyField);
						var oOperation = oConditionGrid.operation;

						for (var i = 0; i < iLength; i++) {
							if (that._aConditionKeys.length >= that._getMaxConditionsAsNumber()) {
								break;
							}

							var sPastedValue = aSeparatedText[i].trim();

							if (sPastedValue) {
								var oPastedValue;

								if (oKeyField.typeInstance) {
									// If a typeInstance exist, we have to parse and validate the pastedValue before we can add it a value into the condition.
									// or we do not handle the paste for all types except String!
									try {
										oPastedValue = oKeyField.typeInstance.parseValue(sPastedValue, "string");
										oKeyField.typeInstance.validateValue(oPastedValue);
									} catch (err) {
										Log.error("sap.m.P13nConditionPanel.onPaste", "not able to parse value " + sPastedValue + " with type " + oKeyField.typeInstance.getName());
										sPastedValue = "";
										oPastedValue = null;
									}

									if (!oPastedValue) {
										continue;
									}
								}

								var oCondition = {
									"key": that._createConditionKey(),
									"exclude": that.getExclude(),
									"operation": oOperation.getSelectedKey(),
									"keyField": oKeyField.key,
									"value1":  oPastedValue,
									"value2": null
								};
								that._addCondition2Map(oCondition);

								that.fireDataChange({
									key: oCondition.key,
									index: oCondition.index,
									operation: "add",
									newData: oCondition
								});
							}
						}

						that._clearConditions();
						that._fillConditions();
					}, 0);
				}
			};
		}

		if (oCurrentKeyField && oCurrentKeyField.maxLength && oControl.setMaxLength) {
			var l = -1;
			if (typeof oCurrentKeyField.maxLength === "string") {
				l = parseInt(oCurrentKeyField.maxLength);
			}
			if (typeof oCurrentKeyField.maxLength === "number") {
				l = oCurrentKeyField.maxLength;
			}
			if (l > 0 && (!oControl.getShowSuggestion || !oControl.getShowSuggestion())) {
				oControl.setMaxLength(l);
			}
		}

		return oControl;
	};

	/**
	 * fill all operations from the aOperation array into the select control items list
	 *
	 * @private
	 * @param {control} oCtrl the select control which should be filled
	 * @param {array} aOperations array of operations
	 * @param {string} sType the type prefix for resource access
	 */
	P13nConditionPanel.prototype._fillOperationListItems = function(oCtrl, aOperations, sType) {
		if (sType === "_STRING_") {
			// ignore the "String" Type when accessing the resource text
			sType = "";
		}
		if (sType === "_TIME_" || sType === "_DATETIME_") {
			sType = "_DATE_";
		}
		if (sType === "_BOOLEAN_" || sType === "_NUMC_") {
			sType = "";
		}

		oCtrl.destroyItems();
		aOperations.forEach(function(sOperation){
			var sText = this._oRb.getText("CONDITIONPANEL_OPTION" + sType + sOperation);
			if (sText.startsWith("CONDITIONPANEL_OPTION")) {
				// when for the specified type the resource does not exist use the normal string resource text
				sText = this._oRb.getText("CONDITIONPANEL_OPTION" + sOperation);
			}
			oCtrl.addItem(new ListItem({
				key: sOperation,
				text: sText,
				tooltip: sText
			}));
		}.bind(this));
	};

	/**
	 * fill all KeyFieldItems from the aItems array into the select control items list
	 *
	 * @private
	 * @param {control} oCtrl the select control which should be filled
	 * @param {array} aItems array of keyfields
	 */
	P13nConditionPanel.prototype._fillKeyFieldListItems = function(oCtrl, aItems) {
		oCtrl.destroyItems();
		for (var iItem in aItems) {
			var oItem = aItems[iItem];
			oCtrl.addItem(new ListItem({
				key: oItem.key,
				text: oItem.text,
				tooltip: oItem.tooltip ? oItem.tooltip : oItem.text
			}));
		}
		oCtrl.setEditable(oCtrl.getItems().length > 1);
	};

	/**
	 * change handler for the Operation field
	 *
	 * @private
	 * @param {grid} oTargetGrid the main grid
	 * @param {grid} oConditionGrid Grid which contains the Operation control which has been changed
	 */
	P13nConditionPanel.prototype._handleChangeOnOperationField = function(oTargetGrid, oConditionGrid) {
		this._changeOperationValueFields(oTargetGrid, oConditionGrid);
		this._changeField(oConditionGrid);
	};

	/**
	 * SelectionChange handler for the KeyField field
	 *
	 * @private
	 * @param {grid} oTargetGrid the main grid
	 * @param {grid} oConditionGrid Grid which contains the KeyField control which has been changed
	 */
	P13nConditionPanel.prototype._handleSelectionChangeOnKeyField = function(oTargetGrid, oConditionGrid) {

		if (this._sConditionType === "Filter") {
			this._updateOperationItems(oTargetGrid, oConditionGrid);

			// update the value fields for the KeyField
			this._createAndUpdateValueFields(oTargetGrid, oConditionGrid);

			this._changeOperationValueFields(oTargetGrid, oConditionGrid);
		}

		this._changeField(oConditionGrid);
	};

	/**
	 * change handler for the KeyField field
	 *
	 * @private
	 * @param {grid} oTargetGrid the main grid
	 * @param {grid} oConditionGrid Grid which contains the KeyField control which has been changed
	 */
	P13nConditionPanel.prototype._handleChangeOnKeyField = function(oTargetGrid, oConditionGrid) {

		if (this.getAutoReduceKeyFieldItems()) {
			this._updateKeyFieldItems(oTargetGrid, false, false, oConditionGrid.keyField);
		}
	};

	P13nConditionPanel.prototype._createAndUpdateAllKeyFields = function() {
		var aConditionGrids = this._oConditionsGrid.getContent();
		aConditionGrids.forEach(function(oConditionGrid) {
			this._createAndUpdateValueFields(this._oConditionsGrid, oConditionGrid);
			this._changeOperationValueFields(this._oConditionsGrid, oConditionGrid);
		}, this);
	};

	/**
	 * creates the Value1/2 fields based on the KeyField Type
	 *
	 * @private
	 * @param {grid} oTargetGrid the main grid
	 * @param {grid} oConditionGrid Grid which contains the KeyField control which has been changed
	 */
	P13nConditionPanel.prototype._createAndUpdateValueFields = function(oTargetGrid, oConditionGrid) {

		// update the value fields for the KeyField
		var oCurrentKeyField = this._getCurrentKeyFieldItem(oConditionGrid.keyField);

		var fnCreateAndUpdateField = function(oConditionGrid, oCtrl, index) {
			var sOldValue = oCtrl.getValue ? oCtrl.getValue() : "";

			var ctrlIndex = oConditionGrid.indexOfContent(oCtrl);

			// we have to remove the control into the content with rerendering (bSuppressInvalidate=false) the UI,
			// otherwise in some use cases the "between" value fields will not be rendered.
			// This additional rerender might trigger some problems for screenreader.
			oConditionGrid.removeContent(oCtrl);
			//oConditionGrid.removeAggregation("content", oCtrl, true);

			if (oCtrl._oSuggestProvider) {
				oCtrl._oSuggestProvider.destroy();
				oCtrl._oSuggestProvider = null;
			}
			oCtrl.destroy();
			var fieldInfo = this._aConditionsFields[index];
			oCtrl = this._createValueField(oCurrentKeyField, fieldInfo, oConditionGrid);
			oConditionGrid[fieldInfo["ID"]] = oCtrl;

			oConditionGrid.insertContent(oCtrl, ctrlIndex === -1 ? oConditionGrid.indexOfContent(oConditionGrid.operation) + 1 : ctrlIndex);

			var oValue, sValue;
			if (oConditionGrid.oType && sOldValue) {
				try {
					oValue = oConditionGrid.oType.parseValue(sOldValue, "string");
					oConditionGrid.oType.validateValue(oValue);

					sValue = oConditionGrid.oType.formatValue(oValue, "string");
					oCtrl.setValue(sValue);
				} catch (err) {
					var sMsg = err.message;
					this._makeFieldValid(oCtrl, false, sMsg);
					oCtrl.setValue(sOldValue);
				}
			}
		};

		// update Value1 field control
		fnCreateAndUpdateField.bind(this)(oConditionGrid, oConditionGrid.value1, 5);

		// update Value2 field control
		fnCreateAndUpdateField.bind(this)(oConditionGrid, oConditionGrid.value2, 6);
	};

	P13nConditionPanel.prototype._updateAllOperations = function() {
		var aConditionGrids = this._oConditionsGrid.getContent();
		aConditionGrids.forEach(function(oConditionGrid) {
			this._updateOperationItems(this._oConditionsGrid, oConditionGrid);
			this._changeOperationValueFields(this._oConditionsGrid, oConditionGrid);
		}, this);
	};

	/**
	 * update the Operations for a condition row based on the type of the selected keyField
	 *
	 * @private
	 * @param {grid} oTargetGrid the main grid
	 * @param {grid} oConditionGrid Grid which contains the KeyField control and the Operations field which will be updated
	 */
	P13nConditionPanel.prototype._updateOperationItems = function(oTargetGrid, oConditionGrid) {
		var sType = "";
		var oKeyField = this._getCurrentKeyFieldItem(oConditionGrid.keyField);
		var oOperation = oConditionGrid.operation;
		var aOperations = this._oTypeOperations["default"];
		var oCurrentSelectedItem = oOperation.getSelectedItem();

		if (oKeyField) {
			if (oKeyField.type && oKeyField.type !== "" && this._oTypeOperations[oKeyField.type]) {
				sType = oKeyField.type;
				aOperations = this._oTypeOperations[sType];
			}
			if (oKeyField.operations) {
				aOperations = oKeyField.operations;
			}
		}

		this._fillOperationListItems(oOperation, aOperations, sType ? "_" + sType.toUpperCase() + "_" : "");

		if (oCurrentSelectedItem && oOperation.getItemByKey(oCurrentSelectedItem.getKey())) {
			// when old selected items key exist select the same key
			oOperation.setSelectedKey(oCurrentSelectedItem.getKey());
		} else {
			oOperation.setSelectedItem(oOperation.getItems()[0]);
		}

		this._sConditionType = "Filter";
		if (aOperations[0] === P13nConditionOperation.Ascending || aOperations[0] === P13nConditionOperation.Descending) {
			this._sConditionType = "Sort";
		}
		if (aOperations[0] === P13nConditionOperation.GroupAscending || aOperations[0] === P13nConditionOperation.GroupDescending) {
			this._sConditionType = "Group";
		}

		this._adjustValue1Span(oConditionGrid);
	};

	/**
	 * update the Items from all KeyFields
	 *
	 * @private
	 * @param {grid} oTargetGrid the main grid
	 * @param {boolean} bFillAll fills all KeyFields or only the none used
	 * @param {boolean} bAppendLast adds only the last Keyfield to the Items of the selected controls
	 */
	P13nConditionPanel.prototype._updateKeyFieldItems = function(oTargetGrid, bFillAll, bAppendLast, oIgnoreKeyField) {
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
			var oSelectCheckbox = oTargetGrid.getContent()[i].select;
			var sOldKey = oKeyField.getSelectedKey();
			var j = 0;
			var aItems = this._aKeyFields;

			if (oKeyField !== oIgnoreKeyField) {
				if (bAppendLast) {
					j = aItems.length - 1;
				} else {
					// clean the items
					oKeyField.destroyItems();
				}

				// fill all or only the not used items
				for (j; j < aItems.length; j++) {
					var oItem = aItems[j];
					if (oItem.key == null || oItem.key === "" || !oUsedItems[oItem.key] || oItem.key === sOldKey) {
						oKeyField.addItem(new ListItem({
							key: oItem.key,
							text: oItem.text,
							tooltip: oItem.tooltip ? oItem.tooltip : oItem.text
						}));
					}
				}
				oKeyField.setEditable(oKeyField.getItems().length > 1);
			}

			if (sOldKey) {
				oKeyField.setSelectedKey(sOldKey);
			} else if (oKeyField.getItems().length > 0) {
				// make at least the first item the selected item. We need this for updating the tooltip
				oKeyField.setSelectedItem(oKeyField.getItems()[0]);
			}

			if (!oSelectCheckbox.getSelected()) {
				// set/update the isDefault keyfield as selected item for an empty condition row
				/* eslint-disable no-loop-func */
				this._aKeyFields.some(function(oKeyFieldItem, index) {
					if (oKeyFieldItem.isDefault) {
						oKeyField.setSelectedItem(oKeyField.getItems()[index]);
						return true;
					}
					if (!oKeyField.getSelectedItem()) {
						if (oKeyFieldItem.type !== "boolean") {
							oKeyField.setSelectedItem(oKeyField.getItems()[index]);
						}
					}
				}, this);
			}

			// update the tooltip
			if (oKeyField.getSelectedItem()) {
				oKeyField.setTooltip(oKeyField.getSelectedItem().getTooltip() || oKeyField.getSelectedItem().getText());
			}
		}
	};

	/**
	 * called when the user makes a change on the condition operation. The function will update all other fields in the condition grid.
	 *
	 * @private
	 * @param {grid} oTargetGrid the main grid
	 * @param {grid} oConditionGrid Grid which contains the Operation control which has been changed
	 */
	P13nConditionPanel.prototype._changeOperationValueFields = function(oTargetGrid, oConditionGrid) {
		// var oKeyfield = oConditionGrid.keyField;
		var oOperation = oConditionGrid.operation;
		var sOperation = oOperation.getSelectedKey();
		var oValue1 = oConditionGrid.value1;
		var oValue2 = oConditionGrid.value2;
		var oShowIfGroupedvalue = oConditionGrid.showIfGrouped;

		if (!sOperation) {
			return;
		}

		if (sOperation === P13nConditionOperation.BT) {
			// for the "between" operation we enable both fields
			if (oValue1.setPlaceholder && oValue1.getPlaceholder() !== this._sFromLabelText) {
				oValue1.setPlaceholder(this._sFromLabelText);
			}
			if (!oValue1.getVisible()) {
				oValue1.setVisible(true);
				// workaround: making fields invisible for all mode L/M/S does not work, so we remove the fields from the grid.
				oConditionGrid.insertContent(oValue1, oConditionGrid.getContent().length - 1);
			}

			if (oValue2.setPlaceholder && oValue2.getPlaceholder() !== this._sToLabelText) {
				oValue2.setPlaceholder(this._sToLabelText);
			}
			if (!oValue2.getVisible()) {
				oValue2.setVisible(true);
				// workaround: making fields invisible for all mode L/M/S does not work, so we remove the fields from the grid.
				oConditionGrid.insertContent(oValue2, oConditionGrid.getContent().length - 1);
			}
		} else {
			if (sOperation === P13nConditionOperation.GroupAscending || sOperation === P13nConditionOperation.GroupDescending) {

				// update visible of fields
				if (oValue1.getVisible()) {
					oValue1.setVisible(false);
					// workaround: making fields invisible for all mode L/M/S does not work, so we remove the fields from the grid.
					oConditionGrid.removeContent(oValue1);
				}
				if (oValue2.getVisible()) {
					oValue2.setVisible(false);
					oConditionGrid.removeContent(oValue2);
				}
				if (oOperation.getVisible()) {
					oOperation.setVisible(false);
					oConditionGrid.removeContent(oOperation);
				}
				oShowIfGroupedvalue.setVisible(this._getMaxConditionsAsNumber() != 1);
			} else {
				if (sOperation === P13nConditionOperation.NotEmpty || sOperation === P13nConditionOperation.Empty || sOperation === P13nConditionOperation.Initial || sOperation === P13nConditionOperation.Ascending || sOperation === P13nConditionOperation.Descending || sOperation === P13nConditionOperation.Total || sOperation === P13nConditionOperation.Average || sOperation === P13nConditionOperation.Minimum || sOperation === P13nConditionOperation.Maximum) {

					// for this operations we disable both value fields
					if (oValue1.getVisible()) {
						oValue1.setVisible(false);
						// workaround: making fields invisible for all mode L/M/S does not work, so we remove the fields from the grid.
						oConditionGrid.removeContent(oValue1);
					}
					if (oValue2.getVisible()) {
						oValue2.setVisible(false);
						oConditionGrid.removeContent(oValue2);
					}

					// workaround: making fields invisible for all mode L/M/S does not work, so we remove the fields from the grid.
					oConditionGrid.removeContent(oShowIfGroupedvalue);
				} else {
					// for all other operations we enable only the Value1 fields
					if (oValue1.setPlaceholder && oValue1.getPlaceholder() !== this._sValueLabelText) {
						oValue1.setPlaceholder(this._sValueLabelText);
					}
					if (!oValue1.getVisible()) {
						oValue1.setVisible(true);
						// workaround: making fields invisible for all mode L/M/S does not work, so we remove the fields from the grid.
						oConditionGrid.insertContent(oValue1, oConditionGrid.getContent().length - 1);
					}
					if (oValue2.getVisible()) {
						oValue2.setVisible(false);
						oConditionGrid.removeContent(oValue2);
					}
				}
			}
		}

		this._adjustValue1Span(oConditionGrid);
	};

	/*
	 * toggle the value1 field span between L5 and L3 depending on the selected operation
	 */
	P13nConditionPanel.prototype._adjustValue1Span = function(oConditionGrid) {
		if (this._sConditionType === "Filter" && oConditionGrid.value1 && oConditionGrid.operation) {
			var oOperation = oConditionGrid.operation;

			var sNewSpan = this._aConditionsFields[5]["Span" + this._sConditionType];
			if (oOperation.getSelectedKey() !== "BT") {
				sNewSpan = "L5 M10 S10";
			}

			var oLayoutData = oConditionGrid.value1.getLayoutData();
			if (oLayoutData.getSpan() !== sNewSpan) {
				oLayoutData.setSpan(sNewSpan);
			}
		}
	};

	/*
	 * return the index of the oConditionGrid, the none valid condition will be ignored.
	 */
	P13nConditionPanel.prototype._getIndexOfCondition = function(oConditionGrid) {
		var iIndex = -1;

		oConditionGrid.getParent().getContent().some(function(oGrid) {
			if (oGrid.select.getSelected()) {
				iIndex++;
			}
			return (oGrid === oConditionGrid);
		}, this);

		return iIndex + this._iFirstConditionIndex;
	};

	/*
	 * makes a control valid or invalid, means it gets a warning state and shows a warning message attached to the field.
	 *
	 */
	P13nConditionPanel.prototype._makeFieldValid = function(oCtrl, bValid, sMsg) {
		if (bValid) {
			oCtrl.setValueState(ValueState.None);
			oCtrl.setValueStateText("");
		} else {
			oCtrl.setValueState(ValueState.Warning);
			oCtrl.setValueStateText(sMsg ? sMsg : this._sValidationDialogFieldMessage);
		}
	};

	/*
	 * change event handler for a value1 and value2 field control
	 */
	P13nConditionPanel.prototype._validateAndFormatFieldValue = function(oEvent) {
		var oCtrl = oEvent.oSource;
		var oConditionGrid = oCtrl.getParent();
		var sValue;
		if (oCtrl.getDateValue && oEvent) {
			sValue = oEvent.getParameter("value");
			var bValid = oEvent.getParameter("valid");
			this._makeFieldValid(oCtrl, bValid);
			return;
		} else {
			sValue = oCtrl.getValue && oCtrl.getValue();
		}

		if (!oConditionGrid) {
			return;
		}

		if (this.getDisplayFormat() === "UpperCase" && sValue) {
			sValue = sValue.toUpperCase();
			oCtrl.setValue(sValue);
		}

		if (oConditionGrid.oType && sValue) {
			try {
				var oValue = oConditionGrid.oType.parseValue(sValue, "string");
				oConditionGrid.oType.validateValue(oValue);
				this._makeFieldValid(oCtrl, true);

				sValue = oConditionGrid.oType.formatValue(oValue, "string");
				oCtrl.setValue(sValue);
			} catch (err) {
				var sMsg = err.message;
				this._makeFieldValid(oCtrl, false, sMsg);
			}
		} else {
			this._makeFieldValid(oCtrl, true);
		}
	};


	P13nConditionPanel.prototype._updateMinMaxDate = function(oConditionGrid, oValue1, oValue2) {
		if (oConditionGrid.value1.setMinDate && oConditionGrid.value2.setMaxDate) {
			if (oConditionGrid.value1 && oConditionGrid.value1.setMaxDate) {
				oConditionGrid.value1.setMaxDate(oValue2 instanceof Date ? oValue2 : null);
			}
			if (oConditionGrid.value2 && oConditionGrid.value2.setMinDate) {
				oConditionGrid.value2.setMinDate(oValue1 instanceof Date ? oValue1 : null);
			}
		}
	};

	/**
	 * called when the user makes a change in one of the condition fields. The function will update, remove or add the conditions for this condition.
	 *
	 * @private
	 * @param {grid} oConditionGrid Grid which contains the Operation control which has been changed
	 */
	P13nConditionPanel.prototype._changeField = function(oConditionGrid, oEvent) {
		var sKeyField = oConditionGrid.keyField.getSelectedKey();
		if (oConditionGrid.keyField.getSelectedItem()) {
			oConditionGrid.keyField.setTooltip(oConditionGrid.keyField.getSelectedItem().getTooltip() || oConditionGrid.keyField.getSelectedItem().getText());
		} else {
			oConditionGrid.keyField.setTooltip(null);
		}

		var sOperation = oConditionGrid.operation.getSelectedKey();
		if (oConditionGrid.operation.getSelectedItem()) {
			oConditionGrid.operation.setTooltip(oConditionGrid.operation.getSelectedItem().getTooltip() || oConditionGrid.operation.getSelectedItem().getText());
		} else {
			oConditionGrid.operation.setTooltip(null);
		}

		var getValuesFromField = function(oControl, oType) {
			var sValue;
			var oValue;
			if (oControl.getDateValue && !(oControl.isA("sap.m.TimePicker")) && oType.getName() !== "sap.ui.comp.odata.type.StringDate") {
				oValue = oControl.getDateValue();
				if (oType && oValue) {
					if ((oEvent && oEvent.getParameter("valid")) || oControl.isValidValue()) {
						sValue = oType.formatValue(oValue, "string");
					} else {
						sValue = "";
					}
				}
			} else {
				sValue = this._getValueTextFromField(oControl);
				oValue = sValue;
				if (oType && oType.getName() === "sap.ui.comp.odata.type.StringDate") {
					sValue = oType.formatValue(oValue, "string");
				} else if (oType && sValue) {
					try {
						oValue = oType.parseValue(sValue, "string");
						oType.validateValue(oValue);
					} catch (err) {
						Log.error("sap.m.P13nConditionPanel", "not able to parse value " + sValue + " with type " + oType.getName());
						sValue = "";
					}
				}
			}
			return [oValue, sValue];
		}.bind(this);

		// update Value1 field control
		var aValues = getValuesFromField(oConditionGrid.value1, oConditionGrid.oType);
		var oValue1 = aValues[0], sValue1 = aValues[1];

		// update Value2 field control
		aValues = getValuesFromField(oConditionGrid.value2, oConditionGrid.oType);
		var oValue2 = aValues[0], sValue2 = aValues[1];

		// in case of a BT and a Date type try to set the minDate/maxDate for the From/To value datepicker
		if (sOperation === "BT") {
			this._updateMinMaxDate(oConditionGrid, oValue1, oValue2);
		} else {
			this._updateMinMaxDate(oConditionGrid, null, null);
		}

		var oCurrentKeyField = this._getCurrentKeyFieldItem(oConditionGrid.keyField);
		if (oCurrentKeyField && oCurrentKeyField.type === "numc") {
			// in case of type numc and Contains or EndsWith operator the leading 0 will be removed
			if ([P13nConditionOperation.Contains, P13nConditionOperation.EndsWith].indexOf(sOperation) != -1) {
				oValue1 = oConditionGrid.oType.formatValue(oValue1, "string");
			}
		}

		var bShowIfGrouped = oConditionGrid.showIfGrouped.getSelected();
		var bExclude = this.getExclude();
		var oSelectCheckbox = oConditionGrid.select;
		var sValue = "";
		var sKey;

		if (sKeyField === "" || sKeyField == null) {
			// handling of "(none)" or wrong entered keyField value
			sKeyField = null;
			sKey = this._getKeyFromConditionGrid(oConditionGrid);
			this._removeConditionFromMap(sKey);

			this._enableCondition(oConditionGrid, false);
			var iIndex = this._getIndexOfCondition(oConditionGrid);

			if (oSelectCheckbox.getSelected()) {
				oSelectCheckbox.setSelected(false);
				oSelectCheckbox.setEnabled(false);

				this._bIgnoreSetConditions = true;
				this.fireDataChange({
					key: sKey,
					index: iIndex,
					operation: "remove",
					newData: null
				});
				this._bIgnoreSetConditions = false;
			}
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
			"value2": sOperation === P13nConditionOperation.BT ? oValue2 : null,
			"showIfGrouped": bShowIfGrouped
		};
		sKey = this._getKeyFromConditionGrid(oConditionGrid);

		if (sValue !== "") {
			oSelectCheckbox.setSelected(true);
			oSelectCheckbox.setEnabled(true);

			var sOperation = "update";
			if (!this._oConditionsMap[sKey]) {
				sOperation = "add";
			}

			this._oConditionsMap[sKey] = oConditionData;
			if (sOperation === "add") {
				this._aConditionKeys.splice(this._getIndexOfCondition(oConditionGrid), 0, sKey);
			}
			//this._addCondition2Map(oConditionData, this._getIndexOfCondition(oConditionGrid));

			oConditionGrid.data("_key", sKey);

			this.fireDataChange({
				key: sKey,
				index: this._getIndexOfCondition(oConditionGrid),
				operation: sOperation,
				newData: oConditionData
			});
		} else if (this._oConditionsMap[sKey] !== undefined) {
			this._removeConditionFromMap(sKey);
			oConditionGrid.data("_key", null);
			var iIndex = this._getIndexOfCondition(oConditionGrid);

			if (oSelectCheckbox.getSelected()) {
				oSelectCheckbox.setSelected(false);
				oSelectCheckbox.setEnabled(false);

				this._bIgnoreSetConditions = true;
				this.fireDataChange({
					key: sKey,
					index: iIndex,
					operation: "remove",
					newData: null
				});
				this._bIgnoreSetConditions = false;
			}
		}

		this._updatePaginatorToolbar();
	};

	/*
	 * returns the value as text from a Value field.
	 */
	P13nConditionPanel.prototype._getValueTextFromField = function(oControl) {
		if (oControl instanceof Select) {
			return oControl.getSelectedItem() ? oControl.getSelectedItem().getText() : "";
		}

		return oControl.getValue();
	};

	/**
	 * update the enabled state for all conditions
	 *
	 * @private
	 */
	P13nConditionPanel.prototype._updateAllConditionsEnableStates = function() {
		var aConditionGrids = this._oConditionsGrid.getContent();
		aConditionGrids.forEach(function(oConditionGrid) {
			var oKeyField = this._getCurrentKeyFieldItem(oConditionGrid.keyField);
			var sKeyField = oKeyField && oKeyField.key !== undefined ? oKeyField.key : oKeyField;
			var bEnabled = sKeyField !== "" && sKeyField !== null;

			this._enableCondition(oConditionGrid, bEnabled);
		}, this);
	};

	/**
	 * makes all controls in a condition Grid enabled or disabled
	 *
	 * @private
	 * @param {grid} oConditionGrid instance
	 * @param {boolean} bEnable state
	 */
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
	 * @param {grid} oTargetGrid the main grid
	 * @param {grid} oConditionGrid from where the remove is triggered
	 */
	P13nConditionPanel.prototype._removeCondition = function(oTargetGrid, oConditionGrid) {
		var sKey = this._getKeyFromConditionGrid(oConditionGrid);
		var iIndex = -1;
		if (oConditionGrid.select.getSelected()) {
			iIndex = this._getIndexOfCondition(oConditionGrid);
		}

		this._removeConditionFromMap(sKey);
		oConditionGrid.destroy();

		if (oTargetGrid.getContent().length < 1) {
			this._createConditionRow(oTargetGrid);
		} else {
			this._updateConditionButtons(oTargetGrid);
		}

		if (iIndex >= 0) {
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
	 * @param {grid} oTargetGrid the main grid
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
	 * check if the entered/modified conditions are correct, marks invalid fields yellow (Warning state) and can be used to show error message dialog and give the
	 * user the feedback that some values are wrong or missing.
	 *
	 * @private
	 * @returns {boolean} <code>True</code> if all conditions are valid, <code>false</code> otherwise.
	 *
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
	 * @since 1.28.0
	 */
	P13nConditionPanel.prototype.removeValidationErrors = function() {
		this._oConditionsGrid.getContent().forEach(function(oConditionGrid) {
			var oValue1 = oConditionGrid.value1;
			var oValue2 = oConditionGrid.value2;

			oValue1.setValueState(ValueState.None);
			oValue1.setValueStateText("");

			oValue2.setValueState(ValueState.None);
			oValue2.setValueStateText("");
		}, this);
	};

	/**
	 * removes all invalid conditions.
	 *
	 * @public
	 * @since 1.28.0
	 */
	P13nConditionPanel.prototype.removeInvalidConditions = function() {
		var aInvalidConditionGrids = [];
		this._oConditionsGrid.getContent().forEach(function(oConditionGrid) {
			if (oConditionGrid.value1.getValueState() !== ValueState.None || oConditionGrid.value2.getValueState() !== ValueState.None) {
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
	 * checks on a single condition if the values are filled correct and set the Status of invalid fields to Warning. The condition is invalid, when
	 * e.g. in the BT condition one or both of the values is/are empty of for other condition operations the value1 field is not filled.
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

		var bValue1Empty = value1 && (value1.getVisible() && !this._getValueTextFromField(value1));
		var bValue1State = value1 && value1.getVisible() && value1.getValueState ? value1.getValueState() : ValueState.None;
		var bValue2Empty = value2 && (value2.getVisible() && !this._getValueTextFromField(value2));
		var bValue2State = value2 && value2.getVisible() && value2.getValueState ? value2.getValueState() : ValueState.None;

		var sOperation = oConditionGrid.operation.getSelectedKey();

		if (sOperation === P13nConditionOperation.BT) {
			if (!bValue1Empty ? bValue2Empty : !bValue2Empty) { // XOR
				if (bValue1Empty) {
					value1.setValueState(ValueState.Warning);
					value1.setValueStateText(this._sValidationDialogFieldMessage);
				}

				if (bValue2Empty) {
					value2.setValueState(ValueState.Warning);
					value2.setValueStateText(this._sValidationDialogFieldMessage);
				}

				bValid = false;
			} else if (bValue1State !== ValueState.None || bValue2State !== ValueState.None) {
				bValid = false;
			} else {
				value1.setValueState(ValueState.None);
				value1.setValueStateText("");
				value2.setValueState(ValueState.None);
				value2.setValueStateText("");
			}
		}

		if ((value1.getVisible() && value1.getValueState && value1.getValueState() !== ValueState.None) || (value2.getVisible() && value2.getValueState && value2.getValueState() !== ValueState.None)) {
			bValid = false;
		}

		return bValid;
	};

	/**
	 * creates and returns the text for a condition
	 *
	 * @private
	 * @param {string} sOperation the operation type sap.m.P13nConditionOperation
	 * @param {string} sValue1 text of the first condition field
	 * @param {string} sValue2 text of the second condition field
	 * @param {boolean} bExclude indicates if the condition is an Exclude condition
	 * @param {string} sKeyField id
	 * @returns {string} the condition text
	 */
	P13nConditionPanel.prototype._getFormatedConditionText = function(sOperation, sValue1, sValue2, bExclude, sKeyField, bShowIfGrouped) {
		var sConditionText = P13nConditionPanel.getFormatedConditionText(sOperation, sValue1, sValue2, bExclude);
		if (!sConditionText) {
			switch (sOperation) {
				case P13nConditionOperation.Initial:
					sConditionText = "=''";
					break;

				case P13nConditionOperation.NotEmpty:
					sConditionText = "!''";
					break;

				case P13nConditionOperation.Ascending:
					sConditionText = "ascending";
					break;
				case P13nConditionOperation.GroupAscending:
					sConditionText = "ascending";
					sConditionText += " showIfGrouped:" + bShowIfGrouped;
					break;

				case P13nConditionOperation.Descending:
					sConditionText = "descending";
					break;
				case P13nConditionOperation.GroupDescending:
					sConditionText = "descending";
					sConditionText += " showIfGrouped:" + bShowIfGrouped;
					break;

				case P13nConditionOperation.Total:
					sConditionText = "total";
					break;

				case P13nConditionOperation.Average:
					sConditionText = "average";
					break;

				case P13nConditionOperation.Minimum:
					sConditionText = "minimum";
					break;

				case P13nConditionOperation.Maximum:
					sConditionText = "maximum";
					break;
			}

			if (bExclude && sConditionText !== "") {
				sConditionText = "!(" + sConditionText + ")";
			}
		}

		if (this._aKeyFields && this._aKeyFields.length > 1) {
			var sKeyFieldText = null;
			// search the text for the KeyField
			for (var i = 0; i < this._aKeyFields.length; i++) {
				var oKeyField = this._aKeyFields[i];
				if (typeof oKeyField !== "string") {
					if (oKeyField.key === sKeyField && oKeyField.text) {
						sKeyFieldText = oKeyField.text;
					}
				}
			}

			if (sKeyFieldText && sConditionText !== "") {
				sConditionText = sKeyFieldText + ": " + sConditionText;
			}
		}

		return sConditionText;
	};

	P13nConditionPanel._oConditionMap = {
		"EQ": "=$0",
		"GT": ">$0",
		"GE": ">=$0",
		"LT": "<$0",
		"LE": "<=$0",
		"Contains": "*$0*",
		"StartsWith": "$0*",
		"EndsWith": "*$0",
		"BT": "$0...$1",
		"Empty": "<$r>"
	};

	// Replase $r params in operation by resource bundle text
	(function() {
		var _oRb = sap.ui.getCore().getLibraryResourceBundle("sap.m");
		P13nConditionPanel._oConditionMap[P13nConditionOperation.Empty] = P13nConditionPanel._oConditionMap[P13nConditionOperation.Empty].replace("$r", _oRb.getText("CONDITIONPANEL_OPTIONEmpty"));
	})();

	/**
	 * fills the template string placeholder $0, $1 with the values from the aValues array and returns a formatted text for the specified condition
	 * @private
	 * @param {string} sTemplate the template which should be filled
	 * @param {string[]} aValues value array for the template placeholder
	 * @returns {string} the filled template text
	 */
	P13nConditionPanel._templateReplace = function(sTemplate, aValues) {
		return sTemplate.replace(/\$\d/g, function(sMatch) { return aValues[parseInt(sMatch.substr(1))]; });
	};

	/**
	 * creates and returns a formatted text for the specified condition
	 * @public
	 * @param {string} sOperation the operation type sap.m.P13nConditionOperation
	 * @param {string} sValue1 value of the first range field
	 * @param {string} sValue2 value of the second range field
	 * @param {boolean} bExclude indicates if the range is an Exclude range
	 * @returns {string} the range token text. An empty string when no operation matches or the values for the operation are wrong
	 */
	P13nConditionPanel.getFormatedConditionText = function(sOperation, sValue1, sValue2, bExclude) {
		var sConditionText = "";

		switch (sOperation) {
			case P13nConditionOperation.Empty:
				sConditionText = P13nConditionPanel._templateReplace(P13nConditionPanel._oConditionMap[sOperation], []);
				break;

			case P13nConditionOperation.EQ:
			case P13nConditionOperation.GT:
			case P13nConditionOperation.GE:
			case P13nConditionOperation.LT:
			case P13nConditionOperation.LE:
			case P13nConditionOperation.Contains:
			case P13nConditionOperation.StartsWith:
			case P13nConditionOperation.EndsWith:
				if (sValue1 !== "" && sValue1 !== undefined) {
					sConditionText = P13nConditionPanel._templateReplace(P13nConditionPanel._oConditionMap[sOperation], [sValue1]);
				}
				break;

			case P13nConditionOperation.BT:
				if (sValue1 !== "" && sValue1 !== undefined) {
					if (sValue2 !== "" && sValue2 !== undefined) {
						sConditionText = P13nConditionPanel._templateReplace(P13nConditionPanel._oConditionMap[sOperation], [sValue1, sValue2]);
					}
				}
				break;

			default:
				break;
		}

		if (bExclude && sConditionText !== "") {
			sConditionText = "!(" + sConditionText + ")";
		}

		return sConditionText;
	};


	P13nConditionPanel.prototype._updateLayout = function(oRangeInfo) {
		if (!this._oConditionsGrid) {
			return;
		}

		// if (window.console) {
		// window.console.log(" ---> " + oRangeInfo.name);
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

		if (this._sConditionType === "Filter") {
			for (var i = 0; i < aGrids.length; i++) {
				var grid = aGrids[i];
				grid.ButtonContainer.removeStyleClass("floatRight");
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
		}
	};

	P13nConditionPanel.prototype._onGridResize = function() {
		var w;
		// update the paginator toolbar width if exist
		if (this._oPaginatorToolbar && this._oConditionsGrid && this._oConditionsGrid.getContent().length > 0) {
			var oGrid = this._oConditionsGrid.getContent()[0];
			if (oGrid.remove && oGrid.remove.$().position()) {
				w = 0;
				if (this._oPaginatorToolbar.getParent() && this._oPaginatorToolbar.getParent().getExpandable && this._oPaginatorToolbar.getParent().getExpandable()) {
					w = 48 - 4;
				}
				var iToolbarWidth = oGrid.remove.$().position().left - w + oGrid.remove.$().width(); //TODO - Panel expand button width + remove icon width
				this._oPaginatorToolbar.setWidth(iToolbarWidth + "px");
			}
		}

		var domElement = this._oConditionsGrid.getDomRef();
		if (!domElement) {
			return;
		}
		if (!jQuery(domElement).is(":visible")) {
			return;
		}
		w = domElement.clientWidth;

		var oRangeInfo = {};
		if (w <= this._iBreakPointTablet) {
			oRangeInfo.name = "Phone";
		} else if ((w > this._iBreakPointTablet) && (w <= this._iBreakPointDesktop)) {
			oRangeInfo.name = "Tablet";
		} else {
			oRangeInfo.name = "Desktop";
		}

		//if (window.console) {
		//window.console.log(w + " resize ---> " + oRangeInfo.name);
		//}

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

	// this._findConfig("sap.ui.model.odata.type.Date", "operators") -->["EQ", "BT", "LE", "LT", "GE", "GT", "NE"]
	// this._findConfig("sap.ui.model.odata.type.Date", "ctrl") -->"DatePicker"
	P13nConditionPanel.prototype._findConfig = function(vType, sConfigName) {
		if (typeof vType === "object") {
			vType = vType.getMetadata().getName();
		}

		var oConfig;
		while (vType && !(oConfig = this._getConfig(vType, sConfigName))) { // search until we have a type with known operators
			vType = this._getParentType(vType); // go to parent type
		}
		// either vType is undefined because no type in the hierarchy had the config, or oConfig does now have the desired information

		return oConfig; // TODO: return base config if undefined? However, this only makes a difference when a type is not derived from base. Would this be intentional or an error?
	};

	P13nConditionPanel.prototype._getConfig = function(sType, sConfigName) { // no vType support here, because called often
		var oConfig = this._mOpsForType[sType];
		if (oConfig) {
			return oConfig[sConfigName];
		}
	};

	P13nConditionPanel.prototype._getParentType = function(sType) {
		return this._mTypes[sType];
	};

	P13nConditionPanel.prototype._mTypes = {
		// basic
		"base": undefined, // TODO: needed?
		"string": "base",
		"numeric": "base",
		"date": "base",
		"time": "base",
		"boolean": "base",
		"int": "numeric",
		"float": "numeric",

		// simple
		"sap.ui.model.type.Boolean": "boolean",
		"sap.ui.model.type.Date": "date",
		"sap.ui.model.type.FileSize": "string",
		"sap.ui.model.type.Float": "float",
		"sap.ui.model.type.Integer": "int",
		"sap.ui.model.type.String": "string",
		"sap.ui.model.type.Time": "time",

		"sap.ui.comp.odata.type.StringDate": "date",

		// odata
		"sap.ui.model.odata.type.Boolean": "boolean",
		"sap.ui.model.odata.type.Byte": "int",
		"sap.ui.model.odata.type.Date": "date",
		"sap.ui.model.odata.type.DateTime": "datetime",
		"sap.ui.model.odata.type.DateTimeOffset": "datetime",
		"sap.ui.model.odata.type.Decimal": "float",
		"sap.ui.model.odata.type.Double": "float",
		"sap.ui.model.odata.type.Single": "float",
		"sap.ui.model.odata.type.Guid": "string",
		"sap.ui.model.odata.type.Int16": "int",
		"sap.ui.model.odata.type.Int32": "int",
		"sap.ui.model.odata.type.Int64": "int",
		"sap.ui.model.odata.type.Raw": "string",
		"sap.ui.model.odata.type.SByte": "int",
		"sap.ui.model.odata.type.String": "string",
		"sap.ui.model.odata.type.Time": "time",
		"sap.ui.model.odata.type.TimeOfDay": "time",

		//edm
		"Edm.Boolean": "sap.ui.model.odata.type.Boolean",
		"Edm.Byte": "sap.ui.model.odata.type.Byte",
		"Edm.Date": "sap.ui.model.odata.type.Date", // V4 Date
		"Edm.DateTime": "sap.ui.model.odata.type.DateTime", // only for V2  constraints: {displayFormat: 'Date' }
		"Edm.DateTimeOffset": "sap.ui.model.odata.type.DateTimeOffset", //constraints: { V4: true, precision: n }
		"Edm.Decimal": "sap.ui.model.odata.type.Decimal", //constraints: { precision, scale, minimum, maximum, minimumExclusive, maximumExclusive}
		"Edm.Double": "sap.ui.model.odata.type.Double",
		"Edm.Single": "sap.ui.model.odata.type.Single",
		"Edm.Guid": "sap.ui.model.odata.type.Guid",
		"Edm.Int16": "sap.ui.model.odata.type.Int16",
		"Edm.Int32": "sap.ui.model.odata.type.Int32",
		"Edm.Int64": "sap.ui.model.odata.type.Int64",
		//Edm.Raw not supported
		"Edm.SByte": "sap.ui.model.odata.type.SByte",
		"Edm.String": "sap.ui.model.odata.type.String", //constraints: {maxLength, isDigitSequence}
		"Edm.Time": "sap.ui.model.odata.type.Time", // only V2
		"Edm.TimeOfDay": "sap.ui.model.odata.type.TimeOfDay" // V4 constraints: {precision}
	};

	P13nConditionPanel.prototype._mOpsForType = { // defines operators for types
		"base": {
			//			operators: ["EQ", "BT", "LE", "LT", "GE", "GT", "NE"],
			//			defaultOperator: "EQ",
			ctrl: "input"
		},
		"string": {
			//			operators: ["Contains", "EQ", "BT", "StartsWith", "EndsWith", "LE", "LT", "GE", "GT", "NE"],
			//			defaultOperator: "StartsWith",
			ctrl: "input"
		},
		"date": {
			//			operators: ["EQ", "BT", "LE", "LT", "GE", "GT", "NE"],
			ctrl: "DatePicker"
		},
		"datetime": {
			//			operators: ["EQ", "BT", "LE", "LT", "GE", "GT", "NE"],
			ctrl: "DateTimePicker"
		},
		"numeric": {
			//			operators: ["EQ", "BT", "LE", "LT", "GE", "GT", "NE"],
			ctrl: "input"
		},
		"time": {
			//			operators: ["EQ", "BT", "LE", "LT", "GE", "GT"],
			ctrl: "TimePicker"
		},
		"boolean": {
			//			operators: ["EQ", "NE"],
			ctrl: "select"
		}
	};

	return P13nConditionPanel;

});
