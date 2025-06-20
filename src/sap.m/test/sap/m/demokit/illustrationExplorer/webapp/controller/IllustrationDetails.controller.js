sap.ui.define([
    "sap/ui/demo/illustrationExplorer/controller/BaseController",
    "sap/ui/demo/illustrationExplorer/utils/DeprecatedIllustrations"
], (BaseController, DeprecatedIllustrations) => {
    "use strict";

    return BaseController.extend("sap.ui.demo.illustrationExplorer.controller.IllustrationDetails", {
        onInit() {
            this.getRouter().getRoute("illustrationDetails")
                .attachPatternMatched(this._onPatternMatched, this);
        },

        _onPatternMatched(oEvent) {
            // Get route parameters
            const oArgs = oEvent.getParameter("arguments");
            const { set, type } = oArgs;

            // Get the existing "illustration" model
            const oModel = this.getModel("illustration");
            const oData = oModel.getData();

            const sIllustrationType = `${set}-${type}`;

            // Check if the model properties need to be updated
            if (oData.set !== set || oData.type !== sIllustrationType) {
                const isDeprecated = DeprecatedIllustrations.isDeprecated(type);
                // Update the model properties
                oModel.setProperty("/set", set);
                oModel.setProperty("/type", sIllustrationType);
                oModel.setProperty("/deprecated", isDeprecated);
            }
        }
    });
});