package com.sap.openui5;

import java.io.IOException;
import java.io.InputStream;
import java.io.OutputStream;
import java.net.HttpURLConnection;
import java.net.ProtocolException;
import java.net.URI;
import java.net.URL;
import java.util.Arrays;
import java.util.Enumeration;
import java.util.List;
import java.util.Map;

import javax.servlet.ServletConfig;
import javax.servlet.ServletException;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import org.apache.commons.io.IOUtils;


/**
 * The class <b><code>SimpleProxyServlet</code></b> can be used to proxy requests
 * to another server an retrieve the response. The target URL has to be passed
 * as part of the path info starting with the protocol in the first segment e.g.
 * <code>%proxy-servlet-url%/http/www.google.de/</code> proxies the request to
 * <code>http://www.google.de/</code>.
 * <p>
 * For the proxy request headers like "host" and "referer" will be blocked.
 * <p>
 * If a proxy is required please use the default Java system properties to
 * specify it like e.g.: <code>http.proxyHost</code>, <code>http.proxyPort</code>,
 * <code>http.nonProxyHosts</code>. For HTTPS just use <code>https</code> instead
 * of the <code>http</code> prefix for the system properties.
 * <p>
 * <i>This class must not be used in productive systems.</i>
 *
 * @author Peter Muessig
 */
public class SimpleProxyServlet extends HttpServlet {


  /** serial version UID */
  private static final long serialVersionUID = 6862677824819950587L;


  /** parameter for configuring the remote location */
  private static final String PARAM_REMOTE_LOCATION = "com.sap.ui5.proxy.REMOTE_LOCATION";


  /** headers which will be blocked from forwarding by request */
  private String[] BLOCKED_REQUEST_HEADERS = { "host", "referer" };


  /** base URI of the remote location */
  private String baseUri = null;

  /** query string of the remote location */
  private String baseUriQueryString = null;


  /* (non-Javadoc)
   * @see javax.servlet.GenericServlet#init(javax.servlet.ServletConfig)
   */
  public void init(ServletConfig servletConfig) throws ServletException {
    super.init(servletConfig);

    // read the base uri from the configuration and validate the uri
    try {
      // first we lookup a system property
      // if not found we check the servlet init parameters
      // if again not found we check the context init parameters
      this.baseUri = System.getProperty(PARAM_REMOTE_LOCATION, servletConfig.getInitParameter(PARAM_REMOTE_LOCATION));
      if (this.baseUri == null) {
          this.baseUri = servletConfig.getServletContext().getInitParameter(PARAM_REMOTE_LOCATION);
      }
      if (this.baseUri != null) {
        // validate the URI
        URI uri = URI.create(this.baseUri);
        // extract the query string and remove it from base URI
        if (uri.getQuery() != null) {
          this.baseUriQueryString = uri.getQuery();
          this.baseUri = this.baseUri.substring(0, this.baseUri.indexOf("?"));
        }
      }
    } catch (IllegalArgumentException ex) {
      this.log("URI in context parameter com.sap.ui5.proxy.REMOTE_LOCATION is not valid!", ex);
      this.baseUri = null;
    }

  } // method: init


  /* (non-Javadoc)
   * @see javax.servlet.http.HttpServlet#service(javax.servlet.http.HttpServletRequest, javax.servlet.http.HttpServletResponse)
   */
  @SuppressWarnings({ "rawtypes", "resource" })
  protected void service(HttpServletRequest request, HttpServletResponse response) throws ServletException, IOException {

    // process the request
    String method = request.getMethod();
    //String pathInfo = request.getPathInfo(); // getPathInfo decodes the URL!
    String pathInfo = request.getRequestURI().substring(request.getContextPath().length() + request.getServletPath().length());
    String queryString = request.getQueryString();

    // add the default query string to the incoming query string
    if (this.baseUriQueryString != null && !this.baseUriQueryString.isEmpty()) {
      if (queryString != null && !queryString.isEmpty()) {
        queryString = this.baseUriQueryString + "&" + queryString;
      } else {
        queryString = this.baseUriQueryString;
      }
    }

    StringBuffer infoLog = new StringBuffer();
    infoLog.append(method).append(" ").append(request.getRequestURL());

    // create the targetUri
    String targetUriString = null;
    if (pathInfo.indexOf("/") != -1) {
      // either use the base URI or convert the pathinfo (containing the full URL)
      if (this.baseUri != null) {
        targetUriString = this.baseUri;
        targetUriString += pathInfo;
      } else {
        targetUriString = pathInfo.substring(1, pathInfo.indexOf("/", 1));
        targetUriString += "://";
        targetUriString += pathInfo.substring(pathInfo.indexOf("/", 1) + 1);
      }
      // make sure to replace spaces with %20 in the path
      targetUriString = targetUriString.replace(" ", "%20");
      if (queryString != null && !queryString.isEmpty()) {
        targetUriString += "?";
        targetUriString += queryString;
      }
    }

    // only a valid targetUriString will work
    if (targetUriString != null) {

      // check the targetUriString
      URL targetUrl = new URL(targetUriString);
      infoLog.append("\n").append("  - target: ").append(targetUrl.toString());

      // create a new URL connection (the proxy settings defined via system properties are used):
      //   - HTTP: http.proxyHost, http.proxyPort, http.proxyByPass
      //   - HTTPS: https.proxyHost, https.proxyPort, https.proxyByPass
      HttpURLConnection conn = (HttpURLConnection) new URL(targetUriString).openConnection();
      conn.setRequestMethod(method);
      conn.setDoOutput(true);
      conn.setDoInput(true);
      conn.setUseCaches(false);

      // copy all headers from this to the outgoing request to the target URI
      // except the blocked headers, which will be covered differently
      infoLog.append("\n").append("  - request headers:");
      List<String> blockedHeaders = Arrays.asList(BLOCKED_REQUEST_HEADERS);
      for (Enumeration e = request.getHeaderNames(); e.hasMoreElements();) {
        String headerName = e.nextElement().toString();
        if (!blockedHeaders.contains(headerName.toLowerCase())) { // NOSONAR
          conn.setRequestProperty(headerName, request.getHeader(headerName));
          infoLog.append("\n").append("    => ").append(headerName).append(": ").append(request.getHeader(headerName));
        }
      }

      // set the host header to the host url from the target server
      String host = request.getHeader("host");
      if (host != null) {
        if (targetUrl.getPort() > -1) {
          conn.setRequestProperty("host", targetUrl.getHost() + ":" + targetUrl.getPort());
        } else {
          conn.setRequestProperty("host", targetUrl.getHost());
        }
      }

      // connect to the target URL
      conn.connect();

      InputStream is = null;
      OutputStream os = null;

      try {

        // pipe the content of a POST, PUT and DELETE request
        // -> opening the streams out of the ifs will cause the GET requests
        //    converted into POST requests which happens implicitely by using
        //    conn.getOutputStream().
        if ("POST".equals(method) || "PUT".equals(method)) {
          is = request.getInputStream();
          os = conn.getOutputStream();
          IOUtils.copyLarge(is, os);
        } else if ("DELETE".equals(method) && request.getContentLength() > -1) {
          // special handling for DELETE requests (HttpUrlConnection doesn't support content)
          // pipe the DELETE content if possible (and only if content is available)
          try {
            is = request.getInputStream();
            os = conn.getOutputStream();
            IOUtils.copyLarge(is, os);
          } catch (ProtocolException ex) {
            throw new IOException("The HttpUrlConnection used by the SimpleProxyServlet doesn't allow to send content with the HTTP method DELETE. Due to spec having content for DELETE methods is possible but the default implementation of the HttpUrlConnection doesn't allow this!", ex);
          }
        }

        // close the streams if necessary
        IOUtils.closeQuietly(is);
        IOUtils.closeQuietly(os);

      } catch (IOException ex) {
        response.sendError(HttpServletResponse.SC_INTERNAL_SERVER_ERROR, "The HttpUrlConnection failed! Reason: " + ex.getMessage());
        IOUtils.closeQuietly(is);
        IOUtils.closeQuietly(os);
        conn.disconnect();
        return;
      }

      // apply the status of the response
      int responseCode = conn.getResponseCode();
      response.setStatus(responseCode);
      infoLog.append("\n").append(" - response-status: ").append(responseCode);

      // pipe and return the response (either the input or the error stream)
      try {

        // try to access the inputstream (for success and redirect cases / < 400)
        // and use the errorstream (for client side and server side errors / >= 400)
        if (responseCode >= 200 && responseCode < 400) {
          is = conn.getInputStream();
        } else {
          is = conn.getErrorStream();
        }

        // forward the response headers
        infoLog.append("\n").append("  - response headers:");
        for (Map.Entry<String, List<String>> mapEntry : conn.getHeaderFields().entrySet()) {
          String name = mapEntry.getKey();
          if (name != null) {
            List<String> values = mapEntry.getValue();
            if (values != null) {
              for (String value : values) {
                // we always filter the secure header to avoid the cookie from
                // "not" being included in follow up requests in case of the
                // proxy is running on HTTP and not HTTPS
                if (value != null && "set-cookie".equalsIgnoreCase(name) &&
                    value.toLowerCase().contains("secure")) {
                  String[] cookieValues = value.split(";");
                  String newValue = "";
                  for (String cookieValue : cookieValues) {
                     if (!"secure".equalsIgnoreCase(cookieValue.trim())) {
                       if (!newValue.isEmpty()) {
                         newValue += "; ";
                       }
                       newValue += cookieValue;
                     }
                  }
                  value = newValue;
                }
                response.addHeader(name, value);
                infoLog.append("\n").append("    => ").append(name).append(": ").append(value);
              }
            }
          }
        }

        // pipe the input to the outputstream
        os = response.getOutputStream();
        IOUtils.copyLarge(is, os);

      } catch (IOException ex) {
        // log any exception here
        this.log(ex.getMessage(), ex);
      } finally {
        IOUtils.closeQuietly(is);
        if (os != null) {
          os.flush();
          os.close();
        }
        conn.disconnect();
      }

      // log
      this.log(infoLog.toString());

    } else {

      // bad request: invalid URL
      response.setStatus(HttpServletResponse.SC_BAD_REQUEST);

    }

  } // method: dispatchRequest


} // class: SimpleProxyServlet