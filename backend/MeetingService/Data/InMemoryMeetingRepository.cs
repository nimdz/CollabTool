
using MeetingService.Models;
using System.Collections.Concurrent;

namespace MeetingService.Data
{
    public class InMemoryMeetingRepository : IMeetingRepository
    {
        private readonly ConcurrentDictionary<string, ActiveMeeting> _activeMeetings = new();

        public Task<ActiveMeeting?> GetMeetingAsync(string applicationMeetingId)
        {
            _activeMeetings.TryGetValue(applicationMeetingId, out var meeting);
            return Task.FromResult(meeting);
        }

        public Task AddMeetingAsync(ActiveMeeting meeting)
        {
            _activeMeetings[meeting.ApplicationMeetingId] = meeting;
            return Task.CompletedTask;
        }

        public Task RemoveMeetingAsync(string applicationMeetingId)
        {
            _activeMeetings.TryRemove(applicationMeetingId, out _);
            return Task.CompletedTask;
        }
    }
}