/*!
 * ${copyright}
 */
sap.ui.define([
	"./BaseFilter",
	"sap/m/ComboBox",
	"sap/ui/core/ListItem",
	"sap/ui/model/json/JSONModel",
	"sap/ui/integration/util/BindingResolver",
	"sap/base/util/merge"
], function (
	BaseFilter,
	ComboBox,
	ListItem,
	JSONModel,
	BindingResolver,
	merge
) {
	"use strict";

	/**
	 * Constructor for a new <code>ComboBoxFilter</code>.
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
	 * @since 1.121
	 * @alias sap.ui.integration.cards.filters.ComboBoxFilter
	 */
	const ComboBoxFilter = BaseFilter.extend("sap.ui.integration.cards.filters.ComboBoxFilter", {
		metadata: {
			library: "sap.ui.integration",
			aggregations: {
				/**
				 * The internally used sap.m.ComboBox control instance.
				 */
				_comboBox: {
					type: "sap.m.ComboBox",
					multiple: false,
					visibility: "hidden"
				}
			}
		},
		renderer: {
			apiVersion: 2
		}
	});

	ComboBoxFilter.prototype.exit = function () {
		BaseFilter.prototype.exit.apply(this, arguments);

		if (this._oItemTemplate) {
			this._oItemTemplate.destroy();
		}
	};

	/**
	 * @override
	 */
	ComboBoxFilter.prototype.getField = function () {
		return this._getComboBox();
	};

	/**
	 * @override
	 */
	ComboBoxFilter.prototype.onDataChanged = function () {
		const oComboBox = this._getComboBox();

		if (oComboBox.getSelectedKey()) {
			oComboBox.setSelectedKey(oComboBox.getSelectedKey());
		}

		this._syncValue();
	};

	/**
	 * @override
	 */
	ComboBoxFilter.prototype.getValueForModel = function () {
		const oSelectedItem = this._getComboBox().getSelectedItem();

		if (oSelectedItem) {
			return {
				value: this._getComboBox().getValue(),
				selectedItem: {
					title: oSelectedItem.getText(),
					key: oSelectedItem.getKey(),
					additionalText: oSelectedItem.getAdditionalText()
				}
			};
		}

		return {
			value: this._getComboBox().getValue()
		};
	};

	/**
	 * @override
	 */
	ComboBoxFilter.prototype.setValueFromOutside = function (sKey) {
		this._getComboBox().setSelectedKey(BindingResolver.resolveValue(sKey, this.getCardInstance()));
		this._syncValue();
	};

	/**
	 * @returns {object} Filter configuration with static items
	 */
	ComboBoxFilter.prototype.getStaticConfiguration = function () {
		const oConfiguration = this.getConfig();
		let sPath = "/";
		let aResolvedItems = [];
		let oResolvedItemTemplate;

		if (oConfiguration.item && oConfiguration.item.path) {
			sPath = oConfiguration.item.path;
		}

		const aItems = this.getModel().getProperty(sPath);

		if (oConfiguration.item && oConfiguration.item.template) {
			oResolvedItemTemplate = oConfiguration.item.template;
			aResolvedItems = aItems.map(function (oItem, i) {
				const sBindingPath = sPath === "/" ? sPath + i : sPath + "/" + i;
				return BindingResolver.resolveValue(oResolvedItemTemplate, this, sBindingPath);
			}.bind(this));
		} else {
			aResolvedItems = aItems;
		}

		aResolvedItems = aResolvedItems.map((oItem) => {
			return {
				key: oItem.key && oItem.key.toString(),
				title: oItem.title && oItem.title.toString(),
				additionalText: oItem.additionalText && oItem.additionalText.toString()
			};
		});

		const oStaticConfiguration = merge({}, oConfiguration);
		delete oStaticConfiguration.item;
		oStaticConfiguration.items = aResolvedItems;
		oStaticConfiguration.value = this.getValueForModel().value;

		return oStaticConfiguration;
	};

	ComboBoxFilter.prototype._getComboBox = function () {
		let oControl = this.getAggregation("_comboBox");
		if (!oControl) {
			oControl = this._createComboBox();
			this.setAggregation("_comboBox", oControl);
		}

		return oControl;
	};

	/**
	 * Constructs a ComboBox control configured with the Filter's properties.
	 *
	 * @private
	 * @returns {sap.m.ComboBox} configured instance
	 */
	ComboBoxFilter.prototype._createComboBox = function () {
		const oComboBox = new ComboBox();
		const oConfig = this.getConfig();
		let sItemTemplateKey,
			sItemTemplateText,
			sItemTemplateAdditionalText,
			sItemsPath = "/";

		oComboBox.attachChange((oEvent) => {
			this._syncValue();
		});

		if (oConfig && oConfig.item) {
			sItemsPath = oConfig.item.path || sItemsPath;
		}

		if (oConfig && oConfig.item && oConfig.item.template) {
			sItemTemplateKey = oConfig.item.template.key;
			sItemTemplateText = oConfig.item.template.title;
			sItemTemplateAdditionalText = oConfig.item.template.additionalText;
		}

		const oCard = this.getCardInstance();
		if (oConfig && oConfig.items) {
			sItemTemplateKey = "{key}";
			sItemTemplateText = "{title}";
			sItemTemplateAdditionalText = "{additionalText}";

			const oModel = new JSONModel(oConfig.items);
			oModel.setSizeLimit(oCard.getModelSizeLimit());

			this.setModel(oModel);
		}

		this._oItemTemplate = new ListItem({
			key: sItemTemplateKey,
			text: sItemTemplateText,
			additionalText: sItemTemplateAdditionalText
		});

		oComboBox.bindItems({
			path: sItemsPath,
			template: this._oItemTemplate
		});

		oComboBox.setShowSecondaryValues(true);
		oComboBox.setFilterSecondaryValues(true);
		oComboBox.setSelectedKey(BindingResolver.resolveValue(oConfig.selectedKey, oCard));
		oComboBox.setValue(BindingResolver.resolveValue(oConfig.value, oCard));

		const oLabel = this.createLabel(oConfig);
		if (oLabel) {
			oComboBox.addAriaLabelledBy(oLabel);
		}

		return oComboBox;
	};

	return ComboBoxFilter;
});