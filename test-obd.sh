export SETTINGS_DIR=./obd/tests/test_configs
python obd/server.py & 
cd web
npm run test-obd