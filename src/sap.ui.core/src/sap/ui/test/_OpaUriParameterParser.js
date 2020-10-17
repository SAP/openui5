/*!
 * ${copyright}
 */

// private
sap.ui.define([
    "sap/ui/base/Object",
    "sap/ui/test/_OpaLogger",
    "sap/ui/thirdparty/URI"
], function(Ui5Object, _OpaLogger, URI) {
    "use strict";

    var _OpaUriParameterParser = Ui5Object.extend("sap.ui.test._OpaUriParameterParser", {});
    var oLogger = _OpaLogger.getLogger("sap.ui.test._OpaUriParameterParser");

    _OpaUriParameterParser.PREFIX = "opa";
    _OpaUriParameterParser.EXCLUDED_PATTERNS = [
        /^opa((?!(Frame)).*)$/,
        /hidepassed/,
        /noglobals/,
        /notrycatch/,
        /coverage/,
        /module/,
        /filter/
    ];

    /** get all URI parameters recognized by OPA
     * @private
     * @returns {object} a mapping of the URI parameters search object such that:
     * - keys are only the ones recognized by OPA
     * - keys are de-capitalized and without 'opa' prefix
     * - values are parsed to correct type
     */
    _OpaUriParameterParser._getOpaParams = function () {
        var mOpaParams = {};
        var mUriParams = new URI().search(true);

        for (var sUriParamName in mUriParams) {
            if (sUriParamName.startsWith(_OpaUriParameterParser.PREFIX)) {
                var sOpaParamName = sUriParamName.substr(_OpaUriParameterParser.PREFIX.length);
                sOpaParamName = sOpaParamName.charAt(0).toLowerCase() + sOpaParamName.substr(1);
                mOpaParams[sOpaParamName] = _OpaUriParameterParser._parseParam(mUriParams[sUriParamName]);
            }
        }

        return mOpaParams;
    };

    /** get all URI parameters except OPA and QUnit parameters
     * these parameters will be sent to the application frame and not handled by OPA
     * therefore they should not be modified/parsed!
     * @private
     * @returns {object} a mapping of the URI search object that only includes non-OPA and non-QUnit parameters
     */
    _OpaUriParameterParser._getAppParams = function () {
        var mAppParams = {};
        var mUriParams = new URI().search(true);

        for (var sUriParamName in mUriParams) {
            if (_OpaUriParameterParser._isExcludedParam(sUriParamName)) {
                oLogger.debug("URI parameter '" + sUriParamName + "' is recognized as OPA parameter and will not be set in application frame!");
            } else {
                mAppParams[sUriParamName] = mUriParams[sUriParamName];
            }
        }

        return mAppParams;
    };

    _OpaUriParameterParser._isExcludedParam = function (sParam) {
        return sParam && _OpaUriParameterParser.EXCLUDED_PATTERNS.some(function(oPattern) {
            return sParam.match(oPattern);
        });
    };

    _OpaUriParameterParser._parseParam = function (sParam) {
        var vParsedParam = sParam;
        ["bool", "integer", "floating"].forEach(function (sType) {
            var mParam = _OpaUriParameterParser._parsers[sType](sParam);
            vParsedParam = mParam.parsed ? mParam.value : vParsedParam;
        });
        return vParsedParam;
    };

    _OpaUriParameterParser._parsers = {
        bool: function (sParam) {
            var mResult = {};
            if (sParam && sParam.match(/^true$/i)) {
                mResult = {parsed: true, value: true};
            }
            if (sParam && sParam.match(/^false$/i)) {
                mResult = {parsed: true, value: false};
            }
            return mResult;
        },
        integer: function (sParam) {
            var iValue = parseInt(sParam);
            return {
                parsed: _OpaUriParameterParser._isNumber(iValue),
                value: iValue
            };
        },
        floating: function (sParam) {
            var iValue = parseFloat(sParam);
            return {
                parsed: _OpaUriParameterParser._isNumber(iValue),
                value: iValue
            };
        }
    };

    _OpaUriParameterParser._isNumber = function (vValue) {
        return typeof vValue === "number" && !isNaN(vValue);
    };

    return _OpaUriParameterParser;
});
