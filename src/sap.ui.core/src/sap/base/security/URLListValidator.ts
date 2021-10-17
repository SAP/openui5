export class oURLListValidator {
    private static _createEntry(protocol: any, host: any, port: any, path: any) {
        return new URLListValidatorEntry(protocol, host, port, path);
    }
    static clear(...args: any) {
        aAllowedEntries = [];
    }
    static add(protocol: any, host: any, port: any, path: any) {
        var oEntry = this._createEntry(protocol, host, port, path);
        aAllowedEntries.push(oEntry);
    }
    private static _delete(oEntry: any) {
        aAllowedEntries.splice(aAllowedEntries.indexOf(oEntry), 1);
    }
    static entries(...args: any) {
        return aAllowedEntries.slice();
    }
    static validate(sUrl: any) {
        var result = rBasicUrl.exec(sUrl);
        if (!result) {
            return false;
        }
        var sProtocol = result[1], sBody = result[2], sHost = result[3], sPort = result[4], sPath = result[5], sQuery = result[6], sHash = result[7];
        if (sProtocol) {
            sProtocol = sProtocol.toUpperCase();
            if (aAllowedEntries.length <= 0) {
                if (!/^(https?|ftp)/i.test(sProtocol)) {
                    return false;
                }
            }
        }
        if (sHost) {
            if (rCheckIPv4.test(sHost)) {
                if (!rCheckValidIPv4.test(sHost)) {
                    return false;
                }
            }
            else if (rCheckIPv6.test(sHost)) {
                if (!rCheckValidIPv6.test(sHost)) {
                    return false;
                }
            }
            else if (!rCheckHostName.test(sHost)) {
                return false;
            }
            sHost = sHost.toUpperCase();
        }
        if (sPath) {
            if (sProtocol === "MAILTO") {
                var aAddresses = sBody.split(",");
                for (var i = 0; i < aAddresses.length; i++) {
                    if (!rCheckMail.test(aAddresses[i])) {
                        return false;
                    }
                }
            }
            else {
                var aComponents = sPath.split("/");
                for (var i = 0; i < aComponents.length; i++) {
                    if (!rCheckPath.test(aComponents[i])) {
                        return false;
                    }
                }
            }
        }
        if (sQuery) {
            if (!rCheckQuery.test(sQuery)) {
                return false;
            }
        }
        if (sHash) {
            if (!rCheckFragment.test(sHash)) {
                return false;
            }
        }
        if (aAllowedEntries.length > 0) {
            var bFound = false;
            for (var i = 0; i < aAllowedEntries.length; i++) {
                if (!sProtocol || !aAllowedEntries[i].protocol || sProtocol == aAllowedEntries[i].protocol) {
                    var bOk = false;
                    if (sHost && aAllowedEntries[i].host && /^\*/.test(aAllowedEntries[i].host)) {
                        if (!aAllowedEntries[i]._hostRegexp) {
                            var sHostEscaped = aAllowedEntries[i].host.slice(1).replace(/[-[\]{}()*+?.,\\^$|#\s]/g, "\\$&");
                            aAllowedEntries[i]._hostRegexp = RegExp(sHostEscaped + "$");
                        }
                        var rFilter = aAllowedEntries[i]._hostRegexp;
                        if (rFilter.test(sHost)) {
                            bOk = true;
                        }
                    }
                    else if (!sHost || !aAllowedEntries[i].host || sHost == aAllowedEntries[i].host) {
                        bOk = true;
                    }
                    if (bOk) {
                        if ((!sHost && !sPort) || !aAllowedEntries[i].port || sPort == aAllowedEntries[i].port) {
                            if (aAllowedEntries[i].path && /\*$/.test(aAllowedEntries[i].path)) {
                                if (!aAllowedEntries[i]._pathRegexp) {
                                    var sPathEscaped = aAllowedEntries[i].path.slice(0, -1).replace(/[-[\]{}()*+?.,\\^$|#\s]/g, "\\$&");
                                    aAllowedEntries[i]._pathRegexp = RegExp("^" + sPathEscaped);
                                }
                                var rFilter = aAllowedEntries[i]._pathRegexp;
                                if (rFilter.test(sPath)) {
                                    bFound = true;
                                }
                            }
                            else if (!aAllowedEntries[i].path || sPath == aAllowedEntries[i].path) {
                                bFound = true;
                            }
                        }
                    }
                }
                if (bFound) {
                    break;
                }
            }
            if (!bFound) {
                return false;
            }
        }
        return true;
    }
}
var rBasicUrl = /^(?:([^:\/?#]+):)?((?:\/\/((?:\[[^\]]+\]|[^\/?#:]+))(?::([0-9]+))?)?([^?#]*))(?:\?([^#]*))?(?:#(.*))?$/;
var rCheckPath = /^([a-z0-9-._~!$&'()*+,;=:@]|%[0-9a-f]{2})*$/i;
var rCheckQuery = /^([a-z0-9-._~!$&'()*+,;=:@\/?]|%[0-9a-f]{2})*$/i;
var rCheckFragment = rCheckQuery;
var rCheckMail = /^([a-z0-9!$'*+:^_`{|}~-]|%[0-9a-f]{2})+(?:\.([a-z0-9!$'*+:^_`{|}~-]|%[0-9a-f]{2})+)*@(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?$/i;
var rCheckIPv4 = /^([0-9]{1,3}\.){3}[0-9]{1,3}$/;
var rCheckValidIPv4 = /^(([0-9]|[1-9][0-9]|1[0-9][0-9]|2[0-4][0-9]|25[0-5])\.){3}([0-9]|[1-9][0-9]|1[0-9][0-9]|2[0-4][0-9]|25[0-5])$/;
var rCheckIPv6 = /^\[[^\]]+\]$/;
var rCheckValidIPv6 = /^\[(((([0-9a-f]{1,4}:){6}|(::([0-9a-f]{1,4}:){5})|(([0-9a-f]{1,4})?::([0-9a-f]{1,4}:){4})|((([0-9a-f]{1,4}:){0,1}[0-9a-f]{1,4})?::([0-9a-f]{1,4}:){3})|((([0-9a-f]{1,4}:){0,2}[0-9a-f]{1,4})?::([0-9a-f]{1,4}:){2})|((([0-9a-f]{1,4}:){0,3}[0-9a-f]{1,4})?::[0-9a-f]{1,4}:)|((([0-9a-f]{1,4}:){0,4}[0-9a-f]{1,4})?::))(([0-9a-f]{1,4}:[0-9a-f]{1,4})|(([0-9]|[1-9][0-9]|1[0-9][0-9]|2[0-4][0-9]|25[0-5])\.){3}([0-9]|[1-9][0-9]|1[0-9][0-9]|2[0-4][0-9]|25[0-5])))|((([0-9a-f]{1,4}:){0,5}[0-9a-f]{1,4})?::[0-9a-f]{1,4})|((([0-9a-f]{1,4}:){0,6}[0-9a-f]{1,4})?::))\]$/i;
var rCheckHostName = /^([a-z0-9]([a-z0-9\-]*[a-z0-9])?\.)*[a-z0-9]([a-z0-9\-]*[a-z0-9])?$/i;
function URLListValidatorEntry(protocol, host, port, path) {
    Object.defineProperties(this, {
        protocol: {
            value: protocol && protocol.toUpperCase(),
            enumerable: true
        },
        host: {
            value: host && host.toUpperCase(),
            enumerable: true
        },
        port: {
            value: port,
            enumerable: true
        },
        path: {
            value: path,
            enumerable: true
        }
    });
}
var aAllowedEntries = [];