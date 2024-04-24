/*!
 * ${copyright}
 */

sap.ui.define([
	"delegates/odata/v4/FieldBaseDelegate",
	'sap/ui/mdc/condition/Condition',
	'sap/ui/core/Element',
	'sap/ui/model/ParseException',
	'sap/ui/mdc/util/loadModules',
	'sap/base/i18n/ResourceBundle'
], function(
	ODataV4FieldBaseDelegate,
	Condition,
	Element,
	ParseException,
	loadModules,
	ResourceBundle
) {
	"use strict";

	const iPasteLimit = 10;

	var FieldBaseDelegate = Object.assign({}, ODataV4FieldBaseDelegate);

	/*
	* With these overrides, we customize our typeahead suggestion matching mechanisms
	*
	* Case sensitivity:
	*
	* Entering "f" in the Books overview language FilterField will show the key-based autocompletion text "FA"
	* Entering "F" in the same field will not show autocompletion
	* Entering "p" or "P" in same field will show the description based autocompletion text "Persian"
	*
	* Accept any suggestions:
	*
	* Entering "erature" in the Books overview Genre field will lead to a suggest of "british literature"
	* This suggest can then be confirmed for the field, even if it does not visually match the input.
	*
	*
	* Note: This code depends on a custom implementation of ValueHelp.delegate#getFirstMatch
	*/

	FieldBaseDelegate.isInputMatchingText = function(oField, sUserInput, sText, bDescription, bCaseSensitive) {

		const oPayload = oField.getPayload();

		if (oPayload && oPayload.hasOwnProperty("acceptAnySuggestions")) { // Always use autocomplete value
			return true;
        }

		if (oPayload && oPayload.hasOwnProperty("autoCompleteCaseSensitive")) { // ignore configuration of ValueHelp (to allow check key and description in a different way)
			if (oPayload.autoCompleteCaseSensitive === "key" && !bDescription) {
				return sText.normalize().startsWith(sUserInput.normalize());
			} else if (oPayload.autoCompleteCaseSensitive === "description" && bDescription) {
				return sText.normalize().startsWith(sUserInput.normalize());
			} else if (oPayload.autoCompleteCaseSensitive === true) {
				return sText.normalize().startsWith(sUserInput.normalize());
			} else {
				return sText.normalize().toLowerCase().startsWith(sUserInput.normalize().toLowerCase());
			}
        }

		return ODataV4FieldBaseDelegate.isInputMatchingText.apply(this, arguments);
	};

	FieldBaseDelegate.getAutocompleteOutput = function(oField, oCondition, sKey, sDescription, bKeyMatch, bDescriptionMatch) {

		const oPayload = oField.getPayload();

		if (oPayload && oPayload.hasOwnProperty("acceptAnySuggestions")) { // Always use autocomplete value
			return true;
        }

		if (oPayload.hasOwnProperty("autoCompleteCaseSensitive")) {
			if (bDescriptionMatch) {
				return sDescription;
			} else if (bKeyMatch) {
				return sKey;
			}
		}

		return ODataV4FieldBaseDelegate.getAutocompleteOutput.apply(this, arguments);

	};

	function _getValueHelp(oField) {
		const sValueHelp = oField.getValueHelp();
		const oValueHelp = Element.getElementById(sValueHelp);
		if (oValueHelp && oValueHelp.isValidationSupported()) {
			return oValueHelp;
		}
	}

	let oWarningBundle;

	function _getWarningPopoverId(oField) {
		return oField.getParent().getId() + '--Warning';
	}

	function _getWarningPopover(oField) {
		return oField.getParent().getDependents().find((oElement) => oElement.getId() === _getWarningPopoverId(oField));
	}

	async function _createWarningPopover(oField) {
		oWarningBundle = await ResourceBundle.create({
			url: 'i18n/i18n.properties',
			async: true
		});
		const [Popover, Bar, Text, HBox, Title, Icon, coreLib] = await loadModules(["sap/m/Popover", "sap/m/Bar", "sap/m/Text", "sap/m/HBox", "sap/m/Title", "sap/ui/core/Icon", "sap/ui/core/library"]);
		const oPopover = new Popover(_getWarningPopoverId(oField), {
			customHeader: new Bar({
				contentMiddle: [
					new HBox({
						items: [
							new Icon({src: "sap-icon://message-warning", color: coreLib.IconColor.Critical})
								.addStyleClass("sapUiTinyMarginEnd"),
							new Title({text: 'NO_TEXT', level: coreLib.TitleLevel.H2})
						],
						renderType: "Bare",
						justifyContent: "Center",
						alignItems: "Center"
					})
				]
			}),
			content: [new Text({text: 'NO_TEXT'})]
		}).addStyleClass("sapUiContentPadding");
		oField.getParent().addDependent(oPopover);
		return oPopover;
	}

	async function _showWarningPopover(oField, sTitle, aText) {
		const [sText, ...aTextArgs] = aText;
		const oWarningPopover = _getWarningPopover(oField) || await _createWarningPopover(oField);
		oWarningPopover.getCustomHeader().getContentMiddle()[0].getItems()[1].setText(oWarningBundle.getText(sTitle));
		oWarningPopover.getContent()[0].setText(oWarningBundle.getText(sText, aTextArgs));
		oWarningPopover.openBy(oField);
	}

	FieldBaseDelegate.parsePasteDataToConditions = function(oField, aParsedData, oSettings) {
		if (oField.getPayload()?.pasteDescription) {

			let iCount = 0;

			const aResults = [];
			return Promise.all(aParsedData.map((oEntry) => {
				// We do not want to accept 'keyless' paste values
				if (!oEntry.value) {
					return false;
				}

				iCount++;

				// We actually validate keys vs our valuehelp
				return iCount <= iPasteLimit && this.getItemForValue(oField, _getValueHelp(oField), {
					value: oEntry.value,
					parsedValue: oEntry.value,
					parsedDescription: oEntry.additionalValue,
					type: oSettings.valueType,
					exactMatch: true,
					checkKey: true,
					exception: ParseException
				}).then((oResult) => {
					const oItemCondition = oResult && Condition.createItemCondition(oResult.key, oResult.description, undefined, undefined, this.createConditionPayload(oField, oField, [oResult.key, oResult.description]));
					if (oItemCondition) {
						aResults.push(oItemCondition);
					}
				});
			})).then(() => {
				if (iCount > iPasteLimit) {
					_showWarningPopover(oField, 'PASTE_LIMIT_TITLE', ['PASTE_LIMIT_TEXT', iPasteLimit]);
				}
				return aResults;
			});
		}
		return ODataV4FieldBaseDelegate.parsePasteDataToConditions.apply(this, arguments);
	};

	return FieldBaseDelegate;
});
