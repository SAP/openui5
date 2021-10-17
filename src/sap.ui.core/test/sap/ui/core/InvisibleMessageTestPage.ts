import InvisibleMessage from "sap/ui/core/InvisibleMessage";
import TextArea from "sap/m/TextArea";
import MultiInput from "sap/m/MultiInput";
import Token from "sap/m/Token";
import SearchField from "sap/m/SearchField";
import SuggestionItem from "sap/m/SuggestionItem";
import Page from "sap/m/Page";
import App from "sap/m/App";
import JSONModel from "sap/ui/model/json/JSONModel";
import Filter from "sap/ui/model/Filter";
import HTML from "sap/ui/core/HTML";
var InvisibleMessageMode = sap.ui.core.InvisibleMessageMode;
var oTextArea = new TextArea({
    showExceededText: true,
    value: "This is text",
    width: "100%",
    maxLength: 40,
    height: "100px"
});
oTextArea.attachLiveChange(function (oEvent) {
    var oTextAreaSource = oEvent.getSource(), iValueLength = oTextAreaSource.getValue().length, iMaxLength = oTextAreaSource.getMaxLength(), iCharactersLeft = iMaxLength - iValueLength, oInvisibleMessage = InvisibleMessage.getInstance();
    if (iCharactersLeft === 0) {
        oInvisibleMessage.announce("There are no more remaining characters in the TextArea", InvisibleMessageMode.Polite);
    }
});
var fnGetData = function (iCount) {
    var aData = [];
    for (var i = 0; i < iCount; i++) {
        aData[i] = {
            name: "tag" + i
        };
    }
    return aData;
};
var aData = fnGetData(10), oModel = new JSONModel(aData), oMultiInput = new MultiInput({
    tokens: {
        path: "data>/",
        template: new Token({
            text: "{data>name}",
            key: "{data>name}"
        })
    }
}).setModel(oModel, "data");
oMultiInput.attachTokenUpdate(function (oEvent) {
    var oTokenRemoved = oEvent.getParameter("removedTokens")[0].getText();
    InvisibleMessage.getInstance().announce("Token with name " + oTokenRemoved + " has been deleted", InvisibleMessageMode.Assertive);
});
var aNames = [
    { firstName: "Peter", lastName: "Mueller" },
    { firstName: "Petra", lastName: "Maier" },
    { firstName: "Thomas", lastName: "Smith" },
    { firstName: "John", lastName: "Williams" },
    { firstName: "Maria", lastName: "Jones" }
], oModel = new JSONModel(aNames), oSearchField = new SearchField({
    enableSuggestions: true,
    suggestionItems: {
        path: "data>/",
        template: new SuggestionItem({
            text: "{data>firstName}",
            key: "{data>/lastName}"
        })
    },
    suggest: onSuggest
}).setModel(oModel, "data");
function onSuggest(event) {
    var sValue = event.getParameter("suggestValue"), aFilters = [];
    if (sValue) {
        aFilters = [
            new Filter([
                new Filter("firstName", function (sText) {
                    return (sText || "").toUpperCase().indexOf(sValue.toUpperCase()) > -1;
                }),
                new Filter("lastName", function (sDes) {
                    return (sDes || "").toUpperCase().indexOf(sValue.toUpperCase()) > -1;
                })
            ], false)
        ];
    }
    var oItems = oSearchField.getBinding("suggestionItems").filter(aFilters);
    InvisibleMessage.getInstance().announce("There are " + oItems.iLength + " items found with your search", InvisibleMessageMode.Assertive);
    oSearchField.suggest();
}
new App().addPage(new Page({
    title: "InvisibleMessage Test Page",
    content: [
        new HTML({ content: "<h4>TextArea -  available characters are read out on input</h4>" }),
        oTextArea,
        new HTML({ content: "<h4>MultiInput - information about the deleted token is read out</h4>" }),
        oMultiInput,
        new HTML({ content: "<h4>SearchField - filtered items count is read out</h4>" }),
        oSearchField
    ]
}).addStyleClass("sapUiContentPadding")).placeAt("content");