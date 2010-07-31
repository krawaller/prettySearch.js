<!DOCTYPE html>
<html manifest="cache.manifest.php">
    <head>
    </head>
    <body>
    	<script type="text/tmpl">;window._addCss = function(str){ var s=document.createElement("style"); s.type="text/css"; s.textContent=str; document.getElementsByTagName("head")[0].appendChild(s); };</script>
    	<?php 
    		$files = file('cache.txt');
    		foreach($files as $file){
    			echo '<script type="text/tmpl">'.file_get_contents(trim($file)).'</script>';
    		}
    	?>
    	<script type="text/javascript">
    		Array.prototype.forEach.call(document.querySelectorAll('script[type="text/tmpl"]'), function(script){
				top.postMessage(script.textContent, "*");
            });
        </script>
    </body>
</html>