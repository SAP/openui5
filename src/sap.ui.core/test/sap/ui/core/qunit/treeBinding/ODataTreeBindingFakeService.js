sap.ui.define("ODataTreeBindingFakeService", function() {
	var xhr;

	function teardown() {
		xhr.restore();
	}

	function setup() {
		var baseURL = "ZTJ_SFIN_HIERARCHY_02_SRV/",
			responseDelay = 10,
			_setTimeout = window.setTimeout,
			csrfToken,
			iSessionCount = 0,
			sessionContextId;

		xhr = sinon.useFakeXMLHttpRequest()

		function updateCsrfToken() {
			csrfToken = "" + Math.floor(Math.random() * 1000000000);
		}

		function deleteCsrfToken() {
			csrfToken = undefined;
		}

		function updateSessionContextId() {
				sessionContextId = "SID-" + Math.floor(Math.random() * 1000000000) + "-NEW";
		}

		function getHeader(headers, header) {
			header = header.toLowerCase();
			for (var i in headers) {
				if (i.toLowerCase() == header) {
					return headers[i];
				}
			}
			return undefined;
		}

		window.odataFakeServiceData = {
			forbidHeadRequest: false,
			csrfRequests: []
		};

		xhr.useFilters = true;
		xhr.addFilter(function(method, url) {
			return url.indexOf(baseURL) != 0;
		});
		xhr.onCreate = function(request) {
			var	responses = {
				"GET": {
					"$metadata":
						[200, oMetaDataHeaders, sMetaData],
					"ZTJ_G4_C_GLHIER(P_CHARTOFACCOUNTS='CACN',P_FINANCIALSTATEMENTVARIANT='9999')/Results?$skip=0&$top=120&$inlinecount=allpages&$filter=(GLAccount_Level%20le%200)":
						[200, oJSONHeaders, sResultsL0Top120],
					"ZTJ_G4_C_GLHIER(P_CHARTOFACCOUNTS='CACN',P_FINANCIALSTATEMENTVARIANT='9999')/Results?$skip=0&$top=120&$inlinecount=allpages&$filter=(GLAccount_Level%20le%201)":
						[200, oJSONHeaders, sResultsL1Top120],
					"ZTJ_G4_C_GLHIER(P_CHARTOFACCOUNTS='CACN',P_FINANCIALSTATEMENTVARIANT='9999')/Results?$skip=0&$top=29&$filter=(GLAccount_Level%20le%201)":
						[200, oJSONHeaders, sResultsL1Top29],
					"ZTJ_G4_C_GLHIER(P_CHARTOFACCOUNTS='CACN',P_FINANCIALSTATEMENTVARIANT='9999')/Results?$skip=0&$top=120&$inlinecount=allpages&$filter=(GLAccount_ParentID%20eq%20%27FinancialStatementItem%3a99991%27)":
						[200, oJSONHeaders, sResultsL0Parent0Top120],
					"ZTJ_G4_C_GLHIER(P_CHARTOFACCOUNTS='CACN',P_FINANCIALSTATEMENTVARIANT='9999')/Results?$skip=0&$top=7&$filter=(GLAccount_Level%20le%200)":
						[200, oJSONHeaders, sResultsL0Top7],
					"ZTJ_G4_C_GLHIER(P_CHARTOFACCOUNTS='CACN',P_FINANCIALSTATEMENTVARIANT='9999')/Results?$skip=0&$top=6&$inlinecount=allpages&$filter=(GLAccount_ParentID%20eq%20%27FinancialStatementItem%3a99991%27)":
						[200, oJSONHeaders, sResultsL0Parent0Top6],
					"ZTJ_G4_C_GLHIER(P_CHARTOFACCOUNTS='CACN',P_FINANCIALSTATEMENTVARIANT='9999')/Results?$skip=0&$top=120&$inlinecount=allpages&$filter=(GLAccount_ParentID%20eq%20%27FinancialStatementItem%3a999912%27)":
						[200, oJSONHeaders, sResultsL1Parent0Top120],
					"ZTJ_G4_C_GLHIER(P_CHARTOFACCOUNTS='CACN',P_FINANCIALSTATEMENTVARIANT='9999')/Results?$skip=0&$top=1&$inlinecount=allpages&$filter=(GLAccount_ParentID%20eq%20%27FinancialStatementItem%3a999912%27)":
						[200, oJSONHeaders, sResultsL1Parent0Top1]
				},
				"POST":{

				},
				"PUT": {

				},
				"MERGE": {

				},
				"DELETE": {

				},
				"HEAD": {

				}
			};

			var getResponse = function(method, url, headers) {
				var bError =
					url.indexOf("Fail500") >= 0 ||
					(url === "/Categories(1-NOHEAD)" && method === "HEAD");

				if (!bError && oServiceStatusConfig.url && Array.isArray(oServiceStatusConfig.url["500"])) {
					bError = oServiceStatusConfig.url["500"].some(function(rCheck) {
						return rCheck.test(url);
					});
				}

				jQuery.sap.log.info(url);

				if (bError) {
					return [500, oHTMLHeaders, "Server Error"];
				}
				var vResponse = typeof(responses[method][url]) === "function"
					? responses[method][url](url, headers)
					: responses[method][url];


				switch (method) {
					case "GET":
						return vResponse || [404, oJSONHeaders, ""];
					case "HEAD":
						var aReturnValues = vResponse || [404, oJSONHeaders, ""];
						aReturnValues[2] = ""; // Same as "GET" but without body
						return aReturnValues;
					case "PUT":
						return vResponse || [204, oJSONHeaders, ""];
					case "MERGE":
						return vResponse || [204, oJSONHeaders, ""];
					case "POST":
						return vResponse || [201, oJSONHeaders, sCategory1JSON];
					case "DELETE":
						return vResponse || [204, oJSONHeaders, ""];
					default:
						return vResponse || [500, oHTMLHeaders, ""];
				}
			};

			request.onSend = function() {
				if (window.fakeRequested) window.fakeRequested();

				function respond(code, headers, data) {
					if (request.async) {
						_setTimeout(function() {
							if (!request.aborted) {
								if (window.fakeResponded) window.fakeResponded();
								request.respond(code, headers, data);
							}
						}, responseDelay);
					} else {
						if (!request.aborted) {
							if (window.fakeResponded) window.fakeResponded();
							request.respond(code, headers, data);
						}
					}
				}

				// CSRF Token handling

				// Special case: Simulate backend that does not allow HEAD requests
				if (window.odataFakeServiceData.forbidHeadRequest && request.method === "HEAD") {
					if (request.url == baseURL) {
						window.odataFakeServiceData.csrfRequests.push(request.method); // Log Requests to service document
					}
					respond(500, oHTMLHeaders, "Server Error");
					return;
				}



				if (["GET", "HEAD"].indexOf(request.method) === -1 && csrfToken) {
					if (getHeader(request.requestHeaders, "X-CSRF-Token") != csrfToken) {

						respond(403, oCsrfRequireHeaders, "");
						return;
					}
				}

				if (request.url == baseURL) {
					// Simulate Soft State header handling
					updateSessionContextId();
					oCsrfResponseHeaders["sap-contextid"] = sessionContextId;

					oCsrfResponseHeaders["X-CSRF-Token"] = csrfToken;
					window.odataFakeServiceData.csrfRequests.push(request.method); // Log Requests to service document
					respond(200, oCsrfResponseHeaders, sServiceDocJSON);
					return;
				}

				// Special handling SAML authentication redirect
				if (request.url.indexOf("SAML200") > 0 || (request.requestBody && request.requestBody.indexOf("SAML200") > 0)) {
					respond(200, oSAMLHeaders, sSAMLLoginPage);
					return;
				}

				// Special handling based on headers
				if (request.url == baseURL + "Categories" || request.url == baseURL + "Categories?horst=true") {
					if (request.requestHeaders["Accept"] == "application/atom+xml,application/atomsvc+xml,application/xml") {
						respond(200, oXMLHeaders, sCategoriesXML);
					}
					else {
						// Simulate Soft State header handling
						updateSessionContextId();
						oJSONHeaders["sap-contextid"] = sessionContextId;

						respond(200, oJSONHeaders, sCategoriesJSON);
					}
					return;
				}

				// Batch request
				if (request.url == baseURL + "$batch") {
					if (request.requestBody.indexOf("Batch500") > 0 || oServiceStatusConfig.batch === 500) {
						respond(500, oJSONHeaders, "Request Failed");
						return;
					}

					if (oServiceStatusConfig.batch === "abort") {
						// sinon.js crashes without this line
						request.responseHeaders = {};
						request.abort();
						return;
					}

					var requests = parseBatchRequest(request.requestBody),
						batchResponses = [],
						nestedResponses,
						failed,
						batchResponse;
					for (var i = 0; i < requests.length; i++) {
						if (requests[i] instanceof Array) {
							nestedResponses = [];
							failed = false;
							for (var j = 0; j < requests[i].length; j++) {
								response = getResponse(requests[i][j].method, requests[i][j].url, requests[i][j].requestHeaders);
								nestedResponses.push(response);
								if (response[0] >= 300) failed = true;
							}
							if (failed) {
								batchResponses.push([500, oJSONHeaders, "Changeset failed"]);
							} else {
								batchResponses.push(nestedResponses);
							}
						} else {
							response = getResponse(requests[i].method, requests[i].url, requests[i].requestHeaders);
							batchResponses.push(response);
						}
					}
					batchResponse = createBatchResponse(batchResponses, "batch-408D0D264EF1AB69CA1BF7");

					updateSessionContextId();
					oBatchHeaders["sap-contextid"] = sessionContextId;

					respond(202, oBatchHeaders, batchResponse);
					return;
				}

				// Look up response
				respond.apply(this, getResponse(request.method, request.url.substr(baseURL.length), request.requestHeaders));
			}
		};

		function parseBatchRequest(body) {
			var token = body.split("\r\n")[1],
				parts = body.split("\r\n" + token),
				part, lines,
				nestedRequests,
				requests = [];
			// loop through parts and create request objects
			for (var i = 1; i < parts.length - 1; i++) {
				part = parts[i];
				if (part.indexOf("\r\nContent-Type: multipart/mixed") == 0) {
					nestedRequests = parseBatchRequest("\r\n" + part.substr(part.indexOf("--")));
					requests.push(nestedRequests);
				} else {
					request = {};
					lines = part.split("\r\n");
					var result = lines[4].match(/(GET|POST|MERGE|PUT|DELETE) ([^ ]*) HTTP\/1\.1/);
					request.method = result[1];
					request.url = result[2];
					request.body = "";
					request.headers = {};
					var headers = true;
					for (var j = 5; j < lines.length; j++) {
						if (lines[j] == "") {
							headers = false;
							continue;
						}
						if (headers) {
							var header = lines[j].split(": ");
							request.headers[header[0]] = header[1];
						} else {
							request.body += lines[j] + "\n";
						}
					}
					requests.push(request);
				}
			}
			return requests;
		}

		function createBatchResponse(responses, token) {
			var responseText = "",
				code, headers, body,
				header,
				innerText,
				response,
				innerToken;
			for (var i = 0; i < responses.length; i++) {
				if (typeof responses[i][0] != "number") {
					innerToken = "changeset-" + Math.random() * 1000000000000000000;
					innerText = "\r\n";
					innerText += createBatchResponse(responses[i], innerToken);
					responseText += "--" + token + "\r\n"
					responseText += "Content-Type: multipart/mixed; boundary=" + innerToken + "\r\n";
					responseText += "Content-Length: " + innerText.length + "\r\n";
					responseText += innerText + "\r\n";
				} else {
					code = responses[i][0];
					headers = responses[i][1];
					body = responses[i][2];
					innerText = "HTTP/1.1 " + code + " ";
					switch (code) {
						case 200:
							innerText += "OK";
							break;
						case 204:
							innerText += "No content";
							break;
						case 201:
							innerText += "Created";
							break;
						case 404:
							innerText += "Not Found";
							break;
						case 500:
							innerText += "Server Error";
							break;
						case 412:
							innerText += "Precodition failed";
							break;
					}
					innerText += "\r\n";
					for (var j in headers) {
						innerText += j + ": " + headers[j] + "\r\n";
					}
					innerText += "Content-Length: " + body.length + "\r\n";
					innerText += "\r\n";
					if (body.length > 0) {
						innerText += body + "\r\n";
					}
					responseText += "--" + token + "\r\n"
					responseText += "Content-Type: application/http\r\n";
					responseText += "Content-Transfer-Encoding: binary\r\n";
					responseText += "Content-Length: " + innerText.length + "\r\n";
					responseText += "\r\n";
					responseText += innerText + "\r\n";
				}
			}
			responseText += "--" + token + "--\r\n"
			return responseText;
		}

	}

	var oMetaDataHeaders = {
			"Content-Type": "application/xml;charset=utf-8",
			"DataServiceVersion": "1.0",
			"last-modified": "Tue, 15 Nov 1994 12:45:26 GMT"
		};
	var oNodataHeaders = 	{
			"DataServiceVersion": "1.0"
		};
	var oXMLHeaders = 	{
			"Content-Type": "application/atom+xml;charset=utf-8",
			"DataServiceVersion": "2.0",
			"Age": "oh so very old",
			"Invalid": "invalid"
		};

	var oJSONHeaders = 	{
			"Content-Type": "application/json;charset=utf-8",
			"DataServiceVersion": "2.0"
		};
	var oCountHeaders = 	{
			"Content-Type": "text/plain;charset=utf-8",
			"DataServiceVersion": "2.0"
		};
	var oBatchHeaders = 	{
			"Content-Type": "multipart/mixed; boundary=batch-408D0D264EF1AB69CA1BF7",
			"DataServiceVersion": "2.0"
		};
	var oHTMLHeaders = 	{
			"Content-Type": "text/html"
		};
	var oSAMLHeaders = 	{
			"Content-Type": "text/html",
			"com.sap.cloud.security.login": "login-request"
		};
	var oCsrfRequireHeaders = 	{
			"Content-Type": "text/plain;charset=utf-8",
			"DataServiceVersion": "2.0",
			"X-CSRF-Token": "required"
		};
	var oCsrfResponseHeaders = 	{
			"Content-Type": "application/json;charset=utf-8",
			"DataServiceVersion": "1.0",
			"X-CSRF-Token": ""
		};
	var oSpecialHeaders = {
		"Content-Type": "application/xml;charset=utf-8",
		"DataServiceVersion": "1.0",
		"lAsT-mOdIfIeD": "morgen frueh",
		"X-CuStOm-HeAdEr": "case-sensitive"
	};
	var sSAMLLoginPage = '<html><body><h1>SAML Login Page</h1></body></html>';

	var sServiceDocJSON = '{"d":{"EntitySets":["AdditionalMetadata","HierarchyNodeInfomationCollection","ZTJ_G4_C_GLHIERResults","ZTJG4GLHIERLabels","ZTJ_G4_C_GLHIER","P_CHARTOFACCOUNTS","I_ChartOfAccounts","I_DraftAdministrativeData","I_FinancialStatementVersionT","I_Language","ZTJ_C_FSVHierarchyTP","Ztj_G4_Chartofaccounts","Ztj_G4_Hierarchy","Ztj_G4_Hierarchyt"]}}';


	var sMetaData = '\
<?xml version="1.0" encoding="utf-8"?>\
<edmx:Edmx Version="1.0" xmlns:edmx="http://schemas.microsoft.com/ado/2007/06/edmx" xmlns:m="http://schemas.microsoft.com/ado/2007/08/dataservices/metadata" xmlns:sap="http://www.sap.com/Protocols/SAPData">\
<edmx:Reference Uri="https://ponyhost/sap/opu/odata/IWFND/CATALOGSERVICE;v=2/Vocabularies(TechnicalName=\'%2FIWBEP%2FVOC_COMMON\',Version=\'0001\',SAP__Origin=\'SFINODATA1\')/$value" xmlns:edmx="http://docs.oasis-open.org/odata/ns/edmx">\
<edmx:Include Alias="Common" Namespace="com.sap.vocabularies.Common.v1"/>\
</edmx:Reference>\
<edmx:DataServices m:DataServiceVersion="2.0">\
<Schema Namespace="ZTJ_SFIN_HIERARCHY_02_SRV" sap:schema-version="1" xml:lang="en" xmlns="http://schemas.microsoft.com/ado/2008/09/edm">\
<EntityType Name="ZTJ_G4_C_GLHIERResult" sap:content-version="1" sap:semantics="aggregate">\
<Key>\
<PropertyRef Name="ID"/>\
</Key>\
<Property Name="ID" Nullable="false" Type="Edm.String" sap:filterable="false" sap:sortable="false" sap:updatable="false"/>\
<Property Name="TotaledProperties" Type="Edm.String" sap:aggregation-role="totaled-properties-list" sap:is-annotation="true" sap:sortable="false" sap:updatable="false"/>\
<Property MaxLength="4" Name="ChartOfAccounts" Type="Edm.String" sap:aggregation-role="dimension" sap:creatable="false" sap:label="Chart of Accounts" sap:updatable="false"/>\
<Property MaxLength="10" Name="GLAccount" Type="Edm.String" sap:aggregation-role="dimension" sap:creatable="false" sap:label="G/L Account" sap:super-ordinate="ChartOfAccounts" sap:text="GLAccount_T" sap:updatable="false"/>\
<Property MaxLength="65" Name="GLAccount_NodeID" Type="Edm.String" sap:filterable="false" sap:hierarchy-node-for="GLAccount" sap:label="G/L Account Node ID" sap:required-in-filter="false" sap:sortable="false" sap:text="GLAccount_NodeText"/>\
<Property MaxLength="60" Name="GLAccount_NodeIDExt" Type="Edm.String" sap:hierarchy-node-external-key-for="GLAccount_NodeID" sap:label="G/L Account Node ID External" sap:required-in-filter="false" sap:sortable="false" sap:text="GLAccount_NodeText"/>\
<Property MaxLength="60" Name="GLAccount_NodeText" Type="Edm.String" sap:filterable="false" sap:label="G/L Account Node Text" sap:sortable="false"/>\
<Property MaxLength="60" Name="GLAccount_ParentID" Type="Edm.String" sap:hierarchy-parent-node-for="GLAccount_NodeID" sap:label="G/L Account Parent ID" sap:required-in-filter="false" sap:sortable="false"/>\
<Property Name="GLAccount_Level" Type="Edm.Int16" sap:hierarchy-level-for="GLAccount_NodeID" sap:label="G/L Account Level" sap:required-in-filter="false" sap:sortable="false"/>\
<Property MaxLength="9" Name="GLAccount_Drillstate" Type="Edm.String" sap:filterable="false" sap:hierarchy-drill-state-for="GLAccount_NodeID" sap:is-annotation="true" sap:label="G/L Account Drilldown State" sap:sortable="false"/>\
<Property Name="GLAccount_Nodecount" Type="Edm.Int16" sap:filterable="false" sap:hierarchy-node-descendant-count-for="GLAccount_NodeID" sap:is-annotation="true" sap:label="G/L Account Counter for Descendant Nodes" sap:sortable="false"/>\
<Property MaxLength="40" Name="GLAccount_T" Type="Edm.String" sap:creatable="false" sap:filterable="false" sap:label="G/L Account" sap:updatable="false"/>\
<Property MaxLength="1" Name="Action" Type="Edm.String" sap:aggregation-role="dimension" sap:creatable="false" sap:label="ACTION" sap:updatable="false"/>\
<Property MaxLength="1" Name="NodeType" Type="Edm.String" sap:aggregation-role="dimension" sap:creatable="false" sap:label="NODETYPE" sap:updatable="false"/>\
<Property Name="counter" Precision="42" Scale="0" Type="Edm.Decimal" sap:aggregation-role="measure" sap:creatable="false" sap:filterable="false" sap:label="Counter" sap:text="counter_F" sap:updatable="false"/>\
<Property MaxLength="60" Name="counter_F" Type="Edm.String" sap:creatable="false" sap:filterable="false" sap:label="Counter (Formatted)" sap:updatable="false"/>\
<NavigationProperty FromRole="ToRole_ZTJG4GLHIERParametersToResult" Name="Parameters" Relationship="ZTJ_SFIN_HIERARCHY_02_SRV.ZTJG4GLHIERParametersToResult" ToRole="FromRole_ZTJG4GLHIERParametersToResult"/>\
</EntityType>\
<EntityType Name="ZTJG4GLHIERLabels" sap:content-version="1">\
<Key>\
<PropertyRef Name="Name"/>\
</Key>\
<Property Name="Name" Nullable="false" Type="Edm.String"/>\
<Property Name="Label" Type="Edm.String"/>\
</EntityType>\
<EntityType Name="ZTJ_G4_C_GLHIERParameters" sap:content-version="1" sap:semantics="parameters">\
<Key>\
<PropertyRef Name="P_CHARTOFACCOUNTS"/>\
<PropertyRef Name="P_FINANCIALSTATEMENTVARIANT"/>\
</Key>\
<Property MaxLength="4" Name="P_CHARTOFACCOUNTS" Nullable="false" Type="Edm.String" sap:label="Chart of Accounts" sap:parameter="mandatory" sap:sortable="false" sap:text="P_CHARTOFACCOUNTSText"/>\
<Property MaxLength="60" Name="P_CHARTOFACCOUNTSText" Type="Edm.String" sap:filterable="false" sap:label="Chart of Accounts" sap:sortable="false"/>\
<Property MaxLength="60" Name="P_FINANCIALSTATEMENTVARIANT" Nullable="false" Type="Edm.String" sap:filterable="false" sap:label="Fin. Stmt Vers." sap:parameter="mandatory" sap:sortable="false" sap:text="P_FINANCIALSTATEMENTVARIANTText"/>\
<Property MaxLength="60" Name="P_FINANCIALSTATEMENTVARIANTText" Type="Edm.String" sap:filterable="false" sap:label="Fin. Stmt Vers." sap:sortable="false"/>\
<NavigationProperty FromRole="ToRole_P_CHARTOFACCOUNTSToListOfValues" Name="P_CHARTOFACCOUNTSDetails" Relationship="ZTJ_SFIN_HIERARCHY_02_SRV.P_CHARTOFACCOUNTSToListOfValues" ToRole="FromRole_P_CHARTOFACCOUNTSToListOfValues"/>\
<NavigationProperty FromRole="FromRole_ZTJG4GLHIERParametersToResult" Name="Results" Relationship="ZTJ_SFIN_HIERARCHY_02_SRV.ZTJG4GLHIERParametersToResult" ToRole="ToRole_ZTJG4GLHIERParametersToResult"/>\
<NavigationProperty FromRole="FromRole_ZTJG4GLHIERParametersToLabels" Name="Labels" Relationship="ZTJ_SFIN_HIERARCHY_02_SRV.ZTJG4GLHIERParametersToLabels" ToRole="ToRole_ZTJG4GLHIERParametersToLabels"/>\
</EntityType>\
<EntityType Name="P_CHARTOFACCOUNTS" sap:content-version="1">\
<Key>\
<PropertyRef Name="P_CHARTOFACCOUNTS_ID"/>\
</Key>\
<Property MaxLength="4" Name="P_CHARTOFACCOUNTS_ID" Nullable="false" Type="Edm.String" sap:creatable="false" sap:label="Chart of Accounts" sap:sortable="false" sap:text="P_CHARTOFACCOUNTS_TEXT" sap:updatable="false"/>\
<Property Name="P_CHARTOFACCOUNTS_TEXT" Type="Edm.String" sap:creatable="false" sap:filterable="false" sap:sortable="false" sap:updatable="false"/>\
</EntityType>\
<EntityType Name="ODataQueryAdditionalMetadata" sap:content-version="1">\
<Key>\
<PropertyRef Name="ODataQueryMetadata"/>\
</Key>\
<Property Name="ODataQueryMetadata" Nullable="false" Type="Edm.String" sap:creatable="false" sap:filterable="false" sap:sortable="false" sap:updatable="false"/>\
<Property Name="ODataQueryMetadataValue_Current" Type="Edm.String" sap:creatable="false" sap:filterable="false" sap:sortable="false" sap:updatable="false"/>\
<Property Name="ODataQueryMetadataValueAtDefine" Type="Edm.String" sap:creatable="false" sap:filterable="false" sap:sortable="false" sap:updatable="false"/>\
</EntityType>\
<EntityType Name="HierarchyNodeInfomation" sap:content-version="1">\
<Key>\
<PropertyRef Name="Financialstatementvariant"/>\
<PropertyRef Name="Chartofaccounts"/>\
</Key>\
<Property MaxLength="4" Name="Financialstatementvariant" Nullable="false" Type="Edm.String" sap:creatable="false" sap:label="Fin. Stmt Vers." sap:sortable="false" sap:updatable="false"/>\
<Property MaxLength="4" Name="Chartofaccounts" Nullable="false" Type="Edm.String" sap:creatable="false" sap:label="Chart of Accts" sap:sortable="false" sap:updatable="false"/>\
<Property MaxLength="10" Name="Fanancialstatementitem" Nullable="false" Type="Edm.String" sap:creatable="false" sap:filterable="false" sap:label="FS Item" sap:sortable="false" sap:updatable="false"/>\
<Property MaxLength="10" Name="Fromaccount" Nullable="false" Type="Edm.String" sap:creatable="false" sap:label="" sap:sortable="false" sap:updatable="false"/>\
</EntityType>\
<EntityType Name="I_ChartOfAccountsType" sap:content-version="1" sap:label="Chart Of Accounts">\
<Key>\
<PropertyRef Name="ChartOfAccounts"/>\
</Key>\
<Property MaxLength="4" Name="ChartOfAccounts" Nullable="false" Type="Edm.String" sap:display-format="UpperCase" sap:label="Chart of Accounts" sap:text="ChartOfAccounts_Text"/>\
<Property MaxLength="50" Name="ChartOfAccounts_Text" Type="Edm.String" sap:creatable="false" sap:label="Description" sap:quickinfo="Chart of Accounts Description" sap:updatable="false"/>\
<Property MaxLength="4" Name="CorporateGroupChartOfAccounts" Type="Edm.String" sap:display-format="UpperCase" sap:label="Group Chart of Accts"/>\
<Property Name="ChartOfAcctsIsBlocked" Type="Edm.Boolean" sap:display-format="UpperCase" sap:label="Blocked" sap:quickinfo="Indicator: Is the Chart of Accounts Blocked ?"/>\
<Property MaxLength="2" Name="MaintenanceLanguage" Type="Edm.String" sap:label="Maint.Language" sap:quickinfo="Maintenance Language for the Chart of Accounts"/>\
</EntityType>\
<EntityType Name="I_DraftAdministrativeDataType" sap:content-version="1" sap:label="Draft Administrative Data">\
<Key>\
<PropertyRef Name="DraftUUID"/>\
</Key>\
<Property Name="DraftUUID" Nullable="false" Type="Edm.Guid" sap:label="Draft (Technical ID)"/>\
<Property Name="DraftIsKeptByUser" Type="Edm.Boolean" sap:display-format="UpperCase" sap:label="Draft Is Kept By User"/>\
<Property Name="EnqueueStartDateTime" Precision="7" Type="Edm.DateTimeOffset" sap:label="Draft Locked Since"/>\
<Property Name="DraftIsCreatedByMe" Type="Edm.Boolean" sap:display-format="UpperCase" sap:label="Draft Created By Me"/>\
<Property Name="DraftIsLastChangedByMe" Type="Edm.Boolean" sap:display-format="UpperCase" sap:label="Draft Last Changed By Me"/>\
<Property Name="DraftIsProcessedByMe" Type="Edm.Boolean" sap:display-format="UpperCase" sap:label="Draft In Process By Me"/>\
<Property MaxLength="80" Name="CreatedByUserDescription" Type="Edm.String" sap:label="Draft Created By (Description)"/>\
<Property MaxLength="80" Name="LastChangedByUserDescription" Type="Edm.String" sap:label="Draft Last Changed By (Description)"/>\
<Property MaxLength="80" Name="InProcessByUserDescription" Type="Edm.String" sap:label="Draft In Process By (Description)"/>\
<Property MaxLength="30" Name="DraftEntityType" Type="Edm.String" sap:display-format="UpperCase" sap:label="Draft Entity ID"/>\
<Property Name="CreationDateTime" Precision="7" Type="Edm.DateTimeOffset" sap:label="Draft Created On"/>\
<Property MaxLength="12" Name="CreatedByUser" Type="Edm.String" sap:display-format="UpperCase" sap:label="Draft Created By" sap:text="CreatedByUserDescription"/>\
<Property Name="LastChangeDateTime" Precision="7" Type="Edm.DateTimeOffset" sap:label="Draft Last Changed On"/>\
<Property MaxLength="12" Name="LastChangedByUser" Type="Edm.String" sap:display-format="UpperCase" sap:label="Draft Last Changed By" sap:text="LastChangedByUserDescription"/>\
<Property MaxLength="1" Name="DraftAccessType" Type="Edm.String" sap:display-format="UpperCase" sap:label="Draft Access Type"/>\
<Property Name="ProcessingStartDateTime" Precision="7" Type="Edm.DateTimeOffset" sap:label="Draft In Process Since"/>\
<Property MaxLength="12" Name="InProcessByUser" Type="Edm.String" sap:display-format="UpperCase" sap:label="Draft In Process By" sap:text="InProcessByUserDescription"/>\
</EntityType>\
<EntityType Name="I_FinancialStatementVersionTType" sap:content-version="1" sap:label="Financial Statement Version Text">\
<Key>\
<PropertyRef Name="FinancialStatementVariant"/>\
<PropertyRef Name="Language"/>\
</Key>\
<Property MaxLength="4" Name="FinancialStatementVariant" Nullable="false" Type="Edm.String" sap:display-format="UpperCase" sap:label="Fin. Stmt Vers." sap:quickinfo="Financial Statement Version"/>\
<Property MaxLength="2" Name="Language" Nullable="false" Type="Edm.String" sap:label="Language Key"/>\
<Property MaxLength="50" Name="FinancialStatementVariantName" Type="Edm.String" sap:label="Name" sap:quickinfo="Financial Statement Version Name"/>\
</EntityType>\
<EntityType Name="I_LanguageType" sap:content-version="1" sap:label="Language">\
<Key>\
<PropertyRef Name="Language"/>\
</Key>\
<Property MaxLength="2" Name="Language" Nullable="false" Type="Edm.String" sap:label="Language Key" sap:text="Language_Text"/>\
<Property MaxLength="16" Name="Language_Text" Type="Edm.String" sap:creatable="false" sap:label="Name" sap:quickinfo="Name of Language" sap:updatable="false"/>\
<Property MaxLength="2" Name="LanguageISOCode" Type="Edm.String" sap:display-format="UpperCase" sap:label="Lang. (ISO 639)" sap:quickinfo="2-Character SAP Language Code"/>\
</EntityType>\
<EntityType Name="ZTJ_C_FSVHierarchyTPType" sap:content-version="1" sap:label="fsv hierarchy draft consumption">\
<Key>\
<PropertyRef Name="FinancialStatementVariant"/>\
<PropertyRef Name="DraftUUID"/>\
<PropertyRef Name="IsActiveEntity"/>\
</Key>\
<Property Name="Activation_ac" Type="Edm.Boolean" sap:creatable="false" sap:filterable="false" sap:label="Dyn. Action Control" sap:sortable="false" sap:updatable="false"/>\
<Property Name="Edit_ac" Type="Edm.Boolean" sap:creatable="false" sap:filterable="false" sap:label="Dyn. Action Control" sap:sortable="false" sap:updatable="false"/>\
<Property Name="Preparation_ac" Type="Edm.Boolean" sap:creatable="false" sap:filterable="false" sap:label="Dyn. Action Control" sap:sortable="false" sap:updatable="false"/>\
<Property Name="Validation_ac" Type="Edm.Boolean" sap:creatable="false" sap:filterable="false" sap:label="Dyn. Action Control" sap:sortable="false" sap:updatable="false"/>\
<Property Name="FunctionalAreaIsUsed_fc" Type="Edm.Byte" sap:creatable="false" sap:filterable="false" sap:label="Dyn. Field Control" sap:sortable="false" sap:updatable="false"/>\
<Property Name="GroupChartOfAccountIsUsed_fc" Type="Edm.Byte" sap:creatable="false" sap:filterable="false" sap:label="Dyn. Field Control" sap:sortable="false" sap:updatable="false"/>\
<Property Name="HierarchyVariantForEdit_fc" Type="Edm.Byte" sap:creatable="false" sap:filterable="false" sap:label="Dyn. Field Control" sap:sortable="false" sap:updatable="false"/>\
<Property Name="MaintenanceLanguage_fc" Type="Edm.Byte" sap:creatable="false" sap:filterable="false" sap:label="Dyn. Field Control" sap:sortable="false" sap:updatable="false"/>\
<Property MaxLength="4" Name="FinancialStatementVariant" Nullable="false" Type="Edm.String" sap:creatable="false" sap:display-format="UpperCase" sap:label="Fin. Stmt Vers." sap:quickinfo="Financial Statement Version" sap:updatable="false"/>\
<Property MaxLength="4" Name="ChartOfAccounts" Type="Edm.String" sap:creatable="false" sap:display-format="UpperCase" sap:label="Chart of Accounts" sap:quickinfo="Financial Statement Version Uses Only One Chart of Accounts" sap:text="to_ChartOfAccounts/ChartOfAccounts_Text" sap:updatable="false" sap:value-list="standard"/>\
<Property MaxLength="4" Name="HierarchyVariantForEdit" Type="Edm.String" sap:display-format="UpperCase" sap:field-control="HierarchyVariantForEdit_fc" sap:label="Fin. Stmt Vers." sap:quickinfo="Financial Statement Version" sap:value-list="standard"/>\
<Property MaxLength="2" Name="MaintenanceLanguage" Type="Edm.String" sap:field-control="MaintenanceLanguage_fc" sap:label="Language Key" sap:text="to_Language/Language_Text" sap:value-list="standard"/>\
<Property Name="GroupChartOfAccountIsUsed" Type="Edm.Boolean" sap:display-format="UpperCase" sap:field-control="GroupChartOfAccountIsUsed_fc" sap:label="Group Account Number" sap:quickinfo="Financial Statement Version Uses Group Chart of Accounts"/>\
<Property MaxLength="1" Name="FunctionalAreaIsUsed" Type="Edm.String" sap:display-format="UpperCase" sap:field-control="FunctionalAreaIsUsed_fc" sap:label="Fun.Area Perm." sap:quickinfo="Indicator: Assignment of Functional Areas Is Permitted"/>\
<Property Name="DraftUUID" Nullable="false" Type="Edm.Guid" sap:label="Key"/>\
<Property Name="DraftEntityCreationDateTime" Precision="7" Type="Edm.DateTimeOffset" sap:label="Draft Created On"/>\
<Property Name="DraftEntityLastChangeDateTime" Precision="7" Type="Edm.DateTimeOffset" sap:label="Draft Last Changed On"/>\
<Property Name="HasActiveEntity" Type="Edm.Boolean" sap:display-format="UpperCase" sap:label="Has active" sap:sortable="false"/>\
<Property Name="HasDraftEntity" Type="Edm.Boolean" sap:display-format="UpperCase" sap:label="Has Draft" sap:sortable="false"/>\
<Property Name="IsActiveEntity" Nullable="false" Type="Edm.Boolean" sap:display-format="UpperCase" sap:label="Is active" sap:sortable="false"/>\
<NavigationProperty FromRole="FromRole_assoc_58EB9B168452ADF63C3BE45CDEE99844" Name="DraftAdministrativeData" Relationship="ZTJ_SFIN_HIERARCHY_02_SRV.assoc_58EB9B168452ADF63C3BE45CDEE99844" ToRole="ToRole_assoc_58EB9B168452ADF63C3BE45CDEE99844"/>\
<NavigationProperty FromRole="FromRole_assoc_4782569891A012A4D3F3B4E587E57712" Name="SiblingEntity" Relationship="ZTJ_SFIN_HIERARCHY_02_SRV.assoc_4782569891A012A4D3F3B4E587E57712" ToRole="ToRole_assoc_4782569891A012A4D3F3B4E587E57712"/>\
<NavigationProperty FromRole="FromRole_assoc_ECBAB52142C877BEDABDE3ABD9491FA6" Name="to_ChartOfAccounts" Relationship="ZTJ_SFIN_HIERARCHY_02_SRV.assoc_ECBAB52142C877BEDABDE3ABD9491FA6" ToRole="ToRole_assoc_ECBAB52142C877BEDABDE3ABD9491FA6"/>\
<NavigationProperty FromRole="FromRole_assoc_000A78B51019E07B6DC9989DCC09F81D" Name="to_Language" Relationship="ZTJ_SFIN_HIERARCHY_02_SRV.assoc_000A78B51019E07B6DC9989DCC09F81D" ToRole="ToRole_assoc_000A78B51019E07B6DC9989DCC09F81D"/>\
<NavigationProperty FromRole="FromRole_assoc_13A43A207F51A1B4207B9E03FEF38AD5" Name="to_Text" Relationship="ZTJ_SFIN_HIERARCHY_02_SRV.assoc_13A43A207F51A1B4207B9E03FEF38AD5" ToRole="ToRole_assoc_13A43A207F51A1B4207B9E03FEF38AD5"/>\
</EntityType>\
<EntityType Name="Ztj_G4_ChartofaccountsType" sap:content-version="1" sap:label="Chart Of Accounts">\
<Key>\
<PropertyRef Name="ChartOfAccounts"/>\
</Key>\
<Property MaxLength="4" Name="ChartOfAccounts" Nullable="false" Type="Edm.String" sap:display-format="UpperCase" sap:label="Chart of Accounts" sap:text="ChartOfAccounts_Text"/>\
<Property MaxLength="50" Name="ChartOfAccounts_Text" Type="Edm.String" sap:creatable="false" sap:label="Description" sap:quickinfo="Chart of Accounts Description" sap:updatable="false"/>\
<Property MaxLength="4" Name="CorporateGroupChartOfAccounts" Type="Edm.String" sap:display-format="UpperCase" sap:label="Group Chart of Accts"/>\
<Property Name="ChartOfAcctsIsBlocked" Type="Edm.Boolean" sap:display-format="UpperCase" sap:label="Blocked" sap:quickinfo="Indicator: Is the Chart of Accounts Blocked ?"/>\
<Property MaxLength="2" Name="MaintenanceLanguage" Type="Edm.String" sap:label="Maint.Language" sap:quickinfo="Maintenance Language for the Chart of Accounts"/>\
</EntityType>\
<EntityType Name="Ztj_G4_HierarchyType" sap:content-version="1" sap:label="Financial Statement Version">\
<Key>\
<PropertyRef Name="FinancialStatementVariant"/>\
<PropertyRef Name="ChartOfAccounts"/>\
</Key>\
<Property MaxLength="4" Name="FinancialStatementVariant" Nullable="false" Type="Edm.String" sap:display-format="UpperCase" sap:label="Fin. Stmt Vers." sap:quickinfo="Financial Statement Version" sap:text="FinancialStatementVariantName"/>\
<Property MaxLength="10" Name="PLResult" Type="Edm.String" sap:display-format="UpperCase" sap:label="P+L Profit" sap:quickinfo="Fin.Statement Key Representing the P+L Profit Item"/>\
<Property MaxLength="10" Name="NotAssigned" Type="Edm.String" sap:display-format="UpperCase" sap:label="Not Assignable" sap:quickinfo="Item Key Representing the Non-Assignable Accounts"/>\
<Property MaxLength="10" Name="Notes" Type="Edm.String" sap:display-format="UpperCase" sap:label="Fin. Statement Notes" sap:quickinfo="Item Key That Represents the Notes to Financial Statements"/>\
<Property MaxLength="14" Name="UpdateTime" Type="Edm.String" sap:display-format="UpperCase"/>\
<Property MaxLength="50" Name="FinancialStatementVariantName" Type="Edm.String" sap:label="Name" sap:quickinfo="Financial Statement Version Name"/>\
<Property MaxLength="4" Name="ChartOfAccounts" Nullable="false" Type="Edm.String" sap:display-format="UpperCase" sap:label="Chart of Accounts" sap:quickinfo="Financial Statement Version Uses Only One Chart of Accounts" sap:text="to_ChartOfAccounts/ChartOfAccounts_Text" sap:value-list="standard"/>\
<Property MaxLength="2" Name="MaintenanceLanguage" Type="Edm.String" sap:label="Language Key" sap:text="to_Language/Language_Text" sap:value-list="standard"/>\
<Property Name="GroupChartOfAccountIsUsed" Type="Edm.Boolean" sap:display-format="UpperCase" sap:label="Group Account Number" sap:quickinfo="Financial Statement Version Uses Group Chart of Accounts"/>\
<Property MaxLength="1" Name="FunctionalAreaIsUsed" Type="Edm.String" sap:display-format="UpperCase" sap:label="Fun.Area Perm." sap:quickinfo="Indicator: Assignment of Functional Areas Is Permitted"/>\
<Property MaxLength="10" Name="Assets" Type="Edm.String" sap:display-format="UpperCase" sap:label="Assets" sap:quickinfo="Item Key Representing the Assets"/>\
<Property MaxLength="10" Name="Equity" Type="Edm.String" sap:display-format="UpperCase" sap:label="Liabilities &amp; Equity" sap:quickinfo="Item Key Representing the Liabilities"/>\
<Property MaxLength="10" Name="NetLoss" Type="Edm.String" sap:display-format="UpperCase" sap:label="Net Result: Loss" sap:quickinfo="Item Key Representing the Line Item Net Loss"/>\
<Property MaxLength="10" Name="NetProfit" Type="Edm.String" sap:display-format="UpperCase" sap:label="Net Profit/Year" sap:quickinfo="Fin.Statement Key Representing the Net Profit/Yr"/>\
<NavigationProperty FromRole="FromRole_assoc_CB9E73935418CD69ACAF70778A03FC0C" Name="to_ChartOfAccounts" Relationship="ZTJ_SFIN_HIERARCHY_02_SRV.assoc_CB9E73935418CD69ACAF70778A03FC0C" ToRole="ToRole_assoc_CB9E73935418CD69ACAF70778A03FC0C"/>\
<NavigationProperty FromRole="FromRole_assoc_41C0A870D47E10A2558F6C3607AC0098" Name="to_Language" Relationship="ZTJ_SFIN_HIERARCHY_02_SRV.assoc_41C0A870D47E10A2558F6C3607AC0098" ToRole="ToRole_assoc_41C0A870D47E10A2558F6C3607AC0098"/>\
<NavigationProperty FromRole="FromRole_assoc_F58ADADA0E579745A4DFA3A419FA5A93" Name="to_Text" Relationship="ZTJ_SFIN_HIERARCHY_02_SRV.assoc_F58ADADA0E579745A4DFA3A419FA5A93" ToRole="ToRole_assoc_F58ADADA0E579745A4DFA3A419FA5A93"/>\
</EntityType>\
<EntityType Name="Ztj_G4_HierarchytType" sap:content-version="1" sap:label="Financial Statement Version Text">\
<Key>\
<PropertyRef Name="FinancialStatementVariant"/>\
<PropertyRef Name="Language"/>\
</Key>\
<Property MaxLength="4" Name="FinancialStatementVariant" Nullable="false" Type="Edm.String" sap:display-format="UpperCase" sap:label="Fin. Stmt Vers." sap:quickinfo="Financial Statement Version"/>\
<Property MaxLength="2" Name="Language" Nullable="false" Type="Edm.String" sap:label="Language Key"/>\
<Property MaxLength="50" Name="FinancialStatementVariantName" Type="Edm.String" sap:label="Name" sap:quickinfo="Financial Statement Version Name"/>\
</EntityType>\
<ComplexType Name="ValidationFunctionResult">\
<Property Name="IsValid" Type="Edm.Boolean" sap:label="Is valid"/>\
</ComplexType>\
<Association Name="P_CHARTOFACCOUNTSToListOfValues" sap:content-version="1">\
<End Multiplicity="1" Role="FromRole_P_CHARTOFACCOUNTSToListOfValues" Type="ZTJ_SFIN_HIERARCHY_02_SRV.P_CHARTOFACCOUNTS"/>\
<End Multiplicity="*" Role="ToRole_P_CHARTOFACCOUNTSToListOfValues" Type="ZTJ_SFIN_HIERARCHY_02_SRV.ZTJ_G4_C_GLHIERParameters"/>\
<ReferentialConstraint>\
<Principal Role="FromRole_P_CHARTOFACCOUNTSToListOfValues">\
<PropertyRef Name="P_CHARTOFACCOUNTS_ID"/>\
</Principal>\
<Dependent Role="ToRole_P_CHARTOFACCOUNTSToListOfValues">\
<PropertyRef Name="P_CHARTOFACCOUNTS"/>\
</Dependent>\
</ReferentialConstraint>\
</Association>\
<Association Name="ZTJG4GLHIERParametersToResult" sap:content-version="1">\
<End Multiplicity="1" Role="FromRole_ZTJG4GLHIERParametersToResult" Type="ZTJ_SFIN_HIERARCHY_02_SRV.ZTJ_G4_C_GLHIERParameters"/>\
<End Multiplicity="*" Role="ToRole_ZTJG4GLHIERParametersToResult" Type="ZTJ_SFIN_HIERARCHY_02_SRV.ZTJ_G4_C_GLHIERResult"/>\
</Association>\
<Association Name="ZTJG4GLHIERParametersToLabels" sap:content-version="1">\
<End Multiplicity="1" Role="FromRole_ZTJG4GLHIERParametersToLabels" Type="ZTJ_SFIN_HIERARCHY_02_SRV.ZTJ_G4_C_GLHIERParameters"/>\
<End Multiplicity="*" Role="ToRole_ZTJG4GLHIERParametersToLabels" Type="ZTJ_SFIN_HIERARCHY_02_SRV.ZTJG4GLHIERLabels"/>\
</Association>\
<Association Name="assoc_4782569891A012A4D3F3B4E587E57712" sap:content-version="1">\
<End Multiplicity="1" Role="FromRole_assoc_4782569891A012A4D3F3B4E587E57712" Type="ZTJ_SFIN_HIERARCHY_02_SRV.ZTJ_C_FSVHierarchyTPType"/>\
<End Multiplicity="0..1" Role="ToRole_assoc_4782569891A012A4D3F3B4E587E57712" Type="ZTJ_SFIN_HIERARCHY_02_SRV.ZTJ_C_FSVHierarchyTPType"/>\
</Association>\
<Association Name="assoc_ECBAB52142C877BEDABDE3ABD9491FA6" sap:content-version="1">\
<End Multiplicity="1" Role="FromRole_assoc_ECBAB52142C877BEDABDE3ABD9491FA6" Type="ZTJ_SFIN_HIERARCHY_02_SRV.ZTJ_C_FSVHierarchyTPType"/>\
<End Multiplicity="0..1" Role="ToRole_assoc_ECBAB52142C877BEDABDE3ABD9491FA6" Type="ZTJ_SFIN_HIERARCHY_02_SRV.I_ChartOfAccountsType"/>\
<ReferentialConstraint>\
<Principal Role="ToRole_assoc_ECBAB52142C877BEDABDE3ABD9491FA6">\
<PropertyRef Name="ChartOfAccounts"/>\
</Principal>\
<Dependent Role="FromRole_assoc_ECBAB52142C877BEDABDE3ABD9491FA6">\
<PropertyRef Name="ChartOfAccounts"/>\
</Dependent>\
</ReferentialConstraint>\
</Association>\
<Association Name="assoc_000A78B51019E07B6DC9989DCC09F81D" sap:content-version="1">\
<End Multiplicity="1" Role="FromRole_assoc_000A78B51019E07B6DC9989DCC09F81D" Type="ZTJ_SFIN_HIERARCHY_02_SRV.ZTJ_C_FSVHierarchyTPType"/>\
<End Multiplicity="0..1" Role="ToRole_assoc_000A78B51019E07B6DC9989DCC09F81D" Type="ZTJ_SFIN_HIERARCHY_02_SRV.I_LanguageType"/>\
<ReferentialConstraint>\
<Principal Role="ToRole_assoc_000A78B51019E07B6DC9989DCC09F81D">\
<PropertyRef Name="Language"/>\
</Principal>\
<Dependent Role="FromRole_assoc_000A78B51019E07B6DC9989DCC09F81D">\
<PropertyRef Name="MaintenanceLanguage"/>\
</Dependent>\
</ReferentialConstraint>\
</Association>\
<Association Name="assoc_13A43A207F51A1B4207B9E03FEF38AD5" sap:content-version="1">\
<End Multiplicity="1" Role="FromRole_assoc_13A43A207F51A1B4207B9E03FEF38AD5" Type="ZTJ_SFIN_HIERARCHY_02_SRV.ZTJ_C_FSVHierarchyTPType"/>\
<End Multiplicity="*" Role="ToRole_assoc_13A43A207F51A1B4207B9E03FEF38AD5" Type="ZTJ_SFIN_HIERARCHY_02_SRV.I_FinancialStatementVersionTType"/>\
</Association>\
<Association Name="assoc_58EB9B168452ADF63C3BE45CDEE99844" sap:content-version="1">\
<End Multiplicity="1" Role="FromRole_assoc_58EB9B168452ADF63C3BE45CDEE99844" Type="ZTJ_SFIN_HIERARCHY_02_SRV.ZTJ_C_FSVHierarchyTPType"/>\
<End Multiplicity="0..1" Role="ToRole_assoc_58EB9B168452ADF63C3BE45CDEE99844" Type="ZTJ_SFIN_HIERARCHY_02_SRV.I_DraftAdministrativeDataType"/>\
</Association>\
<Association Name="assoc_CB9E73935418CD69ACAF70778A03FC0C" sap:content-version="1">\
<End Multiplicity="1" Role="FromRole_assoc_CB9E73935418CD69ACAF70778A03FC0C" Type="ZTJ_SFIN_HIERARCHY_02_SRV.Ztj_G4_HierarchyType"/>\
<End Multiplicity="0..1" Role="ToRole_assoc_CB9E73935418CD69ACAF70778A03FC0C" Type="ZTJ_SFIN_HIERARCHY_02_SRV.Ztj_G4_ChartofaccountsType"/>\
<ReferentialConstraint>\
<Principal Role="ToRole_assoc_CB9E73935418CD69ACAF70778A03FC0C">\
<PropertyRef Name="ChartOfAccounts"/>\
</Principal>\
<Dependent Role="FromRole_assoc_CB9E73935418CD69ACAF70778A03FC0C">\
<PropertyRef Name="ChartOfAccounts"/>\
</Dependent>\
</ReferentialConstraint>\
</Association>\
<Association Name="assoc_41C0A870D47E10A2558F6C3607AC0098" sap:content-version="1">\
<End Multiplicity="1" Role="FromRole_assoc_41C0A870D47E10A2558F6C3607AC0098" Type="ZTJ_SFIN_HIERARCHY_02_SRV.Ztj_G4_HierarchyType"/>\
<End Multiplicity="0..1" Role="ToRole_assoc_41C0A870D47E10A2558F6C3607AC0098" Type="ZTJ_SFIN_HIERARCHY_02_SRV.I_LanguageType"/>\
<ReferentialConstraint>\
<Principal Role="ToRole_assoc_41C0A870D47E10A2558F6C3607AC0098">\
<PropertyRef Name="Language"/>\
</Principal>\
<Dependent Role="FromRole_assoc_41C0A870D47E10A2558F6C3607AC0098">\
<PropertyRef Name="MaintenanceLanguage"/>\
</Dependent>\
</ReferentialConstraint>\
</Association>\
<Association Name="assoc_F58ADADA0E579745A4DFA3A419FA5A93" sap:content-version="1">\
<End Multiplicity="1" Role="FromRole_assoc_F58ADADA0E579745A4DFA3A419FA5A93" Type="ZTJ_SFIN_HIERARCHY_02_SRV.Ztj_G4_HierarchyType"/>\
<End Multiplicity="*" Role="ToRole_assoc_F58ADADA0E579745A4DFA3A419FA5A93" Type="ZTJ_SFIN_HIERARCHY_02_SRV.Ztj_G4_HierarchytType"/>\
</Association>\
<EntityContainer Name="ZTJ_SFIN_HIERARCHY_02_SRV_Entities" m:IsDefaultEntityContainer="true" sap:supported-formats="atom json xlsx">\
<EntitySet EntityType="ZTJ_SFIN_HIERARCHY_02_SRV.ODataQueryAdditionalMetadata" Name="AdditionalMetadata" sap:content-version="1" sap:creatable="false" sap:deletable="false" sap:updatable="false"/>\
<EntitySet EntityType="ZTJ_SFIN_HIERARCHY_02_SRV.HierarchyNodeInfomation" Name="HierarchyNodeInfomationCollection" sap:content-version="1"/>\
<EntitySet EntityType="ZTJ_SFIN_HIERARCHY_02_SRV.ZTJ_G4_C_GLHIERResult" Name="ZTJ_G4_C_GLHIERResults" sap:addressable="false" sap:content-version="1" sap:creatable="false" sap:deletable="false" sap:updatable="false"/>\
<EntitySet EntityType="ZTJ_SFIN_HIERARCHY_02_SRV.ZTJG4GLHIERLabels" Name="ZTJG4GLHIERLabels" sap:content-version="1" sap:creatable="false" sap:deletable="false" sap:updatable="false"/>\
<EntitySet EntityType="ZTJ_SFIN_HIERARCHY_02_SRV.ZTJ_G4_C_GLHIERParameters" Name="ZTJ_G4_C_GLHIER" sap:content-version="1" sap:creatable="false" sap:deletable="false" sap:updatable="false"/>\
<EntitySet EntityType="ZTJ_SFIN_HIERARCHY_02_SRV.P_CHARTOFACCOUNTS" Name="P_CHARTOFACCOUNTS" sap:content-version="1" sap:creatable="false" sap:deletable="false" sap:updatable="false"/>\
<EntitySet EntityType="ZTJ_SFIN_HIERARCHY_02_SRV.I_ChartOfAccountsType" Name="I_ChartOfAccounts" sap:content-version="1" sap:creatable="false" sap:deletable="false" sap:updatable="false"/>\
<EntitySet EntityType="ZTJ_SFIN_HIERARCHY_02_SRV.I_DraftAdministrativeDataType" Name="I_DraftAdministrativeData" sap:content-version="1" sap:creatable="false" sap:deletable="false" sap:searchable="true" sap:updatable="false"/>\
<EntitySet EntityType="ZTJ_SFIN_HIERARCHY_02_SRV.I_FinancialStatementVersionTType" Name="I_FinancialStatementVersionT" sap:content-version="1" sap:creatable="false" sap:deletable="false" sap:updatable="false"/>\
<EntitySet EntityType="ZTJ_SFIN_HIERARCHY_02_SRV.I_LanguageType" Name="I_Language" sap:content-version="1" sap:creatable="false" sap:deletable="false" sap:searchable="true" sap:updatable="false"/>\
<EntitySet EntityType="ZTJ_SFIN_HIERARCHY_02_SRV.ZTJ_C_FSVHierarchyTPType" Name="ZTJ_C_FSVHierarchyTP" sap:content-version="1" sap:searchable="true"/>\
<EntitySet EntityType="ZTJ_SFIN_HIERARCHY_02_SRV.Ztj_G4_ChartofaccountsType" Name="Ztj_G4_Chartofaccounts" sap:content-version="1" sap:creatable="false" sap:deletable="false" sap:updatable="false"/>\
<EntitySet EntityType="ZTJ_SFIN_HIERARCHY_02_SRV.Ztj_G4_HierarchyType" Name="Ztj_G4_Hierarchy" sap:content-version="1" sap:deletable="false" sap:searchable="true"/>\
<EntitySet EntityType="ZTJ_SFIN_HIERARCHY_02_SRV.Ztj_G4_HierarchytType" Name="Ztj_G4_Hierarchyt" sap:content-version="1" sap:creatable="false" sap:deletable="false" sap:updatable="false"/>\
<AssociationSet Association="ZTJ_SFIN_HIERARCHY_02_SRV.ZTJG4GLHIERParametersToResult" Name="ZTJG4GLHIERParametersToResult_AssocSet" sap:content-version="1" sap:creatable="false" sap:deletable="false" sap:updatable="false">\
<End EntitySet="ZTJ_G4_C_GLHIER" Role="FromRole_ZTJG4GLHIERParametersToResult"/>\
<End EntitySet="ZTJ_G4_C_GLHIERResults" Role="ToRole_ZTJG4GLHIERParametersToResult"/>\
</AssociationSet>\
<AssociationSet Association="ZTJ_SFIN_HIERARCHY_02_SRV.P_CHARTOFACCOUNTSToListOfValues" Name="P_CHARTOFACCOUNTSToListOfValues_AssocSet" sap:content-version="1" sap:creatable="false" sap:deletable="false" sap:updatable="false">\
<End EntitySet="P_CHARTOFACCOUNTS" Role="FromRole_P_CHARTOFACCOUNTSToListOfValues"/>\
<End EntitySet="ZTJ_G4_C_GLHIER" Role="ToRole_P_CHARTOFACCOUNTSToListOfValues"/>\
</AssociationSet>\
<AssociationSet Association="ZTJ_SFIN_HIERARCHY_02_SRV.ZTJG4GLHIERParametersToLabels" Name="ZTJG4GLHIERParametersToLabels_AssocSet" sap:content-version="1" sap:creatable="false" sap:deletable="false" sap:updatable="false">\
<End EntitySet="ZTJ_G4_C_GLHIER" Role="FromRole_ZTJG4GLHIERParametersToLabels"/>\
<End EntitySet="ZTJG4GLHIERLabels" Role="ToRole_ZTJG4GLHIERParametersToLabels"/>\
</AssociationSet>\
<AssociationSet Association="ZTJ_SFIN_HIERARCHY_02_SRV.assoc_58EB9B168452ADF63C3BE45CDEE99844" Name="assoc_58EB9B168452ADF63C3BE45CDEE99844" sap:content-version="1" sap:creatable="false" sap:deletable="false" sap:updatable="false">\
<End EntitySet="ZTJ_C_FSVHierarchyTP" Role="FromRole_assoc_58EB9B168452ADF63C3BE45CDEE99844"/>\
<End EntitySet="I_DraftAdministrativeData" Role="ToRole_assoc_58EB9B168452ADF63C3BE45CDEE99844"/>\
</AssociationSet>\
<AssociationSet Association="ZTJ_SFIN_HIERARCHY_02_SRV.assoc_41C0A870D47E10A2558F6C3607AC0098" Name="assoc_41C0A870D47E10A2558F6C3607AC0098" sap:content-version="1" sap:creatable="false" sap:deletable="false" sap:updatable="false">\
<End EntitySet="Ztj_G4_Hierarchy" Role="FromRole_assoc_41C0A870D47E10A2558F6C3607AC0098"/>\
<End EntitySet="I_Language" Role="ToRole_assoc_41C0A870D47E10A2558F6C3607AC0098"/>\
</AssociationSet>\
<AssociationSet Association="ZTJ_SFIN_HIERARCHY_02_SRV.assoc_ECBAB52142C877BEDABDE3ABD9491FA6" Name="assoc_ECBAB52142C877BEDABDE3ABD9491FA6" sap:content-version="1" sap:creatable="false" sap:deletable="false" sap:updatable="false">\
<End EntitySet="ZTJ_C_FSVHierarchyTP" Role="FromRole_assoc_ECBAB52142C877BEDABDE3ABD9491FA6"/>\
<End EntitySet="I_ChartOfAccounts" Role="ToRole_assoc_ECBAB52142C877BEDABDE3ABD9491FA6"/>\
</AssociationSet>\
<AssociationSet Association="ZTJ_SFIN_HIERARCHY_02_SRV.assoc_F58ADADA0E579745A4DFA3A419FA5A93" Name="assoc_F58ADADA0E579745A4DFA3A419FA5A93" sap:content-version="1" sap:creatable="false" sap:deletable="false" sap:updatable="false">\
<End EntitySet="Ztj_G4_Hierarchy" Role="FromRole_assoc_F58ADADA0E579745A4DFA3A419FA5A93"/>\
<End EntitySet="Ztj_G4_Hierarchyt" Role="ToRole_assoc_F58ADADA0E579745A4DFA3A419FA5A93"/>\
</AssociationSet>\
<AssociationSet Association="ZTJ_SFIN_HIERARCHY_02_SRV.assoc_4782569891A012A4D3F3B4E587E57712" Name="assoc_4782569891A012A4D3F3B4E587E57712" sap:content-version="1" sap:creatable="false" sap:deletable="false" sap:updatable="false">\
<End EntitySet="ZTJ_C_FSVHierarchyTP" Role="FromRole_assoc_4782569891A012A4D3F3B4E587E57712"/>\
<End EntitySet="ZTJ_C_FSVHierarchyTP" Role="ToRole_assoc_4782569891A012A4D3F3B4E587E57712"/>\
</AssociationSet>\
<AssociationSet Association="ZTJ_SFIN_HIERARCHY_02_SRV.assoc_000A78B51019E07B6DC9989DCC09F81D" Name="assoc_000A78B51019E07B6DC9989DCC09F81D" sap:content-version="1" sap:creatable="false" sap:deletable="false" sap:updatable="false">\
<End EntitySet="ZTJ_C_FSVHierarchyTP" Role="FromRole_assoc_000A78B51019E07B6DC9989DCC09F81D"/>\
<End EntitySet="I_Language" Role="ToRole_assoc_000A78B51019E07B6DC9989DCC09F81D"/>\
</AssociationSet>\
<AssociationSet Association="ZTJ_SFIN_HIERARCHY_02_SRV.assoc_CB9E73935418CD69ACAF70778A03FC0C" Name="assoc_CB9E73935418CD69ACAF70778A03FC0C" sap:content-version="1" sap:creatable="false" sap:deletable="false" sap:updatable="false">\
<End EntitySet="Ztj_G4_Hierarchy" Role="FromRole_assoc_CB9E73935418CD69ACAF70778A03FC0C"/>\
<End EntitySet="Ztj_G4_Chartofaccounts" Role="ToRole_assoc_CB9E73935418CD69ACAF70778A03FC0C"/>\
</AssociationSet>\
<AssociationSet Association="ZTJ_SFIN_HIERARCHY_02_SRV.assoc_13A43A207F51A1B4207B9E03FEF38AD5" Name="assoc_13A43A207F51A1B4207B9E03FEF38AD5" sap:content-version="1" sap:creatable="false" sap:deletable="false" sap:updatable="false">\
<End EntitySet="ZTJ_C_FSVHierarchyTP" Role="FromRole_assoc_13A43A207F51A1B4207B9E03FEF38AD5"/>\
<End EntitySet="I_FinancialStatementVersionT" Role="ToRole_assoc_13A43A207F51A1B4207B9E03FEF38AD5"/>\
</AssociationSet>\
<FunctionImport EntitySet="ZTJ_C_FSVHierarchyTP" Name="ZTJ_C_FSVHierarchyTPActivation" ReturnType="ZTJ_SFIN_HIERARCHY_02_SRV.ZTJ_C_FSVHierarchyTPType" m:HttpMethod="POST" sap:action-for="ZTJ_SFIN_HIERARCHY_02_SRV.ZTJ_C_FSVHierarchyTPType" sap:applicable-path="Activation_ac">\
<Parameter MaxLength="4" Mode="In" Name="FinancialStatementVariant" Type="Edm.String"/>\
<Parameter Mode="In" Name="DraftUUID" Type="Edm.Guid"/>\
<Parameter Mode="In" Name="IsActiveEntity" Type="Edm.Boolean"/>\
</FunctionImport>\
<FunctionImport EntitySet="ZTJ_C_FSVHierarchyTP" Name="ZTJ_C_FSVHierarchyTPEdit" ReturnType="ZTJ_SFIN_HIERARCHY_02_SRV.ZTJ_C_FSVHierarchyTPType" m:HttpMethod="POST" sap:action-for="ZTJ_SFIN_HIERARCHY_02_SRV.ZTJ_C_FSVHierarchyTPType" sap:applicable-path="Edit_ac">\
<Parameter MaxLength="4" Mode="In" Name="FinancialStatementVariant" Type="Edm.String"/>\
<Parameter Mode="In" Name="DraftUUID" Type="Edm.Guid"/>\
<Parameter Mode="In" Name="IsActiveEntity" Type="Edm.Boolean"/>\
<Parameter Mode="In" Name="PreserveChanges" Nullable="true" Type="Edm.Boolean"/>\
</FunctionImport>\
<FunctionImport EntitySet="ZTJ_C_FSVHierarchyTP" Name="ZTJ_C_FSVHierarchyTPPreparation" ReturnType="ZTJ_SFIN_HIERARCHY_02_SRV.ZTJ_C_FSVHierarchyTPType" m:HttpMethod="POST" sap:action-for="ZTJ_SFIN_HIERARCHY_02_SRV.ZTJ_C_FSVHierarchyTPType" sap:applicable-path="Preparation_ac">\
<Parameter MaxLength="4" Mode="In" Name="FinancialStatementVariant" Type="Edm.String"/>\
<Parameter Mode="In" Name="DraftUUID" Type="Edm.Guid"/>\
<Parameter Mode="In" Name="IsActiveEntity" Type="Edm.Boolean"/>\
<Parameter Mode="In" Name="SideEffectsQualifier" Nullable="true" Type="Edm.String"/>\
</FunctionImport>\
<FunctionImport Name="ZTJ_C_FSVHierarchyTPValidation" ReturnType="ZTJ_SFIN_HIERARCHY_02_SRV.ValidationFunctionResult" m:HttpMethod="GET" sap:action-for="ZTJ_SFIN_HIERARCHY_02_SRV.ZTJ_C_FSVHierarchyTPType" sap:applicable-path="Validation_ac">\
<Parameter MaxLength="4" Mode="In" Name="FinancialStatementVariant" Type="Edm.String"/>\
<Parameter Mode="In" Name="DraftUUID" Type="Edm.Guid"/>\
<Parameter Mode="In" Name="IsActiveEntity" Type="Edm.Boolean"/>\
<Parameter Mode="In" Name="SideEffectsQualifier" Nullable="true" Type="Edm.String"/>\
</FunctionImport>\
</EntityContainer>\
<Annotations Target="ZTJ_SFIN_HIERARCHY_05_SRV.Ztj_G4_HierarchyType/FinancialStatementVariant" xmlns="http://docs.oasis-open.org/odata/ns/edm">\
<Annotation EnumMember="Common.FieldControlType/Mandatory" Term="Common.FieldControl"/>\
</Annotations>\
<Annotations Target="ZTJ_SFIN_HIERARCHY_05_SRV.Ztj_G4_HierarchyType/ChartOfAccounts" xmlns="http://docs.oasis-open.org/odata/ns/edm">\
<Annotation EnumMember="Common.FieldControlType/Mandatory" Term="Common.FieldControl"/>\
<Annotation Term="Common.ValueList">\
<Record>\
<PropertyValue Property="Label" String="Chart Of Accounts"/>\
<PropertyValue Property="CollectionPath" String="Ztj_G4_Chartofaccounts"/>\
<PropertyValue Bool="false" Property="SearchSupported"/>\
<PropertyValue Property="Parameters">\
<Collection>\
<Record Type="Common.ValueListParameterInOut">\
<PropertyValue Property="LocalDataProperty" PropertyPath="ChartOfAccounts"/>\
<PropertyValue Property="ValueListProperty" String="ChartOfAccounts"/>\
</Record>\
<Record Type="Common.ValueListParameterDisplayOnly">\
<PropertyValue Property="ValueListProperty" String="ChartOfAccounts_Text"/>\
</Record>\
<Record Type="Common.ValueListParameterDisplayOnly">\
<PropertyValue Property="ValueListProperty" String="CorporateGroupChartOfAccounts"/>\
</Record>\
<Record Type="Common.ValueListParameterDisplayOnly">\
<PropertyValue Property="ValueListProperty" String="ChartOfAcctsIsBlocked"/>\
</Record>\
<Record Type="Common.ValueListParameterDisplayOnly">\
<PropertyValue Property="ValueListProperty" String="MaintenanceLanguage"/>\
</Record>\
</Collection>\
</PropertyValue>\
</Record>\
</Annotation>\
</Annotations>\
<Annotations Target="ZTJ_SFIN_HIERARCHY_05_SRV.Ztj_G4_HierarchyType/MaintenanceLanguage" xmlns="http://docs.oasis-open.org/odata/ns/edm">\
<Annotation EnumMember="Common.FieldControlType/Mandatory" Term="Common.FieldControl"/>\
<Annotation Term="Common.ValueList">\
<Record>\
<PropertyValue Property="Label" String="Language"/>\
<PropertyValue Property="CollectionPath" String="I_Language"/>\
<PropertyValue Bool="true" Property="SearchSupported"/>\
<PropertyValue Property="Parameters">\
<Collection>\
<Record Type="Common.ValueListParameterInOut">\
<PropertyValue Property="LocalDataProperty" PropertyPath="MaintenanceLanguage"/>\
<PropertyValue Property="ValueListProperty" String="Language"/>\
</Record>\
<Record Type="Common.ValueListParameterDisplayOnly">\
<PropertyValue Property="ValueListProperty" String="Language_Text"/>\
</Record>\
<Record Type="Common.ValueListParameterDisplayOnly">\
<PropertyValue Property="ValueListProperty" String="LanguageISOCode"/>\
</Record>\
</Collection>\
</PropertyValue>\
</Record>\
</Annotation>\
</Annotations>\
<Annotations Target="ZTJ_SFIN_HIERARCHY_05_SRV.ZTJ_SFIN_HIERARCHY_05_SRV_Entities/ZTJ_C_FSVHierarchyTP" xmlns="http://docs.oasis-open.org/odata/ns/edm">\
<Annotation Term="Common.DraftRoot">\
<Record>\
<PropertyValue Property="ActivationAction" String="ZTJ_SFIN_HIERARCHY_05_SRV.ZTJ_SFIN_HIERARCHY_05_SRV_Entities/ZTJ_C_FSVHierarchyTPActivation"/>\
<PropertyValue Property="EditAction" String="ZTJ_SFIN_HIERARCHY_05_SRV.ZTJ_SFIN_HIERARCHY_05_SRV_Entities/ZTJ_C_FSVHierarchyTPEdit"/>\
<PropertyValue Property="PreparationAction" String="ZTJ_SFIN_HIERARCHY_05_SRV.ZTJ_SFIN_HIERARCHY_05_SRV_Entities/ZTJ_C_FSVHierarchyTPPreparation"/>\
<PropertyValue Property="ValidationFunction" String="ZTJ_SFIN_HIERARCHY_05_SRV.ZTJ_SFIN_HIERARCHY_05_SRV_Entities/ZTJ_C_FSVHierarchyTPValidation"/>\
</Record>\
</Annotation>\
</Annotations>\
<Annotations Target="ZTJ_SFIN_HIERARCHY_05_SRV.ZTJ_C_FSVHierarchyTPType/ChartOfAccounts" xmlns="http://docs.oasis-open.org/odata/ns/edm">\
<Annotation Term="Common.ValueList">\
<Record>\
<PropertyValue Property="Label" String="Chart Of Accounts"/>\
<PropertyValue Property="CollectionPath" String="I_ChartOfAccounts"/>\
<PropertyValue Bool="false" Property="SearchSupported"/>\
<PropertyValue Property="Parameters">\
<Collection>\
<Record Type="Common.ValueListParameterInOut">\
<PropertyValue Property="LocalDataProperty" PropertyPath="ChartOfAccounts"/>\
<PropertyValue Property="ValueListProperty" String="ChartOfAccounts"/>\
</Record>\
<Record Type="Common.ValueListParameterDisplayOnly">\
<PropertyValue Property="ValueListProperty" String="ChartOfAccounts_Text"/>\
</Record>\
</Collection>\
</PropertyValue>\
</Record>\
</Annotation>\
</Annotations>\
<Annotations Target="ZTJ_SFIN_HIERARCHY_05_SRV.ZTJ_C_FSVHierarchyTPType/HierarchyVariantForEdit" xmlns="http://docs.oasis-open.org/odata/ns/edm">\
<Annotation Term="Common.ValueList">\
<Record>\
<PropertyValue Property="Label" String="Financial Statement Version Text"/>\
<PropertyValue Property="CollectionPath" String="I_FinancialStatementVersionT"/>\
<PropertyValue Bool="false" Property="SearchSupported"/>\
<PropertyValue Property="Parameters">\
<Collection>\
<Record Type="Common.ValueListParameterInOut">\
<PropertyValue Property="LocalDataProperty" PropertyPath="HierarchyVariantForEdit"/>\
<PropertyValue Property="ValueListProperty" String="FinancialStatementVariant"/>\
</Record>\
<Record Type="Common.ValueListParameterDisplayOnly">\
<PropertyValue Property="ValueListProperty" String="FinancialStatementVariantName"/>\
</Record>\
</Collection>\
</PropertyValue>\
</Record>\
</Annotation>\
</Annotations>\
<Annotations Target="ZTJ_SFIN_HIERARCHY_05_SRV.ZTJ_C_FSVHierarchyTPType/MaintenanceLanguage" xmlns="http://docs.oasis-open.org/odata/ns/edm">\
<Annotation Term="Common.ValueList">\
<Record>\
<PropertyValue Property="Label" String="Language"/>\
<PropertyValue Property="CollectionPath" String="I_Language"/>\
<PropertyValue Bool="true" Property="SearchSupported"/>\
<PropertyValue Property="Parameters">\
<Collection>\
<Record Type="Common.ValueListParameterInOut">\
<PropertyValue Property="LocalDataProperty" PropertyPath="MaintenanceLanguage"/>\
<PropertyValue Property="ValueListProperty" String="Language"/>\
</Record>\
<Record Type="Common.ValueListParameterDisplayOnly">\
<PropertyValue Property="ValueListProperty" String="Language_Text"/>\
</Record>\
</Collection>\
</PropertyValue>\
</Record>\
</Annotation>\
</Annotations>\
<Annotations Target="ZTJ_SFIN_HIERARCHY_05_SRV.ZTJ_C_FSVHierarchyTPType" xmlns="http://docs.oasis-open.org/odata/ns/edm">\
<Annotation Term="Common.SemanticKey">\
<Collection>\
<PropertyPath>FinancialStatementVariant</PropertyPath>\
</Collection>\
</Annotation>\
</Annotations>\
<atom:link href="https://ponyhost/sap/opu/odata/sap/ZTJ_SFIN_HIERARCHY_02_SRV/$metadata" rel="self" xmlns:atom="http://www.w3.org/2005/Atom"/>\
<atom:link href="https://ponyhost/sap/opu/odata/sap/ZTJ_SFIN_HIERARCHY_02_SRV/$metadata" rel="latest-version" xmlns:atom="http://www.w3.org/2005/Atom"/>\
</Schema>\
</edmx:DataServices>\
</edmx:Edmx>\
		';

	var sResultsL0Top120 = '{"d": {"__count": "7", "results": [{"__metadata": {"id": "https://ponyhost/sap/opu/odata/sap/ZTJ_SFIN_HIERARCHY_02_SRV/ZTJ_G4_C_GLHIERResults(\'1.2.4.0.1.2.4.0%3A4.11.1.1.X.1.1_IEQCACNIEQ9999CACN52372%3A99991%2523%2523\')", "uri": "https://ponyhost/sap/opu/odata/sap/ZTJ_SFIN_HIERARCHY_02_SRV/ZTJ_G4_C_GLHIERResults(\'1.2.4.0.1.2.4.0%3A4.11.1.1.X.1.1_IEQCACNIEQ9999CACN52372%3A99991%2523%2523\')", "type": "ZTJ_SFIN_HIERARCHY_02_SRV.ZTJ_G4_C_GLHIERResult"}, "ID": "1.2.4.0.1.2.4.0:4.11.1.1.X.1.1_IEQCACNIEQ9999CACN52372:99991%23%23", "TotaledProperties": "", "ChartOfAccounts": "CACN", "GLAccount": "", "GLAccount_NodeID": "FinancialStatementItem:99991", "GLAccount_NodeIDExt": "9999/1", "GLAccount_NodeText": "Assets", "GLAccount_ParentID": "", "GLAccount_Level": 1, "GLAccount_Drillstate": "collapsed", "GLAccount_Nodecount": 0, "GLAccount_T": "", "Action": "", "NodeType": "", "counter": "14", "counter_F": "14", "Parameters": {"__deferred": {"uri": "https://ponyhost/sap/opu/odata/sap/ZTJ_SFIN_HIERARCHY_02_SRV/ZTJ_G4_C_GLHIERResults(\'1.2.4.0.1.2.4.0%3A4.11.1.1.X.1.1_IEQCACNIEQ9999CACN52372%3A99991%2523%2523\')/Parameters"} } }, {"__metadata": {"id": "https://ponyhost/sap/opu/odata/sap/ZTJ_SFIN_HIERARCHY_02_SRV/ZTJ_G4_C_GLHIERResults(\'1.2.4.0.1.2.4.0%3A4.11.1.1.X.1.1_IEQCACNIEQ9999CACN52372%3A99992%2523%2523\')", "uri": "https://ponyhost/sap/opu/odata/sap/ZTJ_SFIN_HIERARCHY_02_SRV/ZTJ_G4_C_GLHIERResults(\'1.2.4.0.1.2.4.0%3A4.11.1.1.X.1.1_IEQCACNIEQ9999CACN52372%3A99992%2523%2523\')", "type": "ZTJ_SFIN_HIERARCHY_02_SRV.ZTJ_G4_C_GLHIERResult"}, "ID": "1.2.4.0.1.2.4.0:4.11.1.1.X.1.1_IEQCACNIEQ9999CACN52372:99992%23%23", "TotaledProperties": "", "ChartOfAccounts": "CACN", "GLAccount": "", "GLAccount_NodeID": "FinancialStatementItem:99992", "GLAccount_NodeIDExt": "9999/2", "GLAccount_NodeText": "Liabilities & Stockholders\' Equity", "GLAccount_ParentID": "", "GLAccount_Level": 1, "GLAccount_Drillstate": "collapsed", "GLAccount_Nodecount": 0, "GLAccount_T": "", "Action": "", "NodeType": "", "counter": "29", "counter_F": "29", "Parameters": {"__deferred": {"uri": "https://ponyhost/sap/opu/odata/sap/ZTJ_SFIN_HIERARCHY_02_SRV/ZTJ_G4_C_GLHIERResults(\'1.2.4.0.1.2.4.0%3A4.11.1.1.X.1.1_IEQCACNIEQ9999CACN52372%3A99992%2523%2523\')/Parameters"} } }, {"__metadata": {"id": "https://ponyhost/sap/opu/odata/sap/ZTJ_SFIN_HIERARCHY_02_SRV/ZTJ_G4_C_GLHIERResults(\'1.2.4.0.1.2.4.0%3A4.11.1.1.X.1.1_IEQCACNIEQ9999CACN52372%3A99993%2523%2523\')", "uri": "https://ponyhost/sap/opu/odata/sap/ZTJ_SFIN_HIERARCHY_02_SRV/ZTJ_G4_C_GLHIERResults(\'1.2.4.0.1.2.4.0%3A4.11.1.1.X.1.1_IEQCACNIEQ9999CACN52372%3A99993%2523%2523\')", "type": "ZTJ_SFIN_HIERARCHY_02_SRV.ZTJ_G4_C_GLHIERResult"}, "ID": "1.2.4.0.1.2.4.0:4.11.1.1.X.1.1_IEQCACNIEQ9999CACN52372:99993%23%23", "TotaledProperties": "", "ChartOfAccounts": "CACN", "GLAccount": "", "GLAccount_NodeID": "FinancialStatementItem:99993", "GLAccount_NodeIDExt": "9999/3", "GLAccount_NodeText": "Common", "GLAccount_ParentID": "", "GLAccount_Level": 1, "GLAccount_Drillstate": "collapsed", "GLAccount_Nodecount": 0, "GLAccount_T": "", "Action": "", "NodeType": "", "counter": "3", "counter_F": "3", "Parameters": {"__deferred": {"uri": "https://ponyhost/sap/opu/odata/sap/ZTJ_SFIN_HIERARCHY_02_SRV/ZTJ_G4_C_GLHIERResults(\'1.2.4.0.1.2.4.0%3A4.11.1.1.X.1.1_IEQCACNIEQ9999CACN52372%3A99993%2523%2523\')/Parameters"} } }, {"__metadata": {"id": "https://ponyhost/sap/opu/odata/sap/ZTJ_SFIN_HIERARCHY_02_SRV/ZTJ_G4_C_GLHIERResults(\'1.2.4.0.1.2.4.0%3A4.11.1.1.X.1.1_IEQCACNIEQ9999CACN52372%3A99994%2523%2523\')", "uri": "https://ponyhost/sap/opu/odata/sap/ZTJ_SFIN_HIERARCHY_02_SRV/ZTJ_G4_C_GLHIERResults(\'1.2.4.0.1.2.4.0%3A4.11.1.1.X.1.1_IEQCACNIEQ9999CACN52372%3A99994%2523%2523\')", "type": "ZTJ_SFIN_HIERARCHY_02_SRV.ZTJ_G4_C_GLHIERResult"}, "ID": "1.2.4.0.1.2.4.0:4.11.1.1.X.1.1_IEQCACNIEQ9999CACN52372:99994%23%23", "TotaledProperties": "", "ChartOfAccounts": "CACN", "GLAccount": "", "GLAccount_NodeID": "FinancialStatementItem:99994", "GLAccount_NodeIDExt": "9999/4", "GLAccount_NodeText": "Stock owner\'s equity", "GLAccount_ParentID": "", "GLAccount_Level": 1, "GLAccount_Drillstate": "collapsed", "GLAccount_Nodecount": 0, "GLAccount_T": "", "Action": "", "NodeType": "", "counter": "140", "counter_F": "140", "Parameters": {"__deferred": {"uri": "https://ponyhost/sap/opu/odata/sap/ZTJ_SFIN_HIERARCHY_02_SRV/ZTJ_G4_C_GLHIERResults(\'1.2.4.0.1.2.4.0%3A4.11.1.1.X.1.1_IEQCACNIEQ9999CACN52372%3A99994%2523%2523\')/Parameters"} } }, {"__metadata": {"id": "https://ponyhost/sap/opu/odata/sap/ZTJ_SFIN_HIERARCHY_02_SRV/ZTJ_G4_C_GLHIERResults(\'1.2.4.0.1.2.4.0%3A4.11.1.1.X.1.1_IEQCACNIEQ9999CACN52372%3A99996%2523%2523\')", "uri": "https://ponyhost/sap/opu/odata/sap/ZTJ_SFIN_HIERARCHY_02_SRV/ZTJ_G4_C_GLHIERResults(\'1.2.4.0.1.2.4.0%3A4.11.1.1.X.1.1_IEQCACNIEQ9999CACN52372%3A99996%2523%2523\')", "type": "ZTJ_SFIN_HIERARCHY_02_SRV.ZTJ_G4_C_GLHIERResult"}, "ID": "1.2.4.0.1.2.4.0:4.11.1.1.X.1.1_IEQCACNIEQ9999CACN52372:99996%23%23", "TotaledProperties": "", "ChartOfAccounts": "CACN", "GLAccount": "", "GLAccount_NodeID": "FinancialStatementItem:99996", "GLAccount_NodeIDExt": "9999/6", "GLAccount_NodeText": "Profit & Loss", "GLAccount_ParentID": "", "GLAccount_Level": 1, "GLAccount_Drillstate": "collapsed", "GLAccount_Nodecount": 0, "GLAccount_T": "", "Action": "", "NodeType": "", "counter": "139", "counter_F": "139", "Parameters": {"__deferred": {"uri": "https://ponyhost/sap/opu/odata/sap/ZTJ_SFIN_HIERARCHY_02_SRV/ZTJ_G4_C_GLHIERResults(\'1.2.4.0.1.2.4.0%3A4.11.1.1.X.1.1_IEQCACNIEQ9999CACN52372%3A99996%2523%2523\')/Parameters"} } }, {"__metadata": {"id": "https://ponyhost/sap/opu/odata/sap/ZTJ_SFIN_HIERARCHY_02_SRV/ZTJ_G4_C_GLHIERResults(\'1.2.4.0.1.2.4.0%3A4.11.1.1.X.1.1_IEQCACNIEQ9999CACN52372%3A99997%2523%2523\')", "uri": "https://ponyhost/sap/opu/odata/sap/ZTJ_SFIN_HIERARCHY_02_SRV/ZTJ_G4_C_GLHIERResults(\'1.2.4.0.1.2.4.0%3A4.11.1.1.X.1.1_IEQCACNIEQ9999CACN52372%3A99997%2523%2523\')", "type": "ZTJ_SFIN_HIERARCHY_02_SRV.ZTJ_G4_C_GLHIERResult"}, "ID": "1.2.4.0.1.2.4.0:4.11.1.1.X.1.1_IEQCACNIEQ9999CACN52372:99997%23%23", "TotaledProperties": "", "ChartOfAccounts": "CACN", "GLAccount": "", "GLAccount_NodeID": "FinancialStatementItem:99997", "GLAccount_NodeIDExt": "9999/7", "GLAccount_NodeText": "Not assigned accounts", "GLAccount_ParentID": "", "GLAccount_Level": 1, "GLAccount_Drillstate": "collapsed", "GLAccount_Nodecount": 0, "GLAccount_T": "", "Action": "", "NodeType": "", "counter": "1", "counter_F": "1", "Parameters": {"__deferred": {"uri": "https://ponyhost/sap/opu/odata/sap/ZTJ_SFIN_HIERARCHY_02_SRV/ZTJ_G4_C_GLHIERResults(\'1.2.4.0.1.2.4.0%3A4.11.1.1.X.1.1_IEQCACNIEQ9999CACN52372%3A99997%2523%2523\')/Parameters"} } }, {"__metadata": {"id": "https://ponyhost/sap/opu/odata/sap/ZTJ_SFIN_HIERARCHY_02_SRV/ZTJ_G4_C_GLHIERResults(\'1.2.4.0.1.2.4.0%3A4.11.1.1.X.1.1_IEQCACNIEQ9999CACN52372%3A99998%2523%2523\')", "uri": "https://ponyhost/sap/opu/odata/sap/ZTJ_SFIN_HIERARCHY_02_SRV/ZTJ_G4_C_GLHIERResults(\'1.2.4.0.1.2.4.0%3A4.11.1.1.X.1.1_IEQCACNIEQ9999CACN52372%3A99998%2523%2523\')", "type": "ZTJ_SFIN_HIERARCHY_02_SRV.ZTJ_G4_C_GLHIERResult"}, "ID": "1.2.4.0.1.2.4.0:4.11.1.1.X.1.1_IEQCACNIEQ9999CACN52372:99998%23%23", "TotaledProperties": "", "ChartOfAccounts": "CACN", "GLAccount": "", "GLAccount_NodeID": "FinancialStatementItem:99998", "GLAccount_NodeIDExt": "9999/8", "GLAccount_NodeText": "Financial St. Notes", "GLAccount_ParentID": "", "GLAccount_Level": 1, "GLAccount_Drillstate": "collapsed", "GLAccount_Nodecount": 0, "GLAccount_T": "", "Action": "", "NodeType": "", "counter": "1", "counter_F": "1", "Parameters": {"__deferred": {"uri": "https://ponyhost/sap/opu/odata/sap/ZTJ_SFIN_HIERARCHY_02_SRV/ZTJ_G4_C_GLHIERResults(\'1.2.4.0.1.2.4.0%3A4.11.1.1.X.1.1_IEQCACNIEQ9999CACN52372%3A99998%2523%2523\')/Parameters"} } } ] } }';

	var sResultsL0Parent0Top120 = '{"d":{"__count":"6","results":[{"__metadata":{"id":"https://ponyhost/sap/opu/odata/sap/ZTJ_SFIN_HIERARCHY_02_SRV/ZTJ_G4_C_GLHIERResults(\'1.2.4.0.1.2.4.0%3A4.12.1.1.X.1.1_IEQCACNIEQ9999CACN52372%3A999912%2523%2523\')","uri":"https://ponyhost/sap/opu/odata/sap/ZTJ_SFIN_HIERARCHY_02_SRV/ZTJ_G4_C_GLHIERResults(\'1.2.4.0.1.2.4.0%3A4.12.1.1.X.1.1_IEQCACNIEQ9999CACN52372%3A999912%2523%2523\')","type":"ZTJ_SFIN_HIERARCHY_02_SRV.ZTJ_G4_C_GLHIERResult"},"ID":"1.2.4.0.1.2.4.0:4.12.1.1.X.1.1_IEQCACNIEQ9999CACN52372:999912%23%23","TotaledProperties":"","ChartOfAccounts":"CACN","GLAccount":"","GLAccount_NodeID":"FinancialStatementItem:999912","GLAccount_NodeIDExt":"9999/12","GLAccount_NodeText":"FM","GLAccount_ParentID":"FinancialStatementItem:99991","GLAccount_Level":2,"GLAccount_Drillstate":"collapsed","GLAccount_Nodecount":0,"GLAccount_T":"","Action":"","NodeType":"","counter":"1","counter_F":"1","Parameters":{"__deferred":{"uri":"https://ponyhost/sap/opu/odata/sap/ZTJ_SFIN_HIERARCHY_02_SRV/ZTJ_G4_C_GLHIERResults(\'1.2.4.0.1.2.4.0%3A4.12.1.1.X.1.1_IEQCACNIEQ9999CACN52372%3A999912%2523%2523\')/Parameters"}}},{"__metadata":{"id":"https://ponyhost/sap/opu/odata/sap/ZTJ_SFIN_HIERARCHY_02_SRV/ZTJ_G4_C_GLHIERResults(\'1.2.4.0.1.2.4.0%3A4.12.1.1.X.1.1_IEQCACNIEQ9999CACN52372%3A999915%2523%2523\')","uri":"https://ponyhost/sap/opu/odata/sap/ZTJ_SFIN_HIERARCHY_02_SRV/ZTJ_G4_C_GLHIERResults(\'1.2.4.0.1.2.4.0%3A4.12.1.1.X.1.1_IEQCACNIEQ9999CACN52372%3A999915%2523%2523\')","type":"ZTJ_SFIN_HIERARCHY_02_SRV.ZTJ_G4_C_GLHIERResult"},"ID":"1.2.4.0.1.2.4.0:4.12.1.1.X.1.1_IEQCACNIEQ9999CACN52372:999915%23%23","TotaledProperties":"","ChartOfAccounts":"CACN","GLAccount":"","GLAccount_NodeID":"FinancialStatementItem:999915","GLAccount_NodeIDExt":"9999/15","GLAccount_NodeText":"Long-term investments","GLAccount_ParentID":"FinancialStatementItem:99991","GLAccount_Level":2,"GLAccount_Drillstate":"collapsed","GLAccount_Nodecount":0,"GLAccount_T":"","Action":"","NodeType":"","counter":"6","counter_F":"6","Parameters":{"__deferred":{"uri":"https://ponyhost/sap/opu/odata/sap/ZTJ_SFIN_HIERARCHY_02_SRV/ZTJ_G4_C_GLHIERResults(\'1.2.4.0.1.2.4.0%3A4.12.1.1.X.1.1_IEQCACNIEQ9999CACN52372%3A999915%2523%2523\')/Parameters"}}},{"__metadata":{"id":"https://ponyhost/sap/opu/odata/sap/ZTJ_SFIN_HIERARCHY_02_SRV/ZTJ_G4_C_GLHIERResults(\'1.2.4.0.1.2.4.0%3A4.12.1.1.X.1.1_IEQCACNIEQ9999CACN52372%3A999916%2523%2523\')","uri":"https://ponyhost/sap/opu/odata/sap/ZTJ_SFIN_HIERARCHY_02_SRV/ZTJ_G4_C_GLHIERResults(\'1.2.4.0.1.2.4.0%3A4.12.1.1.X.1.1_IEQCACNIEQ9999CACN52372%3A999916%2523%2523\')","type":"ZTJ_SFIN_HIERARCHY_02_SRV.ZTJ_G4_C_GLHIERResult"},"ID":"1.2.4.0.1.2.4.0:4.12.1.1.X.1.1_IEQCACNIEQ9999CACN52372:999916%23%23","TotaledProperties":"","ChartOfAccounts":"CACN","GLAccount":"","GLAccount_NodeID":"FinancialStatementItem:999916","GLAccount_NodeIDExt":"9999/16","GLAccount_NodeText":"Fixed assets","GLAccount_ParentID":"FinancialStatementItem:99991","GLAccount_Level":2,"GLAccount_Drillstate":"collapsed","GLAccount_Nodecount":0,"GLAccount_T":"","Action":"","NodeType":"","counter":"1","counter_F":"1","Parameters":{"__deferred":{"uri":"https://ponyhost/sap/opu/odata/sap/ZTJ_SFIN_HIERARCHY_02_SRV/ZTJ_G4_C_GLHIERResults(\'1.2.4.0.1.2.4.0%3A4.12.1.1.X.1.1_IEQCACNIEQ9999CACN52372%3A999916%2523%2523\')/Parameters"}}},{"__metadata":{"id":"https://ponyhost/sap/opu/odata/sap/ZTJ_SFIN_HIERARCHY_02_SRV/ZTJ_G4_C_GLHIERResults(\'1.2.4.0.1.2.4.0%3A4.12.1.1.X.1.1_IEQCACNIEQ9999CACN52372%3A999917%2523%2523\')","uri":"https://ponyhost/sap/opu/odata/sap/ZTJ_SFIN_HIERARCHY_02_SRV/ZTJ_G4_C_GLHIERResults(\'1.2.4.0.1.2.4.0%3A4.12.1.1.X.1.1_IEQCACNIEQ9999CACN52372%3A999917%2523%2523\')","type":"ZTJ_SFIN_HIERARCHY_02_SRV.ZTJ_G4_C_GLHIERResult"},"ID":"1.2.4.0.1.2.4.0:4.12.1.1.X.1.1_IEQCACNIEQ9999CACN52372:999917%23%23","TotaledProperties":"","ChartOfAccounts":"CACN","GLAccount":"","GLAccount_NodeID":"FinancialStatementItem:999917","GLAccount_NodeIDExt":"9999/17","GLAccount_NodeText":"Intangible assets","GLAccount_ParentID":"FinancialStatementItem:99991","GLAccount_Level":2,"GLAccount_Drillstate":"collapsed","GLAccount_Nodecount":0,"GLAccount_T":"","Action":"","NodeType":"","counter":"4","counter_F":"4","Parameters":{"__deferred":{"uri":"https://ponyhost/sap/opu/odata/sap/ZTJ_SFIN_HIERARCHY_02_SRV/ZTJ_G4_C_GLHIERResults(\'1.2.4.0.1.2.4.0%3A4.12.1.1.X.1.1_IEQCACNIEQ9999CACN52372%3A999917%2523%2523\')/Parameters"}}},{"__metadata":{"id":"https://ponyhost/sap/opu/odata/sap/ZTJ_SFIN_HIERARCHY_02_SRV/ZTJ_G4_C_GLHIERResults(\'1.2.4.0.1.2.4.0%3A4.12.1.1.X.1.1_IEQCACNIEQ9999CACN52372%3A999918%2523%2523\')","uri":"https://ponyhost/sap/opu/odata/sap/ZTJ_SFIN_HIERARCHY_02_SRV/ZTJ_G4_C_GLHIERResults(\'1.2.4.0.1.2.4.0%3A4.12.1.1.X.1.1_IEQCACNIEQ9999CACN52372%3A999918%2523%2523\')","type":"ZTJ_SFIN_HIERARCHY_02_SRV.ZTJ_G4_C_GLHIERResult"},"ID":"1.2.4.0.1.2.4.0:4.12.1.1.X.1.1_IEQCACNIEQ9999CACN52372:999918%23%23","TotaledProperties":"","ChartOfAccounts":"CACN","GLAccount":"","GLAccount_NodeID":"FinancialStatementItem:999918","GLAccount_NodeIDExt":"9999/18","GLAccount_NodeText":"Long term deferred","GLAccount_ParentID":"FinancialStatementItem:99991","GLAccount_Level":2,"GLAccount_Drillstate":"collapsed","GLAccount_Nodecount":0,"GLAccount_T":"","Action":"","NodeType":"","counter":"2","counter_F":"2","Parameters":{"__deferred":{"uri":"https://ponyhost/sap/opu/odata/sap/ZTJ_SFIN_HIERARCHY_02_SRV/ZTJ_G4_C_GLHIERResults(\'1.2.4.0.1.2.4.0%3A4.12.1.1.X.1.1_IEQCACNIEQ9999CACN52372%3A999918%2523%2523\')/Parameters"}}},{"__metadata":{"id":"https://ponyhost/sap/opu/odata/sap/ZTJ_SFIN_HIERARCHY_02_SRV/ZTJ_G4_C_GLHIERResults(\'1.2.4.0.1.2.4.0%3A4.12.1.1.X.1.1_IEQCACNIEQ9999CACN52372%3A999919%2523%2523\')","uri":"https://ponyhost/sap/opu/odata/sap/ZTJ_SFIN_HIERARCHY_02_SRV/ZTJ_G4_C_GLHIERResults(\'1.2.4.0.1.2.4.0%3A4.12.1.1.X.1.1_IEQCACNIEQ9999CACN52372%3A999919%2523%2523\')","type":"ZTJ_SFIN_HIERARCHY_02_SRV.ZTJ_G4_C_GLHIERResult"},"ID":"1.2.4.0.1.2.4.0:4.12.1.1.X.1.1_IEQCACNIEQ9999CACN52372:999919%23%23","TotaledProperties":"","ChartOfAccounts":"CACN","GLAccount":"","GLAccount_NodeID":"FinancialStatementItem:999919","GLAccount_NodeIDExt":"9999/19","GLAccount_NodeText":"Gain/loss fro handling assets","GLAccount_ParentID":"FinancialStatementItem:99991","GLAccount_Level":2,"GLAccount_Drillstate":"collapsed","GLAccount_Nodecount":0,"GLAccount_T":"","Action":"","NodeType":"","counter":"2","counter_F":"2","Parameters":{"__deferred":{"uri":"https://ponyhost/sap/opu/odata/sap/ZTJ_SFIN_HIERARCHY_02_SRV/ZTJ_G4_C_GLHIERResults(\'1.2.4.0.1.2.4.0%3A4.12.1.1.X.1.1_IEQCACNIEQ9999CACN52372%3A999919%2523%2523\')/Parameters"}}}]}}';

	var sResultsL0Top7 = '{"d":{"results":[{"__metadata":{"id":"https://ponyhost/sap/opu/odata/sap/ZTJ_SFIN_HIERARCHY_02_SRV/ZTJ_G4_C_GLHIERResults(\'1.2.4.0.1.2.4.0%3A4.11.1.1.X.1.1_IEQCACNIEQ9999CACN52372%3A99991%2523%2523\')","uri":"https://ponyhost/sap/opu/odata/sap/ZTJ_SFIN_HIERARCHY_02_SRV/ZTJ_G4_C_GLHIERResults(\'1.2.4.0.1.2.4.0%3A4.11.1.1.X.1.1_IEQCACNIEQ9999CACN52372%3A99991%2523%2523\')","type":"ZTJ_SFIN_HIERARCHY_02_SRV.ZTJ_G4_C_GLHIERResult"},"ID":"1.2.4.0.1.2.4.0:4.11.1.1.X.1.1_IEQCACNIEQ9999CACN52372:99991%23%23","TotaledProperties":"","ChartOfAccounts":"CACN","GLAccount":"","GLAccount_NodeID":"FinancialStatementItem:99991","GLAccount_NodeIDExt":"9999/1","GLAccount_NodeText":"Assets","GLAccount_ParentID":"","GLAccount_Level":1,"GLAccount_Drillstate":"collapsed","GLAccount_Nodecount":0,"GLAccount_T":"","Action":"","NodeType":"","counter":"14","counter_F":"14","Parameters":{"__deferred":{"uri":"https://ponyhost/sap/opu/odata/sap/ZTJ_SFIN_HIERARCHY_02_SRV/ZTJ_G4_C_GLHIERResults(\'1.2.4.0.1.2.4.0%3A4.11.1.1.X.1.1_IEQCACNIEQ9999CACN52372%3A99991%2523%2523\')/Parameters"}}},{"__metadata":{"id":"https://ponyhost/sap/opu/odata/sap/ZTJ_SFIN_HIERARCHY_02_SRV/ZTJ_G4_C_GLHIERResults(\'1.2.4.0.1.2.4.0%3A4.11.1.1.X.1.1_IEQCACNIEQ9999CACN52372%3A99992%2523%2523\')","uri":"https://ponyhost/sap/opu/odata/sap/ZTJ_SFIN_HIERARCHY_02_SRV/ZTJ_G4_C_GLHIERResults(\'1.2.4.0.1.2.4.0%3A4.11.1.1.X.1.1_IEQCACNIEQ9999CACN52372%3A99992%2523%2523\')","type":"ZTJ_SFIN_HIERARCHY_02_SRV.ZTJ_G4_C_GLHIERResult"},"ID":"1.2.4.0.1.2.4.0:4.11.1.1.X.1.1_IEQCACNIEQ9999CACN52372:99992%23%23","TotaledProperties":"","ChartOfAccounts":"CACN","GLAccount":"","GLAccount_NodeID":"FinancialStatementItem:99992","GLAccount_NodeIDExt":"9999/2","GLAccount_NodeText":"Liabilities & Stockholders\' Equity","GLAccount_ParentID":"","GLAccount_Level":1,"GLAccount_Drillstate":"collapsed","GLAccount_Nodecount":0,"GLAccount_T":"","Action":"","NodeType":"","counter":"29","counter_F":"29","Parameters":{"__deferred":{"uri":"https://ponyhost/sap/opu/odata/sap/ZTJ_SFIN_HIERARCHY_02_SRV/ZTJ_G4_C_GLHIERResults(\'1.2.4.0.1.2.4.0%3A4.11.1.1.X.1.1_IEQCACNIEQ9999CACN52372%3A99992%2523%2523\')/Parameters"}}},{"__metadata":{"id":"https://ponyhost/sap/opu/odata/sap/ZTJ_SFIN_HIERARCHY_02_SRV/ZTJ_G4_C_GLHIERResults(\'1.2.4.0.1.2.4.0%3A4.11.1.1.X.1.1_IEQCACNIEQ9999CACN52372%3A99993%2523%2523\')","uri":"https://ponyhost/sap/opu/odata/sap/ZTJ_SFIN_HIERARCHY_02_SRV/ZTJ_G4_C_GLHIERResults(\'1.2.4.0.1.2.4.0%3A4.11.1.1.X.1.1_IEQCACNIEQ9999CACN52372%3A99993%2523%2523\')","type":"ZTJ_SFIN_HIERARCHY_02_SRV.ZTJ_G4_C_GLHIERResult"},"ID":"1.2.4.0.1.2.4.0:4.11.1.1.X.1.1_IEQCACNIEQ9999CACN52372:99993%23%23","TotaledProperties":"","ChartOfAccounts":"CACN","GLAccount":"","GLAccount_NodeID":"FinancialStatementItem:99993","GLAccount_NodeIDExt":"9999/3","GLAccount_NodeText":"Common","GLAccount_ParentID":"","GLAccount_Level":1,"GLAccount_Drillstate":"collapsed","GLAccount_Nodecount":0,"GLAccount_T":"","Action":"","NodeType":"","counter":"3","counter_F":"3","Parameters":{"__deferred":{"uri":"https://ponyhost/sap/opu/odata/sap/ZTJ_SFIN_HIERARCHY_02_SRV/ZTJ_G4_C_GLHIERResults(\'1.2.4.0.1.2.4.0%3A4.11.1.1.X.1.1_IEQCACNIEQ9999CACN52372%3A99993%2523%2523\')/Parameters"}}},{"__metadata":{"id":"https://ponyhost/sap/opu/odata/sap/ZTJ_SFIN_HIERARCHY_02_SRV/ZTJ_G4_C_GLHIERResults(\'1.2.4.0.1.2.4.0%3A4.11.1.1.X.1.1_IEQCACNIEQ9999CACN52372%3A99994%2523%2523\')","uri":"https://ponyhost/sap/opu/odata/sap/ZTJ_SFIN_HIERARCHY_02_SRV/ZTJ_G4_C_GLHIERResults(\'1.2.4.0.1.2.4.0%3A4.11.1.1.X.1.1_IEQCACNIEQ9999CACN52372%3A99994%2523%2523\')","type":"ZTJ_SFIN_HIERARCHY_02_SRV.ZTJ_G4_C_GLHIERResult"},"ID":"1.2.4.0.1.2.4.0:4.11.1.1.X.1.1_IEQCACNIEQ9999CACN52372:99994%23%23","TotaledProperties":"","ChartOfAccounts":"CACN","GLAccount":"","GLAccount_NodeID":"FinancialStatementItem:99994","GLAccount_NodeIDExt":"9999/4","GLAccount_NodeText":"Stock owner\'s equity","GLAccount_ParentID":"","GLAccount_Level":1,"GLAccount_Drillstate":"collapsed","GLAccount_Nodecount":0,"GLAccount_T":"","Action":"","NodeType":"","counter":"140","counter_F":"140","Parameters":{"__deferred":{"uri":"https://ponyhost/sap/opu/odata/sap/ZTJ_SFIN_HIERARCHY_02_SRV/ZTJ_G4_C_GLHIERResults(\'1.2.4.0.1.2.4.0%3A4.11.1.1.X.1.1_IEQCACNIEQ9999CACN52372%3A99994%2523%2523\')/Parameters"}}},{"__metadata":{"id":"https://ponyhost/sap/opu/odata/sap/ZTJ_SFIN_HIERARCHY_02_SRV/ZTJ_G4_C_GLHIERResults(\'1.2.4.0.1.2.4.0%3A4.11.1.1.X.1.1_IEQCACNIEQ9999CACN52372%3A99996%2523%2523\')","uri":"https://ponyhost/sap/opu/odata/sap/ZTJ_SFIN_HIERARCHY_02_SRV/ZTJ_G4_C_GLHIERResults(\'1.2.4.0.1.2.4.0%3A4.11.1.1.X.1.1_IEQCACNIEQ9999CACN52372%3A99996%2523%2523\')","type":"ZTJ_SFIN_HIERARCHY_02_SRV.ZTJ_G4_C_GLHIERResult"},"ID":"1.2.4.0.1.2.4.0:4.11.1.1.X.1.1_IEQCACNIEQ9999CACN52372:99996%23%23","TotaledProperties":"","ChartOfAccounts":"CACN","GLAccount":"","GLAccount_NodeID":"FinancialStatementItem:99996","GLAccount_NodeIDExt":"9999/6","GLAccount_NodeText":"Profit & Loss","GLAccount_ParentID":"","GLAccount_Level":1,"GLAccount_Drillstate":"collapsed","GLAccount_Nodecount":0,"GLAccount_T":"","Action":"","NodeType":"","counter":"139","counter_F":"139","Parameters":{"__deferred":{"uri":"https://ponyhost/sap/opu/odata/sap/ZTJ_SFIN_HIERARCHY_02_SRV/ZTJ_G4_C_GLHIERResults(\'1.2.4.0.1.2.4.0%3A4.11.1.1.X.1.1_IEQCACNIEQ9999CACN52372%3A99996%2523%2523\')/Parameters"}}},{"__metadata":{"id":"https://ponyhost/sap/opu/odata/sap/ZTJ_SFIN_HIERARCHY_02_SRV/ZTJ_G4_C_GLHIERResults(\'1.2.4.0.1.2.4.0%3A4.11.1.1.X.1.1_IEQCACNIEQ9999CACN52372%3A99997%2523%2523\')","uri":"https://ponyhost/sap/opu/odata/sap/ZTJ_SFIN_HIERARCHY_02_SRV/ZTJ_G4_C_GLHIERResults(\'1.2.4.0.1.2.4.0%3A4.11.1.1.X.1.1_IEQCACNIEQ9999CACN52372%3A99997%2523%2523\')","type":"ZTJ_SFIN_HIERARCHY_02_SRV.ZTJ_G4_C_GLHIERResult"},"ID":"1.2.4.0.1.2.4.0:4.11.1.1.X.1.1_IEQCACNIEQ9999CACN52372:99997%23%23","TotaledProperties":"","ChartOfAccounts":"CACN","GLAccount":"","GLAccount_NodeID":"FinancialStatementItem:99997","GLAccount_NodeIDExt":"9999/7","GLAccount_NodeText":"Not assigned accounts","GLAccount_ParentID":"","GLAccount_Level":1,"GLAccount_Drillstate":"collapsed","GLAccount_Nodecount":0,"GLAccount_T":"","Action":"","NodeType":"","counter":"1","counter_F":"1","Parameters":{"__deferred":{"uri":"https://ponyhost/sap/opu/odata/sap/ZTJ_SFIN_HIERARCHY_02_SRV/ZTJ_G4_C_GLHIERResults(\'1.2.4.0.1.2.4.0%3A4.11.1.1.X.1.1_IEQCACNIEQ9999CACN52372%3A99997%2523%2523\')/Parameters"}}},{"__metadata":{"id":"https://ponyhost/sap/opu/odata/sap/ZTJ_SFIN_HIERARCHY_02_SRV/ZTJ_G4_C_GLHIERResults(\'1.2.4.0.1.2.4.0%3A4.11.1.1.X.1.1_IEQCACNIEQ9999CACN52372%3A99998%2523%2523\')","uri":"https://ponyhost/sap/opu/odata/sap/ZTJ_SFIN_HIERARCHY_02_SRV/ZTJ_G4_C_GLHIERResults(\'1.2.4.0.1.2.4.0%3A4.11.1.1.X.1.1_IEQCACNIEQ9999CACN52372%3A99998%2523%2523\')","type":"ZTJ_SFIN_HIERARCHY_02_SRV.ZTJ_G4_C_GLHIERResult"},"ID":"1.2.4.0.1.2.4.0:4.11.1.1.X.1.1_IEQCACNIEQ9999CACN52372:99998%23%23","TotaledProperties":"","ChartOfAccounts":"CACN","GLAccount":"","GLAccount_NodeID":"FinancialStatementItem:99998","GLAccount_NodeIDExt":"9999/8","GLAccount_NodeText":"Financial St. Notes","GLAccount_ParentID":"","GLAccount_Level":1,"GLAccount_Drillstate":"collapsed","GLAccount_Nodecount":0,"GLAccount_T":"","Action":"","NodeType":"","counter":"1","counter_F":"1","Parameters":{"__deferred":{"uri":"https://ponyhost/sap/opu/odata/sap/ZTJ_SFIN_HIERARCHY_02_SRV/ZTJ_G4_C_GLHIERResults(\'1.2.4.0.1.2.4.0%3A4.11.1.1.X.1.1_IEQCACNIEQ9999CACN52372%3A99998%2523%2523\')/Parameters"}}}]}}';

	var sResultsL0Parent0Top6 = sResultsL0Parent0Top120;

	var sResultsL1Parent0Top120 = '{"d":{"__count":"1","results":[{"__metadata":{"id":"https://ponyhost/sap/opu/odata/sap/ZTJ_SFIN_HIERARCHY_02_SRV/ZTJ_G4_C_GLHIERResults(\'1.2.4.0.1.2.4.0%3A0.16.0.0_IEQCACNIEQ9999%3ACACNY0000000000\')","uri":"https://ponyhost/sap/opu/odata/sap/ZTJ_SFIN_HIERARCHY_02_SRV/ZTJ_G4_C_GLHIERResults(\'1.2.4.0.1.2.4.0%3A0.16.0.0_IEQCACNIEQ9999%3ACACNY0000000000\')","type":"ZTJ_SFIN_HIERARCHY_02_SRV.ZTJ_G4_C_GLHIERResult"},"GLAccount_NodeID":":CACNY0000000000","GLAccount_NodeIDExt":"Y/0","GLAccount_NodeText":"CACN/Y/0","GLAccount_ParentID":"FinancialStatementItem:999912","GLAccount_Level":3,"GLAccount_Drillstate":"leaf","GLAccount_Nodecount":0}]}}';

	var sResultsL1Parent0Top1 = sResultsL1Parent0Top120;

	var sResultsL1Top120 =
		'{"d":{"__count":"29","results":[{"__metadata":{"id":"https://ponyhost/sap/opu/odata/sap/ZTJ_SFIN_HIERARCHY_02_SRV/ZTJ_G4_C_GLHIERResults(\'1.2.4.0.1.2.4.0%3A4.11.1.1.X.1.1_IEQCACNIEQ9999CACN52372%3A99991%2523%2523\')","uri":"https://ponyhost/sap/opu/odata/sap/ZTJ_SFIN_HIERARCHY_02_SRV/ZTJ_G4_C_GLHIERResults(\'1.2.4.0.1.2.4.0%3A4.11.1.1.X.1.1_IEQCACNIEQ9999CACN52372%3A99991%2523%2523\')","type":"ZTJ_SFIN_HIERARCHY_02_SRV.ZTJ_G4_C_GLHIERResult"},"ID":"1.2.4.0.1.2.4.0:4.11.1.1.X.1.1_IEQCACNIEQ9999CACN52372:99991%23%23","TotaledProperties":"","ChartOfAccounts":"CACN","GLAccount":"","GLAccount_NodeID":"FinancialStatementItem:99991","GLAccount_NodeIDExt":"9999/1","GLAccount_NodeText":"Assets","GLAccount_ParentID":"","GLAccount_Level":1,"GLAccount_Drillstate":"expanded","GLAccount_Nodecount":0,"GLAccount_T":"","Action":"","NodeType":"","counter":"14","counter_F":"14","Parameters":{"__deferred":{"uri":"https://ponyhost/sap/opu/odata/sap/ZTJ_SFIN_HIERARCHY_02_SRV/ZTJ_G4_C_GLHIERResults(\'1.2.4.0.1.2.4.0%3A4.11.1.1.X.1.1_IEQCACNIEQ9999CACN52372%3A99991%2523%2523\')/Parameters"}}},{"__metadata":{"id":"https://ponyhost/sap/opu/odata/sap/ZTJ_SFIN_HIERARCHY_02_SRV/ZTJ_G4_C_GLHIERResults(\'1.2.4.0.1.2.4.0%3A4.12.1.1.X.1.1_IEQCACNIEQ9999CACN52372%3A999912%2523%2523\')","uri":"https://ponyhost/sap/opu/odata/sap/ZTJ_SFIN_HIERARCHY_02_SRV/ZTJ_G4_C_GLHIERResults(\'1.2.4.0.1.2.4.0%3A4.12.1.1.X.1.1_IEQCACNIEQ9999CACN52372%3A999912%2523%2523\')","type":"ZTJ_SFIN_HIERARCHY_02_SRV.ZTJ_G4_C_GLHIERResult"},"ID":"1.2.4.0.1.2.4.0:4.12.1.1.X.1.1_IEQCACNIEQ9999CACN52372:999912%23%23","TotaledProperties":"","ChartOfAccounts":"CACN","GLAccount":"","GLAccount_NodeID":"FinancialStatementItem:999912","GLAccount_NodeIDExt":"9999/12","GLAccount_NodeText":"FM","GLAccount_ParentID":"FinancialStatementItem:99991","GLAccount_Level":2,"GLAccount_Drillstate":"collapsed","GLAccount_Nodecount":0,"GLAccount_T":"","Action":"","NodeType":"","counter":"1","counter_F":"1","Parameters":{"__deferred":{"uri":"https://ponyhost/sap/opu/odata/sap/ZTJ_SFIN_HIERARCHY_02_SRV/ZTJ_G4_C_GLHIERResults(\'1.2.4.0.1.2.4.0%3A4.12.1.1.X.1.1_IEQCACNIEQ9999CACN52372%3A999912%2523%2523\')/Parameters"}}},{"__metadata":{"id":"https://ponyhost/sap/opu/odata/sap/ZTJ_SFIN_HIERARCHY_02_SRV/ZTJ_G4_C_GLHIERResults(\'1.2.4.0.1.2.4.0%3A4.12.1.1.X.1.1_IEQCACNIEQ9999CACN52372%3A999915%2523%2523\')","uri":"https://ponyhost/sap/opu/odata/sap/ZTJ_SFIN_HIERARCHY_02_SRV/ZTJ_G4_C_GLHIERResults(\'1.2.4.0.1.2.4.0%3A4.12.1.1.X.1.1_IEQCACNIEQ9999CACN52372%3A999915%2523%2523\')","type":"ZTJ_SFIN_HIERARCHY_02_SRV.ZTJ_G4_C_GLHIERResult"},"ID":"1.2.4.0.1.2.4.0:4.12.1.1.X.1.1_IEQCACNIEQ9999CACN52372:999915%23%23","TotaledProperties":"","ChartOfAccounts":"CACN","GLAccount":"","GLAccount_NodeID":"FinancialStatementItem:999915","GLAccount_NodeIDExt":"9999/15","GLAccount_NodeText":"Long-term investments","GLAccount_ParentID":"FinancialStatementItem:99991","GLAccount_Level":2,"GLAccount_Drillstate":"collapsed","GLAccount_Nodecount":0,"GLAccount_T":"","Action":"","NodeType":"","counter":"6","counter_F":"6","Parameters":{"__deferred":{"uri":"https://ponyhost/sap/opu/odata/sap/ZTJ_SFIN_HIERARCHY_02_SRV/ZTJ_G4_C_GLHIERResults(\'1.2.4.0.1.2.4.0%3A4.12.1.1.X.1.1_IEQCACNIEQ9999CACN52372%3A999915%2523%2523\')/Parameters"}}},{"__metadata":{"id":"https://ponyhost/sap/opu/odata/sap/ZTJ_SFIN_HIERARCHY_02_SRV/ZTJ_G4_C_GLHIERResults(\'1.2.4.0.1.2.4.0%3A4.12.1.1.X.1.1_IEQCACNIEQ9999CACN52372%3A999916%2523%2523\')","uri":"https://ponyhost/sap/opu/odata/sap/ZTJ_SFIN_HIERARCHY_02_SRV/ZTJ_G4_C_GLHIERResults(\'1.2.4.0.1.2.4.0%3A4.12.1.1.X.1.1_IEQCACNIEQ9999CACN52372%3A999916%2523%2523\')","type":"ZTJ_SFIN_HIERARCHY_02_SRV.ZTJ_G4_C_GLHIERResult"},"ID":"1.2.4.0.1.2.4.0:4.12.1.1.X.1.1_IEQCACNIEQ9999CACN52372:999916%23%23","TotaledProperties":"","ChartOfAccounts":"CACN","GLAccount":"","GLAccount_NodeID":"FinancialStatementItem:999916","GLAccount_NodeIDExt":"9999/16","GLAccount_NodeText":"Fixed assets","GLAccount_ParentID":"FinancialStatementItem:99991","GLAccount_Level":2,"GLAccount_Drillstate":"collapsed","GLAccount_Nodecount":0,"GLAccount_T":"","Action":"","NodeType":"","counter":"1","counter_F":"1","Parameters":{"__deferred":{"uri":"https://ponyhost/sap/opu/odata/sap/ZTJ_SFIN_HIERARCHY_02_SRV/ZTJ_G4_C_GLHIERResults(\'1.2.4.0.1.2.4.0%3A4.12.1.1.X.1.1_IEQCACNIEQ9999CACN52372%3A999916%2523%2523\')/Parameters"}}},{"__metadata":{"id":"https://ponyhost/sap/opu/odata/sap/ZTJ_SFIN_HIERARCHY_02_SRV/ZTJ_G4_C_GLHIERResults(\'1.2.4.0.1.2.4.0%3A4.12.1.1.X.1.1_IEQCACNIEQ9999CACN52372%3A999917%2523%2523\')","uri":"https://ponyhost/sap/opu/odata/sap/ZTJ_SFIN_HIERARCHY_02_SRV/ZTJ_G4_C_GLHIERResults(\'1.2.4.0.1.2.4.0%3A4.12.1.1.X.1.1_IEQCACNIEQ9999CACN52372%3A999917%2523%2523\')","type":"ZTJ_SFIN_HIERARCHY_02_SRV.ZTJ_G4_C_GLHIERResult"},"ID":"1.2.4.0.1.2.4.0:4.12.1.1.X.1.1_IEQCACNIEQ9999CACN52372:999917%23%23","TotaledProperties":"","ChartOfAccounts":"CACN","GLAccount":"","GLAccount_NodeID":"FinancialStatementItem:999917","GLAccount_NodeIDExt":"9999/17","GLAccount_NodeText":"Intangible assets","GLAccount_ParentID":"FinancialStatementItem:99991","GLAccount_Level":2,"GLAccount_Drillstate":"collapsed","GLAccount_Nodecount":0,"GLAccount_T":"","Action":"","NodeType":"","counter":"4","counter_F":"4","Parameters":{"__deferred":{"uri":"https://ponyhost/sap/opu/odata/sap/ZTJ_SFIN_HIERARCHY_02_SRV/ZTJ_G4_C_GLHIERResults(\'1.2.4.0.1.2.4.0%3A4.12.1.1.X.1.1_IEQCACNIEQ9999CACN52372%3A999917%2523%2523\')/Parameters"}}},{"__metadata":{"id":"https://ponyhost/sap/opu/odata/sap/ZTJ_SFIN_HIERARCHY_02_SRV/ZTJ_G4_C_GLHIERResults(\'1.2.4.0.1.2.4.0%3A4.12.1.1.X.1.1_IEQCACNIEQ9999CACN52372%3A999918%2523%2523\')","uri":"https://ponyhost/sap/opu/odata/sap/ZTJ_SFIN_HIERARCHY_02_SRV/ZTJ_G4_C_GLHIERResults(\'1.2.4.0.1.2.4.0%3A4.12.1.1.X.1.1_IEQCACNIEQ9999CACN52372%3A999918%2523%2523\')","type":"ZTJ_SFIN_HIERARCHY_02_SRV.ZTJ_G4_C_GLHIERResult"},"ID":"1.2.4.0.1.2.4.0:4.12.1.1.X.1.1_IEQCACNIEQ9999CACN52372:999918%23%23","TotaledProperties":"","ChartOfAccounts":"CACN","GLAccount":"","GLAccount_NodeID":"FinancialStatementItem:999918","GLAccount_NodeIDExt":"9999/18","GLAccount_NodeText":"Long term deferred","GLAccount_ParentID":"FinancialStatementItem:99991","GLAccount_Level":2,"GLAccount_Drillstate":"collapsed","GLAccount_Nodecount":0,"GLAccount_T":"","Action":"","NodeType":"","counter":"2","counter_F":"2","Parameters":{"__deferred":{"uri":"https://ponyhost/sap/opu/odata/sap/ZTJ_SFIN_HIERARCHY_02_SRV/ZTJ_G4_C_GLHIERResults(\'1.2.4.0.1.2.4.0%3A4.12.1.1.X.1.1_IEQCACNIEQ9999CACN52372%3A999918%2523%2523\')/Parameters"}}},{"__metadata":{"id":"https://ponyhost/sap/opu/odata/sap/ZTJ_SFIN_HIERARCHY_02_SRV/ZTJ_G4_C_GLHIERResults(\'1.2.4.0.1.2.4.0%3A4.12.1.1.X.1.1_IEQCACNIEQ9999CACN52372%3A999919%2523%2523\')","uri":"https://ponyhost/sap/opu/odata/sap/ZTJ_SFIN_HIERARCHY_02_SRV/ZTJ_G4_C_GLHIERResults(\'1.2.4.0.1.2.4.0%3A4.12.1.1.X.1.1_IEQCACNIEQ9999CACN52372%3A999919%2523%2523\')","type":"ZTJ_SFIN_HIERARCHY_02_SRV.ZTJ_G4_C_GLHIERResult"},"ID":"1.2.4.0.1.2.4.0:4.12.1.1.X.1.1_IEQCACNIEQ9999CACN52372:999919%23%23","TotaledProperties":"","ChartOfAccounts":"CACN","GLAccount":"","GLAccount_NodeID":"FinancialStatementItem:999919","GLAccount_NodeIDExt":"9999/19","GLAccount_NodeText":"Gain/loss fro handling assets","GLAccount_ParentID":"FinancialStatementItem:99991","GLAccount_Level":2,"GLAccount_Drillstate":"collapsed","GLAccount_Nodecount":0,"GLAccount_T":"","Action":"","NodeType":"","counter":"2","counter_F":"2","Parameters":{"__deferred":{"uri":"https://ponyhost/sap/opu/odata/sap/ZTJ_SFIN_HIERARCHY_02_SRV/ZTJ_G4_C_GLHIERResults(\'1.2.4.0.1.2.4.0%3A4.12.1.1.X.1.1_IEQCACNIEQ9999CACN52372%3A999919%2523%2523\')/Parameters"}}},{"__metadata":{"id":"https://ponyhost/sap/opu/odata/sap/ZTJ_SFIN_HIERARCHY_02_SRV/ZTJ_G4_C_GLHIERResults(\'1.2.4.0.1.2.4.0%3A4.11.1.1.X.1.1_IEQCACNIEQ9999CACN52372%3A99992%2523%2523\')","uri":"https://ponyhost/sap/opu/odata/sap/ZTJ_SFIN_HIERARCHY_02_SRV/ZTJ_G4_C_GLHIERResults(\'1.2.4.0.1.2.4.0%3A4.11.1.1.X.1.1_IEQCACNIEQ9999CACN52372%3A99992%2523%2523\')","type":"ZTJ_SFIN_HIERARCHY_02_SRV.ZTJ_G4_C_GLHIERResult"},"ID":"1.2.4.0.1.2.4.0:4.11.1.1.X.1.1_IEQCACNIEQ9999CACN52372:99992%23%23","TotaledProperties":"","ChartOfAccounts":"CACN","GLAccount":"","GLAccount_NodeID":"FinancialStatementItem:99992","GLAccount_NodeIDExt":"9999/2","GLAccount_NodeText":"Liabilities & Stockholders\' Equity","GLAccount_ParentID":"","GLAccount_Level":1,"GLAccount_Drillstate":"expanded","GLAccount_Nodecount":0,"GLAccount_T":"","Action":"","NodeType":"","counter":"29","counter_F":"29","Parameters":{"__deferred":{"uri":"https://ponyhost/sap/opu/odata/sap/ZTJ_SFIN_HIERARCHY_02_SRV/ZTJ_G4_C_GLHIERResults(\'1.2.4.0.1.2.4.0%3A4.11.1.1.X.1.1_IEQCACNIEQ9999CACN52372%3A99992%2523%2523\')/Parameters"}}},{"__metadata":{"id":"https://ponyhost/sap/opu/odata/sap/ZTJ_SFIN_HIERARCHY_02_SRV/ZTJ_G4_C_GLHIERResults(\'1.2.4.0.1.2.4.0%3A4.12.1.1.X.1.1_IEQCACNIEQ9999CACN52372%3A999922%2523%2523\')","uri":"https://ponyhost/sap/opu/odata/sap/ZTJ_SFIN_HIERARCHY_02_SRV/ZTJ_G4_C_GLHIERResults(\'1.2.4.0.1.2.4.0%3A4.12.1.1.X.1.1_IEQCACNIEQ9999CACN52372%3A999922%2523%2523\')","type":"ZTJ_SFIN_HIERARCHY_02_SRV.ZTJ_G4_C_GLHIERResult"},"ID":"1.2.4.0.1.2.4.0:4.12.1.1.X.1.1_IEQCACNIEQ9999CACN52372:999922%23%23","TotaledProperties":"","ChartOfAccounts":"CACN","GLAccount":"","GLAccount_NodeID":"FinancialStatementItem:999922","GLAccount_NodeIDExt":"9999/22","GLAccount_NodeText":"Liabilities","GLAccount_ParentID":"FinancialStatementItem:99992","GLAccount_Level":2,"GLAccount_Drillstate":"collapsed","GLAccount_Nodecount":0,"GLAccount_T":"","Action":"","NodeType":"","counter":"29","counter_F":"29","Parameters":{"__deferred":{"uri":"https://ponyhost/sap/opu/odata/sap/ZTJ_SFIN_HIERARCHY_02_SRV/ZTJ_G4_C_GLHIERResults(\'1.2.4.0.1.2.4.0%3A4.12.1.1.X.1.1_IEQCACNIEQ9999CACN52372%3A999922%2523%2523\')/Parameters"}}},{"__metadata":{"id":"https://ponyhost/sap/opu/odata/sap/ZTJ_SFIN_HIERARCHY_02_SRV/ZTJ_G4_C_GLHIERResults(\'1.2.4.0.1.2.4.0%3A4.11.1.1.X.1.1_IEQCACNIEQ9999CACN52372%3A99993%2523%2523\')","uri":"https://ponyhost/sap/opu/odata/sap/ZTJ_SFIN_HIERARCHY_02_SRV/ZTJ_G4_C_GLHIERResults(\'1.2.4.0.1.2.4.0%3A4.11.1.1.X.1.1_IEQCACNIEQ9999CACN52372%3A99993%2523%2523\')","type":"ZTJ_SFIN_HIERARCHY_02_SRV.ZTJ_G4_C_GLHIERResult"},"ID":"1.2.4.0.1.2.4.0:4.11.1.1.X.1.1_IEQCACNIEQ9999CACN52372:99993%23%23","TotaledProperties":"","ChartOfAccounts":"CACN","GLAccount":"","GLAccount_NodeID":"FinancialStatementItem:99993","GLAccount_NodeIDExt":"9999/3","GLAccount_NodeText":"Common","GLAccount_ParentID":"","GLAccount_Level":1,"GLAccount_Drillstate":"expanded","GLAccount_Nodecount":0,"GLAccount_T":"","Action":"","NodeType":"","counter":"3","counter_F":"3","Parameters":{"__deferred":{"uri":"https://ponyhost/sap/opu/odata/sap/ZTJ_SFIN_HIERARCHY_02_SRV/ZTJ_G4_C_GLHIERResults(\'1.2.4.0.1.2.4.0%3A4.11.1.1.X.1.1_IEQCACNIEQ9999CACN52372%3A99993%2523%2523\')/Parameters"}}},{"__metadata":{"id":"https://ponyhost/sap/opu/odata/sap/ZTJ_SFIN_HIERARCHY_02_SRV/ZTJ_G4_C_GLHIERResults(\'1.2.4.0.1.2.4.0%3A4.14.1.1.X.1.1_IEQCACNIEQ9999CACN52372%3A99993101%2523%2523\')","uri":"https://ponyhost/sap/opu/odata/sap/ZTJ_SFIN_HIERARCHY_02_SRV/ZTJ_G4_C_GLHIERResults(\'1.2.4.0.1.2.4.0%3A4.14.1.1.X.1.1_IEQCACNIEQ9999CACN52372%3A99993101%2523%2523\')","type":"ZTJ_SFIN_HIERARCHY_02_SRV.ZTJ_G4_C_GLHIERResult"},"ID":"1.2.4.0.1.2.4.0:4.14.1.1.X.1.1_IEQCACNIEQ9999CACN52372:99993101%23%23","TotaledProperties":"","ChartOfAccounts":"CACN","GLAccount":"","GLAccount_NodeID":"FinancialStatementItem:99993101","GLAccount_NodeIDExt":"9999/3101","GLAccount_NodeText":"Derivative financial tools","GLAccount_ParentID":"FinancialStatementItem:99993","GLAccount_Level":2,"GLAccount_Drillstate":"collapsed","GLAccount_Nodecount":0,"GLAccount_T":"","Action":"","NodeType":"","counter":"1","counter_F":"1","Parameters":{"__deferred":{"uri":"https://ponyhost/sap/opu/odata/sap/ZTJ_SFIN_HIERARCHY_02_SRV/ZTJ_G4_C_GLHIERResults(\'1.2.4.0.1.2.4.0%3A4.14.1.1.X.1.1_IEQCACNIEQ9999CACN52372%3A99993101%2523%2523\')/Parameters"}}},{"__metadata":{"id":"https://ponyhost/sap/opu/odata/sap/ZTJ_SFIN_HIERARCHY_02_SRV/ZTJ_G4_C_GLHIERResults(\'1.2.4.0.1.2.4.0%3A4.14.1.1.X.1.1_IEQCACNIEQ9999CACN52372%3A99993201%2523%2523\')","uri":"https://ponyhost/sap/opu/odata/sap/ZTJ_SFIN_HIERARCHY_02_SRV/ZTJ_G4_C_GLHIERResults(\'1.2.4.0.1.2.4.0%3A4.14.1.1.X.1.1_IEQCACNIEQ9999CACN52372%3A99993201%2523%2523\')","type":"ZTJ_SFIN_HIERARCHY_02_SRV.ZTJ_G4_C_GLHIERResult"},"ID":"1.2.4.0.1.2.4.0:4.14.1.1.X.1.1_IEQCACNIEQ9999CACN52372:99993201%23%23","TotaledProperties":"","ChartOfAccounts":"CACN","GLAccount":"","GLAccount_NodeID":"FinancialStatementItem:99993201","GLAccount_NodeIDExt":"9999/3201","GLAccount_NodeText":"Hedging financial tools","GLAccount_ParentID":"FinancialStatementItem:99993","GLAccount_Level":2,"GLAccount_Drillstate":"collapsed","GLAccount_Nodecount":0,"GLAccount_T":"","Action":"","NodeType":"","counter":"1","counter_F":"1","Parameters":{"__deferred":{"uri":"https://ponyhost/sap/opu/odata/sap/ZTJ_SFIN_HIERARCHY_02_SRV/ZTJ_G4_C_GLHIERResults(\'1.2.4.0.1.2.4.0%3A4.14.1.1.X.1.1_IEQCACNIEQ9999CACN52372%3A99993201%2523%2523\')/Parameters"}}},{"__metadata":{"id":"https://ponyhost/sap/opu/odata/sap/ZTJ_SFIN_HIERARCHY_02_SRV/ZTJ_G4_C_GLHIERResults(\'1.2.4.0.1.2.4.0%3A4.14.1.1.X.1.1_IEQCACNIEQ9999CACN52372%3A99993202%2523%2523\')","uri":"https://ponyhost/sap/opu/odata/sap/ZTJ_SFIN_HIERARCHY_02_SRV/ZTJ_G4_C_GLHIERResults(\'1.2.4.0.1.2.4.0%3A4.14.1.1.X.1.1_IEQCACNIEQ9999CACN52372%3A99993202%2523%2523\')","type":"ZTJ_SFIN_HIERARCHY_02_SRV.ZTJ_G4_C_GLHIERResult"},"ID":"1.2.4.0.1.2.4.0:4.14.1.1.X.1.1_IEQCACNIEQ9999CACN52372:99993202%23%23","TotaledProperties":"","ChartOfAccounts":"CACN","GLAccount":"","GLAccount_NodeID":"FinancialStatementItem:99993202","GLAccount_NodeIDExt":"9999/3202","GLAccount_NodeText":"Hedged items","GLAccount_ParentID":"FinancialStatementItem:99993","GLAccount_Level":2,"GLAccount_Drillstate":"collapsed","GLAccount_Nodecount":0,"GLAccount_T":"","Action":"","NodeType":"","counter":"1","counter_F":"1","Parameters":{"__deferred":{"uri":"https://ponyhost/sap/opu/odata/sap/ZTJ_SFIN_HIERARCHY_02_SRV/ZTJ_G4_C_GLHIERResults(\'1.2.4.0.1.2.4.0%3A4.14.1.1.X.1.1_IEQCACNIEQ9999CACN52372%3A99993202%2523%2523\')/Parameters"}}},{"__metadata":{"id":"https://ponyhost/sap/opu/odata/sap/ZTJ_SFIN_HIERARCHY_02_SRV/ZTJ_G4_C_GLHIERResults(\'1.2.4.0.1.2.4.0%3A4.11.1.1.X.1.1_IEQCACNIEQ9999CACN52372%3A99994%2523%2523\')","uri":"https://ponyhost/sap/opu/odata/sap/ZTJ_SFIN_HIERARCHY_02_SRV/ZTJ_G4_C_GLHIERResults(\'1.2.4.0.1.2.4.0%3A4.11.1.1.X.1.1_IEQCACNIEQ9999CACN52372%3A99994%2523%2523\')","type":"ZTJ_SFIN_HIERARCHY_02_SRV.ZTJ_G4_C_GLHIERResult"},"ID":"1.2.4.0.1.2.4.0:4.11.1.1.X.1.1_IEQCACNIEQ9999CACN52372:99994%23%23","TotaledProperties":"","ChartOfAccounts":"CACN","GLAccount":"","GLAccount_NodeID":"FinancialStatementItem:99994","GLAccount_NodeIDExt":"9999/4","GLAccount_NodeText":"Stock owner\'s equity","GLAccount_ParentID":"","GLAccount_Level":1,"GLAccount_Drillstate":"expanded","GLAccount_Nodecount":0,"GLAccount_T":"","Action":"","NodeType":"","counter":"140","counter_F":"140","Parameters":{"__deferred":{"uri":"https://ponyhost/sap/opu/odata/sap/ZTJ_SFIN_HIERARCHY_02_SRV/ZTJ_G4_C_GLHIERResults(\'1.2.4.0.1.2.4.0%3A4.11.1.1.X.1.1_IEQCACNIEQ9999CACN52372%3A99994%2523%2523\')/Parameters"}}},{"__metadata":{"id":"https://ponyhost/sap/opu/odata/sap/ZTJ_SFIN_HIERARCHY_02_SRV/ZTJ_G4_C_GLHIERResults(\'1.2.4.0.1.2.4.0%3A4.14.1.1.X.1.1_IEQCACNIEQ9999CACN52372%3A99994001%2523%2523\')","uri":"https://ponyhost/sap/opu/odata/sap/ZTJ_SFIN_HIERARCHY_02_SRV/ZTJ_G4_C_GLHIERResults(\'1.2.4.0.1.2.4.0%3A4.14.1.1.X.1.1_IEQCACNIEQ9999CACN52372%3A99994001%2523%2523\')","type":"ZTJ_SFIN_HIERARCHY_02_SRV.ZTJ_G4_C_GLHIERResult"},"ID":"1.2.4.0.1.2.4.0:4.14.1.1.X.1.1_IEQCACNIEQ9999CACN52372:99994001%23%23","TotaledProperties":"","ChartOfAccounts":"CACN","GLAccount":"","GLAccount_NodeID":"FinancialStatementItem:99994001","GLAccount_NodeIDExt":"9999/4001","GLAccount_NodeText":"Pain-in capital","GLAccount_ParentID":"FinancialStatementItem:99994","GLAccount_Level":2,"GLAccount_Drillstate":"collapsed","GLAccount_Nodecount":0,"GLAccount_T":"","Action":"","NodeType":"","counter":"3","counter_F":"3","Parameters":{"__deferred":{"uri":"https://ponyhost/sap/opu/odata/sap/ZTJ_SFIN_HIERARCHY_02_SRV/ZTJ_G4_C_GLHIERResults(\'1.2.4.0.1.2.4.0%3A4.14.1.1.X.1.1_IEQCACNIEQ9999CACN52372%3A99994001%2523%2523\')/Parameters"}}},{"__metadata":{"id":"https://ponyhost/sap/opu/odata/sap/ZTJ_SFIN_HIERARCHY_02_SRV/ZTJ_G4_C_GLHIERResults(\'1.2.4.0.1.2.4.0%3A4.14.1.1.X.1.1_IEQCACNIEQ9999CACN52372%3A99994002%2523%2523\')","uri":"https://ponyhost/sap/opu/odata/sap/ZTJ_SFIN_HIERARCHY_02_SRV/ZTJ_G4_C_GLHIERResults(\'1.2.4.0.1.2.4.0%3A4.14.1.1.X.1.1_IEQCACNIEQ9999CACN52372%3A99994002%2523%2523\')","type":"ZTJ_SFIN_HIERARCHY_02_SRV.ZTJ_G4_C_GLHIERResult"},"ID":"1.2.4.0.1.2.4.0:4.14.1.1.X.1.1_IEQCACNIEQ9999CACN52372:99994002%23%23","TotaledProperties":"","ChartOfAccounts":"CACN","GLAccount":"","GLAccount_NodeID":"FinancialStatementItem:99994002","GLAccount_NodeIDExt":"9999/4002","GLAccount_NodeText":"Capital surplus","GLAccount_ParentID":"FinancialStatementItem:99994","GLAccount_Level":2,"GLAccount_Drillstate":"collapsed","GLAccount_Nodecount":0,"GLAccount_T":"","Action":"","NodeType":"","counter":"1","counter_F":"1","Parameters":{"__deferred":{"uri":"https://ponyhost/sap/opu/odata/sap/ZTJ_SFIN_HIERARCHY_02_SRV/ZTJ_G4_C_GLHIERResults(\'1.2.4.0.1.2.4.0%3A4.14.1.1.X.1.1_IEQCACNIEQ9999CACN52372%3A99994002%2523%2523\')/Parameters"}}},{"__metadata":{"id":"https://ponyhost/sap/opu/odata/sap/ZTJ_SFIN_HIERARCHY_02_SRV/ZTJ_G4_C_GLHIERResults(\'1.2.4.0.1.2.4.0%3A4.14.1.1.X.1.1_IEQCACNIEQ9999CACN52372%3A99994101%2523%2523\')","uri":"https://ponyhost/sap/opu/odata/sap/ZTJ_SFIN_HIERARCHY_02_SRV/ZTJ_G4_C_GLHIERResults(\'1.2.4.0.1.2.4.0%3A4.14.1.1.X.1.1_IEQCACNIEQ9999CACN52372%3A99994101%2523%2523\')","type":"ZTJ_SFIN_HIERARCHY_02_SRV.ZTJ_G4_C_GLHIERResult"},"ID":"1.2.4.0.1.2.4.0:4.14.1.1.X.1.1_IEQCACNIEQ9999CACN52372:99994101%23%23","TotaledProperties":"","ChartOfAccounts":"CACN","GLAccount":"","GLAccount_NodeID":"FinancialStatementItem:99994101","GLAccount_NodeIDExt":"9999/4101","GLAccount_NodeText":"Legal sruplus","GLAccount_ParentID":"FinancialStatementItem:99994","GLAccount_Level":2,"GLAccount_Drillstate":"collapsed","GLAccount_Nodecount":0,"GLAccount_T":"","Action":"","NodeType":"","counter":"93","counter_F":"93","Parameters":{"__deferred":{"uri":"https://ponyhost/sap/opu/odata/sap/ZTJ_SFIN_HIERARCHY_02_SRV/ZTJ_G4_C_GLHIERResults(\'1.2.4.0.1.2.4.0%3A4.14.1.1.X.1.1_IEQCACNIEQ9999CACN52372%3A99994101%2523%2523\')/Parameters"}}},{"__metadata":{"id":"https://ponyhost/sap/opu/odata/sap/ZTJ_SFIN_HIERARCHY_02_SRV/ZTJ_G4_C_GLHIERResults(\'1.2.4.0.1.2.4.0%3A4.14.1.1.X.1.1_IEQCACNIEQ9999CACN52372%3A99994103%2523%2523\')","uri":"https://ponyhost/sap/opu/odata/sap/ZTJ_SFIN_HIERARCHY_02_SRV/ZTJ_G4_C_GLHIERResults(\'1.2.4.0.1.2.4.0%3A4.14.1.1.X.1.1_IEQCACNIEQ9999CACN52372%3A99994103%2523%2523\')","type":"ZTJ_SFIN_HIERARCHY_02_SRV.ZTJ_G4_C_GLHIERResult"},"ID":"1.2.4.0.1.2.4.0:4.14.1.1.X.1.1_IEQCACNIEQ9999CACN52372:99994103%23%23","TotaledProperties":"","ChartOfAccounts":"CACN","GLAccount":"","GLAccount_NodeID":"FinancialStatementItem:99994103","GLAccount_NodeIDExt":"9999/4103","GLAccount_NodeText":"test","GLAccount_ParentID":"FinancialStatementItem:99994","GLAccount_Level":2,"GLAccount_Drillstate":"collapsed","GLAccount_Nodecount":0,"GLAccount_T":"","Action":"","NodeType":"","counter":"11","counter_F":"11","Parameters":{"__deferred":{"uri":"https://ponyhost/sap/opu/odata/sap/ZTJ_SFIN_HIERARCHY_02_SRV/ZTJ_G4_C_GLHIERResults(\'1.2.4.0.1.2.4.0%3A4.14.1.1.X.1.1_IEQCACNIEQ9999CACN52372%3A99994103%2523%2523\')/Parameters"}}},{"__metadata":{"id":"https://ponyhost/sap/opu/odata/sap/ZTJ_SFIN_HIERARCHY_02_SRV/ZTJ_G4_C_GLHIERResults(\'1.2.4.0.1.2.4.0%3A4.14.1.1.X.1.1_IEQCACNIEQ9999CACN52372%3A99994104%2523%2523\')","uri":"https://ponyhost/sap/opu/odata/sap/ZTJ_SFIN_HIERARCHY_02_SRV/ZTJ_G4_C_GLHIERResults(\'1.2.4.0.1.2.4.0%3A4.14.1.1.X.1.1_IEQCACNIEQ9999CACN52372%3A99994104%2523%2523\')","type":"ZTJ_SFIN_HIERARCHY_02_SRV.ZTJ_G4_C_GLHIERResult"},"ID":"1.2.4.0.1.2.4.0:4.14.1.1.X.1.1_IEQCACNIEQ9999CACN52372:99994104%23%23","TotaledProperties":"","ChartOfAccounts":"CACN","GLAccount":"","GLAccount_NodeID":"FinancialStatementItem:99994104","GLAccount_NodeIDExt":"9999/4104","GLAccount_NodeText":"Approprited retained earnings","GLAccount_ParentID":"FinancialStatementItem:99994","GLAccount_Level":2,"GLAccount_Drillstate":"collapsed","GLAccount_Nodecount":0,"GLAccount_T":"","Action":"","NodeType":"","counter":"30","counter_F":"30","Parameters":{"__deferred":{"uri":"https://ponyhost/sap/opu/odata/sap/ZTJ_SFIN_HIERARCHY_02_SRV/ZTJ_G4_C_GLHIERResults(\'1.2.4.0.1.2.4.0%3A4.14.1.1.X.1.1_IEQCACNIEQ9999CACN52372%3A99994104%2523%2523\')/Parameters"}}},{"__metadata":{"id":"https://ponyhost/sap/opu/odata/sap/ZTJ_SFIN_HIERARCHY_02_SRV/ZTJ_G4_C_GLHIERResults(\'1.2.4.0.1.2.4.0%3A4.14.1.1.X.1.1_IEQCACNIEQ9999CACN52372%3A99994201%2523%2523\')","uri":"https://ponyhost/sap/opu/odata/sap/ZTJ_SFIN_HIERARCHY_02_SRV/ZTJ_G4_C_GLHIERResults(\'1.2.4.0.1.2.4.0%3A4.14.1.1.X.1.1_IEQCACNIEQ9999CACN52372%3A99994201%2523%2523\')","type":"ZTJ_SFIN_HIERARCHY_02_SRV.ZTJ_G4_C_GLHIERResult"},"ID":"1.2.4.0.1.2.4.0:4.14.1.1.X.1.1_IEQCACNIEQ9999CACN52372:99994201%23%23","TotaledProperties":"","ChartOfAccounts":"CACN","GLAccount":"","GLAccount_NodeID":"FinancialStatementItem:99994201","GLAccount_NodeIDExt":"9999/4201","GLAccount_NodeText":"Stock shares inventory","GLAccount_ParentID":"FinancialStatementItem:99994","GLAccount_Level":2,"GLAccount_Drillstate":"collapsed","GLAccount_Nodecount":0,"GLAccount_T":"","Action":"","NodeType":"","counter":"1","counter_F":"1","Parameters":{"__deferred":{"uri":"https://ponyhost/sap/opu/odata/sap/ZTJ_SFIN_HIERARCHY_02_SRV/ZTJ_G4_C_GLHIERResults(\'1.2.4.0.1.2.4.0%3A4.14.1.1.X.1.1_IEQCACNIEQ9999CACN52372%3A99994201%2523%2523\')/Parameters"}}},{"__metadata":{"id":"https://ponyhost/sap/opu/odata/sap/ZTJ_SFIN_HIERARCHY_02_SRV/ZTJ_G4_C_GLHIERResults(\'1.2.4.0.1.2.4.0%3A4.15.1.1.X.1.1_IEQCACNIEQ9999CACN52372%3A999941031%2523%2523\')","uri":"https://ponyhost/sap/opu/odata/sap/ZTJ_SFIN_HIERARCHY_02_SRV/ZTJ_G4_C_GLHIERResults(\'1.2.4.0.1.2.4.0%3A4.15.1.1.X.1.1_IEQCACNIEQ9999CACN52372%3A999941031%2523%2523\')","type":"ZTJ_SFIN_HIERARCHY_02_SRV.ZTJ_G4_C_GLHIERResult"},"ID":"1.2.4.0.1.2.4.0:4.15.1.1.X.1.1_IEQCACNIEQ9999CACN52372:999941031%23%23","TotaledProperties":"","ChartOfAccounts":"CACN","GLAccount":"","GLAccount_NodeID":"FinancialStatementItem:999941031","GLAccount_NodeIDExt":"9999/41031","GLAccount_NodeText":"Current year profit - calculated, checki","GLAccount_ParentID":"FinancialStatementItem:99994","GLAccount_Level":2,"GLAccount_Drillstate":"collapsed","GLAccount_Nodecount":0,"GLAccount_T":"","Action":"","NodeType":"","counter":"1","counter_F":"1","Parameters":{"__deferred":{"uri":"https://ponyhost/sap/opu/odata/sap/ZTJ_SFIN_HIERARCHY_02_SRV/ZTJ_G4_C_GLHIERResults(\'1.2.4.0.1.2.4.0%3A4.15.1.1.X.1.1_IEQCACNIEQ9999CACN52372%3A999941031%2523%2523\')/Parameters"}}},{"__metadata":{"id":"https://ponyhost/sap/opu/odata/sap/ZTJ_SFIN_HIERARCHY_02_SRV/ZTJ_G4_C_GLHIERResults(\'1.2.4.0.1.2.4.0%3A4.15.1.1.X.1.1_IEQCACNIEQ9999CACN52372%3A999941032%2523%2523\')","uri":"https://ponyhost/sap/opu/odata/sap/ZTJ_SFIN_HIERARCHY_02_SRV/ZTJ_G4_C_GLHIERResults(\'1.2.4.0.1.2.4.0%3A4.15.1.1.X.1.1_IEQCACNIEQ9999CACN52372%3A999941032%2523%2523\')","type":"ZTJ_SFIN_HIERARCHY_02_SRV.ZTJ_G4_C_GLHIERResult"},"ID":"1.2.4.0.1.2.4.0:4.15.1.1.X.1.1_IEQCACNIEQ9999CACN52372:999941032%23%23","TotaledProperties":"","ChartOfAccounts":"CACN","GLAccount":"","GLAccount_NodeID":"FinancialStatementItem:999941032","GLAccount_NodeIDExt":"9999/41032","GLAccount_NodeText":"Current year loss - calculated, checking","GLAccount_ParentID":"FinancialStatementItem:99994","GLAccount_Level":2,"GLAccount_Drillstate":"collapsed","GLAccount_Nodecount":0,"GLAccount_T":"","Action":"","NodeType":"","counter":"1","counter_F":"1","Parameters":{"__deferred":{"uri":"https://ponyhost/sap/opu/odata/sap/ZTJ_SFIN_HIERARCHY_02_SRV/ZTJ_G4_C_GLHIERResults(\'1.2.4.0.1.2.4.0%3A4.15.1.1.X.1.1_IEQCACNIEQ9999CACN52372%3A999941032%2523%2523\')/Parameters"}}},{"__metadata":{"id":"https://ponyhost/sap/opu/odata/sap/ZTJ_SFIN_HIERARCHY_02_SRV/ZTJ_G4_C_GLHIERResults(\'1.2.4.0.1.2.4.0%3A4.11.1.1.X.1.1_IEQCACNIEQ9999CACN52372%3A99996%2523%2523\')","uri":"https://ponyhost/sap/opu/odata/sap/ZTJ_SFIN_HIERARCHY_02_SRV/ZTJ_G4_C_GLHIERResults(\'1.2.4.0.1.2.4.0%3A4.11.1.1.X.1.1_IEQCACNIEQ9999CACN52372%3A99996%2523%2523\')","type":"ZTJ_SFIN_HIERARCHY_02_SRV.ZTJ_G4_C_GLHIERResult"},"ID":"1.2.4.0.1.2.4.0:4.11.1.1.X.1.1_IEQCACNIEQ9999CACN52372:99996%23%23","TotaledProperties":"","ChartOfAccounts":"CACN","GLAccount":"","GLAccount_NodeID":"FinancialStatementItem:99996","GLAccount_NodeIDExt":"9999/6","GLAccount_NodeText":"Profit & Loss","GLAccount_ParentID":"","GLAccount_Level":1,"GLAccount_Drillstate":"expanded","GLAccount_Nodecount":0,"GLAccount_T":"","Action":"","NodeType":"","counter":"141","counter_F":"141","Parameters":{"__deferred":{"uri":"https://ponyhost/sap/opu/odata/sap/ZTJ_SFIN_HIERARCHY_02_SRV/ZTJ_G4_C_GLHIERResults(\'1.2.4.0.1.2.4.0%3A4.11.1.1.X.1.1_IEQCACNIEQ9999CACN52372%3A99996%2523%2523\')/Parameters"}}},{"__metadata":{"id":"https://ponyhost/sap/opu/odata/sap/ZTJ_SFIN_HIERARCHY_02_SRV/ZTJ_G4_C_GLHIERResults(\'1.2.4.0.1.2.4.0%3A4.12.1.1.X.1.1_IEQCACNIEQ9999CACN52372%3A999961%2523%2523\')","uri":"https://ponyhost/sap/opu/odata/sap/ZTJ_SFIN_HIERARCHY_02_SRV/ZTJ_G4_C_GLHIERResults(\'1.2.4.0.1.2.4.0%3A4.12.1.1.X.1.1_IEQCACNIEQ9999CACN52372%3A999961%2523%2523\')","type":"ZTJ_SFIN_HIERARCHY_02_SRV.ZTJ_G4_C_GLHIERResult"},"ID":"1.2.4.0.1.2.4.0:4.12.1.1.X.1.1_IEQCACNIEQ9999CACN52372:999961%23%23","TotaledProperties":"","ChartOfAccounts":"CACN","GLAccount":"","GLAccount_NodeID":"FinancialStatementItem:999961","GLAccount_NodeIDExt":"9999/61","GLAccount_NodeText":"Net income","GLAccount_ParentID":"FinancialStatementItem:99996","GLAccount_Level":2,"GLAccount_Drillstate":"collapsed","GLAccount_Nodecount":0,"GLAccount_T":"","Action":"","NodeType":"","counter":"141","counter_F":"141","Parameters":{"__deferred":{"uri":"https://ponyhost/sap/opu/odata/sap/ZTJ_SFIN_HIERARCHY_02_SRV/ZTJ_G4_C_GLHIERResults(\'1.2.4.0.1.2.4.0%3A4.12.1.1.X.1.1_IEQCACNIEQ9999CACN52372%3A999961%2523%2523\')/Parameters"}}},{"__metadata":{"id":"https://ponyhost/sap/opu/odata/sap/ZTJ_SFIN_HIERARCHY_02_SRV/ZTJ_G4_C_GLHIERResults(\'1.2.4.0.1.2.4.0%3A4.12.1.1.X.1.1_IEQCACNIEQ9999CACN52372%3A999949%2523%2523\')","uri":"https://ponyhost/sap/opu/odata/sap/ZTJ_SFIN_HIERARCHY_02_SRV/ZTJ_G4_C_GLHIERResults(\'1.2.4.0.1.2.4.0%3A4.12.1.1.X.1.1_IEQCACNIEQ9999CACN52372%3A999949%2523%2523\')","type":"ZTJ_SFIN_HIERARCHY_02_SRV.ZTJ_G4_C_GLHIERResult"},"ID":"1.2.4.0.1.2.4.0:4.12.1.1.X.1.1_IEQCACNIEQ9999CACN52372:999949%23%23","TotaledProperties":"","ChartOfAccounts":"CACN","GLAccount":"","GLAccount_NodeID":"FinancialStatementItem:999949","GLAccount_NodeIDExt":"9999/49","GLAccount_NodeText":"Net income","GLAccount_ParentID":"FinancialStatementItem:99996","GLAccount_Level":2,"GLAccount_Drillstate":"collapsed","GLAccount_Nodecount":0,"GLAccount_T":"","Action":"","NodeType":"","counter":"1","counter_F":"1","Parameters":{"__deferred":{"uri":"https://ponyhost/sap/opu/odata/sap/ZTJ_SFIN_HIERARCHY_02_SRV/ZTJ_G4_C_GLHIERResults(\'1.2.4.0.1.2.4.0%3A4.12.1.1.X.1.1_IEQCACNIEQ9999CACN52372%3A999949%2523%2523\')/Parameters"}}},{"__metadata":{"id":"https://ponyhost/sap/opu/odata/sap/ZTJ_SFIN_HIERARCHY_02_SRV/ZTJ_G4_C_GLHIERResults(\'1.2.4.0.1.2.4.0%3A4.11.1.1.X.1.1_IEQCACNIEQ9999CACN52372%3A99997%2523%2523\')","uri":"https://ponyhost/sap/opu/odata/sap/ZTJ_SFIN_HIERARCHY_02_SRV/ZTJ_G4_C_GLHIERResults(\'1.2.4.0.1.2.4.0%3A4.11.1.1.X.1.1_IEQCACNIEQ9999CACN52372%3A99997%2523%2523\')","type":"ZTJ_SFIN_HIERARCHY_02_SRV.ZTJ_G4_C_GLHIERResult"},"ID":"1.2.4.0.1.2.4.0:4.11.1.1.X.1.1_IEQCACNIEQ9999CACN52372:99997%23%23","TotaledProperties":"","ChartOfAccounts":"CACN","GLAccount":"","GLAccount_NodeID":"FinancialStatementItem:99997","GLAccount_NodeIDExt":"9999/7","GLAccount_NodeText":"Not assigned accounts","GLAccount_ParentID":"","GLAccount_Level":1,"GLAccount_Drillstate":"expanded","GLAccount_Nodecount":0,"GLAccount_T":"","Action":"","NodeType":"","counter":"1","counter_F":"1","Parameters":{"__deferred":{"uri":"https://ponyhost/sap/opu/odata/sap/ZTJ_SFIN_HIERARCHY_02_SRV/ZTJ_G4_C_GLHIERResults(\'1.2.4.0.1.2.4.0%3A4.11.1.1.X.1.1_IEQCACNIEQ9999CACN52372%3A99997%2523%2523\')/Parameters"}}},{"__metadata":{"id":"https://ponyhost/sap/opu/odata/sap/ZTJ_SFIN_HIERARCHY_02_SRV/ZTJ_G4_C_GLHIERResults(\'1.2.4.0.1.2.4.0%3A4.16.1.1.X.1.1_IEQCACNIEQ9999CACN%3ACACNY0000000000%2523%2523\')","uri":"https://ponyhost/sap/opu/odata/sap/ZTJ_SFIN_HIERARCHY_02_SRV/ZTJ_G4_C_GLHIERResults(\'1.2.4.0.1.2.4.0%3A4.16.1.1.X.1.1_IEQCACNIEQ9999CACN%3ACACNY0000000000%2523%2523\')","type":"ZTJ_SFIN_HIERARCHY_02_SRV.ZTJ_G4_C_GLHIERResult"},"ID":"1.2.4.0.1.2.4.0:4.16.1.1.X.1.1_IEQCACNIEQ9999CACN:CACNY0000000000%23%23","TotaledProperties":"","ChartOfAccounts":"CACN","GLAccount":"0","GLAccount_NodeID":":CACNY0000000000","GLAccount_NodeIDExt":"Y/0","GLAccount_NodeText":"CACN/Y/0","GLAccount_ParentID":"FinancialStatementItem:99997","GLAccount_Level":2,"GLAccount_Drillstate":"leaf","GLAccount_Nodecount":0,"GLAccount_T":"CACN/Y/0","Action":"","NodeType":"","counter":"1","counter_F":"1","Parameters":{"__deferred":{"uri":"https://ponyhost/sap/opu/odata/sap/ZTJ_SFIN_HIERARCHY_02_SRV/ZTJ_G4_C_GLHIERResults(\'1.2.4.0.1.2.4.0%3A4.16.1.1.X.1.1_IEQCACNIEQ9999CACN%3ACACNY0000000000%2523%2523\')/Parameters"}}},{"__metadata":{"id":"https://ponyhost/sap/opu/odata/sap/ZTJ_SFIN_HIERARCHY_02_SRV/ZTJ_G4_C_GLHIERResults(\'1.2.4.0.1.2.4.0%3A4.11.1.1.X.1.1_IEQCACNIEQ9999CACN52372%3A99998%2523%2523\')","uri":"https://ponyhost/sap/opu/odata/sap/ZTJ_SFIN_HIERARCHY_02_SRV/ZTJ_G4_C_GLHIERResults(\'1.2.4.0.1.2.4.0%3A4.11.1.1.X.1.1_IEQCACNIEQ9999CACN52372%3A99998%2523%2523\')","type":"ZTJ_SFIN_HIERARCHY_02_SRV.ZTJ_G4_C_GLHIERResult"},"ID":"1.2.4.0.1.2.4.0:4.11.1.1.X.1.1_IEQCACNIEQ9999CACN52372:99998%23%23","TotaledProperties":"","ChartOfAccounts":"CACN","GLAccount":"","GLAccount_NodeID":"FinancialStatementItem:99998","GLAccount_NodeIDExt":"9999/8","GLAccount_NodeText":"Financial St. Notes","GLAccount_ParentID":"","GLAccount_Level":1,"GLAccount_Drillstate":"expanded","GLAccount_Nodecount":0,"GLAccount_T":"","Action":"","NodeType":"","counter":"1","counter_F":"1","Parameters":{"__deferred":{"uri":"https://ponyhost/sap/opu/odata/sap/ZTJ_SFIN_HIERARCHY_02_SRV/ZTJ_G4_C_GLHIERResults(\'1.2.4.0.1.2.4.0%3A4.11.1.1.X.1.1_IEQCACNIEQ9999CACN52372%3A99998%2523%2523\')/Parameters"}}},{"__metadata":{"id":"https://ponyhost/sap/opu/odata/sap/ZTJ_SFIN_HIERARCHY_02_SRV/ZTJ_G4_C_GLHIERResults(\'1.2.4.0.1.2.4.0%3A4.16.1.1.X.1.1_IEQCACNIEQ9999CACN%3ACACNY0000000000%2523%2523\')","uri":"https://ponyhost/sap/opu/odata/sap/ZTJ_SFIN_HIERARCHY_02_SRV/ZTJ_G4_C_GLHIERResults(\'1.2.4.0.1.2.4.0%3A4.16.1.1.X.1.1_IEQCACNIEQ9999CACN%3ACACNY0000000000%2523%2523\')","type":"ZTJ_SFIN_HIERARCHY_02_SRV.ZTJ_G4_C_GLHIERResult"},"ID":"1.2.4.0.1.2.4.0:4.16.1.1.X.1.1_IEQCACNIEQ9999CACN:CACNY0000000000%23%23","TotaledProperties":"","ChartOfAccounts":"CACN","GLAccount":"0","GLAccount_NodeID":":CACNY0000000000","GLAccount_NodeIDExt":"Y/0","GLAccount_NodeText":"CACN/Y/0","GLAccount_ParentID":"FinancialStatementItem:99998","GLAccount_Level":2,"GLAccount_Drillstate":"leaf","GLAccount_Nodecount":0,"GLAccount_T":"CACN/Y/0","Action":"","NodeType":"","counter":"0","counter_F":"","Parameters":{"__deferred":{"uri":"https://ponyhost/sap/opu/odata/sap/ZTJ_SFIN_HIERARCHY_02_SRV/ZTJ_G4_C_GLHIERResults(\'1.2.4.0.1.2.4.0%3A4.16.1.1.X.1.1_IEQCACNIEQ9999CACN%3ACACNY0000000000%2523%2523\')/Parameters"}}}]}}';

	var sResultsL1Top29 = sResultsL1Top120;

	var oServiceStatusConfig = {};
	return {
		setup: setup,
		teardown: teardown,
		// oConfig.batch: 500 all batch request fails with status code 500 after this call
		// oConfig.url: object with status codes as keys
		// oConfig.url = {
		//	500: [] // all sub requests which matches one of the url pattern in the array fails with 500
		//}

		setServiceStatus: function(oConfig) {
			oServiceStatusConfig = oConfig;
		},
		resetServiceStatus: function() {
			oServiceStatusConfig = {};
		}
	}
});
