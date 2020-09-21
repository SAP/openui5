/*!
 * ${copyright}
 */

sap.ui.define([], function () {
	"use strict";

	return {
		getPreset: function () {
			return {
				"dom": '<"fg-toolbar ui-toolbar ui-widget-header ui-helper-clearfix ui-corner-tl ui-corner-tr"<"searchWrapper"f>l<"pagingWrapper"p>t>' +
					't' +
					'<"fg-toolbar ui-toolbar ui-widget-header ui-helper-clearfix ui-corner-bl ui-corner-br"ip>',
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