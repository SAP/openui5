sap.ui.define(['exports'], (function (exports) { 'use strict';

    const SAPGeomapString = {
        toAttribute(propertyValue) {
            if (propertyValue === null || propertyValue === undefined) {
                return propertyValue;
            }
            if (Array.isArray(propertyValue)) {
                return JSON.stringify(propertyValue);
            }
            return propertyValue;
        },
        fromAttribute(attributeValue) {
            let propertyValue;
            try {
                propertyValue = JSON.parse(attributeValue);
            }
            catch (e) {
                propertyValue = attributeValue;
            }
            return propertyValue;
        },
    };

    exports.SAPGeomapString = SAPGeomapString;

}));
