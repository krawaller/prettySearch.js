<?php header('Content-type: text/cache-manifest'); ?>
CACHE MANIFEST
cache.html.php
cache.manifest.php
# FILES
<?php 
	// Print "last modified" of files to bump cache whenever any file changes
	$files = file('cache.txt');
    foreach($files as $file){
    	echo "# ".trim($file).": ".filemtime(trim($file))."\n";
    }
?>