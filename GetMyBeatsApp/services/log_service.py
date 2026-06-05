import logging

from GetMyBeatsApp.models import LogEntry



class LogService:
    @staticmethod
    def log(log_level: LogEntry.LogLevel, message: str, module: str):
        try:
            LogService._log(log_level, message, module)
            message = f'LOG LEVEL {log_level.name}: {message}'
            LogEntry.objects.create(level=log_level.value, message=message, api_module=module)
        except Exception as e:
            print(e)  # if logging call fails, we at least print to console

    @staticmethod
    def _log(log_level: LogEntry.LogLevel, message: str, module: str):
        logger = logging.getLogger(module)

        log_map = {
            LogEntry.LogLevel.CRITICAL: logger.critical,
            LogEntry.LogLevel.ERROR: logger.error,
            LogEntry.LogLevel.WARNING: logger.warning,
            LogEntry.LogLevel.INFO: logger.info,
            LogEntry.LogLevel.DEBUG: logger.debug,
        }

        func = log_map[log_level]
        func(message)
