/*!
 * ${copyright}
 */
sap.ui.define([], function() {
    'use strict';

	// Enum to handle the focus behavior, see Element#onfocusfail
	const FocusMode = {
		/**
		 * Synchronous focus mode: The focus should be applied immediately.
		 */
		"SYNC": "sync",

		/**
		 * Rendering pending mode: The focus should be applied before the next rendering.
		 */
		"RENDERING_PENDING": "rendering_pending",

		/**
		 * Default focus mode: Focus is deferred. Focus should be applied asynchronously.
		 */
		"DEFAULT": "default"
	};

	return FocusMode;
});
