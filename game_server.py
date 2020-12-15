#!/usr/bin/env python
"""
Views
"""
import os
import re
import sys
import json
import urllib
import cgi
import hashlib
from base64 import b64encode, b64decode
import random

from flask import Flask
from flask import make_response
from flask import render_template
from flask import request
from flask import escape
from flask import redirect
from flask import jsonify

import requests
import server.player as player
import server.names as names

ABORT = False

APP = Flask(__name__)

@APP.route('/name_suggest', methods=['GET', 'POST'])
def name_suggest():
    """
    main entrypoint
    """
    base = "http://{}/".format(request.environ['HTTP_HOST'])
    name = random.choice(names.names) 
    return jsonify(name)    

@APP.route('/', methods=['GET', 'POST'])
def index():
    """
    main entrypoint
    """
    base = "http://{}/".format(request.environ['HTTP_HOST'])

    name = request.form.get('player_name')

    #print("PLAYER_NAME", name)
    return render_template('purejs.html.tpl', player_name=name) 
    #return render_template('webgl.html.tpl', player_name=name) 

@APP.route('/sync_state', methods=['GET', 'POST'])
def sync_state():
    name = request.form.get('player_name')
    p_o= float(request.form.get('player_orientation'))
    p_posx = float(request.form.get('player_posx'))
    p_posz = float(request.form.get('player_posz'))
   
    p = player.find(name)
    p.orientation = p_o
    p.position = [p_posx, p_posz]

    #print(str(p))

    p.save()
    
    r = player.redis_instance()
    items = []
    for key in r.scan_iter("*"):
        p = player.Player("")
        p.from_json(r.get(key))
        items.append(p.as_dict())

    return jsonify(items)    

if __name__ == '__main__':
    APP.run(debug=True)
