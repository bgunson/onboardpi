from abc import ABC, abstractmethod

from obd import OBDCommand

class InjectorBase(ABC):
    """
    Injector template class. To provide a basis and structure for OnBoardPi's ability to export 
    OBD values to external services.

    Going forward this pattern can be used for numerous types of data exportation. Once an injector knows which
    OBD commands it needs, the watch/unwatch mechanism (alongside socketio clients) will already be implemented. 
    - Local datalogging of OBD values to timescaledb can be made from an injector
    - Use an injector as an MQTT client
    - Can even add support for more protocols down the road  
    """

    @abstractmethod
    async def start(self):
        """ Enable the data injection """
        pass
    
    @abstractmethod
    async def stop(self):
        """ Disable an already running injector """
        pass

    @abstractmethod
    def is_enabled(self) -> bool:
        pass

    @abstractmethod
    def is_active(self) -> bool:
        pass

    @abstractmethod
    def get_commands(self) -> list[OBDCommand]:
        """ Return a list of OBDCommands by name which are to be exported """
        pass
    
    @abstractmethod
    def inject(self, obd_response):
        """ Export an OBDCommand reponse. The wath loop in watch.py will call this for any enabled and configured injector. """
        pass

    @property
    @abstractmethod
    def id(self) -> str:
        pass
