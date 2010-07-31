<?php header('Content-type: text/cache-manifest'); ?>
CACHE MANIFEST
cache.html.php
cache.manifest.php
# FILES
<?php 
	$files = file('cache.txt');
    foreach($files as $file){
    	echo "# ".trim($file).": ".filemtime(trim($file))."\n";
    }
?>