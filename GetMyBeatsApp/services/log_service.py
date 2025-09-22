from GetMyBeatsApp.models import LogEntry


class LogService:
    @staticmethod
    def log(
        log_level: LogEntry.LogLevel,
        message: str,
        module: str
    ):
        try:
            message = f'LOG LEVEL {log_level.name}: {message}'
            LogEntry.objects.create(level=log_level.value, message=message, api_module=module)
        except Exception as e:
            print(e)  # if logging call fails, we at least print to console
