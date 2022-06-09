import os

os.environ['SETTINGS_DIR'] = os.getcwd() + "/tests/test_configs"
os.environ['OAP_PID_CONFIG_PATH'] = os.getcwd() + "/tests/test_configs/openauto_obd_pids.ini"