/*!
 * ${copyright}
 */

sap.ui.define([
	'sap/ui/mdc/library',
	'sap/ui/mdc/field/FieldHelpBase',
	'sap/ui/mdc/condition/Condition',
	'sap/ui/base/ManagedObjectObserver',
	'sap/ui/model/FormatException',
	'sap/ui/model/ParseException',
	'sap/ui/model/json/JSONModel'
], function(
		library,
		FieldHelpBase,
		Condition,
		ManagedObjectObserver,
		FormatException,
		ParseException,
		JSONModel
		) {
	"use strict";

	var List;
	var StandardListItem;
	var mLibrary;
	var Filter;

	/**
	 * Constructor for a new BoolFieldHelp.
	 *
	 * @param {string} [sId] ID for the new control, generated automatically if no ID is given
	 * @param {object} [mSettings] Initial settings for the new control
	 * @class A field help used in the <code>FieldHelp</code> association in <code>FieldBase</code> controls that shows a list for Boolean values.
	 * @extends sap.ui.mdc.field.FieldHelpBase
	 * @version ${version}
	 * @constructor
	 * @private
	 * @ui5-restricted sap.ui.mdc.field.FieldBase
	 * @since 1.60.0
	 * @alias sap.ui.mdc.field.BoolFieldHelp
	 * @ui5-metamodel This control/element also will be described in the UI5 (legacy) designtime metamodel
	 */
	var BoolFieldHelp = FieldHelpBase.extend("sap.ui.mdc.field.BoolFieldHelp", /** @lends sap.ui.mdc.field.BoolFieldHelp.prototype */
	{
		metadata: {
			library: "sap.ui.mdc"
		}
	});

	BoolFieldHelp.prototype.init = function() {

		FieldHelpBase.prototype.init.apply(this, arguments);

		this._oObserver = new ManagedObjectObserver(_observeChanges.bind(this));

		this._oObserver.observe(this, {
			properties: ["filterValue", "conditions"]
		});

		this._oModel = new JSONModel({
			"type": "",
			"items": [
									{
										"key": true,
										"text": "true"
									},
									{
										"key": false,
										"text": "false"
									}
								]
		});

		this._oResourceBundle = sap.ui.getCore().getLibraryResourceBundle("sap.ui.mdc");

	};

	// private function to initialize globals for qUnit tests
	BoolFieldHelp._init = function() {

		FieldHelpBase._init.apply(this, arguments);

		List = undefined;
		StandardListItem = undefined;
		mLibrary = undefined;
		Filter = undefined;

	};

	BoolFieldHelp.prototype.exit = function() {

		FieldHelpBase.prototype.exit.apply(this, arguments);

		this._oObserver.disconnect();
		this._oObserver = undefined;

		this._oModel.destroy();
		this._oModel = undefined;

	};

	BoolFieldHelp.prototype.connect = function(oField) {

		FieldHelpBase.prototype.connect.apply(this, arguments);

		_updateModel.call(this);

		return this;

	};

	BoolFieldHelp.prototype._createPopover = function() {

		var oPopover = FieldHelpBase.prototype._createPopover.apply(this, arguments);

		if ((!List || !StandardListItem || !mLibrary) && !this._bListRequested) {
			List = sap.ui.require("sap/m/List");
			StandardListItem = sap.ui.require("sap/m/StandardListItem");
			mLibrary = sap.ui.require("sap/m/library");
			Filter = sap.ui.require("sap/ui/model/Filter");
			if (!List || !StandardListItem || !mLibrary) {
				sap.ui.require(["sap/m/List", "sap/m/StandardListItem", "sap/m/library", "sap/ui/model/Filter"], _ListLoaded.bind(this));
				this._bListRequested = true;
			}
		}

		if (oPopover) { // empty if loaded async
			var oField = this._getField();
			if (oField) {
				oPopover.setInitialFocus(oField);
			}

			_createList.call(this);
		}

		return oPopover;

	};

	function _createList() {

		if (!this._oList && List && StandardListItem && mLibrary && !this._bListRequested) {
			var oItemTemplate = new StandardListItem(this.getId() + "-item", {
				type: mLibrary.ListType.Active,
				title: "{text}"
			}).addStyleClass("sapMComboBoxNonInteractiveItem"); // to add focus outline to selected items

			this._oList = new List(this.getId() + "-List", {
				width: "100%",
				showNoData: false,
				mode: mLibrary.ListMode.SingleSelectMaster,
				rememberSelections: false,
				items: {path: "/items", template: oItemTemplate},
				itemPress: _handleItemPress.bind(this) // as selected item can be pressed
			}).addStyleClass("sapMComboBoxBaseList").addStyleClass("sapMComboBoxList");

			this._oList.setModel(this._oModel);
			_updateFilter.call(this, this.getFilterValue());
			_updateSelection.call(this);

			this._setContent(this._oList);

			if (this._bNavigate) {
				this._bNavigate = false;
				this.navigate(this._iStep);
				this._iStep = null;
			}
		}

	}

	function _ListLoaded(fnList, fnStandardListItem, fnLibrary, fnFilter) {

		List = fnList;
		StandardListItem = fnStandardListItem;
		mLibrary = fnLibrary;
		Filter = fnFilter;
		this._bListRequested = false;

		if (!this._bIsBeingDestroyed) {
			_createList.call(this);
		}

	}

	BoolFieldHelp.prototype.open = function(bSuggestion) {

		// focus should stay on Field
		var oPopover = this.getAggregation("_popover");
		if (oPopover) {
			var oField = this._getField();
			oPopover.setInitialFocus(oField);
		}

		FieldHelpBase.prototype.open.apply(this, arguments);

		return this;

	};

	BoolFieldHelp.prototype._handleAfterClose = function(oEvent) {

		if (this._bUpdateFilterAfterClose) {
			this._bUpdateFilterAfterClose = false;
			_updateFilter.call(this);
		}
		this._oList.removeStyleClass("sapMListFocus");

		FieldHelpBase.prototype._handleAfterClose.apply(this, arguments);

	};

	function _observeChanges(oChanges) {

		if (oChanges.name === "conditions") {
			_updateConditions.call(this, oChanges.current);
		}

		if (oChanges.name === "filterValue") {
			if (this._oList) {
				if (this._bClosing) {
					this._bUpdateFilterAfterClose = true;
				} else {
					_updateFilter.call(this, oChanges.current);
				}
			}
		}

	}

	BoolFieldHelp.prototype.openByTyping = function() {

		return true;

	};

	BoolFieldHelp.prototype.removeFocus = function() {

		if (this._oList) {
			this._oList.removeStyleClass("sapMListFocus");
		}

	};

	BoolFieldHelp.prototype.navigate = function(iStep) {

		var oPopover = this._getPopover();

		if (!oPopover || !this._oList) {
			// Popover or List not loaded right now
			this._bNavigate = true;
			this._iStep = iStep;
			return;
		}

		this._oList.addStyleClass("sapMListFocus"); // to show focus outline on navigated item
		var oSelectedItem = this._oList.getSelectedItem();
		var aItems = this._oList.getItems();
		var iItems = aItems.length;
		var iSelectedIndex = 0;
		var bLeaveFocus = false;

		if (oSelectedItem) {
			iSelectedIndex = this._oList.indexOfItem(oSelectedItem);
			iSelectedIndex = iSelectedIndex + iStep;
			if (iSelectedIndex < 0) {
				iSelectedIndex = 0;
				bLeaveFocus = true;
			} else if (iSelectedIndex >= iItems - 1) {
				iSelectedIndex = iItems - 1;
			}
		} else if (iStep >= 0){
			iSelectedIndex = iStep - 1;
		} else {
			iSelectedIndex = iItems + iStep;
		}

		var oItem = aItems[iSelectedIndex];
		if (oItem) {
			if (!oPopover.isOpen()) {
				this.open();
			}

			if (oItem !== oSelectedItem) {
				oItem.setSelected(true);
				var vKey = _getKey.call(this, oItem);
				var oCondition = _getConditionForKey.call(this, vKey);
				this.setProperty("conditions", [oCondition], true); // do not invalidate whole FieldHelp
				this.fireNavigate({value: oItem.getTitle(), key: vKey, condition: oCondition, itemId: oItem.getId()});
			} else if (bLeaveFocus) {
				this.fireNavigate({key: undefined, value: undefined, condition: undefined, itemId: undefined, leaveFocus: bLeaveFocus});
			}

		}

	};

	BoolFieldHelp.prototype._getTextOrKey = function(vValue, bKey, oBindingContext, oInParameters, oOutParameters, bNoRequest, oConditionModel, sConditionModelName) {

		if (vValue === null || vValue === undefined || vValue === "") {
			return null;
		} else if (!vValue && !bKey) {
			return null;
		}

		var aItems = this._oModel.getData()["items"];

		for (var i = 0; i < aItems.length; i++) {
			var oItem = aItems[i];
			if (bKey) {
				if (oItem["key"] === vValue) {
					return oItem["text"];
				}
			} else if (oItem["text"] === vValue) {
				return oItem["key"];
			}
		}

		var sError = this._oResourceBundle.getText("valuehelp.VALUE_NOT_EXIST", [vValue]);
		if (bKey) {
			throw new FormatException(sError);
		} else {
			throw new ParseException(sError);

		}

	};

	function _handleItemPress(oEvent) {
		var oItem = oEvent.getParameter("listItem");
		var bSelected = oItem.getSelected();

		if (bSelected) {
			var vKey = _getKey.call(this, oItem);
			var oCondition = _getConditionForKey.call(this, vKey);
			this.setProperty("conditions", [oCondition], true); // do not invalidate whole FieldHelp
			this.close();
			this.fireSelect({conditions: [oCondition], add: true, close: true});
		}
	}

	function _updateFilter(sText) {

		var oBinding = this._oList.getBinding("items");

		if (sText) {
			var oFilter = new Filter({path: "text", operator: "StartsWith", value1: sText});
			oBinding.filter(oFilter);
		} else {
			oBinding.filter();
		}

		this._oList.invalidate();

		_updateSelection.call(this); // to update selection

	}

	function _updateSelection() {

		if (this._oList) {
			var aConditions = this.getConditions();
			var vSelectedKey;
			var sText;
			var aItems = this._oList.getItems();
			var oOperator = this._getOperator();

			if (aConditions.length > 0 && (aConditions[0].operator === oOperator.name)) {
				vSelectedKey = aConditions[0].values[0];
				sText = this.getTextForKey(vSelectedKey);
			}

			for (var i = 0; i < aItems.length; i++) {
				var oItem = aItems[i];
				if (oItem.getTitle() === sText) {
					oItem.setSelected(true);
				} else {
					oItem.setSelected(false);
				}
			}
		}

	}

	function _updateConditions(aConditions) {

		_updateSelection.call(this);

	}

	function _getKey(oItem) {

		var oBindingContext = oItem.getBindingContext();
		var oDataModelRow = oBindingContext && oBindingContext.getObject();
		if (oDataModelRow) {
			return oDataModelRow["key"];
		}

	}

	function _getConditionForKey(vKey) {

		var oCondition;
		var sText = this.getTextForKey(vKey);

		if (sText) {
			oCondition = this._createCondition(vKey, sText);
		}

		return oCondition;

	}

	function _updateModel() {

		if (this._oField && this._oField._getFormatOptions) {
			// use texts of used type
			var oType = this._oField._getFormatOptions().valueType;
			var oData = this._oModel.getData();
			if (oType && oData["type"] !== oType.getMetadata().getName()) {
				oData["type"] = oType.getMetadata().getName();
				var aItems = oData["items"];
				for (var i = 0; i < aItems.length; i++) {
					var oItem = aItems[i];
					oItem["text"] = oType.formatValue(oItem["key"], "string");
				}
			}
		}

	}

	return BoolFieldHelp;

});
