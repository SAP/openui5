/*
 * ! ${copyright}
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
					label: {
						type: "string"
					}
				},
				aggregations: {
					_defineConditionPanel: {
						type: "sap.ui.mdc.field.DefineConditionPanel",
						multiple: false,
						visibility: "hidden"
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
			return loadModules([
				"sap/ui/mdc/field/DefineConditionPanel",
				"sap/ui/model/base/ManagedObjectModel", // TODO use on ValueHelp level? But then how to bind local properties?
//				"sap/ui/mdc/condition/FilterOperatorUtil"
				"sap/m/ScrollContainer"
			]).then(function (aModules) {
					var DefineConditionPanel = aModules[0];
					var ManagedObjectModel = aModules[1];
//					FilterOperatorUtil = aModules[2];
					var ScrollContainer = aModules[2];

					this._oManagedObjectModel = new ManagedObjectModel(this);
					this._oDefineConditionPanel = new DefineConditionPanel(
						this.getId() + "-DCP",
						{
							label: "{$help>/label}",
							conditions: "{$help>/_conditions}",
							inputOK: "{$valueHelp>/_valid}",
							formatOptions: {path: "$help>/_config", formatter: _convertConfig}, // TODO: change DefineConditionPanel to use Config
							conditionProcessed: _handleConditionProcessed.bind(this)
						}
					).setModel(this._oManagedObjectModel, "$help");
					this.setAggregation("_defineConditionPanel", this._oDefineConditionPanel, true); // to have in control tree

					this._oScrollContainer = new ScrollContainer(this.getId() + "-SC", {
						height: "100%",
						width: "100%",
						vertical: true
					});

					this._oScrollContainer._oWrapper = this;
					this._oScrollContainer.getContent = function() {
						var aContent = [];
						var oDefineConditionPanel = this._oWrapper && this._oWrapper._oDefineConditionPanel;
						if (oDefineConditionPanel) {
							aContent.push(oDefineConditionPanel);
						}
						return aContent;
					};
					this.setAggregation("_displayContent", this._oScrollContainer);
					return this._oScrollContainer;
				}.bind(this));
		}.bind(this));
	};

	Conditions.prototype.getFooterContent = function () {
		return this._retrievePromise("footerContent", function () {
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
	};

	Conditions.prototype.getCount = function (aConditions) {
		var iCount = 0;
		// var aConditions = arguments[0] || this.get_conditions();
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

	Conditions.prototype.getRequiresTokenizer = function() {
		// when only the conditions content is on the dialog the tokenizer should be hidden.
		return false;
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

	Conditions.prototype.getAriaAttributes = function(iMaxConditions) {

		return { // return default values, but needs to be implemented by specific content
			contentId: this.getId() + "-DCP", // as DefineConditionPanel might be created async, use fix ID
			ariaHasPopup: "dialog",
			roleDescription: null // no multi-selection
		};

	};

	//Part of IPopover?
	Conditions.prototype.getPopoverConfiguration = function () {
		return {
			showArrow: true,
			showHeader: true
		};
	};

	function _handleOK(oEvent) {
//		var aConditions = this.get_conditions();
//
//		// remove empty conditions
//		aConditions = Condition._removeEmptyConditions(aConditions);
//		aConditions = Condition._removeInitialFlags(aConditions);
//		FilterOperatorUtil.updateConditionsValues(aConditions); // to remove static text from static conditions
//
//		this.fireSetConditions({conditions: aConditions});
		this.fireConfirm();
	}

	function _handleConditionProcessed(oEvent) {
		var aNextConditions = this.get_conditions();

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
			oFormatOptions.payload = oConfig.paylod;
			oFormatOptions.operators = oConfig.operators;
			oFormatOptions.display = oConfig.display;
		}

		return oFormatOptions;

	}

	return Conditions;
});
