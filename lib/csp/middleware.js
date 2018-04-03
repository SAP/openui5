
var url = require('url');
var querystring = require('querystring');

var HEADER_CONTENT_SECURITY_POLICY = "Content-Security-Policy",
    HEADER_CONTENT_SECURITY_POLICY_REPORT_ONLY = "Content-Security-Policy-Report-Only",
    rPolicy = /([-_a-zA-Z0-9]+)(:report-only)?/i;

module.exports = function (sCspUrlParameterName, oConfig) {
    var allowDynamicPolicySelection = oConfig.allowDynamicPolicySelection || false,
        allowDynamicPolicyDefinition = oConfig.allowDynamicPolicyDefinition || false,
        defaultPolicyIsReportOnly = oConfig.defaultPolicyIsReportOnly || false;

    return function cspMiddleware(req, res, next) {
        var sHeader,
            sHeaderValue,
            sCspUrlParameterValue,
            oParsedUrl,
            oQuery,
            oPolicy,
            mPolicyMatch,
            bReportOnly = defaultPolicyIsReportOnly;

        // If a policy with name 'default' is defined, it will even be send without a present URL parameter.
        if (oConfig.definedPolicies["default"]) {
            oPolicy = {
                name: "default",
                policy: oConfig.definedPolicies["default"]
            };
        }

        // Use random protocol, host and port to establish a valid URL for parsing query parameters
        oParsedUrl = url.parse(req.url);
        oQuery = querystring.parse(oParsedUrl.query);
        sCspUrlParameterValue = oQuery[sCspUrlParameterName];

        if (sCspUrlParameterValue) {
            mPolicyMatch = rPolicy.exec(sCspUrlParameterValue);

            if (mPolicyMatch && mPolicyMatch[1] && oConfig.definedPolicies[mPolicyMatch[1]] && allowDynamicPolicySelection) {
                oPolicy = {
                    name: mPolicyMatch[1],
                    policy: oConfig.definedPolicies[mPolicyMatch[1]]
                };
                bReportOnly = mPolicyMatch[2] !== undefined;
            } else if (allowDynamicPolicyDefinition) {
                // Custom CSP policy directives get passed as part of the CSP URL-Parameter value
                bReportOnly = sCspUrlParameterValue.endsWith(":report-only");
                if (bReportOnly) {
                    sCspUrlParameterValue = sCspUrlParameterValue.substr(0, sCspUrlParameterValue.length - ":report-only".length);
                }
                oPolicy = {
                    name: "dynamic-custom-policy",
                    policy: sCspUrlParameterValue
                };
            }
        }

        if (oPolicy) {
            sHeader = bReportOnly ? HEADER_CONTENT_SECURITY_POLICY_REPORT_ONLY : HEADER_CONTENT_SECURITY_POLICY;
            sHeaderValue = oPolicy.policy;

            // Send response with CSP header
            res.removeHeader(HEADER_CONTENT_SECURITY_POLICY);
            res.removeHeader(HEADER_CONTENT_SECURITY_POLICY_REPORT_ONLY);
            res.setHeader(sHeader, sHeaderValue);
        }

        next();
    };

};