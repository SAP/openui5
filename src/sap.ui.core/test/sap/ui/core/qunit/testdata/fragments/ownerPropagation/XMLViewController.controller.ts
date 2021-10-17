sap.ui.controller("testdata.fragments.ownerPropagation.XMLViewController", {
    onInit: function (oEvent) {
        QUnit.config.current.assert.ok(this.getOwnerComponent(), "Controller.init: owner component is available.");
        QUnit.config.current.assert.equal(this.getOwnerComponent().getId(), "myComponent", "The correct owner should be propagated.");
    }
});