/*!
 * ${copyright}
 */
sap.ui.define([
	"./BaseFilter",
	"sap/m/Select",
	"sap/ui/core/ListItem",
	"sap/ui/model/json/JSONModel"
], function (
	BaseFilter,
	Select,
	ListItem,
	JSONModel
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
			value: this.getConfig().value
		};
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
			oConfig = this.getConfig();

		oSelect.attachChange(function (oEvent) {
			this.setValue(this.getValueForModel());

			var sManifestKey = "/sap.card/configuration/filters/" + this.getKey() + "/value",
				oParams = {};
			oParams[sManifestKey] = oEvent.getParameter("selectedItem").getKey();
			this.getCardInstance()._fireConfigurationChange(oParams);
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

		oSelect.setSelectedKey(oConfig.value);

		return oSelect;
	};

	return SelectFilter;
});