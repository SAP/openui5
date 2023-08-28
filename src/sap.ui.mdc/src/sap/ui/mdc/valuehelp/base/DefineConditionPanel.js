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
	'sap/ui/mdc/field/ConditionsType',
	'sap/ui/mdc/field/splitValue',
	'sap/ui/mdc/enums/FieldEditMode',
	'sap/ui/mdc/enums/FieldDisplay',
	'sap/ui/mdc/enums/BaseType',
	'sap/ui/mdc/enums/ConditionValidated',
	'sap/ui/mdc/enums/OperatorValueType',
	'sap/ui/mdc/Field',
	'sap/ui/mdc/ValueHelp',
	'sap/ui/mdc/valuehelp/Popover',
	'sap/ui/mdc/valuehelp/content/FixedList',
	'sap/ui/mdc/valuehelp/content/FixedListItem',
	'sap/ui/model/base/ManagedObjectModel',
	'sap/ui/model/json/JSONModel',
	'sap/ui/model/resource/ResourceModel',
	'sap/ui/model/type/String',
	'sap/ui/model/ParseException',
	'sap/ui/core/library',
	'sap/ui/core/InvisibleText',
	'sap/ui/layout/Grid',
	'sap/ui/layout/GridData',
	'sap/m/library',
	'sap/m/Button',
	'sap/m/Panel',
	'sap/m/OverflowToolbar',
	'sap/m/OverflowToolbarLayoutData',
	'sap/m/ToolbarSpacer',
	'sap/m/Text',
	'sap/m/Title',
	'sap/ui/core/IconPool',
	'sap/ui/core/InvisibleMessage',
	'sap/ui/thirdparty/jquery'
], function(
		Control,
		ManagedObjectObserver,
		merge,
		deepEqual,
		Condition,
		FilterOperatorUtil,
		ConditionsType,
		splitValue,
		FieldEditMode,
		FieldDisplay,
		BaseType,
		ConditionValidated,
		OperatorValueType,
		Field,
		ValueHelp,
		Popover,
		FixedList,
		FixedListItem,
		ManagedObjectModel,
		JSONModel,
		ResourceModel,
		StringType,
		ParseException,
		coreLibrary,
		InvisibleText,
		Grid,
		GridData,
		mLibrary,
		Button,
		Panel,
		OverflowToolbar,
		OverflowToolbarLayoutData,
		ToolbarSpacer,
		Text,
		Title,
		IconPool,
		InvisibleMessage,
		jQuery
		) {
	"use strict";

	// translation utils
	var oMessageBundle = sap.ui.getCore().getLibraryResourceBundle("sap.ui.mdc");
	var oMessageBundleM = sap.ui.getCore().getLibraryResourceBundle("sap.m");
	sap.ui.getCore().attachLocalizationChanged(function() {
		oMessageBundle = sap.ui.getCore().getLibraryResourceBundle("sap.ui.mdc");
		oMessageBundleM = sap.ui.getCore().getLibraryResourceBundle("sap.m");
	});

	var ButtonType = mLibrary.ButtonType;
	var ValueState = coreLibrary.ValueState;
	var InvisibleMessageMode = coreLibrary.InvisibleMessageMode;
	var TextAlign = coreLibrary.TextAlign;
	var BackgroundDesign = mLibrary.BackgroundDesign;
	var ToolbarDesign = mLibrary.ToolbarDesign;
	var OverflowToolbarPriority = mLibrary.OverflowToolbarPriority;

	/**
	 * Constructor for a new <code>DefineConditionPanel</code>.
	 *
	 * @param {string} [sId] ID for the new control, generated automatically if no ID is given
	 * @param {object} [mSettings] Initial settings for the new control
	 *
	 * @class
	 * A <code>DefineConditionPanel</code> control is used inside the <code>ValueHelp</code> content to enter different types
	 * of conditions.
	 *
	 * @extends sap.ui.core.Control
	 *
	 * @author SAP SE
	 * @version ${version}
	 *
	 * @constructor
	 * @alias sap.ui.mdc.valuehelp.base.DefineConditionPanel
	 * @since 1.58.0
	 * @abstract
	 *
	 * @private
	 * @ui5-restricted sap.ui.mdc.valuehelp.content.Conditions
	 */
	var DefineConditionPanel = Control.extend("sap.ui.mdc.valuehelp.base.DefineConditionPanel", {
		metadata: {
			library: "sap.ui.mdc",
			properties: {
				/**
				 * Sets the conditions that represent the selected values of the help.
				 *
				 * <b>Note:</b> A condition must have the structure of {@link sap.ui.mdc.condition.ConditionObject ConditionObject}.
				 * @since 1.62.0
				 */
				conditions: {
					type: "object[]",
					group: "Data",
					defaultValue: [],
					byValue: true
				},

				/**
				 * Internal configuration
				 *
				 * <b>Note:</b> This property must not be set from outside, it used to forward the configuration of the <code>ValueHelp</code>
				 * @since 1.115.0
				 */
				config: {
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
				 * <code>ManagedObjectModel</code> of the calling value help and automatically update it.
				 *
				 * @since 1.87.0
				 */
				inputOK: {
					type: "boolean",
					defaultValue: true
				},

				/**
				 * Indicates if pagination is active
				 *
				 * @since 1.113.0
				 * @private
				 */
				_pagination: {
					type: "boolean",
					defaultValue: false,
					visibility: "hidden"
				}

			},
			aggregations: {
				/**
				 * Internal content that is rendered.
				 */
				_content: {
					type: "sap.ui.core.Control",
					multiple: false,
					visibility: "hidden"
				}
			},
			associations: {
				/**
				 * Optional <code>ValueHelp</code>.
				 *
				 * This is an association that allows the usage of one <code>ValueHelp</code> instance for the value fields for the <code>DefineConditionPanel</code>.
				 *
				 * <b>Note:</b> The fields are single-value input, and the display is always set to <code>FieldDisplay.Value</code>. Only a <code>ValueHelp</code> with a <code>TypeAhead</code> and single-selection <code>MTable</code> can be used.
				 *
				 * <b>Note:</b> For <code>Boolean</code>, <code>Date</code>, or <code>Time</code>, no <code>ValueHelp</code> should be added, but a default <code>ValueHelp</code> used instead.
				 */
				valueHelp: {
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
				properties: ["conditions", "config"]
			});

			this._iStartIndex = 0;
			this._iShownConditions = 10;
			this._iShownAdditionalConditions = 0; // to not switch page by addings conditions, new conditions are shown on the current page even if there are more than the limit
			this._sOperatorHelpId = this.getId() + "--rowSelect-help";

			this._oContentEventDelegate = {
				onpaste: this.onPaste
			};

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

			if (this.getConditions().length === 0 && !this._sConditionsTimer) {
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

			this.oInvisibleMessage.announce(oMessageBundle.getText("valuehelp.DEFINECONDITIONS_REMOVECONDITION_ANNOUNCE"), InvisibleMessageMode.Assertive);

			// try to reset valueState and value of value Fields inside the removed row
			var oGrid = this.byId("conditions");
			var aGridContent = oGrid.getContent();
			var iRow = -1;
			for (var i = 0; i < aGridContent.length; i++) {
				var oField = aGridContent[i];
				if (oField instanceof Field && oField.getValueHelp() === this._sOperatorHelpId) {
					// Operator field starts new row
					iRow++;
				}

				if (oField instanceof Field && oField.hasOwnProperty("_iValueIndex") && oField.getBindingContext("$this").getPath().startsWith(sPath)) {
					if (oField.isInvalidInput()) { // TODO: better way to find out parsing error
						oField.setValue(null); // to remove invalid value from parsing
					}
				}
			}

			if (aConditions.length === 1 && iIndex === 0) {
				// the only one existing condition is removed. -> add dummy condition to have it in update in one step
				this.addDummyCondition(1); // TODO: without setProperty to update condition at once?
				aConditions = this.getConditions();
			}

			if (iRow === 0 && this._iStartIndex > 0) {
				// there was only one row on page -> after removing it, go to previous page
				this._iStartIndex = this._iStartIndex - this._iShownConditions;
			}

			aConditions.splice(iIndex, 1);
			this.setProperty("conditions", aConditions, true); // do not invalidate whole DefineConditionPanel
			_checkInvalidInput.call(this, undefined); // check if invalid condition was removed

			this.fireConditionProcessed();
		},

		addCondition: function(oEvent) {
			var aConditions = this.getConditions();
			var oConfig = this.getConfig();
			var iMaxConditions = oConfig.maxConditions;

			var oGrid = this.byId("conditions");
			var aGridContent = oGrid.getContent();
			var iRows = 0;
			var iIndex = -1;
			for (var i = 0; i < aGridContent.length; i++) {
				var oField = aGridContent[i];
				if (oField instanceof Field && oField.getValueHelp() === this._sOperatorHelpId) {
					// Operator field starts new row
					iRows++;
					var oBindingContext = oField.getBindingContext("$this");
					var sPath = oBindingContext.getPath();
					var aMatch = sPath.match(/^.*\/(\d+)\/$/);
					if (aMatch) {
						iIndex = parseInt(aMatch[1]);
					}
				}
			}

			if (iMaxConditions === -1 || aConditions.length < iMaxConditions) {
				// create a new dummy condition for a new condition on the UI - must be removed later if not used or filled correct
				this.addDummyCondition(iIndex + 1);
				this._bFocusLastCondition = true; // as add-Button will disappear and focus should stay in DefineConditionPanel

				if (iRows >= this._iShownConditions) {
					this._iShownAdditionalConditions++;
				}
			}

			this.oInvisibleMessage.announce(oMessageBundle.getText("valuehelp.DEFINECONDITIONS_ADDCONDITION_ANNOUNCE"), InvisibleMessageMode.Assertive);
		},

		addDummyCondition: function(index) {
			var aOperators = _getOperators.call(this);
			var oOperator = _getDefaultOperator.call(this);
			var sOperator = oOperator.name;
			var oCondition = Condition.createCondition(sOperator, oOperator.valueDefaults ? oOperator.valueDefaults : [], undefined, undefined, ConditionValidated.NotValidated);

			if (oOperator.valueTypes[0] && oOperator.valueTypes[0] !== OperatorValueType.Static) {
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
			var aConditions = _getDefineConditions.call(this);

			_addStaticText.call(this, aConditions, true, false);

			if (aConditions.length === 0) {
				this.addDummyCondition();
			}
			if (aConditions.length < this._iStartIndex) {
				this._iStartIndex = 0;
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
				_addStaticText.call(this, aConditions, false, false); // as updateConditionsValues removes static text

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
				var oBindingContext = oField.getBindingContext("$this");
				var oCondition = oBindingContext.getObject();
				var sConditionPath = oBindingContext.getPath(); // Path to condition of the active control
				var iIndex = parseInt(sConditionPath.split("/")[2]); // index of current condition
				var aConditions = this.getConditions();
				if (iIndex >= 0) {
					oCondition = aConditions[iIndex]; // to get right instance
				}

				if (oOperator && oOperatorOld) {
					var bUpdate = false;

					if (!deepEqual(oOperator.valueTypes[0], oOperatorOld.valueTypes[0]) && oOperator.valueTypes[0] !== OperatorValueType.Static ) {
						// type changed -> remove entered value (only if changed by user in Select)
						// As Static text updated on condition change, don't delete it here.
						if (iIndex >= 0) {
							oCondition.values.forEach(function(value, index) {
								if (value !== null) {
									if ((oOperator.valueTypes[index] === OperatorValueType.Self && oOperatorOld.valueTypes[index] === OperatorValueType.SelfNoParse) ||
											(oOperator.valueTypes[index] === OperatorValueType.SelfNoParse && oOperatorOld.valueTypes[index] === OperatorValueType.Self)) {
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
				var oBindingContext = oField.getBindingContext("$this");
				var oCondition = oBindingContext.getObject();
				var sConditionPath = oBindingContext.getPath(); // Path to condition of the active control
				var iIndex = parseInt(sConditionPath.split("/")[2]); // index of current condition
				var aConditions = this.getConditions();
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
			// for the purpose to copy from column in Excel and paste as new conditions
			var sOriginalText = oEvent.originalEvent.clipboardData.getData('text/plain');
			var aSeparatedText = splitValue(sOriginalText, true); // check without BT support as if TAB is inside the Paste logic needs to be used anyhow

			if (aSeparatedText.length > 1) { // if no linebreak just process normal paste-logic
				var oSource = oEvent.srcControl;
				var sConditionPath = oSource.getBindingContext("$condition").getPath(); // Path to condition of the active control
				var iIndex = parseInt(sConditionPath.split("/")[2]); // index of current condition - to remove before adding new ones
				var aConditions = this.getConditions();
				var oFormatOptions = merge({}, this.getConfig());
				oFormatOptions.display = FieldDisplay.Value;
				oFormatOptions.getConditions = function() {return aConditions;}; // as condition where inserted will be removed
				oFormatOptions.defaultOperatorName = aConditions[iIndex].operator; // use current operator as default
				oFormatOptions.valueType = oFormatOptions.dataType;
				delete oFormatOptions.dataType;
				var oConditionsType = new ConditionsType(oFormatOptions);

				try {
					aConditions.splice(iIndex, 1); // remove old condition that is overwitten by pasting
					var aNewConditions = oConditionsType._parseValueToIndex(sOriginalText, "string", iIndex);
					oConditionsType.validateValue(aConditions);

					FilterOperatorUtil.checkConditionsEmpty(aNewConditions);
					this.setProperty("conditions", aNewConditions, true); // do not invalidate whole DefineConditionPanel

					this.fireConditionProcessed();
				} catch (error) {
					var oException = new ParseException(oMessageBundle.getText("field.PASTE_ERROR"));
					var mErrorParameters = {
						element: oSource,
						property: "value", // TODO: right property for custom content
						type: oConditionsType,
						newValue: sOriginalText,
						oldValue: "", // TODO
						exception: oException,
						message: oException.message
					};
					oSource.fireParseError(mErrorParameters, false, true); // mParameters, bAllowPreventDefault, bEnableEventBubbling
				}

				oConditionsType.destroy();

				oEvent.stopImmediatePropagation(true); // to prevent controls own logic
				oEvent.preventDefault(); // to prevent pasting string into INPUT
			}
		},

		cleanUp: function() {
			// of Dialog is closed all error messages and invalid input should be removed to be clean on reopening
			var oGrid = this.byId("conditions");
			var aGridContent = oGrid.getContent();
			for (var i = 0; i < aGridContent.length; i++) {
				var oField = aGridContent[i];
				if (oField instanceof Field && oField.hasOwnProperty("_iValueIndex")) {
					if (oField.isInvalidInput()) { // TODO: better was to find out parsing error
						oField.setValue(); // to remove invalid value from parsing
					}
				}
			}
			this.setProperty("inputOK", true, true); // do not invalidate whole DefineConditionPanel
			if (this._iStartIndex > 0 || this._iShownAdditionalConditions > 0) {
				this._iStartIndex = 0;
				this._iShownAdditionalConditions = 0;
				_renderConditions.call(this); // to have right paging on reopening
			}
		},

		/**
		 * Getter for the initial focusable <code>control</code> on the <code>DefineConditionPanel</code>.
		 *
		 * @returns {control} Control instance which could get the focus.
		 *
		 * @private
		 * @ui5-restricted sap.ui.mdc
		 */
		getInitialFocusedControl: function() {
			var oGrid = this.getAggregation("_content").getContent()[1];
			var oCtrl = oGrid.getContent()[0]; // 0=Operator Field, 2=first Value Field which might not exist
			return oCtrl;
		},

		// TODO: remove this function and replace by getValueHelp onde FieldHelp association is completetly removed.
		_getValueHelp: function() {

			return this.getValueHelp() || (this.getFieldHelp && null); // as getFieldHelp not exist in legacy-free UI5

		}
	});

	function _observeChanges(oChanges) {

		if (oChanges.name === "value") {
			// operator changed -> update controls
			_operatorChanged.call(this, oChanges.object, oChanges.current, oChanges.old);
		}

		if (oChanges.name === "config") {
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

			var oType = oChanges.current && oChanges.current.dataType;
			var oTypeOld = oChanges.old && oChanges.old.valueType;
			var sType = oType && oType.getMetadata().getName();
			var sTypeOld = oTypeOld && oTypeOld.getMetadata().getName();
			var oFormatOptions = oType && oType.getFormatOptions();
			var oFormatOptionsOld = oTypeOld && oTypeOld.getFormatOptions();
			var oConstraints = oType && oType.getConstraints();
			var oConstraintsOld = oTypeOld && oTypeOld.getConstraints();
			if (sType !== sTypeOld || !deepEqual(oFormatOptions, oFormatOptionsOld) || !deepEqual(oConstraints, oConstraintsOld)) {
				// operators might be changed if type changed
				// Field binding needs to be updated if type changed
				if (!bOperatorModelUpdated) { // don't do twice
					_updateOperatorModel.call(this);
				}

				if (this._sConditionsTimer) { // already re-rendering pending
					this._bUpdateType = true;
				} else if (aConditions.length > 0) {
					this._bUpdateType = true;
					_renderConditions.call(this);
					this._bUpdateType = false;
					_addStaticText.call(this, aConditions, true, true); // static text might changed if type changed
				}
			}
		}

		if (oChanges.name === "conditions" && !this._bConditionUpdateRunning) { // if Conditions are updated inside Timer, no additional update needed
			if (this._sConditionsTimer) {
				clearTimeout(this._sConditionsTimer);
				this._sConditionsTimer = null;
			}
			this._sConditionsTimer = setTimeout(function () {
				// on multiple changes (dummy row, static text...) perform only one update
				this._sConditionsTimer = null;
				this._bConditionUpdateRunning = true;
				this.updateDefineConditions();
				_renderConditions.call(this);
				this._bUpdateType = false; // might be set from pending type update
				this._bConditionUpdateRunning = false;
			}.bind(this), 0);
		}

	}

	function _operatorSupportsValueHelp(sKey) {
		return true;
		// var aValueHelpSupportedOperators = ["EQ", "NE"]; // only for this operators we use the ValueHelp on the value fields
		// return aValueHelpSupportedOperators.length === 0 || aValueHelpSupportedOperators.indexOf(sKey) >= 0;
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
				if (oValue0Field instanceof Field && !oValue0Field.isInvalidInput()) { // TODO: better was to find out parsing error // TODO: handle custom controls
					// if Field is in parsing error state, don't remove error
					oValue0Field.setValueState(ValueState.None);
					oValue0Field.setValueStateText();
				}
				oValue1Field = oGrid.getContent()[iIndex + 3]; // second field only exists if first field exist
				if (oValue1Field && oValue1Field.hasOwnProperty("_iValueIndex") && oValue1Field._iValueIndex === 1) {
					if (oValue1Field instanceof Field && !oValue1Field.isInvalidInput()) { // TODO: better was to find out parsing error // TODO: handle custom controls
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

			if (_operatorSupportsValueHelp(sKey)) {
				// enable the ValueHelp for the used value fields
				var sValueHelp = this._getValueHelp();
				oValue0Field && oValue0Field.setValueHelp && oValue0Field.setValueHelp(sValueHelp);
				oValue1Field && oValue1Field.setValueHelp && oValue1Field.setValueHelp(sValueHelp);
			} else {
				// remove the ValueHelp for the used value fields
				oValue0Field && oValue0Field.setValueHelp && oValue0Field.setValueHelp();
				oValue1Field && oValue1Field.setValueHelp && oValue1Field.setValueHelp();
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
				valueHelp: _operatorSupportsValueHelp(oCondition.operator) ? this._getValueHelp() : null
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
		oControl.addDelegate(this._oContentEventDelegate, true, this);
		oControl.setLayoutData(new GridData({span: {parts: [{path: "$condition>"}, {path: "$this>/config"}], formatter: _getSpanForValue.bind(this)}}));
		oControl.setBindingContext(oValueBindingContext, "$this");
		oControl.setBindingContext(oBindingContext, "$condition");
		// add fieldGroup to validate Condition only after both Fields are entered.
		oControl.setFieldGroupIds([oBindingContext.getPath()]); // use path to have a ID for every condition

		return oControl;

	}

	function _getFieldType(sOperator, iIndex) {

		var oDataType = _getType.call(this);
		var oOperator = FilterOperatorUtil.getOperator(sOperator);

		if (oOperator.valueTypes[iIndex] && [OperatorValueType.Self, OperatorValueType.Static].indexOf(oOperator.valueTypes[iIndex]) === -1) {
			oDataType = oOperator._createLocalType(oOperator.valueTypes[iIndex], oDataType);
		}

		var bStaticText = false;

		if (oOperator.valueTypes[iIndex] === OperatorValueType.Static) {
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
		var sOperatorName = this.getConfig().defaultOperatorName;
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

		var oConfig = this.getConfig();
		var aOperators = oConfig && oConfig.operators;

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

		var sFixedListId = this._sOperatorHelpId + "-pop-fl";
		var oFixedList = sap.ui.getCore().byId(sFixedListId);

		var oTemplate;
		if (bHasMultipleGroups) {
			oTemplate = new FixedListItem({key: "{om>key}", text: "{om>text}", additionalText: "{om>additionalText}", groupKey: "{om>groupId}", groupText: "{om>groupText}"});
		} else {
			oTemplate = new FixedListItem({key: "{om>key}", text: "{om>text}", additionalText: "{om>additionalText}"});
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
			var sText = oOperator.getLongText(_getBaseType.call(this, oType));

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

		var oConfig = this.getConfig();
		var oType = oConfig && oConfig.dataType;
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
		var oDelegate = this.getConfig().delegate;
		var oField = this.getConfig().control;
		var sBaseType = oDelegate ? oDelegate.getTypeMap(oField).getBaseType(sType, oFormatOptions, oConstraints) : BaseType.String; // if not configured use string

		if (sBaseType === BaseType.Unit) {
			sBaseType = BaseType.Numeric;
		}

		return sBaseType;

	}

	function _getDelegate() {

		var oConfig = this.getConfig();
		var sName = oConfig.delegateName || "sap/ui/mdc/field/FieldBaseDelegate";
		var oPayload = oConfig.payload;

		return {name: sName, payload: oPayload};

	}

	function _addStaticText(aConditions, bUpdateProperty, bTypeChange) {

		// for static operators add static text as value to render text control
		var oDataType = _getType.call(this);
		var aUpdate = [];
		var i = 0;
		for (i = 0; i < aConditions.length; i++) {
			var oCondition = aConditions[i];
			var oOperator = FilterOperatorUtil.getOperator(oCondition.operator);
			if (oOperator && oOperator.valueTypes[0] === OperatorValueType.Static && (oCondition.values.length === 0 || bTypeChange)) {
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

		if (bUpdateProperty && aUpdate.length > 0) {
			this.setProperty("conditions", aConditions, true); // do not invalidate whole DefineConditionPanel
		}

	}

	function _createInnerControls() {
		var oInvisibleOperatorText = new InvisibleText(this.getId() + "--ivtOperator", {text: "{$i18n>valuehelp.DEFINECONDITIONS_OPERATORLABEL}"});
		var oTitle = new Title(this.getId() + "-title", {text: {path: "$this>/label"}});
		var oButtonPrev = new Button(this.getId() + "--prev", {
			icon: IconPool.getIconURI("navigation-left-arrow"),
			tooltip: oMessageBundleM.getText("PAGINGBUTTON_PREVIOUS"),
			visible: {path: "$this>/_pagination"},
			layoutData: new OverflowToolbarLayoutData({
				priority: OverflowToolbarPriority.NeverOverflow
			}),
			press: _handlePrevious.bind(this)
		});
		var oButtonNext = new Button(this.getId() + "--next", {
			icon: IconPool.getIconURI("navigation-right-arrow"),
			tooltip: oMessageBundleM.getText("PAGINGBUTTON_NEXT"),
			visible: {path: "$this>/_pagination"},
			layoutData: new OverflowToolbarLayoutData({
				priority: OverflowToolbarPriority.NeverOverflow
			}),
			press: _handleNext.bind(this)
		});
		var oButtonRemoveAll = new Button(this.getId() + "--removeAll", {
			text: oMessageBundleM.getText("CONDITIONPANEL_REMOVE_ALL"),
			visible: {path: "$this>/_pagination"},
			layoutData: new OverflowToolbarLayoutData({
				priority: OverflowToolbarPriority.Low
			}),
			press: _handleRemoveAll.bind(this)
		});
		var oButtonInsert = new Button(this.getId() + "--insert", {
			icon: IconPool.getIconURI("add"),
			visible: {path: "$this>/_pagination"},
			layoutData: new OverflowToolbarLayoutData({
				priority: OverflowToolbarPriority.Low
			}),
			press: _handleInsert.bind(this)
		});
		var oPageCount = new Text(this.getId() + "--pageCount", {
			text: _getPageText.call(this),
			wrapping: false,
			textAlign: TextAlign.Center,
			visible: {path: "$this>/_pagination"},
			layoutData: new OverflowToolbarLayoutData({
				priority: OverflowToolbarPriority.NeverOverflow
			})
		});
		var oToolbar = new OverflowToolbar(this.getId() + "--toolbar", {
			width: "100%",
			design: ToolbarDesign.Transparent,
			content: [oTitle, new ToolbarSpacer(), oButtonPrev, oPageCount, oButtonNext, oButtonRemoveAll, oButtonInsert]
		});

		var oPanel = new Panel(this.getId() + "--panel", {
			headerToolbar: oToolbar,
			expanded: true,
			height: "100%",
			backgroundDesign: BackgroundDesign.Transparent}
		).addStyleClass("sapMdcDefineconditionPanel");

		oPanel.addDependent(
			new ValueHelp(this._sOperatorHelpId, {
				typeahead: new Popover(this._sOperatorHelpId + "-pop", {
									content: [new FixedList(this._sOperatorHelpId + "-pop-fl", {
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
				visibleS: {parts: [{path: "$this>/conditions"}, {path: "$this>/config"}], formatter: _getAddButtonVisible.bind(this)},
				visibleM: {parts: [{path: "$this>/conditions"}, {path: "$this>/config"}], formatter: _getAddButtonVisible.bind(this)},
				visibleL: {parts: [{path: "$this>/conditions"}, {path: "$this>/config"}], formatter: _getAddButtonVisible.bind(this)},
				visibleXL: {parts: [{path: "$this>/conditions"}, {path: "$this>/config"}], formatter: _getAddButtonVisible.bind(this)}}),
			ariaDescribedBy: this._oInvisibleAddOperatorButtonText
		});

		oGrid.addContent(oAddBtn);

		oGrid.attachValidateFieldGroup(_validateFieldGroup, this); // to validate conditions with more than one field

		this.setAggregation("_content", oPanel);

	}

	function _getAddButtonVisible(aConditions, oConfig) {

		var iMaxConditions = oConfig.hasOwnProperty("maxConditions") ? oConfig.maxConditions : -1;

		return iMaxConditions === -1 || aConditions.length < iMaxConditions;

	}

	function _getRemoveButtonVisible(aConditions, oConfig) {

		var iMaxConditions = oConfig.hasOwnProperty("maxConditions") ? oConfig.maxConditions : -1;

		// only on case of maxCondition==1 the Remove icons should be invisible
		return iMaxConditions !== 1;

	}

	function _renderConditions() {

		var aConditions = this.getConditions();
		var oGrid = this.byId("conditions");
		var oButtonPrev = this.byId("prev");
		var oButtonNext = this.byId("next");
		var oPageCount = this.byId("pageCount");
		var aGridContent;
		var iRow = -1;
		var iIndex = 0;
		var iDefineConditions = -1;
		var iShownConditions = this._iShownConditions + this._iShownAdditionalConditions;

		for (var i = 0; i < aConditions.length && iRow < iShownConditions; i++) {
			var oCondition = aConditions[i];
			var oOperator = FilterOperatorUtil.getOperator(oCondition.operator);
			if (oCondition.validated !== ConditionValidated.Validated || oOperator.exclude) {
				// show only validated conditions
				iDefineConditions++;
				if (iDefineConditions >= this._iStartIndex) {
					// show only conditions on this page
					iRow++;
					if (iRow < iShownConditions) {
						var oBindingContext = this._oManagedObjectModel.getContext("/conditions/" + i + "/");

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
			}
		}
		// remove unused rows
		aGridContent = oGrid.getContent();
		while (aGridContent[iIndex] && aGridContent[iIndex] !== this.byId("addBtn")) {
			aGridContent[iIndex].destroy();
			iIndex++;
		}

		if (this._bFocusLastCondition) {
			// focus last condition operator field after it is rendered
			iIndex = _getGridIndexOfLastRow.call(this, "-operator");
			// setting the focus on a field only work with a Timeout
			setTimeout(function() { aGridContent[iIndex].focus(); }, 0);
			this._bFocusLastCondition = false;
		}
		if (this._bFocusLastRemoveBtn) {
			// focus the remove-Button of the last condition row
			iIndex = _getGridIndexOfLastRowWithVisibleElement.call(this, ["-removeBtnLarge", "-removeBtnSmall"]);
			aGridContent[iIndex].focus();
			this._bFocusLastRemoveBtn = false;
		}

		oPageCount.setText(_getPageText.call(this));
		oButtonPrev.setEnabled(this._iStartIndex > 0);
		oButtonNext.setEnabled(iRow >= iShownConditions); // there is at least one more row than conditions are shown
		this.setProperty("_pagination", iDefineConditions >= iShownConditions);
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

	function _getGridIndexOfLastRow(sIdEndsWith) {
		var oGrid = this.byId("conditions");
		var aElements = oGrid.getContent();
		var n = aElements.length - 1;

		var sSearch = sIdEndsWith;

		while (n >= 0) {
			var oElement = aElements[n];
			if (oElement.getId().endsWith(sSearch)) {
				return n;
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
			editMode: FieldEditMode.Editable,
			multipleLines: false,
			valueHelp: this._sOperatorHelpId,
			change: this.onSelectChange.bind(this),
			ariaLabelledBy: this.getId() + "--ivtOperator"
		})
		.setLayoutData(new GridData({span: {parts: [{path: "$this>/conditions"}, {path: "$this>/config"}], formatter: _getSpanForOperator.bind(this)}, linebreak: true}))
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
			visibleS: {parts: [{path: "$this>/conditions"}, {path: "$this>/config"}], formatter: _getRemoveButtonVisible.bind(this)},
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
			visibleM: {parts: [{path: "$this>/conditions"}, {path: "$this>/config"}], formatter: _getRemoveButtonVisible.bind(this)},
			visibleL: {parts: [{path: "$this>/conditions"}, {path: "$this>/config"}], formatter: _getRemoveButtonVisible.bind(this)},
			visibleXL: {parts: [{path: "$this>/conditions"}, {path: "$this>/config"}], formatter: _getRemoveButtonVisible.bind(this)}
		}))
		.setBindingContext(oBindingContext, "$this"); // to find condition on remove

		oGrid.insertContent(oRemoveButton2, iIndex);
		iIndex++;

		return iIndex;

	}

	function _getEditModeFromOperator(sOperator, bInvalid) {

		if (!sOperator) {
			return this.getEditMode(); // do not change edit mode to prevent update if temporary no operator
		} else if (bInvalid) {
			return FieldEditMode.ReadOnly;
		}

		var oOperator = FilterOperatorUtil.getOperator(sOperator);
		var bStaticText = false;

		if (oOperator && oOperator.valueTypes[0] === OperatorValueType.Static) {
			bStaticText = true;
		}

		return bStaticText ? FieldEditMode.Display : FieldEditMode.Editable;

	}

	function _getIndentForOperator(sOperator) {

		var oOperator = sOperator && FilterOperatorUtil.getOperator(sOperator);

		if (!oOperator || !oOperator.valueTypes[0] || (oOperator.valueTypes[0] === OperatorValueType.Static && !oOperator.getStaticText)) {
			return "XL8 L8 M8 S0";
		} else {
			return "";
		}

	}

	function _getSpanForOperator(aConditions, oConfig) {
		var iMaxConditions = oConfig.hasOwnProperty("maxConditions") ? oConfig.maxConditions : -1;
		var sSpan = "XL3 L3 M3 ";

		if (iMaxConditions === 1) {
			sSpan += "S12";
		} else {
			sSpan += "S10";
		}
		return sSpan;
	}

	function _getSpanForValue(oCondition, oConfig) {
		var iMaxConditions = oConfig.hasOwnProperty("maxConditions") ? oConfig.maxConditions : -1;

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

		if (!bInvalid && oOperator.valueTypes.length > 0 && oOperator.valueTypes[0] !== OperatorValueType.Static) {
			// check only not static operators
			if (oOperator.valueTypes.length > 1 && oOperator.valueTypes[1]) {
				// two fields exist
				if (oField.hasOwnProperty("_iValueIndex") && oField._iValueIndex === 0) {
					oField2 = oGrid.getContent()[iIndex + 1];
				} else if (oField.hasOwnProperty("_iValueIndex") && oField._iValueIndex === 1) {
					oField2 = oGrid.getContent()[iIndex - 1];
				}
			}

			if (oField.getMetadata().getAllProperties().valueState && !oField.isInvalidInput() && (!oField2 || !oField2.isInvalidInput())) { // TODO: better was to find out parsing error
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

	function _getDefineConditions() {

		return this.getConditions().filter(function(oCondition) {
			var oOperator = FilterOperatorUtil.getOperator(oCondition.operator);
			return oCondition.validated !== ConditionValidated.Validated || oOperator.exclude;
		});

	}

	function _handleNext(oEvent) {

		this._iStartIndex = this._iStartIndex + this._iShownConditions;
		this._iShownAdditionalConditions = 0;
		_renderConditions.call(this);

	}

	function _handlePrevious(oEvent) {

		this._iStartIndex = this._iStartIndex - this._iShownConditions;
		if (this._iStartIndex < 0) {
			this._iStartIndex = 0;
		}
		this._iShownAdditionalConditions = 0;
		_renderConditions.call(this);

	}

	function _handleRemoveAll(oEvent) {

		var aConditions = this.getConditions().filter(function(oCondition) {
			var oOperator = FilterOperatorUtil.getOperator(oCondition.operator);
			return oCondition.validated === ConditionValidated.Validated && !oOperator.exclude;
		});
		this.addDummyCondition(aConditions.length + 1);

		this._iStartIndex = 0;
		this._iShownAdditionalConditions = 0;
		this.setProperty("conditions", aConditions, true); // do not invalidate whole DefineConditionPanel
		this.oInvisibleMessage.announce(oMessageBundle.getText("valuehelp.DEFINECONDITIONS_REMOVECONDITION_ANNOUNCE"), InvisibleMessageMode.Assertive);
		this.fireConditionProcessed();

	}

	function _handleInsert(oEvent) {

		var aConditions = this.getConditions();
		var oFormatOptions = this.getFormatOptions();
		var iMaxConditions = oFormatOptions.maxConditions;

		// get Index of first row (as validated conditions might exist and are hidden)
		var oGrid = this.byId("conditions");
		var aGridContent = oGrid.getContent();
		var iRows = 0;
		var iIndex = -1;
		for (var i = 0; i < aGridContent.length; i++) {
			var oField = aGridContent[i];
			if (oField instanceof Field && oField.getValueHelp() === this._sOperatorHelpId) {
				// Operator field starts new row
				iRows++;
				if (iRows === 1) {
					// determine index for condition in first row
					var oBindingContext = oField.getBindingContext("$this");
					var sPath = oBindingContext.getPath();
					var aMatch = sPath.match(/^.*\/(\d+)\/$/);
					if (aMatch) {
						iIndex = parseInt(aMatch[1]);
					}
				}
			}
		}

		if (iMaxConditions === -1 || aConditions.length < iMaxConditions) {
			// create a new dummy condition for a new condition on the UI - must be removed later if not used or filled correct
			this.addDummyCondition(iIndex);

			if (iRows >= this._iShownConditions) {
				this._iShownAdditionalConditions++;
			}
		}

		this.oInvisibleMessage.announce(oMessageBundle.getText("valuehelp.DEFINECONDITIONS_ADDCONDITION_ANNOUNCE"), InvisibleMessageMode.Assertive);

	}

	function _getPageText() {

		var aConditions = _getDefineConditions.call(this); // show only validated conditions
		var iPages = Math.ceil((aConditions.length - this._iShownAdditionalConditions) / this._iShownConditions);
		var iPage = Math.floor(this._iStartIndex / this._iShownConditions) + 1;
		var sText = oMessageBundle.getText("valuehelp.PAGE_COUNT", [iPage, iPages]);

		return sText;

	}

	return DefineConditionPanel;

});
