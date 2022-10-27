/*!
 * ${copyright}
 */

// Provides enumeration sap.m.p13n.ProcessingStrategy
sap.ui.define(function() {
	"use strict";

   /**
	 * Defines the delta types of the <code>sap.m.p13n.p13n.Engine</code>.
	 *
	 * @enum {string}
     * @private
	 * @since 1.108
	 * @alias sap.m.p13n.ProcessingStrategy
	 */
	var ProcessingStrategy = {
		/**
		 * The delta will only calculate changes that will be added in addition to the existing state
		 */
		Add: false,
		/**
		 * The delta will calculate changes and include state that has been added and removed
		 * <b>Note</b>: For example for array based state, entries added/removed will be respected.
		 * For example for object/path based state, the diff will not include paths that have not been explicitly provided.
		 */
		PartialReplace: true,
		/**
		 * The delta will be calculated as complete/absolute state difference, in case the new state does not
		 * provide a path to an existing state, this is going to be removed in addition to the PartialReplace processing strategy.
		 */
		FullReplace: "FullReplace"
	};

	return ProcessingStrategy;

});