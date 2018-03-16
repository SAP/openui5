/*!
 * ${copyright}
 */
/*
 * IMPORTANT: This is a private module, its API must not be used and is subject to change.
 * Code other than the OpenUI5 libraries must not introduce dependencies to this module.
 */
sap.ui.define(['sap/base/events/PseudoEvents'], function(PseudoEvents) {
	"use strict";

	/**
	 * @exports sap/base/events/PseudoTypes
	 * @private
	 */
	var PseudoTypes = {};

	/**
	 * Returns an array of names (as strings) identifying {@link sap.base.events.PseudoEvents.events} that are fulfilled by this very Event instance.
	 *
	 * @returns {String[]} Array of names identifying {@link sap.base.events.PseudoEvents.events} that are fulfilled by this very Event instance.
	 * @private
	 */
	PseudoTypes.getPseudoTypes = function() {
		var aPseudoTypes = [];

		if (PseudoEvents.getBasicTypes().indexOf(this.type) != -1) {
			var ilength = PseudoEvents.order.length;
			var oPseudo = null;

			for (var i = 0; i < ilength; i++) {
				oPseudo = PseudoEvents.events[PseudoEvents.order[i]];
				if (oPseudo.aTypes
					&& oPseudo.aTypes.indexOf(this.type) > -1
					&& oPseudo.fnCheck
					&& oPseudo.fnCheck(this)) {
					aPseudoTypes.push(oPseudo.sName);
				}
			}
		}

		this.getPseudoTypes = function() {
			return aPseudoTypes.slice();
		};

		return aPseudoTypes.slice();
	};

	/**
	 * Checks whether this instance of {@link jQuery.Event} is of the given <code>sType</code> pseudo type.
	 *
	 * @param {string} sType The name of the pseudo type this event should be checked for.
	 * @returns {boolean} <code>true</code> if this instance of jQuery.Event is of the given sType, <code>false</code> otherwise.
	 * @private
	 */
	PseudoTypes.isPseudoType = function(sType) {
		var aPseudoTypes = this.getPseudoTypes();

		if (sType) {
			return aPseudoTypes.indexOf(sType) > -1;
		} else {
			return aPseudoTypes.length > 0;
		}
	};

	return PseudoTypes;
});