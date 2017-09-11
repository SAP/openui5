/*!
 * ${copyright}
 */
sap.ui.define([
  './Matcher',
  './I18NText',
  'sap/ui/test/Opa5'
], function (Matcher, I18NText, Opa5) {
  "use strict";

  var oI18nMatcher = new I18NText();

  /**
   * @class
   * The LabelFor matcher searches for given control associated with labelFor property.
   * The matcher does automatically
   * <ul>
   *     <li>
   *         retrieve control associated by label by given text
   *     </li>
   *     <li>
   *         retrieve control associated by label by given i18n key, modelName, parameters or propertyName. See {@link sap.ui.test.matchers.I18NText}
   *     </li>
   *     <li>
   *         combination of text and key is not possible
   *     </li>
   * </ul>
   *
   * @extends sap.ui.test.matchers.Matcher
   * @param {object} [mSettings] optional map/JSON-object with initial settings for the new LabelFor
   * @public
   * @name sap.ui.test.matchers.LabelFor
   * @author SAP SE
   * @since 1.46
   */
  var LabelFor = Matcher.extend("sap.ui.test.matchers.LabelFor", /** @lends sap.ui.test.matchers.LabelFor.prototype */ {

    metadata : {
      publicMethods : [ "isMatching" ],
      properties : {
        /**
         * The text of the {@link sap.m.Label} which have the labelFor property.
         */
        text : {
          type : "string"
        },

        /**
         * The name of the {@link sap.ui.model.resource.ResourceModel} assigned to the control.
         */
        modelName : {
          type : "string",
          defaultValue : "i18n"
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
         * The name of the control property to match the I18N text with.
         */
        propertyName: {
          type: "string",
          defaultValue : "text"
        }
      }
    },

    /**
     * Checks for control with labelFor property annotating other control
     *
     * @param {sap.ui.core.Control} oControl the control that is checked by the matcher
     * @return {boolean} true if the Control has a label that matches the criteria
     * @public
     */
    isMatching : function (oControl) {
      var bIsMatching;
      var oPlugin = Opa5.getPlugin();
      var sModelName = this.getModelName();
      var sLabelText = this.getText();
      var aParameters = this.getParameters();
      var sPropertyName = this.getPropertyName();
      var sKey = this.getKey();

      if (sLabelText && sKey) {
        throw new Error("Combination of text and key properties is not possible");
      } else if (!sLabelText && !sKey) {
        throw new Error("No label text or key found");
      }

      var aLabelsInPage = oPlugin.getMatchingControls({controlType: "sap.m.Label", visible: false});

      oI18nMatcher.applySettings({
        key: sKey,
        modelName: sModelName,
        parameters: aParameters,
        propertyName: sPropertyName
      });

      bIsMatching = aLabelsInPage.some(function(oLabel) {
        if (sKey && oI18nMatcher.isMatching(oLabel)) {
          return oControl.getId() === oLabel.getLabelForRendering();
        } else if (sLabelText && oLabel.getText() === sLabelText){
          return oControl.getId() === oLabel.getLabelForRendering();
        }
      });

      if (!bIsMatching) {
        var sPropertyType = sKey ? "key: " + sKey : "text: " + sLabelText;
        this._oLogger.debug("No label with " + sPropertyType + " for control: " + oControl);
      }

      return bIsMatching;
    }
  });

  return LabelFor;
});