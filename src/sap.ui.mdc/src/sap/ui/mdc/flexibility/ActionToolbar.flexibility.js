/*
 * ! ${copyright}
 */

sap.ui.define([
	'./ItemBaseFlex'
], function(ItemBaseFlex) {
	"use strict";

    var oActionFlex = Object.assign({}, ItemBaseFlex);
    oActionFlex.findItem = function(oModifier, aActions, sName) {
		return sap.ui.getCore().byId(sName);
	};

	return {
        "moveControls": "default",
        moveAction: oActionFlex.createMoveChangeHandler()
	};

});