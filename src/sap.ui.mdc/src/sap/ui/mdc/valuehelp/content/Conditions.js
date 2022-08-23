/*!
 * ${copyright}
 */

sap.ui.define([
	'sap/ui/mdc/valuehelp/base/Content',
	'sap/ui/mdc/util/loadModules',
	'sap/ui/mdc/enum/SelectType',
	'sap/ui/mdc/enum/ConditionValidated',
	'sap/ui/mdc/util/Common'
], function(
	Content,
	loadModules,
	SelectType,
	ConditionValidated,
	Common
) {
	"use strict";
	/**
	 * Constructor for a new <code>Conditions</code> content.
	 *
	 * @param {string} [sId] ID for the new element, generated automatically if no ID is given
	 * @param {object} [mSettings] Initial settings for the new element
	 * @class Content for the {@link sap.ui.mdc.valuehelp.base.Container Container} element showing a condition panel.
	 * @extends sap.ui.mdc.valuehelp.base.Content
	 * @version ${version}
	 * @constructor
	 * @abstract
	 * @private
	 * @ui5-restricted sap.ui.mdc
	 * @since 1.95.0
	 * @experimental As of version 1.95
	 * @alias sap.ui.mdc.valuehelp.content.Conditions
	 * @ui5-metamodel This control/element also will be described in the UI5 (legacy) designtime metamodel
	 */
	 var Conditions = Content.extend(
		"sap.ui.mdc.valuehelp.content.Conditions" /** @lends sap.ui.mdc.valuehelp.content.Conditions.prototype */,
		{
			metadata: {
				library: "sap.ui.mdc",
				interfaces: [
					"sap.ui.mdc.valuehelp.ITypeaheadContent",
					"sap.ui.mdc.valuehelp.IDialogContent"
				],
				properties: {
//					/**
//					 * Internal property to bind the OK button to enable or disable it.
//					 */
//					_enableOK: {
//						type: "boolean",
//						group: "Appearance",
//						defaultValue: true,
//						visibility: "hidden"
//					}
					/**
					 * Label shown on condition panel.
					 */
					label: {
						type: "string"
					}
				},
				aggregations: {
				},
				associations: {
					/**
					 * Optional <code>FieldHelp</code>.
					 *
					 * This is an association that allows the usage of one <code>FieldHelp</code> instance for the value fields for the <code>Conditions</code>.

					 * <b>Note:</b> The value fields on the conditions UI are created by the used <code>DefineConditionPanel</code>. They cannot be accessed from outside.
					 The fields are single-value input, and the display is always set to <code>FieldDisplay.Value</code>. Only a <code>ValueHelp>/code> with a <code>TypeAhead</code> and a single-selection <code>MTable</code> can be used.

					 * <b>Note:</b> For <code>Boolean</code>, <code>Date</code>, or <code>Time</code> types, no <code>FieldHelp</code> should be added, but a default <code>FieldHelp</code> used instead.
					 */
					fieldHelp: {
						type: "sap.ui.mdc.ValueHelp",
						multiple: false
					}
				},
				events: {}
			}
		}
	);

//	var FilterOperatorUtil;

	Conditions.prototype.init = function () {
		Content.prototype.init.apply(this, arguments);
		this._oResourceBundle = sap.ui.getCore().getLibraryResourceBundle("sap.ui.mdc");
	};

	Conditions.prototype.exit = function () {

		Common.cleanup(this, [
			"_oScrollContainer", "_oDefineConditionPanel"
		]);

		Content.prototype.exit.apply(this, arguments);
	};

	Conditions.prototype.getContent = function () {
		return this._retrievePromise("content", function () {
			var aModules = [
				"sap/ui/mdc/field/DefineConditionPanel",
				"sap/ui/model/base/ManagedObjectModel" // TODO use on ValueHelp level? But then how to bind local properties?
//				"sap/ui/mdc/condition/FilterOperatorUtil"
			];
			if (this.provideScrolling()) {
				aModules.push("sap/m/ScrollContainer");
			}
			return loadModules(aModules).then(function (aModules) {
					var DefineConditionPanel = aModules[0];
					var ManagedObjectModel = aModules[1];
//					FilterOperatorUtil = aModules[2];
					var ScrollContainer = aModules.length > 2 && aModules[2];

					this._oManagedObjectModel = new ManagedObjectModel(this);
					this._oDefineConditionPanel = new DefineConditionPanel(
						this.getId() + "-DCP",
						{
							label: "{$help>/label}",
							conditions: "{$help>/conditions}",
							inputOK: "{$valueHelp>/_valid}",
							formatOptions: {path: "$help>/config", formatter: _convertConfig}, // TODO: change DefineConditionPanel to use Config
							conditionProcessed: _handleConditionProcessed.bind(this),
							fieldHelp: this.getFieldHelp() //TODO FieldHelp can only be set once and not modified?
						}
					).setModel(this._oManagedObjectModel, "$help");

					if (ScrollContainer) {
						this._oScrollContainer = new ScrollContainer(this.getId() + "-SC", {
							height: "100%",
							width: "100%",
							vertical: true,
							content: [this._oDefineConditionPanel]
						});

						this.setAggregation("displayContent", this._oScrollContainer);
						return this._oScrollContainer;
					} else {
						this.setAggregation("displayContent", this._oDefineConditionPanel);
						return this._oDefineConditionPanel;
					}
			}.bind(this));
		}.bind(this));
	};

	Conditions.prototype.getCount = function (aConditions) {
		var iCount = 0;

		for (var i = 0; i < aConditions.length; i++) {
			var oCondition = aConditions[i];
			if (oCondition.isEmpty !== true && oCondition.validated === ConditionValidated.NotValidated) {
				iCount++;
			}
		}
		return iCount;
	};

	Conditions.prototype.getUseAsValueHelp = function() {
		return false;
	};

	Conditions.prototype.getValueHelpIcon = function() {

		return "sap-icon://value-help";

	};

	Conditions.prototype.isFocusInHelp = function() {

		return true;

	};

	Conditions.prototype.getRequiresTokenizer = function() {
		// when only the conditions content is on the dialog the tokenizer should be shown.
		return true;
	};

	Conditions.prototype.getFormattedTitle = function(iCount) {
		var sTitle = Content.prototype.getFormattedTitle.apply(this, arguments);
		if (!sTitle) {
			sTitle = this._oResourceBundle.getText(iCount ? "valuehelp.DEFINECONDITIONS" : "valuehelp.DEFINECONDITIONSNONUMBER", iCount);
		}
		return sTitle;
	};

	Conditions.prototype.getFormattedShortTitle = function() {
		var sShortTitle = this.getShortTitle();
		if (!sShortTitle) {
			sShortTitle = this._oResourceBundle.getText("valuehelp.DEFINECONDITIONS.Shorttitle");
		}
		return sShortTitle;
	};

	Conditions.prototype.getFormattedTokenizerTitle = function(iCount) {
		var sTokenizerTitle = this.getTokenizerTitle();
		if (!sTokenizerTitle) {
			sTokenizerTitle = this._oResourceBundle.getText("valuehelp.DEFINECONDITIONS.TokenizerTitle" + (iCount === 0 ? "NoCount" : ""), iCount);
		}
		return sTokenizerTitle;
	};

	Conditions.prototype.getAriaAttributes = function(iMaxConditions) {

		return { // return default values, but needs to be implemented by specific content
			contentId: this.getId() + "-DCP", // as DefineConditionPanel might be created async, use fix ID
			ariaHasPopup: "dialog",
			roleDescription: null // no multi-selection
		};

	};

	Conditions.prototype.getContainerConfig = function () {
		return {
			'sap.ui.mdc.valuehelp.Popover': {
				showArrow: true,
				showHeader: true,
				getContentWidth: function () { return "500px"; },
				getFooter: function () {
					return this._retrievePromise("footer", function () {
						return loadModules(["sap/m/library", "sap/m/Button"]).then(function (aModules) {
							var oMLibrary = aModules[0];
							var ButtonType = oMLibrary.ButtonType;
							var Button = aModules[1];
							var oButtonOK = new Button(this.getId() + "-ok", {
								text: this._oResourceBundle.getText("valuehelp.OK"),
								enabled: "{$valueHelp>/_valid}",
								type: ButtonType.Emphasized,
								press: _handleOK.bind(this)
							});
							var oButtonCancel = new Button(this.getId() + "-cancel", {
								text: this._oResourceBundle.getText("valuehelp.CANCEL"),
								press: this.fireCancel.bind(this)
							});
							return [oButtonOK, oButtonCancel];
						}.bind(this));
					}.bind(this));
				}.bind(this)
			}
		};
	};

	function _handleOK(oEvent) {
//		var aConditions = this.getConditions();
//
//		// remove empty conditions
//		aConditions = Condition._removeEmptyConditions(aConditions);
//		aConditions = Condition._removeInitialFlags(aConditions);
//		FilterOperatorUtil.updateConditionsValues(aConditions); // to remove static text from static conditions
//
//		this.fireSetConditions({conditions: aConditions});
		this.fireConfirm({close: true});
	}

	function _handleConditionProcessed(oEvent) {
		var aNextConditions = this.getConditions();

		if (this._getMaxConditions() === 1) {	// TODO: Better treatment of conditions? DefineConditionPanel currently hijacks conditions
			aNextConditions = aNextConditions.filter(function(oCondition){
				return oCondition.validated === "NotValidated";
			});
		}

		// remove empty conditions
//		aConditions = Condition._removeEmptyConditions(aConditions);
//		aConditions = Condition._removeInitialFlags(aConditions);
//		FilterOperatorUtil.updateConditionsValues(aConditions); // to remove static text from static conditions

		this.fireSelect({type: SelectType.Set, conditions: aNextConditions});

	}

	function _convertConfig(oConfig) {

		// return formatOptions used by DefineConditionPanel
		var oFormatOptions = {};
		if (oConfig) {
			oFormatOptions.valueType = oConfig.dataType;
			oFormatOptions.maxConditions = oConfig.maxConditions;
			oFormatOptions.delegate = oConfig.delegate;
			oFormatOptions.delegateName = oConfig.delegateName;
			oFormatOptions.payload = oConfig.payload;
			oFormatOptions.operators = oConfig.operators;
			oFormatOptions.display = oConfig.display;
			oFormatOptions.defaultOperatorName = oConfig.defaultOperatorName;
		}

		return oFormatOptions;

	}

	return Conditions;
});
