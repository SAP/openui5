sap.ui.define([
    "sap/ui/test/Opa5"
], function (Opa5) {
    "use strict";

    return new Opa5({
        iShouldBeOnTheEditPage : function () {
            return this.waitFor({
                controlType: "sap.ui.layout.form.Form",
                success : function () {
                    Opa5.assert.ok("Did navigate to the edit page");
                },
                errorMessage : "did not navigate to the edit page"
            });
        },
        theValuesShouldBePersisted : function () {
            return this.waitFor({
                id : ["nameText" , "countryText"],
                success : function (aInputs) {
                    var oName = aInputs[0],
                    oCountry = aInputs[1];

                    Opa5.assert.strictEqual(oName.getText(), "Foobar", "the name text was correct");
                    Opa5.assert.strictEqual(oCountry.getText(), this.getContext().sAnotherCountry, "the country text was correct");
                },
                errorMessage : "did not find the texts for country and name"
            });
        },
        theValuesShouldNotBePersisted : function () {
            return this.waitFor({
                id : ["nameText" , "countryText"],
                success : function (aInputs) {
                    var oName = aInputs[0],
                    oCountry = aInputs[1];

                    Opa5.assert.strictEqual(oName.getText(), this.getContext().sName, "the name text was restored");
                    Opa5.assert.strictEqual(oCountry.getText(), this.getContext().sSelectedCountry, "the country text was restored");
                },
                errorMessage : "did not find the texts for country and name"
            });
        }
    });
});