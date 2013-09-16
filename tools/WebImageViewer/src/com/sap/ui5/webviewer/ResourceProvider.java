package com.sap.ui5.webviewer;

import java.util.Arrays;
import java.util.HashMap;
import java.util.Map;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpSession;

import com.sap.ui5.webviewer.constants.Constants;
import com.sap.ui5.webviewer.resource.Resource;
import com.sap.ui5.webviewer.utils.ConfigUtil;
import com.sap.ui5.webviewer.utils.HttpServletRequestUtils;
import com.sap.ui5.webviewer.utils.SpringContextUtils;

public class ResourceProvider {

	private static final String DEFAULT_RESOUREC_NAME = "local";

	private static final String COLON = ":";

	public static Resource getResource() {
		HttpServletRequest request = HttpServletRequestUtils.getRequest();
		HttpSession session = request.getSession();
		Object obj = request.getAttribute(Constants.IMAGE_STORE_PATH);
		Resource resource = null;
		if (obj != null) {
			String imageStorePath = (String) obj;
			Map<String, String> pathResult = analysisImageStorePath(imageStorePath);
			String protocol = pathResult.get(Constants.PROTOCOL);
			String path = pathResult.get(Constants.IMAGE_STORE_PATH);
			resource = (Resource) session.getAttribute(Constants.RESOURCE);
			if (resource == null) {
				resource = SpringContextUtils.getBean(protocol);
				session.setAttribute(Constants.RESOURCE, resource);
			}
			resource.setResourceUrl(path);
		}
		return resource;
	}

	private static Map<String, String> analysisImageStorePath(String imageStorePath) {
		Map<String, String> pathInfo = new HashMap<String, String>();
		String protocol = getProtocolBy(imageStorePath);
		pathInfo.put(Constants.PROTOCOL, protocol);
		boolean isContainsColon = imageStorePath.contains(COLON);
		boolean isShareProtocol = imageStorePath.startsWith("\\") || imageStorePath.startsWith("//");
		String path = HttpServletRequestUtils.getRealPath() + "/" + Constants.TOKEN_CONFIG_PATH;
		if (!isContainsColon && !isShareProtocol) {
			String tokeName = imageStorePath;
			imageStorePath = ConfigUtil.getImageStorePathBy(tokeName, path);
			if (imageStorePath == null || "".equals(imageStorePath)) {
				throw new IllegalArgumentException(Constants.INVALID_TOKEN_NAME);
			}
		}
		pathInfo.put(Constants.IMAGE_STORE_PATH, imageStorePath);
		return pathInfo;
	}

	private static String getProtocolBy(String path) {
		String[] paths = path.split(COLON);
		if (paths.length > 0) {
			String protocol = paths[0];
			if (verifyIsSupportProtocol(protocol)) {
				return protocol;
			} else {
				return DEFAULT_RESOUREC_NAME;
			}
		}
		return DEFAULT_RESOUREC_NAME;
	}

	private static boolean verifyIsSupportProtocol(String protocol) {
		String protocols = System.getProperty(Constants.SUPPORTED_PROCOTOL);
		String[] protocolArray = protocols.split(",");
		return Arrays.asList(protocolArray).contains(protocol);
	}

}
