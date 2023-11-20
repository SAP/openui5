/*
 * ${copyright}
 */
sap.ui.define(function () {
    "use strict";
    /**
     * Enumeration of the propagation reason in the condition propagation callback of the {@link sap.ui.mdc.ValueHelp ValueHelp}
     *
     * @enum {string}
     * @public
     * @since 1.115
     * @alias sap.ui.mdc.enums.ValueHelpPropagationReason
     */
    const ValueHelpPropagationReason = {
        /**
         * Triggered by connected control after processing valuehelp output
         *
         * @public
         */
         ControlChange: "ControlChange",
        /**
         * Triggered by <code>ValueHelp</code> itself on selection
         *
         * @public
         */
         Select: "Select",
        /**
         * Triggered by <code>ValueHelp</code> itself on <code>getItemForValue</code>
         *
         * @public
         */
         Info: "Info"
    };

    return ValueHelpPropagationReason;
}, /* bExport= */ true);