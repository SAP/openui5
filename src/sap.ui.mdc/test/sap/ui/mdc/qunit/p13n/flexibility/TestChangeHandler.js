sap.ui.define([
    "sap/ui/mdc/flexibility/ItemBaseFlex"
], function(ItemBaseFlex){
    "use strict";

    //Test implementation used in ItemBaseFlex.qunit
    const oTestChangeHandler = Object.assign({}, ItemBaseFlex);

    oTestChangeHandler.findItem = function(oModifier, aItems, sName) {
        return new Promise(function(resolve){
            resolve(aItems.find(function(oItem){
                return oItem.getId() == sName;
            }));
        });
    };

    return {
        add: oTestChangeHandler.createAddChangeHandler(),
        remove: oTestChangeHandler.createRemoveChangeHandler(),
        move: oTestChangeHandler.createMoveChangeHandler()
    };

});