package com.sap.resource.path;

public interface PathRule {
	
	String getPlatformByPath(String path);
	
	String getBrowserByPath(String path);
	
	String getThemeByPath(String path);
	
	String getRtlByPath(String path);
	
	String getCategoryByPath(String path);
	
	String getModuleNameByPath(String path);
	
	String getControlNameByPath(String path);
	
	String getJobNameByPath(String path);
	
	String getExceptedImageName(String diffImageName);
	
	String getDiffImageByExpectedImageName(String expectedImageName);
	
	int getImageFolderDepthFromPlatform();

}
