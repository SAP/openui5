/*
 * ${copyright}
 */
sap.ui.define(function () {
    "use strict";
    /**
     * Enumeration of the propagation reason in the condition propagation callback of the {@link sap.ui.mdc.ValueHelp ValueHelp}
     *
     * @enum {string}
     * @private
     * @ui5-restricted sap.fe
     * @MDC_PUBLIC_CANDIDATE
     * @since 1.100.0
     * @alias sap.ui.mdc.enum.PropagationReason
     */
    var PropagationReason = {
        /**
         * Triggered by connected control after processing valuehelp output
         *
         * @private
         * @ui5-restricted sap.fe
         */
         ControlChange: "ControlChange",
        /**
         * Triggered by valuehelp itself on selection
         *
         * @private
         * @ui5-restricted sap.fe
         */
         Select: "Select",
        /**
         * Triggered by valuehelp itself on <code>getItemForValue</code>
         *
         * @private
         * @ui5-restricted sap.fe
         */
         Info: "Info"
    };

    return PropagationReason;
}, /* bExport= */ true);