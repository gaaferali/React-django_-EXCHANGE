from rest_framework.views import exception_handler


def api_exception_handler(exc, context):
    response = exception_handler(exc, context)
    if response is not None:
        response.data = {
            "detail": response.data.get("detail", "Request validation failed")
            if isinstance(response.data, dict)
            else "Request validation failed",
            "errors": response.data,
        }
    return response
