/*global QUnit */

sap.ui.define([
	"sap/ui/integration/util/SorterHelper"
],
	function (
		SorterHelper
	) {
		"use strict";

		QUnit.module("SorterHelper 'getGroupSorter'");

		QUnit.test("Return type", function (assert) {

			const oGroupASC = {
				"title": "Title 1",
				"order": {
					"path": "/",
					"dir": "ASC"
				}
			};
			const oGroupDESC = {
				"title": "Title 2",
				"order": {
					"path": "/",
					"dir": "DESC"
				}
			};

			const resultASC = SorterHelper.getGroupSorter(oGroupASC);
			const resultDESC = SorterHelper.getGroupSorter(oGroupDESC);

			assert.ok(resultASC.isA("sap.ui.model.Sorter"), "Sorter should be returned when order is ASC");
			assert.ok(resultDESC.isA("sap.ui.model.Sorter"), "Sorter should be returned when order is DESC");
		});
	});