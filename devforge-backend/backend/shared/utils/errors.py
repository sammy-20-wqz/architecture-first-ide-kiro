class AppError(Exception):
    """Base application error."""
    def __init__(self, message: str, code: int = 500):
        self.message = message
        self.code = code
        super().__init__(self.message)

class ValidationError(AppError):
    def __init__(self, message: str):
        super().__init__(message, 400)

class NotFoundError(AppError):
    def __init__(self, message: str):
        super().__init__(message, 404)

class AnalysisError(AppError):
    def __init__(self, message: str):
        super().__init__(message, 500)
