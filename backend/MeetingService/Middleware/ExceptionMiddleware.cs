using System.Net;
using System.Text.Json;
using MeetingService.Exceptions;

namespace MeetingService.Middleware
{
    public class ExceptionMiddleware
    {
        private readonly RequestDelegate _next;
        private readonly ILogger<ExceptionMiddleware> _logger;

        public ExceptionMiddleware(RequestDelegate next, ILogger<ExceptionMiddleware> logger)
        {
            _next = next;
            _logger = logger;
        }

        public async Task InvokeAsync(HttpContext context)
        {
            try
            {
                await _next(context);
            }
            catch (Exception ex)
            {
                await HandleExceptionAsync(context, ex);
            }
        }

        private async Task HandleExceptionAsync(HttpContext context, Exception exception)
        {
            _logger.LogError(exception, "An error occurred: {Message}", exception.Message);

            context.Response.ContentType = "application/json";

            var (statusCode, message) = exception switch
            {
                NotFoundException => (HttpStatusCode.NotFound, exception.Message),
                BadRequestException => (HttpStatusCode.BadRequest, exception.Message),
                _ => (HttpStatusCode.InternalServerError, "An internal server error occurred.")
            };

            context.Response.StatusCode = (int)statusCode;

            var response = new { error = message, statusCode = (int)statusCode };
            await context.Response.WriteAsync(JsonSerializer.Serialize(response));
        }
    }
}
