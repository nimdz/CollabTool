using TaskService.Models;

namespace TaskService.Services
{
    public interface ITaskService
    {
        System.Threading.Tasks.Task<Models.Task> GetTaskAsync(string taskId);
        System.Threading.Tasks.Task<IEnumerable<Models.Task>> GetTasksByProjectAsync(string projectId);
        System.Threading.Tasks.Task<IEnumerable<Models.Task>> GetTasksByUserAsync(string userId);
        System.Threading.Tasks.Task<Models.Task> CreateTaskAsync(Models.Task task);
        System.Threading.Tasks.Task<Models.Task> UpdateTaskAsync(Models.Task task);
        System.Threading.Tasks.Task DeleteTaskAsync(string taskId);
    }
}