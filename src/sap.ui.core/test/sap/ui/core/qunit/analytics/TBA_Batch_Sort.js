/**
 * Responses for a Batch Request during the TBA Sort Test
 */
o4aFakeService.addResponse({
	batch: true,
	uri: [
			"ActualPlannedCosts(P_ControllingArea=\'US01\',P_CostCenter=\'100-1000\',P_CostCenterTo=\'999-9999\')/Results?$select=ActualCosts,Currency&$top=100&$inlinecount=allpages",
			"ActualPlannedCosts(P_ControllingArea=\'US01\',P_CostCenter=\'100-1000\',P_CostCenterTo=\'999-9999\')/Results?$select=CostCenter,ActualCosts,Currency&$orderby=CostCenter%20asc&$top=120&$inlinecount=allpages",
			"ActualPlannedCosts(P_ControllingArea=\'US01\',P_CostCenter=\'100-1000\',P_CostCenterTo=\'999-9999\')/Results?$select=CostCenter,CostElement,Currency&$top=0&$inlinecount=allpages"
		],
	header: o4aFakeService.headers.BATCH,
	content: "--AAD136757C5CF75E21C04F59B8682CEA0\r\n" +
			"Content-Type: application/http\r\n" +
			"Content-Length: 364\r\n" +
			"content-transfer-encoding: binary\r\n" +
			"\r\n" +
			"HTTP/1.1 200 OK\r\n" +
			"Content-Type: application/json\r\n" +
			"content-language: en-US\r\n" +
			"Content-Length: 267\r\n" +
			"\r\n" +
			"{\"d\":{\"results\":[{\"__metadata\": {\"uri\":\"http://o4aFakeService:8080/ActualPlannedCostsResults(\'28726452095178281\')\",\"type\":\"fake.ActualPlannedCostsResultsType\"},\"Currency\":\"USD\",\"ActualCosts\":\"11775332\"}],\"__count\":\"1\"}}\r\n" +
			"--AAD136757C5CF75E21C04F59B8682CEA0\r\n" +
			"Content-Type: application/http\r\n" +
			"Content-Length: 2442\r\n" +
			"content-transfer-encoding: binary\r\n" +
			"\r\n" +
			"HTTP/1.1 200 OK\r\n" +
			"Content-Type: application/json\r\n" +
			"content-language: en-US\r\n" +
			"Content-Length: 2344\r\n" +
			"\r\n" +
			"{\"d\":{\"results\":[{\"__metadata\": {\"uri\":\"http://o4aFakeService:8080/ActualPlannedCostsResults(\'28726453557047001\')\",\"type\":\"fake.ActualPlannedCostsResultsType\"},\"CostCenter\":\"100-1000\",\"Currency\":\"USD\",\"ActualCosts\":\"1588416\"},{\"__metadata\": {\"uri\":\"http://o4aFakeService:8080/ActualPlannedCostsResults(\'28726453557047002\')\",\"type\":\"fake.ActualPlannedCostsResultsType\"},\"CostCenter\":\"100-1100\",\"Currency\":\"USD\",\"ActualCosts\":\"1398408\"},{\"__metadata\": {\"uri\":\"http://o4aFakeService:8080/ActualPlannedCostsResults(\'28726453557047003\')\",\"type\":\"fake.ActualPlannedCostsResultsType\"},\"CostCenter\":\"200-1000\",\"Currency\":\"USD\",\"ActualCosts\":\"1547326\"},{\"__metadata\": {\"uri\":\"http://o4aFakeService:8080/ActualPlannedCostsResults(\'28726453557047004\')\",\"type\":\"fake.ActualPlannedCostsResultsType\"},\"CostCenter\":\"200-2000\",\"Currency\":\"USD\",\"ActualCosts\":\"1542211\"},{\"__metadata\": {\"uri\":\"http://o4aFakeService:8080/ActualPlannedCostsResults(\'28726453557047005\')\",\"type\":\"fake.ActualPlannedCostsResultsType\"},\"CostCenter\":\"200-3000\",\"Currency\":\"USD\",\"ActualCosts\":\"1690110\"},{\"__metadata\": {\"uri\":\"http://o4aFakeService:8080/ActualPlannedCostsResults(\'28726453557047006\')\",\"type\":\"fake.ActualPlannedCostsResultsType\"},\"CostCenter\":\"200-4000\",\"Currency\":\"USD\",\"ActualCosts\":\"1190663\"},{\"__metadata\": {\"uri\":\"http://o4aFakeService:8080/ActualPlannedCostsResults(\'28726453557047007\')\",\"type\":\"fake.ActualPlannedCostsResultsType\"},\"CostCenter\":\"200-5000\",\"Currency\":\"USD\",\"ActualCosts\":\"1403813\"},{\"__metadata\": {\"uri\":\"http://o4aFakeService:8080/ActualPlannedCostsResults(\'28726453557047008\')\",\"type\":\"fake.ActualPlannedCostsResultsType\"},\"CostCenter\":\"300-1000\",\"Currency\":\"USD\",\"ActualCosts\":\"661910\"},{\"__metadata\": {\"uri\":\"http://o4aFakeService:8080/ActualPlannedCostsResults(\'28726453557047009\')\",\"type\":\"fake.ActualPlannedCostsResultsType\"},\"CostCenter\":\"300-2000\",\"Currency\":\"USD\",\"ActualCosts\":\"752475\"}],\"__count\":\"9\"}}\r\n" +
			"--AAD136757C5CF75E21C04F59B8682CEA0\r\n" +
			"Content-Type: application/http\r\n" +
			"Content-Length: 388\r\n" +
			"content-transfer-encoding: binary\r\n" +
			"\r\n" +
			"HTTP/1.1 200 OK\r\n" +
			"Content-Type: application/json\r\n" +
			"content-language: en-US\r\n" +
			"Content-Length: 291\r\n" +
			"\r\n" +
			"{\"d\":{\"results\":[{\"__metadata\": {\"uri\":\"http://o4aFakeService:8080/ActualPlannedCostsResults(\'28726455062370421\')\",\"type\":\"fake.ActualPlannedCostsResultsType\"},\"CostCenter\":\"100-1000\",\"CostElement\":\"400020\",\"Currency\":\"USD\"}],\"__count\":\"106\"}}\r\n" +
			"--AAD136757C5CF75E21C04F59B8682CEA0--\r\n" +
			""
});

o4aFakeService.addResponse({
	batch: true,
	uri: [
			"ActualPlannedCosts(P_ControllingArea=\'US01\',P_CostCenter=\'100-1000\',P_CostCenterTo=\'999-9999\')/Results?$select=ActualCosts,Currency&$top=100&$inlinecount=allpages",
			"ActualPlannedCosts(P_ControllingArea=\'US01\',P_CostCenter=\'100-1000\',P_CostCenterTo=\'999-9999\')/Results?$select=CostCenter,ActualCosts,Currency&$orderby=CostCenter%20desc&$top=120&$inlinecount=allpages",
			"ActualPlannedCosts(P_ControllingArea=\'US01\',P_CostCenter=\'100-1000\',P_CostCenterTo=\'999-9999\')/Results?$select=CostCenter,CostElement,ActualCosts,Currency&$filter=(CostCenter%20eq%20%27100-1000%27)&$orderby=CostCenter%20desc,CostElement%20asc&$top=120&$inlinecount=allpages"
		],
	header: o4aFakeService.headers.BATCH,
	content: "--AAD136757C5CF75E21C04F59B8682CEA0\r\n" +
			"Content-Type: application/http\r\n" +
			"Content-Length: 364\r\n" +
			"content-transfer-encoding: binary\r\n" +
			"\r\n" +
			"HTTP/1.1 200 OK\r\n" +
			"Content-Type: application/json\r\n" +
			"content-language: en-US\r\n" +
			"Content-Length: 267\r\n" +
			"\r\n" +
			"{\"d\":{\"results\":[{\"__metadata\": {\"uri\":\"http://o4aFakeService:8080/ActualPlannedCostsResults(\'28737103269828981\')\",\"type\":\"fake.ActualPlannedCostsResultsType\"},\"Currency\":\"USD\",\"ActualCosts\":\"11775332\"}],\"__count\":\"1\"}}\r\n" +
			"--AAD136757C5CF75E21C04F59B8682CEA0\r\n" +
			"Content-Type: application/http\r\n" +
			"Content-Length: 2442\r\n" +
			"content-transfer-encoding: binary\r\n" +
			"\r\n" +
			"HTTP/1.1 200 OK\r\n" +
			"Content-Type: application/json\r\n" +
			"content-language: en-US\r\n" +
			"Content-Length: 2344\r\n" +
			"\r\n" +
			"{\"d\":{\"results\":[{\"__metadata\": {\"uri\":\"http://o4aFakeService:8080/ActualPlannedCostsResults(\'28737104687421651\')\",\"type\":\"fake.ActualPlannedCostsResultsType\"},\"CostCenter\":\"300-2000\",\"Currency\":\"USD\",\"ActualCosts\":\"752475\"},{\"__metadata\": {\"uri\":\"http://o4aFakeService:8080/ActualPlannedCostsResults(\'28737104687421652\')\",\"type\":\"fake.ActualPlannedCostsResultsType\"},\"CostCenter\":\"300-1000\",\"Currency\":\"USD\",\"ActualCosts\":\"661910\"},{\"__metadata\": {\"uri\":\"http://o4aFakeService:8080/ActualPlannedCostsResults(\'28737104687421653\')\",\"type\":\"fake.ActualPlannedCostsResultsType\"},\"CostCenter\":\"200-5000\",\"Currency\":\"USD\",\"ActualCosts\":\"1403813\"},{\"__metadata\": {\"uri\":\"http://o4aFakeService:8080/ActualPlannedCostsResults(\'28737104687421654\')\",\"type\":\"fake.ActualPlannedCostsResultsType\"},\"CostCenter\":\"200-4000\",\"Currency\":\"USD\",\"ActualCosts\":\"1190663\"},{\"__metadata\": {\"uri\":\"http://o4aFakeService:8080/ActualPlannedCostsResults(\'28737104687421655\')\",\"type\":\"fake.ActualPlannedCostsResultsType\"},\"CostCenter\":\"200-3000\",\"Currency\":\"USD\",\"ActualCosts\":\"1690110\"},{\"__metadata\": {\"uri\":\"http://o4aFakeService:8080/ActualPlannedCostsResults(\'28737104687421656\')\",\"type\":\"fake.ActualPlannedCostsResultsType\"},\"CostCenter\":\"200-2000\",\"Currency\":\"USD\",\"ActualCosts\":\"1542211\"},{\"__metadata\": {\"uri\":\"http://o4aFakeService:8080/ActualPlannedCostsResults(\'28737104687421657\')\",\"type\":\"fake.ActualPlannedCostsResultsType\"},\"CostCenter\":\"200-1000\",\"Currency\":\"USD\",\"ActualCosts\":\"1547326\"},{\"__metadata\": {\"uri\":\"http://o4aFakeService:8080/ActualPlannedCostsResults(\'28737104687421658\')\",\"type\":\"fake.ActualPlannedCostsResultsType\"},\"CostCenter\":\"100-1100\",\"Currency\":\"USD\",\"ActualCosts\":\"1398408\"},{\"__metadata\": {\"uri\":\"http://o4aFakeService:8080/ActualPlannedCostsResults(\'28737104687421659\')\",\"type\":\"fake.ActualPlannedCostsResultsType\"},\"CostCenter\":\"100-1000\",\"Currency\":\"USD\",\"ActualCosts\":\"1588416\"}],\"__count\":\"9\"}}\r\n" +
			"--AAD136757C5CF75E21C04F59B8682CEA0\r\n" +
			"Content-Type: application/http\r\n" +
			"Content-Length: 3473\r\n" +
			"content-transfer-encoding: binary\r\n" +
			"\r\n" +
			"HTTP/1.1 200 OK\r\n" +
			"Content-Type: application/json\r\n" +
			"content-language: en-US\r\n" +
			"Content-Length: 3375\r\n" +
			"\r\n" +
			"{\"d\":{\"results\":[{\"__metadata\": {\"uri\":\"http://o4aFakeService:8080/ActualPlannedCostsResults(\'28737105997940001\')\",\"type\":\"fake.ActualPlannedCostsResultsType\"},\"CostCenter\":\"100-1000\",\"CostElement\":\"400020\",\"Currency\":\"USD\",\"ActualCosts\":\"131254\"},{\"__metadata\": {\"uri\":\"http://o4aFakeService:8080/ActualPlannedCostsResults(\'28737105997940002\')\",\"type\":\"fake.ActualPlannedCostsResultsType\"},\"CostCenter\":\"100-1000\",\"CostElement\":\"400021\",\"Currency\":\"USD\",\"ActualCosts\":\"132025\"},{\"__metadata\": {\"uri\":\"http://o4aFakeService:8080/ActualPlannedCostsResults(\'28737105997940003\')\",\"type\":\"fake.ActualPlannedCostsResultsType\"},\"CostCenter\":\"100-1000\",\"CostElement\":\"410050\",\"Currency\":\"USD\",\"ActualCosts\":\"44532\"},{\"__metadata\": {\"uri\":\"http://o4aFakeService:8080/ActualPlannedCostsResults(\'28737105997940004\')\",\"type\":\"fake.ActualPlannedCostsResultsType\"},\"CostCenter\":\"100-1000\",\"CostElement\":\"417900\",\"Currency\":\"USD\",\"ActualCosts\":\"12521\"},{\"__metadata\": {\"uri\":\"http://o4aFakeService:8080/ActualPlannedCostsResults(\'28737105997940005\')\",\"type\":\"fake.ActualPlannedCostsResultsType\"},\"CostCenter\":\"100-1000\",\"CostElement\":\"421000\",\"Currency\":\"USD\",\"ActualCosts\":\"4532\"},{\"__metadata\": {\"uri\":\"http://o4aFakeService:8080/ActualPlannedCostsResults(\'28737105997940006\')\",\"type\":\"fake.ActualPlannedCostsResultsType\"},\"CostCenter\":\"100-1000\",\"CostElement\":\"430100\",\"Currency\":\"USD\",\"ActualCosts\":\"675652\"},{\"__metadata\": {\"uri\":\"http://o4aFakeService:8080/ActualPlannedCostsResults(\'28737105997940007\')\",\"type\":\"fake.ActualPlannedCostsResultsType\"},\"CostCenter\":\"100-1000\",\"CostElement\":\"435000\",\"Currency\":\"USD\",\"ActualCosts\":\"131254\"},{\"__metadata\": {\"uri\":\"http://o4aFakeService:8080/ActualPlannedCostsResults(\'28737105997940008\')\",\"type\":\"fake.ActualPlannedCostsResultsType\"},\"CostCenter\":\"100-1000\",\"CostElement\":\"440001\",\"Currency\":\"USD\",\"ActualCosts\":\"352126\"},{\"__metadata\": {\"uri\":\"http://o4aFakeService:8080/ActualPlannedCostsResults(\'28737105997940009\')\",\"type\":\"fake.ActualPlannedCostsResultsType\"},\"CostCenter\":\"100-1000\",\"CostElement\":\"449000\",\"Currency\":\"USD\",\"ActualCosts\":\"76521\"},{\"__metadata\": {\"uri\":\"http://o4aFakeService:8080/ActualPlannedCostsResults(\'287371059979400010\')\",\"type\":\"fake.ActualPlannedCostsResultsType\"},\"CostCenter\":\"100-1000\",\"CostElement\":\"474240\",\"Currency\":\"USD\",\"ActualCosts\":\"9145\"},{\"__metadata\": {\"uri\":\"http://o4aFakeService:8080/ActualPlannedCostsResults(\'287371059979400011\')\",\"type\":\"fake.ActualPlannedCostsResultsType\"},\"CostCenter\":\"100-1000\",\"CostElement\":\"476900\",\"Currency\":\"USD\",\"ActualCosts\":\"7589\"},{\"__metadata\": {\"uri\":\"http://o4aFakeService:8080/ActualPlannedCostsResults(\'287371059979400012\')\",\"type\":\"fake.ActualPlannedCostsResultsType\"},\"CostCenter\":\"100-1000\",\"CostElement\":\"478000\",\"Currency\":\"USD\",\"ActualCosts\":\"11265\"}],\"__count\":\"12\"}}\r\n" +
			"--AAD136757C5CF75E21C04F59B8682CEA0--\r\n" +
			""
});

o4aFakeService.addResponse({
	uri: "ActualPlannedCosts(P_ControllingArea=\'US01\',P_CostCenter=\'100-1000\',P_CostCenterTo=\'999-9999\')/Results?$select=CostCenter,CostElement,ActualCosts,Currency&$filter=(CostCenter eq \'100-1000\')&$orderby=CostCenter asc,CostElement asc&$top=120&$inlinecount=allpages",
	header: o4aFakeService.headers.JSON,
	content: "{\"d\":{\"results\":[{\"__metadata\": {\"uri\":\"http://o4aFakeService:8080/ActualPlannedCostsResults(\'28741179513565761\')\",\"type\":\"fake.ActualPlannedCostsResultsType\"},\"CostCenter\":\"100-1000\",\"CostElement\":\"400020\",\"Currency\":\"USD\",\"ActualCosts\":\"131254\"},{\"__metadata\": {\"uri\":\"http://o4aFakeService:8080/ActualPlannedCostsResults(\'28741179513565762\')\",\"type\":\"fake.ActualPlannedCostsResultsType\"},\"CostCenter\":\"100-1000\",\"CostElement\":\"400021\",\"Currency\":\"USD\",\"ActualCosts\":\"132025\"},{\"__metadata\": {\"uri\":\"http://o4aFakeService:8080/ActualPlannedCostsResults(\'28741179513565763\')\",\"type\":\"fake.ActualPlannedCostsResultsType\"},\"CostCenter\":\"100-1000\",\"CostElement\":\"410050\",\"Currency\":\"USD\",\"ActualCosts\":\"44532\"},{\"__metadata\": {\"uri\":\"http://o4aFakeService:8080/ActualPlannedCostsResults(\'28741179513565764\')\",\"type\":\"fake.ActualPlannedCostsResultsType\"},\"CostCenter\":\"100-1000\",\"CostElement\":\"417900\",\"Currency\":\"USD\",\"ActualCosts\":\"12521\"},{\"__metadata\": {\"uri\":\"http://o4aFakeService:8080/ActualPlannedCostsResults(\'28741179513565765\')\",\"type\":\"fake.ActualPlannedCostsResultsType\"},\"CostCenter\":\"100-1000\",\"CostElement\":\"421000\",\"Currency\":\"USD\",\"ActualCosts\":\"4532\"},{\"__metadata\": {\"uri\":\"http://o4aFakeService:8080/ActualPlannedCostsResults(\'28741179513565766\')\",\"type\":\"fake.ActualPlannedCostsResultsType\"},\"CostCenter\":\"100-1000\",\"CostElement\":\"430100\",\"Currency\":\"USD\",\"ActualCosts\":\"675652\"},{\"__metadata\": {\"uri\":\"http://o4aFakeService:8080/ActualPlannedCostsResults(\'28741179513565767\')\",\"type\":\"fake.ActualPlannedCostsResultsType\"},\"CostCenter\":\"100-1000\",\"CostElement\":\"435000\",\"Currency\":\"USD\",\"ActualCosts\":\"131254\"},{\"__metadata\": {\"uri\":\"http://o4aFakeService:8080/ActualPlannedCostsResults(\'28741179513565768\')\",\"type\":\"fake.ActualPlannedCostsResultsType\"},\"CostCenter\":\"100-1000\",\"CostElement\":\"440001\",\"Currency\":\"USD\",\"ActualCosts\":\"352126\"},{\"__metadata\": {\"uri\":\"http://o4aFakeService:8080/ActualPlannedCostsResults(\'28741179513565769\')\",\"type\":\"fake.ActualPlannedCostsResultsType\"},\"CostCenter\":\"100-1000\",\"CostElement\":\"449000\",\"Currency\":\"USD\",\"ActualCosts\":\"76521\"},{\"__metadata\": {\"uri\":\"http://o4aFakeService:8080/ActualPlannedCostsResults(\'287411795135657610\')\",\"type\":\"fake.ActualPlannedCostsResultsType\"},\"CostCenter\":\"100-1000\",\"CostElement\":\"474240\",\"Currency\":\"USD\",\"ActualCosts\":\"9145\"},{\"__metadata\": {\"uri\":\"http://o4aFakeService:8080/ActualPlannedCostsResults(\'287411795135657611\')\",\"type\":\"fake.ActualPlannedCostsResultsType\"},\"CostCenter\":\"100-1000\",\"CostElement\":\"476900\",\"Currency\":\"USD\",\"ActualCosts\":\"7589\"},{\"__metadata\": {\"uri\":\"http://o4aFakeService:8080/ActualPlannedCostsResults(\'287411795135657612\')\",\"type\":\"fake.ActualPlannedCostsResultsType\"},\"CostCenter\":\"100-1000\",\"CostElement\":\"478000\",\"Currency\":\"USD\",\"ActualCosts\":\"11265\"}],\"__count\":\"12\"}}"
});
