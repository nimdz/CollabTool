using TaskService.Models;
using TaskService.Dtos;

namespace TaskService.Services
{
    public interface IProjectService
    {
        System.Threading.Tasks.Task<IEnumerable<Project>> GetProjectsByUserAsync(string userId);
        System.Threading.Tasks.Task<Project?> GetProjectByIdAsync(string projectId);
        System.Threading.Tasks.Task<Project> CreateProjectAsync(CreateProjectRequest request);
        System.Threading.Tasks.Task<Project?> UpdateProjectAsync(string projectId, Project project);
        System.Threading.Tasks.Task<Project?> AddMemberToProjectAsync(string projectId, string userId);
        System.Threading.Tasks.Task<Project?> RemoveMemberFromProjectAsync(string projectId, string userId);
        System.Threading.Tasks.Task<bool> DeleteProjectAsync(string projectId);
        System.Threading.Tasks.Task<IEnumerable<Project>> GetAllProjectsAsync();
        System.Threading.Tasks.Task<MeetingJoinInfo?> StartMeetingAsync(string projectId, string userId, string userName);
        System.Threading.Tasks.Task<MeetingJoinInfo?> JoinMeetingAsync(string projectId, string userId, string userName);
        System.Threading.Tasks.Task<bool> EndMeetingAsync(string projectId, string userId);
    }
}
