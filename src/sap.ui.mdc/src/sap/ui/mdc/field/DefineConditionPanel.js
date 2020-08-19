/*!
 * ${copyright}
 */
sap.ui.define([
	'sap/ui/core/Control',
	'sap/ui/base/ManagedObjectObserver',
	'sap/base/util/merge',
	'sap/base/util/deepEqual',
	'sap/ui/mdc/condition/Condition',
	'sap/ui/mdc/condition/FilterOperatorUtil',
	'sap/ui/mdc/condition/Operator',
	'sap/ui/mdc/enum/EditMode',
	'sap/ui/mdc/enum/FieldDisplay',
	'sap/ui/mdc/enum/BaseType',
	'sap/ui/mdc/enum/ConditionValidated',
	'sap/ui/mdc/Field',
	'sap/ui/mdc/field/ListFieldHelp',
	'sap/ui/model/base/ManagedObjectModel',
	'sap/ui/model/json/JSONModel',
	'sap/ui/model/resource/ResourceModel',
	'sap/ui/model/type/String',
	'sap/ui/core/InvisibleText',
	'sap/ui/core/ListItem',
	'sap/ui/layout/Grid',
	'sap/ui/layout/GridData',
	'sap/m/library',
	'sap/m/ScrollContainer',
	'sap/m/Button'
], function(
		Control,
		ManagedObjectObserver,
		merge,
		deepEqual,
		Condition,
		FilterOperatorUtil,
		Operator,
		EditMode,
		FieldDisplay,
		BaseType,
		ConditionValidated,
		Field,
		ListFieldHelp,
		ManagedObjectModel,
		JSONModel,
		ResourceModel,
		StringType,
		InvisibleText,
		ListItem,
		Grid,
		GridData,
		mLibrary,
		ScrollContainer,
		Button
		) {
	"use strict";

	// translation utils
	var oMessageBundle = sap.ui.getCore().getLibraryResourceBundle("sap.ui.mdc");
	sap.ui.getCore().attachLocalizationChanged(function() {
		oMessageBundle = sap.ui.getCore().getLibraryResourceBundle("sap.ui.mdc");
	});

	var ButtonType = mLibrary.ButtonType;

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
	var DefineConditionPanel = Control.extend("sap.ui.mdc.field.DefineConditionPanel", {
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
			aggregations: {
				/**
				 * Optional content that can be rendered.
				 *
				 * <b>Note:</b> Bind the value-holding property of the control to <code>'$field>/conditions'</code>
				 * using <code>sap.ui.mdc.field.ConditionsType</code> as type.
				 *
				 * If the control needs to show multiple conditions, bind its aggregation to </code>'$field>/conditions'</code>.
				 * Bind the item controls value-holding property using <code>sap.ui.mdc.field.ConditionType</code> as type.
				 *
				 * <b>Warning:</b> Only controls allowed in a </code>Form</code> are allowed to be used for this optional content.
				 * Other controls might break the layout.
				 * This means the <code>sap.ui.core.IFormContent</code> interface needs to be implemented by these controls.
				 */
				_content: {
					type: "sap.ui.core.Control",
					multiple: false
				}
			},
			events: {}
		},
		_oManagedObjectModel: null,

		renderer:{
			apiVersion: 2,
			render: function(oRm, oControl){
				oRm.openStart("section", oControl);
				oRm.class("sapUiMdcDefineConditionPanel");
				oRm.openEnd();
				oRm.renderControl(oControl.getAggregation("_content"));
				oRm.close("section");
			}
		},

		init: function() {
			sap.ui.getCore().getMessageManager().registerObject(this, true);

			Control.prototype.init.apply(this, arguments);

			this._oManagedObjectModel = new ManagedObjectModel(this);

			this._oObserver = new ManagedObjectObserver(_observeChanges.bind(this));

			this._oObserver.observe(this, {
				properties: ["conditions", "formatOptions"]
			});

			_createInnerControls.call(this);
			this.setModel(this._oManagedObjectModel, "$this");
			this.setModel(this._oManagedObjectModel, "$condition"); // TODO: better solution to have 2 bindingContexts on one control
		},

		exit: function() {
			sap.ui.getCore().getMessageManager().unregisterObject(this, true);
			this._oObserver.disconnect();
			this._oObserver = undefined;

			if (this._sConditionsTimer) {
				clearTimeout(this._sConditionsTimer);
				this._sConditionsTimer = null;
			}

			if (this._oDefaultType) {
				this._oDefaultType.destroy();
				delete this._oDefaultType;
			}

			this._oManagedObjectModel.destroy();
			delete this._oManagedObjectModel;
		},

		byId: function(sId) {
			return sap.ui.getCore().byId(this.getId() + "--" + sId);
		},

		onBeforeRendering: function() {

			if (!this.getModel("$i18n")) {
				// if ResourceModel not provided from outside create own one
				this.setModel(new ResourceModel({ bundleName: "sap/ui/mdc/messagebundle", async: false }), "$i18n");
			}

			if (this.getConditions().length === 0) {
				// as observer must not be called in the initial case
				this.updateDefineConditions();
				this._updateButtonVisibility();
			}

		},

		_updateButtonVisibility: function(oCondition) {
			var oFormatOptions = this.getFormatOptions();
			var iMaxConditions = oFormatOptions.maxConditions;
			var oButton = this.byId("addBtn");
			oButton.setVisible( iMaxConditions == -1 || this._iRows < iMaxConditions);
		},

		removeCondition: function(oEvent) {
			var oSource = oEvent.oSource;
			var oCondition = oSource.getBindingContext("$this").getObject();
			var aConditions = this.getConditions();
			var iIndex = FilterOperatorUtil.indexOfCondition(oCondition, aConditions);

			aConditions.splice(iIndex, 1);
			this.setProperty("conditions", aConditions, true); // do not invalidate whole DefineConditionPanel
		},

		addCondition: function(oEvent) {
			var aConditions = this.getConditions();
			var oFormatOptions = this.getFormatOptions();
			var iMaxConditions = oFormatOptions.maxConditions;

			if (iMaxConditions == -1 || aConditions.length < iMaxConditions) {
				// create a new dummy condition for a new condition on the UI - must be removed later if not used or filled correct
				this.addDummyCondition(aConditions.length + 1);
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
		},

		updateDefineConditions: function() {
			var aConditions = this.getConditions().filter(function(oCondition) {
				return oCondition.validated !== ConditionValidated.Validated;
			});

			_addStaticText.call(this, aConditions, true, false);

			if (aConditions.length === 0) {
				this.addDummyCondition();
			}
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

			if (oOperator && oOperatorOld && !deepEqual(oOperator.valueTypes[0], oOperatorOld.valueTypes[0]) && oOperator.valueTypes[0] !== Operator.ValueType.Static) {
				// type changed -> remove entered value (only if changed by user in Select)
				// As Static text updated on condition change, don't delete it here.
				var oCondition = oField.getBindingContext("$this").getObject();
				var aConditions = this.getConditions();
				var iIndex = FilterOperatorUtil.indexOfCondition(oCondition, aConditions);
				if (iIndex >= 0) {
					var bUpdate = false;
					oCondition = aConditions[iIndex]; // to get right instance
					if (oCondition.values.length > 0 && oCondition.values[0] !== null) {
						oCondition.values[0] = null;
						bUpdate = true;
					}
					if (oCondition.values.length > 1 && oCondition.values[1] !== null) {
						oCondition.values[1] = null;
						bUpdate = true;
					}
					if (bUpdate) {
						this.setProperty("conditions", aConditions, true); // do not invalidate whole DefineConditionPanel
					}
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

		if (oChanges.name === "value") {
			// operator changed -> update controls
			_operatorChanged.call(this, oChanges.object, oChanges.current, oChanges.old);
		}

		if (oChanges.name === "formatOptions") {
			// type or maxConditions might changed -> resume ListBinding
			var aConditions = this.getConditions();
			var oOperators = oChanges.current && oChanges.current.operators;
			var oOperatorsOld = oChanges.old && oChanges.old.operators;
			var bOperatorModelUpdated = false;
			if (!deepEqual(oOperators, oOperatorsOld)) {
				// operators changed
				bOperatorModelUpdated = true;
				_updateOperatorModel.call(this);
			}

			var sType = oChanges.current && oChanges.current.valueType && oChanges.current.valueType.getMetadata().getName();
			var sTypeOld = oChanges.old && oChanges.old.valueType && oChanges.old.valueType.getMetadata().getName();
			if (sType !== sTypeOld && aConditions.length > 0) {
				// operators might be changed if type changed
				if (!bOperatorModelUpdated) { // don't do twice
					_updateOperatorModel.call(this);
				}
				this._bUpdateType = true;
				_renderConditions.call(this);
				this._bUpdateType = false;
				_addStaticText.call(this, aConditions, true, true); // static text might changed if type changed
			}
		}

		if (oChanges.name === "conditions") {
			if (this._sConditionsTimer) {
				clearTimeout(this._sConditionsTimer);
				this._sConditionsTimer = null;
			}
			this._sConditionsTimer = setTimeout(function () {
				// on multiple changes (dummy row, static text...) perform only one update
				this._sConditionsTimer = null;
				this.updateDefineConditions();
				_renderConditions.call(this);
				this._updateButtonVisibility();
			}.bind(this), 0);
		}

	}

	function _operatorChanged(oField, sKey, sOldKey) {

		oField._sOldKey = sOldKey; // to know in change event

		var iIndex = 0;

		// if type of operator changes -> remove binding and create it new later on
		if (sKey && sOldKey) {
			var oOperator = FilterOperatorUtil.getOperator(sKey);
			var oOperatorOld = FilterOperatorUtil.getOperator(sOldKey);

			if (oOperator.valueTypes[0] !== oOperatorOld.valueTypes[0]) { // TODO: same with second Field?
				var oGrid = oField.getParent();
				iIndex = oGrid.indexOfContent(oField);
				var oValueField = oGrid.getContent()[iIndex + 2];
				if (oValueField && oValueField.hasOwnProperty("_iValueIndex") && oValueField._iValueIndex === 0) {
					oValueField.unbindProperty("value");
				}
			}
		}

		if (!sKey) {
			// key must not be empty
			var oCondition = oField.getBindingContext("$this").getObject();
			if (oCondition) { // condition might be deleted before Field instance is deleted
				var aConditions = this.getConditions();
				iIndex = FilterOperatorUtil.indexOfCondition(oCondition, aConditions);
				if (iIndex >= 0) {
					oCondition = aConditions[iIndex]; // to get right instance
					oCondition.operator = sOldKey;
					this.setProperty("conditions", aConditions, true); // do not invalidate whole DefineConditionPanel
				}
			}
		}

		// as additinalValue is not updated automatically if operator is set from outside just take it from OperatorModel
		var aOperatorsData = this.oOperatorModel.getData();
		var sDescription;
		for (var i = 0; i < aOperatorsData.length; i++) {
			var oOperatorData = aOperatorsData[i];
			if (oOperatorData === sKey) {
				sDescription = oOperatorData.additionalText;
			}
		}
		oField.setAdditionalValue(sDescription);

		this.onChange();

	}

	function _createControl(oCondition, iIndex, sId, oBindingContext) {

		var oOperator = FilterOperatorUtil.getOperator(oCondition.operator);
		if (!oOperator) {
			return null; // TODO: exception?
		}

		var oNullableType = _getFieldType.call(this, oOperator.name, iIndex);
		var oValueBindingContext = this._oManagedObjectModel.getContext(oBindingContext.getPath() + "values/" + iIndex + "/");

		var oControl;
		if (oOperator.createControl) {
			oControl = oOperator.createControl(oNullableType, oOperator, "$this>", iIndex);
		} else {
			oControl = new Field(sId, {
				delegate: _getDelegate.call(this),
				value: { path: "$this>", type: oNullableType, mode: 'TwoWay', targetType: 'raw' },
				editMode: {path: "$condition>operator", formatter: _getEditModeFromOperator},
				width: "100%"
			});
		}

		if (oControl.getMetadata().hasProperty("placeholder")) {
			if (iIndex === 0) {
				oControl.bindProperty("placeholder", {path: "$condition>operator", formatter: _getPlaceholderForOperator});
			} else { // from Field cannot switch placeholder
				oControl.bindProperty("placeholder", {path: "$i18n>valuehelp.DEFINECONDITIONS_TO"});
			}
		}

		oControl._iValueIndex = iIndex; // to find it for update
		oControl.addStyleClass("sapUiSmallPaddingBegin");
		if (oControl.attachChange) { // custom control might not have a change event
			oControl.attachChange(this.onChange.bind(this));
		}
		oControl.onpaste = this.onPaste.bind(this);
		oControl.setLayoutData(new GridData({span: {path: "$condition>operator", formatter: _getSpanForOperator}}));
		oControl.setBindingContext(oValueBindingContext, "$this");
		oControl.setBindingContext(oBindingContext, "$condition");

		return oControl;

	}

	function _getFieldType(sOperator, iIndex) {

		var oDataType = _getType.call(this);
		var oOperator = FilterOperatorUtil.getOperator(sOperator);

		if (oOperator.valueTypes[iIndex] && [Operator.ValueType.Self, Operator.ValueType.Static].indexOf(oOperator.valueTypes[iIndex]) === -1) {
			oDataType = oOperator._createLocalType(oOperator.valueTypes[iIndex]);
		}

		var bStaticText = false;

		if (oOperator.valueTypes[iIndex] === Operator.ValueType.Static) {
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

		return oNullableType;

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
			this.setProperty("conditions", aConditions, true); // do not invalidate whole DefineConditionPanel
		}

	}

	function _createInnerControls() {
		var oInvisibleOperatorText = new InvisibleText(this.getId() + "--ivtOperator", {text: "{$i18n>valuehelp.DEFINECONDITIONS_OPERATORLABEL}"});

		var oScrollContainer = new ScrollContainer({
			height: "100%",
			horizontal: false,
			vertical: true
		});

		oScrollContainer.addDependent(
			new ListFieldHelp(this.getId() + "--rowSelect-help", {
				items: { path:'om>/', templateShareable:false, template: new ListItem({key: "{om>key}", text: "{om>additionalText}", additionalText: "{om>info}"})},
				filterList: false,
				useFirstMatch: true
			})
		);

		var oGrid = new Grid(this.getId() + "--conditions", {
			width: "100%",
			hSpacing: 0,
			vSpacing: 0,
			containerQuery: true}
		).addStyleClass("sapUiMdcDefineConditionGrid");

		_createRow.call(this, undefined, oGrid, 0, null, 0); // create dummy row

		oScrollContainer.addContent(oInvisibleOperatorText);
		oScrollContainer.addContent(oGrid);

		var oAddBtn = new Button(this.getId() + "--addBtn", {
			press: this.addCondition.bind(this),
			type: ButtonType.Default,
			text: "{$i18n>valuehelp.DEFINECONDITIONS_ADDCONDITION}",
			layoutData: new GridData({span: "XL2 L3 M3 S3", indent: "XL9 L8 M8 S7", linebreak: true})}
		).addStyleClass("sapUiSmallPaddingBegin");

		oGrid.addContent(oAddBtn);

		this.setAggregation("_content", oScrollContainer);

	}

	function _renderConditions() {

		var aConditions = this.getConditions();
		var oGrid = this.byId("conditions");
		var aGridContent;
		var iRow = -1;
		var iIndex = 0;

		for (var i = 0; i < aConditions.length; i++) {
			var oCondition = aConditions[i];
			if (oCondition.validated !== ConditionValidated.Validated) {
				// show only validated conditions
				var oBindingContext = this._oManagedObjectModel.getContext("/conditions/" + i + "/");
				iRow++;

				if (!this.oOperatorModel) {
					// init operatorModel if first row is created (needed to check operator)
					this.oOperatorModel = new JSONModel();
					this.setModel(this.oOperatorModel, "om");
					_updateOperatorModel.call(this);
				}

				aGridContent = oGrid.getContent(); // to have current content
				if (aGridContent[iIndex] && aGridContent[iIndex].isA("sap.ui.mdc.Field")) {
					// row already exists -> update it
					iIndex = _updateRow.call(this, oCondition, oGrid, iIndex, oBindingContext, iRow);
				} else {
					// reate new row
					iIndex = _createRow.call(this, oCondition, oGrid, iIndex, oBindingContext, iRow);
				}
			}
		}

		// remove unused rows
		aGridContent = oGrid.getContent();
		while (aGridContent[iIndex] && aGridContent[iIndex] !== this.byId("addBtn")) {
			aGridContent[iIndex].destroy();
			iIndex++;
		}

		this._iRows = iRow + 1; // for AddButton visibility

	}

	function _createRow(oCondition, oGrid, iIndex, oBindingContext, iRow) {

		var sIdPrefix = this.getId() + "--" + iRow;

		if (!this._oOperatorFieldType) {
			this._oOperatorFieldType = new StringType({}, {minLength: 1});
		}

		var oOperatorField = new Field(sIdPrefix + "-operator", {
			value: {path: "$this>operator", type: this._oOperatorFieldType},
			width: "100%",
			display: "Description",
			fieldHelp: this.getId() + "--rowSelect-help",
			change: this.onSelectChange.bind(this),
			ariaLabelledBy: this.getId() + "--ivtOperator"
		})
		.addStyleClass("sapUiSmallPaddingBegin")
		.setLayoutData(new GridData({span: "XL3 L3 M3 S10", linebreak: true}))
		.setBindingContext(oBindingContext, "$this");

		// as selected key can be changed by reopening dialog listen on property change not on change event
		this._oObserver.observe(oOperatorField, {
			properties: ["value"]
		});

		oGrid.insertContent(oOperatorField, iIndex); // insert as add-Button is already at the end
		iIndex++;

		var oRemoveButton = new Button(sIdPrefix + "--removeBtnSmall", {
			press: this.removeCondition.bind(this),
			type: ButtonType.Transparent,
			icon: "sap-icon://decline",
			tooltip: "{$i18n>valuehelp.DEFINECONDITIONS_REMOVECONDITION}"
		})
		.addStyleClass("sapUiSmallPaddingBegin")
		.setLayoutData(new GridData({span: "XL1 L1 M1 S2", indent: {path: "$this>operator", formatter: _getIndentForOperator}, visibleXL: false, visibleL: false, visibleM: false, visibleS: true}))
		.setBindingContext(oBindingContext, "$this"); // to find condition on remove

		oGrid.insertContent(oRemoveButton, iIndex);
		iIndex++;

		if (oCondition) { // for initial dummy row don't create value fields (as we don't know the operator or type)
			for (var i = 0; i < oCondition.values.length; i++) {
				var oControl = _createControl.call(this, oCondition, i, sIdPrefix + "-values" + i, oBindingContext);
				if (oControl) {
					oGrid.insertContent(oControl, iIndex);
					iIndex++;
				}
			}
		}

		var oRemoveButton2 = new Button(sIdPrefix + "--removeBtnLarge", {
			press: this.removeCondition.bind(this),
			type: ButtonType.Transparent,
			icon: "sap-icon://decline",
			tooltip: "{$i18n>valuehelp.DEFINECONDITIONS_REMOVECONDITION}"
		})
		.addStyleClass("sapUiSmallPaddingBegin")
		.setLayoutData(new GridData({span: "XL1 L1 M1 S1", indent: {path: "$this>operator", formatter: _getIndentForOperator}, visibleXL: true, visibleL: true, visibleM: true, visibleS: false}))
		.setBindingContext(oBindingContext, "$this"); // to find condition on remove

		oGrid.insertContent(oRemoveButton2, iIndex);
		iIndex++;

		return iIndex;

	}

	function _getEditModeFromOperator(sOperator) {

		if (!sOperator) {
			return EditMode.Display;
		}

		var oOperator = FilterOperatorUtil.getOperator(sOperator);
		var bStaticText = false;

		if (oOperator && oOperator.valueTypes[0] === Operator.ValueType.Static) {
			bStaticText = true;
		}

		return bStaticText ? EditMode.Display : EditMode.Editable;

	}

	function _getIndentForOperator(sOperator) {

		var oOperator = sOperator && FilterOperatorUtil.getOperator(sOperator);

		if (!oOperator || !oOperator.valueTypes[0]) {
			return "XL8 L8 M8 S0";
		} else {
			return "";
		}

	}

	function _getSpanForOperator(sOperator) {

		var oOperator = sOperator && FilterOperatorUtil.getOperator(sOperator);

		if (oOperator && oOperator.valueTypes[1]) {
			return "XL4 L4 M4 S10";
		} else {
			return "XL8 L8 M8 S10";
		}

	}

	function _getPlaceholderForOperator(sOperator) {

		var oOperator = sOperator && FilterOperatorUtil.getOperator(sOperator);

		if (oOperator && oOperator.valueTypes[1]) {
			return oMessageBundle.getText("valuehelp.DEFINECONDITIONS_FROM");
		} else {
			return oMessageBundle.getText("valuehelp.DEFINECONDITIONS_VALUE");
		}

	}

	function _updateRow(oCondition, oGrid, iIndex, oBindingContext, iRow) {

		var sIdPrefix = this.getId() + "--" + iRow;
		var aGridContent = oGrid.getContent();
		var oNullableType;

		var oOperatorField = aGridContent[iIndex];
		oOperatorField.setBindingContext(oBindingContext, "$this");
		iIndex++;

		var oRemoveButton = aGridContent[iIndex];
		oRemoveButton.setBindingContext(oBindingContext, "$this");
		iIndex++;

		var oValueBindingContext;
		var oValue0Field = aGridContent[iIndex];
		var oValue1Field;
		if (oValue0Field.hasOwnProperty("_iValueIndex") && oValue0Field._iValueIndex === 0) {
			var sEditMode = _getEditModeFromOperator(oCondition.operator);
			if (oCondition.values.length > 0 || sEditMode === EditMode.Display) { // as static text for display contols is created after update
				oValueBindingContext = this._oManagedObjectModel.getContext(oBindingContext.getPath() + "values/0/");
				oValue0Field.setBindingContext(oValueBindingContext, "$this");
				oValue0Field.setBindingContext(oBindingContext, "$condition");
				if (oValue0Field.getMetadata().hasProperty("value") && (this._bUpdateType || !oValue0Field.getBindingInfo("value"))) {
					oNullableType = _getFieldType.call(this, oCondition.operator, 0);
					// change type for binding
					oValue0Field.bindProperty("value", {path: "$this>", type: oNullableType});
				}
				iIndex++;

				// value[1] only possible if value[0] exist
				oValue1Field = aGridContent[iIndex];
				if (oValue1Field.hasOwnProperty("_iValueIndex") && oValue1Field._iValueIndex === 1) {
					if (oCondition.values.length > 1) {
						oValueBindingContext = this._oManagedObjectModel.getContext(oBindingContext.getPath() + "values/1/");
						oValue1Field.setBindingContext(oValueBindingContext, "$this");
						if (oValue1Field.getMetadata().hasProperty("value") && (this._bUpdateType || !oValue1Field.getBindingInfo("value"))) {
							oNullableType = _getFieldType.call(this, oCondition.operator, 1);
							// change type for binding
							oValue1Field.bindProperty("value", {path: "$this>", type: oNullableType});
						}
						iIndex++;
					} else {
						oValue1Field.destroy();
					}
				} else if (oCondition.values.length > 1) {
					// insert new field
					oValue1Field = _createControl.call(this, oCondition, 1, sIdPrefix + "-values1", oBindingContext);
					if (oValue1Field) {
						oGrid.insertContent(oValue1Field, iIndex);
						iIndex++;
					}
				}
			} else {
				oValue0Field.destroy();
				oValue1Field = aGridContent[iIndex + 1];
				if (oValue1Field) {
					oValue1Field.destroy();
				}
			}
		} else if (oCondition.values.length > 0) {
			for (var i = 0; i < oCondition.values.length; i++) {
				var oControl = _createControl.call(this, oCondition, i, sIdPrefix + "-values" + i, oBindingContext);
				if (oControl) {
					oGrid.insertContent(oControl, iIndex);
					iIndex++;
				}
			}
		}

		aGridContent = oGrid.getContent(); // as field might be added or removed
		var oRemoveButton2 = aGridContent[iIndex];
		oRemoveButton2.setBindingContext(oBindingContext, "$this");
		iIndex++;

		return iIndex;

	}

	return DefineConditionPanel;

});
