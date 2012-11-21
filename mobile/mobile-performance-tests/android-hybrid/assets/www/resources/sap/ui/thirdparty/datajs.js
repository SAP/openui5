/*! 
 * Copyright (c) Microsoft.  All rights reserved.
 * Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation
 * files (the "Software"), to deal  in the Software without restriction, including without limitation the rights  to use, copy,
 * modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the
 * Software is furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR  IMPLIED, INCLUDING BUT NOT LIMITED TO THE
 * WARRANTIES OF MERCHANTABILITY,  FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR
 * COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE,
 * ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
 *
 * datajs.js
 */

(function (window, undefined) {
    if (!window.datajs) {
        window.datajs = {};
    }

    if (!window.OData) {
        window.OData = {};
    }

    var datajs = window.datajs;
    var odata = window.OData;
    

    // Provides an enumeration of possible kinds of payloads.
    var PAYLOADTYPE_BATCH = "b";
    var PAYLOADTYPE_COMPLEXTYPE = "c";
    var PAYLOADTYPE_ENTRY = "entry";        // This is used when building the payload.
    var PAYLOADTYPE_FEEDORLINKS = "f";
    var PAYLOADTYPE_PRIMITIVETYPE = "p";
    var PAYLOADTYPE_SVCDOC = "s";
    var PAYLOADTYPE_UNKNOWN = "u";
    var PAYLOADTYPE_NONE = "n";

    // Provides an enumeration of possible kinds of properties.
    var PROPERTYKIND_COMPLEX = "c";
    var PROPERTYKIND_DEFERRED = "d";
    var PROPERTYKIND_INLINE = "i";
    var PROPERTYKIND_PRIMITIVE = "p";
    var PROPERTYKIND_NONE = "n";

    var assigned = function (value) {
        /// <summary>Checks whether the specified value is different from null and undefined.</summary>
        /// <param name="value" mayBeNull="true" optional="true">Value to check.</param>
        /// <returns type="Boolean">true if the value is assigned; false otherwise.</returns>
        return value !== null && value !== undefined;
    };

    var contains = function (arr, item) {
        /// <summary>Checks whether the specified item is in the array.</summary>
        /// <param name="arr" type="Array" optional="false" mayBeNull="false">Array to check in.</param>
        /// <param name="item">Item to look for.</param>
        /// <returns type="Boolean">true if the item is contained, false otherwise.</returns>

        var i, len;
        for (i = 0, len = arr.length; i < len; i++) {
            if (arr[i] === item) {
                return true;
            }
        }

        return false;
    };

    var defined = function (a, b) {
        /// <summary>Given two values, picks the first one that is not undefined.</summary>
        /// <param name="a">First value.</param>
        /// <param name="b">Second value.</param>
        /// <returns>a if it's a defined value; else b.</returns>
        return (a !== undefined) ? a : b;
    };

    var delay = function (callback) {
        /// <summary>Delays the invocation of the specified function until execution unwinds.</summary>
        /// <param name="callback" type="Function">Callback function.</param>
        if (arguments.length === 1) {
            window.setTimeout(callback, 0);
            return;
        }

        var args = Array.prototype.slice.call(arguments, 1);
        window.setTimeout(function () {
            callback.apply(this, args);
        }, 0);
    };


    var forEachSchema = function (metadata, callback) {
        /// <summary>Invokes a function once per schema in metadata.</summary>
        /// <param name="metadata">Metadata store; one of edmx, schema, or an array of any of them.</param>
        /// <param name="callback" type="Function">Callback function to invoke once per schema.</param>
        /// <returns>
        /// The first truthy value to be returned from the callback; null or the last falsy value otherwise.
        /// </returns>

        if (!metadata) {
            return null;
        }

        if (isArray(metadata)) {
            var i, len, result;
            for (i = 0, len = metadata.length; i < len; i++) {
                result = forEachSchema(metadata[i], callback);
                if (result) {
                    return result;
                }
            }

            return null;
        } else {
            if (metadata.dataServices) {
                return forEachSchema(metadata.dataServices.schema, callback);
            }

            return callback(metadata);
        }
    };

    var isDateTimeOffset = function (value) {
        /// <summary>Checks whether a Date object is DateTimeOffset value</summary>
        /// <param name="value" type="Date" mayBeNull="false">Value to check.</param>
        /// <returns type="Boolean">true if the value is a DateTimeOffset, false otherwise.</returns>
        return (value.__edmType === "Edm.DateTimeOffset" || (!value.__edmType && value.__offset));
    };

    var formatMilliseconds = function (ms, ns) {
        /// <summary>Formats a millisecond and a nanosecond value into a single string.</summary>
        /// <param name="ms" type="Number" mayBeNull="false">Number of milliseconds to format.</param>
        /// <param name="ns" type="Number" mayBeNull="false">Number of nanoseconds to format.</param>
        /// <returns type="String">Formatted text.</returns>
        /// <remarks>If the value is already as string it's returned as-is.</remarks>

        // Avoid generating milliseconds if not necessary.
        if (ms === 0) {
            ms = "";
        } else {
            ms = "." + formatNumberWidth(ms.toString(), 3);
        }
        if (ns > 0) {
            if (ms === "") {
                ms = ".000";
            }
            ms += formatNumberWidth(ns.toString(), 4);
        }
        return ms;
    };
    
    // ##### BEGIN: MODIFIED BY SAP
    var formatDateTimeOffsetJSON = function (value) {
    	return "\/Date("+value.getTime()+")\/";
    };
    // ##### END: MODIFIED BY SAP

    var formatDateTimeOffset = function (value) {
        /// <summary>Formats a DateTime or DateTimeOffset value a string.</summary>
        /// <param name="value" type="Date" mayBeNull="false">Value to format.</param>
        /// <returns type="String">Formatted text.</returns>
        /// <remarks>If the value is already as string it's returned as-is.</remarks>

        if (typeof value === "string") {
            return value;
        }

        var hasOffset = isDateTimeOffset(value);
        var offset = getCanonicalTimezone(value.__offset);
        if (hasOffset && offset !== "Z") {
            // We're about to change the value, so make a copy.
            value = new Date(value.valueOf());

            var timezone = parseTimezone(offset);
            var hours = value.getUTCHours() + (timezone.d * timezone.h);
            var minutes = value.getMinutes() + (timezone.d * timezone.m);

            value.setUTCHours(hours, minutes);
        } else if (!hasOffset) {
            // Don't suffix a 'Z' for Edm.DateTime values.
            offset = "";
        }

        var year = value.getUTCFullYear();
        var month = value.getUTCMonth() + 1;
        var sign = "";
        if (year <= 0) {
            year = -(year - 1);
            sign = "-";
        }

        var ms = formatMilliseconds(value.getUTCMilliseconds(), value.__ns);

        return sign +
            formatNumberWidth(year, 4) + "-" +
            formatNumberWidth(month, 2) + "-" +
            formatNumberWidth(value.getUTCDate(), 2) + "T" +
            formatNumberWidth(value.getUTCHours(), 2) + ":" +
            formatNumberWidth(value.getUTCMinutes(), 2) + ":" +
            formatNumberWidth(value.getUTCSeconds(), 2) +
            ms + offset;
    };

    var formatDuration = function (value) {
        /// <summary>Converts a duration to a string in xsd:duration format.</summary>
        /// <param name="value" type="Object">Object with ms and __edmType properties.</param>
        /// <returns type="String">String representation of the time object in xsd:duration format.</returns>

        var ms = value.ms;

        var sign = "";
        if (ms < 0) {
            sign = "-";
            ms = -ms;
        }

        var days = Math.floor(ms / 86400000);
        ms -= 86400000 * days;
        var hours = Math.floor(ms / 3600000);
        ms -= 3600000 * hours;
        var minutes = Math.floor(ms / 60000);
        ms -= 60000 * minutes;
        var seconds = Math.floor(ms / 1000);
        ms -= seconds * 1000;

        return sign + "P" +
               formatNumberWidth(days, 2) + "DT" +
               formatNumberWidth(hours, 2) + "H" +
               formatNumberWidth(minutes, 2) + "M" +
               formatNumberWidth(seconds, 2) +
               formatMilliseconds(ms, value.ns) + "S";
    };

    var formatNumberWidth = function (value, width, append) {
        /// <summary>Formats the specified value to the given width.</summary>
        /// <param name="value" type="Number">Number to format (non-negative).</param>
        /// <param name="width" type="Number">Minimum width for number.</param>
        /// <param name="append" type="Boolean">Flag indicating if the value is padded at the beginning (false) or at the end (true).</param>
        /// <returns type="String">Text representation.</returns>
        var result = value.toString(10);
        while (result.length < width) {
            if (append) {
                result += "0";
            } else {
                result = "0" + result;
            }
        }

        return result;
    };

    var getCanonicalTimezone = function (timezone) {
        /// <summary>Gets the canonical timezone representation.</summary>
        /// <param name="timezone" type="String">Timezone representation.</param>
        /// <returns type="String">An 'Z' string if the timezone is absent or 0; the timezone otherwise.</returns>

        return (!timezone || timezone === "Z" || timezone === "+00:00" || timezone === "-00:00") ? "Z" : timezone;
    };

    var invokeRequest = function (request, success, error, handler, httpClient, context) {
        /// <summary>Sends a request containing OData payload to a server.</summary>
        /// <param name="request">Object that represents the request to be sent..</param>
        /// <param name="success">Callback for a successful read operation.</param>
        /// <param name="error">Callback for handling errors.</param>
        /// <param name="handler">Handler for data serialization.</param>
        /// <param name="httpClient">HTTP client layer.</param>
        /// <param name="context">Context used for processing the request</param>
        return httpClient.request(request, function (response) {
            try {
                if (response.headers) {
                    normalizeHeaders(response.headers);
                }

                if (response.data === undefined) {
                    handler.read(response, context);
                }
            } catch (err) {
                if (err.request === undefined) {
                    err.request = request;
                }
                if (err.response === undefined) {
                    err.response = response;
                }
                error(err);
                return;
            }

            success(response.data, response);
        }, error);
    };

    var isArray = function (value) {
        /// <summary>Checks whether the specified value is an array object.</summary>
        /// <param name="value">Value to check.</param>
        /// <returns type="Boolean">true if the value is an array object; false otherwise.</returns>

        return Object.prototype.toString.call(value) === "[object Array]";
    };

    var isDate = function (value) {
        /// <summary>Checks whether the specified value is a Date object.</summary>
        /// <param name="value">Value to check.</param>
        /// <returns type="Boolean">true if the value is a Date object; false otherwise.</returns>

        return Object.prototype.toString.call(value) === "[object Date]";
    };

    var lookupProperty = function (properties, name) {
        /// <summary>Looks up a property by name.</summary>
        /// <param name="properties" type="Array" mayBeNull="true">Array of property objects as per EDM metadata.</param>
        /// <param name="name" type="String">Name to look for.</param>
        /// <returns type="Object">The property object; null if not found.</returns>

        if (properties) {
            var i, len;
            for (i = 0, len = properties.length; i < len; i++) {
                if (properties[i].name === name) {
                    return properties[i];
                }
            }
        }

        return null;
    };

    var lookupTypeInMetadata = function (name, metadata, kind) {
        /// <summary>Looks up a type object by name.</summary>
        /// <param name="name" type="String">Name, possibly null or empty.</param>
        /// <param name="metadata">Metadata store; one of edmx, schema, or an array of any of them.</param>
        /// <param name="kind" type="String">Kind of type to look for; one of 'entityType' or 'complexType'.</param>
        /// <returns>An type description if the name is found; null otherwise.</returns>

        return (name) ? forEachSchema(metadata, function (schema) {
            return lookupTypeInSchema(name, schema, kind);
        }) : null;
    };

    var lookupComplexType = function (name, metadata) {
        /// <summary>Looks up a complex type object by name.</summary>
        /// <param name="name" type="String">Name, possibly null or empty.</param>
        /// <param name="metadata">Metadata store; one of edmx, schema, or an array of any of them.</param>
        /// <returns>A complex type description if the name is found; null otherwise.</returns>

        return lookupTypeInMetadata(name, metadata, "complexType");
    };

    var lookupEntityType = function (name, metadata) {
        /// <summary>Looks up an entity type object by name.</summary>
        /// <param name="name" type="String">Name, possibly null or empty.</param>
        /// <param name="metadata">Metadata store; one of edmx, schema, or an array of any of them.</param>
        /// <returns>An entity type description if the name is found; null otherwise.</returns>

        return lookupTypeInMetadata(name, metadata, "entityType");
    };

    ////    Commented out - metadata is largely optional and we don't rely on it to this extent.
    ////    var lookupEntityTypeForNavigation = function (navigationProperty, metadata) {
    ////        /// <summary>Looks up the target entity type for a navigation property.</summary>
    ////        /// <param name="navigationProperty" type="Object"></param>
    ////        /// <param name="metadata" type="Object"></param>
    ////        /// <returns type="Object">The entity type metadata for the specified property, null if not found.</returns>
    ////        var rel = navigationProperty.relationship;
    ////        var association = forEachSchema(metadata, function (schema) {
    ////            // The name should be the namespace qualified name in 'ns'.'type' format.
    ////            var nameOnly = removeNamespace(schema["namespace"], rel);
    ////            var associations = schema.association;
    ////            if (nameOnly && associations) {
    ////                var i, len;
    ////                for (i = 0, len = associations.length; i < len; i++) {
    ////                    if (associations[i].name === nameOnly) {
    ////                        return associations[i];
    ////                    }
    ////                }
    ////            }
    ////        });
    ////        var result = null;
    ////        if (association) {
    ////            var end = association.end[0];
    ////            if (end.role !== navigationProperty.toRole) {
    ////                end = association.end[1];
    ////                // For metadata to be valid, end.role === navigationProperty.toRole now.
    ////            }
    ////            result = lookupEntityType(end.type, metadata);
    ////        }
    ////        return result;
    ////    };

    var removeNamespace = function (ns, fullName) {
        /// <summary>Given an expected namespace prefix, removes it from a full name.</summary>
        /// <param name="ns" type="String">Expected namespace.</param>
        /// <param name="fullName" type="String">Full name in 'ns'.'name' form.</param>
        /// <returns type="String">The local name, null if it isn't found in the expected namespace.</returns>

        if (fullName.indexOf(ns) === 0 && fullName.charAt(ns.length) === ".") {
            return fullName.substr(ns.length + 1);
        }

        return null;
    };

    var lookupTypeInSchema = function (name, metadata, kind) {
        /// <summary>Looks up an entity type object by name.</summary>
        /// <param name="name" type="String">Name (assigned).</param>
        /// <param name="metadata">Metadata store; one of edmx, schema.</param>
        /// <param name="kind" type="String">Kind of type to look for; one of 'entityType' or 'complexType'.</param>
        /// <returns>An entity type description if the name is found; null otherwise.</returns>
        /// <remarks>
        /// metadata is considered an edmx object if it contains a dataServices object.
        /// </remarks>

        if (metadata) {
            // The name should be the namespace qualified name in 'ns'.'type' format.
            var nameOnly = removeNamespace(metadata["namespace"], name);
            var types = metadata[kind];
            if (nameOnly && types) {
                var i, len;
                for (i = 0, len = types.length; i < len; i++) {
                    if (types[i].name === nameOnly) {
                        return types[i];
                    }
                }
            }
        }

        return null;
    };

    var normalHeaders = {
        "accept": "Accept",
        "content-type": "Content-Type",
        "dataserviceversion": "DataServiceVersion",
        "maxdataserviceversion": "MaxDataServiceVersion"
    };

    var normalizeHeaders = function (headers) {
        /// <summary>Normalizes headers so they can be found with consistent casing.</summary>
        /// <param name="headers" type="Object">Dictionary of name/value pairs.</param>

        for (var name in headers) {
            var lowerName = name.toLowerCase();
            var normalName = normalHeaders[lowerName];
            if (normalName && name !== normalName) {
                var val = headers[name];
                delete headers[name];
                headers[normalName] = val;
            }
        }
    };

    var undefinedDefault = function (value, defaultValue) {
        /// <summary>Returns a default value in place of undefined.</summary>
        /// <param name="value" mayBeNull="true" optional="true">Value to check.</param>
        /// <param name="defaultValue">Value to return if value is undefined.</param>
        /// <returns>value if it's defined; defaultValue otherwise.</returns>
        /// <remarks>
        /// This should only be used for cases where falsy values are valid;
        /// otherwise the pattern should be 'x = (value) ? value : defaultValue;'.
        /// </remarks>
        return (value !== undefined) ? value : defaultValue;
    };

    var parseInt10 = function (value) {
        /// <summary>Parses a value in base 10.</summary>
        /// <param name="value" type="String">String value to parse.</param>
        /// <returns type="Number">The parsed value, NaN if not a valid value.</returns>

        return parseInt(value, 10);
    };


    // The captured indices for this expression are:
    // 0       - complete input
    // 1       - direction
    // 2,3,4   - years, months, days
    // 5,6,7,8 - hours, minutes, seconds, miliseconds

    var parseTimeRE = /^([+-])?P(?:(\d+)Y)?(?:(\d+)M)?(?:(\d+)D)?(?:T(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)(?:\.(\d+))?S)?)?/;

    var parseDuration = function (duration) {
        /// <summary>Parses a string in xsd:duration format.</summary>
        /// <param name="duration" type="String">Duration value.</param>
        /// <remarks>
        /// This method will throw an exception if the input string has a year or a month component. 
        /// </remarks>
        /// <returns type="Object">Object representing the time</returns>

        var parts = parseTimeRE.exec(duration);

        if (parts === null) {
            throw { message: "Invalid duration value." };
        }

        var years = parts[2] || "0";
        var months = parts[3] || "0";
        var days = parseInt10(parts[4] || 0);
        var hours = parseInt10(parts[5] || 0);
        var minutes = parseInt10(parts[6] || 0);
        var seconds = parseFloat(parts[7] || 0);

        if (years !== "0" || months !== "0") {
            throw { message: "Unsupported duration value." };
        }

        var ms = parts[8];
        var ns = 0;
        if (!ms) {
            ms = 0;
        } else {
            if (ms.length > 7) {
                throw { message: "Cannot parse duration value to given precision." };
            }

            ns = formatNumberWidth(ms.substring(3), 4, true);
            ms = formatNumberWidth(ms.substring(0, 3), 3, true);

            ms = parseInt10(ms);
            ns = parseInt10(ns);
        }

        ms += seconds * 1000 + minutes * 60000 + hours * 3600000 + days * 86400000;

        if (parts[1] === "-") {
            ms = -ms;
        }

        var result = { ms: ms, __edmType: "Edm.Time" };

        if (ns) {
            result.ns = ns;
        }
        return result;
    };

    var parseTimezone = function (timezone) {
        /// <summary>Parses a timezone description in (+|-)nn:nn format.</summary>
        /// <param name="timezone" type="String">Timezone offset.</param>
        /// <returns type="Object">
        /// An object with a (d)irection property of 1 for + and -1 for -,
        /// offset (h)ours and offset (m)inutes.
        /// </returns>

        var direction = timezone.substring(0, 1);
        direction = (direction === "+") ? 1 : -1;

        var offsetHours = parseInt10(timezone.substring(1));
        var offsetMinutes = parseInt10(timezone.substring(timezone.indexOf(":") + 1));
        return { d: direction, h: offsetHours, m: offsetMinutes };
    };

    var payloadTypeOf = function (data) {
        /// <summary>Determines the kind of payload applicable for the specified value.</summary>
        /// <param name="data">Value to check.</param>
        /// <returns type="String">One of the values declared on the payloadType object.</returns>

        switch (typeof (data)) {
            case "object":
                if (!data) {
                    return PAYLOADTYPE_NONE;
                }
                if (isArray(data) || isArray(data.results)) {
                    return PAYLOADTYPE_FEEDORLINKS;
                }
                if (data.__metadata && data.__metadata.uri !== undefined) {
                    return PAYLOADTYPE_ENTRY;
                }
                if (isArray(data.EntitySets)) {
                    return PAYLOADTYPE_SVCDOC;
                }
                if (isArray(data.__batchRequests)) {
                    return PAYLOADTYPE_BATCH;
                }
                if (isDate(data)) {
                    return PAYLOADTYPE_PRIMITIVETYPE;
                }

                return PAYLOADTYPE_COMPLEXTYPE;

            case "string":
            case "number":
            case "boolean":
                return PAYLOADTYPE_PRIMITIVETYPE;
        }

        return PAYLOADTYPE_UNKNOWN;
    };

    var prepareRequest = function (request, handler, context) {
        /// <summary>Prepares a request object so that it can be sent through the network.</summary>
        /// <param name="request">Object that represents the request to be sent.</param>
        /// <param name="handler">Handler for data serialization</param>
        /// <param name="context">Context used for preparing the request</param>

        // Default to GET if no method has been specified.    
        if (!request.method) {
            request.method = "GET";
        }

        if (!request.headers) {
            request.headers = {};
        } else {
            normalizeHeaders(request.headers);
        }

        if (request.headers.Accept === undefined) {
            request.headers.Accept = handler.accept;
        }

        if (assigned(request.data) && request.body === undefined) {
            handler.write(request, context);
        }

        if (!assigned(request.headers.MaxDataServiceVersion)) {
            request.headers.MaxDataServiceVersion = handler.maxDataServiceVersion || "1.0";
        }
        
        // ##### BEGIN: MODIFIED BY SAP
        if (request.async === undefined) {
        	request.async = true;
        }
        // ##### END: MODIFIED BY SAP
    };

    var propertyKindOf = function (value) {
        /// <summary>Determines the kind of property for the specified value.</summary>
        /// <param name="value">Value to check.</param>
        /// <returns type="String">One of the values declared on the propertyKind object.</returns>

        switch (payloadTypeOf(value)) {
            case PAYLOADTYPE_COMPLEXTYPE:
                if (value.__deferred && value.__deferred.uri) {
                    return PROPERTYKIND_DEFERRED;
                }

                return PROPERTYKIND_COMPLEX;

            case PAYLOADTYPE_FEEDORLINKS:
            case PAYLOADTYPE_ENTRY:
                return PROPERTYKIND_INLINE;

            case PAYLOADTYPE_PRIMITIVETYPE:
                return PROPERTYKIND_PRIMITIVE;
        }
        return PROPERTYKIND_NONE;
    };

    var throwErrorCallback = function (error) {
        /// <summary>Default error handler.</summary>
        /// <param name="error" type="Object">Error to handle.</param>
        throw error;
    };

    var trimString = function (str) {
        /// <summary>Removes leading and trailing whitespaces from a string.</summary>
        /// <param name="str" type="String" optional="false" mayBeNull="false">String to trim</param>
        /// <returns type="String">The string with no leading or trailing whitespace.</returns>

        if (str.trim) {
            return str.trim();
        }

        return str.replace(/^\s+|\s+$/g, '');
    };

    // Regular expression that splits a uri into its components:
    // 0 - is the matched string.
    // 1 - is the scheme.
    // 2 - is the authority.
    // 3 - is the path.
    // 4 - is the query.
    // 5 - is the fragment.
    var uriRegEx = /^([^:\/?#]+:)?(\/\/[^\/?#]*)?([^?#:]+)?(\?[^#]*)?(#.*)?/;
    var uriPartNames = ["scheme", "authority", "path", "query", "fragment"];

    var getURIInfo = function (uri) {
        /// <summary>Gets information about the components of the specified URI.</summary>
        /// <param name="uri" type="String">URI to get information from.</param>
        /// <returns type="Object">
        /// An object with an isAbsolute flag and part names (scheme, authority, etc.) if available.
        /// </returns>

        var result = { isAbsolute: false };

        if (uri) {
            var matches = uriRegEx.exec(uri);
            if (matches) {
                var i, len;
                for (i = 0, len = uriPartNames.length; i < len; i++) {
                    if (matches[i + 1]) {
                        result[uriPartNames[i]] = matches[i + 1];
                    }
                }
            }
            if (result.scheme) {
                result.isAbsolute = true;
            }
        }

        return result;
    };

    var getURIFromInfo = function (uriInfo) {
        /// <summary>Builds a URI string from its components.</summary>
        /// <param name="uriInfo" type="Object"> An object with uri parts (scheme, authority, etc.).</param>
        /// <returns type="String">URI string.</returns>

        return "".concat(
            uriInfo.scheme || "",
            uriInfo.authority || "",
            uriInfo.path || "",
            uriInfo.query || "",
            uriInfo.fragment || "");
    };

    // Regular expression that splits a uri authority into its subcomponents:
    // 0 - is the matched string.
    // 1 - is the userinfo subcomponent.
    // 2 - is the host subcomponent.
    // 3 - is the port component.
    var uriAuthorityRegEx = /^\/{0,2}(?:([^@]*)@)?([^:]+)(?::{1}(\d+))?/;

    // Regular expression that matches percentage enconded octects (i.e %20 or %3A);
    var pctEncodingRegEx = /%[0-9A-F]{2}/ig;

    var normalizeURICase = function (uri) {
        /// <summary>Normalizes the casing of a URI.</summary>
        /// <param name="uri" type="String">URI to normalize, absolute or relative.</param>
        /// <returns type="String">The URI normalized to lower case.</returns>

        var uriInfo = getURIInfo(uri);
        var scheme = uriInfo.scheme;
        var authority = uriInfo.authority;

        if (scheme) {
            uriInfo.scheme = scheme.toLowerCase();
            if (authority) {
                var matches = uriAuthorityRegEx.exec(authority);
                if (matches) {
                    uriInfo.authority = "//" +
                    (matches[1] ? matches[1] + "@" : "") +
                    (matches[2].toLowerCase()) +
                    (matches[3] ? ":" + matches[3] : "");
                }
            }
        }

        uri = getURIFromInfo(uriInfo);

        return uri.replace(pctEncodingRegEx, function (str) {
            return str.toLowerCase();
        });
    };

    var normalizeURI = function (uri, base) {
        /// <summary>Normalizes a possibly relative URI with a base URI.</summary>
        /// <param name="uri" type="String">URI to normalize, absolute or relative.</param>
        /// <param name="base" type="String" mayBeNull="true">Base URI to compose with.</param>
        /// <returns type="String">The composed URI if relative; the original one if absolute.</returns>

        if (!base) {
            return uri;
        }

        var uriInfo = getURIInfo(uri);
        if (uriInfo.isAbsolute) {
            return uri;
        }

        var baseInfo = getURIInfo(base);
        var normInfo = {};
        var path;

        if (uriInfo.authority) {
            normInfo.authority = uriInfo.authority;
            path = uriInfo.path;
            normInfo.query = uriInfo.query;
        } else {
            if (!uriInfo.path) {
                path = baseInfo.path;
                normInfo.query = uriInfo.query || baseInfo.query;
            } else {
                if (uriInfo.path.charAt(0) === '/') {
                    path = uriInfo.path;
                } else {
                    path = mergeUriPathWithBase(uriInfo.path, baseInfo.path);
                }
                normInfo.query = uriInfo.query;
            }
            normInfo.authority = baseInfo.authority;
        }

        normInfo.path = removeDotsFromPath(path);

        normInfo.scheme = baseInfo.scheme;
        normInfo.fragment = uriInfo.fragment;

        return getURIFromInfo(normInfo);
    };

    var mergeUriPathWithBase = function (uriPath, basePath) {
        /// <summary>Merges the path of a relative URI and a base URI.</summary>
        /// <param name="uriPath" type="String>Relative URI path.</param>
        /// <param name="basePath" type="String">Base URI path.</param>
        /// <returns type="String">A string with the merged path.</returns>

        var path = "/";
        var end;

        if (basePath) {
            end = basePath.lastIndexOf("/");
            path = basePath.substring(0, end);

            if (path.charAt(path.length - 1) !== "/") {
                path = path + "/";
            }
        }

        return path + uriPath;
    };

    var removeDotsFromPath = function (path) {
        /// <summary>Removes the special folders . and .. from a URI's path.</summary>
        /// <param name="path" type="string">URI path component.</param>
        /// <returns type="String">Path without any . and .. folders.</returns>

        var result = "";
        var segment = "";
        var end;

        while (path) {
            if (path.indexOf("..") === 0 || path.indexOf(".") === 0) {
                path = path.replace(/^\.\.?\/?/g, "");
            } else if (path.indexOf("/..") === 0) {
                path = path.replace(/^\/\..\/?/g, "/");
                end = result.lastIndexOf("/");
                if (end === -1) {
                    result = "";
                } else {
                    result = result.substring(0, end);
                }
            } else if (path.indexOf("/.") === 0) {
                path = path.replace(/^\/\.\/?/g, "/");
            } else {
                segment = path;
                end = path.indexOf("/", 1);
                if (end !== -1) {
                    segment = path.substring(0, end);
                }
                result = result + segment;
                path = path.replace(segment, "");
            }
        }
        return result;
    };


    var ticks = 0;

    var canUseJSONP = function (request) {
        /// <summary>
        /// Checks whether the specified request can be satisfied with a JSONP request.
        /// </summary>
        /// <param name="request">Request object to check.</param>
        /// <returns type="Boolean">true if the request can be satisfied; false otherwise.</returns>

        // Requests that 'degrade' without changing their meaning by going through JSONP
        // are considered usable.
        //
        // We allow data to come in a different format, as the servers SHOULD honor the Accept
        // request but may in practice return content with a different MIME type.
        if (request.method && request.method !== "GET") {
            return false;
        }

        return true;
    };

    var createIFrame = function (url) {
        /// <summary>Creates an IFRAME tag for loading the JSONP script</summary>
        /// <param name="url" type="String">The source URL of the script</param>
        /// <returns type="HTMLElement">The IFRAME tag</returns>
        var iframe = window.document.createElement("IFRAME");
        iframe.style.display = "none";

        var attributeEncodedUrl = url.replace(/&/g, "&amp;").replace(/"/g, "&quot;").replace(/\</g, "&lt;");
        var html = "<html><head><script type=\"text/javascript\" src=\"" + attributeEncodedUrl + "\"><\/script><\/head><body><\/body><\/html>";

        var body = window.document.getElementsByTagName("BODY")[0];
        body.appendChild(iframe);

        writeHtmlToIFrame(iframe, html);
        return iframe;
    };

    var createXmlHttpRequest = function () {
        /// <summary>Creates a XmlHttpRequest object.</summary>
        /// <returns type="XmlHttpRequest">XmlHttpRequest object.</returns>
        if (window.XMLHttpRequest) {
            return new window.XMLHttpRequest();
        }
        var exception;
        if (window.ActiveXObject) {
            try {
                return new window.ActiveXObject("Msxml2.XMLHTTP.6.0");
            } catch (_) {
                try {
                    return new window.ActiveXObject("Msxml2.XMLHTTP.3.0");
                } catch (e) {
                    exception = e;
                }
            }
        } else {
            exception = { message: "XMLHttpRequest not supported" };
        }
        throw exception;
    };

    var isAbsoluteUrl = function (url) {
        /// <summary>Checks whether the specified URL is an absolute URL.</summary>
        /// <param name="url" type="String">URL to check.</param>
        /// <returns type="Boolean">true if the url is an absolute URL; false otherwise.</returns>

        return url.indexOf("http://") === 0 ||
            url.indexOf("https://") === 0 ||
            url.indexOf("file://") === 0;
    };

    var isLocalUrl = function (url) {
        /// <summary>Checks whether the specified URL is local to the current context.</summary>
        /// <param name="url" type="String">URL to check.</param>
        /// <returns type="Boolean">true if the url is a local URL; false otherwise.</returns>

        if (!isAbsoluteUrl(url)) {
            return true;
        }

        // URL-embedded username and password will not be recognized as same-origin URLs.
        var location = window.location;
        var locationDomain = location.protocol + "//" + location.host + "/";
        return (url.indexOf(locationDomain) === 0);
    };

    var removeCallback = function (name, tick) {
        /// <summary>Removes a callback used for a JSONP request.</summary>
        /// <param name="name" type="String">Function name to remove.</param>
        /// <param name="tick" type="Number">Tick count used on the callback.</param>
        try {
            delete window[name];
        } catch (err) {
            window[name] = undefined;
            if (tick === ticks - 1) {
                ticks -= 1;
            }
        }
    };

    var removeIFrame = function (iframe) {
        /// <summary>Removes an iframe.</summary>
        /// <param name="iframe" type="Object">The iframe to remove.</param>
        /// <returns type="Object">Null value to be assigned to iframe reference.</returns>
        if (iframe) {
            writeHtmlToIFrame(iframe, "");
            iframe.parentNode.removeChild(iframe);
        }

        return null;
    };

    var readResponseHeaders = function (xhr, headers) {
        /// <summary>Reads response headers into array.</summary>
        /// <param name="xhr" type="XMLHttpRequest">HTTP request with response available.</param>
        /// <param name="headers" type="Array">Target array to fill with name/value pairs.</param>

        // ##### BEGIN: MODIFIED BY SAP
    	// for CORS issues
        var responseHeaders = xhr.getAllResponseHeaders();
        if (!responseHeaders){
            var contentType = xhr.getResponseHeader("Content-Type");
            var contentLength = xhr.getResponseHeader("Content-Length");
            if (contentType)
            	headers["Content-Type"] = contentType;
            if (contentLength)
            	headers["Content-Length"] = contentLength;
        }else{
        	responseHeaders = responseHeaders.split(/\r?\n/);
        	var i, len;
        	for (i = 0, len = responseHeaders.length; i < len; i++) {
        		if (responseHeaders[i]) {
        			var header = responseHeaders[i].split(": ");
        			headers[header[0]] = header[1];
        		}
        	}
        }
        // ##### END: MODIFIED BY SAP

    };

    var writeHtmlToIFrame = function (iframe, html) {
        /// <summary>Writes HTML to an IFRAME document.</summary>
        /// <param name="iframe" type="HTMLElement">The IFRAME element to write to.</param>
        /// <param name="html" type="String">The HTML to write.</param>
        var frameDocument = (iframe.contentWindow) ? iframe.contentWindow.document : iframe.contentDocument.document;
        frameDocument.open();
        frameDocument.write(html);
        frameDocument.close();
    };

    odata.defaultHttpClient = {
        callbackParameterName: "$callback",

        formatQueryString: "$format=json",

        enableJsonpCallback: false,

        request: function (request, success, error) {
            /// <summary>Performs a network request.</summary>
            /// <param name="request" type="Object">Request description.</request>
            /// <param name="success" type="Function">Success callback with the response object.</param>
            /// <param name="error" type="Function">Error callback with an error object.</param>
            /// <returns type="Object">Object with an 'abort' method for the operation.</returns>

            var result = {};
            var xhr = null;
            var done = false;
            var iframe;

            result.abort = function () {
                iframe = removeIFrame(iframe);
                if (done) {
                    return;
                }

                done = true;
                if (xhr) {
                    xhr.abort();
                    xhr = null;
                }

                error({ message: "Request aborted" });
            };

            var handleTimeout = function () {
                iframe = removeIFrame(iframe);
                if (!done) {
                    done = true;
                    xhr = null;
                    error({ message: "Request timed out" });
                }
            };

            var name;
            var url = request.requestUri;
            var enableJsonpCallback = defined(request.enableJsonpCallback, this.enableJsonpCallback);
            var callbackParameterName = defined(request.callbackParameterName, this.callbackParameterName);
            var formatQueryString = defined(request.formatQueryString, this.formatQueryString);
            if (!enableJsonpCallback || isLocalUrl(url)) {

                xhr = createXmlHttpRequest();
                // ##### BEGIN: MODIFIED BY SAP
                var requestCallback = function () {
                // ##### END: MODIFIED BY SAP
                    if (done || xhr === null || xhr.readyState !== 4) {
                        return;
                    }

                    // Workaround for XHR behavior on IE.
                    var statusText = xhr.statusText;
                    var statusCode = xhr.status;
                    if (statusCode === 1223) {
                        statusCode = 204;
                        statusText = "No Content";
                    }

                    var headers = [];
                    readResponseHeaders(xhr, headers);

                    var response = { requestUri: url, statusCode: statusCode, statusText: statusText, headers: headers, body: xhr.responseText };

                    done = true;
                    xhr = null;
                    if (statusCode >= 200 && statusCode <= 299) {
                        success(response);
                    } else {
                        error({ message: "HTTP request failed", request: request, response: response });
                    }
                };
                
                // ##### BEGIN: MODIFIED BY SAP
                if (request.user && request.password) {
                    xhr.open(request.method || "GET", url, request.async, request.user, request.password);
                } else {
                    xhr.open(request.method || "GET", url, request.async);
                }
                // ##### END: MODIFIED BY SAP

                // Set the name/value pairs.
                if (request.headers) {
                    for (name in request.headers) {
                        xhr.setRequestHeader(name, request.headers[name]);
                    }
                }

                // Set the timeout if available.
                if (request.timeoutMS) {
                    xhr.timeout = request.timeoutMS;
                    xhr.ontimeout = handleTimeout;
                }
                
                // ##### BEGIN: MODIFIED BY SAP
                if (request.async) {
                    xhr.onreadystatechange = requestCallback;
                }
                xhr.send(request.body);
                if (!request.async) {
                	requestCallback();
                }
                // ##### END: MODIFIED BY SAP
            } else {
                if (!canUseJSONP(request)) {
                    throw { message: "Request is not local and cannot be done through JSONP." };
                }

                var tick = ticks;
                ticks += 1;
                var tickText = tick.toString();
                var succeeded = false;
                var timeoutId;
                name = "handleJSONP_" + tickText;
                window[name] = function (data) {
                    iframe = removeIFrame(iframe);
                    if (!done) {
                        succeeded = true;
                        window.clearTimeout(timeoutId);
                        removeCallback(name, tick);

                        // Workaround for IE8 and below where trying to access data.constructor after the IFRAME has been removed
                        // throws an "unknown exception"
                        if (window.ActiveXObject && !window.DOMParser) {
                            data = window.JSON.parse(window.JSON.stringify(data));
                        }

                        // Call the success callback in the context of the parent window, instead of the IFRAME
                        delay(success, { body: data, statusCode: 200, headers: { "Content-Type": "application/json"} });
                    }
                };

                // Default to two minutes before timing out, 1000 ms * 60 * 2 = 120000.
                var timeoutMS = (request.timeoutMS) ? request.timeoutMS : 120000;
                timeoutId = window.setTimeout(handleTimeout, timeoutMS);

                var queryStringParams = callbackParameterName + "=parent." + name;
                if (this.formatQueryString) {
                    queryStringParams += "&" + formatQueryString;
                }

                var qIndex = url.indexOf("?");
                if (qIndex === -1) {
                    url = url + "?" + queryStringParams;
                } else if (qIndex === url.length - 1) {
                    url = url + queryStringParams;
                } else {
                    url = url + "&" + queryStringParams;
                }

                iframe = createIFrame(url);
            }

            return result;
        }
    };



    var MAX_DATA_SERVICE_VERSION = "2.0";

    var contentType = function (str) {
        /// <summary>Parses a string into an object with media type and properties.</summary>
        /// <param name="str" type="String">String with media type to parse.</param>
        /// <returns>null if the string is empty; an object with 'mediaType' and a 'properties' dictionary otherwise.</returns>

        if (!str) {
            return null;
        }

        var contentTypeParts = str.split(";");
        var properties = {};

        var i, len;
        for (i = 1, len = contentTypeParts.length; i < len; i++) {
            var contentTypeParams = contentTypeParts[i].split("=");
            properties[trimString(contentTypeParams[0])] = contentTypeParams[1];
        }

        return { mediaType: trimString(contentTypeParts[0]), properties: properties };
    };

    var contentTypeToString = function (contentType) {
        /// <summary>Serializes an object with media type and properties dictionary into a string.</summary>
        /// <param name="contentType">Object with media type and properties dictionary to serialize.</param>
        /// <returns>String representation of the media type object; undefined if contentType is null or undefined.</returns>

        if (!contentType) {
            return undefined;
        }

        var result = contentType.mediaType;
        var property;
        for (property in contentType.properties) {
            result += ";" + property + "=" + contentType.properties[property];
        }
        return result;
    };

    var createReadWriteContext = function (contentType, dataServiceVersion, context, handler) {
        /// <summary>Creates an object that is going to be used as the context for the handler's parser and serializer.</summary>
        /// <param name="contentType">Object with media type and properties dictionary.</param>
        /// <param name="dataServiceVersion" type="String">String indicating the version of the protocol to use.</param>
        /// <param name="context">Operation context.</param>
        /// <param name="handler">Handler object that is processing a resquest or response.</param>
        /// <returns>Context object.</returns>

        return {
            contentType: contentType,
            dataServiceVersion: dataServiceVersion,
            metadata: context ? context.metadata : null,
            context: context,
            handler: handler
        };
    };

    var fixRequestHeader = function (request, name, value) {
        /// <summary>Sets a request header's value. If the header has already a value other than undefined, null or empty string, then this method does nothing.</summary>
        /// <param name="request">Request object on which the header will be set.</param>
        /// <param name="name" type="String">Header name.</param>
        /// <param name="value" type="String">Header value.</param>
        if (!request) {
            return;
        }

        var headers = request.headers;
        if (!headers[name]) {
            headers[name] = value;
        }
    };

    var fixDataServiceVersion = function (context, version) {
        /// <summary>Sets the dataServiceVersion component of the context.</summary>
        /// <param name="context">Context object used for serialization.</param>
        /// <param name="version" type="String">Version value.</param>
        /// <remarks>
        /// If the component has already a value other than undefined, null or 
        /// empty string, then this method does nothing.
        /// </remarks>

        if (!context.dataServiceVersion) {
            context.dataServiceVersion = version;
        }
    };

    var getRequestOrResponseHeader = function (requestOrResponse, name) {
        /// <summary>Gets the value of a request or response header.</summary>
        /// <param name="requestOrResponse">Object representing a request or a response.</param>
        /// <param name="name" type="String">Name of the header to retrieve.</param>
        /// <returns type="String">String value of the header; undefined if the header cannot be found.</returns>

        var headers = requestOrResponse.headers;
        return (headers && headers[name]) || undefined;
    };

    var getContentType = function (requestOrResponse) {
        /// <summary>Gets the value of the Content-Type header from a request or response.</summary>
        /// <param name="requestOrResponse">Object representing a request or a response.</param>
        /// <returns type="Object">Object with 'mediaType' and a 'properties' dictionary; null in case that the header is not found or doesn't have a value.</returns>

        return contentType(getRequestOrResponseHeader(requestOrResponse, "Content-Type"));
    };

    var versionRE = /^\s?(\d+\.\d+);?.*$/;
    var getDataServiceVersion = function (requestOrResponse) {
        /// <summary>Gets the value of the DataServiceVersion header from a request or response.</summary>
        /// <param name="requestOrResponse">Object representing a request or a response.</param>
        /// <returns type="String">Data service version; undefined if the header cannot be found.</returns>

        var value = getRequestOrResponseHeader(requestOrResponse, "DataServiceVersion");
        if (value) {
            var matches = versionRE.exec(value);
            if (matches && matches.length) {
                return matches[1];
            }
        }

        // Fall through and return undefined.
    };

    var handlerAccepts = function (handler, cType) {
        /// <summary>Checks that a handler can process a particular mime type.</summary>
        /// <param name="handler">Handler object that is processing a resquest or response.</param>
        /// <param name="cType">Object with 'mediaType' and a 'properties' dictionary.</param>
        /// <returns type="Boolean">True if the handler can process the mime type; false otherwise.</returns>

        // The following check isn't as strict because if cType.mediaType = application/; it will match an accept value of "application/xml";
        // however in practice we don't not expect to see such "suffixed" mimeTypes for the handlers.
        return handler.accept.indexOf(cType.mediaType) >= 0;
    };

    var handlerRead = function (handler, parseCallback, response, context) {
        /// <summary>Invokes the parser associated with a handler for reading the payload of a HTTP response.</summary>
        /// <param name="handler">Handler object that is processing the response.</param>
        /// <param name="parseCallback" type="Function">Parser function that will process the response payload.</param>
        /// <param name="response">HTTP response whose payload is going to be processed.</param>
        /// <param name="context">Object used as the context for processing the response.</param>
        /// <returns type="Boolean">True if the handler processed the response payload and the response.data property was set; false otherwise.</returns>

        if (!response || !response.headers) {
            return false;
        }

        var cType = getContentType(response);
        var version = getDataServiceVersion(response) || "";
        var body = response.body;
        
        // ##### BEGIN: MODIFIED BY SAP
        // added !body
        // in XML case if e.g. delete op body is "" and no content type do nothing...check if this is fixed in future versions...
        if (!assigned(body) || !body) {
        //##### END: MODIFIED BY SAP
            return false;
        }

        if (handlerAccepts(handler, cType)) {
            var readContext = createReadWriteContext(cType, version, context, handler);
            readContext.response = response;
            response.data = parseCallback(handler, body, readContext);
            return response.data !== undefined;
        }

        return false;
    };

    var handlerWrite = function (handler, serializeCallback, request, context) {
        /// <summary>Invokes the serializer associated with a handler for generating the payload of a HTTP request.</summary>
        /// <param name="handler">Handler object that is processing the request.</param>
        /// <param name="serializeCallback" type="Function">Serializer function that will generate the request payload.</param>
        /// <param name="response">HTTP request whose payload is going to be generated.</param>
        /// <param name="context">Object used as the context for serializing the request.</param>
        /// <returns type="Boolean">True if the handler serialized the request payload and the request.body property was set; false otherwise.</returns>
        if (!request || !request.headers) {
            return false;
        }

        var cType = getContentType(request);
        var version = getDataServiceVersion(request);

        if (!cType || handlerAccepts(handler, cType)) {
            var writeContext = createReadWriteContext(cType, version, context, handler);
            writeContext.request = request;

            request.body = serializeCallback(handler, request.data, writeContext);

            if (request.body !== undefined) {
                fixRequestHeader(request, "DataServiceVersion", writeContext.dataServiceVersion || "1.0");
                fixRequestHeader(request, "Content-Type", contentTypeToString(writeContext.contentType));
                fixRequestHeader(request, "MaxDataServiceVersion", handler.maxDataServiceVersion);
                return true;
            }
        }

        return false;
    };

    var handler = function (parseCallback, serializeCallback, accept, maxDataServiceVersion) {
        /// <summary>Creates a handler object for processing HTTP requests and responses.</summary>
        /// <param name="parseCallback" type="Function">Parser function that will process the response payload.</param>
        /// <param name="serializeCallback" type="Function">Serializer function that will generate the request payload.</param>
        /// <param name="accept" type="String">String containing a comma separated list of the mime types that this handler can work with.</param>
        /// <param name="maxDataServiceVersion" type="String">String indicating the highest version of the protocol that this handler can work with.</param>
        /// <returns type="Object">Handler object.</returns>

        return {
            accept: accept,
            maxDataServiceVersion: maxDataServiceVersion,

            read: function (response, context) {
                return handlerRead(this, parseCallback, response, context);
            },

            write: function (request, context) {
                return handlerWrite(this, serializeCallback, request, context);
            }
        };
    };

    var textParse = function (handler, body /*, context */) {
        return body;
    };

    var textSerialize = function (handler, data /*, context */) {
        if (assigned(data)) {
            return data.toString();
        } else {
            return undefined;
        }
    };

    odata.textHandler = handler(textParse, textSerialize, "text/plain", MAX_DATA_SERVICE_VERSION);



    var xmlMediaType = "application/xml";

    // URI prefixes to generate smaller code.
    var http = "http://";
    var w3org = http + "www.w3.org/";               // http://www.w3.org/
    var ado = http + "schemas.microsoft.com/ado/";  // http://schemas.microsoft.com/ado/
    var adoDs = ado + "2007/08/dataservices";       // http://schemas.microsoft.com/ado/2007/08/dataservices

    var xmlnsNS = w3org + "2000/xmlns/";            // http://www.w3.org/2000/xmlns/
    var xmlNS = w3org + "XML/1998/namespace";       // http://www.w3.org/XML/1998/namespace
    var edmxNs = ado + "2007/06/edmx";              // http://schemas.microsoft.com/ado/2007/06/edmx
    var edmNs = ado + "2008/09/edm";                // http://schemas.microsoft.com/ado/2008/09/edm
    var edmNs2 = ado + "2006/04/edm";               // http://schemas.microsoft.com/ado/2006/04/edm
    var edmNs3 = ado + "2007/05/edm";               // http://schemas.microsoft.com/ado/2007/05/edm
    var edmNs4 = ado + "2009/11/edm";               // http://schemas.microsoft.com/ado/2009/11/edm
    var atomXmlNs = w3org + "2005/Atom";            // http://www.w3.org/2005/Atom
    var appXmlNs = w3org + "2007/app";              // http://www.w3.org/2007/app
    var odataXmlNs = adoDs;                         // http://schemas.microsoft.com/ado/2007/08/dataservices
    var odataMetaXmlNs = adoDs + "/metadata";       // http://schemas.microsoft.com/ado/2007/08/dataservices/metadata
    var odataRelatedPrefix = adoDs + "/related/";   // http://schemas.microsoft.com/ado/2007/08/dataservices/related
    var odataScheme = adoDs + "/scheme";            // http://schemas.microsoft.com/ado/2007/08/dataservices/scheme

    var hasLeadingOrTrailingWhitespace = function (text) {
        /// <summary>Checks whether the specified string has leading or trailing spaces.</summary>
        /// <param name="text" type="String">String to check.</param>
        /// <returns type="Boolean">true if text has any leading or trailing whitespace; false otherwise.</returns>

        var re = /(^\s)|(\s$)/;
        return re.test(text);
    };

    var appendAsXml = function (domNode, xmlAsText) {
        /// <summary>Appends an XML text fragment into the specified DOM element node.</summary>
        /// <param name="domNode">DOM node for the parent element.</param>
        /// <param name="xmlAsText" type="String" mayBeNull="false">XML to append as a child of element.</param>

        var value = "<c>" + xmlAsText + "</c>";
        var parsed = xmlParse(value, null);

        var doc = domNode.ownerDocument;
        var imported = parsed.domNode;
        if ("importNode" in doc) {
            imported = doc.importNode(parsed.domNode, true);
        }

        var importedChild = imported.firstChild;
        while (importedChild) {
            domNode.appendChild(importedChild);
            importedChild = importedChild.nextSibling;
        }
    };

    var safeSetProperty = function (obj, name, value) {
        /// <summary>Safely set as property in an object by invoking obj.setProperty.</summary>
        /// <param name="obj">Object that exposes a setProperty method.</param>
        /// <param name="name" type="String" mayBeNull="false">Property name.</param>
        /// <param name="value">Property value.</param>
        try {
            obj.setProperty(name, value);
        } catch (_) { }
    };

    var createDomParser = function () {
        /// <summary>Creates a DOM parser object.</summary>
        /// <returns type="DOMParser">DOMParser object.</returns>
        var exception;
        var result;
        if (window.ActiveXObject) {
            try {
                result = new ActiveXObject("Msxml2.DOMDocument.6.0");
                result.async = false;

                return result;
            } catch (_) {
                try {
                    result = new ActiveXObject("Msxml2.DOMDocument.3.0");

                    result.async = false;
                    safeSetProperty(result, "ProhibitDTD", true);
                    safeSetProperty(result, "MaxElementDepth", 256);
                    safeSetProperty(result, "AllowDocumentFunction", false);
                    safeSetProperty(result, "AllowXsltScript", false);

                    return result;
                } catch (e) {
                    exception = e;
                }
            }
        } else {
            if (window.DOMParser) {
                return new window.DOMParser();
            }
            exception = { message: "XML DOM parser not supported" };
        }
        throw exception;
    };

    var createAttributeExtension = function (wrappedNode) {
        /// <summary>Creates an extension object for the specified attribute.</summary>
        /// <param name="wrappedNode">Wrapped node for the attribute.</param>
        /// <returns type="Object">The new extension object.</returns>

        return {
            name: wrappedNode.localName,
            namespace: wrappedNode.nsURI,
            value: wrappedNode.domNode.value
        };
    };

    var createElementExtension = function (wrappedNode) {
        /// <summary>Creates an extension object for the specified element.</summary>
        /// <param name="wrappedNode">Wrapped node for the element.</param>
        /// <returns type="Object">The new extension object.</returns>

        var result = {
            name: wrappedNode.localName,
            namespace: wrappedNode.nsURI,
            value: getElementText(wrappedNode.domNode),
            attributes: [],
            children: []
        };

        xmlAttributes(wrappedNode, function (wrappedAttribute) {
            // Namespace declarations aren't processed, because every extension
            // is namespace-qualified.
            if (wrappedAttribute.nsURI !== xmlnsNS) {
                result.attributes.push(createAttributeExtension(wrappedAttribute));
            }
        });

        xmlChildElements(wrappedNode, function (wrappedElement) {
            result.children.push(createElementExtension(wrappedElement));
        });

        return result;
    };

    var isWhitespace = function (text) {
        /// <summary>Determines whether the specified text is empty or whitespace.</summary>
        /// <param name="text" type="String">Value to inspect.</param>
        /// <returns type="Boolean">true if the text value is empty or all whitespace; false otherwise.</returns>
        var ws = /^\s*$/;
        return text === null || ws.test(text);
    };

    var isWhitespacePreserveContext = function (domElement) {
        /// <summary>Determines whether the specified element has xml:space='preserve' applied.</summary>
        /// <param name="domElement">Element to inspect.</param>
        /// <returns type="Boolean">Whether xml:space='preserve' is in effect.</returns>
        while (domElement !== null && domElement.nodeType === 1) {
            var val = xml_attribute(domElement, "space", xmlNS);
            if (val === "preserve") {
                return true;
            } else if (val === "default") {
                break;
            } else {
                domElement = domElement.parentNode;
            }
        }

        return false;
    };

    var getElementText = function (domElement) {
        /// <summary>
        /// Gets the concatenated value of all immediate child text and CDATA nodes for the specified element.
        /// </summary>
        /// <param name="domElement">Element to get values for.</param>
        /// <returns type="String" mayBeNull="true">Text for all direct children.</returns>

        var result = null;
        var cursor = domElement.firstChild;
        var whitespaceAlreadyRemoved = domElement.ownerDocument.preserveWhiteSpace === false;
        var whitespacePreserveContext;
        while (cursor) {
            if (cursor.nodeType === 3 || cursor.nodeType === 4) {
                // isElementContentWhitespace indicates that this is 'ignorable whitespace',
                // but it's not defined by all browsers, and does not honor xml:space='preserve'
                // in some implementations.
                //
                // If we can't tell either way, we walk up the tree to figure out whether
                // xml:space is set to preserve; otherwise we discard pure-whitespace.
                //
                // For example <a>  <b>1</b></a>. The space between <a> and <b> is usually 'ignorable'.
                var text = cursor.nodeValue;
                var shouldInclude = whitespaceAlreadyRemoved || !isWhitespace(text);
                if (!shouldInclude) {
                    // Walk up the tree to figure out whether we are in xml:space='preserve' context
                    // for the cursor (needs to happen only once).
                    if (whitespacePreserveContext === undefined) {
                        whitespacePreserveContext = isWhitespacePreserveContext(domElement);
                    }

                    shouldInclude = whitespacePreserveContext;
                }

                if (shouldInclude) {
                    if (!result) {
                        result = text;
                    } else {
                        result += text;
                    }
                }
            }

            cursor = cursor.nextSibling;
        }

        return result;
    };

    var getSingleElementByTagNameNS = function (domNode, namespaceURI, localName) {
        /// <summary>Gets the first element under 'domNode' with the spacified name and namespace.</summary>
        /// <param name="domNode">DOM element node.</param>
        /// <param name="namespaceURI" type="String">The namespace URI of the element to match.</param>
        /// <param name="localName" type="String">The local name of the element to match.</param>
        /// <returns>The first element found, null if none.</returns>
        /// <remarks>namespaceURI should be a specific namespace, otherwise the behavior is unspecified.</remarks>

        var result;
        if (domNode.getElementsByTagNameNS) {
            result = domNode.getElementsByTagNameNS(namespaceURI, localName);
            if (result.length !== 0) {
                return result[0];
            }
        } else {
            var child = domNode.firstChild;
            while (child) {
                if (child.nodeType === 1 &&
                    xmlLocalName(child) === localName &&
                    child.namespaceURI === namespaceURI) {
                    return child;
                }

                child = child.nextSibling;
            }
        }

        return null;
    };

    var checkParserErrorElement = function (element, text) {
        /// <summary>Checks whether the specified element is a parser error element.</summary>
        /// <param name="element">Element to check.</param>
        /// <param name="text" type="String">Original text that was being parsed.</param>
        /// <remarks>
        /// DOMParser-based parsers don't throw an exception but instead return a
        /// specific document; this function checks this case and normalizes to
        /// an exception being thrown.
        /// </remarks>

        // Firefox reports errors with a specific element.
        var parserErrorNS = "http://www.mozilla.org/newlayout/xml/parsererror.xml";
        var wrappedElement = xml_wrapNode(element, "");
        if (wrappedElement.localName === "parsererror" && wrappedElement.nsURI === parserErrorNS) {
            var reason = getElementText(element);
            var sourceTextElement = getSingleElementByTagNameNS(wrappedElement, parserErrorNS, "sourcetext");
            var srcText = (sourceTextElement) ? sourceTextElement.nodeValue : "";
            throw { message: reason, errorXmlText: text, srcText: srcText };
        }

        // Chrome reports errors by injecting a header with an error message.
        // The error may be localized, so instead we simply check for a header as the
        // top element or first child of the document.
        var xhtmlNS = "http://www.w3.org/1999/xhtml";
        if (wrappedElement.localName === "h3" && wrappedElement.nsURI == xhtmlNS ||
            getSingleElementByTagNameNS(element, xhtmlNS, "h3")) {
            throw { message: xmlInnerText(element), errorXmlText: text, srcText: "" };
        }
    };

    var xmlAddNamespaceAttribute = function (domNode, name, attributeNamespace) {
        /// <summary>Adds a namespace declaration attribute to the specified element node.</summary>
        /// <param name="domNode">DOM node for the element.</param>
        /// <param name="domNode" type="String">Attribute name, eg: xmlns, xmlns:foo, xmlns:bar.</param>
        /// <param name="attributeNamespace" type="String">Namespace to associate.</param>

        var doc = domNode.ownerDocument;
        var attribute;
        if (doc.createAttributeNS) {
            attribute = doc.createAttributeNS(xmlnsNS, name);
        } else {
            attribute = doc.createNode(2, name, xmlnsNS);
        }

        attribute.nodeValue = attributeNamespace;
        domNode.setAttributeNode(attribute);
    };

    var xmlAppendPreserving = function (domNode, text) {
        /// <summary>Appends a text node into the specified DOM element node.</summary>
        /// <param name="domNode">DOM node for the element.</param>
        /// <param name="text" type="String" mayBeNull="false">Text to append as a child of element.</param>

        if (hasLeadingOrTrailingWhitespace(text)) {
            var attr = xmlNewDomAttribute(domNode, "space", xmlNS, "xml");
            attr.value = "preserve";
        }

        var textNode = domNode.ownerDocument.createTextNode(text);
        domNode.appendChild(textNode);
    };

    var xmlAttributes = function (element, onAttributeCallback) {
        /// <summary>Iterates through the XML element's attributes and invokes the callback function for each one.</summary>
        /// <param name="element">Wrapped element to iterate over.</param>
        /// <param name="onAttributeCallback" type="Function">Callback function to invoke with wrapped attribute nodes.</param>

        var attribute;
        var domNode = element.domNode;
        var i, len;
        for (i = 0, len = domNode.attributes.length; i < len; i++) {
            attribute = domNode.attributes.item(i);
            onAttributeCallback(xml_wrapNode(attribute));
        }
    };

    var xmlAttribute = function (element, localName, nsURI) {
        /// <summary>Returns the value of an xml element attribute.</summary>
        return xml_attribute(element.domNode, localName, nsURI);
    };

    var xmlAttributeNode = function (domNode, localName, nsURI) {
        /// <summary>Gets an attribute node from an element.</summary>
        /// <param name="domNode">DOM node for the parent element.</param>
        /// <param name="localName" type="String">Local name for the attribute.</param>
        /// <param name="nsURI" type="String">Namespace URI for the attribute.</param>
        /// <returns>The attribute node, null if not found.</returns>

        var attributes = domNode.attributes;
        if (attributes.getNamedItemNS) {
            return attributes.getNamedItemNS(nsURI, localName);
        }

        return attributes.getQualifiedItem(localName, nsURI);
    };

    var xmlChildElements = function (element, onElementCallback) {
        /// <summary>Iterates through the XML element's child elements and invokes the callback function for each one.</summary>
        /// <param name="element">Wrapped element to iterate over.</param>
        /// <param name="onElementCallback" type="Function">Callback function to invoke with wrapped element nodes.</param>

        var child = element.domNode.firstChild;
        var childBaseURI;
        while (child !== null) {
            if (child.nodeType === 1) {
                childBaseURI = normalizeURI(xml_baseURI(child), element.baseURI);
                onElementCallback(xml_wrapNode(child, childBaseURI));
            }

            child = child.nextSibling;
        }
    };

    var xmlFirstElement = function (element) {
        /// <summary>Returns the first child element (wrapped) of the specified element.</summary>
        /// <param name="element">Element to get first child for.</param>
        /// <returns>This first child element (wrapped), null if there is none.</returns>

        var child = element.domNode.firstChild;
        var childBaseURI;
        while (child !== null) {
            if (child.nodeType === 1) {
                childBaseURI = normalizeURI(xml_baseURI(child), element.baseURI);
                return xml_wrapNode(child, childBaseURI);
            }

            child = child.nextSibling;
        }

        return null;
    };

    var xmlInnerText = function (domNode) {
        /// <summary>Returns the text value of an XML element.</summary>
        /// <param name="domNode">DOM element</param>
        /// <returns type="String">
        /// The text content of the node or the concatenated text
        /// representing the node and its descendants; never null.
        /// </returns>

        var result = domNode.text;
        if (result !== undefined) {
            return result;
        }

        result = "";

        var cursor = domNode.firstChild;
        if (cursor) {
            do {
                // Process the node.
                if (cursor.nodeType === 3 || cursor.nodeType === 4) {
                    result += cursor.nodeValue;
                }

                // Advance the node.
                var next = cursor.firstChild;
                if (!next) {
                    while (cursor !== domNode) {
                        next = cursor.nextSibling;
                        if (next) {
                            cursor = next;
                            break;
                        } else {
                            cursor = cursor.parentNode;
                        }
                    }
                } else {
                    cursor = next;
                }
            } while (cursor !== domNode);
        }

        return result;
    };

    var xmlLocalName = function (node) {
        /// <summary>Returns the localName of a XML node.</summary>
        /// <param name="node">DOM node to get value for.</param>
        /// <returns type="String">localName of node.</returns>

        if (node.localName) {
            return node.localName;
        }

        return node.baseName;
    };

    var xmlNewDocument = function (name, nsURI) {
        /// <summary>Creates a new XML document.</summary>
        /// <param name="name" type="String">Local name of the root element.</param>
        /// <param name="nsURI" type="String">Namespace of the root element.</param>
        /// <returns>The wrapped root element of the document.</returns>

        var dom;

        if (window.ActiveXObject) {
            dom = createDomParser();
            dom.documentElement = dom.createNode(1, name, nsURI);
        }
        else if (window.document.implementation && window.document.implementation.createDocument) {
            dom = window.document.implementation.createDocument(nsURI, name, null);
        }

        return xml_wrapNode(dom.documentElement);
    };

    var xmlNewDomAttribute = function (domNode, localName, nsURI, nsPrefix) {
        /// <summary>Creates a new unwrapped DOM attribute.</summary>
        /// <param name="domNode">Parent element to which new node should be added.</param>
        /// <param name="localName" type="String">Local name for attribute.</param>
        /// <param name="nsURI" type="String">Namespace URI for the attribute.</param>
        /// <param name="nsPrefix" type="String">Namespace prefix for attribute to be created.</param>
        /// <returns>The created DOM attribute.</returns>

        var doc = domNode.ownerDocument;
        var attribute;
        localName = (nsPrefix) ? (nsPrefix + ":" + localName) : localName;
        if (doc.createAttributeNS) {
            attribute = doc.createAttributeNS(nsURI, localName);
            domNode.setAttributeNodeNS(attribute);
        } else {
            attribute = doc.createNode(2, localName, nsURI || undefined);
            domNode.setAttributeNode(attribute);
        }

        return attribute;
    };

    var xmlNewDomElement = function (domNode, localName, nsURI, nsPrefix) {
        /// <summary>Creates a new unwrapped DOM element.</summary>
        /// <param name="domNode">Parent element to which new node should be added.</param>
        /// <param name="localName" type="String">Local name for element.</param>
        /// <param name="nsURI" type="String">Namespace URI for the element.</param>
        /// <param name="nsPrefix" type="String">Namespace prefix for attribute to be created.</param>
        /// <returns>The created DOM element.</returns>

        var doc = domNode.ownerDocument;
        var element;
        localName = (nsPrefix) ? (nsPrefix + ":" + localName) : localName;
        if (doc.createElementNS) {
            element = doc.createElementNS(nsURI, localName);
        } else {
            element = doc.createNode(1, localName, nsURI || undefined);
        }

        domNode.appendChild(element);
        return element;
    };

    var xmlNewElement = function (parent, name, nsURI, value) {
        /// <summary>Creates a new wrapped element.</summary>
        /// <param name="parent">Wrapped parent element to which new node should be added.</param>
        /// <param name="name" type="String">Local name for element.</param>
        /// <param name="nsURI" type="String">Namespace URI for the element.</param>
        /// <param name="value" type="String" mayBeNull="true">Text value to append in element, if applicable.</param>
        /// <returns>The created wrapped element.</returns>

        var dom = parent.domNode.ownerDocument;

        var element;
        if (dom.createElementNS) {
            element = dom.createElementNS(nsURI, name);
        } else {
            element = dom.createNode(1, name, nsURI || undefined);
        }

        if (value) {
            xmlAppendPreserving(element, value);
        }

        parent.domNode.appendChild(element);
        return xml_wrapNode(element);
    };

    var xmlNewAttribute = function (element, name, nsURI, value) {
        /// <summary>Creates a new wrapped attribute.</summary>
        /// <param name="element">Wrapped parent element to which new node should be added.</param>
        /// <param name="name" type="String">Local name for element.</param>
        /// <param name="nsURI" type="String">Namespace URI for the element.</param>
        /// <param name="value" type="String">Node value for the attribute.</param>
        /// <returns>The created wrapped attribute.</returns>

        var dom = element.domNode.ownerDocument;

        var attribute;
        if (dom.createAttributeNS) {
            attribute = dom.createAttributeNS(nsURI, name);
            attribute.value = value;
            element.domNode.setAttributeNodeNS(attribute);
        } else {
            attribute = dom.createNode(2, name, nsURI || undefined);
            attribute.value = value;
            element.domNode.setAttributeNode(attribute);
        }

        return xml_wrapNode(attribute);
    };

    var xmlQualifyXmlTagName = function (name, prefix) {
        /// <summary>Qualifies an XML tag name with the specified prefix.</summary>
        /// <param name="name" type="String">Element name</param>
        /// <param name="prefix" type="String">Prefix to use, possibly null.</param>
        /// <returns type="String">The qualified name.</returns>
        /// <remarks>This operates at the lexical level - there is no awareness of in-scope prefixes.</remarks>

        if (prefix) {
            return prefix + ":" + name;
        }

        return name;
    };

    var xmlParse = function (text, baseURI) {
        /// <summary>Returns an XML document from the specified text.</summary>
        /// <param name="text" type="String">Document text.</param>
        /// <param name="baseURI" type="String">Base URI for the document.</param>
        /// <returns>The wrapped root element of the document.</returns>

        var root = xml_parse(text);
        var rootBaseURI = normalizeURI(xml_baseURI(root), baseURI);
        return xml_wrapNode(root, rootBaseURI);
    };

    var xmlSerialize = function (root) {
        /// <summary>
        /// Returns the text representation of the document to which the specified node belongs.
        /// </summary>
        /// <param name="root">Wrapped element in the document to serialize.</param>
        /// <returns type="String">Serialized document.</returns>

        var dom = root.domNode.ownerDocument;
        return xmlSerializeNode(dom);
    };

    var xmlSerializeChildren = function (domNode) {
        /// <summary>Returns the XML representation of the all the descendants of the node.</summary>
        /// <param name="domNode" optional="false" mayBeNull="false">Node to serialize.</param>
        /// <returns type="String">The XML representation of all the descendants of the node.</returns>

        var children = domNode.childNodes;
        var i, len = children.length;
        if (len === 0) {
            return "";
        }

        var fragment = domNode.ownerDocument.createDocumentFragment();
        for (i = 0; i < len; i++) {
            fragment.appendChild(children[i].cloneNode(true));
        }

        return xmlSerializeNode(fragment);
    };

    var xmlSerializeNode = function (domNode) {
        /// <summary>Returns the XML representation of the node and all its descendants.</summary>
        /// <param name="domNode" optional="false" mayBeNull="false">Node to serialize.</param>
        /// <returns type="String">The XML representation of the node and all its descendants.</returns>

        var xml = domNode.xml;
        if (xml !== undefined) {
            return xml;
        }

        if (window.XMLSerializer) {
            var serializer = new window.XMLSerializer();
            return serializer.serializeToString(domNode);
        }

        throw { message: "XML serialization unsupported" };
    };

    var xml_attribute = function (domNode, localName, nsURI) {
        /// <summary>Gets the value of a DOM attribute.</summary>
        /// <param name="domNode">DOM element to get attribute for.</param>
        /// <param name="localName" type="String">Name of the attribute to get.</param>
        /// <param name="nsURI" type="String">Namespace of the attribute to get.</param>
        /// <returns type="String">Value of the attribute if found; null otherwise.</returns>

        if (domNode.getAttributeNS) {
            return domNode.getAttributeNS(nsURI || null, localName);
        }

        // The method is not supported so we work with the attributes collection. 
        var node = domNode.attributes.getQualifiedItem(localName, nsURI);
        if (node) {
            return node.value;
        }

        return null;
    };

    var xml_baseURI = function (domNode) {
        /// <summary>Gets the value of the xml:base attribute on the specified element.</summary>
        /// <param name="domNode">Element to get attribute value from.</param>
        /// <returns type="String">Value of the xml:base attribute if found; null otherwise.</returns>

        return xml_attribute(domNode, "base", xmlNS);
    };

    var xml_parse = function (text) {
        /// <summary>Returns an XML document from the specified text.</summary>
        /// <param name="text" type="String">Document text.</param>
        /// <returns>The root element of the document.</returns>

        var dom = createDomParser();
        if (dom.parseFromString) {
            dom = dom.parseFromString(text, "text/xml");
            checkParserErrorElement(dom.documentElement, text);
        } else {
            dom.loadXML(text);
            if (dom.parseError.errorCode !== 0) {
                throw { message: dom.parseError.reason, errorXmlText: text, srcText: dom.parseError.srcText };
            }
        }

        return dom.documentElement;
    };

    var xml_wrapNode = function (domNode, baseURI) {
        /// <summary>Creates a wrapped DOM node.</summary>
        /// <param name="domNode">DOM node to wrap.</param>
        /// <param name="baseURI" type="String">Base URI in scope for the node.</param>
        /// <returns type="Object">
        /// An object with the wrapped domNode, information about its in-scope URI, and simple 
        /// access to name and namespace.
        /// </returns>

        var nsURI = domNode.namespaceURI;
        var nodeName = domNode.nodeName;

        // MSXML 3.0 doesn't return a namespaceURI for xmlns attributes.
        if (!nsURI) {
            if (domNode.nodeType === 2 && (nodeName === "xmlns" || nodeName.indexOf("xmlns:", 0) === 0)) {
                nsURI = xmlnsNS;
            } else {
                nsURI = null;
            }
        }

        return {
            baseURI: baseURI,
            domNode: domNode,
            localName: xmlLocalName(domNode),
            nsURI: nsURI
        };
    };

    var readODataXmlDocument = function (xmlRoot) {
        /// <summary>Reads an OData link(s) producing an object model in return.</summary>
        /// <param name="xmlRoot">Top-level element to read.</param>
        /// <returns type="Object">The object model representing the specified element.</returns>

        if (xmlRoot.nsURI === odataXmlNs) {
            switch (xmlRoot.localName) {
                case "links":
                    return readLinks(xmlRoot);
                case "uri":
                    return readUri(xmlRoot);
            }
        }
        return undefined;
    };

    var readLinks = function (linksElement) {
        /// <summary>Deserializes an OData XML links element.</summary>
        /// <param name="linksElement">XML links element.</param>
        /// <returns type="Object">A new object representing the links collection.</returns>

        var uris = [];

        xmlChildElements(linksElement, function (child) {
            if (child.localName === "uri" && child.nsURI === odataXmlNs) {
                var uri = readUri(child);
                uris.push(uri);
            }
        });

        return { results: uris };
    };

    var readUri = function (uriElement) {
        /// <summary>Deserializes an OData XML uri element.</summary>
        /// <param name="uriElement">XML uri element.</param>
        /// <returns type="Object">A new object representing the uri.</returns>

        return { uri: xmlInnerText(uriElement.domNode) };
    };

    var writeODataXmlDocument = function (data) {
        /// <summary>Writes the specified data into an OData XML document.</summary>
        /// <param name="data">Data to write.</param>
        /// <returns>The root of the DOM tree built.</returns>

        if (payloadTypeOf(data) === PAYLOADTYPE_COMPLEXTYPE &&
           !data.__metadata && data.hasOwnProperty("uri")) {
            return writeUri(data);
        }

        // Allow for undefined to be returned.
    };

    var writeUri = function (data) {
        /// <summary>Writes the specified uri data into an OData XML uri document.</summary>
        /// <param name="data">Uri data to write in intermediate format.</param>
        /// <returns>The feed element of the DOM tree built.</returns>

        var uri = writeODataXmlNode(null, "uri", odataXmlNs);
        if (data.uri) {
            xmlAppendPreserving(uri.domNode, data.uri);
        }

        return uri;
    };

    var writeODataXmlNode = function (parent, name, nsURI) {
        /// <summary>Writes the root of an OData XML document, possibly under an existing element.</summary>
        /// <param name="parent" mayBeNull="true">Element under which to create a new element.</param>
        /// <param name="name">Name for the new element.</param>
        /// <param name="nsURI" type="String">Namespace URI for the element.</param>
        /// <returns>The created element.</returns>

        if (parent) {
            return xmlNewElement(parent, name, nsURI);
        }
        return xmlNewDocument(name, nsURI);
    };

    var xmlParser = function (handler, text) {
        /// <summary>Parses an OData XML document.</summary>
        /// <param name="handler">This handler.</param>
        /// <param name="text" type="String">Document text.</param>
        /// <returns>An object representation of the document; undefined if not applicable.</returns>

        if (text) {
            var root = xmlParse(text);
            if (root) {
                return readODataXmlDocument(root);
            }
        }

        // Allow for undefined to be returned.
    };

    var xmlSerializer = function (handler, data, context) {
        /// <summary>Serializes an OData XML object into a document.</summary>
        /// <param name="handler">This handler.</param>
        /// <param name="data" type="Object">Representation of feed or entry.</param>
        /// <param name="context" type="Object">Object with parsing context.</param>
        /// <returns>A text representation of the data object; undefined if not applicable.</returns>

        var cType = context.contentType = context.contentType || contentType(xmlMediaType);
        var result = undefined;
        if (cType && cType.mediaType === xmlMediaType) {
            var xmlDoc = writeODataXmlDocument(data);
            if (xmlDoc) {
                result = xmlSerialize(xmlDoc);
            }
        }
        return result;
    };

    odata.xmlHandler = handler(xmlParser, xmlSerializer, xmlMediaType, MAX_DATA_SERVICE_VERSION);



    var atomAcceptTypes = ["application/atom+xml", "application/atomsvc+xml", "application/xml"];
    var atomMediaType = atomAcceptTypes[0];

    var inlineTag = xmlQualifyXmlTagName("inline", "m");
    var propertiesTag = xmlQualifyXmlTagName("properties", "m");
    var propertyTypeAttribute = xmlQualifyXmlTagName("type", "m");
    var propertyNullAttribute = xmlQualifyXmlTagName("null", "m");

    // These are the namespaces that are not considered ATOM extension namespaces.
    var nonExtensionNamepaces = [atomXmlNs, appXmlNs, xmlNS, xmlnsNS];

    // These are entity property mapping paths that have well-known paths.
    var knownCustomizationPaths = {
        SyndicationAuthorEmail: "author/email",
        SyndicationAuthorName: "author/name",
        SyndicationAuthorUri: "author/uri",
        SyndicationContributorEmail: "contributor/email",
        SyndicationContributorName: "contributor/name",
        SyndicationContributorUri: "contributor/uri",
        SyndicationPublished: "published",
        SyndicationRights: "rights",
        SyndicationSummary: "summary",
        SyndicationTitle: "title",
        SyndicationUpdated: "updated"
    };

    var isExtensionNs = function (nsURI) {
        /// <summary>Checks whether the specified namespace is an extension namespace to ATOM.</summary>
        /// <param type="String" name="nsURI">Namespace to check.</param>
        /// <returns type="Boolean">true if nsURI is an extension namespace to ATOM; false otherwise.</returns>

        return !(contains(nonExtensionNamepaces, nsURI));
    };

    var propertyTypeDefaultConverter = function (propertyValue) {
        /// <summary>Does a no-op conversion on the specified value.</summary>
        /// <param name="propertyValue">Value to convert.</param>
        /// <returns>Original property value.</returns>

        return propertyValue;
    };

    var parseBool = function (propertyValue) {
        /// <summary>Parses a string into a boolean value.</summary>
        /// <param name="propertyValue">Value to parse.</param>
        /// <returns type="Boolean">true if the property value is 'true'; false otherwise.</returns>

        return propertyValue === "true";
    };

    // The captured indices for this expression are:
    // 0     - complete input
    // 1,2,3 - year with optional minus sign, month, day
    // 4,5,6 - hours, minutes, seconds
    // 7     - optional milliseconds
    // 8     - everything else (presumably offset information)
    var parseDateTimeRE = /^(-?\d{4,})-(\d{2})-(\d{2})T(\d{2}):(\d{2}):(\d{2})(?:\.(\d+))?(.*)$/;

    var parseDateTimeMaybeOffset = function (value, withOffset) {
        /// <summary>Parses a string into a DateTime value.</summary>
        /// <param name="value" type="String">Value to parse.</param>
        /// <param name="withOffset" type="Boolean">Whether offset is expected.</param>
        /// <returns type="Date">The parsed value.</returns>

        // We cannot parse this in cases of failure to match or if offset information is specified.
        var parts = parseDateTimeRE.exec(value);
        var offset = (parts) ? getCanonicalTimezone(parts[8]) : null;

        if (!parts || (!withOffset && offset !== "Z")) {
            throw { message: "Invalid date/time value" };
        }

        // Pre-parse years, account for year '0' being invalid in dateTime.
        var year = parseInt10(parts[1]);
        if (year <= 0) {
            year++;
        }

        // Pre-parse optional milliseconds, fill in default. Fail if value is too precise.
        var ms = parts[7];
        var ns = 0;
        if (!ms) {
            ms = 0;
        } else {
            if (ms.length > 7) {
                throw { message: "Cannot parse date/time value to given precision." };
            }

            ns = formatNumberWidth(ms.substring(3), 4, true);
            ms = formatNumberWidth(ms.substring(0, 3), 3, true);
            
            ms = parseInt10(ms);
            ns = parseInt10(ns);
        }

        // Pre-parse other time components and offset them if necessary.
        var hours = parseInt10(parts[4]);
        var minutes = parseInt10(parts[5]);
        var seconds = parseInt10(parts[6]);
        if (offset !== "Z") {
            // The offset is reversed to get back the UTC date, which is
            // what the API will eventually have.
            var timezone = parseTimezone(offset);
            var direction = -(timezone.d);
            hours += timezone.h * direction;
            minutes += timezone.m * direction;
        }

        // Set the date and time separately with setFullYear, so years 0-99 aren't biased like in Date.UTC.
        var result = new Date();
        result.setUTCFullYear(
            year,                       // Year.
            parseInt10(parts[2]) - 1,   // Month (zero-based for Date.UTC and setFullYear).
            parseInt10(parts[3])        // Date.
            );
        result.setUTCHours(hours, minutes, seconds, ms);

        if (isNaN(result.valueOf())) {
            throw { message: "Invalid date/time value" };
        }

        if (withOffset) {
            result.__edmType = "Edm.DateTimeOffset";
            result.__offset = offset;
        }

        if (ns) {
            result.__ns = ns;
        }

        return result;
    };

    var parseDateTime = function (propertyValue) {
        /// <summary>Parses a string into a DateTime value.</summary>
        /// <param name="propertyValue" type="String">Value to parse.</param>
        /// <returns type="Date">The parsed value.</returns>

        return parseDateTimeMaybeOffset(propertyValue, false);
    };

    var parseDateTimeOffset = function (propertyValue) {
        /// <summary>Parses a string into a DateTimeOffset value.</summary>
        /// <param name="propertyValue" type="String">Value to parse.</param>
        /// <returns type="Date">The parsed value.</returns>
        /// <remarks>
        /// The resulting object is annotated with an __edmType property and
        /// an __offset property reflecting the original intended offset of
        /// the value. The time is adjusted for UTC time, as the current
        /// timezone-aware Date APIs will only work with the local timezone.
        /// </remarks>

        return parseDateTimeMaybeOffset(propertyValue, true);
    };

    // Property type converters are parsers that convert strings into typed values.
    var propertyTypeConverters = {
        "Edm.Boolean": parseBool,
        "Edm.Binary": propertyTypeDefaultConverter,
        "Edm.DateTime": parseDateTime,
        "Edm.DateTimeOffset": parseDateTimeOffset,
        "Edm.Time": parseDuration,
        "Edm.Decimal": propertyTypeDefaultConverter,
        "Edm.Guid": propertyTypeDefaultConverter,
        "Edm.String": propertyTypeDefaultConverter,
        "Edm.Byte": parseInt10,
        "Edm.Double": parseFloat,
        "Edm.Single": parseFloat,
        "Edm.Int16": parseInt10,
        "Edm.Int32": parseInt10,
        "Edm.Int64": propertyTypeDefaultConverter,
        "Edm.SByte": parseInt10
    };

    var formatToString = function (value) {
        /// <summary>Formats a value by invoking .toString() on it.</summary>
        /// <param name="value" mayBeNull="false">Value to format.</param>
        /// <returns type="String">Formatted text.</returns>

        return value.toString();
    };

    // Property type formatters are serializers that convert typed values into strings.
    var propertyTypeFormatters = {
        "Edm.Binary": formatToString,
        "Edm.Boolean": formatToString,
        "Edm.Byte": formatToString,
        "Edm.DateTime": formatDateTimeOffset,
        "Edm.DateTimeOffset": formatDateTimeOffset,
        "Edm.Decimal": formatToString,
        "Edm.Double": formatToString,
        "Edm.Guid": formatToString,
        "Edm.Int16": formatToString,
        "Edm.Int32": formatToString,
        "Edm.Int64": formatToString,
        "Edm.SByte": formatToString,
        "Edm.Single": formatToString,
        "Edm.String": formatToString,
        "Edm.Time": formatDuration
    };

    var isPrimitiveType = function (typeName) {
        /// <summary>Checks whether the specified type name is a primitive type.</summary>
        /// <param name="typeName" type="String" mayBeNull="true">Name of type to check.</param>
        /// <returns type="Boolean">
        /// true if the type is the name of a primitive type; false otherwise.
        /// </returns>

        return typeName && (propertyTypeConverters[typeName] !== undefined);
    };

    var convertFromAtomPropertyText = function (value, targetType) {
        /// <summary>Converts a text value to the specified target type.</summary>
        /// <param name="value" type="String" mayBeNull="true">Text value to convert.</param>
        /// <param name="targetType" type="String" mayBeNull="true">Name of type to convert from.</param>
        /// <returns>The converted value.</returns>

        if (value !== null && targetType) {
            var converter = propertyTypeConverters[targetType];
            if (converter) {
                value = converter(value);
            }
        }

        return value;
    };

    var convertToAtomPropertyText = function (value, targetType) {
        /// <summary>Converts a typed value from the specified target type into a text value.</summary>
        /// <param name="value">Typed value to convert.</param>
        /// <param name="targetType" type="String" mayBeNull="true">Name of type to convert to.<param>
        /// <returns type="String">The converted value as text.</returns>

        if (value !== null && targetType) {
            if (isDate(value)) {
                targetType = (isDateTimeOffset(value)) ? "Edm.DateTimeOffset" : "Edm.DateTime";
            }

            var converter = propertyTypeFormatters[targetType];
            if (converter) {
                value = converter(value);
            }
        }

        return value;
    };

    var readAtomDocument = function (atomElement, metadata) {
        /// <summary>Reads an ATOM entry, feed or service document, producing an object model in return.</summary>
        /// <param name="atomElement">Top-level element to read.</param>
        /// <param name="metadata">Metadata that describes the conceptual schema.</param>
        /// <returns type="Object">The object model representing the specified element, undefined if the top-level element is not part of the ATOM specification.</returns>

        // Handle feed and entry elements.
        if (atomElement.nsURI === atomXmlNs) {
            switch (atomElement.localName) {
                case "feed":
                    return readAtomFeed(atomElement, metadata);
                case "entry":
                    return readAtomEntry(atomElement, metadata);
            }
        }

        // Handle service documents. 
        if (atomElement.nsURI === appXmlNs && atomElement.localName === "service") {
            return readAtomServiceDocument(atomElement);
        }

        // Allow undefined to be returned.
    };

    var readAtomFeed = function (atomFeed, metadata) {
        /// <summary>Deserializes an ATOM feed element.</summary>
        /// <param name="atomFeed">ATOM feed element.</param>
        /// <param name="metadata">Metadata that describes the conceptual schema.</param>
        /// <returns type="Object">A new object representing the feed.</returns>
        var feedMetadata = {};
        var feed = {
            results: [],
            __metadata: feedMetadata
        };

        feedMetadata.feed_extensions = readAtomExtensionAttributes(atomFeed);

        xmlChildElements(atomFeed, function (feedChild) {
            switch (feedChild.nsURI) {
                case atomXmlNs:
                    switch (feedChild.localName) {
                        case "id":
                            feedMetadata.uri = normalizeURI(xmlInnerText(feedChild.domNode), feedChild.baseURI);
                            feedMetadata.uri_extensions = readAtomExtensionAttributes(feedChild);
                            break;
                        case "title":
                            feedMetadata.title = xmlInnerText(feedChild.domNode);
                            feedMetadata.title_extensions = readAtomExtensionAttributes(feedChild);
                            break;
                        case "entry":
                            var entry = readAtomEntry(feedChild, metadata);
                            feed.results.push(entry);
                            break;
                        case "link":
                            readAtomFeedLink(feedChild, feed);
                            break;
                    }
                    return;
                case odataMetaXmlNs:
                    if (feedChild.localName === "count") {
                        feed.__count = parseInt10(xmlInnerText(feedChild.domNode));
                        return;
                    }
                    break;
            }

            var extension = readAtomExtensionElement(feedChild);
            feedMetadata.feed_extensions.push(extension);
        });

        return feed;
    };

    var readAtomFeedLink = function (feedLinkElement, feed) {
        /// <summary>Reads an ATOM link element for a feed.</summary>
        /// <param name="feedLinkElement">Link element to read.</param>
        /// <param name="feed">Feed object to be annotated with information.</param>

        var link = readAtomLink(feedLinkElement);
        var feedMetadata = feed.__metadata;
        switch (link.rel) {
            case "next":
                feed.__next = link.href;
                feedMetadata.next_extensions = link.extensions;
                break;
            case "self":
                feedMetadata.self = link.href;
                feedMetadata.self_extensions = link.extensions;
                break;
        }
    };

    var readAtomLink = function (linkElement) {
        /// <summary>Reads an ATOM link element.</summary>
        /// <param name="linkElement">Link element to read.</param>
        /// <returns type="Object">A link element representation.</returns>

        var link = { extensions: [] };
        var linkExtension;

        xmlAttributes(linkElement, function (attribute) {
            if (!attribute.nsURI) {
                switch (attribute.localName) {
                    case "href":
                        link.href = normalizeURI(attribute.domNode.nodeValue, linkElement.baseURI);
                        return;
                    case "type":
                    case "rel":
                        link[attribute.localName] = attribute.domNode.nodeValue;
                        return;
                }
            }

            if (isExtensionNs(attribute.nsURI)) {
                linkExtension = readAtomExtensionAttribute(attribute);
                link.extensions.push(linkExtension);
            }
        });

        if (!link.href) {
            throw { error: "href attribute missing on link element", element: linkElement };
        }

        return link;
    };

    var readAtomExtensionElement = function (atomExtension) {
        /// <summary>Reads an ATOM extension element (an element not in the ATOM namespaces).</summary>
        /// <param name="atomExtension">ATOM extension element.</param>
        /// <returns type="Object">An extension element representation.</returns>

        var extension = {
            name: atomExtension.localName,
            namespaceURI: atomExtension.nsURI,
            attributes: readAtomExtensionAttributes(atomExtension),
            children: []
        };

        xmlChildElements(atomExtension, function (child) {
            var childExtension = readAtomExtensionElement(child);
            extension.children.push(childExtension);
        });

        if (extension.children.length === 0) {
            var text = xmlInnerText(atomExtension.domNode);
            if (text) {
                extension.value = text;
            }
        }

        return extension;
    };

    var readAtomExtensionAttributes = function (xmlElement) {
        /// <summary>Reads ATOM extension attributes from an element.</summary>
        /// <param name="xmlElement">ATOM element with zero or more extension attributes.</param>
        /// <returns type="Array">An array of extension attribute representations.</returns>

        var extensions = [];
        xmlAttributes(xmlElement, function (attribute) {
            if (isExtensionNs(attribute.nsURI)) {
                var extension = readAtomExtensionAttribute(attribute);
                extensions.push(extension);
            }
        });

        return extensions;
    };

    var readAtomExtensionAttribute = function (attribute) {
        /// <summary>Reads an ATOM extension attribute into an object.</summary>
        /// <param name="attribute">ATOM extension attribute.</param>
        /// <returns type="Object">An object with the attribute information.</returns>

        return {
            name: attribute.localName,
            namespaceURI: attribute.nsURI,
            value: attribute.domNode.nodeValue
        };
    };

    var getObjectValueByPath = function (path, item) {
        /// <summary>Gets a slashed path value from the specified item.</summary>
        /// <param name="path" type="String">Property path to read ('/'-separated).</param>
        /// <param name="item" type="Object">Object to get value from.</param>
        /// <returns>The property value, possibly undefined if any path segment is missing.</returns>

        // Fast path.
        if (path.indexOf('/') === -1) {
            return item[path];
        } else {
            var parts = path.split('/');
            var i, len;
            for (i = 0, len = parts.length; i < len; i++) {
                // Avoid traversing a null object.
                if (item === null) {
                    return undefined;
                }

                item = item[parts[i]];
                if (item === undefined) {
                    return item;
                }
            }

            return item;
        }
    };

    var setObjectValueByPath = function (path, target, value, propertyType) {
        /// <summary>Sets a slashed path value on the specified target.</summary>
        /// <param name="path" type="String">Property path to set ('/'-separated).</param>
        /// <param name="target" type="Object">Object to set value on.</param>
        /// <param name="value">Value to set.</param>
        /// <param name="propertyType" type="String" optional="true">Property type to set in metadata.</param>

        // Fast path.
        var propertyName;
        if (path.indexOf('/') === -1) {
            target[path] = value;
            propertyName = path;
        } else {
            var parts = path.split('/');
            var i, len;
            for (i = 0, len = (parts.length - 1); i < len; i++) {
                // We construct each step of the way if the property is missing;
                // if it's already initialized to null, we stop further processing.
                var next = target[parts[i]];
                if (next === undefined) {
                    next = {};
                    target[parts[i]] = next;
                } else if (next === null) {
                    return;
                }

                target = next;
            }

            propertyName = parts[i];
            target[propertyName] = value;
        }

        if (propertyType) {
            var metadata = target.__metadata = target.__metadata || {};
            var properties = metadata.properties = metadata.properties || {};
            var property = properties[propertyName] = properties[propertyName] || {};
            property.type = propertyType;
        }
    };

    var expandCustomizationPath = function (path) {
        /// <summary>Expands a customization path if it's well-known.</summary>
        /// <param name="path" type="String">Path to expand.</param>
        /// <returns type="String">Expanded path or 'path' otherwise.</returns>

        return knownCustomizationPaths[path] || path;
    };

    var getXmlPathValue = function (ns, xmlPath, element, readAsXml) {
        /// <summary>Returns the text value of the element or attribute at xmlPath.</summary>
        /// <param name="ns" type="String">Namespace for elements to match.</param>
        /// <param name="xmlPath" type="String">
        /// '/'-separated list of element names, possibly ending with a '@'-prefixed attribute name.
        /// </param>
        /// <param name="element">Root element.</param>
        /// <param name="readAsXml">Whether the value should be read as XHTML.</param>
        /// <returns type="String">The text value of the node found, undefined if none.</returns>

        var parts = xmlPath.split('/');
        var i, len;
        for (i = 0, len = parts.length; i < len; i++) {
            if (parts[i].charAt(0) === "@") {
                return xml_attribute(element, parts[i].substring(1), ns);
            } else {
                element = getSingleElementByTagNameNS(element, ns, parts[i]);
                if (!element) {
                    return undefined;
                }
            }
        }

        if (readAsXml) {
            // Treat per XHTML in http://tools.ietf.org/html/rfc4287#section-3.1.1, including the DIV
            // in the content.
            return xmlSerializeChildren(element);
        } else {
            return xmlInnerText(element);
        }
    };

    var setXmlPathValue = function (ns, nsPrefix, xmlPath, element, writeAsKind, value) {
        /// <summary>Sets the text value of the element or attribute at xmlPath.</summary>
        /// <param name="ns" type="String">Namespace for elements to match.</param>
        /// <param name="nsPrefix" type="String">Namespace prefix for elements to be created.</param>
        /// <param name="xmlPath" type="String">
        /// '/'-separated list of element names, possibly ending with a '@'-prefixed attribute name.
        /// </param>
        /// <param name="element">Root element.</param>
        /// <param name="writeAsKind" type="String">Whether the value should be written as text, html or xhtml.</param>
        /// <param name="value" type="String">The text value of the node to write.</param>

        var target = element;
        var parts = xmlPath.split('/');
        var i, len;
        for (i = 0, len = parts.length; i < len; i++) {
            var next;
            if (parts[i].charAt(0) === "@") {
                next = xmlAttributeNode(target, parts[i].substring(1), ns);
                if (!next) {
                    next = xmlNewDomAttribute(target, parts[i].substring(1), ns, nsPrefix);
                }
            } else {
                next = getSingleElementByTagNameNS(target, ns, parts[i]);
                if (!next) {
                    next = xmlNewDomElement(target, parts[i], ns, nsPrefix);
                }
            }

            target = next;
        }

        // Target can be an attribute (2) or an element (1).
        if (target.nodeType === 2) {
            target.value = value;
        } else {
            // The element should be empty at this point; we won't erase its contents.
            if (writeAsKind) {
                target.setAttribute("type", writeAsKind);
            }

            if (writeAsKind === "xhtml") {
                appendAsXml(target, value);
            } else {
                xmlAppendPreserving(target, value);
            }
        }
    };

    var isElementEmpty = function (element) {
        /// <summary>Checks whether the specified XML element is empty.</summary>
        /// <param name="element">DOM element node to check.</param>
        /// <returns type="Boolean">true if the element is empty; false otherwise.</returns>
        /// <remarks>
        /// The element is considered empty if it doesn't have any attributes other than
        /// namespace declarations or type declarations and if it has no child nodes.
        /// </remarks>

        // If there are any child elements or text nodes, it's not empty.
        if (element.childNodes.length) {
            return false;
        }

        // If there are no attributes, then we know it's already empty.
        var attributes = element.attributes;
        var len = attributes.length;
        if (len === 0) {
            return true;
        }

        // Otherwise, we have to search for attributes that aren't namespace declarations.
        for (var i = 0; i < len; i++) {
            var attributeName = attributes[i].nodeName;
            if (attributeName !== "xmlns" && attributeName.indexOf("xmlns:") !== 0 && attributeName !== "m:type") {
                return false;
            }
        }

        return true;
    };
    var removeXmlProperty = function (entryElement, propertyPath) {
        /// <summary>Removes a property from an entry.</summary>
        /// <param name="entryElement">XML element for an ATOM OData entry.</param>
        /// <param name="propertyPath" type="String">Property path to an element.</param>

        // Get the 'properties' node from 'content' or 'properties'.
        var propertiesElement = getSingleElementByTagNameNS(entryElement.domNode, odataMetaXmlNs, "properties");
        if (!propertiesElement) {
            var contentElement = getSingleElementByTagNameNS(entryElement.domNode, atomXmlNs, "content");
            if (contentElement) {
                propertiesElement = getSingleElementByTagNameNS(contentElement, odataMetaXmlNs, "properties");
            }
        }

        if (propertiesElement) {
            // Traverse down to the parent of the property path.
            var propertyParentElement = propertiesElement;
            var parts = propertyPath.split("/");
            var i, len;
            for (i = 0, len = (parts.length - 1); i < len; i++) {
                propertyParentElement = getSingleElementByTagNameNS(propertyParentElement, odataXmlNs, parts[i]);
                if (!propertyParentElement) {
                    return;
                }
            }

            // Remove the child from its parent.
            var propertyElement = getSingleElementByTagNameNS(propertyParentElement, odataXmlNs, parts[i]);
            if (propertyElement) {
                propertyParentElement.removeChild(propertyElement);
            }

            // Remove empty elements up the parent chain.
            var candidate = propertyParentElement;
            while (candidate !== propertiesElement && isElementEmpty(candidate)) {
                var parent = candidate.parentNode;
                parent.removeChild(candidate);
                candidate = parent;
            }
        }
    };

    var applyEntryCustomizationToEntry = function (customization, sourcePath, entryElement, entryObject, propertyType, suffix, context) {
        /// <summary>Applies a specific feed customization item to an entry.</summary>
        /// <param name="customization">Object with customization description.</param>
        /// <param name="sourcePath">Property path to map ('source' in the description).</param>
        /// <param name="entryElement">XML element for the entry that corresponds to the object being written.</param>
        /// <param name="entryObject">Object being written.</param>
        /// <param name="propertyType" type="String">Name of property type to write.</param>
        /// <param name="suffix" type="String">Suffix to feed customization properties.</param>
        /// <param name="context">Context used for serialization.</param>

        var targetPath = customization["FC_TargetPath" + suffix];
        var xmlPath = expandCustomizationPath(targetPath);
        var xmlNamespace = (targetPath !== xmlPath) ? atomXmlNs : customization["FC_NsUri" + suffix];
        var keepInContent = (customization["FC_KeepInContent" + suffix] === "true") ? true : false;
        var writeAsKind = customization["FC_ContentKind" + suffix];
        var prefix = customization["FC_NsPrefix" + suffix] || null;

        // Get the value to be written.
        var value = getObjectValueByPath(sourcePath, entryObject);

        // Special case: for null values, the 'property' should be left as it was generated.
        // undefined values will appear when metadata describe a property the object doesn't have.
        if (!assigned(value)) {
            return;
        }

        // Remove the property if it should not be kept in content.
        if (!keepInContent) {
            context.dataServiceVersion = "2.0";
            removeXmlProperty(entryElement, sourcePath);
        }

        // Set/create the subtree for the property path with the appropriate value.
        value = convertToAtomPropertyText(value, propertyType);
        setXmlPathValue(xmlNamespace, prefix, xmlPath, entryElement.domNode, writeAsKind, value);
    };

    var applyEntryCustomizationToObject = function (customization, sourcePath, entryElement, entryObject, propertyType, suffix) {
        /// <summary>Applies a specific feed customization item to an object.</summary>
        /// <param name="customization">Object with customization description.</param>
        /// <param name="sourcePath">Property path to set ('source' in the description).</param>
        /// <param name="entryElement">XML element for the entry that corresponds to the object being read.</param>
        /// <param name="entryObject">Object being read.</param>
        /// <param name="propertyType" type="String">Name of property type to set.</param>
        /// <param name="suffix" type="String">Suffix to feed customization properties.</param>

        // If keepInConent equals true then we do nothing as the object has been deserialized at this point.
        if (customization["FC_KeepInContent" + suffix] === "true") {
            return;
        }
        // An existing 'null' means that the property was set to null in the properties,
        // which overrides other items.
        if (getObjectValueByPath(sourcePath, entryObject) === null) {
            return;
        }

        var targetPath = customization["FC_TargetPath" + suffix];
        var xmlPath = expandCustomizationPath(targetPath);
        var xmlNamespace = (targetPath !== xmlPath) ? atomXmlNs : customization["FC_NsUri" + suffix];
        var readAsXhtml = (customization["FC_ContentKind" + suffix] === "xhtml");
        var value = getXmlPathValue(xmlNamespace, xmlPath, entryElement.domNode, readAsXhtml);

        // If the XML tree does not contain the necessary elements to read the value,
        // then it shouldn't be considered null, but rather ignored at all. This prevents
        // the customization from generating the object path down to the property.
        if (value === undefined) {
            return;
        }

        value = convertFromAtomPropertyText(value, propertyType);

        // Set the value on the object.
        setObjectValueByPath(sourcePath, entryObject, value, propertyType);
    };

    var lookupPropertyType = function (metadata, entityType, path) {
        /// <summary>Looks up the type of a property given its path in an entity type.</summary>
        /// <param name="metadata">Metadata in which to search for base and complex types.</param>
        /// <param name="entityType">Entity type to which property belongs.</param>
        /// <param name="path" type="String" mayBeNull="false">Property path to look at.</param>
        /// <returns type="String">The name of the property type; possibly null.</returns>

        var parts = path.split("/");
        var i, len;
        while (entityType) {
            // Keep track of the type being traversed, necessary for complex types.
            var traversedType = entityType;

            for (i = 0, len = parts.length; i < len; i++) {
                // Traverse down the structure as necessary.
                var properties = traversedType.property;
                if (!properties) {
                    break;
                }

                // Find the property by scanning the property list (might be worth pre-processing).
                var propertyFound = lookupProperty(properties, parts[i]);
                if (!propertyFound) {
                    break;
                }

                var propertyType = propertyFound.type;

                // We could in theory still be missing types, but that would
                // be caused by a malformed path.
                if (!propertyType || isPrimitiveType(propertyType)) {
                    return propertyType || null;
                }

                traversedType = lookupComplexType(propertyType, metadata);
                if (!traversedType) {
                    return null;
                }
            }

            // Traverse up the inheritance chain.
            entityType = lookupEntityType(entityType.baseType, metadata);
        }

        return null;
    };

    var applyMetadataToObject = function (entryElement, entryObject, metadata) {
        /// <summary>Applies feed customization properties to an object being read.</summary>
        /// <param name="entryElement">XML element for the entry that corresponds to the object being read.</param>
        /// <param name="entryObject">Object being read.</param>
        /// <param name="metadata">Metadata that describes the conceptual schema.</param>

        if (!metadata || metadata.length === 0) {
            return;
        }

        var typeName = entryObject.__metadata.type;
        while (typeName) {
            var entityType = lookupEntityType(typeName, metadata);
            if (!entityType) {
                return;
            }

            // Apply all feed customizations from the entity and each of its properties.
            var propertyType;
            var source = entityType.FC_SourcePath;
            if (source) {
                propertyType = lookupPropertyType(metadata, entityType, source);
                applyEntryCustomizationToObject(entityType, source, entryElement, entryObject, propertyType, "");
            }

            var properties = entityType.property;
            if (properties) {
                var i, len;
                for (i = 0, len = properties.length; i < len; i++) {
                    var property = properties[i];
                    var suffixCounter = 0;
                    var suffix = "";
                    while (property["FC_TargetPath" + suffix]) {
                        source = property.name;
                        propertyType = property.type;

                        var sourcePath = property["FC_SourcePath" + suffix];
                        if (sourcePath) {
                            source += "/" + sourcePath;
                            propertyType = lookupPropertyType(metadata, entityType, source);
                        }

                        applyEntryCustomizationToObject(property, source, entryElement, entryObject, propertyType, suffix);
                        suffixCounter++;
                        suffix = "_" + suffixCounter;
                    }
                }
            }

            // Apply feed customizations from base types.
            typeName = entityType.baseType;
        }
    };

    var readAtomEntry = function (atomEntry, metadata) {
        /// <summary>Reads an ATOM entry in OData format.</summary>
        /// <param name="atomEntry">XML element for the entry.</param>
        /// <param name="metadata">Metadata that describes the conceptual schema.</param>
        /// <returns type="Object">An object in payload representation format.</returns>

        var entryMetadata = {};
        var entry = {
            __metadata: entryMetadata
        };

        var etag = xmlAttribute(atomEntry, "etag", odataMetaXmlNs);
        if (etag) {
            entryMetadata.etag = etag;
        }

        xmlChildElements(atomEntry, function (entryChild) {
            if (entryChild.nsURI === atomXmlNs) {
                switch (entryChild.localName) {
                    case "id":
                        entryMetadata.uri = normalizeURI(xmlInnerText(entryChild.domNode), entryChild.baseURI);
                        entryMetadata.uri_extensions = readAtomExtensionAttributes(entryChild);
                        break;
                    case "category":
                        readAtomEntryType(entryChild, entry, entryMetadata);
                        break;
                    case "content":
                        readAtomEntryContent(entryChild, entry);
                        break;
                    case "link":
                        readAtomEntryLink(entryChild, entry, metadata);
                        break;
                }
            }

            if (entryChild.nsURI === odataMetaXmlNs && entryChild.localName === "properties") {
                readAtomEntryStructuralObject(entryChild, entry, entryMetadata);
            }
        });

        // Apply feed customizations if applicable.
        applyMetadataToObject(atomEntry, entry, metadata);

        return entry;
    };

    var readAtomEntryType = function (atomCategory, entry, entryMetadata) {
        /// <summary>Reads type information from an ATOM category element.</summary>
        /// <param name="atomCategory">XML category element.</param>
        /// <param name="entry">Entry object to update with information.</param>
        /// <param name="entryMetadata">entry.__metadata, passed as an argument simply to help minify the code.</param>

        var scheme = xmlAttribute(atomCategory, "scheme");
        var term = xmlAttribute(atomCategory, "term");

        if (scheme === odataScheme) {
            if (entry.__metadata.type) {
                throw { message: "Invalid AtomPub document: multiple category elements defining the entry type were encounterd withing an entry", element: atomCategory };
            }

            entryMetadata.type = term;
            entryMetadata.type_extensions = [];

            var typeExtension;
            xmlAttributes(atomCategory, function (attribute) {
                if (!attribute.nsURI) {
                    if (attribute.localName !== "scheme" && attribute.localName !== "term") {
                        typeExtension = readAtomExtensionAttribute(attribute);
                        entryMetadata.type_extensions.push(typeExtension);
                    }
                } else if (isExtensionNs(attribute.nsURI)) {
                    typeExtension = readAtomExtensionAttribute(attribute);
                    entryMetadata.type_extensions.push(typeExtension);
                }
            });
        }
    };

    var readAtomEntryContent = function (atomEntryContent, entry) {
        /// <summary>Reads an ATOM content element.</summary>
        /// <param name="atomEntryContent">XML entry element.</param>
        /// <param name="entry">Entry object to update with information.</param>

        var src = xmlAttribute(atomEntryContent, "src");
        var type = xmlAttribute(atomEntryContent, "type");
        var entryMetadata = entry.__metadata;

        if (src) {
            if (!type) {
                throw { message: "Invalid AtomPub document: content element must specify the type attribute if the src attribute is also specified", element: atomEntryContent };
            }

            entryMetadata.media_src = normalizeURI(src, atomEntryContent.baseURI);
            entryMetadata.content_type = type;
        }

        xmlChildElements(atomEntryContent, function (contentChild) {
            if (src) {
                throw { message: "Invalid AtomPub document: content element must not have child elements if the src attribute is specified", element: atomEntryContent };
            }

            if (contentChild.nsURI === odataMetaXmlNs && contentChild.localName === "properties") {
                readAtomEntryStructuralObject(contentChild, entry, entryMetadata);
            }
        });
    };

    var readAtomEntryEditMediaLink = function (link, entry, entryMetadata) {
        /// <summary>Reads an ATOM media link element.</summary>
        /// <param name="link">Link representation (not the XML element).</param>
        /// <param name="entry">Entry object to update with information.</param>
        /// <param name="entryMetadata">entry.__metadata, passed as an argument simply to help minify the code.</param>

        entryMetadata.edit_media = link.href;
        entryMetadata.edit_media_extensions = [];

        // Read the link extensions.
        var i, len;
        for (i = 0, len = link.extensions.length; i < len; i++) {
            if (link.extensions[i].namespaceURI === odataMetaXmlNs && link.extensions[i].name === "etag") {
                entryMetadata.media_etag = link.extensions[i].value;
            } else {
                entryMetadata.edit_media_extensions.push(link.extensions[i]);
            }
        }
    };

    var readAtomEntryLink = function (atomEntryLink, entry, metadata) {
        /// <summary>Reads a link element on an entry.</summary>
        /// <param name="atomEntryLink">'link' element on the entry.</param>
        /// <param name="entry">An object in payload representation format.</param>
        /// <param name="metadata">Metadata that describes the conceptual schema.</param>

        var link = readAtomLink(atomEntryLink);
        var entryMetadata = entry.__metadata;
        switch (link.rel) {
            case "self":
                entryMetadata.self = link.href;
                entryMetadata.self_link_extensions = link.extensions;
                break;
            case "edit":
                entryMetadata.edit = link.href;
                entryMetadata.edit_link_extensions = link.extensions;
                break;
            case "edit-media":
                readAtomEntryEditMediaLink(link, entry, entryMetadata);
                break;
            default:
                if (link.rel.indexOf(odataRelatedPrefix) === 0) {
                    readAtomEntryDeferredProperty(atomEntryLink, link, entry, metadata);
                }
                break;
        }
    };

    var readAtomEntryDeferredProperty = function (atomEntryLink, link, entry, metadata) {
        /// <summary>Reads a potentially-deferred property on an entry.</summary>
        /// <param name="atomEntryLink">'link' element on the entry.</param>
        /// <param name="link">Parsed link object.</param>
        /// <param name="entry">An object in payload representation format.</param>
        /// <param name="metadata">Metadata that describes the conceptual schema.</param>

        var propertyName = link.rel.substring(odataRelatedPrefix.length);

        // undefined is used as a flag that inline data was not found (as opposed to
        // found with a value or with null).
        var inlineData = undefined;

        // Get any inline data.
        xmlChildElements(atomEntryLink, function (child) {
            if (child.nsURI === odataMetaXmlNs && child.localName === "inline") {
                var inlineRoot = xmlFirstElement(child);
                if (inlineRoot) {
                    inlineData = readAtomDocument(inlineRoot, metadata);
                } else {
                    inlineData = null;
                }
            }
        });

        // If the link has no inline content, we consider it deferred.
        if (inlineData === undefined) {
            inlineData = { __deferred: { uri: link.href} };
        }

        // Set the property value on the entry object.
        entry[propertyName] = inlineData;

        // Set the extra property information on the entry object metadata. 
        entry.__metadata.properties = entry.__metadata.properties || {};
        entry.__metadata.properties[propertyName] = {
            extensions: link.extensions
        };
    };

    var readAtomEntryStructuralObject = function (propertiesElement, parent, parentMetadata) {
        /// <summary>Reads an atom entry's property as a structural object and sets its value in the parent and the metadata in the parentMetadata objects.</summary>
        /// <param name="propertiesElement">XML element for the 'properties' node.</param>
        /// <param name="parent">
        /// Object that will contain the property value. It can be either an antom entry or 
        /// an atom complex property object.
        /// </param>
        /// <param name="parentMetadata">Object that will contain the property metadata. It can be either an atom entry metadata or a complex property metadata object</param>

        xmlChildElements(propertiesElement, function (property) {
            if (property.nsURI === odataXmlNs) {
                parentMetadata.properties = parentMetadata.properties || {};
                readAtomEntryProperty(property, parent, parentMetadata.properties);
            }
        });
    };

    var readAtomEntryProperty = function (property, parent, metadata) {
        /// <summary>Reads a property on an ATOM OData entry.</summary>
        /// <param name="property">XML element for the property.</param>
        /// <param name="parent">
        /// Object that will contain the property value. It can be either an antom entry or 
        /// an atom complex property object.
        /// </param>
        /// <param name="metadata">Metadata for the object that will contain the property value.</param>

        var propertyNullValue = null;
        var propertyTypeValue = "Edm.String";
        var propertyExtensions = [];

        xmlAttributes(property, function (attribute) {
            if (attribute.nsURI === odataMetaXmlNs) {
                switch (attribute.localName) {
                    case "null":
                        propertyNullValue = attribute.domNode.nodeValue;
                        return;
                    case "type":
                        propertyTypeValue = attribute.domNode.nodeValue;
                        return;
                };
            }

            if (isExtensionNs(attribute.nsURI)) {
                var extension = readAtomExtensionAttribute(attribute);
                propertyExtensions.push(extension);
            }
        });

        var propertyValue = null;
        var propertyMetadata = {
            type: propertyTypeValue,
            extensions: propertyExtensions
        };

        if (propertyNullValue !== "true") {
            propertyValue = xmlInnerText(property.domNode);
            if (isPrimitiveType(propertyTypeValue)) {
                propertyValue = convertFromAtomPropertyText(propertyValue, propertyTypeValue);
            } else {
                // Probe for a complex type and read it.
                if (xmlFirstElement(property)) {
                    propertyValue = { __metadata: { type: propertyTypeValue} };
                    readAtomEntryStructuralObject(property, propertyValue, propertyMetadata);
                }
            }
        }

        parent[property.localName] = propertyValue;
        metadata[property.localName] = propertyMetadata;
    };

    var readAtomServiceDocument = function (atomServiceDoc) {
        /// <summary>Reads an atom service document</summary>
        /// <param name="atomServiceDoc">An element node that represents the root service element of an AtomPub service document</param>
        /// <returns type="Object">An object that contains the properties of the service document</returns>

        // Consider handling Accept and Category elements.

        var serviceDoc = {
            workspaces: [],
            extensions: []
        };

        // Find all the workspace elements.
        xmlChildElements(atomServiceDoc, function (child) {
            if (child.nsURI === appXmlNs && child.localName === "workspace") {
                var workspace = readAtomServiceDocumentWorkspace(child);
                serviceDoc.workspaces.push(workspace);
            } else {
                var serviceExtension = readAtomExtensionElement(atomServiceDoc);
                serviceDoc.extensions.push(serviceExtension);
            }
        });

        // AtomPub (RFC 5023 Section 8.3.1) says a service document MUST contain one or 
        // more workspaces. Throw if we don't find any. 
        if (serviceDoc.workspaces.length === 0) {
            throw { message: "Invalid AtomPub service document: No workspace element found.", element: atomServiceDoc };
        }

        return serviceDoc;
    };

    var readAtomServiceDocumentWorkspace = function (atomWorkspace) {
        /// <summary>Reads a single workspace element from an atom service document</summary>
        /// <param name="atomWorkspace">An element node that represents a workspace element of an AtomPub service document</param>
        /// <returns type="Object">An object that contains the properties of the workspace</returns>

        var workspace = {
            collections: [],
            extensions: []
        };

        xmlChildElements(atomWorkspace, function (child) {
            if (child.nsURI === atomXmlNs) {
                if (child.localName === "title") {
                    if (atomWorkspace.title) {
                        throw { message: "Invalid AtomPub service document: workspace has more than one child title element", element: child };
                    }

                    workspace.title = xmlInnerText(child.domNode);
                }
            } else if (child.nsURI === appXmlNs) {
                if (child.localName === "collection") {
                    var collection = readAtomServiceDocumentCollection(child, workspace);
                    workspace.collections.push(collection);
                }
            } else {
                var extension = readAtomExtensionElement(atomWorkspace);
                workspace.extensions.push(extension);
            }
        });

        workspace.title = workspace.title || "";

        return workspace;
    };

    var readAtomServiceDocumentCollection = function (atomCollection) {
        /// <summary>Reads a service document collection element into an object.</summary>
        /// <param name="atomCollection">An element node that represents a collection element of an AtomPub service document.</param>
        /// <returns type="Object">An object that contains the properties of the collection.</returns>

        var collection = {
            href: xmlAttribute(atomCollection, "href"),
            extensions: []
        };

        if (!collection.href) {
            throw { message: "Invalid AtomPub service document: collection has no href attribute", element: atomCollection };
        }

        collection.href = normalizeURI(collection.href, atomCollection.baseURI);

        xmlChildElements(atomCollection, function (child) {
            if (child.nsURI === atomXmlNs) {
                if (child.localName === "title") {
                    if (collection.title) {
                        throw { message: "Invalid AtomPub service document: collection has more than one child title element", element: child };
                    }

                    collection.title = xmlInnerText(child.domNode);
                }
            } else if (child.nsURI !== appXmlNs) {
                var extension = readAtomExtensionElement(atomCollection);
                collection.extensions.push(extension);
            }
        });

        // AtomPub (RFC 5023 Section 8.3.3) says the collection element MUST contain 
        // a title element. It's likely to be problematic if the service doc doesn't 
        // have one so here we throw. 
        if (!collection.title) {
            throw { message: "Invalid AtomPub service document: collection has no title element", element: atomCollection };
        }

        return collection;
    };

    var writeAtomDocument = function (data, context) {
        /// <summary>Writes the specified data into an OData ATOM document.</summary>
        /// <param name="data">Data to write.</param>
        /// <param name="context">Context used for serialization.</param>
        /// <returns>The root of the DOM tree built.</returns>

        var docRoot;
        var type = payloadTypeOf(data);
        switch (type) {
            case PAYLOADTYPE_FEEDORLINKS:
                docRoot = writeAtomFeed(null, data, context);
                break;
            case PAYLOADTYPE_ENTRY:
                // FALLTHROUGH
            case PAYLOADTYPE_COMPLEXTYPE:
                docRoot = writeAtomEntry(null, data, context);
                break;
        }

        return docRoot;
    };

    var writeAtomRoot = function (parent, name) {
        /// <summary>Writes the root of an ATOM document, possibly under an existing element.</summary>
        /// <param name="parent" mayBeNull="true">Element under which to create a new element.</param>
        /// <param name="name">Name for the new element, to be created in the ATOM namespace.</param>
        /// <returns>The created element.</returns>

        if (parent) {
            return xmlNewElement(parent, name, atomXmlNs);
        }

        var result = xmlNewDocument(name, atomXmlNs);

        // Add commonly used namespaces.
        // ATOM is implied by the just-created element.
        // xmlAddNamespaceAttribute(result.domNode, "xmlns", atomXmlNs);
        xmlAddNamespaceAttribute(result.domNode, "xmlns:d", odataXmlNs);
        xmlAddNamespaceAttribute(result.domNode, "xmlns:m", odataMetaXmlNs);

        return result;
    };

    var writeAtomFeed = function (parent, data, context) {
        /// <summary>Writes the specified feed data into an OData ATOM feed.</summary>
        /// <param name="parent" mayBeNull="true">Parent to append feed tree to.</param>
        /// <param name="data">Feed data to write.</param>
        /// <param name="context">Context used for serialization.</param>
        /// <returns>The feed element of the DOM tree built.</returns>

        var feed = writeAtomRoot(parent, "feed");
        var entries = (isArray(data)) ? data : data.results;
        if (entries) {
            var i, len;
            for (i = 0, len = entries.length; i < len; i++) {
                writeAtomEntry(feed, entries[i], context);
            }
        }

        return feed;
    };

    var writeAtomEntry = function (parent, data, context) {
        /// <summary>Appends an ATOM entry XML payload to the parent node.</summary>
        /// <param name="parent">Parent element.</param>
        /// <param name="data">Data object to write in intermediate format.</param>
        /// <param name="context">Context used for serialization.</param>
        /// <returns>The new entry.</returns>

        var entry = writeAtomRoot(parent, "entry");

        // Set up a default empty author name as required by ATOM.
        var author = xmlNewElement(entry, "author", atomXmlNs);
        xmlNewElement(author, "name", atomXmlNs);

        // Set up a default empty title as required by ATOM.
        xmlNewElement(entry, "title", atomXmlNs);

        var content = xmlNewElement(entry, "content", atomXmlNs);
        xmlNewAttribute(content, "type", null, "application/xml");

        var properties = xmlNewElement(content, propertiesTag, odataMetaXmlNs);

        var propertiesMetadata = (data.__metadata) ? data.__metadata.properties : null;

        writeAtomEntryMetadata(entry, data.__metadata);
        writeAtomEntryProperties(entry, properties, data, propertiesMetadata, context);
        applyMetadataToEntry(entry, data, context);

        return entry;
    };

    var applyMetadataToEntry = function (entry, data, context) {
        /// <summary>Applies feed customizations to the specified entry element.</summary>
        /// <param name="entry">Entry to apply feed customizations to.</param>
        /// <param name="data">Data object associated with the entry.</param>
        /// <param name="context">Context used for serialization.</param>

        if (!data.__metadata) {
            return;
        }

        var metadata = context.metadata;
        var entityType = lookupEntityType(data.__metadata.type, metadata);
        while (entityType) {
            // Apply all feed customizations from the entity and each of its properties.
            var propertyType;
            var source = entityType.FC_SourcePath;
            if (source) {
                propertyType = lookupPropertyType(metadata, entityType, source);
                applyEntryCustomizationToEntry(entityType, source, entry, data, propertyType, "", context);
            }

            var properties = entityType.property;
            if (properties) {
                var i, len;
                for (i = 0, len = properties.length; i < len; i++) {
                    var property = properties[i];
                    var suffixCounter = 0;
                    var suffix = "";
                    while (property["FC_TargetPath" + suffix]) {
                        source = property.name;
                        if (property["FC_SourcePath" + suffix]) {
                            source += "/" + property["FC_SourcePath" + suffix];
                        }

                        applyEntryCustomizationToEntry(property, source, entry, data, property.type, suffix, context);
                        suffixCounter++;
                        suffix = "_" + suffixCounter;
                    }
                }
            }

            // Apply feed customizations from base types.
            entityType = lookupEntityType(entityType.baseType, metadata);
        }
    };

    var writeAtomEntryMetadata = function (entry, metadata) {
        /// <summary>Writes the content of metadata into the specified DOM entry element.</summary>
        /// <param name="entry">DOM entry element.</param>
        /// <param name="metadata" mayBeNull="true">Object __metadata to write.</param>

        if (metadata) {
            // Write the etag if present.
            if (metadata.etag) {
                xmlNewAttribute(entry, "etag", odataMetaXmlNs, metadata.etag);
            }

            // Write the ID if present.
            if (metadata.uri) {
                xmlNewElement(entry, "id", atomXmlNs, metadata.uri);
            }

            // Write the type name if present.
            if (metadata.type) {
                var category = xmlNewElement(entry, "category", atomXmlNs);
                xmlNewAttribute(category, "term", null, metadata.type);
                xmlNewAttribute(category, "scheme", null, odataScheme);
            }
        }
    };

    var writeAtomEntryLink = function (entry, href, rel) {
        /// <summary>Writes an ATOM link into an entry.</summary>
        /// <param name="entry">DOM entry element to add link to.</param>
        /// <param name="href" type="String">Value for href attribute in link element.</param>
        /// <param name="rel" type="String">Value for rel attribute in link element</param>
        /// <returns>The new link element.</returns>

        var link = xmlNewElement(entry, "link", atomXmlNs);
        xmlNewAttribute(link, "rel", null, rel);
        xmlNewAttribute(link, "href", null, href);
        return link;
    };

    var writeAtomEntryProperties = function (entry, parentElement, data, propertiesMetadata, context) {
        /// <summary>Writes the properties of an entry or complex type.</summary>
        /// <param name="entry" mayBeNull="true">Entry object being written out; null if this is a complex type.</param>
        /// <param name="parentElement">Parent DOM element under which the property should be added.</param>
        /// <param name="data">Data object to write in intermediate format.</param>
        /// <param name="propertiesMetadata" mayBeNull="true">Instance metadata about properties of the 'data' object.</param>
        /// <param name="context">Context used for serialization.</param>

        var name, value, kind, propertyMetadata;
        var contextMetadata = context.metadata;
        var dataMetadataType;
        for (name in data) {
            if (name !== "__metadata") {
                value = data[name];
                kind = propertyKindOf(value);
                propertyMetadata = (propertiesMetadata) ? propertiesMetadata[name] : null;
                if (!propertyMetadata) {
                    // Look up at-most-once.
                    if (dataMetadataType === undefined) {
                        if (data.__metadata) {
                            dataMetadataType = lookupEntityType(data.__metadata.type, contextMetadata);
                        }
                    }

                    if (dataMetadataType) {
                        propertyMetadata = lookupProperty(dataMetadataType.property, name);
                        if (!propertyMetadata) {
                            propertyMetadata = lookupProperty(dataMetadataType.navigationProperty, name);
                        }
                    }
                }

                if (kind === PROPERTYKIND_NONE) {
                    // This could be a null primitive property, complex type or link;
                    // look it up in metadata if available, otherwise assume primitive.
                    kind = PROPERTYKIND_PRIMITIVE;
                    if (propertyMetadata && !isPrimitiveType(propertyMetadata.type)) {
                        if (propertyMetadata.relationship) {
                            kind = PROPERTYKIND_INLINE;
                        } else if (lookupComplexType(propertyMetadata.type, context.metadata)) {
                            kind = PROPERTYKIND_COMPLEX;
                        }
                    }
                }

                if (kind === PROPERTYKIND_PRIMITIVE || kind === PROPERTYKIND_COMPLEX) {
                    writeAtomEntryProperty(parentElement, name, kind, value, propertyMetadata, context);
                } else {
                    writeAtomEntryDeferredProperty(entry, kind, name, value, context);
                }
            }
        }
    };

    var writeAtomEntryProperty = function (parentElement, name, kind, value, propertiesMetadata, context) {
        /// <summary>Writes a single property for an entry or complex type.</summary>
        /// <param name="parentElement">Parent DOM element under which the property should be added.</param>
        /// <param name="name" type="String">Property name.</param>
        /// <param name="kind" type="String">Property kind description (from propertyKind values).</param>
        /// <param name="value" mayBeNull="true">Property value.</param>
        /// <param name="propertiesMetadata" mayBeNull="true">Instance metadata about properties of the 'data' object.</param>
        /// <param name="context">Serialization context.</param>

        var propertyTagName = xmlQualifyXmlTagName(name, "d");
        var propertyType = propertiesMetadata && propertiesMetadata.type;
        var property;
        if (kind === PROPERTYKIND_COMPLEX) {
            property = xmlNewElement(parentElement, propertyTagName, odataXmlNs);
            var propertyMetadata;
            if (propertiesMetadata) {
                propertyMetadata = propertiesMetadata.properties;
            }

            // Null complex types require a V2 payload.
            if (value === null) {
                context.dataServiceVersion = "2.0";
            }

            writeAtomEntryProperties(null, property, value, propertyMetadata, context);
        } else {
            // Default the conversion to string if no property type has been defined.
            property = xmlNewElement(parentElement, propertyTagName, odataXmlNs, convertToAtomPropertyText(value, propertyType || "Edm.String"));
        }

        if (value === null) {
            xmlNewAttribute(property, propertyNullAttribute, odataMetaXmlNs, "true");
        }

        if (propertyType) {
            xmlNewAttribute(property, propertyTypeAttribute, odataMetaXmlNs, propertyType);
        }
    };

    var writeAtomEntryDeferredProperty = function (entry, kind, name, value, context) {
        /// <summary>Writes a single property for an entry or complex type.</summary>
        /// <param name="entry">Entry object being written out.</param>
        /// <param name="name" type="String">Property name.</param>
        /// <param name="kind" type="String">Property kind description (from propertyKind values).</param>
        /// <param name="value" mayBeNull="true">Property value.</param>
        /// <param name="context">Serialization context.</param>
        /// <remarks>entry cannot be null because that would indicate a complex type, which don't support links.</remarks>

        var href;
        var inlineWriter;
        var inlineType;
        var inlineContent = kind === PROPERTYKIND_INLINE;
        if (inlineContent) {
            href = (value && value.__metadata) ? value.__metadata.uri : "";
            inlineType = payloadTypeOf(value);
            switch (inlineType) {
                case PAYLOADTYPE_ENTRY:
                    inlineWriter = writeAtomEntry;
                    break;
                case PAYLOADTYPE_FEEDORLINKS:
                    inlineType = "feed";
                    inlineWriter = writeAtomFeed;
                    break;
                case PAYLOADTYPE_NONE:
                    // Only for a null entry, serialized as a link with an empty m:inline value.
                    inlineType = PAYLOADTYPE_ENTRY;
                    inlineWriter = null;
                    break;
                default:
                    throw { message: "Invalid payload for inline navigation property: " + inlineType };
            }
        } else {
            href = value.__deferred.uri;
        }

        var rel = normalizeURI(name, odataRelatedPrefix);
        var link = writeAtomEntryLink(entry, href, rel);
        if (inlineContent) {
            var inlineRoot = xmlNewElement(link, inlineTag, odataMetaXmlNs);
            xmlNewAttribute(link, "type", null, "application/atom+xml;type=" + inlineType);
            if (inlineWriter) {
                inlineWriter(inlineRoot, value, context);
            }
        }
    };

    var atomParser = function (handler, text, context) {
        /// <summary>Parses an ATOM document (feed, entry or service document).</summary>
        /// <param name="handler">This handler.</param>
        /// <param name="text" type="String">Document text.</param>
        /// <param name="context" type="Object">Object with parsing context.</param>
        /// <returns>An object representation of the document; undefined if not applicable.</returns>

        if (text) {
            var atomRoot = xmlParse(text);
            if (atomRoot) {
                return readAtomDocument(atomRoot, context.metadata);
            }
        }
    };

    var atomSerializer = function (handler, data, context) {
        /// <summary>Serializes an ATOM object into a document (feed or entry).</summary>
        /// <param name="handler">This handler.</param>
        /// <param name="data" type="Object">Representation of feed or entry.</param>
        /// <param name="context" type="Object">Object with parsing context.</param>
        /// <returns>An text representation of the data object; undefined if not applicable.</returns>

        var cType = context.contentType = context.contentType || contentType(atomMediaType);
        var result = undefined;
        if (cType && cType.mediaType === atomMediaType) {
            var atomDoc = writeAtomDocument(data, context);
            result = xmlSerialize(atomDoc);
        }

        return result;
    };

    odata.atomHandler = handler(atomParser, atomSerializer, atomAcceptTypes.join(","), MAX_DATA_SERVICE_VERSION);



    // It's assumed that all elements may have Documentation children and Annotation elements.
    // See http://msdn.microsoft.com/en-us/library/bb399292.aspx for a CSDL reference.
    var schema = {
        elements: {
            Association: {
                attributes: ["Name"],
                elements: ["End*", "ReferentialConstraint"]
            },
            AssociationSet: {
                attributes: ["Name", "Association"],
                elements: ["End*"]
            },
            CollectionType: {
                attributes: ["ElementType", "Nullable", "DefaultValue", "MaxLength", "FixedLength", "Precision", "Scale", "Unicode", "Collation"]
            },
            ComplexType: {
                attributes: ["Name", "BaseType", "Abstract"],
                elements: ["Property*"]
            },
            DefiningExpression: {
                text: true
            },
            Dependent: {
                attributes: ["Role"],
                elements: ["PropertyRef*"]
            },
            Documentation: {
                text: true
            },
            End: {
                attributes: ["Type", "Role", "Multiplicity", "EntitySet"],
                elements: ["OnDelete"]
            },
            EntityContainer: {
                attributes: ["Name", "Extends"],
                elements: ["EntitySet*", "AssociationSet*", "FunctionImport*"]
            },
            EntitySet: {
                attributes: ["Name", "EntityType"]
            },
            EntityType: {
                attributes: ["Name", "BaseType", "Abstract", "OpenType"],
                elements: ["Key", "Property*", "NavigationProperty*"]
            },
            Function: {
                attributes: ["Name", "ReturnType"],
                elements: ["Parameter*", "DefiningExpression", "ReturnType"]
            },
            FunctionImport: {
                attributes: ["Name", "ReturnType", "EntitySet"],
                elements: ["Parameter*"]
            },
            Key: {
                elements: ["PropertyRef*"]
            },
            NavigationProperty: {
                attributes: ["Name", "Relationship", "ToRole", "FromRole"]
            },
            OnDelete: {
                attributes: ["Action"]
            },
            Parameter: {
                attributes: ["Name", "Type", "Mode", "MaxLength", "Precision", "Scale"]
            },
            Principal: {
                attributes: ["Role"],
                elements: ["PropertyRef*"]
            },
            Property: {
                attributes: ["Name", "Type", "Nullable", "DefaultValue", "MaxLength", "FixedLength", "Precision", "Scale", "Unicode", "Collation", "ConcurrencyMode"]
            },
            PropertyRef: {
                attributes: ["Name"]
            },
            ReferenceType: {
                attributes: ["Type"]
            },
            ReferentialConstraint: {
                elements: ["Principal", "Dependent"]
            },
            ReturnType: {
                attributes: ["ReturnType"],
                elements: ["CollectionType", "ReferenceType", "RowType"]
            },
            RowType: {
                elements: ["Property*"]
            },
            Schema: {
                attributes: ["Namespace", "Alias"],
                elements: ["Using*", "EntityContainer*", "EntityType*", "Association*", "ComplexType*", "Function*"]
            },
            TypeRef: {
                attributes: ["Type", "Nullable", "DefaultValue", "MaxLength", "FixedLength", "Precision", "Scale", "Unicode", "Collation"]
            },
            Using: {
                attributes: ["Namespace", "Alias"]
            }
        }
    };

    // See http://msdn.microsoft.com/en-us/library/ee373839.aspx for a feed customization reference.
    var customizationAttributes = ["m:FC_ContentKind", "m:FC_KeepInContent", "m:FC_NsPrefix", "m:FC_NsUri", "m:FC_SourcePath", "m:FC_TargetPath"];
    schema.elements.Property.attributes = schema.elements.Property.attributes.concat(customizationAttributes);
    schema.elements.EntityType.attributes = schema.elements.EntityType.attributes.concat(customizationAttributes);

    // See http://msdn.microsoft.com/en-us/library/dd541284(PROT.10).aspx for an EDMX reference.
    schema.elements.Edmx = { attributes: ["Version"], elements: ["DataServices"], ns: edmxNs };
    schema.elements.DataServices = { elements: ["Schema*"], ns: edmxNs };

    // See http://msdn.microsoft.com/en-us/library/dd541233(v=PROT.10) for Conceptual Schema Definition Language Document for Data Services.
    schema.elements.EntityContainer.attributes.push("m:IsDefaultEntityContainer");
    schema.elements.Property.attributes.push("m:MimeType");
    schema.elements.FunctionImport.attributes.push("m:HttpMethod");
    schema.elements.EntityType.attributes.push("m:HasStream");
    schema.elements.DataServices.attributes = ["m:DataServiceVersion", "m:MaxDataServiceVersion"];

    var scriptCase = function (text) {
        /// <summary>Converts a Pascal-case identifier into a camel-case identifier.</summary>
        /// <param name="text" type="String">Text to convert.</param>
        /// <returns type="String">Converted text.</returns>
        /// <remarks>If the text starts with multiple uppercase characters, it is left as-is.</remarks>

        if (!text) {
            return text;
        }

        if (text.length > 1) {
            var firstTwo = text.substr(0, 2);
            if (firstTwo === firstTwo.toUpperCase()) {
                return text;
            }

            return text.charAt(0).toLowerCase() + text.substr(1);
        }

        return text.charAt(0).toLowerCase();
    };

    var getChildSchema = function (parentSchema, candidateName) {
        /// <summary>Gets the schema node for the specified element.</summary>
        /// <param name="parentSchema" type="Object">Schema of the parent XML node of 'element'.</param>
        /// <param name="candidateName">XML element name to consider.</param>
        /// <returns type="Object">The schema that describes the specified element; null if not found.</returns>

        if (candidateName === "Documentation") {
            return { isArray: true, propertyName: "documentation" };
        }

        var elements = parentSchema.elements;
        if (!elements) {
            return null;
        }

        var i, len;
        for (i = 0, len = elements.length; i < len; i++) {
            var elementName = elements[i];
            var multipleElements = false;
            if (elementName.charAt(elementName.length - 1) === "*") {
                multipleElements = true;
                elementName = elementName.substr(0, elementName.length - 1);
            }

            if (candidateName === elementName) {
                var propertyName = scriptCase(elementName);
                return { isArray: multipleElements, propertyName: propertyName };
            }
        }

        return null;
    };

    // This regular expression is used to detect a feed customization element
    // after we've normalized it into the 'm' prefix. It starts with m:FC_,
    // followed by other characters, and ends with _ and a number.
    // The captures are 0 - whole string, 1 - name as it appears in internal table.
    var isFeedCustomizationNameRE = /^(m:FC_.*)_[0-9]+$/;

    var isEdmNamespace = function (nsURI) {
        /// <summary>Checks whether the specifies namespace URI is one of the known CSDL namespace URIs.</summary>
        /// <param name="nsURI" type="String">Namespace URI to check.</param>
        /// <returns type="Boolean">true if nsURI is a known CSDL namespace; false otherwise.</returns>

        return nsURI === edmNs || nsURI === edmNs2 || nsURI === edmNs3 || nsURI === edmNs4; 
    };

    var parseConceptualModelElement = function (element) {
        /// <summary>Parses a CSDL document.</summary>
        /// <param name="element">DOM element to parse.</param>
        /// <returns type="Object">An object describing the parsed element.</returns>

        if (!element.domNode) {
            element = xml_wrapNode(element, "");
        }

        var localName = element.localName;
        var elementSchema = schema.elements[localName];
        if (!elementSchema) {
            return null;
        }

        if (elementSchema.ns) {
            if (element.nsURI !== elementSchema.ns) {
                return null;
            }
        } else if (!isEdmNamespace(element.nsURI)) {
            return null;
        }

        var item = {};
        var extensions = [];
        var attributes = elementSchema.attributes || [];
        xmlAttributes(element, function (wrappedAttribute) {
            var node = wrappedAttribute.domNode;
            var localName = wrappedAttribute.localName;
            var namespaceURI = wrappedAttribute.nsURI;
            var value = node.value;

            // Don't do anything with xmlns attributes.
            if (namespaceURI === xmlnsNS) {
                return;
            }

            // Currently, only m: for metadata is supported as a prefix in the internal schema table,
            // un-prefixed element names imply one a CSDL element.
            var schemaName = null;
            var handled = false;
            if (isEdmNamespace(namespaceURI) || namespaceURI === null) {
                schemaName = "";
            } else if (namespaceURI === odataMetaXmlNs) {
                schemaName = "m:";
            }

            if (schemaName !== null) {
                schemaName += localName;

                // Feed customizations for complex types have additional
                // attributes with a suffixed counter starting at '1', so
                // take that into account when doing the lookup.
                var match = isFeedCustomizationNameRE.exec(schemaName);
                if (match) {
                    schemaName = match[1];
                }

                if (contains(attributes, schemaName)) {
                    handled = true;
                    item[scriptCase(localName)] = value;
                }
            }

            if (!handled) {
                extensions.push(createAttributeExtension(wrappedAttribute));
            }
        });

        xmlChildElements(element, function (child) {
            var childSchema = getChildSchema(elementSchema, child.localName);
            if (childSchema) {
                if (childSchema.isArray) {
                    var arr = item[childSchema.propertyName];
                    if (!arr) {
                        arr = [];
                        item[childSchema.propertyName] = arr;
                    }
                    arr.push(parseConceptualModelElement(child));
                } else {
                    item[childSchema.propertyName] = parseConceptualModelElement(child);
                }
            } else {
                extensions.push(createElementExtension(child));
            }
        });

        if (elementSchema.text) {
            item.text = xmlInnerText(element);
        }

        if (extensions.length) {
            item.extensions = extensions;
        }

        return item;
    };

    var metadataParser = function (handler, text) {
        /// <summary>Parses a metadata document.</summary>
        /// <param name="handler">This handler.</param>
        /// <param name="text" type="String">Metadata text.</param>
        /// <returns>An object representation of the conceptual model.</returns>

        var doc = xmlParse(text);
        return parseConceptualModelElement(doc) || undefined;
    };

    odata.metadataHandler = handler(metadataParser, null, xmlMediaType, MAX_DATA_SERVICE_VERSION);



    var jsonAcceptTypes = ["application/json", "application/json;odata=verbose"];
    var jsonMediaType = contentType(jsonAcceptTypes[0]);
    var jsonVerboseMediaType = contentType(jsonAcceptTypes[1]);


    var normalizeServiceDocument = function (data, baseURI) {
        /// <summary>Normalizes a JSON service document to look like an ATOM service document.</summary>
        /// <param name="data" type="Object">Object representation of service documents as deserialized.</param>
        /// <param name="baseURI" type="String">Base URI to resolve relative URIs.</param>
        /// <returns type="Object">An object representation of the service document.</returns>
        var workspace = { collections: [] };

        var i, len;
        for (i = 0, len = data.EntitySets.length; i < len; i++) {
            var title = data.EntitySets[i];
            var collection = {
                title: title,
                href: normalizeURI(title, baseURI)
            };

            workspace.collections.push(collection);
        }

        return { workspaces: [workspace] };
    };

    // The regular expression corresponds to something like this:
    // /Date(123+60)/
    //
    // This first number is date ticks, the + may be a - and is optional,
    // with the second number indicating a timezone offset in minutes.
    // 
    // On the wire, the leading and trailing forward slashes are
    // escaped without being required to so the chance of collisions is reduced;
    // however, by the time we see the objects, the characters already
    // look like regular forward slashes.
    var jsonDateRE = /^\/Date\((-?\d+)(\+|-)?(\d+)?\)\/$/;

    var minutesToOffset = function (minutes) {
        /// <summary>Formats the given minutes into (+/-)hh:mm format.</summary>
        /// <param name="minutes" type="Number">Number of minutes to format.</param>
        /// <returns type="String">The minutes in (+/-)hh:mm format.</returns>

        var sign;
        if (minutes < 0) {
            sign = "-";
            minutes = -minutes;
        } else {
            sign = "+";
        }

        var hours = Math.floor(minutes / 60);
        minutes = minutes - (60 * hours);

        return sign + formatNumberWidth(hours, 2) + ":" + formatNumberWidth(minutes, 2);
    };

    var parseJsonDateString = function (value) {
        /// <summary>Parses the JSON Date representation into a Date object.</summary>
        /// <param name="value" type="String">String value.</param>
        /// <returns type="Date">A Date object if the value matches one; falsy otherwise.</returns>

        var arr = value && jsonDateRE.exec(value);
        if (arr) {
            // 0 - complete results; 1 - ticks; 2 - sign; 3 - minutes
            var result = new Date(parseInt10(arr[1]));
            if (arr[2]) {
                var mins = parseInt10(arr[3]);
                if (arr[2] === "-") {
                    mins = -mins;
                }

                // The offset is reversed to get back the UTC date, which is
                // what the API will eventually have.
                var current = result.getUTCMinutes();
                result.setUTCMinutes(current - mins);
                result.__edmType = "Edm.DateTimeOffset";
                result.__offset = minutesToOffset(mins);
            }
            if (!isNaN(result.valueOf())) {
                return result;
            }
        }

        // Allow undefined to be returned.
    };

    // Some JSON implementations cannot produce the character sequence \/
    // which is needed to format DateTime and DateTimeOffset into the 
    // JSON string representation defined by the OData protocol.
    // See the history of this file for a candidate implementation of
    // a 'formatJsonDateString' function.

    var traverseInternal = function (item, callback) {
        /// <summary>Traverses a tree of objects invoking callback for every value.</summary>
        /// <param name="item" type="Object">Object or array to traverse.</param>
        /// <param name="callback" type="Function">
        /// Callback function with key and value, similar to JSON.parse reviver.
        /// </param>
        /// <returns type="Object">The object with traversed properties.</returns>
        /// <remarks>Unlike the JSON reviver, this won't delete null members.</remarks>

        if (item && typeof item === "object") {
            for (var name in item) {
                var value = item[name];
                var result = traverseInternal(value, callback);
                result = callback(name, result);
                if (result !== value) {
                    if (value === undefined) {
                        delete item[name];
                    } else {
                        item[name] = result;
                    }
                }
            }
        }

        return item;
    };

    var traverse = function (item, callback) {
        /// <summary>Traverses a tree of objects invoking callback for every value.</summary>
        /// <param name="item" type="Object">Object or array to traverse.</param>
        /// <param name="callback" type="Function">
        /// Callback function with key and value, similar to JSON.parse reviver.
        /// </param>
        /// <returns type="Object">The traversed object.</returns>
        /// <remarks>Unlike the JSON reviver, this won't delete null members.</remarks>

        return callback("", traverseInternal(item, callback));
    };

    var jsonParser = function (handler, text, context) {
        /// <summary>Parses a JSON OData payload.</summary>
        /// <param name="handler">This handler.</param>
        /// <param name="text">Payload text (this parser also handles pre-parsed objects).</param>
        /// <param name="context" type="Object">Object with parsing context.</param>
        /// <returns>An object representation of the OData payload.</returns>

        var metadata = context.metadata;
        var recognizeDates = defined(context.context ? context.context.recognizeDates : undefined, handler.recognizeDates);

        var json = (typeof text === "string") ? window.JSON.parse(text) : text;
        json = traverse(json, function (_, value) {
            if (value && typeof value === "object") {
                var dataTypeName = value.__metadata && value.__metadata.type;
                var dataType = lookupEntityType(dataTypeName, metadata) || lookupComplexType(dataTypeName, metadata);

                if (dataType) {
                    var properties = dataType.property;
                    if (properties) {
                        var i, len;
                        for (i = 0, len = properties.length; i < len; i++) {
                            var property = properties[i];
                            var propertyName = property.name;
                            var propertyValue = value[propertyName];

                            if (property.type === "Edm.DateTime" || property.type === "Edm.DateTimeOffset") {
                                if (propertyValue) {
                                    propertyValue = parseJsonDateString(propertyValue);
                                    if (!propertyValue) {
                                        throw { message: "Invalid date/time value" };
                                    }
                                    value[propertyName] = propertyValue;
                                }
                            } else if (property.type === "Edm.Time") {
                            	// ##### BEGIN: MODIFIED BY SAP
                            	if (propertyValue) {
                           		// ##### END: MODIFIED BY SAP
                            		value[propertyName] = parseDuration(propertyValue);
                                // ##### BEGIN: MODIFIED BY SAP
                            	}
                            	// ##### END: MODIFIED BY SAP
                            }
                        }
                    }
                } else if (recognizeDates) {
                    for (var name in value) {
                        propertyValue = value[name];
                        if (typeof propertyValue === "string") {
                            value[name] = parseJsonDateString(propertyValue) || propertyValue;
                        }
                    }
                }
            }
            return value;
        }).d;

        json = jsonUpdateDataFromVersion(json, context.dataServiceVersion);
        json = jsonNormalizeData(json, context.response.requestUri);

        return json;
    };

    var jsonSerializer = function (handler, data, context) {
        /// <summary>Serializes the data by returning its string representation.</summary>
        /// <param name="handler">This handler.</param>
        /// <param name="data">Data to serialize.</param>
        /// <param name="context" type="Object">Object with serialization context.</param>
        /// <returns type="String">The string representation of data.</returns>

        var result = undefined;
        var cType = context.contentType = context.contentType || jsonVerboseMediaType;
        if (cType && cType.mediaType === jsonMediaType.mediaType) {
            var json = data;

            // Save the current date.toJSON function
            var dateToJSON = Date.prototype.toJSON;
            try {
                // Set our own date.toJSON function
                Date.prototype.toJSON = function () {
                    // ##### BEGIN: MODIFIED BY SAP
                    //return formatDateTimeOffset(this);
                	return formatDateTimeOffsetJSON(this);
                    //##### END: MODIFIED BY SAP
                };
                result = window.JSON.stringify(json, jsonReplacer);
                //##### BEGIN: MODIFIED BY SAP
                result = result.replace(/\/Date\(([0-9.+-]+)\)\//g, "\\/Date($1)\\/");
                //##### END: MODIFIED BY SAP
            } finally {
                // Restore the original toJSON function
                Date.prototype.toJSON = dateToJSON;
            }
        }
        return result;
    };

    var jsonReplacer = function (_, value) {
        /// <summary>JSON replacer function for converting a value to its JSON representation.</summary>
        /// <param value type="Object">Value to convert.</param>
        /// <returns type="String">JSON representation of the input value.</returns>
        /// <remarks>
        ///   This method is used during JSON serialization and invoked only by the JSON.stringify function. 
        ///   It should never be called directly.
        /// </remarks>

        if (value && value.__edmType === "Edm.Time") {
            return formatDuration(value);
        } else {
            return value;
        }
    };

    var jsonNormalizeData = function (data, baseURI) {
        /// <summary>
        /// Normalizes the specified data into an intermediate representation.
        /// like the latest supported version.
        /// </summary>
        /// <param name="data" optional="false">Data to update.</param>
        /// <param name="baseURI" optional="false">URI to use as the base for normalizing references.</param>

        if (payloadTypeOf(data) === PAYLOADTYPE_SVCDOC) {
            return normalizeServiceDocument(data, baseURI);
        } else {
            return data;
        }
    };

    var jsonUpdateDataFromVersion = function (data, dataVersion) {
        /// <summary>
        /// Updates the specified data in the specified version to look
        /// like the latest supported version.
        /// </summary>
        /// <param name="data" optional="false">Data to update.</param>
        /// <param name="dataVersion" optional="true" type="String">Version the data is in (possibly unknown).</param>

        // Strip the trailing comma if there.
        if (dataVersion && dataVersion.lastIndexOf(";") === dataVersion.length - 1) {
            dataVersion = dataVersion.substr(0, dataVersion.length - 1);
        }

        if (!dataVersion) {
            // Try to detect whether this is an array, in which case it
            // should probably be a feed structure - indicates V1 behavior.
            if (isArray(data)) {
                dataVersion = "1.0";
            }
        }

        if (dataVersion === "1.0") {
            if (isArray(data)) {
                data = { results: data };
            }
        }

        return data;
    };

    odata.jsonHandler = handler(jsonParser, jsonSerializer, jsonAcceptTypes.join(","), MAX_DATA_SERVICE_VERSION);
    odata.jsonHandler.recognizeDates = false;


    var batchMediaType = "multipart/mixed";
    var responseStatusRegex = /^HTTP\/1\.\d (\d{3}) (.*)$/i;
    var responseHeaderRegex = /^([^()<>@,;:\\"\/[\]?={} \t]+)\s?:\s?(.*)/;

    var hex16 = function () {
        /// <summary>
        /// Calculates a random 16 bit number and returns it in hexadecimal format.
        /// </summary>
        /// <returns type="String">A 16-bit number in hex format.</returns>

        return Math.floor((1 + Math.random()) * 0x10000).toString(16).substr(1);
    };

    var createBoundary = function (prefix) {
        /// <summary>
        /// Creates a string that can be used as a multipart request boundary.
        /// </summary>
        /// <param name="prefix" type="String" optional="true">String to use as the start of the boundary string</param>
        /// <returns type="String">Boundary string of the format: <prefix><hex16>-<hex16>-<hex16></returns>

        return prefix + hex16() + "-" + hex16() + "-" + hex16();
    };

    var partHandler = function (context) {
        /// <summary>
        /// Gets the handler for data serialization of individual requests / responses in a batch.
        /// </summary>
        /// <param name="context">Context used for data serialization.</param>
        /// <returns>Handler object.</returns>

        return context.handler.partHandler;
    };

    var currentBoundary = function (context) {
        /// <summary>
        /// Gets the current boundary used for parsing the body of a multipart response.
        /// </summary>
        /// <param name="context">Context used for parsing a multipart response.</param>
        /// <returns type="String">Boundary string.</returns>

        var boundaries = context.boundaries;
        return boundaries[boundaries.length - 1];
    };

    var batchParser = function (handler, text, context) {
        /// <summary>Parses a batch response.</summary>
        /// <param name="handler">This handler.</param>
        /// <param name="text" type="String">Batch text.</param>
        /// <param name="context" type="Object">Object with parsing context.</param>
        /// <returns>An object representation of the batch.</returns>

        var boundary = context.contentType.properties["boundary"];
        return { __batchResponses: readBatch(text, { boundaries: [boundary], handlerContext: context }) };
    };

    var batchSerializer = function (handler, data, context) {
        /// <summary>Serializes a batch object representation into text.</summary>
        /// <param name="handler">This handler.</param>
        /// <param name="data" type="Object">Representation of a batch.</param>
        /// <param name="context" type="Object">Object with parsing context.</param>
        /// <returns>An text representation of the batch object; undefined if not applicable.</returns>

        var cType = context.contentType = context.contentType || contentType(batchMediaType);
        if (cType.mediaType === batchMediaType) {
            return writeBatch(data, context);
        }
    };

    var readBatch = function (text, context) {
        /// <summary>
        /// Parses a multipart/mixed response body from from the position defined by the context. 
        /// </summary>
        /// <param name="text" type="String" optional="false">Body of the multipart/mixed response.</param>
        /// <param name="context">Context used for parsing.</param>
        /// <returns>Array of objects representing the individual responses.</returns>

        var delimiter = "--" + currentBoundary(context);

        // Move beyond the delimiter and read the complete batch
        readTo(text, context, delimiter);

        // Ignore the incoming line
        readLine(text, context);

        // Read the batch parts
        var responses = [];
        var partEnd;

        while (partEnd !== "--" && context.position < text.length) {
            var partHeaders = readHeaders(text, context);
            var partContentType = contentType(partHeaders["Content-Type"]);

            if (partContentType && partContentType.mediaType === batchMediaType) {
                context.boundaries.push(partContentType.properties["boundary"]);
                try {
                    var changeResponses = readBatch(text, context);
                } catch (e) {
                    e.response = readResponse(text, context, delimiter);
                    changeResponses = [e];
                }
                responses.push({__changeResponses: changeResponses});
                context.boundaries.pop();
                readTo(text, context, "--" + currentBoundary(context));
            } else {
                if (!partContentType || partContentType.mediaType !== "application/http") {
                    throw { message: "invalid MIME part type " };
                }
                // Skip empty line
                readLine(text, context);
                // Read the response
                var response = readResponse(text, context, delimiter);
                try {
                    if (response.statusCode >= 200 && response.statusCode <= 299) {
                        partHandler(context.handlerContext).read(response, context.handlerContext);
                    } else {
                        // Keep track of failed responses and continue processing the batch.
                        response = { message: "HTTP request failed", response: response };
                    }
                } catch (e) {
                    response = e;
                }

                responses.push(response);
            }

            partEnd = text.substr(context.position, 2);

            // Ignore the incoming line.
            readLine(text, context);
        }
        return responses;
    };

    var readHeaders = function (text, context) {
        /// <summary>
        /// Parses the http headers in the text from the position defined by the context.  
        /// </summary>
        /// <param name="text" type="String" optional="false">Text containing an http response's headers</param>
        /// <param name="context">Context used for parsing.</param>
        /// <returns>Object containing the headers as key value pairs.</returns>
        /// <remarks>
        /// This function doesn't support split headers and it will stop reading when it hits two consecutive line breaks.
        /// </remarks>

        var headers = {};
        var parts;
        var line;
        var pos;
        
        do {
            pos = context.position;
            line = readLine(text, context);
            parts = responseHeaderRegex.exec(line);
            if (parts !== null) {
                headers[parts[1]] = parts[2];
            } else {
              // Whatever was found is not a header, so reset the context position.
              context.position = pos;
            }
        } while (line && parts);

        normalizeHeaders(headers);

        return headers;
    };

    var readResponse = function (text, context, delimiter) {
        /// <summary>
        /// Parses an HTTP response. 
        /// </summary>
        /// <param name="text" type="String" optional="false">Text representing the http response.</param>
        /// <param name="context" optional="false">Context used for parsing.</param>
        /// <param name="delimiter" type="String" optional="false">String used as delimiter of the multipart response parts.</param>
        /// <returns>Object representing the http response.</returns>

        // Read the status line. 
        var pos = context.position;
        var match = responseStatusRegex.exec(readLine(text, context));

        var statusCode;
        var statusText;
        var headers;

        if (match) {
            statusCode = match[1];
            statusText = match[2];
            headers = readHeaders(text, context);
            readLine(text, context);
        } else {
            context.position = pos;
        }

         return {
            statusCode: statusCode,
            statusText: statusText,
            headers: headers,
            body: readTo(text, context, "\r\n" + delimiter)
        };
    };

    var readLine = function (text, context) {
        /// <summary>
        /// Returns a substring from the position defined by the context up to the next line break (CRLF).
        /// </summary>
        /// <param name="text" type="String" optional="false">Input string.</param>
        /// <param name="context" optional="false">Context used for reading the input string.</param>
        /// <returns type="String">Substring to the first ocurrence of a line break or null if none can be found. </returns>

        return readTo(text, context, "\r\n");
    };

    var readTo = function (text, context, str) {
        /// <summary>
        /// Returns a substring from the position given by the context up to value defined by the str parameter and increments the position in the context.
        /// </summary>
        /// <param name="text" type="String" optional="false">Input string.</param>
        /// <param name="context" type="Object" optional="false">Context used for reading the input string.</param>
        /// <param name="str" type="String" optional="true">Substring to read up to.</param>
        /// <returns type="String">Substring to the first ocurrence of str or the end of the input string if str is not specified. Null if the marker is not found.</returns>

        var start = context.position || 0;
        var end = text.length;
        if (str) {
            end = text.indexOf(str, start);
            if (end === -1) {
                return null;
            }
            context.position = end + str.length;
        } else {
            context.position = end;
        }

        return text.substring(start, end);
    };

    var writeBatch = function (data, context) {
        /// <summary>
        /// Serializes a batch request object to a string.
        /// </summary>
        /// <param name="data" optional="false">Batch request object in payload representation format</param>
        /// <param name="context" optional="false">Context used for the serialization</param>
        /// <returns type="String">String representing the batch request</returns>

        var type = payloadTypeOf(data);
        if (type !== PAYLOADTYPE_BATCH) {
            throw { message: "Serialization of batches of type \"" + type + "\" is not supported" };
        }

        var batchBoundary = createBoundary("batch_");
        var batchParts = data.__batchRequests;
        var batch = "";
        var i, len;
        for (i = 0, len = batchParts.length; i < len; i++) {
            batch += writeBatchPartDelimiter(batchBoundary, false) +
                     writeBatchPart(batchParts[i], context);
        }
        batch += writeBatchPartDelimiter(batchBoundary, true);

        // Register the boundary with the request content type.
        var contentTypeProperties = context.contentType.properties;
        contentTypeProperties.boundary = batchBoundary;

        return batch;
    };

    var writeBatchPartDelimiter = function (boundary, close) {
        /// <summary>
        /// Creates the delimiter that indicates that start or end of an individual request.
        /// </summary>
        /// <param name="boundary" type="String" optional="false">Boundary string used to indicate the start of the request</param>
        /// <param name="close" type="Boolean">Flag indicating that a close delimiter string should be generated</param>
        /// <returns type="String">Delimiter string</returns>

        var result = "\r\n--" + boundary;
        if (close) {
            result += "--";
        }

        return result + "\r\n";
    };

    var writeBatchPart = function (part, context, nested) {
        /// <summary>
        /// Serializes a part of a batch request to a string. A part can be either a GET request or 
        /// a change set grouping several CUD (create, update, delete) requests.
        /// </summary>
        /// <param name="part" optional="false">Request or change set object in payload representation format</param>
        /// <param name="context" optional="false">Object containing context information used for the serialization</param>
        /// <param name="nested" type="boolean" optional="true">Flag indicating that the part is nested inside a change set</param>
        /// <returns type="String">String representing the serialized part</returns>
        /// <remarks>
        /// A change set is an array of request objects and they cannot be nested inside other change sets.
        /// </remarks>

        var changeSet = part.__changeRequests;
        var result;
        if (isArray(changeSet)) {
            if (nested) {
                throw { message: "Not Supported: change set nested in other change set" };
            }

            var changeSetBoundary = createBoundary("changeset_");
            result = "Content-Type: " + batchMediaType + "; boundary=" + changeSetBoundary + "\r\n";
            var i, len;
            for (i = 0, len = changeSet.length; i < len; i++) {
                result += writeBatchPartDelimiter(changeSetBoundary, false) +
                     writeBatchPart(changeSet[i], context, true);
            }

            result += writeBatchPartDelimiter(changeSetBoundary, true);
        } else {
            result = "Content-Type: application/http\r\nContent-Transfer-Encoding: binary\r\n\r\n";
            prepareRequest(part, partHandler(context), { metadata: context.metadata });
            result += writeRequest(part);
        }

        return result;
    };

    var writeRequest = function (request) {
        /// <summary>
        /// Serializes a request object to a string.
        /// </summary>
        /// <param name="request" optional="false">Request object to serialize</param>
        /// <returns type="String">String representing the serialized request</returns>

        var result = (request.method ? request.method : "GET") + " " + request.requestUri + " HTTP/1.1\r\n";
        for (var name in request.headers) {
            if (request.headers[name]) {
                result = result + name + ": " + request.headers[name] + "\r\n";
            }
        }

        result += "\r\n";

        if (request.body) {
            result += request.body;
        }

        return result;
    };

    odata.batchHandler = handler(batchParser, batchSerializer, batchMediaType, MAX_DATA_SERVICE_VERSION);



    var handlers = [odata.jsonHandler, odata.atomHandler, odata.xmlHandler, odata.textHandler];

    var dispatchHandler = function (handlerMethod, requestOrResponse, context) {
        /// <summary>Dispatches an operation to handlers.</summary>
        /// <param name="handlerMethod" type="String">Name of handler method to invoke.</param>
        /// <param name="requestOrResponse" type="Object">request/response argument for delegated call.</param>
        /// <param name="context" type="Object">context argument for delegated call.</param>

        var i, len;
        for (i = 0, len = handlers.length; i < len && !handlers[i][handlerMethod](requestOrResponse, context); i++) {
        }

        if (i === len) {
            throw { message: "no handler for data" };
        }
    };

    odata.defaultSuccess = function (data) {
        /// <summary>Default success handler for OData.</summary>
        /// <param name="data">Data to process.</param>

        window.alert(window.JSON.stringify(data));
    };

    odata.defaultError = throwErrorCallback;

    odata.defaultHandler = {
        read: function (response, context) {
            /// <summary>Reads the body of the specified response by delegating to JSON and ATOM handlers.</summary>
            /// <param name="response">Response object.</param>
            /// <param name="context">Operation context.</param>

            if (response && assigned(response.body) && response.headers["Content-Type"]) {
                dispatchHandler("read", response, context);
            }
        },

        write: function (request, context) {
            /// <summary>Write the body of the specified request by delegating to JSON and ATOM handlers.</summary>
            /// <param name="request">Reques tobject.</param>
            /// <param name="context">Operation context.</param>

            dispatchHandler("write", request, context);
        },

        maxDataServiceVersion: MAX_DATA_SERVICE_VERSION,
        accept: "application/atomsvc+xml;q=0.8, application/json;odata=verbose;q=0.5, */*;q=0.1"
    };

    odata.defaultMetadata = [];

    odata.read = function (urlOrRequest, success, error, handler, httpClient, metadata) {
        /// <summary>Reads data from the specified URL.</summary>
        /// <param name="urlOrRequest">URL to read data from.</param>
        /// <param name="success" type="Function" optional="true">Callback for a successful read operation.</param>
        /// <param name="error" type="Function" optional="true">Callback for handling errors.</param>
        /// <param name="handler" type="Object" optional="true">Handler for data serialization.</param>
        /// <param name="httpClient" type="Object" optional="true">HTTP client layer.</param>
        /// <param name="metadata" type="Object" optional="true">Conceptual metadata for this request.</param>

        var request;
        if (urlOrRequest instanceof String || typeof urlOrRequest === "string") {
            request = { requestUri: urlOrRequest };
        } else {
            request = urlOrRequest;
        }

        return odata.request(request, success, error, handler, httpClient, metadata);
    };

    odata.request = function (request, success, error, handler, httpClient, metadata) {
        /// <summary>Sends a request containing OData payload to a server.</summary>
        /// <param name="request" type="Object">Object that represents the request to be sent.</param>
        /// <param name="success" type="Function" optional="true">Callback for a successful read operation.</param>
        /// <param name="error" type="Function" optional="true">Callback for handling errors.</param>
        /// <param name="handler" type="Object" optional="true">Handler for data serialization.</param>
        /// <param name="httpClient" type="Object" optional="true">HTTP client layer.</param>
        /// <param name="metadata" type="Object" optional="true">Conceptual metadata for this request.</param>

        if (!success) {
            success = odata.defaultSuccess;
        }

        if (!error) {
            error = odata.defaultError;
        }

        if (!handler) {
            handler = odata.defaultHandler;
        }

        if (!httpClient) {
            httpClient = odata.defaultHttpClient;
        }

        if (!metadata) {
            metadata = odata.defaultMetadata;
        }

        // Augment the request with additional defaults.
        request.recognizeDates = defined(request.recognizeDates, odata.jsonHandler.recognizeDates);
        request.callbackParameterName = defined(request.callbackParameterName, odata.defaultHttpClient.callbackParameterName);
        request.formatQueryString = defined(request.formatQueryString, odata.defaultHttpClient.formatQueryString);
        request.enableJsonpCallback = defined(request.enableJsonpCallback, odata.defaultHttpClient.enableJsonpCallback);

        // Create the base context for read/write operations, also specifying complete settings.
        var context = {
            metadata: metadata,
            recognizeDates: request.recognizeDates,
            callbackParameterName: request.callbackParameterName,
            formatQueryString: request.formatQueryString,
            enableJsonpCallback: request.enableJsonpCallback
        };

        try {
            prepareRequest(request, handler, context);
            return invokeRequest(request, success, error, handler, httpClient, context);
        } catch (err) {
            error(err);
        }
    };

    // Configure the batch handler to use the default handler for the batch parts.
    odata.batchHandler.partHandler = odata.defaultHandler;



    var localStorage = window.localStorage;

    var domStoreDateToJSON = function () {
        /// <summary>Converts a Date object into an object representation friendly to JSON serialization.</summary>
        /// <returns type="Object">Object that represents the Date.</returns>
        /// <remarks>
        ///   This method is used to override the Date.toJSON method and is called only by
        ///   JSON.stringify.  It should never be called directly.
        /// </remarks>

        var newValue = { v: this.valueOf(), t: "[object Date]" };
        // Date objects might have extra properties on them so we save them.
        for (var name in this) {
            newValue[name] = this[name];
        }
        return newValue;
    };

    var domStoreJSONToDate = function (_, value) {
        /// <summary>JSON reviver function for converting an object representing a Date in a JSON stream to a Date object</summary>
        /// <param value="Object">Object to convert.</param>
        /// <returns type="Date">Date object.</returns>
        /// <remarks>
        ///   This method is used during JSON parsing and invoked only by the reviver function. 
        ///   It should never be called directly.
        /// </remarks>

        if (value && value.t === "[object Date]") {
            var newValue = new Date(value.v);
            for (var name in value) {
                if (name !== "t" && name !== "v") {
                    newValue[name] = value[name];
                }
            }
            value = newValue;
        }
        return value;
    };

    var qualifyDomStoreKey = function (store, key) {
        /// <summary>Qualifies the key with the name of the store.</summary>
        /// <param name="store" type="Object">Store object whose name will be used for qualifying the key.</param>
        /// <param name="key" type="String">Key string.</param>
        /// <returns type="String">Fully qualified key string.</returns>

        return store.name + "#!#" + key;
    };

    var unqualifyDomStoreKey = function (store, key) {
        /// <summary>Gets the key part of a fully qualified key string.</summary>
        /// <param name="store" type="Object">Store object whose name will be used for qualifying the key.</param>
        /// <param name="key" type="String">Fully qualified key string.</param>
        /// <returns type="String">Key part string</returns>

        return key.replace(store.name + "#!#", "");
    };

    var DomStore = function (name) {
        /// <summary>Constructor for store objects that use DOM storage as the underlying mechanism.</summary>
        /// <param name="name" type="String">Store name.</param>
        this.name = name;
    };

    DomStore.create = function (name) {
        /// <summary>Creates a store object that uses DOM Storage as its underlying mechanism.</summary>
        /// <param name="name" type="String">Store name.</param>
        /// <returns type="Object">Store object.</returns>

        if (DomStore.isSupported()) {
            return new DomStore(name);
        }

        throw { message: "Web Storage not supported by the browser" };
    };

    DomStore.isSupported = function () {
        /// <summary>Checks whether the underlying mechanism for this kind of store objects is supported by the browser.</summary>
        /// <returns type="Boolean">True if the mechanism is supported by the browser; otherwise false.</summary>
        return !!localStorage;
    };

    DomStore.prototype.add = function (key, value, success, error) {
        /// <summary>Adds a new value identified by a key to the store.</summary>
        /// <param name="key" type="String">Key string.</param>
        /// <param name="value">Value that is going to be added to the store.</param>
        /// <param name="success" type="Function" optional="no">Callback for a successful add operation.</param>
        /// <param name="error" type="Function" optional="yes">Callback for handling errors. If not specified then store.defaultError is invoked.</param>
        /// <remarks>
        ///    This method errors out if the store already contains the specified key.
        /// </remarks>

        error = error || this.defaultError;
        var store = this;
        this.contains(key, function (contained) {
            if (!contained) {
                store.addOrUpdate(key, value, success, error);
            } else {
                delay(error, { message: "key already exists", key: key });
            }
        }, error);
    };

    DomStore.prototype.addOrUpdate = function (key, value, success, error) {
        /// <summary>Adds or updates a value identified by a key to the store.</summary>
        /// <param name="key" type="String">Key string.</param>
        /// <param name="value">Value that is going to be added or updated to the store.</param>
        /// <param name="success" type="Function" optional="no">Callback for a successful add or update operation.</param>
        /// <param name="error" type="Function" optional="yes">Callback for handling errors. If not specified then store.defaultError is invoked.</param>
        /// <remarks>
        ///   This method will overwrite the key's current value if it already exists in the store; otherwise it simply adds the new key and value.
        /// </remarks>

        error = error || this.defaultError;

        if (key instanceof Array) {
            error({ message: "Array of keys not supported" });
        } else {
            var fullKey = qualifyDomStoreKey(this, key);
            var oldDateToJSON = Date.prototype.toJSON;
            try {
                var storedValue = value;
                if (storedValue !== undefined) {
                    // Dehydrate using json
                    Date.prototype.toJSON = domStoreDateToJSON;
                    storedValue = window.JSON.stringify(value);
                }
                // Save the json string.
                localStorage.setItem(fullKey, storedValue);
                delay(success, key, value);
            }
            catch (e) {
                if (e.code === 22 || e.number === 0x8007000E) {
                    delay(error, { name: "QUOTA_EXCEEDED_ERR", error: e });
                } else {
                    delay(error, e);
                }
            }
            finally {
                Date.prototype.toJSON = oldDateToJSON;
            }
        }
    };

    DomStore.prototype.clear = function (success, error) {
        /// <summary>Removes all the data associated with this store object.</summary>
        /// <param name="success" type="Function" optional="no">Callback for a successful clear operation.</param>
        /// <param name="error" type="Function" optional="yes">Callback for handling errors. If not specified then store.defaultError is invoked.</param>
        /// <remarks>
        ///    In case of an error, this method will not restore any keys that might have been deleted at that point.
        /// </remarks>

        error = error || this.defaultError;
        try {
            var i = 0, len = localStorage.length;
            while (len > 0 && i < len) {
                var fullKey = localStorage.key(i);
                var key = unqualifyDomStoreKey(this, fullKey);
                if (fullKey !== key) {
                    localStorage.removeItem(fullKey);
                    len = localStorage.length;
                } else {
                    i++;
                }
            };
            delay(success);
        }
        catch (e) {
            delay(error, e);
        }
    };

    DomStore.prototype.close = function () {
        /// <summary>This function does nothing in DomStore as it does not have a connection model</summary>
    };

    DomStore.prototype.contains = function (key, success, error) {
        /// <summary>Checks whether a key exists in the store.</summary>
        /// <param name="key" type="String">Key string.</param>
        /// <param name="success" type="Function" optional="no">Callback indicating whether the store contains the key or not.</param>
        /// <param name="error" type="Function" optional="yes">Callback for handling errors. If not specified then store.defaultError is invoked.</param>
        error = error || this.defaultError;
        try {
            var fullKey = qualifyDomStoreKey(this, key);
            var value = localStorage.getItem(fullKey);
            delay(success, value !== null);
        } catch (e) {
            delay(error, e);
        }
    };

    DomStore.prototype.defaultError = throwErrorCallback;

    DomStore.prototype.getAllKeys = function (success, error) {
        /// <summary>Gets all the keys that exist in the store.</summary>
        /// <param name="success" type="Function" optional="no">Callback for a successful get operation.</param>
        /// <param name="error" type="Function" optional="yes">Callback for handling errors. If not specified then store.defaultError is invoked.</param>

        error = error || this.defaultError;

        var results = [];
        var i, len;

        try {
            for (i = 0, len = localStorage.length; i < len; i++) {
                var fullKey = localStorage.key(i);
                var key = unqualifyDomStoreKey(this, fullKey);
                if (fullKey !== key) {
                    results.push(key);
                }
            }
            delay(success, results);
        }
        catch (e) {
            delay(error, e);
        }
    };

    /// <summary>Identifies the underlying mechanism used by the store.</summary>
    DomStore.prototype.mechanism = "dom";

    DomStore.prototype.read = function (key, success, error) {
        /// <summary>Reads the value associated to a key in the store.</summary>
        /// <param name="key" type="String">Key string.</param>
        /// <param name="success" type="Function" optional="no">Callback for a successful reads operation.</param>
        /// <param name="error" type="Function" optional="yes">Callback for handling errors. If not specified then store.defaultError is invoked.</param>
        error = error || this.defaultError;

        if (key instanceof Array) {
            error({ message: "Array of keys not supported" });
        } else {
            try {
                var fullKey = qualifyDomStoreKey(this, key);
                var value = localStorage.getItem(fullKey);
                if (value !== null && value !== "undefined") {
                    // Hydrate using json
                    value = window.JSON.parse(value, domStoreJSONToDate);
                }
                else {
                    value = undefined;
                }
                delay(success, key, value);
            } catch (e) {
                delay(error, e);
            }
        }
    };

    DomStore.prototype.remove = function (key, success, error) {
        /// <summary>Removes a key and its value from the store.</summary>
        /// <param name="key" type="String">Key string.</param>
        /// <param name="success" type="Function" optional="no">Callback for a successful remove operation.</param>
        /// <param name="error" type="Function" optional="yes">Callback for handling errors. If not specified then store.defaultError is invoked.</param>
        error = error || this.defaultError;

        if (key instanceof Array) {
            error({ message: "Batches not supported" });
        } else {
            try {
                var fullKey = qualifyDomStoreKey(this, key);
                localStorage.removeItem(fullKey);
                delay(success);
            } catch (e) {
                delay(error, e);
            }
        }
    };

    DomStore.prototype.update = function (key, value, success, error) {
        /// <summary>Updates the value associated to a key in the store.</summary>
        /// <param name="key" type="String">Key string.</param>
        /// <param name="value">New value.</param>
        /// <param name="success" type="Function" optional="no">Callback for a successful update operation.</param>
        /// <param name="error" type="Function" optional="yes">Callback for handling errors. If not specified then store.defaultError is invoked.</param>
        /// <remarks>
        ///    This method errors out if the specified key is not found in the store.
        /// </remarks>

        error = error || this.defaultError;
        var store = this;
        this.contains(key, function (contained) {
            if (contained) {
                store.addOrUpdate(key, value, success, error);
            } else {
                delay(error, { message: "key not found", key: key });
            }
        }, error);
    };



    var mozIndexedDB = window.mozIndexedDB;

    var IDBTransaction = window.IDBTransaction;
    var IDBKeyRange = window.IDBKeyRange;

    var getError = function (error, defaultError) {
        /// <summary>Returns either a specific error handler or the default error handler</summary>
        /// <param name="error" type="Function">The specific error handler</param>
        /// <param name="defaultError" type="Function">The default error handler</param>
        /// <returns type="Function">The error callback</returns>
        return function (e) {
            if (e.code === 11 /* IndexedDb disk quota exceeded */) {
                e = { name: "QUOTA_EXCEEDED_ERR", error: e };
            }

            if (error) {
                error(e);
            } else if (defaultError) {
                defaultError(e);
            }
        };
    };

    var openTransaction = function (store, mode, success, error) {
        /// <summary>Opens a new transaction to the store</summary>
        /// <param name="store" type="IndexedDBStore">The store object</param>
        /// <param name="mode" type="Short">The read/write mode of the transaction (constants from IDBTransaction)</param>
        /// <param name="success" type="Function">The success callback</param>
        /// <param name="error" type="Function">The error callback</param>
        var name = store.name;
        var db = store.db;
        var errorCallback = getError(error, store.defaultError);

        if (db) {
            success(db.transaction(name, mode));
        } else {
            var request = mozIndexedDB.open("_datajs_" + name);
            request.onsuccess = function (event) {
                db = store.db = event.target.result;
                if (!db.objectStoreNames.contains(name)) {
                    var versionRequest = db.setVersion("1.0");
                    versionRequest.onsuccess = function () {
                        db.createObjectStore(name, null, false);
                        success(db.transaction(name, mode));
                    };
                    versionRequest.onerror = errorCallback;
                    versionRequest.onblocked = errorCallback;
                } else {
                    success(db.transaction(name, mode));
                }
            };
            request.onerror = getError(error, this.defaultError);
        }
    };

    var IndexedDBStore = function (name) {
        /// <summary>Creates a new IndexedDBStore.</summary>
        /// <param name="name" type="String">The name of the store.</param>
        /// <returns type="Object">The new IndexedDBStore.</returns>
        this.name = name;
    };

    IndexedDBStore.create = function (name) {
        /// <summary>Creates a new IndexedDBStore.</summary>
        /// <param name="name" type="String">The name of the store.</param>
        /// <returns type="Object">The new IndexedDBStore.</returns>
        if (IndexedDBStore.isSupported()) {
            return new IndexedDBStore(name);
        }

        throw { message: "IndexedDB is not supported on this browser" };
    };

    IndexedDBStore.isSupported = function () {
        /// <summary>Returns whether IndexedDB is supported.</summary>
        /// <returns type="Boolean">True if IndexedDB is supported, false otherwise.</returns>
        return !!mozIndexedDB;
    };

    IndexedDBStore.prototype.add = function (key, value, success, error) {
        /// <summary>Adds a key/value pair to the store</summary>
        /// <param name="key" type="String">The key</param>
        /// <param name="value" type="Object">The value</param>
        /// <param name="success" type="Function">The success callback</param>
        /// <param name="error" type="Function">The error callback</param>
        var name = this.name;
        var defaultError = this.defaultError;
        var keys = [];
        var values = [];

        if (key instanceof Array) {
            keys = key;
            values = value;
        } else {
            keys = [key];
            values = [value];
        }

        openTransaction(this, IDBTransaction.READ_WRITE, function (transaction) {
            transaction.onabort = getError(error, defaultError);
            transaction.oncomplete = function () {
                if (key instanceof Array) {
                    success(keys, values);
                } else {
                    success(key, value);
                }
            };

            for (var i = 0; i < keys.length && i < values.length; i++) {
                transaction.objectStore(name).add(values[i], keys[i]);
            }
        }, error);
    };

    IndexedDBStore.prototype.addOrUpdate = function (key, value, success, error) {
        /// <summary>Adds or updates a key/value pair in the store</summary>
        /// <param name="key" type="String">The key</param>
        /// <param name="value" type="Object">The value</param>
        /// <param name="success" type="Function">The success callback</param>
        /// <param name="error" type="Function">The error callback</param>
        var name = this.name;
        var defaultError = this.defaultError;
        var keys = [];
        var values = [];

        if (key instanceof Array) {
            keys = key;
            values = value;
        } else {
            keys = [key];
            values = [value];
        }

        openTransaction(this, IDBTransaction.READ_WRITE, function (transaction) {
            transaction.onabort = getError(error, defaultError);
            transaction.oncomplete = function () {
                if (key instanceof Array) {
                    success(keys, values);
                } else {
                    success(key, value);
                }
            };

            for (var i = 0; i < keys.length && i < values.length; i++) {
                transaction.objectStore(name).put(values[i], keys[i]);
            }
        }, error);
    };

    IndexedDBStore.prototype.clear = function (success, error) {
        /// <summary>Clears the store</summary>
        /// <param name="success" type="Function">The success callback</param>
        /// <param name="error" type="Function">The error callback</param>
        var name = this.name;
        var defaultError = this.defaultError;
        openTransaction(this, IDBTransaction.READ_WRITE, function (transaction) {
            transaction.onerror = getError(error, defaultError);
            transaction.oncomplete = function () {
                success();
            };

            transaction.objectStore(name).clear();
        }, error);
    };

    IndexedDBStore.prototype.close = function () {
        /// <summary>Closes the connection to the database</summary>
        if (this.db) {
            this.db.close();
            this.db = null;
        }
    };

    IndexedDBStore.prototype.contains = function (key, success, error) {
        /// <summary>Returns whether the store contains a key</summary>
        /// <param name="key" type="String">The key</param>
        /// <param name="success" type="Function">The success callback</param>
        /// <param name="error" type="Function">The error callback</param>
        var name = this.name;
        var defaultError = this.defaultError;
        openTransaction(this, IDBTransaction.READ_ONLY, function (transaction) {
            var request = transaction.objectStore(name).openCursor(IDBKeyRange.only(key));
            transaction.oncomplete = function () {
                success(request.result !== undefined);
            };
            transaction.onerror = getError(error, defaultError);
        }, error);
    };

    IndexedDBStore.prototype.defaultError = throwErrorCallback;

    IndexedDBStore.prototype.getAllKeys = function (success, error) {
        /// <summary>Gets all the keys from the store</summary>
        /// <param name="success" type="Function">The success callback</param>
        /// <param name="error" type="Function">The error callback</param>
        var name = this.name;
        var defaultError = this.defaultError;
        openTransaction(this, IDBTransaction.READ_ONLY, function (transaction) {
            var results = [];

            transaction.oncomplete = function () {
                success(results);
            };

            var request = transaction.objectStore(name).openCursor();

            request.onerror = getError(error, defaultError);
            request.onsuccess = function (event) {
                var cursor = event.target.result;
                if (cursor) {
                    results.push(cursor.key);
                    // Some tools have issues because continue is a javascript reserved word. 
                    cursor["continue"].call(cursor);
                }
            };
        }, error);
    };

    /// <summary>Identifies the underlying mechanism used by the store.</summary>
    IndexedDBStore.prototype.mechanism = "indexeddb";

    IndexedDBStore.prototype.read = function (key, success, error) {
        /// <summary>Reads the value for the specified key</summary>
        /// <param name="key" type="String">The key</param>
        /// <param name="success" type="Function">The success callback</param>
        /// <param name="error" type="Function">The error callback</param>
        /// <remarks>If the key does not exist, the success handler will be called with value = undefined</remarks>
        var name = this.name;
        var defaultError = this.defaultError;
        var keys = (key instanceof Array) ? key : [key];

        openTransaction(this, IDBTransaction.READ_WRITE, function (transaction) {
            var values = [];

            transaction.onerror = getError(error, defaultError);
            transaction.oncomplete = function () {
                if (key instanceof Array) {
                    success(keys, values);
                } else {
                    success(keys[0], values[0]);
                }
            };

            for (var i = 0; i < keys.length; i++) {
                // Some tools have issues because get is a javascript reserved word. 
                var objectStore = transaction.objectStore(name);
                var request = objectStore["get"].call(objectStore, keys[i]);
                request.onsuccess = function (event) {
                    values.push(event.target.result);
                };
            }
        }, error);
    };

    IndexedDBStore.prototype.remove = function (key, success, error) {
        /// <summary>Removes the specified from the store</summary>
        /// <param name="key" type="String">The key</param>
        /// <param name="success" type="Function">The success callback</param>
        /// <param name="error" type="Function">The error callback</param>
        var name = this.name;
        var defaultError = this.defaultError;
        var keys = (key instanceof Array) ? key : [key];

        openTransaction(this, IDBTransaction.READ_WRITE, function (transaction) {
            transaction.onerror = getError(error, defaultError);
            transaction.oncomplete = function () {
                success();
            };

            for (var i = 0; i < keys.length; i++) {
                // Some tools have issues because continue is a javascript reserved word. 
                var objectStore = transaction.objectStore(name);
                objectStore["delete"].call(objectStore, keys[i]);
            }
        }, error);
    };

    IndexedDBStore.prototype.update = function (key, value, success, error) {
        /// <summary>Updates a key/value pair in the store</summary>
        /// <param name="key" type="String">The key</param>
        /// <param name="value" type="Object">The value</param>
        /// <param name="success" type="Function">The success callback</param>
        /// <param name="error" type="Function">The error callback</param>
        var name = this.name;
        var defaultError = this.defaultError;
        var keys = [];
        var values = [];

        if (key instanceof Array) {
            keys = key;
            values = value;
        } else {
            keys = [key];
            values = [value];
        }

        openTransaction(this, IDBTransaction.READ_WRITE, function (transaction) {
            transaction.onabort = getError(error, defaultError);
            transaction.oncomplete = function () {
                if (key instanceof Array) {
                    success(keys, values);
                } else {
                    success(key, value);
                }
            };

            for (var i = 0; i < keys.length && i < values.length; i++) {
                var request = transaction.objectStore(name).openCursor(IDBKeyRange.only(keys[i]));
                request.pair = { key: keys[i], value: values[i] };
                request.onsuccess = function (event) {
                    var cursor = event.target.result;
                    if (cursor) {
                        cursor.update(event.target.pair.value);
                    } else {
                        transaction.abort();
                    }
                };
            }
        }, error);
    };



    var MemoryStore = function (name) {
        /// <summary>Constructor for store objects that use a sorted array as the underlying mechanism.</summary>
        /// <param name="name" type="String">Store name.</param>

        var holes = [];
        var items = [];
        var keys = {};

        this.name = name;

        var getErrorCallback = function (error) {
            return error || this.defaultError;
        };

        var validateKeyInput = function (key, error) {
            /// <summary>Validates that the specified key is not undefined, not null, and not an array</summary>
            /// <param name="key">Key value.</param>
            /// <param name="error" type="Function">Error callback.</param>
            /// <returns type="Boolean">True if the key is valid. False if the key is invalid and the error callback has been queued for execution.</returns>

            var messageString;

            if (key instanceof Array) {
                messageString = "Array of keys not supported";
            }

            if (key === undefined || key === null) {
                messageString = "Invalid key";
            }

            if (messageString) {
                delay(error, { message: messageString });
                return false;
            }
            return true;
        };

        this.add = function (key, value, success, error) {
            /// <summary>Adds a new value identified by a key to the store.</summary>
            /// <param name="key" type="String">Key string.</param>
            /// <param name="value">Value that is going to be added to the store.</param>
            /// <param name="success" type="Function" optional="no">Callback for a successful add operation.</param>
            /// <param name="error" type="Function" optional="yes">Callback for handling errors. If not specified then store.defaultError is invoked.</param>
            /// <remarks>
            ///    This method errors out if the store already contains the specified key.
            /// </remarks>

            error = getErrorCallback(error);

            if (validateKeyInput(key, error)) {
                if (!keys.hasOwnProperty(key)) {
                    this.addOrUpdate(key, value, success, error);
                } else {
                    error({ message: "key already exists", key: key });
                }
            }
        };

        this.addOrUpdate = function (key, value, success, error) {
            /// <summary>Adds or updates a value identified by a key to the store.</summary>
            /// <param name="key" type="String">Key string.</param>
            /// <param name="value">Value that is going to be added or updated to the store.</param>
            /// <param name="success" type="Function" optional="no">Callback for a successful add or update operation.</param>
            /// <param name="error" type="Function" optional="yes">Callback for handling errors. If not specified then store.defaultError is invoked.</param>
            /// <remarks>
            ///   This method will overwrite the key's current value if it already exists in the store; otherwise it simply adds the new key and value.
            /// </remarks>

            error = getErrorCallback(error);

            if (validateKeyInput(key, error)) {
                var index = keys[key];
                if (index === undefined) {
                    if (holes.length > 0) {
                        index = holes.splice(0, 1);
                    } else {
                        index = items.length;
                    }
                }
                items[index] = value;
                keys[key] = index;
                delay(success, key, value);
            }
        };

        this.clear = function (success) {
            /// <summary>Removes all the data associated with this store object.</summary>
            /// <param name="success" type="Function" optional="no">Callback for a successful clear operation.</param>

            items = [];
            keys = {};
            holes = [];

            delay(success);
        };

        this.contains = function (key, success) {
            /// <summary>Checks whether a key exists in the store.</summary>
            /// <param name="key" type="String">Key string.</param>
            /// <param name="success" type="Function" optional="no">Callback indicating whether the store contains the key or not.</param>

            var contained = keys.hasOwnProperty(key);
            delay(success, contained);
        };

        this.getAllKeys = function (success) {
            /// <summary>Gets all the keys that exist in the store.</summary>
            /// <param name="success" type="Function" optional="no">Callback for a successful get operation.</param>

            var results = [];
            for (var name in keys) {
                results.push(name);
            }
            delay(success, results);
        };

        this.read = function (key, success, error) {
            /// <summary>Reads the value associated to a key in the store.</summary>
            /// <param name="key" type="String">Key string.</param>
            /// <param name="success" type="Function" optional="no">Callback for a successful reads operation.</param>
            /// <param name="error" type="Function" optional="yes">Callback for handling errors. If not specified then store.defaultError is invoked.</param>
            error = getErrorCallback(error);

            if (validateKeyInput(key, error)) {
                var index = keys[key];
                delay(success, key, items[index]);
            }
        };

        this.remove = function (key, success, error) {
            /// <summary>Removes a key and its value from the store.</summary>
            /// <param name="key" type="String">Key string.</param>
            /// <param name="success" type="Function" optional="no">Callback for a successful remove operation.</param>
            /// <param name="error" type="Function" optional="yes">Callback for handling errors. If not specified then store.defaultError is invoked.</param>
            error = getErrorCallback(error);

            if (validateKeyInput(key, error)) {
                var index = keys[key];
                if (index !== undefined) {
                    if (index === items.length - 1) {
                        items.pop();
                    } else {
                        items[index] = undefined;
                        holes.push(index);
                    }
                    delete keys[key];

                    // The last item was removed, no need to keep track of any holes in the array.
                    if (items.length === 0) {
                        holes = [];
                    }
                }

                delay(success);
            }
        };

        this.update = function (key, value, success, error) {
            /// <summary>Updates the value associated to a key in the store.</summary>
            /// <param name="key" type="String">Key string.</param>
            /// <param name="value">New value.</param>
            /// <param name="success" type="Function" optional="no">Callback for a successful update operation.</param>
            /// <param name="error" type="Function" optional="yes">Callback for handling errors. If not specified then store.defaultError is invoked.</param>
            /// <remarks>
            ///    This method errors out if the specified key is not found in the store.
            /// </remarks>

            error = getErrorCallback(error);
            if (validateKeyInput(key, error)) {
                if (keys.hasOwnProperty(key)) {
                    this.addOrUpdate(key, value, success, error);
                } else {
                    error({ message: "key not found", key: key });
                }
            }
        };
    };

    MemoryStore.create = function (name) {
        /// <summary>Creates a store object that uses memory storage as its underlying mechanism.</summary>
        /// <param name="name" type="String">Store name.</param>
        /// <returns type="Object">Store object.</returns>
        return new MemoryStore(name);
    };

    MemoryStore.isSupported = function () {
        /// <summary>Checks whether the underlying mechanism for this kind of store objects is supported by the browser.</summary>
        /// <returns type="Boolean">True if the mechanism is supported by the browser; otherwise false.</returns>
        return true;
    };

    MemoryStore.prototype.close = function () {
        /// <summary>This function does nothing in MemoryStore as it does not have a connection model.</summary>
    };

    MemoryStore.prototype.defaultError = throwErrorCallback;

    /// <summary>Identifies the underlying mechanism used by the store.</summary>
    MemoryStore.prototype.mechanism = "memory";



    var mechanisms = {
        indexeddb: IndexedDBStore,
        dom: DomStore,
        memory: MemoryStore
    };

    datajs.defaultStoreMechanism = "best";

    datajs.createStore = function (name, mechanism) {
        /// <summary>Creates a new store object.</summary>
        /// <param name="name" type="String">Store name.</param>
        /// <param name="mechanism" type="String" optional="true">A specific mechanism to use (defaults to best, can be "best", "dom", "indexeddb", "webdb").</param>
        /// <returns type="Object">Store object.</returns>

        if (!mechanism) {
            mechanism = datajs.defaultStoreMechanism;
        }

        if (mechanism === "best") {
            mechanism = (DomStore.isSupported()) ? "dom" : "memory";
        }

        var factory = mechanisms[mechanism];
        if (factory) {
            return factory.create(name);
        }

        throw { message: "Failed to create store", name: name, mechanism: mechanism };
    };




    var forwardCall = function (thisValue, name, returnValue) {
        /// <summary>Creates a new function to forward a call.</summary>
        /// <param name="thisValue" type="Object">Value to use as the 'this' object.</param>
        /// <param name="name" type="String">Name of function to forward to.</param>
        /// <param name="returnValue" type="Object">Return value for the forward call (helps keep identity when chaining calls).</param>
        /// <returns type="Function">A new function that will forward a call.</returns>

        return function () {
            thisValue[name].apply(thisValue, arguments);
            return returnValue;
        };
    };

    var DjsDeferred = function () {
        /// <summary>Initializes a new DjsDeferred object.</summary>
        /// <remarks>
        /// Compability Note A - Ordering of callbacks through chained 'then' invocations
        ///
        /// The Wiki entry at http://wiki.commonjs.org/wiki/Promises/A
        /// implies that .then() returns a distinct object.
        ////
        /// For compatibility with http://api.jquery.com/category/deferred-object/
        /// we return this same object. This affects ordering, as
        /// the jQuery version will fire callbacks in registration
        /// order regardless of whether they occur on the result
        /// or the original object.
        ///
        /// Compability Note B - Fulfillment value
        /// 
        /// The Wiki entry at http://wiki.commonjs.org/wiki/Promises/A
        /// implies that the result of a success callback is the
        /// fulfillment value of the object and is received by
        /// other success callbacks that are chained.
        ///
        /// For compatibility with http://api.jquery.com/category/deferred-object/
        /// we disregard this value instead.
        /// </remarks>

        this._arguments = undefined;
        this._done = undefined;
        this._fail = undefined;
        this._resolved = false;
        this._rejected = false;
    };

    DjsDeferred.prototype = {
        then: function (fulfilledHandler, errorHandler /*, progressHandler */) {
            /// <summary>Adds success and error callbacks for this deferred object.</summary>
            /// <param name="fulfilledHandler" type="Function" mayBeNull="true" optional="true">Success callback.</param>
            /// <param name="errorHandler" type="Function" mayBeNull="true" optional="true">Error callback.</param>
            /// <remarks>See Compatibility Note A.</remarks>

            if (fulfilledHandler) {
                if (!this._done) {
                    this._done = [fulfilledHandler];
                } else {
                    this._done.push(fulfilledHandler);
                }
            }

            if (errorHandler) {
                if (!this._fail) {
                    this._fail = [errorHandler];
                } else {
                    this._fail.push(errorHandler);
                }
            }

            //// See Compatibility Note A in the DjsDeferred constructor.
            //// if (!this._next) {
            ////    this._next = createDeferred();
            //// } 
            //// return this._next.promise();

            if (this._resolved) {
                this.resolve.apply(this, this._arguments);
            } else if (this._rejected) {
                this.reject.apply(this, this._arguments);
            }

            return this;
        },

        resolve: function (/* args */) {
            /// <summary>Invokes success callbacks for this deferred object.</summary>
            /// <remarks>All arguments are forwarded to success callbacks.</remarks>


            if (this._done) {
                var i, len;
                for (i = 0, len = this._done.length; i < len; i++) {
                    //// See Compability Note B - Fulfillment value.
                    //// var nextValue = 
                    this._done[i].apply(null, arguments);
                }

                //// See Compatibility Note A in the DjsDeferred constructor.
                //// this._next.resolve(nextValue);
                //// delete this._next;

                this._done = undefined;
                this._resolved = false;
                this._arguments = undefined;
            } else {
                this._resolved = true;
                this._arguments = arguments;
            }
        },

        reject: function (/* args */) {
            /// <summary>Invokes error callbacks for this deferred object.</summary>
            /// <remarks>All arguments are forwarded to error callbacks.</remarks>
            if (this._fail) {
                var i, len;
                for (i = 0, len = this._fail.length; i < len; i++) {
                    this._fail[i].apply(null, arguments);
                }

                this._fail = undefined;
                this._rejected = false;
                this._arguments = undefined;
            } else {
                this._rejected = true;
                this._arguments = arguments;
            }
        },

        promise: function () {
            /// <summary>Returns a version of this object that has only the read-only methods available.</summary>
            /// <returns>An object with only the promise object.</returns>

            var result = {};
            result.then = forwardCall(this, "then", result);
            return result;
        }
    };

    var createDeferred = function () {
        /// <summary>Creates a deferred object.</summary>
        /// <returns type="DjsDeferred">
        /// A new deferred object. If jQuery is installed, then a jQuery
        /// Deferred object is returned, which provides a superset of features.
        /// </returns>

        if (window.jQuery && window.jQuery.Deferred) {
            return new window.jQuery.Deferred();
        } else {
            return new DjsDeferred();
        }
    };



    var appendQueryOption = function (uri, queryOption) {
        /// <summary>Appends the specified escaped query option to the specified URI.</summary>
        /// <param name="uri" type="String">URI to append option to.</param>
        /// <param name="queryOption" type="String">Escaped query option to append.</param>
        var separator = (uri.indexOf("?") >= 0) ? "&" : "?";
        return uri + separator + queryOption;
    };

    var appendSegment = function (uri, segment) {
        /// <summary>Appends the specified segment to the given URI.</summary>
        /// <param name="uri" type="String">URI to append a segment to.</param>
        /// <param name="segment" type="String">Segment to append.</param>
        /// <returns type="String">The original URI with a new segment appended.</returns>

        var index = uri.indexOf("?");
        var queryPortion = "";
        if (index >= 0) {
            queryPortion = uri.substr(index);
            uri = uri.substr(0, index);
        }

        if (uri[uri.length - 1] !== "/") {
            uri += "/";
        }
        return uri + segment + queryPortion;
    };

    var buildODataRequest = function (uri, options) {
        /// <summary>Builds a request object to GET the specified URI.</summary>
        /// <param name="uri" type="String">URI for request.</param>
        /// <param name="options" type="Object">Additional options.</param>

        return {
            method: "GET",
            requestUri: uri,
            user: options.user,
            password: options.password,
            enableJsonpCallback: options.enableJsonpCallback,
            callbackParameterName: options.callbackParameterName,
            formatQueryString: options.formatQueryString
        };
    };

    var findQueryOptionStart = function (uri, name) {
        /// <summary>Finds the index where the value of a query option starts.</summary>
        /// <param name="uri" type="String">URI to search in.</param>
        /// <param name="name" type="String">Name to look for.</param>
        /// <returns type="Number">The index where the query option starts.</returns>

        var result = -1;
        var queryIndex = uri.indexOf("?");
        if (queryIndex !== -1) {
            var start = uri.indexOf("?" + name + "=", queryIndex);
            if (start === -1) {
                start = uri.indexOf("&" + name + "=", queryIndex);
            }
            if (start !== -1) {
                result = start + name.length + 2;
            }
        }
        return result;
    };

    var queryForData = function (uri, options, success, error) {
        /// <summary>Gets data from an OData service.</summary>
        /// <param name="uri" type="String">URI to the OData service.</param>
        /// <param name="options" type="Object">Object with additional well-known request options.</param>
        /// <param name="success" type="Function">Success callback.</param>
        /// <param name="error" type="Function">Error callback.</param>
        /// <returns type="Object">Object with an abort method.</returns>

        var request = queryForDataInternal(uri, options, [], success, error);
        return request;
    };

    var queryForDataInternal = function (uri, options, data, success, error) {
        /// <summary>Gets data from an OData service taking into consideration server side paging.</summary>
        /// <param name="uri" type="String">URI to the OData service.</param>
        /// <param name="options" type="Object">Object with additional well-known request options.</param>
        /// <param name="data" type="Array">Array that stores the data provided by the OData service.</param>
        /// <param name="success" type="Function">Success callback.</param>
        /// <param name="error" type="Function">Error callback.</param>
        /// <returns type="Object">Object with an abort method.</returns>

        var request = buildODataRequest(uri, options);
        var currentRequest = odata.request(request, function (newData) {
            var next = newData.__next;
            var results = newData.results;

            data = data.concat(results);

            if (next) {
                currentRequest = queryForDataInternal(next, options, data, success, error);
            } else {
                success(data);
            }
        }, error, undefined, options.httpClient, options.metadata);

        return {
            abort: function () {
                currentRequest.abort();
            }
        };
    };

    var ODataCacheSource = function (options) {
        /// <summary>Creates a data cache source object for requesting data from an OData service.</summary>
        /// <param name="options">Options for the cache data source.</param>
        /// <returns type="ODataCacheSource">A new data cache source instance.</returns>

        var that = this;
        var uri = options.source;
        
        that.identifier = normalizeURICase(encodeURI(decodeURI(uri)));
        that.options = options;

        that.count = function (success, error) {
            /// <summary>Gets the number of items in the collection.</summary>
            /// <param name="success" type="Function">Success callback with the item count.</param>
            /// <param name="error" type="Function">Error callback.</param>
            /// <returns type="Object">Request object with an abort method./<param>

            var options = that.options;
            return odata.request(
                buildODataRequest(appendSegment(uri, "$count"), options),
                function (data) {
                    var count = parseInt10(data.toString());
                    if (isNaN(count)) {
                        error({ message: "Count is NaN", count: count });
                    } else {
                        success(count);
                    }
                }, error, undefined, options.httpClient, options.metadata);
        };

        that.read = function (index, count, success, error) {
            /// <summary>Gets a number of consecutive items from the collection.</summary>
            /// <param name="index" type="Number">Zero-based index of the items to retrieve.</param>
            /// <param name="count" type="Number">Number of items to retrieve.</param>
            /// <param name="success" type="Function">Success callback with the requested items.</param>
            /// <param name="error" type="Function">Error callback.</param>
            /// <returns type="Object">Request object with an abort method./<param>

            var queryOptions = "$skip=" + index + "&$top=" + count;
            return queryForData(appendQueryOption(uri, queryOptions), that.options, success, error);
        };

        return that;
    };



    var appendPage = function (operation, page) {
        /// <summary>Appends a page's data to the operation data.</summary>
        /// <param name="operation" type="Object">Operation with (i)ndex, (c)ount and (d)ata.</param>
        /// <param name="page" type="Object">Page with (i)ndex, (c)ount and (d)ata.</param>

        var intersection = intersectRanges(operation, page);
        if (intersection) {
            var start = intersection.i - page.i;
            var end = start + (operation.c - operation.d.length);
            operation.d = operation.d.concat(page.d.slice(start, end));
        }
    };

    var intersectRanges = function (x, y) {
        /// <summary>Returns the {(i)ndex, (c)ount} range for the intersection of x and y.</summary>
        /// <param name="x" type="Object">Range with (i)ndex and (c)ount members.</param>
        /// <param name="y" type="Object">Range with (i)ndex and (c)ount members.</param>
        /// <returns type="Object">The intersection (i)ndex and (c)ount; undefined if there is no intersection.</returns>

        var xLast = x.i + x.c;
        var yLast = y.i + y.c;
        var resultIndex = (x.i > y.i) ? x.i : y.i;
        var resultLast = (xLast < yLast) ? xLast : yLast;
        var result;
        if (resultLast >= resultIndex) {
            result = { i: resultIndex, c: resultLast - resultIndex };
        }

        return result;
    };

    var checkZeroGreater = function (val, name) {
        /// <summary>Checks whether val is a defined number with value zero or greater.</summary>
        /// <param name="val" type="Number">Value to check.</param>
        /// <param name="name" type="String">Parameter name to use in exception.</param>

        if (val === undefined || typeof val !== "number") {
            throw { message: "'" + name + "' must be a number." };
        }

        if (isNaN(val) || val < 0 || !isFinite(val)) {
            throw { message: "'" + name + "' must be greater than or equal to zero." };
        }
    };

    var checkUndefinedGreaterThanZero = function (val, name) {
        /// <summary>Checks whether val is undefined or a number with value greater than zero.</summary>
        /// <param name="val" type="Number">Value to check.</param>
        /// <param name="name" type="String">Parameter name to use in exception.</param>

        if (val !== undefined) {
            if (typeof val !== "number") {
                throw { message: "'" + name + "' must be a number." };
            }

            if (isNaN(val) || val <= 0 || !isFinite(val)) {
                throw { message: "'" + name + "' must be greater than zero." };
            }
        }
    };

    var checkUndefinedOrNumber = function (val, name) {
        /// <summary>Checks whether val is undefined or a number</summary>
        /// <param name="val" type="Number">Value to check.</param>
        /// <param name="name" type="String">Parameter name to use in exception.</param>
        if (val !== undefined && (typeof val !== "number" || isNaN(val) || !isFinite(val))) {
            throw { message: "'" + name + "' must be a number." };
        }
    };

    var removeFromArray = function (arr, item) {
        /// <summary>Performs a linear search on the specified array and removes the first instance of 'item'.</summary>
        /// <param name="arr" type="Array">Array to search.</param>
        /// <param name="item">Item being sought.</param>
        /// <returns type="Boolean">Whether the item was removed.</returns>

        var i, len;
        for (i = 0, len = arr.length; i < len; i++) {
            if (arr[i] === item) {
                arr.splice(i, 1);
                return true;
            }
        }

        return false;
    };

    var extend = function (target, values) {
        /// <summary>Extends the target with the specified values.</summary>
        /// <param name="target" type="Object">Object to add properties to.</param>
        /// <param name="values" type="Object">Object with properties to add into target.</param>
        /// <returns type="Object">The target object.</returns>

        for (var name in values) {
            target[name] = values[name];
        }

        return target;
    };

    var estimateSize = function (obj) {
        /// <summary>Estimates the size of an object in bytes.</summary>
        /// <param name="obj" type="Object">Object to determine the size of.</param>
        /// <returns type="Integer">Estimated size of the object in bytes.</returns>
        var size = 0;
        var type = typeof obj;

        if (type === "object" && obj) {
            for (var name in obj) {
                size += name.length * 2 + estimateSize(obj[name]);
            }
        } else if (type === "string") {
            size = obj.length * 2;
        } else {
            size = 8;
        }
        return size;
    };

    var snapToPageBoundaries = function (lowIndex, highIndex, pageSize) {
        /// <summary>Snaps low and high indices into page sizes and returns a range.</summary>
        /// <param name="lowIndex" type="Number">Low index to snap to a lower value.</param>
        /// <param name="highIndex" type="Number">High index to snap to a higher value.</param>
        /// <param name="pageSize" type="Number">Page size to snap to.</param>
        /// <returns type="Object">A range with (i)ndex and (c)ount of elements.</returns>

        lowIndex = Math.floor(lowIndex / pageSize) * pageSize;
        highIndex = Math.ceil((highIndex + 1) / pageSize) * pageSize;
        return { i: lowIndex, c: highIndex - lowIndex };
    };

    // The DataCache is implemented using state machines.  The following constants are used to properly 
    // identify and label the states that these machines transition to.

    // DataCache state constants

    var CACHE_STATE_DESTROY = "destroy";
    var CACHE_STATE_IDLE = "idle";
    var CACHE_STATE_INIT = "init";
    var CACHE_STATE_READ = "read";
    var CACHE_STATE_PREFETCH = "prefetch";
    var CACHE_STATE_WRITE = "write";

    // DataCacheOperation state machine states.  
    // Transitions on operations also depend on the cache current of the cache.

    var OPERATION_STATE_CANCEL = "cancel";
    var OPERATION_STATE_END = "end";
    var OPERATION_STATE_ERROR = "error";
    var OPERATION_STATE_START = "start";
    var OPERATION_STATE_WAIT = "wait";

    // Destroy state machine states

    var DESTROY_STATE_CLEAR = "clear";

    // Read / Prefetch state machine states 

    var READ_STATE_DONE = "done";
    var READ_STATE_LOCAL = "local";
    var READ_STATE_SAVE = "save";
    var READ_STATE_SOURCE = "source";

    var DataCacheOperation = function (stateMachine, promise, isCancelable, index, count, data, pending) {
        /// <summary>Creates a new operation object.</summary>
        /// <param name="stateMachine" type="Function">State machine that describes the specific behavior of the operation.</param>
        /// <param name="promise" type ="DjsDeferred">Promise for requested values.</param>
        /// <param name="isCancelable" type ="Boolean">Whether this operation can be canceled or not.</param>
        /// <param name="index" type="Number">Index of first item requested.</param>
        /// <param name="count" type="Number">Count of items requested.</param>
        /// <param name="data" type="Array">Array with the items requested by the operation.</param>
        /// <param name="pending" type="Number">Total number of pending prefetch records.</param>
        /// <returns type="DataCacheOperation">A new data cache operation instance.</returns>

        /// <field name="p" type="DjsDeferred">Promise for requested values.</field>
        /// <field name="i" type="Number">Index of first item requested.</field>
        /// <field name="c" type="Number">Count of items requested.</field>
        /// <field name="d" type="Array">Array with the items requested by the operation.</field>
        /// <field name="s" type="Array">Current state of the operation.</field>
        /// <field name="canceled" type="Boolean">Whether the operation has been canceled.</field>
        /// <field name="pending" type="Number">Total number of pending prefetch records.</field>
        /// <field name="oncomplete" type="Function">Callback executed when the operation reaches the end state.</field>

        var stateData;
        var cacheState;
        var that = this;

        that.p = promise;
        that.i = index;
        that.c = count;
        that.d = data;
        that.s = OPERATION_STATE_START;

        that.canceled = false;
        that.pending = pending;
        that.oncomplete = null;

        that.cancel = function () {
            /// <summary>Transitions this operation to the cancel state and sets the canceled flag to true.</summary>
            /// <remarks>The function is a no-op if the operation is non-cancelable.</summary>

            if (!isCancelable) {
                return;
            }

            var state = that.s;
            if (state !== OPERATION_STATE_ERROR && state !== OPERATION_STATE_END && state !== OPERATION_STATE_CANCEL) {
                that.canceled = true;
                transition(OPERATION_STATE_CANCEL, stateData);
            }
        };

        that.complete = function () {
            /// <summary>Transitions this operation to the end state.</summary>

            transition(OPERATION_STATE_END, stateData);
        };

        that.error = function (err) {
            /// <summary>Transitions this operation to the error state.</summary>
            if (!that.canceled) {
                transition(OPERATION_STATE_ERROR, err);
            }
        };

        that.run = function (state) {
            /// <summary>Executes the operation's current state in the context of a new cache state.</summary>
            /// <param name="state" type="Object">New cache state.</param> 

            cacheState = state;
            that.transition(that.s, stateData);
        };

        that.wait = function (data) {
            /// <summary>Transitions this operation to the wait state.</summary>

            transition(OPERATION_STATE_WAIT, data);
        };

        var operationStateMachine = function (opTargetState, cacheState, data) {
            /// <summary>State machine that describes all operations common behavior.</summary>
            /// <param name="opTargetState" type="Object">Operation state to transition to.</param>
            /// <param name="cacheState" type="Object">Current cache state.</param>
            /// <param name="data" type="Object" optional="true">Additional data passed to the state.</param> 

            switch (opTargetState) {
                case OPERATION_STATE_START:
                    // Initial state of the operation. The operation will remain in this state until the cache has been fully initialized.
                    if (cacheState !== CACHE_STATE_INIT) {
                        stateMachine(that, opTargetState, cacheState, data);
                    }
                    break;

                case OPERATION_STATE_WAIT:
                    // Wait state indicating that the operation is active but waiting for an asynchronous operation to complete. 
                    stateMachine(that, opTargetState, cacheState, data);
                    break;

                case OPERATION_STATE_CANCEL:
                    // Cancel state.
                    stateMachine(that, opTargetState, cacheState, data);
                    that.fireCanceled();
                    transition(OPERATION_STATE_END);
                    break;

                case OPERATION_STATE_ERROR:
                    // Error state. Data is expected to be an object detailing the error condition.  
                    stateMachine(that, opTargetState, cacheState, data);
                    that.canceled = true;
                    that.fireRejected(data);
                    transition(OPERATION_STATE_END);
                    break;

                case OPERATION_STATE_END:
                    // Final state of the operation.
                    if (that.oncomplete) {
                        that.oncomplete(that);
                    }
                    if (!that.canceled) {
                        that.fireResolved();
                    }
                    stateMachine(that, opTargetState, cacheState, data);
                    break;

                default:
                    // Any other state is passed down to the state machine describing the operation's specific behavior.
                        stateMachine(that, opTargetState, cacheState, data);
                    break;
            }
        };

        var transition = function (state, data) {
            /// <summary>Transitions this operation to a new state.</summary>
            /// <param name="state" type="Object">State to transition the operation to.</param>
            /// <param name="data" type="Object" optional="true">Additional data passed to the state.</param> 

            that.s = state;
            stateData = data;
            operationStateMachine(state, cacheState, data);
        };

        that.transition = transition;

        return that;
    };

    DataCacheOperation.prototype.fireResolved = function () {
        /// <summary>Fires a resolved notification as necessary.</summary>

        // Fire the resolve just once.
        var p = this.p;
        if (p) {
            this.p = null;
            p.resolve(this.d);
        }
    };

    DataCacheOperation.prototype.fireRejected = function (reason) {
        /// <summary>Fires a rejected notification as necessary.</summary>

        // Fire the rejection just once.
        var p = this.p;
        if (p) {
            this.p = null;
            p.reject(reason);
        }
    };

    DataCacheOperation.prototype.fireCanceled = function () {
        /// <summary>Fires a canceled notification as necessary.</summary>

        this.fireRejected({ canceled: true, message: "Operation canceled" });
    };


    var DataCache = function (options) {
        /// <summary>Creates a data cache for a collection that is efficiently loaded on-demand.</summary>
        /// <param name="options">
        /// Options for the data cache, including name, source, pageSize,
        /// prefetchSize, cacheSize, storage mechanism, and initial prefetch and local-data handler.
        /// </param>
        /// <returns type="DataCache">A new data cache instance.</returns>

        var state = CACHE_STATE_INIT;
        var stats = { counts: 0, netReads: 0, prefetches: 0, cacheReads: 0 };

        var clearOperations = [];
        var readOperations = [];
        var prefetchOperations = [];

        var actualCacheSize = 0;                                             // Actual cache size in bytes.
        var allDataLocal = false;                                            // Whether all data is local.
        var cacheSize = undefinedDefault(options.cacheSize, 1048576);        // Requested cache size in bytes, default 1 MB.
        var collectionCount = 0;                                             // Number of elements in the server collection.
        var highestSavedPage = 0;                                            // Highest index of all the saved pages.
        var highestSavedPageSize = 0;                                        // Item count of the saved page with the highest index.
        var overflowed = cacheSize === 0;                                    // If the cache has overflowed (actualCacheSize > cacheSize or cacheSize == 0);
        var pageSize = undefinedDefault(options.pageSize, 50);               // Number of elements to store per page.
        var prefetchSize = undefinedDefault(options.prefetchSize, pageSize); // Number of elements to prefetch from the source when the cache is idling.
        var version = "1.0";
        var cacheFailure;

        var pendingOperations = 0;

        var source = options.source;
        if (typeof source === "string") {
            // Create a new cache source.
            source = new ODataCacheSource(options);
        }
        source.options = options;

        // Create a cache local store.
        var store = datajs.createStore(options.name, options.mechanism);

        var that = this;

        that.onidle = options.idle;
        that.stats = stats;

        that.count = function () {
            /// <summary>Counts the number of items in the collection.</summary>
            /// <returns type="Object">A promise with the number of items.</returns>

            if (cacheFailure) {
                throw cacheFailure;
            }

            var deferred = createDeferred();
            var canceled = false;

            if (allDataLocal) {
                delay(function () {
                    deferred.resolve(collectionCount);
                });

                return deferred.promise();
            }

            // TODO: Consider returning the local data count instead once allDataLocal flag is set to true.
            var request = source.count(function (count) {
                request = null;
                stats.counts++;
                deferred.resolve(count);
            }, function (err) {
                request = null;
                deferred.reject(extend(err, { canceled: canceled }));
            });

            return extend(deferred.promise(), {
                cancel: function () {
                    /// <summary>Aborts the count operation.</summary>
                    if (request) {
                        canceled = true;
                        request.abort();
                        request = null;
                    }
                }
            });
        };

        that.clear = function () {
            /// <summary>Cancels all running operations and clears all local data associated with this cache.</summary>
            /// <remarks>
            /// New read requests made while a clear operation is in progress will not be canceled. 
            /// Instead they will be queued for execution once the operation is completed.
            /// </remarks>
            /// <returns type="Object">A promise that has no value and can't be canceled.</returns>

            if (cacheFailure) {
                throw cacheFailure;
            }

            if (clearOperations.length === 0) {
                var deferred = createDeferred();
                var op = new DataCacheOperation(destroyStateMachine, deferred, false);
                queueAndStart(op, clearOperations);
                return deferred.promise();
            }
            return clearOperations[0].p;
        };

        that.filterForward = function (index, count, predicate) {
            /// <summary>Filters the cache data based a predicate.</summary>
            /// <param name="index" type="Number">The index of the item to start filtering forward from.</param>
            /// <param name="count" type="Number">Maximum number of items to include in the result.</param>
            /// <param name="predicate" type="Function">Callback function returning a boolean that determines whether an item should be included in the result or not.</param>
            /// <remarks>
            /// Specifying a negative count value will yield all the items in the cache that satisfy the predicate.
            /// </remarks>
            /// <returns type="DjsDeferred">A promise for an array of results.</returns>
            return filter(index, count, predicate, false);
        };

        that.filterBack = function (index, count, predicate) {
            /// <summary>Filters the cache data based a predicate.</summary>
            /// <param name="index" type="Number">The index of the item to start filtering backward from.</param>
            /// <param name="count" type="Number">Maximum number of items to include in the result.</param>
            /// <param name="predicate" type="Function">Callback function returning a boolean that determines whether an item should be included in the result or not.</param>
            /// <remarks>
            /// Specifying a negative count value will yield all the items in the cache that satisfy the predicate.
            /// </remarks>
            /// <returns type="DjsDeferred">A promise for an array of results.</returns>
            return filter(index, count, predicate, true);
        };

        that.readRange = function (index, count) {
            /// <summary>Reads a range of adjacent records.</summary>
            /// <param name="index" type="Number">Zero-based index of record range to read.</param>
            /// <param name="count" type="Number">Number of records in the range.</param>
            /// <remarks>
            /// New read requests made while a clear operation is in progress will not be canceled. 
            /// Instead they will be queued for execution once the operation is completed.
            /// </remarks>
            /// <returns type="DjsDeferred">
            /// A promise for an array of records; less records may be returned if the
            /// end of the collection is found.
            /// </returns>

            checkZeroGreater(index, "index");
            checkZeroGreater(count, "count");

            if (cacheFailure) {
                throw cacheFailure;
            }

            var deferred = createDeferred();

            // Merging read operations would be a nice optimization here.
            var op = new DataCacheOperation(readStateMachine, deferred, true, index, count, [], 0);
            queueAndStart(op, readOperations);

            return extend(deferred.promise(), {
                cancel: function () {
                    /// <summary>Aborts the readRange operation.</summary>
                    op.cancel();
                }
            });
        };

        that.ToObservable = that.toObservable = function () {
            /// <summary>Creates an Observable object that enumerates all the cache contents.</summary>
            /// <returns>A new Observable object that enumerates all the cache contents.</returns>
            if (!window.Rx || !window.Rx.Observable) {
                throw { message: "Rx library not available - include rx.js" };
            }

            if (cacheFailure) {
                throw cacheFailure;
            }

            return window.Rx.Observable.CreateWithDisposable(function (obs) {
                var disposed = false;
                var index = 0;

                var errorCallback = function (error) {
                    if (!disposed) {
                        obs.OnError(error);
                    }
                };

                var successCallback = function (data) {
                    if (!disposed) {
                        var i, len;
                        for (i = 0, len = data.length; i < len; i++) {
                            // The wrapper automatically checks for Dispose
                            // on the observer, so we don't need to check it here.
                            obs.OnNext(data[i]);
                        }

                        if (data.length < pageSize) {
                            obs.OnCompleted();
                        } else {
                            index += pageSize;
                            that.readRange(index, pageSize).then(successCallback, errorCallback);
                        }
                    }
                };

                that.readRange(index, pageSize).then(successCallback, errorCallback);

                return { Dispose: function () { disposed = true; } };
            });
        };

        var cacheFailureCallback = function (message) {
            /// <summary>Creates a function that handles a callback by setting the cache into failure mode.</summary>
            /// <param name="message" type="String">Message text.</param>
            /// <returns type="Function">Function to use as error callback.</returns>
            /// <remarks>
            /// This function will specifically handle problems with critical store resources 
            /// during cache initialization.
            /// </remarks>

            return function (error) {
                cacheFailure = { message: message, error: error };

                // Destroy any pending clear or read operations.
                // At this point there should be no prefetch operations.
                // Count operations will go through but are benign because they
                // won't interact with the store.
                var i, len;
                for (i = 0, len = readOperations.length; i < len; i++) {
                    readOperations[i].fireRejected(cacheFailure);
                }
                for (i = 0, len = clearOperations.length; i < len; i++) {
                    clearOperations[i].fireRejected(cacheFailure);
                }

                // Null out the operation arrays.
                readOperations = clearOperations = null;
            };
        };

        var changeState = function (newState) {
            /// <summary>Updates the cache's state and signals all pending operations of the change.</summary>
            /// <param name="newState" type="Object">New cache state.</param>
            /// <remarks>This method is a no-op if the cache's current state and the new state are the same.</remarks>

            if (newState !== state) {
                state = newState;
                var operations = clearOperations.concat(readOperations, prefetchOperations);
                var i, len;
                for (i = 0, len = operations.length; i < len; i++) {
                    operations[i].run(state);
                }
            }
        };

        var clearStore = function () {
            /// <summary>Removes all the data stored in the cache.</summary>
            /// <returns type="DjsDeferred">A promise with no value.</returns>

            var deferred = new DjsDeferred();
            store.clear(function () {

                // Reset the cache settings.
                actualCacheSize = 0;
                allDataLocal = false;
                collectionCount = 0;
                highestSavedPage = 0;
                highestSavedPageSize = 0;
                overflowed = cacheSize === 0;

                // version is not reset, in case there is other state in eg V1.1 that is still around.

                // Reset the cache stats.
                stats = { counts: 0, netReads: 0, prefetches: 0, cacheReads: 0 };
                that.stats = stats;

                store.close();
                deferred.resolve();
            }, function (err) {
                deferred.reject(err);
            });
            return deferred;
        };

        var dequeueOperation = function (operation) {
            /// <summary>Removes an operation from the caches queues and changes the cache state to idle.</summary>
            /// <param name="operation" type="DataCacheOperation">Operation to dequeue.</param>
            /// <remarks>This method is used as a handler for the operation's oncomplete event.</remarks>

            var removed = removeFromArray(clearOperations, operation);
            if (!removed) {
                removed = removeFromArray(readOperations, operation);
                if (!removed) {
                    removeFromArray(prefetchOperations, operation);
                }
            }

            pendingOperations--;
            changeState(CACHE_STATE_IDLE);
        };

        var fetchPage = function (start) {
            /// <summary>Requests data from the cache source.</summary>
            /// <param name="start" type="Number">Zero-based index of items to request.</param>
            /// <returns type="DjsDeferred">A promise for a page object with (i)ndex, (c)ount, (d)ata.</returns>


            var deferred = new DjsDeferred();
            var canceled = false;

            var request = source.read(start, pageSize, function (data) {
                var page = { i: start, c: data.length, d: data };
                deferred.resolve(page);
            }, function (err) {
                deferred.reject(err);
            });

            return extend(deferred, {
                cancel: function () {
                    if (request) {
                        request.abort();
                        canceled = true;
                        request = null;
                    }
                }
            });
        };

        var filter = function (index, count, predicate, backwards) {
            /// <summary>Filters the cache data based a predicate.</summary>
            /// <param name="index" type="Number">The index of the item to start filtering from.</param>
            /// <param name="count" type="Number">Maximum number of items to include in the result.</param>
            /// <param name="predicate" type="Function">Callback function returning a boolean that determines whether an item should be included in the result or not.</param>
            /// <param name="backwards" type="Boolean">True if the filtering should move backward from the specified index, falsey otherwise.</param>
            /// <remarks>
            /// Specifying a negative count value will yield all the items in the cache that satisfy the predicate.
            /// </remarks>
            /// <returns type="DjsDeferred">A promise for an array of results.</returns>
            index = parseInt10(index);
            count = parseInt10(count);

            if (isNaN(index)) {
                throw { message: "'index' must be a valid number.", index: index };
            }
            if (isNaN(count)) {
                throw { message: "'count' must be a valid number.", count: count };
            }

            if (cacheFailure) {
                throw cacheFailure;
            }

            index = Math.max(index, 0);

            var deferred = createDeferred();
            var arr = [];
            var canceled = false;
            var pendingReadRange = null;

            var readMore = function (readIndex, readCount) {
                if (!canceled) {
                    if (count >= 0 && arr.length >= count) {
                        deferred.resolve(arr);
                    } else {
                        pendingReadRange = that.readRange(readIndex, readCount).then(function (data) {
                            for (var i = 0, length = data.length; i < length && (count < 0 || arr.length < count); i++) {
                                var dataIndex = backwards ? length - i - 1 : i;
                                var item = data[dataIndex];
                                if (predicate(item)) {
                                    var element = {
                                        index: readIndex + dataIndex,
                                        item: item
                                    };

                                    backwards ? arr.unshift(element) : arr.push(element);
                                }
                            }

                            // Have we reached the end of the collection?
                            if ((!backwards && data.length < readCount) || (backwards && readIndex <= 0)) {
                                deferred.resolve(arr);
                            } else {
                                var nextIndex = backwards ? Math.max(readIndex - pageSize, 0) : readIndex + readCount;
                                readMore(nextIndex, pageSize);
                            }
                        }, function (err) {
                            deferred.reject(err);
                        });
                    }
                }
            };

            // Initially, we read from the given starting index to the next/previous page boundary
            var initialPage = snapToPageBoundaries(index, index, pageSize);
            var initialIndex = backwards ? initialPage.i : index;
            var initialCount = backwards ? index - initialPage.i + 1 : initialPage.i + initialPage.c - index;
            readMore(initialIndex, initialCount);

            return extend(deferred.promise(), {
                cancel: function () {
                    /// <summary>Aborts the filter operation</summary>
                    if (pendingReadRange) {
                        pendingReadRange.cancel();
                    }
                    canceled = true;
                }
            });
        };

        var fireOnIdle = function () {
            /// <summary>Fires an onidle event if any functions are assigned.</summary>

            if (that.onidle && pendingOperations === 0) {
                that.onidle();
            }
        };

        var prefetch = function (start) {
            /// <summary>Creates and starts a new prefetch operation.</summary>
            /// <param name="start" type="Number">Zero-based index of the items to prefetch.</param>
            /// <remarks>
            /// This method is a no-op if any of the following conditions is true:
            ///     1.- prefetchSize is 0
            ///     2.- All data has been read and stored locally in the cache.
            ///     3.- There is already an all data prefetch operation queued. 
            ///     4.- The cache has run out of available space (overflowed).
            /// <remarks>

            if (allDataLocal || prefetchSize === 0 || overflowed) {
                return;
            }


            if (prefetchOperations.length === 0 || (prefetchOperations[0] && prefetchOperations[0].c !== -1)) {
                // Merging prefetch operations would be a nice optimization here. 
                var op = new DataCacheOperation(prefetchStateMachine, null, true, start, prefetchSize, null, prefetchSize);
                queueAndStart(op, prefetchOperations);
            }
        };

        var queueAndStart = function (op, queue) {
            /// <summary>Queues an operation and runs it.</summary>
            /// <param name="op" type="DataCacheOperation">Operation to queue.</param>
            /// <param name="queue" type="Array">Array that will store the operation.</param>

            op.oncomplete = dequeueOperation;
            queue.push(op);
            pendingOperations++;
            op.run(state);
        };

        var readPage = function (key) {
            /// <summary>Requests a page from the cache local store.</summary>
            /// <param name="key" type="Number">Zero-based index of the reuqested page.</param>
            /// <returns type="DjsDeferred">A promise for a found flag and page object with (i)ndex, (c)ount, (d)ata, and (t)icks.</returns>


            var canceled = false;
            var deferred = extend(new DjsDeferred(), {
                cancel: function () {
                    /// <summary>Aborts the readPage operation.</summary>
                    canceled = true;
                }
            });

            var error = storeFailureCallback(deferred, "Read page from store failure");

            store.contains(key, function (contained) {
                if (canceled) {
                    return;
                }
                if (contained) {
                    store.read(key, function (_, data) {
                        if (!canceled) {
                            deferred.resolve(data !== undefined, data);
                        }
                    }, error);
                    return;
                }
                deferred.resolve(false);
            }, error);
            return deferred;
        };

        var savePage = function (key, page) {
            /// <summary>Saves a page to the cache local store.</summary>
            /// <param name="key" type="Number">Zero-based index of the requested page.</param>
            /// <param name="page" type="Object">Object with (i)ndex, (c)ount, (d)ata, and (t)icks.</param>
            /// <returns type="DjsDeferred">A promise with no value.</returns>


            var canceled = false;

            var deferred = extend(new DjsDeferred(), {
                cancel: function () {
                    /// <summary>Aborts the readPage operation.</summary>
                    canceled = true;
                }
            });

            var error = storeFailureCallback(deferred, "Save page to store failure");

            var resolve = function () {
                deferred.resolve(true);
            };

            if (page.c > 0) {
                var pageBytes = estimateSize(page);
                overflowed = cacheSize >= 0 && cacheSize < actualCacheSize + pageBytes;

                if (!overflowed) {
                    store.addOrUpdate(key, page, function () {
                        updateSettings(page, pageBytes);
                        saveSettings(resolve, error);
                    }, error);
                } else {
                    resolve();
                }
            } else {
                updateSettings(page, 0);
                saveSettings(resolve, error);
            }
            return deferred;
        };

        var saveSettings = function (success, error) {
            /// <summary>Saves the cache's current settings to the local store.</summary>
            /// <param name="success" type="Function">Success callback.</param>
            /// <param name="error" type="Function">Errror callback.</param>

            var settings = {
                actualCacheSize: actualCacheSize,
                allDataLocal: allDataLocal,
                cacheSize: cacheSize,
                collectionCount: collectionCount,
                highestSavedPage: highestSavedPage,
                highestSavedPageSize: highestSavedPageSize,
                pageSize: pageSize,
                sourceId: source.identifier,
                version: version
            };

            store.addOrUpdate("__settings", settings, success, error);
        };

        var storeFailureCallback = function (deferred/*, message*/) {
            /// <summary>Creates a function that handles a store error.</summary>
            /// <param name="deferred" type="DjsDeferred">Deferred object to resolve.</param>
            /// <param name="message" type="String">Message text.</param>
            /// <returns type="Function">Function to use as error callback.</returns>
            /// <remarks>
            /// This function will specifically handle problems when interacting with the store. 
            /// </remarks>

            return function (/*error*/) {
                // var console = window.console;
                // if (console && console.log) {
                //    console.log(message);
                //    console.dir(error);
                // }
                deferred.resolve(false);
            };
        };

        var updateSettings = function (page, pageBytes) {
            /// <summary>Updates the cache's settings based on a page object.</summary>
            /// <param name="page" type="Object">Object with (i)ndex, (c)ount, (d)ata.</param>
            /// <param name="pageBytes" type="Number">Size of the page in bytes.</param>

            var pageCount = page.c;
            var pageIndex = page.i;

            // Detect the collection size.
            if (pageCount === 0) {
                if (highestSavedPage === pageIndex - pageSize) {
                    collectionCount = highestSavedPage + highestSavedPageSize;
                }
            } else {
                highestSavedPage = Math.max(highestSavedPage, pageIndex);
                if (highestSavedPage === pageIndex) {
                    highestSavedPageSize = pageCount;
                }
                actualCacheSize += pageBytes;
                if (pageCount < pageSize && !collectionCount) {
                    collectionCount = pageIndex + pageCount;
                }
            }

            // Detect the end of the collection.
            if (!allDataLocal && collectionCount === highestSavedPage + highestSavedPageSize) {
                allDataLocal = true;
            }
        };

        var cancelStateMachine = function (operation, opTargetState, cacheState, data) {
            /// <summary>State machine describing the behavior for cancelling a read or prefetch operation.</summary>
            /// <param name="operation" type="DataCacheOperation">Operation being run.</param>
            /// <param name="opTargetState" type="Object">Operation state to transition to.</param>
            /// <param name="cacheState" type="Object">Current cache state.</param>
            /// <param name="data" type="Object" optional="true">Additional data passed to the state.</param> 
            /// <remarks>
            /// This state machine contains behavior common to read and prefetch operations.
            /// </remarks>

            var canceled = operation.canceled && opTargetState !== OPERATION_STATE_END;
            if (canceled) {
                if (opTargetState === OPERATION_STATE_CANCEL) {
                    // Cancel state.
                    // Data is expected to be any pending request made to the cache.
                    if (data && data.cancel) {
                        data.cancel();
                    }
                }
            }
            return canceled;
        };

        var destroyStateMachine = function (operation, opTargetState, cacheState) {
            /// <summary>State machine describing the behavior of a clear operation.</summary>
            /// <param name="operation" type="DataCacheOperation">Operation being run.</param>
            /// <param name="opTargetState" type="Object">Operation state to transition to.</param>
            /// <param name="cacheState" type="Object">Current cache state.</param>
            /// <remarks>
            /// Clear operations have the highest priority and can't be interrupted by other operations; however, 
            /// they will preempt any other operation currently executing.
            /// </remarks>

            var transition = operation.transition;

            // Signal the cache that a clear operation is running.
            if (cacheState !== CACHE_STATE_DESTROY) {
                changeState(CACHE_STATE_DESTROY);
                return true;
            }

            switch (opTargetState) {
                case OPERATION_STATE_START:
                    // Initial state of the operation.
                    transition(DESTROY_STATE_CLEAR);
                    break;

                case OPERATION_STATE_END:
                    // State that signals the operation is done.
                    fireOnIdle();
                    break;

                case DESTROY_STATE_CLEAR:
                    // State that clears all the local data of the cache.
                    clearStore().then(function () {
                        // Terminate the operation once the local store has been cleared.
                        operation.complete();
                    });
                    // Wait until the clear request completes.
                    operation.wait();
                    break;

                default:
                    return false;
            }
            return true;
        };

        var prefetchStateMachine = function (operation, opTargetState, cacheState, data) {
            /// <summary>State machine describing the behavior of a prefetch operation.</summary>
            /// <param name="operation" type="DataCacheOperation">Operation being run.</param>
            /// <param name="opTargetState" type="Object">Operation state to transition to.</param>
            /// <param name="cacheState" type="Object">Current cache state.</param>
            /// <param name="data" type="Object" optional="true">Additional data passed to the state.</param> 
            /// <remarks>
            /// Prefetch operations have the lowest priority and will be interrupted by operations of 
            /// other kinds. A preempted prefetch operation will resume its execution only when the state 
            /// of the cache returns to idle.
            /// 
            /// If a clear operation starts executing then all the prefetch operations are canceled, 
            /// even if they haven't started executing yet.
            /// </remarks>

            // Handle cancelation
            if (!cancelStateMachine(operation, opTargetState, cacheState, data)) {

                var transition = operation.transition;

                // Handle preemption 
                if (cacheState !== CACHE_STATE_PREFETCH) {
                    if (cacheState === CACHE_STATE_DESTROY) {
                        if (opTargetState !== OPERATION_STATE_CANCEL) {
                            operation.cancel();
                        }
                    } else if (cacheState === CACHE_STATE_IDLE) {
                        // Signal the cache that a prefetch operation is running.
                        changeState(CACHE_STATE_PREFETCH);
                    }
                    return true;
                }

                switch (opTargetState) {
                    case OPERATION_STATE_START:
                        // Initial state of the operation.
                        if (prefetchOperations[0] === operation) {
                            transition(READ_STATE_LOCAL, operation.i);
                        }
                        break;

                    case READ_STATE_DONE:
                        // State that determines if the operation can be resolved or has to
                        // continue processing.
                        // Data is expected to be the read page.
                        var pending = operation.pending;

                        if (pending > 0) {
                            pending -= Math.min(pending, data.c);
                        }

                        // Are we done, or has all the data been stored?
                        if (allDataLocal || pending === 0 || data.c < pageSize || overflowed) {
                            operation.complete();
                        } else {
                            // Continue processing the operation.
                            operation.pending = pending;
                            transition(READ_STATE_LOCAL, data.i + pageSize);
                        }
                        break;

                    default:
                        return readSaveStateMachine(operation, opTargetState, cacheState, data, true);
                }
            }
            return true;
        };

        var readStateMachine = function (operation, opTargetState, cacheState, data) {
            /// <summary>State machine describing the behavior of a read operation.</summary>
            /// <param name="operation" type="DataCacheOperation">Operation being run.</param>
            /// <param name="opTargetState" type="Object">Operation state to transition to.</param>
            /// <param name="cacheState" type="Object">Current cache state.</param>
            /// <param name="data" type="Object" optional="true">Additional data passed to the state.</param> 
            /// <remarks>
            /// Read operations have a higher priority than prefetch operations, but lower than 
            /// clear operations. They will preempt any prefetch operation currently running 
            /// but will be interrupted by a clear operation.
            /// 
            /// If a clear operation starts executing then all the currently running 
            /// read operations are canceled. Read operations that haven't started yet will 
            /// wait in the start state until the destory operation finishes. 
            /// </remarks>

            // Handle cancelation
            if (!cancelStateMachine(operation, opTargetState, cacheState, data)) {

                var transition = operation.transition;

                // Handle preemption
                if (cacheState !== CACHE_STATE_READ && opTargetState !== OPERATION_STATE_START) {
                    if (cacheState === CACHE_STATE_DESTROY) {
                        if (opTargetState !== OPERATION_STATE_START) {
                            operation.cancel();
                        }
                    } else if (cacheState !== CACHE_STATE_WRITE) {
                        // Signal the cache that a read operation is running.
                        changeState(CACHE_STATE_READ);
                    }

                    return true;
                }

                switch (opTargetState) {
                    case OPERATION_STATE_START:
                        // Initial state of the operation.
                        // Wait until the cache is idle or prefetching.
                        if (cacheState === CACHE_STATE_IDLE || cacheState === CACHE_STATE_PREFETCH) {
                            // Signal the cache that a read operation is running.
                            changeState(CACHE_STATE_READ);
                            if (operation.c > 0) {
                                // Snap the requested range to a page boundary.
                                var range = snapToPageBoundaries(operation.i, operation.c, pageSize);
                                transition(READ_STATE_LOCAL, range.i);
                            } else {
                                transition(READ_STATE_DONE, operation);
                            }
                        }
                        break;

                    case READ_STATE_DONE:
                        // State that determines if the operation can be resolved or has to
                        // continue processing.
                        // Data is expected to be the read page.
                        appendPage(operation, data);
                        var len = operation.d.length;
                        // Are we done?
                        if (operation.c === len || data.c < pageSize) {
                            // Update the stats, request for a prefetch operation.
                            stats.cacheReads++;
                            prefetch(data.i + data.c);
                            // Terminate the operation.
                            operation.complete();
                        } else {
                            // Continue processing the operation.
                            transition(READ_STATE_LOCAL, data.i + pageSize);
                        }
                        break;

                    default:
                        return readSaveStateMachine(operation, opTargetState, cacheState, data, false);
                }
            }

            return true;
        };

        var readSaveStateMachine = function (operation, opTargetState, cacheState, data, isPrefetch) {
            /// <summary>State machine describing the behavior for reading and saving data into the cache.</summary>
            /// <param name="operation" type="DataCacheOperation">Operation being run.</param>
            /// <param name="opTargetState" type="Object">Operation state to transition to.</param>
            /// <param name="cacheState" type="Object">Current cache state.</param>
            /// <param name="data" type="Object" optional="true">Additional data passed to the state.</param> 
            /// <param name="isPrefetch" type="Boolean">Flag indicating whether a read (false) or prefetch (true) operation is running.
            /// <remarks>
            /// This state machine contains behavior common to read and prefetch operations.
            /// </remarks>

            var error = operation.error;
            var transition = operation.transition;
            var wait = operation.wait;
            var request;

            switch (opTargetState) {
                case OPERATION_STATE_END:
                    // State that signals the operation is done.
                    fireOnIdle();
                    break;

                case READ_STATE_LOCAL:
                    // State that requests for a page from the local store.
                    // Data is expected to be the index of the page to request.
                    request = readPage(data).then(function (found, page) {
                        // Signal the cache that a read operation is running.
                        if (!operation.canceled) {
                            if (found) {
                                // The page is in the local store, check if the operation can be resolved.
                                transition(READ_STATE_DONE, page);
                            } else {
                                // The page is not in the local store, request it from the source.
                                transition(READ_STATE_SOURCE, data);
                            }
                        }
                    });
                    break;

                case READ_STATE_SOURCE:
                    // State that requests for a page from the cache source.
                    // Data is expected to be the index of the page to request.
                    request = fetchPage(data).then(function (page) {
                        // Signal the cache that a read operation is running.
                        if (!operation.canceled) {
                            // Update the stats and save the page to the local store.
                            if (isPrefetch) {
                                stats.prefetches++;
                            } else {
                                stats.netReads++;
                            }
                            transition(READ_STATE_SAVE, page);
                        }
                    }, error);
                    break;

                case READ_STATE_SAVE:
                    // State that saves a  page to the local store.
                    // Data is expected to be the page to save.
                    // Write access to the store is exclusive.
                    if (cacheState !== CACHE_STATE_WRITE) {
                        changeState(CACHE_STATE_WRITE);
                        request = savePage(data.i, data).then(function (saved) {
                            if (!operation.canceled) {
                                if (!saved && isPrefetch) {
                                    operation.pending = 0;
                                }
                                // Check if the operation can be resolved.
                                transition(READ_STATE_DONE, data);
                            }
                            changeState(CACHE_STATE_IDLE);
                        });
                    }
                    break;

                default:
                    // Unknown state that can't be handled by this state machine.
                    return false;
            }

            if (request) {
                // The operation might have been canceled between stack frames do to the async calls.  
                if (operation.canceled) {
                    request.cancel();
                } else if (operation.s === opTargetState) {
                    // Wait for the request to complete.
                    wait(request);
                }
            }

            return true;
        };

        // Initialize the cache.
        store.read("__settings", function (_, settings) {
            if (assigned(settings)) {
                var settingsVersion = settings.version;
                if (!settingsVersion || settingsVersion.indexOf("1.") !== 0) {
                    cacheFailureCallback("Unsupported cache store version " + settingsVersion)();
                    return;
                }

                if (pageSize !== settings.pageSize || source.identifier !== settings.sourceId) {
                    // The shape or the source of the data was changed so invalidate the store.
                    clearStore().then(function () {
                        // Signal the cache is fully initialized.
                        changeState(CACHE_STATE_IDLE);
                    }, cacheFailureCallback("Unable to clear store during initialization"));
                } else {
                    // Restore the saved settings.
                    actualCacheSize = settings.actualCacheSize;
                    allDataLocal = settings.allDataLocal;
                    cacheSize = settings.cacheSize;
                    collectionCount = settings.collectionCount;
                    highestSavedPage = settings.highestSavedPage;
                    highestSavedPageSize = settings.highestSavedPageSize;
                    version = settingsVersion;

                    // Signal the cache is fully initialized.
                    changeState(CACHE_STATE_IDLE);
                }
            } else {
                // This is a brand new cache.
                saveSettings(function () {
                    // Signal the cache is fully initialized.
                    changeState(CACHE_STATE_IDLE);
                }, cacheFailureCallback("Unable to write settings during initialization."));
            }
        }, cacheFailureCallback("Unable to read settings from store."));

        return that;
    };

    datajs.createDataCache = function (options) {
        /// <summary>Creates a data cache for a collection that is efficiently loaded on-demand.</summary>
        /// <param name="options">
        /// Options for the data cache, including name, source, pageSize,
        /// prefetchSize, cacheSize, storage mechanism, and initial prefetch and local-data handler.
        /// </param>
        /// <returns type="DataCache">A new data cache instance.</returns>
        checkUndefinedGreaterThanZero(options.pageSize, "pageSize");
        checkUndefinedOrNumber(options.cacheSize, "cacheSize");
        checkUndefinedOrNumber(options.prefetchSize, "prefetchSize");

        if (!assigned(options.name)) {
            throw { message: "Undefined or null name", options: options };
        }

        if (!assigned(options.source)) {
            throw { message: "Undefined source", options: options };
        }

        return new DataCache(options);
    };



// ##### BEGIN: MODIFIED BY SAP
})(window);
// ##### END: MODIFIED BY SAP