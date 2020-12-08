/*
* ! ${copyright}
*/
sap.ui.define([
    "sap/ui/base/Object"
], function(BaseObject) {
    "use strict";

    var oModificationHandler;

    /**
	 *  @class Interface to implement different modification layers
     *  (E.g. Flex-explicit, Flex-implicit, transient)
	 *
	 *
	 * @author SAP SE
	 * @public
	 * @since 1.87.0
	 * @alias sap.ui.mdc.p13n.modification.ModificationHandler
	 */
	var ModificationHandler = BaseObject.extend("sap.ui.mdc.p13n.modification.ModificationHandler");

    /**
     * Should implement the appliance of changes
     *
     * @param {array} aChanges An array of changes
     */
    ModificationHandler.prototype.processChanges = function(aChanges){
        return Promise.resolve();
    };

    /**
     * Should implement a function that returns a promise resolving
     * after the current pending changes have been applied.
     *
     * @param {object} mPropertyBag A propertybag containing modification specific configuration
     * @param {sap.ui.core.Element} mPropertyBag.element The according element which should be checked
     */
    ModificationHandler.prototype.waitForChanges = function(mPropertyBag) {
        return Promise.resolve();
    };

    /**
     * Should implement a function that returns a promise resolving
     * after the current pending changes have been applied.
     *
     * @param {object} mPropertyBag A propertybag containing modification specific configuration
     * @param {sap.ui.core.Element} mPropertyBag.selector The according element which should be checked
     */
    ModificationHandler.prototype.reset = function(mPropertyBag) {
        return Promise.resolve();
    };

    /**
     * Should implement a function that returns a promise resolving
     * after the current pending changes have been applied.
     *
     * @param {object} mPropertyBag A propertybag containing modification specific configuration
     * @param {sap.ui.core.Element} mPropertyBag.selector The according element which should be checked
     */
    ModificationHandler.prototype.isModificationSupported = function(mPropertyBag){
        return false;
    };

    ModificationHandler.getInstance = function() {
        if (!oModificationHandler){
            oModificationHandler = new ModificationHandler();
        }
        return oModificationHandler;
    };

	return ModificationHandler;
});
