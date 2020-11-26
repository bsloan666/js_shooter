
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

function syncState() {
    var xhttp = new XMLHttpRequest();
    var url = "/sync_state";
    var data = new FormData();
    var i;

    xhttp.onreadystatechange = function () {
        if (this.readyState === 4 && this.status === 200) {
            var scene = JSON.parse(this.responseText);
            for (i = 0; i < scene.length; i++) {
                document.getElementById(i).value = JSON.stringify(scene[i]);
            }
        }
    };

    var name = document.getElementById("player_name").innerText;
    var orientation = Number(document.getElementById("o_roty").value);
    var posx = Number(document.getElementById("o_trnx").value);
    var posz = Number(document.getElementById("o_trnz").value);

    console.log(name + " " + orientation + " " + posx + " " + posz);

    xhttp.open("POST", url, true);
    data.append('player_name', name);
    data.append('player_orientation', orientation);
    data.append('player_posx', posx);
    data.append('player_posz', posz);

    xhttp.send(data);
}

function handleKey(event){
    var ry = Number(document.getElementById("o_roty").value)  
    var tx = Number(document.getElementById("o_trnx").value)  
    var tz = Number(document.getElementById("o_trnz").value)  
    if(event.keyCode == 37){
        ry += 0.1;
    }
    if(event.keyCode == 38){
        tz -= 0.1;
        //tz -= Math.cos(ry) * 0.1;
        //tx -= Math.sin(ry) * 0.1;
    }
    if(event.keyCode == 39){
        ry -= 0.1;
    }
    if(event.keyCode == 40){
        tz +=  0.1;
        //tz += Math.cos(ry) * 0.1;
        //tx += Math.sin(ry) * 0.1;
    }
    if(event.keyCode == 32){
        document.getElementById("is_blast").value = 1 
        document.getElementById("blast_trnz").value = 0.3
        var audio = new Audio('static/audio/blast.ogg');
        audio.play();
        syncState();
    }
    // console.log(event.keyCode)
    document.getElementById("o_roty").value = ry 
    document.getElementById("o_trnx").value = tx 
    document.getElementById("o_trnz").value = tz 
}

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

function crossProduct(ax, ay, az, bx, by, bz){
    var result = [0.0, 0.0, 0.0];
    result[0] = ay*bz - az*by;
    result[1] = az*bx - ax*bz;
    result[2] = ax*by - ay*bx;
    return result
}

function testFace(points, face){
    // determine if a face is front facing
    var ax =  points[face[0]][0] - points[face[1]][0] 
    var ay =  points[face[0]][1] - points[face[1]][1] 
    var az =  points[face[0]][2] - points[face[1]][2] 
    var bx =  points[face[2]][0] - points[face[1]][0] 
    var by =  points[face[2]][1] - points[face[1]][1] 
    var bz =  points[face[2]][2] - points[face[1]][2] 

    var cp = crossProduct(ax, ay, az, bx, by, bz);

    if(cp[2] < 0){
        return true;
    } else {
        return false;
    }
}

function rotationMatrix(ang) {

   return  [[Math.cos(ang[0]) * Math.cos(ang[1]), 
                Math.cos(ang[0]) * Math.sin(ang[1]) * Math.sin(ang[2]) - Math.sin(ang[0]) * Math.cos(ang[2]), 
                Math.cos(ang[0]) * Math.sin(ang[1]) * Math.cos(ang[2]) + Math.sin(ang[0]) * Math.sin(ang[2])],
            [Math.sin(ang[0]) * Math.cos(ang[1]), 
                Math.sin(ang[0]) * Math.sin(ang[1]) * Math.sin(ang[2]) + Math.cos(ang[0]) * Math.cos(ang[2]), 
                Math.sin(ang[0]) * Math.sin(ang[1]) * Math.cos(ang[2]) - Math.cos(ang[0]) * Math.sin(ang[2])],
            [Math.sin(ang[1]) * -1, 
                Math.cos(ang[1]) * Math.sin(ang[2]), 
                Math.cos(ang[1]) * Math.cos(ang[2])]]; 
}


function worldTransform(points, ry, tx, tz){
    var index;
    var coords =cube()[0]; 
    var ang = [0.0, ry, 0.0]; 
    var translate = [ tx, 0.0, tz];
    
    var rotate= rotationMatrix(ang);
    
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


function cameraTransform(wid, hei, points){
    var index;
    var coords = cube()[0]; 
    var rotcoords = cube()[0]; 
    var ry = Number(document.getElementById("o_roty").value)
    var ang = [0.0, -ry, 0.0];
    var rotate = rotationMatrix(ang) 
    var tx = Number(document.getElementById("o_trnx").value) 
    var tz = Number(document.getElementById("o_trnz").value)

    for( index = 0; index < points.length; index++ ){
        rotcoords[index][0] = rotate[0][0] * points[index][0] + rotate[0][1] * points[index][1] + rotate[0][2] * points[index][2];    
        rotcoords[index][1] = rotate[1][0] * points[index][0] + rotate[1][1] * points[index][1] + rotate[1][2] * points[index][2];    
        rotcoords[index][2] = rotate[2][0] * points[index][0] + rotate[2][1] * points[index][1] + rotate[2][2] * points[index][2];
        coords[index][0] = ((rotcoords[index][0]-tx)/(rotcoords[index][2]+tz))*hei+wid/2;
        coords[index][1] = ((rotcoords[index][1])/(rotcoords[index][2]+tz))*hei+hei/2;
        coords[index][2] = rotcoords[index][2]+tz;

        //coords[index][0] = ((points[index][0]-tx)/(points[index][2]+tz))*hei+wid/2;
        //coords[index][1] = ((points[index][1])/(points[index][2]+tz))*hei+hei/2;
        //coords[index][2] = points[index][2]+tz;
        //rotcoords[index][0] = rotate[0][0] * coords[index][0] + rotate[0][1] * coords[index][1] + rotate[0][2] * coords[index][2];    
        //rotcoords[index][1] = rotate[1][0] * coords[index][0] + rotate[1][1] * coords[index][1] + rotate[1][2] * coords[index][2];    
        //rotcoords[index][2] = rotate[2][0] * coords[index][0] + rotate[2][1] * coords[index][1] + rotate[2][2] * coords[index][2];
    }
    return coords;
    //return rotcoords;
}

function drawFace(ctx, points, face){
    ctx.strokeStyle = "#FFFFFF";
    ctx.lineWidth = 3
    ctx.lineJoin = "round"
    ctx.fillStyle = "#000000"

    if(testFace(points, face)){
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


function drawBlast(ctx, wid, hei) {
    var geo = cube();
    var index;
    var bz = Number(document.getElementById("blast_trnz").value)
    var ry = Number(document.getElementById("o_roty").value)
    var tx = Number(document.getElementById("o_trnx").value)
    var tz = Number(document.getElementById("o_trnz").value)

    for (index = 0; index < geo[0].length; index++) {
        geo[0][index][2] += bz 
    }
    var coords = worldTransform( geo[0], ry, tx, tz);
    var points = cameraTransform( wid, hei, coords);

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


function drawGround(ctx, wid, hei) {
    ctx.strokeStyle = "#FFFFFF";
    ctx.lineWidth = 1
    ctx.moveTo(0, hei/2); 
    ctx.lineTo(wid, hei/2); 
    ctx.stroke();
}


function drawPlayer(ctx, geo, player) {
    var wid = ctx.canvas.width;
    var hei = ctx.canvas.height;
    var index;

    var tx = player['position'][0];
    var tz = player['position'][1];
    var ry = player['orientation'];

    var coords = worldTransform( geo[0], ry, tx, tz);
    var flat_coords = cameraTransform(wid, hei, coords);

    if(flat_coords[0][2] > 0.0) { 
        for( index = 0; index < geo[1].length; index++) {
            drawFace(ctx, flat_coords, geo[1][index]);
        }
        var fontsize = 100/flat_coords[0][2];

        ctx.font = fontsize+"px Arial";
        ctx.fillStyle = "#FFFFFF";
        var tdims = ctx.measureText(player['name']);
        ctx.fillText(player['name'], flat_coords[0][0], flat_coords[0][1]);
    }
}


function drawAll() {
    var cnvs = document.getElementById("myCanvas");
    var cnv_width = cnvs.width;
    var cnv_height = cnvs.height;
    var ctx = cnvs.getContext("2d");
    ctx.fillStyle = "#000000";
    ctx.fillRect(0, 0, cnv_width, cnv_height);
    drawGround(ctx, cnv_width, cnv_height);
    var geo = cube();
    var index = 0;
    var name = document.getElementById("player_name").innerText;
    var players = document.getElementsByClassName('player');

    for( index = 0; index < players.length; index++) {
        if(players[index].value != '' && players[index]['name'] != name) {
            player = JSON.parse(players[index].value);
            drawPlayer(ctx, geo, player);
        }
    }

    var isBlast = Number(document.getElementById("is_blast").value);
    if(isBlast === 1) {
        drawBlast(ctx, cnv_width, cnv_height)
    }
}

function step(){
    var bz = Number(document.getElementById("blast_trnz").value) 
    var gt = Number(document.getElementById("game_time").innerText) 

    gt+=1;
    if(Number(document.getElementById("is_blast").value) === 1) {
        bz += 0.3;
    }
    if( bz > 10) { 
        document.getElementById("is_blast").value = 0;
    }

    document.getElementById("blast_trnz").value = bz 
    document.getElementById("game_time").innerText = gt 
    drawAll();
    window.requestAnimationFrame(step)
}
window.requestAnimationFrame(step)
