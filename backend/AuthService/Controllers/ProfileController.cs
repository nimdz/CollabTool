using AuthService.DTOs;
using AuthService.Services;
using AuthService.Exceptions;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Collections.Generic;

namespace AuthService.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize]
    public class ProfileController : ControllerBase
    {
        private readonly IProfileService _profileService;

        public ProfileController(IProfileService profileService)
        {
            _profileService = profileService;
        }

        //Get current logged in user's profile
        [HttpGet]
        public IActionResult GetProfile()
        {
            var username = User.Identity?.Name;
            if (username == null) throw new UnauthorizedException("Invalid token.");

            var user = _profileService.GetProfile(username);
            if (user == null) throw new NotFoundException("User not found.");

            return Ok(user);
        }

        //Update the logged in user's profile
        [HttpPut("update")]
        public IActionResult UpdateProfile([FromBody] UpdateProfileRequestDto request)
        {
            if (!ModelState.IsValid) throw new BadRequestException("Invalid profile data.");
            var username = User.Identity?.Name;
            if (username == null) throw new UnauthorizedException("Invalid token.");

            var updatedUser = _profileService.UpdateProfile(username, request);
            if (updatedUser == null) throw new NotFoundException("User not found.");

            return Ok(new { message = "Profile updated successfully", user = updatedUser });
        }

        //Get all users
        [HttpGet("all")]
        public IActionResult GetAllUsers()
        {
            var users = _profileService.GetAllUsers();
            return Ok(users);
        }

       // Get multiple users by their IDs
       [HttpPost("by-ids")]
        public IActionResult GetUsersByIds([FromBody] List<string> userIds)
        {
            if (userIds == null || !userIds.Any()) throw new BadRequestException("User IDs are required.");
            var users = _profileService.GetUsersByIds(userIds);
            return Ok(users);
        }
    }
}
