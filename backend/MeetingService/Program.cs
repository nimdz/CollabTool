using Amazon.ChimeSDKMeetings;
using Amazon.Extensions.NETCore.Setup;
using MeetingService.Data;
using MeetingService.Services;
using MeetingService.Middleware;

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddControllers();

AWSOptions awsOptions = builder.Configuration.GetAWSOptions();
builder.Services.AddDefaultAWSOptions(awsOptions);
builder.Services.AddAWSService<IAmazonChimeSDKMeetings>();

builder.Services.AddSingleton<IMeetingRepository, InMemoryMeetingRepository>();
builder.Services.AddScoped<IChimeMeetingService, ChimeMeetingService>();

builder.Services.AddCors(options =>
{
    options.AddDefaultPolicy(
        policy =>
        {
            policy.WithOrigins("http://localhost:3000")
                  .AllowAnyHeader()
                  .AllowAnyMethod();
        });
});

builder.Services.AddEndpointsApiExplorer();

var app = builder.Build();

app.UseHttpsRedirection();

app.UseCors();

app.UseMiddleware<ExceptionMiddleware>();

app.UseAuthorization();

app.MapControllers();

app.Run();