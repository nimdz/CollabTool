
using MeetingService.Models;

namespace MeetingService.Data
{
    public interface IMeetingRepository
    {
        Task<ActiveMeeting?> GetMeetingAsync(string applicationMeetingId);
        Task AddMeetingAsync(ActiveMeeting meeting);
        Task RemoveMeetingAsync(string applicationMeetingId);
    }
}