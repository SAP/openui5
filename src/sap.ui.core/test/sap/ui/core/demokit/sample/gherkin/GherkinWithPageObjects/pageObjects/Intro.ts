import Opa5 from "sap/ui/test/Opa5";
import Press from "sap/ui/test/actions/Press";
Opa5.createPageObjects({
    onTheIntro: {
        actions: {
            iPressOnGoToOverview: function () {
                return this.waitFor({
                    id: "navToOverview",
                    actions: new Press()
                });
            }
        }
    }
});