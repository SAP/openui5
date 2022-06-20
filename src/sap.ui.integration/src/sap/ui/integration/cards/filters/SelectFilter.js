/*!
 * ${copyright}
 */
sap.ui.define([
	"./BaseFilter",
	"sap/m/Select",
	"sap/ui/core/ListItem",
	"sap/ui/model/json/JSONModel",
	"sap/ui/integration/util/BindingResolver"
], function (
	BaseFilter,
	Select,
	ListItem,
	JSONModel,
	BindingResolver
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
	 * @returns {object} Filter configuration with static items
	 */
	SelectFilter.prototype.getStaticConfiguration = function () {
		var oConfiguration =  this.getConfig();
		var sPath = "/";
		var aItems = this.getModel().getProperty(sPath);
		var aResolvedItems = [];

		if (oConfiguration.item && oConfiguration.item.path) {
			sPath = oConfiguration.item.path;
		}

		for (var i = 0; i < aItems.length; i++) {
			if (sPath === "/") {
				aResolvedItems.push(BindingResolver.resolveValue(oConfiguration.item, this, sPath + i));
			} else {
				aResolvedItems.push(BindingResolver.resolveValue(oConfiguration.item, this, sPath + "/" + i));
			}
		}

		var oStaticConfiguration = Object.assign({}, oConfiguration);
		delete oStaticConfiguration.item;
		oStaticConfiguration.items = aResolvedItems;

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
			this._setValue();
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