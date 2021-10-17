import XHRInterceptor from "sap/ui/performance/XHRInterceptor";
import URI from "sap/ui/thirdparty/URI";
export class Passport {
    static header(trcLvl: any, RootID: any, TransID: any, component: any, action: any) {
        var SAPEPPTemplateLow = [
            42,
            84,
            72,
            42,
            3,
            0,
            230,
            0,
            0,
            83,
            65,
            80,
            95,
            69,
            50,
            69,
            95,
            84,
            65,
            95,
            80,
            108,
            117,
            103,
            73,
            110,
            32,
            32,
            32,
            32,
            32,
            32,
            32,
            32,
            32,
            32,
            32,
            32,
            32,
            32,
            32,
            0,
            0,
            83,
            65,
            80,
            95,
            69,
            50,
            69,
            95,
            84,
            65,
            95,
            85,
            115,
            101,
            114,
            32,
            32,
            32,
            32,
            32,
            32,
            32,
            32,
            32,
            32,
            32,
            32,
            32,
            32,
            32,
            32,
            32,
            83,
            65,
            80,
            95,
            69,
            50,
            69,
            95,
            84,
            65,
            95,
            82,
            101,
            113,
            117,
            101,
            115,
            116,
            32,
            32,
            32,
            32,
            32,
            32,
            32,
            32,
            32,
            32,
            32,
            32,
            32,
            32,
            32,
            32,
            32,
            32,
            32,
            32,
            32,
            32,
            0,
            5,
            83,
            65,
            80,
            95,
            69,
            50,
            69,
            95,
            84,
            65,
            95,
            80,
            108,
            117,
            103,
            73,
            110,
            32,
            32,
            32,
            32,
            32,
            32,
            32,
            32,
            32,
            32,
            32,
            32,
            32,
            32,
            32,
            52,
            54,
            51,
            53,
            48,
            48,
            48,
            48,
            48,
            48,
            51,
            49,
            49,
            69,
            69,
            48,
            65,
            53,
            68,
            50,
            53,
            48,
            57,
            57,
            57,
            67,
            51,
            57,
            50,
            66,
            54,
            56,
            32,
            32,
            32,
            0,
            7,
            70,
            53,
            0,
            0,
            0,
            49,
            30,
            224,
            165,
            210,
            78,
            219,
            178,
            228,
            75,
            104,
            0,
            0,
            0,
            0,
            0,
            0,
            0,
            0,
            0,
            0,
            0,
            0,
            0,
            0,
            0,
            0,
            0,
            0,
            0,
            0,
            0,
            0,
            0,
            226,
            42,
            84,
            72,
            42
        ];
        var RootIDPosLen = [
            372,
            32
        ];
        var TransIDPosLen = [
            149,
            32
        ];
        var CompNamePosLEn = [
            9,
            32
        ];
        var PreCompNamePosLEn = [
            117,
            32
        ];
        var actionOffset = [
            75,
            40
        ];
        var traceFlgsOffset = [
            7,
            2
        ];
        var prefix = getBytesFromString("SAP_E2E_TA_UI5LIB");
        prefix = prefix.concat(getBytesFromString(new Array(32 + 1 - prefix.length).join(" ")));
        if (component) {
            component = getBytesFromString(component.substr(-32, 32));
            component = component.concat(getBytesFromString(new Array(32 + 1 - component.length).join(" ")));
            SAPEPPTemplateLow.splice.apply(SAPEPPTemplateLow, CompNamePosLEn.concat(component));
            SAPEPPTemplateLow.splice.apply(SAPEPPTemplateLow, PreCompNamePosLEn.concat(component));
        }
        else {
            SAPEPPTemplateLow.splice.apply(SAPEPPTemplateLow, CompNamePosLEn.concat(prefix));
            SAPEPPTemplateLow.splice.apply(SAPEPPTemplateLow, PreCompNamePosLEn.concat(prefix));
        }
        SAPEPPTemplateLow.splice.apply(SAPEPPTemplateLow, TransIDPosLen.concat(getBytesFromString(TransID)));
        SAPEPPTemplateLow.splice.apply(SAPEPPTemplateLow, traceFlgsOffset.concat(trcLvl));
        if (action) {
            action = getBytesFromString(action.substr(-40, 40));
            action = action.concat(getBytesFromString(new Array(40 + 1 - action.length).join(" ")));
            SAPEPPTemplateLow.splice.apply(SAPEPPTemplateLow, actionOffset.concat(action));
        }
        var retVal = createHexString(SAPEPPTemplateLow).toUpperCase();
        return retVal.substring(0, RootIDPosLen[0]).concat(RootID) + retVal.substring(RootIDPosLen[0] + RootIDPosLen[1]);
    }
    static traceFlags(lvl: any) {
        switch (lvl) {
            case "low":
                iE2eTraceLevel = [0, 0];
                break;
            case "medium":
                iE2eTraceLevel = [137, 10];
                break;
            case "high":
                iE2eTraceLevel = [159, 13];
                break;
            default: if (!iE2eTraceLevel) {
                iE2eTraceLevel = [];
                iE2eTraceLevel.push((parseInt(lvl, 16) & 65280) / 256);
                iE2eTraceLevel.push((parseInt(lvl, 16) & 255));
            }
        }
        return iE2eTraceLevel;
    }
    static createGUID(...args: any) {
        var S4 = function () {
            var temp = Math.floor(Math.random() * 65536);
            return (new Array(4 + 1 - temp.toString(16).length)).join("0") + temp.toString(16);
        };
        var S5 = function () {
            var temp = (Math.floor(Math.random() * 65536) & 4095) + 16384;
            return (new Array(4 + 1 - temp.toString(16).length)).join("0") + temp.toString(16);
        };
        var S6 = function () {
            var temp = (Math.floor(Math.random() * 65536) & 16383) + 32768;
            return (new Array(4 + 1 - temp.toString(16).length)).join("0") + temp.toString(16);
        };
        var retVal = (S4() + S4() + S4() + S5() + S6() + S4() + S4() + S4());
        return retVal.toUpperCase();
    }
    static getRootId(...args: any) {
        return ROOT_ID;
    }
    static getTransactionId(...args: any) {
        return sTransactionId;
    }
    static setActive(bActive: any) {
        if (bActive) {
            XHRInterceptor.register("PASSPORT_ID", "open", function () {
                if (!isCORSRequest(arguments[1])) {
                    sTransactionId = Passport.createGUID();
                }
            });
            XHRInterceptor.register("PASSPORT_HEADER", "open", function () {
                if (!isCORSRequest(arguments[1])) {
                    this.setRequestHeader("SAP-PASSPORT", Passport.header(iE2eTraceLevel, ROOT_ID, sTransactionId));
                }
            });
        }
    }
}
var iE2eTraceLevel;
var sTransactionId;
var ROOT_ID;
var HOST = window.location.host;
function getBytesFromString(s) {
    var bytes = [];
    for (var i = 0; i < s.length; ++i) {
        bytes.push(s.charCodeAt(i));
    }
    return bytes;
}
function createHexString(arr) {
    var result = "";
    for (var i = 0; i < arr.length; i++) {
        var str = arr[i].toString(16);
        str = Array(2 - str.length + 1).join("0") + str;
        result += str;
    }
    return result;
}
function isCORSRequest(sUrl) {
    var sHost = new URI(sUrl).host();
    return sHost && sHost !== HOST;
}
Passport.traceFlags();
ROOT_ID = Passport.createGUID();