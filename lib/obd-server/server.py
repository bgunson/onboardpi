import obd
import obdio
import sys
import asyncio
import time

if len(sys.argv) == 2:
    params = obdio.loads(sys.argv[1])
else: 
    params = {}

io = obdio.OBDio(**params)

sio = io.create_server(cors_allowed_origins='*', json=obdio)

watching = {}
last = 0
update_rate = 0.25

async def watch_respond(values):
    global last
    if time.time() - last >= update_rate:
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

io.run_server(host='0.0.0.0', port=60000)