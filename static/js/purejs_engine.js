
function createUser() {
    var name = document.getElementById("player_name").innerText;
    if(name === "" ||  name === "None") {

        var xhttp = new XMLHttpRequest();
        var url = "/name_suggest";
        var data = new FormData();
        var i;

        xhttp.onreadystatechange = function () {
            if (this.readyState === 4 && this.status === 200) {
                var name_suggestion = JSON.parse(this.responseText);
                var person = prompt("Please enter a name for your player", name_suggestion);
                var form = document.createElement("form");

                form.method = "POST";
                form.action = "/";   

                document.getElementById("player_name").innerText = person
                var name = document.createElement("input"); 
                name.value=person;
                name.name="player_name";
                form.appendChild(name);  

                document.body.appendChild(form);
            }
        }
        xhttp.open("POST", url, true);
        xhttp.send(data);
   };
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

    // console.log(name + " " + orientation + " " + posx + " " + posz);

    xhttp.open("POST", url, true);
    data.append('player_name', name);
    data.append('player_orientation', orientation);
    data.append('player_posx', posx);
    data.append('player_posz', posz);

    xhttp.send(data);
}

function handleKey(event){

    var twopi = 3.14159 * 2;
    var ry = Number(document.getElementById("o_roty").value)  
    var tx = Number(document.getElementById("o_trnx").value)  
    var tz = Number(document.getElementById("o_trnz").value)  
    if(event.keyCode == 37){
        ry += 0.1;
        if( ry > twopi) {
            ry = 0.0;
        }
    }
    if(event.keyCode == 38){
        //tz -= 0.1;
        tz += Math.cos(ry) * 0.1;
        tx -= Math.sin(ry) * 0.1;
    }
    if(event.keyCode == 39){
        ry -= 0.1;
        if (ry < 0.0) {
            ry = twopi;
        }
    }
    if(event.keyCode == 40){
        //tz +=  0.1;
        tz -= Math.cos(ry) * 0.1;
        tx += Math.sin(ry) * 0.1;
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

    syncState();
    window.requestAnimationFrame(step)
}

function square() {
   var positions=[
        [-1.0, 0.5, -1.0],  
        [1.0, 0.5, -1.0],  
        [1.0, 0.5, 1.0],  
        [-1.0, 0.5, 1.0]
   ]
   var connectivity=[
        [0, 1, 2, 3],
   ] 
   return [positions, connectivity];
}

function octagon() {
   var positions=[
        [-0.5, 0.5,-1.0],  
        [0.5, 0.5, -1.0],  
        [1.0, 0.5, -0.5],  
        [1.0, 0.5, 0.5],  
        [0.5, 0.5, 1.0],  
        [-0.5, 0.5, 1.0],  
        [-1.0, 0.5, 0.5],  
        [-1.0, 0.5, -0.5],  
   ]
   var connectivity=[
        [0, 1, 2, 3, 4, 5, 6, 7],
   ] 
   return [positions, connectivity];
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

    if(cp[2] < 0 && points[face[0]][2] > 0 && 
        points[face[1]][2] > 0 && 
            points[face[2]][2] > 0 && 
                points[face[3]][2] > 0){
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


function worldTransform(shape, ry, tx, tz){
    var index;
    var points = shape()[0]; 
    var coords = shape()[0]; 
    var ang = [0.0, ry, 0.0]; 
    var translate = [ tx, 0.0, tz];
    
    var rotate = rotationMatrix(ang);
    
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


function cameraTransform(shape, points) {
    var index;
    var coords = shape()[0]; 
    var rotcoords = shape()[0]; 
    var ry = Number(document.getElementById("o_roty").value)
    var ang = [0.0, -ry, 0.0];
    var rotate = rotationMatrix(ang) 
    var tx = Number(document.getElementById("o_trnx").value) 
    var tz = Number(document.getElementById("o_trnz").value)

    for( index = 0; index < points.length; index++ ) {
        rotcoords[index][0] = rotate[0][0] * points[index][0] + rotate[0][1] * points[index][1] + rotate[0][2] * points[index][2];    
        rotcoords[index][1] = rotate[1][0] * points[index][0] + rotate[1][1] * points[index][1] + rotate[1][2] * points[index][2];    
        rotcoords[index][2] = rotate[2][0] * points[index][0] + rotate[2][1] * points[index][1] + rotate[2][2] * points[index][2];
        coords[index][0] = rotcoords[index][0]-tx;
        coords[index][1] = rotcoords[index][1];
        coords[index][2] = rotcoords[index][2]-tz;
    }
    return coords;
}

function projection(shape, ctx, points) {
    var wid = ctx.canvas.width;
    var hei = ctx.canvas.height;
    var coords = shape()[0]; 
    for( index = 0; index < points.length; index++ ) {
        coords[index][0] = ((points[index][0])/(points[index][2]))*hei+wid/2;
        coords[index][1] = ((points[index][1])/(points[index][2]))*hei+hei/2;
        coords[index][2] = points[index][2];
    }
    return coords;
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
        ctx.fill();
        ctx.stroke();
    }
}


function drawBlast(ctx) {
    var index;
    var bz = Number(document.getElementById("blast_trnz").value)
    var ry = Number(document.getElementById("o_roty").value)
    var tx = Number(document.getElementById("o_trnx").value)
    var tz = Number(document.getElementById("o_trnz").value)

    var coords = worldTransform( cube, ry, tx, tz);
    var temp = worldTransform( cube, coords);
    var points = cameraTransform( cube, ctx, temp);

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


function depthSort(pdepths) {
    var indices = [];
    var unsorted = [];
    var i;
    for(i=0; i < pdepths.length;  i++) {
        unsorted.push(pdepths[i]) 
    }
    pdepths.sort(function(a,b) { return a - b; });

    for(i=pdepths.length-1; i >=0; i--) {
        indices.push(unsorted.indexOf(pdepths[i]));
    }
    return indices;
}


function drawGround(ctx) {
    var i;

    var squ_con = square()[1];
    var oct_con = octagon()[1];

    var points1 = worldTransform(square, 0.0, 5.0, 5.0);
    var points2 = worldTransform(octagon, 0.0, -5.0, 5.0);

    var temp1 = cameraTransform(square, points1); 
    var temp2 = cameraTransform(octagon, points2); 

    var coords1 = projection(square, ctx, temp1);
    var coords2 = projection(octagon, ctx, temp2);

    ctx.strokeStyle = "#FFFFFF";
    ctx.lineWidth = 1

    //console.log("CAMERA "+coords1);

    ctx.beginPath();
    if(coords1[0][2] > 0.0){
        ctx.moveTo(coords1[squ_con[0][0]][0], coords1[squ_con[0][0]][1]);
        for(i=1; i < squ_con[0].length; i++) {
            if(coords1[squ_con[0][i]][2] > 0 && coords1[squ_con[0][i-1]][2] > 0) {
                ctx.lineTo(coords1[squ_con[0][i]][0], coords1[squ_con[0][i]][1]);
            } else {
                ctx.moveTo(coords1[squ_con[0][i]][0], coords1[squ_con[0][i]][1]);
            }
        }
        ctx.closePath();
        ctx.stroke();
    }
    if(coords2[0][2] > 0.0){
        ctx.beginPath();
        ctx.moveTo(coords2[oct_con[0][0]][0], coords2[oct_con[0][0]][1]);
        for(i=1; i < oct_con[0].length; i++) {
            if(coords2[oct_con[0][i]][2] > 0 && coords2[oct_con[0][i-1]][2] > 0) {
                ctx.lineTo(coords2[oct_con[0][i]][0], coords2[oct_con[0][i]][1]);
            } else {    
                ctx.moveTo(coords2[oct_con[0][i]][0], coords2[oct_con[0][i]][1]);
            }
        }
        ctx.closePath();
        ctx.stroke();
    }
}

function drawPlayer(ctx, points, player) {
    var index;
    var connect = cube()[1];

    if(points[0][2] > 0.0) { 
        for( index = 0; index < connect.length; index++) {
            if( points[0][2] > 0.0) {
                drawFace(ctx, points, connect[index]);
            }
        }
        var fontsize = 100/points[0][2];

        ctx.font = fontsize+"px Arial";
        ctx.fillStyle = "#FFFFFF";
        var tdims = ctx.measureText(player['name']);

        var hoverx = (points[0][0] + points[1][0] + points[2][0] + points[3][0])/4-tdims.width/2;
        var hovery = points[0][1] * 0.9; 
        ctx.fillText(player['name'], hoverx, hovery);
    }
}

function layoutPlayer(ctx, player) {
    var wid = ctx.canvas.width;
    var hei = ctx.canvas.height;
    var index;

    var tx = player['position'][0];
    var tz = player['position'][1];
    var ry = player['orientation'];

    var coords = worldTransform(cube, ry, tx, tz);
    var temp = cameraTransform(cube,  coords);
    var flat_coords = projection(cube, ctx,  temp);

    // console.log(flat_coords);
    var accum = 0;

    for( index = 0; index < flat_coords.length; index++ ) {
        accum+=flat_coords[index][2]; 
    }    

    return [accum/flat_coords.length, flat_coords];
}

function drawAll() {
    var cnvs = document.getElementById("myCanvas");
    var cnv_width = cnvs.width;
    var cnv_height = cnvs.height;
    var ctx = cnvs.getContext("2d");
    ctx.fillStyle = "#000000";
    ctx.fillRect(0, 0, cnv_width, cnv_height);
    drawGround(ctx);
    var index;
    var idx;
    var name = document.getElementById("player_name").innerText;
    var players = document.getElementsByClassName('player');
    var depth;
    var coords;
    var temp;

    var pos_buffer = [];
    var player_depths = [];
    
    for( index = 0; index < players.length; index++) {
        if(players[index].value != '') {
            player = JSON.parse(players[index].value);
            temp = layoutPlayer(ctx, player);
            depth = temp[0];
            coords = temp[1];
            pos_buffer.push(coords)
            player_depths.push(depth);
        }
    }

    var depth_sort = depthSort(player_depths);

    for( index = 0; index < depth_sort.length; index++) {
        idx = depth_sort[index];
        if(idx >=0) {
            if(players[idx].value != '') {
                player = JSON.parse(players[idx].value);
                if(player['name'] != name) {
                    drawPlayer(ctx, pos_buffer[idx], player);
                }
            }
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
    //window.requestAnimationFrame(step)
}
window.requestAnimationFrame(step)
