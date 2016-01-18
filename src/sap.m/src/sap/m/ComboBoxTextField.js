/*!
 * ${copyright}
 */

sap.ui.define(['jquery.sap.global', './InputBase', './library'],
	function(jQuery, InputBase, library) {
		"use strict";

		/**
		 * Constructor for a new ComboBoxTextField.
		 *
		 * @param {string} [sId] ID for the new control, generated automatically if no ID is given.
		 * @param {object} [mSettings] Initial settings for the new control.
		 *
		 * @class
		 * The <code>sap.m.ComboBoxTextField</code>.
		 * @extends sap.m.InputBase
		 *
		 * @author SAP SE
		 * @version ${version}
		 *
		 * @constructor
		 * @public
		 * @since 1.32.10
		 * @alias sap.m.ComboBoxTextField
		 * @ui5-metamodel This control will also be described in the UI5 (legacy) design time meta model.
		 */
		var ComboBoxTextField = InputBase.extend("sap.m.ComboBoxTextField", /** @lends sap.m.ComboBoxTextField.prototype */ {
			metadata: {
				library: "sap.m",
				properties: {

					/**
					 * Sets the maximum width of the text field.
					 */
					maxWidth: {
						type: "sap.ui.core.CSSSize",
						group: "Dimension",
						defaultValue: "100%"
					}
				}
			}
		});

		ComboBoxTextField.prototype.updateValueStateClasses = function(sValueState, sOldValueState) {
			InputBase.prototype.updateValueStateClasses.apply(this, arguments);

			var mValueState = sap.ui.core.ValueState,
				CSS_CLASS = this.getRenderer().CSS_CLASS_COMBOBOXTEXTFIELD,
				$DomRef = this.$();

			if (sOldValueState !== mValueState.None) {
				$DomRef.removeClass(CSS_CLASS + "State " + CSS_CLASS + sOldValueState);
			}

			if (sValueState !== mValueState.None) {
				$DomRef.addClass(CSS_CLASS + "State " + CSS_CLASS + sValueState);
			}
		};

		return ComboBoxTextField;
	}, true);
