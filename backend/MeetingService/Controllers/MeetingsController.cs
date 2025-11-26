using MeetingService.Dtos;
using MeetingService.Services;
using MeetingService.Exceptions;
using Microsoft.AspNetCore.Mvc;

namespace MeetingService.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class MeetingsController : ControllerBase
    {
        private readonly IChimeMeetingService _chimeService;
        private readonly ILogger<MeetingsController> _logger;

        public MeetingsController(IChimeMeetingService chimeService, ILogger<MeetingsController> logger)
        {
            _chimeService = chimeService;
            _logger = logger;
        }

        [HttpPost("join")]
        public async Task<IActionResult> Join([FromBody] CreateMeetingRequest request)
        {
            if (!ModelState.IsValid) throw new BadRequestException("Invalid meeting request data.");
            if (string.IsNullOrEmpty(request.MeetingName)) throw new BadRequestException("Meeting name is required.");
            if (string.IsNullOrEmpty(request.AttendeeName)) throw new BadRequestException("Attendee name is required.");

            var joinInfo = await _chimeService.CreateOrJoinMeetingAsync(request);
            if (joinInfo == null) throw new NotFoundException("Meeting not found.");
            return Ok(joinInfo);
        }

        [HttpDelete("{meetingName}")]
        public async Task<IActionResult> End(string meetingName)
        {
            if (string.IsNullOrEmpty(meetingName)) throw new BadRequestException("Meeting name is required.");
            await _chimeService.EndMeetingAsync(meetingName);
            return NoContent();
        }
    }
}