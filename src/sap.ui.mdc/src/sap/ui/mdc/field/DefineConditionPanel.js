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
	'sap/ui/mdc/field/ConditionType',
	'sap/ui/mdc/enum/EditMode',
	'sap/ui/mdc/enum/FieldDisplay',
	'sap/ui/mdc/enum/BaseType',
	'sap/ui/mdc/enum/ConditionValidated',
	'sap/ui/mdc/Field',
	'sap/ui/mdc/ValueHelp',
	'sap/ui/mdc/valuehelp/Popover',
	'sap/ui/mdc/valuehelp/content/FixedList',
	'sap/ui/mdc/field/ListFieldHelpItem',
	'sap/ui/model/base/ManagedObjectModel',
	'sap/ui/model/json/JSONModel',
	'sap/ui/model/resource/ResourceModel',
	'sap/ui/model/type/String',
	'sap/ui/core/library',
	'sap/ui/core/InvisibleText',
	'sap/ui/layout/Grid',
	'sap/ui/layout/GridData',
	'sap/m/library',
	'sap/m/Button',
	'sap/m/Panel',
	'sap/base/Log',
	'sap/ui/core/InvisibleMessage',
	'sap/ui/thirdparty/jquery'
], function(
		Control,
		ManagedObjectObserver,
		merge,
		deepEqual,
		Condition,
		FilterOperatorUtil,
		Operator,
		ConditionType,
		EditMode,
		FieldDisplay,
		BaseType,
		ConditionValidated,
		Field,
		ValueHelp,
		Popover,
		FixedList,
		ListFieldHelpItem,
		ManagedObjectModel,
		JSONModel,
		ResourceModel,
		StringType,
		coreLibrary,
		InvisibleText,
		Grid,
		GridData,
		mLibrary,
		Button,
		Panel,
		Log,
		InvisibleMessage,
		jQuery
		) {
	"use strict";

	// translation utils
	var oMessageBundle = sap.ui.getCore().getLibraryResourceBundle("sap.ui.mdc");
	sap.ui.getCore().attachLocalizationChanged(function() {
		oMessageBundle = sap.ui.getCore().getLibraryResourceBundle("sap.ui.mdc");
	});

	var ButtonType = mLibrary.ButtonType;
	var ValueState = coreLibrary.ValueState;
	var InvisibleMessageMode = coreLibrary.InvisibleMessageMode;
	var aFieldHelpSupportedOperators = ["EQ", "NE"]; // only for this operators we use the FieldHelp on the value fields

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
	 * @extends sap.ui.core.Control
	 *
	 * @author SAP SE
	 * @version ${version}
	 *
	 * @constructor
	 * @alias sap.ui.mdc.field.DefineConditionPanel
	 * @since 1.58.0
	 * @abstract
	 *
	 * @private
	 * @ui5-restricted sap.ui.mdc.field.ValueHelpPanel, sap.ui.mdc.field.ConditionFieldHelp
	 */
	var DefineConditionPanel = Control.extend("sap.ui.mdc.field.DefineConditionPanel", {
		metadata: {
			library: "sap.ui.mdc",
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
				},

				/**
				 * The <code>label</code> for the <code>DefineConditionPanel</code> used as panel headerText.
				 *
				 * @since 1.84.0
				 */
				label: {
					type: "string",
					defaultValue: ""
				},

				/**
				 * If set, there has been no invalid user input.
				 *
				 * <b>Note:</b> This property must not be set from outside. It is a property because that way it can be bound to the
				 * <code>ManagedObjectModel</code> of the calling field help and automatically update it.
				 *
				 * @since 1.87.0
				 */
				inputOK: {
					type: "boolean",
					defaultValue: true
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
					multiple: false,
					visibility: "hidden"
				}
			},
			associations: {
				/**
				 * Optional <code>FieldHelp</code>.
				 *
				 * This is an association that allows the usage of one <code>FieldHelp</code> instance for the value fields for the <code>DefineConditionPanel</code>.

				 * <b>Note:</b> The fields are single-value input, and the display is always set to <code>FieldDisplay.Value</code>. Only a <code>ValueHelp</code> with a <code>TypeAhead</code> and single-selection <code>MTable</code> can be used.

				 * <b>Note:</b> For <code>Boolean</code>, <code>Date</code>, or <code>Time</code>, no <code>FieldHelp</code> should be added, but a default <code>FieldHelp</code> used instead.
				 */
				fieldHelp: {
					type: "sap.ui.mdc.ValueHelp",
					multiple: false
				}
			},
			events: {
				/**
				 * Event is fired if the user processes a condition. (Not known if changed.)
				 */
				conditionProcessed: {}
			}
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

			this.oInvisibleMessage = InvisibleMessage.getInstance();

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
			}

		},

		removeCondition: function(oEvent) {
			var oSource = oEvent.oSource;
			var oBindingContext = oSource.getBindingContext("$this");
			var aConditions = this.getConditions();
			var sPath = oBindingContext.getPath();
			var aMatch = sPath.match(/^.*\/(\d+)\/$/);
			var iIndex;
			if (aMatch) {
				iIndex = parseInt(aMatch[1]);
			}

			if (iIndex > 0 && aConditions.length - 1 === iIndex) {
				this._bFocusLastRemoveBtn = true; // as remove-Button will disappear and focus should set on the last row remove button
			}

			this.oInvisibleMessage.announce(oMessageBundle.getText("valuehelp.DEFINECONDITIONS_REMOVECONDITION_ANNOUNCE"), InvisibleMessageMode.Polite);

			// try to reset valueState and value of value Fields inside the removed row
			var oGrid = this.byId("conditions");
			var aGridContent = oGrid.getContent();
			var iRow = 0;
			for (var i = 0; i < aGridContent.length && iRow <= iIndex; i++) {
				var oField = aGridContent[i];
				if (iRow === iIndex && oField instanceof Field && oField.hasOwnProperty("_iValueIndex")) {
					if (oField._bParseError) { // TODO: better was to find out parsing error
						oField.setValue(null); // to remove invalid value from parsing
					}
				}
				if (oField instanceof Button && oField.getId().endsWith("-removeBtnLarge")) {
					iRow++;
				}
			}

			if (aConditions.length === 1 && iIndex === 0) {
				// the only one existing condition is removed. -> add dummy condition to have it in update in one step
				this.addDummyCondition(1); // TODO: without setProperty to update condition at once?
				aConditions = this.getConditions();
			}

			aConditions.splice(iIndex, 1);
			this.setProperty("conditions", aConditions, true); // do not invalidate whole DefineConditionPanel
			_checkInvalidInput.call(this, undefined); // check if invalid condition was removed

			this.fireConditionProcessed();
		},

		addCondition: function(oEvent) {
			var aConditions = this.getConditions();
			var oFormatOptions = this.getFormatOptions();
			var iMaxConditions = oFormatOptions.maxConditions;

			if (iMaxConditions === -1 || aConditions.length < iMaxConditions) {
				// create a new dummy condition for a new condition on the UI - must be removed later if not used or filled correct
				this.addDummyCondition(aConditions.length + 1);
				if (this.getConditions().length === iMaxConditions) {
					this._bFocusLastCondition = true; // as add-Button will disappear and focus should stay in DefineConditionPanel
				}
			}
		},

		addDummyCondition: function(index) {
			var aOperators = _getOperators.call(this);
			var oOperator = _getDefaultOperator.call(this);
			var sOperator = oOperator.name;
			var oCondition = Condition.createCondition(sOperator, oOperator.valueDefaults ? oOperator.valueDefaults : [], undefined, undefined, ConditionValidated.NotValidated);

			if (oOperator.valueTypes[0] && oOperator.valueTypes[0] !== Operator.ValueType.Static) {
				// mark the condition as initial and not modified by the user
				oCondition.isInitial = true;
			}

			FilterOperatorUtil.updateConditionValues(oCondition);
			FilterOperatorUtil.checkConditionsEmpty(oCondition, aOperators);
			var aConditions = this.getConditions();
			if (index !== undefined) {
				aConditions.splice(index, 0, oCondition);
			} else {
				aConditions.push(oCondition);
			}
			this.setProperty("conditions", aConditions, true); // do not invalidate whole DefineConditionPanel

			if (!oCondition.isInitial) {
				// static condition added, it is ready to use -> fire event
				this.fireConditionProcessed();
			}
		},

		updateDefineConditions: function() {
			var aConditions = this.getConditions().filter(function(oCondition) {
				var oOperator = FilterOperatorUtil.getOperator(oCondition.operator);
				return oCondition.validated !== ConditionValidated.Validated || oOperator.exclude;
			});

			_addStaticText.call(this, aConditions, true, false);

			if (aConditions.length === 0) {
				this.addDummyCondition();
			}
		},

		// called when the user has change the value of the condition field
		onChange: function(oEvent) {
			var oPromise = oEvent && oEvent.getParameter("promise");
			var oSourceControl = oEvent && oEvent.getSource();
			var fnHandleChange = function(oEvent) {
				var aOperators = _getOperators.call(this);
				var aConditions = this.getConditions();
				FilterOperatorUtil.checkConditionsEmpty(aConditions, aOperators);
				FilterOperatorUtil.updateConditionsValues(aConditions, aOperators);

				if (oEvent) {
					// remove isInitial when the user modified the value and the condition is not Empty
					aConditions.forEach(function(oCondition) {
						if (!oCondition.isEmpty) {
							delete oCondition.isInitial;
						}
					});
				}

				this.setProperty("conditions", aConditions, true); // do not invalidate whole DefineConditionPanel
			}.bind(this);

			if (oPromise) {
				oPromise.then(function(vResult) {
					this._bPendingChange = false;
					fnHandleChange({mParameters: {value: vResult}}); // TODO: use a real event?
					if (this._bPendingValidateCondition) {
						_validateCondition.call(this, oSourceControl);
						delete this._bPendingValidateCondition;
					}
				}.bind(this)).catch(function(oError) { // cleanup pending stuff
					this._bPendingChange = false;
					if (this._bPendingValidateCondition) {
						_validateCondition.call(this, oSourceControl);
						delete this._bPendingValidateCondition;
					}
				}.bind(this));

				this._bPendingChange = true; // TODO: handle multiple changes
				return;
			} else {
				fnHandleChange();
			}

		},

		onSelectChange: function(oEvent) {
			var oField = oEvent.getSource();
			var oPromise = oEvent.getParameter("promise"); // as with FixedList direct user input is parsed async wait for the promise

			oPromise.then(function (sKey) {
				var sOldKey = oField._sOldKey;
				var oOperator = FilterOperatorUtil.getOperator(sKey); // operator must exist as List is created from valid operators
				var oOperatorOld = sOldKey && FilterOperatorUtil.getOperator(sOldKey);
				var oCondition = oField.getBindingContext("$this").getObject();
				var aConditions = this.getConditions();
				var iIndex = FilterOperatorUtil.indexOfCondition(oCondition, aConditions);
				if (iIndex >= 0) {
					oCondition = aConditions[iIndex]; // to get right instance
				}

				if (oOperator && oOperatorOld) {
					var bUpdate = false;

					if (!deepEqual(oOperator.valueTypes[0], oOperatorOld.valueTypes[0]) && oOperator.valueTypes[0] !== Operator.ValueType.Static ) {
						// type changed -> remove entered value (only if changed by user in Select)
						// As Static text updated on condition change, don't delete it here.
						if (iIndex >= 0) {
							oCondition.values.forEach(function(value, index) {
								if (value !== null) {
									if ((oOperator.valueTypes[index] === Operator.ValueType.Self && oOperatorOld.valueTypes[index] === Operator.ValueType.SelfNoParse) ||
											(oOperator.valueTypes[index] === Operator.ValueType.SelfNoParse && oOperatorOld.valueTypes[index] === Operator.ValueType.Self)) {
										// as for Decimal values the type might change we need to format and parse again
										var oType = _getFieldType.call(this, oOperator.name, index);
										var oTypeOld = _getFieldType.call(this, oOperatorOld.name, index);
										var sValue = oTypeOld.formatValue(oCondition.values[index], "string");
										var vValue = oType.parseValue(sValue, "string");
										if (vValue !== oCondition.values[index]) {
											oCondition.values[index] = oType.parseValue(sValue, "string");
											bUpdate = true;
										}
									} else {
										oCondition.values[index] = null;
										bUpdate = true;
									}
								}
							}.bind(this));
						}
					}

					if (iIndex >= 0 && oOperator.valueDefaults) {
						// sets the default values for the operator back to default, if the condition is inital or the value is null
						oCondition.values.forEach(function(value, index) {
							if ((oCondition.isInitial && value !== oOperator.valueDefaults[index]) ||  (value === null)) {
								// set the default value and mark the condition as initial
								oCondition.values[index] = oOperator.valueDefaults[index];
								oCondition.isInitial = true;
								bUpdate = true;
							}
						});
					}

					if (!oOperator.valueTypes[1] && oOperatorOld.valueTypes[1]) {
						// switch from BT to EQ -> remove second value even if filled
						if (iIndex >= 0) {
							if (oCondition.values.length > 1 && oCondition.values[1]) {
								oCondition.values = oCondition.values.slice(0, 1);
								bUpdate = true;
							}
						}
					}

					if (oCondition.invalid) {
						delete oCondition.invalid;
						bUpdate = true;
					}
					if (bUpdate) {
						FilterOperatorUtil.checkConditionsEmpty(oCondition, _getOperators.call(this));
						this.setProperty("conditions", aConditions, true); // do not invalidate whole DefineConditionPanel
						_checkInvalidInput.call(this, false); // set imediately, not only if row left
					}
				}

				delete oField._sOldKey;
			}.bind(this)).catch(function (oException) { // if Operator in error state -> don't update values
				var oCondition = oField.getBindingContext("$this").getObject();
				var aConditions = this.getConditions();
				var iIndex = FilterOperatorUtil.indexOfCondition(oCondition, aConditions);
				if (iIndex >= 0) {
					oCondition = aConditions[iIndex]; // to get right instance
				}
				oCondition.invalid = true;
				this.setProperty("conditions", aConditions, true); // do not invalidate whole DefineConditionPanel
				oField._sOldKey = oField.getValue();
				_checkInvalidInput.call(this, true); // set imediately, not only if row left
			}.bind(this));

		},

		onPaste: function(oEvent) {
			var sOriginalText;
			var oSource = oEvent.srcControl;
			var oFormatOptions = this.getFormatOptions();
			var iMaxConditions = oFormatOptions.hasOwnProperty("maxConditions") ? oFormatOptions.maxConditions : -1;
			var sConditionPath = oSource.getBindingContext("$condition").getPath(); // Path to condition of the active control
			var iIndex = parseInt(sConditionPath.split("/")[2]); // index of current condition - to remove before adding new ones

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
					var oFormatOptions = merge({}, this.getFormatOptions());
					delete oFormatOptions.fieldHelpID;
					delete oFormatOptions.conditionModelName;
					oFormatOptions.maxConditions = 1;
					oFormatOptions.display = FieldDisplay.Value;
					//oFormatOptions.valueType = this._getFieldType.call(this, oOperator.name, 0); //TODO using the _getFieldType for better support of types
					var oConditionType = new ConditionType(oFormatOptions);

					var iLength = aSeparatedText.length;
					var aConditions = this.getConditions();
					for (var i = 0; i < iLength; i++) {
						if (aSeparatedText[i]) {
							var sValue = aSeparatedText[i].trim();

							var aValues = sValue.split(/\t/g); // if two values exist, use it as Between and create a "a...z" value
							if (aValues.length == 2 && aValues[0] && aValues[1]) {
								var oOperator = FilterOperatorUtil.getOperator("BT");

								sValue = oOperator.tokenFormat;
								for (var j = 0; j < 2; j++) {
									sValue = sValue.replace(new RegExp("\\{" + j + "\\}", "g"), aValues[j]);
								}

							}

							try {
								var oCondition = oConditionType.parseValue(sValue, "string");
								oConditionType.validateValue(oCondition);

								if (aConditions.length > iIndex) {
									// overwrite existing condition
									aConditions.splice(iIndex, 1, oCondition);
								} else {
									// add new condition
									aConditions.push(oCondition);
								}
								iIndex++;

							} catch (error) {
								Log.error("Paste handling", "the pasted value '" + sValue + "' could not be handled! " + error.message);
							}
						}
					}

					if (iMaxConditions >= 0 && aConditions.length > iMaxConditions) {
						aConditions.splice(iMaxConditions, aConditions.length - iMaxConditions);
					}

					if (oSource.setDOMValue) {
						oSource.setDOMValue(""); // otherwise binding update will be ignored
					}

					FilterOperatorUtil.checkConditionsEmpty(aConditions);
					this.setProperty("conditions", aConditions, true); // do not invalidate whole DefineConditionPanel

					this.fireConditionProcessed();

				}.bind(this), 0);
			}
		},

		cleanUp: function() {
			// of Dialog is closed all error messages and invalid input should be removed to be clean on reopening
			var oGrid = this.byId("conditions");
			var aGridContent = oGrid.getContent();
			for (var i = 0; i < aGridContent.length; i++) {
				var oField = aGridContent[i];
				if (oField instanceof Field && oField.hasOwnProperty("_iValueIndex")) {
					if (oField._bParseError) { // TODO: better was to find out parsing error
						oField.setValue(); // to remove invalid value from parsing
					}
				}
			}
			this.setProperty("inputOK", true, true); // do not invalidate whole DefineConditionPanel
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
			}.bind(this), 0);
		}

	}

	function _operatorChanged(oField, sKey, sOldKey) {

		oField._sOldKey = sOldKey; // to know in change event

		var iIndex = 0;

		// if type of operator changed -> remove binding and create it new later on
		if (sKey && sOldKey) {
			var oOperator = FilterOperatorUtil.getOperator(sKey);
			var oOperatorOld = FilterOperatorUtil.getOperator(sOldKey);
			var oGrid = oField.getParent();
			var oValue0Field;
			var oValue1Field;
			iIndex = oGrid.indexOfContent(oField);

			// find fields and initialize error state
			oValue0Field = oGrid.getContent()[iIndex + 2];
			if (oValue0Field && oValue0Field.hasOwnProperty("_iValueIndex") && oValue0Field._iValueIndex === 0) {
				if (oValue0Field instanceof Field && !oValue0Field._bParseError) { // TODO: better was to find out parsing error // TODO: handle custom controls
					// if Field is in parsing error state, don't remove error
					oValue0Field.setValueState(ValueState.None);
					oValue0Field.setValueStateText();
				}
				oValue1Field = oGrid.getContent()[iIndex + 3]; // second field only exists if first field exist
				if (oValue1Field && oValue1Field.hasOwnProperty("_iValueIndex") && oValue1Field._iValueIndex === 1) {
					if (oValue1Field instanceof Field && !oValue1Field._bParseError) { // TODO: better was to find out parsing error // TODO: handle custom controls
						// if Field is in parsing error state, don't remove error
						oValue1Field.setValueState(ValueState.None);
						oValue1Field.setValueStateText();
					}
				} else {
					oValue1Field = undefined;
				}
			} else {
				oValue0Field = undefined;
			}

			if (aFieldHelpSupportedOperators.length === 0 || aFieldHelpSupportedOperators.indexOf(sKey) >= 0) {
				// enable the fieldHelp for the used value fields
				var sFiedHelp = this.getFieldHelp();
				oValue0Field && oValue0Field.setFieldHelp && oValue0Field.setFieldHelp(sFiedHelp);
				oValue1Field && oValue1Field.setFieldHelp && oValue1Field.setFieldHelp(sFiedHelp);
			} else {
				// remove the fieldHelp for the used value fields
				oValue0Field && oValue0Field.setFieldHelp && oValue0Field.setFieldHelp();
				oValue1Field && oValue1Field.setFieldHelp && oValue1Field.setFieldHelp();
			}

			if (oOperator.createControl || oOperatorOld.createControl) {
				// custom control used -> needs to be created new
				if (oValue0Field) {
					oValue0Field.destroy();
				}
				if (oValue1Field) {
					oValue1Field.destroy();
				}
			} else {
				if (oValue0Field && oOperator.valueTypes[0] !== oOperatorOld.valueTypes[0]) {
					oValue0Field.unbindProperty("value");
				}
				if (oValue1Field && oOperator.valueTypes[1] !== oOperatorOld.valueTypes[1] && oOperatorOld.valueTypes[1]) { // 2nd Field only exist if there was a valueType defined
					oValue1Field.unbindProperty("value");
				}
			}
		}

		if (!sKey) { // TODO: remove? Because cannot longer happen as Field don't allow empty input because of used data type constraints
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
			if (oOperatorData.key === sKey) {
				sDescription = oOperatorData.text;
				break;
			}
		}
		oField.setAdditionalValue(sDescription);

		this.onChange();

	}

	function _createControl(oCondition, iIndex, sId, oBindingContext) {

		var oOperator = FilterOperatorUtil.getOperator(oCondition.operator);
		if (!oOperator || !oOperator.valueTypes[iIndex]) {
			return null; // TODO: exception?
		}

		var oNullableType = _getFieldType.call(this, oOperator.name, iIndex);
		var oValueBindingContext = this._oManagedObjectModel.getContext(oBindingContext.getPath() + "values/" + iIndex + "/");

		var oControl;
		if (oOperator.createControl) {
			oControl = oOperator.createControl(oNullableType, "$this>", iIndex, sId); // the returned control can be null, in this case the default Field will be used
		}

		if (!oControl) {
			oControl = new Field(sId, {
				delegate: _getDelegate.call(this),
				value: { path: "$this>", type: oNullableType, mode: 'TwoWay', targetType: 'raw' },
				editMode: {parts: [{path: "$condition>operator"}, {path: "$condition>invalid"}], formatter: _getEditModeFromOperator},
				multipleLines: false,
				width: "100%",
				fieldHelp: (aFieldHelpSupportedOperators.length === 0 || aFieldHelpSupportedOperators.indexOf(oCondition.operator) >= 0) ? this.getFieldHelp() : null
				//display: should always be FieldDisplay.Value
			});
		}

		if (oControl.getMetadata().hasProperty("placeholder")) {
			if (iIndex === 0) {
				oControl.bindProperty("placeholder", {path: "$condition>operator", formatter: _getPlaceholder1ForOperator});
			} else { // from Field cannot switch placeholder
				oControl.bindProperty("placeholder", {path: "$condition>operator", formatter: _getPlaceholder2ForOperator});
			}
		}

		oControl._iValueIndex = iIndex; // to find it for update
		if (oControl.attachChange) { // custom control might not have a change event
			oControl.attachChange(this.onChange.bind(this));
		}
		oControl.onpaste = this.onPaste.bind(this);
		oControl.setLayoutData(new GridData({span: {parts: [{path: "$condition>"}, {path: "$this>/formatOptions"}], formatter: _getSpanForValue.bind(this)}}));
		oControl.setBindingContext(oValueBindingContext, "$this");
		oControl.setBindingContext(oBindingContext, "$condition");
		// add fieldGroup to validate Condition only after both Fields are entered.
		oControl.setFieldGroupIds([oBindingContext.getPath()]); // use path to have a ID for every condition

		return oControl;

	}

	function _getFieldType(sOperator, iIndex) {

		var oDataType = _getType.call(this);
		var oOperator = FilterOperatorUtil.getOperator(sOperator);

		if (oOperator.valueTypes[iIndex] && [Operator.ValueType.Self, Operator.ValueType.Static].indexOf(oOperator.valueTypes[iIndex]) === -1) {
			oDataType = oOperator._createLocalType(oOperator.valueTypes[iIndex], oDataType);
		}

		var bStaticText = false;

		if (oOperator.valueTypes[iIndex] === Operator.ValueType.Static) {
			bStaticText = true;
			oDataType = _getDefaultType.call(this);
		}

		var sType = bStaticText ? BaseType.String : _getBaseType.call(this, oDataType);
		var oNullableType;

		switch (sType) {
			case BaseType.Numeric:
				var oFormatOptions = oDataType.getFormatOptions();
				if (oFormatOptions && oFormatOptions.hasOwnProperty("emptyString") && oFormatOptions.emptyString === null) {
					// given type can be used
					oNullableType = oDataType;
				} else {
					// "clone" type and make nullable
					oNullableType = _createNullableType(oDataType, { emptyString: null });
				}

				break;
			case BaseType.Date:
			case BaseType.Time:
			case BaseType.DateTime:
				oNullableType = oDataType;

				break;
			//TODO: how to handle unit fields?
			default:
				if (oDataType.getConstraints() && oDataType.getConstraints().hasOwnProperty("nullable") && oDataType.getConstraints().nullable === false) {
					// "clone" type and make nullable
					oNullableType = _createNullableType(oDataType);
					if (oDataType._bCreatedByOperator) {
						oNullableType = oOperator._createLocalType(oOperator.valueTypes[iIndex], oDataType);
					}
				} else {
					oNullableType = oDataType; // use given type or default string type
				}
				break;
		}

		return oNullableType;

	}

	function _createNullableType(oType, oNewFormatOprtions, oNewConstraints) {

		var Type = sap.ui.require(oType.getMetadata().getName().replace(/\./g, "/")); // type is already loaded because instance is provided
		var oFormatOptions = merge(oType.getFormatOptions(), oNewFormatOprtions || {});
		var oConstraints = merge(oType.getConstraints(), oNewConstraints || {});

		if (oConstraints.hasOwnProperty("nullable") && oConstraints.nullable === false) {
			oConstraints.nullable = true; // make nullable
		}

		//TODO oConstraints like maximum are not used inside the Double type
		return new Type(oFormatOptions, oConstraints);

	}

	function _getDefaultOperator() {
		var aOperators = _getOperators.call(this);
		var oOperator;
		var sOperatorName = this.getFormatOptions().defaultOperatorName;
		if (sOperatorName) {
			oOperator = FilterOperatorUtil.getOperator(sOperatorName);
		} else {
			var oType = _getType.call(this);
			var sType = _getBaseType.call(this, oType);
			oOperator = FilterOperatorUtil.getDefaultOperator(sType);
		}

		if (oOperator && aOperators.indexOf(oOperator.name) < 0) {
			// default operator not valid -> cannot use -> use first include-operator which requires some values
			for (var i = 0; i < aOperators.length; i++) {
				oOperator = FilterOperatorUtil.getOperator(aOperators[i]);
				if (!oOperator || oOperator.exclude || !oOperator.hasRequiredValues()) {
					oOperator = undefined;
				} else {
					break;
				}
			}
		}

		if (!oOperator) {
			// in case no operator was found, use the first operator
			oOperator = FilterOperatorUtil.getOperator(aOperators[0]);
		}
		return oOperator;
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

	function _hasMultipleOperatorGroups() {
		var firstGroupId;
		var aOperators = _getOperators.call(this);
		for (var i = 0; i < aOperators.length; i++) {
			var sOperator = aOperators[i];
			var oOperator = FilterOperatorUtil.getOperator(sOperator);

			if (!firstGroupId) {
				firstGroupId = oOperator.group.id;
			} else if (firstGroupId !== oOperator.group.id) {
				return true;
			}
		}
		return false;
	}

	function _updateOperatorModel() {

		if (!this.oOperatorModel) {
			return;
		}

		var oType = _getType.call(this);
		// assert(oOperatorConfig == null, "oOperatorConfig does not exist - no operators for Select control can be added");
		var aOperators = _getOperators.call(this);
		var aOperatorsData = [];

		var bHasMultipleGroups = _hasMultipleOperatorGroups.call(this);

		var sFixedListId = this.getId() + "--rowSelect-help-pop-fl";
		var oFixedList = sap.ui.getCore().byId(sFixedListId);

		var oTemplate;
		if (bHasMultipleGroups) {
			oTemplate = new ListFieldHelpItem({key: "{om>key}", text: "{om>text}", additionalText: "{om>additionalText}", groupKey: "{om>groupId}", groupText: "{om>groupText}"});
		} else {
			oTemplate = new ListFieldHelpItem({key: "{om>key}", text: "{om>text}", additionalText: "{om>additionalText}"});
		}
		oFixedList.bindAggregation("items", { path: 'om>/', templateShareable: false, template: oTemplate});
		oFixedList.setGroupable(bHasMultipleGroups);

		for (var i = 0; i < aOperators.length; i++) {
			var sOperator = aOperators[i];
			var oOperator = FilterOperatorUtil.getOperator(sOperator);
			if (!oOperator || (oOperator.showInSuggest !== undefined && oOperator.showInSuggest == false)) {
				continue;
			}

			// try to load the operator longText which is type dependent
			var sTxtKey = oOperator.textKey || "operators." + oOperator.name + ".longText";
			var sText = oOperator.getTypeText(sTxtKey, _getBaseType.call(this, oType).toLowerCase());
			if (sText === sTxtKey) {
				// when the returned text is the key, a type dependent longText does not exist and we use the default longText for the operator
				sText = oOperator.longText;
			}

			//Update the additionalInfo text for the operator
			var sAdditionalText = oOperator.additionalInfo;
			if (sAdditionalText === undefined)  {
				if (sAdditionalText !== "" && oOperator.formatRange)  {
					sAdditionalText = oOperator.formatRange( oOperator._getRange(undefined, oType), oType);
				} else if (!bHasMultipleGroups) {
					sAdditionalText = oOperator.group.text;
				}
			}

			aOperatorsData.push({
				key: oOperator.name,
				text: sText,
				additionalText: sAdditionalText,
				groupId: oOperator.group.id,
				groupText: oOperator.group.text
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
		var oFormatOptions = oType.getFormatOptions();
		var oConstraints = oType.getConstraints();
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
					var sText = oOperator.getStaticText(oDataType, _getBaseType.call(this, oDataType));
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

		var oPanel = new Panel({headerText: "{$this>/label}",
			expanded: true,
			height: "100%",
			backgroundDesign: "Transparent"}
		).addStyleClass("sapMdcDefineconditionPanel");

		oPanel.addDependent(
			new ValueHelp(this.getId() + "--rowSelect-help", {
				typeahead: new Popover(this.getId() + "--rowSelect-help-pop", {
									content: [new FixedList(this.getId() + "--rowSelect-help-pop-fl", {
													filterList: false,
													useFirstMatch: true
												})]
								})
			})
		);

		var oGrid = new Grid(this.getId() + "--conditions", {
			width: "100%",
			hSpacing: 0,
			vSpacing: 0,
			containerQuery: true}
		).addStyleClass("sapUiMdcDefineConditionGrid");

		_createRow.call(this, undefined, oGrid, 0, null, 0); // create dummy row

		oPanel.addContent(oInvisibleOperatorText);
		oPanel.addContent(oGrid);

		this._oInvisibleAddOperatorButtonText = new InvisibleText({
			text: oMessageBundle.getText("valuehelp.DEFINECONDITIONS_ADDCONDITION_DESCRIPTION")
		});
		oPanel.addContent(this._oInvisibleAddOperatorButtonText);

		var oAddBtn = new Button(this.getId() + "--addBtn", {
			press: this.addCondition.bind(this),
			type: ButtonType.Default,
			text: "{$i18n>valuehelp.DEFINECONDITIONS_ADDCONDITION}",
			layoutData: new GridData({
				span: "XL2 L3 M3 S3",
				indent: "XL9 L8 M8 S7",
				linebreak: true,
				visibleS: {parts: [{path: "$this>/conditions"}, {path: "$this>/formatOptions"}], formatter: _getAddButtonVisible.bind(this)},
				visibleM: {parts: [{path: "$this>/conditions"}, {path: "$this>/formatOptions"}], formatter: _getAddButtonVisible.bind(this)},
				visibleL: {parts: [{path: "$this>/conditions"}, {path: "$this>/formatOptions"}], formatter: _getAddButtonVisible.bind(this)},
				visibleXL: {parts: [{path: "$this>/conditions"}, {path: "$this>/formatOptions"}], formatter: _getAddButtonVisible.bind(this)}}),
			ariaDescribedBy: this._oInvisibleAddOperatorButtonText
		});

		oGrid.addContent(oAddBtn);

		oGrid.attachValidateFieldGroup(_validateFieldGroup, this); // to validate conditions with more than one field

		this.setAggregation("_content", oPanel);

	}

	function _getAddButtonVisible(aConditions, oFormatOptions) {

		var iMaxConditions = oFormatOptions.hasOwnProperty("maxConditions") ? oFormatOptions.maxConditions : -1;

		return iMaxConditions === -1 || aConditions.length < iMaxConditions;

	}

	function _getRemoveButtonVisible(aConditions, oFormatOptions) {

		var iMaxConditions = oFormatOptions.hasOwnProperty("maxConditions") ? oFormatOptions.maxConditions : -1;

		// only on case of maxCondition==1 the Remove icons should be invisible
		return iMaxConditions !== 1;

	}

	function _renderConditions() {

		var aConditions = this.getConditions();
		var oGrid = this.byId("conditions");
		var aGridContent;
		var iRow = -1;
		var iIndex = 0;

		for (var i = 0; i < aConditions.length; i++) {
			var oCondition = aConditions[i];
			var oOperator = FilterOperatorUtil.getOperator(oCondition.operator);
			if (oCondition.validated !== ConditionValidated.Validated || oOperator.exclude) {
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

		if (this._bFocusLastCondition) {
			// focus last condition after it is rendered
			aGridContent[0].focus();
			this._bFocusLastCondition = false;
		}
		if (this._bFocusLastRemoveBtn) {
			// focus the remove-Button of the last condition row
			iIndex = _getGridIndexOfLastRowWithVisibleElement.call(this, ["-removeBtnLarge", "-removeBtnSmall"]);
			aGridContent[iIndex].focus();
			this._bFocusLastRemoveBtn = false;
		}

	}

	function _getGridIndexOfLastRowWithVisibleElement(aIdEndsWith) {
		var oGrid = this.byId("conditions");
		var aElements = oGrid.getContent();
		var n = aElements.length - 1;

		if (!Array.isArray(aIdEndsWith)) {
			aIdEndsWith = [aIdEndsWith];
		}

		var i = 0;
		var sSearch = aIdEndsWith[i];

		while (n >= 0 && sSearch !== undefined) {
			var oElement = aElements[n];
			if (oElement.getId().endsWith(sSearch)) {
				var $check = jQuery(oElement.getDomRef());
				if ($check.is(":visible")) {
					return n;
				} else {
					i++;
					sSearch = aIdEndsWith[i];
				}
			}
			n--;
		}

		return 0;
	}

	function _createRow(oCondition, oGrid, iIndex, oBindingContext, iRow) {

		var sIdPrefix = this.getId() + "--" + iRow;

		if (!this._oOperatorFieldType) {
			this._oOperatorFieldType = new StringType({}, {minLength: 1});
		}

		var oOperatorField = new Field(sIdPrefix + "-operator", {
			value: {path: "$this>operator", type: this._oOperatorFieldType},
			width: "100%",
			display: FieldDisplay.Description,
			editMode: EditMode.Editable,
			multipleLines: false,
			fieldHelp: this.getId() + "--rowSelect-help",
			change: this.onSelectChange.bind(this),
			ariaLabelledBy: this.getId() + "--ivtOperator"
		})
		.setLayoutData(new GridData({span: {parts: [{path: "$this>/conditions"}, {path: "$this>/formatOptions"}], formatter: _getSpanForOperator.bind(this)}, linebreak: true}))
		.setBindingContext(oBindingContext, "$this");
		if (oBindingContext) {
			// validate only complete condition
			oOperatorField.setFieldGroupIds([oBindingContext.getPath()]); // use path to have a ID for every condition
		}

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
		.setLayoutData(new GridData({span: "XL1 L1 M1 S2",
			indent: {path: "$this>operator", formatter: _getIndentForOperator},
			visibleS: {parts: [{path: "$this>/conditions"}, {path: "$this>/formatOptions"}], formatter: _getRemoveButtonVisible.bind(this)},
			visibleM: false,
			visibleL: false,
			visibleXL: false
		}))
		.setBindingContext(oBindingContext, "$this"); // to find condition on remove
		if (oBindingContext) {
			// as Button is between Operatot and Value don't trigger validation on tabbing between
			oRemoveButton.setFieldGroupIds([oBindingContext.getPath()]); // use path to have a ID for every condition
		}

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
		.setLayoutData(new GridData({span: "XL1 L1 M1 S1",
			indent: {path: "$this>operator", formatter: _getIndentForOperator},
			visibleS: false,
			visibleM: {parts: [{path: "$this>/conditions"}, {path: "$this>/formatOptions"}], formatter: _getRemoveButtonVisible.bind(this)},
			visibleL: {parts: [{path: "$this>/conditions"}, {path: "$this>/formatOptions"}], formatter: _getRemoveButtonVisible.bind(this)},
			visibleXL: {parts: [{path: "$this>/conditions"}, {path: "$this>/formatOptions"}], formatter: _getRemoveButtonVisible.bind(this)}
		}))
		.setBindingContext(oBindingContext, "$this"); // to find condition on remove

		oGrid.insertContent(oRemoveButton2, iIndex);
		iIndex++;

		return iIndex;

	}

	function _getEditModeFromOperator(sOperator, bInvalid) {

		if (!sOperator) {
			return EditMode.Display;
		} else if (bInvalid) {
			return EditMode.ReadOnly;
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

		if (!oOperator || !oOperator.valueTypes[0] || (oOperator.valueTypes[0] === Operator.ValueType.Static && !oOperator.getStaticText)) {
			return "XL8 L8 M8 S0";
		} else {
			return "";
		}

	}

	function _getSpanForOperator(aConditions, oFormatOptions) {
		var iMaxConditions = oFormatOptions.hasOwnProperty("maxConditions") ? oFormatOptions.maxConditions : -1;
		var sSpan = "XL3 L3 M3 ";

		if (iMaxConditions === 1) {
			sSpan += "S12";
		} else {
			sSpan += "S10";
		}
		return sSpan;
	}

	function _getSpanForValue(oCondition, oFormatOptions) {
		var iMaxConditions = oFormatOptions.hasOwnProperty("maxConditions") ? oFormatOptions.maxConditions : -1;

		var oOperator = oCondition && FilterOperatorUtil.getOperator(oCondition.operator);
		var sSpan = "";

		if (oOperator && oOperator.valueTypes[1]) {
			sSpan = "XL4 L4 M4 ";
		} else {
			sSpan = "XL8 L8 M8 ";
		}

		if (iMaxConditions === 1) {
			sSpan += "S12";
		} else {
			sSpan += "S10";
		}
		return sSpan;
	}

	function _getPlaceholder1ForOperator(sOperator) {

		var oOperator = sOperator && FilterOperatorUtil.getOperator(sOperator);

		if (oOperator && oOperator.aLabels) {
			return oOperator.aLabels[0];
		} else if (oOperator && oOperator.valueTypes[1]) {
			return oMessageBundle.getText("valuehelp.DEFINECONDITIONS_FROM");
		} else {
			return oMessageBundle.getText("valuehelp.DEFINECONDITIONS_VALUE");
		}

	}

	function _getPlaceholder2ForOperator(sOperator) {

		var oOperator = sOperator && FilterOperatorUtil.getOperator(sOperator);

		if (oOperator && oOperator.aLabels) {
			return oOperator.aLabels[1];
		} else if (oOperator && oOperator.valueTypes[1]) {
			return oMessageBundle.getText("valuehelp.DEFINECONDITIONS_TO");
		}
	}

	function _updateRow(oCondition, oGrid, iIndex, oBindingContext, iRow) {

		var sIdPrefix = this.getId() + "--" + iRow;
		var aGridContent = oGrid.getContent();
		var oNullableType;

		var oOperatorField = aGridContent[iIndex];
		oOperatorField.setBindingContext(oBindingContext, "$this");
		if (oBindingContext) {
			oOperatorField.setFieldGroupIds([oBindingContext.getPath()]); // use path to have a ID for every condition
		}
		if (oOperatorField.getValueState() === ValueState.Error && !oCondition.invalid) {
			// remove error and show right value
			oOperatorField.setValue(oOperatorField.getValue());
		}
		iIndex++;

		var oRemoveButton = aGridContent[iIndex];
		oRemoveButton.setBindingContext(oBindingContext, "$this");
		if (oBindingContext) {
			// as Button is between Operatot and Value don't trigger validation on tabbing between
			oRemoveButton.setFieldGroupIds([oBindingContext.getPath()]); // use path to have a ID for every condition
		}
		iIndex++;

		var oValueBindingContext;
		var oValue0Field = aGridContent[iIndex];
		var oValue1Field;
		if (oValue0Field.hasOwnProperty("_iValueIndex") && oValue0Field._iValueIndex === 0) {
			if (oCondition.values.length > 0) {
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
				oValue0Field = undefined;
				oValue1Field = aGridContent[iIndex + 1];
				if (oValue1Field && oValue1Field.hasOwnProperty("_iValueIndex") && oValue1Field._iValueIndex === 1) {
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

	function _validateFieldGroup(oEvent) {

		if (this._bPendingChange) {
			this._bPendingValidateCondition = true;
			return;
		}

		// TODO: can there be FieldGroups set from outside?
		var oField = oEvent.getSource();
		while (!(oField.getParent() instanceof Grid)) {
			// event might be fired on inner control -> find Field
			oField = oField.getParent();
		}

		_validateCondition.call(this, oField);

	}

	function _validateCondition(oField) {

		var oGrid = oField.getParent();
		var iIndex = oGrid.indexOfContent(oField);
		var oBindingContext;

		if (oField.getId().endsWith("-operator")) {
			// operator field - use first value field fo validate
			oBindingContext = oField.getBindingContext("$this");
			iIndex = iIndex + 2; // as remove button is between operator an value field
			oField = oGrid.getContent()[iIndex];
		} else 		if (oField.getId().endsWith("-removeBtnSmall")) {
			// operator field - use first value field fo validate
			oBindingContext = oField.getBindingContext("$this");
			iIndex = iIndex + 1; // as remove button is between operator an value field
			oField = oGrid.getContent()[iIndex];
		} else {
			oBindingContext = oField.getBindingContext("$condition");
		}

		var oField2; // also update second Field if exist
		var oCondition = oBindingContext.getObject();
		var oOperator = FilterOperatorUtil.getOperator(oCondition.operator);
		var bInvalid = !!oCondition.invalid;

		if (!bInvalid && oOperator.valueTypes.length > 0 && oOperator.valueTypes[0] !== Operator.ValueType.Static) {
			// check only not static operators
			if (oOperator.valueTypes.length > 1 && oOperator.valueTypes[1]) {
				// two fields exist
				if (oField.hasOwnProperty("_iValueIndex") && oField._iValueIndex === 0) {
					oField2 = oGrid.getContent()[iIndex + 1];
				} else if (oField.hasOwnProperty("_iValueIndex") && oField._iValueIndex === 1) {
					oField2 = oGrid.getContent()[iIndex - 1];
				}
			}

			if (oField.getMetadata().getAllProperties().valueState && !oField._bParseError && (!oField2 || !oField2._bParseError)) { // TODO: better was to find out parsing error
				// if Field is in parsing error state, user entry is not transfered to condition, so validating makes no sense.
				var oType = oField.getBinding("value").getType(); // use nullable data type from Field - don't create new type for each check
				try {
					oOperator.validate(oCondition.values, oType);
					oField.setValueState(ValueState.None);
					oField.setValueStateText();
					if (oField2 && oField2.getMetadata().getAllProperties().valueState) {
						oField2.setValueState(ValueState.None);
						oField2.setValueStateText();
					}
				} catch (oException) {
					bInvalid = true;
					oField.setValueState(ValueState.Error);
					oField.setValueStateText(oException.message);
					if (oField2 && oField2.getMetadata().getAllProperties().valueState) {
						oField2.setValueState(ValueState.Error);
						oField2.setValueStateText(oException.message);
					}
				}
			}

		}

		// check if at least one condition has an error
		_checkInvalidInput.call(this, bInvalid);

		this.fireConditionProcessed();

	}

	function _checkInvalidInput(bInvalid) {

		var i = 0;

		if (bInvalid !== true) {
			// if already known that invalid input exist -> no additional check needed
			var aConditions = this.getConditions();
			for (i = 0; i < aConditions.length; i++) {
				if (aConditions[i].invalid) {
					bInvalid = true;
					break;
				}
			}
		}

		if (bInvalid !== true) {
			var oGrid = this.byId("conditions");
			var aContent = oGrid.getContent();
			bInvalid = false;
			for (i = 0; i < aContent.length; i++) {
				var oControl = aContent[i];
				if (oControl.hasOwnProperty("_iValueIndex") && oControl.getValueState && oControl.getValueState() === ValueState.Error) {
					bInvalid = true;
					break;
				}
			}
		}

		this.setProperty("inputOK", !bInvalid, true); // do not invalidate whole DefineConditionPanel

	}

	return DefineConditionPanel;

});
