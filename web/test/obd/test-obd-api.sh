export SETTINGS_DIR=obd/tests/test_configs
python obd/server.py & 
unset SETTINGS_DIR
npm run test-obd --prefix web
