/*!
 * ${copyright}
 */

// Provides enumeration sap.ui.model.TreeAutoExpandMode
sap.ui.define([],
	function() {
	"use strict";

	/**
	 * Different modes for setting the auto expand mode on tree or analytical bindings.
	 *
	 * @version ${version}
	 * @enum {string}
	 * @alias sap.ui.model.TreeAutoExpandMode
	 * @protected
	 */
	var TreeAutoExpandMode = {

		/**
		 * Tree nodes will be expanded in sequence, level by level (Single requests are sent).
		 * @protected
		 */
		Sequential: "Sequential",

		/**
		 * If supported by a backend provider with analytical capabilities, the requests needed for an automatic
		 * node expansion are bundled.
		 * @protected
		 */
		Bundled: "Bundled"
	};

	return TreeAutoExpandMode;

}, /* bExport= */ true);