sap.ui.define(["sap/ui/integration/Designtime"
], function (Designtime) {
	"use strict";
	return function () {
		return new Designtime({
			"form": {
				"items": {
					"dest1.destination": {
						"type": "destination",
						"label": "dest1 with sorter",
						"sorter": [{
							"path": "name",
							"descending": true
						}]
					},
					"dest2.destination": {
						"type": "destination",
						"label": "dest2 with filter",
						"filter": {
							"path": "name",
							"operator": "Contains",
							"value1": "t"
						}
					},
					"dest3.destination": {
						"type": "destination",
						"label": "dest3 with filters and And condition default",
						"filter": {
							"filters": [{
								"path": "name",
								"operator": "StartsWith",
								"value1": "P"
							},{
								"path": "name",
								"operator": "EndsWith",
								"value1": "s"
							}]
						}
					},
					"dest4.destination": {
						"type": "destination",
						"label": "dest4 with filters and And condition TRUE",
						"filter": {
							"filters": [{
								"path": "name",
								"operator": "StartsWith",
								"value1": "P"
							},{
								"path": "name",
								"operator": "EndsWith",
								"value1": "s"
							}],
							"and": true
						}
					},
					"dest5.destination": {
						"type": "destination",
						"label": "dest5 with filters and And condition FALSE",
						"filter": {
							"filters": [{
								"path": "name",
								"operator": "StartsWith",
								"value1": "P"
							},{
								"path": "name",
								"operator": "EndsWith",
								"value1": "s"
							}],
							"and": false
						}
					},
					"dest6.destination": {
						"type": "destination",
						"label": "dest6 with sorters and filter",
						"sorter": [{
							"path": "name",
							"descending": true
						}],
						"filter": {
							"path": "name",
							"operator": "Contains",
							"value1": "t"
						}
					},
					"dest7.destination": {
						"type": "destination",
						"label": "dest7 with sorters and filters",
						"sorter": [{
							"path": "name",
							"descending": true
						}],
						"filter": {
							"filters": [{
								"path": "name",
								"operator": "StartsWith",
								"value1": "P"
							},{
								"path": "name",
								"operator": "EndsWith",
								"value1": "s"
							}]
						}
					}
				}
			}
		});
	};
});
