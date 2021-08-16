/*
 * ! ${copyright}
 */

sap.ui.define([
	"sap/ui/mdc/valuehelp/content/FixedList",
	"sap/ui/mdc/util/loadModules",
	"sap/ui/model/BindingMode"
], function(
	FixedList,
	loadModules,
	BindingMode
) {
	"use strict";

	var Bool = FixedList.extend("sap.ui.mdc.valuehelp.content.Bool", /** @lends sap.ui.mdc.valuehelp.content.Bool.prototype */
	{
		metadata: {
			library: "sap.ui.mdc",
			interfaces: [
				"sap.ui.mdc.valuehelp.ITypeaheadContent"
			]
		}
	});

	Bool.prototype.init = function() {

		FixedList.prototype.init.apply(this, arguments);

		this._oObserver.observe(this, {
			properties: ["_config"]
		});

	};

	Bool.prototype.exit = function() {

		if (this._oModel) {
			this._oModel.destroy();
			this._oModel = undefined;
		}

		FixedList.prototype.exit.apply(this, arguments);
	};

	Bool.prototype.getContent = function () {
		return this._retrievePromise("boolContent", function () {
			return loadModules([
				"sap/ui/mdc/field/ListFieldHelpItem",
				"sap/ui/model/json/JSONModel"
			]).then(function (aModules) {
				var ListFieldHelpItem = aModules[0];
				var JSONModel = aModules[1];
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
				_updateModel.call(this);

				var oItem = new ListFieldHelpItem(this.getId() + "-Item", {
					key: {path: "$Bool>key"},
					text: {path: "$Bool>text"}
				});

				this.setUseFirstMatch(true);
				this.setUseAsValueHelp(true);
				this.setFilterList(false);
				this.bindAggregation("items", {path: "$Bool>/items", template: oItem});
				this.setModel(this._oModel, "$Bool");

				return FixedList.prototype.getContent.apply(this, arguments);
				}.bind(this));
		}.bind(this));

	};

	Bool.prototype.getItemForValue = function (oConfig) {

		// as in bool case the description is comming from the type, search for description (first match) if parsing fails
		if (!oConfig.checkKey && oConfig.parsedValue === undefined && oConfig.value) {
			oConfig.checkDescription = true;
		}

		return FixedList.prototype.getItemForValue.call(this, oConfig);

	};

	Bool.prototype.getValueHelpIcon = function() {

		return "sap-icon://slim-arrow-down"; // need to be known before Content is created

	};

	Bool.prototype.getAriaAttributes = function(iMaxConditions) {

		return { // return default values, but needs to be implemented by specific content
			contentId: this.getId() + "-FL-List", // as list might be created async, use fix ID
			ariaHasPopup: "listbox",
			roleDescription: null // no multi-selection
		};

	};

	Bool.prototype.shouldOpenOnClick = function() {

		return false;

	};

	Bool.prototype._observeChanges = function(oChanges) {

		if (oChanges.type === "property" && oChanges.name === "_config") {
			_updateModel.call(this);
		}

		FixedList.prototype._observeChanges.apply(this, arguments);
	};

	function _updateModel() {
		if (this._oModel) {
			var oValueHelpModel = this.getModel("$valueHelp");
			var oConfig = oValueHelpModel && oValueHelpModel.getProperty("/_config");

			if (oConfig) {
				// use texts of used type
				var oType = oConfig.dataType;
				var oData = this._oModel.getData();
				if (oType && oData["type"] !== oType.getMetadata().getName()) {
					oData["type"] = oType.getMetadata().getName();
					var aItems = oData["items"];
					for (var i = 0; i < aItems.length; i++) {
						var oItem = aItems[i];
						oItem["text"] = oType.formatValue(oItem["key"], "string");
					}
					this._oModel.checkUpdate(true);
				}
			}
		}
	}

	/**
	 * Adds some item to the aggregation <code>items</code>.
	 *
	 * <b>Note:</b> Do not add items to the <code>Bool</code> content. The items will be filled by itself
	 *
	 * @param {sap.ui.mdc.field.ListFieldHelpItem} oItem The item to add; if empty, nothing is inserted
	 * @returns {this} Reference to <code>this</code> to allow method chaining
	 * @private
	 * @ui5-restricted sap.fe
	 * @MDC_PUBLIC_CANDIDATE
	 * @deprecated Not supported, the items are automatically set.
	 * @ui5-not-supported
	 * @name sap.ui.mdc.valuehelp.content.Bool#addItem
	 * @function
	 */

	/**
	 * Inserts a item to the aggregation <code>items</code>.
	 *
	 * <b>Note:</b> Do not add items to the <code>Bool</code> content. The items will be filled by itself
	 *
	 * @param {sap.ui.mdc.field.ListFieldHelpItem} oItem The item to add; if empty, nothing is inserted
	 * @param {int} iIndex The 0-based index the item should be inserted at; for a negative value of iIndex, the item is inserted at position 0; for a value greater than the current size of the aggregation, the item is inserted at the last position
	 * @returns {this} Reference to <code>this</code> to allow method chaining
	 * @private
	 * @ui5-restricted sap.fe
	 * @MDC_PUBLIC_CANDIDATE
	 * @deprecated Not supported, the items are automatically set.
	 * @ui5-not-supported
	 * @name sap.ui.mdc.valuehelp.content.Bool#insertItem
	 * @function
	 */

	/**
	 * Destroys all the items in the aggregation <code>items</code>.
	 *
	 * <b>Note:</b> Do not change items to the <code>Bool</code> content. The items will be filled by itself
	 *
	 * @returns {this} Reference to <code>this</code> to allow method chaining
	 * @private
	 * @ui5-restricted sap.fe
	 * @MDC_PUBLIC_CANDIDATE
	 * @deprecated Not supported, the items are automatically set.
	 * @ui5-not-supported
	 * @name sap.ui.mdc.valuehelp.content.Bool#destroyItems
	 * @function
	 */

	/**
	 * Removes all the controls from the aggregation <code>items</code>.
	 *
	 * <b>Note:</b> Do not change items to the <code>Bool</code> content. The items will be filled by itself
	 *
	 * @returns {sap.ui.mdc.field.ListFieldHelpItem[]} An array of the removed elements (might be empty)
	 * @private
	 * @ui5-restricted sap.fe
	 * @MDC_PUBLIC_CANDIDATE
	 * @deprecated Not supported, the items are automatically set.
	 * @ui5-not-supported
	 * @name sap.ui.mdc.valuehelp.content.Bool#removeAllItems
	 * @function
	 */

	/**
	 * Removes a item from the aggregation <code>items</code>.
	 *
	 * <b>Note:</b> Do not change items to the <code>Bool</code> content. The items will be filled by itself
	 *
	 * @param {int|string|sap.ui.mdc.field.ListFieldHelpItem} vItem The item to remove or its index or id
	 * @returns {sap.ui.mdc.field.ListFieldHelpItem} The removed item or null
	 * @private
	 * @ui5-restricted sap.fe
	 * @MDC_PUBLIC_CANDIDATE
	 * @deprecated Not supported, the items are automatically set.
	 * @ui5-not-supported
	 * @name sap.ui.mdc.valuehelp.content.Bool#removeItem
	 * @function
	 */

	return Bool;
});
