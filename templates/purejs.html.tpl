<!DOCTYPE html>
<html>
<head>
<script src="static/js/purejs_engine.js"></script>
</head>
<body bgcolor="black" onload="createUser()" onkeydown="handleKey(event)">
<center>
<p>
&nbsp;<div style="color: white; font-family: helvetica; display: inline;"> name:</div>&nbsp;
<div id="player_name" style="color: white; font-family: helvetica; display: inline;">{{ player_name }}</div>
&nbsp;<div style="color: white; font-family: helvetica; display: inline;"> score:</div>&nbsp;
<div id="player_score" style="color: white; font-family: helvetica; display: inline;">0</div>
&nbsp;<div style="color: white; font-family: helvetica; display: inline;"> health:</div>&nbsp;
<div id="player_health" style="color: white; font-family: helvetica; display: inline;">100</div>
&nbsp;<div style="color: white; font-family: helvetica; display: inline;"> time:</div>&nbsp;
<div id="game_time" style="color: white; font-family: helvetica; display: inline;">0</div>
</p>
<canvas id="myCanvas" width="1024" height="640"></canvas><br/>
<br/>
<script>
window.requestAnimationFrame(step)
</script>
</center>
</body>
</html>
