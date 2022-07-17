/*!
 * ${copyright}
 */

sap.ui.define([
//	'sap/ui/mdc/library',
	'sap/m/library',
	'sap/ui/mdc/field/FieldHelpBase',
	'sap/ui/mdc/condition/Condition',
	'sap/ui/base/ManagedObjectObserver'
], function(
//		library,
		mobileLibrary,
		FieldHelpBase,
		Condition,
		ManagedObjectObserver
		) {
	"use strict";

	var ButtonType = mobileLibrary.ButtonType;

	var DefineConditionPanel;
	var Toolbar;
	var ToolbarSpacer;
	var Button;
	var ManagedObjectModel;
	var FilterOperatorUtil;

	/**
	 * Constructor for a new ConditionFieldHelp.
	 *
	 * @param {string} [sId] ID for the new control, generated automatically if no ID is given
	 * @param {object} [mSettings] Initial settings for the new control
	 * @class A field help used in the <code>FieldHelp</code> association in <code>FieldBase</code> controls to show a popover of conditions.
	 * @extends sap.ui.mdc.field.FieldHelpBase
	 * @version ${version}
	 * @constructor
	 * @private
	 * @ui5-restricted sap.ui.mdc.field.FieldBase, sap.fe
	 * @MDC_PUBLIC_CANDIDATE
	 * @since 1.82.0
	 * @alias sap.ui.mdc.field.ConditionFieldHelp
	 * @ui5-metamodel This control/element also will be described in the UI5 (legacy) designtime metamodel
	 */
	var ConditionFieldHelp = FieldHelpBase.extend("sap.ui.mdc.field.ConditionFieldHelp", /** @lends sap.ui.mdc.field.ConditionFieldHelp.prototype */
	{
		metadata: {
			library: "sap.ui.mdc",
			properties: {
				/**
				 * Title text that appears in the popover header.
				 *
				 * @since 1.83.0
				 */
				title: {
					type: "string",
					group: "Appearance",
					defaultValue: ""
				},

				/**
				 * Label text that appears as label for the conditions.
				 *
				 * @since 1.84.0
				 */
				label: {
					type: "string",
					group: "Appearance",
					defaultValue: ""
				},

				/**
				 * Internal property to bind the OK button to enable or disable it.
				 */
				_enableOK: {
					type: "boolean",
					group: "Appearance",
					defaultValue: true,
					visibility: "hidden"
				}
			}
		}
	});

	ConditionFieldHelp.prototype.init = function() {

		FieldHelpBase.prototype.init.apply(this, arguments);

		this._oObserver = new ManagedObjectObserver(_observeChanges.bind(this));

		this._oObserver.observe(this, {
			properties: ["title"]
		});

		this._oResourceBundle = sap.ui.getCore().getLibraryResourceBundle("sap.ui.mdc");

	};

	// private function to initialize globals for qUnit tests
	ConditionFieldHelp._init = function() {

		FieldHelpBase._init.apply(this, arguments);

		DefineConditionPanel = undefined;
		Button = undefined;

	};

	ConditionFieldHelp.prototype.exit = function() {

		FieldHelpBase.prototype.exit.apply(this, arguments);

		this._oObserver.disconnect();
		this._oObserver = undefined;

	};

	ConditionFieldHelp.prototype.getIcon = function() {

//		return "sap-icon://filter-fields";
		return "sap-icon://value-help";

	};

	ConditionFieldHelp.prototype.isFocusInHelp = function() {

		return true;

	};

	ConditionFieldHelp.prototype.openByTyping = function() {

		return false;

	};

	ConditionFieldHelp.prototype.getAriaHasPopup = function() {

		return "dialog"; // For JAWS this kind of PopOver is like a dialog

	};

	ConditionFieldHelp.prototype._createPopover = function() {

		var oPopover = FieldHelpBase.prototype._createPopover.apply(this, arguments);

		if ((!DefineConditionPanel || !Toolbar || !ToolbarSpacer || !Button || !ManagedObjectModel || !FilterOperatorUtil) && !this._bModulesRequested) {
			DefineConditionPanel = sap.ui.require("sap/ui/mdc/field/DefineConditionPanel");
			Toolbar = sap.ui.require("sap/m/Toolbar");
			ToolbarSpacer = sap.ui.require("sap/m/ToolbarSpacer");
			Button = sap.ui.require("sap/m/Button");
			ManagedObjectModel = sap.ui.require("sap/ui/model/base/ManagedObjectModel");
			FilterOperatorUtil = sap.ui.require("sap/ui/mdc/condition/FilterOperatorUtil");
			if (!DefineConditionPanel || !Toolbar || !ToolbarSpacer || !Button || !ManagedObjectModel) {
				sap.ui.require(["sap/ui/mdc/field/DefineConditionPanel", "sap/m/Toolbar", "sap/m/ToolbarSpacer", "sap/m/Button",
				                "sap/ui/model/base/ManagedObjectModel", "sap/ui/mdc/condition/FilterOperatorUtil"], _ModulesLoaded.bind(this));
				this._bModulesRequested = true;
			}
		}

		if (oPopover) { // empty if loaded async
			oPopover.setShowArrow(true);
			oPopover.setTitle(this.getTitle());
			oPopover.setShowHeader(true);
			oPopover.setTitleAlignment("Center");
			oPopover.setContentWidth("500px"); // TODO: use CSS?
			oPopover.setResizable(false);
			_createDefineConditionPanel.call(this);
		}

		return oPopover;

	};

	function _createDefineConditionPanel() {

		if (!this._oDefineConditionPanel && DefineConditionPanel && Toolbar && ToolbarSpacer && Button && ManagedObjectModel && FilterOperatorUtil && !this._bModulesRequested) {
			this._oManagedObjectModel = new ManagedObjectModel(this);
			this._oDefineConditionPanel = new DefineConditionPanel(this.getId() + "-DCP", {
				conditions: {path: "$help>/conditions"},
				formatOptions: _getFormatOptions.call(this),
				label: "{$help>/label}",
				inputOK: "{$help>/_enableOK}"
			}).setModel(this._oManagedObjectModel, "$help");
			this._setContent(this._oDefineConditionPanel);

			var oButtonOK = new Button(this.getId() + "-ok", {
				text: this._oResourceBundle.getText("valuehelp.OK"),
				enabled: "{$help>/_enableOK}",
				type: ButtonType.Emphasized,
				press: _handleOk.bind(this)
			});

			var oButtonCancel = new Button(this.getId() + "-cancel", {
				text: this._oResourceBundle.getText("valuehelp.CANCEL"),
				press: _handleCancel.bind(this)
			});

			var oToolbar = new Toolbar(this.getId() + "-TB", {
				content: [new ToolbarSpacer(this.getId() + "-Spacer"), oButtonOK, oButtonCancel]
			}).setModel(this._oManagedObjectModel, "$help");

			var oPopover = this.getAggregation("_popover");
			if (oPopover) {
				oPopover.setFooter(oToolbar);
			}
		}

	}

	function _ModulesLoaded(fnDefineConditionPanel, fnToolbar, fnToolbarSpacer, fnButton, fnManagedObjectModel, fnFilterOperatorUtil) {

		DefineConditionPanel = fnDefineConditionPanel;
		Toolbar = fnToolbar;
		ToolbarSpacer = fnToolbarSpacer;
		Button = fnButton;
		ManagedObjectModel = fnManagedObjectModel;
		FilterOperatorUtil = fnFilterOperatorUtil;
		this._bModulesRequested = false;

		if (!this._bIsBeingDestroyed) {
			_createDefineConditionPanel.call(this);
		}

	}

	ConditionFieldHelp.prototype.open = function(bSuggestion) {

		FieldHelpBase.prototype.open.apply(this, arguments);

		var oPopover = this.getAggregation("_popover");
		if (oPopover && this._oDefineConditionPanel) {
			this._oDefineConditionPanel.setFormatOptions(_getFormatOptions.call(this));
			this._oDefineConditionPanel.getBinding("conditions").resume();
		}

		return this;

	};

	ConditionFieldHelp.prototype._handleAfterClose = function(oEvent) {

		this._oDefineConditionPanel.getBinding("conditions").suspend();
		setTimeout(function() { // as model update for focusleave on input might be async.
			this._oDefineConditionPanel.cleanUp();
			this.setProperty("_enableOK", true, true); // initialize
		}.bind(this), 0);

		FieldHelpBase.prototype._handleAfterClose.apply(this, arguments);

	};

	ConditionFieldHelp.prototype._getControlForSuggestion = function() {

		var oControl = FieldHelpBase.prototype._getControlForSuggestion.apply(this, arguments);
		var aIcons = oControl.getAggregation("_endIcon", []);

		if (aIcons.length === 1) {
			oControl = aIcons[0];
		}

		return oControl;

	};

	function _observeChanges(oChanges) {

		if (oChanges.name === "title") {
			var oPopover = this.getAggregation("_popover");
			if (oPopover) {
				oPopover.setTitle(this.getTitel());
			}
		}

	}

	ConditionFieldHelp.prototype.isValidationSupported = function() {
		// Input will not be validated
		return false;
	};

	ConditionFieldHelp.prototype.getItemForValue = function(vValue, vParsedValue, oInParameters, oOutParameters, oBindingContext, bCheckKeyFirst, bCheckKey, bCheckDescription) {

		// do not check input, just return object with key
		return {key: vParsedValue, description: undefined};

	};

	function _getFormatOptions() {

		if (this._oField && this._oField._getFormatOptions) {
			// if Field or FilterField -> use it's DataType, Delegate....
			return this._oField._getFormatOptions();
		} else {
			return {};
		}

	}

	function _handleOk(oEvent) {

		this.close();

		var aConditions = this.getConditions();
		aConditions = Condition._removeEmptyConditions(aConditions);
		aConditions = Condition._removeInitialFlags(aConditions);
		FilterOperatorUtil.updateConditionsValues(aConditions); // to remove static text from static conditions

		this.setProperty("conditions", aConditions, true); // do not invalidate whole FieldHelp

		this.fireSelect({conditions: aConditions, add: false, close: true});

	}

	function _handleCancel(oEvent) {

		this.close();

	}

	return ConditionFieldHelp;

});
