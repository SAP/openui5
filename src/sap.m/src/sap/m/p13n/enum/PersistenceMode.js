/*
 * ${copyright}
 */
sap.ui.define(function () {
    "use strict";

	/**
	 * Enumerations for p13n enum artifacts
	 * @namespace
	 * @name sap.m.p13n.enum
	 * @private
	 * @ui5-restricted sap.m.p13n
	 */

    /**
     * Enumeration of the preferred persistence mode for personalization changes.
     *
     * @enum {string}
     * @since 1.104
     * @alias sap.m.p13n.enum.PersistenceMode
     * @private
     * @ui5-restricted sap.ui.mdc, sap.fe
     */
    var PersistenceMode = {
        /**
         * Personalization changes are created in the flexibility layer using <code>ignoreVariantManagement: true</code>
         *
         * @private
         * @ui5-restricted sap.ui.mdc
         */
        Global: "Global",

        /**
         * Personalization changes are created and implicitly persisted only in case no additional <code>VariantManagement</code>
         * control reference could be found. If a <code>sap.ui.fl.variants.VariantManagement</code> has been found,
         * it will be used instead.
         *
         * @private
         * @ui5-restricted sap.fe
         */
        Auto: "Auto",

        /**
         * Personalization changes are not persisted
         *
         * @private
         * @ui5-restricted sap.ui.mdc
         */
        Transient: "Transient"
    };

    return PersistenceMode;
}, /* bExport= */ true);