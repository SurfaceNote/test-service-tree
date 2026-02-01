using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using TestService.Domain.Entities;
using TestService.Domain.Enums;

namespace TestService.Infrastructure.Persistence.Configurations;

/// <summary>
/// Конфигурация сущности User для EF Core
/// </summary>
public class UserConfiguration : IEntityTypeConfiguration<User>
{
    public void Configure(EntityTypeBuilder<User> builder)
    {
        builder.HasKey(u => u.Id);

        builder.Property(u => u.Username)
            .IsRequired()
            .HasMaxLength(100);

        builder.Property(u => u.PasswordHash)
            .IsRequired();

        builder.Property(u => u.Role)
            .IsRequired();

        builder.Property(u => u.CreatedAt)
            .IsRequired();

        // Уникальный индекс на Username
        builder.HasIndex(u => u.Username)
            .IsUnique();

        builder.ToTable("Users");
    }
}


