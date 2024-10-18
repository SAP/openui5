/*!
 * ${copyright}
 */

// Provides class sap.base.util.clamp
sap.ui.define([],	function() {
	'use strict';

	/**
	 * Returns a value clamped between an upper bound 'max' and lower bound 'min'.
	 * @param {number} val value
	 * @param {number} min lower bound
	 * @param {number} max upper bound
	 * @returns {number} clamped value
	 * @public
	 * @since 1.130
	 */
	const clamp = (val, min, max) => {
		// handles case when max < min
		return Math.min(Math.max(val, min), Math.max(min, max));
	};

	return clamp;
});