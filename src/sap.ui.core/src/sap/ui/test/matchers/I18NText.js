/*!
 * ${copyright}
 */
sap.ui.define(['sap/ui/test/matchers/Matcher', "sap/base/strings/capitalize"], function(Matcher, capitalize) {
	"use strict";

	/**
	 * @class
	 * The I18NText matcher checks if a control property has the same value as a text from an I18N file.
	 *
	 * The matcher automatically:
	 * <ul>
	 *     <li>
	 *         retrieves the text from the assigned 'i18n' model (name can be changed)
	 *     </li>
	 *     <li>
	 *         checks that the I18N key does actually exist in the file
	 *     </li>
	 *     <li>
	 *         checks if asynchronously loaded I18N have actually been loaded
	 *     </li>
	 * </ul>
	 *
	 * As of version 1.72, it is available as a declarative matcher with the following syntax:
	 * <code><pre>{
	 *     i18NText: {
	 *         propertyName: "string",
	 *         key: "string",
	 *         parameters: "any",
	 *         modelName: "string"
	 *     }
	 * }
	 * </code></pre>
	 *
	 * @extends sap.ui.test.matchers.Matcher
	 * @param {object} [mSettings] optional map/JSON-object with initial settings for the new I18NText
	 * @public
	 * @name sap.ui.test.matchers.I18NText
	 * @author SAP SE
	 * @since 1.42
	 */
	return Matcher.extend("sap.ui.test.matchers.I18NText", /** @lends sap.ui.test.matchers.I18NText.prototype */ {

		metadata : {
			publicMethods : [ "isMatching" ],
			properties : {
				/**
				 * The name of the control property to match the I18N text with.
				 */
				propertyName : {
					type : "string"
				},
				/**
				 * The key of the I18N text in the containing {@link jQuery.sap.util.ResourceBundle}.
				 */
				key : {
					type : "string"
				},
				/**
				 * The parameters for replacing the placeholders of the I18N text. See {@link jQuery.sap.util.ResourceBundle#getText}.
				 */
				parameters : {
					type : "any"
				},
				/**
				 * The name of the {@link sap.ui.model.resource.ResourceModel} assigned to the control.
				 */
				modelName : {
					type : "string",
					defaultValue : "i18n"
				}
			}
		},

		/**
		 * Checks if the control has a property that matches the I18N text
		 *
		 * @param {sap.ui.core.Control} oControl the control that is checked by the matcher
		 * @return {boolean} true if the property has a strictly matching value.
		 * @public
		 */
		isMatching : function (oControl) {

			var sKey = this.getKey(),
				sPropertyName = this.getPropertyName(),
				aParameters = this.getParameters(),
				sModelName = this.getModelName(),
				oModel = oControl.getModel(sModelName),
				fnProperty = oControl["get" + capitalize(sPropertyName, 0)];

			// check model existence
			if (!oModel) {
				this._oLogger.debug("The '" + oControl + "' has no model with name '" + sModelName + "'");
				return false;
			}

			// check model type
			if (!oModel.getResourceBundle) {
				this._oLogger.debug("The model '" + oModel + "' is not a valid resource model");
				return false;
			}

			// check resource bundle
			var oAppWindow = this._getApplicationWindow();
			var oBundle = oModel.getResourceBundle();
			if (oBundle instanceof oAppWindow.Promise) {
				if (oModel._oResourceBundle instanceof oAppWindow.Object && oModel._oResourceBundle.getText) {
					// we access the loaded bundle from the internal variable of the resource model
					// ... instead of using the asynchronous promises which is no option for a synchronous matcher
					// !!! we have a qunit in place that ensures this internal implementation of the ResourceModel
					oBundle = oModel._oResourceBundle;
				} else {
					this._oLogger.debug("The model '" + sModelName + "' of '" + oControl + "' is in async mode and not loaded yet");
					return false;
				}
			}

			// check property
			if (!fnProperty) {
				this._oLogger.debug("The '" + oControl + "' has no '" + sPropertyName + "' property");
				return false;
			}

			var sPropertyValue =  fnProperty.call(oControl);

			// check key
			var sText = oBundle.getText(sKey, aParameters);
			if (sText === sKey) {
				var sMessage = "No value for the key '" + sKey + "' in the model '" + sModelName + "' of '" + oControl + "'";
				this._oLogger.debug(sMessage);
				return false;
			}

			// compare values
			var bResult = sPropertyValue === sText;
			if (!bResult) {
				this._oLogger.debug("The text '" + sText + "' does not match the value '" + sPropertyValue + "' of the '" + sPropertyName + "' property for '" + oControl + "'");
			}
			return bResult;
		}
	});

});