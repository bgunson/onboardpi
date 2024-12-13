export SETTINGS_DIR=obd/tests/test_configs
python obd/main.py & 
unset SETTINGS_DIR
npm run test-obd --prefix web
