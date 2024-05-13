
sap.ui.define([
    "sap/ui/mdc/field/MultiValueFieldDelegate",
    "sap/base/util/merge"
], (
    BaseDelegate,
    merge
) => {
    "use strict";

    const MultiValueFieldDelegate = Object.assign({}, BaseDelegate);
	MultiValueFieldDelegate.apiVersion = 2;//CLEANUP_DELEGATE

    MultiValueFieldDelegate.updateItems = function(oPayload, aConditions, oMultiValueField) {

        const oListBinding = oMultiValueField.getBinding("items");

        if (oListBinding.isA("sap.ui.model.json.JSONListBinding")) {
            // check if conditions are added, removed or changed
            const oBindingInfo = oMultiValueField.getBindingInfo("items");
            const sItemPath = oBindingInfo.path;
            const oTemplate = oBindingInfo.template;
            const oKeyBindingInfo = oTemplate.getBindingInfo("key");
            const oDescriptionBindingInfo = oTemplate.getBindingInfo("description");
            const sKeyPath = oKeyBindingInfo && oKeyBindingInfo.parts[0].path;
            const sDescriptionPath = oDescriptionBindingInfo && oDescriptionBindingInfo.parts[0].path;
            const oModel = oListBinding.getModel();
            const aItems = merge([], oModel.getProperty(sItemPath));

            // first remove items not longer exist
            if (aItems.length > aConditions.length) {
                aItems.splice(aConditions.length);
            }

            for (let i = 0; i < aConditions.length; i++) {
                const oCondition = aConditions[i];
                let oItem = aItems[i];
                if (!oItem) {
                    // new condition -> add item
                    oItem = {};
                    if (sKeyPath) {
                        oItem[sKeyPath] = oCondition.values[0];
                    }
                    if (sDescriptionPath) {
                        oItem[sDescriptionPath] = oCondition.values[1];
                    }
                    aItems.push(oItem);
                } else if (oCondition.values[0] !== oItem[sKeyPath]) {
                    // condition changed -> remove item and insert new
                    oItem = {};
                    if (sKeyPath) {
                        oItem[sKeyPath] = oCondition.values[0];
                    }
                    if (sDescriptionPath) {
                        oItem[sDescriptionPath] = oCondition.values[1];
                    }
                    aItems.splice(i, 1, oItem);
                }
            }

            oModel.setProperty(sItemPath, aItems);
        }

    };

	return MultiValueFieldDelegate;
});