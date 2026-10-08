/*!
 * ${copyright}
 */

// Provides enumeration sap.ui.mdc.enums.GeomapControlPosition
sap.ui.define(["sap/ui/base/DataType"], (DataType) => {
    "use strict";

    /**
     * Enumeration of the <code>position</code> property of the Geomap controls
     *
     * @enum {string}
     * @public
     * @since 1.154
     * @alias sap.ui.mdc.enums.GeomapControlPosition
     */
    const GeomapControlPosition = {

        /**
         * The control is positioned in the top left corner of the page
        */
        TopLeft: "TopLeft",

        /**
         * The control is positioned in the top right corner of the page
        */
        TopRight: "TopRight",

        /**
         * The control is positioned in the bottom left corner of the page
        */
        BottomLeft: "BottomLeft",

        /**
         * The control is positioned in the bottom right corner of the page
        */
        BottomRight: "BottomRight"
    };

    DataType.registerEnum("sap.ui.mdc.enums.GeomapControlPosition", GeomapControlPosition);

    return GeomapControlPosition;

}, /* bExport= */ true);