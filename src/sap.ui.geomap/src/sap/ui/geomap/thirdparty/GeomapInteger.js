sap.ui.define(['exports'], (function (exports) { 'use strict';

    const SAPGeomapInteger = {
        toAttribute(propertyValue) {
            if (propertyValue === null || propertyValue === undefined) {
                return propertyValue;
            }
            if (Array.isArray(propertyValue)) {
                return JSON.stringify(propertyValue);
            }
            return `${propertyValue}`;
        },
        fromAttribute(attributeValue) {
            let propertyValue;
            try {
                propertyValue = JSON.parse(attributeValue);
            }
            catch (e) {
                propertyValue = parseInt(attributeValue); // zTODO: what to do if null is passed
            }
            return propertyValue;
        },
    };

    exports.SAPGeomapInteger = SAPGeomapInteger;

}));
