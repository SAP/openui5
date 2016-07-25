package com.sap.ui5.tools.infra.git2p4;

import java.io.BufferedReader;
import java.io.File;
import java.io.FileOutputStream;
import java.io.IOException;
import java.io.InputStreamReader;
import java.io.OutputStreamWriter;
import java.io.Writer;
import java.net.URL;
import java.net.URLEncoder;
import java.util.ArrayList;
import java.util.Date;
import java.util.HashMap;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

public class GitClient {

  private String gitcmd = "git.cmd";
  private String gitURL = "git.wdf.sap.corp";
  private String gitHttpsPort = "8080";
  private File repository = new File(".");
  boolean useHTTPS = false;
  String sshUser = System.getProperty("user.name", "sapui5").toLowerCase();
  String user = System.getProperty("user.name", "sapui5").toLowerCase();
  String email = null;
  String password = null;

  boolean verbose = false;
  boolean noCheckout = false;
  private int lastExitValue;
  private List<String> lastOutput;
  private Map<String,GitClient.Commit> lastCommits;

  GitClient(){

  }

  boolean execute(String ... cmds) throws IOException {
    return executeWithInput(null, cmds);
  }

  boolean executeWithInput(String input, String ... cmds) throws IOException {
    ProcessBuilder pb = new ProcessBuilder();
    pb.directory(getRepository());
    List<String> args = pb.command();
    args.add(gitcmd);
    for(String cmd : cmds) {
      args.add(cmd);
    }
    pb.redirectErrorStream(true);
    if ( verbose ) {
      Log.printf("%s > %s", getRepository(), pb.command());
    }
    long t0 = System.currentTimeMillis();
    Process process = pb.start();
    if ( input != null ) {
      Writer w = new OutputStreamWriter(process.getOutputStream());
      w.write(input);
      w.close();
    }
    BufferedReader r = new BufferedReader(new InputStreamReader(process.getInputStream()));
    String line;
    List<String> lines = new ArrayList<String>();
    while ((line = r.readLine()) != null) {
      lines.add(line);
    }
    r.close();
    try {
      process.waitFor();
    } catch (InterruptedException e) {
      throw new RuntimeException(e);
    }
    lastExitValue = process.exitValue();
    lastOutput = lines;
    lastCommits = null;
    long t1 = System.currentTimeMillis();
    Log.println("  Process returned exit code " + process.exitValue() + " (" + (t1-t0) + "ms)");
    Log.println("  Process returned output " + Log.summary(lines));
    if ( lastExitValue != 0 ) {
      throw new IOException("Git failed with error code " + lastExitValue);
    }
    return lastExitValue == 0;
  }

  public static class Commit {
    File repository;
    String[] ids;
    Map<String,String> fields = new HashMap<String,String>();
    List<String> lines = new ArrayList<String>();
    List<Commit> mergeIns = new ArrayList<Commit>();
    Object data = null;
    
    
    @Override
    public String toString() {
      return getId();
    }

    void setField(String field, String value) {
      fields.put(field, value);
    }

    public String getId() {
      return ids[0];
    }

    boolean isMerge() {
      return ids.length == 3;
    }

    public String getSummary() {
      return lines.get(0);
    }
    
    boolean isGerrit() {
      return fields.containsKey("Commit") && fields.get("Commit").startsWith("Gerrit Code Review");
    }

    static Pattern DATE = Pattern.compile("^(\\d+)\\s+([-+]\\d{4})$");
    private Date asDate(String field) {
      Matcher m = DATE.matcher(fields.get("CommitDate"));
      if ( m.matches() ) {
        long time = Long.parseLong(m.group(1));
        String offsetStr = m.group(2);
        long offset = (60 * Long.parseLong(offsetStr.substring(1,3)) + Long.parseLong(offsetStr.substring(3,5))) * 60L;
        if ( offsetStr.charAt(0) == '-' ) {
          offset = -offset;
        }
        return new Date(time * 1000L);
      } else {
        throw new RuntimeException();
      }
    }

    public boolean isGerritMergeOf(Commit other) {
      String summary = getSummary();
      if ( GerritHelper.isGerritMerge(summary) ) {
        summary = GerritHelper.ungerrit(summary);
        String otherSummary = other.getSummary();
        int length = Math.min(summary.length(), otherSummary.length());
        return length >= 20 && summary.regionMatches(0, otherSummary, 0, length);
      } else {
        return false;
      }
    }

    public Commit getOriginalCommit() {
      if ( mergeIns.size() > 0 && isGerritMergeOf(mergeIns.get(0)) ) {
        return mergeIns.get(0);
      } else {
        return this;
      }
    }
    
    public String getOrigSummary() {
      return GerritHelper.ungerrit(lines.get(0));
    }
    public Date getAuthorDate() {
      return asDate("AuthorDate");
    }
    public Date getCommitDate() {
      return asDate("CommitDate");
    }
    public String getAuthor() {
      return fields.get("Author");
    }
    public String getCommiter() {
      return fields.get("Commit");
    }
    
    public List<String> getMessageLines() {
      return lines;
    }
  }

  static Pattern COMMIT_LINE = Pattern.compile("^commit\\s+(.*)$");
  static Pattern TOKEN_LINE = Pattern.compile("^([^\\s:]+):\\s+(.*)$");
  static Pattern TEXT_LINE = Pattern.compile("^\\s+(.*)$");

  void evalCommitLog() {
    Map<String,GitClient.Commit> commits = new LinkedHashMap<String,GitClient.Commit>();
    lastOutput.add("");
    for (int i=0; i<lastOutput.size(); ) {
      String line = lastOutput.get(i++);
      Matcher m = COMMIT_LINE.matcher(line);
      if ( m.matches() ) {
        GitClient.Commit commit = new Commit();
        commit.repository = getRepository();
        commit.ids = m.group(1).trim().split("\\s");
        commits.put(commit.getId(), commit);
        while( i<lastOutput.size() && (m = TOKEN_LINE.matcher(line = lastOutput.get(i++))).matches() ) {
          String field = m.group(1);
          String value = m.group(2);
          commit.setField(field, value);
        }
        if ( !line.isEmpty() )
          throw new IllegalStateException("Parsing Git Commit Failed");
        while( i<lastOutput.size() && (m = TEXT_LINE.matcher(line = lastOutput.get(i++))).matches() ) {
          commit.lines.add(m.group(1));
        }
        if ( !line.isEmpty() )
          throw new IllegalStateException("Parsing Git Commit Failed");
      }
    }

    lastCommits = commits;
    Log.println("found " + getLastCommits().size() + " commits");
  }

  public boolean log(String range) throws IOException {
    return log(range, false);
  }
  
  public boolean log(String range, boolean oneline, String ... paths) throws IOException {
    String[] args = new String[] {range};
    if ( paths != null && paths.length > 0 ) {
      String[] tmp = new String[args.length + 1 + paths.length];
      System.arraycopy(args, 0, tmp, 0, args.length);
      tmp[args.length] = "--";
      System.arraycopy(paths, 0, tmp, args.length+1, paths.length);
      args = tmp;
    }
    return log(oneline, args);
  }

  public boolean log(boolean oneline, String ... args) throws IOException {
    String[] commonArgs = new String[] { 
        "log", "--no-color", oneline ? "--format=commit %H%n" : "--format=fuller", "--date=raw", "--no-abbrev-commit", "--parents"};
      if ( args != null && args.length > 0 ) {
        String[] tmp = new String[commonArgs.length + args.length];
        System.arraycopy(commonArgs, 0, tmp, 0, commonArgs.length);
        System.arraycopy(args, 0, tmp, commonArgs.length, args.length);
        commonArgs = tmp;
      }
      if ( execute(commonArgs) ) {
        evalCommitLog();
        return true;
      }
      return false;
  }
  
  public boolean log(int n) throws IOException {
    if ( execute("log", "--no-color", "--max-count", String.valueOf(n)) ) {
      evalCommitLog();
      return true;
    }
    return false;
  }

  public boolean clone(String gitUrl) throws IOException {
  	// we always fetch via SSH
    return execute("clone", createGitBaseUrl(false) + gitUrl, getRepository().getAbsolutePath());
  }

  public boolean fetch() throws IOException {
    return execute("fetch");
  }

  public boolean checkout(String commit) throws IOException {
    if (noCheckout){
      return false;
    }
    return execute("checkout", "--force", "--detach", commit);
  }

  public boolean addAll() throws IOException {
    return execute("add", "--all");
  }

  public boolean commit(CharSequence message) throws IOException {
  	// locally set the user to be used as committer for the commit
  	try {
    	if (useHTTPS && email != null) {
    		execute("config", "--local", "--add", "user.name", user);
    		execute("config", "--local", "--add", "user.email", email);
    	}
      // ensure that the changeId commit hook exists
      File commitMsgHook = new File(getRepository(), ".git/hooks/commit-msg");
      if ( !commitMsgHook.exists() ) {
        URL url = new URL("https://" + getGitURL() + ":" + getGitHttpsPort() + "/tools/hooks/commit-msg");
        Log.println("Downloading commit-msg from " + url);
        IOUtils.copy(url.openConnection().getInputStream(), new FileOutputStream(commitMsgHook), /* close= */ true);
      }
      return executeWithInput(message.toString(), "-c", "core.autocrlf=false", "commit", "-F", "-");
  	} finally {
  		// cleanup the locally set user/email
    	if (useHTTPS && email != null) {
    		execute("config", "--local", "--unset", "user.name");
    		execute("config", "--local", "--unset", "user.email");
    	}
  	}
  }

  public boolean tag(String name, CharSequence message) throws IOException {
    return executeWithInput(message.toString(), "tag", "-F", "-", name);  
  }
  
  public boolean tag(String name) throws IOException {
    if ( execute("tag", "-l", name) ) {
      for (int i=0; i<lastOutput.size(); ) {
        String line = lastOutput.get(i++);
        if ( line.contains(name) ) {
          return true;
        }
      }
    }
    return false;
  }
  
  public boolean push(String gitUrl, String refSpecOrTagsOption) throws IOException {
    return execute("push", createGitBaseUrl(useHTTPS) + gitUrl, refSpecOrTagsOption);
  }
  
  private String createGitBaseUrl(boolean useHTTPS) throws IOException {
  	StringBuffer baseUrl = new StringBuffer();
  	if (useHTTPS) {
  		baseUrl.append("https://");
    	if (user != null) {
          baseUrl.append(URLEncoder.encode(user, "UTF-8"));
          if (password != null) {
            baseUrl.append(":");
            baseUrl.append(URLEncoder.encode(password, "UTF-8"));
          }
    		baseUrl.append("@");
    	}
  	} else {
  		baseUrl.append("ssh://");
    	if (sshUser != null) {
    		baseUrl.append(sshUser);
    		baseUrl.append("@");
    	}
  	}
    baseUrl.append(getGitURL()).append(":");
  	if (useHTTPS) {
  		baseUrl.append(getGitHttpsPort());
  	} else {
  		baseUrl.append("29418");
  	}
  	return baseUrl.toString();
  }

  public File getRepository() {
    return this.repository;
  }

  public void setRepository(File repository) {
    this.repository = repository;
  }

  public Map<String,GitClient.Commit> getLastCommits() {
    return this.lastCommits;
  }

  public String getGitURL() {
    return this.gitURL;
  }

  public void setGitURL(String sGitURL) {
    this.gitURL = sGitURL;
  }

  public String getGitHttpsPort() {
    return this.gitHttpsPort;
  }

  public void setGitHttpsPort(String gitHttpsPort) {
    this.gitHttpsPort = gitHttpsPort;
  }

}