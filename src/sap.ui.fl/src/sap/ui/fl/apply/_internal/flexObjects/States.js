/*!
 * ${copyright}
 */
sap.ui.define([], function() {
	"use strict";

	return {
		LifecycleState: {
			NEW: "NEW",
			PERSISTED: "NONE",
			DELETED: "DELETE",
			DIRTY: "UPDATE"
		},
		ApplyState: {
			INITIAL: "initial",
			APPLYING: "applying",
			REVERTING: "reverting",
			REVERT_FINISHED: "revert finished",
			APPLY_SUCCESSFUL: "apply successful",
			APPLY_FAILED: "apply failed"
		},
		Operations: {
			APPLY: "apply",
			REVERT: "revert"
		}
	};
});