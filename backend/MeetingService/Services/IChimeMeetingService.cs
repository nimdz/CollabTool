
using MeetingService.Dtos;

namespace MeetingService.Services
{
    public interface IChimeMeetingService
    {
        Task<MeetingResponseDto> CreateOrJoinMeetingAsync(MeetingService.Dtos.CreateMeetingRequest request);
        Task EndMeetingAsync(string meetingName);
    }
}