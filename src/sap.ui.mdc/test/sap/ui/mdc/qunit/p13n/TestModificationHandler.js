/*
* ! ${copyright}
*/
sap.ui.define([
    "sap/ui/mdc/p13n/modification/ModificationHandler"
], function(ModificationHandler) {
	"use strict";

    /**
	 *  @class Flex specific modification handler implementation
	 *
	 *
	 * @author SAP SE
	 * @public
	 * @since 1.87.0
	 * @alias sap.ui.mdc.p13n.modification.TestModificationHandler
	 */
	var TestModificationHandler = ModificationHandler.extend("sap.ui.mdc.p13n.modification.TestModificationHandler");

    TestModificationHandler.getInstance = function() {
        return new TestModificationHandler();
    };

	return TestModificationHandler;
});
