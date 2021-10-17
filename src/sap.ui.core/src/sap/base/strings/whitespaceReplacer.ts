var fnWhitespacesReplacer = function (sInput) {
    var sWhitespace = " ", sUnicodeWhitespaceCharacter = "\u00A0";
    if (typeof sInput !== "string") {
        return sInput;
    }
    return sInput.replaceAll("\t", sWhitespace + sWhitespace).replaceAll((sWhitespace + sWhitespace), (sWhitespace + sUnicodeWhitespaceCharacter));
};