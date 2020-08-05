sap.ui.define([
    "sap/ui/test/Opa5",
    "sap/ui/test/matchers/PropertyStrictEquals"
], function (Opa5, PropertyStrictEquals) {
    "use strict";

    return new Opa5({
        _pressOnButton: function (sId) {
            return this.waitFor({
                id: sId,
                matchers: new PropertyStrictEquals({ name: "enabled", value: true }),
                success: function (oButton) {
                    oButton.$().trigger("tap");
                },
                errorMessage: "did not find the " + sId + " button"
            });
        },
        iPressOnEdit: function () {
            return this._pressOnButton("edit");
        },
        iPressOnSave: function () {
            return this._pressOnButton("save");
        },
        iPressOnCancel: function () {
            return this._pressOnButton("cancel");
        },
        iChangeValuesInTheForm: function () {
            return this.waitFor({
                id: ["name", "country"],
                success: function (aInputs) {
                    var oName = aInputs[0],
                        oCountry = aInputs[1];

                    var sName = oName.getValue();
                    oName.setValue("Foobar");

                    // helper function to select anything else except the currently selected item
                    function generateRandomExcept(iMin, iMax, iIndex) {
                        var iNum = Math.floor(Math.random() * (iMax - iMin + 1)) + iMin;
                        return (iNum === iIndex ? generateRandomExcept(iMin, iMax, iIndex) : iNum);
                    }

                    var iSelectedIndex = oCountry.getSelectedIndex();
                    var iAnotherIndex = generateRandomExcept(0, oCountry.getItems().length - 1, iSelectedIndex);
                    var sSelectedCountry = oCountry.getSelectedItem().getText();
                    var oAnotherCountry = oCountry.getItems()[iAnotherIndex];
                    var sAnotherCountry = oAnotherCountry.getText();

                    this.getContext().sSelectedCountry = sSelectedCountry;
                    this.getContext().sAnotherCountry = sAnotherCountry;
                    this.getContext().sName = sName;
                    oCountry.setSelectedKey(oAnotherCountry.getKey());

                    Opa5.assert.ok(true, "Selected the item with key '" + oAnotherCountry.getKey() + "'");
                },
                errorMessage: "did not find the inputs name and country"
            });
        }
    });
});