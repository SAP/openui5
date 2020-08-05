/*!
 * ${copyright}
 */

// Provides the Design Time Metadata for the sap.uxap.ObjectPageLayout control
sap.ui.define(["sap/uxap/library"],
	function() {
		"use strict";

		return {
			"default" : {
				someKeyToOverwriteInScopes : "default",
				some : {
					deep : {
						key : "default"
					}
				}
			},
			someScope : {
				newKey : "new", //new
				someKeyToOverwriteInScopes : "scoped", //overwrite
				some : {
					deep : null //delete
				}
			}
		};
	});