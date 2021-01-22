sap.ui.define([], function () {
	"use strict";

	return {
		DEBOUNCE_TIME: 500,

		/**
		 * The type of the editor in "Explore"
		 */
		EDITOR_TYPE: {
			/**
			 * Denotes the Text Editor
			 */
			TEXT: "TEXT",
			/**
			 * Denotes the Visual Editor for the manifest (BAS editor)
			 */
			VISUAL: "VISUAL"
		}
	};
});