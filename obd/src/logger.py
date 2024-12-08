import logging

def register_logger(name, level=None, file_logger=False):
        logger = logging.getLogger(name)
        
        if level is not None:
              logger.setLevel(level)

        # remove existing handlers from external modules to use our own
        for handler in logger.handlers:
            logger.removeHandler(handler)

        if file_logger:
            file_handler = logging.FileHandler("{}.log".format(name), mode='w')
            file_handler.setFormatter(logging.Formatter("%(asctime)s %(message)s"))
            logger.addHandler(file_handler)

        console_handler = logging.StreamHandler()
        console_handler.setFormatter(logging.Formatter("[%(name)s] %(message)s"))
        logger.addHandler(console_handler)
        
        return logger


# TODO: convert to class with logger cache and event handler for setting log level 
# def __register_events(self, sio):

#         @sio.event
#         async def set_logger_level(sid, logger_name, level):
#             self.set_logger_level(logger_name, level)
#             pass