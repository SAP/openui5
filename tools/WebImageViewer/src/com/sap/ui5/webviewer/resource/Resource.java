package com.sap.ui5.webviewer.resource;

import java.io.InputStream;
import java.util.List;
import java.util.Map;

public interface Resource {

	String getPlatformByCurrentPath(String path);

	String getBrowserByCurrentPath(String path);

	String getThemeByCurrentPath(String path);

	String getRtlByCurrentPath(String path);

	String getCategoryByCurrentPath(String path);

	String getModuleNameByCurrentPath(String path);

	String getControlNameByCurrentPath(String path);

	String getJobNameByCurrentPath(String path);

	String getDiffImage(String expectedImageName);

	String getResourcePathSeparator();

	int getImageFolderDepthFromPlatform();

	int getSubFileSizeBy(String parentPath);

	List<String> findAllControlsPath();

	List<String> findControlsPathFromRtlPath(String path);

	List<Map<String, Object>> findFailedImageInfoByPath(String path);

	boolean deleteFiles(String... files);

	boolean copyFile(String sourceFilePath, String destFilePath);

	boolean uploadFile(InputStream in, String fileName, String destPath);

	String[] getAllSubFolders(String path);

	List<Map<String, Object>> findImagesInfoByPath(String path);

	List<String> findAllTestConditions();

	List<String> findAllControlsFrom(String modulePath);

	void setResourceUrl(String resourceUrl);

}
