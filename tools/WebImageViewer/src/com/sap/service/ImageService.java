package com.sap.service;

import java.util.List;
import java.util.Map;

import org.springframework.web.multipart.MultipartFile;

import com.sap.model.Response;

public interface ImageService {
	
	//-------------------------------Job-----------------------------------------------
	Response countResultByJob();
	
	Response findFailedControllersByPath(String path);
	
	Response findFailedImages(String path);
	
	Response updateImages(String controlPath, String... imageNames);
	
	Response deleteFailedImages(String controlPath, String... imageNames);
	
	//-------------------------------Images---------------------------------------------
	
	Response deleteImages(String path, String... imageNames);
	
	Response uploadImages(List<MultipartFile> files, String destPath);
	
	Response findAllDirectories();
	
	Response findImagesInFolder(String folderPath);
	
	//---------------------------------Module--------------------------------------------
	
	Response countResultByMoudle();
	
	Response findFailedControlsByModule(String path);
	
	Response findFailedInfoByController(String module, String subModule, String control);
	
	
	//---------------------------------Config----------------------------------------------
	
	Response getAllTokenInformation();
	
	Response saveOrUpdateConfigInfo(Map<String, String> info);

}
