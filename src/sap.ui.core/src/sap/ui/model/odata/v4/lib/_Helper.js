/*!
 * ${copyright}
 */

//Provides class sap.ui.model.odata.v4.lib.Requestor
sap.ui.define(["jquery.sap.global"], function (jQuery) {
	"use strict";

	var rAmpersand = /&/g,
		rEquals = /\=/g,
		rHash = /#/g,
		rPlus = /\+/g,
		rSemicolon = /;/g,
		Helper;

	Helper = {
		/**
		 * Builds a query string from the given parameter map. Takes care of encoding, but ensures
		 * that the characters "$", "(", ")" and "=" are not encoded, so that OData queries remain
		 * readable.
		 *
		 * @param {map} [mParameters]
		 *   a map of key-value pairs representing the query string, the value in this pair has to
		 *   be a string or an array of strings; if it is an array, the resulting query string
		 *   repeats the key for each array value.
		 *   Examples:
		 *   buildQuery({foo: "bar", "bar": "baz"}) results in the query string "foo=bar&bar=baz"
		 *   buildQuery({foo: ["bar", "baz"]}) results in the query string "foo=bar&foo=baz"
		 * @returns {string}
		 *   the query string; it is empty if there are no parameters; it starts with "?" otherwise
		 */
		buildQuery : function (mParameters) {
			var aKeys, aQuery;

			if (!mParameters) {
				return "";
			}

			aKeys = Object.keys(mParameters);
			if (aKeys.length === 0) {
				return "";
			}

			aQuery = [];
			aKeys.forEach(function (sKey) {
				var vValue = mParameters[sKey];

				if (Array.isArray(vValue)) {
					vValue.forEach(function (sItem) {
						aQuery.push(Helper.encodePair(sKey, sItem));
					});
				} else {
					aQuery.push(Helper.encodePair(sKey, vValue));
				}
			});

			return "?" + aQuery.join("&");
		},

		/**
		 * Converts the metadata from XML format to a JSON object.
		 *
		 * @param {Document} oDocument
		 *   the XML DOM document
		 * @returns {object}
		 *   the metadata JSON
		 */
		convertXMLMetadata : function (oDocument) {
			var oAggregate = {
					aliases : {}, // maps alias -> namespace
					entityContainer : null, // the current EntityContainer
					entitySet : null, // the current EntitySet/Singleton
					namespace : null, // the namespace of the current Schema
					referenceUri : null, // the URI of the current Reference
					type : null, // the current EntityType/ComplexType
					result : {
						$Schema : {}
					}
				},
				oElement = oDocument.documentElement;

			// first round: find aliases
			Helper.xml.traverse(oElement, oAggregate, Helper.xml._aliasConfig);
			// second round, full conversion
			Helper.xml.traverse(oElement, oAggregate, Helper.xml._fullConfig);
			return oAggregate.result;
		},

		/**
		 * Returns an <code>Error</code> instance from a jQuery XHR wrapper.
		 *
		 * @param {object} jqXHR
		 *   a jQuery XHR wrapper as received by a failure handler
		 * @param {function} jqXHR.getResponseHeader
		 *   used to access the HTTP response header "Content-Type"
		 * @param {string} jqXHR.responseText
		 *   HTTP response body, sometimes in JSON format ("Content-Type" : "application/json")
		 *   according to OData "19 Error Response" specification, sometimes plain text
		 *   ("Content-Type" : "text/plain"); other formats are ignored
		 * @param {number} jqXHR.status
		 *   HTTP status code
		 * @param {string} jqXHR.statusText
		 *   HTTP status text
		 * @returns {Error}
		 *   an <code>Error</code> instance with the following properties:
		 *   <ul>
		 *     <li><code>error</code>: the "error" value from the OData v4 error response JSON
		 *     object (if available);
		 *     <li><code>isConcurrentModification</code>: <code>true</code> in case of a
		 *     concurrent modification detected via ETags (i.e. HTTP status code 412);
		 *     <li><code>message</code>: error message;
		 *     <li><code>status</code>: HTTP status code;
		 *     <li><code>statusText</code>: HTTP status text.
		 *   </ul>
		 * @see <a href=
		 * "http://docs.oasis-open.org/odata/odata-json-format/v4.0/os/odata-json-format-v4.0-os.html"
		 * >"19 Error Response"</a>
		 */
		createError : function (jqXHR) {
			var sBody = jqXHR.responseText,
				sContentType = jqXHR.getResponseHeader("Content-Type").split(";")[0],
				oResult = new Error(jqXHR.status + " " + jqXHR.statusText);

			oResult.status = jqXHR.status;
			oResult.statusText = jqXHR.statusText;

			if (jqXHR.status === 412) {
				oResult.isConcurrentModification = true;
			}
			if (sContentType === "application/json") {
				try {
					// "The error response MUST be a single JSON object. This object MUST have a
					// single name/value pair named error. The value must be a JSON object."
					oResult.error = JSON.parse(sBody).error;
					oResult.message = oResult.error.message;
				} catch (e) {
					jQuery.sap.log.warning(e.toString(), sBody,
						"sap.ui.model.odata.v4.lib._Helper");
				}
			} else if (sContentType === "text/plain") {
				oResult.message = sBody;
			}

			return oResult;
		},

		/**
		 * Encodes a query part, either a key or a value.
		 *
		 * @param {string} sPart
		 *   the query part
		 * @param {boolean} bEncodeEquals
		 *   if true, "=" is encoded, too
		 * @returns {string}
		 *   the encoded query part
		 */
		encode : function (sPart, bEncodeEquals) {
			var sEncoded = encodeURI(sPart)
					.replace(rAmpersand, "%26")
					.replace(rHash, "%23")
					.replace(rPlus, "%2B")
					.replace(rSemicolon, "%3B");
			if (bEncodeEquals) {
				sEncoded = sEncoded.replace(rEquals, "%3D");
			}
			return sEncoded;
		},

		/**
		 * Encodes a key-value pair.
		 *
		 * @param {string} sKey
		 *   the key
		 * @param {string} sValue
		 *   the sValue
		 * @returns {string}
		 *   the encoded key-value pair in the form "key=value"
		 */
		encodePair : function (sKey, sValue) {
			return Helper.encode(sKey, true) + "=" + Helper.encode(sValue, false);
		},

		xml : {
			/**
			 * Returns the attributes of the DOM Element as map.
			 * @param {Element} oElement
			 *   the element
			 * @returns {map}
			 *   the attributes
			 */
			getAttributes : function (oElement) {
				var oAttribute,
					oAttributeList = oElement.attributes,
					i,
					oResult = {};

				for (i = 0; i < oAttributeList.length; i++) {
					oAttribute = oAttributeList.item(i);
					oResult[oAttribute.name] = oAttribute.value;
				}
				return oResult;
			},

			/**
			 * Extracts the Aliases from the Include and Schema elements.
			 * @param {Element} oElement the element
			 * @param {object} oAggregate the aggregate
			 */
			processAlias : function (oElement, oAggregate) {
				var oAttributes = Helper.xml.getAttributes(oElement);

				if (oAttributes.Alias) {
					oAggregate.aliases[oAttributes.Alias] = oAttributes.Namespace;
				}
			},

			/**
			 * Processes a ComplexType element.
			 * @param {Element} oElement the element
			 * @param {object} oAggregate the aggregate
			 */
			processComplexType : function (oElement, oAggregate) {
				Helper.xml.processType(oElement, oAggregate, {"$kind" : "ComplexType"});
			},

			/**
			 * Processes an EntityContainer element.
			 * @param {Element} oElement the element
			 * @param {object} oAggregate the aggregate
			 */
			processEntityContainer : function (oElement, oAggregate) {
				var sQualifiedName = oAggregate.namespace + "." + oElement.getAttribute("Name");
				oAggregate.result.$Schema[sQualifiedName] = oAggregate.entityContainer = {
					"$kind" : "EntityContainer"
				};
				oAggregate.result.$EntityContainer = sQualifiedName;
			},

			/**
			 * Processes an EntitySet element at the EntityContainer.
			 * @param {Element} oElement the element
			 * @param {object} oAggregate the aggregate
			 */
			processEntitySet : function (oElement, oAggregate) {
				var oAttributes = Helper.xml.getAttributes(oElement);
				oAggregate.entityContainer[oAttributes.Name] = oAggregate.entitySet = {
					$Type : Helper.xml.resolveAlias(oAttributes.EntityType, oAggregate)
				};
				if (oAttributes.IncludeInServiceDocument === "false") {
					oAggregate.entitySet.$IncludeInServiceDocument = false;
				}
			},

			/**
			 * Processes an EntityType element.
			 * @param {Element} oElement the element
			 * @param {object} oAggregate the aggregate
			 */
			processEntityType : function (oElement, oAggregate) {
				Helper.xml.processType(oElement, oAggregate, {$Key : []});
			},

			/**
			 * Processes a PropertyRef element of the EntityType's Key.
			 * @param {Element} oElement the element
			 * @param {object} oAggregate the aggregate
			 */
			processEntityTypeKeyPropertyRef : function (oElement, oAggregate) {
				var oAttributes = Helper.xml.getAttributes(oElement),
					vKey;

				if (oAttributes.Alias) {
					vKey = {};
					vKey[oAttributes.Alias] = oAttributes.Name;
				} else {
					vKey = oAttributes.Name;
				}
				oAggregate.type.$Key = oAggregate.type.$Key.concat(vKey);
			},

			/**
			 * Processes an Include element within a Reference.
			 * @param {Element} oElement the element
			 * @param {object} oAggregate the aggregate
			 */
			processInclude : function (oElement, oAggregate) {
				oAggregate.result.$Schema[oElement.getAttribute("Namespace")] = {
					"$kind" : "Reference",
					"$ref" : oAggregate.referenceUri
				};
			},

			/**
			 * Processes a NavigationPropertyBinding element within an EntitySet or Singleton.
			 * @param {Element} oElement the element
			 * @param {object} oAggregate the aggregate
			 */
			processNavigationPropertyBinding : function (oElement, oAggregate) {
				var oAttributes = Helper.xml.getAttributes(oElement);

				oAggregate.entitySet[oAttributes.Path]
					= Helper.xml.resolveAlias(oAttributes.Target, oAggregate);
			},

			/**
			 * Processes a Reference element.
			 * @param {Element} oElement the element
			 * @param {object} oAggregate the aggregate
			 */
			processReference : function (oElement, oAggregate) {
				oAggregate.referenceUri = oElement.getAttribute("Uri");
			},

			/**
			 * Processes a Schema element.
			 * @param {Element} oElement the element
			 * @param {object} oAggregate the aggregate
			 */
			processSchema : function (oElement, oAggregate) {
				oAggregate.namespace = oElement.getAttribute("Namespace");
			},

			/**
			 * Processes a Singleton element at the EntityContainer.
			 * @param {Element} oElement the element
			 * @param {object} oAggregate the aggregate
			 */
			processSingleton : function (oElement, oAggregate) {
				var oAttributes = Helper.xml.getAttributes(oElement);
				oAggregate.entityContainer[oAttributes.Name] = oAggregate.entitySet = {
					$kind : "Singleton",
					$Type : Helper.xml.resolveAlias(oAttributes.Type, oAggregate)
				};
			},

			/**
			 * Processes a ComplexType or EntityType element.
			 * @param {Element} oElement the element
			 * @param {object} oAggregate the aggregate
			 * @param {object} oType the initial typed result object
			 */
			processType : function (oElement, oAggregate, oType) {
				var oAttributes = Helper.xml.getAttributes(oElement),
					sQualifiedName = oAggregate.namespace + "." + oAttributes.Name;

				if (oAttributes.OpenType === "true") {
					oType.$OpenType = true;
				}
				if (oAttributes.HasStream === "true") {
					oType.$HasStream = true;
				}
				if (oAttributes.Abstract === "true") {
					oType.$Abstract = true;
				}
				if (oAttributes.BaseType) {
					oType.$BaseType = oAttributes.BaseType;
				}

				oAggregate.result.$Schema[sQualifiedName] = oAggregate.type = oType;
			},

			/**
			 * Processes a NavigationProperty element of a structured type.
			 * @param {Element} oElement the element
			 * @param {object} oAggregate the aggregate
			 */
			processTypeNavigationProperty : function (oElement, oAggregate) {
				var oAttributes = Helper.xml.getAttributes(oElement),
					oProperty = {
						$kind : "navigation",
						$Type : Helper.xml.resolveAlias(oAttributes.Type, oAggregate)
					};

				if (oAttributes.Nullable === "false") {
					oProperty.$Nullable = false;
				}
				if (oAttributes.Partner) {
					oProperty.$Partner = oAttributes.Partner;
				}
				if (oAttributes.ContainsTarget === "true") {
					oProperty.$ContainsTarget = true;
				}

				oAggregate.type[oAttributes.Name] = oProperty;
			},

			/**
			 * Processes a Property element of a structured type.
			 * @param {Element} oElement the element
			 * @param {object} oAggregate the aggregate
			 */
			processTypeProperty : function (oElement, oAggregate) {
				var oAttributes = Helper.xml.getAttributes(oElement),
				oProperty = {
					$Type : Helper.xml.resolveAlias(oAttributes.Type, oAggregate)
				};

				if (oAttributes.Nullable === "false") {
					oProperty.$Nullable = false;
				}
				if (oAttributes.MaxLength) {
					oProperty.$MaxLength = parseInt(oAttributes.MaxLength, 10);
				}
				if (oAttributes.Precision) {
					oProperty.$Precision = parseInt(oAttributes.Precision, 10);
				}
				if (oAttributes.Scale) {
					if (oAttributes.Scale === "variable") {
						oProperty.$Scale = oAttributes.Scale;
					} else {
						oProperty.$Scale = parseInt(oAttributes.Scale, 10);
					}
				}
				if (oAttributes.Unicode === "false") {
					oProperty.$Unicode = false;
				}
				if (oAttributes.SRID) {
					oProperty.$SRID = oAttributes.SRID;
				}
				if (oAttributes.DefaultValue) {
					oProperty.$DefaultValue = oAttributes.DefaultValue;
				}
				oAggregate.type[oAttributes.Name] = oProperty;
			},

			/**
			 * Resolves an alias in the given qualified name or full name.
			 * @param {string} sName the name
			 * @param {object} oAggregate the aggregate containing the aliases
			 * @returns {string} the name with the alias resolved (if there was one)
			 */
			resolveAlias : function (sName, oAggregate) {
				var iDot = sName.indexOf("."),
					sNamespace;

				if (sName.indexOf(".", iDot + 1) < 0) { // if there is no second dot
					sNamespace = oAggregate.aliases[sName.slice(0, iDot)];
					if (sNamespace) {
						return sNamespace + "." + sName.slice(iDot + 1);
					}
				}
				return sName;
			},

			/**
			 * Recursively traverses the subtree of a given xml element controlled by the given
			 * schema config.
			 *
			 * @param {Element} oElement
			 *   an XML DOM element
			 * @param {object} oAggregate
			 *   an aggregate object that is passed to every processor function
			 * @param {object} oSchemaConfig
			 *   the configuration for this element. The property __processor is a function called
			 *   with this element and oAggregate as parameters; all other properties are known
			 *   child elements, the value is the configuration for that child element
			 */
			traverse : function (oElement, oAggregate, oSchemaConfig) {
				var oChildList = oElement.childNodes,
					oChildNode, i, oNodeInfo;

				if (oSchemaConfig.__processor) {
					oSchemaConfig.__processor(oElement, oAggregate);
				}
				for (i = 0; i < oChildList.length; i++) {
					oChildNode = oChildList.item(i);
					if (oChildNode.nodeType === 1) { // Node.ELEMENT_NODE
						oNodeInfo = oSchemaConfig[oChildNode.localName];
						if (oNodeInfo) {
							Helper.xml.traverse(oChildNode, oAggregate, oNodeInfo);
						}
					}
				}
			}
		},

		/** Serializes an array of requests to an object containing the batch request body and
		 * mandatory headers for the batch request.
		 *
		 * @param {array} aRequests
		 *  an array of requests objects <code>oRequest</code>
		 * @param {string} oRequest.method
		 *   HTTP method, e.g. "GET"
		 * @param {string} oRequest.url
		 *   absolute or relative URL
		 * @param {object} oRequest.headers
		 *   map of request headers
		 * @returns {object} object containing the following properties:
		 *   <ul>
		 *     <li><code>body</code>: batch request body;
		 *     <li><code>Content-Type</code>: value for the 'Content-Type' header;
		 *     <li><code>MIME-Version</code>: value for the 'MIME-Version' header.
		 *   </ul>
		 */
		serializeBatchRequest : function (aRequests) {
			var sBatchBoundary = jQuery.sap.uid(),
				aRequestBody = [];

			/**
			 * Serializes a map of request headers to be used in a $batch request.
			 *
			 * @param {object} mHeaders
			 *   a map of request headers
			 * @returns {string} serialized string of the given headers
			 */
			function serializeHeaders (mHeaders) {
				var sHeaderName,
					aHeaders = [];

				for (sHeaderName in mHeaders) {
					aHeaders = aHeaders.concat(sHeaderName, ":", mHeaders[sHeaderName], "\r\n");
				}

				return aHeaders.concat("\r\n");
			}

			aRequests.forEach(function(oRequest) {
				aRequestBody = aRequestBody.concat("--", sBatchBoundary,
					"\r\nContent-Type:application/http\r\n",
					"Content-Transfer-Encoding:binary\r\n\r\n",
					oRequest.method, " ", oRequest.url, " HTTP/1.1\r\n",
					serializeHeaders(oRequest.headers), "\r\n");
			});
			aRequestBody = aRequestBody.concat("--", sBatchBoundary, "--\r\n");

			return {
				body : aRequestBody.join(""),
				"Content-Type" : "multipart/mixed; boundary=" + sBatchBoundary,
				"MIME-Version" : "1.0"
			};
		}
	};

	/**
	 * The Schema configurations as used in Helper.xml.traverse.
	 */
	Helper.xml._aliasConfig = {
		"Reference" : {
			"Include" : {__processor : Helper.xml.processAlias}
		},
		"DataServices" : {
			"Schema" : {__processor : Helper.xml.processAlias}
		}
	};
	Helper.xml._fullConfig = {
		"Reference" : {
			__processor : Helper.xml.processReference,
			"Include" : {
				__processor: Helper.xml.processInclude
			}
		},
		"DataServices" : {
			"Schema" : {
				__processor : Helper.xml.processSchema,
				"EntityType" : {
					__processor : Helper.xml.processEntityType,
					"Key" : {
						"PropertyRef" : {
							__processor : Helper.xml.processEntityTypeKeyPropertyRef
						}
					},
					"Property" : {
						__processor : Helper.xml.processTypeProperty
					},
					"NavigationProperty" : {
						__processor : Helper.xml.processTypeNavigationProperty
					}
				},
				"ComplexType" : {
					__processor : Helper.xml.processComplexType,
					"Property" : {
						__processor : Helper.xml.processTypeProperty
					},
					"NavigationProperty" : {
						__processor : Helper.xml.processTypeNavigationProperty
					}
				},
				"EntityContainer" : {
					__processor : Helper.xml.processEntityContainer,
					"EntitySet" : {
						__processor : Helper.xml.processEntitySet,
						"NavigationPropertyBinding" : {
							__processor : Helper.xml.processNavigationPropertyBinding
						}
					},
					"Singleton" : {
						__processor : Helper.xml.processSingleton,
						"NavigationPropertyBinding" : {
							__processor : Helper.xml.processNavigationPropertyBinding
						}
					}
				}
			}
		}
	};

	return Helper;
}, /* bExport= */false);
