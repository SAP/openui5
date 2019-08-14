/*!
 * ${copyright}
 *
 * @constructor
 * @private
 * @experimental
 */
sap.ui.define([
],
function () {
    "use strict";

    var DefaultConfig = {
        "context": "sap.card",
        "properties" : {
            "headerType": {
                "label": "{i18n>CARD_EDITOR.HEADERTYPE}",
                "path": "header/type",
                "type": "enum",
                "enum": [
                    "Default",
                    "Numeric"
                ],
                "defaultValue": "Default"
            },
            "title": {
                "label": "{i18n>CARD_EDITOR.TITLE}",
                "type": "string",
                "path": "header/title"
            },
            "subTitle": {
                "label": "{i18n>CARD_EDITOR.SUBTITLE}",
                "type": "string",
                "path": "header/subTitle"
            },
            "icon": {
                "label": "{i18n>CARD_EDITOR.ICON}",
                "type": "icon",
                "path": "header/icon/src",
                "visible": "{= ${context>/header/type} !== 'Numeric' }"
            },
            "statusText": {
                "label": "{i18n>CARD_EDITOR.STATUS}",
                "type": "string",
                "path": "header/status/text"
            },
            "Number": {
                "label": "{i18n>CARD_EDITOR.KPI}",
                "type": "string",
                "path": "data/json/kpiInfos/kpi/number",
                "visible": "{= ${context>/header/type} === 'Numeric' }"
            },
            "listItemTitle": {
                "label": "{i18n>CARD_EDITOR.TITLE}",
                "type": "string",
                "path": "content/item/title"
            },
            "listItemDescription" : {
                "label": "{i18n>CARD_EDITOR.DESCRIPTION}",
                "type": "string",
                "path": "content/item/description"
            },
            "listItemHighlight": {
                "label": "{i18n>CARD_EDITOR.HIGHLIGHT}",
                "type": "string",
                "path": "content/item/highlight"
            }
        },
        "propertyEditors": {
            "enum" : "sap/ui/integration/designtime/controls/propertyEditors/EnumStringEditor",
            "string" : "sap/ui/integration/designtime/controls/propertyEditors/StringEditor",
            "icon" : "sap/ui/integration/designtime/controls/propertyEditors/IconEditor"
        },
        "i18n" : "sap/ui/integration/designtime/controls/i18n/i18n.properties"
    };

    return DefaultConfig;
}, /* bExport= */ true);
