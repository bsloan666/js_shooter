<!DOCTYPE html>
<html>
<head>
<script>
function createUser() {
    var name = document.getElementById("player_name").innerText;
    if(name === "" ||  name === "None") {
        var person = prompt("Please enter a name for your player", "Finky");
        
        var form = document.createElement("form");

        form.method = "POST";
        form.action = "/";   

        document.getElementById("player_name").innerText = person
        var name = document.createElement("input"); 
        name.value=person;
        name.name="player_name";
        form.appendChild(name);  

        document.body.appendChild(form);

        form.submit();
    }
}

function sync_state() {
    var xhttp = new XMLHttpRequest();
    var url = "/sync_state";
    var data = new FormData();
    var i;
    xhttp.onreadystatechange = function () {
        if (this.readyState === 4 && this.status === 200) {
            var scene = JSON.parse(this.responseText);
            for (i = 0; i < scene.length; i++) {
                drawable = scene[i];
                console.log(drawable)    
            }
        }
    };
    var name = document.getElementById("player_name").innerText  
    var orientation = Number(document.getElementById("o_roty").innerText)  
    var posx = Number(document.getElementById("o_trnx").innerText)  
    var posz = Number(document.getElementById("o_trnz").innerText)  
    xhttp.open("POST", url, true);
    data.append('player_name', name);
    data.append('player_orientation', orientation);
    data.append('player_posx', posx);
    data.append('player_posz', posz);
    xhttp.send(data);
}

function handleKey(event){
    var tx = Number(document.getElementById("o_trnx").value)  
    var tz = Number(document.getElementById("o_trnz").value)  
    if(event.keyCode == 37){
        tx += 0.1;
    }
    if(event.keyCode == 38){
        tz -= 0.1
    }
    if(event.keyCode == 39){
        tx -= 0.1;
    }
    if(event.keyCode == 40){
        tz += 0.1
    }
    if(event.keyCode == 32){
        document.getElementById("is_blast").value = 1 
        document.getElementById("blast_trnz").value = 0.3
        var audio = new Audio('static/audio/blast.ogg');
        audio.play();
        sync_state();
    }
    // console.log(event.keyCode)
    document.getElementById("o_trnx").value = tx 
    document.getElementById("o_trnz").value = tz 
}
</script>
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
<input type="hidden" id="s_rotx" value="0.0"/>
<input type="hidden" id="s_roty" value="0.0"/>
<input type="hidden" id="s_rotz" value="0.0"/>
<input type="hidden" id="s_trnx" value="0.0"/>
<input type="hidden" id="s_trny" value="0.0"/>
<input type="hidden" id="s_trnz" value="10.1"/>
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

function cube() {
   var positions=[
        [-0.5, -0.5, -0.5],  
        [0.5, -0.5, -0.5],  
        [0.5, 0.5, -0.5],  
        [-0.5, 0.5, -0.5],  
        [-0.5, -0.5, 0.5],  
        [0.5, -0.5, 0.5],  
        [0.5, 0.5, 0.5],  
        [-0.5, 0.5, 0.5]
   ]
   var connectivity=[
        [0, 1, 2, 3],
        [7, 6, 5, 4],
        [1, 0, 4, 5],
        [3, 2, 6, 7],
        [1, 5, 6, 2],
        [4, 0, 3, 7]
   ]
   return [positions, connectivity];
}

function world_transform(points){
    var index;
    var coords = [
        [0, 0, 0],
        [0, 0, 0],
        [0, 0, 0],
        [0, 0, 0],
        [0, 0, 0],
        [0, 0, 0],
        [0, 0, 0],
        [0, 0, 0]
    ]
    var ang = [Number(document.getElementById("o_rotx").value), Number(document.getElementById("o_roty").value), Number(document.getElementById("o_rotz").value)]; 
    var translate = [Number(document.getElementById("o_trnx").value), Number(document.getElementById("o_trny").value), Number(document.getElementById("o_trnz").value)];

    var rotate=[
        [Math.cos(ang[0]) * Math.cos(ang[1]), 
            Math.cos(ang[0]) * Math.sin(ang[1]) * Math.sin(ang[2]) - Math.sin(ang[0]) * Math.cos(ang[2]), 
            Math.cos(ang[0]) * Math.sin(ang[1]) * Math.cos(ang[2]) + Math.sin(ang[0]) * Math.sin(ang[2])],
        [Math.sin(ang[0]) * Math.cos(ang[1]), 
            Math.sin(ang[0]) * Math.sin(ang[1]) * Math.sin(ang[2]) + Math.cos(ang[0]) * Math.cos(ang[2]), 
            Math.sin(ang[0]) * Math.sin(ang[1]) * Math.cos(ang[2]) - Math.cos(ang[0]) * Math.sin(ang[2])],
        [Math.sin(ang[1]) * -1, 
            Math.cos(ang[1]) * Math.sin(ang[2]), 
            Math.cos(ang[1]) * Math.cos(ang[2])] 
    ];
    
    for( index = 0; index < points.length; index++){
        coords[index][0] = rotate[0][0] * points[index][0] + rotate[0][1] * points[index][1] + rotate[0][2] * points[index][2];    
        coords[index][1] = rotate[1][0] * points[index][0] + rotate[1][1] * points[index][1] + rotate[1][2] * points[index][2];    
        coords[index][2] = rotate[2][0] * points[index][0] + rotate[2][1] * points[index][1] + rotate[2][2] * points[index][2]; 
        coords[index][0] += translate[0];
        coords[index][1] += translate[1];
        coords[index][2] += translate[2];
    }
    return coords;
}

function cross_product(ax, ay, az, bx, by, bz){
    var result = [0.0, 0.0, 0.0];
    result[0] = ay*bz - az*by;
    result[1] = az*bx - ax*bz;
    result[2] = ax*by - ay*bx;
    return result
}

function test_face(points, face){
    // determine if a face is front facing
    var ax =  points[face[0]][0] - points[face[1]][0] 
    var ay =  points[face[0]][1] - points[face[1]][1] 
    var az =  points[face[0]][2] - points[face[1]][2] 
    var bx =  points[face[2]][0] - points[face[1]][0] 
    var by =  points[face[2]][1] - points[face[1]][1] 
    var bz =  points[face[2]][2] - points[face[1]][2] 

    var cp = cross_product(ax, ay, az, bx, by, bz);

    if(cp[2] < 0){
        return true;
    } else {
        return false;
    }
}

function camera_transform(wid, hei, points){
    var index;
    var coords = [
        [0, 0, 0],
        [0, 0, 0],
        [0, 0, 0],
        [0, 0, 0],
        [0, 0, 0],
        [0, 0, 0],
        [0, 0, 0],
        [0, 0, 0]
    ]    
    for( index = 0; index < points.length; index++ ){
        coords[index][0] = ((points[index][0])/(points[index][2]))*hei+wid/2;
        coords[index][1] = ((points[index][1])/(points[index][2]))*hei+hei/2;
        coords[index][2] = points[index][2];
    }
    return coords;
}

function draw_face(ctx, points, face){
    ctx.strokeStyle = "#FFFFFF";
    ctx.lineWidth = 3
    ctx.lineJoin = "round"
    ctx.fillStyle = "#000000"

    if(test_face(points, face)){
        ctx.beginPath();
        ctx.moveTo(points[face[0]][0], points[face[0]][1]); 
        ctx.lineTo(points[face[1]][0], points[face[1]][1]); 
        ctx.lineTo(points[face[2]][0], points[face[2]][1]); 
        ctx.lineTo(points[face[3]][0], points[face[3]][1]); 
        ctx.closePath();
        ctx.stroke();
        ctx.fill();
    }
}

function draw_blast(ctx, wid, hei) {
    var geo = cube();
    var index;
    var bz = Number(document.getElementById("blast_trnz").value)  
    for (index = 0; index < geo[0].length; index++) {
        geo[0][index][2] += bz 
    }
    var points = camera_transform( wid, hei, geo[0]);
    ctx.moveTo(points[0][0], points[0][1]); 
    ctx.lineTo(points[4][0], points[4][1]); 
    ctx.stroke();
    ctx.moveTo(points[1][0], points[1][1]); 
    ctx.lineTo(points[5][0], points[5][1]); 
    ctx.stroke();
    ctx.moveTo(points[2][0], points[2][1]); 
    ctx.lineTo(points[6][0], points[6][1]); 
    ctx.stroke();
    ctx.moveTo(points[3][0], points[3][1]); 
    ctx.lineTo(points[7][0], points[7][1]); 
    ctx.stroke();
}

function draw_ground(ctx, wid, hei){
    ctx.strokeStyle = "#FFFFFF";
    ctx.lineWidth = 1
    ctx.moveTo(0, hei/2); 
    ctx.lineTo(wid, hei/2); 
    ctx.stroke();
     
}

function myDraw() {
    var cnv_width = 1024;
    var cnv_height = 640;
    var cnvs = document.getElementById("myCanvas");
    var ctx = cnvs.getContext("2d");
    ctx.fillStyle = "#000000";
    ctx.fillRect(0, 0, cnv_width, cnv_height);
    draw_ground(ctx, cnv_width, cnv_height);
    var geo = cube();
    var index;
    var coords = world_transform( geo[0]);
    var flat_coords = camera_transform(cnv_width, cnv_height, coords);

    for( index = 0; index < geo[1].length; index++){
        draw_face(ctx, flat_coords, geo[1][index]); 
    }

    var tz = Number(document.getElementById("o_trnz").value);
    var tx = Number(document.getElementById("o_trnx").value);
    var fontsize = 100/tz;

    ctx.font = fontsize+"px Arial";
    ctx.fillStyle = "#FFFFFF";
    var tdims = ctx.measureText("Bob");
    ctx.fillText("Bob", (tx/tz)*cnv_height+cnv_width/2-tdims.width/2, cnv_height/2 - (0.7/tz)*cnv_height);

    var isBlast = Number(document.getElementById("is_blast").value);
    if(isBlast === 1) {
        draw_blast(ctx, cnv_width, cnv_height)
    }
}

function step(){
    var ry = Number(document.getElementById("o_roty").value)
    var rz = Number(document.getElementById("o_rotz").value)
    // ry += 0.01
    // rz += 0.005
    var tx = Number(document.getElementById("o_trnx").value) 
    var ty = Number(document.getElementById("o_trny").value)
    var tz = Number(document.getElementById("o_trnz").value)
    var bz = Number(document.getElementById("blast_trnz").value) 
    var gt = Number(document.getElementById("game_time").innerText) 

    gt+=1;
    if(Number(document.getElementById("is_blast").value) === 1) {
        bz += 0.3;
    }
    if( bz > 10) { 
        document.getElementById("is_blast").value = 0;
    }

    document.getElementById("o_roty").value = ry
    document.getElementById("o_rotz").value = rz
    document.getElementById("o_trnx").value = tx 
    document.getElementById("o_trny").value = ty 
    document.getElementById("o_trnz").value = tz 
    document.getElementById("blast_trnz").value = bz 
    document.getElementById("game_time").innerText = gt 
    myDraw();
    window.requestAnimationFrame(step)
}
window.requestAnimationFrame(step)
</script>
</center>
</body>
</html>
