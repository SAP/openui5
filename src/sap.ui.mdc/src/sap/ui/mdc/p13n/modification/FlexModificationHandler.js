/*
* ! ${copyright}
*/
sap.ui.define([
    "./ModificationHandler",
    "sap/ui/mdc/p13n/FlexUtil",
    "sap/ui/fl/apply/api/FlexRuntimeInfoAPI"
], function(ModificationHandler, FlexUtil, FlexRuntimeInfoAPI) {
	"use strict";

    var oFlexModificationHandler;

    /**
	 *  @class Flex specific modification handler implementation
	 *
	 *
	 * @author SAP SE
	 * @public
	 * @since 1.87.0
	 * @alias sap.ui.mdc.p13n.modification.FlexModificationHandler
	 */
	var FlexModificationHandler = ModificationHandler.extend("sap.ui.mdc.p13n.modification.FlexModificationHandler");

    FlexModificationHandler.prototype.processChanges = function(aChanges){
        return FlexUtil.handleChanges.apply(this, arguments);
    };

    FlexModificationHandler.prototype.waitForChanges = function(mPropertyBag){
        return FlexRuntimeInfoAPI.waitForChanges.apply(this, arguments);
    };

    FlexModificationHandler.prototype.reset = function(mPropertyBag){
        return FlexUtil.discardChanges.apply(this, arguments);
    };

    FlexModificationHandler.prototype.isModificationSupported = function(mPropertyBag){
        return FlexRuntimeInfoAPI.isFlexSupported.apply(this, arguments);
    };

    FlexModificationHandler.getInstance = function() {
        if (!oFlexModificationHandler){
            oFlexModificationHandler = new FlexModificationHandler();
        }
        return oFlexModificationHandler;
    };

	return FlexModificationHandler;
});
