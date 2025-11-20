using System;
using System.Collections.Generic;

namespace AuthService.Models
{
    // Global roles 
    public enum GlobalRole
    {
        User,
        Admin
    }

    // Database entity representing a user account
    public class User
    {
        public int Id { get; set; }

        // Basic account info
        public string Username { get; set; } = string.Empty;
        public string FullName { get; set; } = string.Empty;
        public string Email { get; set; } = string.Empty;
        public string PasswordHash { get; set; } = string.Empty;

        // Global role (Admin or User)
        public GlobalRole Role { get; set; } = GlobalRole.User;

        // Extended profile info for collaboration tool
        public string? Bio { get; set; }
        public string? Department { get; set; }
        public DateTime JoinedAt { get; set; } = DateTime.UtcNow;
        public DateTime? LastLogin { get; set; }
        public bool IsActive { get; set; } = true;
        public string? NotificationPreferences { get; set; } // JSON string
        public string? TimeZone { get; set; }

        // Navigation property: a user can have multiple refresh tokens (multi-device)
        public List<RefreshToken> RefreshTokens { get; set; } = new();
    }

    // Refresh token entity for JWT refresh flow
    public class RefreshToken
    {
        public int Id { get; set; }
        public string Token { get; set; } = string.Empty;
        public DateTime ExpiresAt { get; set; }
        public bool IsRevoked { get; set; } = false;

        // Foreign key to User
        public int UserId { get; set; }
        public User User { get; set; } = null!;
    }
}
