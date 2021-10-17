import jQuery from "jquery.sap.global";
import capitalize from "sap/base/strings/capitalize";
import camelize from "sap/base/strings/camelize";
import hyphenate from "sap/base/strings/hyphenate";
import escapeRegExp from "sap/base/strings/escapeRegExp";
import formatMessage from "sap/base/strings/formatMessage";
jQuery.sap.endsWith = function (sString, sEndString) {
    if (typeof (sEndString) != "string" || sEndString == "") {
        return false;
    }
    return sString.endsWith(sEndString);
};
jQuery.sap.endsWithIgnoreCase = function (sString, sEndString) {
    if (typeof (sEndString) != "string" || sEndString == "") {
        return false;
    }
    sString = sString.toUpperCase();
    sEndString = sEndString.toUpperCase();
    return sString.endsWith(sEndString);
};
jQuery.sap.startsWith = function (sString, sStartString) {
    if (typeof (sStartString) != "string" || sStartString == "") {
        return false;
    }
    return sString.startsWith(sStartString);
};
jQuery.sap.startsWithIgnoreCase = function (sString, sStartString) {
    if (typeof (sStartString) != "string" || sStartString == "") {
        return false;
    }
    sString = sString.toUpperCase();
    sStartString = sStartString.toUpperCase();
    return sString.startsWith(sStartString);
};
jQuery.sap.charToUpperCase = function (sString, iPos) {
    if (!sString) {
        return sString;
    }
    if (!iPos || isNaN(iPos) || iPos <= 0 || iPos >= sString.length) {
        return capitalize(sString);
    }
    var sChar = sString.charAt(iPos).toUpperCase();
    if (iPos > 0) {
        return sString.substring(0, iPos) + sChar + sString.substring(iPos + 1);
    }
    return sChar + sString.substring(iPos + 1);
};
jQuery.sap.padLeft = function (sString, sPadChar, iLength) {
    jQuery.sap.assert(typeof sPadChar === "string" && sPadChar, "padLeft: sPadChar must be a non-empty string");
    if (!sString) {
        sString = "";
    }
    if (sPadChar && sPadChar.length === 1) {
        return sString.padStart(iLength, sPadChar);
    }
    while (sString.length < iLength) {
        sString = sPadChar + sString;
    }
    return sString;
};
jQuery.sap.padRight = function (sString, sPadChar, iLength) {
    jQuery.sap.assert(typeof sPadChar === "string" && sPadChar, "padRight: sPadChar must be a non-empty string");
    if (!sString) {
        sString = "";
    }
    if (sPadChar && sPadChar.length === 1) {
        return sString.padEnd(iLength, sPadChar);
    }
    while (sString.length < iLength) {
        sString = sString + sPadChar;
    }
    return sString;
};
jQuery.sap.camelCase = camelize;
jQuery.sap.hyphen = hyphenate;
jQuery.sap.escapeRegExp = escapeRegExp;
jQuery.sap.formatMessage = formatMessage;