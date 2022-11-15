/*!
 * ${copyright}
 */
sap.ui.define([
	"./BaseFilter",
	"sap/m/Select",
	"sap/ui/core/ListItem",
	"sap/ui/model/json/JSONModel",
	"sap/ui/integration/util/BindingResolver",
	"sap/base/util/merge"
], function (
	BaseFilter,
	Select,
	ListItem,
	JSONModel,
	BindingResolver,
	merge
) {
	"use strict";

	/**
	 * Constructor for a new <code>SelectFilter</code>.
	 *
	 * @param {string} [sId] ID for the new control, generated automatically if no ID is given
	 * @param {object} [mSettings] Initial settings for the new control
	 *
	 * @class
	 *
	 * @extends sap.ui.integration.cards.filters.BaseFilter
	 *
	 * @author SAP SE
	 * @version ${version}
	 *
	 * @constructor
	 * @private
	 * @since 1.84
	 * @alias sap.ui.integration.cards.filters.SelectFilter
	 */
	var SelectFilter = BaseFilter.extend("sap.ui.integration.cards.filters.SelectFilter", {
		metadata: {
			library: "sap.ui.integration",
			aggregations: {
				/**
				 * The internally used sap.m.Select control instance.
				 */
				_select: { type: "sap.m.Select", multiple: false, visibility: "hidden" }
			}
		},
		renderer: {
			apiVersion: 2
		}
	});

	SelectFilter.prototype.exit = function () {
		BaseFilter.prototype.exit.apply(this, arguments);

		if (this._oItemTemplate) {
			this._oItemTemplate.destroy();
		}
	};

	/**
	 * @override
	 */
	SelectFilter.prototype.getField = function () {
		return this._getSelect();
	};

	/**
	 * @override
	 */
	SelectFilter.prototype.onDataChanged = function () {
		var oSelect = this._getSelect();

		oSelect.setSelectedKey(this.getValue().value);
		this._syncValue();
	};

	/**
	 * @override
	 */
	SelectFilter.prototype.getValueForModel = function () {
		var oSelectedItem = this._getSelect().getSelectedItem();

		if (oSelectedItem) {
			return {
				value: oSelectedItem.getKey(),
				selectedItem: {
					title: oSelectedItem.getText(),
					key: oSelectedItem.getKey()
				}
			};
		}

		return {
			value: this._getSelect().getSelectedKey()
		};
	};

	/**
	 * @override
	 */
	SelectFilter.prototype.setValueFromOutside = function (sKey) {
		this._getSelect().setSelectedKey(BindingResolver.resolveValue(sKey, this.getCardInstance()));
		this._syncValue();
	};

	/**
	 * @returns {object} Filter configuration with static items
	 */
	SelectFilter.prototype.getStaticConfiguration = function () {
		var oConfiguration =  this.getConfig();
		var sPath = "/";
		var aItems;
		var aResolvedItems = [];
		var oResolvedItemTemplate;

		if (oConfiguration.item && oConfiguration.item.path) {
			sPath = oConfiguration.item.path;
		}

		aItems = this.getModel().getProperty(sPath);

		if (oConfiguration.item && oConfiguration.item.template) {
			oResolvedItemTemplate = oConfiguration.item.template;
			aResolvedItems = aItems.map(function (oItem, i) {
				var sBindingPath = sPath === "/" ? sPath + i : sPath + "/" + i;
				return BindingResolver.resolveValue(oResolvedItemTemplate, this, sBindingPath);
			}.bind(this));
		} else {
			aResolvedItems = aItems;
		}

		aResolvedItems = aResolvedItems.map(function (oItem) {
			return {
				key: oItem.key && oItem.key.toString(),
				title: oItem.title && oItem.title.toString()
			};
		});

		var oStaticConfiguration = merge({}, oConfiguration);
		delete oStaticConfiguration.item;
		oStaticConfiguration.items = aResolvedItems;
		oStaticConfiguration.value = this.getValueForModel().value;

		return oStaticConfiguration;
	};

	SelectFilter.prototype._getSelect = function () {
		var oControl = this.getAggregation("_select");
		if (!oControl) {
			oControl = this._createSelect();
			this.setAggregation("_select", oControl);
		}

		return oControl;
	};

	/**
	 * Constructs a Select control configured with the Filter's properties.
	 *
	 * @private
	 * @returns {sap.m.Select} configured instance
	 */
	SelectFilter.prototype._createSelect = function () {
		var oSelect = new Select(),
			sItemTemplateKey,
			sItemTemplateTitle,
			sItemsPath = "/",
			oConfig = this.getConfig(),
			oLabel = this.createLabel(oConfig);

		oSelect.attachChange(function (oEvent) {
			this._syncValue();
		}.bind(this));

		if (oConfig && oConfig.item) {
			sItemsPath = oConfig.item.path || sItemsPath;
		}

		if (oConfig && oConfig.item && oConfig.item.template) {
			sItemTemplateKey = oConfig.item.template.key;
			sItemTemplateTitle = oConfig.item.template.title;
		}

		if (oConfig && oConfig.items) {
			sItemTemplateKey = "{key}";
			sItemTemplateTitle = "{title}";
			this.setModel(new JSONModel(oConfig.items));
		}

		this._oItemTemplate = new ListItem({ key: sItemTemplateKey, text: sItemTemplateTitle });

		oSelect.bindItems({
			path: sItemsPath,
			template: this._oItemTemplate
		});

		oSelect.setSelectedKey(BindingResolver.resolveValue(oConfig.value, this.getCardInstance()));

		if (oLabel) {
			oSelect.addAriaLabelledBy(oLabel);
		}

		return oSelect;
	};

	return SelectFilter;
});