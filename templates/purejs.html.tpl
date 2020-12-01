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
<input type="hidden" class="player" id="0" value=""/>
<input type="hidden" class="player" id="1" value=""/>
<input type="hidden" class="player" id="2" value=""/>
<input type="hidden" class="player" id="3" value=""/>
<input type="hidden" class="player" id="4" value=""/>
<input type="hidden" class="player" id="5" value=""/>
<input type="hidden" class="player" id="6" value=""/>
<input type="hidden" class="player" id="7" value=""/>
<input type="hidden" class="player" id="8" value=""/>

<input type="hidden" id="o_rotx" value="0.0"/>
<input type="hidden" id="o_roty" value="0.0"/>
<input type="hidden" id="o_rotz" value="0.0"/>
<input type="hidden" id="o_trnx" value="0.0"/>
<input type="hidden" id="o_trny" value="0.0"/>
<input type="hidden" id="o_trnz" value="5.1"/>
<input type="hidden" id="blast_trnz" value="0.0"/>
<input type="hidden" id="is_blast" value="0"/>
<br/>
<script>
window.requestAnimationFrame(step)
</script>
</center>
</body>
</html>
