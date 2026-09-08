using System.ComponentModel.DataAnnotations;

namespace FlowOps.Api.Models.DTOs;

public record LoginRequest(
    [Required, EmailAddress] string Email,
    [Required, MinLength(6)] string Password
);

public record RegisterRequest(
    [Required, EmailAddress] string Email,
    [Required, MinLength(6)] string Password,
    [Required, MaxLength(100)] string FullName,
    [Required, RegularExpression("^(Admin|Staff)$")] string Role
);

public record AuthResponse(
    string Token,
    string RefreshToken,
    DateTime ExpiresAt,
    UserInfo User
);

public record RefreshRequest(
    [Required] string RefreshToken
);

public record UserInfo(
    Guid Id,
    string Email,
    string FullName,
    string Role
);
