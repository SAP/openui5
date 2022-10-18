/*!
 * ${copyright}
 */
sap.ui.define([], function() {
    "use strict";

    var oUtil = {
        getDateWithoutTime: function(oDate, bSecondDate) {
            if (bSecondDate) {
                return new Date(new Date(oDate).setHours(23, 59, 59));
            }
            return new Date(new Date(oDate).setHours(0, 0, 0));
        }
    };

    return oUtil;
});