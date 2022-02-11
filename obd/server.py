import obd
import obdio
import asyncio
import time
from helpers import *

UPDATE_RATE = 0.25

watching = {}
last = 0

obd.logger.setLevel(get_log_level())
io = obdio.OBDio(**get_params())
sio = io.create_server(cors_allowed_origins='*', json=obdio, logger=False, engineio_logger=False)

async def watch_respond(values):
    global last
    if time.time() - last >= UPDATE_RATE:
        await sio.emit('watching', values, room='watch')
        last = time.time()


def cache(response):
    global watching
    watching[response.command.name] = response
    asyncio.run(watch_respond(watching))

    
io.watch_callback = cache

@sio.event
async def join_watch(sid):
    sio.enter_room(sid, 'watch')


@sio.event
async def leave_watch(sid):
    sio.leave_room(sid, 'watch')

@sio.event
async def unwatch(sid, commands):
    global watching
    io.stop()
    for cmd in commands:
        io.unwatch(obd.commands[cmd])
        try:
            watching.pop(cmd)
        except KeyError:
            pass
    await sio.emit('unwatch', commands, room='watch', skip_sid=sid)
    io.start()
        
@sio.event
async def all_commands(sid):
    await sio.emit('all_commands', obd.commands, room=sid)

@sio.event
async def get_command(sid, cmd):
    await sio.emit('get_command', obd.commands[cmd], room=sid)


@sio.event 
async def connect_obd(sid):
    global io
    obd.logger.setLevel(get_log_level())
    io = obdio.OBDio(**get_params())

@sio.event 
async def disconnect_obd(sid):
    io.close()
    await sio.emit('disconnect_obd')

io.serve_static({
    '/view/obd-log': {'filename': 'obd.log', 'content_type': 'text/plain'},
    '/download/obd-log': 'obd.log'
})

io.run_server(host='0.0.0.0', port=60000, log_level='critical')