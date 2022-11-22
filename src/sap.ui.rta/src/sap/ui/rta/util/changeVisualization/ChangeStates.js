/*!
 * ${copyright}
 */

sap.ui.define([
], function(
) {
	"use strict";

	var ChangeStates = {};

	ChangeStates.ACTIVATED = "activated";
	ChangeStates.DRAFT = "draft";
	ChangeStates.DIRTY = "dirty";

	/**
	 * Builds an array with the combined State of Draft and Dirty
	 *
	 * @returns {array} Array of change states.
	 */
	ChangeStates.getDraftAndDirtyStates = function() {
		return [this.DRAFT, this.DIRTY];
	};

	return ChangeStates;
});