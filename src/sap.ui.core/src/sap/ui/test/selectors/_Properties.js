/*!
 * ${copyright}
 */

sap.ui.define([
    "sap/ui/test/selectors/_Selector"
], function (_Selector) {
	"use strict";

    /**
     * Selector generator for controls with a certain data-oriented property
     * Inherited properties and properties concerned only with visualization details are ignored
     * @class Control selector generator: property
     * @extends sap.ui.test.selectors._Selector
     * @alias sap.ui.test.selectors._Properties
     * @private
     */
    var _Properties = _Selector.extend("sap.ui.test.selectors._Properties", {

        /**
         * @param {object} oControl the control for which to generate a selector
         * @returns {array} an array of plain object representation of a control. Each contains property name and value
         * An empty array if no appropriate property is found
         * @private
         */
        _generate: function (oControl) {
            var oProperties = oControl.getMetadata().getAllProperties();
            return Object.keys(oProperties).map(function (sProperty) {
                // TODO: filter out more properties that are not relevant to the data displayed by the control
                // for now, use a simple inclusive list of properties
                if (oProperties.hasOwnProperty(sProperty) && _Properties._dataProperties.indexOf(sProperty) > -1) {
                    return this._getPropertySelector(oControl, sProperty);
                }
            }.bind(this));
        },

        _getPropertySelector: function (oControl, sProperty) {
            var vValue = oControl.getProperty(sProperty);
            if (typeof vValue === "undefined" || vValue === null || vValue.length === 0) {
                this._oLogger.debug("Control " + oControl + " property " + sProperty + " has empty value");
            } else {
                this._oLogger.debug("Control " + oControl + " has property " + sProperty + " with value " + vValue);
                var mResult = {properties: {}};
                // the src property can contain a relative file path -> use a regex to match only the file name
                if (sProperty === "src" && vValue.lastIndexOf && vValue.lastIndexOf("/") > -1) {
                    vValue = {
                        regex: {
                            source: vValue.substring(vValue.lastIndexOf("/") + 1).replace(/[-[\]{}()*+?.,^$|#\s]/g, '\\$&')
                        }
                    };
                }
                mResult.properties[sProperty] = vValue;
                return mResult;
            }
        }
    });

    // inspired by properties commonly seen in sap.m library
    _Properties._dataProperties = [
        "text",
        "title",
        "subtitle",
        "name",
        "info",
        "tooltip",
        "value", // sap.m.InputBase
        "valueState", // sap.m.CheckBox
        "valueStateText", // sap.m.InputBase
        "type", // sap.m.Button
        "number",
        "icon",
        "src", // sap.m.Icon
        "customIcon",
        "iconAlt",
        "iconTooltip",
        "placeholder",
        "key",
        "description",
        "selectedItemId", // sap.m.ComboBox
        "selectedKey", // sap.m.ComboBox, sap.m.IconTabBar
        "selectedKeys", // sap.m.MultiComboBox
        "cancelButtonText", // sap.m.ActionSheet, sap.m.BusyDialog
        "currentLocationText", // sap.m.Breadcrumbs
        "label", // sap.m.DisplayListItem
        "contentText",
        "buttonTooltip",
        "htmlText", // sap.m.FormattedText
        "header", // sap.m.GenericTile
        "headerText", // sap.m.ListBase
        "footerText",
        "subheader",
        "failedText",
        "imageDescription",
        "count",
        "alt", // sap.m.Image
        "href", // sap.m.Link
        "intro", // sap.m.ObjectListItem
        "navButtonText", // sap.m.Page
        "editable",
        "active",
        "noDataText",
        "customTextOff", // sap.m.Switch
        "customTextOn",
        "pressed", // sap.m.ToggleButton'
        "url", // sap.m.UploadCollectionItem
        "fileName" // sap.m.UploadCollectionItem
    ];

    return _Properties;
});
