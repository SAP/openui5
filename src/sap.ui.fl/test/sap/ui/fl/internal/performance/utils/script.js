/* eslint-disable */
var fs = require('fs');
var path = require("path");
var lodash = require("lodash");

/*
 * usage: script.js <scenario> [<nuber-of-changes>]
 * call example:
 * node script.js rename 1000 500 100 1
 * in this example the first 1000 changes will have the initialLabel as selector id
 * the following 500 changes initialLabel1 etc.
 */

var aChangeAmounts = [];
var sSelectorId = "initialLabel";
var sTestScenario = process.argv[2] || "rename";

for (var i = 3, n = process.argv.length; i < n; i++) {
	aChangeAmounts.push(process.argv[i]);
}
if (!aChangeAmounts.length) {
	aChangeAmounts.push(10);
}

// var sInitialChangeFileName = "../flexData/template.diverseChanges.json";
var sInitialChangeFileName = "../flexData/template." + sTestScenario + ".scenario.json";

// var sOutputChangesFileName = "../flexData/FakeLrepMassiveChanges.json";
var sOutputChangesFileName = "../flexData/FakeLrep." + sTestScenario + "." + aChangeAmounts[0] + ".json";

function addNumberToSelector(sId, sSelectorIndex) {
	if (sId === "Layout") {
		return sId;
	}
	var aNameParts = sId.split('.');
	var iRelIndex = aNameParts.length > 1 ? aNameParts.length - 2 : 0;
	aNameParts[iRelIndex] = aNameParts[iRelIndex] + sSelectorIndex;
	return aNameParts.join('.');
}

function copyChangeForSelector(sSelectorIndex, aSourceChanges, iChangeAmount, iLastChangeIndexIdentifier) {
	if (aSourceChanges.length === 0) {
		return [];
	}
	var aInitialChanges = lodash.cloneDeep(aSourceChanges);
	var aNewChanges = [];
	var aCtrlVariantChangesId = [];
	for (var i = iLastChangeIndexIdentifier, n = (iLastChangeIndexIdentifier + iChangeAmount); i < n; i++) {
		var iPlainIndex = i - iLastChangeIndexIdentifier;
		var sNewChange = aInitialChanges[iPlainIndex % aInitialChanges.length];

		var oNewChange = JSON.parse(JSON.stringify(sNewChange));

		if (oNewChange.fileType === "ctrl_variant") {
			if (aCtrlVariantChangesId.indexOf(oNewChange.fileName) === -1) {
				aCtrlVariantChangesId.push(oNewChange.fileName);
				aNewChanges.push(oNewChange);
			}
			continue;
		}

		var aNameParts = oNewChange.fileName.split('_');
		aNameParts[1] = parseInt(aNameParts[1]) + i + 1;
		oNewChange.fileName = aNameParts.join('_');

		if (oNewChange.texts.newText) {
			oNewChange.texts.newText.value = oNewChange.texts.newText.value + '-' + (iPlainIndex + 1);
		}
		if (oNewChange.dependentSelector.source) {
			oNewChange.dependentSelector.source.id = addNumberToSelector(oNewChange.dependentSelector.source.id, sSelectorIndex);
			oNewChange.dependentSelector.target.id = addNumberToSelector(oNewChange.dependentSelector.target.id, sSelectorIndex);
			oNewChange.dependentSelector.movedElements.forEach(function(oElement, iIndex, aMovedElements) {
				aMovedElements[iIndex].id = addNumberToSelector(oElement.id, sSelectorIndex);
			});
		}
		if (oNewChange.content.source) {
			oNewChange.content.source.selector.id = addNumberToSelector(oNewChange.content.source.selector.id, sSelectorIndex);
			oNewChange.content.target.selector.id = addNumberToSelector(oNewChange.content.target.selector.id, sSelectorIndex);
			oNewChange.content.movedElements.forEach(function(oElement, iIndex, aMovedElements) {
				aMovedElements[iIndex].selector.id = addNumberToSelector(oElement.selector.id, sSelectorIndex);
			});
		}

		oNewChange.selector.id = addNumberToSelector(oNewChange.selector.id, sSelectorIndex);
		aNewChanges.push(oNewChange);
	}
	return aNewChanges;
}

function copyControlChangesForVariants(sSelectorIndex, oInitialVariantSection, iChangeAmount, iLastChangeIndexIdentifier) {
	if (!oInitialVariantSection) {
		return {};
	}
	var oFinalVariantSection = lodash.cloneDeep(oInitialVariantSection);
	Object.keys(oFinalVariantSection).forEach(function(sVariantManagement) {
		oFinalVariantSection[sVariantManagement].variants.forEach(function(oVariant) {
			oVariant.controlChanges = copyChangeForSelector(sSelectorIndex, oVariant.controlChanges, iChangeAmount, iLastChangeIndexIdentifier);
		});
	});
	return oFinalVariantSection;
}

fs.readFile(path.resolve(__dirname, sInitialChangeFileName), 'utf8', function (err, data) {
	if (err) {
		throw err;
	}
	var oInput = JSON.parse(data);
	var iLastChangeIndexIdentifier = 0;

	aChangeAmounts.forEach(function (iChangeAmount, iIndex) {
		iChangeAmount = parseInt(iChangeAmount);
		var sSelectorIndex = iIndex === 0 ? "" : iIndex;
		var aCopiedChanges = copyChangeForSelector(sSelectorIndex, oInput.changes, iChangeAmount, iLastChangeIndexIdentifier);
		oInput.changes = oInput.changes.concat(aCopiedChanges);
		oInput.variantSection = copyControlChangesForVariants(sSelectorIndex, oInput.variantSection, iChangeAmount, iLastChangeIndexIdentifier);
		iLastChangeIndexIdentifier += iChangeAmount;
	});

	fs.writeFile(path.resolve(__dirname, sOutputChangesFileName), JSON.stringify(oInput), function(err, data) {
		if (err) {
			throw new Error(err);
		}
	});
});
