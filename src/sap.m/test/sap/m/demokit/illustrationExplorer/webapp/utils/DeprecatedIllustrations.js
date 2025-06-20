sap.ui.define([], () => {
    "use strict";

    /**
     * Constant containing deprecated illustration types
     */
    const DEPRECATED_ILLUSTRATIONS = [
        "AddColumn",
        "AddPeople",
        "BalloonSky",
        "Connection",
        "EmptyCalendar",
        "EmptyList",
        "ErrorScreen",
        "FilterTable",
        "GroupTable",
        "NoDimensionsSet",
        "NoMail_v1",
        "NoSavedItems_v1",
        "NoTasks_v1",
        "ReloadScreen",
        "ResizeColumn",
        "SearchEarth",
        "SearchFolder",
        "SimpleBalloon",
        "SimpleBell",
        "SimpleCalendar",
        "SimpleCheckMark",
        "SimpleConnection",
        "SimpleEmptyDoc",
        "SimpleEmptyList",
        "SimpleError",
        "SimpleMagnifier",
        "SimpleMail",
        "SimpleNoSavedItems",
        "SimpleNotFoundMagnifier",
        "SimpleReload",
        "SimpleTask",
        "SleepingBell",
        "SortColumn",
        "SuccessBalloon",
        "SuccessCheckMark",
        "SuccessHighFive",
        "SuccessScreen",
        "Tent",
        "UploadCollection"
    ];

    return {
        /**
         * Returns the list of deprecated illustration types
         * @returns {string[]} Array of deprecated illustration type names
         */
        getDeprecatedIllustrations() {
            return DEPRECATED_ILLUSTRATIONS;
        },

        /**
         * Checks if an illustration type is deprecated
         * @param {string} sType - The illustration type to check
         * @returns {boolean} True if the illustration is deprecated
         */
        isDeprecated(sType) {
            return DEPRECATED_ILLUSTRATIONS.includes(sType);
        }
    };
});