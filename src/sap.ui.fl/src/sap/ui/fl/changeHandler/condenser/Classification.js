/*!
 * ${copyright}
 */

sap.ui.define([], function() {
	"use strict";

	/**
	 * Available classification types for the condenser
	 *
	 * @enum {string}
	 */
	return {
		/**
		 * All changes but the last one will be removed.
		 * Example: rename
		 */
		LastOneWins: "lastOneWins",

		/**
		 * Two change types reverse each other like a toggle. Only one or no change will be left.
		 * Example: hide/unhide
		 */
		Reverse: "reverse",

		/**
		 * Moving a control inside a container. For a control there will only be one move change left.
		 */
		Move: "move",

		/**
		 * Creating a new control (not only changing the visibility) that was previously not in the container.
		 */
		Create: "create",

		/**
		 * Destroying a control or removing it from the container.
		 */
		Destroy: "destroy",

		/**
		 * Updates another change and will be deleted afterwards. Only the last update is considered.
		 */
		Update: "update"
	};
});
