/*!
 * ${copyright}
 */

/**
 * Formats the history in ABAP friendly JSON.
 */
sap.ui.define([], function () {
	"use strict";

	function _generateRootLevelKeys(oRun) {
		return {
			loadedLibraries: []
		};
	}

	function _generateLibraryStructure(oTmp, sLibraryName, oRun) {
		oTmp.loadedLibraries.push({
			id: sLibraryName,
			rules: [],
			issueCount: oRun.loadedLibraries[sLibraryName].issueCount,
			allRulesSelected: oRun.loadedLibraries[sLibraryName].allRulesSelected
		});
	}

	function _generateRuleStructure(oTmp, sLibraryName, sRuleId, oRun) {
		var oRule = oRun.loadedLibraries[sLibraryName]["rules"][sRuleId];

		for (var i = 0; i < oTmp.loadedLibraries.length; i++) {
			if (oTmp.loadedLibraries[i].id === sLibraryName) {
				oTmp.loadedLibraries[i].rules.push({
					id: sRuleId,
					library: sLibraryName,
					name: oRule.name,
					selected: oRule.selected,
					issuesCount: oRule.issuesCount,
					issues: oRule.issues,
					resolution: oRule.resolution,
					minVersion: oRule.minVersion,
					categories: oRule.categories,
					audiences: oRule.audiences,
					description: oRule.description
				});
				break;
			}
		}
	}

	function _generateRegistrationIds(oTmp, oRun) {
		var aRegistrationIds = [];

		oRun.applicationInfo.forEach(function(oAppInfo) {
			if (oAppInfo.registrationIds) {
				if (Array.isArray(oAppInfo.registrationIds)) {
					aRegistrationIds = aRegistrationIds.concat(oAppInfo.registrationIds);
				} else if (typeof oAppInfo.registrationIds === "string") {
					aRegistrationIds.push(oAppInfo.registrationIds);
				}
			}
		});

		if (aRegistrationIds.length) {
			oTmp.registrationIds = aRegistrationIds;
		}
	}

	function _format(analysisHistory) {
		var aOutput = [];

		analysisHistory.forEach(function (oRun) {
			var oTmp = _generateRootLevelKeys(oRun);

			for (var sLibraryName in oRun.loadedLibraries) {
				_generateLibraryStructure(oTmp, sLibraryName, oRun);

				for (var sRuleName in oRun.loadedLibraries[sLibraryName].rules) {
					_generateRuleStructure(oTmp, sLibraryName, sRuleName, oRun);
				}
			}

			_generateRegistrationIds(oTmp, oRun);

			aOutput.push(oTmp);
		});

		return aOutput;
	}

	return {
		format: _format
	};
}, true);