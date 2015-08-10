/**
 * Responses for a Batch Request during the TBA Filter Test
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
			"ActualPlannedCosts(P_ControllingArea=\'US01\',P_CostCenter=\'100-1000\',P_CostCenterTo=\'999-9999\')/Results?$select=ActualCosts,Currency&$filter=(substringof(%27100-%27,CostCenter))&$top=100&$inlinecount=allpages",
			"ActualPlannedCosts(P_ControllingArea=\'US01\',P_CostCenter=\'100-1000\',P_CostCenterTo=\'999-9999\')/Results?$select=CostCenter,ActualCosts,Currency&$filter=(substringof(%27100-%27,CostCenter))&$orderby=CostCenter%20asc&$top=120&$inlinecount=allpages",
			"ActualPlannedCosts(P_ControllingArea=\'US01\',P_CostCenter=\'100-1000\',P_CostCenterTo=\'999-9999\')/Results?$select=CostCenter,CostElement,Currency&$filter=(substringof(%27100-%27,CostCenter))&$top=0&$inlinecount=allpages"
		],
	header: o4aFakeService.headers.BATCH,
	content: "--AAD136757C5CF75E21C04F59B8682CEA0\r\n" +
			"Content-Type: application/http\r\n" +
			"Content-Length: 363\r\n" +
			"content-transfer-encoding: binary\r\n" +
			"\r\n" +
			"HTTP/1.1 200 OK\r\n" +
			"Content-Type: application/json\r\n" +
			"content-language: en-US\r\n" +
			"Content-Length: 266\r\n" +
			"\r\n" +
			"{\"d\":{\"results\":[{\"__metadata\": {\"uri\":\"http://o4aFakeService:8080/ActualPlannedCostsResults(\'28726457163304181\')\",\"type\":\"fake.ActualPlannedCostsResultsType\"},\"Currency\":\"USD\",\"ActualCosts\":\"2986824\"}],\"__count\":\"1\"}}\r\n" +
			"--AAD136757C5CF75E21C04F59B8682CEA0\r\n" +
			"Content-Type: application/http\r\n" +
			"Content-Length: 644\r\n" +
			"content-transfer-encoding: binary\r\n" +
			"\r\n" +
			"HTTP/1.1 200 OK\r\n" +
			"Content-Type: application/json\r\n" +
			"content-language: en-US\r\n" +
			"Content-Length: 547\r\n" +
			"\r\n" +
			"{\"d\":{\"results\":[{\"__metadata\": {\"uri\":\"http://o4aFakeService:8080/ActualPlannedCostsResults(\'28726458651143381\')\",\"type\":\"fake.ActualPlannedCostsResultsType\"},\"CostCenter\":\"100-1000\",\"Currency\":\"USD\",\"ActualCosts\":\"1588416\"},{\"__metadata\": {\"uri\":\"http://o4aFakeService:8080/ActualPlannedCostsResults(\'28726458651143382\')\",\"type\":\"fake.ActualPlannedCostsResultsType\"},\"CostCenter\":\"100-1100\",\"Currency\":\"USD\",\"ActualCosts\":\"1398408\"}],\"__count\":\"2\"}}\r\n" +
			"--AAD136757C5CF75E21C04F59B8682CEA0\r\n" +
			"Content-Type: application/http\r\n" +
			"Content-Length: 387\r\n" +
			"content-transfer-encoding: binary\r\n" +
			"\r\n" +
			"HTTP/1.1 200 OK\r\n" +
			"Content-Type: application/json\r\n" +
			"content-language: en-US\r\n" +
			"Content-Length: 290\r\n" +
			"\r\n" +
			"{\"d\":{\"results\":[{\"__metadata\": {\"uri\":\"http://o4aFakeService:8080/ActualPlannedCostsResults(\'28726460038923281\')\",\"type\":\"fake.ActualPlannedCostsResultsType\"},\"CostCenter\":\"100-1000\",\"CostElement\":\"400020\",\"Currency\":\"USD\"}],\"__count\":\"24\"}}\r\n" + 
			"--AAD136757C5CF75E21C04F59B8682CEA0--\r\n" +
			""
});
