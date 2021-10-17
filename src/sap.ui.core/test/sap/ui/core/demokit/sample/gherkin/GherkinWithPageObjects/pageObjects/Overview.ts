import Opa5 from "sap/ui/test/Opa5";
import Press from "sap/ui/test/actions/Press";
var fnPress = function (sId) {
    return this.waitFor({
        id: sId,
        actions: new Press()
    });
};
Opa5.createPageObjects({
    onTheOverview: {
        actions: {
            iPressOnGoToPage1: function () {
                return fnPress.call(this, "navToPage1");
            },
            iPressOnGoToPage2: function () {
                return fnPress.call(this, "navToPage2");
            }
        }
    }
});