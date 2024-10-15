
sap.ui.define([
    "./FieldBaseODataV2.delegate",
    "sap/ui/mdc/enums/ContentMode"
], (
    MDCFieldBaseDelegate,
    ContentMode
) => {
    "use strict";

    const FieldBaseDelegate = Object.assign({}, MDCFieldBaseDelegate);

	FieldBaseDelegate.createContent = function(oField, sContentMode, sId, bProvideDefaultValueHelp) {

        // if (sContentMode === ContentMode.Edit) {
        //     return MDCFieldBaseDelegate.createContent.apply(this, arguments);
        // }

        return new Promise((fResolve, fReject) => {
            let sControlName;
            let sValueName;
            if (sContentMode === ContentMode.Display) {
                sControlName = "sap/m/ProgressIndicator";
                sValueName = "percentValue";
            } else {
                sControlName = "sap/m/Slider";
                sValueName = "value";
            }
            const fSuccess = function (Slider, ConditionsType) {
                const oParameter = {};
                oParameter[sValueName] = {path: '$field>/conditions', type: new ConditionsType()};
                const oControl = new Slider(sId, oParameter);

                fResolve([oControl]);
            };
            sap.ui.require([sControlName, "sap/ui/mdc/field/ConditionsType"], fSuccess, fReject);
        });

	};

	return FieldBaseDelegate;
});