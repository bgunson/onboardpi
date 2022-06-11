from obpi import Configuration
import obd
import logging

class TestConfiguration:

    def test_is_singleton(self):
        config1 = Configuration()
        config2 = Configuration()
        assert config1 is config2

    def test_connection_params(self):
        config = Configuration()
        params = config.connection_params()
        assert params['portstr'] == "/dev/pts/9"
        assert params['baudrate'] == 115200
        assert params['delay_cmds'] == 0.1

    def test_log_level(self):
        config = Configuration()
        _ = config.connection_params()
        print(obd.logger.getEffectiveLevel())
        assert obd.logger.getEffectiveLevel() == logging.INFO