/*
 * A module that records all its executions in a global array 'window.aModuleExecutions'.
 * Some global storage is needed so that the recording is not local to the module execution.
 *
 *   "Give me the place to stand, and I shall move the earth."
 *                                                           Archimedes
 */
sap.ui.define([], function() {
	"use strict";
	window.aModuleExecutions.push( Math.random().toString(36).slice(2) );
});
