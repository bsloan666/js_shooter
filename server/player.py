"""
    A redis-based back end to store game state
"""

import redis
import random
import json

class Player():
    def __init__(self, name):
        twopi = 3.14159 * 2
        self.name = name
        self.position = [(random.random()-0.5) * 10, (random.random()-0.5) * 10] 
        self.linear_velocity = [0.0, 0.0] 
        self.angular_velocity = 0.0 
        # some direction around the Y axis
        self.orientation = random.random() * twopi
        self.health = 100 
        self.score = 0 
  
    def as_dict(self):
        return self.__dict__

    def __repr__(self):
        return json.dumps({
            'name': self.name,
            'position': self.position,
            'linear_velocity': self.linear_velocity,
            'angular_velocity': self.angular_velocity,
            'orientation': self.orientation,
            'health': self.health,
            'score': self.score
        })

    def from_json(self, instr):
        indict = json.loads(instr)
        self.name = indict['name']
        self.position = indict['position']
        self.linear_velocity = indict['linear_velocity']
        self.angular_velocity = indict['angular_velocity']
        self.orientation = indict['orientation']
        self.health = indict['health']
        self.score = indict['score']

    def save(self):
        r = redis.Redis()
        r.set(self.name, str(self))
        
def find(name):
    r = redis.Redis()
    result = r.get(name)
    if not result:
        return Player(name)
    p = Player(name)
    p.from_json(result)
    return p 

def redis_instance():
    r = redis.Redis()
    return r 

if  __name__ == "__main__":
    red = redis.Redis()


    for key in red.scan_iter("*"):
        print(key)

    red.flushdb()


        



