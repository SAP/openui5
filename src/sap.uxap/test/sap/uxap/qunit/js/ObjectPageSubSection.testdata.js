var testData = (function () {
	"use strict";

	var aStandardModeConfig = [{
			"configString": "a-1",
			"expectedBlockConfig": [[12, 6, 8, 9, false, false, false, false], [12, 6, 4, 3, false, false, false, false]]
		}, {
			"configString": "a-2",
			"expectedBlockConfig": [[12, 12, 4, 6, false, false, false, false], [12, 12, 8, 6, false, true, false, false]]
		}, {
			"configString": "a-3",
			"expectedBlockConfig": [[12, 12, 12, 3, false, false, false, false], [12, 12, 12, 9, false, true, true, false]]
		}, {
			"configString": "1-a",
			"expectedBlockConfig": [[12, 6, 4, 3, false, false, false, false], [12, 6, 8, 9, false, false, false, false]]
		}, {
			"configString": "2-a",
			"expectedBlockConfig": [[12, 12, 8, 6, false, false, false, false], [12, 12, 4, 6, false, true, false, false]]
		}, {
			"configString": "3-a",
			"expectedBlockConfig": [[12, 12, 12, 9, false, false, false, false], [12, 12, 12, 3, false, true, true, false]]
		}, {
			"configString": "a-a-1",
			"expectedBlockConfig": [[12, 6, 4, 6, false, false, false, false], [12, 6, 4, 3, false, false, false, false], [12, 6, 4, 3, false, true, false, false]]
		}, {
			"configString": "a-a-2",
			"expectedBlockConfig": [[12, 6, 8, 3, false, false, false, false], [12, 6, 4, 3, false, false, false, false], [12, 12, 8, 6, false, true, true, false]]
		}, {
			"configString": "1-a-1",
			"expectedBlockConfig": [[12, 6, 4, 3, false, false, false, false], [12, 6, 4, 6, false, false, false, false], [12, 6, 4, 3, false, true, false, false]]
		}, {
			"configString": "1-a-2",
			"expectedBlockConfig": [[12, 6, 4, 3, false, false, false, false], [12, 6, 8, 3, false, false, false, false], [12, 12, 8, 6, false, true, true, false]]
		}, {
			"configString": "2-a-a",
			"expectedBlockConfig": [[12, 12, 8, 6, false, false, false, false], [12, 6, 4, 3, false, true, false, false], [12, 6, 12, 3, false, false, true, false]]
		}, {
			"configString": "2-a-1",
			"expectedBlockConfig": [[12, 12, 8, 6, false, false, false, false], [12, 6, 4, 3, false, true, false, false], [12, 6, 4, 3, false, false, true, false]]
		}, {
			"configString": "2-1-a",
			"expectedBlockConfig": [[12, 12, 8, 6, false, false, false, false], [12, 6, 4, 3, false, true, false, false], [12, 6, 12, 3, false, false, true, false]]
		}, {
			"configString": "a-a-a-1",
			"expectedBlockConfig": [[12, 6, 4, 3, false, false, false, false], [12, 6, 4, 3, false, false, false, false], [12, 6, 4, 3, false, true, false, false], [12, 6, 4, 3, false, false, true, false]]
		}, {
			"configString": "a-a-a-2",
			"expectedBlockConfig": [[12, 6, 4, 6, false, false, false, false], [12, 6, 4, 3, false, false, false, false], [12, 12, 4, 3, false, true, false, false], [12, 12, 8, 6, false, true, true, true]]
		}, {
			"configString": "a-1-a-1",
			"expectedBlockConfig": [[12, 6, 4, 3, false, false, false, false], [12, 6, 4, 3, false, false, false, false], [12, 6, 4, 3, false, true, false, false], [12, 6, 4, 3, false, false, true, false]]
		}, {
			"configString": "1-a-1-a",
			"expectedBlockConfig": [[12, 6, 4, 3, false, false, false, false], [12, 6, 4, 3, false, false, false, false], [12, 6, 4, 3, false, true, false, false], [12, 6, 12, 3, false, false, true, false]]
		}, {
			"configString": "1-a-a-1",
			"expectedBlockConfig": [[12, 6, 4, 3, false, false, false, false], [12, 6, 4, 3, false, false, false, false], [12, 6, 4, 3, false, true, false, false], [12, 6, 4, 3, false, false, true, false]]
		}, {
			"configString": "a-2-a-1",
			"expectedBlockConfig": [[12, 12, 4, 3, false, false, false, false], [12, 12, 8, 6, false, true, false, false], [12, 6, 8, 3, false, true, true, false], [12, 6, 4, 3, false, false, false, true]]
		}, {
			"configString": "a-2-a-2",
			"expectedBlockConfig": [[12, 12, 4, 3, false, false, false, false], [12, 12, 8, 6, false, true, false, false], [12, 12, 4, 3, false, true, true, false], [12, 12, 8, 6, false, true, false, true]]
		}, {
			"configString": "2-a-a-2",
			"expectedBlockConfig": [[12, 12, 8, 6, false, false, false, false], [12, 6, 4, 3, false, true, false, false], [12, 6, 4, 3, false, false, true, false], [12, 12, 8, 6, false, true, false, true]]
		}, {
			"configString": "3-a-3-a",
			"expectedBlockConfig": [[12, 12, 12, 9, false, false, false, false], [12, 12, 12, 3, false, true, true, false], [12, 12, 12, 9, false, true, true, true], [12, 12, 12, 3, false, true, true, false]]
		}, {
			"configString": "1-a-a-a-1",
			"expectedBlockConfig": [[12, 6, 4, 3, false, false, false, false], [12, 6, 4, 3, false, false, false, false], [12, 6, 4, 3, false, true, false, false], [12, 6, 8, 3, false, false, true, false], [12, 6, 4, 3, false, true, false, true]]
		}, {
			"configString": "2-a-a-a-2",
			"expectedBlockConfig": [[12, 12, 8, 6, false, false, false, false], [12, 6, 4, 3, false, true, false, false], [12, 6, 8, 3, false, false, true, false], [12, 12, 4, 6, false, true, false, true], [12, 12, 8, 6, false, true, true, false]]
		}, {
			"configString": "3-a-a-a-1",
			"expectedBlockConfig": [[12, 12, 12, 9, false, false, false, false], [12, 6, 4, 3, false, true, true, false], [12, 6, 4, 6, false, false, false, true], [12, 6, 4, 3, false, true, false, false], [12, 6, 4, 3, false, false, true, false]]
		}, {
			"configString": "3-a-a-a-2",
			"expectedBlockConfig": [[12, 12, 12, 9, false, false, false, false], [12, 6, 4, 3, false, true, true, false], [12, 6, 4, 3, false, false, false, true], [12, 12, 4, 3, false, true, false, false], [12, 12, 8, 6, false, true, true, false]]
		}, {
			"configString": "a-a-1-1-a",
			"expectedBlockConfig": [[12, 6, 4, 3, false, false, false, false], [12, 6, 4, 3, false, false, false, false], [12, 6, 4, 3, false, true, false, false], [12, 6, 4, 3, false, false, true, false], [12, 12, 8, 12, false, true, false, true]]
		}, {
			"configString": "a-a-1-a-1",
			"expectedBlockConfig": [[12, 6, 4, 3, false, false, false, false], [12, 6, 4, 3, false, false, false, false], [12, 6, 4, 3, false, true, false, false], [12, 6, 8, 3, false, false, true, false], [12, 6, 4, 3, false, true, false, true]]
		}, {
			"configString": "a-3-a-a-2",
			"expectedBlockConfig": [[12, 12, 12, 3, false, false, false, false], [12, 12, 12, 9, false, true, true, false], [12, 6, 8, 3, false, true, true, true], [12, 6, 4, 3, false, false, false, false], [12, 12, 8, 6, false, true, true, false]]
		}, {
			"configString": "a-2-a-a-1",
			"expectedBlockConfig": [[12, 12, 4, 3, false, false, false, false], [12, 12, 8, 6, false, true, false, false], [12, 6, 4, 3, false, true, true, false], [12, 6, 4, 9, false, false, false, true], [12, 6, 4, 3, false, true, false, false]]
		}, {
			"configString": "a-2-a-a-2",
			"expectedBlockConfig": [[12, 12, 4, 3, false, false, false, false], [12, 12, 8, 6, false, true, false, false], [12, 6, 8, 3, false, true, true, false], [12, 6, 4, 6, false, false, false, true], [12, 12, 8, 6, false, true, true, false]]
		}, {
			"configString": "a-1-a-1-a",
			"expectedBlockConfig": [[12, 6, 4, 3, false, false, false, false], [12, 6, 4, 3, false, false, false, false], [12, 6, 4, 3, false, true, false, false], [12, 6, 4, 3, false, false, true, false], [12, 12, 8, 12, false, true, false, true]]
		}, {
			"configString": "a-1-a-2-a",
			"expectedBlockConfig": [[12, 6, 4, 6, false, false, false, false], [12, 6, 4, 3, false, false, false, false], [12, 12, 4, 3, false, true, false, false], [12, 12, 8, 6, false, true, true, true], [12, 12, 4, 6, false, true, false, false]]
		}, {
			"configString": "a-2-a-1-a",
			"expectedBlockConfig": [[12, 12, 4, 3, false, false, false, false], [12, 12, 8, 6, false, true, false, false], [12, 6, 4, 3, false, true, true, false], [12, 6, 4, 3, false, false, false, true], [12, 12, 4, 9, false, true, false, false]]
		}, {
			"configString": "a-3-a-1-a",
			"expectedBlockConfig": [[12, 12, 12, 3, false, false, false, false], [12, 12, 12, 9, false, true, true, false], [12, 6, 4, 6, false, true, true, true], [12, 6, 4, 3, false, false, false, false], [12, 12, 4, 3, false, true, false, false]]
		}, {
			"configString": "1-a-1-a-1",
			"expectedBlockConfig": [[12, 6, 4, 3, false, false, false, false], [12, 6, 4, 3, false, false, false, false], [12, 6, 4, 3, false, true, false, false], [12, 6, 8, 3, false, false, true, false], [12, 6, 4, 3, false, true, false, true]]
		}, {
			"configString": "1-a-a-1-a",
			"expectedBlockConfig": [[12, 6, 4, 3, false, false, false, false], [12, 6, 4, 3, false, false, false, false], [12, 6, 4, 3, false, true, false, false], [12, 6, 4, 3, false, false, true, false], [12, 12, 8, 12, false, true, false, true]]
		}, {
			"configString": "1-a-2-a-1",
			"expectedBlockConfig": [[12, 6, 4, 3, false, false, false, false], [12, 6, 8, 3, false, false, false, false], [12, 12, 8, 6, false, true, true, false], [12, 6, 4, 9, false, true, false, true], [12, 6, 4, 3, false, false, true, false]]
		}, {
			"configString": "1-a-3-a-2",
			"expectedBlockConfig": [[12, 6, 4, 3, false, false, false, false], [12, 6, 8, 9, false, false, false, false], [12, 12, 12, 9, false, true, true, true], [12, 12, 4, 3, false, true, true, false], [12, 12, 8, 6, false, true, false, true]]
		}, {
			"configString": "2-a-a-2-a",
			"expectedBlockConfig": [[12, 12, 8, 6, false, false, false, false], [12, 6, 4, 3, false, true, false, false], [12, 6, 4, 3, false, false, true, false], [12, 12, 8, 6, false, true, false, true], [12, 12, 12, 6, false, true, true, false]]
		}, {
			"configString": "3-a-a-3-a",
			"expectedBlockConfig": [[12, 12, 12, 9, false, false, false, false], [12, 6, 8, 3, false, true, true, false], [12, 6, 4, 3, false, false, false, true], [12, 12, 12, 9, false, true, true, false], [12, 12, 12, 12, false, true, true, true]]
		}, {
			"configString": "1-a-a-a-a-1",
			"expectedBlockConfig": [[12, 6, 4, 3, false, false, false, false], [12, 6, 4, 3, false, false, false, false], [12, 6, 4, 3, false, true, false, false], [12, 6, 4, 3, false, false, true, false], [12, 6, 4, 9, false, true, false, true], [12, 6, 4, 3, false, false, false, false]]
		}, {
			"configString": "1-a-a-a-a-3",
			"expectedBlockConfig": [[12, 6, 4, 3, false, false, false, false], [12, 6, 4, 3, false, false, false, false], [12, 6, 4, 3, false, true, false, false], [12, 6, 8, 3, false, false, true, false], [12, 12, 4, 3, false, true, false, true], [12, 12, 12, 9, false, true, true, false]]
		}, {
			"configString": "a-a-a-1-a-a",
			"expectedBlockConfig": [[12, 6, 4, 3, false, false, false, false], [12, 6, 4, 3, false, false, false, false], [12, 6, 4, 3, false, true, false, false], [12, 6, 4, 3, false, false, true, false], [12, 6, 4, 9, false, true, false, true], [12, 6, 4, 3, false, false, false, false]]
		}, {
			"configString": "a-a-a-2-a-a",
			"expectedBlockConfig": [[12, 6, 4, 6, false, false, false, false], [12, 6, 4, 3, false, false, false, false], [12, 12, 4, 3, false, true, false, false], [12, 12, 8, 6, false, true, true, true], [12, 6, 4, 3, false, true, false, false], [12, 6, 12, 3, false, false, true, false]]
		}, {
			"configString": "a-a-1-a-a-a",
			"expectedBlockConfig": [[12, 6, 4, 3, false, false, false, false], [12, 6, 4, 3, false, false, false, false], [12, 6, 4, 3, false, true, false, false], [12, 6, 4, 3, false, false, true, false], [12, 6, 4, 9, false, true, false, true], [12, 6, 4, 3, false, false, false, false]]
		}, {
			"configString": "a-a-2-a-a-a",
			"expectedBlockConfig": [[12, 6, 8, 3, false, false, false, false], [12, 6, 4, 3, false, false, false, false], [12, 12, 8, 6, false, true, true, false], [12, 6, 4, 6, false, true, false, true], [12, 6, 8, 3, false, false, true, false], [12, 12, 4, 3, false, true, false, false]]
		}, {
			"configString": "a-a-3-a-a-a",
			"expectedBlockConfig": [[12, 6, 8, 9, false, false, false, false], [12, 6, 4, 3, false, false, false, false], [12, 12, 12, 9, false, true, true, true], [12, 6, 4, 3, false, true, true, false], [12, 6, 4, 9, false, false, false, true], [12, 12, 4, 3, false, true, false, false]]
		}, {
			"configString": "a-1-a-a-1-a",
			"expectedBlockConfig": [[12, 6, 4, 3, false, false, false, false], [12, 6, 4, 3, false, false, false, false], [12, 6, 4, 3, false, true, false, false], [12, 6, 4, 3, false, false, true, false], [12, 6, 4, 3, false, true, false, true], [12, 6, 4, 9, false, false, false, false]]
		}, {
			"configString": "a-2-a-a-2-a",
			"expectedBlockConfig": [[12, 12, 4, 3, false, false, false, false], [12, 12, 8, 6, false, true, false, false], [12, 6, 8, 3, false, true, true, false], [12, 6, 4, 3, false, false, false, true], [12, 12, 8, 6, false, true, true, false], [12, 12, 4, 3, false, true, false, false]]
		}, {
			"configString": "a-3-a-a-3-a",
			"expectedBlockConfig": [[12, 12, 12, 3, false, false, false, false], [12, 12, 12, 9, false, true, true, false], [12, 6, 8, 9, false, true, true, true], [12, 6, 4, 3, false, false, false, false], [12, 12, 12, 9, false, true, true, true], [12, 12, 12, 3, false, true, true, false]]
		}, {
			"configString": "a-1-a-a-a-1",
			"expectedBlockConfig": [[12, 6, 4, 3, false, false, false, false], [12, 6, 4, 3, false, false, false, false], [12, 6, 4, 3, false, true, false, false], [12, 6, 4, 3, false, false, true, false], [12, 6, 4, 9, false, true, false, true], [12, 6, 4, 3, false, false, false, false]]
		}, {
			"configString": "a-2-a-a-a-1",
			"expectedBlockConfig": [[12, 12, 4, 3, false, false, false, false], [12, 12, 8, 6, false, true, false, false], [12, 6, 4, 3, false, true, true, false], [12, 6, 4, 6, false, false, false, true], [12, 6, 4, 3, false, true, false, false], [12, 6, 4, 3, false, false, true, false]]
		}, {
			"configString": "a-1-a-1-a-1",
			"expectedBlockConfig": [[12, 6, 4, 3, false, false, false, false], [12, 6, 4, 3, false, false, false, false], [12, 6, 4, 3, false, true, false, false], [12, 6, 4, 3, false, false, true, false], [12, 6, 4, 9, false, true, false, true], [12, 6, 4, 3, false, false, false, false]]
		}, {
			"configString": "a-2-a-2-a-2",
			"expectedBlockConfig": [[12, 12, 4, 3, false, false, false, false], [12, 12, 8, 6, false, true, false, false], [12, 12, 4, 3, false, true, true, false], [12, 12, 8, 6, false, true, false, true], [12, 12, 4, 6, false, true, true, false], [12, 12, 8, 6, false, true, false, true]]
		}, {
			"configString": "a-3-a-2-a-1",
			"expectedBlockConfig": [[12, 12, 12, 3, false, false, false, false], [12, 12, 12, 9, false, true, true, false], [12, 12, 4, 3, false, true, true, true], [12, 12, 8, 6, false, true, false, false], [12, 6, 8, 3, false, true, true, false], [12, 6, 4, 3, false, false, false, true]]
		}], aTwoColumnInLConfig = [{
			"configString": "a-1",
			"expectedBlockConfig": [[12, 6, 6, 9, false, false, false, false], [12, 6, 6, 3, false, false, false, false]]
		}, {
			"configString": "a-2",
			"expectedBlockConfig": [[12, 12, 12, 6, false, false, false, false], [12, 12, 12, 6, false, true, true, false]]
		}, {
			"configString": "a-3",
			"expectedBlockConfig": [[12, 12, 12, 3, false, false, false, false], [12, 12, 12, 9, false, true, true, false]]
		}, {
			"configString": "1-a",
			"expectedBlockConfig": [[12, 6, 6, 3, false, false, false, false], [12, 6, 6, 9, false, false, false, false]]
		}, {
			"configString": "2-a",
			"expectedBlockConfig": [[12, 12, 12, 6, false, false, false, false], [12, 12, 12, 6, false, true, true, false]]
		}, {
			"configString": "3-a",
			"expectedBlockConfig": [[12, 12, 12, 9, false, false, false, false], [12, 12, 12, 3, false, true, true, false]]
		}, {
			"configString": "a-a-1",
			"expectedBlockConfig": [[12, 6, 6, 6, false, false, false, false], [12, 6, 6, 3, false, false, false, false], [12, 6, 6, 3, false, true, true, false]]
		}, {
			"configString": "a-a-2",
			"expectedBlockConfig": [[12, 6, 6, 3, false, false, false, false], [12, 6, 6, 3, false, false, false, false], [12, 12, 12, 6, false, true, true, false]]
		}, {
			"configString": "1-a-1",
			"expectedBlockConfig": [[12, 6, 6, 3, false, false, false, false], [12, 6, 6, 6, false, false, false, false], [12, 6, 6, 3, false, true, true, false]]
		}, {
			"configString": "1-a-2",
			"expectedBlockConfig": [[12, 6, 6, 3, false, false, false, false], [12, 6, 6, 3, false, false, false, false], [12, 12, 12, 6, false, true, true, false]]
		}, {
			"configString": "2-a-a",
			"expectedBlockConfig": [[12, 12, 12, 6, false, false, false, false], [12, 6, 6, 3, false, true, true, false], [12, 6, 6, 3, false, false, false, false]]
		}, {
			"configString": "2-a-1",
			"expectedBlockConfig": [[12, 12, 12, 6, false, false, false, false], [12, 6, 6, 3, false, true, true, false], [12, 6, 6, 3, false, false, false, false]]
		}, {
			"configString": "2-1-a",
			"expectedBlockConfig": [[12, 12, 12, 6, false, false, false, false], [12, 6, 6, 3, false, true, true, false], [12, 6, 6, 3, false, false, false, false]]
		}, {
			"configString": "a-a-a-1",
			"expectedBlockConfig": [[12, 6, 6, 3, false, false, false, false], [12, 6, 6, 3, false, false, false, false], [12, 6, 6, 3, false, true, true, false], [12, 6, 6, 3, false, false, false, false]]
		}, {
			"configString": "a-a-a-2",
			"expectedBlockConfig": [[12, 6, 6, 6, false, false, false, false], [12, 6, 6, 3, false, false, false, false], [12, 12, 12, 3, false, true, true, false], [12, 12, 12, 6, false, true, true, true]]
		}, {
			"configString": "a-1-a-1",
			"expectedBlockConfig": [[12, 6, 6, 3, false, false, false, false], [12, 6, 6, 3, false, false, false, false], [12, 6, 6, 3, false, true, true, false], [12, 6, 6, 3, false, false, false, false]]
		}, {
			"configString": "1-a-1-a",
			"expectedBlockConfig": [[12, 6, 6, 3, false, false, false, false], [12, 6, 6, 3, false, false, false, false], [12, 6, 6, 3, false, true, true, false], [12, 6, 6, 3, false, false, false, false]]
		}, {
			"configString": "1-a-a-1",
			"expectedBlockConfig": [[12, 6, 6, 3, false, false, false, false], [12, 6, 6, 3, false, false, false, false], [12, 6, 6, 3, false, true, true, false], [12, 6, 6, 3, false, false, false, false]]
		}, {
			"configString": "a-2-a-1",
			"expectedBlockConfig": [[12, 12, 12, 3, false, false, false, false], [12, 12, 12, 6, false, true, true, false], [12, 6, 6, 3, false, true, true, false], [12, 6, 6, 3, false, false, false, true]]
		}, {
			"configString": "a-2-a-2",
			"expectedBlockConfig": [[12, 12, 12, 3, false, false, false, false], [12, 12, 12, 6, false, true, true, false], [12, 12, 12, 3, false, true, true, false], [12, 12, 12, 6, false, true, true, true]]
		}, {
			"configString": "2-a-a-2",
			"expectedBlockConfig": [[12, 12, 12, 6, false, false, false, false], [12, 6, 6, 3, false, true, true, false], [12, 6, 6, 3, false, false, false, false], [12, 12, 12, 6, false, true, true, true]]
		}, {
			"configString": "3-a-3-a",
			"expectedBlockConfig": [[12, 12, 12, 9, false, false, false, false], [12, 12, 12, 3, false, true, true, false], [12, 12, 12, 9, false, true, true, true], [12, 12, 12, 3, false, true, true, false]]
		}, {
			"configString": "1-a-a-a-1",
			"expectedBlockConfig": [[12, 6, 6, 3, false, false, false, false], [12, 6, 6, 3, false, false, false, false], [12, 6, 6, 3, false, true, true, false], [12, 6, 6, 3, false, false, false, false], [12, 6, 6, 3, false, true, true, true]]
		}, {
			"configString": "2-a-a-a-2",
			"expectedBlockConfig": [[12, 12, 12, 6, false, false, false, false], [12, 6, 6, 3, false, true, true, false], [12, 6, 6, 3, false, false, false, false], [12, 12, 12, 6, false, true, true, true], [12, 12, 12, 6, false, true, true, false]]
		}, {
			"configString": "3-a-a-a-1",
			"expectedBlockConfig": [[12, 12, 12, 9, false, false, false, false], [12, 6, 6, 3, false, true, true, false], [12, 6, 6, 6, false, false, false, true], [12, 6, 6, 3, false, true, true, false], [12, 6, 6, 3, false, false, false, false]]
		}, {
			"configString": "3-a-a-a-2",
			"expectedBlockConfig": [[12, 12, 12, 9, false, false, false, false], [12, 6, 6, 3, false, true, true, false], [12, 6, 6, 3, false, false, false, true], [12, 12, 12, 3, false, true, true, false], [12, 12, 12, 6, false, true, true, false]]
		}, {
			"configString": "a-a-1-1-a",
			"expectedBlockConfig": [[12, 6, 6, 3, false, false, false, false], [12, 6, 6, 3, false, false, false, false], [12, 6, 6, 3, false, true, true, false], [12, 6, 6, 3, false, false, false, false], [12, 12, 12, 12, false, true, true, true]]
		}, {
			"configString": "a-a-1-a-1",
			"expectedBlockConfig": [[12, 6, 6, 3, false, false, false, false], [12, 6, 6, 3, false, false, false, false], [12, 6, 6, 3, false, true, true, false], [12, 6, 6, 3, false, false, false, false], [12, 6, 6, 3, false, true, true, true]]
		}, {
			"configString": "a-3-a-a-2",
			"expectedBlockConfig": [[12, 12, 12, 3, false, false, false, false], [12, 12, 12, 9, false, true, true, false], [12, 6, 6, 3, false, true, true, true], [12, 6, 6, 3, false, false, false, false], [12, 12, 12, 6, false, true, true, false]]
		}, {
			"configString": "a-2-a-a-1",
			"expectedBlockConfig": [[12, 12, 12, 3, false, false, false, false], [12, 12, 12, 6, false, true, true, false], [12, 6, 6, 3, false, true, true, false], [12, 6, 6, 9, false, false, false, true], [12, 6, 6, 3, false, true, true, false]]
		}, {
			"configString": "a-2-a-a-2",
			"expectedBlockConfig": [[12, 12, 12, 3, false, false, false, false], [12, 12, 12, 6, false, true, true, false], [12, 6, 6, 3, false, true, true, false], [12, 6, 6, 6, false, false, false, true], [12, 12, 12, 6, false, true, true, false]]
		}, {
			"configString": "a-1-a-1-a",
			"expectedBlockConfig": [[12, 6, 6, 3, false, false, false, false], [12, 6, 6, 3, false, false, false, false], [12, 6, 6, 3, false, true, true, false], [12, 6, 6, 3, false, false, false, false], [12, 12, 12, 12, false, true, true, true]]
		}, {
			"configString": "a-1-a-2-a",
			"expectedBlockConfig": [[12, 6, 6, 6, false, false, false, false], [12, 6, 6, 3, false, false, false, false], [12, 12, 12, 3, false, true, true, false], [12, 12, 12, 6, false, true, true, true], [12, 12, 12, 6, false, true, true, false]]
		}, {
			"configString": "a-2-a-1-a",
			"expectedBlockConfig": [[12, 12, 12, 3, false, false, false, false], [12, 12, 12, 6, false, true, true, false], [12, 6, 6, 3, false, true, true, false], [12, 6, 6, 3, false, false, false, true], [12, 12, 12, 9, false, true, true, false]]
		}, {
			"configString": "a-3-a-1-a",
			"expectedBlockConfig": [[12, 12, 12, 3, false, false, false, false], [12, 12, 12, 9, false, true, true, false], [12, 6, 6, 6, false, true, true, true], [12, 6, 6, 3, false, false, false, false], [12, 12, 12, 3, false, true, true, false]]
		}, {
			"configString": "1-a-1-a-1",
			"expectedBlockConfig": [[12, 6, 6, 3, false, false, false, false], [12, 6, 6, 3, false, false, false, false], [12, 6, 6, 3, false, true, true, false], [12, 6, 6, 3, false, false, false, false], [12, 6, 6, 3, false, true, true, true]]
		}, {
			"configString": "1-a-a-1-a",
			"expectedBlockConfig": [[12, 6, 6, 3, false, false, false, false], [12, 6, 6, 3, false, false, false, false], [12, 6, 6, 3, false, true, true, false], [12, 6, 6, 3, false, false, false, false], [12, 12, 12, 12, false, true, true, true]]
		}, {
			"configString": "1-a-2-a-1",
			"expectedBlockConfig": [[12, 6, 6, 3, false, false, false, false], [12, 6, 6, 3, false, false, false, false], [12, 12, 12, 6, false, true, true, false], [12, 6, 6, 9, false, true, true, true], [12, 6, 6, 3, false, false, false, false]]
		}, {
			"configString": "1-a-3-a-2",
			"expectedBlockConfig": [[12, 6, 6, 3, false, false, false, false], [12, 6, 6, 9, false, false, false, false], [12, 12, 12, 9, false, true, true, true], [12, 12, 12, 3, false, true, true, false], [12, 12, 12, 6, false, true, true, true]]
		}, {
			"configString": "2-a-a-2-a",
			"expectedBlockConfig": [[12, 12, 12, 6, false, false, false, false], [12, 6, 6, 3, false, true, true, false], [12, 6, 6, 3, false, false, false, false], [12, 12, 12, 6, false, true, true, true], [12, 12, 12, 6, false, true, true, false]]
		}, {
			"configString": "3-a-a-3-a",
			"expectedBlockConfig": [[12, 12, 12, 9, false, false, false, false], [12, 6, 6, 3, false, true, true, false], [12, 6, 6, 3, false, false, false, true], [12, 12, 12, 9, false, true, true, false], [12, 12, 12, 12, false, true, true, true]]
		}, {
			"configString": "1-a-a-a-a-1",
			"expectedBlockConfig": [[12, 6, 6, 3, false, false, false, false], [12, 6, 6, 3, false, false, false, false], [12, 6, 6, 3, false, true, true, false], [12, 6, 6, 3, false, false, false, false], [12, 6, 6, 9, false, true, true, true], [12, 6, 6, 3, false, false, false, false]]
		}, {
			"configString": "1-a-a-a-a-3",
			"expectedBlockConfig": [[12, 6, 6, 3, false, false, false, false], [12, 6, 6, 3, false, false, false, false], [12, 6, 6, 3, false, true, true, false], [12, 6, 6, 3, false, false, false, false], [12, 12, 12, 3, false, true, true, true], [12, 12, 12, 9, false, true, true, false]]
		}, {
			"configString": "a-a-a-1-a-a",
			"expectedBlockConfig": [[12, 6, 6, 3, false, false, false, false], [12, 6, 6, 3, false, false, false, false], [12, 6, 6, 3, false, true, true, false], [12, 6, 6, 3, false, false, false, false], [12, 6, 6, 9, false, true, true, true], [12, 6, 6, 3, false, false, false, false]]
		}, {
			"configString": "a-a-a-2-a-a",
			"expectedBlockConfig": [[12, 6, 6, 6, false, false, false, false], [12, 6, 6, 3, false, false, false, false], [12, 12, 12, 3, false, true, true, false], [12, 12, 12, 6, false, true, true, true], [12, 6, 6, 3, false, true, true, false], [12, 6, 6, 3, false, false, false, false]]
		}, {
			"configString": "a-a-1-a-a-a",
			"expectedBlockConfig": [[12, 6, 6, 3, false, false, false, false], [12, 6, 6, 3, false, false, false, false], [12, 6, 6, 3, false, true, true, false], [12, 6, 6, 3, false, false, false, false], [12, 6, 6, 9, false, true, true, true], [12, 6, 6, 3, false, false, false, false]]
		}, {
			"configString": "a-a-2-a-a-a",
			"expectedBlockConfig": [[12, 6, 6, 3, false, false, false, false], [12, 6, 6, 3, false, false, false, false], [12, 12, 12, 6, false, true, true, false], [12, 6, 6, 6, false, true, true, true], [12, 6, 6, 3, false, false, false, false], [12, 12, 12, 3, false, true, true, false]]
		}, {
			"configString": "a-a-3-a-a-a",
			"expectedBlockConfig": [[12, 6, 6, 9, false, false, false, false], [12, 6, 6, 3, false, false, false, false], [12, 12, 12, 9, false, true, true, true], [12, 6, 6, 3, false, true, true, false], [12, 6, 6, 9, false, false, false, true], [12, 12, 12, 3, false, true, true, false]]
		}, {
			"configString": "a-1-a-a-1-a",
			"expectedBlockConfig": [[12, 6, 6, 3, false, false, false, false], [12, 6, 6, 3, false, false, false, false], [12, 6, 6, 3, false, true, true, false], [12, 6, 6, 3, false, false, false, false], [12, 6, 6, 3, false, true, true, true], [12, 6, 6, 9, false, false, false, false]]
		}, {
			"configString": "a-2-a-a-2-a",
			"expectedBlockConfig": [[12, 12, 12, 3, false, false, false, false], [12, 12, 12, 6, false, true, true, false], [12, 6, 6, 3, false, true, true, false], [12, 6, 6, 3, false, false, false, true], [12, 12, 12, 6, false, true, true, false], [12, 12, 12, 3, false, true, true, false]]
		}, {
			"configString": "a-3-a-a-3-a",
			"expectedBlockConfig": [[12, 12, 12, 3, false, false, false, false], [12, 12, 12, 9, false, true, true, false], [12, 6, 6, 9, false, true, true, true], [12, 6, 6, 3, false, false, false, false], [12, 12, 12, 9, false, true, true, true], [12, 12, 12, 3, false, true, true, false]]
		}, {
			"configString": "a-1-a-a-a-1",
			"expectedBlockConfig": [[12, 6, 6, 3, false, false, false, false], [12, 6, 6, 3, false, false, false, false], [12, 6, 6, 3, false, true, true, false], [12, 6, 6, 3, false, false, false, false], [12, 6, 6, 9, false, true, true, true], [12, 6, 6, 3, false, false, false, false]]
		}, {
			"configString": "a-2-a-a-a-1",
			"expectedBlockConfig": [[12, 12, 12, 3, false, false, false, false], [12, 12, 12, 6, false, true, true, false], [12, 6, 6, 3, false, true, true, false], [12, 6, 6, 6, false, false, false, true], [12, 6, 6, 3, false, true, true, false], [12, 6, 6, 3, false, false, false, false]]
		}, {
			"configString": "a-1-a-1-a-1",
			"expectedBlockConfig": [[12, 6, 6, 3, false, false, false, false], [12, 6, 6, 3, false, false, false, false], [12, 6, 6, 3, false, true, true, false], [12, 6, 6, 3, false, false, false, false], [12, 6, 6, 9, false, true, true, true], [12, 6, 6, 3, false, false, false, false]]
		}, {
			"configString": "a-2-a-2-a-2",
			"expectedBlockConfig": [[12, 12, 12, 3, false, false, false, false], [12, 12, 12, 6, false, true, true, false], [12, 12, 12, 3, false, true, true, false], [12, 12, 12, 6, false, true, true, true], [12, 12, 12, 6, false, true, true, false], [12, 12, 12, 6, false, true, true, true]]
		}, {
			"configString": "a-3-a-2-a-1",
			"expectedBlockConfig": [[12, 12, 12, 3, false, false, false, false], [12, 12, 12, 9, false, true, true, false], [12, 12, 12, 3, false, true, true, true], [12, 12, 12, 6, false, true, true, false], [12, 6, 6, 3, false, true, true, false], [12, 6, 6, 3, false, false, false, true]]
		}],
		aTitleOnTheLeftConfig = [{
			"configString": "a-1",
			"expectedBlockConfig": [[12, 6, 6, 8, false, false, false, false], [12, 6, 6, 4, false, false, false, false]]
		}, {
			"configString": "a-2",
			"expectedBlockConfig": [[12, 12, 12, 4, false, false, false, false], [12, 12, 12, 8, false, true, true, false]]
		}, {
			"configString": "a-3",
			"expectedBlockConfig": [[12, 12, 12, 12, false, false, false, false], [12, 12, 12, 12, false, true, true, true]]
		}, {
			"configString": "1-a",
			"expectedBlockConfig": [[12, 6, 6, 4, false, false, false, false], [12, 6, 6, 8, false, false, false, false]]
		}, {
			"configString": "2-a",
			"expectedBlockConfig": [[12, 12, 12, 8, false, false, false, false], [12, 12, 12, 4, false, true, true, false]]
		}, {
			"configString": "3-a",
			"expectedBlockConfig": [[12, 12, 12, 12, false, false, false, false], [12, 12, 12, 12, false, true, true, true]]
		}, {
			"configString": "a-a-1",
			"expectedBlockConfig": [[12, 6, 6, 4, false, false, false, false], [12, 6, 6, 4, false, false, false, false], [12, 6, 6, 4, false, true, true, false]]
		}, {
			"configString": "a-a-2",
			"expectedBlockConfig": [[12, 6, 6, 8, false, false, false, false], [12, 6, 6, 4, false, false, false, false], [12, 12, 12, 8, false, true, true, true]]
		}, {
			"configString": "1-a-1",
			"expectedBlockConfig": [[12, 6, 6, 4, false, false, false, false], [12, 6, 6, 4, false, false, false, false], [12, 6, 6, 4, false, true, true, false]]
		}, {
			"configString": "1-a-2",
			"expectedBlockConfig": [[12, 6, 6, 4, false, false, false, false], [12, 6, 6, 8, false, false, false, false], [12, 12, 12, 8, false, true, true, true]]
		}, {
			"configString": "2-a-a",
			"expectedBlockConfig": [[12, 12, 12, 8, false, false, false, false], [12, 6, 6, 4, false, true, true, false], [12, 6, 6, 12, false, false, false, true]]
		}, {
			"configString": "2-a-1",
			"expectedBlockConfig": [[12, 12, 12, 8, false, false, false, false], [12, 6, 6, 4, false, true, true, false], [12, 6, 6, 4, false, false, false, true]]
		}, {
			"configString": "2-1-a",
			"expectedBlockConfig": [[12, 12, 12, 8, false, false, false, false], [12, 6, 6, 4, false, true, true, false], [12, 6, 6, 12, false, false, false, true]]
		}, {
			"configString": "a-a-a-1",
			"expectedBlockConfig": [[12, 6, 6, 4, false, false, false, false], [12, 6, 6, 4, false, false, false, false], [12, 6, 6, 4, false, true, true, false], [12, 6, 6, 4, false, false, false, true]]
		}, {
			"configString": "a-a-a-2",
			"expectedBlockConfig": [[12, 6, 6, 4, false, false, false, false], [12, 6, 6, 4, false, false, false, false], [12, 12, 12, 4, false, true, true, false], [12, 12, 12, 8, false, true, true, true]]
		}, {
			"configString": "a-1-a-1",
			"expectedBlockConfig": [[12, 6, 6, 4, false, false, false, false], [12, 6, 6, 4, false, false, false, false], [12, 6, 6, 4, false, true, true, false], [12, 6, 6, 4, false, false, false, true]]
		}, {
			"configString": "1-a-1-a",
			"expectedBlockConfig": [[12, 6, 6, 4, false, false, false, false], [12, 6, 6, 4, false, false, false, false], [12, 6, 6, 4, false, true, true, false], [12, 6, 6, 12, false, false, false, true]]
		}, {
			"configString": "1-a-a-1",
			"expectedBlockConfig": [[12, 6, 6, 4, false, false, false, false], [12, 6, 6, 4, false, false, false, false], [12, 6, 6, 4, false, true, true, false], [12, 6, 6, 4, false, false, false, true]]
		}, {
			"configString": "a-2-a-1",
			"expectedBlockConfig": [[12, 12, 12, 4, false, false, false, false], [12, 12, 12, 8, false, true, true, false], [12, 6, 6, 8, false, true, true, true], [12, 6, 6, 4, false, false, false, false]]
		}, {
			"configString": "a-2-a-2",
			"expectedBlockConfig": [[12, 12, 12, 4, false, false, false, false], [12, 12, 12, 8, false, true, true, false], [12, 12, 12, 4, false, true, true, true], [12, 12, 12, 8, false, true, true, false]]
		}, {
			"configString": "2-a-a-2",
			"expectedBlockConfig": [[12, 12, 12, 8, false, false, false, false], [12, 6, 6, 4, false, true, true, false], [12, 6, 6, 4, false, false, false, true], [12, 12, 12, 8, false, true, true, false]]
		}, {
			"configString": "3-a-3-a",
			"expectedBlockConfig": [[12, 12, 12, 12, false, false, false, false], [12, 12, 12, 12, false, true, true, true], [12, 12, 12, 12, false, true, true, true], [12, 12, 12, 12, false, true, true, true]]
		}, {
			"configString": "1-a-a-a-1",
			"expectedBlockConfig": [[12, 6, 6, 4, false, false, false, false], [12, 6, 6, 4, false, false, false, false], [12, 6, 6, 4, false, true, true, false], [12, 6, 6, 8, false, false, false, true], [12, 6, 6, 4, false, true, true, false]]
		}, {
			"configString": "2-a-a-a-2",
			"expectedBlockConfig": [[12, 12, 12, 8, false, false, false, false], [12, 6, 6, 4, false, true, true, false], [12, 6, 6, 8, false, false, false, true], [12, 12, 12, 4, false, true, true, false], [12, 12, 12, 8, false, true, true, true]]
		}, {
			"configString": "3-a-a-a-1",
			"expectedBlockConfig": [[12, 12, 12, 12, false, false, false, false], [12, 6, 6, 4, false, true, true, true], [12, 6, 6, 4, false, false, false, false], [12, 6, 6, 4, false, true, true, false], [12, 6, 6, 4, false, false, false, true]]
		}, {
			"configString": "3-a-a-a-2",
			"expectedBlockConfig": [[12, 12, 12, 12, false, false, false, false], [12, 6, 6, 4, false, true, true, true], [12, 6, 6, 4, false, false, false, false], [12, 12, 12, 4, false, true, true, false], [12, 12, 12, 8, false, true, true, true]]
		}, {
			"configString": "a-a-1-1-a",
			"expectedBlockConfig": [[12, 6, 6, 4, false, false, false, false], [12, 6, 6, 4, false, false, false, false], [12, 6, 6, 4, false, true, true, false], [12, 6, 6, 4, false, false, false, true], [12, 12, 12, 8, false, true, true, false]]
		}, {
			"configString": "a-a-1-a-1",
			"expectedBlockConfig": [[12, 6, 6, 4, false, false, false, false], [12, 6, 6, 4, false, false, false, false], [12, 6, 6, 4, false, true, true, false], [12, 6, 6, 8, false, false, false, true], [12, 6, 6, 4, false, true, true, false]]
		}, {
			"configString": "a-3-a-a-2",
			"expectedBlockConfig": [[12, 12, 12, 12, false, false, false, false], [12, 12, 12, 12, false, true, true, true], [12, 6, 6, 8, false, true, true, true], [12, 6, 6, 4, false, false, false, false], [12, 12, 12, 8, false, true, true, true]]
		}, {
			"configString": "a-2-a-a-1",
			"expectedBlockConfig": [[12, 12, 12, 4, false, false, false, false], [12, 12, 12, 8, false, true, true, false], [12, 6, 6, 4, false, true, true, true], [12, 6, 6, 4, false, false, false, false], [12, 6, 6, 4, false, true, true, false]]
		}, {
			"configString": "a-2-a-a-2",
			"expectedBlockConfig": [[12, 12, 12, 4, false, false, false, false], [12, 12, 12, 8, false, true, true, false], [12, 6, 6, 8, false, true, true, true], [12, 6, 6, 4, false, false, false, false], [12, 12, 12, 8, false, true, true, true]]
		}, {
			"configString": "a-1-a-1-a",
			"expectedBlockConfig": [[12, 6, 6, 4, false, false, false, false], [12, 6, 6, 4, false, false, false, false], [12, 6, 6, 4, false, true, true, false], [12, 6, 6, 4, false, false, false, true], [12, 12, 12, 8, false, true, true, false]]
		}, {
			"configString": "a-1-a-2-a",
			"expectedBlockConfig": [[12, 6, 6, 4, false, false, false, false], [12, 6, 6, 4, false, false, false, false], [12, 12, 12, 4, false, true, true, false], [12, 12, 12, 8, false, true, true, true], [12, 12, 12, 4, false, true, true, false]]
		}, {
			"configString": "a-2-a-1-a",
			"expectedBlockConfig": [[12, 12, 12, 4, false, false, false, false], [12, 12, 12, 8, false, true, true, false], [12, 6, 6, 4, false, true, true, true], [12, 6, 6, 4, false, false, false, false], [12, 12, 12, 4, false, true, true, false]]
		}, {
			"configString": "a-3-a-1-a",
			"expectedBlockConfig": [[12, 12, 12, 12, false, false, false, false], [12, 12, 12, 12, false, true, true, true], [12, 6, 6, 4, false, true, true, true], [12, 6, 6, 4, false, false, false, false], [12, 12, 12, 4, false, true, true, false]]
		}, {
			"configString": "1-a-1-a-1",
			"expectedBlockConfig": [[12, 6, 6, 4, false, false, false, false], [12, 6, 6, 4, false, false, false, false], [12, 6, 6, 4, false, true, true, false], [12, 6, 6, 8, false, false, false, true], [12, 6, 6, 4, false, true, true, false]]
		}, {
			"configString": "1-a-a-1-a",
			"expectedBlockConfig": [[12, 6, 6, 4, false, false, false, false], [12, 6, 6, 4, false, false, false, false], [12, 6, 6, 4, false, true, true, false], [12, 6, 6, 4, false, false, false, true], [12, 12, 12, 8, false, true, true, false]]
		}, {
			"configString": "1-a-2-a-1",
			"expectedBlockConfig": [[12, 6, 6, 4, false, false, false, false], [12, 6, 6, 8, false, false, false, false], [12, 12, 12, 8, false, true, true, true], [12, 6, 6, 4, false, true, true, false], [12, 6, 6, 4, false, false, false, true]]
		}, {
			"configString": "1-a-3-a-2",
			"expectedBlockConfig": [[12, 6, 6, 4, false, false, false, false], [12, 6, 6, 8, false, false, false, false], [12, 12, 12, 12, false, true, true, true], [12, 12, 12, 4, false, true, true, true], [12, 12, 12, 8, false, true, true, false]]
		}, {
			"configString": "2-a-a-2-a",
			"expectedBlockConfig": [[12, 12, 12, 8, false, false, false, false], [12, 6, 6, 4, false, true, true, false], [12, 6, 6, 4, false, false, false, true], [12, 12, 12, 8, false, true, true, false], [12, 12, 12, 12, false, true, true, true]]
		}, {
			"configString": "3-a-a-3-a",
			"expectedBlockConfig": [[12, 12, 12, 12, false, false, false, false], [12, 6, 6, 8, false, true, true, true], [12, 6, 6, 4, false, false, false, false], [12, 12, 12, 12, false, true, true, true], [12, 12, 12, 12, false, true, true, true]]
		}, {
			"configString": "1-a-a-a-a-1",
			"expectedBlockConfig": [[12, 6, 6, 4, false, false, false, false], [12, 6, 6, 4, false, false, false, false], [12, 6, 6, 4, false, true, true, false], [12, 6, 6, 4, false, false, false, true], [12, 6, 6, 4, false, true, true, false], [12, 6, 6, 4, false, false, false, false]]
		}, {
			"configString": "1-a-a-a-a-3",
			"expectedBlockConfig": [[12, 6, 6, 4, false, false, false, false], [12, 6, 6, 4, false, false, false, false], [12, 6, 6, 4, false, true, true, false], [12, 6, 6, 8, false, false, false, true], [12, 12, 12, 4, false, true, true, false], [12, 12, 12, 12, false, true, true, true]]
		}, {
			"configString": "a-a-a-1-a-a",
			"expectedBlockConfig": [[12, 6, 6, 4, false, false, false, false], [12, 6, 6, 4, false, false, false, false], [12, 6, 6, 4, false, true, true, false], [12, 6, 6, 4, false, false, false, true], [12, 6, 6, 4, false, true, true, false], [12, 6, 6, 4, false, false, false, false]]
		}, {
			"configString": "a-a-a-2-a-a",
			"expectedBlockConfig": [[12, 6, 6, 4, false, false, false, false], [12, 6, 6, 4, false, false, false, false], [12, 12, 12, 4, false, true, true, false], [12, 12, 12, 8, false, true, true, true], [12, 6, 6, 4, false, true, true, false], [12, 6, 6, 12, false, false, false, true]]
		}, {
			"configString": "a-a-1-a-a-a",
			"expectedBlockConfig": [[12, 6, 6, 4, false, false, false, false], [12, 6, 6, 4, false, false, false, false], [12, 6, 6, 4, false, true, true, false], [12, 6, 6, 4, false, false, false, true], [12, 6, 6, 4, false, true, true, false], [12, 6, 6, 4, false, false, false, false]]
		}, {
			"configString": "a-a-2-a-a-a",
			"expectedBlockConfig": [[12, 6, 6, 8, false, false, false, false], [12, 6, 6, 4, false, false, false, false], [12, 12, 12, 8, false, true, true, true], [12, 6, 6, 4, false, true, true, false], [12, 6, 6, 8, false, false, false, true], [12, 12, 12, 4, false, true, true, false]]
		}, {
			"configString": "a-a-3-a-a-a",
			"expectedBlockConfig": [[12, 6, 6, 8, false, false, false, false], [12, 6, 6, 4, false, false, false, false], [12, 12, 12, 12, false, true, true, true], [12, 6, 6, 4, false, true, true, true], [12, 6, 6, 4, false, false, false, false], [12, 12, 12, 4, false, true, true, false]]
		}, {
			"configString": "a-1-a-a-1-a",
			"expectedBlockConfig": [[12, 6, 6, 4, false, false, false, false], [12, 6, 6, 4, false, false, false, false], [12, 6, 6, 4, false, true, true, false], [12, 6, 6, 4, false, false, false, true], [12, 6, 6, 4, false, true, true, false], [12, 6, 6, 4, false, false, false, false]]
		}, {
			"configString": "a-2-a-a-2-a",
			"expectedBlockConfig": [[12, 12, 12, 4, false, false, false, false], [12, 12, 12, 8, false, true, true, false], [12, 6, 6, 8, false, true, true, true], [12, 6, 6, 4, false, false, false, false], [12, 12, 12, 8, false, true, true, true], [12, 12, 12, 4, false, true, true, false]]
		}, {
			"configString": "a-3-a-a-3-a",
			"expectedBlockConfig": [[12, 12, 12, 12, false, false, false, false], [12, 12, 12, 12, false, true, true, true], [12, 6, 6, 8, false, true, true, true], [12, 6, 6, 4, false, false, false, false], [12, 12, 12, 12, false, true, true, true], [12, 12, 12, 12, false, true, true, true]]
		}, {
			"configString": "a-1-a-a-a-1",
			"expectedBlockConfig": [[12, 6, 6, 4, false, false, false, false], [12, 6, 6, 4, false, false, false, false], [12, 6, 6, 4, false, true, true, false], [12, 6, 6, 4, false, false, false, true], [12, 6, 6, 4, false, true, true, false], [12, 6, 6, 4, false, false, false, false]]
		}, {
			"configString": "a-2-a-a-a-1",
			"expectedBlockConfig": [[12, 12, 12, 4, false, false, false, false], [12, 12, 12, 8, false, true, true, false], [12, 6, 6, 4, false, true, true, true], [12, 6, 6, 4, false, false, false, false], [12, 6, 6, 4, false, true, true, false], [12, 6, 6, 4, false, false, false, true]]
		}, {
			"configString": "a-1-a-1-a-1",
			"expectedBlockConfig": [[12, 6, 6, 4, false, false, false, false], [12, 6, 6, 4, false, false, false, false], [12, 6, 6, 4, false, true, true, false], [12, 6, 6, 4, false, false, false, true], [12, 6, 6, 4, false, true, true, false], [12, 6, 6, 4, false, false, false, false]]
		}, {
			"configString": "a-2-a-2-a-2",
			"expectedBlockConfig": [[12, 12, 12, 4, false, false, false, false], [12, 12, 12, 8, false, true, true, false], [12, 12, 12, 4, false, true, true, true], [12, 12, 12, 8, false, true, true, false], [12, 12, 12, 4, false, true, true, true], [12, 12, 12, 8, false, true, true, false]]
		}, {
			"configString": "a-3-a-2-a-1",
			"expectedBlockConfig": [[12, 12, 12, 12, false, false, false, false], [12, 12, 12, 12, false, true, true, true], [12, 12, 12, 4, false, true, true, true], [12, 12, 12, 8, false, true, true, false], [12, 6, 6, 8, false, true, true, true], [12, 6, 6, 4, false, false, false, false]]
		}],
		aTitleOnTheLeftConfigAndTwoColumnInL = [{
			"configString": "a-1",
			"expectedBlockConfig": [[12, 6, 12, 8, false, false, false, false], [12, 6, 12, 4, false, false, true, false]]
		}, {
			"configString": "a-2",
			"expectedBlockConfig": [[12, 12, 12, 4, false, false, false, false], [12, 12, 12, 8, false, true, true, false]]
		}, {
			"configString": "a-3",
			"expectedBlockConfig": [[12, 12, 12, 12, false, false, false, false], [12, 12, 12, 12, false, true, true, true]]
		}, {
			"configString": "1-a",
			"expectedBlockConfig": [[12, 6, 12, 4, false, false, false, false], [12, 6, 12, 8, false, false, true, false]]
		}, {
			"configString": "2-a",
			"expectedBlockConfig": [[12, 12, 12, 8, false, false, false, false], [12, 12, 12, 4, false, true, true, false]]
		}, {
			"configString": "3-a",
			"expectedBlockConfig": [[12, 12, 12, 12, false, false, false, false], [12, 12, 12, 12, false, true, true, true]]
		}, {
			"configString": "a-a-1",
			"expectedBlockConfig": [[12, 6, 12, 4, false, false, false, false], [12, 6, 12, 4, false, false, true, false], [12, 6, 12, 4, false, true, true, false]]
		}, {
			"configString": "a-a-2",
			"expectedBlockConfig": [[12, 6, 12, 8, false, false, false, false], [12, 6, 12, 4, false, false, true, false], [12, 12, 12, 8, false, true, true, true]]
		}, {
			"configString": "1-a-1",
			"expectedBlockConfig": [[12, 6, 12, 4, false, false, false, false], [12, 6, 12, 4, false, false, true, false], [12, 6, 12, 4, false, true, true, false]]
		}, {
			"configString": "1-a-2",
			"expectedBlockConfig": [[12, 6, 12, 4, false, false, false, false], [12, 6, 12, 8, false, false, true, false], [12, 12, 12, 8, false, true, true, true]]
		}, {
			"configString": "2-a-a",
			"expectedBlockConfig": [[12, 12, 12, 8, false, false, false, false], [12, 6, 12, 4, false, true, true, false], [12, 6, 12, 12, false, false, true, true]]
		}, {
			"configString": "2-a-1",
			"expectedBlockConfig": [[12, 12, 12, 8, false, false, false, false], [12, 6, 12, 4, false, true, true, false], [12, 6, 12, 4, false, false, true, true]]
		}, {
			"configString": "2-1-a",
			"expectedBlockConfig": [[12, 12, 12, 8, false, false, false, false], [12, 6, 12, 4, false, true, true, false], [12, 6, 12, 12, false, false, true, true]]
		}, {
			"configString": "a-a-a-1",
			"expectedBlockConfig": [[12, 6, 12, 4, false, false, false, false], [12, 6, 12, 4, false, false, true, false], [12, 6, 12, 4, false, true, true, false], [12, 6, 12, 4, false, false, true, true]]
		}, {
			"configString": "a-a-a-2",
			"expectedBlockConfig": [[12, 6, 12, 4, false, false, false, false], [12, 6, 12, 4, false, false, true, false], [12, 12, 12, 4, false, true, true, false], [12, 12, 12, 8, false, true, true, true]]
		}, {
			"configString": "a-1-a-1",
			"expectedBlockConfig": [[12, 6, 12, 4, false, false, false, false], [12, 6, 12, 4, false, false, true, false], [12, 6, 12, 4, false, true, true, false], [12, 6, 12, 4, false, false, true, true]]
		}, {
			"configString": "1-a-1-a",
			"expectedBlockConfig": [[12, 6, 12, 4, false, false, false, false], [12, 6, 12, 4, false, false, true, false], [12, 6, 12, 4, false, true, true, false], [12, 6, 12, 12, false, false, true, true]]
		}, {
			"configString": "1-a-a-1",
			"expectedBlockConfig": [[12, 6, 12, 4, false, false, false, false], [12, 6, 12, 4, false, false, true, false], [12, 6, 12, 4, false, true, true, false], [12, 6, 12, 4, false, false, true, true]]
		}, {
			"configString": "a-2-a-1",
			"expectedBlockConfig": [[12, 12, 12, 4, false, false, false, false], [12, 12, 12, 8, false, true, true, false], [12, 6, 12, 8, false, true, true, true], [12, 6, 12, 4, false, false, true, false]]
		}, {
			"configString": "a-2-a-2",
			"expectedBlockConfig": [[12, 12, 12, 4, false, false, false, false], [12, 12, 12, 8, false, true, true, false], [12, 12, 12, 4, false, true, true, true], [12, 12, 12, 8, false, true, true, false]]
		}, {
			"configString": "2-a-a-2",
			"expectedBlockConfig": [[12, 12, 12, 8, false, false, false, false], [12, 6, 12, 4, false, true, true, false], [12, 6, 12, 4, false, false, true, true], [12, 12, 12, 8, false, true, true, false]]
		}, {
			"configString": "3-a-3-a",
			"expectedBlockConfig": [[12, 12, 12, 12, false, false, false, false], [12, 12, 12, 12, false, true, true, true], [12, 12, 12, 12, false, true, true, true], [12, 12, 12, 12, false, true, true, true]]
		}, {
			"configString": "1-a-a-a-1",
			"expectedBlockConfig": [[12, 6, 12, 4, false, false, false, false], [12, 6, 12, 4, false, false, true, false], [12, 6, 12, 4, false, true, true, false], [12, 6, 12, 8, false, false, true, true], [12, 6, 12, 4, false, true, true, false]]
		}, {
			"configString": "2-a-a-a-2",
			"expectedBlockConfig": [[12, 12, 12, 8, false, false, false, false], [12, 6, 12, 4, false, true, true, false], [12, 6, 12, 8, false, false, true, true], [12, 12, 12, 4, false, true, true, false], [12, 12, 12, 8, false, true, true, true]]
		}, {
			"configString": "3-a-a-a-1",
			"expectedBlockConfig": [[12, 12, 12, 12, false, false, false, false], [12, 6, 12, 4, false, true, true, true], [12, 6, 12, 4, false, false, true, false], [12, 6, 12, 4, false, true, true, false], [12, 6, 12, 4, false, false, true, true]]
		}, {
			"configString": "3-a-a-a-2",
			"expectedBlockConfig": [[12, 12, 12, 12, false, false, false, false], [12, 6, 12, 4, false, true, true, true], [12, 6, 12, 4, false, false, true, false], [12, 12, 12, 4, false, true, true, false], [12, 12, 12, 8, false, true, true, true]]
		}, {
			"configString": "a-a-1-1-a",
			"expectedBlockConfig": [[12, 6, 12, 4, false, false, false, false], [12, 6, 12, 4, false, false, true, false], [12, 6, 12, 4, false, true, true, false], [12, 6, 12, 4, false, false, true, true], [12, 12, 12, 8, false, true, true, false]]
		}, {
			"configString": "a-a-1-a-1",
			"expectedBlockConfig": [[12, 6, 12, 4, false, false, false, false], [12, 6, 12, 4, false, false, true, false], [12, 6, 12, 4, false, true, true, false], [12, 6, 12, 8, false, false, true, true], [12, 6, 12, 4, false, true, true, false]]
		}, {
			"configString": "a-3-a-a-2",
			"expectedBlockConfig": [[12, 12, 12, 12, false, false, false, false], [12, 12, 12, 12, false, true, true, true], [12, 6, 12, 8, false, true, true, true], [12, 6, 12, 4, false, false, true, false], [12, 12, 12, 8, false, true, true, true]]
		}, {
			"configString": "a-2-a-a-1",
			"expectedBlockConfig": [[12, 12, 12, 4, false, false, false, false], [12, 12, 12, 8, false, true, true, false], [12, 6, 12, 4, false, true, true, true], [12, 6, 12, 4, false, false, true, false], [12, 6, 12, 4, false, true, true, false]]
		}, {
			"configString": "a-2-a-a-2",
			"expectedBlockConfig": [[12, 12, 12, 4, false, false, false, false], [12, 12, 12, 8, false, true, true, false], [12, 6, 12, 8, false, true, true, true], [12, 6, 12, 4, false, false, true, false], [12, 12, 12, 8, false, true, true, true]]
		}, {
			"configString": "a-1-a-1-a",
			"expectedBlockConfig": [[12, 6, 12, 4, false, false, false, false], [12, 6, 12, 4, false, false, true, false], [12, 6, 12, 4, false, true, true, false], [12, 6, 12, 4, false, false, true, true], [12, 12, 12, 8, false, true, true, false]]
		}, {
			"configString": "a-1-a-2-a",
			"expectedBlockConfig": [[12, 6, 12, 4, false, false, false, false], [12, 6, 12, 4, false, false, true, false], [12, 12, 12, 4, false, true, true, false], [12, 12, 12, 8, false, true, true, true], [12, 12, 12, 4, false, true, true, false]]
		}, {
			"configString": "a-2-a-1-a",
			"expectedBlockConfig": [[12, 12, 12, 4, false, false, false, false], [12, 12, 12, 8, false, true, true, false], [12, 6, 12, 4, false, true, true, true], [12, 6, 12, 4, false, false, true, false], [12, 12, 12, 4, false, true, true, false]]
		}, {
			"configString": "a-3-a-1-a",
			"expectedBlockConfig": [[12, 12, 12, 12, false, false, false, false], [12, 12, 12, 12, false, true, true, true], [12, 6, 12, 4, false, true, true, true], [12, 6, 12, 4, false, false, true, false], [12, 12, 12, 4, false, true, true, false]]
		}, {
			"configString": "1-a-1-a-1",
			"expectedBlockConfig": [[12, 6, 12, 4, false, false, false, false], [12, 6, 12, 4, false, false, true, false], [12, 6, 12, 4, false, true, true, false], [12, 6, 12, 8, false, false, true, true], [12, 6, 12, 4, false, true, true, false]]
		}, {
			"configString": "1-a-a-1-a",
			"expectedBlockConfig": [[12, 6, 12, 4, false, false, false, false], [12, 6, 12, 4, false, false, true, false], [12, 6, 12, 4, false, true, true, false], [12, 6, 12, 4, false, false, true, true], [12, 12, 12, 8, false, true, true, false]]
		}, {
			"configString": "1-a-2-a-1",
			"expectedBlockConfig": [[12, 6, 12, 4, false, false, false, false], [12, 6, 12, 8, false, false, true, false], [12, 12, 12, 8, false, true, true, true], [12, 6, 12, 4, false, true, true, false], [12, 6, 12, 4, false, false, true, true]]
		}, {
			"configString": "1-a-3-a-2",
			"expectedBlockConfig": [[12, 6, 12, 4, false, false, false, false], [12, 6, 12, 8, false, false, true, false], [12, 12, 12, 12, false, true, true, true], [12, 12, 12, 4, false, true, true, true], [12, 12, 12, 8, false, true, true, false]]
		}, {
			"configString": "2-a-a-2-a",
			"expectedBlockConfig": [[12, 12, 12, 8, false, false, false, false], [12, 6, 12, 4, false, true, true, false], [12, 6, 12, 4, false, false, true, true], [12, 12, 12, 8, false, true, true, false], [12, 12, 12, 12, false, true, true, true]]
		}, {
			"configString": "3-a-a-3-a",
			"expectedBlockConfig": [[12, 12, 12, 12, false, false, false, false], [12, 6, 12, 8, false, true, true, true], [12, 6, 12, 4, false, false, true, false], [12, 12, 12, 12, false, true, true, true], [12, 12, 12, 12, false, true, true, true]]
		}, {
			"configString": "1-a-a-a-a-1",
			"expectedBlockConfig": [[12, 6, 12, 4, false, false, false, false], [12, 6, 12, 4, false, false, true, false], [12, 6, 12, 4, false, true, true, false], [12, 6, 12, 4, false, false, true, true], [12, 6, 12, 4, false, true, true, false], [12, 6, 12, 4, false, false, true, false]]
		}, {
			"configString": "1-a-a-a-a-3",
			"expectedBlockConfig": [[12, 6, 12, 4, false, false, false, false], [12, 6, 12, 4, false, false, true, false], [12, 6, 12, 4, false, true, true, false], [12, 6, 12, 8, false, false, true, true], [12, 12, 12, 4, false, true, true, false], [12, 12, 12, 12, false, true, true, true]]
		}, {
			"configString": "a-a-a-1-a-a",
			"expectedBlockConfig": [[12, 6, 12, 4, false, false, false, false], [12, 6, 12, 4, false, false, true, false], [12, 6, 12, 4, false, true, true, false], [12, 6, 12, 4, false, false, true, true], [12, 6, 12, 4, false, true, true, false], [12, 6, 12, 4, false, false, true, false]]
		}, {
			"configString": "a-a-a-2-a-a",
			"expectedBlockConfig": [[12, 6, 12, 4, false, false, false, false], [12, 6, 12, 4, false, false, true, false], [12, 12, 12, 4, false, true, true, false], [12, 12, 12, 8, false, true, true, true], [12, 6, 12, 4, false, true, true, false], [12, 6, 12, 12, false, false, true, true]]
		}, {
			"configString": "a-a-1-a-a-a",
			"expectedBlockConfig": [[12, 6, 12, 4, false, false, false, false], [12, 6, 12, 4, false, false, true, false], [12, 6, 12, 4, false, true, true, false], [12, 6, 12, 4, false, false, true, true], [12, 6, 12, 4, false, true, true, false], [12, 6, 12, 4, false, false, true, false]]
		}, {
			"configString": "a-a-2-a-a-a",
			"expectedBlockConfig": [[12, 6, 12, 8, false, false, false, false], [12, 6, 12, 4, false, false, true, false], [12, 12, 12, 8, false, true, true, true], [12, 6, 12, 4, false, true, true, false], [12, 6, 12, 8, false, false, true, true], [12, 12, 12, 4, false, true, true, false]]
		}, {
			"configString": "a-a-3-a-a-a",
			"expectedBlockConfig": [[12, 6, 12, 8, false, false, false, false], [12, 6, 12, 4, false, false, true, false], [12, 12, 12, 12, false, true, true, true], [12, 6, 12, 4, false, true, true, true], [12, 6, 12, 4, false, false, true, false], [12, 12, 12, 4, false, true, true, false]]
		}, {
			"configString": "a-1-a-a-1-a",
			"expectedBlockConfig": [[12, 6, 12, 4, false, false, false, false], [12, 6, 12, 4, false, false, true, false], [12, 6, 12, 4, false, true, true, false], [12, 6, 12, 4, false, false, true, true], [12, 6, 12, 4, false, true, true, false], [12, 6, 12, 4, false, false, true, false]]
		}, {
			"configString": "a-2-a-a-2-a",
			"expectedBlockConfig": [[12, 12, 12, 4, false, false, false, false], [12, 12, 12, 8, false, true, true, false], [12, 6, 12, 8, false, true, true, true], [12, 6, 12, 4, false, false, true, false], [12, 12, 12, 8, false, true, true, true], [12, 12, 12, 4, false, true, true, false]]
		}, {
			"configString": "a-3-a-a-3-a",
			"expectedBlockConfig": [[12, 12, 12, 12, false, false, false, false], [12, 12, 12, 12, false, true, true, true], [12, 6, 12, 8, false, true, true, true], [12, 6, 12, 4, false, false, true, false], [12, 12, 12, 12, false, true, true, true], [12, 12, 12, 12, false, true, true, true]]
		}, {
			"configString": "a-1-a-a-a-1",
			"expectedBlockConfig": [[12, 6, 12, 4, false, false, false, false], [12, 6, 12, 4, false, false, true, false], [12, 6, 12, 4, false, true, true, false], [12, 6, 12, 4, false, false, true, true], [12, 6, 12, 4, false, true, true, false], [12, 6, 12, 4, false, false, true, false]]
		}, {
			"configString": "a-2-a-a-a-1",
			"expectedBlockConfig": [[12, 12, 12, 4, false, false, false, false], [12, 12, 12, 8, false, true, true, false], [12, 6, 12, 4, false, true, true, true], [12, 6, 12, 4, false, false, true, false], [12, 6, 12, 4, false, true, true, false], [12, 6, 12, 4, false, false, true, true]]
		}, {
			"configString": "a-1-a-1-a-1",
			"expectedBlockConfig": [[12, 6, 12, 4, false, false, false, false], [12, 6, 12, 4, false, false, true, false], [12, 6, 12, 4, false, true, true, false], [12, 6, 12, 4, false, false, true, true], [12, 6, 12, 4, false, true, true, false], [12, 6, 12, 4, false, false, true, false]]
		}, {
			"configString": "a-2-a-2-a-2",
			"expectedBlockConfig": [[12, 12, 12, 4, false, false, false, false], [12, 12, 12, 8, false, true, true, false], [12, 12, 12, 4, false, true, true, true], [12, 12, 12, 8, false, true, true, false], [12, 12, 12, 4, false, true, true, true], [12, 12, 12, 8, false, true, true, false]]
		}, {
			"configString": "a-3-a-2-a-1",
			"expectedBlockConfig": [[12, 12, 12, 12, false, false, false, false], [12, 12, 12, 12, false, true, true, true], [12, 12, 12, 4, false, true, true, true], [12, 12, 12, 8, false, true, true, false], [12, 6, 12, 8, false, true, true, true], [12, 6, 12, 4, false, false, true, false]]
		}];

	return {
		aStandardModeConfig: aStandardModeConfig,
		aTwoColumnInLConfig: aTwoColumnInLConfig,
		aTitleOnTheLeftConfig: aTitleOnTheLeftConfig,
		aTitleOnTheLeftConfigAndTwoColumnInL: aTitleOnTheLeftConfigAndTwoColumnInL
	}
}());
