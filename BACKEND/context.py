from contextvars import ContextVar

userRol = ContextVar("userRol", default=None)