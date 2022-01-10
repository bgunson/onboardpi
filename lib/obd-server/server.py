import obd
import obdio
import sys
import asyncio
import time

LOG_LEVEL = sys.argv[1]
UPDATE_RATE = 0.5
PARAMS = {}

watching = {}
last = 0

obd.logger.setLevel(LOG_LEVEL)

if len(sys.argv) == 3:
    PARAMS = obdio.loads(sys.argv[2])

io = obdio.OBDio(**PARAMS)

sio = io.create_server(cors_allowed_origins='*', json=obdio)


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

io.run_server(host='0.0.0.0', port=60000, log_level=LOG_LEVEL.lower())