#
#  Copyright (C) BlueWave Studio - All Rights Reserved
#
from dataclasses import dataclass, field

class Message:

    def __init__(self, id, flags, payload):
        self.id = id
        self.flags = flags
        self.payload = payload

@dataclass(order=True)
class QueuedMessage:
    priority: int
    item: Message=field(compare=False)
