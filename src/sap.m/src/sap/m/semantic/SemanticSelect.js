/*!
 * ${copyright}
 */

sap.ui.define(['sap/m/semantic/SemanticControl', 'sap/m/Select'], function (SemanticControl, Select) {
	"use strict";

	/**
	 * Constructor for a new SemanticSelect.
	 * @param {string} [sId] ID for the new control, generated automatically if no ID is given
	 * @param {object} [mSettings] Initial settings for the new control
	 *
	 * @class
	 * A semantic select is a {@link sap.m.Select} eligible for aggregation content of a {@link sap.m.semantic.SemanticPage}.
	 *
	 * @extends sap.m.semantic.SemanticControl
	 * @abstract
	 *
	 * @author SAP SE
	 * @version ${version}
	 *
	 * @constructor
	 * @public
	 * @since 1.30
	 * @alias sap.m.semantic.SemanticSelect
	 * @ui5-metamodel This control/element also will be described in the UI5 (legacy) designtime metamodel
	 */

	var SemanticSelect = SemanticControl.extend("sap.m.semantic.SemanticSelect", /** @lends sap.m.semantic.SemanticSelect.prototype */ {
		metadata: {

			properties: {
				/**
				 * See {@link sap.m.Select#enabled}
				 */
				enabled: {
					type: "boolean",
					group: "Behavior",
					defaultValue: true
				},

				/**
				 * See {@link sap.m.Select#selectedKey}
				 */
				selectedKey: {
					type: "string",
					group: "Data",
					defaultValue: ""
				}
			},
			defaultAggregation: "items",
			aggregations: {
				/**
				 * See {@link sap.m.Select#items}
				 */
				items: {type: "sap.ui.core.Item", multiple: true, singularName: "item", bindable: "bindable"}
			},
			associations: {
				/**
				 * See {@link sap.m.Select#selectedItem}
				 */
				selectedItem: {type: "sap.ui.core.Item", multiple: false}
			},
			events: {

				/**
				 * See {@link sap.m.Select#change}
				 */
				change: {
					parameters: {

						/**
						 * The selected item.
						 */
						selectedItem: {type: "sap.ui.core.Item"}
					}
				}
			}
		}
	});

	SemanticSelect.prototype.setProperty = function(sPropertyName, oValue, bSuppressInvalidate) {

		if (!this.getMetadata().getProperties()[sPropertyName]
				&& !SemanticSelect.getMetadata().getProperties()[sPropertyName]
				&& !SemanticControl.getMetadata().getProperties()[sPropertyName]) {

			jQuery.sap.log.error("unknown property: " + sPropertyName, this);
			return this;
		}
		SemanticControl.prototype.setProperty.call(this, sPropertyName, oValue, bSuppressInvalidate);
	};

	SemanticSelect.prototype.getSelectedItem = function () {
		return this._getControl().getSelectedItem();
	};

	SemanticSelect.prototype.setSelectedItem = function (vItem) {
		this._getControl().setSelectedItem(vItem);
		return this;
	};

	SemanticSelect.prototype.getItemAt = function (iIndex) {
		return this._getControl().getItemAt(iIndex);
	};

	//overwrites
	SemanticSelect.prototype._getControl = function () {
		var oControl = this.getAggregation('_control');
		if (!oControl) {
			this.setAggregation('_control',
					new Select({
						id: this.getId() + "-select",
						change: jQuery.proxy(this.fireChange, this)
					}), true); //TODO: check bSuppressInvalidate needed?
			oControl = this.getAggregation('_control');
			oControl.applySettings(this._getConfiguration().getSettings());
		}

		return oControl;
	};

	return SemanticSelect;
}, /* bExport= */ true);
