sap.ui.define(['exports', 'sap/ui/geomap/thirdparty/webcomponents'], (function (exports, webcomponentsBase) { 'use strict';

    /**
     * Returns an extended property decorator.
     *
     * @param { GeomapProperty } propData
     * @returns { PropertyDecorator }
     */
    const geomapProperty = (propData) => {
        return webcomponentsBase.s(propData);
    };

    exports.geomapProperty = geomapProperty;

}));
