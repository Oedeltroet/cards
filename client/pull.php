<?php
    $output = shell_exec('git pull');
    $fp = fopen('output.txt', 'w');
    echo fwrite($fp, $output);
?>