/*!
 * ${copyright}
 */
// Responses for a $batch request, requesting data for CONTRACTPERFResults entity set
sap.ui.define([
	"sap/ui/core/qunit/analytics/o4aFakeService"
], function (o4aFakeService) {
	"use strict";
	/**
	 * Requesting grand total and first level for CostOvrWithhold_F and SalesDocument (grouped),
	 * result has a multi-unit case.
	 */
	o4aFakeService.addResponse({
		batch : true,
		uri : [
			"GET CONTRACTPERFResults?$select=CostOvrWithhold_F,TransactionCurrency,"
				+ "CostInGlobalCurrency_F,GlobalCurrency&$top=100&$inlinecount=allpages",
			"GET CONTRACTPERFResults?$select=SalesDocument,CostOvrWithhold_F,TransactionCurrency,"
				+ "CostInGlobalCurrency_F,GlobalCurrency&$orderby=SalesDocument%20asc&$top=20"
				+ "&$inlinecount=allpages"
		],
		header : o4aFakeService.headers.BATCH,
		content : '\
--AAD136757C5CF75E21C04F59B8682CEA0\r\n\
Content-Type: application/http\r\n\
Content-Length: 364\r\n\
content-transfer-encoding: binary\r\n\
\r\n\
HTTP/1.1 200 OK\r\n\
Content-Type: application/json\r\n\
content-language: en-US\r\n\
Content-Length: 494\r\n\
\r\n\
{"d":{"results":[{"__metadata": {"uri":"http://o4aFakeService:8080/CONTRACTPERFResults(\'0\')",\
"type":"servicemock.CONTRACTPERFType"},"TransactionCurrency":"USD","CostOvrWithhold_F":"1.00 USD",\
"CostInGlobalCurrency_F":"1.00","GlobalCurrency":"USD"},{"__metadata": {"uri":\
"http://o4aFakeService:8080/CONTRACTPERFResults(\'1\')","type":"servicemock.CONTRACTPERFType"},\
"TransactionCurrency":"EUR","CostOvrWithhold_F":"1.00 EUR","CostInGlobalCurrency_F":"1.00",\
"GlobalCurrency":"USD"}],"__count":"2"}}\r\n\
--AAD136757C5CF75E21C04F59B8682CEA0\r\n\
Content-Type: application/http\r\n\
Content-Length: 2442\r\n\
content-transfer-encoding: binary\r\n\
\r\n\
HTTP/1.1 200 OK\r\n\
Content-Type: application/json\r\n\
content-language: en-US\r\n\
Content-Length: 539\r\n\
\r\n\
{"d":{"results":[{"__metadata": {"uri":"http://o4aFakeService:8080/CONTRACTPERFResults(\'D1\')",\
"type":"servicemock.CONTRACTPERFType"},"SalesDocument":"D1","TransactionCurrency":"USD",\
"CostOvrWithhold_F":"1.00 USD","CostInGlobalCurrency_F":"1.00","GlobalCurrency":"USD"},{\
"__metadata": {"uri":\"http://o4aFakeService:8080/CONTRACTPERFResults(\'D2\')","type":\
"servicemock.CONTRACTPERFType"},"SalesDocument":"D2","TransactionCurrency":"EUR",\
"CostOvrWithhold_F":"1.00 EUR","CostInGlobalCurrency_F":"1.00","GlobalCurrency":"USD"}],\
"__count":"2"}}\
\r\n\
--AAD136757C5CF75E21C04F59B8682CEA0--\r\n'
	});

	/**
	 * Resolving the multi-unit case for GlobalCurrency.
	 */
	o4aFakeService.addResponse({
		batch : true,
		uri : ["CONTRACTPERFResults?$select=CostInGlobalCurrency_F,GlobalCurrency"],
		header : o4aFakeService.headers.BATCH,
		content : '\
--AAD136757C5CF75E21C04F59B8682CEA0\r\n\
Content-Type: application/http\r\n\
Content-Length: 364\r\n\
content-transfer-encoding: binary\r\n\
\r\n\
HTTP/1.1 200 OK\r\n\
Content-Type: application/json\r\n\
content-language: en-US\r\n\
Content-Length: 192\r\n\
\r\n\
{"d":{"results":[{"__metadata": {"uri":"http://o4aFakeService:8080/CONTRACTPERFResults(\'00\')",\
"type":"servicemock.CONTRACTPERFType"},"CostInGlobalCurrency_F":"2.00","GlobalCurrency":"USD"}]\
}}\r\n\
--AAD136757C5CF75E21C04F59B8682CEA0--\r\n'
	});

	/**
	 * Requesting grand total, number of leaves, and first and second level for CostOvrWithhold_F
	 * and SalesDocument and  SalesOrganization (both grouped)
	 */
	o4aFakeService.addResponse({
		batch : true,
		uri : [
			"GET CONTRACTPERFResults?$select=CostOvrWithhold_F,TransactionCurrency"
				+ "&$inlinecount=allpages",
			"GET CONTRACTPERFResults?$select=SalesDocument,SalesOrganization&$top=0"
				+ "&$inlinecount=allpages",
			"GET CONTRACTPERFResults?$select=SalesDocument,CostOvrWithhold_F,TransactionCurrency"
				+ "&$orderby=SalesDocument%20asc",
			"GET CONTRACTPERFResults?$select=SalesDocument,SalesOrganization,CostOvrWithhold_F,"
				+ "TransactionCurrency&$orderby=SalesDocument%20asc,SalesOrganization%20asc"
		],
		header : o4aFakeService.headers.BATCH,
		content : '\
--AAD136757C5CF75E21C04F59B8682CEA0\r\n\
Content-Type: application/http\r\n\
Content-Length: 364\r\n\
content-transfer-encoding: binary\r\n\
\r\n\
HTTP/1.1 200 OK\r\n\
Content-Type: application/json\r\n\
content-language: en-US\r\n\
Content-Length: 1015\r\n\
\r\n\
{"d":{"results":[{"__metadata": {"uri":"http://o4aFakeService:8080/CONTRACTPERFResults(\'0\')",\
"type":"servicemock.CONTRACTPERFType"},"TransactionCurrency":"USD","CostOvrWithhold_F":"1.00 USD"}]\
,"__count":"1"}}\r\n\
--AAD136757C5CF75E21C04F59B8682CEA0\r\n\
Content-Type: application/http\r\n\
Content-Length: 404\r\n\
content-transfer-encoding: binary\r\n\
\r\n\
HTTP/1.1 200 OK\r\n\
Content-Type: application/json\r\n\
content-language: en-US\r\n\
Content-Length: 35\r\n\
\r\n\
{"d":{"results":[],"__count":"1"}}\r\n\
--AAD136757C5CF75E21C04F59B8682CEA0\r\n\
Content-Type: application/http\r\n\
Content-Length: 2442\r\n\
content-transfer-encoding: binary\r\n\
\r\n\
HTTP/1.1 200 OK\r\n\
Content-Type: application/json\r\n\
content-language: en-US\r\n\
Content-Length: 1251\r\n\
\r\n\
{"d":{"results":[{"__metadata": {"uri":"http://o4aFakeService:8080/CONTRACTPERFResults(\'0_D1\')",\
"type":"servicemock.CONTRACTPERFType"},"SalesDocument":"D1","TransactionCurrency":"USD",\
"CostOvrWithhold_F":"1.00 USD"}],"__count":"1"}}\r\n\
--AAD136757C5CF75E21C04F59B8682CEA0\r\n\
Content-Type: application/http\r\n\
Content-Length: 2442\r\n\
content-transfer-encoding: binary\r\n\
\r\n\
HTTP/1.1 200 OK\r\n\
Content-Type: application/json\r\n\
content-language: en-US\r\n\
Content-Length: 1513\r\n\
\r\n\
{"d":{"results":[{"__metadata": {"uri":"http://o4aFakeService:8080/CONTRACTPERFResults(\'0_D1\')",\
"type":"servicemock.CONTRACTPERFType"},"SalesDocument":"D1","SalesOrganization":"FOO",\
"TransactionCurrency":"USD","CostOvrWithhold_F":"1.00 USD"}],"__count":"1"}}\r\n\
--AAD136757C5CF75E21C04F59B8682CEA0--\r\n'
	});
});