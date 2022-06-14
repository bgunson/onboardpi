from src.injectors import *

class Injector:
    """
    Injector template class. To provide a basis and structure for OnBoardPi's ability to export 
    OBD values to external services.
    """

    def start(self):
        """ Start the data injection """
        pass
    
    def stop(self):
        """ Stop the data injection """
        pass

    def status(self):
        """ Give the current status of the injector. Such as: connected, disabled, errors, etc """
        pass

    def get_commands(self):
        """ Return a list of OBDCommands by name which are to be exported """
        pass
    
    def inject(self, obd_response):
        """ Export an OBDCommand reponse. The wath loop in watch.py will call this for any enabled and configured injector. """
        pass
