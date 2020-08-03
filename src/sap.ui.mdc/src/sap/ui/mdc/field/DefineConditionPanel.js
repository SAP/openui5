/*!
 * ${copyright}
 */
sap.ui.define([
	'sap/ui/core/XMLComposite',
	'sap/ui/model/Filter',
	'sap/ui/model/type/String',
	'sap/ui/base/ManagedObjectObserver',
	'sap/m/FlexItemData',
	'sap/base/util/merge',
	'sap/base/util/deepEqual',
	'sap/ui/mdc/condition/Condition',
	'sap/ui/mdc/condition/FilterOperatorUtil',
	'sap/ui/mdc/condition/Operator',
	'sap/ui/mdc/enum/EditMode',
	'sap/ui/mdc/enum/FieldDisplay',
	'sap/ui/mdc/enum/BaseType',
	'sap/ui/mdc/enum/ConditionValidated',
	'sap/ui/mdc/Field'
], function(
		XMLComposite,
		Filter,
		StringType,
		ManagedObjectObserver,
		FlexItemData,
		merge,
		deepEqual,
		Condition,
		FilterOperatorUtil,
		Operator,
		EditMode,
		FieldDisplay,
		BaseType,
		ConditionValidated,
		Field
		) {
	"use strict";

	// translation utils
	var oMessageBundle = sap.ui.getCore().getLibraryResourceBundle("sap.ui.mdc");
	sap.ui.getCore().attachLocalizationChanged(function() {
		oMessageBundle = sap.ui.getCore().getLibraryResourceBundle("sap.ui.mdc");
	});

	/**
	 * Constructor for a new <code>DefineConditionPanel</code>.
	 *
	 * @param {string} [sId] ID for the new control, generated automatically if no ID is given
	 * @param {object} [mSettings] Initial settings for the new control
	 *
	 * @class
	 * A <code>DefineConditionPanel</code> control is used inside the <code>ValueHelpPanel</code> control to enter different types
	 * of conditions.
	 *
	 * @extends sap.ui.core.XMLComposite
	 *
	 * @author SAP SE
	 * @version ${version}
	 *
	 * @constructor
	 * @alias sap.ui.mdc.field.DefineConditionPanel
	 * @author SAP SE
	 * @version ${version}
	 * @since 1.58.0
	 * @abstract
	 *
	 * @private
	 * @ui5-restricted sap.ui.mdc.field.ValueHelpPanel
	 */
	var DefineConditionPanel = XMLComposite.extend("sap.ui.mdc.field.DefineConditionPanel", {
		metadata: {
			properties: {
				/**
				 * Sets the conditions that represent the selected values of the help.
				 *
				 * @since 1.62.0
				 */
				conditions: {
					type: "object[]",
					group: "Data",
					defaultValue: [],
					byValue: true
				},

				// TODO: better way to pass MaxConditions, Operators, ...
				/**
				 * The <code>formatOptions</code> for the <code>ConditionType</code> used to format tokens.
				 *
				 * @since 1.62.0
				 */
				formatOptions: {
					type: "object",
					defaultValue: {}
				}
			},
			events: {}

		},
		fragment: "sap.ui.mdc.field.DefineConditionPanel",

		init: function() {
			sap.ui.getCore().getMessageManager().registerObject(this, true);
			this._oObserver = new ManagedObjectObserver(_observeChanges.bind(this));

			this._oObserver.observe(this, {
				properties: ["conditions", "formatOptions"]
			});
			var oVLayout = this.byId("defineCondition");
			this._oObserver.observe(oVLayout, {
				aggregations: ["content"]
			});
		},

		exit: function() {
			sap.ui.getCore().getMessageManager().unregisterObject(this, true);
			this._oObserver.disconnect();
			this._oObserver = undefined;

			if (this._oDefaultType) {
				this._oDefaultType.destroy();
				delete this._oDefaultType;
			}

		},

		onBeforeRendering: function() {

			if (!this.oOperatorModel) {
				this.oOperatorModel = new sap.ui.model.json.JSONModel();
				this.setModel(this.oOperatorModel, "om");
			}
			_updateOperatorModel.call(this);

			if (this.getConditions().length === 0) {
				// as observer must not be called in the initial case
				this.updateDefineConditions();
				this._updateButtonVisibility();
			}

		},

		_updateButtonVisibility: function(oCondition) {

			var oVLayout = this.byId("defineCondition");

			if (!oVLayout) {
				return;
			}

			var aRows = oVLayout.getContent();
			var oFormatOptions = this.getFormatOptions();
			var iMaxConditions = oFormatOptions.maxConditions;

			for (var i = 0; i < aRows.length; i++) {
				var oRow = aRows[i];
				var oHBox = oRow.getContent()[2];
				var oButton = oHBox.getItems()[1];
				oButton.setVisible((i === aRows.length - 1) && (iMaxConditions == -1 || i < iMaxConditions - 1));
			}

		},

		removeCondition: function(oEvent) {
			var oSource = oEvent.oSource;
			var oCondition = oSource.getBindingContext("$this").getObject();
			var aConditions = this.getConditions();
			var iIndex = FilterOperatorUtil.indexOfCondition(oCondition, aConditions);

			this._bUpdateConditionsInternal = true;
			aConditions.splice(iIndex, 1);
			this.setProperty("conditions", aConditions, true); // do not invalidate whole DefineConditionPanel
			this.updateDefineConditions();
			this._updateButtonVisibility();
			this.invalidate(); // to remove row
		},

		addCondition: function(oEvent) {
			var oSource = oEvent.oSource;
			var oCondition = oSource.getBindingContext("$this").getObject();
			var aConditions = this.getConditions();

			var iIndex = FilterOperatorUtil.indexOfCondition(oCondition, aConditions);
			var oFormatOptions = this.getFormatOptions();
			var iMaxConditions = oFormatOptions.maxConditions;

			if (iMaxConditions == -1 || aConditions.length < iMaxConditions) {
				// create a new dummy condition for a new condition on the UI - must be removed later if not used or filled correct
				this._bUpdateConditionsInternal = true;
				this.addDummyCondition(iIndex + 1);
			}
		},

		addDummyCondition: function(index) {
			var aOperators = _getOperators.call(this);
			var sOperator = aOperators.indexOf("EQ") >= 0 ? "EQ" : aOperators[0];
			var oCondition = Condition.createCondition(sOperator, [null], undefined, undefined, ConditionValidated.NotValidated);
			FilterOperatorUtil.updateConditionValues(oCondition);
			FilterOperatorUtil.checkConditionsEmpty(oCondition, aOperators);
			var aConditions = this.getConditions();
			if (index !== undefined) {
				aConditions.splice(index, 0, oCondition);
			} else {
				aConditions.push(oCondition);
			}
			this.setProperty("conditions", aConditions, true); // do not invalidate whole DefineConditionPanel
			this._updateButtonVisibility();
		},

		updateDefineConditions: function() {
			var aConditions = this.getConditions().filter(function(oCondition) {
				return oCondition.validated !== ConditionValidated.Validated;
			});

			_addStaticText.call(this, aConditions, true, false);

			if (aConditions.length === 0) {
				this._bUpdateConditionsInternal = true;
				this.addDummyCondition();
			}
		},

		// called via the ManagedObjectModel binding and creates a value field for each condition
		valueCtrlFactory: function(sId, oContext) {
			var oModel = oContext.oModel;
			var sPath = oContext.sPath;
			var index = parseInt(sPath.split("/")[sPath.split("/").length - 1]);
			sPath = sPath.slice(0, sPath.lastIndexOf("/"));
			sPath = sPath.slice(0, sPath.lastIndexOf("/"));
			var oCondition = oModel.getProperty(sPath);
			var oOperator = FilterOperatorUtil.getOperator(oCondition.operator);
			var oDataType = _getType.call(this);

			if (!oOperator) {
				return; // TODO: exception?
			}

			var oValueControl = _createControl.call(this, oDataType, oOperator, "$this>", index);
			oValueControl.addStyleClass("sapUiSmallPaddingBegin"); //TODO styleclass for boolean select control does not work!
			oValueControl.setLayoutData(new FlexItemData({
				shrinkFactor: 0,
				growFactor: 1
			}));
			if (oValueControl.attachChange) {
				oValueControl.attachChange(this.onChange.bind(this));
				oValueControl.onpaste = this.onPaste.bind(this);
			}

			// set static text after control created to have the right type in binding
			var aConditions = this.getConditions();
			_addStaticText.call(this, aConditions, true, false);

			return oValueControl;
		},

		// called when the user has change the value of the condition field
		onChange: function(oEvent) {
			var aOperators = _getOperators.call(this);
			var aConditions = this.getConditions();
			FilterOperatorUtil.checkConditionsEmpty(aConditions, aOperators);
			FilterOperatorUtil.updateConditionsValues(aConditions, aOperators);
			this.setProperty("conditions", aConditions, true); // do not invalidate whole DefineConditionPanel

		},

		onSelectChange: function(oEvent) {
			var oField = oEvent.getSource();
			var sKey = oField.getValue();
			var sOldKey = oField._sOldKey;
			var oOperator = FilterOperatorUtil.getOperator(sKey); // operator must exist as List is created from valid operators
			var oOperatorOld = sOldKey && FilterOperatorUtil.getOperator(sOldKey);

			if (oOperatorOld && !deepEqual(oOperator.valueTypes[0], oOperatorOld.valueTypes[0]) && oOperator.valueTypes[0] !== Operator.ValueType.Static) {
				// type changed -> remove entered value (only if changed by user in Select)
				// As Static text is already updated on change from binding, don't delete it here.
				var oCondition = oField.getBindingContext("$this").getObject();
				var aConditions = this.getConditions();
				var iIndex = FilterOperatorUtil.indexOfCondition(oCondition, aConditions);
				if (iIndex >= 0) {
					oCondition = aConditions[iIndex]; // to get right instance
					if (oCondition.values.length > 0 && oCondition.values[0] !== null) {
						oCondition.values[0] = null;
					}
					if (oCondition.values.length > 1 && oCondition.values[1] !== null) {
						oCondition.values[1] = null;
					}
					this._bUpdateConditionsInternal = true;
					this.setProperty("conditions", aConditions, true); // do not invalidate whole DefineConditionPanel
				}
			}

			delete oField._sOldKey;
		},

		onPaste: function(oEvent) {
			var sOriginalText, oSource = oEvent.srcControl;

			// for the purpose to copy from column in excel and paste in MultiInput/MultiComboBox
			if (window.clipboardData) {
				//IE
				sOriginalText = window.clipboardData.getData("Text");
			} else {
				// Chrome, Firefox, Safari
				sOriginalText = oEvent.originalEvent.clipboardData.getData('text/plain');
			}
			var aSeparatedText = sOriginalText.split(/\r\n|\r|\n/g);

			if (aSeparatedText && aSeparatedText.length > 1) {
				setTimeout(function() {
					var aOperators = _getOperators.call(this);
					var oType = _getType.call(this);
					var sType = _getBaseType.call(this, oType);

					var iLength = aSeparatedText.length;
					var aConditions = this.getConditions();
					for (var i = 0; i < iLength; i++) {
						if (aSeparatedText[i]) {
							var sValue = aSeparatedText[i];
							var aValues = sValue.split(/\t/g); // if two values exist, use it as Between
							var oOperator;
							if (aValues.length == 2 && aValues[0] && aValues[1]) {
								oOperator = FilterOperatorUtil.getOperator("BT");
							} else {
								aValues = [sValue.trim()];
								oOperator = FilterOperatorUtil.getDefaultOperator(sType);
							}
							sValue = oOperator ? oOperator.format(Condition.createCondition(oOperator.name, aValues)) : aValues[0];

							if (oOperator) {
								var oCondition = oOperator.getCondition(sValue, oType, FieldDisplay.Value, true);
								if (oCondition) {
									oCondition.validated = ConditionValidated.NotValidated;
									FilterOperatorUtil.checkConditionsEmpty(oCondition, aOperators);
									aConditions.push(oCondition);
								}
							}
						}
					}
					this.setProperty("conditions", aConditions, true); // do not invalidate whole DefineConditionPanel

					if (oSource.setDOMValue) {
						oSource.setDOMValue("");
					}

				}.bind(this), 0);
			}
		}

	});

	function _observeChanges(oChanges) {

		if (oChanges.name === "content" && oChanges.mutation === "insert") {
			// suspend the listBinding of field HBoxes to avoid recreation of controls if not needed
			_suspendListBinding.call(this, oChanges.child);
		}

		if (oChanges.name === "value") {
			// operator changed -> update controls
			_operatorChanged.call(this, oChanges.object, oChanges.current, oChanges.old);
		}

		if (oChanges.name === "formatOptions") {
			// type or maxConditions might changed -> resume ListBinding
			var aConditions = this.getConditions();
			if (aConditions.length > 0) {
				_resumeListBinding.call(this);
				// TODO: suspend afterwards. Workaround delete conditions and add new
				this.setConditions([]);
				this.setConditions(aConditions);
			}

			var oOperators = oChanges.current && oChanges.current.operators;
			var oOperatorsOld = oChanges.old && oChanges.old.operators;
			if (!deepEqual(oOperators, oOperatorsOld)) {
				// operators changed
				_updateOperatorModel.call(this);
			}

			var sType = oChanges.current && oChanges.current.valueType && oChanges.current.valueType.getMetadata().getName();
			var sTypeOld = oChanges.old && oChanges.old.valueType && oChanges.old.valueType.getMetadata().getName();
			if (sType !== sTypeOld && aConditions.length > 0) {
				_addStaticText.call(this, aConditions, true, true); // static text might changed if type changed
			}
		}

		if (oChanges.name === "conditions") {
			if (this._bUpdateConditionsInternal) {
				// conditions updated from DefineConditionPanel itelf -> no new check for dummy needed
				this._bUpdateConditionsInternal = false;
				return;
			}

			if (this._sConditionsTimer) {
				clearTimeout(this._sConditionsTimer);
				this._sConditionsTimer = null;
			}
			this._sConditionsTimer = setTimeout(function () {
				// update conditions after model/binding update has finished. Otherwise it might not update the binding.
				this._sConditionsTimer = null;
				this.updateDefineConditions();
				this._updateButtonVisibility();
			}.bind(this), 0);
		}

	}

	function _suspendListBinding(oGrid) {

		// suspend the listBinding of field HBoxes to avoid recreation of controls if not needed
		var aContent = oGrid.getContent();
		var oField = aContent[0];
		var oHBox = aContent[1];
		var oListBinding = oHBox.getBinding("items");
		oListBinding.suspend();

		// as selected key can be changed by reopening dialog listen on property change not on change event
		this._oObserver.observe(oField, {
			properties: ["value"]
		});

	}

	function _resumeListBinding() {

		// resume the listBinding of field HBoxes to allow recreation of controls
		var oVLayout = this.byId("defineCondition");
		var aGrids = oVLayout.getContent();

		for (var i = 0; i < aGrids.length; i++) {
			var oGrid = aGrids[i];
			var aContent = oGrid.getContent();
			var oHBox = aContent[1];
			var oListBinding = oHBox.getBinding("items");
			oListBinding.resume();
		}

	}

	function _operatorChanged(oField, sKey, sOldKey) {

		var oGrid = oField.getParent();
		var aContent = oGrid.getContent();
		var oHBox = aContent[1];
		var oListBinding = oHBox.getBinding("items");

		oField._sOldKey = sOldKey; // to know in change event

		if (!sKey) {
			// key must not be empty
			var oCondition = oField.getBindingContext("$this").getObject();
			var aConditions = this.getConditions();
			var iIndex = FilterOperatorUtil.indexOfCondition(oCondition, aConditions);
			if (iIndex >= 0) {
				oCondition = aConditions[iIndex]; // to get right instance
				oCondition.operator = sOldKey;
				this._bUpdateConditionsInternal = true;
				this.setProperty("conditions", aConditions, true); // do not invalidate whole DefineConditionPanel
			}
		}

		this.onChange();
		oListBinding.checkUpdate(true); // force update

	}

	function _createControl(oDataType, oOperator, sPath, index) {

		if (oOperator.valueTypes[index] && [Operator.ValueType.Self, Operator.ValueType.Static].indexOf(oOperator.valueTypes[index]) === -1) {
			oDataType = oOperator._createLocalType(oOperator.valueTypes[index]);
		}

		if (oOperator.createControl) {
			return oOperator.createControl(oDataType, oOperator, sPath, index);
		}

		var bStaticText = false;

		if (oOperator.valueTypes[index] === Operator.ValueType.Static) {
			bStaticText = true;
			oDataType = _getDefaultType.call(this);
		}

		var sType = bStaticText ? BaseType.String : _getBaseType.call(this, oDataType);
		var oNullableType;
		var Type;
		var oFormatOptions;
		var oConstraints;

		switch (sType) {
			case BaseType.Boolean:
				// normally boolean makes no sense for DefineConditionPanel
				// in sap.ui.model.odata.type.Boolean nullable is default, if set to false try to create nullable type
				if (oDataType.oConstraints && oDataType.oConstraints.hasOwnProperty("nullable") && oDataType.oConstraints.nullable === false) {
					// "clone" type and make nullable
					Type = sap.ui.require(oDataType.getMetadata().getName().replace(/\./g, "/")); // type is already loaded because instance is provided
					oFormatOptions = merge({}, oDataType.oFormatOptions);
					oConstraints = merge(oDataType.oConstraints, { nullable: true });
					oNullableType = new Type(oFormatOptions, oConstraints);
				} else {
					// given type can be used
					oNullableType = oDataType;
				}

				break;
			case BaseType.Numeric:
				if (oDataType.oFormatOptions && oDataType.oFormatOptions.hasOwnProperty("emptyString") && oDataType.oFormatOptions.emptyString === null) {
					// given type can be used
					oNullableType = oDataType;
				} else {
					// "clone" type and make nullable
					Type = sap.ui.require(oDataType.getMetadata().getName().replace(/\./g, "/")); // type is already loaded because instance is provided
					oFormatOptions = merge(oDataType.oFormatOptions, { emptyString: null });
					//TODO oConstraints like maximum are not used inside the Double type
					oNullableType = new Type(oFormatOptions, oDataType.oConstraints);
				}

				break;
			case BaseType.Date:
			case BaseType.Time:
			case BaseType.DateTime:
				oNullableType = oDataType;

				break;
			//TODO: how to handle unit fields?
			default:
				oNullableType = oDataType; // use given type or default string type
				break;
		}

		var oControl = new Field({
			delegate: _getDelegate.call(this),
			value: { path: sPath, type: oNullableType, mode: 'TwoWay', targetType: 'raw' },
			editMode: bStaticText ? EditMode.Display : EditMode.Editable,
			width: "100%"
		});

		return oControl;

	}

	function _getOperators() {

		var oFormatOptions = this.getFormatOptions();
		var aOperators = oFormatOptions && oFormatOptions.operators;

		if (!aOperators || aOperators.length === 0) {
			// TODO: better default
			aOperators = FilterOperatorUtil.getOperatorsForType(BaseType.String);
		}

		return aOperators;

	}

	function _updateOperatorModel() {

		if (!this.oOperatorModel) {
			return;
		}

		var oType = _getType.call(this);
		// assert(oOperatorConfig == null, "oOperatorConfig does not exist - no operators for Select control can be added");
		var aOperators = _getOperators.call(this);
		var sInclude = oMessageBundle.getText("valuehelp.INCLUDE");
		var sExclude = oMessageBundle.getText("valuehelp.EXCLUDE");
		var aOperatorsData = [];

		for (var i = 0; i < aOperators.length; i++) {
			var sOperator = aOperators[i];
			var oOperator = FilterOperatorUtil.getOperator(sOperator);
			if (!oOperator || (oOperator.showInSuggest !== undefined && oOperator.showInSuggest == false)) {
				continue;
			}

			// try to load the operator longText which is type dependent
			var sTxtKey = oOperator.textKey || "operators." + oOperator.name + ".longText";
			var sText = oOperator.getTypeText(sTxtKey, oType.getName().toLowerCase());
			if (sText === sTxtKey) {
				// when the returned text is the key, a type dependent longText does not exist and we use the default longText for the operator
				sText = oOperator.longText;
			}

			//Update the additionalInfo test for the operator
			var sInfo = oOperator.additionalInfo;
			if (sInfo === undefined)  {
				if (sInfo !== "" && oOperator.formatRange)  {
					sInfo = oOperator.formatRange( oOperator._getRange(undefined, oType), oType);
				} else {
					sInfo = oOperator.exclude ? sExclude : sInclude;
				}
			}

			aOperatorsData.push({
				key: oOperator.name,
				additionalText: sText,
				info: sInfo
			});
		}

		this.oOperatorModel.setData(aOperatorsData);

	}

	function _getType() {

		var oFormatOptions = this.getFormatOptions();
		var oType = oFormatOptions && oFormatOptions.valueType;
		if (!oType) {
			oType = _getDefaultType.call(this);
		}

		return oType;

	}

	function _getDefaultType() {

		if (!this._oDefaultType) {
			this._oDefaultType = new StringType();
		}
		return this._oDefaultType;

	}

	function _getBaseType(oType) {

		var sType = oType.getMetadata().getName();
		var oFormatOptions = oType.oFormatOptions;
		var oConstraints = oType.oConstraints;
		var oDelegate = this.getFormatOptions().delegate;
		var oPayload = this.getFormatOptions().payload;
		var sBaseType = oDelegate ? oDelegate.getTypeUtil(oPayload).getBaseType(sType, oFormatOptions, oConstraints) : BaseType.String; // if not configured use string

		if (sBaseType === BaseType.Unit) {
			sBaseType = BaseType.Numeric;
		}

		return sBaseType;

	}

	function _getDelegate() {

		var oFormatOptions = this.getFormatOptions();
		var sName = oFormatOptions.delegateName || "sap/ui/mdc/field/FieldBaseDelegate";
		var oPayload = oFormatOptions.payload;

		return {name: sName, payload: oPayload};

	}

	function _addStaticText(aConditions, bUpdateBinding, bTypeChange) {

		// for static operators add static text as value to render text control
		var oDataType = _getType.call(this);
		var aUpdate = [];
		var i = 0;
		for (i = 0; i < aConditions.length; i++) {
			var oCondition = aConditions[i];
			var oOperator = FilterOperatorUtil.getOperator(oCondition.operator);
			if (oOperator && oOperator.valueTypes[0] === Operator.ValueType.Static && (oCondition.values.length === 0 || bTypeChange)) {
				// if type changed the text needs to be new formatted (setting of type and conditions might be async.)
				if (oOperator.getStaticText) {
					var sText = oOperator.getStaticText(oDataType);
					if (oCondition.values.length > 0) {
						oCondition.values[0] = sText;
					} else {
						oCondition.values.push(sText);
					}
					aUpdate.push(i);
				}
			}
		}

		if (aUpdate.length > 0) {
			this._bUpdateConditionsInternal = true;
			this.setProperty("conditions", aConditions, true); // do not invalidate whole DefineConditionPanel

			if (bUpdateBinding) {
				var oVLayout = this.byId("defineCondition");
				var aGrids = oVLayout.getContent();

				for (i = 0; i < aUpdate.length; i++) {
					var oGrid = aGrids[aUpdate[i]];
					var aContent = oGrid.getContent();
					var oHBox = aContent[1];
					var oListBinding = oHBox.getBinding("items");
					oListBinding.checkUpdate(true); // force update
				}
			}
		}

	}

	return DefineConditionPanel;

});
