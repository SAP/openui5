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
                "label": "{i18n>headerType}",
                "path": "header/type",
                "type": "string",
                "enum": [
                    "Default",
                    "Numeric"
                ],
                "defaultValue": "Default"
            },
            "title": {
                "label": "{i18n>title}",
                "type": "string",
                "path": "header/title"
            },
            "subTitle": {
                "label": "{i18n>subtitle}",
                "type": "string",
                "path": "header/subTitle"
            },
            "icon": {
                "label": "{i18n>icon}",
                "type": "string",
                "path": "header/icon/src",
                "visible": "{= ${context>/header/type} !== 'Numeric' }"
            },
            "statusText": {
                "label": "{i18n>status}",
                "type": "string",
                "path": "header/status/text"
            },
            "Number": {
                "label": "{i18n>kpi}",
                "type": "string",
                "path": "data/json/kpiInfos/kpi/number",
                "visible": "{= ${context>/header/type} === 'Numeric' }"
            },
            "listItemTitle": {
                "label": "{i18n>title}",
                "type": "string",
                "path": "content/item/title"
            },
            "listItemDescription" : {
                "label": "{i18n>description}",
                "type": "string",
                "path": "content/item/description"
            },
            "listItemHighlight": {
                "label": "{i18n>highlight}",
                "type": "string",
                "path": "content/item/highlight"
            }
        },
        "propertyEditors": {
            "string" : "sap/ui/integration/designtime/controls/propertyEditors/StringEditor"
        }
    };

    return DefaultConfig;
}, /* bExport= */ true);