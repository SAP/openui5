@SETLOCAL

@IF "%GIT2P4_HOME%" EQU "" (
	SET GIT2P4_HOME=%~dp0
)

@IF "%1" EQU "--rebuild" (
	ECHO +
	ECHO ++++ Build git2p4 ++++
	ECHO +
	CALL mvn clean install -f %GIT2P4_HOME%\pom.xml
	IF ERRORLEVEL 1 GOTO :EOF
	ECHO +
	ECHO ++++ execute git2p4 ++++
	ECHO +
)

"%JAVA_HOME%\bin\java" -jar %GIT2P4_HOME%\_git2p4\target\com.sap.ui5.tools.git2p4-tool-1.0.0-SNAPSHOT.jar --log-file .\logs\git2p4.log --log-file-template .\logs\#.log --verbose --p4-dest-path //tc1/phoenix/# --optimize-diffs %* 

@ECHO ERRORLEVEL %ERRORLEVEL%