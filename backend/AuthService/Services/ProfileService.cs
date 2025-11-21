using AuthService.Data;
using AuthService.DTOs;
using MapsterMapper;
using System.Collections.Generic;
using System.Linq;

namespace AuthService.Services
{
    public class ProfileService : IProfileService
    {
        private readonly AuthDbContext _context;
        private readonly IMapper _mapper;

        public ProfileService(AuthDbContext context, IMapper mapper)
        {
            _context = context;
            _mapper = mapper;
        }

        //Get a single user profile by username
        public UserResponseDto? GetProfile(string username)
        {
            var user = _context.Users.FirstOrDefault(u => u.Username == username);
            if (user == null) return null;

            return _mapper.Map<UserResponseDto>(user);
        }

        // Update logged in user's profile details
        public UserResponseDto? UpdateProfile(string username, UpdateProfileRequestDto request)
        {
            var user = _context.Users.FirstOrDefault(u => u.Username == username);
            if (user == null) return null;

            if (!string.IsNullOrEmpty(request.FullName)) user.FullName = request.FullName;
            if (!string.IsNullOrEmpty(request.Bio)) user.Bio = request.Bio;
            if (!string.IsNullOrEmpty(request.Department)) user.Department = request.Department;

            _context.SaveChanges();
            return _mapper.Map<UserResponseDto>(user);
        }
        //Get list of all users
        public List<UserResponseDto> GetAllUsers()
        {
            var users = _context.Users.ToList();

            return users.Select(u => new UserResponseDto
            {
                UserId = u.Id.ToString(),
                Username = u.Username,
                FullName = u.FullName,
                Email = u.Email,
                Bio = u.Bio,
                Department = u.Department,
                JoinedAt = u.JoinedAt,
                Role = u.Role.ToString()
            }).ToList();
        }

        //Get multiple users by their ID list
        public List<UserResponseDto> GetUsersByIds(List<string> userIds)
        {
            var ids = userIds.Select(id => int.TryParse(id, out var intId) ? intId : 0)
                             .Where(id => id > 0)
                             .ToList();
            var users = _context.Users.Where(u => ids.Contains(u.Id)).ToList();

            return users.Select(u => new UserResponseDto
            {
                UserId = u.Id.ToString(),
                Username = u.Username,
                FullName = u.FullName,
                Email = u.Email,
                Bio = u.Bio,
                Department = u.Department,
                JoinedAt = u.JoinedAt,
                Role = u.Role.ToString()
            }).ToList();
        }
    }
}
