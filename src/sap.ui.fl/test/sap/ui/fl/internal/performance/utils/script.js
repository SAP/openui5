/* eslint-disable */
const fs = require('fs');
const path = require("path");
const lodash = require("lodash");

/*
 * usage: script.js <scenario> [<nuber-of-changes>]
 * call example:
 * node script.js rename 1000 500 100 1
 * in this example the first 1000 changes will have the initialLabel as selector id
 * the following 500 changes initialLabel1 etc.
 */

const aChangeAmounts = [];
const sTestScenario = process.argv[2] || "rename";

for (let i = 3, n = process.argv.length; i < n; i++) {
	aChangeAmounts.push(process.argv[i]);
}
if (!aChangeAmounts.length) {
	aChangeAmounts.push(10);
}

const sInitialChangeFileName = "../flexData/template." + sTestScenario + ".scenario.json";

const sOutputChangesFileName = "../flexData/FakeLrep." + sTestScenario + "." + aChangeAmounts[0] + ".json";

function addNumberToSelector(sId, sSelectorIndex) {
	if (sId === "Layout") {
		return sId;
	}
	const aNameParts = sId.split('.');
	const iRelIndex = aNameParts.length > 1 ? aNameParts.length - 2 : 0;
	aNameParts[iRelIndex] = aNameParts[iRelIndex] + sSelectorIndex;
	return aNameParts.join('.');
}

function copyChangeForSelector(sSelectorIndex, aSourceChanges, iChangeAmount, iLastChangeIndexIdentifier) {
	if (aSourceChanges.length === 0) {
		return [];
	}
	const aInitialChanges = lodash.cloneDeep(aSourceChanges);
	const aNewChanges = [];
	const aCtrlVariantChangesId = [];
	for (let i = iLastChangeIndexIdentifier, n = (iLastChangeIndexIdentifier + iChangeAmount); i < n; i++) {
		const iPlainIndex = i - iLastChangeIndexIdentifier;
		const oNewChangeJson = aInitialChanges[iPlainIndex % aInitialChanges.length];

		const oNewChange = JSON.parse(JSON.stringify(oNewChangeJson));

		if (oNewChange.fileType === "ctrl_variant") {
			if (aCtrlVariantChangesId.indexOf(oNewChange.fileName) === -1) {
				aCtrlVariantChangesId.push(oNewChange.fileName);
				aNewChanges.push(oNewChange);
			}
			continue;
		}

		const aNameParts = oNewChange.fileName.split('_');
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

fs.readFile(path.resolve(__dirname, sInitialChangeFileName), 'utf8', function (err, data) {
	if (err) {
		throw err;
	}
	const oInput = JSON.parse(data);
	let oOutput;

	if (sTestScenario === "variantSwitch") {
		oOutput = {
			variants: [],
			variantDependentControlChanges: []
		}
		const iChangeAmount = parseInt(aChangeAmounts[0]);
		for (let iIndex = 0; iIndex < iChangeAmount; iIndex++) {
			const sSelectorIndex = iIndex === 0 ? "" : iIndex;
			const oCopiedVariant = lodash.cloneDeep(oInput.variants[0]);
			oCopiedVariant.fileName = oCopiedVariant.fileName + sSelectorIndex;
			oCopiedVariant.texts.variantName.value = oCopiedVariant.texts.variantName.value + sSelectorIndex;
			oOutput.variants.push(oCopiedVariant);
			oInput.variantDependentControlChanges.forEach((oChange) => {
				const oCopiedChange = lodash.cloneDeep(oChange);
				oCopiedChange.fileName = oCopiedChange.fileName + sSelectorIndex;
				oCopiedChange.variantReference = oCopiedVariant.fileName;
				if (oCopiedChange.texts.newText) {
					oCopiedChange.texts.newText.value = oCopiedChange.texts.newText.value + oCopiedVariant.texts.variantName.value;
				}
				oOutput.variantDependentControlChanges.push(oCopiedChange);
			});
			oInput.variantChanges.forEach((oChange) => {
				const oCopiedChange = lodash.cloneDeep(oChange);
				oCopiedChange.fileName = oCopiedChange.fileName + sSelectorIndex;
				oCopiedChange.selector.id = oCopiedChange.selector.id + sSelectorIndex;
				oOutput.variantDependentControlChanges.push(oCopiedChange);
			});
		}
	} else {
		oOutput = { ...oInput };
		const iLastChangeIndexIdentifier = 0;
		aChangeAmounts.forEach(function (iChangeAmount, iIndex) {
			iChangeAmount = parseInt(iChangeAmount);
			const sSelectorIndex = iIndex === 0 ? "" : iIndex;
			if (oOutput.changes) {
				const aCopiedChanges = copyChangeForSelector(sSelectorIndex, oOutput.changes, iChangeAmount, iLastChangeIndexIdentifier);
				oOutput.changes = oOutput.changes.concat(aCopiedChanges);
			}
			if (oOutput.variantDependentControlChanges) {
				const aCopiedVariantDependentControlChanges = copyChangeForSelector(sSelectorIndex, oOutput.variantDependentControlChanges || [], iChangeAmount, iLastChangeIndexIdentifier);
				oOutput.variantDependentControlChanges = oOutput.variantDependentControlChanges.concat(aCopiedVariantDependentControlChanges);
			}
			iLastChangeIndexIdentifier += iChangeAmount;
		});
	}


	fs.writeFile(path.resolve(__dirname, sOutputChangesFileName), JSON.stringify(oOutput), function(err, data) {
		if (err) {
			throw new Error(err);
		}
	});
});
