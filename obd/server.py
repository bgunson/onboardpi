import obdio
from src import Configuration, API

def main():
    config = Configuration()
    obd_io = obdio.OBDio()
    config.set_obd_connection(obd_io)
    sio = obd_io.create_server(cors_allowed_origins='*', json=obdio)

    api = API(sio)
    api.mount()
    
    config.init_obd_connection()

    obd_io.serve_static(api.static_files())
    obd_io.run_server(host='0.0.0.0', port=60000, log_level='critical')

if __name__ == '__main__':
    main()