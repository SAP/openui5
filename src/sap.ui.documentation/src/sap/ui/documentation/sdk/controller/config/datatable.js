/*!
 * ${copyright}
 */

sap.ui.define([], function () {
	"use strict";

	return {
		getPreset: function () {
			return {
				"dom": '',
				"buttons": [  { extend: 'colvis' } ],
				"lengthMenu": [[10, 25, 50, 100, -1], [10, 25, 50, 100, "All"]],
				"sapTableId": "",
				"language": {
					"buttons": {
						"colvis": "Show/hide columns"
					}
				}
			};
		}
	};
});